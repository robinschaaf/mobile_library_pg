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

	console.log( e );
     	console.log( data );
     
	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by url for subpage
	if ( typeof data.toPage === "string" ){
	
	
		var u = $.mobile.path.parseUrl( data.toPage )
			
				
		if ( u.hash ){
			showSubpage( remoteURL + u.hash.replace(/#/g,"/") + ' .innerContent', u, data.options );
		
		}else{
			showSubpage( u.href, u, data.options);
		}

		// Make sure to tell changePage() we've handled this call
		
		e.preventDefault();

	}


});

$('.cbLink').live('click', function () {

	openChildBrowser(this.href);
	return false;
	
});




function showSubpage( sourceURL, origURL, options ) {
    
    
    $.mobile.loading( 'show' );

    $.ajax({
        url     : 'subpage.html',
        success : function (data) {
		
		//convert return html from subpage to jquery object
		var $page = $(data);
	
		
		
		if (options.type == "post"){
		
		
			$.post( sourceURL, $("form#new_message").serialize(), function(rdata){
alert(rdata);

			  	$page.find('.subPageData').append( $(rdata).find('.innerContent') );

				$page.page();
	
				$.mobile.changePage( $page, options );
	
				$.mobile.loading( 'hide' );			

			  
			});		
		
		}else{
		
			$($page.find('.subPageData')).load(sourceURL, function() {


				//change any external domain links to open in child browser
				$page.find("a").prop("href", function(){


					//at this point attr refers to the original href retrieved from the html
					if ($.mobile.path.isRelativeUrl($(this).attr('href'))){

						return $(this).attr('href').replace(/\//g, "#");

					}else{
						if ((($.mobile.path.parseUrl(this.href).hostname != "nd.edu") || ($(this).prop("target"))) && (($.mobile.path.parseUrl(this.href).protocol == "http:") || ($.mobile.path.parseUrl(this.href).protocol == "https:"))){
							$(this).addClass("cbLink");
						}

						return this.href;
					}

				});

				$page.page();

				options.dataUrl = origURL.href;

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
