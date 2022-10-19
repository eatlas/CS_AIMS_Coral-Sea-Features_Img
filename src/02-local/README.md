# What do the scripts do?
This script converts the GeoTiff images downloaded from the Google Earth Engine (GEE) into
a format that is more suitable for web delivery and fast manipulation and use in a desktop 
GIS. 
The images produced by the GEE are in GeoTiff 8 bit per channel format with LZW compression, 
with the data scaled from 1 - 255 and 0 reserved for transparent borders of the image. 
Unfortunately GEE does not support setting the NODATA value of the GeoTiff metadata and so 
unmodified the images have black borders. 

The `01-convert.py` script sets the NODATA of the images to 0, applies internal tiling and 
adds internal pyrimid overview images. It also organises the images into folders corresponding
to satellite type and image style combinations. 

The internal tiling organises the file layout so that groups of pixels (256x256) are located in
tiles together on disk. The default format for GeoTiff files saves the files in rows of pixels.
This makes extracting data in the middle of a large image difficult. Reading multiple rows of
pixels requires skipping through the file. This makes the file reading slower. This script
reorganises the files to use internal tiling of the data making its performance in GIS applications
faster.

This script also adds image overviews. These are successively lower resolution versions of the
data saved in the image. This means that if a user of the data needs to view a preview of the
image it doesn't need to read and subsample the whole image. It simply pulls the closest lower
resolution version of the image to generate the preview image. This makes the performance faster.

This script also creates virtual layer files that represent all the images of a given style into a
single GDAL layer that can be loaded in one go into QGIS and manipulated as though it were
a single moasic.

The `01-mergePolygonStyles.py` merges the 5m and 10m GeoJSON polygon files into one shapefile
per depth and region (Global, Coral-Sea). This needs to then by followed up with processing in
QGIS using the `02-QGIS-model-smooth-polygons.model3` model to smooth and simplify the vector
data. See section (#Processing the vector layers) for more detail.

# Where to place downloaded images for processing
These scripts read the images from `unprocessed-data` folder. They then process them into the
`big-files` folders, for images, and the `tmp` folder for the depth contours (for subsequent
manual processing in QGIS).

It treats subfolders as regions (such as `unprocessed-data\Coral-Sea` and `unprocessed-data\Global`). 
The filing of images into these regional folders is retained in the final generated folder (`big-files\lossless\Coral-Sea`). 


# Setup
To run these Python scripts you will need GDAL installed. The easiest way on Windows is to 
install GDAL via OSGeo4W (https://www.osgeo.org/projects/osgeo4w/). This package allows
multiple GIS tools to be installed. For this script you will need GDAL and Python. Many of
the GDAL commands are written in Python and so we will run this script in the same Python
installation to ensure all the paths are setup. 

You will also need QGIS for processing the Depth vector files.

# Processing the satellite imagery layers
 
Run this script from an OSGeo4W command window to ensure all the paths are correct.
The default path for this is in C:\OSGeo4W64\OSGeo4W.bat but may also be C:\OSGeo4W\OSGeo4W.bat.
In that command line window `cd` to the location of this script then run:
```
python 01-convert.py
```
This script skips processing files if the output files already exist. This speeds up reprocessing
with additional files. This does mean that if you need to modify an output with a changed input
then you need to first delete the outputs.

# Processing the vector layers
This script merges all the vector files in a given region for a given style. i.e. it merges
all the `Depth5m` geojson files (one per Sentinel 2 image) in the Coral Sea into a single 
shapefile. It does this for each of the vector based stylings and for each of the regions.
```
python 01-mergePolygonStyles.py
```
The output shapefile will still have jagged staircase boundaries corresponding to the original
satellite pixels. The output shapefiles need to be further processed in QGIS to smooth and
simplify these vector files.

This last step in the processing is not fully automated, however the processing is recorded in
the `02-QGIS-model-smooth-polygons.model3` file. To do this processing:
1. Open QGIS.
2. Use `Processing/Graphical Modeler..`
3. Select `Open Model` and choose the `02-QGIS-model-smooth-polygons.model3` file.
4. Use the play button to run the model. 
Input: `tmp\02-dissolve_CS_AIMS_Coral-Sea-Features_Img_S2_R1_Depth5m_Coral-Sea.shp` 
Output `big-files\poly\Coral-Sea\CS_AIMS_Coral-Sea-Features_Img_S2_R1_Depth5m_Coral-Sea.shp`
5. Repeat the process for Depth10m and for each of the regions.

This processing consists of:
1. Smoothing (0.5 offset, which is the maximum)
2. Buffer of approximately 3 m (0.00003 deg). This is to help connect floating edge pixels.
3. Dissolve to join any polygons that overlap from the buffer.
4. Simplify with a maximum error of approximately 1 m (0.00001 deg).


# Potential issues
I installed OSGeo4W, ran python convert.py. It started up then gave the error 
`gdal_translate.exe - System Error`
`The code execution cannot proceed because gdal303.dll was not found. Reinstalling the program may fix this problem`.
This problem seemed to be a bad version of OSGeo4W. Reinstalling from the previous
version fixed this issue.
