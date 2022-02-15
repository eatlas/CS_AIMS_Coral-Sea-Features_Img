# Google Earth Engine Scripts
These scripts run on the Google Earth Engine and generate the composite satellite images.

To run these scripts you will need to sign up for an account (https://earthengine.google.com/).

Each of the scripts represents a different part of the workflow that was undertaken in the
creation of this dataset.

`01-select-sentinel2-images.js` - Utility app that was used to select images suitable for converting
to composite images. This script was used to manually step through and select the best images available
for each Sentinel 2 tile.

`02-view-selected-sentinel2-images.js` - This utility is used to step through a specific set of
images based on their image IDs. This is useful for reassessing the image quality ranking of
a set of images.

`03-create-composite-Coral-Sea.js` - Creates all the final composite images for the Coral Sea region.
This generates lots of export Tasks. 

`03-create-composite-Global.js` - Creates all the final composite images for the Global region.
This generates lots of export Tasks. 

`s2Utils.js` - This is a library of functions that contains the bulk of the processing of the
images. It is a reusable library. Updated versions of this library can be found in the
[World_AIMS_Marine-satellite-imagery](https://github.com/eatlas/World_AIMS_Marine-satellite-imagery)
repository.

## Exporting many images from Google Earth Engine
The `03-create-composite-X.js` scripts generate many run tasks to perform the export of each
image. Manually clicking the `Run` button can be quite tedious. Ideally the code should be
rewritten into Python to automate this process. (Maybe next time). To make this process
more managable you can adjust the code to export one colourGrade at a time. i.e. change
```
  colourGrades: ['TrueColour','DeepFalse','ReefTop','Shallow','Slope'],
  exportScale: [10, 10, 10, 10, 30],
```
to
```
  colourGrades: ['TrueColour'],
  exportScale: [10],
```
Then perform the exports in batches, switching the colourGrade in each batch.

Alternatively you can automate the clicking of the `Run` button with Javascript pasted
into the Webbrowser console.
https://gis.stackexchange.com/questions/290771/batch-task-execution-in-google-earth-engine