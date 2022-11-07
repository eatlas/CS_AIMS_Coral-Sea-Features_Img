var utils = {
  VIS_OPTIONS: {
    'TrueColour': {
      description: 'True colour imagery. This is useful to interpreting what shallow features are and in mapping the ' +
        'vegetation on cays and identifying beach rock. Bands: B2, B3, B4. ',
      visParams: {
        bands: ['B4', 'B3', 'B2'],
        gamma: [1.2, 1.6, 1.8],
        min: [0.022, 0.025, 0.045],
        max: [0.3, 0.31, 0.33]
      }
    },
    'DeepMarine': {
      description: 'This is a contrast enhanced version of the true colour imagery, focusing on being able to better ' +
        'see the deeper features. Shallow features are over exposed due to the increased contrast. Bands: B2, B3, B4.',
      visParams: {
        bands: ['B4', 'B3', 'B2'],
        gamma: [1.2, 2.5, 2.5],
        min: [0.024, 0.04, 0.08],
        max: [0.2, 0.158, 0.18]
      }
    },
    'DeepFalse': {
      description: 'False colour image from Ultra violet (B1), Blue (B2) and Green (B3) that shows deep marine features ' +
        'well in clear waters. Bands: B1, B2, B3.',
      visParams: {
        bands: ['B3', 'B2', 'B1'],
        gamma: [1.19, 1.05, 1.10],
        min: [0.02, 0.02, 0.02],
        max: [0.24, 0.22, 0.22]
      }
    },
    'ReefTop': {
      description: "This imagery is contrast enhanced to create an mask (black and white) of reef tops, delineating " +
        "areas that are shallower or deeper than approximately 4 - 5 m. This mask is intended to assist in the " +
        "creating of a GIS layer equivalent to the 'GBR Dry Reefs' dataset. The depth mapping exploits the limited " +
        "water penetration of the red channel. In clear water the red channel can only see features to approximately " +
        "6 m regardless of the substrate type. Bands: B4.",
      visParams: {
        bands: ['B4'],
        gamma: 1,
        min: 0.04,
        max: 0.045
      }
    },
    'Slope': {
      description: "This layer applies a slope estimation to the imagery. Normally slope estimates are applied to " +
        "Digital Elevation Models to estimate the angle of the surface. We apply the slope estimate to the imagery " +
        "providing an estimate of the boundaries of visible features. This help remove the background variable tonal " +
        "and colour variation of the water allowing the edges of the marine features to be easily seen in the imagery. " +
        "Bands: B2, B3, B4.",
      visParams: {
        bands: ['B4', 'B3', 'B2'],
        gamma: [2, 3.5, 3.5],
        min: [0.00025, 0.00025, 0.00025],
        max: [0.007, 0.007, 0.007]
      }
    },
    'Depth': {
      description: "This is a Satellite Derived Bathymetry calibrated against the GA GBR30 2020 dataset. It is " +
        "intended to be used for creating reef contours.",
      visParams: {
        bands: ['Depth'],
        gamma: 1,
        min: -15,
        max: 0
      }
    },
  },

  /**
   * Filter the image collection for maxCloudCover
   * @param imageCollection
   * @param maxCloudCover
   * @return {ee.ImageCollection}
   */
  filterCloudCover: function (imageCollection, maxCloudCover) {
    return imageCollection.filter(ee.Filter.lte('CLOUD_COVER', maxCloudCover)).sort('CLOUD_COVER');
  },

  /**
   * Create an image composite from an array of image IDs.
   *
   * @param imageIds
   * @param correctSunGlint
   * @param maskClouds
   * @return {ee.Image.rgb}
   */
  createCompositeImage: function (imageIds, correctSunGlint, maskClouds) {
    var compositeImageCollection = ee.ImageCollection(imageIds);

    if (correctSunGlint) {
      compositeImageCollection = compositeImageCollection.map(this.removeSunGlint);
    }

    if (maskClouds) {
      compositeImageCollection = compositeImageCollection.map(this.maskClouds);
    }

    var compositeImage = compositeImageCollection.median();

    // https://github.com/eatlas/CS_AIMS_Sentinel-2-marine_V1/blob/85ab3ec7a27a2f9979bd23946fc6ea4b16bc98d6/src/02-gee-scripts/utils.js#L367
    // Correct for a bug in the reduce process. The reduce process does not generate an image with the correct geometry.
    // Instead, the composite generated as a geometry set to the whole world. This can result in subsequent processing
    // to fail or be very inefficient. We work around this by clipping the output to the dissolved geometry of the
    // input collection of images.
    compositeImage = compositeImage.clip(compositeImageCollection.geometry().dissolve());

    return compositeImage;
  },

  /**
   * This function estimates the sun glint from the B6 (SWIR1) Landsat 8 Collection 2 channel.
   * This estimate is then subtracted from the visible colour bands to create a new image.
   * @param image
   * @return {ee.Image} Sun-glint removed image
   */
  removeSunGlint: function (image) {
    var shortwaveInfrared = image.select("B6");

    return image
      .addBands(image.select("B1").subtract(shortwaveInfrared), ["B1"], true)
      .addBands(image.select("B2").subtract(shortwaveInfrared), ["B2"], true)
      .addBands(image.select("B3").subtract(shortwaveInfrared), ["B3"], true)
      .addBands(image.select("B4").subtract(shortwaveInfrared), ["B4"], true);
  },

  /**
   * Function to mask clouds based on the pixel_qa band of Landsat 8 TOA data.
   * @param {ee.Image} image input Landsat 8 TOA image
   * @return {ee.Image} cloud-masked Landsat 8 image
   */
  maskClouds: function (image) {
    // Bits 3 and 4 are cloud and cloud shadow, respectively.
    var dilatedCloudBitMask = (1 << 1);
    var cirrusBitMask = (1 << 2);
    var cloudBitMask = (1 << 3);
    var cloudShadowBitMask = (1 << 4);
    // Get the pixel QA band.
    var qa = image.select('QA_PIXEL');
    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(dilatedCloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0))
      .and(qa.bitwiseAnd(cloudBitMask).eq(0))
      .and(qa.bitwiseAnd(cloudShadowBitMask).eq(0));
    return image.updateMask(mask);
  },


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
  
  estimateDepth: function(img, filterRadius, filterIterations) {
      // Result: This depth model seems to work quite well for depths between 5 - 12 m. In shallow areas
      // dark seagrass is not compensated for very well.
      // In shallow areas seagrass introduces a 4 - 6 m error in the depth estimate, appearing to
      // be deeper than it is. This is based on the assumption that neighbouring sand areas are at a
      // similar depth to the seagrass. 
      
      // Offset that corrects for the colour balance of the image. This also allows the depth
      // estimate to be optimised for a particular depth. 
      // A value of 0.0250 results in seagrass areas getting over compensated for and appearing
      // to shallow. 
      // A value of 0 looks pretty good, although deeper seagrass (~10-15 m) gets over compensated
      // for a bit.
      // -0.0100 Seems an OK trade off however shallow seagrass is over compensated for
      // -0.0250 Seems to be the best trade off. Seagrass in depths 5 - 10 m seems to be 
      // compensated for and balanced.
      // -0.0500 Results in seagrass areas not getting much compensation and this appearing
      // deeper then they should.
      // 
      var B2_OFFSET = 0;
      
      
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
      // 
      var DEPTH_SCALAR = 145.1;
      
      // Shift the origin of the depth. This is shifted so that values hit the origin at 0 m.
      // Changing this modifies the intercept of the depth relationship. If the 
      // DEPTH_SCALAR with modified then the DEPTH_OFFSET needs to be adjusted to ensure
      // that the depth passes through the origin. For each unit increase in DEPTH_SCALAR
      // the DEPTH_OFFSET needs to be adjusted by approx -1. 
      var DEPTH_OFFSET = -145.85;
      
      // The ratio of the ln depends on the normalisation of the image. i.e. the log ratio 
      // of an image with brightness values from 0 - 10000, results in a substantially different
      // linearisation than one normalised to 0 - 1. This is because ln(11000)/ln(10000) is
      // not the same as ln(1.1)/ln(1.0). Changing this scalar effectively shifts the nonlinearity
      // caused by the ln. 
      // Lowering this value from shifts and can invert the depth relationship. 
      // We fix this value at 10000 because this is what we used with Sentinel 2 with non modified
      // images. In this case the input image is 0 - 1 and so we need to scale it up to 0 - 10000.
      // B_SCALAR Effect
      // 10,100       Binary threshold (Extremely large ranges of values, not useful)
      // 1000         Values at the edge of the masking lead to large values
      var B_SCALAR = 1;
      
      // This depth estimation is still suseptible to dark substrates at shallow depths (< 5m).
      // It also doesn't work in turbid water. It is also slight non-linear with the depth
      // estimate asympotically approach ~-15 m. As a result depths below -10 m are
      // reported as shallower than reality.
      
      var depthB3B2 = 
        img.select('B3').multiply(B_SCALAR).log().divide(img.select('B2').multiply(B_SCALAR).subtract(B2_OFFSET*B_SCALAR).log())     // core depth estimation (unscaled)
        .multiply(DEPTH_SCALAR).add(DEPTH_OFFSET);            // Scale the results to metres

      
      // Perform spatial filtering to reduce the noise. This will make the depth estimates between for creating contours.
      //var filteredDepth = depthWithLandMask.focal_mean({kernel: ee.Kernel.circle({radius: filterRadius, units: 'meters'}), iterations: filterIterations});
      var filteredDepth = depthB3B2.focal_mean({kernel: ee.Kernel.circle({radius: filterRadius, units: 'meters'}), iterations: filterIterations});
      
      var compositeContrast = filteredDepth;
      return(compositeContrast);
  },

  /**
   * Apply band modifications according to the visualisation parameters and return the updated image.
   * @param image
   * @param selectedVisOption
   * @return {ee.Image.rgb} 8 bit RGB image with applied styles, except for Depth style
   */
  visualiseImage: function (image, selectedVisOption) {
    var resultImage, redBand, greenBand, blueBand;
    var visParams = this.VIS_OPTIONS[selectedVisOption].visParams;
    var apply8bitScaling = true;
    
    switch (selectedVisOption) {
      case "Depth":
        //print(image);
        //resultImage = image.select('B2');
        resultImage = this.estimateDepth(image, 30, 1);
        apply8bitScaling = false;
        break;
      case "ReefTop":
        var smootherKernel = ee.Kernel.circle({radius: 10, units: 'meters'});
        var filteredRedBand = image.select(visParams.bands[0]).focal_mean({kernel: smootherKernel, iterations: 4});
        resultImage = this.enhanceContrast(filteredRedBand, visParams.min, visParams.max, visParams.gamma);
        break;
      case "Slope":
        // https://github.com/eatlas/CS_AIMS_Sentinel-2-marine_V1/blob/85ab3ec7a27a2f9979bd23946fc6ea4b16bc98d6/src/02-gee-scripts/utils.js
        // The slope calculation requires that the image is in a projection with units of metres. By default, composite
        // images (those from a ee.Reduce()) are reprojected to EPSG:4326 (WGS 84) as part of this process, which is
        // unsuitable as its units are degrees, not metres. Originally I (EL) attempted to reproject the tiles back
        // into the original WGS/UTM projection that the original Sentinel 2 are stored in. Unfortunately, while the
        // resulting slope images displayed correctly in the interactive GEE, when exported the images had a flipped Y
        // axis, (presumably due to a GEE bug) resulting in subsequent processing problems. As a result I (EL) switched
        // to using EPSG:3857 WGS 84 / Pseudo-Mercator. This has units of metres, which allows the slope calculation to
        // work. This projection would be unsuitable if we were processing near the poles due to its extreme stretching
        // near the poles. Luckily, reefs are located near the equator and so this should not be a problem.
        var exportProjection = ee.Projection('EPSG:3857');

        // reproject image
        var projectedComposite = image.select(['B2', 'B3', 'B4']).reproject(exportProjection, null, 30);

        // https://github.com/eatlas/CS_AIMS_Sentinel-2-marine_V1/blob/85ab3ec7a27a2f9979bd23946fc6ea4b16bc98d6/src/02-gee-scripts/utils.js
        // Apply spatial filtering to reduce the noise in the slope calculations. Since we are using this to study reef
        // boundaries the spatial resolution does not need to be too high. Apply the filtering multiple times to
        // better approximate a cleaner smoother.
        var filteredImage = projectedComposite.focal_median(
          {kernel: ee.Kernel.circle({radius: 90, units: 'meters'}), iterations: 2}
        );

        redBand = this.enhanceContrast(
          ee.Terrain.slope(filteredImage.select(visParams.bands[0])),
          visParams.min[0],
          visParams.max[0],
          visParams.gamma[0]
        );
        greenBand = this.enhanceContrast(
          ee.Terrain.slope(filteredImage.select(visParams.bands[1])),
          visParams.min[1],
          visParams.max[1],
          visParams.gamma[1]
        );
        blueBand = this.enhanceContrast(
          ee.Terrain.slope(filteredImage.select(visParams.bands[2])),
          visParams.min[2],
          visParams.max[2],
          visParams.gamma[2]
        );

        resultImage = ee.Image.rgb(redBand, greenBand, blueBand);
        break;
      default:
        redBand = this.enhanceContrast(
          image.select(visParams.bands[0]),
          visParams.min[0],
          visParams.max[0],
          visParams.gamma[0]
        );
        greenBand = this.enhanceContrast(
          image.select(visParams.bands[1]),
          visParams.min[1],
          visParams.max[1],
          visParams.gamma[1]
        );
        blueBand = this.enhanceContrast(
          image.select(visParams.bands[2]),
          visParams.min[2],
          visParams.max[2],
          visParams.gamma[2]
        );

        resultImage = ee.Image.rgb(redBand, greenBand, blueBand);
    }

    // Scale and convert the image to an 8 bit image to make the export file size considerably smaller.
    // Reserve 0 for no_data so that the images can be converted to not have black borders. Scaling the data ensures
    // that no valid data is 0.
    if (apply8bitScaling) {
      return resultImage.multiply(254).add(1).toUint8();
    } else {
      
      return resultImage;
    }
  },

  /**
   * Applies a contrast enhancement to the image, limiting the image between the min and max and applying a gamma
   * correction.
   */
  enhanceContrast: function (image, min, max, gamma) {
    return image.subtract(min).divide(max - min).clamp(0, 1).pow(1 / gamma);
  },
  
  /**
   * Utility function to display and export the mosaic
   *
   * @param imageIds
   * @param isDisplay
   * @param isExport
   * @param options
   */
  composeDisplayAndExport: function (imageIds, isDisplay, isExport, options) {
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
  
    var composite = this.createCompositeImage(imageIds, options.applySunGlintCorrection, options.applyCloudMask);
  
    // Prepare images for each of the specified colourGrades
    for (var i = 0; i < colourGrades.length; i++) {
      var finalComposite = this.visualiseImage(composite, colourGrades[i]);
  
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
        //Map.centerObject(composite.geometry());
  
        // https://gis.stackexchange.com/questions/362192/gee-tile-error-reprojection-output-too-large-when-joining-modis-and-era-5-data
        // https://developers.google.com/earth-engine/guides/scale
        // https://developers.google.com/earth-engine/guides/projections
        //
        // Errors when displaying slope images on map are caused by the combination of map zoom level and scaling factor:
        //
        // "If the scale you specified in the reproject() call is much smaller than the zoom level of the map, Earth Engine will request all the inputs at very small scale, over a very wide spatial extent. This can result in much too much data being requested at once and lead to an error."
        //if (Map.getZoom() < 9) {
        //  Map.setZoom(9);
        //}
      }
    }
  }
}

exports.utils = utils;
