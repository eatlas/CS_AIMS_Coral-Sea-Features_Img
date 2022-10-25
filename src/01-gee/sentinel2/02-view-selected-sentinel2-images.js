// Copyright 2022 Eric Lawrey - Australian Institute of Marine Science
// MIT License https://mit-license.org/

// This script is written to run on the Google Earth Engine
//
// Use this script to browse through a specific set of Sentinel 2
// images. This can be used to fine tune the selection of images obtained
// using the 01-select-sentinel2-images script without having to
// step through all the non relevant images.

// === README: ====
// If you modify your copy of s2Utils.js you must change this path, changing
// the username. GEE only allows absolute paths.
var s2Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Img:src/01-gee/sentinel2/s2Utils.js');

// This is the list of images to look through. Think of this list as
// as a temporary list of images that you are working on that you wish
// to review. You can therefore delete all the ones currently in the
// list and copy into the image IDs of the images you are interested
// in reviewing.
//
// This function will zoom to the centroid of the tiles in the array,
// rather than the perhaps preferred behaviour of zoom to the location
// of each tile if it changes. As such this is optimised for reviewing
// images from a single Sentinel 2 tile.
var IMAGE_IDS = 
  [
    "COPERNICUS/S2/20160923T235242_20160923T235240_T56KQU",
    "COPERNICUS/S2/20170908T235241_20170908T235243_T56KQU",
    "COPERNICUS/S2/20180829T235239_20180829T235235_T56KQU",
    "COPERNICUS/S2/20190506T235259_20190506T235253_T56KQU",
    "COPERNICUS/S2/20190918T235241_20190918T235244_T56KQU",
    "COPERNICUS/S2/20210724T235249_20210724T235247_T56KQU",
    "COPERNICUS/S2/20210828T235251_20210828T235246_T56KQU"
  ];

s2Utils.viewSelectedSentinel2ImagesApp(IMAGE_IDS);
