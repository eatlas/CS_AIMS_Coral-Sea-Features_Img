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
    }
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
   * Create an image mosaic from an array of image IDs.
   *
   * @param imageIds
   * @param correctSunGlint
   * @param maskClouds
   * @return {ee.Image.rgb}
   */
  createMosaicImage: function (imageIds, correctSunGlint, maskClouds) {
    var mosaicImageCollection = ee.ImageCollection(imageIds);

    if (correctSunGlint) {
      mosaicImageCollection = mosaicImageCollection.map(this.removeSunGlint);
    }

    if (maskClouds) {
      mosaicImageCollection = mosaicImageCollection.map(this.maskClouds);
    }

    var mosaicImage = mosaicImageCollection.median();

    // https://github.com/eatlas/CS_AIMS_Sentinel-2-marine_V1/blob/85ab3ec7a27a2f9979bd23946fc6ea4b16bc98d6/src/02-gee-scripts/utils.js#L367
    // Correct for a bug in the reduce process. The reduce process does not generate an image with the correct geometry.
    // Instead, the composite generated as a geometry set to the whole world. This can result in subsequent processing
    // to fail or be very inefficient. We work around this by clipping the output to the dissolved geometry of the
    // input collection of images.
    mosaicImage = mosaicImage.clip(mosaicImageCollection.geometry().dissolve());

    return mosaicImage;
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

  /**
   * Apply band modifications according to the visualisation parameters and return the updated image.
   * @param image
   * @param selectedVisOption
   * @return {ee.Image.rgb} 8 bit RGB image with applied styles
   */
  visualiseImage: function (image, selectedVisOption) {
    var resultImage, redBand, greenBand, blueBand;
    var visParams = this.VIS_OPTIONS[selectedVisOption].visParams;

    switch (selectedVisOption) {
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
    return resultImage.multiply(254).add(1).toUint8();
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
