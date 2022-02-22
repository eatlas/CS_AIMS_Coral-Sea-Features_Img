# What does this script do?
This script converts the GeoTiff images downloaded from the Google Earth Engine (GEE) into
a format that is more suitable for web delivery. The images produced by the GEE are in 
GeoTiff 8 bit per channel format with LZW compression, with the data scaled from 1 - 255 and
0 reserved for transparent borders of the image. Unfortunately GEE does not set the NODATA
value of the GeoTiff metadata and so unmodified the images have black borders. This script
sets the NODATA of the images to 0, applies internal tiling and adds internal pyrimid overview
images. 

The tiling organises the file layout so that groups of pixels (256x256) are located in
tiles together on disk. The default format for GeoTiff files saves the files in rows of pixels.
This makes extracting data in the middle of a large image difficult. Reading multiple rows of
pixels requires skipping through the file. This makes the file reading slower. This script
reorganises the files to use internal tiling of the data making its performance in GIS applications
faster.

This script also adds image overviews. These are successively lower resolution versions of the
data saved in the image. This means that if a user of the data needs to view a preview of the
image it doesn't need to read and subsample the whole image. It simply pulls the closest lower
resolution version of the image to generate the preview image. This makes the performance faster.

# Where to place downloaded images for processing
This script reads the images from `unprocessed-data` folder.
It treats subfolders as regions (such as `Coral-Sea` and `Global`). The filing of images into these
regional folders is retained in the final generated folder (`data`). 


# Setup

To run this Python script you will need GDAL installed. The easiest way on Windows is to 
install GDAL via OSGeo4W (https://www.osgeo.org/projects/osgeo4w/). This package allows
multiple GIS tools to be installed. For this script you will need GDAL and Python. Many of
the GDAL commands are written in Python and so we will run this script in the same Python
installation to ensure all the paths are setup. 
 
Run this script from an OSGeo4W command window to ensure all the paths are correct.
The default path for this is in C:\OSGeo4W64\OSGeo4W.bat but may also be C:\OSGeo4W\OSGeo4W.bat.
In that command line window `cd` to the location of this script then run:
```
python convert.py
```

# Potential issues
I installed OSGeo4W, ran python convert.py. It started up then gave the error 
`gdal_translate.exe - System Error`
`The code execution cannot proceed because gdal303.dll was not found. Reinstalling the program may fix this problem`.
This problem seemed to be a bad version of OSGeo4W. Reinstalling from the previous
version fixed this issue.
