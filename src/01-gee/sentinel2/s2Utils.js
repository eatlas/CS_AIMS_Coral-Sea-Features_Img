// Copyright 2022 Eric Lawrey - Australian Institute of Marine Science
//
// MIT License https://mit-license.org/
//
// Version: v1.0   initial release
// Version: v1.0.1 Adjusted the small tile filter in createSelectSentinel2ImagesApp so that
//                 more images are available for selection.
// Version: v1.1   Added styles Depth, Depth10m, Depth5m, DryReef. Also changed ReefTop 
//                 to export as a shapefile instead of a raster.
// Version: v1.1.1 Tweaking of the DryReef algorithm to improve the conversion to polygons.
//                 Added Breaking stylings.
// Version: v1.1.2 Adjusted polygon export to GeoJSON to minimise the number of export 
//                 files as Google Drive struggles with the number generated when using
//                 shapefiles.
// Version: v1.2   Added Basic land layer. Added land masking to DryReef and Breaking
//                 styles. Adjusted the cut off threshold for DryReef to be more representative
//                 of reef tops that are dry or exposed at low tide. This was done by tweaking
//                 based on the boundary extent on Green Island and South Warden Reef.
// Version: v1.2.1 Adjusted the land layer threshold to more be more accurate. It is still
//                 imperfect because to get close to high water mark the threshold starts
//                 to cut out dark land features. As such it is a noisy layer that would
//                 require considerable manual clean up.
// Version: v1.3.0 Changed the generation of the image composition. Previously some cays 
//                 were being interpretted as clouds, resulting in permanent gaps in the 
//                 composite images. The new approach layers a composite with no cloud 
//                 masking underneath the cloud masked composite, resulting in gaps being
//                 in filled.
// Version: v1.3.1 Change the depth mapping so that land areas are marked as 1 m above sea
//                 level rather than masked out. 
// Version: v1.3.2 Fixed scaling code for polygon generation. Had attempted to export at
//                 5 m resolution, but GEE just doesn't work (it runs out of memory), thus
//                 10 m is the maximum resolution for Sentinel 2 imagery.
// Version: v1.3.2.1 Improved the calibration of the Satellite Derived Bathymetry. The SBD was
//                 calibrated against the GA GBR30 2020 dataset at 5 m and 10 m. The original
//                 contours from v1.4.0 were compared with the GBR30 dataset. The GBR30 dataset
//                 was iteratively adjusted to match the generated contours to get an estimate
//                 of actual depths indicated by the previous depth contours. We looked at 5
//                 scenes across the GBR and found the original 10 m and 5 m depth contours came out at
//                 8.6 m and 4.06 m respectively. This was then used to adjust the slope and offset.
//                 After adjusting we reviewed the bathymetry contours with 3 additional scenes
//                 on the GBR (56KLV, 55KEV, 54LYN). 
//                 Test Scene 5m         10m
//                 56KLV      4.4 - 5.6  8.2 - 8.6    (Low number of suitable areas for checking)
//                 55KEV      4.2 - 6.2  8.4 - 12.4   (Seemed to be a gradient across the image)
//                 54LYN      4.5 - 4.7  9.7 - 10.3 
//                 The range indicates the acceptable matches between GBR30 and the contours.
//                 Overall the test scenes verified that the bathymetry provided a result that 
//                 is accurate to within +-1 m for 5 m contour and +-2m for 10 m contour. There
//                 is probably a slight negative bias for the 5 m contour, but it was difficult 
//                 to accurately determine because of spatial variability.
// Version v1.3.2.2 Added a 20 m depth contour product based on the green channel (B3). This was
//                 calibrated against GA GBR30 2020 bathymetry composites in six Sentinel 2 scenes 
//                 (55KEV, 55KCB, 55KFU, 55LCD, 56KLV, 55KGU). The threshold to best match the 20 m
//                 contour was determined for each scene. Variations in this threshold were found
//                 depending on the water clarity. In more turbid waters scattered light raises 
//                 the brightness of the water resulting in a higher threshold for the same depth.
//                 For this reason the final threshold was chosen to match those scenes with clearer
//                 water as this would better match the Coral Sea. The difference in the thresholds
//                 results in approxiately 3 m difference between scenes.
/**
* @module s2Utils
* 
* This script is written to run on the Google Earth Engine.
* 
* This library allows processing Sentinel 2 imagery on the Google Earth Engine for
* generating cloud free composite images that have colour grading and post processing
* that is optimised for looking at marine areas, in particular for studying coral reefs.
*
* To use this library (with no external code dependancies) copy and paste it
* into you own GEE repository.
* 
* Scripts in s2-composites shows examples of using this library.
*/


/**
 * Creates a composite Sentinel2 image from the specified set of image IDs, 
 * and applies the specified colourGrading to the image, creating, displaying
 * and exporting an image for each colourGrade.
 * 
 * The composite image removes sunglint and uses cloud masking to produce
 * a composite that is optimised for studying marine features. It also
 * applied brightness normalisation to adjust the beightness so that the
 * deep clear water in scenes are standardised.
 * 
 * The imageIds to use can be compiled using the 01-select-best-sentinel2-images
 * script.
 * 
 * The is_display and is_export options can be used to indicate the actions
 * to be performed. Set these to false after you have finished working on a
 * tile to stop the script wasting time on generating products that are already
 * complete.
 * 
 * @param {String[]} imageIds -     Google Earth image IDs of Sentinel 2 images to merge into 
 *                                  a composite.
 * @param {boolean} is_display -    If true then add the composite and its cloud mask to the 
 *                                  map. Use this for previewing prior to performing exports.
 * @param {boolean} is_export -     If true then generate exports of the image
 * @param {object} options -        Map of optional parameters listed below. Typical example: 
 *                                  var OPTIONS = {
 *                                    colourGrades: ['TrueColour','DeepFalse'],
 *                                    exportBasename: 'AU_AIMS_Sentinel2-marine_V1',
 *                                    exportFolder: 'EarthEngine\\AU_AIMS_Sentinel2-marine_V1',
 *                                    scale: 10
 *                                  };
 *        [{string}] colourGrades - Array of names of colourGrades to apply to the image and
 *                                  prepare for exporting. The allowable styles correspond to
 *                                  those supported by bake_s2_colour_grading(). These are:
 *                                  'TrueColour', 'DeepMarine', 'DeepFalse' , 'DeepFeature', 
 *                                  'Shallow', 'ReefTop' 
 *        {string} exportBasename - Base name of the export image file. The colourGrade
 *                                  and the image Sentinel tile IDs are appended to the
 *                                  image name. This approach is most appropriate for
 *                                  exporting images that are from a single Sentinel 2
 *                                  tile as exporting from multiple tile will potentially
 *                                  make the file names lengthy.
 *                                  exportBasename_{colourGrade}_{list of Sentinel tile IDs}_
 *                                  {date range}-n{number of images}
 *        {string} exportFolder -   Folder in Google Drive to export the image to. The colourGrade
 *                                  is appended to the folder to file tiles based on colourGrades.
 *        [{integer}] exportScale - Default scale to apply to the exports in metres. For Sentinel 2
 *                                  full resolution exports would be 10. Set scale higher if you
 *                                  wish to lower the resolution of the export. It is probably
 *                                  wise to keep it a ratio of the native image resolution of 10 m
 *                                  for best quality, noting I have not tested this theory.
 *                                  The array of values corresponds to the scale to use for each of the
 *                                  colourGrades.
 *        {boolean} applyBrightnessAdjustment - Apply brightness adjustment to the composite to normalise
 *                                  the brightness of marine areas across scenes.
 *        {boolean} applySunglintCorrection - Apply sunglint correction to the imagery prior to
 *                                  creating as a composite. Note that turning off sunglint
 *                                  correction will significantly alter the brightness of the
 *                                  imagery as the contrast enhancements are tailored to 
 *                                  sunglint being applied.
 */
exports.s2_composite_display_and_export = function(imageIds, is_display, is_export, options) {
  
  var colourGrades = options.colourGrades;
  var exportFolder = options.exportFolder;
  var exportBasename = options.exportBasename;
  var exportScale = options.exportScale;
  
  
  
  // Skip over if nothing to do
  if (!(is_export || is_display)) {
    return;
  }
  if (!Array.isArray(colourGrades)) {
    throw "For tiles "+utmTilesString+
      " colourGrades must be an array for proper behaviour";
  }
  var uniqueUtmTiles = exports.unique_s2_tiles(imageIds);
  // Make sure we are dealing with a single image tile.
  //if (uniqueUtmTiles.length > 1) {
  //  throw "s2_composite only supports images from a single tile found: "+
  //    String(uniqueUtmTiles);  
  //}
  
  if (is_export && !Array.isArray(exportScale)) {
    throw "options.exportScale should be an array was: "+exportScale;
  }
  
  if (is_export && (colourGrades.length != exportScale.length)) {
    throw "number of elements in options.exportScale ("+exportScale.length+") "+
      "must match the options.colourGrades ("+colourGrades.length+")";
  }
  

  var composite = exports.s2_composite(imageIds, 
    options.applySunglintCorrection, options.applyBrightnessAdjustment);

  var utmTilesString = uniqueUtmTiles.join('-');
  
  // Add the date range and number of images in the composite.
  // This code is disabled to shorten the final file names to
  // reduce the chance of running into Windows file path issues.
  // Can't quite bring myself to delete this section of code yet
  // though.
  var includeDateStr = false; 
  var dateRangeStr = "";
  if (includeDateStr) {
    // Get the years and months of the images in the composite to
    // generate a date range to put in the filename
    // COPERNICUS/S2/20170812T003031_20170812T003034_T55KDV"
    // To:
    // "2017"
    var tileDates = imageIds.map(function(id) {
      // Find the position of the characters just after S2/
      // tile in the Sentinel-2 IDs. 
      var n = id.lastIndexOf("S2/")+3;
      return id.substr(n,4);
    });

    // This works because the date strings are in yyyymm format
    var datesInOrder = tileDates.sort();
    
    if (tileDates.length === 1) {
      // Just use the one date in the name
      // 2016-n1
      dateRangeStr = '_'+datesInOrder[0]+'-n1';
    } else {
      // Get the start and end dates
      // 2016-2020-n5
      dateRangeStr = '_'+datesInOrder[0]+'-'+datesInOrder[datesInOrder.length-1]+
        '-n'+datesInOrder.length;
    }
  }
    
  var includeCloudmask = false;
  
  var tilesGeometry = exports.get_s2_tiles_geometry(
    imageIds, ee.Geometry.BBox(-180, -33, 180, 33));
  
  // Prepare images for each of the specified colourGrades
  for (var i=0; i < colourGrades.length; i++) {
    
    
    // Example name: AU_AIMS_Sentinel2-marine_V1_TrueColour_55KDU_2016-2020-n10
    var exportName = exportBasename+'_'+colourGrades[i]+
      '_'+utmTilesString+dateRangeStr;
      
    // Create a shorter display name for on the map.
    // Example name: TrueColour_55KDU_2016-2020-n10
    var displayName = colourGrades[i]+
      '_'+utmTilesString+dateRangeStr;

    var final_composite = exports.bake_s2_colour_grading(
      composite, colourGrades[i], includeCloudmask);
    
    // If the style corresponds to a contour then convert and export as a shapefile
    if (colourGrades[i] === 'ReefTop' || colourGrades[i] === 'Depth10m' || 
      colourGrades[i] === 'Depth20m' ||
      colourGrades[i] === 'Depth5m' || colourGrades[i] === 'DryReef' ||
      colourGrades[i] === 'Breaking' || colourGrades[i] === 'Land') {
      makeAndSaveShp(final_composite, displayName, exportName, exportFolder, exportScale[i], tilesGeometry, is_display, is_export);
    } else {
      
      // Keep as raster

      var displayMin = 0;
      var displayMax = 1;
    
      var export_composite;
      if (colourGrades[i] === 'Depth') {
        export_composite = final_composite;
        displayMin = -25;
        displayMax = 0;
      // Used for tuning the threshold
      //} else if (colourGrades[i] === 'Depth20m') {
        //export_composite = final_composite;
        //displayMin = 0.0405;
        //displayMax = 0.0415;
      } else {
        // Scale and convert the image to an 8 bit image to make the export
        // file size considerably smaller.
        // Reserve 0 for no_data so that the images can be converted to not
        // have black borders. Scaling the data ensures that no valid data
        // is 0.
        export_composite = final_composite.multiply(254).add(1).toUint8();
      }
      
      // Export the image, specifying scale and region.
      // Only trigger the export when we want. The export process can take quite a while
      // due to the queue time on the Earth Engine. The first export I did was
      // 3 days on the queue.
    
      if (is_export) {
        print("======= Exporting image "+exportName+" =======");
        //var saLayer = ui.Map.Layer(tilesGeometry, {color: 'FF0000'}, 'Export Area');
        //Map.layers().add(saLayer);
        
      
        Export.image.toDrive({
          //image: final_composite,
          image: export_composite,
          description: exportName,
          folder:exportFolder,
          fileNamePrefix: exportName,
          scale: exportScale[i],          // Native image resolution of Sentinel 2 is 10m.
          region: tilesGeometry,
          maxPixels: 6e8                  // Raise the default limit of 1e8 to fit the export 
                                          // of full sized Sentinel 2 images
        });
      }
      if (is_display) {
        Map.addLayer(final_composite, {'min': displayMin, 'max': displayMax, 'gamma': 1},
                        displayName, false, 1);
        if (includeCloudmask) {
          Map.addLayer(final_composite.select('cloudmask').selfMask(), {'palette': 'orange'},
                       displayName+'_cloudmask', false, 0.5);
        }
      } 
    }
  }
};


// Helper function that converts the provided image into a vector image and saves it
// as a SHP file in Google Drive. Use 3 m resolution.
// If the image is large then the vectorisation may fail or be very slow.
// img - image to vectorise. Should be grey scale 0 - 1. A 0.5 threshold is applied
// layerName - Display name to give to the vector layer.
// fileName - Name to give in the export task
// exportFolder - folder to save into on Google Drive
// scale - scale to export the vector at. 10 for 10 m. For Sentinel 2 images 
//         the finest scale is 10 m before GEE runs out of memory and just stops working,
//         often with no error message.
// geometry - limit of the vectorisation.
function makeAndSaveShp(img, layerName, fileName, exportFolder, scale, geometry, is_display, is_export) {

  // Apply a threshold to the image
  var imgContour = img.gt(0.5);
  
  // Make the water area transparent
  imgContour = imgContour.updateMask(imgContour.neq(0));
  // Convert the image to vectors.
  var vector = imgContour.reduceToVectors({
    geometry: geometry,
    crs: imgContour.projection(),
    scale: scale,
    geometryType: 'polygon',
    eightConnected: false,
    labelProperty: 'DIN',
    maxPixels: 6e8
  });
  
  if (is_display) {
    // Make a display image for the vectors, add it to the map.
    var display = ee.Image(0).updateMask(0).paint(vector, '000000', 2);
    Map.addLayer(display, {palette: '000000'}, layerName, false);
  }
  if (is_export) {
    // Export the FeatureCollection to a KML file.
    Export.table.toDrive({
      collection: vector,
      description: fileName,
      folder:exportFolder,
      fileNamePrefix: fileName,
      fileFormat: 'GeoJSON'
    });
  }
}

/**
 * This function returns an array of the unique set of Sentinel 2 tiles from
 * the provided set of image Ids. For example:
 * image Id: "COPERNICUS/S2/20170812T003031_20170812T003034_T55KDV"
 * tile Id: "55KDV"
 */
exports.unique_s2_tiles = function(imageIds) {
  // Determine the set of Sentinel 2 UTM tiles that are being composed together.
  // Use this set to create part of the final file name.
  // "COPERNICUS/S2/20170812T003031_20170812T003034_T55KDV"
  // To:
  // "55KDV"
  var utmTiles = imageIds.map(function(id) {
    // Find the position of the characters just before the UTM
    // tile in the Sentinel-2 IDs. 
    var n = id.lastIndexOf("_T")+2;
    if (n==1) {
      throw "imageIds don't match Sentinel 2 format: "+id;
    }
    return id.substr(n);
  });
  
  // Remove duplicates in the tileIds. 
  // Modified from 
  // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
  var seen = {};
  var uniqueUtmTiles = utmTiles.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
  return (uniqueUtmTiles);
};

/**
 * This function creates a composite image from a list of Sentinel 2 image IDs.
 * This function applies cloud masking and sunglint correction to the images
 * prior to creating the composite. This function does not perform any
 * brightness compensation on the image. Use s2_composite_brightness_normalisation()
 * if this is needed.
 * @param {String[]} imageIds -     Google Earth image IDs of Sentinel 2 images to merge into 
 *                                  a composite.
 * @param {boolean} applyBrightnessAdjustment - If true then apply a brightness adjustment to the
 *                                  composite that normalises the brightness of deep clear
 *                                  marine areas. This uses s2_composite_brightness_normalisation().
 *                                  Normally this parameter should be true, but was added to allow
 *                                  the generation of example images to show the effect of the 
 *                                  brightness adjustment in the dataset documentation and reporting. 
 *                                  Note: version 0 of this dataset did not have this correction.
 * @param {boolean} applySunglintCorrection - If true then apply sunglint correction (marine areas)
 *                                  and matching static atmospheric for land areas to the imagery
 *                                  prior to creating the composite image. 
 *                                  Normally this parameter should be true, but was added to allow
 *                                  the generation of example images to show the effect of the 
 *                                  sunglint correction in the dataset documentation and reporting.
 * @return {Image}                  Returns the final composite image. In most situations this
 *                                  image can be ignored if you are using isDisplay or isExport
 *                                  as true and don't wish to perform additional processing.
 */
exports.s2_composite = function(imageIds, applySunglintCorrection, applyBrightnessAdjustment) {
  
  // We only support a single tile. This is to make processing the 
  // projection information more straight forward. 
  //var tiles = exports.unique_s2_tiles(imageIds);
  //if (tiles.length > 1) {
  //  throw "s2_composite only supports images from a single tile found: "+String(tiles);  
  //}
  
  // Get the outter boundary polygon of the tiles
  // This is to help make the get_s2_cloud_collection process more
  // efficient. This part can be reused, however we only need it 
  // here to be used once.
  // Restrict the processing to the latitudes where coral reefs occur.
  // This reduces the number of s2 tiles. Note I couldn't work out
  // how to generate a proper error message when it there are requested
  // s2 tiles that are outside this boundary.
  var tilesGeometry = exports.get_s2_tiles_geometry(
    imageIds, ee.Geometry.BBox(-180, -33, 180, 33));
    
  
  // Can't seem to test for an empty geometry in GEE.
  // Get the collection of images specified by imageIds and add the matching
  // cloud masks to these images. Pass in the tilesGeometry so that 
  // it only needs to be calculated once.
  var s2_cloud_collection = exports.get_s2_cloud_collection(imageIds, tilesGeometry);
  
  var composite_collection = s2_cloud_collection;
  
  
  if (applySunglintCorrection) {
    composite_collection = s2_cloud_collection.map(exports.removeSunGlint);
  } 

  var composite;  
  
  // When creating the composite we are using the 50 percentile (median).
  // This threshold was chosen due to the relatively low number of 
  // clean images available. i.e. because we are manually pre-selecting
  // and only processing the cleaned images available they are generally
  // pretty clean images and there aren't that many of them.
  // As a result taking the median provides the best estimate of the
  // expected surface brightness, while still discarding bright cloud
  // pixels (provided they aren't in more than 50% of the images).
  // If we were processing more unfiltered images without cloud masking
  // then a lower threshold would be preferable as we would be trying to
  // filter out clouds and increased brightness due to turbidity. This
  // lower threshold comes with a slight increase in image noise, which
  // is why we don't use it here.
  
  // Layering composites - Cloud masking
  // One problem with the existing cloud masking is that there are some
  // coral cays that are consistently detected as clouds. As a result they are cut 
  // out from every images resulting in a final composite with holes where the
  // coral cays are. I tried adjusting the detection threholds for clouds to reduce
  // this problem. The trade off is if you raise the cloud detection threshold
  // it will slightly reduce the chance of thinking a cay is a cloud, but will come
  // with the trade off that more cloud will end up not being filtered out.
  
  // To get around this problem we create the composite twice. Once with cloud
  // masking and one with no cloud masking. We layer the cloud masked layer over the top
  // of the non cloud masked image. Any holes in the cloud masked image (due to a cay)
  // will show the non-cloud masked image underneith. This should the cay. 
  // Since we only make composites from images with a low cloud cover the cays
  // should appear relatively noise free, even with no cloud masking.
  
  // All the bands to process  
  var IMG_BANDS = ['B1','B2','B3','B4','B5','B6','B7','B8',
        'B8A','B9','B10','B11','B12','QA10','QA20','QA60'];
      
  var compositeNoCloudMask = composite_collection
      .reduce(ee.Reducer.percentile([50],["p50"]))
      .rename(IMG_BANDS);
  
  // Only process with cloud mask if there is more than one image
  if (imageIds.length > 1) {    
    var compositeCloudMask = composite_collection.map(exports.add_s2_cloud_shadow_mask)
      .map(exports.apply_cloud_shadow_mask)
      .reduce(ee.Reducer.percentile([50],["p50"]))
      .rename(IMG_BANDS.concat(['cloudmask']));
    
    // Remove the cloudmask so that the bands match in the mosaic process
    var cloudmask = compositeCloudMask.select('cloudmask');     // Extract and save for later
    compositeCloudMask = compositeCloudMask.select(IMG_BANDS);  // Remove the cloud mask band
    
    // Layer the Cloud masked image over the composite with no cloud masking.
    // The Cloud masked composite should be a better image than
    // the no cloud masked composite everywhere except over coral cays (as they
    // are sometimes interpretted as clouds and thus are holes in the image). 
    // Layer the images so there are no holes.
    // Last layer is on top
    composite = ee.ImageCollection([compositeNoCloudMask, compositeCloudMask]).mosaic();
    
    // Add the cloud mask back into the image as a band
    composite = composite.addBands(cloudmask);
    
    //composite = compositeCloudMask;
  } else { 
    // If there is only a single image then don't use cloud masking.
    composite = compositeNoCloudMask;
  }
  
  // Correct for a bug in the reduce process. The reduce process
  // does not generate an image with the correct geometry. Instead
  // the composite generated as a geometry set to the whole world.
  // this can result in subsequent processing to fail or be very 
  // inefficient.
  // We work around this by clipping the output to the dissolved
  // geometry of the input collection of images.
  composite = composite.clip(composite_collection.geometry().dissolve());

  // Perform the brightness adjustment in this function as we have the 
  // tileGeometry available. This is a bit of a hack because I couldn't
  // determine a method of getting the geometry directly from the 
  // composite image itself.
  if (applyBrightnessAdjustment) {
    composite = exports.s2_composite_brightness_normalisation(composite, tilesGeometry);
  }
  return(composite);
};



/**
 * This function aims to normalise the brightness of composite Sentinel 2
 * imagery, prior to any contrast enhancement. This is intended for 
 * imagery focusing on the marine environment (i.e. the correction is
 * optimised for marine areas) and assumes that the image provided
 * has had sunglint correction and cloud masking applied prior to
 * the creation of a composite image. It is also optimised for areas with
 * some clear water and thus may not work that well in high turbidy areas.
 * 
 * This brightness normalisation is based on the applying a per channel
 * uniform offset calculated based on the brightness difference between
 * the composite image provided and a reference scene. The scene brightness
 * estimation process focuses on calculating the brightness offset only
 * from deep clear water areas of the scene. It is intended to normalise 
 * the brightness of the deep water areas of the imagery. It makes no
 * attempt to worry about how the brightness offset will affect land
 * areas or non-deep water parts of the image.
 * 
 * This processing was needed because it was discovered in version 0 of 
 * this dataset (https://eatlas.org.au/data/uuid/2932dc63-9c9b-465f-80bf-09073aacaf1c)
 * that some scenes were significantly darker than others resulting in
 * almost black scenes after contrast enhancement. Slight offset differences
 * in the brightness, due to water clarity, the set of images used and 
 * the spatial location of the scene, were greatly exaggerated by the 
 * strong contrast enhancement applied to the composite imagery.
 * 
 * This brightness normalisation does not consider land areas
 * in its adjustment and may not work at all for scenes without significant
 * deep water views. This algorithm has been optimised for use in the Coral
 * Sea where the water is clear. As such it may not work very well in scenes
 * where the water is very turbid. 
 * 
 * This function works by masking out land areas (based on bright B8 areas),
 * shallow areas (based on bright B4 areas), and medium depth areas to 
 * approx 8 - 10 m using B3. The remaining area is assumed to be clean
 * deep water. The 5th percentile image statistics of this area is then 
 * performed at 250 m resolution. The difference between the 5th percentile
 * of the image and the 5th percentile of a reference image (Flinders reef)
 * is then calculated for each channel from B1 - B4 then applied to the
 * image.
 * 
 * To make this function handle scenes with land areas, or limited open
 * water, the amount of brightness correction applied to the image is scaled
 * by the percentage area covered by the deep open water mask. An image
 * with no deep water has no offset applied. To encourage high levels of
 * compensation when the scene doesn't have a lot of open water in the scene
 * we calculate the correction weighting by the square root of the open
 * water percentage.
 * 
 * Note that this function does not consider clouds and thus is probably
 * only suitable for application on cloud free composite images. It is likely
 * that using it on images with clouds or prior to sunglint correction
 * would result in the significant errors in the pixel image statistics
 * of the target area resulting in noise in the brightness adjustment that
 * is larger than what we are trying to compensate for. i.e. it is likely
 * to make the image worse.
 * 
 * This function does not adjust for the angular banding that occurs in
 * Sentinel 2 imagery due to its striped sensor arrangement. 
 * 
 * @param {Image} composite - Composite image to apply the brightness offset
 *                            to.
 * @param {ee.Geometry} tileGeom - Geometry of the boundary of the composite 
 *                            image. Having this as a parameter is a bit of 
 *                            a hack as the function should be able to work
 *                            this out from the composite image. Unfortunately
 *                            my attempts failed. It is unclear whether this
 *                            is a bug in GEE or I was using the wrong approach.
 *                            The tileGeom is normally calculated from the
 *                            the original imageIds that make up the composite.
 */
exports.s2_composite_brightness_normalisation = function(composite, tileGeom) {
  // Our goal is to create a mask that focuses on deeper water areas.
  // We will then use these areas to estimate the brightness offsets
  // to apply to the image. The goal is to work out the brightness adjustment
  // needed between scenes. Since we stretch the contrast a lot in the final
  // images any slight changes in the image brightness lead to large changes
  // in the final contrast enhanced image. Here we are trying to work out
  // what the offset is for the given composite. We don't want this processing
  // to be affected by clouds, which is why we are using the cloud free
  // composite for the estimation. We also don't want it to be affected by 
  // land and shallow reef areas as we want to compare the current image
  // to a fixed water brightness. 
  
  // Try to mask off all the things in the image that are not clear open water.
  // Since we are applying fixed thresholds the actual brightness offset of
  // the image will affect this masking slightly, however the final calculation
  // will use a percentile to estimate the open dark water and so the inclusion
  // of a small amount of imperfectly masked areas shouldn't hopefully affect
  // the estimate too much.
  
  // Mask off shallow areas as these are typically very bright in all visible
  // channels and are not open water.
  // Shallow water areas ~5 m depth. This also masks off inshore very turbid
  // waters which is not detected by the mediumMask based on the green band (B3)
  // Parameter tuning history:
  // Cairns, Green Island, Tongue Reef (55KCB): Ideal: 220
  //   150: Reef tops to 5 m. Some slight scattered small artifacts. Some land
  //        masked (~ 50%). Large inshore area masked off.
  //   220: Reef tops to 4-5 m. Some slight scattered small artifacts (~50% of 150). 
  //        Some land masked (~ 40%).
  //   300: Reef tops to ~4 m. Some slight scattered small artifacts (~70% of 220)
  //        Masked inshore edge is much smaller (20% of 150).
  var shallowMask = composite.select('B4').gt(220);
  
  // Pick up slightly deeper areas than the red channel (B4)
  // This threshold was picked to minimise false positives.
  // Parameter tuning history:
  // Boot Reef (55LBK): 
  //   400: Onset of non-reefal (cloud) false positives
  //   600: About 50% of deep reef area not captured
  // Cairns, Green Island, Tongue Reef (55KCB): ideal: 600
  //   400: Too much of the inshore and midshelf areas is masked off 
  //        It is masked all the way to the reefs.
  //   600: Inshore areas masked off, reef masked to about 10 m.
  // Ashmore Reef (54LZP): ideal: ~ 400
  //   600: Reef tops to ~ 8 - 10 m + scattered poorly masked clouds
  //   400: Deeper coverage of reefs (~ 15 m) + scattered poorly masked clouds +
  //        some clear water on the inside of the barrier reef.
  
  var mediumMask = composite.select('B3').gt(600);
  
  // Land and very shallow areas. This threshold was trimmed high enough
  // so that the false positives due to unresolved noise from clouds does
  // not result in too many false positives.
  // Parameter tuning history:
  // Cairns, Green Island, Tongue Reef (55KCB): optimal: 450
  //   300: Tops of some reefs masked, with is OK. Significant cloud
  //        artifacts on right side of image (no OK).
  //   450: Some very light scattered offshore artifacts. Land well masked.
  //        Some shadowed mountain areas are unmasked.
  //   600: 1/5 the amount of offshore artifacts as 450. Some shadowed mountain
  //        areas are unmasked.
  //   900: More holes in mountain shadows. No offshore artifacts.
  // Boot Reef (55LBK) 
  // This area has less clear water, but no land
  //   300: Lots of scattered cloud artifacts and some reef tops (OK)
  //   450: Scattered cloud artifacts, about 5 times less than 300
  //   600: Very small number of cloud artifacts.
  // Ashmore Reef (54LZP)
  //   300: Some scattered cloud artifacts
  //   450: Very light scattered artifacts from poorly masked clouds
  //   600: Poorly masked clouds still visible
  var landMask = composite.select('B8').gt(450); 
  
  var overallMask = shallowMask.or(mediumMask).or(landMask).not();
  
  var maskedComposite = composite.updateMask(overallMask);
  
  var openWaterImage = maskedComposite.select(
  ['B1','B2','B3','B4']);
  
  // Use a low percentile to estimate the lower bound of
  // scene brightness. We use a percentile, rather than a pixel minimum
  // to reduce the noise in the scene brightness estimate.
  // Use 250 m resolution rather than native 10 m resolution to reduce
  // compuational load.
  var imgStats = openWaterImage.reduceRegion({
    reducer: ee.Reducer.percentile([5]),
    geometry: tileGeom,
    scale: 250,
    maxPixels: 1e8
  });

  // Use for investigating masking and offset performance
  //Map.addLayer(maskedComposite, 
  //{'bands':['B4', 'B3', 'B2'], 'min': 0, 'max': 1400, 'gamma': 1},
  //"masked Composite", true, 1);
  //print(imgStats);
  
  // Scale the amount of scene brightness adjustment based on the 
  // amount of deep water in the image. The brightness correction is
  // only calculated from deep clear water and so if the scene has
  // little water or is all land then the brightness correction 
  // estimate will be poor. We therefore weight the amount of correction
  // applied to the scene based on the percentage area of the
  // open water mask as a fraction of the image area.
  // The weighting uses a square root of the open water area percentage
  // so that the open water area percentage has to get quite low before
  // the brightness offset is significantly down weighted.
  var maskedPixelCount = maskedComposite.select('B1').reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: tileGeom,
    scale: 250,
    maxPixels: 1e8
  }).get('B1');

  var noMaskPixelCount = composite.select('B1').reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: tileGeom,
    scale: 250,
    maxPixels: 1e8
  }).get('B1');

  var percentMasked = ee.Number(maskedPixelCount).divide(noMaskPixelCount);
  var adjScalar = percentMasked.sqrt();
  // Adjust the brightness of each channel to match the statistics 
  // of a reference scene (Flinders Reef 55KFA) that gave a good 
  // scene brightness.
  // These offsets are linked to the contrast enhancement thresholds
  // in bake_s2_colour_grading. Changing the offsets here will
  // result in different black levels in each of the channels
  // which will result in a different colour balance of the 
  // images created from bake_s2_colour_grading.
  var adjB1 = composite.select(['B1']).subtract(
    ee.Image(ee.Number(imgStats.get('B1')).subtract(1174).multiply(adjScalar)));
  var adjB2 = composite.select(['B2']).subtract(
    ee.Image(ee.Number(imgStats.get('B2')).subtract(753).multiply(adjScalar)));
  var adjB3 = composite.select(['B3']).subtract(
    ee.Image(ee.Number(imgStats.get('B3')).subtract(338).multiply(adjScalar)));
  var adjB4 = composite.select(['B4']).subtract(
    ee.Image(ee.Number(imgStats.get('B4')).subtract(121).multiply(adjScalar)));
  
  var adjComposite = composite
      .addBands(adjB1,['B1'], true)
      .addBands(adjB2,['B2'], true)
      .addBands(adjB3,['B3'], true)
      .addBands(adjB4,['B4'], true);
  return(adjComposite);
};



/**
 * This function estimates a mask for the clouds and the shadows and adds
 * this as additional bands (highcloudmask, lowcloudmask and cloudmask).
 * 
 * This assumes that the img has the cloud probability setup from
 * COPERNICUS/S2_CLOUD_PROBABILITY, using get_s2_cloud_collection()
 * 
 * The mask includes the cloud areas, plus a mask to remove cloud shadows.
 * The shadows are estimated by projecting the cloud mask in the direction
 * opposite the angle to the sun.
 * 
 * The algorithm does not try to estimate the actual bounds of the shadows
 * based on the image, other than splitting the clouds into two categories.
 * 
 * This masking process assumes most small clouds are low and thus throw
 * short shadows. It assumes that large clouds are taller and throw
 * longer shadows. The height of the clouds is estimated based on the 
 * confidence in the cloud prediction level from COPERNICUS/S2_CLOUD_PROBABILITY,
 * where high probability corresponds to obvious large clouds and lower
 * probabilities pick up smaller clouds. The filtering of high clouds is
 * further refined by performing a erosion and dilation to remove all 
 * clouds smaller than 300 m.
 * 
 * @param {ee.Image} img - Sentinel 2 image to add the cloud masks to.
 * @return {ee.Image} Original image with extra bands highcloudmask, 
 *    lowcloudmask and cloudmask 
 */
exports.add_s2_cloud_shadow_mask = function(img) {
  // Treat the cloud shadow distance differently for low and high cloud.
  // High thick clouds can produce long shadows that can muck up the image.
  // There is no direct way to determine which clouds will throw long dark shadows
  // however it was found from experimentation that setting a high cloud
  // probability tended to pick out the thicker clouds that also through
  // long shadows. It is unclear how robust this approach is though.
  // Cloud probability threshold (%); values greater are considered cloud
  
  var low_cloud_mask = exports.get_s2_cloud_shadow_mask(img, 
    35,   // (cloud predication prob) Use low probability to pick up smaller
          // clouds. This threshold still misses a lot of small clouds. 
          // unfortunately lowering the threshold anymore results in sand cays
          // being detected as clouds.
          // Note that for the atolls on 06LUJ and 06LWH the cays and shallow
          // reefs are considered clouds to a high probability. Having a threshold
          // of 40 results in approx 80% of the atoll rim being masked as a cloud.
          // Raising the threshold to 60 still results in about 60% being masked
          // as cloud. A threshold of 80 still masks about 30% of the cay area.
          // Setting the threshold to 60 results in lots of small clouds remaining
          // in images. We therefore use a lower threshold to cover off on these
          // clouds, at the expense of making out from of the cays.
    0,    // (m) Erosion. Keep small clouds.
    0.4,  // (km) Use a longer cloud shadow
    150    // (m) buffer distance
  ).rename("lowcloudmask");

  
  // Try to detect high thick clouds. Assume that this throw a longer shadow.
  var high_cloud_mask = exports.get_s2_cloud_shadow_mask(img, 
    80,   // Use high cloud probability to pick up mainly larger solid clouds
    300,  // (m)  Erosion. Remove small clouds because we are trying to just detect
          //      the large clouds that will throw long shadows.
    1.5,  // (km) Use a longer cloud shadow
    300   // (m) buffer distance
  ).rename("highcloudmask"); 

  
  // Combine both masks
  var cloud_mask = high_cloud_mask.add(low_cloud_mask).gt(0).rename("cloudmask");
  //var cloud_mask = high_cloud_mask.gt(0).rename("cloudmask");
  //var cloud_mask = low_cloud_mask.gt(0).rename("cloudmask");
  
  return img.addBands(cloud_mask).addBands(high_cloud_mask).addBands(low_cloud_mask);
};

/**
 * This function creates a Sentinel 2 image collection with matching
 * cloud masks from the COPERNICUS/S2_CLOUD_PROBABILITY dataset
 * @author  Eric Lawrey
 * @param {String[]} image_ids - Array of image Ids such as 
 *      ["COPERNICUS/S2/20200820T005709_20200820T005711_T54LWQ",
 *      "COPERNICUS/S2/20200820T005709_20200820T005711_T54LXQ"]
 * @param {ee.Geometry} tiles_geometry - Outer geometry of the images 
 *      in the image_ids. This can be calculated from the get_tiles_geometry 
 *      function. We pass this in as a precalculated result to ensure that
 *      it only needs to be calculated once.
 * @return {ee.ImageCollection} Sentinel 2 image collection with cloud mask
 */
exports.get_s2_cloud_collection = function(image_ids, tiles_geometry) {

  // Create a collection from the specified image IDs. Note
  // we are assuming that these are Sentinel 2 images.
  var imageCollection = ee.ImageCollection(
    image_ids.map(function(id) {
      return ee.Image(id);
    }))
    // Preserve a copy of the system:index that is not modified
    // by the merging of image collections.
    .map(function(s2_img) {
      return s2_img.set('original_id', s2_img.get('system:index'));
    })
    // The masks for the 10m bands sometimes do not exclude bad data at
    // scene edges, so we apply masks from the 20m and 60m bands as well.
    // Example asset that needs this operation:
    // COPERNICUS/S2_CLOUD_PROBABILITY/20190301T000239_20190301T000238_T55GDP
    .map(function(s2_img) {
      return s2_img.updateMask(
        s2_img.select('B8A').mask().updateMask(s2_img.select('B9').mask()));
    });

  // Get the dataset containing high quality cloud masks. Use
  // this to mask off clouds from the composite. This masking
  // does not consider cloud shadows and so these can still
  // affect the final composite.
  var s2Clouds = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
    .filterBounds(tiles_geometry)
    // Preserve a copy of the system:index that is not modified
    // by the merging of image collections.
    .map(function(s2_img) {
      return s2_img.set('original_id', s2_img.get('system:index'));
    });
  
  // Join S2 SR with cloud probability dataset to add cloud mask.
  return ee.ImageCollection(ee.Join.saveFirst('s2cloudless').apply({
    primary: imageCollection,
    secondary: s2Clouds,
    condition:
      ee.Filter.equals({leftField: 'original_id', rightField: 'original_id'})
  }));
};

/**
 * Return the merged geometry of the listed Sentinel 2 image IDs.
 * @author  Eric Lawrey
 * @param {String[]} image_ids - Array of Sentinel 2 image IDs to find the 
 *       polygon bounds of.
 * @param {ee.Geometry.BBox} search_bbox -Bounding box to search for the image tiles
 *       This is used to limit the search size. A search size of Australia seems
 *       to be performat. Australia = ee.Geometry.BBox(109, -33, 158, -7)
 * @return {ee.Geometry} Polygon feature corresponding to the union of all 
 *       image tiles
 */
exports.get_s2_tiles_geometry = function(image_ids, search_bbox) {
  // Determine the set of UTM tiles that we have applied manual
  // selection of images. 
  // Convert:
  // "COPERNICUS/S2/20170812T003031_20170812T003034_T55KDV"
  // To:
  // "55KDV"
  var utmTiles = image_ids.map(function(id) {
    // Find the position of the characters just before the UTM
    // tile in the Sentinel-2 IDs. 
    var n = id.lastIndexOf("_T")+2;
    return id.substr(n);
  });
  
  // Remove duplicates in the tileIds. Typically our image collection
  // contains many images for the same tiles. We just want the unique
  // tile IDs so we can then look them up in s2Tiles dataset without
  // wasting time collating duplicate boundaries. 
  // Modified from 
  // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
  var seen = {};
  var uniqueUtmTiles = utmTiles.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
  
  // Used to find the geometry of the selected images. For more info checkout
  // https://eatlas.org.au/data/uuid/f7468d15-12be-4e3f-a246-b2882a324f59
  var s2Tiles = ee.FeatureCollection("users/ericlawrey/World_ESA_Sentinel-2-tiling-grid");
  
  // Find the feature that corresponds to the specified tileID.
  // Filter to the search region. This is to reduce the number of tiles that need 
  // to be searched (maybe).
  var searchTiles = s2Tiles.filterBounds(search_bbox);
  var tileFeatures = searchTiles.filter(ee.Filter.inList('Name', uniqueUtmTiles));

  // Merge all the features together
  return tileFeatures.geometry(0.1);
};

/**
 * This function estimates the sunglint from the B8 and B11 Sentinel channels.
 * This estimate is then subtracted from the visible colour bands to
 * create a new image. 
 * This function has the artifact that the edges of clouds become very dark.
 * This is because clouds are bright in the B8 channel and thus result in
 * a large subtraction from the ocean areas at the edge of the cloud making
 * it black. In the fully clouded area the value of the compensation is
 * clipped resulting in white clouds.
 * @param {ee.Image} image - Sentinel 2 image. Channels scaled from 0 - 1.
 * @param {float} landAtmosOffset - Atmospheric compensation for land areas.
 *    Constant offset to apply over land areas in image. Typical values
 *    0.02 - 0.04.
 * @return {ee.Image} RGB image based on bands B2 - B4 with sunglint
 *    removal based on B8.
 */ 
exports.removeSunGlint = function(image) {
  
  // Sun Glint Correction
  // Previously I had used the the near-infra red B8 channel for sun glint removal.
  // It has a brightness response very similar to the visible channels, is the same
  // resolution, but doesn't penetrate the water much.
  //
  // Unfortunately in very shallow areas B8 slightly penetrates the water enough
  // that it picks up the subtrate, making it much brighter than for open water.  
  // When we use B8 to perform a sunglint correction we substract B8 from the visible 
  // colour bands. In these very shallow areas B8 picks up the bottom resulting 
  // in a very strong correction being applied, causing them to become unnaturally dark.
  
  // The SWIR channel B11 has similar sun glint correction characteristics, but is only
  // 20 m in resolution and so it is not preferred to apply over deeper waters, where B8
  // is preferred due to its 10 m resolution.
  //
  // B11 does not penetrate the water very far at all and so it is a much better channel
  // to use in very shallow waters than B8. We therefore use B11 to find areas that are
  // very shallow, so that we can tone down the B8 correction in these areas. 
  // In open water areas we don't want any correction to be applied as the 20 m pixel
  // size from B11 will introduce noise into the image, we therefore want this correction
  // to be entirely black (0) for open water. For this reason we subtract a small amount
  // from the B8, B11 difference.
  // We then subtract this correction factor to the B8 channel so that we should have
  // the normal B8 sunglint correction with toned down correction in very shallow areas.
  var shallowCorrectImg = image.expression('(B8-B11)-200', {
    'B11':image.select('B11'),
    'B8' :image.select('B8')
  }).clamp(0,10000);
  var rawSunGlint = image.select('B8').subtract(shallowCorrectImg);
  
  // We don't want to apply sunglint correction to land areas. The B8 channel is very bright
  // for land areas, much brighter than the visible channels (B2, B3, B4) and so simply 
  // subtracting B8, even with the B11 correction will result in land areas appearing black.
  // We therefore need to roll off and limit the correction applied to land areas.
  // Land areas do need some correction (lowering of brightness) to match the brightness
  // of the corrected sea areas. The land areas need atmospheric correction to be apply.
  // Since we are using Top of Atmosphere imagery the land areas are brighter due to atmospheric
  // haze. Proper correction of this haze is difficult as it requires estimating atmospheric
  // parameters that are not directly measured in the satellite imagery.
  // A poor mans atmospheric correction is to find the darkest pixels (deep shadows) in the scene 
  // and assume that they should be black. We then subtract an amount necessary to make them black
  // across the entire scene.
  // This method is only effective if the scene has some naturally black areas in the image.
  // Since we are focusing on marine imagery, where the image might consist of only open water
  // with some reefs, there is no guarantee that any of the pixels should be black.
  // For this reason we can't use the poor mans atmospheric correction.
  //
  // Since our focus is on making good imagery for marine areas we don't care so much about
  // land areas. Therefore we apply an even poorers version of atmospheric correction, simply
  // subtract a constant offset from the land areas so that the land and sea are approximately
  // the same brightness on average. This will result in some individual scenes having too much
  // atmospheric correction (because it was a non hazy day), leading to darker land areas than
  // ideal. In other days this will result in too little correction being applied leading to 
  // land areas appearing brighter than the surrounding marine area.
  // Since the final composite image is made up from multiple images, these errors should
  // average out somewhat. 
  // To further refine the land atmospheric correction we allow manual control over the 
  // land atmospheric offset. 

  var LAND_THRES = 600;    // Linear up to this threshold (sunglint correction)
                            // Sunglint in very reflective scenes can reach 900 however
                            // Setting the threshold that high results in an overlap in
                            // close in land areas and shadow areas on land, leading them
                            // to receive too much correction, resulting in them coming out
                            // black.
                            // A threshold of 700 provides a compromise of removing sunglint
                            // in most scenes, but not affecting the land sea boundary too
                            // much. 
                            // Setting this threshold on an image by image process would be
                            // optimal, but not implemented. 
 var LAND_ATMOS_OFFSET = 280; // Offset to apply to the land areas to compensate for 
                            // atmospheric haze. This is a very poor mans correction
                            // because it is constant over all time and space. 
                            // Some images will be darker than ideal and some will
                            // be lighter. 
 
  // Linear ramp up to  LAND_THRES, set anything above this to the
  // fixed atmospheric threshold we want to apply to land areas (LAND_ATMOS_OFFSET).
  //            ^ LAND_THRES **
  //            |          ** *  
  //            |        **   *
  // rawSunGlint|      **     *******  LAND_ATMOS_OFFSET
  //            |    **
  //            |  **
  //            ------------------> B8 
  
  var b8 = image.select('B8');

  // Determin the land sea boundary using the B8 channel rather than the 
  // combined B8 + B11 rawSunGlint variable. Using the rawSunGlint it was
  // found that mangrove areas tended to be treated as water and thus
  // end up being black. Switching to B8 fixed this problem. Presumably
  // mangroves are much brighter on B8 than in B11.
  var sunglintCorr = rawSunGlint.where(b8.gt(LAND_THRES),LAND_ATMOS_OFFSET);
  
  // B5 sunglint correction. 
  // We use B5 for generating the shallow image style and for estimating the
  // DryReefs. Without applying any sunglint correction this process picks up
  // sunglint and waves in B5 making the results noiser than ideal. 
  
  // B11 appears to be less sensitive to surface water spray then B5 and so breaking waves are 
  // dimmer in B11. This is good as it means that B5-B11 doesn't result in B11 removing the
  // breaking waves from B5. 
  // The sensitivity of B11 and B5 to clouds is similar and so B5-B11 removes much of the clouds
  // from the image. The edges of clouds are reasonably corrected and solid cloud areas turn black.

  // Don't apply sunglint to the land areas. Breaking waves have a brightness of up to 1000,
  // While mangroves have a brightness of as low as 730 and so we have an overlap that makes
  // it impossible to separate land and water perfectly. We want to preference correct
  // sunglint correction in water areas and so we must set it high enough so as to not
  // interfer.
  var B11 = image.select('B11');
  var B5correction = B11;
  var LOWER_THRES = 800;          // Cap the correction at this level (mangrove areas)
  var HIGHER_THRES = 1000;        // Above this consider areas to be land
  var ATMOS_CORRECTION = 600;     // Correction to apply to land areas
  // Cap the correction for the cross over from ocean to land
  B5correction = B5correction.where(B11.gt(LOWER_THRES),LOWER_THRES);
  
  // Above the the upper threshold we are confident that this part of the image is land
  // and thus we should be applying a fixed atmospheric correction so that the brightness
  // of the resulting image is consistent (i.e. there are no sudden jumps in brightness at
  // the land and sea boundary)
  B5correction = B5correction.where(B11.gt(HIGHER_THRES), ATMOS_CORRECTION);
  
  // The final B5 corrected image has a poor tonal inconsistancy for mangrove areas, with some
  // areas of the mangroves appearing significantly darker than they should. In breaking
  // waves on Hearld reef the threshold being slightly below the maximum breaking wave brightness
  // doesn't result in much disturbance of the image and so these values seem like a 
  // reasonable compromise.


  // Apply the sunglint and land atmospheric correction to the visible
  // channels.
  // Note: Each of the channels has a slight difference in sensitivity in the
  // correction. We therefore scale the correction differently for each band.
  // If we apply a scalar of 1.0 to B2 instead of 0.7 then strong areas of
  // sunglint get overcorrected resulting in patches that are darker
  // then their surrounding areas. This also appears to accentuate the
  // banding caused by the multiple sensor pickup of the satellite, possibly
  // due to the slight angle different with the sun.
  // The scale factors were manually optimised by finding clean images that
  // had patches of sunglint that were overcorrected. The scalar was then
  // adjusted so that the glint patches blended into surrounding waters.
  // Reference images used for this parameterisation:
  // For B2 0.75 seems to balance the sunglint, and level of the banding.
  // COPERNICUS/S2/20181005T001109_20181005T001104_T56KLF (Lihou Reef Coral Sea)
  //
  // On this reef the B2 sunglint correction seems too low at 0.75
  // COPERNICUS/S2/20180212T001111_20180212T001105_T56KME (Marion Reef Coral Sea)
  
  var  sunGlintComposite =  image
    .addBands(image.select('B1').subtract(sunglintCorr.multiply(0.75)),['B1'], true)
    .addBands(image.select('B2').subtract(sunglintCorr.multiply(0.75)),['B2'], true)
    .addBands(image.select('B3').subtract(sunglintCorr.multiply(0.9)),['B3'], true)
    .addBands(image.select('B4').subtract(sunglintCorr.multiply(1)),['B4'], true)
    .addBands(image.select('B5').subtract(B5correction),['B5'], true);

  return(sunGlintComposite);
};

/**
 * This function is deprecated in preference of 'removeSunGlint()'.
 * This function estimates the sunglint from the B8 Sentinel channel.
 * This estimate is then subtracted from the visible colour bands to
 * create a new image. The compensation only works for images with
 * light sunglint.
 * The removeSunGlint function is an improvement on this function.
 * This function has the artifact that the edges of clouds become very dark.
 * This is because clouds are bright in the B8 channel and thus result in
 * a large subtraction from the ocean areas at the edge of the cloud making
 * it black. In the fully clouded area the value of the compensation is
 * clipped resulting in white clouds.
 * @param {ee.Image} img - Sentinel 2 image
 * @return {ee.Image} RGB image based on bands B2 - B4 with sunglint
 *    removal based on B8.
 */ 
exports.removeSunGlintB8 = function(img) {
  
  // The brightness fluctuation of the waves and the sun glint
  // in B8 matches the same in B2, B3 and B4. Unfortunately
  // B8 is very bright for clouds and land and so these become
  // black if B8 is simply subtracted from these channels. We therefore
  // need to only apply the compensation when the brightness is not too
  // much. Cloud are assumed to be masked out in a separate process
  // and so we focus here on the transition from land to sea.
  
  var B8 = img.select('B8');
  var B4 = img.select('B4');
  var B3 = img.select('B3');
  var B2 = img.select('B2');
  

  // Provide linear compensation up to a moderate amount of sun glint.
  // Above this level clip the amount we subtract so that land areas
  // don't turn black. At high levels of B8 we can be pretty sure that
  // we have land pixels and so reduce the amount that we subtract so that
  // the contrast on the land does not get too high.
  // We still subtract a small amount even from land areas to compensate 
  // of haze in the atmosphere making dark areas brighter.
  
  // The limitations of this algorithm are that:
  // 1. land areas with deep shadows such as on the side of mountains or 
  // cliffs have very low B8 brightness and so are considered water and 
  // thus receive the full subtraction of the B8 channel from the other 
  // colours making them black. 
  // 2. At low tides some reef flats have bright B8 channels resulting
  // resulting in them being treated as land, resulting in less sun glint
  // compensation. This leads to an artifical step in brightness across
  // across the reef flat.
  // 3. When the sun glint is strong the brightness of the water, overlaps
  // in values with the brightness of the land and so the algorithm can not
  // be used. Essentially images with a high sunglint should not be used.
  // Calculate the amount of sunglint removal to apply. By default
  // for areas where the sunglint is low (B8 < 200) then keep this as-is.
  // For areas between 200 - 300, cap the amount to remove at 200. At this
  // brightness for B8 we can't distinguish between very shallow water (< 0.5 m)
  // and high levels of sunglint. We therefore choose this threshold as
  // the maximum level of compensation that we can apply to the image.
  // In areas where there is high sunglint this limitation will make the
  // image unusable.
  
  // Deep cloud shadows have a B8 value lower than the surrounding water
  // due to being in a shadow. However the linearity of the sunglint
  // compensation seems to slightly break down in these conditions.
  // The visible channels seem to be darkened slightly more than the
  // B8 channel and so the compensation in these areas results in
  // very dark areas. This dark cloud shadows can then mess up subsequent
  // processing. Additionally these large dark shadows seem to be associated
  // with high clouds that not easy to mask out automatically, as the shadows
  // are quite separated from the clouds. These clouds have B8 values in
  // the order of 180 - 240 for high sunglint scene and 100 - 115 for a
  // low sunglint scene.
  //var TRANSITION_THRES = 450;
  //var TRANSITION_THRES = 800;
  //var PEAK_THRES = 1000;
  var THRES = 800;
  var TRANSITION_THRES = 1000;
  var PEAK_THRES = 1200;
  var B8new = B8.where(B8.gt(THRES), 
    B8.subtract(THRES).divide(2).add(THRES));

  // This threshold is intended to help with the transition from very shallow
  // areas to land. We want land areas to have less compensation for sunglint,
  // because it makes no sense to apply it to land.
  B8new = B8new.where(B8.gt(TRANSITION_THRES), ee.Image((TRANSITION_THRES-THRES)/2+THRES));
  
  B8new = B8new.where(B8.gt(PEAK_THRES), ee.Image(300));
  
  // For really bright areas this probably corresponds to land, so don't
  // try to remove sunglint. i.e. we only subtract 100 from the image,
  // which acts as a slight haze removal and reduces the transition gradient
  // between the land and the ocean making the blending less severe. 
  // If we let B8 go through for land areas, unclipped then the very high B8
  // brightness on land results in black land areas after the B8 has been
  // subtracted from the other colour bands.
  //B8new = B8new.where(B8.gt(500), ee.Image(150));
  //B8new = B8new.where(B8.gt(800), ee.Image(400));
  //B8new = B8new.where(B8.gt(1200), ee.Image(350));
  //B8new = B8new.where(B8.gt(1800), ee.Image(300));

  // The remaining sunglint is brighter in the red band so increase the
  // compensation in the red band, to achieve a more pleasing image.
  return img.addBands(B4.subtract(B8new.multiply(1.15)),['B4'],true)
    .addBands(B3.subtract(B8new),['B3'], true)
    .addBands(B2.subtract(B8new),['B2'], true);
};


/**
 * Estimate the cloud and shadow mask for a given image. This uses the following
 * algorithm:
 * 1. Estimate the dark pixels corresponding to cloud shadow pixels using a 
 *    threshold on the B8 channel. Note that this only works on land. On water
 *    this algorithm treats all water as a shadow.
 * 2. Calculate the angle of the shadows using the MEAN_SOLAR_AZIMUTH_ANGLE
 * 3. Create a cloud mask based on a probability threshold (cloud_prob_thresh) to 
 *    apply to the COPERNICUS/S2_CLOUD_PROBABILITY data.
 * 4. Apply a erosion and dilation (negative then positive buffer) to the 
 *    cloud mask. This removes all cloud features smaller than the
 *    erosion distance.
 * 5. Project this cloud mask along the line of the shadow for a distance specified
 *    by cloud_proj_dist. The shadows of low clouds will only need a short
 *    project distance (~ 0.4 km), where as high clouds throw longer shadows (~ 1 - 2 km).
 * 6. Multiply the dark pixels by the projected cloud shadow. On land this will crop
 *    the mask to just the cloud shadow. On water this will retain the whole cloud
 *    mask and cloud projection as all the water are considered dark pixels.
 * 7. Add the shadow and cloud masks together to get a complete mask. This will
 *    ensure a full mask on land, and will have no effect on water areas as the 
 *    shadow mask already includes the clouded areas.
 * 8. Apply a buffer to the mask to expand the area masked out. This is to 
 *    slightly overcome the imperfect nature of the cloud masks.
 * This assumes that the images were produced by get_s2_cloud_collection() and
 * that the cloud probability layer has been associated with the image.
 * @param {ee.Image} img - Sentinel 2 image to add the cloud mask to. Assumes that
 *    the the COPERNICUS/S2_CLOUD_PROBABILITY dataset has been merged with
 *    image from the get_s2_cloud_collection(). In this case the probability
 *    band in the image stored under the s2cloudless property is used.
 * @param {Number} cloud_prob_thresh - (0-100) probability threshold to 
 *    apply to the COPERNICUS/S2_CLOUD_PROBABILITY layer to create the
 *    cloud mask. This basic mask is then has the erosion apply to it,
 *    is projected along the shadow and a final buffer applied.
 * @param {Number} erosion - (m) erosion applied to the initial cloud mask
 *    prior to creating the cloud shadow project. This can be used to remove
 *    small cloud features. A dilation (buffer) is applied after the erosion to
 *    bring the cloud mask features back to their original size (except those
 *    that were too small and thus disappeared) prior to shadow projection.
 *    This dilation has the same distance as the erosion.
 * @param {Number} cloud_proj_dist - (m) distance to project the cloud mask
 *    in the direction of shadows. 
 * @param {Number} buffer - (m) Final buffer to apply to the shadow projected
 *    cloud mask. This expands the mask in all directions and can be used to 
 *    catch more of the neighbouring cloud areas just outside the cloud
 *    masking.
 */
exports.get_s2_cloud_shadow_mask = function(img, cloud_prob_thresh, erosion, cloud_proj_dist, buffer) {
  var SR_BAND_SCALE = 1e4;    // Sentinel2 channels are 0 - 10000.
  var NIR_DRK_THRESH = 0.15;  // Near-infrared reflectance; values less than are
                              // considered potential cloud shadow. This threshold was
                              // chosen to detect cloud shadows on land areas where
                              // the B8 channel is consistently bright (except in shadows).
                              // All water areas are considered dark by this threshold.
  
  // Determine the dark areas on land. This doesn't work on water because all 
  // water appears too dark. As such the simple dark pixels approach only refines
  // the masking of shadows on land areas. In the water it is determined by the 
  // the cloud_proj_dist.
  var dark_pixels = img.select('B8').lt(NIR_DRK_THRESH*SR_BAND_SCALE).rename('dark_pixels');
  
  // Determine the direction to project cloud shadow from clouds (assumes UTM projection).
  var shadow_azimuth = ee.Number(90).subtract(ee.Number(img.get('MEAN_SOLAR_AZIMUTH_ANGLE')));
  
  // Condition s2cloudless by the probability threshold value.
  var is_cloud = ee.Image(img.get('s2cloudless')).select('probability')
    .gt(cloud_prob_thresh).rename('allclouds');
  
  var is_cloud_erosion_dilation;
  
  // Save on computations if no erosion is needed.
  if (erosion > 0) {
    // Make sure the erosion and dilation filters don't get too large as this
    // will become too computationally expensive.
    // We want the filter size to be approximately 4 pixels in size so that
    // the calculations are smooth enough, but the computations are not too
    // expensive.
    // We also have a lower resultion limit of 20 m to save on computations
    // for full image exports.
    // Find the scale that would give us approximately a 4 pixel filter or
    // our lower resolution limit.
    var APPROX_EROSION_PIXELS = 4;   // pixels
    // Find the resolution of the filter rounded to the nearest 10 m (Sentinel 2 resolultion)
    // Make sure that it isn't smaller than 20 m
    var erosion_scale = Math.max(Math.round(erosion/APPROX_EROSION_PIXELS/10)*10,20);

    //print("Erosion scale: "+erosion_scale)
    
    // Operate at a erosion_scale m pixel scale. The focal_min and focal_max operators require
    // units of pixels and adjust the erosion variable from m to pixels
    is_cloud_erosion_dilation = (is_cloud.focal_min(erosion/erosion_scale).focal_max(erosion/erosion_scale)
        .reproject({crs: img.select([0]).projection(), scale: erosion_scale})
        .rename('cloudmask'));
  } else {
    is_cloud_erosion_dilation = is_cloud;
  }
  
  // Project shadows from clouds for the distance specified by the cloud_proj_dist input.
  // We use a scale of 100 m to reduce the computations. This results is pixelated
  // results, however the buffer stage smooths this out.
  var cloud_proj = (is_cloud_erosion_dilation
        .directionalDistanceTransform(shadow_azimuth, cloud_proj_dist*10)
        .reproject({crs: img.select(0).projection(), scale: 100})
        .select('distance')
        .mask()
        .rename('cloud_transform'));

  // Identify the intersection of dark pixels with cloud shadow projection.
  var shadows = cloud_proj.multiply(dark_pixels).rename('shadows');
  
  // Add the cloud mask to the shadows. On water the clouds are already
  // masked off because all the water pixels are considered shadows due to
  // the limited shadow detection algorith. For land areas the shadows
  // don't include the cloud mask.
  //var is_cloud_or_shadow = is_cloud.add(shadows).gt(0);
  var is_cloud_or_shadow = cloud_proj;
  
  var APPROX_BUFFER_PIXELS = 4;   // pixels
    // Find the resolution of the filter rounded to the nearest 10 m (Sentinel 2 resolultion)
    // Make sure that it isn't smaller than 20 m
  var buffer_scale = Math.max(Math.round(buffer/APPROX_BUFFER_PIXELS/10)*10,20);
  
  //print("Buffer scale: "+buffer_scale)
  // Remove small cloud-shadow patches and dilate remaining pixels by BUFFER input.
  // 20 m scale is for speed, and assumes clouds don't require 10 m precision.
  // Removing the small patches also reduces the false positive rate on
  // beaches significantly.
  var buffered_cloud_or_shadow = (is_cloud_or_shadow.focal_max(buffer/buffer_scale)
        .reproject({crs: img.select([0]).projection(), scale: buffer_scale})
        .rename('cloudmask'));
  return buffered_cloud_or_shadow;
  
};


/**
 * Applies a contrast enhancement to the image, limiting the image
 * between the min and max and applying a gamma correction. This 
 * enhancement is suitable for stretching out the dark tones in deep water.
 */
exports.contrastEnhance = function(image, min, max, gamma) {
  return image.subtract(min).divide(max-min).clamp(0,1).pow(1/gamma);
};

/**
 * Apply the cloud mask to each of the image bands. This should be
 * done prior to reducing all the images using median or percentile.
 */
exports.apply_cloud_shadow_mask = function(img) {
    // Subset the cloudmask band and invert it so clouds/shadow are 0, else 1.
    var not_cld_shdw = img.select('cloudmask').not();

    var masked_img = img.select('B.*').updateMask(not_cld_shdw);
    // Get remaining QA bands
    var QA_img = img.select('QA.*');
	
    // Subset reflectance bands and update their masks, return the result.
    return masked_img.addBands(QA_img).addBands(img.select('cloudmask'));
};

/**
 * Bakes in the colour grading of the image so it is ready for exporting.
 * This rescales the data from 0 - 1.
 * @param {ee.Image} img - image to colour grade
 * @param {string} colourGradeStyle - 
 *      'TrueColour'  - Relatively faithful true colour reproduction (note: sunglint remove 
 *                      does introduce some small issues at the water land boundary)
 *      'DeepMarine'  - Focus on deeper marine features.
 *      'DeepFalse'   - False colour image from Ultra violet (B1), Blue (B2) and Green that shows
 *                      deep marine features well in clear waters.
 *      'DeepFeature' - High contrast difference between green and blue bands for detecting deep seagrass.
 *                      Grey scale image. This style has not been well tested or tuned.
 *      'Shallow'     - False colour image that highlights shallow areas. This is useful
 *                      for determining islands and cays, along with dry exposed reef areas.
 *                      It is determined B5, B8 and B11.
 *      'ReefTop'     - This is a grey scale image with a threshold that is applied to the
 *                      red channel (B4) to approximate reef top areas (~5 m depth) in 
 *                      clear oceananic water. This is close to a binary mask, but has a
 *                      small smooth grey scale transition to help with smooth digitisation.
 *                      This reef top masking has a 10 m radius circular spatial filter applied to
 *                      the image to reduce the noise. The threshold chosen was intended to be close
 *                      to the deepest features visible in red, as this will naturally be close to
 *                      a 6 m depth. The threshold was raised above the noise floor to reduce false
 *                      positives. This threshold was chosen to not have too many false positive 
 *                      in the coral sea, where waves contribute significant noise into the red channel.
 *      'B3ReefBoundary' - This corresponds to a grey scale high contrast (almost binary) image
 *                      with a threshold chosen to match reef boundaries. This threshold was derived
 *                      from the B3 channel.
 *                      This provides a proxy for approximately 20 - 25 m depth in clear water, 
 *                      and is a useful reference in determining reef boundaries, particularly 
 *                      determining sand areas that should be included in the reef boundary. 
 *                      The threshold was chosen to be close to as deep as possible in this channel, 
 *                      without introducing too many false positives due to wave and cloud noise. 
 *                      The threshold was tweaked to approximately match reef boundaries on the GBR.
 *      'B2ReefBoundary' - This corresponds to a grey scale high contrast (almost binary) image
 *                      with a threshold chosen to match reef boundaries. This threshold was derived
 *                      from the B2 channel. 
 *      'Slope' -       This calculates the slope based on the change in the brightness of the imagery.
 *                      In clear water, with a uniform sea bed substrate the brightness is
 *                      can be used to approximate the depth and thus a change in brightness
 *                      represents a change in depth. Steep sloped areas typically correspond to
 *                      the boundaries of marine features. This is based on B2, B3, B4
 *      'SlopeFalse' -  Same as slope but based on B1, B2, B3
 * @param {Boolean} processCloudMask - If true then copy over the cloudMask band.
 *            This is a slight hack because I couldn't work out how to perform
 *            conditional GEE server side execution, and cloning the original
 *            image to include channels other than B2, B3 and B4, followed by 
 *            applying the contrast enhancement didn't seem to work.
 */
exports.bake_s2_colour_grading = function(img, colourGradeStyle, processCloudMask) {
  var compositeContrast;
  var scaled_img = img.divide(1e4);
  // Consider anything brighter than this as land. This threshold is chosen slightly higher than
  // the sunglint correction LAND THRESHOLD and we want to ensure that it is dry land and not simply
  // shallow. The aim here is to ensure that the reef feature overlaps with the land by a small amount 
  // to allow better cookie cutting the land out in later processing. Unfortunately it is impossible
  // to reach the high water mark using B8 since most of the imagery is at a mid tide level. 
  // Setting the threshold high enough to get close to the high water mark results in lots of 
  // land areas being considered as water because they are darker than the threshold.
  var B8LANDMASK_THRESHOLD = 1800; 
  
  // This threshold was adjusted to best align with the Geoscience Australia Geodata Coast100k 2004
  // dataset in locations along the Queensland coastline, and Sharkbay (WA).
  // The optimal theshold was determined against multiple tiles around Australia by 
  // adjusting the B8 threshold so that it best matched the coastline visible in the 
  // Allen Coral Atlas satellite imagery.
  // In most scenes it was difficult to get a high tide mark from the B8 imagery, as the 
  // imagery is typically close to mean tide and so the high tide mark is not underwater and
  // this part of the B8 gradient. 
  // Some of the tiles were clearly a collection of lower tide images making the maximum
  // tide mask using B8 more like a mean or slightly low tide. Raising the threshold higher
  // simply resulted in lots of holes on the land area (dark patches on the land that
  // are darker than the water threshold). 
  // Threshold tested:
  // 800 - This consistantly included shallow foreshore elements in the boundary making the
  //       boundary closer to mean low tide. This detects breaking waves quite well.
  // tile,  location,     8bit-value, original-value,   note 
  // 49JGW, Sharkbay,     155 - 160,  1750,             This is still not high enough. Imagery is too low tide.
  // 49KGR, Ningaloo,     155 - 160,  1750,             Sharp gradient. Still picks some breaking waves.
  // 50KPC, Port Headland,140 - 145,  1330,             The port is very dark and the mangroves are just 
  //                                                    detected at this threshold. 
  // 53LPE, Groote Island,155 - 160,  1750,             This is still not high enough. There is significant
  //                                                    cut out of the land at this level.
  // 54LYM, GBR,          155 - 160,  1750,             Not high enough. Imagery too shallow. 
  // 54LXP, Torres Strait,150 - 155,  1600,             Good fit.
  // 55KCB, Cairns,       150 - 155,  1600,             Good fit.
  // A threshold of 1600 provides a good match for some scenes. In other scenes this is
  // not high enough. However the problem with these scenes is that the source imagery is not
  // a high enough tide and thus B8 doesn't work very well. 
  // Improving the land making will require careful selection of images that are high tide images.
  // This can be an improvement for the future.
  var B8LAND_THRESHOLD = 1600; 
  
  var B4contrast;
  var B3contrast;
  var B2contrast;
  var B1contrast;
  var B4Filtered;
  var B3Filtered;
  var filtered;
  var exportProjection;
  var projectedComposite;
  var waterMask;
  if (colourGradeStyle === 'TrueColour') {
    B4contrast = exports.contrastEnhance(scaled_img.select('B4'),0.013,0.3, 2.2);
    B3contrast = exports.contrastEnhance(scaled_img.select('B3'),0.025,0.31, 2.2);
    B2contrast = exports.contrastEnhance(scaled_img.select('B2'),0.045,0.33, 2.2);
    compositeContrast = ee.Image.rgb(B4contrast, B3contrast, B2contrast);
  } else if (colourGradeStyle === 'DeepMarine') {
    // De-emphasise B4 compared to B3 and B2 because B4 only contains information
    // about shallow features, and is heavily affected by waves, since these
    // are not fully corrected by sunglint removal.
    B4contrast = exports.contrastEnhance(scaled_img.select('B4'),0.013,0.2, 2.2);
    B3contrast = exports.contrastEnhance(scaled_img.select('B3'),0.033,0.12, 2.5);
    B2contrast = exports.contrastEnhance(scaled_img.select('B2'),0.07,0.13, 2.5); //0.067
    compositeContrast = ee.Image.rgb(B4contrast, B3contrast, B2contrast);
  } else if (colourGradeStyle === 'DeepFalsePreview') {
    // This is a slightly brighter version designed for 01-select-sentinel2-images
    // The normal DeepFalse produces some particularly dark scenes when the water
    // is not clear. In the full processing workflow this darkness is compensated
    // for by the brightness normalisation step. However for the image selection
    // process we want to minimise the process time to make the preview images
    // fast to render. As such we make the DeepFalsePreview just a bit brighter.

    B3contrast = exports.contrastEnhance(scaled_img.select('B3'),0.033,0.235, 2.3);
    B2contrast = exports.contrastEnhance(scaled_img.select('B2'),0.067,0.235, 2.7);
    B1contrast = exports.contrastEnhance(scaled_img.select('B1'),0.101,0.237, 2.7); 
    compositeContrast = ee.Image.rgb(B3contrast, B2contrast, B1contrast);

  } else if (colourGradeStyle === 'DeepFalse') {
    
    // Thresholds from Version 0 of the dataset
    // https://eatlas.org.au/data/uuid/2932dc63-9c9b-465f-80bf-09073aacaf1c
    //B3contrast = exports.contrastEnhance(scaled_img.select('B3'),0.034,0.175, 2.5);
    //B2contrast = exports.contrastEnhance(scaled_img.select('B2'),0.071,0.175, 2.5);
    //B1contrast = exports.contrastEnhance(scaled_img.select('B1'),0.103,0.177, 2.5); 
    
    // Thresholds from Version 1
    // Tuned to provide more contrast when combined with the brightness normalisation
    // Upper limit also increased to reduce the clipping on bright areas. This
    // doesn't change the contrast much because we are applying a strong nonlinear
    // gamma correction to the image (i.e. values near the minimum are stretched,
    // values near the maximum are compressed.)
    B3contrast = exports.contrastEnhance(scaled_img.select('B3'),0.033,0.235, 2.3);
    B2contrast = exports.contrastEnhance(scaled_img.select('B2'),0.0721,0.235, 2.7);
    B1contrast = exports.contrastEnhance(scaled_img.select('B1'),0.1075,0.237, 2.7); 
    compositeContrast = ee.Image.rgb(B3contrast, B2contrast, B1contrast);

  } else if (colourGradeStyle === 'DryReef') {
    
    // The B5 channel has a resolution of 20 m, which once turned to polygons results
    // in 20 m steps in the polygons. Once polygon simplification is applied, to remove
    // the raster stair case, it results in poor representation of features smaller than 
    // 40 m in size. By applying a spatial filter we can interpolate B5 to 10 m resolution
    // so that there is less loss in the polygon conversion process.
    // This process is important because the DryReef areas are often long and thin (often 20 - 40 m
    // in width).
    filtered = scaled_img.select('B5').focal_mean(
      {kernel: ee.Kernel.circle({radius: 20, units: 'meters'}), iterations: 1}
    );

    // To help exclude noise generated by waves or sunglint we use a mask created from the
    // green channel. B3 has good sunglint (and thus wave noise) removal, due to the tight
    // time alignment with B8 channel. 
    
    // This is intended to detect very shallow areas that are likely to become dry during
    // very low tides. These act as a proxy for locations that will have no significant
    // live coral (because of the exposure). We use B5 instead of B4 or the Depth estimate because
    // B5 penetrates into the water less than B4, (something like 3 - 5 m) and so is guaranteed 
    // not to pick up deeper areas. A comparison showed that it was far more accurate than the
    // B3/B2 depth estimate. 
    // 0.026 - This detects an area that is too large, picking up areas that clearly have 
    //         live coral, i.e. they don't get exposed. Based on South Warden Reef (55LBE)
    // 0.031 - This theshold was chosen so that the known exposed extent of Green Island (55KCB)
    compositeContrast = filtered.gt(0.031);
    
    waterMask = img.select('B8').lt(B8LANDMASK_THRESHOLD);
    
    // Mask out any land areas because the depth estimates would 
    compositeContrast = compositeContrast.updateMask(waterMask);
    

  } else if (colourGradeStyle === 'Breaking') {
    // The development of this style is incomplete. It currently has some holes in the land
    // Detect breaking waves. This is not a super reliable method as it will also
    // detect land areas and is dependent on the selection of images in the analysis.
    // It detect and shallow or dry area.
    // It tends to provide patchy detection of breaking waves.
    
    
    // The B5 channel has a resolution of 20 m, which once turned to polygons results
    // in 20 m steps in the polygons. Once polygon simplification is applied, to remove
    // the raster stair case, it results in poor representation of features smaller than 
    // 40 m in size. By applying a spatial filter we can interpolate B5 to 10 m resolution
    // so that there is less loss in the polygon conversion process.
    // This process is important because the DryReef areas are often long and thin (often 20 - 40 m
    // in width)

    filtered = scaled_img.select('B5')
      .focal_max({kernel: ee.Kernel.circle({radius: 20, units: 'meters'}), iterations: 1});
    // Breaking waves occur at values significantly brighter than 0.12, measuremennts
    // Measurements 0.28, 0.38, 0.12, 0.54
    // A threshold of 0.1 detects very shallow reef tops (such as Hardy Reef), not just breaking waves. 
    // Shallow reef tops
    // Hardy reef: 0.146, 0.24
    // South Warden Reef: 0.09, 0.105
    compositeContrast = filtered.gt(0.16);

    // Exclude land areas to help clean up the data a bit. 
    waterMask = img.select('B8').lt(B8LANDMASK_THRESHOLD);
    
    // Mask out any land areas because the depth estimates would 
    compositeContrast = compositeContrast.updateMask(waterMask);

  }  else if (colourGradeStyle === 'Land') {
    // Perform a basic mapping of land areas.
    

    filtered = img.select('B8')
      .focal_max({kernel: ee.Kernel.circle({radius: 10, units: 'meters'}), iterations: 1});
    
    compositeContrast = filtered.gt(B8LAND_THRESHOLD);

  // DEPRECATED
  } else if (colourGradeStyle === 'ReefTop') {
    //B4contrast = exports.contrastEnhance(scaled_img.select('B4'),0.02,0.021, 1);
    //var B5contrast = exports.contrastEnhance(scaled_img.select('B5'),0.02,0.05, 1);
    var smootherKernel = ee.Kernel.circle({radius: 10, units: 'meters'});
    //var waveKernel = ee.Kernel.gaussian({radius: 40, sigma: 1, units: 'meters'});

    B4Filtered = scaled_img.select('B4').focal_mean({kernel: smootherKernel, iterations: 4});
    //B4contrast = exports.contrastEnhance(B4Filtered,0.015,0.016, 1);
    // This threshold was chosen so that it would reject most waves in the Coral Sea
    // but be as sensitive as possible.
    B4contrast = exports.contrastEnhance(B4Filtered,0.018,0.019, 1);
    compositeContrast = B4contrast;
  } else if (colourGradeStyle === 'Shallow') {
    //print(scaled_img);
    var B5contrast = exports.contrastEnhance(scaled_img.select('B5'),0.02,0.7, 3);
    var B8contrast = exports.contrastEnhance(scaled_img.select('B8'),0.013,0.7, 3);
    var B11contrast = exports.contrastEnhance(scaled_img.select('B11'),0.005,0.7, 3);
    compositeContrast = ee.Image.rgb(B11contrast, B8contrast, B5contrast);

  } 
  // This style is DEPRECATED as this styling can be reproduced very closely with styling in
  // QGIS based on the DeepFalse style. The filtering does not appear to make a significant 
  // difference to the boundary. 
  // This code is retained as it contains tuning information that might be useful
  // in the future.
  else if (colourGradeStyle === 'B3ReefBoundary') {
    reefKernel = ee.Kernel.circle({radius: 30, units: 'meters'});
    B3Filtered = scaled_img.select('B3').focal_mean({kernel: reefKernel, iterations: 2});
    // Sentinel 2 imagery has angled (13 degrees off the vertical) visible bands 
    // (i.e. brighter wide lines across the image)
    // at the overlap between the multiple sensors that make the imagery. These
    // bands at the overlap are brighter than the deepest features visible in the 
    // green imagery. To make clean thresholds we therefore need to raise the threshold
    // above these bands. This limits the depth visible in the resulting image.
    // On the western side of Lihou reef (56KLF) there is rim of deep coral reefs at 
    // approximately 25 m (noting that nautical charts are not very detailed in this area).
    // These reefs are just visible in the green channel (B3) but their brightness is 
    // less than the brightness of the Sentinel 2 angled sensor bands.
    // Thresholds (Lihou scene, 56KLF):
    // Open water: 0.034 (90% above), 0.035 (20% above), 0.036 (0% above)
    // Angled sensor bands: 0.035 (80% above), 0.036 (5% above), 0.037 (0% above)
    // Lihou reef edge (~ 25m): 0.035 (50% above), (20% above), (0.5% above)
    //
    // Dianne Bank (55LGC)
    // Open water: 0.034 (60%), 0.035 (5%), 0.036 (0%)
    // Angled sensor bands: 0.034 (90%), 0.035 (40%), 0.036 (0%)
    // Bank: 0.034 (4x), 0.035 (3x), 0.036 (1.5x), 0.037 (area relative to this threshold)
    //
    // Cairns (Arlington, Batt, Tongue Reef)
    // Reef boundaries: 
    //    0.037 - boundary is bigger than existing mapped GBR reef boundaries with 
    //            most of inshore and mid shelf above threshold.
    //    0.038 - boundary area very similar to existing mapped reef boundaries.
    // 55KGU Australia, GBR, Hardy Reef, Block Reef
    //    0.038 - boundary is similar to existing reefs, but does tend to pick up
    //            noise at boundary due to water turbidity
    //    0.039 - boundaries are much cleaner, but some deeper areas of reefs
    //            are missing leading to fragmentation of reef boundaries.
    // 55LCD Australia, GBR, Lizard Island, Ribbon No 10 reef
    //    0.039 - All of mid and inshore areas are masked out. Threshold ideally higher.
    //    0.040 - Not much better than 0.039
    //    0.043 - Reef boundaries much better. 
    // 56KLG North Lihou
    //    0.043 - Boundary is clean. 
    //    0.038 - Includes more of the reef structures.
    // 43NCE - Madives
    //   0.036 - Too sensitive. The whole atoll of reefs appears as one
    //          blurry blob. Angled sensor lines are also visible.
    // 56KKC - Australia, GBR, Cockatoo Reef
    //   0.036 - Too sensitive - lows of turbid waters show up as reefs. 
    //          Drowned ribbon reefs only just detected. i.e. Deep features
    //          can't be mapped using a simple feature.
    //          Angled sensor lines are also visible.
    B3contrast = exports.contrastEnhance(B3Filtered,0.038,0.0381, 1);
    compositeContrast = B3contrast;
  } 
  // This style is DEPRECATED as this styling can be reproduced very closely with styling in
  // QGIS based on the DeepFalse style. The filtering does not appear to make a significant 
  // difference to the boundary. 
  // This code is retained as it contains tuning information that might be useful
  // in the future..
  else if (colourGradeStyle === 'B2ReefBoundary') {
    reefKernel = ee.Kernel.circle({radius: 30, units: 'meters'});
    B2Filtered = scaled_img.select('B2').focal_mean({kernel: reefKernel, iterations: 2});

    // On inshore areas where the water quality can vary significantly the
    // threshold for matching the reef boundaries are not very consistent.
    // It is therefore difficult to use the B2 channel reliably to get
    // estimates for reef boundaries and to apply these thresholds to the
    // Coral Sea. We will therefore tend towards a moderately high thresold
    // that works most of the time on the GBR.
    // 55KGU Australia, GBR, Hardy Reef, Block Reef
    //    0.08 - boundary is larger than mapped reefs, water turbidity being picked up
    //    0.085 - Some merging of close reefs (Hardy and Line reef), deep reefs still no
    //            picked up that well.
    //    0.09 - Clean boundaries, but middles of reefs missing such as line reef and 
    //           Circular Quay reef
    // Cairns (Arlington, Batt, Tongue Reef)
    // The thresholds varied significantly depending on which images were included
    // in the composite. This is because of the difference in water clarity in
    // the images. 
    //   0.085 - Whole marine area above this threshold.
    //   0.1 - 95% of marine area still above this threshold
    //   0.11 - Arlington, Batt and Tongue reef have reasonable boundaries.
    // 55LCD Australia, GBR, Lizard Island, Ribbon No 10 reef
    //   0.11 - Threshold is higher than ideal
    //   0.09 - Threshold much better.
    // 56KLG - North of Lihou
    //   0.09 - Doesn't include deeper rim reef. Threshold should be lower.
    //   0.085 - Includes reef on the rim.
    //   0.08 - Too sensitive. Reefs on rim starting to merge.
    // 56KKC - Australia, GBR, Cockatoo Reef
    //   0.08 - Too sensitive. Neighbouring reef features starting to merge
    //          due to slightly turbid water between the reefs.
    //          Deep drowned ribbon reefs just detected, threshold map
    //          not sensitive enough to detect the full boundaries.
    //          Picking up mid-shelf turbid water.
    
    B2contrast = exports.contrastEnhance(B2Filtered,0.085,0.0851, 1);
    compositeContrast = B2contrast;
  } else if (colourGradeStyle === 'Slope') {
    
    // The slope calculation requires that the image is in a projection with 
    // units of metres. By default composite images (those from a ee.Reduce())
    // are reprojected to EPSG:4326 (WGS 84) as part of this process, 
    // which is unsuitable as its units are degrees, not metres.
    // Originally I attempted to reproject the tiles back into the original WGS/UTM
    // projection that the original Sentinel 2 are stored in.
    // Unfortunately, while the resulting slope images displayed correctly
    // in the interactive GEE, when exported the images had a flipped Y axis,
    // (presumably due to a GEE bug) resulting in subsequent processing problems.
    // As a result I switched to using EPSG:3857 WGS 84 / Pseudo-Mercator.
    // This has units of metres, which allows the slope calculation to work.
    // This projection would be unsuitable if we were processing near
    // the poles due to its extreme stretching near the poles. Luckly
    // reefs are located near the equator and so this should not be a problem.
    exportProjection = ee.Projection('EPSG:3857');
    
    // Limit the resolution of the reprojection to 30 m to limit the memory use.
    // Anything finer will result in out of memory errors for interactive GEE.
    projectedComposite = scaled_img.select(['B2','B3','B4']).
      reproject(exportProjection, null, 30);

    // Apply spatial filtering to reduce the noise in the slope calculations.
    // Since we are using this to study reef boundaries the spatial resolution
    // does not need to be too high. Apply the filtering multiple times to
    // better approximate a cleaner smoother. 
    // Results from different filter resolution trials:
    // 60 m, 1 iteration: Significant noise from waves and small cloud 
    //                    Closely follows reef boundaries and detects small
    //                    reef features.
    // 90 m, 1 iteration: Noise is significantly less (about half). Feature
    //                    resolution similar to 60m.
    // 90 m, 3 iterations: Noise is significantly less than 1 iteration, (
    //                    about 1/3 - 1/2). Shape of larger reef features is
    //                    similar to 1 iteration, but clusters of small features
    //                    are blurred and small reef featurs ~90 m across
    //                    are reduced in strength. Probably slightly too much
    //                    filtering.
    // 180 m, 1 iteration Signifiantly less noise, but features smaller than
    //                    about 100 m are removed.
    filtered = projectedComposite.focal_median(
      {kernel: ee.Kernel.circle({radius: 90, units: 'meters'}), iterations: 2}
    );
    
    // In this calculation we apply the slope calculation to the uncontrast
    // enhanced image. As a result areas that are shallower will have a stronger
    // brightness gradient with depth (and thus more slope lines).
    
    // Shouldn't we adjust the brightness prior to the slope calculation?
    // I trialled adjusting the image contrast matching the DeepFalse styling,
    // so that the brightness gradient would be more linear with depth.
    // Unfortunately this did not make for a more useful slope product from a 
    // mapping perspective. It did flattern the pace of slope lines with depth,
    // but this made it more difficult to perceive the depth from the resulting
    // image. With no compensation the stronger perceived slope with shallower
    // areas indicates visually that this is an important feature to be mapped.
    
    // One problem with the slope product is that the depth/brightness relationship
    // is affected heavily by the darkness of the substrate. This makes areas
    // that have patchy dark substrate appear to have lots of peaks and troughs.
    // For depths around 15 - 25 m the slope derived from the green channel is
    // a better estimate than that derived from the blue channel. I tried to
    // create an approach that selectively combined the different channels at
    // different depths. I only had very limited success at this.
    
    compositeContrast = ee.Image.rgb(
      // B4 is more noisy and less important for defining the reef boundary
      // and so don't enhance the contrast as much.
      exports.contrastEnhance(ee.Terrain.slope(filtered.select('B4')),0.0003,0.01, 2),
      exports.contrastEnhance(ee.Terrain.slope(filtered.select('B3')),0.0003,0.01, 3.5),
      exports.contrastEnhance(ee.Terrain.slope(filtered.select('B2')),0.0003,0.01, 3.5)
    );

  } 
  // This style is DEPRECATED as a failed attempt at trying to improve the slope
  // styling for digitising reef boundaries. It is retained here because it shows
  // what was trialled.
  //
  // Why this colourGrade failed - 
  // While this styling did some what normalise the slope intensity with depth
  // this led for a decrease in the perceived steepness of the shallow slopes,
  // thining our the look of the image. It didn't really help with clarity of
  // the boundaries of deep features as the contrast enhancement of these deep
  // areas also resulted in increase perceived noise in the image. Setting a
  // black level threshold to remove this noise resulted in a similar sensitivity
  // as the original 'Slope' style.
  else if (colourGradeStyle === 'SlopeLinearDepth') {
    // This is not an improvement to the Slope colour grade.

    exportProjection = ee.Projection('EPSG:3857');

    projectedComposite = scaled_img.select(['B2','B3','B4']).
      reproject(exportProjection, null, 30);

    filtered = projectedComposite.focal_median(
      {kernel: ee.Kernel.circle({radius: 60, units: 'meters'}), iterations: 2}
    );

    // Apply contrast enhancement to the imagery prior to calculating the slope.
    // The purpose of this is to normalise the visual contrast with depth.
    // The deeper features are the more compressed the visual contrast with
    // the deepest features being tonally very similar to the surrounding water,
    // where as shallow areas experience large changes in brightness with depth.
    // This is due to light reducing on a log scale with depth
    // 
    // For this processing we don't use satellite derived bathymetry to calculate
    // the slope because it only works to approximately 25 m depth as it is reliant
    // on the ratio of blue and green channels, and thus limited to the visibility
    // of the green channel.
    //
    // To approximate a log transform of the brightness we would ideally adjust
    // the brightness so that open ocean is near black, then apply a log transform
    // to the brightness. The problem with this approach is that water clarity varies
    // with nutrients and sediments, resulting non-open waters sometimes being
    // darker than open oceans. Additionally slight calibration errors in the image
    // brightness results in bands and shifts in the image brightness, unrelated
    // to the ocean depth. If we try to apply too much compensation to set a black
    // point to the image then these residual uncorrected brightness errors and 
    // water clarity differences will be magnified resulting in a less consistent
    // result.
    //
    // We instead use a more gentle correction that will be more robust against
    // imperfect imagery.
    // 56KKC
    // 0.01 - Background noise is now visible (too low)
    // 0.013 - Close to critical threshold
    // 0.02 - Open water noise is cut off (too high) - This threshold looks
    //        to match the cut off for determining reef tops.
    // This agrees with the threshold for the DeepMarine colour grade os 0.013
    B4contrast = exports.contrastEnhance(filtered.select('B4'),0.01,0.3, 2);
    
    // Our goal is to set the black point threshold high enough to make the
    // darkest regions of the image close to black. i.e. after the slope
    // calculation we should be able to still see the noise of open water
    // Raising the threshold higher will cut off both the open ocean noise
    // but also the deep features. We therefore set the threshold just below
    // where open ocean noise starts to be cut off. This way there is no loss
    // of reef signal in this stage. This will allow the gamma brightness
    // correction to best linearise the brightness with depth.
    // 56KKC
    // 0.06 - Many deep features cut off (too high)
    // 0.04 - Many deep features cut off (too high)
    // 0.035 - Critical threshold, some of the open water is black (below threshold)
    //        and some is visible (above the threshold)
    // 0.03 - Background noise is now visible (too low)
    // 51LXH
    // 0.04 - All deep features cut off (too high)
    // 0.035 - Critical threshold, some of the open water is black (below threshold)
    //        and some is visible (above the threshold). Sections deliniated by
    //        banding in the image
    // 0.03 - Background noise is visible (too low)
    // This largely agrees with the lower threshold used in the DeepFalse of
    // 0.033
    B3contrast = exports.contrastEnhance(filtered.select('B3'),0.033,0.31, 2);
    
    // Lower threshold of 0.08 cuts off deep reefs in 56KKC, but 0.07 retains these 
    // reefs. This agrees with the DeepFalse threshold of 0.0721
    B2contrast = exports.contrastEnhance(filtered.select('B2'),0.072,0.33, 2);

    // The black level threshold needs to remove noise created by open water
    // after the slope calculation. This maximises the visibility of the
    // reef features of interest.
    // 56KKC
    // B4 - 0.00 - Even dark grey open ocean noise. (too low)
    //    - 0.003 - Flecks of noise in the open ocean (too low)
    //    - 0.004 - Small number of noise flecks in the open ocean (too low, but not by much)
    //    - 0.005 - No open water noise.
    //    - 0.007 - All open water noise is gone. Slopes internal to reefs
    //            are significantly culls (too high)
    // B3 - 0.0 - Even open water slope noise. Turbid flow appears in the noise. (Too low)
    //    - 0.004 - Most noise removed. Some turbid flow still shows. (about right?)
    //    - 0.005 - Nearly all open ocean noise is removed. Nearly all deep features are
    //              retained. On the edge of removing deeper features. (too high?)
    // B2 - 0.0 - Open water noise and turbid flow. Structure of deep features are clear.
    //      0.04 - Most open water and turbid flow noise removed.
    //      0.05 - Slightly more noise removed, similar features retained.    
    compositeContrast = ee.Image.rgb(
      // B4 is more noisy and less important for defining the reef boundary
      // and so don't enhance the contrast as much.
      //exports.contrastEnhance(ee.Terrain.slope(B4contrast),0.005,0.1, 2),
      //exports.contrastEnhance(ee.Terrain.slope(B3contrast),0.004,0.1, 2),
      //exports.contrastEnhance(ee.Terrain.slope(B2contrast),0.005,0.1, 2)
      exports.contrastEnhance(ee.Terrain.slope(B4contrast),0.006,0.05, 2),
      exports.contrastEnhance(ee.Terrain.slope(B3contrast),0.006,0.05, 3),
      exports.contrastEnhance(ee.Terrain.slope(B2contrast),0.006,0.05, 3)
    );

  } else if (colourGradeStyle === 'Depth') {

    compositeContrast = exports.estimateDepth(img, 20, 2);
    
  } else if (colourGradeStyle === 'Depth10m') {
    
    compositeContrast = exports.estimateDepth(img, 20, 2).gt(-10);
    
  } else if (colourGradeStyle === 'Depth5m') {
    
    compositeContrast = exports.estimateDepth(img, 10, 2).gt(-5);
    
  } else if (colourGradeStyle === 'Depth20m') {
    // This algorithm is optimised for estimating the 20 m contour in sandy areas in
    // clear water. It is intended to help map the backs of reefs. It might be OK in
    // other areas, but it has not been checked.
    
    // Select the green channel and apply a spatial filter to reduce the noise in the
    // contour. 
    // The threshold associated with -20 m was calibrated by comparing rendered masked
    // with the GA GBR30 Bathymetry 2020 dataset. The threshold was adjusted for multiple
    // scenes until the best match was found. Inshore areas were ignored.
    // Scene Threshold Reef/notes
    // 55KEV 0.042     Big Broadhurst reef
    // 55KCB 0.046     Arlington reef - This scene has higher turbidity, raising the brightness of B3
    // 55KFU 0.041     Dingo Reef
    // 55LCD 0.043     Lizard island / Ribbon No 10 - Higher turbidy region raising threshold
    // 56KLV 0.040     Heron Island
    // 55KGU 0.041     Hardy Reef
    // As a point of reference rendering 55KCB with a threshold of 0.041 results in a 
    // contour of ~-23 m indicating that the error for small offset errors is reasonable low.
    compositeContrast = scaled_img.select('B3')
      // Median filter removes noise but retain edges better than gaussian filter.
      // At the final threshold the median filter can result in small anomalies and
      // so we apply a small 
      .focal_median({kernel: ee.Kernel.circle({radius: 40, units: 'meters'}), iterations: 1})
      .focal_mean({kernel: ee.Kernel.circle({radius: 20, units: 'meters'}), iterations: 1})
      .gt(0.041);

  } else {
    print("Error: unknown colourGradeStyle: "+colourGradeStyle);
  }
  if (processCloudMask) {
    var cloudmask = img.select('cloudmask');
    return compositeContrast.addBands(cloudmask);
  } else {
    return compositeContrast;
  }
};



// Utility function for estimating the depth from the image. Note: While this is
// called depth it trends deeper regions has negative values. i.e. -10 m means
// 10 m below the surface. 
// 
// This function assumes that the image has had sunglint correction and brightness normalisation
// already applied to the image. If not the output values will not be accurate. 
// 
// This method is only moderately accurate from -4 - -12 m of depth.
// Its primary goal is to help with the determining the -5 and -10 m contour lines.
// This algorithm performs better than simply performing the ln(B3), but is still
// suseptible to dark substrates, particularly in shallow areas. These can introduce
// errors of up to 5 m, this is compared with an error of about 8 m by just using the
// B3 channel. 
//
// Areas estimated as land, based on their brightness in the B8 channel have a depth
// of 1. Depths below -12 m are masked off.

// @param {integer} filterRadius - Radius of the filter (m) to apply to the depth to reduce
//                                spatial noise. Typically: 20. Should be multiples of the
//                                native image pixel resolution.
// @param {integer} filterIterations - Number of iterations of the filter to apply. Typically: 1-2

exports.estimateDepth = function(img, filterRadius, filterIterations) {
    // Result: This depth model seems to work quite well for depths between 5 - 12 m. In shallow areas
    // dark seagrass is not compensated for very well.
    // In shallow areas seagrass introduces a 4 - 6 m error in the depth estimate, appearing to
    // be deeper than it is. This is based on the assumption that neighbouring sand areas are at a
    // similar depth to the seagrass. 
    
    // Offset that corrects for the colour balance of the image. This also allows the depth
    // estimate to be optimised for a particular depth. 
    // If this is increased to say 250 the compensation for seagrass is slightly between for shallower
    // areas (3 - 5 m), but still far from good. The downside is that in deep areas the seagrass gets
    // over compensated so seagrass areas appear shallower than intended.
    // An offset of 120 is chosen to optimise the dark substrate compensation from 10 - 15 m.
    var B2_OFFSET = 150;
    
    // ========= Depth Calibration Round 1 =========
    // Scaling factor so that the range of the ln(B3)/ln(B2) is expanded to cover the range of
    // depths measured in metres. Changing this changes the slope of the relationship between
    // the depth estimate and the real depth. 
    // This scalar and depth offset were determined by mapping the 5 and 10 m depth contours
    // generated from the satellite imagery and the GBR30 2020 dataset for the following scenes:
    // 55KFU, 55LCD, 55KCB, 55KGU, 56KKC. The tuning focused on matching areas where there 
    // were gentle gradients crossing the 5 m and 10 m contours as these areas are most sentive
    // to slight bias differences (i.e. the coutour moves quickly over a large distance for small
    // changes in bathymetry. The difference between the 5 m and 10 m contours was used to 
    // calculate the slope and offset. The resulting alignment was a close match with contours
    // matching to within approximately +- 1 m. 
    // The GBR30 bathymetry dataset is normalised to approximately MSL and for reef tops was
    // itself created from Satellite Derived Bathymetry and so errors due to systematic issues
    // from SDB will be copied into this dataset.
    // DEPTH_SCALAR = 145.1
    // DEPTH_OFFSET = -145.85
    // ========= Depth Calibration Round 2 =========
    // Depth contours were generated for both Sentinel 2 imagery and Landsat imagery based
    // on round 1 calibrations determined from the GBR. It was found that the two sets of
    // contours didn't align. The Sentinel 2 contours were showing shallower areas and the
    // Landsat deeper areas. More detail on round 2 calibration is described in l8Utils.js
    // This calibration suggested that the Sentinel 2 depth could be improved by increasing
    // the depth by 1.5 - 2 m. There was insufficient information to refine the slope.
    // New DEPTH_OFFSET = -145.85-(1.5+2)/2 = -147.6
    var DEPTH_SCALAR = 145.1;
    
    // Shift the origin of the depth. This is shifted so that values hit the origin at 0 m.
    // Changing this modifies the intercept of the depth relationship. If the 
    // DEPTH_SCALAR with modified then the DEPTH_OFFSET needs to be adjusted to ensure
    // that the depth passes through the origin. For each unit increase in DEPTH_SCALAR
    // the DEPTH_OFFSET needs to be adjusted by approx -1. 
    var DEPTH_OFFSET = -147.6;
    
    // This depth estimation is still suspetible to dark substrates at shallow depths (< 5m).
    // It also doesn't work in turbid water. It is also slight non-linear with the depth
    // estimate asympotically approach ~-15 m. As a result depths below -10 m are
    // reported as shallower than reality.
    var depthB3B2 = 
      img.select('B3').log().divide(img.select('B2').subtract(B2_OFFSET).log())     // core depth estimation (unscaled)
      .multiply(DEPTH_SCALAR).add(DEPTH_OFFSET);            // Scale the results to metres
    
    // Consider anything brighter than this as land. This threshold is chosen slightly higher than
    // the sunglint correction LAND THRESHOLD and we want to ensure that it is dry land and not simply
    // shallow.  Chosing this at 1000 brings the estimates close to the high mean tide mark, but also
    // result in dark areas on land (such as on Magnetic Island) as appearing as water.
    var B8LAND_THRESHOLD = 1400; 
    //var waterMask = img.select('B8').lt(B8LAND_THRESHOLD);
    
    // Mask out any land areas because the depth estimates would 
    //var depthWithLandMask = depthB3B2.updateMask(waterMask);
    
    // Set any areas that are most likely to be land to have a height of 1 m. 
    // We can't know the height, hence the cap and we don't want to mask because
    // we want to be able to create depth contours without holes for land areas
    // because we are separately mapping the land using another process that
    // has much more precision.
    depthB3B2 = depthB3B2.where(img.select('B8').gt(B8LAND_THRESHOLD), ee.Image(1));
    
    // Perform spatial filtering to reduce the noise. This will make the depth estimates between for creating contours.
    //var filteredDepth = depthWithLandMask.focal_mean({kernel: ee.Kernel.circle({radius: filterRadius, units: 'meters'}), iterations: filterIterations});
    var filteredDepth = depthB3B2.focal_mean({kernel: ee.Kernel.circle({radius: filterRadius, units: 'meters'}), iterations: filterIterations});
    
    // This slope of the depth estimate becomes very flat below -12 m, thus we need to remove this data from the
    // result to limit the improper use of the data.
    var MAX_DEPTH = -12;
    
    // Remove all areas where the depth estimate is likely to be poor.
    // Smooth the edges of the mask by applying a dilate. This is equivalent to applying a buffer to the mask image, 
    // helping to fill in neighbouring holes in the mask. This will expand the mask slightly.
    var depthMask = filteredDepth.gt(MAX_DEPTH)
      .focal_min({kernel: ee.Kernel.circle({radius: 10, units: 'meters'}), iterations: 1})  // (Erode) Remove single pixel elements
      .focal_max({kernel: ee.Kernel.circle({radius: 40, units: 'meters'}), iterations: 1}); // (Dilate) Expand back out, plus a bit more to merge
    var compositeContrast = filteredDepth.updateMask(depthMask);
    return(compositeContrast);
};



// ======================================================================================
//
//                          Application Utilities
//                  Functions for making applications
//
// ======================================================================================
// These applications were written up as functions so that we can create simple scripts
// for individual projects that focus on the core relevant data for that project, such as
// which tiles were processed and which image IDs were used.




// This function creates an application that allows the user to browse through the Sentinel 2
// image catalog, for a specific Sentinel 2 tile, to manually select the clearest images available. 
// These can then be collated into a collection for subsequent processing.
// The IDs of the images at each step can be found in the console. 
// @param {String} tileID - Sentinel 2 tile ID, such as '55LBK'
//     Use the map link below to find the tileID for the area of interest.
//     https://maps.eatlas.org.au/index.html?intro=false&z=7&ll=146.90137,-19.07287&l0=ea_ref%3AWorld_ESA_Sentinel-2-tiling-grid_Poly,ea_ea-be%3AWorld_Bright-Earth-e-Atlas-basemap,google_SATELLITE&v0=,,f
// @param {String} startDate - Starting date ('YYYY-MM-DD' format} to search for images such as '2015-01-01'
// @param {String} endDate - End date to search for images.
// @param {number} cloudPixelPercentage - Remove all images with more than this % cloud cover
exports.createSelectSentinel2ImagesApp = function(tileID, startDate, endDate, cloudPixelPercentage) {

  // Used to find the geometry of the selected images. For more info checkout
  // https://eatlas.org.au/data/uuid/f7468d15-12be-4e3f-a246-b2882a324f59
  var s2Tiles = ee.FeatureCollection("users/ericlawrey/World_ESA_Sentinel-2-tiling-grid");
  // Find all the images that correspond to the specied tile that are in the
  // date range and with a suitable cloud cover.
  var images = ee.ImageCollection('COPERNICUS/S2')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloudPixelPercentage))
      .filter(ee.Filter.gt('system:asset_size', 100E6))  // Remove small fragments of tiles
      .filterDate(ee.Date(startDate), ee.Date(endDate))
      .filter(ee.Filter.inList('MGRS_TILE', ee.List([tileID])));
  
  // This code don't seem to have been necessary so far and so I am provisionally removing it.
  //if (REMOVE_SMALL_IMAGES) {
  //  images = images.filter(ee.Filter.gt('system:asset_size', 500E6));  // Remove small fragments of tiles
  //}
  
  // Find all the dates of the images images in the collection. Do this so we can
  // set through the dates when reviewing the images.
  // From https://gis.stackexchange.com/questions/307115/earth-engine-get-dates-from-imagecollection
  var dates = images
      .map(function(image) {
        return ee.Feature(null, {'date': image.date().format('YYYY-MM-dd')});
      })
      .distinct('date')
      .aggregate_array('date');
  
  print(dates);
  
  var tileFeature = s2Tiles.filter(ee.Filter.equals('Name', tileID));
  // Zoom to our tile of interest.
  Map.centerObject(tileFeature, 9);
  
  
  // Sets up next and previous buttons used to navigate through previews of the
  // images in the collection.
  // Use window to set globals
  var prevButton = new ui.Button('Previous', null, false, {margin: '0 auto 0 0'});
  var nextButton = new ui.Button('Next', null, false, {margin: '0 0 0 auto'});
  var buttonPanel = new ui.Panel(
      [prevButton, nextButton],
      ui.Panel.Layout.Flow('horizontal'));
      
  // Build the thumbnail display panel
  var introPanel = ui.Panel([
    ui.Label({
      value: 'Find images',
      style: {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
    }),
    ui.Label('IDs are listed in Console. Copy and paste the good ones.')
  ]);
  
  
  // Setup the user interface
  var dateLabel = ui.Label({style: {margin: '2px 0'}});
  var progressLabel = ui.Label({style: {margin: '2px 0'}});
  var idLabel = ui.Label({style: {margin: '2px 0'}});
  var mainPanel = ui.Panel({
    //widgets: [introPanel, imagePanel, idLabel, dateLabel, progressLabel, buttonPanel,],
    widgets: [introPanel, idLabel, dateLabel, progressLabel, buttonPanel,],
    style: {position: 'bottom-left', width: '340px'}
  });
  Map.add(mainPanel);
  
  
  
  var selectedIndex = 0;
  var collectionLength = 0;
  // Get the total number of images asynchronously, so we know how far to step.
  // This async process because we want the value on the client but the size
  // is a server side value.
  dates.size().evaluate(function(length) {
    collectionLength = length;
    updateUI();
  });
  
  
  var updateUI = function() {
    dates.get(selectedIndex).evaluate(function(date) {
      dateLabel.setValue('Date: ' + date);
    });
    progressLabel.setValue('index: '+(selectedIndex+1)+' of '+(collectionLength));
    var date = dates.get(selectedIndex);
    // Sets the image in the Google Earth Engine interface to the specified date. 
    var startDate = ee.Date(date).advance(-1,'day');
    var endDate = ee.Date(date).advance(+1,'day');
  
    var imagesFiltered = images.filter(ee.Filter.date(startDate,endDate));
    var IDs = imagesFiltered.aggregate_array('system:id');
    // Print the IDs to the console so the user can copy them if the
    // image is a good one.
    print(IDs);
  
  
    // Don't perform the cloud removal because this is computationally
    // expensive and significantly slows down the calculation of the images.
    var visParams = {'min': 0, 'max': 1, 'gamma': 1};
    var composite = imagesFiltered
      .map(exports.removeSunGlint)
      .reduce(ee.Reducer.percentile([50],["p50"]))
      .rename(['B1','B2','B3','B4','B5','B6','B7','B8',
        'B8A','B9','B10','B11','B12','QA10','QA20','QA60']);
    var includeCloudmask = false;
    
    Map.layers().reset();
    var deepFalse_composite = exports.bake_s2_colour_grading(composite, 'DeepFalsePreview', includeCloudmask);
    Map.addLayer(deepFalse_composite, visParams, 'Sentinel-2 DeefFalse',true);
    nextButton.setDisabled(selectedIndex >= collectionLength - 1);
    prevButton.setDisabled(selectedIndex <= 0);
  };
  
  // Gets the index of the next/previous image in the collection and sets the
  // thumbnail to that image.  Disables the appropriate button when we hit an end.
  var setImage = function(button, increment) {
    if (button.getDisabled()) return;
    //setImageByIndex(selectedIndex += increment);
    selectedIndex += increment;
    updateUI();
  };
  
  // Set up the next and previous buttons.
  prevButton.onClick(function(button) { setImage(button, -1); });
  nextButton.onClick(function(button) { setImage(button, 1); });
};










// Use this app to browse through a specific set of Sentinel 2
// images. This can be used to fine tune the selection of images obtained
// using the createSelectSentinel2ImagesApp. This saves having to
// step through all the non relevant images.
// @param {[string]} imageIds - array of Sentinel 2 image IDs. 
//    imageIds = ["COPERNICUS/S2/20160824T015622_20160824T015622_T51LXF",
//      "COPERNICUS/S2/20160913T015622_20160913T015617_T51LXF",
//      "COPERNICUS/S2/20170730T015701_20170730T015834_T51LXF"]
exports.viewSelectedSentinel2ImagesApp = function(imageIds) {
  
  // Find the bounds of all the tiles that the images are in. Restrict the search
  // to the tropics where reefs are found. This is to speed up the code.
  var tilesGeometry = exports.get_s2_tiles_geometry(imageIds, ee.Geometry.BBox(-180, -33, 180, 33));
  
  var s2_cloud_collection = exports.get_s2_cloud_collection(imageIds, tilesGeometry);
  
  // Zoom to our tile of interest.
  Map.centerObject(tilesGeometry, 9);
  
  // Adjust the collection of images
  var collection = s2_cloud_collection;
    //.map(utils.removeSunGlint);
  
  var listOfImage = collection.toList(collection.size());
  
  // Sets up next and previous buttons used to navigate through previews of the
  // images in the collection.
  var prevButton = new ui.Button('Previous', null, true, {margin: '0 auto 0 0'});
  var nextButton = new ui.Button('Next', null, true, {margin: '0 0 0 auto'});
  var buttonPanel = new ui.Panel(
      [prevButton, nextButton],
      ui.Panel.Layout.Flow('horizontal'));
      
  // Build the display panel
  var introPanel = ui.Panel([
    ui.Label({
      value: 'Browse images',
      style: {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
    }),
    //ui.Label('')
  ]);
  
  // Setup the user interface
  var progressLabel = ui.Label({style: {margin: '2px 0'}});
  var idLabel = ui.Label({style: {margin: '2px 0'}});
  var mainPanel = ui.Panel({
    widgets: [introPanel, idLabel, progressLabel, buttonPanel,],
    style: {position: 'bottom-left', width: '340px'}
  });
  Map.add(mainPanel);
  
  
  var selectedIndex = 0;
  var collectionLength = 0;
  // Get the total number of images asynchronously, so we know how far to step.
  // This async process because we want the value on the client but the size
  // is a server side value.
  listOfImage.size().evaluate(function(length) {
    collectionLength = length;
    updateUI();
  });
  
  
  var updateUI = function() {
  
    progressLabel.setValue('Image: '+(selectedIndex+1)+' of '+(collectionLength));
  
  
    var image = ee.Image(listOfImage.get(selectedIndex));
    // Don't perform the cloud removal because this is computationally
    // expensive and significantly slows down the calculation of the images.
    var visParams = {'min': 0, 'max': 1, 'gamma': 1};
    var composite = exports.removeSunGlint(image)
      .rename(['B1','B2','B3','B4','B5','B6','B7','B8',
        'B8A','B9','B10','B11','B12','QA10','QA20','QA60']);

    var includeCloudmask = false;
    
    Map.layers().reset();
    var trueColour_composite = exports.bake_s2_colour_grading(composite, 'TrueColour', includeCloudmask);
    Map.addLayer(trueColour_composite, visParams, 'Sentinel-2 True Colour',false);
    
    var deepMarine_composite = exports.bake_s2_colour_grading(composite, 'DeepFalse', includeCloudmask);
    Map.addLayer(deepMarine_composite, visParams, 'Sentinel-2 Deep False',true);
  
    var reefTop_composite = exports.bake_s2_colour_grading(composite, 'ReefTop', includeCloudmask);
    Map.addLayer(reefTop_composite, visParams, 'Sentinel-2 ReefTop',false);
  
    var slope_composite = exports.bake_s2_colour_grading(composite, 'Slope', includeCloudmask);
    Map.addLayer(slope_composite, visParams, 'Sentinel-2 Slope',false);
    
    //var deepMarine2_composite = utils.bake_s2_colour_grading(composite, 'TrueColourA', includeCloudmask);
    //print(deepMarine_composite);
    //print(deepMarine2_composite);
    
    //Map.addLayer(deepMarine2_composite, visParams, 'Sentinel-2 Deep Marine2',true);
    
    var shallow_composite = exports.bake_s2_colour_grading(composite, 'Shallow', includeCloudmask);
    Map.addLayer(shallow_composite, visParams, 'Sentinel-2 Shallow',false);
  
    Map.addLayer(deepMarine_composite.select('vis-blue'), visParams, 'Sentinel-2 Deep Marine vis-blue',false);
    Map.addLayer(deepMarine_composite.select('vis-green'), visParams, 'Sentinel-2 Deep Marine vis-green',false);
    Map.addLayer(deepMarine_composite.select('vis-red'), visParams, 'Sentinel-2 Deep Marine vis-red',false);
    Map.addLayer(composite.select("B1"), {'min': 1100, 'max': 1500, 'gamma': 2}, 'Sentinel-2 B1 after glint removal',false);
    Map.addLayer(composite.select("B2"), {'min': 650, 'max': 1500, 'gamma': 2}, 'Sentinel-2 B2 after glint removal',false);
    Map.addLayer(composite.select("B4"), {'min': 0, 'max': 1500, 'gamma': 2}, 'Sentinel-2 B4 after glint removal',false);
    Map.addLayer(composite.select("B5"), {'min': 0, 'max': 1500, 'gamma': 2}, 'Sentinel-2 B5 raw',false);
    Map.addLayer(composite.select("B8"), {'min': 0, 'max': 1500, 'gamma': 2}, 'Sentinel-2 B8 raw',false);
    Map.addLayer(composite.select("B11"), {'min': 0, 'max': 1500, 'gamma': 2}, 'Sentinel-2 B11 raw',false);
    Map.addLayer(image, {
        bands: ['B4', 'B3', 'B2'],
        min: [130, 200, 500],
        max: [1700, 1900, 2000],
        gamma: [2, 2, 2]
      }, 'Sentinel-2 Raw',false);
  
    
  
    nextButton.setDisabled(selectedIndex >= collectionLength - 1);
    prevButton.setDisabled(selectedIndex <= 0);
  };
  
  // Gets the index of the next/previous image in the collection and sets the
  // thumbnail to that image.  Disables the appropriate button when we hit an end.
  var setImage = function(button, increment) {
    if (button.getDisabled()) return;
    //setImageByIndex(selectedIndex += increment);
    selectedIndex += increment;
    updateUI();
  };
  
  // Set up the next and previous buttons.
  prevButton.onClick(function(button) { setImage(button, -1); });
  nextButton.onClick(function(button) { setImage(button, 1); });
  
  //updateUI();
};