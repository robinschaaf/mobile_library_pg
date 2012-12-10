
alert('load iframej.s');

//window.plugins.childBrowser.showWebPage('http://m.library.nd.edu');

alert(window.location.href);


function openIFrameChildBrowser(url){
	alert('open cb: ' + url);



    //try {
	//both of these should work...
	//window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
    //}catch (err){
//	alert("Childbrowser plugin is not working, a new window will open instead.  Error: " + err);
//	window.open(url);
//    }
}
