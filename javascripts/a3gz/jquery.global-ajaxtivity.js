/**
 * GlobalAjactivity provides an easy way to setup ajax activity indicator and screen lock during ajax activity.
 */
;(function ( $, window, document, undefined ) {
	"use strict";
    
	// Create the defaults once
	var pluginName = "globalAjaxtivity";
	var defaults = {
        screenBackgroundColor: 'transparent',
        screenOpacity: 0.5,
        screenZindex: 99999, 
        screenId: 'ajax-screen-lock',
        
        spinnerId: 'global-ajaxtivity',
        spinnerRight: '',
        spinnerBottom: '',
        spinnerLeft: '50%',
        spinnerTop: '40%',
        spinnerImageUrl: false,
        
        autoSpinner: true,
        autoLock: true,
        ajaxCache: false,
    };

	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
        
        this.locks = 0;
        
        this.init();
	} /* Plugin() */

	
	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
        init: function()
        {
            var self = this;
            
            
            // Make sure to have the spinner image properly set 
            if ( self.settings.spinnerImageUrl == false ) {
                alert("The spinner image URL is not set; this won't work!");
            }
            
            var pageBody = jQuery(this.element);
            
            // Ajax activity indicator 
            var container = jQuery('<div/>', {
                id: self.settings.spinnerId, 
                style: 'position:fixed; left:'+self.settings.spinnerLeft+'; top:'+self.settings.spinnerTop+'; bottom:'+self.settings.spinnerBottom+'; right:'+self.settings.spinnerRight+'; display:none; z-index:'+self.settings.screenZindex+1 + ';'
            } );
            var icon = jQuery('<img/>', {
                src: self.settings.spinnerImageUrl
            });
            container.html(icon);
            pageBody.append(container);
            
            // Setup the screen locker 
            var screen = jQuery('<div/>', {
                id: self.settings.screenId,
                style: "display: none; position:fixed; bottom:0; left:0; right:0; top:0; opacity:"+self.settings.screenOpacity+"; background-color:"+self.settings.screenBackgroundColor+"; z-index:"+self.settings.screenZindex+";"
            });
            pageBody.prepend( screen );
            self.setupScreenLock();
            
            // Setup AJAX 
            jQuery(document)
            .ajaxStart( function() { 
            
                if ( self.settings.autoLock ) {
                    jQuery.screen.lock();
                }
                jQuery('#'+self.settings.spinnerId).show(); 
                
            }).ajaxStop( function() { 
            
                jQuery('#'+self.settings.spinnerId).hide(); 
                if ( self.settings.autoLock ) {
                    jQuery.screen.unlock();
                }
                
            }).ready(function() {
                
                jQuery.ajaxSetup({ 
                    cache: self.settings.ajaxCache 
                });
                
            });              
        },
        // init()
        
        
        /**
         * Screen locks can be accumulated. Each lock request will increment a lock counter; 
         * and the cover screen will only be removed once the the lock is brought down to zero.
         */
        setupScreenLock: function()
        {
            var self = this;
            var screenLock = jQuery('#'+self.settings.screenId);
            jQuery.screen = {
                lock: function() {
                    self.locks++;
                    
                    if ( !jQuery(screenLock).is(':visible') ) {
                        jQuery(screenLock).show();
                    }
                },
                
                unlock: function() {
                    if ( self.locks > 0 ) {
                        self.locks--;
                    }
                    
                    if ( jQuery(screenLock).is(':visible') && (self.locks == 0) ) {
                        jQuery(screenLock).fadeOut('fast');
                    }
                }
            };
        }
        

	});
	

	$.fn[ pluginName ] = function ( options ) {
		var args = arguments;
	  
        if (options === undefined || typeof options === 'object') {		
			return this.each(function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			var returns;

			this.each(function () {
				var instance = $.data(this, 'plugin_' + pluginName);

				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
				}

				if (options === 'destroy') {
				  $.data(this, 'plugin_' + pluginName, null);
				}
			});

			return returns !== undefined ? returns : this;
		}			
	};

})( jQuery, window, document );
