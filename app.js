// Copyright 2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';

let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

var homerun = [4, 5, 6];
var number = [0, 0, 0];

app.post('/', function (request, response) {
  console.log('handle post');
  const assistant = new ActionsSdkAssistant({request: request, response: response});
  const NUMBER_ARGUMENT = 'number';

  function mainIntent (assistant) {
    console.log('mainIntent');
    let inputPrompt = assistant.buildInputPrompt(false, 'welcome to L.G. C.N.S.');
    // let inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' +
    //       'I can read out an ordinal like ' +
    //       '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
    //       ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
    assistant.ask(inputPrompt);
  }

  function rawInput (assistant) {
    var inputPrompt;
    // var command = assistant.getRawInput();

    console.log('rawInput');
    
    if (assistant.getRawInput() === 'bye') {
      assistant.tell('Goodbye!');
    } else {
       assistant.ask(inputPrompt);
       for (var i = 0; i < 3; i++) {
         assistant.ask(false, 'just testing for speaking twice');
         assistant.ask(false, 'here is loop' + (i+1));
         number[0] = assistant.getArgument(NUMBER_ARGUMENT);
         assistant.ask(false, 'speaking twice.')
         number[0] = assistant.getArgument(NUMBER_ARGUMENT);
      }
      assistant.ask(false, 'You said' + number[0] + number[1] + number[2]);

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
         inputPrompt = assistant.buildInputPrompt(true, 'Congratulations. Home Run.');
       } else if (strike == 0 && ball == 0) {
         inputPrompt  = assistant.buildInputPrompt(true, '<speak>Out.');
       } else {
         inputPrompt  = assistant.buildInputPrompt(true, '<speak>' + strike + 'strike, ' + ball + 'ball.');
       }

       assistant.ask(inputPrompt);
      
      // let inputPrompt = assistant.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
      //   assistant.getRawInput() + '</say-as></speak>',
      //     ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
      // assistant.ask(inputPrompt);
    }
  }

  let actionMap = new Map();
  actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
  actionMap.set(assistant.StandardIntents.TEXT, rawInput);

  assistant.handleRequest(actionMap);
});

app.get("/", (req, res)=> {
  res.send("Hello, google");
})

// Start the server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]