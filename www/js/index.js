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
$(document).bind('pageinit', function(event){

});


$(document).bind('pageshow', function(event){
 
 //$('#navHeader').remove();
 //$('body').prepend("<div class='ui-bar ui-bar-c' id='navHeader'>I'm just a div with bar classes</div>");



    
});


$('#eventsPage').live('pagebeforeshow',function(event, data){

  $.mobile.loading( 'show' );
  event.preventDefault();
	  
 
  $('#eventsData').load(remoteURL + 'events .innerContent', function() {
	  
	  $('#eventsData').trigger("create");
	  $('#eventsData').show("blind", {}, "slow");
	  
	  data.deferred.resolve( data.absUrl, data.options, page );
	  //$.mobile.loading( 'hide' );
  });

	

    
});



$('#asklibPage').live('pageinit',function(event, ui){
   
	$('#asklibData').load(remoteURL + 'asklib .innerContent', function() {
	  $('#asklibData').show("blind", {}, "slow");
	  $('#asklibData').trigger("create");
	});
	
	

    
});


$('.subpagelink').live('click',function(){
   
	var src_page = $(this).attr('source-id');
	$('#subPageData').attr('data-source',src_page);
	
	$('#subPageData').load(remoteURL + src_page + ' .innerContent', function() {

		$('#subPageData').trigger("create");
		$('#subPageData').show("blind", {}, 3000);

	//	  data.deferred.resolve( data.absUrl, data.options, page );
		  //$.mobile.loading( 'hide' );
	});
    
});


function openChildBrowser(url){
    try {
	//both of these should work...
	window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
    }catch (err){
	alert(err);
    }
}




function setSource(url){

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

