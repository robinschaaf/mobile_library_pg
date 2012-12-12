
var onmessage = function(e) {
	alert(e.data + ' - origin: ' + e.origin);
}


if(typeof window.addEventListener != 'undefined') {
	window.addEventListener('message', onmessage, false);
}else if(typeof window.attachEvent != 'undefined') {
	window.attachEvent('onmessage', onmessage);
}












function openIFrameChildBrowser(url){
	alert("open iframe cb!!  " + url);


    //try {
	//both of these should work...
	//window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
    //}catch (err){
//	alert("Childbrowser plugin is not working, a new window will open instead.  Error: " + err);
//	window.open(url);
//    }
}
