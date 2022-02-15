// Copyright 2022 Eric Lawrey - Australian Institute of Marine Science
// MIT License https://mit-license.org/


// This script allows the user to browse through the Sentinel 2 image catalogue to
// manually select the clearest images available. These can then be
// collated into a collection for subsequent processing.
// The IDs of the images at each step can be found in the console.
// 
// This tool was used to select the images to include in the final 
// composite images (i.e. in the 03-create-composite-X.js scripts).


// === README: ====
// If you modify your copy of s2Utils.js you must change this path, changing
// the username. GEE only allows absolute paths.
var s2Utils = require('users/ericlawrey/CS_AIMS_Coral-Sea-Features_Imagery:src/01-gee/s2Utils.js');
 
// Date range to iterate through the Sentinel 2 imagery.
var START_DATE = '2015-01-01';
var END_DATE = '2022-1-20';

// Maximum cloud cover to include the image. Setting a low value removes
// images that have lots of clouds. 
// - A setting of 0% doesn't work.
// - In many areas setting this to 0.1 (%) means that about 30 - 50% of the
// images are useful for generating final composite images. 
// - In areas near the equator (where there are more clouds) there are
// far fewer low cloud images. In which case 10% cloud is probably a better
// starting value.
// - For remote areas where there are very few images this can be raised up 
// to 100 (%) to allow previewing of all available imagery.
var CLOUDY_PIXEL_PERCENTAGE = 0.1;

// Sentinel 2 tiling grid to review the images for.
// Use the map link below to find the tileID for the area of interest.
// https://maps.eatlas.org.au/index.html?intro=false&z=7&ll=146.90137,-19.07287&l0=ea_ref%3AWorld_ESA_Sentinel-2-tiling-grid_Poly,google_SATELLITE
var tileID;

// This script only processes one tileID. Uncomment the tileID of the area under investigation.
// Normally the process is to select the best images to use for subsequent processing
// for each tile. Ensure that only one tileID is set then progressively record the Google Earth
// image IDs of the best images. This can then be copied into 03-create-composite.
// It typically takes 30 - 60 mins to preview all the images for a tile area (due to the limited
// processing speed of the Google Earth Engine.)
//
// Note the tile selection and the matching reefs in each tile were determined using:
//  - Sentinel 2 UTM Tiling Grid https://eatlas.org.au/data/uuid/f7468d15-12be-4e3f-a246-b2882a324f59
//  - Coral Sea geomorphic features (JCU) https://eatlas.org.au/data/uuid/25685ba5-6583-494f-974d-cce2f3429b78

//tileID = '55LBK';     // Boot Reef, Portlock Reefs (Coral Sea) - Far North
//tileID = '54LZP';     // Ashmore Reef (Coral Sea) - Far North
//tileID = '55LDE';     // Osprey Reef (Coral Sea) - North
//tileID = '55LEC';     // Bougainville Reef (Coral Sea) - Central
//tileID = '55LGC';     // Diane Bank (Coral Sea) - Central
//tileID = '55LHC';     // Willis Islets (Coral Sea) - Central
//tileID = '55KEB';     // Holmes Reefs (West), Flora Reef, McDermott Bank (Coral Sea) - Central
//tileID = '55KFB';     // Holmes Reefs (East) (Coral Sea) - Central
//tileID = '55KGB';     // Herald Cays, Willis Islets, Magdelaine Cays (West) (Coral Sea) - Central
//tileID = '55KHB';     // Magdelaine Cays, Coringa Islet (East), U/N reef (Coral Sea) - Central
//tileID = '56KLG';     // North Lihou Reef (Coral Sea, Australia) - Central
                        // (Boundaries: 25, Dry Reefs: 15, Cays/Islands: 6 )
//tileID = '56KMG';     // North East Lihou Reef tip (Coral Sea, Australia) - Central
//tileID = '55KFA';     // Flinders, Dart Heralds Surprise (Coral Sea) - Central
//tileID = '55KGA';     // Malay Reef, Magdelaine Cays, Coringa Islet (South), Abington Reef, 
                        // U/N Reef (Coral Sea) - Central
//tileID = '55KHA';     // Tregrosse Reefs, Diamond Islet West, Magdelaine Cays, Coringa Islet (South) 
                        // (Coral Sea) - Central
//tileID = '56KKF';     // Tregrosse Reefs, Diamond Islet (Coral Sea) - Central
//tileID = '56KLF';     // (V0) Lihou reef (South West) (Coral Sea, Australia) - Central
//tileID = '56KMF';     // Lihou reef (West) (Coral Sea, Australia) - Central
//tileID = '56KQF';     // Mellish Reef (Coral Sea) - Central
                        // This tile only had 2 images with < 1% cloud cover,
                        // neither of them were useful.
                        // Raising the threshold to 3% only gave 5 images, none
                        // of which were useful. We therefore instead use the neighbouring
                        // tile to pick up Mellish Reef.
//tileID = '56KRF';     // Mellish Reef (Coral Sea) - Central
                        // Raising the CLOUDY_PIXEL_PERCENTAGE to 10% still
                        // only resulted in 6 images. All of which were used.
//tileID = '56KME';     // (V0) Marion Reef (North) (Coral Sea, Australia) - Central
//tileID = '56KMD';     // (V0) Marion Reef (South) (Coral Sea, Australia) - Central
//tileID = '56KPC';     // Calder Bank, Coral Sea - South
//tileID = '56KNB';     // Saumarez Reefs (North) (Coral Sea, Australia) - South
//tileID = '56KPB';     // (V0) Frederick Reef (Coral Sea, Australia) - South
//tileID = '56KQB';     // Kenn Reefs (Coral Sea) - South
//tileID = '56KNA';     // Saumarez Reefs (South) (Coral Sea) - South
//tileID = '56KQA';     // Wreck Reefs (Coral Sea) - South
//tileID = '56KQV';     // Cato Reef (Coral Sea) - South
//tileID = '55LCJ';     // Eastern Fields (PNG) - Far North (Just ouside Coral Sea Marine Park)


// Sea mounts that probably don't have reefs.
//tileID = '56KQU';     // Fraser Seamount - South
//tileID = '56KQE';     // U/N Sea mount - Central AUS04634 - 29 m feature in marine chart 
                      // Only partial image scenes. 16 images, but none with clear
                      // view over reef area.
//tileID = '57KTS';   // Selfridge Rock (https://web.archive.org/web/20130305015208/http://www.shom.fr/fileadmin/data-www/01-LE_SHOM/02-ACTUALITES/01-LES_COMMUNIQUES/fig_2_-_Sandy_Island.png)
                    // Only one image and it has high cloud cover
//tileID = '57KUS';   // Selfridge Rock 2 images but neither are useful.
//tileID = '56KRB';   // Obstn Rep (1962) AUS04643 - only 1 image covered in clouds

//tileID = '56KKG';   // Magdelaine Cays, Coringa Islet (Coral Sea, Australia) (Boundaries: 8, Dry Reefs: 2, Cays/Islands: 2 )


// Potential shallow areas in Eastern Coral Sea
// These areas were identified as having potentially shallow areas based
// on the SRTM30-plus v8.0 dataset. 
//tileID = '57KXT';   
//tileID = '57KYT';       // Lansdowne Bank (potential 29 m Obstn)
//tileID = '57KYS';
//tileID = '57KZS';
//tileID = '57KXS';
//tileID = '57KWP';
//tileID = '57JWN';

// ------------- Global test reefs --------------
// Reefs around the world for testing the definition of reef boundaries

// Drowned coral atoll reefs because of subsidence 
//tileID = '56NLP';   // Federated States of Micronesia (0 images available)
//tileID = '55PHK';   // Federated States of Micronesia (0 images available)
//tileID = '56PLQ';   // Federated States of Micronesia (0 images available)
tileID = '56PMQ';   // Federated States of Micronesia (0 images available)

// Near surface drowned continental areas
//tileID = '41LMJ';   // Saya de Malha Banks (1 image, not much vis)
//tileID = '41LLJ';   // Saya de Malha Banks (6 images, 2 usable images)
//tileID = '41LLK';   // Saya de Malha Banks 

//tileID = '57KVV';   // Chesterfield Reefs 7 images
//tileID = '57KVU';   // Chesterfield Reefs
//tileID = '57KVT';   // Chesterfield Reefs
//tileID = '57KVS';   // Chesterfield Reefs  11 images
//tileID = '57KWS';   // Chesterfield Reefs, lots of sunglint
//tileID = '57KWR';   // Chesterfield Reefs, Not images at 0.1% cloud
//tileID = '57KWU';   // Chesterfield Reefs, Infamous non existant 'Sandy Island'
//tileID = '57KWR';     // Chesterfield Reefs, South (3 images, 1 blank, 2 with heavy clouds)
//tileID = '57KWQ';     // Chesterfield Reefs, South (3 images, 1 blank, 2 with heavy clouds, 0 usable images)
//tileID = '57KXT';     // New caledonia, Lansdowne Bank
// --------------------------------------------------------

//tileID = '58KCC';     // New caledonia, Yande Island                
//tileID = '58KFC';     // New Caledonia, Ouvea
//tileID = '58KCD';       // New Caledonia, North, Wala
//tileID = '58KCE';       // New Caledonia, Far North East
//tileID = '58KBE';       // New Caledonia, Far North West
//tileID = '01KCV';     // Fiji, Moce, Tubou
//tileID = '06LWH';     // French Polynesia, Palliser Islands, Kaukura Atoll
//tileID = '06LUJ';     // French Polynesia, Tikehau, Mataiva Atoll
//tileID = '04NFH';     // Kitibati, Kiritimati
//tileID = '58PGR';     // Marshall Islands, Kwajalein Atoll
//tileID = '58PET';     // Marshall Islands, Bikini Atoll
//tileID = '55PHK';     // Makur Islands, Namonuito Atoll
//tileID = '53NMJ';     // Palau
//tileID = '43NCE';     // Maldives, Hulhumale
//tileID = '56LKR';     // PNG, Trobriand Islands
//tileID = '56LLN';     // PNG, 
//tileID = '54LZN';       // Australia, GBR, Raine Island
//tileID = '54LZM';       // Australia, GBR, Great Detached reef, Wishbone reef
//tileID = '54LYM';       // Australia, GBR, Cockburn Reef, Nomad Reef, Gallon Reef
//tileID = '55KGU';     // Australia, GBR, Hardy Reef, Block Reef
//tileID = '55LCD';     // Australia, GBR, Lizard Island, Ribbon No 10 reef

//tileID = '55KFU';     // Australia, GBR, Dingo Reefs, Gould Reefs
//tileID = '56KKC';     // Australia, GBR, Cockatoo Reef, Hopley comparison 
//tileID = '55KCB';     // Australia, GBR, Green Island, Arlington, Hopley comparison
                      // For comparision with Hopley D, et. al., (2007), 
                      // The Geomorphology of the Great Barrier Reef
//tileID = '56KLB';       // Australia, GBR, North west Swains, Heralds Reef
//tileID = '56KMA';       // Australia, GBR, South east Swains, Horseshoe, Hackle
//tileID = '56KMU';       // Australia, GBR, Lady Musgrave
//tileID = '55KEV';       // Australia, GBR, Davies, Grub, Chicken
//tileID = '51LUE';     // Australia, WA, Scott Reef
//tileID = '49KGR';     // Australia, WA, Ningaloo reef
//tileID = '51LYE';     // Australia, WA, Bonaparte Archipelago, Long Reef 
//tileID = '49JGM';     // Australia, WA, Shark bay. This scene is used to highlight
                      // recognising dark substrates due to the seagrass meadows.
//tileID = '51LZJ';     // North West Shelf, Australia, Timor Sea, Big Bank Shoals
                      // Aligns with:
                      // A. Heyward, E. Pinceratto, L. Smith (1997) Big Bank Shoals of the Timor Sea. An Environmenal Resource Atlas
//tileID = '51LXG';   // North West Shelf, Australia. Baracouta East Shoal
//tileID = '51LXF';   // North West Shelf, Australia. Vulcan, Goeree Shoals
                      // https://northwestatlas.org/nwa/pttep/synthesis2
//tileID = '51LWG';                      // North West Shelf, Australia, Ashmore reef
//tileID = '51LXH';     // North West Shelf
//tileID = '51LYH';     // North West Shelf
//tileID = '51LWH';     // North West Shelf
//tileID = '51MWT';       // Indonesia, Melilis Island
//tileID = '51PWN';       // Philippines, Visayan Sea, Bantayan Island
//tileID = '37PFT';       // Eritrea, Red Sea, Dahlak Marine National Park

// Western Australia - Pilbra
tileID = '50KQD';   // Australia, Western Australia, North East of Port Headland
//tileID = '50KPD';   // Australia, Western Australia, North of Port Headland
//tileID = '50KPC';   // Australia, Western Australia, Port Headland

s2Utils.createSelectSentinel2ImagesApp(tileID, START_DATE, END_DATE, CLOUDY_PIXEL_PERCENTAGE);

