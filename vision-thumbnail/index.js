module.exports = async function (context, req) {
    context.log("Image Processing Function Started!!!!");

    var azure = require('azure-storage');
    var uuidv4 = require('uuidv4');
    var blobService = azure.createBlobService();

    //Create empty Array for output
    var values = [];

    //Parse all records input
    for(var value of req.body.values){

        //Input Blob
        let buff = Buffer.from(value.data.imageData.data, 'base64'); 
        //var b64image = value.data.imageData.data

        var filename = uuidv4() + '.jpg';
        var thumbnails = process.env.THUMBNAILS + filename;

        await blobService.createBlockBlobFromStream('thumbs', filename, buff, buff.byteLength);

        //Write to Blob storage
        //context.bindings.outputBlob = buff;

        var record = {
            "recordId": value.recordId,
            "data": {
                "thumbnail": thumbnails
            },
            "errors": null,
            "warnings": null
        }

        values.push(record);

    };


    //Response Body
    var body = {
       "values": values
    };

    context.log(JSON.stringify(body));

    //Return Response
    context.res = {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200,
        body:body
    };

};