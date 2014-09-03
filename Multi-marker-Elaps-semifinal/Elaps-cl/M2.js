    
var directionsService = new google.maps.DirectionsService();
function RoadControl(controlDiv) {
	controlDiv.style.padding = '5px';

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '2px';
	controlDiv.appendChild(controlUI);

  	// Set CSS for the control interior
  	var controlText = document.createElement('div');
  	controlText.style.width = '263px';
  	controlText.style.height = '25px';
  	controlText.style.paddingLeft = '4px';
  	controlText.style.paddingRight = '4px';
  	controlText.style.background = 'url(image/road.jpg) no-repeat';
  	controlUI.appendChild(controlText);
  }

  function initialize(){
  	var mapOptions = {
  		zoom:11,
  		mapTypeId:google.maps.MapTypeId.ROADMAP,
  		scaleControl:true,
  		scaleControlOptions: {
  			position:google.maps.ControlPosition.LEFT_BOTTOM,
  		}
  	};
  	map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);
  	var rendererOptions = {
  		map: map
  	}
  	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

  	if(navigator.geolocation){
  		navigator.geolocation.getCurrentPosition(function(position){
  			userPos= new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  			map.setCenter(userPos);
			// set default start location as current location
			document.getElementById("start").value = userPos;

			//console.log(document.getElementById("start").value);
			var roadControlDiv = document.createElement('div');
			var roadControl = new RoadControl(roadControlDiv);
			roadControlDiv.index=1;
			map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(roadControlDiv);

			marker1 = new google.maps.Marker({
				//position:userPos,
				draggable:true,
				animation:google.maps.Animation.DROP,
				title:"strat point"
			});
			google.maps.event.addListener(marker1,'click',function(){
				if(marker1.getAnimation()!=null){
					marker1.setAnimation(null);
				}else{
					marker1.setAnimation(google.maps.Animation.BOUNCE);
				}
			});

			marker2 = new google.maps.Marker({
				draggable:true,
				animation:google.maps.Animation.DROP,
				title:"end point"
			});
			google.maps.event.addListener(marker1,'click',function(){
				if(marker1.getAnimation()!=null){
					marker1.setAnimation(null);
				}else{
					marker1.setAnimation(google.maps.Animation.BOUNCE);
				}
			});

			infowindow1 = new google.maps.InfoWindow();
			infowindow2 = new google.maps.InfoWindow();
			google.maps.event.addListener(marker1,'click',function(){
				infowindow1.open(map,marker1);
			});

			google.maps.event.addListener(marker2,'click',function(){
				infowindow2.open(map,marker2);
			});

			travel_mode = document.getElementById('mode').value;
			console.log(travel_mode);

			if(travel_mode=="DRIVING")
				movingIcon='image/fastfood.png';

			else if(travel_mode=="WALKING")
				movingIcon='image/walk.gif';

			else if(travel_mode=="BICYCLING")
				movingIcon='image/bike.gif';
			else
				movingIcon='image/bus.gif';

			movingMarker = new google.maps.Marker({
				icon:movingIcon,
				draggable:false,
				animation:google.maps.Animation.DROP,
			});

			routePath = new google.maps.Polyline({
    	//path:coordinates
    	strokeColor:"#FF00D2",
    	strokeOpacity: 0.7,
    	strokeWeight: 5,
    	visible: false,
    });

			routePath_con = new Array();

    ///initiate the right click function
    var ContextMenuControlDiv = document.createElement('DIV');
    var ContextMenuControl = new createContextMenu(ContextMenuControlDiv,map);
    ContextMenuControlDiv.index=1;
    //add a layer
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(ContextMenuControlDiv);


    // grid part
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
    //safeRegion.setMap(map);
    //safe region control
    var gridControlDiv = document.createElement('DIV');
    var gridControl = new createGirdControl(gridControlDiv,map);
    gridControlDiv.index=1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(gridControlDiv);

  })
}

}///////////////////////////////////////////close the initialize function

//// create right click function
function createContextMenu(controlUI,map){
	var contextmenu = document.createElement('DIV');
	contextmenu.style.display = "none";
	contextmenu.style.background = "#ffffff";
	contextmenu.style.border = "10px solid #ffffff";
	contextmenu.innerHTML = 
	"<a href='javascript:choosestart()'><div class='context' style='margin-bottom:5px;'> Start Location </div></a>"
	+"<a href='javascript:chooseend()'><div class='context'> End Location </div></a>";
	controlUI.appendChild(contextmenu);
	google.maps.event.addListener(map,'rightclick',function(event){
		document.getElementById("pointhide").value=event.latLng.lat()+","+event.latLng.lng();
		contextmenu.style.position="relative";
		contextmenu.style.left=(event.pixel.x-88)+"px";
		contextmenu.style.top=event.pixel.y+"px";
		contextmenu.style.display="block";
	});

	//click any control to hide the div
	google.maps.event.addListener(controlUI,'click',function(){
		contextmenu.display="none";
	});
	google.maps.event.addListener(map,'click',function(){
		contextmenu.display="none";
	});
	google.maps.event.addListener(map,'drag',function(){
		contextmenu.display="none";
	});
}/////////////////////////////////////////////////////////////////////////end of create context menu


function choosestart(){
	document.getElementById("start").value = document.getElementById("pointhide").value;
	var startquery = document.getElementById("start").value;
	var temp1=startquery.split(",");
	marker1.set('position',new google.maps.LatLng(parseFloat(temp1[0]),parseFloat(temp1[1])));
	marker1.setMap(map);
	remove();
}

function chooseend(){
	document.getElementById("end").value = document.getElementById("pointhide").value;
	var endq=document.getElementById('end').value;
	var temp2 = endq.split(",");
	marker2.set('position',new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])));
	marker2.setMap(map);
	remove();
}


function googlecalcRoute(){
	remove();
	document.getElementById("map_canvas").style.display="block";
	var start = document.getElementById("start").value;
	var end = document.getElementById("end").value;

	var temp1 = start.split(",");
	var temp2 = start.split(",");

	marker1.set('position',new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])));
	marker1.setMap(map);
	
	marker2.set('position',new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])));
	marker2.setMap(map);
	
	map.setCenter(new google.maps.LatLng((parseFloat(temp1[0])+parseFloat(temp2[0]))/2, (parseFloat(temp1[1])+parseFloat(temp2[1]))/2));
	map.setZoom(12);

	routePath.setMap(map);

	var request = {
		origin:new google.maps.LatLng(parseFloat(temp1[0]), parseFloat(temp1[1])),
		destination:new google.maps.LatLng(parseFloat(temp2[0]), parseFloat(temp2[1])),
		travelMode:travel_mode
	};

	directionsService.route(request,function(response,status){
		if(status == google.maps.DirectionsStatus.OK){
			directionsDisplay.setDirections(response);

			var Coordinates = new Array();

			var temp = response.routes[0].overview_path;

			for(var j=0;j<temp.length;j++){
				Coordinates.push(new google.maps.LatLng( (temp[j].lat()) , (temp[j].lng()) ));
			}

			routePath.setPath(Coordinates);
			movingMarker.setMap(map);
			movingMarker.set('position',Coordinates[0]);
			i=0;
			pathsnum = Coordinates.length;
			function resetMKPoint(i){
				movingMarker.set('position',Coordinates[i]);
				if(i<pathsnum){
					setTimeout(function(){
						i++;
						resetMKPoint(i);
					},150);
				}
				}////////end of reset mk function
				setTimeout(function(){
					resetMKPoint(0);
				},150);

				var query = "query=google";
				for(var k=0;k<Coordinates.length;k++){
					query = query+","+Coordinates[k].lat()+","+Coordinates[k].lng();
				}
				//roadcondition(query);
			}
		});
}


function remove(){
	movingMarker.setMap(null);
	routePath.setMap(null);
 	// remove the condition
 	var lg=routePath_con.length;
 	for(var j=lg-1;j>=0;j--){
 		routePath_con[j].setMap(null);
 		routePath_con.pop();
 	}
 }

 function createGirdControl(controlDiv,map){
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
  	if(controlUI.style.display=='block')
  		controlUI.style.display='none';
  	else if(controlUI.style.display=='none')
  		controlUI.style.display='block';
  });
}