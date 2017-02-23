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
    request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/live',"body":"{}"},
      function(error, response, body) {
                console.log(JSON.stringify(response));
                var live = JSON.parse(body);
                console.log(body);
                
                var prompt = 'There is ';
                prompt += live.name + ' which is ';
                prompt += live.price + 'dollars on T.V.. ';
                prompt += 'Do you want to get it?';
            
                assistant.ask(prompt);
            });
   }

   const SHOW_DELIVERIES = 'delivery-action';

   function deliveryHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/deliveries',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var deliveries = JSON.parse(body);
                console.log(body);

                var prompt = 'Checking your deliveries. Your product ';
                for (var delivery of deliveries) {
                    for (var product of delivery.product) {
                        prompt += product.name + ',';
                    }
                    prompt += ' is on delivery by ';
                    prompt += delivery.transportation + ' to ';
                    prompt += delivery.to + ' and the current location is ';
                    prompt += delivery.currentLocation + ', ';
              }
              assistant.ask(prompt);
            });
    }
  
   const SHOW_CATALOGUE = 'catalogue-action';

   function catalogueHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/products',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var catalogue = JSON.parse(body);
                console.log(body);

                var prompt = "Checking the catalogue. I will show you topmost 3 products. ";
                var i = 0;
                for  (var product of catalogue) {
                    i++;
                    if (i > 3) {
                        continue;
                    }
                    prompt += 'Number ' + i + '. ';
                    prompt += product.name + ' is on ';
                    prompt += product.price + ' dollars. ';
                }

                prompt += 'total ' + i + ' products are on our catalogue.';
                assistant.ask(prompt);
            });
    }

   const PURCHASE_PHONE = 'phone-action';

   function phoneHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/users',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var purchase = JSON.parse(body);
                
                var prompt = "Checking your profile, ";
                console.log(body);
                
                for (var user of purchase) {
                    if (user.voiceShopId !== 'JONGSEO') {
                        continue;
                    }
                    prompt += user.name + '. ';

                    for (var payment of user.billings) {
                         if (payment.type === 'mobile') {
                             prompt += 'purchasing with your cell phone, ';
                             prompt += payment.detail.phoneNumber + '. ';
                        }
                    }
                }

                prompt += 'Thank you for buying our product.';
                assistant.ask(prompt);
            });
  }

  const PURCHASE_CREDITCARD = 'creditcard-action';

   function creditcardHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/users',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var purchase = JSON.parse(body);
                
                var prompt= "Checking your profile, ";

                console.log(body);
                
                for (var user of purchase) {
                    if (user.voiceShopId !== 'JONGSEO') {
                        continue;
                    }
                    prompt += user.name + '. ';

                    for (var payment of user.billings) {
                         if (payment.type === 'card') {
                             prompt += 'Purchasing with your credit card, ';
                             prompt += payment.name + '. ';
                        }
                    }
                    break;
                }

                prompt += 'Thank you for buying our product.';
                assistant.ask(prompt);
            });
  }

  const QUIT = 'quit-action';

  function quitHandler(assistant) {
    request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/users',"body":"{}"},
            function(error,response,body) {
                var users = JSON.parse(body);
                
                var prompt = 'Have a nice day, ';

                console.log(body);
                console.log('enter to quit handler');
                
                for (var user of users) {
                    if (user.voiceShopId !== 'JONGSEO') {
                        continue;
                    }
                    prompt += user.name + '. Bye.';
                    break;
                }

                assistant.tell(prompt);
            });
   }

  let actionMap = new Map();
  actionMap.set(SHOW_LIVE, liveHandler);
  actionMap.set(SHOW_DELIVERIES, deliveryHandler);
  actionMap.set(SHOW_CATALOGUE, catalogueHandler);
  actionMap.set(PURCHASE_PHONE, phoneHandler);
  actionMap.set(PURCHASE_CREDITCARD, creditcardHandler);
  actionMap.set(QUIT, quitHandler);
  
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