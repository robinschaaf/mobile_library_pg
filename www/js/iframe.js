function openChildBrowser(url){
alert('parent opencb');
    try {
	//both of these should work...
	window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
    }catch (err){
	alert("Childbrowser plugin is not working, a new window will open instead.  Error: " + err);
	window.open(url);
    }
}
