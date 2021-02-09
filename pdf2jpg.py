# # import module
 
# # Store Pdf with convert_from_path function
# images = convert_from_path(r'resume.pdf')
 
# for i in range(len(images)):
   
#       # Save pages as images in the pdf
#     images[i].save('page'+ str(i) +'.jpg', 'JPEG')
from pdf2image import convert_from_path
import glob
for name in glob.glob('uploads/*.pdf'):
    print(name)
    images = convert_from_path("C:/Users/DANIEL/Desktop/projects/node-presentation/uploads/resume.pdf")

    for i in range(len(images)):
   
      # Save pages as images in the pdf
        images[i].save('page'+ str(i) +'.jpg', 'JPEG')
print('done')