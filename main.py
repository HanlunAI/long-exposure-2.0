import argparse
import imutils
import cv2

ap = argparse.ArgumentParser()
ap.add_argument("-v", "--video", required=True, help= "Path to input video file")
ap.add_argument("-o", "--output", required=True , help = "Path to output")
args = vars(ap.parse_args())
