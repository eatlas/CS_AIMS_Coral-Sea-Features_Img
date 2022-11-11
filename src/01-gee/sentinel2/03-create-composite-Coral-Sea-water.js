var s2Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Img:src/01-gee/sentinel2/s2Utils.js');
// ===============================================================
//
//                 CORAL SEA - OPEN WATER
//
// ===============================================================
// These images correspond to areas that should have no reefs
// in the Coral Sea, or overlap with a existing main image of a reef. 
// These scenes are included for checking that there are no unknown reefs.
// It should be noted that it is very difficult to spot small reefs deeper
// than 25 m without knowing that it already exists. No new reefs were
// discovered in this imagery, however this doesn't mean that reefs weren't missed.
//
// Landsat 8 imagery, Sentinel 3 imagery and AHO Marine Charts were also
// used to ensure that all features were mapped.
// 
// Some of the scenes neighbouring the GBR marine park have reefs
// in the GBR. These are however not the focus of this imagery. As such
// the selection of images was optimised for clarity in the open waters
// of the Coral Sea.

var OPEN_WATER_OPTIONS = {
  colourGrades: ['DeepFalse'],
  exportScale: [10],
  exportBasename: 'CS_AIMS_Coral-Sea-Features_Img_S2_R1',
  exportFolder: 'EarthEngine/CS_AIMS_Coral-Sea-Features_Img/Coral-Sea-Water',
  
  applySunglintCorrection: true,
  applyBrightnessAdjustment: true
};

// (Central) Coral Sea, North west of Lihou
// CLOUDY_PIXEL_PERCENTAGE = 10
// 20 of 20 images
s2Utils.s2_composite_display_and_export(
  [
    // Good left
    "COPERNICUS/S2/20170821T000959_20170821T000959_T56LNH",
  
    // OK left
    "COPERNICUS/S2/20170905T000731_20170905T000731_T56LNH",
  
    // OK - Right
    "COPERNICUS/S2/20160110T235802_20160110T235756_T56LNH",
    
    // Maybe - right
    "COPERNICUS/S2/20151111T235752_20151112T000054_T56LNH",
    "COPERNICUS/S2/20151231T235802_20160101T000029_T56LNH",
    "COPERNICUS/S2/20160120T235752_20160121T000021_T56LNH",
    "COPERNICUS/S2/20160219T235752_20160219T235825_T56LNH",
    
    // Maybe - left
    "COPERNICUS/S2/20160403T000742_20160403T000911_T56LNH",
    "COPERNICUS/S2/20170826T001101_20170826T001104_T56LNH"
  ],
  false, false, OPEN_WATER_OPTIONS); 
  
// (Central) Coral Sea, North west of Lihou
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 25 of 25 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent - Bottom
    "COPERNICUS/S2/20190702T001119_20190702T001117_T56LMH",
    "COPERNICUS/S2/20190905T001111_20190905T001109_T56LMH",
    "COPERNICUS/S2/20210721T001109_20210721T001111_T56LMH",
    
    // Good
    "COPERNICUS/S2/20170821T000959_20170821T000959_T56LMH",
    
    // OK
    "COPERNICUS/S2/20170905T000731_20170905T000731_T56LMH"
  ],
  false, false, OPEN_WATER_OPTIONS); 
  

// (Central eastern) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 100
// 24 of 24 images
s2Utils.s2_composite_display_and_export(
  [ 
  
    // Good - right
    "COPERNICUS/S2/20160107T234812_20160107T234811_T56LRJ",
    
    // Maybe left
    "COPERNICUS/S2/20160409T235756_20160410T012314_T56LRJ",
    "COPERNICUS/S2/20160429T235802_20160429T235802_T56LRJ",
    // Maybe right
    //"COPERNICUS/S2/20151208T234812_20151208T234812_T56LRJ",
    //"COPERNICUS/S2/20160317T234812_20160317T234939_T56LRJ",
    //"COPERNICUS/S2/20160406T234812_20160406T234954_T56LRJ"
  ],
  false, false, OPEN_WATER_OPTIONS); 


// (Central eastern) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 100
// 13 of 13 images
s2Utils.s2_composite_display_and_export(
  [ 
    // Maybe
    //"COPERNICUS/S2/20160110T235802_20160110T235756_T56LQJ", // Has some sunglint
    "COPERNICUS/S2/20160219T235752_20160219T235825_T56LQJ",
    "COPERNICUS/S2/20160310T235752_20160310T235753_T56LQJ",
    "COPERNICUS/S2/20160409T235756_20160410T012314_T56LQJ",
    "COPERNICUS/S2/20160429T235802_20160429T235802_T56LQJ"
  ],
  false, false, OPEN_WATER_OPTIONS); 


// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.5
// 40 of 40 images
s2Utils.s2_composite_display_and_export(
  [
  
    // Excellent bottom
    "COPERNICUS/S2/20200823T002101_20200823T002100_T55false, false, OPEN_WATER_OPTIONS",
    
    // Good bottom
    "COPERNICUS/S2/20180725T002101_20180725T002055_T55false, false, OPEN_WATER_OPTIONS",
    "COPERNICUS/S2/20190819T002101_20190819T002057_T55false, false, OPEN_WATER_OPTIONS",
    "COPERNICUS/S2/20210609T002101_20210609T002055_T55false, false, OPEN_WATER_OPTIONS",
    "COPERNICUS/S2/20210724T002059_20210724T002056_T55false, false, OPEN_WATER_OPTIONS"
    
    // OK bottom
    //COPERNICUS/S2/20190705T002109_20190705T002103_T55false, false, OPEN_WATER_OPTIONS
    //COPERNICUS/S2/20190730T002101_20190730T002059_T55false, false, OPEN_WATER_OPTIONS
    //COPERNICUS/S2/20210604T002059_20210604T002055_T55false, false, OPEN_WATER_OPTIONS
    //COPERNICUS/S2/20210614T002059_20210614T002055_T55false, false, OPEN_WATER_OPTIONS
    
    // Maybe bottom
    //COPERNICUS/S2/20180710T002059_20180710T002053_T55false, false, OPEN_WATER_OPTIONS
    //COPERNICUS/S2/20180720T002049_20180720T002052_T55false, false, OPEN_WATER_OPTIONS
    //COPERNICUS/S2/20200629T002059_20200629T002057_T55false, false, OPEN_WATER_OPTIONS
    //COPERNICUS/S2/20200729T002059_20200729T002057_T55false, false, OPEN_WATER_OPTIONS
  ],
  false, false, OPEN_WATER_OPTIONS); 


// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.5
// 21 of 21 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent bottom
    "COPERNICUS/S2/20200729T002059_20200729T002057_T55LGD",
    "COPERNICUS/S2/20200823T002101_20200823T002100_T55LGD"
    
    // Good bottom
    //COPERNICUS/S2/20191122T002049_20191122T002051_T55LGD // Slight sunglint
    
    // OK bottom
    //COPERNICUS/S2/20180814T002051_20180814T002054_T55LGD
    //COPERNICUS/S2/20180829T002049_20180829T002045_T55LGD
    //COPERNICUS/S2/20210609T002101_20210609T002055_T55LGD
    //COPERNICUS/S2/20210614T002059_20210614T002055_T55LGD
    
    // Maybe bottom
    //COPERNICUS/S2/20171127T002051_20171127T002049_T55LGD
    //COPERNICUS/S2/20180426T002101_20180426T002056_T55LGD
  ],
  false, false, OPEN_WATER_OPTIONS);
  
// (North Eastern) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 100
// 23 of 23 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent right
    "COPERNICUS/S2/20160107T234812_20160107T234811_T56LRK",
    // Maybe right
    //COPERNICUS/S2/20151218T234812_20151218T234812_T56LRK
    //COPERNICUS/S2/20160317T234812_20160317T234939_T56LRK
    //COPERNICUS/S2/20160406T234812_20160406T234954_T56LRK
    //COPERNICUS/S2/20160416T234812_20160416T234813_T56LRK
    // Maybe left
    "COPERNICUS/S2/20160219T235752_20160219T235825_T56LRK",
    "COPERNICUS/S2/20160409T235756_20160410T012314_T56LRK",
    "COPERNICUS/S2/20160429T235802_20160429T235802_T56LRK"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
// (North Eastern) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 100
// 13 of 13 images
s2Utils.s2_composite_display_and_export(
  [
    // Maybe
    "COPERNICUS/S2/20151221T235802_20151221T235950_T56LQK",    // Half sunglint
    "COPERNICUS/S2/20151231T235802_20151231T235910_T56LQK",
    "COPERNICUS/S2/20160120T235752_20160121T000021_T56LQK",    // Some sunglint
    "COPERNICUS/S2/20160219T235752_20160219T235825_T56LQK",
    "COPERNICUS/S2/20160310T235752_20160310T235753_T56LQK",
    "COPERNICUS/S2/20160409T235756_20160410T012314_T56LQK",
    "COPERNICUS/S2/20160429T235802_20160429T235802_T56LQK"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
// (North Western) Coral Sea, east of Osprey
// CLOUDY_PIXEL_PERCENTAGE = 0.2
// 34 of 34 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent left
    "COPERNICUS/S2/20190906T002709_20190906T002709_T55LGE",
    
    // Good left
    "COPERNICUS/S2/20160608T002712_20160608T002733_T55LGE",
    "COPERNICUS/S2/20170817T002709_20170817T002704_T55LGE"
    
    // OK left
    //COPERNICUS/S2/20180623T002709_20180623T002706_T55LGE
    //COPERNICUS/S2/20180807T002711_20180807T002707_T55LGE
    
    // Maybe left
    //COPERNICUS/S2/20200821T002709_20200821T002711_T55LGE
    //COPERNICUS/S2/20210811T002711_20210811T002710_T55LGE
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
// (North Western) Coral Sea, east of Osprey
// CLOUDY_PIXEL_PERCENTAGE = 0.5
// 23 of 23 images
s2Utils.s2_composite_display_and_export(
  [
    // Good
    "COPERNICUS/S2/20160608T002712_20160608T002733_T55LFE",
    "COPERNICUS/S2/20190901T002711_20190901T002708_T55LFE",
    
    // OK
    "COPERNICUS/S2/20170703T003031_20170703T003031_T55LFE",
    "COPERNICUS/S2/20210801T002711_20210801T002711_T55LFE"
    
    // Maybe whole
    //COPERNICUS/S2/20160117T001732_20160117T001824_T55LFE
    //COPERNICUS/S2/20180807T002711_20180807T002707_T55LFE
    //COPERNICUS/S2/20200208T002701_20200208T002659_T55LFE
    //COPERNICUS/S2/20200602T002709_20200602T002709_T55LFE
    //COPERNICUS/S2/20210324T002711_20210324T002706_T55LFE
    //COPERNICUS/S2/20210508T002709_20210508T002705_T55LFE
    // Maybe right
    //COPERNICUS/S2/20160117T001732_20160117T001824_T55LFE
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
// (North Western) Coral Sea, north of Osprey
// CLOUDY_PIXEL_PERCENTAGE = 0.5
// 23 of 25 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20160608T002712_20160608T002733_T55LEF"
    
    // Good
    //COPERNICUS/S2/20151022T002722_20151022T002808_T55LEF  // Some sunglint
    //COPERNICUS/S2/20220118T002711_20220118T002708_T55LEF
    
    // OK
    //COPERNICUS/S2/20200208T002701_20200208T002659_T55LEF
    
    // Maybe
    //COPERNICUS/S2/20170114T002701_20170114T002908_T55LEF
    //COPERNICUS/S2/20170713T002711_20170713T002708_T55LEF
    //COPERNICUS/S2/20170817T002709_20170817T002704_T55LEF
    //COPERNICUS/S2/20180213T002659_20180213T002700_T55LEF
    //COPERNICUS/S2/20190305T002701_20190305T002702_T55LEF
    //COPERNICUS/S2/20190424T002711_20190424T002711_T55LEF
    //COPERNICUS/S2/20211005T002709_20211005T002707_T55LEF
  ],
  false, true, OPEN_WATER_OPTIONS);
  
  
  
// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 20 of 20 images
s2Utils.s2_composite_display_and_export(
  [
  
    // Excellent
    //COPERNICUS/S2/20180330T002711_20180330T002706_T55KDB // Turbid water on GBR side
    //COPERNICUS/S2/20181125T002701_20181125T002700_T55KDB // Bit turbid on GBR
    "COPERNICUS/S2/20190906T002709_20190906T002709_T55KDB", // Clear on GBR
    "COPERNICUS/S2/20200213T002659_20200213T002702_T55KDB",
    
    // Good
    //COPERNICUS/S2/20161115T002712_20161115T002822_T55KDB
    //COPERNICUS/S2/20170213T002701_20170213T002701_T55KDB
    "COPERNICUS/S2/20200816T002711_20200816T002713_T55KDB"
    // COPERNICUS/S2/20210722T002711_20210722T002711_T55KDB
  ],
  false, false, OPEN_WATER_OPTIONS);  
    // OK 
    //COPERNICUS/S2/20160219T003032_20160219T003057_T55KDB
    
// Maybe
//COPERNICUS/S2/20170822T002711_20170822T002708_T55KDB
//COPERNICUS/S2/20180514T002709_20180514T002706_T55KDB




// (Central) Coral Sea, west Dianne bank
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 7 of 7 images
s2Utils.s2_composite_display_and_export(
  [
    // Good
    "COPERNICUS/S2/20170905T000731_20170905T000731_T56LLH",
    "COPERNICUS/S2/20151115T000742_20151115T000740_T56LLH",

    // OK
    "COPERNICUS/S2/20200924T001109_20200924T001111_T56LLH",
    "COPERNICUS/S2/20201024T001109_20201024T001112_T56LLH"
  ],
  false, false, OPEN_WATER_OPTIONS);

// (Central) Coral Sea, west Dianne bank
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 18 of 18 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20180725T002101_20180725T002055_T56LKH",
    "COPERNICUS/S2/20200823T002101_20200823T002100_T56LKH"
  ],
  false, false, OPEN_WATER_OPTIONS);
// Good
//COPERNICUS/S2/20210724T002059_20210724T002056_T56LKH
// OK
//COPERNICUS/S2/20180605T002101_20180605T002055_T56LKH



// (Central) Coral Sea, east Bougainville Reef
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 30 of 30 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent - right
    "COPERNICUS/S2/20170928T002051_20170928T002051_T55LFC",
    "COPERNICUS/S2/20181127T002049_20181127T002050_T55LFC",
    // Good right
    "COPERNICUS/S2/20160913T002102_20160913T002102_T55LFC",
    "COPERNICUS/S2/20190918T002051_20190918T002054_T55LFC",
    "COPERNICUS/S2/20191127T002051_20191127T002054_T55LFC",

    // Good left
    "COPERNICUS/S2/20190906T002709_20190906T002709_T55LFC",
    "COPERNICUS/S2/20210722T002711_20210722T002711_T55LFC",
    "COPERNICUS/S2/20210801T002711_20210801T002711_T55LFC"
  ],
  false, false, OPEN_WATER_OPTIONS);
// OK - left
//COPERNICUS/S2/20180812T002659_20180812T002702_T55LFC



// (Central) Coral Sea, west Bougainville Reef
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 13 of 13 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20180330T002711_20180330T002706_T55LDC",
    "COPERNICUS/S2/20181125T002701_20181125T002700_T55LDC",
    "COPERNICUS/S2/20210722T002711_20210722T002711_T55LDC"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
// Good
//COPERNICUS/S2/20161115T002712_20161115T002822_T55LDC
//COPERNICUS/S2/20190109T002709_20190109T002706_T55LDC

// OK
//COPERNICUS/S2/20171220T002701_20171220T002702_T55LDC
//COPERNICUS/S2/20180812T002659_20180812T002702_T55LDC
//COPERNICUS/S2/20190906T002709_20190906T002709_T55LDC
//COPERNICUS/S2/20201124T002711_20201124T002709_T55LDC


// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 14 of 14 images
s2Utils.s2_composite_display_and_export(
  [
    //Excellent bottom
    "COPERNICUS/S2/20200729T002059_20200729T002057_T55LGD",

    // Good bottom
    "COPERNICUS/S2/20191122T002049_20191122T002051_T55LGD"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
// OK bottom
//COPERNICUS/S2/20180829T002049_20180829T002045_T55LGD
//COPERNICUS/S2/20210614T002059_20210614T002055_T55LGD




// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 13 of 13 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20210801T002711_20210801T002711_T55LFD"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
// OK
//COPERNICUS/S2/20180723T002709_20180723T002705_T55LFD
//COPERNICUS/S2/20200602T002709_20200602T002709_T55LFD
//COPERNICUS/S2/20200821T002709_20200821T002711_T55LFD



// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 10 of 10 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20210309T002709_20210309T002706_T55LED",  // Large nutrient plume?

    // Maybe - Including these because the excellent image has a nutrient plume
    "COPERNICUS/S2/20180213T002659_20180213T002700_T55LED",
    "COPERNICUS/S2/20200816T002711_20200816T002713_T55LED",
    "COPERNICUS/S2/20200821T002709_20200821T002711_T55LED"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 11 of 11 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20181125T002701_20181125T002700_T55LDD",

    // Good
    "COPERNICUS/S2/20190618T002719_20190618T002715_T55LDD",
    "COPERNICUS/S2/20210309T002709_20210309T002706_T55LDD"
  ],
  false, false, OPEN_WATER_OPTIONS);
// OK
//COPERNICUS/S2/20201025T002711_20201025T002713_T55LDD

// Maybe
//COPERNICUS/S2/20171220T002701_20171220T002702_T55LDD
//COPERNICUS/S2/20210722T002711_20210722T002711_T55LDD


// (North Western) Coral Sea, east of Osprey
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 10 of 10 images
s2Utils.s2_composite_display_and_export(
  [
    // OK
    "COPERNICUS/S2/20200319T002701_20200319T002704_T55LEE",

    // Maybe
    "COPERNICUS/S2/20171230T003031_20171230T003026_T55LEE",
    "COPERNICUS/S2/20160608T002712_20160608T002733_T55LEE",
    "COPERNICUS/S2/20190424T002711_20190424T002711_T55LEE",
    "COPERNICUS/S2/20210508T002709_20210508T002705_T55LEE"
  ],
  false, false, OPEN_WATER_OPTIONS);

// (North Western) Coral Sea, west of Osprey
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 12 of 12 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20200819T003711_20200819T003710_T55LCE",
    // Good
    "COPERNICUS/S2/20180711T003711_20180711T003706_T55LCE"
  ],
  false, false, OPEN_WATER_OPTIONS);


// OK
//COPERNICUS/S2/20180810T003701_20180810T003704_T55LCE

// Maybe
//COPERNICUS/S2/20180820T003701_20180820T003704_T55LCE
//COPERNICUS/S2/20190721T003719_20190721T003713_T55LCE



// (North Western) Coral Sea, north of Osprey
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 23 of 23 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent - Left
    "COPERNICUS/S2/20180820T003701_20180820T003704_T55LDF",
    // OK right
    "COPERNICUS/S2/20190424T002711_20190424T002711_T55LDF",
    "COPERNICUS/S2/20190901T002711_20190901T002708_T55LDF"
    
  ],
  false, false, OPEN_WATER_OPTIONS);

// OK - left
//COPERNICUS/S2/20170731T003959_20170731T003954_T55LDF
// Maybe - right
//COPERNICUS/S2/20171215T002659_20171215T002655_T55LDF
//COPERNICUS/S2/20190109T002709_20190109T002706_T55LDF

// Maybe -left
//COPERNICUS/S2/20180726T003659_20180726T003702_T55LDF


// (North Western) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 12 of 12 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20180820T003701_20180820T003704_T55LCF"
  ],
  false, false, OPEN_WATER_OPTIONS);
  // OK
  // COPERNICUS/S2/20190825T003711_20190825T003706_T55LCF
  // Maybe
  // COPERNICUS/S2/20170731T003959_20170731T003954_T55LCF
  // COPERNICUS/S2/20180726T003659_20180726T003702_T55LCF
  
  
  
  
// (North Western) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 13 of 13 images
s2Utils.s2_composite_display_and_export(
  [
    // Good
    "COPERNICUS/S2/20180820T003701_20180820T003704_T55LBF",
    "COPERNICUS/S2/20200819T003711_20200819T003710_T55LBF"
  ],
  false, false, OPEN_WATER_OPTIONS);
// OK
//COPERNICUS/S2/20180924T003659_20180924T003658_T55LBF

// Maybe
//COPERNICUS/S2/20191208T003659_20191208T003658_T55LBF
//COPERNICUS/S2/20201008T003711_20201008T003710_T55LBF



// (North Western) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 7 of 7 images
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20180820T003701_20180820T003704_T55LBG"
  ],
  false, false, OPEN_WATER_OPTIONS);
// Good
// COPERNICUS/S2/20180924T003659_20180924T003658_T55LBG
// COPERNICUS/S2/20190825T003711_20190825T003706_T55LBG

// Maybe
// COPERNICUS/S2/20200819T003711_20200819T003710_T55LBG



// (North Western) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 1
// 20 of 20 images
s2Utils.s2_composite_display_and_export(
  [
    //Maybe
    "COPERNICUS/S2/20180820T003701_20180820T003704_T55LCH",
    "COPERNICUS/S2/20181213T003659_20181213T003658_T55LCH",
    "COPERNICUS/S2/20190507T003711_20190507T003708_T55LCH",
    "COPERNICUS/S2/20190616T003711_20190616T003708_T55LCH",
    "COPERNICUS/S2/20190701T003719_20190701T003713_T55LCH",
    "COPERNICUS/S2/20200615T003709_20200615T003707_T55LCH",
    "COPERNICUS/S2/20210506T003701_20210506T003703_T55LCH"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
  
// (North Western) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.5
// 11 of 11 images
s2Utils.s2_composite_display_and_export(
  [
    //OK - Right
    "COPERNICUS/S2/20180917T004659_20180917T004657_T55LBH",
    "COPERNICUS/S2/20180924T003659_20180924T003658_T55LBH",
    
    // Maybe - Right
    "COPERNICUS/S2/20181213T003659_20181213T003658_T55LBH",
    "COPERNICUS/S2/20200226T003659_20200226T003701_T55LBH", // Algal Plume
    "COPERNICUS/S2/20201127T003711_20201127T003705_T55LBH",
    "COPERNICUS/S2/20211122T003711_20211122T003705_T55LBH"
  ],
  false, false, OPEN_WATER_OPTIONS);
  
  
// (North Western) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.5
// X of 35 images
s2Utils.s2_composite_display_and_export(
  [
    // Good right
    "COPERNICUS/S2/20181009T003701_20181009T003701_T55LBJ", 
    // OK right
    "COPERNICUS/S2/20180417T003709_20180417T003703_T55LBJ",
    "COPERNICUS/S2/20181213T003659_20181213T003658_T55LBJ",
    "COPERNICUS/S2/20191223T003701_20191223T003659_T55LBJ",
    
    // Good left
    "COPERNICUS/S2/20210723T004709_20210723T004708_T55LBJ",
    
    // OK left
    "COPERNICUS/S2/20200414T004711_20200414T004705_T55LBJ",
    "COPERNICUS/S2/20200802T004711_20200802T004712_T55LBJ"
  ],
  false, false, OPEN_WATER_OPTIONS);
// Maybe left
//COPERNICUS/S2/20180614T004711_20180614T004705_T55LBJ
//COPERNICUS/S2/20190510T004711_20190510T004710_T55LBJ
//COPERNICUS/S2/20200613T004711_20200613T004712_T55LBJ


// Maybe right
//COPERNICUS/S2/20190904T003711_20190904T003705_T55LBJ
//COPERNICUS/S2/20200216T003659_20200216T003700_T55LBJ
//COPERNICUS/S2/20210506T003701_20210506T003703_T55LBJ

// ======== Fraser Seamount - South =========
// Searched 40 out of 40 images
// CLOUD_PIXEL_PERCENTAGE 0.3%
s2Utils.s2_composite_display_and_export(
  [
    // Excellent
    "COPERNICUS/S2/20160923T235242_20160923T235240_T56KQU",
    "COPERNICUS/S2/20170908T235241_20170908T235243_T56KQU",
    "COPERNICUS/S2/20180829T235239_20180829T235235_T56KQU",
    "COPERNICUS/S2/20190506T235259_20190506T235253_T56KQU",
    "COPERNICUS/S2/20190918T235241_20190918T235244_T56KQU",
    "COPERNICUS/S2/20210724T235249_20210724T235247_T56KQU",
    "COPERNICUS/S2/20210828T235251_20210828T235246_T56KQU"
  ],
  false, false, OPEN_WATER_OPTIONS);

// Good
//    "COPERNICUS/S2/20190903T235249_20190903T235247_T56KQU",
//    "COPERNICUS/S2/20190908T235241_20190908T235244_T56KQU",
//    "COPERNICUS/S2/20200823T235251_20200823T235250_T56KQU"
  
