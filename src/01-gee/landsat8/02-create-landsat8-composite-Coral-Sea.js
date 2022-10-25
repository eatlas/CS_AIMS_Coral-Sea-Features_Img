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
    colourGrades: ['TrueColour', 'DeepFalse'],
    exportScale: [30, 30],
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

/**
 * Utility function to display and export the mosaic
 *
 * @param imageIds
 * @param isDisplay
 * @param isExport
 * @param options
 */
var landsat8CompositeDisplayAndExport = function (imageIds, isDisplay, isExport, options) {
  var colourGrades = options.colourGrades;
  var exportFolder = options.exportFolder;
  var exportBasename = options.exportBasename;
  var exportScale = options.exportScale;

  // Skip over if nothing to do
  if (!(isExport || isDisplay)) {
    return;
  }

  // check options
  if (!Array.isArray(colourGrades)) {
    throw "The colourGrades must be an array for proper behaviour";
  }
  if (isExport && !Array.isArray(exportScale)) {
    throw "options.exportScale should be an array was: " + exportScale;
  }
  if (isExport && (colourGrades.length !== exportScale.length)) {
    throw "number of elements in options.exportScale (" + exportScale.length + ") " +
    "must match the options.colourGrades (" + colourGrades.length + ")";
  }

  // remove duplicates
  imageIds = imageIds.filter(function (item, pos, self) {
    return self.indexOf(item) === pos;
  })

  // get the specific tile number and remove all duplicate. In the end there should only be one left (all images should
  // be from the same tile).
  // LANDSAT/LC08/C02/T1_TOA/LC08_091075_20160706
  // => 091075
  var tileId = imageIds.map(function (id) {
    var n = id.lastIndexOf("_");
    return id.substring((n - 6), n);
  }).filter(function (item, pos, self) {
    return self.indexOf(item) === pos;
  });
  // Make sure we are dealing with a single image tile.
  if (tileId.length > 1) {
    throw "This only supports images from a single tile, found: " + String(tileId);
  }

  var composite = landsat8Utils.createMosaicImage(imageIds, options.applySunGlintCorrection, options.applyCloudMask);

  // Prepare images for each of the specified colourGrades
  for (var i = 0; i < colourGrades.length; i++) {
    var finalComposite = landsat8Utils.visualiseImage(composite, colourGrades[i]);

    if (isExport) {
      // Example name: AU_AIMS_Landsat8-marine_V1_TrueColour_55KDU_2016-2020-n10
      var exportName = exportBasename + '_' + colourGrades[i] + '_' + tileId;
      print("======= Exporting image " + exportName + " =======");

      Export.image.toDrive({
        image: finalComposite,
        description: exportName,
        folder: exportFolder,
        fileNamePrefix: exportName,
        scale: exportScale[i],
        region: composite.geometry(),
        maxPixels: 3e8                // Raise the default limit of 1e8 to fit the export
      });
    }

    if (isDisplay) {
      // Create a shorter display name for on the map.
      // Example name: TrueColour_091075_2016-2020-n10
      var displayName = colourGrades[i] + '_' + tileId;

      Map.addLayer(finalComposite, {}, displayName, false, 1);
      Map.centerObject(composite.geometry());

      // https://gis.stackexchange.com/questions/362192/gee-tile-error-reprojection-output-too-large-when-joining-modis-and-era-5-data
      // https://developers.google.com/earth-engine/guides/scale
      // https://developers.google.com/earth-engine/guides/projections
      //
      // Errors when displaying slope images on map are caused by the combination of map zoom level and scaling factor:
      //
      // "If the scale you specified in the reproject() call is much smaller than the zoom level of the map, Earth Engine will request all the inputs at very small scale, over a very wide spatial extent. This can result in much too much data being requested at once and lead to an error."
      if (Map.getZoom() < 9) {
        Map.setZoom(9);
      }
    }
  }
}

// ===============================================================
//
//                      CORAL SEA
//
// ===============================================================
// ======== Kenn reefs and Wreck reefs (Coral Sea - South east) =========
// Searched 26 images
// Good images
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
  false, true, REF2_OPTIONS);

// ===============================================================
// ======== Holmes Reefs and Moore Reefs (Coral Sea - Central) =========
// Searched 7 images
// Good and OK images 
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_089074_20170524",
        "LANDSAT/LC08/C02/T1_TOA/LC08_089074_20180815"
    ],
    false, false, REF1_OPTIONS);


// ===============================================================
// ======== Frederick Reefs and Wreck Reefs (Coral Sea - South )=========
// Searched 23 images
// Good and OK images
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
landsat8CompositeDisplayAndExport(
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
// ======== Plateau des Bellona (Coral Sea - Far East )=========
// Searched 14 images
// Good and OK images
landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_086075_20170706",
        "LANDSAT/LC08/C02/T1_TOA/LC08_086075_20170908",
        "LANDSAT/LC08/C02/T1_TOA/LC08_086075_20190728",
        "LANDSAT/LC08/C02/T1_TOA/LC08_086075_20140916",
        "LANDSAT/LC08/C02/T1_TOA/LC08_086075_20150802"
    ],
    false, false, REF1_OPTIONS);

// ===============================================================
//
//                      Southern PNG
//
// ===============================================================

// ===============================================================
// ======== Louisiade Archipelago (PNG )=========
landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_091068_20200123",
        "LANDSAT/LC08/C02/T1_TOA/LC08_091068_20150821"
    ],
    false, false, REF1_OPTIONS);
    
landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_092068_20150812",
        "LANDSAT/LC08/C02/T1_TOA/LC08_092068_20180108"
    ],
    false, false, REF1_OPTIONS);
    
landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_093068_20151023",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093068_20200223",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093068_20171129",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093068_20201223"
    ],
    false, false, REF1_OPTIONS);
    
// ===============================================================
// ======== PNG coast =========
landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_094067_20181006",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094067_20160509"
    ],
    false, false, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_095067_20180215",
        "LANDSAT/LC08/C02/T1_TOA/LC08_095067_20220125"
    ],
    false, false, REF1_OPTIONS);
    
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_096066_20191124"
    ],
    false, false, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_097066_20150325",
        "LANDSAT/LC08/C02/T1_TOA/LC08_097066_20211019",
        "LANDSAT/LC08/C02/T1_TOA/LC08_097066_20140322"
    ],
    false, false, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_084082_20211210"
    ],
    false, false, REF1_OPTIONS);
    
    
    
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_095067_20180215"
    ],
    false, true, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_096066_20191124"
    ],
    false, true, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_094066_20150811",
        "LANDSAT/LC08/C02/T1_TOA/LC08_094066_20130821"
    ],
    false, true, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_093066_20200223",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093066_20140326"
    ],
    false, true, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_092066_20191229",
        "LANDSAT/LC08/C02/T1_TOA/LC08_092066_20200302"
    ],
    false, true, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_092067_20180225",
        "LANDSAT/LC08/C02/T1_TOA/LC08_092067_20150812"
    ],
    false, true, REF1_OPTIONS);
    landsat8CompositeDisplayAndExport(
    [
        "LANDSAT/LC08/C02/T1_TOA/LC08_093067_20190511",
        "LANDSAT/LC08/C02/T1_TOA/LC08_093067_20200223"
    ],
    false, true, REF1_OPTIONS);