var s2Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Img:src/01-gee/sentinel2/s2Utils.js');

// This imagery is used for aligning the reef mapping techniques with the GBR.
// This was also used for tuning the depth estimations, by comparing them with the GBR 30m 
// bathymetry.
// For two of the scenes the tidal values of individual images were determined
// from the eReefs GBR4 Hydro v2 model. These found that there was typically
// 0.4 - 0.8 m tidal difference across a single image and that for composites with
// multiple images that the tides tend to average out and thus most images would
// be close to mean sea level +- 0.5 m. Tide values are shown below.


// Primary imagery
var REF1_OPTIONS = {
  colourGrades: ['DeepFalse','TrueColour','Depth5m', 'Depth10m', 'Depth20m'],
  exportScale: [10, 10, 10, 10, 10],
  exportBasename: 'CS_AIMS_Coral-Sea-Features_Img_S2_R1',
  exportFolder: 'EarthEngine/CS_AIMS_Coral-Sea-Features_Img/GBR',
  
  applySunglintCorrection: true,
  applyBrightnessAdjustment: true
};

//55KFU Australia, GBR, Dingo Reefs, Gould Reefs
// Searched 86 out of 86 images

s2Utils.s2_composite_display_and_export(
  [
    //Excellent
    "COPERNICUS/S2/20180730T002049_20180730T002051_T55KFU",  
    "COPERNICUS/S2/20180829T002049_20180829T002045_T55KFU",
    "COPERNICUS/S2/20190908T002051_20190908T002053_T55KFU",
    "COPERNICUS/S2/20200729T002059_20200729T002057_T55KFU",
    "COPERNICUS/S2/20201101T002101_20201101T002059_T55KFU",
    "COPERNICUS/S2/20210729T002101_20210729T002058_T55KFU",
    "COPERNICUS/S2/20210922T002049_20210922T002052_T55KFU"
  ],
  false, true, REF1_OPTIONS);
  
  
 // 55KEV - Australia, GBR, Davies, Grub, Chicken
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 27 of 27 Images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent (Water clarity index 1 - low visibility, 5 - excellent)
    //"COPERNICUS/S2/20160708T003035_20160708T015011_T55KEV", // (2) - Removed due to lower WQ
    "COPERNICUS/S2/20190812T002711_20190812T002711_T55KEV", // (4)
    "COPERNICUS/S2/20190822T002711_20190822T002710_T55KEV", // (4)
    "COPERNICUS/S2/20190906T002709_20190906T002709_T55KEV", // (5) Can see the midshelf sea floor. Great view of weird ring contours
    "COPERNICUS/S2/20200727T002711_20200727T002713_T55KEV", // (3)
    "COPERNICUS/S2/20200816T002711_20200816T002713_T55KEV", // (3)
    //"COPERNICUS/S2/20200821T002709_20200821T002711_T55KEV", // (1) Low Water Quality, bit excellent view of plumes around reefs.
    "COPERNICUS/S2/20210915T002709_20210915T002703_T55KEV"  // (3)
  ],
  false, true, REF1_OPTIONS);
  
  

// Australia, Cairns, GBR, Green Island, Arlington, Hopley comparison
// For comparision with Hopley D, et. al., (2007), 
// The Geomorphology of the Great Barrier Reef
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 17 of 17 images
                      
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20161115T002712_20161115T002822_T55KCB", // Right
    "COPERNICUS/S2/20190914T003701_20190914T003703_T55KCB", // Left
    "COPERNICUS/S2/20200730T003711_20200730T003710_T55KCB", // Left

    // Good with good water clarity                      
    "COPERNICUS/S2/20180827T002711_20180827T002706_T55KCB", // Right
    "COPERNICUS/S2/20200715T003709_20200715T003706_T55KCB" // Left
  ],
  false, true, REF1_OPTIONS);
//Excellent but lower water clarity
//COPERNICUS/S2/20170718T003029_20170718T003032_T55KCB // Right
//COPERNICUS/S2/20200819T003711_20200819T003710_T55KCB // Left

//Good but lower water clarity
//COPERNICUS/S2/20180514T002709_20180514T002706_T55KCB // Right
//COPERNICUS/S2/20191110T002711_20191110T002710_T55KCB // Right
//COPERNICUS/S2/20200526T003709_20200526T003705_T55KCB // Left



//55LCD Australia, GBR, Lizard Island, Ribbon No 10 reef
// Searched 29 out of 29 images
// not enough images

s2Utils.s2_composite_display_and_export(
  [
    //Excellent
    "COPERNICUS/S2/20200819T003711_20200819T003710_T55LCD",
    // good
    "COPERNICUS/S2/20190810T003709_20190810T003711_T55LCD",
    // Okay
    "COPERNICUS/S2/20160830T003952_20160830T003955_T55LCD",
    "COPERNICUS/S2/20180810T003701_20180810T003704_T55LCD"
  ],
  false, true, REF1_OPTIONS);
  
  
// Australia, GBR, East of top of Cape York
// CLOUDY_PIXEL_PERCENTAGE = 1
// 21 of 21 images
s2Utils.s2_composite_display_and_export(
  [
    "COPERNICUS/S2/20180724T004711_20180724T004707_T54LYN", // Scattered clouds, clear water
    "COPERNICUS/S2/20190907T004711_20190907T004705_T54LYN", // Clear water, some scattered clouds
    "COPERNICUS/S2/20190917T004711_20190917T004705_T54LYN" // Moderate water clarity, some scattered clouds 
  ],
  false, true, REF1_OPTIONS);
  

// Northern Cap bunkers
s2Utils.s2_composite_display_and_export(
  [
    "COPERNICUS/S2/20180602T001111_20180602T001110_T56KLV",
    "COPERNICUS/S2/20180821T001111_20180821T001108_T56KLV",
    "COPERNICUS/S2/20190717T001111_20190717T001114_T56KLV",
    "COPERNICUS/S2/20190821T001119_20190821T001114_T56KLV",
    "COPERNICUS/S2/20200716T001109_20200716T001110_T56KLV"
  ],
  false, true, REF1_OPTIONS);
  
//55KGU Australia, GBR, Hardy Reef, Block Reef
// Searched 89 out of 89 images

s2Utils.s2_composite_display_and_export(
  [
    //Excellent                                             // Tide Avg -0.19 - -0.13 (-0.16m)
    "COPERNICUS/S2/20170814T002109_20170814T002103_T55KGU", // -0.4 - -0.6 m (eReefs GBR4 v2)
    "COPERNICUS/S2/20190809T002101_20190809T002058_T55KGU", // -0.5 - -0.7 m
    "COPERNICUS/S2/20200624T002101_20200624T002100_T55KGU", // 0.1 - 0.16 m
    "COPERNICUS/S2/20200714T002101_20200714T002059_T55KGU", // -0.35 - -0.13 m
    "COPERNICUS/S2/20200813T002101_20200813T002100_T55KGU"  // 0.2 - 0.6 m
  ],
  false, true, REF1_OPTIONS);
  
//false, true, Australia, GBR, Cockatoo Reef, Hopley comparison
// Searched 71 out of 71 images
s2Utils.s2_composite_display_and_export(
  [ // We estimated the tide based on the sea_surface_height_above_sea_level
    // variable in the GBR4 Hydro v2.0 for each image. We use GoDiva to sample the
    // corners of the scenes (by eye) and recorded the range of depths over the scene.
    // Used 10 am from the model to match with Sentinel imagery timing.
    //Excellent                                     Average tide -0.32 - 0.39 m (0.035 m)
    "COPERNICUS/S2/20180212T001111_20180212T001105_T56KKC",  // 0.5 - 1.5 m (ereefs GBR4 v2)
    "COPERNICUS/S2/20181015T001109_20181015T001105_T56KKC", // -0.39 - -0.07 m
    "COPERNICUS/S2/20190811T001119_20190811T001116_T56KKC", // -0.44 - 0.0 m 
    "COPERNICUS/S2/20190905T001111_20190905T001109_T56KKC", // 0.8 - 1.8 m
    "COPERNICUS/S2/20190910T001109_20190910T001110_T56KKC", // -0.36 - 0.46 m
    "COPERNICUS/S2/20191109T001109_20191109T001108_T56KKC", // -0.07 - 0.95 m
    "COPERNICUS/S2/20200716T001109_20200716T001110_T56KKC", // -0.65 - -0.41
    "COPERNICUS/S2/20200726T001109_20200726T001111_T56KKC", // -1.17 - -0.33
    "COPERNICUS/S2/20200810T001121_20200810T001115_T56KKC", // -0.79 - 0.29
    "COPERNICUS/S2/20200815T001109_20200815T001112_T56KKC", // -0.59 - -0.18
    "COPERNICUS/S2/20210711T001109_20210711T001111_T56KKC", // 0.12 - 0.83
    "COPERNICUS/S2/20210721T001109_20210721T001111_T56KKC", // -0.64 - 0.18 
    "COPERNICUS/S2/20210726T001111_20210726T001112_T56KKC"  // -0.43 - 0.03
  ],
  false, true, REF1_OPTIONS);
