
/* fs.js
	Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
	Under GPLv2. ABSOLUTELY NO WARRANTY!
*/

function FileSystem(dev)
{
	this.dev = dev;
	this.load();
}

FileSystem.prototype.load  = function() {
	this.data = localStorage[this.dev];
	if (!this.data) this.data = {};
};

FileSystem.prototype.flush = function() {
	localStorage[this.dev] = JSON.stringify(this.data);
};

FileSystem.prototype.open = function(name) {
	var f = new File(this, name);
	f.data = this.data[name];
	return f;
};

function File(fs, filename)
{
	this.fs   = fs;
	this.name = filename;
	this.data = '';
}

File.prototype.close = File.prototype.flush = function() {
	this.fs.data[this.name] = this.data;
	this.fs.flush();
};
