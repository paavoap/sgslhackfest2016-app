function getPoints(ts) {
  var req = {
    timestamp: ts
  };
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "POST",
      url: "/api/heatmap",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(req),
    }).fail(function () {
      var error = "Request to /api/heatmap failed.";
      console.log(error);
      reject(error);
    }).done(function (data) {
      resolve(data);
    });
  });
}

function renderHeatmap(map, data) {
  var points = data.map(function(p) {
    // lat/lng is flipped in the DB
    var lat = p.LNG;
    var lng = p.LAT;
    return new google.maps.LatLng(lat, lng);
  })
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: points,
    map: map
  });
}

function drawHeatmap(map, ts) {
  getPoints(ts)
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
