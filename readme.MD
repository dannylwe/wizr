## master wizr take home project

At the moment, the functionality to upload an image and get slides(png) is not fully realized. The  
server hosted on AWS fails to redirect. The default redirect on browsers is in HTTPS while the server  is serving only HTTP. To upload an image/presentation. This has to be done through Postman that  accepts HTTP.

Below are images of the pages successfully rendering.

![](https://res.cloudinary.com/dk6gfgrmc/image/upload/v1613991215/wizr2_mhcbgw.png)  
![](https://res.cloudinary.com/dk6gfgrmc/image/upload/v1613991201/wizr1_n9mw5t.png) 

The url link for the presentation is fed to the conversionAPI receives this link and converts to png images. The simple server may fail to hold a successful connection and the url to convert has to be converted using a a local connection.

The resultant images are upload through the simple UI and hosted on cloudinary. This is the source of the images in the slider here: https://wizr.netlify.app/