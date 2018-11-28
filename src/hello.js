const REGION = "us-west-2";
var AWS = require('aws-sdk');
//fs = require('fs');

var messages = [],
lastUserMessage = "",
botMessage = "Kucch toh bolo",
imageList = null,
botName = 'Chatbot';
var config = {
          apiKey : 'Aw6Pqn4Ef51vqKQg1nxgn6kdKU5ijBNuBxqPLL91',
          invokeUrl : 'https://pqj9shseg5.execute-api.us-west-2.amazonaws.com/test',
          region : REGION
};

var apigClientFactory = require('aws-api-gateway-client').default;
var apigClient = apigClientFactory.newClient(config);
var params = {};


function chatbotResponse() {
   if (document.getElementById("chatbox").value !== "") {
      lastUserMessage = document.getElementById("chatbox").value;
      messages.push(lastUserMessage);
      document.getElementById("chatbox").value = "";
      var body = {
        "question" : lastUserMessage,
      };
      var additionalParams = {
        headers : {},
        queryParams: {}
      };
      apigClient.invokeApi(params, '/search', 'GET', additionalParams, body).then(function(result) {
        console.log("Sucessfully got chatbot response");
        botMessage = String(JSON.parse(result.data.body).answer);
        imageList = JSON.parse(result.data.body).imageList;
        // TODO: https://s3-us-west-2.amazonaws.com/hw3photos/test4.jpg
        console.log(botMessage, imageList);
        messages.push("<b>" + botName + ":</b> " + botMessage);
        for (var i = 1; i < 8; i++) {
          if (messages[messages.length - i])
            document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
        }
      }).catch(function(result) {
        console.error("Chatbot response failure")
      });
    }
}

export function uploadFile(file) {
  console.log("Inside upload");
  var additionalParams = {
    headers: {
      'Content-Type': 'image/jpeg; charset=utf-8',
    },
    queryParams: {}
  };
  var body = {
    file : file
  };
  apigClient.invokeApi(params, '/upload/' + file.name, 'PUT', additionalParams, body).then(function(result) {
    console.log("Sucessfully put object in S3 bucket")
  }).catch(function(result) {
    console.error("S3 put object failure")
  });
}

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
