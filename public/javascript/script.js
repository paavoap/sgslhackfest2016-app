function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.3358394, lng: 103.962116},
    zoom: 13
  });

  map.addListener('click', function(e) {
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();
    var date = new Date();
    console.log("====== Click");
    console.log(lat);
    console.log(lng);
    console.log(date);
    $("#output").html("<p>"+lat+"<br />"+lng+"<br />"+date+"</p>")
  });
}

$(function() {
    console.log( "Ready!" );

});
