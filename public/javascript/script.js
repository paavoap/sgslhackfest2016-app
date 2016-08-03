// http://stackoverflow.com/a/1214753
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function createChart(ctx, data) {
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Now", "15 min", "30 min", "45 min", "60 min"],
        datasets: [{
            label: 'Taxi count',
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
            fontColor: "#131617"
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

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.3358394, lng: 103.962116},
    zoom: 13
  });

  map.addListener('click', function(e) {
    $("#output").html("<canvas id=\"t-chart\" width=\"400\" height=\"100\"></canvas>");
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();
    var date = new Date();
    var req = {
      lat: lat,
      lng: lng,
      timestamps: [
        date,
        addMinutes(date, 15),
        addMinutes(date, 30),
        addMinutes(date, 45),
        addMinutes(date, 60)
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
      console.log(typeof data);
      data.forEach(function (e) { console.log(e); });
      createChart($("#t-chart"), data);
    });
  });
}

$(function() {
    console.log( "Ready!" );

});
