
/**** convas.js *******************************************************
 * CONsole canVAS: A UNIX console implementation using HTML5 <canvas>
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

/**********************************************************************
 *
 * Color Constants
 *
 */

// FG: Fourground		BG: Background
// H, R, G and B stand respectively for: Highlight, Red, Green, Blue
var BG_H = (1 << 7);
var BG_R = (1 << 6);
var BG_G = (1 << 5);
var BG_B = (1 << 4);

var FG_H = (1 << 3);
var FG_R = (1 << 2);
var FG_G = (1 << 1);
var FG_B = (1 << 0);

/**********************************************************************
 *
 * Convas: the console canvas
 *
 */

function Convas(id, w, h, font_size)
{
	this.id = "______convas_" + id;
	this.w = w;
	this.h = h;
	this.font_size = font_size;
	this.setFontName("文泉驿等宽微米黑");	// default font

	// create canvas and initialize it
	document.write("<canvas id='" + this.id
			+ "' width=" + parseInt(w * font_size / 2)
			+ " height=" + parseInt(h * font_size)
			+ " style='cursor: text; border: solid #0f0 1px;'>"
			+ "Sorry!</canvas>");
	this.canvas = eval(this.id);
	this.c = this.canvas.getContext("2d");
	this.c.textAlign = "left";

	// create front buffer
	this.buffer = new ConvasBuffer(w, h);
}


Convas.prototype.setFontName = function(font_name)
{
	this.font_name = font_name;
	this.font = this.font_size + "px " + font_name;
}


Convas.prototype.refresh()
{
	// Clear to black!
	this.c.fillStyle = "#000";
	this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

	// draw each character
	for (var y=0; y<this.h; y++) {
		for (var x=0; x<this.w; x++) {
			var clr = this.buffer.getColorAt(x, y),
				chr = this.buffer.getCharAt (x, y);
			this._drawRect(x, y, new Color(clr >>    4)     );
			this._drawChar(x, y, new Color(clr  & 0x0F), chr);
		}
	}
}


Convas.prototype._drawRect = function(x, y, clr)
{
	this.c.fillStyle = '' + clr;	// convert color to string
	this.c.fillRect(x * this.font_size / 2,
			y * this.font_size,
			this.font_size / 2,
			this.font_size);
}


Convas.prototype._drawChar = function(x, y, clr, chr)
{
	this.c.fillStyle = '' + clr;	// convert color to string
	this.c.font = (clr.h ? "bold " : "") + this.font;
	this.c.fillText(chr,
			x * this.font_size / 2,
			(y + 1) * this.font_size);
}


/**********************************************************************
 *
 * ConvasBuffer: the console buffer like windows in ncurses
 *
 */

function ConvasBuffer(w, h)
{
	this.w = w;
	this.h = h;

	this.reset();
}


// reset cursor position, reset color to white and reset the buffer
// into blanks.
ConvasBuffer.prototype.reset = function()
{
	this.x = 0;
	this.y = 0;
	this.color  = FG_R | FG_G | FG_B;

	this.buffer = new Array(this.w * this.h);
	for (var i=0; i<this.w*this.h; i++)
		this.buffer[i] = [this.color, ' '];
}


ConvasBuffer.prototype.getColorAt = function(x, y)
{
	return this.buffer[y*this.w + x][0];
}


ConvasBuffer.prototype.setColorAt = function(x, y, clr)
{
	this.buffer[y*this.w + x][0] = clr;
}


ConvasBuffer.prototype.getCharAt = function(x, y)
{
	return this.buffer[y*this.w + x][1];
}


ConvasBuffer.prototype.setCharAt = function(x, y, chr)
{
	this.buffer[y*this.w + x][1] = chr;
}


// move cursor to the specific position, assuming the cursor is in the box.
ConvasBuffer.prototype.cursorTo = function(x, y)
{
	this.x = (x < 0 ? 0 : (x >= this.w ? this.w-1 : x));
	this.y = (y < 0 ? 0 : (y >= this.h ? this.h-1 : y));
}


// advance the cursor. when arriving right edge, move to the next line.
ConvasBuffer.prototype.advanceCursor = function()
{
	if (++this.x == this.w) {
		this,x = 0;
		if (++this.y == this.h)
			this.y--;
	}
}


// put char at the cursor, advancing the cursor if no_advancing_cursor
// is set to false. THIS WON'T DEAL WITH SPECIAL CHARACTERS(e.g. '\n')!
ConvasBuffer.prototype.putChar = function(ch, no_advancing_cursor)
{
	this.buffer[this.y*this.w + this.x] = [this.color, ch];
	if (!no_advancing_cursor)
		this.advanceCursor();
}


ConvasBuffer.prototype.putCharAt = function(ch, x, y)
{
	this.cursorTo(x, y);
	this.buffer[this.y*this.w + this.x] = [this.color, ch];
	// do not advance cursor here!
}


// copy the specific rectangular area of the buffer to the other buffer.
ConvasBuffer.prototype.copyTo = function(
		buf2,				// the other buffer
		x0, y0, w0, h0,		// the rectangular area
		x1, y1)				// the destination position
{
	for (var y=y0; y<y0+h0; y++) {
		var y2 = y - y0 + y1;
		if (y2 >= buf2.h) break;

		for (var x=x0; x<x0+w0; x++) {
			var x2 = x - x0 + x1;
			if (x2 >= buf2.w) break;

			buf2.buffer[y2*buf2.w + x2] =
					this.buffer[y*this.w + x].slice();
		}
	}
}


ConvasBuffer.prototype.newLine = function()
{
	//this.putChar('\n', "no advancing cursor");
	this.x = 0;
	if (++this.y == this.h)
		this.y--;
}


// write a string into the buffer, dealing with special
// characters (e.g. '\n').
ConvasBuffer.prototype.write = function(text)
{
	for (var i=0; i<text.length; i++) {
		if (text[i] == '\n') this.newLine();
		// TODO: '\t'
		else this.putChar(text[i]);
	}
}


ConvasBuffer.prototype.toString = function()
{
	var s = "chars:\n";
	for (var y=0; y<this.h; y++) {
		for (var x=0; x<this.w; x++)
			s += this.buffer[y*this.w+x][1];
		s += '\n';
	}

	s += "\ncolors:\n";
	for (var y=0; y<this.h; y++) {
		for (var x=0; x<this.w; x++)
			s += '' + this.buffer[y*this.w+x][0];
		s += '\n';
	}

	return s;
}

