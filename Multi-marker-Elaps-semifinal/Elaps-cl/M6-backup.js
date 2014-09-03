var lastVertex=1;
var stepnum=0;
var step=50;     //5; //meters
var tick=360;     // miliseconds
var eol=[];

var map;
//var directionsDisplay= new Array();
var directionService;
var stepDisplay;

var position;
var marker=[];
var polyline=[];
var poly2 = [];
var poly=null;
var startLocation=[];
var endLocation=[];
var timerHandle=[];
var eventMarkers=[];

var speed=0.00005,wait=1;

var myPano;
var panoClient;
var nextPanoId;

var startLoc = new Array();
var endLoc = new Array();
var IdS;/// track the startLoc id
var IdE; // track the endLoc id
var eventId; //track the id of event

var Color = ["#FF0000","#00FF00","#0000FF"];
var count;///// count for the title of upload new event
var clickIndex;
var directionsDisplay;
var contentStr;
var geocoder;
var Title;


function RoadControl(controlDiv){
	controlDiv.style.padding='5px';
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor='white';
	controlUI.style.borderStyle='solid';
	controlUI.style.borderWidth='2px';
	controlDiv.appendChild(controlUI);

	controlText = document.createElement('div');
	controlText.style.width='263px';
	controlText.style.height = '25px';
	controlText.style.paddingLeft = '4px';
	controlText.style.paddingRight = '4px';
	controlText.style.textAlign='center';
	controlText.style.lineHeight = '30px';
	controlText.style.fontWeight = 'bold';
	controlUI.appendChild(controlText);
}

function initialize(){
	infowindow = new google.maps.InfoWindow({
		size: new google.maps.Size(150,50)
	});

	var mapOptions = {
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scaleControl:true,
		scaleControlOptions:{
			position: google.maps.ControlPosition.LEFT_BOTTOM,
		}
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	var myLatlng;
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			myLatlng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			map.setCenter(myLatlng);
		},
		function(){
			handleNoGeolocation(true);
		});
	}
	else{
		handleNoGeolocation(false);
	}
	//// add the window to show the latlng under mouse
	var latlngControlDiv = document.createElement('div');
	var latlngControl = new RoadControl(latlngControlDiv);
	latlngControlDiv.index=1;
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(latlngControlDiv);
	google.maps.event.addListener(map,'mousemove',function(event){
		var place = event.latLng.lat()+" , "+event.latLng.lng();
		// change the inner html for the control created above
		controlText.innerHTML=place;
	});
	//address=myLatlng;
	//geocoder = new google.maps.Geocoder();
	//geocoder.geocode({'address':address}, function(results,status){
	//	map.fitBounds(results[0].geometry.viewport);
	//});


	// initialize right click to set the starting and ending
	var ContextMenuControlDiv = document.createElement('DIV');   
	var ContextMenuControl = new createContextMenu(ContextMenuControlDiv, map);   
	ContextMenuControlDiv.index = 1;   
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(ContextMenuControlDiv);

    change=false; // for safeRegion
    generate_safeRegion();
    routeID=0;
    IdS=0;
    IdE=0;  //initiate the start and end id
    clickIndex=0;// user click index
    directionsDisplay = new Array();
    geocoder= new google.maps.Geocoder();//for finding the address from laylng 
    eventId=0;
    count=0;/// for differentiate title for the added event
    document.getElementById("interest_list").innerText="";

}///////////////////////////////// end of initial function

function createContextMenu(controlUI,map){
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

}/////// end of right click sent address function

function choosestart()
{ 
	var startId=IdS++;
	document.getElementById("start").value = document.getElementById("pointhide").value;
	var startq=document.getElementById('start').value;
	//console.log("the start value and format is "+startq);
  //var temp1 = startq.split(",");
  //marker1.set('position',new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])));
  //marker1.setMap(map);
  createMarker(startq,startId);
  startLoc[startId]=startq;
  console.log("startLoc index "+startId+", with value of "+startq);

}

function chooseend(lat,lng)
{ 
	var endId=IdE++;
	document.getElementById("end").value = document.getElementById("pointhide").value;
	var endq=document.getElementById('end').value;
  //var temp2 = endq.split(",");
  //marker2.set('position',new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])));
  //marker2.setMap(map);
  createMarker(endq,endId);
  endLoc[endId]=endq;
  console.log("endLoc index "+endId+", with value of "+endq);
}


function createMarker(latlng,lable,image){
	
	var html=' ';
	//console.log("createMarker ("+latlng+", "+lable+", "+html+" )");
	var place = String(latlng);
	var temp1=place.split(",");
	//console.log("place for the marker is "+new google.maps.LatLng(parseFloat(temp1[0]),parseFloat(temp1[1])));
	var contentString = '<b>'+'User'+lable+'</b><br>'+html;
	var marker = new google.maps.Marker({
		position:new google.maps.LatLng(parseFloat(temp1[0]),parseFloat(temp1[1])),
		map:map,
		icon: image,
		title:String(lable),
		//zIndex:Math.round(latlng.lat()*-100000)<<5
		zIndex:100

	});
	var infowindow = new google.maps.InfoWindow();
	
	marker.myname = String(lable);
	google.maps.event.addListener(marker,'click',function(){
		infowindow.setContent(contentString);
		infowindow.open(map,marker);
	});
	return marker;
}///////////////////////////// end of create marker function



function myFunction(){
	var directionsDisplay = new Array();
	directionService = new google.maps.DirectionsService();
	calcRoute(clickIndex,directionService);	
	clickIndex++;
}

function calcRoute(id,directionService){
	console.log("calculate route id is "+id);
	var infowindow1;
	var infowindow2;
	var travel_mode;
	var movingIcon;
	var movingMarker;
	var altInfowindow;

	var rendererOptions = {
		map:map,
		suppressMarkers: true,
		preserveViewport: true
	}

	var start;
	var end;
	//IdS=id;
	//idE=id;
	if(document.getElementById('starttext').value=="From")
		start=startLoc[id];
	else{

		start=document.getElementById('starttext').value;
		IdS++;
		startLoc[IdS]=start;
	}

	if(document.getElementById('endtext').value=="To")
		end=endLoc[id];
	else{
		end=document.getElementById('endtext').value;
		IdE++;
		endLoc[IdE]=end;
	}
	console.log("")
	console.log("the start and end for this route is "+start+", "+end);
	console.log("");
	var temp1 = start.split(",");
	var temp2 = end.split(",");
	map.setCenter(new google.maps.LatLng((parseFloat(temp1[0])+parseFloat(temp2[0]))/2, (parseFloat(temp1[1])+parseFloat(temp2[1]))/2));
	map.setZoom(16);

	travel_mode = document.getElementById('mode').value;
	speed=document.getElementById('gear').value;
	step=parseFloat(tick)/3600.0*speed;

	console.log("travel_mode is "+travel_mode+" speed chosen is "+speed+" step is "+step);
	var list = document.getElementById("panel2");
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

	else if(travel_mode=="BICYCLING"){
		movingIcon='image/bike.gif';
	}
	else{
		if(temp1[1]>temp2[1])
			movingIcon='image/bus-left.gif';
		else
			movingIcon='image/bus-right.gif';
	}

	directionService = new google.maps.DirectionsService();
	var request = {
		origin:new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])),
		destination:new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])),
		travelMode:travel_mode
	};

	directionService.route(request,makeRouteCallback(id,directionsDisplay[id]));

    //console.log("IdS is "+IdS);
    function makeRouteCallback(routeNum,disp){
    	if(polyline[routeNum] && (polyline[routeNum].getMap()!=null)){
    		startAnimation(routeNum);
    		return;
    	}
    	return function(response,status){
    		if(status==google.maps.DirectionsStatus.OK){
    			var bounds= new google.maps.LatLngBounds();
    			var route = response.routes[0];
    			startLocation[routeNum] = new Object();
    			endLocation[routeNum]=new Object();
    			polyline[routeNum]= new google.maps.Polyline({
    				path:[],
    				strokeColor: "#272727",
    				strokeOpacity: 0.7,
    				strokeWeight: 5
    			});

    			poly2[routeNum]= new google.maps.Polyline({
    				path:[],
    				strokeColor: "#272727",
    				strokeOpacity: 0.7,
    				strokeWeight: 5
    			});

    			var path = response.routes[0].overview_path;
    			var legs = response.routes[0].legs;
    			disp = new google.maps.DirectionsRenderer(rendererOptions);
    			disp.setMap(map);
    			disp.setDirections(response);

				//for markers

				for(i=0;i<legs.length;i++){
					if(i==0){
						startLocation[routeNum].latlng = legs[i].start_location;
						var a = String(startLocation[routeNum].latlng);  ///replace the parenthese
						//console.log("a is "+a);
						a=a.replace(/[{()} ]/g, ''); 
						//console.log(" after remove the parenthese "+a);
						startLocation[routeNum].address = legs[i].start_address;
						//marker[routeNum]=createMarker(legs[i].start_location,"start",legs[i].start_address,"green");
						marker[routeNum]=createMarker(a,id,movingIcon);   //////////////////////////   create moving marker
					}
					endLocation[routeNum].latlng = legs[i].end_location;
					endLocation[routeNum].address = legs[i].end_address;
					var steps=legs[i].steps;

					for(j=0;j<steps.length;j++){
						var nextSegment = steps[j].path;
						for(k=0;k<nextSegment.length;k++){
							polyline[routeNum].getPath().push(nextSegment[k]);
						}
					}
				}
			}/// end of if service status is ok 
			polyline[routeNum].setMap(map);
			startAnimation(routeNum);
		}//// end of return function
	}// end of makePoint function

}//////////////////////////////// end of calculate route function



function updatePoly(i,d){
	if(poly2[i].getPath().getLength()>20){
		poly2[i] = new google.maps.Polyline([polyline[i].getPath().getAt(lastVertex-1)]);
	}

	if(polyline[i].GetIndexAtDistance(d)<lastVertex+2){
		if(poly2[i].getPath().getLength()>1){
			poly2[i].getPath().removeAt(poly2[i].getPath().getLength()-1)
		}
		poly2[i].getPath().insertAt(poly2[i].getPath().getLength(),polyline[i].GetPointAtDistance(d));
	}else{
		poly2[i].getPath().insertAt(poly2[i].getPath().getLength(),endLocation[i].latlng);
	}
}////////////////////// end of update poly function

function animate(index,d){
	if(d>eol[index]){
		marker[index].setPosition(endLocation[index].latlng);
		return;
	}
	var p = polyline[index].GetPointAtDistance(d);
	marker[index].setPosition(p);
	updatePoly(index,d);
	timerHandle[index]=setTimeout("animate("+index+","+(d+step)+")",tick);
}///////////////////////// end of animate function

function startAnimation(index){
	if(timerHandle[index]) clearTimeout(timerHandle[index]);
	eol[index]=polyline[index].Distance();
	map.setCenter(polyline[index].getPath().getAt(0));
	poly2[index] = new google.maps.Polyline({path: [polyline[index].getPath().getAt(0)],strokeColor:"#272727",strokeWeight:5});
	timerHandle[index]=setTimeout("animate("+index+",50)",2000);

}/////////////// end of startAnimation


///  createEditableMarker call upon right click choose
function createEditableMarker(){
	var No = eventId;
	eventId++;
	var location = new google.maps.LatLng(right_para1,right_para2);
	eventMarkers[No] = new google.maps.Marker({
		position:location,
		draggable:true,
		map:map
	});

	var locBox = document.createElement("div");
	locBox.style.width="200px";
	locBox.style.height="50px";
	locBox.style.backgroundColor="#DBD8AB";
	locBox.style.lineHeight="25px";

	var orgBox = document.createElement("div");
	orgBox.style.width="200px";
	orgBox.style.height="25px";
	orgBox.style.backgroundColor="#BFCD78";
	orgBox.innerHTML='Organizer : ';
	orgBox.style.lineHeight="25px";
	orgBox.contentEditable="true";
	orgBox.style.display="none";

	var textBox = document.createElement("textarea");	
	textBox.style.width = "200px";
	textBox.style.lineHeight = "20px";
	textBox.style.height="100px";
	textBox.style.backgroundColor="#869D59";
	textBox.innerText="Event Details: ";
	textBox.style.display="none";

	var container = document.createElement("div");
	container.style.position = "relative";
	container.style.margin="0px";
	container.style.height="200px";
	container.appendChild(locBox);
	container.appendChild(orgBox);
	container.appendChild(textBox);

	var editBtn = document.createElement("button");
	editBtn.innerText = "Edit";
	editBtn.style.position="relative";
	editBtn.style.top="3px";
	editBtn.style.fontWeight="bold";
	editBtn.style.backgroundColor="#8F6F62";
	container.appendChild(editBtn);

	var win = new google.maps.InfoWindow({
		content:container
	});

	setContent(location.lat(),location.lng(),locBox,No);
	win.open(map,eventMarkers[No]);

	
	google.maps.event.addListener(eventMarkers[No],"dragend",function(event){
		locBox.setAttribute("contentEditable", true);
		setContent(event.latLng.lat(),event.latLng.lng(),locBox,No);
	});
	
	//google.maps.event.addListener(win,'closeclick',function(){
		//marker.setMap(null);
		//win.close();
	//});
google.maps.event.addListener(eventMarkers[No],'click',function(){
	win.open(map,eventMarkers[No]);
});

google.maps.event.addDomListener(editBtn, "click", function() {
	locBox.setAttribute("contentEditable", false);
	if(editBtn.innerText=='Edit'){
		orgBox.contentEditable="true";
		orgBox.style.display="block";
		textBox.style.display="block";
		editBtn.innerText="Upload";
	}
	else if(editBtn.innerText=="Upload"){
		orgBox.contentEditable="false";
		editBtn.innerText="Edit";
	}
});    

}

///////auxillary function for createEditableMarker
function setContent(a,b,locBox,No){
	var location = new google.maps.LatLng(a,b);
	geocoder.geocode({'latLng' : location}, function(results,status){
		if(status==google.maps.GeocoderStatus.OK){
			contentStr=results[1].formatted_address;
			locBox.innerHTML='#'+No+" "+'<u>'+"Location : "+'</u>'+ contentStr;
		}
		else
			htmlBox.innerHTML="";
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
  count=0;////reset count to 0 for cating next event title
  var lat = document.getElementById("lat").value;
  var lng = document.getElementById("lng").value;
  var myLatlng = new google.maps.LatLng(lat,lng);
  map.setCenter(myLatlng);
  var No=eventId;
  eventId++;
  eventMarkers[No] = new google.maps.Marker({
  	position:myLatlng,
  	draggable:true,
  	map:map
  });
  var locBox = document.createElement("div");
  locBox.style.width="200px";
  locBox.style.height="50px";
  locBox.style.backgroundColor="#DBD8AB";
  locBox.style.lineHeight="25px";

  var orgBox = document.createElement("div");
  orgBox.style.width="200px";
  orgBox.style.height="25px";
  orgBox.style.backgroundColor="#BFCD78";
	//orgBox.innerHTML='Organizer : ';
	orgBox.style.lineHeight="25px";
	orgBox.contentEditable="true";

	var textBox = document.createElement("textarea");	
	textBox.style.width = "200px";
	textBox.style.lineHeight = "20px";
	textBox.style.height="100px";
	textBox.style.backgroundColor="#869D59";

	var container = document.createElement("div");
	container.style.position = "relative";
	container.style.margin="0px";
	container.style.height="200px";
	container.appendChild(locBox);
	container.appendChild(orgBox);
	container.appendChild(textBox);
	
	var win = new google.maps.InfoWindow({
		content:container
	});
	setContent(lat,lng,locBox,No);


	var listContent = document.getElementById("event_list").value;
	var len1 = Title.length;
	listContent = listContent.substr(len1);
  //console.log(listContent);
  //listContent = listContent.replace(/(?:\r\n|\r|\n)/g, '<br&nbsp;/>');
  //console.log(listContent);
  orgBox.innerHTML='Organizer : '+Title;
  var temp = "Event Details: "+'<br&nbsp;/>'+listContent;
  function replaceHtml(string_to_replace) {
  	return $("<div>").append(string_to_replace.replace(/<br.*?>/g, '&#13;&#10;')).text();
  }
  textBox.innerText=replaceHtml(temp);
  
  
  /*var contentString = '<div style="height:150px;width:250px;">'+
  '<h3>'+Title+'</h3>'+
  '<div id="bodyContent">'+
  listContent+
  '</div>'+
  '</div>';*/

  document.getElementById("event_list").value="Event Deployed Successfully.";
  
  /*var infowindow = new google.maps.InfoWindow({
  	content: contentString
  });
  console.log("add a marker to "+myLatlng);

  var marker = new google.maps.Marker({
  	position: myLatlng,
  	map:map,
  	animation: google.maps.Animation.DROP,
 
  	title:'On sale'
  });
  google.maps.event.addListener(marker, 'click', function() {
  	infowindow.open(map,marker);
  });*/

google.maps.event.addListener(eventMarkers[No], 'click', function() {
	win.open(map,eventMarkers[No]);
});
document.getElementById("newInfo").placeholder = "Enter Organiser first";

$('#newInfo').focus(function(){
	document.getElementById("event_list").value="";
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


function changeSet(){
	//console.log("call change set");
	var mode=document.getElementById('mode').value;
	
	if(mode=="DRIVING")
		index=0;
	else if(mode=="WALKING")
		index=1;
	else if(mode=="BICYCLING")
		index=2;
	else if(mode=="TRANSIT")
		index=3;
	else
		return;
	var sel = document.getElementById('gear');
	console.log("opts length "+sel.length);
	
	if(index==0){
		sel.options[0].text="50 Km/h";
		sel.options[1].text="60 Km/h";
		sel.options[2].text="70 Km/h";
		sel.options[3].text="80 Km/h";

		sel.options[0].value="50";
		sel.options[1].value="60";
		sel.options[2].value="70";
		sel.options[3].value="80";
	}
	else if(index==1){  		//walking 5,6,7,8
		sel.options[0].text="5 Km/h";
		sel.options[1].text="6 Km/h";
		sel.options[2].text="7 Km/h";
		sel.options[3].text="8 Km/h";

		sel.options[0].value="5";
		sel.options[1].value="6";
		sel.options[2].value="7";
		sel.options[3].value="8";
	}
	else if(index==2){				//bicycle 20 21 22 23 
		sel.options[0].text="20 Km/h";
		sel.options[1].text="21 Km/h";
		sel.options[2].text="22 Km/h";
		sel.options[3].text="23 Km/h";

		sel.options[0].value="20";
		sel.options[1].value="21";
		sel.options[2].value="22";
		sel.options[3].value="23";
	}
	else if (index==3){							//transit  30 31 32 33 34 
		sel.options[0].text="30 Km/h";
		sel.options[1].text="31 Km/h";
		sel.options[2].text="32 Km/h";
		sel.options[3].text="33 Km/h";

		sel.options[0].value="30";
		sel.options[1].value="31";
		sel.options[2].value="32";
		sel.options[3].value="33";
	}
}

function addInt(){
	var newInterest = document.getElementById("interest_input").value+"\n";
	$('#interest_list').val($('#interest_list').val()+newInterest);
	document.getElementById("interest_input").value="";
} 