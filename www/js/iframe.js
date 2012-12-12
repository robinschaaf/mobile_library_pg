
var onmessage = function(e) {
	if((e.origin == 'http://localhost:3000') || (e.origin == 'http://m.library.nd.edu')){
		alert(e.data);
		openChildBrowser(e.data);
	}
	
}


if(typeof window.addEventListener != 'undefined') {
	window.addEventListener('message', onmessage, false);
	
//for IE
}else if(typeof window.attachEvent != 'undefined') {
	window.attachEvent('onmessage', onmessage);
}
