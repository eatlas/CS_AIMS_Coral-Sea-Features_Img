// ===============================================================
//
//                 CORAL SEA - OPEN WATER
//
// ===============================================================
// These images correspond to areas that should have no reefs
// in the Coral Sea. These scenes are include for checking that
// there are no unknown reefs.

var OPEN_WATER_OPTIONS = {
  colourGrades: ['DeepFalse'],
  exportScale: [10],
  exportBasename: 'World_AIMS_Marine-satellite-imagery_S2_R1',
  exportFolder: 'EarthEngine/World_AIMS_Marine-satellite-imagery/Event-images',
  
  applySunglintCorrection: true,
  applyBrightnessAdjustment: true
};

// (Central) Coral Sea
// CLOUDY_PIXEL_PERCENTAGE = 0.1
// 7 of 20 images
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