window.infobase_path = 'https://infobase-stage.cru.org/';

var show_gov_db_results = function (data) {
  var infowindowclick = new google.maps.InfoWindow({
    content: "Error filling click panel"
  });
  var infowindowhover = new google.maps.InfoWindow({
    content: "Error filling hover panel"
  });

  $.each(data.govt_scorecard, function (key, val) {
    val.infobase_info = _.find(window.infobase_campuses, {name: val.name});

    // use infobase geocode if gov db doesn't have it
    if(!val.LATITUDE && val.infobase_info) {
      val.LATITUDE = val.infobase_info.latitude;
      val.LONGITUDE = val.infobase_info.longitude;
    }
    // don't show the marker if we don't have geocode
    if(val.LATITUDE == undefined) {
      return;
    }

    var marker = new google.maps.Marker({
      position: {lat: Number(val.LATITUDE), lng: Number(val.LONGITUDE)},
      map: map,
      title: val.name,
      campus: val
    });

    //Sets the shape of the marker to a small circle if no Cru presence
    if (!val.infobase_info || !val.infobase_info.activities)
      marker.setIcon('Dot.png');

    marker.addListener('click', function () {
      var campus = this.campus;

      var activitieshtml = '';
      //  If a marker is clicked, display information in left box
      if(campus.infobase_info && campus.infobase_info.activities){
        activitieshtml = getActiviesSummaryHTML(campus.infobase_info);
      }
      else {
        activitieshtml = '<p><a href="' + infobase_path + 'locations/search_results?namecity=' + campus.name +
                         '">Search for this campus on the Infobase</a><p>'
      }
      //Adds Cru logo and any Cru information to put into left box
      $('#campus_info--content').html('<center><font face="Arial" size="3">' + campus.name +
                                      '</font></center><br>' + activitieshtml);

      //Toggle switch for infowindowclick
      //if clicked-on window is already open when the marker is clicked
      if(this == infowindowclick.anchor && infowindowclick.getMap()){
          //close window
          infowindowclick.close();
          //clears left window
          $('#campus_info--content').html('');

          //optional, brings back hover window
          //infowindowhover.setContent(campus.name);
          //infowindowhover.open(map, this);
        }
      else{
          infowindowclick.setContent(campusInfoWindow(campus));

          infowindowclick.open(map, this);
          infowindowhover.close();
      }

    });

    marker.addListener('mouseover', function () {
      var campus = this.campus;

      //brings up window if marker's clickedon window is not open
      //if clickedon window is open, close hover window
      if(this == infowindowclick.anchor && infowindowclick.getMap()){
        infowindowhover.close();
      }
      else{
        infowindowhover.setContent(campus.name);
        infowindowhover.open(map, marker);
      }

    });
  });
  $('.loader').hide();
};

function getActiviesSummaryHTML(infobase_campus) {
  var html = '';
  for(x = 0; x < infobase_campus.activities.length; x++){
    var activity = infobase_campus.activities[x];

    html += '<p>' +
              '<font face="Arial" size="3">' + activity.name + '</font><br>' +
              '<strong>Status:</strong> ' + activity.status + '<br>';

    if(activity.contacts && activity.contacts.length > 0){
      var contact = activity.contacts[0];
      html += '<strong>Contact:</strong> ' + contact.firstName + ' ' + contact.lastName + '<br>';
    }

    html += '</p>';
  }
  html += '<p><a href="' + infobase_path + 'locations/' + infobase_campus.id + '">Visit on infobase</a></p>';
  return html;
}

function campusInfoWindow(campus) {
  return '<font size="3">' + campus.name + '</font><br>' +
         '<strong>Enrollment: </strong>' + campus.UGDS + '<br>' +
         '<strong>Latino: </strong>' + (campus.UGDS_HISP * 100.0).toFixed(2) + '% <br>' +
         '<strong>Asian: </strong>' + (campus.UGDS_ASIAN * 100.0).toFixed(2) + '% <br> ' +
         '<strong>Black: </strong>' + (campus.UGDS_BLACK * 100.0).toFixed(2) + '% '
}

function initialize() {
  var mapCanvas = document.getElementById('map');
  var mapOptions = {
    center: new google.maps.LatLng(34.0667, -118.0833),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  window.map = new google.maps.Map(mapCanvas, mapOptions);

  $.getJSON(infobase_path + 'api/v1/target_areas?filters[state]=CA', function (data) {
    window.infobase_campuses = data.target_areas;
    $.getJSON(infobase_path + "api/v1/govt_scorecard.json" + window.location.search, show_gov_db_results)
  });
}
google.maps.event.addDomListener(window, 'load', initialize);
