
/**** fs.js ***********************************************************
 * File System: A UNIX style file system.
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

/**********************************************************************
 *
 * FSFile
 *
 */

function FSFile(fs, id)
{
	this.fs = fs;
	this.id = id;
}


FSFile.prototype.getData = function()
{
	if (this.data === undefined)
		this.data = this.fs.fs[this.id].data;
	return this.data;
}


FSFile.prototype.setData = function(data)
{
	this.data = data;
}


// flush data
FSFile.prototype.close = function()
{
	if (this.data === undefined)
		return;

	this.fs.fs[this.id].data = this.data;
	this.fs._save();
}

/**********************************************************************
 *
 * FSDir
 *
 */

function FSDir(fs, id)
{
	this.fs = fs;
	this.id = id;
}


FSDir.prototype.getFile = function(name)
{
	if (name == '.')	// self
		return this;
	if (name == '..')	// parent
		return new FSDir(this.fs, this.fs.fs[this.id].pid);

	// normal file or directory
	var id = this.fs.findFile(name, this.id);
	if (id == -1) return "File `" + name + "' not found.";
	if (this.fs.fs[id].type == 'd')		// dir
		return new FSDir(this.fs, id);
	if (this.fs.fs[id].type == '-')		// normal file
		return new FSFile(this.fs, id);
	return "There must be a bug!";		// should never arrive here
}


FSDir.prototype.mkdir = function(name)
{
	// check if file exists
	if (this.fs.findFile(name, this.id) != -1)
		return "`" + name + "' already exists.";

	var id = this.fs.fs.push({
			name: name,
			pid : this.id,
			type: 'd',
			data: ''
		}) - 1;
	this.fs._save();
	return new FSDir(this.fs, id);
}


// create a normal file
FSDir.prototype.create = function(name)
{
	// check if file exists
	if (this.fs.findFile(name, this.id) != -1)
		return "`" + name + "' already exists.";

	var id = this.fs.fs.push({
			name: name,
			pid : this.id,
			type: '-',
			data: ''
		}) - 1;
	this.fs._save();
	return new FSFile(this.fs, id);
}

/**********************************************************************
 *
 * FSLocalStorage
 *
 */

// to the local storage file system, user is useless,
// for it must always be 'local'. So it is ignored.
function FSLocalStorage(user)
{
	this._load();
	this.cd("/");
}


FSLocalStorage.prototype.cd = function(path)
{
	var dir = this.getFileByPath(path);
	if (dir instanceof FSDir) this.cwd = dir;			// ok
	else if (dir.constructor === String) return dir;	// error
	else return "`" + path + "' is not a directory.";	// error
}


FSLocalStorage.prototype.ls = function()
{
	var files = this._listSubFiles(this.cwd.id);

	// extract file names
	var list = "";
	for (var i in files) {
		list += files[i].name;
		if (files[i].type == 'd')
			list += '/';
		list += '\n';
	}
	return list.slice(0, -1);	// remove the last '\n'
}


FSLocalStorage.prototype.tree = function(dir, indent)
{
	var remove_n = false;		// whether remove '\n'
	if (!indent || !dir) {
		indent   = 0;
		dir      = this.cwd;
		remove_n = true;
	}

	var list = "";
	var files = this._listSubFiles(dir.id);
	for (var i in files) {
		for (var j=0; j<indent; j++) list += '\t';		// indent
		list += files[i].name;
		if (files[i].type == 'd') {
			list += "/\n";
			list += this.tree(
					new FSDir(this, this.findFile(files[i].name, dir.id)),
					indent + 1);
		}
		else list += "\n"
	}
	if (remove_n) list = list.slice(0, -1);	// remove the last '\n'
	return list;
}


// You must make sure that NO FILE IS CLOSED AFTER IT IS REMOVED!
// if it's a dir, remove it with everything inside it.
FSLocalStorage.prototype.rm = function(path)
{
	var file = this.getFileByPath(path);
	if (file.id == 0) {
		delete this.fs;
		delete localStorage['local'];
		this._load();
		return;
	}

	if (file.constructor === String)
		return file;	// error string

	if (file instanceof FSDir) {	// recursive deletion
		for (var i in this.fs)
			if (this.fs[i].pid == file.id)
				this.rm(path + '/' + this.fs[i].name);
	}

	this.fs[file.id] = { removed: true, pid: -1, name: '', data: '' };
	while (this.fs[this.fs.length-1].removed)
		this.fs.pop();
	this._save();
}


// return opened file if succeed.
// return error string when error occured.
FSLocalStorage.prototype.open = function(path)
{
	var file = this.getFileByPath(path);
	if (file instanceof FSDir) return "`" + path + "' is a dierctory.";
	return file;
}


FSLocalStorage.prototype.mkdir = function(name)
{
	return this.cwd.mkdir(name);
}


FSLocalStorage.prototype.create = function(name)
{
	return this.cwd.create(name);
}


// return a string when error occured, otherwise return an FSFile or FSDir.
FSLocalStorage.prototype.getFileByPath = function(path)
{
	if (path == "/")
		return new FSDir(this, 0);

	if (path == "")
		return this.cwd;

	path = path.split("/");
	var dir = this.cwd;

	if (path[0] == '')
		dir = new FSDir(this, 0);
	for (var i in path) {
		if (path[i] == '') continue;
		if (!(dir instanceof FSDir))
			return "`" + path[i] + "' is not a directory.";
		dir = dir.getFile(path[i]);
		if (dir.constructor === String) return dir;	// error
	}
	return dir;
}


// find the file <name> in the directory specified by <pid>,
// and return the file id. return -1 if not found.
FSLocalStorage.prototype.findFile = function(name, pid)
{
	for (var i in this.fs)
		if (this.fs[i].pid == pid && this.fs[i].name == name)
			return i;
	return -1;
}


FSLocalStorage.prototype._listSubFiles = function(id)
{
	var files = [];
	for (var i in this.fs)
		if (this.fs[i].pid == id)
			if (i != 0)		// skip root '/' itself
				files.push(this.fs[i]);
	return files;
}


FSLocalStorage.prototype._load = function()
{
	if (!localStorage['local'])
		this.fs = [
			// pid: parent directory id
			// type: 'd' = directory, '-' = normal file
			// owner is useless in local file system, so ignored.
			{ name: '', pid: 0, type: 'd', data: ''/*, owner: 0*/ }
		];
	else this.fs = JSON.parse(atob(localStorage['local']));
}


FSLocalStorage.prototype._save = function()
{
	localStorage['local'] = '' + this;	// convert to string
}


FSLocalStorage.prototype.toString = function()
{
	return btoa(JSON.stringify(this.fs));
}

