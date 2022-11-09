// Copyright 2021 Marc Hammerton - Australian Institute of Marine Science
//
// MIT License https://mit-license.org/
// This script is written to run on the Google Earth Engine.

// === README: Change the path to your local copy of the utils code ====
// The path to the util code must be an absolute path including the username and repository:
// 'users/__USERNAME__/__REPOSITORY__:src/01-gee/landsat8/l8Utils.js').utils;

var landsat8Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Img:src/01-gee/landsat8/l8Utils.js').utils;


// These scenes are used for depth contour calibration. The scenes on the GBR
// are for comparing with the GBR30 bathymetry dataset and the imagery in
// Sharkbay is for analysing the effects of dark substrate (seagrass) on the
// depth profile.

// possible colour grades: ['TrueColour','DeepMarine','DeepFalse','ReefTop', 'Slope', 'Depth5m', 'Depth10m', 'Depth20m' ]
var REF1_OPTIONS = {
    // colourGrades: ['TrueColour', 'DeepFalse', 'Depth5m', 'Depth10m', 'Depth20m'],
    // exportScale: [30, 30, 30, 30, 30],
    colourGrades: ['TrueColour', 'DeepFalse','Depth5m', 'Depth10m', 'Depth20m'],
    exportScale: [30, 30, 30, 30, 30],
    exportBasename: 'CS_AIMS_Coral-Sea-Features_Img_L8_R1',
    exportFolder: 'EarthEngine/CS_AIMS_Coral-Sea-Features_Img/GBR',
    applySunGlintCorrection: true,
    applyCloudMask: true
};
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
    false, true, REF1_OPTIONS);
    
// Depth calibration images.
// These scenes were used to calibrate the depth calculations against the GA GBR30 2020
// dataset. No tidal assessment was made. For this calibration the Depth styles were used.
// 

// Davies reef
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_094073_20190822",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094073_20190907"
    ],
    false, true, REF1_OPTIONS);
    
// Tongue and Batt Reef
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_096071_20160608",
        "LANDSAT/LC08/C02/T1_TOA/LC08_096071_20180801",
        "LANDSAT/LC08/C02/T1_TOA/LC08_096071_20190905",
        "LANDSAT/LC08/C02/T1_TOA/LC08_096071_20130702"
    ],
    false, true, REF1_OPTIONS);
    
    
// Paul Reef
landsat8Utils.composeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_091075_20140903",
        "LANDSAT/LC08/C02/T1_TOA/LC08_091075_20180829"
    ],
    false, true, REF1_OPTIONS);