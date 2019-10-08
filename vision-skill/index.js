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

        //Input Blob
        let buff = Buffer.from(value.data.imageData.data, 'base64'); 

        //Call Image Service and get record
        await imageQuery(buff, value);

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

        await computerVisionApiClient.analyzeImageInStream(myBlob, {visualFeatures: ["Categories", "Tags", "Description", "Color"]})
          
            .then(async function(data){

                context.log(JSON.stringify(data));
                
                if(data.description.captions.length > 0){
                    var text = data.description.captions[0].text 
                }else{
                    var text = ""
                };

                var record = {
                    "recordId": value.recordId,
                    "data": {
                        "descriptions": [
                            {
                                "value": "description",
                                "description": text
                            }
                        ]
                    },
                    "errors": null,
                    "warnings": null
                }
        
                values.push(record);

            })

            .catch(function(err) {
                context.log('Caught Error: ' + err.message);

                var record = {
                    "recordId": value.recordId,
                    "data": null,
                    "errors": null,
                    "warnings": [
                        {
                            "message": err.message
                        }
                    ]
                }
        
                values.push(record);

            })

    };  

};