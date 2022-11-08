// Copyright 2021 Marc Hammerton - Australian Institute of Marine Science
//
// MIT License https://mit-license.org/
// This script is written to run on the Google Earth Engine.

// === README: Change the path to your local copy of the utils code ====
// The path to the util code must be an absolute path including the username and repository:
// 'users/__USERNAME__/__REPOSITORY__:src/01-gee/landsat8/l8Utils.js').utils;

var landsat8Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Img:src/01-gee/landsat8/l8Utils.js').utils;


// These are the options for the primary reference imagery.
// The primary reference imagery should correspond to a composite
// made from the best set of images available, with the goal being
// to get the cleanest image.

// possible colour grades: ['TrueColour','DeepMarine','DeepFalse','ReefTop', 'Slope']
var REF1_OPTIONS = {
    // colourGrades: ['TrueColour', 'DeepMarine', 'DeepFalse', 'ReefTop', 'Slope'],
    // exportScale: [30, 30, 30, 30, 30],
    //colourGrades: ['TrueColour', 'DeepFalse'],
    //exportScale: [30, 30],
    colourGrades: ['Depth'],
    exportScale: [30],
    exportBasename: 'CS_AIMS_Coral-Sea-Features_Img_L8_R1',
    exportFolder: 'EarthEngine/CS_AIMS_Coral-Sea-Features_Img/Coral-Sea',
    applySunGlintCorrection: true,
    applyCloudMask: true
};
var REF2_OPTIONS = {
    colourGrades: ['TrueColour', 'DeepFalse'],
    exportScale: [30, 30],
    exportBasename: 'CS_AIMS_Coral-Sea-Features_Img_L8_R2',
    exportFolder: 'EarthEngine/CS_AIMS_Coral-Sea-Features_Img/Coral-Sea',
    applySunGlintCorrection: true,
    applyCloudMask: true
};



// ===============================================================
//
//                      CORAL SEA
//
// ===============================================================
// ======== Kenn reefs and Wreck reefs (Coral Sea - South east) =========
// Searched 26 images
// Good images
landsat8Utils.composeDisplayAndExport(
  [
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20200813",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20200509",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20180723",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20190912",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20180909",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20210731"
  ],
  false, false, REF1_OPTIONS);

// OK and Maybe images
landsat8Utils.composeDisplayAndExport(
  [
    // ok
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20151104",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20170720",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20170704",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20210309",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20150426",
    // maybe
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20191115",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20200930",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20220123",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20171008",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20170922",
    "LANDSAT/LC08/C02/T1_TOA/LC08_088075_20210221"
  ],
  false, false, REF2_OPTIONS);

// ===============================================================
// ======== Holmes Reefs and Moore Reefs (Coral Sea - Central) =========
// Searched 7 images
// Good and OK images 
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_094071_20141011",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094071_20190907",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094071_20131024",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094071_20170613",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094071_20140707"
    ],
    false, false, REF1_OPTIONS);

// ===============================================================
// ======== Diane Bank (Coral Sea - Central) =========
// Searched 15 images
// Good and OK images 
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_093071_20180812",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093071_20200817",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093071_20180828",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093071_20161228",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093071_20181015",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093071_20201020"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// ======== Herald Cays, East Ribbon Reef, and South West Islet (Coral Sea - Central) =========
// Searched 29 images
// Good and OK images 
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_093072_20170214",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093072_20200817",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093072_20140902",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093072_20190714",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093072_20180812",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093072_20180828"
    ],
    false, false, REF1_OPTIONS);

// ===============================================================
// ======== Flinders Reefs, Flora Reef, and south Holmes Reefs (Coral Sea - Central) =========
// Searched 12 images
// Good and OK images
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_094072_20190907",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094072_20140707",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094072_20140504",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094072_20190822",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094072_20141011"
    ],
    false, false, REF1_OPTIONS);

// ===============================================================
// ======== Marion Reef (Coral Sea - Central) =========
// Searched 8 images
// Good and OK images 
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_091073_20161010",
        "LANDSAT/LC08/C02/T1_TOA/LC08_091073_20140903",
        "LANDSAT/LC08/C02/T1_TOA/LC08_091073_20150922",
        "LANDSAT/LC08/C02/T1_TOA/LC08_091073_20140818",
        "LANDSAT/LC08/C02/T1_TOA/LC08_091073_20160706"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// ======== Saumarez Reefs (Coral Sea - South )=========
// Searched 15 images
// Good and OK images 
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_090075_20150510",
        "LANDSAT/LC08/C02/T1_TOA/LC08_090075_20140710",
        "LANDSAT/LC08/C02/T1_TOA/LC08_090075_20190724",
        "LANDSAT/LC08/C02/T1_TOA/LC08_090075_20150424",
        "LANDSAT/LC08/C02/T1_TOA/LC08_090075_20160528",
        "LANDSAT/LC08/C02/T1_TOA/LC08_090075_20200811"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// ======== North part of Frederick Reefs (Coral Sea - South )=========
// Searched 2 images
// Good and OK images 
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_089074_20170524",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089074_20180815"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// ======== Frederick Reefs and Wreck Reefs (Coral Sea - South )=========
// Searched 23 images
// Good and OK images
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20190903",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20200601",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20160926",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20170524",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20200820",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20180916",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089075_20150604"
    ],
    false, false, REF1_OPTIONS);

// ===============================================================
// ======== Wreck Reefs and Hutchison Rock (Coral Sea - South )=========
// Searched 23 images
// Good and OK images
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20150901",
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20161005",
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20170704",
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20210731",
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20180723",
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20210325",
        "LANDSAT/LC08/C02/T1_TOA/LC08_088076_20190811"
    ],
    false, false, REF1_OPTIONS);

// ===============================================================
// ======== Bampton Reefs - northern part (Coral Sea - Far East )=========
// Searched 8 images
// Good and OK images
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_087073_20191108",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087073_20180716",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087073_20210214",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087073_20130819",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087073_20170814"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// ======== Bampton Reefs - southern part (Coral Sea - Far East )=========
// Searched 25 images
// Good and OK images
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20191108",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20170118",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20210214",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20160827",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20150318",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20130819",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20200822",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20151113",
        "LANDSAT/LC08/C02/T1_TOA/LC08_087074_20170814"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// Sharkbay
// This area was used for tuning the B2_OFFSET parameter in the Depth
// estimation. This area was used due to the large seagrass meadows
// in clear water on sand. The B2_OFFSET was tuned so that seagrass areas
// would result in a similar depth to the immediately neighbouring sandy areas,
// working off the assumption that they are probably a similar depth.
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_115078_20150627",
        "LANDSAT/LC08/C02/T1_TOA/LC08_115078_20130621",
        "LANDSAT/LC08/C02/T1_TOA/LC08_115078_20150814",
        "LANDSAT/LC08/C02/T1_TOA/LC08_115078_20130824"
    ],
    false, false, REF1_OPTIONS);