// Copyright 2021 Marc Hammerton - Australian Institute of Marine Science
//
// MIT License https://mit-license.org/
// This script is written to run on the Google Earth Engine.

// === README: Change the path to your local copy of the utils code ====
// The path to the util code must be an absolute path including the username and repository:
// 'users/__USERNAME__/__REPOSITORY__:l8Utils.js').utils;
var landsat8Utils = require('users/__USERNAME__/__REPOSITORY__:l8Utils.js').utils;

// These are the options for the primary reference imagery.
// The primary reference imagery should correspond to a composite
// made from the best set of images available, with the goal being
// to get the cleanest image.

// possible colour grades: ['TrueColour','DeepMarine','DeepFalse','ReefTop', 'Slope']
var REF1_OPTIONS = {
  colourGrades: ['TrueColour', 'DeepMarine', 'DeepFalse', 'ReefTop', 'Slope'],
    exportScale: [30, 30, 30, 30, 30],
    exportBasename: 'CS_AIMS_Coral-Sea-Features_Img_L8_R1',
    exportFolder: 'EarthEngine/CS_AIMS_Coral-Sea-Features_Img/Coral-Sea',
  applySunGlintCorrection: true,
  applyCloudMask: true
};
var REF2_OPTIONS = {
  colourGrades: ['TrueColour', 'DeepMarine', 'DeepFalse', 'ReefTop', 'Slope'],
    exportScale: [30, 30, 30, 30, 30],
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
// ======== Kenn reefs and Wreck reefs (Coral Sea) - South east =========
// Searched 26 out of 26
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
  true, false, REF1_OPTIONS);

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
  false, false, REF2_OPTIONS);
