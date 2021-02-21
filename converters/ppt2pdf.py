# usage:
# python ppt.py ./powerpoint.ppt ./uploads

import sys
import os

# ppt location
filename = sys.argv[1] 

# project folder
project = sys.argv[2]

os.system(f'soffice --headless --convert-to pdf {filename}')
