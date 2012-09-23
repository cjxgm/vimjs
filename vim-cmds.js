
/**** vim-cmds.js *****************************************************
 * Vim Commands: The command set of vim
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

var vim_cmds = [];


// mode switching
vim_cmds.push({
	regex: /:/,
	callback: function(vim) {
		vim.mode = 'CMDLINE';
	}
});

vim_cmds.push({
	regex: /i/,
	callback: function(vim) {
		vim.mode = 'INSERT';
	}
});

vim_cmds.push({
	regex: /a/,
	callback: function(vim) {
		vim.win.moveCursor(1, 0);
		vim.mode = 'INSERT';
	}
});

vim_cmds.push({
	regex: /o/,
	callback: function(vim) {
		vim.win.newLineAfter();
		vim.mode = 'INSERT';
	}
});

vim_cmds.push({
	regex: /O/,
	callback: function(vim) {
		vim.win.newLineBefore();
		vim.mode = 'INSERT';
	}
});


// navigation
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

vim_cmds.push({
	regex: /g([tT])/,
	callback: function(vim, result) {
		/* result:
		 * 		[0] -> the whole string
		 * 		[1] -> "t" or "T"
		 */
		vim.tab_id += vim.tabs.length + (result[1] == "t" ? 1 : -1);
		vim.tab_id %= vim.tabs.length;
		vim.win = vim.tab_current_wins[vim.tab_id];
	}
});

