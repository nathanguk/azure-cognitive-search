module.exports = async function (context, req) {
    context.log("Image Processing Function Started!!!!");

    //Import Modules
    var Vision = require('azure-cognitiveservices-vision');
    var CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

    //Cognitive Services API Credentials
    var serviceKey = '71c926b6c944490c9a3cd3da3cf1083b';
    var region = 'northeurope';
    var endpoint = 'https://'+region+'.api.cognitive.microsoft.com';
    var credentials = new CognitiveServicesCredentials(serviceKey);
    var computerVisionApiClient = new Vision.ComputerVisionAPIClient(credentials, region);

    //Create empty Array for output
    var values = [];

    //Parse all records input
    for(var value of req.body.values){

        //Input Blob
        var myBlob = value.data.imageData;

        //Call Image Service
        var text = await imageQuery(myBlob);
        context.log(JSON.stringify(text));

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
            "errors": [],
            "warnings": []
        }

        values.push(record);

    };


    //Response Body
    var body = {
        "values": [values]
    };

    //Log Response Body
    context.log(JSON.stringify(body));

    //Return Response
    context.res = {
        status: 200,
        body: body
    };

    
    //Function to get Image Attributes
    async function imageQuery(myBlob){
        context.log("Calling Vision API");

        await computerVisionApiClient.analyzeImageInStream(myBlob, {visualFeatures: ["Categories", "Tags", "Description", "Color"]})
          
            .then(async function(data){    
                // Log response
                context.log("data: " + JSON.stringify(data));

                return data.description.captions[0].text

            })

            .catch(function(err) {
                context.log("Error: " + err);
                context.done(null, err);
            })

    };  

};