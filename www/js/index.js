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


	checkConnection();

	
	// This is an event handler function, which means the scope is the event.
	// So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

    },



};



//happens every "page", including remote servers
$(document).bind('pageinit', function(event){
    //alert("pageinit called!");                     
 
 
// $('#navHeader').remove();
// $("div:jqmData(role='page')").prepend("<div class='ui-bar ui-bar-b' id='navHeader'>I'm just a div with bar classes</div>");
// $('body').prepend("<div class='ui-bar ui-bar-b' id='navHeader'>I'm just a div with bar classes</div>");
    
});


$(document).bind('pageshow', function(event){
    //alert("pageshow called!");                     
 
 
 $('#navHeader').remove();
 //$('[data-role="page"]').prepend("<div class='ui-bar ui-bar-b' id='navHeader'>I'm just a div with bar classes</div>");
 $('body').prepend("<div class='ui-bar ui-bar-b' id='navHeader'>I'm just a div with bar classes</div>");
    
});


$('#eventsPage').live('pagecreate',function(event, ui){
	
	$('#eventsData').html('PAGECREATE');
	

    $.get('http://mpprd.library.nd.edu/events', function(data) {
	$('#eventsData').html('DATARECV');
	$('#eventsData').append(data);
	alert("get" + data);
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





function checkConnection() {

    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);

}

