var directionsService = new google.maps.DirectionsService();
function RoadControl(controlDiv) {
 controlDiv.style.padding = '5px';
  	// Set CSS for the control border
  	var controlUI = document.createElement('div');
  	controlUI.style.backgroundColor = 'white';
  	controlUI.style.borderStyle = 'solid';
  	controlUI.style.borderWidth = '2px';
  	controlDiv.appendChild(controlUI);
  	// Set CSS for the control interior
   controlText = document.createElement('div');
   controlText.style.width = '263px';
   controlText.style.height = '25px';
   controlText.style.paddingLeft = '4px';
   controlText.style.paddingRight = '4px';
   controlText.style.textAlign='center';
   controlText.style.lineHeight = '30px';
   controlText.style.fontWeight = 'bold';

  	//controlText.style.background = 'url(image/road.jpg) no-repeat';
  	controlUI.appendChild(controlText);
  }

  function initialize(){
    directionsDisplay = new google.maps.DirectionsRenderer();
    //var myLatlng = new google.maps.LatLng(1.295053, 103.773846);
    var myLatlng;

    var mapOptions = {
      //center: myLatlng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      }
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    ///////get current location
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          myLatlng = new google.maps.LatLng(position.coords.latitude,
          position.coords.longitude);
         /* var userMarker = new google.maps.Marker({
          map: map,
          position: myLatlng,
          animation: google.maps.Animation.DROP,
          draggable: true,
          title:"User Location"
        });
           userMarker.setMap(map);
           userMarker.setIcon('image/male-2.png');*/
        map.setCenter(myLatlng);
      }, 
       function() {
      handleNoGeolocation(true);
      });
       } else {
      handleNoGeolocation(false);}
      ////////////////// end of get current location

    
    var roadControlDiv = document.createElement('div');
    var roadControl = new RoadControl(roadControlDiv);
    roadControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(roadControlDiv);
    
    google.maps.event.addListener(map,'mousemove',function(event){
      //positionIndication.open(map);
      var place = event.latLng.lat()+"  ,  "+event.latLng.lng();
      controlText.innerHTML=place;
    });

    CoordinatesSet = new Array();
    routePath_con = new Array();

    

    ////initialize right click to set the starting and ending place
    var ContextMenuControlDiv = document.createElement('DIV');   
    var ContextMenuControl = new createContextMenu(ContextMenuControlDiv, map);   
    ContextMenuControlDiv.index = 1;   
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(ContextMenuControlDiv);

    change=false;
    generate_safeRegion();
    count=0;
    finish=true;


 }////////////////////////// end of initialize function

 function createContextMenu(controlUI,map) {
  var contextmenu = document.createElement("div");   
  contextmenu.style.display = "none";   
  contextmenu.style.background = "#ffffff";   
  contextmenu.style.border = "10px solid #FFFFFF";
  contextmenu.style.border = 
  contextmenu.innerHTML =    
  "<a href='javascript:choosestart()'><div class='context' style='margin-bottom:0px'><b> start point</b> </div></a>"
  + "<a href='#' onclick='javascript:chooseend()'><div class='context'><b> end point</b> </div></a>"
  + "<a href='#' onclick='createEditableMarker()'><div class='context'> <b>Add new event</b> </div></a>";
  controlUI.appendChild(contextmenu);   
   
  google.maps.event.addDomListener(map, 'rightclick', function (event) {   
    right_para1=event.latLng.lat();
    right_para2=event.latLng.lng();
   
    document.getElementById("pointhide").value = event.latLng.lat() + "," + event.latLng.lng();
     
        contextmenu.style.position="relative";   
        contextmenu.style.left=(event.pixel.x-80)+"px";   
        contextmenu.style.top=event.pixel.y+"px";   
        contextmenu.style.display = "block"; 
      });   
 
  google.maps.event.addDomListener(controlUI, 'click', function () {   
    contextmenu.style.display = "none";   
  });   

  google.maps.event.addDomListener(map, 'click', function () {   
    contextmenu.style.display = "none";   
  });   
  google.maps.event.addDomListener(map, 'drag', function () {   
    contextmenu.style.display = "none";   
  });   
  
}

function choosestart()
{
  document.getElementById("start").value = document.getElementById("pointhide").value;
  var startq=document.getElementById('start').value;
  var temp1 = startq.split(",");
  var marker1 = new google.maps.Marker({
      draggable:true,
      animation: google.maps.Animation.DROP,
      title: 'start point'
    });
   google.maps.event.addListener(marker1, 'click', function(){
      if (marker1.getAnimation() != null) {
        marker1.setAnimation(null);
      } else {
        marker1.setAnimation(google.maps.Animation.BOUNCE);
      }
    });
   var  infowindow1 = new google.maps.InfoWindow({});
   google.maps.event.addListener(marker1, 'click', function(){
      infowindow1.open(map,marker1);
    });
  marker1.set('position',new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])));
  marker1.setMap(map);
}

function chooseend(lat,lng)
{
  document.getElementById("end").value = document.getElementById("pointhide").value;
  var endq=document.getElementById('end').value;
  var temp2 = endq.split(",");
  var marker2 = new google.maps.Marker({
      draggable:true,
      animation: google.maps.Animation.DROP,
      title: 'end point'
    });
    google.maps.event.addListener(marker2, 'click', function(){
      if (marker2.getAnimation() != null) {
        marker2.setAnimation(null);
      } else {
        marker2.setAnimation(google.maps.Animation.BOUNCE);
      }
    });
    var infowindow2 = new google.maps.InfoWindow({});
    google.maps.event.addListener(marker2, 'click', function(){
      infowindow2.open(map,marker2);
    });
    marker2.set('position',new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])));
    marker2.setMap(map);
}

function add(){
 var location = new google.maps.LatLng(right_para1,right_para2);
  var marker = new google.maps.Marker({
    position:location,
    map:map,
    draggable:true
  });
  
  var S=setContent(location.lat(),location.lng());
  
  var win = new google.maps.InfoWindow({
    content:S,
  });
  win.open(map,marker);  
     google.maps.event.addListener(marker,'drag',function(event){
      var S2=setContent(event.latLng.lat(),event.latLng.lng());
      win.setContent(S2);
    });
     google.maps.event.addListener(win,'closeclick',function(){
      marker.setMap(null);
    });
}

function createEditableMarker(){
  var location = new google.maps.LatLng(right_para1,right_para2);
  var marker = new google.maps.Marker({
    position:location,
    html:setContent(location.lat(),location.lng()),
    draggable:true,
    map:map
  });
  marker.set("editing",false);
  var htmlBox = document.createElement("div");
  htmlBox.innerHTML = marker.html || "";
  htmlBox.style.width = "300px";
  htmlBox.style.height ="100px";

  var textBox = document.createElement("textarea");
  textBox.innerText = marker.html || "";
  textBox.style.width = "300px";
  textBox.style.height = "100px";
  textBox.style.display = "none";

  var container = document.createElement("div");
  container.style.position = "relative";
  container.appendChild(htmlBox);
  container.appendChild(textBox);
  
  var editBtn = document.createElement("button");
  editBtn.innerText = "Edit";
  container.appendChild(editBtn);

  var win = new google.maps.InfoWindow({
    content:container
  });

  win.open(map,marker);  
     google.maps.event.addListener(marker,'drag',function(event){
      var S2=setContent(event.latLng.lat(),event.latLng.lng());
       textBox.innerText = S2;
        htmlBox.innerHTML =S2;
    });
     google.maps.event.addListener(win,'closeclick',function(){
      marker.setMap(null);
    });

     google.maps.event.addDomListener(editBtn, "click", function() {
      marker.set("editing", !marker.editing);
    });
    
    //(11)A (property)_changed event occur when the property is changed.
    google.maps.event.addListener(marker, "editing_changed", function(){
      textBox.style.display = this.editing ? "block" : "none";
      htmlBox.style.display = this.editing ? "none" : "block";
    });
    
    //(12)A change DOM event occur when the textarea is changed, then set the value into htmlBox.
    google.maps.event.addDomListener(textBox, "change", function(){
      htmlBox.innerHTML = textBox.value;
      marker.set("html", textBox.value);
    });
    return marker;
}

function setContent(a,b){
 //var contentS = "<div class='infowindow'>";
 //contentS += "Latitude: " + a + "<br/>";
 //contentS += "Longitude: " + b+ "</div>";
 //return contentS;
 return (a+" , "+b).toString();
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function calcRoute() {
  var infowindow1;
  var infowindow2;
  var travel_mode;
  var movingIcon;
  var movingMarker;
  var altInfowindow ;

  var  routePath = new google.maps.Polyline({
      strokeColor: "#272727",
      strokeOpacity: 0.7,
      strokeWeight: 5,
      visible: true,
    });

 // document.getElementById("map_canvas").style.display = "block";


  var start;
  var end;

  if(document.getElementById('start').value=="")
    start = document.getElementById('starttext').value;
  else
    start = document.getElementById('start').value;

  if(document.getElementById('end').value=="")
    end = document.getElementById('endtext').value;
  else
    end = document.getElementById('end').value;
  
  var temp1 = start.split(",");
  var temp2 = end.split(",");
  
  map.setCenter(new google.maps.LatLng((parseFloat(temp1[0])+parseFloat(temp2[0]))/2, (parseFloat(temp1[1])+parseFloat(temp2[1]))/2));
  map.setZoom(14);
  
  routePath.setMap(map);
  

  travel_mode = document.getElementById('mode').value;
  if(travel_mode=="DRIVING"){
    if(temp1[1]>temp2[1])
      movingIcon='image/drive-left.gif';
    else
      movingIcon='image/drive-right.gif';
  }

  else if(travel_mode=="WALKING"){
    if(temp1[1]>temp2[1])
      movingIcon='image/walk-left.gif';
    else
      movingIcon='image/walk-right.gif';
  }

  else if(travel_mode=="BICYCLING")
    movingIcon='image/bike.gif';
  else{
    if(temp1[1]>temp2[1])
      movingIcon='image/bus-left.gif';
    else
      movingIcon='image/bus-right.gif';
  }
  
  //////set the circle around the moving marker


  var request = {
    origin:new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])),
    destination:new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])),
    travelMode:travel_mode
  };
  
  //////set an info window to the moving marker
  
      
  directionsService.route(request, function(response, status) {
    //finish=false;
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      
      movingMarker = new google.maps.Marker({
      icon:movingIcon,
      draggable:false,
      });

      var subjectPoint={
      radius: 1.0,
      color: '#1abc9c',
      }
      var subjectRange = new google.maps.Circle({
      map:map,
      radius:subjectPoint.radius*1000,
      fillColor: subjectPoint.color,strokeColor:'#3D9912'
      });
      subjectRange.bindTo('center',movingMarker,'position');

      altInfowindow = new google.maps.InfoWindow();
      altInfowindow.open(map,movingMarker);
      
      var Coordinates = new Array();
      var temp = response.routes[0].overview_path;

          for(var j = 0;j<temp.length;j++)
          {
            Coordinates.push(new google.maps.LatLng((temp[j].lat()), (temp[j].lng())));
          } 
         
          CoordinatesSet.unshift(Coordinates);
          
          routePath.setPath(Coordinates);
          
          movingMarker.setMap(map);
          movingMarker.set('position',Coordinates[0]);

          subjectPoint.setPoint="Coordinates[0]";
          i=0;
          pathsnum=Coordinates.length;
          console.log("pathsum is "+pathsnum);
  
          Coordinates = CoordinatesSet.pop();
          
          function resetMkPoint(i){
            movingMarker.set('position',Coordinates[i]);
            subjectPoint.setPoint="Coordinates[i]";
            if(i<pathsnum)
            altInfowindow.setContent(String(Coordinates[i]));
            else
            altInfowindow.close();
            if(i < pathsnum){
              setTimeout(function(){
                i++;
                resetMkPoint(i);
                console.log(i);
              },1000);
            }
          }// end of reset function
          setTimeout(function(){
            resetMkPoint(0);
             },550);    //////550 is slower than 150

        }
        //console.log("direction service function finished");
      });
    //console.log("calculate function finished");
}//// end of calculate function

function generate_safeRegion(){ ///should pass in l and n value
  var width = 0.005;
  var l=1.309416;
  var n=103.779613;
  var rectCoords = [
  new google.maps.LatLng(l,n),
  new google.maps.LatLng(l+width,n),
  new google.maps.LatLng(l+width,n+width),
  new google.maps.LatLng(l,n+width),
  new google.maps.LatLng(l,n)
  ];
  safeRegion =  new google.maps.Polygon({
    path:rectCoords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });

}

function show(){
  safeRegion.setMap(map);
  change=true;
}

function hide(){
  safeRegion.setMap(null);
  change=false;
}

function toggle2(){

  if(change==false)
    show();
  else if(change==true)
    hide();
}

function UploadEvent(){
  count=0;////reset count to 0 for cating next event title
  var lat = document.getElementById("lat").value;
  var lng = document.getElementById("lng").value;
  var myLatlng = new google.maps.LatLng(lat,lng);
  //var myInfo = new google.maps.InfoWindow({size: new google.maps.Size(150,50)});

  var listContent = document.getElementById("event_list").value;
  var len1 = Title.length;
  listContent = listContent.substr(len1);
  listContent = listContent.replace(/(?:\r\n|\r|\n)/g, '<br />');
  var contentString = '<div style="height:150px;width:250px;">'+
  '<h3>'+Title+'</h3>'+
  '<div id="bodyContent">'+
  listContent+
 '</div>'+
 '</div>';

  //var contentString = document.getElementById("event_list").value;
  document.getElementById("event_list").value="Event Deplyed Successfully.";
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
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });

}

///////add the conditions of event on the display area
function addCon(){
  
  var newInfo = document.getElementById("newInfo").value+"\n";
if(count==0){
Title=newInfo.toString();
document.getElementById("newInfo").placeholder = "Enter Event Details";
}

  $('#event_list').val($('#event_list').val()+newInfo);
  document.getElementById("newInfo").value="";
count++;

}

//////// after the event is matched change the action of the marker
function afterMatch1(){
  PGPmarker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout('PGPmarker.setAnimation(null)',2520);
}

//////to change the user interface
function afterMatch2(){

  document.getElementById("part1").style.display="none";
  document.getElementById("matchTitle").style.display="block";
  document.getElementById("accordion").style.display="block";
}




