function initialize() {
  var mapOptions = {
    center: { lat: window.lat, lng: window.lon},
    zoom: 18,
    mapTypeControl: false,
    overviewMapControl: false,
    panControl: false,
    rotateControl: false,
    scaleControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  google.maps.event.addDomListener(map, 'tilesloaded', function() {
    console.log('ready');
    if ('callPhantom' in window) {
      // Weird fading tiles
      window.setTimeout(window.callPhantom, 500);
    }
  });
}
google.maps.event.addDomListener(window, 'load', initialize);