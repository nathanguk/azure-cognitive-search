module.exports = async function (context, req) {
    context.log("Image Processing Function Started!!!!");

    //Import Modules
    var Vision = require('azure-cognitiveservices-vision');
    var CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

    //Cognitive Services API Credentials
    var serviceKey = process.env.VISION_KEY;
    var region = process.env.VISION_REGION;
    var endpoint = 'https://'+region+'.api.cognitive.microsoft.com';
    var credentials = new CognitiveServicesCredentials(serviceKey);
    var computerVisionApiClient = new Vision.ComputerVisionAPIClient(credentials, endpoint);

    //Create empty Array for output
    var values = [];

    //Parse all records input
    for(var value of req.body.values){

        context.log(JSON.stringify(value));

        //Input Blob
        let buff = Buffer.from(value.data.imageData.data, 'base64'); 

        //Call Image Service and get record
        var text = await imageQuery(buff, value);

    };


    //Response Body
    var body = {
       "values": values
    };

    //Log Response Body
    context.log(JSON.stringify(body));

    //Return Response
    context.res = {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200,
        body:body
    };

    
    //Function to get Image Attributes
    async function imageQuery(myBlob, value){
        context.log("Calling Vision API");

        await computerVisionApiClient.analyzeImageInStream(myBlob, {visualFeatures: ["Categories", "Tags", "Description", "Color"]})
          
            .then(async function(data){   
                var text = data.description.captions[0].text 

                var record = {
                    "recordId": value.recordId,
                    "data": {
                        "descriptions": [
                            {
                                "value": "description",
                                "description": ""
                            }
                        ]
                    },
                    "errors": [],
                    "warnings": []
                }
        
                record.data.descriptions[0].description = text;
        
                values.push(record);

            })

            .catch(function(err) {
                context.log('Error: ' + err);
                var text = "";
                context.log('text: ' + text);

                var record = {
                    "recordId": value.recordId,
                    "data": {
                        "descriptions": [
                            {
                                "value": "description",
                                "description": ""
                            }
                        ]
                    },
                    "errors": [],
                    "warnings": []
                }
        
                record.errors = [err];
        
                values.push(record);

            })

    };  

};