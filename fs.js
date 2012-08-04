
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

function FSFile(id)
{
	this.fs   = fs;
	this.id   = id;
}

/**********************************************************************
 *
 * FSDir
 *
 */

function FSDir(fs, id)
{
	this.fs   = fs;
	this.id   = id;
}

/**********************************************************************
 *
 * FSLocalStorage
 *
 */

// to the local storage file system, user is useless,
// for it must always be 'local'.
function FSLocalStorage(user)
{
	this._load();
	this.cd("/");
}


FSLocalStorage.prototype.ls = function()
{
	return this.listSubFiles(cwd.id);
}


FSLocalStorage.prototype.cd = function(path)
{
	var dir = this.getFileByPath(path);
	if (dir instanceof FSDir) this.cwd = dir;
	else if (dir.constructor === String) return dir;
	else return "`" + path + "' is not a directory.";
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
		if (dir.type != FS_DIR)
			return "`" + path[i] + "' is not a directory.";
		dir = dir.getFile(path[i]);
	}
	return dir;
}


FSLocalStorage.prototype._load = function()
{
	if (!localStorage['local'])
		localStorage['local'] = JSON.stringify([
			{ name: '', pid: 0, data: '', owner: 0 }
		]);
	this.fs = JSON.parse(localStorage['local']);
}

