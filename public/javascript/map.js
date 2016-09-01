var maxLng = 104.0168;
var minLng = 103.61368;
var maxLat = 1.46989;
var minLat = 1.23377;
var cellH = 0.02;
var cellW = 0.02;

function getPrediction(ts, lat, lng) {
  var req = {
    lat: lat,
    lng: lng,
    timestamps: [
      ts
    ]
  };
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "POST",
      url: "/api/predict",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(req),
    }).fail(function () {
      var error = "Request to /api/predict failed.";
      console.log(error);
      reject(error);
    }).done(function (data) {
      resolve({
        lat: lat,
        lng: lng,
        val: data[0]
      });
    });
  });
}

function getPredictions(ts, latlngs) {
  var ps = latlngs.map(function(pair) {
    var lat = pair[0];
    var lng = pair[1];
    return getPrediction(ts, lat, lng);
  })
  return Promise.all(ps);
}

function renderHeatmap(map, data) {
  data.forEach(function(d) {
    renderHeatmapCell(map, d);
  });
}

function renderHeatmapCell(map, data) {
  console.log(data);

  var value = data.val;
  if (value == null) {
    return;
  }
  if (value < 0 || 1 < value) {
    return;
  }

  var lat = data.lat;
  var lng = data.lng;
  var cellCoords = [
    { lat: lat, lng: lng },
    { lat: lat+cellH, lng: lng },
    { lat: lat+cellH, lng: lng+cellW },
    { lat: lat, lng: lng+cellW },
  ];

  var cell = new google.maps.Polygon({
    paths: cellCoords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#FF0000',
    fillOpacity: value
  });
  cell.setMap(map);
}

function drawHeatmap(map, ts) {
  var pairs = [];

  var cLat = minLat;
  while (cLat < maxLat) {
    var cLng = minLng;
    while (cLng < maxLng) {
      pairs.push([cLat, cLng]);
      cLng = cLng + cellW;
    }
    cLat = cLat + cellH;
  }

  getPredictions(ts, pairs)
    .then(function (data) {
      renderHeatmap(map, data);
    });

}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.3358394, lng: 103.962116},
    zoom: 12
  });

  if ("geolocation" in navigator) {
    /* geolocation is available */
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var center = new google.maps.LatLng(lat, lng);
      map.panTo(center);
    });
  }

  map.addListener('click', function(e) {
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();
    console.log(lat, lng);
  });

  var date = new Date();
  drawHeatmap(map, date);

}

$(function() {
    console.log( "Ready!" );

});
