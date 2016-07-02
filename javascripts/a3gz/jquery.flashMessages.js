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
		container: '#flashMessages',
		
		/**
		 *
		 */
		setContainer: function( name )
		{
			container = name;
			return this;
		},
		// setContainer()
		
		/**
		 *
		 */
		box: function(boxParams)
		{
			var theId = boxParams.className + String(new Date().getTime() / 1000);
			var $msgBox = jQuery('<div>', {id: theId, class: 'alert alert-' + boxParams.className})
					.html(
						'<button type="button" class="close" data-dismiss="alert">&times;</button>'
						+ '<span class="message">' + boxParams.message + '</span>' 
					)
					.on('click', function(evt) {
						jQuery(this).slideUp(300);
						evt.stopPropagation();
					});

			jQuery(jQuery.flashMessages.container).prepend($msgBox).show();
			
			// Messages other than danger will close automatically. 
			// The time the box will be visible is calculated from the number of letters in the message.
			if (boxParams.className != 'danger')
			{
				var ms = 100; // milliseconds per word to wait before closing 
				var msgLen = parseInt(boxParams.message.length);
				var timeout = (ms * msgLen);
				setTimeout(function() { $msgBox.slideUp(function() { $msgBox.remove(); }) }, timeout);
			}
			
		},
		// box()
	
	
		/**
		 * 
		 */
		danger: function(msg)
		{
			var boxParams = {
				className: 'danger',
				message: msg
			};
			jQuery.flashMessages.box(boxParams);
		},
		// error()
		
		
		/**
		 * 
		 */
		info: function(msg)
		{
			var boxParams = {
				className: 'info',
				message: msg
			};
			jQuery.flashMessages.box(boxParams);
		},
		// notice()

		
		/**
		 * 
		 */
		success: function(msg)
		{
			var boxParams = {
				className: 'success',
				message: msg
			};
			jQuery.flashMessages.box(boxParams);
		},
		// notice()
	

		/**
		 * 
		 */
		warning: function(msg)
		{
			var boxParams = {
				className: 'warning',
				message: msg
			};
			jQuery.flashMessages.box(boxParams);
		},
		// warning()
	};
})();


/***
 * Setup a timeout on any messages existing inside the container 
 */
jQuery(document).ready(function() {
	jQuery(jQuery.flashMessages.container).find('.alert').each( function( i, box ) {
		var $msgBox = jQuery(box);
		if ( !$msgBox.hasClass('danger') )
		{
			var ms = 100; // milliseconds per word to wait before closing 
			var msgLen = parseInt(($msgBox.find('.message').html()).length);
			var timeout = (ms * msgLen);
			setTimeout(function() { $msgBox.slideUp(function() { $msgBox.remove(); }) }, timeout);
		}
	});
});