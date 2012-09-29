
/**** vim-cmds.js *****************************************************
 * Vim Commands: The command set of vim
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

var vim_cmds = [];


// mode switching
vim_cmds.push({
	regex: /^:$/,
	callback: function(vim) {
		vim.mode = 'CMDLINE';
	}
});

vim_cmds.push({
	regex: /^i$/,
	callback: function(vim) {
		vim.mode = 'INSERT';
	}
});

vim_cmds.push({
	regex: /^I$/,
	callback: function(vim) {
		vim.win.goBOL();
		vim.mode = 'INSERT';
	}
});

vim_cmds.push({
	regex: /^a$/,
	callback: function(vim) {
		vim.mode = 'INSERT';
		vim.win.moveCursor(1, 0);
	}
});

vim_cmds.push({
	regex: /^A$/,
	callback: function(vim) {
		vim.mode = 'INSERT';
		vim.win.goEOL();
	}
});

vim_cmds.push({
	regex: /^o$/,
	callback: function(vim) {
		vim.win.newLineAfter();
		vim.mode = 'INSERT';
	}
});

vim_cmds.push({
	regex: /^O$/,
	callback: function(vim) {
		vim.win.newLineBefore();
		vim.mode = 'INSERT';
	}
});


// navigation
vim_cmds.push({
	regex: /^h$/,
	callback: function(vim) {
		vim.win.moveCursor(-1, 0);
	}
});

vim_cmds.push({
	regex: /^l$/,
	callback: function(vim) {
		vim.win.moveCursor(+1, 0);
	}
});

vim_cmds.push({
	regex: /^j$/,
	callback: function(vim) {
		vim.win.moveCursor(0, +1);
	}
});

vim_cmds.push({
	regex: /^k$/,
	callback: function(vim) {
		vim.win.moveCursor(0, -1);
	}
});

vim_cmds.push({
	regex: /^\^$/,
	callback: function(vim) {
		vim.win.goBOL(true);
	}
});

vim_cmds.push({
	regex: /^0$/,
	callback: function(vim) {
		vim.win.goBOL();
	}
});

vim_cmds.push({
	regex: /^\$$/,
	callback: function(vim) {
		vim.win.goEOL();
	}
});

vim_cmds.push({
	regex: /^g([tT])$/,
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

vim_cmds.push({
	regex: /^w$/,
	callback: function(vim) {
		vim.win.goWord();
	}
});

vim_cmds.push({
	regex: /^W$/,
	callback: function(vim) {
		vim.win.goToken();
	}
});


// editing
vim_cmds.push({
	regex: /^x$/,
	callback: function(vim) {
		vim.win.killChar();
	}
});

vim_cmds.push({
	regex: /^dd$/,
	callback: function(vim) {
		vim.win.buffer.killLine(vim.win.y);
		vim.win.moveCursor(0, 0);
	}
});

