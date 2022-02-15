# Coral Sea Features Satellite imagery (Sentinel 2 and Landsat 8) 2015 – 2021 (AIMS)

Eric Lawrey – 14 Feb 2022

Australian Institute of Marine Science

This repository contains all the scripts used to create the imagery used in the 
development of the Coral Sea Features dataset. This dataset contains satellite
imagery of the Coral Sea reef areas and select reef areas around the Globe.
The purpose of the Globe imagery is to develop training examples of reef mapping, 
while the Coral Sea imagery is to digitise the boundaries of coral reefs.

This repository contains: 
1. Google Earth Engine javascript code that generates the satellite image composites 
and exports them to Google Drive. 
2. Local Python scripts for subsequent optimisation of the image file format and 
generation of GDAL virtual layers. 

This repository does not contain the image data itself. 


This dataset contains processing for two regions:
- Coral Sea: Used for mapping the reefs for the [Coral Sea mapping project](https://eatlas.org.au/projects-other/coral-sea-reef-mapping)
- Global: Selected reef areas around Australia and the rest of the world. These
were done to test how well the image processing algorithms work across the globe
and to allow validation of the approach used for reef boundary mapping with a
diverse set of reefs.

This repository is intended to allow others to reproduce and extend this
dataset. 

More information about this dataset can be found on the 
[Dataset metadata page](https://eatlas.org.au/data/uuid/df5a5b47-ad4c-431e-be49-af52f64aafce).

This dataset is an update and improvement to the 
[Coral Sea Sentinel 2 Marine Satellite Composite Draft Imagery version 0 (AIMS)](https://eatlas.org.au/data/uuid/2932dc63-9c9b-465f-80bf-09073aacaf1c)
dataset.

## Dataset description

This dataset contains composite satellite images for the Coral Sea
region based on 10 m resolution Sentinel 2 imagery from 2015 – 2021. This dataset
also contains processing of Landsat 8 imagery.

This collection contains composite imagery for 31 Sentinel 2 tiles in the Coral Sea. 

For each tile there are 5 different colour and contrast enhancement styles intended 
to highlight different features.

![Preview map of this dataset](./examples/CS_AIMS_Sentinel-2-marine_V0_preview-map.jpg)
A preview of the dataset and the image styles. 

## Setup and installation
This dataset is created using the Google Earth Engine followed by some
file format adjustments using a Python script to process the imagery using
GDAL tools.

To reproduce this dataset from scratch you will need:
 - [Google Earth Engine account](https://earthengine.google.com/)
 - Python and GDAL installed (On Windows [OSGeo4W](https://www.osgeo.org/projects/osgeo4w/) is recommended)
 


The `src\01-gee` folder contains the scripts that should be
run on the Google Earth Engine. To set these up create a new Repository
and copy the scripts into the repo. Each script includes a description
of their purpose.

The `src\03-local` contains the scripts for converting the output
images from Google Earth Engine into the final imagery. More information
can be found in the [READMD.md](./03-local-scripts) file.

### Reproducing this dataset

The easiest way to reproduce the images in this dataset is to copy the 
`src\01-gee` javascript files into you interactive session in Google
Earth Engine. To get them to run you need to adjust the path to the
`s2Utils` to ensure you are running the same version used in the creation
of this dataset. 

## Clone this repository into Google Earth Engine
If you want to entended the code in this repository it is probably better to
clone the entire repository into GEE. To do this:

1. Create an empty repository in GEE using `Scripts\NEW\Repository`. Name the 
repository `CS_AIMS_Coral-Sea-Features_Imagery`. Technically the names don't need
to match but it could get confusing if the names don't match.

2. On you local machine clone the repository from GitHub. 
```
git clone https://github.com/eatlas/CS_AIMS_Coral-Sea-Features_Imagery.git
```

3. Change into the newly downloaded empty repository, cloned from GEE. 
```
cd CS_AIMS_Coral-Sea-Features_Imagery
```

4. Switch the push origin to the GEE repository. Find the path to your empty
GEE repository by hovering over the new repository and select the `Configure` 
button (it looks like a small cog). 
This will show the command to clone the new repository to your local machine. For
```
git clone https://earthengine.googlesource.com/users/<username>/CS_AIMS_Coral-Sea-Features_Imagery
```
We are interesting in the path to the repository. Add this as the push
origin.
```
git remote set-url origin https://earthengine.googlesource.com/users/<username>/CS_AIMS_Coral-Sea-Features_Imagery
```
5. Push the repository up to GEE.
```
git push 
```
6. Refresh the repositories in GEE. There is a refresh button next to the `NEW` button.
You can now make changes on your local machine and push them up to GEE. If you make changes
on GEE you will need to perform a `git pull`. 

## Pushing code back to GitHub
If you have write access you can push code back to GitHub instead of GEE using:
```
git push https://github.com/eatlas/CS_AIMS_Coral-Sea-Features_Imagery.git
```



## Common Issues with using the code
### Error in Google Earth Engine: Cannot find required repo: users/ericlawrey/CS_AIMS_Sentinel2-marine_V0:utils
If you make a copy of the code in your own repository then you need to update the path to the `s2Utils` script to point at your local copy. The `users/ericlawrey/CS_AIMS_Coral-Sea-Features_Imagery:s2Utils` is not public, thus can't be referenced from a copy. To fix this update the username and repository name to match your copy. 

### Does the `users/ericlawrey/World_ESA_Sentinel-2-tiling-grid` path need updating
This dataset is made public on the Google Earth Engine to allow it to be easily reused in the code and so its path does not need updating. You can find details of this dataset [here](https://code.earthengine.google.com/?asset=users/ericlawrey/World_ESA_Sentinel-2-tiling-grid)


## Videos

The following videos provide a walk through of the using the Google Earth Engine 
scripts to select good imagery then combine that imagery into a composite image 
for download.

[![Video Step 1 Selecting Sentinel 2 images in GEE](./media/vimeo-thumbnail-648150983.jpg)](https://www.youtube.com/watch?v=D-CVQVNIjAs "Selecting clear Sentinel 2 imagery in Google Earth Engine (Coral Sea Mapping project) - Part 1 - Click to Watch!")

[![Video Step 2 Creating composite images in GEE](./media/vimeo-thumbnail-648151138.jpg)](https://www.youtube.com/watch?v=bDF-Uq8Ljt8 "Viewing and exporting Sentinel 2 composite images in GEE (Coral Sea Mapping Project) - Part 2 - Click to Watch!")

[![Video Sentinel 2 composite images in GEE](./media/2021-12-02_Selecting-best-imagery_Thumbnail.jpg)](https://www.youtube.com/watch?v=EqmLZmxZcQc "Selecting the best Coral Sea imagery (Coral Sea Mapping project) - Click to Watch!")


