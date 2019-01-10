const REGION = "us-west-2";
var AWS = require('aws-sdk');

var messages = [],
lastUserMessage = "",
botMessage = "Default Message",
imageList = null,
botName = 'Chatbot';
var config = {
          apiKey : 'apiKey',
          invokeUrl : 'https://pqj9shseg5.execute-api.us-west-2.amazonaws.com/test',
          region : REGION
};

var apigClientFactory = require('aws-api-gateway-client').default;
var apigClient = apigClientFactory.newClient(config);
var params = {};

// function to receive the response from the chatbot
function chatbotResponse() {
   if (document.getElementById("chatbox").value !== "") {
      lastUserMessage = document.getElementById("chatbox").value;
      messages.push(lastUserMessage);
      document.getElementById("chatbox").value = "";
      var body = {
        question : lastUserMessage,
      };
      var additionalParams = {
        headers : {},
        queryParams: {}
      };
      apigClient.invokeApi(params, '/search', 'POST', additionalParams, body).then(function(result) {
        console.log("Sucessfully got chatbot response");
        botMessage = String(JSON.parse(result.data.body).answer);
        imageList = JSON.parse(result.data.body).imageList;
        console.log(result)
        console.log(imageList)
         var myNode = document.getElementById("myImg");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        for (var i = imageList.length - 1; i >= 0; i--) {
          var elem = document.createElement("img");
          elem.src = 'https://s3-us-west-2.amazonaws.com/hw3photos/'+imageList[i];
          document.getElementById("myImg").appendChild(elem);
             }

        console.log(botMessage, imageList);
        messages.push("<b>" + botName + ":</b> " + botMessage);
        for (var i = 1; i < 8; i++) {
          if (messages[messages.length - i])
            document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
        }
      }).catch(function(result) {
        console.error(result)
        console.error("Chatbot response failure")
      });
    }
}
// function to upload the image file to S3 bucket
export function uploadFile(file) {
  console.log("Inside upload");
  if (file) {
                AWS.config.update({
                    "accessKeyId": "accessKeyId",
                    "secretAccessKey": "secretAccessKey",
                    "region": "us-west-2"
                });
                var s3 = new AWS.S3();
                var params = {
                    Bucket: 'hw3photos',
                    Key: file.name,
                    ContentType: file.type,
                    Body: file,
                    ACL: 'public-read'
                };
                s3.putObject(params, function (err, res) {
                    if (err) {
                        console.log("Error uploading data: ", err);
                    } else {
                        console.log("Successfully uploaded data");
                        window.alert("Successfully uploaded image");
                    }
                });
            } else {
                alert('Nothing to upload.');
            }
  };

//runs the keypress() function when a key is pressed
document.onkeypress = keyPress;
//if the key pressed is 'enter' runs the function newEntry()
function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key === 13 || key === 3) {
    //runs this function when enter is pressed
    chatbotResponse();
  }
  if (key === 38) {
    console.log('hi')
  }
}

//clears the placeholder text ion the chatbox
//this function is set to run when the users brings focus to the chatbox, by clicking on it
function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
}
