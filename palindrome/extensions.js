String.prototype.startsWith = function (s) {
	if (this.length === 0 || typeof s === 'undefined' || s === null || s.length > this.length) {
		return false;
	}
	return (this.substring(0, s.length) === s);
};

String.prototype.endsWith = function (s) {
	if (this.length === 0 || typeof s === 'undefined' || s === null || s.length > this.length) {
		return false;
	}
	return (this.substr(-s.length) === s);
};
