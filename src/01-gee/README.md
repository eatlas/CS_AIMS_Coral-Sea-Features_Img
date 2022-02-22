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
into the Webbrowser console, noting that this automated attempts to open all the
export task dialogs at once and so might crash your browser. If this happens try processing
in smaller batches.
https://gis.stackexchange.com/questions/290771/batch-task-execution-in-google-earth-engine

``` Javascript
/**
 * Copyright (c) 2017 Dongdong Kong. All rights reserved.
 * This work is licensed under the terms of the MIT license.  
 * For a copy, see <https://opensource.org/licenses/MIT>.
 *
 * Batch execute GEE Export task
 *
 * First of all, You need to generate export tasks. And run button was shown.
 *   
 * Then press F12 get into console, then paste those scripts in it, and press 
 * enter. All the task will be start automatically. 
 * (Firefox and Chrome are supported. Other Browsers I didn't test.)
 * 
 * @Author: 
 *  Dongdong Kong, 28 Aug' 2017, Sun Yat-sen University
 *  yzq.yang, 17 Sep' 2021
 */
function runTaskList(){
    // var tasklist = document.getElementsByClassName('task local type-EXPORT_IMAGE awaiting-user-config');
    // for (var i = 0; i < tasklist.length; i++)
    //         tasklist[i].getElementsByClassName('run-button')[0].click();
    $$('.run-button' ,$$('ee-task-pane')[0].shadowRoot).forEach(function(e) {
         e.click();
    })
}

function confirmAll() {
    // var ok = document.getElementsByClassName('goog-buttonset-default goog-buttonset-action');
    // for (var i = 0; i < ok.length; i++)
    //     ok[i].click();
    $$('ee-table-config-dialog, ee-image-config-dialog').forEach(function(e) {
         var eeDialog = $$('ee-dialog', e.shadowRoot)[0]
         var paperDialog = $$('paper-dialog', eeDialog.shadowRoot)[0]
         $$('.ok-button', paperDialog)[0].click()
    })
}

// Paste the above functions, then paste runTaskList(), then paste confirmAll().
// Run this line then wait until all tasks popups have been created.
runTaskList();

// Then run this command to confirm all of them.
confirmAll();
```
