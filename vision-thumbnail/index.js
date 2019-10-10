module.exports = async function (context, req) {
    context.log("Image Processing Function Started!!!!");

    //Create empty Array for output
    var values = [];

    //Parse all records input
    for(var value of req.body.values){

        //Input Blob
        var b64image = value.data.imageData.data

        var record = {
            "recordId": value.recordId,
            "data": {
                "thumbnail": [
                    {
                        "value": "thumbnail",
                        "thumbnail": b64image
                    }
                ]
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

    //Return Response
    context.res = {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200,
        body:body
    };

};