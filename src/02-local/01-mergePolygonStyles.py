# Copyright 2021 Eric Lawrey - Australian Institute of Marine Science
#
# MIT License https://mit-license.org/
# This script converts the Shapefiles generated by the Google Earth Engine (GEE) into 
# merged shapefiles for each region.
# Files downloaded from GEE should be saved in unprocessed-data.
# The final files generated from this script are saved in the TMP folder. The final
# processing of the files needs to be completed in QGIS using the 
# 02-QGIS-model-smooth-polygons.model3. This last step smooths and simplifies the
# vector files. See README.md for more detail on completing this last step.
# 
# Script environment - Windows
# To run this Python script you will need GDAL installed and available in the same
# environment as this script.
# 
# One possible setup is installing OSGeo4W, enabling GDAL install then 
# running this script from OSGeo4W command window from C:\OSGeo4W\OSGeo4W.bat

import os
import subprocess
import glob

# Path to the ogr2ogr scripts. 
OGR2OGR_PYTHON_PATH =  "c:\\OSGeo4W\\apps\\Python39\\Scripts\\"

IN_FORMAT = 'geojson'		# Input polygon file type: shp or geojson

# Here we assume that the directory structure is that the SRC_PATH points to
# the shapefiles downloaded from GEE organised into folders corresponding to
# regions.

SRC_PATH = '../../unprocessed-data'

OUT_RAW = '../../repo-only/raw-poly'	# Copy of the raw data but organised by folders for each style
										# This can be used as a source for reprocessing

TMP = '../../tmp'						# Folder for holding intermediate files
BROKEN_PATH = '../../tmp/broken'				# Move broken GeoJSON files to this folder

# This script only saves to the TMP folder as it no longer completes the full processing.
# The final processing is now completed in QGIS.
OUT_POLY = '../../big-files/poly'		# Published polygons files

if not os.path.exists(OUT_RAW):
	os.mkdir(OUT_RAW)
	print("Making output directory"+OUT_RAW)
	

	
if not os.path.exists(TMP):
	os.mkdir(TMP)
	print("Making output directory"+TMP)
	
# List of all the styles to potentially process. Images will be sorted
# into directories matching these style names.
styles = [
	'S2_R1_ReefTop', 'S2_R2_ReefTop','L8_R1_ReefTop', 'L8_R2_ReefTop',
	'S2_R1_Depth10m', 'S2_R2_Depth10m','L8_R1_Depth10m', 'L8_R2_Depth10m',
	'S2_R1_Depth5m', 'S2_R2_Depth5m','L8_R1_Depth5m', 'L8_R2_Depth5m',
	'S2_R1_DryReef', 'S2_R2_DryReef','L8_R1_DryReef', 'L8_R2_DryReef',
	'S2_R1_Breaking', 'S2_R2_Breaking','L8_R1_Breaking', 'L8_R2_Breaking',
	'S2_R1_Land', 'S2_R2_Land','L8_R1_Land', 'L8_R2_Land',
	]


# Iterate through the regions in the SRC_PATH
# Use slash on the end to only pick up directories.
srcRegionDirs = glob.glob(os.path.join(SRC_PATH,"*/"))
regionCount = 1
numRegions = len(srcRegionDirs)

if (numRegions == 0):
	print("Found no images in "+SRC_PATH+". Expected geojson files in a folder for the region, such as 'Coral-Sea', 'Coral-Sea-water', or 'Global'")

for srcRegionDir in srcRegionDirs:
	# Get the name of the region so that we can include it in the output paths
	# The path being processed is something like: 
	# ../../unprocessed-data\CoralSea\
	# dirname strips off the last slash and basename extracts 'Coral-Sea'
	region = os.path.basename(os.path.dirname(srcRegionDir))
	print('=== Processing region '+region+' ('+str(regionCount)+' of '+str(numRegions)+') ===')
	regionCount = regionCount+1
	
	# Search through all the files to be processed, downloaded from Google Earth Engine
	# 
	# Get the files in the subsubdirectories such as Global/S2_R1_DeepFalse/*.shp and 
	# just in subdirectories Global/*.shp
	#srcFiles = glob.glob(os.path.join(srcRegionDir,"**/*.shp")) + glob.glob(os.path.join(srcRegionDir,"*.shp"))
	srcFiles = glob.glob(os.path.join(srcRegionDir,"*."+IN_FORMAT))
	
	# Make sure we are dealing with a directory containing data. If not
	# then there is a directory in the SRC_PATH not corresponding to the
	# expected structure.
	if not (os.path.isdir(srcRegionDir) and (len(srcFiles) > 0)):
		print('Skipping region '+srcRegionDir)
		continue
	
	for style in styles:
		# Find all the shapefiles for a given style in the region. We want to merge
		# all of them together into a single shapefile.
		# glob.glob(os.path.join(srcRegionDir,"**/*"+style+"*.shp")) +
		srcFiles = glob.glob(os.path.join(srcRegionDir,"*"+style+"*."+IN_FORMAT))
		
		print(style+": "+str(len(srcFiles))+" files")
		
		if (len(srcFiles) == 0):
			print('Skipping style '+style+' in '+region+' as 0 files')
			continue
		
		# Create an temporary directory for the region
		tmpPath = os.path.join(TMP, region)
		if not os.path.exists(tmpPath):
			os.makedirs(tmpPath)
		
		# Google Earth Engine generates broken GeoJSON files when attempting to export
		# empty vectors. We need to remove these from the processing to allow ogr2ogr
		# to work correctly.
		# The broken files simply contain 2 characters ']}'. We can therefore detect them
		# by looking at the file size.
		for file in srcFiles:
			fileSize = os.path.getsize(file)
			if (fileSize <= 2):
				# move the file to a corrupted folder so they are not used in subsequent 
				# processing
				# Create an directory for the broken files, one per region
				brokenPath = os.path.join(BROKEN_PATH, region)
				if not os.path.exists(brokenPath):
					os.makedirs(brokenPath)
				# Move the broken file
				os.rename(file, os.path.join(brokenPath, os.path.basename(file)))
				print("Broken empty GeoJSON found. Moving to "+brokenPath)
				
		# Create a name for the merged shapefile. It needs to replace the tile IDs for the region name.
		# Here we assume that all files being processed start with the same dataset name
		# CS_AIMS_Coral-Sea-Features_Img_S2_R1_Breaking_54LZP
		# Assume that we want to retain the name up to and including the style name.
		# i.e. CS_AIMS_Coral-Sea-Features_Img_S2_R1_Breaking
		firstFile = os.path.basename(srcFiles[0])
		layerName = firstFile[0:firstFile.find(style)+len(style)]+"_"+region
		
		# ------------------ MERGE ------------------------
		# Merge all the features from the multiple Sentinel tiles in a region into a single
		# shapefile.
		
		stageName01 = "01-merge_"+layerName
		
		shpPath01 = os.path.join(tmpPath, stageName01+".shp")
		print("Shapefile name: "+shpPath01)
		
		# -single indicate that we want to merge all polygons into a single layer.
		# The need for this flag was discovered after getting the error:
		# ERROR: Non-single layer mode incompatible with non-directory shapefile output
		if os.path.isfile(shpPath01): 
			print("Skipping "+shpPath01+" as merge output already exists")
		else:
			callStr = 'python '+OGR2OGR_PYTHON_PATH+'\\ogrmerge.py -o '+shpPath01+' -single '+os.path.join(srcRegionDir,"*"+style+"*."+IN_FORMAT)
			subprocess.call(callStr, shell=True)
		
		# ----------------- DISSOLVE -----------------------
		# Take the spatial union of all the overlapping features. This occurs as the image
		# tiles overlap
		
		stageName02 = "02-dissolve_"+layerName
		shpPath02 = os.path.join(tmpPath, stageName02+".shp")
		
		# https://stackoverflow.com/questions/47038407/dissolve-overlapping-polygons-with-gdal-ogr-while-keeping-non-connected-result
		if os.path.isfile(shpPath02): 
			print("Skipping "+shpPath02+" as dissolved output already exists")
		else:
			callStr = 'ogr2ogr -f "ESRI Shapefile" -explodecollections '+shpPath02+' '+shpPath01 + \
				' -dialect sqlite -sql "select ST_union(Geometry) from ""'+stageName01+'"""'
			subprocess.call(callStr, shell=True)

		
		# ----------------- SIMPLIFY -----------------------
		# This process was deprecated, with an improved smoothing and simplification being performed
		# in QGIS using the 02-QGIS-model-smooth-polygons.model3.
		# See the README.md for details.
		# The code is left here for if I change my mind about the processing.
		#
		# Turn the pixelated polygon (stair case edges due to the original pixel nature of the imagery)
		# into smoother curves. Here we assume that the polygonisation has occurred at sufficient resolution
		# that each feature is represented by enough pixels that the shape is reasonable smooth.
		# The level of simplification was chosen to remove the stair case pixel steps without loosing
		# more than a pixel of detail
		
		# Create an output directory for the region
		SIMPLY = False;		# Don't apply simplification, use QGIS processing instead.
		if (SIMPLY):
		
			outPath = os.path.join(OUT_POLY, region)
			if not os.path.exists(outPath):
				os.makedirs(outPath)
			
			stageName03 = layerName
			shpPath03 = os.path.join(outPath, stageName03+".shp")
			
			# https://stackoverflow.com/questions/47038407/dissolve-overlapping-polygons-with-gdal-ogr-while-keeping-non-connected-result
			if os.path.isfile(shpPath03): 
				print("Skipping "+shpPath03+" as simplified output already exists")
			else:
				callStr = 'ogr2ogr -f "ESRI Shapefile" -simplify 0.00007 '+shpPath03+' '+shpPath02
				subprocess.call(callStr, shell=True)

