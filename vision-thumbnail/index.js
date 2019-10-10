module.exports = async function (context, req) {
    context.log("Image Processing Function Started!!!!");
    context.log(JSON.stringify(context));

    //Import Modules
    var request = require("request-promise");

    //Cognitive Services API Credentials
    var serviceKey = process.env.VISION_KEY;
    var region = process.env.VISION_REGION;

    //Create empty Array for output
    var values = [];

    //Parse all records input
    for(var value of req.body.values){

        //Input Blob
        let buff = Buffer.from(value.data.imageData.data, 'base64'); 

        //Call Image Service and get record
        await thumbnail(buff, value);

    };


    //Response Body
    var body = {
       "values": values
    };

    //Return Response
    context.res = {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200,
        body:body
    };

    //Function to create Thumbnail
    async function thumbnail(image, value) {

        context.log("Calling Thumbnail API");

        var options = { 
            method: 'POST',
            url: 'https://'+region+'.api.cognitive.microsoft.com/vision/v1.0/generateThumbnail',
            qs: { width: '95', height: '95', smartCropping: 'true' },
            headers: { 
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': serviceKey,
                'Content-Type': 'application/octet-stream' 
            },
            body: image,
            encoding: null,
            json: false
        };

        await request(options)
            .then(function (body) {
                //Write to Blob storage
                context.bindings.outputBlob = body;

                var record = {
                    "recordId": value.recordId,
                    "data": {
                        "thumbnail": [
                            {
                                "value": "thumbnail",
                                "thumbnail": "dummyurl"
                            }
                        ]
                    },
                    "errors": null,
                    "warnings": null
                }
        
                values.push(record);

            })
            .catch(function (err) {
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
            });

        };

};