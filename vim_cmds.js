
/**** vim_cmds.js *****************************************************
 * Vim Commands: The command set of vim
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

var vim_cmds = [];

vim_cmds.push({
	regex: /:/,
	callback: function(vim) {
		vim.cmd  = "";
		vim.mode = 'CMDLINE';
	}
});

vim_cmds.push({
	regex: /h/,
	callback: function(vim) {
		vim.win.moveCursor(-1, 0);
	}
});

vim_cmds.push({
	regex: /l/,
	callback: function(vim) {
		vim.win.moveCursor(+1, 0);
	}
});

vim_cmds.push({
	regex: /j/,
	callback: function(vim) {
		vim.win.moveCursor(0, +1);
	}
});

vim_cmds.push({
	regex: /k/,
	callback: function(vim) {
		vim.win.moveCursor(0, -1);
	}
});

