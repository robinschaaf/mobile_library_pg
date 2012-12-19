/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
var childBrowser; 
var remoteURL='http://mpprd.library.nd.edu/';
//var remoteURL='http://localhost:3000/';
 
var app = {

    initialize: function() {

        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;
        $.mobile.pushStateEnabled = false;
        $.mobile.buttonMarkup.hoverDelay = true;


  	$.mobile.loader.prototype.options.text = "Loading...";
  	$.mobile.loader.prototype.options.textVisible = true;
  	$.mobile.loader.prototype.options.theme = "b";
  	$.mobile.loader.prototype.options.html = "";
  	

        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, true);
    },
    deviceready: function() {
        
    	try {       
		childBrowser = ChildBrowser.install();

    	}catch (err){
		alert(err);
    	}

 	if (checkConnection() === false){
 		window.location = "noconnection.html";
 	}
	
	//this is for iframe speaking to parent
	window.addEventListener('message', onExtURL, false);
	
	
	// This is an event handler function, which means the scope is the event.
	// So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

    },



};



$('.cbLink').live('click', function () {
	openChildBrowser(this.href);
	return false;

});




$(document).bind('pageinit', function(e, data){

    $( "#popupMap" ).on({
        popupbeforeposition: function() {
            var maxHeight = $( window ).height() - 30 + "px";
            $("#popupMap img").css( "max-height", maxHeight );
            alert($('#popupMap').attr('class'))
            $.mobile.loading( 'hide' );
        }     
        
    });
    
});


//happens every "page", including remote servers
$(document).bind('pagebeforechange', function(e, data){


	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by url for subpage
	if ( typeof data.toPage === "string" ){
	
		$.mobile.loading( 'show' );
	
		var u = $.mobile.path.parseUrl( data.toPage )
		var sourceURL = u.href;
				
		if ( u.hash ){
			sourceURL = remoteURL + u.hash.replace(/#/g,"/");
			showSubpage( sourceURL, u, data.options);
		
		//file (this is how phonegap runs links as a file on local system)
		}else if (u.protocol == "file:"){
			
			sourceURL = remoteURL + u.pathname;
			showSubpage( sourceURL, u, data.options);

		//this means it's a link within the m.library site
		}else if ($.mobile.path.isRelativeUrl(u.href)){

			sourceURL = remoteURL + u.href;
			showSubpage( sourceURL, u, data.options);

		//link external to notre dame
		}else if (isExtLink(u)){

			openChildBrowser(sourceURL);

		//link internal to the library but external to m. site - eg Primo, Quicksearch, ejournal locator
		}else{
			showIFrame( sourceURL, u, data.options);
		}

			

		// Make sure to tell changePage() we've handled this call
		e.preventDefault();

	}


});


//for some reason phonegap calls message twice.  this is to make sure it wasn't a duplicate!
var previousOpen = '';

window.onExtURL = function (e) {

	var u = $.mobile.path.parseUrl( e.origin );
	
	if (previousOpen != e.data){
		if((e.origin == 'http://localhost:3000') || (u.hostname.indexOf("library.nd.edu") > 0)){
			openChildBrowser(e.data);
			previousOpen = e.data;
		}else{
			alert("not valid origin: " + e.origin);
		}
	}
	
	
}

//if(event.orientation){
//	$(.photopopup).
//}




function showSubpage( sourceURL, origURLObj, options ) {
                  
        
    $.mobile.loading( 'show' );

    $.ajax({
        url     : 'subpage.html',
        success : function (data) {
		
		//convert return html from subpage to jquery object
		var $page = $(data);
		
		if (options.type == "post"){
		
			$.post( sourceURL, $("form").serialize(), function(rdata){

			  	$page.find('.subPageData').html( $(rdata).find('.innerContent') );

				$page.page();
	
				$.mobile.changePage( $page, options );
	
				$.mobile.loading( 'hide' );			

			  
			});		
		
		//is get request
		}else{
			
			$.get( sourceURL, function(rdata){
		
				
				$page.find('.subPageData').append( $(rdata).find('.innerContent') );

				//change relative paths to images to point to m. site
				$page.find("img").prop("src", function(){
					srcURL = $(this).attr('src');
					if (($.mobile.path.isRelativeUrl(srcURL)) && (srcURL.indexOf("assets") > 0)){
						return remoteURL + srcURL;
					}else{
						return srcURL;
					}

				});
					
	

				//change any external domain links to open in child browser
				$page.find("a").prop("href", function(){

					//at this point attr refers to the original href retrieved from the html
					if ($.mobile.path.isRelativeUrl($(this).attr('href'))){
						return $(this).attr('href').replace(/\//g, "#");
					}else{

						if ($(this).prop("target")){
							$(this).addClass("cbLink");
						}

						return this.href;
					}

				});

				
				$page.page();

				options.dataUrl = origURLObj.href;
				
				$.mobile.changePage( $page, options );

				$.mobile.loading( 'hide' );


			}); 
			
			
		}
		
		
		

	//add new page to the DOM
	$.mobile.pageContainer.append($page)

	$('.subPageData').trigger("create");
	$('.subPageData').show("slow");
	
	
	

        },
        error   : function (jqXHR, textStatus, errorThrown) { alert(errorThrown); }
    });



}



function showIFrame( sourceURL, origURLObj, options ) {
    
        
    $.mobile.loading( 'show' );

    $.ajax({
        url     : 'subpage_iframe.html',
        success : function (data) {
		
		//convert return html from subpage to jquery object
		var $page = $(data);
		
		if (options.type == "post"){
		
			$.post( sourceURL, $("form").serialize(), function(rdata){

				$page.find('.subPageData').append( "<iframe id='iframeSource' onload='updateIFrame();' style='width:250px; display:none;' frameborder='0' src = '" + sourceURL + "'></iframe>" ).parents().css('padding', '0px', 'margin', '0px');

				$page.page();
	
				$.mobile.changePage( $page, options );
			  
			});		
		
		//is get request
		}else{
			
			$.get( sourceURL, function(rdata){
		
		
				//if it's for a site other than the mobile library site
				//load into an iframe
				//and expand the width of the content container (parents)

				$page.find('.subPageData').append( "<iframe class='iframeSource' onload='updateIFrame();' style='width:250px; display:none;' frameborder='0' src = '" + sourceURL + "'></iframe>" ).parents().css('padding', '0px', 'margin', '0px');

				$page.page();

				options.dataUrl = origURLObj.href;
				
				$.mobile.changePage( $page, options );
				$.mobile.loading( 'show' );
			}); 
			
			
		}
		
		

	//add new page to the DOM
	$.mobile.pageContainer.append($page)

			
	$('.subPageData').trigger("create");
	$('.subPageData').show("slow");
	
	
	$('.iframeSource').ready(function(){
		//$.mobile.loading( 'show' );
               // console.log('this is loaded');
        });
	
	
	

        },
        error   : function (jqXHR, textStatus, errorThrown) { alert(errorThrown); }
    });

}




function updateIFrame(){

	var u = $.mobile.path.parseUrl(window.location.href);
	

	$('.iframeSource').css("height","100%");
	$('.iframeSource').css("width","100%");

	$('.iframeSource').contents().find('a').attr('href', function(i, val){

				
		if ($.mobile.path.isRelativeUrl(val) === true){
			val = $.mobile.path.makeUrlAbsolute(val, $('.iframeSource').attr('src'));
		}
	
		var u = $.mobile.path.parseUrl( val );
	
		if (isExtLink(u)){
			return "javascript:window.top.postMessage('" + val + "', '*');";
		}else{
			return val;
		}
	
	});	


	
	$('.iframeSource').contents().find('a').removeAttr('target');
	$('.iframeSource').contents().find('div#mobile').find('div#hd').css('display', 'none');
	$('.iframeSource').contents().find('div.header').css('display', 'none');
	
	$.mobile.loading( 'hide' );

	$('.iframeSource').css('display', 'block');
	

}




//determine if the "a" target passed in is an external link and should be opened in childbrowser
//will return true under following conditions:
//external to nd.edu host (does not contain nd.edu in domain)
//contains the word proxy in it (meaning it gets proxied to a different website)

//is http or https (since there can be other protocols, like telephone://, file://)
function isExtLink(parsedURL){

	if (((parsedURL.href.indexOf("proxy") > 0) || (parsedURL.href.indexOf("eresources.library") > 0) || (parsedURL.host.indexOf("nd.edu") < 1)) && ((parsedURL.protocol == "http:") || (parsedURL.protocol == "https:"))){
		return true;
	}else{
		return false;
	}
}




function openChildBrowser(url){

    try {
	//both of these should work...
	window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
	
	$.mobile.loading( 'hide' );
    }catch (err){
	alert("Childbrowser plugin is not working, a new window will open instead.  Error: " + err);
	window.open(url);
    }
}



function checkConnection() {

    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.NONE]     = 'No network connection';
    
    if ((states[networkState] == 'Unknown connection') || (states[networkState] == 'No network connection')){
    	return false;
    }

}
