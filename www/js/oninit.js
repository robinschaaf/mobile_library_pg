
     $(document).bind('mobileinit', function () {

         $.mobile.loadingMessageTheme = 'c';
         $.mobile.loadingMessageTextVisible = false;
         $.mobile.allowCrossDomainPages = true;
         $.support.cors = true;
         $.mobile.pushStateEnabled = false;
         $.mobile.phonegapNavigationEnabled = true;
         $.mobile.buttonMarkup.hoverDelay = true;         
         //$.mobile.page.prototype.options.addBackBtn = "true";
         //$.mobile.page.prototype.options.backBtnTheme = "a";
         //$.mobile.page.prototype.options.backBtnText = "back";


        }).live('[data-role="page"]', 'pagebeforecreate', function () {
             alert( 'This page was just inserted into the dom!' );

        });
        

      