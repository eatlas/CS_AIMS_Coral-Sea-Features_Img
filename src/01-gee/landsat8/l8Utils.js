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
      // If this is increased to say 250 the compensation for seagrass is slightly between for shallower
      // areas (3 - 5 m), but still far from good. The downside is that in deep areas the seagrass gets
      // over compensated so seagrass areas appear shallower than intended.
      // An offset of 120 is chosen to optimise the dark substrate compensation from 10 - 15 m.
      var B2_OFFSET = 150;
      
      
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
      depthB3B2 = depthB3B2.where(img.select('B6').gt(B8LAND_THRESHOLD), ee.Image(1));
      
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
    print(image);
    switch (selectedVisOption) {
      case "Depth":
        
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
  }
}

exports.utils = utils;
