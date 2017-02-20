// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let app = express();

app.use(bodyParser.json({type: 'application/json'}));

const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';


// [START voice-shop]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  const SHOW_LIVE = 'live-action';

  function liveHandler(assistant) {
    request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/test/live',"body":"{}"},
    // request.get({ "url":"http://www.naver.com","body":"{}"},
      function(error, response, body) {
                console.log(JSON.stringify(response));
                console.log(body);
                
                var prompt  = 'Here is the product on live,';
                prompt += 'name,';
                prompt += (JSON.parse(body)['name']) + ',';
                prompt += 'category,';
                prompt += (JSON.parse(body)['category']) + ',';
                prompt += 'price,';
                prompt += (JSON.parse(body)['price']) + 'won,';
                prompt += 'do you want to purchase?'
                // prompt += (JSON.parse(body)['name']);
                
                // console.log(JSON.parse(body));
                // console.log(JSON.parse(body)['message']);
                // console.log({'message':'test'}.message);
                // speech += "You received " + JSON.parse(body)['message'];
                // var prompt = ". Is there any thing you need more?";
                
                assistant.ask(prompt);
            });
   }

   const SHOW_DELIVERIES = 'delivery-action';

   function deliveryHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/test/deliveries',"body":"{}"},
        // request.get({ "url":"http://www.naver.com","body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var delivery = JSON.parse(body);
                var prompt = "";
                console.log(body);

                prompt += 'name,';
                prompt += delivery.product.name + ',';
                prompt += 'transportation,';
                prompt += delivery.transportation + ',';
                prompt += 'current location,';
                prompt += delivery.currentLocation + ',';

                // console.log(JSON.parse(body)['message']);
                // console.log({'message':'test'}.message);
                // speech += "You received " + JSON.parse(body)['message'];
                // var prompt = ". Is there any thing you need more?";
                
                assistant.ask(prompt);
            });
    }
  
   const SHOW_CATEGORIES = 'category-action';

   function categoryHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/test/categories',"body":"{}"},
        // request.get({ "url":"http://www.naver.com","body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var speech = "";
                console.log(body);
                
                assistant.ask('came in to categories');
            });
    }

   const PURCHASE = 'purchase-action';

   function purchaseHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/categories',"body":"{}"},
        // request.get({ "url":"http://www.naver.com","body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var speech = "";
                console.log(body);
                
                assistant.ask('came in to categories');
            });
    }



  let actionMap = new Map();
  actionMap.set(SHOW_LIVE, liveHandler);
  actionMap.set(SHOW_DELIVERIES, deliveryHandler);
  actionMap.set(SHOW_CATEGORIES, categoryHandler);
  actionMap.set(PURCHASE, purchaseHandler);
  
  assistant.handleRequest(actionMap);
});

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;