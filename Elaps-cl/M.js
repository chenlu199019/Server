  var map;
  var directionDisplay;
  var directionsService;
  var stepDisplay;
  var markerArray = [];
  var position;
  var marker = null;
  var polyline = null;
  var poly2 = null;
  var speed = 0.000005, wait = 1;
  var infowindow = null;
  var firstcall=0;
  
  var myPano;   
  var panoClient;
  var nextPanoId;
  var timerHandle = null;
  var userPos;
  var userMarker;
  var PGPmarker;

  //var historicalOverlay;
  //USGSOverlay.prototype = new google.maps.OverlayView();
  var openState = false;
  var safeRegion;
  var l;
  var n;
  var width;


  function createMarker(latlng, label, html) {
// alert("createMarker("+latlng+","+label+","+html+","+color+")");
var contentString = '<b>'+label+'</b><br>'+html;
var subjectPoint = {
  point: latlng,
  radius: 1.0,
  color: '#1abc9c',
}
var subjectRange = new google.maps.Circle({
  map:map,
  radius: subjectPoint.radius*700,
  fillColor: subjectPoint.color,strokeColor:'#3D9912'
});

if(firstcall==0){
  userMarker.setPosition(latlng);
  userMarker.setTitle(label);
  userMarker.setZIndex(Math.round(latlng.lat()*-100000)<<5);
  userMarker.myname=label;
  subjectRange.bindTo('center',userMarker,'position');

  google.maps.event.addListener(userMarker, 'click', function() {
    infowindow.setContent(contentString); 
    infowindow.open(map,userMarker);
  });
  firstcall=2;
  return userMarker;

}
else{
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: label,
    zIndex: Math.round(latlng.lat()*-100000)<<5
  });
  marker.myname = label;
  marker.setIcon('image/male-2.png');

  subjectRange.bindTo('center',userMarker,'position');

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString); 
    infowindow.open(map,marker);
  });
  return marker;

}
}


function initialize() {

  infowindow = new google.maps.InfoWindow(
  { 
    size: new google.maps.Size(150,50)
  });
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();
    
    var myOptions = {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    // to fulfill the change of marker function
    var PGPlatlng = new google.maps.LatLng(1.290751,103.780478);
    PGPmarker = new google.maps.Marker({
    position:PGPlatlng,
    map:map,
    title:'change once being matched',
    optimized: false
  });
    /////// to add the safe region
    //var safeRegion;
     width = 0.005;
     l=1.309416;
     n=103.779613;
    var rectCoords = [
      new google.maps.LatLng(l,n),
      new google.maps.LatLng(l+width,n),
      new google.maps.LatLng(l+width,n+width),
      new google.maps.LatLng(l,n+width),
      new google.maps.LatLng(l,n)
    ];
    //construct the polygon
    safeRegion =  new google.maps.Polygon({
      path:rectCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
      });
    safeRegion.setMap(map);


    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        userPos = new google.maps.LatLng(position.coords.latitude,
          position.coords.longitude);
        userMarker = new google.maps.Marker({
          map: map,
          position: userPos,
          animation: google.maps.Animation.DROP,
          draggable: true,
          title:"User Location"
        });

        userMarker.setIcon('image/male-2.png');
        map.setCenter(userPos);
      //addMarker(map,userMarker);
      userMarker.setMap(map);
    }, 
    function() {
      handleNoGeolocation(true);
    });
    } else {
      handleNoGeolocation(false);}


    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
      map: map
    }
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    
    // Instantiate an info window to hold step text.
    stepDisplay = new google.maps.InfoWindow();

    polyline = new google.maps.Polyline({
     path: [],
     strokeColor: '#FF0000',
     strokeWeight: 3
   });
    poly2 = new google.maps.Polyline({
     path: [],
     strokeColor: '#FF0000',
     strokeWeight: 3
   });

  // Create the DIV to hold the control and
  // call the HomeControl() constructor passing
  // in this DIV.
  var gridControlDiv = document.createElement('div');
  var gridControl = new GridControl(gridControlDiv, map);

  gridControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(gridControlDiv);

}//////////////////////////////////////////////////////////////closing  the initial function



var steps = []
function calcRoute(){
  //if (timerHandle) { clearTimeout(timerHandle); }
 // if (marker) { marker.setMap(null);}
  //polyline.setMap(null);
  //poly2.setMap(null);
  //directionsDisplay.setMap(null);
  polyline = new google.maps.Polyline({
   path: [],
   strokeColor: '#FF0000',
   strokeWeight: 3
 });
  poly2 = new google.maps.Polyline({
   path: [],
   strokeColor: '#FF0000',
   strokeWeight: 3
 });
    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
      map: map
    }
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    var start = userPos;
    var end = document.getElementById("end").value;
     // end = new google.maps.places.Autocomplete(end);
     var travelMode = document.getElementById('mode').value;
     var request = {
       origin: start,
       destination: end,
       travelMode: travelMode
     };

		// Route the directions and pass the response to a
		// function to create markers for each step.
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK){
       directionsDisplay.setDirections(response);

       var bounds = new google.maps.LatLngBounds();
       var route = response.routes[0];
       startLocation = new Object();
       endLocation = new Object();

        // For each route, display summary information.
        var path = response.routes[0].overview_path;
        var legs = response.routes[0].legs;
        for (i=0;i<legs.length;i++) {
          if (i == 0) { 
            startLocation.latlng = legs[i].start_location;
            startLocation.address = legs[i].start_address;
            marker = createMarker(legs[i].start_location,"start",legs[i].start_address,"green");
          }
          endLocation.latlng = legs[i].end_location;
          endLocation.address = legs[i].end_address;
          var steps = legs[i].steps;
          for (j=0;j<steps.length;j++) {
            var nextSegment = steps[j].path;
            for (k=0;k<nextSegment.length;k++) {
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }
        polyline.setMap(map);
        map.fitBounds(bounds);
        map.setZoom(18);
        startAnimation();
      }                                                    
    });
}/////////////////////// end of calculate function

      var step = 5; // 5; // metres/////////////////////////////////////////////to set speed (smaller slower)
      var tick = 100; // milliseconds
      var eol;
      var k=0;
      var stepnum=0;
      var speed = "";
      var lastVertex = 1;

//=============== animation functions ======================
function updatePoly(d) {
        // Spawn a new polyline every 20 vertices, because updating a 100-vertex poly is too slow
        if (poly2.getPath().getLength() > 20) {
          poly2=new google.maps.Polyline([polyline.getPath().getAt(lastVertex-1)]);
          // map.addOverlay(poly2)
        }
        if (polyline.GetIndexAtDistance(d) < lastVertex+2) {
         if (poly2.getPath().getLength()>1) {
           poly2.getPath().removeAt(poly2.getPath().getLength()-1)
         }
         poly2.getPath().insertAt(poly2.getPath().getLength(),polyline.GetPointAtDistance(d));
       } else {
        poly2.getPath().insertAt(poly2.getPath().getLength(),endLocation.latlng);
      }
    }


    function animate(d) {
      if (d>eol) {
        map.panTo(endLocation.latlng);
        marker.setPosition(endLocation.latlng);
        return;
      }
      var p = polyline.GetPointAtDistance(d);
      map.panTo(p);
      marker.setPosition(p);
      updatePoly(d);
      timerHandle = setTimeout("animate("+(d+step)+")", tick);
    }


    function startAnimation() {
      eol=polyline.Distance();
      map.setCenter(polyline.getPath().getAt(0));
        // map.addOverlay(new google.maps.Marker(polyline.getAt(0),G_START_ICON));
        // map.addOverlay(new GMarker(polyline.getVertex(polyline.getVertexCount()-1),G_END_ICON));
        // marker = new google.maps.Marker({location:polyline.getPath().getAt(0)} /* ,{icon:car} */);
        // map.addOverlay(marker);
        poly2 = new google.maps.Polyline({path: [polyline.getPath().getAt(0)], strokeColor:"#0000FF", strokeWeight:10});
        // map.addOverlay(poly2);
        setTimeout("animate(50)",2000);  // Allow time for the initial map display

        google.maps.event.addListener(map, 'dblclick', function(e){
          marker= new google.maps.Marker({
            position: e.latLng,
            draggable:true,
            map :map,
          });
          map.panTo(e.latLng);
          google.maps.event.addListener(marker,'click',function(){
            placeMarker(marker);
          });
        });

      }

      function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
          var content = 'Error: The Geolocation service failed.';
        } else {
          var content = 'Error: Your browser doesnt support geolocation.';
        }

      }

//=============== ~animation funcitons =====================

function placeMarker(marker){
  window.open('eventInfoPg.html', '_blank');
  google.maps.event.addListener(marker, 'click', function() {
    var organizer = localStorage.getItem('organ');
    var typeOfevent = localStorage.getItem('Event');
    var eventInfo = localStorage.getItem('Info');
    var eventImg = localStorage.getItem('img');
    alert(organizer);
    alert(typeOfevent);
    alert(eventInfo);
    alert(eventImg);
    var contentString ="<form style='overflow:auto; height:100px;width:100px;'>" + 
    "Organizer: " + organizer+"<br>"
    "EventType: " + typeOfevent+ "<br>"+
    'eventInfo'+eventImg
    "</form>";
    alert(contentString);
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    infowindow.open(map,marker);

  });
}


//////////////////////////////////
//
//
//
//          Add grid part
//
//
//
//
//////////////////////////////////

//// grid control

function GridControl(controlDiv,map){
  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map
  controlDiv.style.padding = '7px';

  // Set CSS for the control border
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '1px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to show the safe region';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior
  var controlText = document.createElement('div');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '12px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = '<b>Safe Region On</b>';
  controlUI.appendChild(controlText);


  google.maps.event.addDomListener(controlUI, 'click', function() {
    toggle(openState);
  });
}

  /////////////// to add layer
  /*
  function USGSOverlay(bounds, image, map){
   console.log('initialize all the property');
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    // Define a property to hold the image's div. We'll actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;
    // Explicitly call setMap on this overlay
    this.setMap(map);
  }

  USGSOverlay.prototype.onAdd = function(){
    console.log('onadd function is called');
    var div = document.createElement('div');
    div.style.border ='none';
    div.style.borderWidth = '0px';
    div.style.position ='absolute';
    // create the img element to sttach to the div
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    div.appendChild(img);
    this.div_=div;
    // Add the element to the "overlayImage" pane.
    var panes = this.getPanes();
    panes.overlayImage.appendChild(this.div_);
  };


  USGSOverlay.prototype.draw = function(){
    console.log('draw function is called');
    var overlayProjection = this.getProjection();
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
    div.style.visibility='hidden';
    console.log(div);
  };


////////////hide
USGSOverlay.prototype.hide = function() {
  if (this.div_) {
    // The visibility property must be a string enclosed in quotes.
    this.div_.style.visibility = 'hidden';
  }
};

///////////show
USGSOverlay.prototype.show = function() {
  console.log("show function is called");
  if (this.div_) {
    this.div_.style.visibility = 'visible';
  }
};

///////////////toggle
USGSOverlay.prototype.toggle = function() {
  console.log("toggle function is called");
  if (this.div_) {
    if (this.div_.style.visibility == 'hidden') {
      this.show();
    } else {
      this.hide();
    }
  }
};*/


//////////////////////////////////
//
//
//
//   Add amrker to given latlng
//
//
//
//
//////////////////////////////////

function UploadEvent(){
  var lat = document.getElementById("lat").value;
  var lng = document.getElementById("lng").value;
  var myLatlng = new google.maps.LatLng(lat,lng);
  //var myInfo = new google.maps.InfoWindow({size: new google.maps.Size(150,50)});

  var contentString = '<div id="content">'+
  '<div id="siteNotice">'+
  '</div>'+
  '<h1 id="firstHeading" class="firstHeading">Title</h1>'+
  '<div id="bodyContent">'+
  '<p><b>*****</b>, also referred to as <b>****</b>, is a large ' +
  'rock caves and ancient paintings. Uluru is listed as a World '+
  'Heritage Site.</p>'+
  '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
  'http://en.wikipedia.org/w/index.php?title=Uluru</a> '+
  '(last visited June 22, 2009).</p>'+
  '</div>'+
  '</div>';

  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  console.log("add a marker to "+myLatlng);

  var marker = new google.maps.Marker({
    position: myLatlng,
    map:map,
    animation: google.maps.Animation.DROP,
    icon:'image/highhills.png',
    title:'On sale'
  });
  //marker.showInfoWindow();

}


function toggle(){
  if(document.getElementById('safe-region-btn').value=='S'){
   safeRegion.setOptions({ fillOpacity:0,strokeOpacity:0 });
   document.getElementById('safe-region-btn').value='H'

 }
  else{
   safeRegion.setOptions({ fillOpacity:0.35,strokeOpacity:0.8 });
   document.getElementById('safe-region-btn').value='S'
  }
}

function create_grid(x,y){

  var c=document.getElementById('mycanvas');
  c.style.display='block';
  console.log("call create function"+" "+x+y+" "+c);
  var ctx = c.getContext('2d');
  ctx.fillStyle='#FF0000';
  ctx.fillRect(x,y,20,10);
  document.getElementById('safe-region-btn').value='H';

}

function cancel_grid(){
  var c=document.getElementById('mycanvas');
  c.style.display='none';
  document.getElementById('safe-region-btn').value='S';
}

  //////to show the coordinates on the map upon mousehover
  function cnvs_getCoordinates(e)
  {
    x=e.clientX;
    y=e.clientY;
    document.getElementById("xycoordinates").innerHTML="Coordinates: (" + x + "," + y + ")";
  }

  function cnvs_clearCoordinates()
  {
    document.getElementById("xycoordinates").innerHTML="Coordinates:";
  }
//////
/////// to change the display of the event marker
function afterMatch1(){
  PGPmarker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout('PGPmarker.setAnimation(null)',2520);

}

//////to change the user interface
function afterMatch2(){

}


function invisible(){
  safeRegion.setOptions({ fillOpacity:0,strokeOpacity:0 });
}




