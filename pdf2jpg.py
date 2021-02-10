# usage:
# python pdf2jpg.py ./uploads/resume.pdf ./uploads

from pdf2image import convert_from_path
import sys
import os

# pdf location
filename = sys.argv[1] 

# project folder
project = sys.argv[2]

images = convert_from_path(filename)
os.system(f'mkdir {project}')

for i in range(len(images)):

  images[i].save('page'+ str(i) +'.jpg', 'JPEG')

  os.system(f'mv page{i}.jpg ./{project}')

print('DONE: images: ' + str(len(images)))


