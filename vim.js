
/**** vim.js **********************************************************
 * Vim JS: A JS re-implementation of Vim
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

/**********************************************************************
 *
 * Vim
 *
 */

function Vim(convas, fs, fn_quit)
{
	this.default_set = { nu: true, ts: 4 };
	this.mode        = 'NORMAL';
	this.convas      = convas;
	this.fs          = fs;
	this.tabs        = [new VimWindow(this)];
	this.tab_current_wins = [this.tabs[0]];
	this.tab_id      = 0;
	this.win         = this.tabs[0];
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
	if (this.tabs.length > 1) {
		// render tabs navigation bar
		this.convas.cursorTo(0, 0);
		this.convas.setColor(BG_H | BG_R | BG_G | BG_B);
		this.convas.write(formatTextRight("", this.convas.w-1));
		this.convas.setColor(BG_R | BG_G | BG_B);
		this.convas.write("X");
		this.convas.cursorTo(0, 0);
		for (var i in this.tabs) {
			if (i == this.tab_id) 
				this.convas.setColor(FG_H | FG_R | FG_G | FG_B);
			else
				this.convas.setColor(BG_R | BG_G | BG_B);
			this.convas.write(" " +
					this.tab_current_wins[i].buffer.name + " ");
		}

		this._renderCurrentTab(0, 1, this.convas.w, this.convas.h-1);
	}
	else this._renderCurrentTab(0, 0, this.convas.w, this.convas.h);
}


Vim.prototype._renderCurrentTab = function(x, y, w, h)
{
	if (this.tabs[this.tab_id] === this.win) {
		var buf = new ConvasBuffer(w, h-1);
		this.win.render(buf);
		this.convas.renderBuffer(buf, x, y);

		// write status line (cursor pos indicator, etc.)
		this.convas.cursorTo(x, y+h-1);
		this.convas.setColor(FG_R | FG_G | FG_B);
		var status_line = formatTextRight(this.win.status_line, w);
		this.convas.write(status_line);

		this.convas.cursorTo(buf.x + x, buf.y + y);
	}
	else {
		this._doRender(this.tabs[this.tab_id], x, y, w, h-1);
		var pos = this.convas.getCursorPos();
		this._blankCmdLine();
		this.convas.setCursorPos(pos);
	}

	// render error msg or last cmd
	var pos = this.convas.getCursorPos();
	if (this.last_status_line && !this.err_msg) {
		this.convas.cursorTo(0, this.convas.h-1);
		this.convas.setColor(FG_R | FG_G | FG_B);
		this.convas.write(this.last_status_line);
		delete this.last_status_line;
	}
	if (this.err_msg) {
		this.convas.cursorTo(0, this.convas.h-1);
		this.convas.setColor(FG_H | FG_R | FG_G | FG_B | BG_R);
		this.convas.write(this.err_msg);
		delete this.err_msg;
		delete this.last_status_line;
	}

	// render "-- INSERT --"
	if (this.mode == 'INSERT') {
		this.convas.cursorTo(0, this.convas.h-1);
		this.convas.setColor(FG_H | FG_R | FG_G | FG_B);
		this.convas.write("-- " + this.mode + " --");
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
			var status_line = win.buffer.name;
			if (win.buffer.set.modified) status_line += ' [+]';
			if (win.buffer.set.ro) status_line += '[RO]';
			var status_line = formatTextTwoSides(status_line,
					win.status_line, w);
			buf.write(status_line);
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
		if (ch == String.fromCharCode(27)) {
			this.is_cmd = false;
			this.cmd = '';
			this.repeat = '';
			this.render();
			return;
		}
		if (this.is_cmd)
			this.cmd += ch;
		else {
			if (/[1-9]/.test(ch)) this.repeat += ch;
			else if (this.repeat != '' && /[0-9]/.test(ch))
				this.repeat += ch;
			else {
				this.is_cmd = true;
				this.repeat = parseInt(this.repeat);
				this.cmd   += ch;
			}
		}

		for (var i in vim_cmds) {
			var result;
			if (result = vim_cmds[i].regex.exec(this.cmd)) {
				this.is_cmd = false;
				this.repeat = "";
				this.cmd    = "";
				vim_cmds[i].callback(this, result);
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
	else if (this.mode == 'INSERT') {
		if (ch == String.fromCharCode(27)){
			this.mode = 'NORMAL';
			this.win.moveCursor(-1, 0);
		}
		else this.win.input(ch);
	}

	this.render();
}


Vim.prototype.closeTab = function()
{
	if (this.tabs.length == 1) this.quit();
	else {
		this.tabs.splice(this.tab_id, 1);		// remove current tab
		this.tab_current_wins.splice(this.tab_id, 1);
		if (this.tab_id >= this.tabs.length)
			this.tab_id = this.tabs.length-1;
		this.win = this.tab_current_wins[this.tab_id];
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


Vim.prototype._error = function(errno, msg)
{
	this.err_msg = "E" + errno + ": " + msg;
}


Vim.prototype.execScript = function(script)
{
	if (script.indexOf('\n') != -1) {
		this._error(0, "TODO");
	}

	var result;

	if (result = /^((v)ne(w)?|new)$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[2] -> "v" or undefined
		 */
		this.win.split(result[2] == "v", false);
	}
	else if (result = /^(v)?sp(lit)?$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[1] -> "v" or undefined
		 */
		this.win.split(result[1] == "v", true);
	}
	else if (result = /^q(uit)?(!)?$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[2] -> "!" or undefined
		 */
		if (this.win.buffer.set.modified && !result[2])
			this._error(37,
					"No write since last change (add ! to override)");
		else this.win.close();
	}
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
			this._error(474, "Invalid argument: " + result[1]);
		else {
			if (result[2]) result[5] = false;
			else if (!result[5]) result[5] = true;
			if (this.win.set[result[3]] !== undefined)
				this.win.set[result[3]] = result[5];
			else if (this.win.buffer.set[result[3]] !== undefined)
				this.win.buffer.set[result[3]] = result[5];
			else this._error(474, "Invalid argument: " + result[1]);
		}
	}
	else if (script == "tabnew") {
		var tab = new VimWindow(this);
		this.tabs.splice(this.tab_id+1, 0, tab);
		this.tab_current_wins.splice(this.tab_id+1, 0, tab);
		this.tab_id++;
		this.win = tab;
	}
	else if (result = /^w(q)?(\s+([a-zA-Z0-9._\-]+))?$/.exec(script)) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[1] -> "q" or undefined
		 * 		[3] -> filename
		 */
		if (result[3]) this.win.buffer.name = result[3];
		if (this.win.buffer.name == '[No Name]') {
			this._error(32, "No file name");
			return;
		}
		var file = this.fs.open(this.win.buffer.name);
		if (file.constructor === String)
			file = this.fs.create(this.win.buffer.name);
		file.setData(this.win.buffer.lines.join('\n'));
		file.close();
		this.win.buffer.modified = false;
		if (result[1]) this.execScript("q");
	}
	else if (/^help\s+iccf$/.test(script)) {
		this.execScript("new");
		this.execScript("set nonu");
		this.win.buffer.setText(
				"Vim is Charityware.  You can use and copy it as much " +
				"as you like, but you are\n" +
				"encouraged to make a donation for needy children in " +
				"Uganda.  Please see visit\n" +
				"the ICCF web site, available at these URLs:\n\n" +
				"\thttp://iccf-holland.org/\n" +
				"\thttp://www.vim.org/iccf/\n" +
				"\thttp://www.iccf.nl/\n\n");
		this.win.buffer.name = "uganda.txt [Help]";
		this.win.buffer.set.ro = true;
	}
	else if (script == "vimjs")
		window.open("https://github.com/cjxgm/vimjs", "_blank");
	else if (script == "debug") this.win.buffer.lines.push("Hi!\x00");
	else this._error(492, "Not an editor command: " + script);
}

/**********************************************************************
 *
 * VimWindow: the viewport of buffers
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
	if (this.y < this.line_start) this.line_start = this.y;
	else if (this.y - this.line_start >= buffer.h)
		this.line_start += this.y - this.line_start - buffer.h + 1;
	var lineno_len = 0;
	if (this.set.nu) {
		lineno_len = this.buffer.lines.length.toString().length + 1;
		if (lineno_len < 4) lineno_len = 4;
	}

	var cpos = {x:0, y:0};

	var y=0;
	for (var i=this.line_start;
			i<this.buffer.lines.length && y<buffer.h; i++) {
		buffer.cursorTo(0, y);
		if (this.set.nu) {
			lineno = '';
			var spc = lineno_len - 1 - (i+1).toString().length;
			while (spc-- > 0) lineno += ' ';
			lineno += (i+1).toString();
			lineno += ' ';
			buffer.color = FG_H | FG_R | FG_G;
			buffer.write(lineno);
		}

		var t = this.buffer.lines[i].split('');
		buffer.color = FG_R | FG_G | FG_B;
		this.ix = 0;

		if (i == this.y && t.length == 0) 
			cpos = { x: buffer.x, y: buffer.y };

		for (var x=0; x<t.length; x++) {
			if (i == this.y) {
				if (x == this.x)
					cpos = { x: buffer.x, y: buffer.y };
				else if (this.vim.mode == 'INSERT' && t.length == this.x)
					cpos = { x: buffer.x+1, y: buffer.y };
				if (x < this.x)
					this.ix++;
			}
			buffer.write(t[x]);
		}
		y++;
	}
	for (; y<buffer.h; y++) {
		buffer.cursorTo(0, y);
		buffer.color = FG_H | FG_B;
		buffer.write("~");
	}

	buffer.cursorTo(cpos.x, cpos.y);

	this.status_line = formatTextLeft((this.y+1) + "," + (this.x+1), 14);
	this.status_line += formatTextLeft("All", 3);
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
		this.vim.tabs[this.vim.tab_id] = sp;
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

	if (this.y >= this.buffer.lines.length)
		this.y = this.buffer.lines.length-1;
	if (this.y < 0) this.y = 0;

	if (this.vim.mode == 'INSERT') {
		if (this.x > this.buffer.lines[this.y].length)
			this.x = this.buffer.lines[this.y].length;
	}
	else {
		if (this.x >= this.buffer.lines[this.y].length)
			this.x = this.buffer.lines[this.y].length-1;
	}
	if (this.x < 0) this.x = 0;
}


VimWindow.prototype.input = function(ch)
{
	if (ch == '\r') {
		this.buffer.insertNewLine(this.x, this.y);
		this.x = 0;
		this.moveCursor(0, 1);
	}
	else if (ch == '\b') {
		if (this.x != 0) {
			this.moveCursor(-1, 0);
			this.buffer.killChar(this.x, this.y);
		}
		else {
			this.buffer.killLine(this.y);
			this.moveCursor(0, -1);
			this.goEOL();
		}
	}
	else {
		this.buffer.insertCharAt(this.x, this.y, ch);
		this.moveCursor(1, 0);
	}
}


VimWindow.prototype.goBOL = function(skip_blank)
{
	this.x = 0;
	if (skip_blank) {
		var result = /^[ \t]+/.exec(this.buffer.lines[this.y]);
		if (result) this.moveCursor(result[0].length, 0);
	}
}


VimWindow.prototype.goEOL = function()
{
	this.x = this.buffer.lines[this.y].length-1;
	this.moveCursor(1, 0);
}


VimWindow.prototype.skipRegex = function(regex)
{
	var line = this.buffer.lines[this.y].slice(this.x);
	var result = regex.exec(line);
	if (result) result[0] = result[0].length;
	else result = [0];		// blank line

	this.x += result[0];
	if (this.x >= this.buffer.lines[this.y].length) {
		if (this.y == this.buffer.lines.length-1) {
			this.moveCursor(-1, 0);
			// and then beep...
		}
		else {
			this.x = 0;
			this.moveCursor(0, 1);
		}
	}
}


VimWindow.prototype.goWord = function()
{
	this.skipRegex(/^(([a-zA-Z0-9_]+|[^a-zA-Z0-9_. ]+|\.)? *)/);
}


VimWindow.prototype.goToken = function()
{
	this.skipRegex(/^([^ ]* *)/);
}


VimWindow.prototype.newLineAfter = function(ch)
{
	this.buffer.newLine(this.y+1);
	this.moveCursor(0, 1);
}


VimWindow.prototype.newLineBefore = function(ch)
{
	this.buffer.newLine(this.y);
	this.moveCursor(0, 0);	// this is a must; for adapting cursor pos
}


VimWindow.prototype.killChar = function()
{
	this.buffer.killChar(this.x, this.y);
	this.moveCursor(0, 0);	// this is a must; for adapting cursor pos
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
		else this.vim.tabs[this.vim.tab_id] = this.vim.win;
		this.vim.win.pa = undefined;
	}

	this.vim.tab_current_wins[this.vim.tab_id] = this.vim.win;
}

/**********************************************************************
 *
 * VimBuffer: process and store texts
 *
 */

function VimBuffer(vim, text, name)
{
	this.vim = vim;
	this.setText(text);
	this.name = (name ? name : "[No Name]");
	this.set = {
		ro: false,
		modified: false
	};
}


VimBuffer.prototype.setText = function(text)
{
	this.lines = text.split('\n');
	if (!this.lines.length) this.lines[0] = "";
}


VimBuffer.prototype.insertCharAt = function(x, y, ch)
{
	this.set.modified = true;

	var line = this.lines[y];
	this.lines[y] = line.slice(0, x) + ch + line.slice(x);
}


VimBuffer.prototype.newLine = function(y)
{
	this.set.modified = true;

	this.lines.splice(y, 0, '');
}


VimBuffer.prototype.insertNewLine = function(x, y)
{
	this.set.modified = true;

	var newline = this.lines[y].slice(x);
	this.lines[y] = this.lines[y].slice(0, x);
	this.lines.splice(y+1, 0, newline);
}


VimBuffer.prototype.killChar = function(x, y)
{
	this.set.modified = true;

	var line = this.lines[y];
	this.lines[y] = line.slice(0, x) + line.slice(x+1);
}


VimBuffer.prototype.killLine = function(y)
{
	this.set.modified = true;

	this.lines.splice(y, 1);
	if (this.lines.length == 0)
		this.lines[0] = '';
}

