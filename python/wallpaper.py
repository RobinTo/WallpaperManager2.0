import ctypes
import sys
import os

# Usage
# python wallpaper.py imagename.png

path = os.path.abspath(os.path.join(os.getcwd(), sys.argv[1]))

print(path)
print(os.path.isfile(path))

SPI_SETDESKWALLPAPER = 20
ctypes.windll.user32.SystemParametersInfoA(SPI_SETDESKWALLPAPER, 0, path, 0)