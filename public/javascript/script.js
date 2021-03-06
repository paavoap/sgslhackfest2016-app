// http://stackoverflow.com/a/1214753
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function createChart(ctx, data) {
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Now", "1 hour", "2 hours", "3 hours", "4 hours", "5 hours"],
        datasets: [{
            label: 'Taxi availability',
            data: data,
            borderColor: "#394345",
            backgroundColor: "#798D92"
        }]
    },
    options: {
      legend: {
              display: true,
              labels: {
                  fontColor: "#131617"
              }
      },
      scales: {
        yAxes: [{
          ticks: {
            display: false,
            suggestedMin: 0.25,
            suggestedMax: 0.75
          }
        }],
        xAxes: [{
          ticks: {
            fontColor: "#131617"
          }
        }]
      }
    }
  });
}

function updateLocation(lat, lng) {
  $("#output").html("<canvas id=\"t-chart\" width=\"400\" height=\"200\"></canvas>");
  var date = new Date();
  var req = {
    lat: lat,
    lng: lng,
    timestamps: [
      date,
      addMinutes(date, 1 * 60),
      addMinutes(date, 2 * 60),
      addMinutes(date, 3 * 60),
      addMinutes(date, 4 * 60),
      addMinutes(date, 5 * 60)
    ]
  };
  $.ajax({
    type: "POST",
    url: "/api/predict",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(req),
  }).fail(function () {
    console.log("Request to /api/predict failed.");
  }).done(function (data) {
    console.log(data);
    createChart($("#t-chart"), data);
  });
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.3358394, lng: 103.962116},
    zoom: 13
  });

  if ("geolocation" in navigator) {
    /* geolocation is available */
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var center = new google.maps.LatLng(lat, lng);
      map.panTo(center);
      updateLocation(lat, lng);
    });
  }

  map.addListener('click', function(e) {
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();
    updateLocation(lat, lng);
  });
}

$(function() {
    console.log( "Ready!" );

});
