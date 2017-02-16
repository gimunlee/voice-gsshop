
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

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const WELCOME_INTENT = 'welcomeIntent';  // the action name from the API.AI intent
const NUMBER_INTENT = 'numberIntent';  // the action name from the API.AI intent

// [START YourAction]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  let number = [0, 0, 0];
  let homerun = [4, 5, 6];
  // let atoi = new map();

  // // atoi.set('zero', 0);
  // atoi.set('one', 1);
  // atoi.set('two', 2);
  // atoi.set('three', 3);
  // atoi.set('four', 4);
  // atoi.set('five', 5);
  // atoi.set('six', 6);
  // atoi.set('seven', 7);
  // atoi.set('eight', 8);
  // atoi.set('nine', 9);
  

  // Fulfill action business logic
  function welcomeIntent (assistant) {
    // Complete your fulfillment logic and send a response
    assistant.ask('Welcome. Let\'s play number baseball game. Tell me three numbers you guessed.');
  }

  function numberIntent (assistant) {
    console.log('come in to numberIntent');
    
    for (var i=0; i<3; i++) {
      number[i] = assistant.getArgument(NUMBER_ARGUMENT);
    }

    assistant.ask('You said' + number[0] + number[1] + number[2]);

      var strike = 0;
      var ball = 0;

      for (var i = 0; i < 3; i++) {
        if (number[i] == homerun[i]) strike++;
      }

      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          if (number[i] == homerun[i]) {
            ball++;
            break;
          }
        }
      }
      
      ball -= strike;

      if (strike == 3) {
        assistant.tell('Congratulations. Home Run.');
      } else if (strike == 0 && ball == 0) {
        assistant.tell('I\'m sorry, it\'s  out.');
      } else {
        assistant.tell('Not bad.' + strike + 'strike, ' + ball + 'ball');
      }
       

  }

  let actionMap = new Map();
  actionMap.set(WELCOME_INTENT, welcomeIntent);
  actionMap.set(NUMBER_INTENT, numberIntent);
  assistant.handleRequest(actionMap);
});
// [END YourAction]

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