
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

function Vim(convas, fn_quit)
{
	this.default_set = { nu: true };
	this.mode        = 'NORMAL';
	this.convas      = convas;
	this.tabs        = [new VimWindow(this)];
	this.tabId       = 0;
	this.win         = this.tabs[this.tabId];
	this.fn_quit     = fn_quit;
	this.quited      = false;
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
	this.convas.write("type  :vimjs");
	this.convas.setColor(FG_B);
	this.convas.write("<Enter>");
	this.convas.setColor(FG_R|FG_G|FG_B);
	this.convas.write("           to get the source code");
	this.convas.cursorTo(17, 16);
	this.convas.write("type  :q");
	this.convas.setColor(FG_B);
	this.convas.write("<Enter>");
	this.convas.setColor(FG_R|FG_G|FG_B);
	this.convas.write("               to log out");
	this.convas.setCursorPos(pos);

	this.is_cmd = false;
	this.repeat = "";
	this.cmd    = "";
	var that = this;
	that.convas.readKey(false, function fn(key) {
		var ch = String.fromCharCode(key);
		that.processKey(ch);
		if (that.quited) return;
		that.convas.readKey(false, fn);
	});
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

	var pos = this.convas.getCursorPos();
	if (this.last_status_line && !this.err_msg) {
		this.convas.cursorTo(0, this.convas.h-1);
		this.convas.setColor(FG_R|FG_G|FG_B);
		this.convas.write(this.last_status_line);
		delete this.last_status_line;
	}
	if (this.err_msg) {
		this.convas.cursorTo(0, this.convas.h-1);
		this.convas.setColor(FG_H|FG_R|FG_G|FG_B|BG_R);
		this.convas.write(this.err_msg);
		delete this.err_msg;
	}
	this.convas.setCursorPos(pos);

	if (this.mode == 'CMDLINE') {
		this._blankCmdLine();
		this.convas.write(":" + this.cmd);
	}
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


Vim.prototype.processKey = function(ch)
{
	if (this.mode == 'NORMAL') {
		if (this.is_cmd)
			this.cmd += ch;
		else {
			if (/[0-9]/.test(ch)) this.repeat += ch;
			else {
				this.is_cmd = true;
				this.repeat = parseInt(this.repeat);
				this.cmd   += ch;
			}
		}

		for (var i in vim_cmds) {
			if (vim_cmds[i].regex.test(this.cmd)) {
				this.is_cmd = false;
				this.repeat = "";
				this.cmd    = "";
				vim_cmds[i].callback(this);
				break;
			}
		}
	}
	else if (this.mode == 'CMDLINE') {
		if (ch == '\r') {
			this.mode = "NORMAL";
			if (this.cmd) {
				this.execScript(this.cmd);
				if (this.quited) return;
				this.last_status_line = ":" + this.cmd;
				this.cmd = "";
			}
		}
		else if (ch == '\b') {
			if (this.cmd) this.cmd = this.cmd.slice(0, -1);
			else this.mode = "NORMAL";
		}
		else this.cmd += ch;
	}

	this.render();
}


Vim.prototype.closeTab = function()
{
	if (this.tabs.length == 1) this.quit();
	else {
		this.tabs.splice(this.tabId, 1);		// remove current tab
		if (this.tabId >= this.tabs.length)
			this.tabId = this.tabs.length-1;
		this.win = this.tabs[this.tabId];
	}
}


Vim.prototype.quit = function()
{
	this.convas.clear();
	this.fn_quit();
	this.quited = true;
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
	this.err_msg = "E000: " + msg;
}


Vim.prototype.execScript = function(script)
{
	if (script.indexOf('\n') != -1) {
		this._error("TODO");
	}

	var result;

	if (result = /^(v)ne(w)?|new$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[1] -> "v" or undefined
		 */
		this.win.split(result[1] == "v", false);
	}
	else if (result = /^(v)?sp(lit)?$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[1] -> "v" or undefined
		 */
		this.win.split(result[1] == "v", true);
	}
	else if (/^q(uit)?$/.test(script)) this.win.close();
	else if (result = /^set\s+((no)?([a-z]+)(=(\d+))?)$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[1] -> the whole set
		 * 		[2] -> "no" or undefined
		 * 		[3] -> the option to set
		 * 		[4] -> has "=value" part or not
		 * 		[5] -> the value to set
		 */
		if (result[2] && result[4])
			this._error("Invalid argument: " + result[1]);
		else if (result[2]) delete this.win.set[result[3]];
		else {
			if (result[5]) result[5] = parseInt(result[5]);
			else result[5] = true;
			this.win.set[result[3]] = result[5];
		}
	}
	else if (script == "vimjs")
		window.open("https://github.com/cjxgm/vimjs", "_blank");
	else if (script == "debug") this.win.buffer.lines.push("Hi!\x00");
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
	this.vim        = vim;
	this.pa         = pa;		// parent
	this.line_start = 0;
	this.buffer     = new VimBuffer(vim, "");
	this.x = this.y = 0;

	this.set = {};
	for (var key in this.vim.default_set)
		this.set[key] = this.vim.default_set[key];
}


VimWindow.prototype.render = function(buffer)
{
	var lineno_len = 0;
	if (this.set.nu) {
		lineno_len = this.buffer.lines.length.toString().length + 1;
		if (lineno_len < 4) lineno_len = 4;
	}

	var cpos = {x:0, y:0};

	var y=0;
	for (var i=this.line_start; i<this.buffer.lines.length; i++) {
		buffer.cursorTo(0, y);
		if (this.set.nu) {
			lineno = '';
			var spc = lineno_len - 1 - i.toString().length;
			while (spc-- > 0) lineno += ' ';
			lineno += i.toString();
			lineno += ' ';
			buffer.color = FG_H | FG_R | FG_G;
			buffer.write(lineno);
		}
		var t = this.buffer.lines[i].split('');
		buffer.color = FG_R | FG_G | FG_B;
		for (var x=0; x<t.length; x++) {
			if (t[x] != '\x00') buffer.write(t[x]);
			if (x == this.x && i == this.y)
				cpos = { x: buffer.x, y: buffer.y };
		}
		y++;
	}
	for (; y<buffer.h; y++) {
		buffer.cursorTo(0, y);
		buffer.color = FG_H | FG_B;
		buffer.write("~");
	}

	buffer.cursorTo(cpos.x, cpos.y);
	this.status_line = (this.y+1) + "," + (this.x+1) + "      100%";
	while (this.status_line.length < buffer.w)
		this.status_line = ' ' + this.status_line;
}


VimWindow.prototype.split = function(is_horizon, with_content)
{
	var win = new VimWindow(this.vim);
	if (with_content)	// copy the content
		win.buffer = this.buffer;

	if (this.pa) {
		if (this.pa.is_horizon != is_horizon) {
			var sp  = new VimWindowSplit(this.vim, this.pa,
					is_horizon, win, this);
			win.pa  = sp;
			this.pa = sp;
			var idx = this.pa.wins.indexOf(this);
			this.pa.wins[idx] = sp;
		}
		else {
			win.pa  = this.pa;
			var idx = this.pa.wins.indexOf(this);
			this.pa.wins.splice(idx, 0, win);	// insert the win
		}
	}
	else {
		var sp  = new VimWindowSplit(this.vim, this.pa,
				is_horizon, win, this);
		win.pa  = sp;
		this.pa = sp;
		this.vim.tabs[this.vim.tabId] = sp;
	}

	this.vim.win = win;
}


VimWindow.prototype.close = function()
{
	if (this.pa) this.pa.killWindow(this);
	else this.vim.closeTab();
}


VimWindow.prototype.moveCursor = function(dx, dy)
{
	this.x += dx;
	this.y += dy;
	if (this.y < 0) this.y = 0;
	else if (this.y >= this.buffer.lines.length)
		this.y = this.buffer.lines.length-1;
	if (this.x < 0) this.x = 0;
	else if (this.x >= this.buffer.lines[this.y].length)
		this.x = this.buffer.lines[this.y].length-1;
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

/**********************************************************************
 *
 * VimBuffer: process and store texts
 *
 */

function VimBuffer(vim, text)
{
	this.vim = vim;
	this.setText(text);
}


VimBuffer.prototype.setText = function(text)
{
	this.lines = text.split('\n');
	if (!this.lines.length) this.lines[0] = "";
	for (i in this.lines) this.lines[i] += '\x00';
}

