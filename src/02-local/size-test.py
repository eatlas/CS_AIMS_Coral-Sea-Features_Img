# This prints the size of an image
from PIL import Image

imagePath = '../../big-files/lossless/Global/S2_R1_DeepFalse/CS_AIMS_Coral-Sea-Features_Img_S2_R1_DeepFalse_01KCV.tif'

img=Image.open(imagePath)
w,h=img.size    # w=Width and h=Height
print("Width =",w,end="\t")
print("Height =",h)

