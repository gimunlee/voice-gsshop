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
                
                var prompt  = 'Here is the product on live,';
                prompt += 'product name,';
                prompt += live.name + ',';
                prompt += 'category,';
                prompt += live.category + ',';
                prompt += 'price,';
                prompt += live.price + 'won,';
                prompt += 'do you want to purchase?';
            
                assistant.ask(prompt);
            });
   }

   const SHOW_DELIVERIES = 'delivery-action';

   function deliveryHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/deliveries',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var deliveries = JSON.parse(body);
                var prompt = "";
                console.log(body);

                for (var delivery of deliveries) {
                  prompt += 'name,';
                  prompt += delivery.product.name + ',';
                  prompt += 'transportation,';
                  prompt += delivery.transportation + ',';
                  prompt += 'current location,';
                  prompt += delivery.currentLocation + ',';
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
                var prompt= "These are all products on our catalogue,";
                var i = 0;
                console.log(body);

                for  (var product of catalogue) {
                    console.log('####' + i + product.name + '####');
                    i++;
                    prompt += 'name, ';
                    prompt += product.name + ',';
                    prompt += 'category, ';
                    prompt += product.category + ',';
                    prompt += 'price, ';
                    prompt += product.price + 'won, ';
                }

                prompt += 'those ' + i + ' products are on our catalogue.';
                assistant.ask(prompt);
            });
    }

   const PURCHASE_PHONE = 'phone-action';

   function phoneHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/users',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var purchase = JSON.parse(body);
                
                var prompt= "Checking your profile,";
                console.log(body);
                
                for (var user of purchase) {
                    prompt += 'name, ';
                    prompt += user.name + ',';

                    for (var payment of user.billings) {
                         if (payment.type === 'mobile phone') {
                             prompt += 'phone number, ';
                             prompt += payment.phoneNUmber + ',';
                        }
                    }
                    break;
                }

                prompt += 'thank you for buying our product.';
                assistant.ask(prompt);
            });
  }

  const PURCHASE_CREDITCARD = 'creditcard-action';

   function creditcardHandler(assistant) {
        request.get({ "url":"http://" + 'ec2-54-196-242-126.compute-1.amazonaws.com:8080/users',"body":"{}"},
            function(error,response,body) {
                console.log(JSON.stringify(response));
                var purchase = JSON.parse(body);
                
                var prompt= "Checking your profile,";

                console.log(body);
                
                for (var user of purchase) {
                    prompt += 'name, ';
                    prompt += user.name + ',';

                    for (var payment of user.billings) {
                         if (payment.type !== 'mobile phone') {
                             prompt += 'card name, ';
                             prompt += payment.type + ',';
                        }
                    }
                    break;
                }

                prompt += 'thank you for buying our product.';
                assistant.ask(prompt);
            });
  }


  let actionMap = new Map();
  actionMap.set(SHOW_LIVE, liveHandler);
  actionMap.set(SHOW_DELIVERIES, deliveryHandler);
  actionMap.set(SHOW_CATALOGUE, catalogueHandler);
  actionMap.set(PURCHASE_PHONE, phoneHandler);
  actionMap.set(PURCHASE_CREDITCARD, creditcardHandler);
  
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