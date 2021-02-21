var CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client');
var fs = require('fs');

var defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;

var Apikey = defaultClient.authentications['Apikey'];
Apikey.apiKey = process.env.CLOUDMERSIVE_API;

var apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi();

export function convert(filename){

    var inputFile = Buffer.from(fs.readFileSync(filename).buffer); 
    
    var callback = function(error, data, response) {
      if (error) {
        console.error(error);
      } else {
        console.log('API called successfully. Returned data: ' + data);
      }
    };
    apiInstance.convertDocumentPptxToPng(inputFile, callback);
}