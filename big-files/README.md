# Big data files - not tracked in Git
This folder contains all the large data files (any over 100k) that are not tracked in the 
[CS_AIMS_Coral-Sea-Features_Img](https://github.com/eatlas/CS_AIMS_Coral-Sea-Features_Img) dataset Git repository. This includes the generated
satellite imagery, preview maps, presentations, etc. These are available for download here.

To get a full working copy of the dataset, clone the Git repository and download all the files
in this folder and save it as `CS_AIMS_Coral-Sea-Features_Img\big-files` in the repository.
This way you will be able to rerun the image generation scripts.

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

`maps`: This folder contains QGIS map files used for generating preview maps for this dataset.

### Creating image mosaic in GeoServer
The ImageMosaic format in GeoServer can be used to produce a single map layer from lots of images.
This process should work well with the lossless version of the imagery, however there are some
additional challenges using the lossy version of the data.
GeoServer doesn't properly use the internal mask layer when creating the image mosaic resulting
in grubby black borders between image tiles. The ImageMosaic format when provided with a directory
of images will generate an index (as a shapefile) that allows the GeoServer to quickly determine the bounds
of each raster in the mosaic. To fix the black border problem we need to indicate to the GeoServer that
it should use the raster mask to determine the footprint of each image. To do this create a
`footprints.properties` file in the same directory as the imagery, which will also contain the 
image mosaic index shapefile. Set the contents of the `footprints.properties` file to: 
```
footprint_source=raster
```
Then Set the `FootprintBehaviour` to `Transparent` in the GeoServer layer settings.
This process was based on [GeoServer ImageMosaic doesn't handle internal mask for JPEG compression GeoTIFF - Geographic Information Systems Stack Exchange](https://gis.stackexchange.com/questions/362973/geoserver-imagemosaic-doesnt-handle-internal-mask-for-jpeg-compression-geotiff)


## Publication note
All the files in this directory are ignored in the Git repository. The contents of this folder
should be published as a public folder for download on NextCloud.

