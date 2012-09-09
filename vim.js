
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
	this.tabs  = [new VimWindow(this)];
	this.tabId = 0;
	this.win   = this.tabs[this.tabId];
	this.render();

	// show initial screen
	var pos = this.convas.getCursorPos();
	this.convas.setColor(FG_R|FG_G|FG_B);
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
	this.convas.setCursorPos(pos);

	// enter normal mode
	this._normalMode();
}


Vim.prototype.render = function()
{
	if (this.tabs[this.tabId] === this.win) {
		var buf = new ConvasBuffer(this.convas.w, this.convas.h-1);
		this.win.render(buf);
		this.convas.renderBuffer(buf, 0, 0);

		this.convas.cursorTo(0, this.convas.h-1);
		this.convas.setColor(FG_R|FG_G|FG_B);
		this.convas.write(this.win.status_line);

		this.convas.cursorTo(buf.x, buf.y);
	}
	else this._doRender(this.tabs[this.tabId], 0, 0,
			this.convas.w, this.convas.h-1);
}


Vim.prototype._doRender = function(win, x, y, w, h)
{
	if (win instanceof VimWindow) {
		if (h > 1) {
			var buf = new ConvasBuffer(w, h);
			win.render(buf);
			this.convas.renderBuffer(buf, x, y);
			if (win === this.win)
				this.convas.cursorTo(buf.x+x, buf.y+y);
		}
		if (h) {
			var buf = new ConvasBuffer(w, 1);
			buf.color = BG_H | BG_R | BG_G | BG_B;
			if (win === this.win) buf.color |= FG_H;
			for (var i=0; i<w; i++) buf.write(" ");
			buf.cursorTo(0, 0);
			buf.write(win.status_line);
			this.convas.renderBuffer(buf, x, y+h-1);
		}
		return;
	}

	if (win.is_horizon) {
	}
	else {	// vertical
		var step = h / win.wins.length;
		for (var i in win.wins)
			this._doRender(win.wins[i], x, y + parseInt(i*step), w,
					(i==win.wins.length-1 ? h-parseInt(step*i) :
							parseInt(step)));
	}
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

	if (script == "new") this.win.splitY();
	else if (script == "q") this.win.close();
	else this._error("Not an editor command: " + script);
}

/**********************************************************************
 *
 * VimWindow: the viewport of a buffer
 *
 */

// note: the status line should NOT be included in <h>.
function VimWindow(vim, pa)
{
	this.vim = vim;
	this.pa  = pa;		// parent
}


VimWindow.prototype.render = function(buffer)
{
	this.status_line = "HELLO";
}


VimWindow.prototype.splitX = function()
{
}


VimWindow.prototype.splitY = function()
{
	var win = new VimWindow(this.vim);

	if (this.pa) {
		if (this.pa.is_horizon) {
			var sp  = new VimWindowSplit(this.vim, this.pa,
					false, win, this);
			win.pa  = sp;
			this.pa = sp;
			var idx = this.pa.wins.indexOf(this);
			this.pa.wins[idx] = sp;
		}
		else {	// vertical
			win.pa  = this.pa;
			var idx = this.pa.wins.indexOf(this);
			this.pa.wins.splice(idx, 0, win);	// insert the win
		}
	}
	else {
		var sp  = new VimWindowSplit(this.vim, this.pa,
				false, win, this);
		win.pa  = sp;
		this.pa = sp;
		this.vim.tabs[this.vim.tabId] = sp;
	}

	this.vim.win = win;
	this.vim.render();
}


VimWindow.prototype.close = function()
{
	if (this.pa) this.pa.killWindow(this);
	else this.vim.closeTab();
}

/**********************************************************************
 *
 * VimWindowSplit: splitter for vim windows
 *
 */

function VimWindowSplit(vim, pa, is_horizon, wina, winb)
{
	this.vim  = vim;
	this.pa   = pa;
	this.wins = [wina, winb];
	this.is_horizon = is_horizon;
}


VimWindowSplit.prototype.killWindow = function(win)
{
	var idx = this.wins.indexOf(win);
	this.wins.splice(idx, 1);	// remove the window

	if (idx >= this.wins.length) idx = this.wins.length-1;
	this.vim.win = this.wins[idx];

	if (this.wins.length == 1) {
		if (this.pa)
			this.pa.wins[this.pa.wins.indexOf(this)] = this.vim.win;
		else this.vim.tabs[this.vim.tabId] = this.vim.win;
		this.vim.win.pa = undefined;
	}

	this.vim.render();
}

