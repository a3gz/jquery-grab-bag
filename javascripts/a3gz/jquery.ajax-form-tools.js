/**
 * Ajax Form Tools
 * This library contains jQuery plugins designed to provide some good-to-have features 
 * when working with ajax forms. 
 * 
 * Ajax Form: 
 *      Submit forms via AJAX with support for GET, POST, PUT and DELETE.
 *
 * Button Spinner:
 *      The button spinner will allow the programmer to convert a button into a non-active 
 *      element displaying an animated icon to indicate that some kind of process is takin place. 
 */

 
/**
 * AJAX FORM 
 * This plugin allows to send forms via ajax.
 * ------------------
 */
;(function ( $, window, document, undefined ) {

	"use strict";

	// Create the defaults once
	var pluginName = "ajaxForm";
	var defaults = {
        resetInputs: true,
        beforeSubmit: null,
        done: null,
        fail: null,
        always: null,
        validate: function() { return true; },
        outputContainer: false,
        minWidth: 100,
    };
    
	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
        
        this.form = null;
        
        this.init();        
	} /* Plugin() */

	
	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
        /**
         * Init
         */
        init: function()
        {
            var self = this;
            this.form = jQuery(this.element);
            
            this.setupDefaultBehavior();
            
            this.settings.method = this.form.attr('method') || 'GET';
            this.settings.action = this.form.attr('action');
            
            // Setup message ouptpu container 
            this.setupMessageOutputContainer();
            
            // Intercept form submission 
            this.form.on('submit', function( evt ) {
                evt.preventDefault();
                
                if ( self.settings.validate() ) {
                    self.doSubmit();
                }
            });
        },
        // init()
        
        
        /**
         *
         */
        doSubmit: function() 
        {
            var self = this;
            
            self.settings.spinnerButton.buttonSpinner('start');
            if ( self.settings.beforeSubmit != null ) {
                self.settings.beforeSubmit.call();
            }
            
            self.clearErrors();
            
            var theData = self.form.serialize();
            
            jQuery.ajax({
                type: self.settings.method,
                url: self.settings.action,
                data: theData,
            }).always(function( ) { 
                self.settings.spinnerButton.buttonSpinner('stop');
                
                if ( self.settings.always != null ) {
                    self.settings.always.call();
                }
            }).done( function( data  ) {
                self.clearErrors();
                self.resetInputs();
                
                if ( self.settings.done != null ) {
                    self.settings.done( data );
                }
            }).fail(function( jqXHR, textStatus, errorThrown ) {
                self.onFail( jqXHR, textStatus, errorThrown );
                
                if ( self.settings.fail != null ) {
                    self.settings.fail( jqXHR, textStatus, errorThrown );
                }
            });
        },
        // doSubmit()
        
		/**
		 *
		 */
		box: function(boxParams)
		{
			var theId = boxParams.className + String(new Date().getTime() / 1000);
            
			var msgBox = jQuery('<div>', {id: theId, class: 'alert alert-dismissible alert-' + boxParams.className})
					.html(
						'<button type="button" class="close" data-dismiss="alert">&times;</button>'
						+ '<span class="message"><i class="icon fa fa-' + boxParams.icon + '"></i> ' + boxParams.message + '</span>' 
					)
					.on('click', function(evt) {
						jQuery(this).slideUp(300);
						evt.stopPropagation();
					});
					
			this.settings.outputContainer.prepend(msgBox).show();
			
			// Messages other than danger will close automatically. 
			// The time the box will be visible is calculated from the number of letters in the message.
			// if (boxParams.className != 'danger')
			// {
				var ms = 100; // milliseconds per word to wait before closing 
                // Keep danger messages visible for longer
                if ( boxParams.className == 'danger' ) {
                    ms *= 3;
                }
				var msgLen = parseInt(boxParams.message.length);
				var timeout = (ms * msgLen);
				setTimeout(function() { 
                    msgBox.slideUp(function() { 
                        msgBox.remove(); 
                    }); 
                }, timeout);
			// }
			
		},
		// box()
	
	
        /**
         *
         */
        clearErrors: function() 
        {
            this.form.find('.has-error').removeClass('has-error');
            this.form.find('.help-block').remove();
        },
        // clearErrors()
        
        
        /**
         *
         */
        clearErrorsFromInput: function( e )
        {
            var container = jQuery(e).closest('.has-error');
            
            container.removeClass('has-error');
            // remove class from input 
            container.find('.has-error').removeClass('has-error');
            // and remove the message block
            container.find('.help-block').remove();                
        },
        // clearErrorsFromInput()
        
        
		/**
		 * 
		 */
		danger: function(msg)
		{
			var boxParams = {
				className: 'danger',
                icon: 'ban',
				message: msg
			};
			this.box(boxParams);
		},
		// danger)
		
		
        /**
         *
         */
        onFail: function( jqXHR, textStatus, errorThrown ) {
            var self = this;
            var msg;
            if ( jqXHR.responseJSON ) {
                var error = jqXHR.responseJSON;
                msg = error.error + ': ' + error.error_description;
                
                if ( error.targetInputs ) {
                    jQuery.each( error.targetInputs, function( i, field ) {
                        var input = jQuery('*[name="'+ field.name +'"]');
                        input.parent().addClass( 'has-error' );
                        input.after( jQuery('<span/>', {class: 'help-block'}).html( field.error ) );
                        // <span class="help-block">Help block with error</span>
                        // jQuery('*[data-field="' + field.name + '"]').addClass( 'has-error' )
                        
                    });
                }
            } else {
                msg = "Error #" + jqXHR.status + ": " + errorThrown + ". ";
            }
            self.danger( msg );
        },
        // onFial()
        
        
		/**
		 * 
		 */
		info: function(msg)
		{
			var boxParams = {
				className: 'info',
                icon: 'info',
				message: msg
			};
			this.box(boxParams);
		},
		// info()
        
        
        /**
         * Find the inputs having a default value and sets it.
         */
        resetInputs: function()
        {
            if ( !this.settings.resetInputs ) {
                return;
            }
            
            this.form.find(':input').each(function() {
                var input = jQuery(this);
                var value = '';
                if ( input.data('defaultvalue') != null ) {
                    value = input.data('defaultvalue');
                }
                input.val( value );
            });
        },
        // resetInputs()

		
        /**
         *
         */
        setupDefaultBehavior: function() 
        {
            var self = this;
            
            if ( !self.settings.spinnerButton ) {
                var btn = self.form.find('button[type=submit]');
                // Hack to fix a bizarre problem with there are more than one buttons on a page.
                if ( btn.width() < 0 ) {
                    btn.addClass('btn-block');
                }
                self.settings.spinnerButton = btn.buttonSpinner();
            }
            
            // When an input is focused, all errors associated to it are cleared
            self.form.find(':input').on('focus', function() {
                self.clearErrorsFromInput( this );
            });

        },
        // setupDefaultBehavior()
        
        
        /**
         *
         */
        setupMessageOutputContainer: function()
        {
            var self = this;
            
            if ( !self.settings.outputContainer ) {
                // Create a container right before the </form> tag.
                var wrapper = self.form;
                
                self.settings.outputContainer = jQuery('<div/>', { class: 'output' } );
                self.settings.outputContainer.appendTo( wrapper );
                
            } else {
                // Setup provided container
                
                if ( jQuery.type( self.settings.outputContainer ) == 'string' ) {
                    self.settings.outputContainer = jQuery(self.settings.outputContainer);
                }
                
                if ( !self.settings.outputContainer.hasClass('output') ) {
                    self.settings.outputContainer.addClass( 'output' );
                }
            }
            
            self.settings.outputContainer
                .hide()
                .css({ 
                    clear: 'both', 
                    display: 'block', 
                    margin: '0.5em 0 0.5em 0'
                });
        },
        // setupMessageOutputContainer()
        
        
		/**
		 * 
		 */
		success: function(msg)
		{
			var boxParams = {
				className: 'success',
                icon: 'check',
				message: msg
			};
			this.box(boxParams);
		},
		// success()
	

		/**
		 * 
		 */
		warning: function(msg)
		{
			var boxParams = {
				className: 'warning',
                icon: 'warning',
				message: msg
			};
			this.box(boxParams);
		},
		// warning()
        
        
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
/***** AJAX FORM ***/

 
 
 

/**
 * BUTTON SPINNER
 * ------------------
 * The button spinner will allow the programmer to convert a button into a non-active 
 * element displaying an animated icon to indicate that some kind of process is takin place. 
 * While in processing state, the button becomes unclickable and displays a spinning icon. When the process is finished and 
 * we reset the processing state, the button won't become active immediately, instead one of these things must happen: 
 *      1. The user must mouse-out from the button (if inside)
 *      2. The user must mouse-in to the button (if outside)
 *
 * This behavior is an attempt to avoid some potential issues that may arise from double-clicks and accidental repeated submission. 
 *
 * @type plugin
 * @usage var btn = $("button[type=submit]").buttonSpinner({options}); btn.buttonSpinner('start'); btn.buttonSpinner('stop');
 */
;(function ( $, window, document, undefined ) {

	"use strict";

	// Create the defaults once
	var pluginName = "buttonSpinner";
	var defaults = {
        // A font-awesome icon to use as spinner
        activityIcon: 'cog',
        doneIcon: 'check',
        size: 'lg',
        
        // Time in milliseconds to wait before re-enabling the button 
        // upon calling stop().
        // This time is to prevent double-clicks to take effect if the 
        // time during which the button stayes disabled is too short. 
        timeDisabledAfterStop: 100,
        
        // Enable/Disable button restore.
        // If this is FALSE the button won't be restored after the process is done.
        // The only way to re-submit the associated form is to refresh the page or somehowe reset the form. 
        allowReactivate: true,
        
        // Time in milliseconds to wait before reactivating the button after it has been disabled.
        timeDisabledBeforeReactivate: 1500,
        
    };

	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
        this.init();
        
        // Whether the button is in running state.
        this.isRunning = false;
	} /* Plugin() */

	
	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
        /**
         *
         */
        init: function()
        {
            this.button = jQuery(this.element);
            
            var self = this;
            
            // Capture clicks 
            this.button.on('click', function(evt) {
                if ( self.isRunning ) {
                    evt.preventDefault();
                }
            });
            
            // If allowReactivate is set create event listeners to 
            // react to those that will reactivate a locked button.
            if ( this.settings.allowReactivate ) {
                // Unlock the button whenever the mouse leaves it 
                this.button.on('mouseleave mouseenter', function() {
                    self.reactivateButton();
                });
                this.button.on('touchstart', function() {
                    self.restoreButtonLabel();
                    setTimeout( function() {
                        self.reactivateButton();
                    }, self.settings.timeDisabledAfterStop / 2);
                });
            }
            
            // Establish the button width to its current value so it doesn't 
            // change when the label is replaced by the icon. 
            this.button.width( this.button.width() );
            
            // Store styles to use them when the button ins disabled
            this.button.data('backgroundColor', this.button.css('backgroundColor'));
            this.button.data('color', this.button.css('color'));

            // Store the current lable to restore it after when processing is done.
            this.button.data('label', this.button.html());
            
            // This plugin accepts only FontAwesome icons.
            this.settings.spinner = jQuery('<i class="fa fa-spin fa-' + this.settings.activityIcon + ' fa-' + this.settings.size + '"></i>')            
            this.settings.done = jQuery('<i class="fa fa-' + this.settings.doneIcon + ' fa-' + this.settings.size + '"></i>')            
        },
        // init()
        
        
        /**
         *
         */
        disableButton: function()
        {
            var self = this;
            
            this.button.css( 'cursor', 'pointer' );
            this.button.attr( 'disabled', true );
            
            // WHen a button gets disabled; it should be reactivated 
            // after a period o time. 
            setTimeout(function() {
                self.reactivateButton();
            }, self.settings.timeDisabledBeforeReactivate);
        },
        // disableButton()
        
        
        /**
         *
         */
        enableButton: function()
        {
            this.button.attr( 'disabled', false );
        },
        // enableButton()
        
        /**
         *
         */
        reactivateButton: function()
        {
            if ( !this.isRunning ) {
                this.restoreButtonLabel();
                this.enableButton();
            }
        },
        // reactivateButton()
        
        
        /**
         *
         */
        restoreButtonLabel: function() 
        {
            this.button.html( this.button.data('label') );
        },
        // restoreButtonLabel()
        
        
        /**
         * Disables the button and shows a spinner.
         */
        start: function() 
        {
            this.isRunning = true;
            this.startSpinning();
        },
        // start()
        
        
        /**
         *
         */
        startSpinning: function()
        {
            this.button.html( this.settings.spinner );
            this.button.css( 'cursor', 'progress' );
        },
        // startSpinning()

        
        /**
         * Turn-off the spinning and disable the button. 
         * The button gets dissabled after a processing round to prevent accidental clicks. 
         * When the user has preformed some gesture with the mouse (leave or re-enter) the 
         * button will be re-enabled.
         */
        stop: function() 
        {
            var self = this;
            setTimeout(function() {
                self.disableButton();
                self.stopSpinning();
                self.isRunning = false;
            }, self.settings.timeDisabledAfterStop);
        },
        // stop()
        
        
        /**
         *
         */
        stopSpinning: function()
        {
            this.button.html( this.settings.done );
        }
        // stopSpinning()
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
/***** BUTTON SPINNER ***/

