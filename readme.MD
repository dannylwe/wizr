# Quick fix mongo error  
npm uninstall mongodb --save  
npm i mongodb@3.6.3 

## Access mongo container
docker exec -it mongo-container bash

## Access mongo from terminal
mongo -u user -p password --authenticationDatabase admin