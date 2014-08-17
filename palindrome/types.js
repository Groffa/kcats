function expand (base, cfg) {
	var baseCopy = base || {};
	Object.keys(cfg).forEach(function (k) {
		if (!baseCopy.hasOwnProperty(k)) {
			baseCopy[k] = cfg[k];
		}
	});
	return baseCopy;
}

var kcats = expand(kcats, { types: {} });

kcats.types.stack = function () {
	var l = [];
	return {
		push: function (o) {
			l.push(o);
		},
		
		pop: function () {
			var top = l[l.length - 1];
			--l.length;
			return top;
		},
		
		empty: function () {
			return l.length === 0;
		},
		
		toArrayList: function () {
			var n=[];
			for (var i=0; i < l.length; ++i) {
				n.push(l[i]);
			}
			return n;
		},
		
		clear: function () {
			l.length = 0;
		},
		
		size: function () {
			return l.length;
		}
	};
};

kcats.types.history = function (max) {
	var l = [];
	var i = 0;
	var max = (typeof max !== 'undefined' ? max : 10);
	return {
		push: function (o) {
			l.push(o);
			if (l.length > max) {
				l = l.splice(1);
			}
			i = l.length - 1;
		},
		
		prev: function () {
			var s = this.current();
			--i;
			if (i < 0) {
				i = l.length - 1;
			}
			return s;
		},
		
		next: function () {
			i = ++i % l.length;
			return this.current();
		},
		
		current: function () {
			if (l.length > 0) {
				return l[i];
			} else {
				return '';
			}
		}
	};
};