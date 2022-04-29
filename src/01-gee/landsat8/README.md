# Google Earth Engine Scripts
These scripts run on the Google Earth Engine and generate the composite satellite images.

To run these scripts you will need to sign up for an account (https://earthengine.google.com/).

Each of the scripts represents a different part of the workflow that was undertaken in the
creation of this dataset.

`01-select-and-view-landsat8-images-app.js` - GEE app that was used to select images suitable for converting
to composite images. This script was used to manually select the best images available for each Landsat 8 tile.

`02-create-landsat8-composite-Coral-Sea.js` - Creates all the final composite images for the Coral Sea region.

`l8Utils.js` - This is a library of functions that contains the bulk of the processing of the
images. 

