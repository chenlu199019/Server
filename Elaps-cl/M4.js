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
    //autocomplete = new google.maps.places.Autocomplete(
      //(document.getElementById("starttext")), {types:['geocode']});

var myLatlng = new google.maps.LatLng(1.295053, 103.773846);
    //var myLatlng = new google.maps.LatLng();
    //geolocate(myLatlng);
    //console.log(myLatlng);
    var mapOptions = {
      center: myLatlng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      }
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    // show the lat lng along mouse move
    /*var positionString = '<div>'+
    '<span id="latspan"></span>'+
    '<span id="lngspan"></span>'+
    '</div>';
    var positionIndication = new google.maps.InfoWindow();*/
    // add the road control picture on the map
    var roadControlDiv = document.createElement('div');
    var roadControl = new RoadControl(roadControlDiv);
    roadControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(roadControlDiv);
    
    google.maps.event.addListener(map,'mousemove',function(event){
      //positionIndication.open(map);
      var place = event.latLng.lat()+"  ,  "+event.latLng.lng();
      controlText.innerHTML=place;
    });

    //////////// end of position indication 
    //////click to add marker on map
    


    ////////// end of click to put marker

    ///create two markers
    marker1 = new google.maps.Marker({
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


    marker2 = new google.maps.Marker({
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
    infowindow1 = new google.maps.InfoWindow({});
    infowindow2 = new google.maps.InfoWindow({});
    
    google.maps.event.addListener(marker1, 'click', function(){
      infowindow1.open(map,marker1);
    });

    google.maps.event.addListener(marker2, 'click', function(){
      infowindow2.open(map,marker2);
    });

    routePath = new google.maps.Polyline({
      strokeColor: "#272727",
      strokeOpacity: 0.7,
      strokeWeight: 5,
      visible: true,
    });
    routePath_con = new Array();

    ////initialize right click to set the starting and ending place
    var ContextMenuControlDiv = document.createElement('DIV');   
    var ContextMenuControl = new createContextMenu(ContextMenuControlDiv, map);   
    ContextMenuControlDiv.index = 1;   
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(ContextMenuControlDiv);

    change=false;
    generate_safeRegion();


 }////////////////////////// end of initialize function

 function createContextMenu(controlUI,map) {
  var contextmenu = document.createElement("div");   
  contextmenu.style.display = "none";   
  contextmenu.style.background = "#ffffff";   
  contextmenu.style.border = "10px solid #FFFFFF";
  contextmenu.innerHTML =    
  "<a href='javascript:choosestart()'><div class='context' style='margin-bottom:5px'> start point </div></a>"
  + "<a href='#' onclick='javascript:chooseend()'><div class='context'> end point </div></a>"
  + "<a href='#' onclick='javascript:add()'><div class='context'> end point </div></a>";
  controlUI.appendChild(contextmenu);   
  /*给整个地图增加右键事件监听*/  
  google.maps.event.addDomListener(map, 'rightclick', function (event) {   
    right_para1=event.latLng.lat();
    right_para2=event.latLng.lng();
    console.log(right_para1+", "+right_para2);
    document.getElementById("pointhide").value = event.latLng.lat() + "," + event.latLng.lng();
        //结束 方法详细内容   
        contextmenu.style.position="relative";   
        contextmenu.style.left=(event.pixel.x-80)+"px"; //平移显示以对应右键点击坐标   
        contextmenu.style.top=event.pixel.y+"px";   
        contextmenu.style.display = "block"; 
      });   
  /*点击菜单层中的某一个菜单项，就隐藏菜单*/  
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
  marker1.set('position',new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])));
  marker1.setMap(map);
}

function chooseend(lat,lng)
{
  document.getElementById("end").value = document.getElementById("pointhide").value;
  var endq=document.getElementById('end').value;
  var temp2 = endq.split(",");
  marker2.set('position',new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])));
  marker2.setMap(map);
}

function calcRoute() {
  document.getElementById("map_canvas").style.display = "block";
  var s1 = document.getElementById('start').value;
  var s2 = document.getElementById('starttext').value;


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
  
  marker1.set('position',new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])));
  marker1.setMap(map);
  
  marker2.set('position',new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])));
  marker2.setMap(map);
  
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
  var subjectPoint={
    radius: 1.0,
    color: '#1abc9c',
  }
  var subjectRange = new google.maps.Circle({
    map:map,
    radius:subjectPoint.radius*1000,
    fillColor: subjectPoint.color,strokeColor:'#3D9912'
  });
  //////////////// 

  movingMarker = new google.maps.Marker({
    icon:movingIcon,
    draggable:false,
  });
  subjectRange.bindTo('center',movingMarker,'position');

  var request = {
    origin:new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])),
    destination:new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])),
    travelMode:travel_mode
  };
  
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);

      var Coordinates = new Array();

      var temp = response.routes[0].overview_path;
          //alert(temp.length);
          for(var j = 0;j<temp.length;j++)
          {
            Coordinates.push(new google.maps.LatLng((temp[j].lat()), (temp[j].lng())));
          } 
          //}
          
          routePath.setPath(Coordinates);
          
          movingMarker.setMap(map);
          movingMarker.set('position',Coordinates[0]);

          subjectPoint.setPoint="Coordinates[0]";
          i=0;
          pathsnum=Coordinates.length;
          function resetMkPoint(i){
            movingMarker.set('position',Coordinates[i]);
            subjectPoint.setPoint="Coordinates[i]";
            if(i < pathsnum){
              setTimeout(function(){
                i++;
                resetMkPoint(i);
              },550);
            }

          }
          setTimeout(function(){
            resetMkPoint(0);
        //console.log(i);
             },550);    //////550 is alower than 150

        }
      });
}

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
  var lat = document.getElementById("lat").value;
  var lng = document.getElementById("lng").value;
  var myLatlng = new google.maps.LatLng(lat,lng);
  //var myInfo = new google.maps.InfoWindow({size: new google.maps.Size(150,50)});

  var contentString = '<div style="height:150px;width:250px;">'+
  '<h3>Title</h3>'+
  '<div id="bodyContent">'+
  //'<p>'+
  document.getElementById("event_list").value+
 // '</p>' +
 '</div>'+
 '</div>';

  //var contentString = document.getElementById("event_list").value;

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
  $('#event_list').val($('#event_list').val()+newInfo);
  document.getElementById("newInfo").value="";

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


function add(){
 //console.log("enter addMarker function");
 location = new google.maps.LatLng(right_para1,right_para2);
 console.log(right_para1+" "+right_para2);
 console.log(location);
  var marker = new google.maps.Marker({
    position:location,
    map:map,
    draggable:true
  });
  var a=location.lat();
  var b=location.lng();
  var S=setContent(a,b);
  
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

function setContent(a,b){
 var contentS = "<div class='infowindow'>";
 contentS += "Latitude: " + a + "<br/>";
 contentS += "Longitude: " + b+ "</div>";
 return contentS;
}