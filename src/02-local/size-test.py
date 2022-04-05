from PIL import Image

imagePath = '../../big-files/lossless/Global/S2_R1_DeepFalse/CS_AIMS_Coral-Sea-Features_Img_S2_R1_DeepFalse_01KCV.tif'

img=Image.open(imagePath)
w,h=img.size    # w=Width and h=Height
print("Width =",w,end="\t")
print("Height =",h)

import cv2
 
# read image
img = cv2.imread(imagePath, cv2.IMREAD_UNCHANGED)

# get dimensions of image
dimensions = img.shape
 
# height, width, number of channels in image
height = img.shape[0]
width = img.shape[1]
channels = img.shape[2]
 
print('Image Dimension    : ',dimensions)
print('Image Height       : ',height)
print('Image Width        : ',width)
print('Number of Channels : ',channels)