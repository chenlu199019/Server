var lastVertex=1;
var stepnum=0;
var step=50;     //5; //meters
var tick=360;     // miliseconds                 /////// line 447 steo and tick 
var eol=[];

var map;
//var directionsDisplay= new Array();
var directionService;
var stepDisplay;

var position;
var marker=[];    //// user marker array
var polyline=[];
var poly2 = [];
var AlarmMarker=[]; 
var subjectPoint; 


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
var on=[];  // to keep track whether the safe region is on or off of each marker
var safeRegion=[];
var impactRegion=[];
var IdArray1=[];  //to receive the ids for safe region
var IdArray2=[];
var shape=[];

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

function createAlarmMarker(latlng){
	var place = String(latlng);
	var temp1=place.split(",");

	var image={
		url:'image/bell.gif',
		//size: new google.maps.Size(20, 32),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(50,90)
	};
	var marker = new google.maps.Marker({
		position:new google.maps.LatLng(parseFloat(temp1[0]),parseFloat(temp1[1])),
		map:map,
		icon: image,
		zIndex:100,
		visible:false
	});
	return marker;
}


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
	var alarmIcon='image/bell.gif';

	var rendererOptions = {
		map:map,
		suppressMarkers: true,
		preserveViewport: true
	}

	var start;
	var end;
	
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

    ///add interest region
    subjectPoint={
    	radius: 1.0,
    	color: '#1abc9c',
    }

    var interestRadius = document.getElementById('radius').value;
    console.log("interesrRadius in km is "+interestRadius);

    var subjectRange = new google.maps.Circle({
    	map:map,
      radius:interestRadius*1000,   ///// unit is meter
      fillColor: subjectPoint.color,strokeColor:'#3D9912'
  });
    console.log("the range in meters "+subjectRange.getRadius());

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
    				strokeWeight: 5,
    				icons: [{
    					icon: 'image/bell.gif',
    					offset: '100%'
    				}],
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



    			for(i=0;i<legs.length;i++){
    				if(i==0){
    					startLocation[routeNum].latlng = legs[i].start_location;
						var a = String(startLocation[routeNum].latlng);  ///replace the parenthese
						a=a.replace(/[{()} ]/g, ''); 					
						startLocation[routeNum].address = legs[i].start_address;						
						marker[routeNum]=createMarker(a,id,movingIcon);   ////////////////////////// create moving marker
						AlarmMarker[routeNum]=createAlarmMarker(a);
						createSafeRegionOption(id);////////////////////craete safe region ooptin for this marker
						on.push(0);  ///set the default false for displaying safe region
						subjectRange.bindTo('center',marker[routeNum],'position');
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
		//AlarmMarker[index].setPosition(endLocation[index].latlng);
		subjectPoint.setPoint="endLocation[index].latlng";
		return;
	}
	//console.log("the route distance is "+eol[index]+" the d step is "+d);
	if(eol[index]-d<1.000){
		AlarmMarker[index].setVisible(false);
	}
	var p = polyline[index].GetPointAtDistance(d);
	marker[index].setPosition(p);
	AlarmMarker[index].setPosition(p);
	subjectPoint.setPoint="p";
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
  
  document.getElementById("event_list").value="Event Deployed Successfully.";
  
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


function addInt(){
	var newInterest = document.getElementById("interest_input").value+"\n";
	$('#interest_list').val($('#interest_list').val()+newInterest);
	document.getElementById("interest_input").value="";
} 


function Grid_net(){
	var e = document.getElementById("userOnMap");
	var id = e.options[e.selectedIndex].value;   //// the index for the marker need to show safe 
	var i=parseInt(id);
	var IdArray1 = [137206, 137207 ,137208, 137209, 137210 ,137211, 137212, 137213, 137214, 137803,
	              137804 ,137805, 137806, 137807 ,137808 ,137809, 137810, 137811, 137812, 137813,
	              137814 ,137815 ,137816, 137817, 138401, 138402, 138403, 138404, 138405, 138406,
	              138407, 138408 ,138409, 138410, 138411, 138412, 138413, 138414, 138415, 138416 ,
	              138417, 138418, 138419,138999 ,139000 ,139001, 139002, 139003, 139004 ,139005,
	              139006, 139007, 139008, 139009, 139010, 139011, 139012, 139013, 139014, 139015,
	              139016, 139017, 139018, 139019, 139020, 139021, 139598, 139599, 139600, 139601,
	              139602, 139603, 139604, 139605, 139606, 139607, 139608, 139609, 139610, 139611, 
	              139612, 139613, 139614, 139615, 139616, 139617, 139618, 139619, 139620, 139621,
	              139622, 140197, 140198, 140199, 140200, 140201, 140202, 140203, 140204, 140205,
	              140206, 140207, 140208, 140209, 140210, 140211, 140212, 140213, 140214, 140215,
	              140216, 140221, 140222, 140223, 140796, 140797, 140798, 140799, 140800, 140801, 
	              140802, 140803, 140804, 140805, 140806, 140807, 140808, 140809, 140810, 140811,
	              140812, 140813, 140814, 140815, 140816, 140821, 140822, 140823, 140824, 141395,
	              141396, 141397, 141398, 141399, 141400, 141401, 141402, 141403, 141404, 141405,
	              141406, 141407, 141408, 141409, 141410, 141411, 141412, 141413, 141414, 141415,
	              141416, 141417, 141420, 141421, 141422, 141423, 141424, 141425, 141995, 141996,
	              141997, 141998, 141999, 142000, 142001, 142002, 142003, 142004, 142005, 142006,
	              142007, 142008, 142009, 142010, 142011, 142012, 142013, 142014, 142015, 142016, 142017, 142018, 
	              142019, 142020, 142021, 142022, 142023, 142024, 142025, 142594, 142595, 142596, 142597, 142598, 
	              142599, 142600, 142601, 142602, 142603, 142604, 142605, 142606, 142607, 142608, 142609, 142610, 
	              142611, 142612, 142613, 142614, 142615, 142616, 142617, 142618, 142619, 142620, 142621, 142622, 
	              142623, 142624, 142625, 142626, 143194, 143195, 143196, 143197, 143198, 143199, 143200, 143201, 
	              143202, 143203, 143204, 143205, 143206, 143207, 143208, 143209, 143210, 143211, 143212, 143213, 
	              143214, 143215, 143216, 143217, 143218, 143219, 143220, 143221, 143222, 143223, 143224, 143225, 
	              143226, 143793, 143794, 143795, 143796, 143797, 143798, 143799, 143800, 143801, 143802, 143803, 
	              143804, 143805, 143806, 143807, 143808, 143809, 143810, 143811, 143812, 143813, 143814, 143815, 
	              143816, 143817, 143818, 143819, 143820, 143821, 143822, 143823, 143824, 143825, 143826, 143827, 
	              144393, 144394, 144395, 144396, 144397, 144398, 144399, 144400, 144401, 144402, 144403, 144404, 
	              144405, 144406, 144407, 144408, 144409, 144410, 144411, 144412, 144413, 144414, 144415, 144416, 
	              144417, 144418, 144419, 144420, 144421, 144422, 144423, 144424, 144425, 144426, 144427, 144993, 
	              144994, 144995, 144996, 144997, 144998, 144999, 145000, 145001, 145002, 145003, 145004, 145005, 
	              145006, 145007, 145010, 145011, 145012, 145013, 145014, 145015, 145016, 145017, 145018, 145019, 
	              145020, 145021, 145022, 145023, 145024, 145025, 145026, 145027, 145028, 145592, 145593, 145594, 
	              145595, 145596, 145597, 145598, 145599, 145600, 145601, 145602, 145603, 145604, 145605, 145606, 
	              145611, 145612, 145613, 145614, 145615, 145616, 145617, 145618, 145619, 145620, 145621, 145622, 
	              145623, 145624, 145625, 145626, 145627, 145628, 146192, 146193, 146194, 146195, 146196, 146197, 
	              146198, 146199, 146200, 146201, 146202, 146203, 146204, 146205, 146206, 146211, 146212, 146213, 
	              146214, 146215, 146216, 146217, 146218, 146219, 146220, 146221, 146222, 146223, 146224, 146225, 
	              146226, 146227, 146228, 146792, 146793, 146794, 146795, 146796, 146797, 146798, 146799, 146800,
	              146801, 146802, 146803, 146804, 146805, 146806, 146807, 146810, 146811, 146812, 146813, 146814, 
	              146815, 146816, 146817, 146818, 146819, 146820, 146821, 146822, 146823, 146824, 146825, 146826, 
	              146827, 146828, 147392, 147393, 147394, 147395, 147396, 147397, 147398, 147399, 147400, 147401, 
	              147402, 147403, 147404, 147405, 147406, 147407, 147408, 147409, 147410, 147411, 147412, 147413, 
	              147414, 147415, 147416, 147417, 147418, 147419, 147420, 147421, 147422, 147423, 147424, 147425, 
	              147426, 147427, 147428, 147992, 147993, 147994, 147995, 147996, 147997, 147998, 147999, 148000, 
	              148001, 148002, 148003, 148004, 148005, 148006, 148007, 148008, 148009, 148010, 148011, 148012, 
	              148013, 148014, 148015, 148016, 148017, 148018, 148019, 148020, 148021, 148022, 148023, 148024, 
	              148025, 148026, 148027, 148028, 148592, 148593, 148594, 148595, 148596, 148597, 148598, 148599, 
	              148600, 148601, 148602, 148603, 148604, 148605, 148606, 148607, 148608, 148609, 148610, 148611, 
	              148612, 148613, 148614, 148615, 148616, 148617, 148618, 148619, 148620, 148621, 148622, 148623, 
	              148625, 148626, 148627, 148628, 149192, 149193, 149194, 149195, 149196, 149197, 149198, 149199, 
	              149200, 149201, 149202, 149203, 149204, 149205, 149206, 149207, 149208, 149209, 149210, 149211, 
	              149212, 149213, 149214, 149215, 149216, 149217, 149218, 149219, 149220, 149221, 149222, 149223, 
	              149224, 149225, 149226, 149227, 149228, 149792, 149793, 149794, 149795, 149796, 149797, 149798, 
	              149799, 149800, 149801, 149802, 149803, 149804, 149805, 149806, 149807, 149808, 149809, 149810, 
	              149811, 149812, 149813, 149814, 149815, 149816, 149817, 149818, 149819, 149820, 149821, 149822, 
	              149823, 149824, 149825, 149826, 149827, 149828, 150392, 150393, 150394, 150395, 150396, 150397, 
	              150398, 150399, 150400, 150401, 150402, 150403, 150404, 150405, 150406, 150407, 150408, 150409, 
	              150410, 150411, 150412, 150413, 150414, 150415, 150416, 150417, 150418, 150419, 150420, 150421, 
	              150422, 150423, 150424, 150425, 150426, 150427, 150428, 150993, 150994, 150995, 150996, 150997,
	              150998, 150999, 151000, 151001, 151002, 151003, 151004, 151005, 151006, 151007, 151008, 151009, 
	              151010, 151011, 151012, 151013, 151014, 151015, 151016, 151017, 151018, 151019, 151020, 151021, 
	              151022, 151023, 151024, 151025, 151026, 151027, 151028, 151593, 151594, 151595, 151596, 151597, 
	              151598, 151599, 151600, 151601, 151602, 151603, 151604, 151605, 151606, 151607, 151608, 151609, 
	              151610, 151611, 151612, 151613, 151614, 151615, 151616, 151617, 151618, 151619, 151620, 151621, 
	              151622, 151623, 151624, 151625, 151626, 151627, 152193, 152194, 152195, 152196, 152197, 152198, 
	              152199, 152200, 152201, 152202, 152203, 152204, 152205, 152206, 152207, 152208, 152209, 152210, 
	              152211, 152212, 152213, 152214, 152215, 152216, 152217, 152218, 152219, 152220, 152221, 152222, 
	              152223, 152224, 152225, 152226, 152227, 152794, 152795, 152796, 152797, 152798, 152799, 152800, 
	              152801, 152802, 152803, 152804, 152805, 152806, 152807, 152808, 152809, 152810, 152811, 152812, 
	              152813, 152814, 152815, 152816, 152817, 152818, 152819, 152820, 152821, 152822, 152823, 152824, 
	              152825, 152826, 152827, 153394, 153395, 153396, 153397, 153398, 153399, 153400, 153401, 153402, 
	              153403, 153404, 153405, 153406, 153407, 153408, 153409, 153410, 153411, 153412, 153413, 153414, 
	              153415, 153416, 153417, 153418, 153419, 153420, 153421, 153422, 153423, 153424, 153425, 153426, 
	              153995, 153996, 153997, 153998, 153999, 154000, 154001, 154002, 154003, 154004, 154005, 154006, 
	              154007, 154008, 154009, 154010, 154011, 154012, 154013, 154014, 154015, 154016, 154017, 154018, 
	              154019, 154020, 154021, 154022, 154023, 154024, 154025, 154595, 154596, 154597, 154598, 154599, 
	              154600, 154601, 154602, 154603, 154604, 154605, 154606, 154607, 154608, 154609, 154610, 154611, 
	              154612, 154613, 154614, 154615, 154616, 154617, 154618, 154619, 154620, 154621, 154622, 154623, 
	              154624, 154625, 155196, 155197, 155198, 155199, 155200, 155201, 155202, 155203, 155204, 155205, 
	              155206, 155207, 155208, 155209, 155210, 155211, 155212, 155213, 155214, 155215, 155216, 155217, 
	              155218, 155219, 155220, 155221, 155222, 155223, 155224, 155797, 155798, 155799, 155800, 155801,
	              155802, 155803, 155804, 155805, 155806, 155807, 155808, 155809, 155810, 155811, 155812, 155813, 
	              155814, 155815, 155816, 155817, 155818, 155819, 155820, 155821, 155822, 155823, 156398, 156399, 
	              156400, 156401, 156402, 156403, 156404, 156405, 156406, 156407, 156408, 156409, 156410, 156411, 
	              156412, 156413, 156414, 156415, 156416, 156417, 156418, 156419, 156420, 156421, 156422, 156999, 
	              157000, 157001, 157002, 157003, 157004, 157005, 157006, 157007, 157008, 157009, 157010, 157011, 
	              157012, 157013, 157014, 157015, 157016, 157017, 157018, 157019, 157020, 157021, 157601, 157602, 
	              157603, 157604, 157605, 157606, 157607, 157608, 157609, 157610, 157611, 157612, 157613, 157614, 
	              157615, 157616, 157617, 157618, 157619, 157620, 158202, 158203, 158204, 158205, 158206, 158207, 
	              158208, 158209, 158210, 158211, 158212, 158213, 158214, 158215, 158216, 158217, 158218, 158805, 
	              158806, 158807, 158808, 158809, 158810, 158811, 158812, 158813, 158814, 158815,
	              ];

	if(i!="Select user"){
		if(on[i]%4==0){		/// first time need to create the safe region and show
			console.log("first time call");
			safeRegion[i]=generate_safeRegion(IdArray1);
			impactRegion[i]=generate_impactRegion(IdArray2);
			SetMap(safeRegion[i],map);
			on[i]++;
		}
	else if(on[i]%4==1){   // odd time, cancel the safeRegion
		console.log("second time call");
		SetMap(safeRegion[i],null);
		setMap(impactRegion[i],map);
		on[i]++;
	}
	else if(on[i]%4==2){     /// safe region has been created already just show
		console.log('third time call');
		SetMap(safeRegion[i],map);
		on[i]++;
	}
	else if(on[i]%4==3){
		SetMap(safeRegion[i],null);
		SetMap(impactRegion[i],null);
		on[i]++;
	}
	document.getElementById("userOnMap").value="Select user";
	}
	else
		return;
}///////end


function SetMap(arr,background){
	console.log("the length for the shape is "+arr.length);
	var count=0;
	for(i=0;i<arr.length;i++){
		arr[i].setMap(background);
		console.log(count++);
	}
}

function createSafeRegionOption(index){
	var op = document.createElement("option");
	op.text="User "+index;
	op.value=String(index);
	var list = document.getElementById("userOnMap");
	list.add(op);
}

function generate_safeRegion(IdArr1){
	var width = 0.00073356628;  /////set the width for each cell
	var height = 0.00039099243;  //// 600*600
	///// set the leftdown corner of the cells[0]
	//var origin_l=1.23620931;
	//var origin_n=103.59798431;
	var l=1.23620931;      
	var n=103.59798431;
	
	for(i=0;i<IdArr1.length;i++){
	var id=IdArr1[i];
	var newL=l+height*(parseFloat(id%600));
	var newN=n+width*(parseFloat(id/600));
	console.log("id and newL and newN are "+id+", "+newL+", "+newN);
	var rectCoords = [
			new google.maps.LatLng(newL,newN),
			new google.maps.LatLng(newL,newN+width),
			new google.maps.LatLng(newL+height,newN+width),
			new google.maps.LatLng(newL+height,newN),
			new google.maps.LatLng(newL,newN)
			];
			var p =  new google.maps.Polygon({
				//map:map,
				path:rectCoords,
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF8000',
				fillOpacity: 0.35
			}); 
		shape.push(p);
		}
		return shape;
}

function generate_impactRegion(IdArr2){
	var width = 0.00073356628;  /////set the width for each cell
	var height = 0.00039099243;  //// 600*600
	///// set the leftdown corner of the cells[0]
	//var origin_l=1.23620931;
	//var origin_n=103.59798431;
	var l=1.23620931;      
	var n=103.59798431;
	
	for(i=0;i<IdArr2.length;i++){
	var id=IdArr2[i];
	var newL=l+height*(parseFloat(id%600));
	var newN=n+width*(parseFloat(id/600));
	console.log("id and newL and newN are "+id+", "+newL+", "+newN);
	var rectCoords = [
			new google.maps.LatLng(newL,newN),
			new google.maps.LatLng(newL,newN+width),
			new google.maps.LatLng(newL+height,newN+width),
			new google.maps.LatLng(newL+height,newN),
			new google.maps.LatLng(newL,newN)
			];
			var p =  new google.maps.Polygon({
				//map:map,
				path:rectCoords,
				//strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#F4FA58',
				fillOpacity: 0.35
			}); 
		shape.push(p);
		}
		return shape;
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