var MultipleCallbacks = function(n, callback) {
	return this.init(n, callback);
};

MultipleCallbacks.prototype.init = function(n, callback) {
	var self = this;
	this.times = 0;
	this.ntimes = n;

	this.callback = callback;

	var f = function(){
		return self.preCallback();
	};

	f.changeTimesToFire = function(n){
		return self.changeTimesToFire(n);
	};

	f.getTimesToFire = function(){
		return self.getTimesToFire();
	};

	f.getFiredTimes = function(){
		return self.getFiredTimes();
	};

	return f;
};

MultipleCallbacks.prototype.changeTimesToFire = function(n) {
	this.ntimes = n;
	if(this.times >= this.ntimes) this.preCallback();
	return n;
};

MultipleCallbacks.prototype.getTimesToFire = function() {
	return this.ntimes;
};

MultipleCallbacks.prototype.getFiredTimes = function() {
	return this.times;
};

MultipleCallbacks.prototype.preCallback = function() {
	this.times++;
	if(this.times >= this.ntimes){
		if(this.callback){
			this.callback();
		}
	}
	return this.ntimes - this.times;
};

