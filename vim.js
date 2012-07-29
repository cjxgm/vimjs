
/* vim.js
	Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
	Under GPLv2. ABSOLUTELY NO WARRANTY!
*/

function Vim(console, fs)
{
	this.console = console;
	this.fs      = fs;
	this.buffers = [ new VimBuffer(this, 0, 0, this.console.w, this.console.h-1) ];
	// TODO: Multi-buffer...
}

Vim.prototype.loadText = function(text) {
	this.buffers[0].lines = text.split('\n');
	this.buffers[0].buildBuffers();
	
	this.console.cursorTo(0, this.console.h-1);
	this.console.text_buf.write("-- NORMAL --");
	this.buffers[0].redraw();
	
	this.console.refresh();
};

function VimBuffer(vim, x, y, w, h)
{
	this.vim = vim;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.cursor_x = this.cursor_y = 0;
	
	this.lines = [''];
	this.buildBuffers();
}

VimBuffer.prototype.buildBuffers = function() {
	var lw = this.lines.length.toString().length + 1;
	if (lw < 4) lw = 4;
	var lh = 0;
	var restw = this.w - lw;
	for (var t in this.lines) lh += parseInt(this.lines[t].length / restw) + 1;
	this.lineno_buf = new ConsoleBuffer(lw, lh);
	this.text_buf   = new ConsoleBuffer(restw, this.h);
	
	// draw text
	var text = this.lines.join('\n');
	this.text_buf.cursorTo(0, 0);
	this.text_buf.write(text);
	
	// draw lineno
	this.lineno_buf.color = FG_R | FG_G;
	for (var i=1, y=0; i<=this.lines.length; i++, y++) {
		this.lineno_buf.cursorTo(lw - i.toString().length - 1, y);
		this.lineno_buf.write(i.toString());
		y += parseInt(this.lines[i-1].length / restw);
	}
};

VimBuffer.prototype.redraw = function() {
	this.text_buf.blitToConsole(this.vim.console, this.x+this.lineno_buf.w, this.y,
													this.text_buf.w, this.h);
	this.lineno_buf.blitToConsole(this.vim.console, this.x, this.y,
													this.lineno_buf.w, this.h);
	
	this.vim.console.cursorTo(this.cursor_x + this.x + this.lineno_buf.w,
							  this.cursor_y + this.y);
};