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
var moment = require('moment-timezone');

var ibmdb = require('ibm_db');
var db2;
var hasConnect = false;

if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
	if (env['dashDB']) {
    hasConnect = true;
		db2 = env['dashDB'][0].credentials;
	}
}

if ( hasConnect == false ) {
  db2 = {
    db: "BLUDB",
    hostname: "dashdb-entry-yp-dal09-07.services.dal.bluemix.net",
    port: 50000,
    username: "dash7927",
    password: "0ccUVgDpsy8l"
  };
}

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

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
  var m = moment(ts);
  var sg = m.clone().tz("Asia/Singapore");
  // Wed Aug 17 2016 16:37:18 GMT+0800 (SGT)
  var tss = sg.format("ddd MMM D YYYY HH:mm:ss [GMT]ZZ [(SGT)]");
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
  };
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

function getTaxisFromDB(ibmdb, connString, ts, success, fail) {
  ibmdb.open(connString, function(err, conn) {
    if (err) {
      console.log(err);
      fail(err);
    } else {
      var q = "SELECT LAT, LNG FROM DASH7927.TAXI_LOCATIONS TABLESAMPLE BERNOULLI(1) WHERE HOUR(TIMESTAMP) = HOUR(date('"+ts+"')) LIMIT 1000;";
      conn.query(q, function (err, points, moreResultSets) {
        if (err) {
          console.log(err);
          fail(err);
        } else {
          success(points);
        }
      });
      conn.close(function() { return; });
    }
  });
}

function getTaxis(ts) {
  var m = moment(ts);
  var sg = m.clone().tz("Asia/Singapore");
  // 2016-08-17 16:37:18 GMT+0800 (SGT)
  var tss = sg.format("YYYY-MM-DD HH:mm:ss");
  return new Promise(function (resolve, reject) {
    getTaxisFromDB(ibmdb, connString, tss, resolve, reject);
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

app.post('/api/heatmap', function (req, res) {
  var ts = req.body.timestamp;
  // TODO: check tss type == Array
  getTaxis(new Date(ts))
    .then(function(ps) {
      res.json(ps);
    });
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
