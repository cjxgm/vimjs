
/**** util.js *********************************************************
 * utility: An utility library.
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

/**********************************************************************
 *
 * ColorRGB: RGB color container
 *
 */

// parameters is either <r, g, b> or <r, g, b, h> or <binary_color_code>.
function Color(r, g, b, h)
{
	if (r && g && b) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.h = h;
	}
	else {
		var full_color = 192 + 63 * ((r >> 3) & 1);
		this.r = full_color * ((r >> 2) & 1);
		this.g = full_color * ((r >> 1) & 1);
		this.b = full_color * ( r       & 1);
		this.h = (r >> 3) & 1;
	}
}

Color.prototype.toString = function()
{
	return "RGB(" + this.r + ", " + this.g + ", " + this.b + ")";
}

