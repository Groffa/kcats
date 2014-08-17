kcats.defineModule(function() {
	
	// Private variables/functions here, not visible outside this module.
	
	return {
	
		/** 
		 * Public interface, the visible part of the module.
		 *
		 * A module needs to return at least three things here:
		 * 1. A name (string)
		 * 2. A function called "startup" (called once)
		 * 3. A function called "eval" (called whenever the user presses ENTER)
		 */
		
		// Required. Name of module.
		name: '...',
	
		// Required. Called once when the module is fully loaded.
		startup: function () {
		},
		
		/**
		 * Required. Called every time the user presses ENTER.
		 * @param line (String) will contain the full line entered by the user
		 * @return Anything returned by this function will be printed to the screen
		 */
		eval: function (line) {
			return '';
		}
	};
	
});