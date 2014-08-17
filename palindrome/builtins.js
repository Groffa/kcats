kcats.builtin = kcats.builtin || {};
kcats.builtin.helptext = kcats.builtin.help || {};

kcats.defineBuiltins = function () {
	var aliasFor = function (name) {
		var s = name[0];
		for (var i=1; i < name.length; ++i) {
			if (name[i].toUpperCase() === name[i]) {
				s += name[i];
			}
		}
		return s.toLowerCase();
	};
	var def = function (name, helptext) {
		var alias = aliasFor(name);
		kcats.builtin['_' + name.toLowerCase()] = kcats[name];
		kcats.builtin['_' + alias] = kcats[name];
		if (typeof helptext !== 'undefined') {
			kcats.builtin.helptext['_' + name.toLowerCase()] = helptext;
		}
		kcats.builtin.helptext['_' + alias] = 'alias for _' + name.toLowerCase();
	};
	def('help', 'this text');
	def('loadModule', 'loads and executes an external module');
	def('restartModule', 'restarts the loaded module');
	def('moduleInfo', 'shows info about the loaded module');
	def('clearScreen');
	def('debug', 'toggles debug mode (default: ' + (kcats.debugMode ? 'ON' : 'OFF') + ')');
};

kcats.help = function () {
	var s;
	Object.keys(kcats.builtin).forEach(function (k) {
		if (k !== 'helptext') {
			s = k;
			if (kcats.builtin.helptext.hasOwnProperty(k)) {
				s += ' (' + kcats.builtin.helptext[k] + ')';
			}
			kcats.print(s);
		}
	});
};

kcats.loadModule = function (src) {
	if (typeof src === 'undefined' || src === null) {
		kcats.print('!!! Missing src');
	} else {
		var scriptTag = document.createElement('script');
		kcats.debugPrint('Loading module ' + src + '...');
		scriptTag.src = src;
		scriptTag.onload = function () {
			kcats.debugPrint('Module ' + src + ' loaded');
		}
		document.getElementsByTagName('head')[0].appendChild(scriptTag);
	}
};

kcats.restartModule = function () {
	if (kcats.module.definition === null) {
		kcats.print('!!! No module loaded (or no definition present');
	} else {
		kcats.debugPrint('Restarting module');
		kcats.defineModule(kcats.module.definition);
	}
};

kcats.moduleInfo = function () {
	if (kcats.module.definition === null) {
		kcats.print('!!! No module loaded (or no definition present)');
	} else if (kcats.module.instance === null) {
		kcats.print('!!! Module not instantiated');
	} else {
		kcats.print(kcats.module.instance.name);
	}
};

kcats.clearScreen = function () {
	while (kcats.ui.screen.children.length > 0) {
		kcats.ui.screen.children[0].remove();
	}
};

kcats.debug = function () {
	kcats.debugMode = !kcats.debugMode;
	kcats.print('Debug mode turned ' + (kcats.debugMode ? 'ON' : 'OFF'));
};
