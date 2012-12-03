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
var src_page;
 
var app = {

    initialize: function() {

        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;
        $.mobile.pushStateEnabled = false;
        $.mobile.phonegapNavigationEnabled = true;
        $.mobile.buttonMarkup.hoverDelay = true;

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
	
	// This is an event handler function, which means the scope is the event.
	// So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

    },



};



//happens every "page", including remote servers
$(document).bind('pagebeforechange', function(e, data){

alert('here');     
	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by url for subpage
	if ( typeof data.toPage === "string" ){
	
	
		var u = $.mobile.path.parseUrl( data.toPage )
		var sourceURL = u.href;
		
				
		if ( u.hash ){
			sourceURL = remoteURL + u.hash.replace(/#/g,"/");
			showSubpage( sourceURL, u, data.options);
		
		}else{
			if (u.protocol == "file:"){
			
				sourceURL = remoteURL + u.pathname;
				showSubpage( sourceURL, u, data.options);
			
			}else if ($.mobile.path.isRelativeUrl(u.href)){
			
				sourceURL = remoteURL + u.href;
				showSubpage( sourceURL, u, data.options);
				
			}else if (isExtLink(u)){
				alert("clicked ext link");
				openChildBrowser(u.href);
			
			}else{
				showSubpage( sourceURL, u, data.options);
			}

			
		}

		// Make sure to tell changePage() we've handled this call
		e.preventDefault();

	}


});



$('.cbLink').live('click', function () {

	openChildBrowser(this.href);
	return false;

});



function showSubpage( sourceURL, origURLObj, options ) {
    
        
    $.mobile.loading( 'show' );

    $.ajax({
        url     : 'subpage.html',
        success : function (data) {
		
		//convert return html from subpage to jquery object
		var $page = $(data);
		
		if (options.type == "post"){
		
			$.post( sourceURL, $("form#new_message").serialize(), function(rdata){


			  	$page.find('.subPageData').append( $(rdata).find('.innerContent') );

				$page.page();
	
				$.mobile.changePage( $page, options );
	
				$.mobile.loading( 'hide' );			

			  
			});		
		
		//is get request
		}else{
			
			$.get( sourceURL, function(rdata){
		
				
				//if page returned has .innerContent (is from the m.library site)
				if ( $(rdata).find('.innerContent').size() > 0 ){

					$page.find('.subPageData').append( $(rdata).find('.innerContent') );
					
					//change relative paths to images to point to m. site
					$page.find("img").prop("src", function(){
					
					});
					
				
				}else{
					//if it's for a site other than the mobile library site
					//load into an iframe
					//and expand the width of the content container (parents)
				
					$page.find('.subPageData').append( "<iframe id='iframeSource' frameborder='0' style='height:100%; width:100%; border-style:none; margin:0px; padding:0px;' src = '" + sourceURL + "'></iframe>" ).parents().css('padding', '0px');

    
					
				}

				

				//change any external domain links to open in child browser
				$page.find("a").prop("href", function(){


					//at this point attr refers to the original href retrieved from the html
					if ($.mobile.path.isRelativeUrl($(this).attr('href'))){

						return $(this).attr('href').replace(/\//g, "#");

					}else{
					
						//if (isExtLink(this)){
						//	$(this).addClass("cbLink")
						//}

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

	//$("#iframeSource").contents().find("a").css("background-color","#BADA55");
	$('.footerBar').css('padding', '0px');
        },
        error   : function (jqXHR, textStatus, errorThrown) { alert(errorThrown); }
    });



}






$("#iframeSource").ready(function () { //wait for the frame to load

  //$('img', frames['iframeSource'].document).bind("click",function(){
  // alert('I clicked this img!');
  //});

});


//determine if the "a" target passed in is an external link and should be opened in childbrowser
//will add class to open in child browser under following conditions:
//external to nd.edu host
//contains a target (to open in new window)
//contains the word proxy in it (meaning it gets proxied to a different website

//is http or https (since there can be other protocols, like telephone://, file://)
function isExtLink(linkObj){
	if ((($.mobile.path.parseUrl(linkObj.href).hostname != "nd.edu") || ($(linkObj).prop("target")) || linkObj.href.indexOf("proxy") !== -1) && (($.mobile.path.parseUrl(linkObj.href).protocol == "http:") || ($.mobile.path.parseUrl(linkObj.href).protocol == "https:"))){
		return true;
	}else{
		return false;
	}
}





function updateIFrameLinks(iframeRef){

	$(iframeRef).contents().find("a").each(function(index) {
    		
		if ((($.mobile.path.parseUrl(this.href).hostname != "nd.edu") || ($(this).prop("target")) || this.href.indexOf("proxy") !== -1) && (($.mobile.path.parseUrl(this.href).protocol == "http:") || ($.mobile.path.parseUrl(this.href).protocol == "https:"))){
			$(this).removeAttr('target').addClass('cbLink');
		}
		
    		
	});
	

	$('.cbLink').live('click', function () {

		openChildBrowser(this.href);
		return false;

	});
	
}



function openChildBrowser(url){
    try {
	//both of these should work...
	window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
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
