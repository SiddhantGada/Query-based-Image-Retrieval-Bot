console.log('Loading hw3 lambda function');
exports.handler = (event, context, callback) => {
    //console.log(typeof(event), event.question);
    let question = "Show me photos of car.";
    let answer = "This is confusing. I've still got a lot to learn.";
    let responseCode = 200;
    if (event !== null && event !== undefined) {
        question = event.question;
    }
    console.log(question);
    var AWS = require('aws-sdk');
    var lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28', region : 'us-west-2'});
    var params = {
      botAlias: 'photobot', /* required */
      botName: 'PhotoBot', /* required */
      contentType: 'text/plain; charset=utf-8', /* required */
      inputStream: question, /* required */
      userId: 'prerna135', /* required */
      accept: 'text/plain; charset=utf-8',
      requestAttributes : {},
      sessionAttributes : {}
    };
    //if(event.httpMethod !== 'OPTIONS') {
    lexruntime.postContent(params, function (err, data) {
      if (err) {
          responseCode = 500;
          console.log('Error lex', err); // an error occurred
      }
      else{
          console.log('Sucess lex', data);
          answer = data.message;
          var photoType1 = null;
          var photoType2 = null;
          var imageList = [];
          if(data.slots !== null) {
            photoType1 = data.slots.PhotoTypeOne;
            photoType2 = data.slots.PhotoTypeTwo;
          }
          var domain = 'vpc-hw3photos-bevilfww4tvswkzhzcpngbdasm.us-west-2.es.amazonaws.com';
          var region = 'us-west-2';
          var endpoint = new AWS.Endpoint(domain);
          var request = new AWS.HttpRequest(endpoint, region);
          request.method = 'POST';
          //request.path += 'cloudhw3/_search?q=labels:';
          request.path += 'cloudhw3/_search/';
          var query = "";
          if(photoType1 !== null) {
            query += photoType1;
          }
          if(photoType2 !== null) {
            query += " OR " + photoType2;
          }
          var body = {
            "query": {
              "multi_match": {
              "query": query,
              "fields": ["labels"]
            }
            }
          };
          console.log('Request path for ES search:', request.path);
          request.headers['host'] = domain;
          request.body = JSON.stringify(body);
          request.headers['Content-Type'] = 'application/json';
          var credentials = new AWS.EnvironmentCredentials('AWS');
          var signer = new AWS.Signers.V4(request, 'es');
          signer.addAuthorization(credentials, new Date());
          var client = new AWS.HttpClient();
          client.handleRequest(request, null, function(response) {
            console.log(response.statusCode + ' ' + response.statusMessage);
            var responseBody = '';
            response.on('data', function (chunk) {
              responseBody += chunk;
            });
            response.on('end', function (chunk) {
              console.log('ES success: ' + responseBody);
              var res = JSON.parse(responseBody);
              //console.log('res', res);
              for(var i = 0; i < res.hits.hits.length; i++) {
                imageList.push(res.hits.hits[i]._source.objectKey);
              }
              //var s3 = new AWS.S3();
              console.log('Image list:', imageList);
              // for(var i = 0; i < imageList.length; i++) {
              //   var params = {
              //     Bucket: 'hw3photos',
              //     Key: imageList[i]
              //   };
              //   s3.getObject(params, function(err, data) {
              //     if (err) console.log('S3 image retrieval error', err);
              //     else     console.log('S3 images retrieval success', data);

              //   });
              // }
              var final = {
                answer: answer,
                imageList : imageList
              };
              var response = {
                  statusCode: responseCode,
                  body: JSON.stringify(final)
              };
              console.log("response: " + JSON.stringify(response));
              callback(null, response);
              });
          }, function(error) {
              console.log('ES Error: ' + error);
              callback(error);
          });
      }
    });
    //}
    // else {
    //   callback(null, {statusCode : responseCode,
    //         body: JSON.stringify(
    //           {
    //         answer: 'OPTIONS request',
    //         input: null
    //     }
    //     )
    //   });
    // }
};
