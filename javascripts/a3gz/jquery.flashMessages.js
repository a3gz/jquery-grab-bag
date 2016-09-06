/**
 * jquery.flashMessages: 
 * Allows to easily insert flash messages into the DOM. 
 * Bootstrap severity levels are used: info, success, warning and danger, so if Bootstrap is 
 * loaded the boxes should be formatted with no additional coding.
 *
 * All non-danger boxes will destroy themselves after a certain amount of time. The time is calculated 
 * as a function of the number of letters. So, longer messages will remain longer, to allow users time to read it. 
 * Danger messages will remain until manually closed 
 */
 
;(function() {
	jQuery.flashMessages = {
		container: null,
        wordUpTime: 100, // in milliseconds
		
		/**
		 * Establishes a fallback messages container. 
         * 
         * @param container A jQuery object or a selector name.
         * 
         * @return this
		 */
		setContainer: function( container )
		{
            if ( typeof container == 'string' ) {
                container = jQuery(container);
            }
			this.container = container;
			return this;
		},
		// setContainer()
        
		
		/**
		 * General purpose message box generator. 
         *
         * @param boxParams An object having the box class (info, primary, success, warning or danger) and the message.
         * @param container A container to be used for this message alone. If not given, the fallback container is used.
		 */
		box: function(boxParams, container)
		{
			var theId = boxParams.className + String(new Date().getTime() / 1000);
			var msgBox = jQuery('<div>', {id: theId, class: 'alert alert-' + boxParams.className})
					.html(
						'<button type="button" class="close" data-dismiss="alert">&times;</button>'
						+ '<span class="message">' + boxParams.message + '</span>' 
					)
					.on('click', function(evt) {
						jQuery(this).slideUp(300);
						evt.stopPropagation();
					});

            var destroyContainer = true;
            
            if ( (typeof container == 'undefined') || (container == null) ) {
                container = this.getFallbackContainer();
                destroyContainer = false;
            } else {
                
                if ( typeof container == 'string' ) {
                    container = jQuery(container);
                }
            }
            container.prepend(msgBox).show();

			// Messages other than danger will close automatically. 
			// The time the box will be visible is calculated from the number of letters in the message.
            var ms = this.wordUpTime; // milliseconds per word to wait before closing 
            var msgLen = parseInt(boxParams.message.length);
            var timeout = (ms * msgLen);
            
            // Danger boxes remain double the time
			if (boxParams.className == 'danger') {
                timeout *= 2;
			}
            
            setTimeout(function() { msgBox.slideUp(function() { 
                msgBox.remove(); 
                if ( destroyContainer ) {
                    container.remove();
                } else {
                    container.hide();
                }
            }) }, timeout);
			
		},
		// box()
	
	
		/**
		 * 
		 */
		danger: function(msg, container)
		{
			var boxParams = {
				className: 'danger',
				message: msg
			};
			this.box(boxParams, container);
		},
		// error()
		
		
		/**
		 * 
		 */
		info: function(msg, container)
		{
			var boxParams = {
				className: 'info',
				message: msg
			};
			this.box(boxParams, container);
		},
		// notice()

		
		/**
		 * 
		 */
		success: function(msg, container)
		{
			var boxParams = {
				className: 'success',
				message: msg
			};
			this.box(boxParams, container);
		},
		// notice()
	

		/**
		 * 
		 */
		warning: function(msg, container)
		{
			var boxParams = {
				className: 'warning',
				message: msg
			};
            
			this.box(boxParams, container);
		},
		// warning()
        
        
        /**
         * Create a general purpose container and inserts it in the <body>.
         *
         * @return jQuery object
         */
        getFallbackContainer: function()
        {
            if ( !this.container ) {
                var c = jQuery('<div/>', {id:'flashMessagesContainer'});
                jQuery('body').append(c);
                this.container = c; 
            }
            
            return this.container;
        },
        // makeGeneralPurposeContainer()
	};
})();
