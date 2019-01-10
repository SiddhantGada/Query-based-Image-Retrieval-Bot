exports.handler = (event, context, callback) => {
    try {
        console.log('Calling lambda function from s3 bucket')
        var AWS = require('aws-sdk');
        var domain = 'vpc-hw3photos-bevilfww4tvswkzhzcpngbdasm.us-west-2.es.amazonaws.com';
        var region = 'us-west-2';
        var endpoint = new AWS.Endpoint(domain);
        var request = new AWS.HttpRequest(endpoint, region);
        var rekognition = new AWS.Rekognition({region: region});
        var bucket_name = event.Records[0].s3.bucket.name;
        var image_name = event.Records[0].s3.object.key;
        console.log('Bucket name:', bucket_name, 'Image name:', image_name);
        var params = {
          Image : {
           S3Object : {
            Bucket : bucket_name,
            Name : image_name
           }
          },
          MaxLabels : 20,
          MinConfidence: 90
        };
        rekognition.detectLabels(params, function(err, data) {
          if (err) {
              console.log('Error', err);
          }
          else {
              console.log('Success rekognition');
              var labels = [];
              for(var i = 0; i < data.Labels.length; i++) {
                  labels.push(data.Labels[i]['Name']);
              }
              console.log(labels);
              var json_res = {
                  'objectKey' : image_name,
                  'bucket' : bucket_name,
                  'createdTimestamp' : new Date(),
                  'labels' : labels
              }
              request.method = 'PUT';
              request.path += 'cloudhw3/_doc/' + image_name;
              request.body = JSON.stringify(json_res);
              request.headers['host'] = domain;
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
                  console.log('ES message: ' + responseBody);
                 });
              }, function(error) {
                 console.log('ES Error: ' + error);
                 callback(error);
              });
          }
        });
    } catch(err) {
        callback(err);
    }
};
