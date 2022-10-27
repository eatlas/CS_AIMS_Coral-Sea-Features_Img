# Coral Sea Features Imagery - data files
This folder contains all the large data files (any over 100k) that are not tracked in the 
[CS_AIMS_Coral-Sea-Features_Img](https://github.com/eatlas/CS_AIMS_Coral-Sea-Features_Img) dataset Git repository from the 
[Coral Sea Features Satellite imagery (Sentinel 2 and Landsat 8) 2015 – 2021 (AIMS) dataset](https://eatlas.org.au/data/uuid/df5a5b47-ad4c-431e-be49-af52f64aafce). 
This includes the generated satellite imagery, preview maps, etc. These are available for download here, either
as individual files, directories or the whole dataset.

## Folder descriptions
`lossless`: This contains the satellite imagery published in a lossless GeoTiff format where
individual Sentinel 2 tiles average 300 - 350 MB each. Each folder of images also includes a
Virtual Raster file (.vrt) that allows all the files in the folder to be treated as a single
large mosaic in QGIS. Use these files for when the detailed texture of the images is important
as there won't be any compression artefacts. The virtual rasters layers for these images also
load into QGIS with no visible black borders.

`lossy`: This contains the satellite imagery published in a lossy JPEG in GeoTiff format. Use this
format if you need to save on disk space or download size. This format is 9 times smaller in size 
than the lossless format. While significantly smaller they are minimally JPEG compressed,
and as a result the compression artefacts are only when zooming greater than 100%. The disadvantage
of these files is that not all software packages can handle the masking in the images. For example
QGIS can load individual images perfectly well, but the GDAL virtual raster mosaics have noisy black 
frames around the imaagery. This appears to be due to the mosaicing process ignoring the embedded
non-JPEG compressed mask and instead masking using a no-data value of 0, directly from the visible
bands. Since these are JPEG compressed the edges have compression artefacts. I tried every compbination
of Virtual Raster settings, but didn't find one that forced it to use the correct mask.
There are also issues with making an image mosaic from these images in GeoServer, as it too uses
the wrong masking by default. This can however be corrected (see below).

`preview`: This contains half resolution JPEG images of the satellite imagery. They allow quick
previewing of each of the images available in the `lossy` and `lossless` folders. These are not
georeferenced images and so can't be used in a GIS application. There are also preview maps
of the whole datasets.

`maps`: This folder contains QGIS map files used for generating preview maps for this dataset.

## Publication note
All the files in this directory are ignored in the Git repository. The contents of this folder
should be published as a public folder for download on NextCloud.

## Full working data structure
If you wish to extend this dataset and want to have a copy of both the code and the imagery
in the same as the original structure then  
`CS_AIMS_Coral-Sea-Features-Img`
- `big-files` - Put all the files from data repo in this folder. 
- `media`
- Rest of the files from the [CS_AIMS_Coral-Sea-Features_Img Git repo](https://github.com/eatlas/CS_AIMS_Coral-Sea-Features_Img)

