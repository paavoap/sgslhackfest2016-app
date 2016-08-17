/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var rp = require('request-promise');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

function parseResponse(res) {
  if (res["resultCode"] != "SUCCESS") {
    console.log("Result code "+res["resultCode"]+".");
    return null;
  }
  var o = res["result"]["rScriptOutput"].trim();
  var s = o.split(/\s+/);
  var v = parseFloat(s[2].trim());
  return v;
}

function getPrediction(ts, lat, lng) {
  var tss = ts.toString();
  var body = {
      "arguments": [ ['"'+tss+'"', lng, lat].join(',') ]
  };
  console.log(body);
  var options = {
    method: 'POST',
    uri: 'https://dashdb-entry-yp-dal09-07.services.dal.bluemix.net:8443/dashdb-api/rscript/getPrediction.r',
    headers: {
      "Authorization": "Basic ZGFzaDc5Mjc6MGNjVVZnRHBzeThs",
      "Content-Type": "application/json"
    },
    body: body,
    json: true
  }
  return rp(options)
    .then(function(res) {
      try {
        return parseResponse(res);
      } catch (e) {
        console.log(e);
        return null;
      }
    }, function(err) {
      console.log(err);
      return null;
    });
}

app.post('/api/predict', function (req, res) {
  var tss = req.body.timestamps;
  // TODO: check tss type == Array
  var ps = tss.map(function (ts) {
    return getPrediction(new Date(ts), req.body.lat, req.body.lng);
  })
  Promise.all(ps)
    .then(function(cs) {
      res.json(cs);
    });
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
