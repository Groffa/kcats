kcats.defineModule(function() {
	
	// Palindrome module.
	// Will determine if the user's input is a palindrome.
	
	var lastPalindrome = null;
	
	var justValids = function (text) {
		var valid = 'abcdefghijklmnopqrstuvyxzåäö1234567890';
		var res = '';
		var symbol;
		
		for (var i=0; i < text.length; ++i) {
			symbol = text[i].toLowerCase();
			if (valid.indexOf(symbol) >= 0) {
				res += symbol;
			}
		}
		return res;
	};
	
	var isPalindrome = function (text) {
		var stripped;
		var reversed = '';
		
		if (text === null || text.length === 0) {
			return false;
		} else {
			stripped = justValids(text);
			for (var i=0; i < stripped.length; ++i) {
				reversed += stripped[stripped.length - i - 1];
			}
			return reversed === stripped;
		}
	};
	
	return {

		name: 'Palindrome',
	
		startup: function () {
			kcats.clearScreen();
			kcats.useBuiltins = false;
			kcats.print('Starting up module! This is the palindrome program.');
			kcats.print('I\'ll determine whether or not you typed in a palindrome.');
			kcats.print('(I\'ll just look at letters a-z and numbers.)');
		},
		
		eval: function (line) {
			if (line.length === 0) {
				// Empty line, do nothing.
				return;
			}
			
			kcats.print('You typed: ' + line);
			
			if (isPalindrome(line)) {
				lastPalindrome = line;
				kcats.print('That is a valid palindrome.');
			} else {
				kcats.print('That is not a palindrome.');
				if (lastPalindrome !== null) {
					kcats.print('The last palindrome you typed was: ' + lastPalindrome);
				}
			}
		}
	};
	
});