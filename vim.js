
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

	this.convas.setColor(FG_H|FG_B);
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

	// debug
	var me = this;
	me.convas.readKey(false, function fn(key) {
		var ch = String.fromCharCode(key);
		switch (ch) {
			case 'h':
				me.convas.cursorTo(me.convas.buffer.x - 1,
								me.convas.buffer.y);
				break;
			case 'l':
				me.convas.cursorTo(me.convas.buffer.x + 1,
								me.convas.buffer.y);
				break;
			case 'j':
				me.convas.cursorTo(me.convas.buffer.x,
								me.convas.buffer.y + 1);
				break;
			case 'k':
				me.convas.cursorTo(me.convas.buffer.x,
								me.convas.buffer.y - 1);
				break;
		}
		me.convas.readKey(false, fn);
	});
}

