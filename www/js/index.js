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
var canProxy;
var remoteURL='http://m.library.nd.edu/';
 

////////////////////////////////////////////////////////////// 
//On App init - happens once 
//////////////////////////////////////////////////////////////

var app = {

    initialize: function() {

        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;
        $.mobile.pushStateEnabled = false;
        $.mobile.buttonMarkup.hoverDelay = true;


  	$.mobile.loader.prototype.options.text = "Loading...";
  	$.mobile.loader.prototype.options.textVisible = true;
  	$.mobile.loader.prototype.options.textonly = true;
  	$.mobile.loader.prototype.options.theme = "b";
  	$.mobile.loader.prototype.options.html = "<br /><h1>Loading...</h1><br />";
  	
  	
  	
  	// Setting #container div as a jqm pageContainer
	//$.mobile.pageContainer = $('#container');
	 
	// Setting default page transition to slide
        $.mobile.defaultPageTransition = 'none';
            
            
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, true);
    },
    deviceready: function() {

 	if (checkConnection() === false){
 		window.location = "noconnection.html";
 	}
	        
    	try {       
		childBrowser = ChildBrowser.install();

    	}catch (err){
		alert(err);
    	}

	//this is for iframe speaking to parent
	window.addEventListener('message', onExtURL, false);
	
	// This is an event handler function, which means the scope is the event.
	// So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

    },



};




//////////////////////////////////////////////////////////////
// Page Handler - happens every "page", including remote servers
// in PhoneGap
//////////////////////////////////////////////////////////////

$(document).bind('pagebeforechange', function(e, data, XMLHttpRequest){

	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by url for subpage
	if ( typeof data.toPage === "string" ){
	
		$.mobile.loading( 'show' );
	
		testProxyAccess();
	
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





//////////////////////////////////////////////////////////////
// Childbrowser link class
//////////////////////////////////////////////////////////////

$('.cbLink').live('click', function () {
	openChildBrowser(this.href);
	return false;

});




//////////////////////////////////////////////////////////////
// For external links within iframes - uses listener to open
// childbrowser, since code within iframe cannot access
// parent openChildBrowser function in PhoneGap
// (despite working ok in browser)
/////////////////////////////////////////////////////////////

//  for some reason phonegap calls message twice (possibly the use of IDs that are stored multiple times?) 
//  This "previousOpen" variable is to make sure it wasn't a duplicate!

var previousOpen = '';

window.onExtURL = function (e) {

	var u = $.mobile.path.parseUrl( e.origin );
	
	if (previousOpen != e.data){
		//origin of where request came from should either be the library site or localhost
		if((e.origin == 'http://localhost:3000') || (u.hostname.indexOf("library.nd.edu") > 0)){
			openChildBrowser(e.data);
			previousOpen = e.data;
		}else{
			alert("not valid origin: " + e.origin);
		}
	}
	
	
}





//////////////////////////////////////////////////////////////
// Exl search form submit override (Primo search box)
// submitting as a post causes redirects and loses the ifrmame
// (and the header bar - back/home button)
//////////////////////////////////////////////////////////////

$('.EXLSearchForm').live('submit', function () {
  
  	if ($('#search_field').val() != ''){

  		$.mobile.changePage( "http://onesearch.library.nd.edu/primo_library/libweb/action/search.do?vid=ndmobile&fn=search&resetConfig=true&ct=search&vl%28freeText0%29=" + $('#search_field').val() )
  	}
  
	return false;
});


//////////////////////////////////////////////////////////////
// Test by hitting proxy if user has access to e-resources
// 
//////////////////////////////////////////////////////////////

function testProxyAccess(){
	$.ajax({
	    url:'http://proxy.library.nd.edu/login?url=library.nd.edu',
	    type:'HEAD',
	    timeout: 4000,
	    error: function(x, t, m){
	    	//if switching from being able to proxy to not being able to proxy
	    	if (canProxy !== false){
	    		showVPNAlert();
	    	}
	    	
		canProxy = false;
	    },
	    success: function(data, textStatus, XMLHttpRequest){
	    
	        //Apache response means it's at the webserver asking for password
	        //otherwise the server response is ezproxy
	    	if(XMLHttpRequest.getResponseHeader('server') !== 'Apache'){
	    		canProxy = true;
	    	}else{

			//if switching from being able to proxy to not being able to proxy
			if (canProxy !== false){
				showVPNAlert();
			}

			canProxy = false;
	    	
	    	}
	    	
	    }
	});

}



//////////////////////////////////////////////////////////////
// Alert when users are off campus they might not be able
// access all resources
//////////////////////////////////////////////////////////////

function showVPNAlert() {
	navigator.notification.alert(
            'We have detected that you are connected from off-campus and not on a VPN.  If you choose to continue you may not be able to access all features of the catalog and electronic resources.',  // message
            onDismiss,         // callback
            'Hesburgh Libraries Alert',   // title
            'Continue'              // buttonName
        );
}

function onDismiss(buttonChosen) {


    if (buttonChosen == "1"){
    	if ((device.platform == "iPhone") || (device.platform == "iOS")){
    		//doesnt work in iphone 
    		//openChildBrowser("http://oithelp.nd.edu/networking/vpn/ios/");
    	}else if (device.platform == "Android"){
    		openChildBrowser("http://oithelp.nd.edu/networking/vpn/android/");
    	}else{
    		openChildBrowser("http://oithelp.nd.edu/networking/vpn/");
    	}
    }
    
}



//////////////////////////////////////////////////////////////
// Called from Page Handler - used for displaying m.lib pages
//////////////////////////////////////////////////////////////

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

				//change relative paths to images to point to m. site
				$page.find("img").prop("src", function(){
					srcURL = $(this).attr('src');
					
					if (($.mobile.path.isRelativeUrl(srcURL)) && (srcURL.indexOf("assets") > 0)){
						return remoteURL + srcURL;
					}else{
						return srcURL;
					}
					

				});
					
				//change any external domain links to open in child browser - assign cbLink class
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
					
					if ($.mobile.path.isRelativeUrl(srcURL)){
					//if (($.mobile.path.isRelativeUrl(srcURL)) && (srcURL.indexOf("assets") > 0)){
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


//////////////////////////////////////////////////////////////
// Called from Page Handler - used for displaying pages
// internal to the library that can handle mobile displays
// e.g. Primo, EJournal locator, Xerxes
//////////////////////////////////////////////////////////////
function showIFrame( sourceURL, origURLObj, options ) {
        
    $.mobile.loading( 'show' );

    $.ajax({
        url     : 'subpage_iframe.html',
        success : function (data) {
		
		//convert return html from subpage to jquery object
		var $page = $(data);
		
		if (options.type == "post"){
		
			$.post( sourceURL, $("form").serialize(), function(rdata){

				$page.find('.subPageData').append( "<iframe class='iframeSource' onload='updateIFrame(this);' style='max-width:640px; width:250px; height:0px; background-color: #304962;' frameborder='0' src = '" + sourceURL + "'></iframe>" ).parents().css('padding', '0px', 'margin', '0px');

				$page.page();
				options.dataUrl = origURLObj.href;
	
				$.mobile.changePage( $page, options );
				$.mobile.loading( 'show' );
			  
			});		
		
		//is get request
		}else{
			
			$.get( sourceURL, function(rdata){
		
		
				//if it's for a site other than the mobile library site
				//load into an iframe
				//and expand the width of the content container (parents)

				$page.find('.subPageData').append( "<iframe class='iframeSource' onload='updateIFrame(this);' style='max-width:640px; width:250px; height:0px; background-color: #304962;' frameborder='0' src = '" + sourceURL + "'></iframe>" ).parents().css('padding', '0px', 'margin', '0px');

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
		

        },
        error   : function (jqXHR, textStatus, errorThrown) { alert(errorThrown); }
    });

}




//////////////////////////////////////////////////////////////
// Called from onLoad of the iFrame
// Various Markups and aesthetic changes
// used only for Primo, eJournal and Xerxes
//////////////////////////////////////////////////////////////
function updateIFrame(iFt){

	iF = $.mobile.activePage.find('.iframeSource');

	$(iF).css("height","1%");
	
	var iFu = $.mobile.path.parseUrl($(iF).attr('src'));

	$(iF).contents().find('a').attr('target', function(i, val){
		if (val == '_parent'){
			return '_self';	
		}else{
			return val;
		}

	});


	//look at all links on page to update if needed	
	$(iF).contents().find('a').attr('href', function(i, val){


		//is not relative url
		if ($.mobile.path.isRelativeUrl(val) === true){
			val = $.mobile.path.makeUrlAbsolute(val, $(iF).attr('src'));
		}
		
		
		var u = $.mobile.path.parseUrl( val );

		//if it's not on the same domain as current iframe's source, open externally
		if ((u.host != iFu.host) || (isExtLink(u))){
			return "javascript:window.top.postMessage('" + val + "', '*');";
		}else{
			return val;
		}
		
		
	
	});	

	
	//Get rid of Header on Xerxes
	$(iF).contents().find('div.mobile').find('div#hd').css('display', 'none');

	//Get rid of Header on Ejournal Locator
	$(iF).contents().find('div.header').css('display', 'none');

	//Get rid of Header on Primo
	$(iF).contents().find('#exlidHeaderTile').css('display', 'none');
	$(iF).contents().find('#exlidHeaderContainer').css('height', '100%');


	$.mobile.loading( 'hide' );

	$(iF).css("height","100%");
	$(iF).css("width","100%");


}




//////////////////////////////////////////////////////////////
// Function to determin if passed in link is external
// and should be opened in childbrowser
//////////////////////////////////////////////////////////////
//will return true under following conditions:
//external to nd.edu host (does not contain nd.edu in domain)
//contains the word proxy or eresources in it (meaning it gets proxied to a different website)
//catalog and findtext need to be opened external because of how they're proxied
//is http or https (since there can be other protocols, like telephone://, file://)

function isExtLink(parsedURL){

	if (((parsedURL.href.indexOf("proxy") > 0) || (parsedURL.href.indexOf("eresources.library") > 0) || (parsedURL.href.indexOf("catalog.library") > 0) || (parsedURL.href.indexOf("findtext.library") >= 0) || (parsedURL.host.indexOf("nd.edu") < 1)) && ((parsedURL.protocol == "http:") || (parsedURL.protocol == "https:")) ){
		return true;
	}else{
		return false;
	}
}



//////////////////////////////////////////////////////////////
// Calls ChildBrowser plugin for passed in URL
//////////////////////////////////////////////////////////////
function openChildBrowser(url){

    try {
	
	$.mobile.loading( 'show' );
	
	if ((canProxy === false) && ((url.indexOf("proxy") > 0) || (url.indexOf("eresources.library") > 0))){
		
		alert("Sorry, but to access this resource you must either be logged in to the VPN or on campus.  You may also use the mobile library.nd.edu site.");
		
	}else{
	
		window.plugins.childBrowser.showWebPage( url, {showLocationBar:true}, "Hesburgh Libraries");
	}

	//window.plugins.childBrowser.onLocationChange = function (url) {
	//    alert('childBrowser has loaded ' + url);
	//};
	
	$.mobile.loading( 'hide' );

    }catch (err){
	alert("Childbrowser plugin is not working, a new window will open instead.  Error: " + err);
	window.open(url);
    }
}


//////////////////////////////////////////////////////////////
// Check if user has an internet connection
//////////////////////////////////////////////////////////////
function checkConnection() {

    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.NONE]     = 'No network connection';
    
    if ((states[networkState] == 'Unknown connection') || (states[networkState] == 'No network connection')){
    	return false;
    }

}



//////////////////////////////////////////////////////////////
// The following is because on orientation change the 
// popup map will disappear in ios
// should be fixed with jqm 1.2.1 or 1.3
//////////////////////////////////////////////////////////////


var popupMapOpen = false;

$(document).bind('pageinit', function(e, data){

    $( ".popupMap" ).on({
    	popupbeforeposition: function(){
    
		var maxWidth = $( window ).width() - 30 + "px";
		$(".popupMap img").css( "max-width", maxWidth );   
	
	},    
        popupafteropen: function() {
        
		popupMapOpen = true;
		
        },
        popupafterclose: function() {

		 popupMapOpen = false;      
            
        }
        
    });
    
    
    
    $('.popupLink').on('click', function () {

    	openPopupMap();
    	return false;
    	
    });
    
    
    
});


$(window).bind('orientationchange resize', function(event){

	if (popupMapOpen === true){

		openPopupMap().trigger( 'updatelayout' );

	}
	
});

function openPopupMap(){

	var maxWidth = $( window ).width() - 30 + "px";
	$(".popupMap img").css( "max-width", maxWidth ); 
    		
           
	$(".popupMap").popup("open", "15px", "5px");
	
        $.mobile.loading( 'hide' );

}



//////////////////////////////////////////////////////////////
// End Map Popup Hack
//////////////////////////////////////////////////////////////




