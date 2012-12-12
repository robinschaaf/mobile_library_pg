
var onmessage = function(e) {
	var u = $.mobile.path.parseUrl( e.origin );

	if((e.origin == 'http://localhost:3000') || (u.hostname.indexOf("library.nd.edu") > 0)){
		alert(e.data);
		openChildBrowser(u.href);
	}else{
		alert("not valid origin: " + e.origin);
	}
	
}


if(typeof window.addEventListener != 'undefined') {
	window.addEventListener('message', onmessage, false);
	
//for IE
}else if(typeof window.attachEvent != 'undefined') {
	window.attachEvent('onmessage', onmessage);
}
