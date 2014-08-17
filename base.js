// kcats - by Jensan
kcats = expand(kcats, {
	version: '0.1',
	ui: kcats.ui || {},
	debugMode: false,
	useBuiltins: true,
	module: {
		definition: null,		// A function defining the module
		instance: null			// Instantiated module (from definition above)
	},
	keyboard: {
		history: new kcats.types.history(),
		buffer: new kcats.types.stack(),		// Input buffer
		caret: {
			symbol: '&blk14;',		// Graphics used for the blinking caret
			delay: 250
		},
		input: {
			restrictTo: null,		// A regular expression that defines what input to allow (null = everything)
			prompt: null
		}
	}
});

kcats.startup = function (cfg) {
	var cfg = expand(cfg, {
		src: null		// Auto-load this module (external javascript file)
	});
	kcats.bindUI();
	kcats.defineBuiltins();
	if (cfg.src !== null) {
		kcats.loadModule(cfg.src);
	}
};

kcats.bindUI = function () {
	window.addEventListener('keypress', function (ev) { kcats.handleKey(ev.keyCode); }, false);
	window.addEventListener('keydown',  kcats.handleKeyDown, false);
	
	kcats.ui.keyboardCaret = document.getElementsByClassName('caret')[0];
	kcats.ui.keyboardDisplay = document.getElementById('keyboardDisplay');
	kcats.ui.keyboardPrompt = document.getElementById('keyboardPrompt');
	kcats.ui.screen = document.getElementById('screen');
	
	kcats.ui.keyboardCaret.innerHTML = kcats.keyboard.caret.symbol;
	window.setInterval(kcats.toggleCaret, kcats.keyboard.caret.delay);
};

kcats.toggleCaret = function () {
	if (kcats.ui.keyboardCaret.style.visibility === '') {
		kcats.ui.keyboardCaret.style.visibility = 'hidden';
	} else {
		kcats.ui.keyboardCaret.style.visibility = '';
	}
};

kcats.setPrompt = function (text) {
	kcats.keyboard.input.prompt = text;
	kcats.ui.keyboardPrompt.innerHTML = text;
};

kcats.handleKeyDown = function (ev) {
	// Special case handling for keys not reported by keypress
	switch (ev.keyCode) {
	case 8:
	case 38:	// up
	case 40:	// down
		kcats.handleKey(ev.keyCode);
		ev.preventDefault();
		break;
	default:
		break;
	}
};

kcats.handleKey = function (keyCode) {
	switch (keyCode) {
	case 8:
		if (!kcats.keyboard.buffer.empty()) {
			kcats.keyboard.buffer.pop();
		}
		break;
		
	case 13:
		kcats.eval(kcats.keyboard.buffer.toString());
		kcats.keyboard.buffer.clear();
		window.scrollBy(0, window.innerHeight);	// todo: always scroll? or detect and scroll then?
		break;
		
	case 38:
	{
		kcats.keyboard.buffer.clear();
		var s = kcats.keyboard.history.prev();
		for (var i=0; i < s.length; ++i) {
			kcats.keyboard.buffer.push(s.charCodeAt(i));
		}
		break;
	}
	
	case 40:
	{
		kcats.keyboard.buffer.clear();
		var s = kcats.keyboard.history.next();
		for (var i=0; i < s.length; ++i) {
			kcats.keyboard.buffer.push(s.charCodeAt(i));
		}
		break;
	}
		
	default:
		if (kcats.keyboard.input.restrictTo === null || kcats.keyboard.input.restrictTo.test(String.fromCharCode(keyCode))) { 
			kcats.keyboard.buffer.push(keyCode);
		}
		break;
	}
	kcats.ui.keyboardDisplay.textContent = kcats.keyboard.buffer.toString();
};

/**
 * Prints a text to the screen.
 * @param s What to print
 * @param cfg (optional) Config object { klass: CSS-class to use. callback: function. newLine: if false, keep text on same line }
 */
kcats.print = function (s, cfg) {
	if (typeof s === 'undefined') {
		return;
	}
	var cfg = expand(cfg, {
		callback: null,
		klass: null,
		newLine: true
	});
	var node = document.createElement(cfg.newLine ? 'div' : 'span');
	var textNode = document.createTextNode(s);
	if (cfg.klass !== null) {
		node.setAttribute('class', cfg.klass);
	}
	node.appendChild(textNode);
	kcats.ui.screen.appendChild(node);
};

kcats.newLine = function () {
	var divNode = document.createElement('div');
	divNode.appendChild(document.createTextNode('\u00A0'));
	kcats.ui.screen.appendChild(divNode);
};

kcats.debugPrint = function (s) {
	if (kcats.debugMode) {
		kcats.print('??? ' + s);
	}
};

kcats.keyboard.buffer.toString = function () {
	return String.fromCharCode.apply(null, this.toArrayList());
};

kcats.defineModule = function (fn) {
	var instance = new fn();
	kcats.debugPrint('Defining module ' + instance.name);
	// Validate module configuration
	var req = ['name', 'startup', 'eval'];
	for (var k in Object.keys(req)) {
		if (typeof instance[req[k]] === 'undefined') {
			kcats.print('!!! Module error: missing "' + req[k] + '"');
			return false;
		}
	}
	document.getElementsByTagName('head')[0].getElementsByTagName('title')[0].textContent = instance.name;
	kcats.module.definition = fn;
	kcats.module.instance = instance;
	instance.startup();
};

kcats.eval = function (text) {
	kcats.keyboard.history.push(text);
	kcats.print((kcats.keyboard.input.prompt !== null ? kcats.keyboard.input.prompt : '') + text, { klass: 'userinput' });
	if (kcats.useBuiltins && text.startsWith('_')) {
		// built-in always starts with _
		kcats.evalBuiltin(text);
	} else {
		if (kcats.module.instance !== null) {
			kcats.print(kcats.module.instance.eval(text));
		} else {
			kcats.print('!!!  No module loaded');
		}
	}
};

kcats.evalBuiltin = function (text) {
	// Built-ins are functions meant to examine the "computer", loading modules, etc.
	// They do not belong to any module, and are always present.
	var p = text.split(' ');
	if (kcats.builtin.hasOwnProperty(p[0])) {
		kcats.builtin[p[0]].apply(null, p.splice(1));
	} else {
		kcats.print('!!! Unknown builtin command');
	}
};
