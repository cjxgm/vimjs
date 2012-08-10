
/**** vim.js **********************************************************
 * Vim JS: A JS re-implementation of Vim
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

/**********************************************************************
 *
 * Vim
 *
 */

function Vim(id)
{
	this.convas = new Convas(id, 80, 24, 11);

	// show initial screen
	this.convas.clear();

	this.convas.setColor(FG_H|FG_B);
	for (var i=0; i<80*24; i++)
		this.convas.write(" ");
	for (var i=1; i<23; i++) {
		this.convas.cursorTo(0, i);
		this.convas.write("~");
	}

	this.convas.cursorTo(0, 0);
	this.convas.setColor(FG_R|FG_G|FG_B);
	for (var i=0; i<80; i++)
		this.convas.write(" ");

	this.convas.cursorTo(0, 23);
	for (var i=0; i<62; i++)
		this.convas.write(" ");
	this.convas.write("0,0-1         All ");

	this.convas.cursorTo(26, 6);
	this.convas.write("VIM.JS - Vi IMproved for JS");
	this.convas.cursorTo(34, 8);
	this.convas.write("version 0.1");
	this.convas.cursorTo(30, 9);
	this.convas.write("by eXerigumo Clanjor");
	this.convas.cursorTo(17, 10);
	this.convas.write("Vim.js is open source and freely distributable");
	this.convas.cursorTo(25, 12);
	this.convas.write("Help poor children in Uganda!");
	this.convas.cursorTo(17, 13);
	this.convas.write("type  :help iccf");
	this.convas.setColor(FG_B);
	this.convas.write("<Enter>");
	this.convas.setColor(FG_R|FG_G|FG_B);
	this.convas.write("       for information");
	this.convas.cursorTo(17, 15);
	this.convas.write("type  :login");
	this.convas.setColor(FG_B);
	this.convas.write("<Enter>");
	this.convas.setColor(FG_R|FG_G|FG_B);
	this.convas.write("           to log in");
	this.convas.cursorTo(17, 16);
	this.convas.write("type  :q");
	this.convas.setColor(FG_B);
	this.convas.write("<Enter>");
	this.convas.setColor(FG_R|FG_G|FG_B);
	this.convas.write("               to log out");

	this.convas.cursorTo(0, 0);
	this.convas.setColor(FG_R|FG_G);
	this.convas.write("  1 ");

	// enter normal mode
	this._normalMode();
}


Vim.prototype._normalMode = function()
{
	var that = this;
	that.convas.readKey(false, function fn(key) {
		var ch = String.fromCharCode(key);
		switch (ch) {
			// for debug now
			case 'h':
				that.convas.cursorTo(that.convas.buffer.x - 1,
									 that.convas.buffer.y);
				break;
			case 'l':
				that.convas.cursorTo(that.convas.buffer.x + 1,
									 that.convas.buffer.y);
				break;
			case 'j':
				that.convas.cursorTo(that.convas.buffer.x,
									 that.convas.buffer.y + 1);
				break;
			case 'k':
				that.convas.cursorTo(that.convas.buffer.x,
									 that.convas.buffer.y - 1);
				break;
			case ':':
				that._cmdLineMode();
				return;
			default:
				console.log(ch + " <" + key + ">");
		}
		that.convas.readKey(false, fn);
	});
}


Vim.prototype._cmdLineMode = function()
{
	var that = this;
	var cmd  = "";
	var pos  = that.convas.getCursorPos();

	that._blankCmdLine();
	that.convas.write(":");

	that.convas.readKey(false, function fn(key) {
		var ch = String.fromCharCode(key);
		if (ch == '\r') {
			if (cmd == "") {
				that.convas.setCursorPos(pos);
				that._normalMode();
				return;
			}
			that.convas.setCursorPos(pos);
			that._normalMode();
			that.execScript(cmd);
			return;
		}
		else if (ch == '\b') {
			if (cmd == '') {
				that._blankCmdLine();
				that.convas.setCursorPos(pos);
				that._normalMode();
				return;
			}
			cmd = cmd.slice(0, -1);
			that._blankCmdLine();
			that.convas.write(":" + cmd);
		}
		else {
			cmd += ch;
			that._blankCmdLine();
			that.convas.write(":" + cmd);
		}
		that.convas.readKey(false, fn);
	});
}


Vim.prototype._blankCmdLine = function()
{
	this.convas.cursorTo(0, this.convas.h-1);
	this.convas.setColor(FG_R|FG_G|FG_B);
	for (var i=0; i<this.convas.w; i++)
		this.convas.write(" ");
	this.convas.cursorTo(0, this.convas.h-1);
}


Vim.prototype._error = function(msg)
{
	var pos = this.convas.getCursorPos();
	this._blankCmdLine();
	this.convas.setColor(FG_H|FG_R|FG_G|FG_B|BG_R);
	this.convas.write("E000: " + msg);
	this.convas.setCursorPos(pos);
}


Vim.prototype.execScript = function(script)
{
	if (script.indexOf('\n') != -1) {
		this._error("TODO");
	}

	this._error("Not an editor command: " + script);
}

