$(document).bind('mobileinit', function () {


  	$.mobile.loader.prototype.options.text = "loading";
  	$.mobile.loader.prototype.options.textVisible = false;
  	$.mobile.loader.prototype.options.theme = "c";
  	$.mobile.loader.prototype.options.html = "";
  
	$.mobile.allowCrossDomainPages = true;
	$.support.cors = true;
	$.mobile.pushStateEnabled = false;
	$.mobile.buttonMarkup.hoverDelay = true;         

});
        

      