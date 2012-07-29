
/* console.js
	Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
	Under GPLv2. ABSOLUTELY NO WARRANTY!
*/

// colors
var BG_H = (1 << 7);
var BG_R = (1 << 6);
var BG_G = (1 << 5);
var BG_B = (1 << 4);

var FG_H = (1 << 3);
var FG_R = (1 << 2);
var FG_G = (1 << 1);
var FG_B = (1 << 0);

function Console(id, font_name, font_size, w, h)
{
	this.id = "______console_" + id;
	this.font = font_size + "px " + font_name;
	this.font_size = font_size;
	this.w = w;
	this.h = h;
	this.adjust_y = 0;
	
	// Internal Variable
	this._show_cursor = false;
	
	// Init canvas
	document.write("<canvas id='" + this.id
					+ "' width=" + parseInt(w * font_size / 2)
					+ " height=" + (h * font_size)
					+ " style='cursor: text; border: solid #0f0 1px;'>Sorry!</canvas>");
	this.canvas = eval(this.id);
	this.c = this.canvas.getContext("2d");
	this.text_buf = new ConsoleBuffer(this.w, this.h);
	
	Console.prototype.setColor = function(color) {
		this.text_buf.color = color;
	};

	Console.prototype.cursorTo = function(x, y) {
		this.text_buf.cursorTo(x, y);
	};
	
	Console.prototype.putChar = function(ch) {
		this.text_buf.putChar(ch);
	}
	
	Console.prototype.putCharAt = function(ch, x, y) {
		this.cursorTo(x, y);
		this.putChar(ch);
	}
	
	Console.prototype.clear = function(x, y, w, h) {
		(new ConsoleBuffer(w, h)).blitToConsole(this, x, y, w, h);
	};
	
	Console.prototype.reset = function() {
		this.text_buf.reset();
	}
	
	Console.prototype._parseFgColor = function(clr) {
		var full_color, r, g, b;
		full_color = 192 + 63 * ((clr >> 3) & 1);
		r = full_color * ((clr >> 2) & 1);
		g = full_color * ((clr >> 1) & 1);
		b = full_color * ((clr >> 0) & 1);
		return "RGB(" + r + "," + g + "," + b + ")";
	};
	
	Console.prototype._parseBgColor = function(clr) {
		var full_color, r, g, b;
		full_color = 192 + 63 * ((clr >> 7) & 1);
		r = full_color * ((clr >> 6) & 1);
		g = full_color * ((clr >> 5) & 1);
		b = full_color * ((clr >> 4) & 1);
		return "RGB(" + r + "," + g + "," + b + ")";
	};
	
	Console.prototype.refresh = function() {
		// Clear to black!
		this.c.fillStyle = "#000";
		this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.c.textAlign = "left";

		for (var y=0; y<this.h; y++) {
			for (var x=0; x<this.w; x++) {
				var clr = this.text_buf.buffer[y*this.w+x][0];
				this._drawRect(x, y, this._parseBgColor(clr));
				this._drawChar(x, y, this._parseFgColor(clr));
			}
		}
	}
	
	Console.prototype._drawRect = function(x, y, clr) {
		this.c.fillStyle = clr;
		this.c.fillRect(x * this.font_size / 2,
				y * this.font_size,
				this.font_size / 2,
				this.font_size);
	}
	
	Console.prototype._drawChar = function(x, y) {
		var t = this.text_buf.buffer[y*this.w+x];
		this.c.fillStyle = this._parseFgColor(t[0]);
		this.c.font = ((t[0]>>3)&1 ? "bold " : "") + this.font;
		this.c.fillText(t[1][0], x * this.font_size / 2,
				(y + 1) * this.font_size + this.adjust_y);
	}
	
	Console.prototype._splashCursor = function(t) {
		var x = this.text_buf.x;
		var y = this.text_buf.y;
		var t = this.text_buf.buffer[y*this.w+x];

		if (this._show_cursor = !this._show_cursor) {
			var clr = ((t[0] & 0x0F | FG_H) << 4) | ((t[0] >> 4) & 0x07);	// swap fg/bg color
			this._drawRect(x, y, this._parseBgColor(clr));
			this._drawChar(x, y, this._parseFgColor(clr));
		}
		else {
			this._drawRect(x, y, '#000');
			this._drawChar(x, y, this._parseFgColor(t[0]));
		}
	}
	
	var t = this;
	setInterval(function(){t._splashCursor();}, 500);
	this.refresh();
	
	Console.prototype.addKeyHandler = function(func) {
		document.addEventListener("keypress", func, true);
	}
}

function ConsoleBuffer(w, h)
{
	this.w = w;
	this.h = h;

	ConsoleBuffer.prototype.reset = function() {
		this.x = 0;
		this.y = 0;
		this.color  = FG_R | FG_G | FG_B;

		this.buffer = new Array(this.w * this.h);
		for (var i=0; i<this.w*this.h; i++)
			this.buffer[i] = [this.color, ' '];
	};
	
	this.reset();
	
	ConsoleBuffer.prototype.cursorTo = function(x, y) {
		this.x = (x < 0 ? 0 : (x >= this.w ? this.w-1 : x));
		this.y = (y < 0 ? 0 : (y >= this.h ? this.h-1 : y));
	};
	
	ConsoleBuffer.prototype.putChar = function(ch) {
		this.buffer[this.y*this.w + this.x] = [this.color, ch];
	};
	
	ConsoleBuffer.prototype.putCharAt = function(ch, x, y) {
		this.cursorTo(x, y);
		this.buffer[this.y*this.w + this.x] = [this.color, ch];
	};
	
	ConsoleBuffer.prototype.blitTo = function(buffer2, x, y, w, h) {
		if (w > this.w) w = this.w;
		if (h > this.h) h = this.h;
		if (x + w > buffer2.w) w = buffer2.w - x;
		if (y + h > buffer2.h) h = buffer2.h - y;
		for (var y1=0; y1<h; y1++) {
			if (y1+y < 0) continue;
			for (var x1=0; x1<w; x1++) {
				if (x1+x < 0) continue;
				buffer2.buffer[(y+y1)*buffer2.w + x + x1] = 
						this.buffer[y1*this.w + x1].slice();
			}
		}
	};
	
	ConsoleBuffer.prototype.blitToConsole = function(console, x, y, w, h) {
		this.blitTo(console.text_buf, x, y, w, h);
	};
	
	ConsoleBuffer.prototype.write = function(text) {
		var idx = this.y * this.w + this.x;
		var max = this.w * this.h;
		for (i=0; i<text.length && idx < max; i++) {
			if (text[i] == '\n')
				idx = (parseInt(idx / this.w) + 1) * this.w;
			else this.buffer[idx++] = [this.color, text[i]];
		}
	};
}

