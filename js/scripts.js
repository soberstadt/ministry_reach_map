function initialize() {
  var infobase_path = 'https://infobase-stage.cru.org/';

  var mapCanvas = document.getElementById('map');
  var mapOptions = {
    center: new google.maps.LatLng(34.0667, -118.0833),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(mapCanvas, mapOptions);
  var infowindowclick = new google.maps.InfoWindow({
    content: "Error filling click panel"
  });
  var infowindowhover = new google.maps.InfoWindow({
    content: "Error filling hover panel"
  });

  $.getJSON(infobase_path + 'api/v1/target_areas?filters[state]=CA', function (data) {
    window.infobase_campuses = data.target_areas;
    $.getJSON(infobase_path + "api/v1/govt_scorecard.json" + window.location.search, function (data) {
      $.each(data.govt_scorecard, function (key, val) {
        val.infobase_info = _.find(window.infobase_campuses, {name: val.name});
        if(!val.LATITUDE && val.infobase_info) {
          val.LATITUDE = val.infobase_info.latitude;
          val.LONGITUDE = val.infobase_info.longitude;
        }
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
        if (!val.infobase_info || !val.infobase_info.activities )
          marker.setIcon('Dot.png');

        marker.addListener('click', function () {
          var campus = this.campus;
          var activitieshtml = '';

          //  If a marker is clicked, display information in left box
          if(campus.infobase_info && campus.infobase_info.activities){
            for(x=0; x<campus.infobase_info.activities.length; x++){
              activitieshtml +=  '<font face="Times New Roman" size="4">' + campus.infobase_info.activities[x].name + '</font>' + '<br>' +
                '<strong>Status:</strong> ' + campus.infobase_info.activities[x].status + '<br>';
              if(campus.infobase_info.activities[x].contacts && campus.infobase_info.activities[x].contacts.length > 0){
                activitieshtml += '<strong>Contact:</strong> ' + campus.infobase_info.activities[x].contacts[0].firstName +
                  ' ' + campus.infobase_info.activities[x].contacts[0].lastName + '<br>';
              }
              activitieshtml += '<br>';
            }
          }
          //Adds Cru logo and any Cru information to put into left box
          $('#campus_info--content').html('<div><br><strong><font face="Arial" size="4">' + campus.name + '</font></strong><br><br>' + activitieshtml);

          infowindowclick.setContent('<div><strong>' + campus.name + '</strong><br>' + 'Enrollment: ' +
            campus.UGDS + '<br>Latino: ' + (campus.UGDS_HISP * 100.0).toFixed(2) +
            '% <br>Asian: ' + (campus.UGDS_ASIAN * 100.0).toFixed(2) + '% <br> Black: ' +
            (campus.UGDS_BLACK * 100.0).toFixed(2) + '% </div>');
          infowindowclick.open(map, this);
          infowindowhover.close();
        });

        marker.addListener('mouseover', function () {
          var campus = this.campus;
          infowindowhover.setContent('<strong>' + campus.name + '</strong>');
          infowindowhover.open(map, marker);
        });
      });
      $('.loader').hide();
    })
  });

}
google.maps.event.addDomListener(window, 'load', initialize);
