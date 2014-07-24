
var xmlHttpFcgistart;
var xmlHttpFcgiend;

function createXmlHttpRequest(){  
    var xmlHttp=null;
	try
	{
	// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch(e)
	{
		try
		{
		// Internet Explorer
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e)
		{
			xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	return xmlHttp;
} 
function onkeyup1(){
    var query = document.getElementById("starttext").value;
    
    if(query.length == 0) {
        return;
    }
    query = "query=" + query;
    
    xmlHttpFcgistart = createXmlHttpRequest();
    if(xmlHttpFcgistart==null)
	{
		alert("Your browser does not support,AJAX");
		return;
	} 
    var url="server.fcgi?";
	url=url+query;
	xmlHttpFcgistart.onreadystatechange=stateChangedstart;
	xmlHttpFcgistart.open("POST",url,true);
	xmlHttpFcgistart.send(url);
}

function onkeyup2(){
    var query = document.getElementById("endtext").value;
    
    if(query.length == 0) {
        return;
    }
    query = "query=" + query;
    
    xmlHttpFcgiend = createXmlHttpRequest();
    if(xmlHttpFcgiend==null)
	{
		alert("Your browser does not support,AJAX");
		return;
	} 
    var url="server.fcgi?";
	url=url+query;
	xmlHttpFcgiend.onreadystatechange=stateChangedend;
	xmlHttpFcgiend.open("POST",url,true);
	xmlHttpFcgiend.send(url);
}      