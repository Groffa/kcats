kcats.defineModule(function() {
	var	stack = new kcats.types.stack();
	var dict = {};
	var variables = [];		// [0] = { name: ..., value: ... }
	var constants = {
		'FALSE': 0,
		'TRUE': -1
	};

	return {

		name: 'Forthish',
	
		startup: function () {
			kcats.print('module ' + this.name + ' starting up');
			this.defineDict();
			kcats.clearScreen();
			this.printGreeting();
		},
		
		printGreeting: function () {
			var s = '';
			s = 'Welcome to ' + this.name + '.\n';
			s += 'This module accepts a subset of Forth\'s syntax.\n';
			s += 'For examples, see:\n';
			//s += 'http://galileo.phys.virginia.edu/classes/551.jvn.fall01/primer.htm\n';
			s += 'http://thebeez.home.xs4all.nl/ForthPrimer/Forth_primer.html';
			kcats.print(s, true);
		},
		
		stackOk: function (min) {
			var min = min || 1;
			if (stack.size() < min) {
				if (stack.empty()) {
					kcats.print('!!! Stack empty');
				} else {
					kcats.print('!!! Not enough items on stack (requires ' + min + ' items)');
				}
				return false;
			} else {
				return true;
			}
		},
		
		defineDict: function () {
			dict['.'] = this.dot;
			dict['.S'] = this.printStack;
			dict[':'] = this.defineWord;
			dict['DUP'] = this.dup;
			dict['DROP'] = this.drop;
			dict['SWAP'] = this.swap;
			dict['ROT'] = this.rotate;
			dict['."'] = this.displayString;
			dict['.('] = this.displayString;	// what is standard? .( or ." ?
			dict['+'] = this.math('+');
			dict['-'] = this.math('-');
			dict['*'] = this.math('*');
			dict['/'] = this.math('/');
			dict['>'] = this.comparison('>');
			dict['<'] = this.comparison('<');
			dict['='] = this.comparison('=');
			dict['IF'] = this.opIf;
			dict['('] = this.remark;
			dict['VARIABLE'] = this.declareVariable;
			dict['!'] = this.storeVariable;
			dict['@'] = this.fetchVariable;
			dict['?'] = this.displayVariable;
			dict['CONSTANT'] = this.declareConstant;
		},
		
		eval: function (s, silent) {
			var silent = silent || false;
			var p = s.split(' ');
			for (var i=0; i < p.length; ++i) {
				var token = p[i];
				if (dict.hasOwnProperty(token)) {
					var newIndex = dict[token].apply(this, [p, i]);
					if (typeof newIndex === 'number') {
						i = newIndex;
					}
				} else if (token.trim().length > 0) {
					// Special cases: constants and variables
					var tt = token.trim();
					var varIndex = this.findVariableIndex(tt);
					if (varIndex !== null) {
						stack.push(varIndex);
					} else if (constants.hasOwnProperty(tt)) {
						stack.push(constants[tt]);
					} else if (!isNaN(parseFloat(tt))) {
						stack.push(tt);
					} else {
						kcats.print("!!! Unrecognized token. Not a word, constant or variable");
					}
				}
			}
			if (!silent) {
				kcats.print('ok');
			}
			return '';
		},
		
		findVariableIndex: function (name) {
			for (var i=0; i < variables.length; ++i) {
				if (variables[i].name === name) {
					return i
				}
			}
			return null;
		},
		
		dot: function () {
			if (this.stackOk()) {
				kcats.print(stack.pop());
			}
		},
		
		printStack: function () {
			var l = stack.toArrayList();
			for (var i=0; i < stack.size(); ++i) {
				kcats.print(l[l.length - i - 1]);
			}
		},
		
		defineWord: function (params, offset) {
			// : <name> <op1> ... <opN> ;
			var name = params[++offset];
			var ops = '';
			for (++offset; offset < params.length; ++offset) {
				var token = params[offset];
				if (token !== ';') {
					ops += token + ' ';
				} else {
					break;
				}
			}
			dict[name] = (function (t, s1) {
				var me = t;
				var s = s1;
				return function () {
					me.eval(s, true);
				};
			})(this, ops.trim());
			return offset;
		},
		
		dup: function () {
			if (this.stackOk()) {
				var s = stack.pop();
				stack.push(s);
				stack.push(s);
			}
		},
		
		displayString: function (params, offset) {
			// ." Hello, world"
			var s = '';
			for (++offset; offset < params.length; ++offset) {
				var token = params[offset];
				if (token.endsWith('"')) {
					s += token.substring(0, token.length - 1);
					break;
				} else {
					s += token + ' ';
				}
			}
			kcats.print(s.trim());
			return offset;
		},
		
		drop: function () {
			if (this.stackOk()) {
				stack.pop();
			}
		},
		
		swap: function () {
			if (this.stackOk(2)) {
				var y = stack.pop();
				var x = stack.pop();
				stack.push(y);
				stack.push(x);
			}
		},
		
		rotate: function () {
			if (this.stackOk(3)) {
				var z = stack.pop();
				var y = stack.pop();
				var x = stack.pop();
				stack.push(y);
				stack.push(z);
				stack.push(x);
			}
		},
		
		comparison: function (operator) {
			var op = operator;
			var me = this;
			return function () {
				if (me.stackOk(2)) {
					var y = stack.pop();
					var x = stack.pop();
					if (eval(x + ' ' + op + ' ' + y)) {
						stack.push(-1);
					} else {
						stack.push(0);
					}
				}
			};
		},
		
		math: function (operator) {
			var op = operator;
			var me = this;
			return function () {
				if (me.stackOk(2)) {
					var y = parseFloat(stack.pop());
					var x = parseFloat(stack.pop());
					stack.push (eval(x + ' ' + op + ' ' + y));
				}
			};
		},
		
		opIf: function (params, offset) {
			// <flag> if ... then
			// <flag> if ... else ... then
			var scanFor = function (words) {
				for (; offset < params.length; ++offset) {
					if (words.indexOf(params[offset]) >= 0) {
						break;
					}
				}
			};
			if (this.stackOk()) {
				var toRun = '';
				var val = parseInt(stack.pop());
				if (!val) {
					scanFor(['ELSE', 'THEN']);
				}
				for (++offset; offset < params.length; ++offset) {
					var token = params[offset];
					if (token === 'THEN' || token === 'ELSE') {
						break;
					} else {
						toRun += token + ' ';
					}
				}
				toRun = toRun.trim();
				if (toRun.length > 0) {
					var newIndex = this.eval(toRun, true);
					if (typeof newIndex === 'number') {
						offset = newIndex;
					} else {
						scanFor(['THEN']);
					}
				}
			} else {
				scanFor(['THEN']);
			}
			return offset;
		},
		
		remark: function (params, index) {
			for (++offset; offset < params.length; ++offset) {
				var token = params[offset];
				if (token.endsWith(')')) {
					break;
				}
			}
			return offset;
		},
		
		declareVariable: function (params, offset) {
			// variable <varname>
			if (offset === params.length - 1) {
				kcats.print("!!! Missing variable name");
			} else {
				var name = params[++offset];
				variables.push({ name: name, value: 0 });
			}
			return offset;
		},
		
		storeVariable: function () {
			// <varname> !
			if (this.stackOk(2)) {
				var varIndex = parseInt(stack.pop());
				var varValue = stack.pop();
				variables[varIndex].value = varValue;
			}
		},
		
		fetchVariable: function () {
			// <varname> @
			if (this.stackOk()) {
				var varIndex = parseInt(stack.pop());
				stack.push(variables[varIndex].value);
			}
		},
		
		displayVariable: function () {
			if (this.stackOk()) {
				var varIndex = parseInt(stack.pop());
				kcats.print(variables[varIndex].value);
			}
		},
		
		declareConstant: function (params, offset) {
			// constant <varname>
			if (offset === params.length - 1) {
				kcats.print("!!! Missing variable name");
			} else {
				if (this.stackOk(1)) {
					var name = params[++offset];
					var constValue = stack.pop();
					constants[name] = constValue;
				}
			}
			return offset;
		}

	};
});