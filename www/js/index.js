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
 
 alert('index.js called');
var childBrowser; 
 
var app = {

    initialize: function() {
        this.bind();
        alert('init');
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, true);
        alert('bind');
    },
    deviceready: function() {
alert('deviceready');

        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;
        $.mobile.pushStateEnabled = false;
        
	
	document.addEventListener("orientationchange", orientationChange, true);

        
    	try {       
    		alert('cb');
		childBrowser = ChildBrowser.install();

    	}catch (err){
		alert(err);
    	}


	alert('deviceready !  yay!');
	
	
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


function orientationChange(e) {    
	          var orientation="portrait";
		  if(window.orientation == -90 || window.orientation == 90) orientation = "landscape";
		  alert(orientation);
		  $(".ui-header").width($(window).width());
}