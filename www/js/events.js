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

	$.get('http://mpprd.library.nd.edu/events', function(data) {
	  $('#eventsData').html(data);
	  alert('Load from events was performed.');
	});
	
	// This is an event handler function, which means the scope is the event.
	// So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

    },



};




function openChildBrowser(url){
    try {
	//both of these should work...
	window.plugins.childBrowser.showWebPage(url);
	//childBrowser.showWebPage(url);
    }catch (err){
	alert(err);
    }
}




