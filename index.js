
/**** index.js ********************************************************
 * index: user login and create vimjs
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

var convas = new Convas("vimjs", 80, 24, 16);
var vim;

(function userLogin(){
	 convas.write("Welcome to vim.js!\n", true);
	 convas.write("You can login with \"local\"" +
			 " for local use.\n\n", true);
	 convas.write("login: ", true);
	 convas.readLine(true, function(login){
		 if (login == "local") vim = new Vim(convas, userLogin);
		 else {
			 convas.write("Password: ", true);
			 convas.readLine(false, function(password){
				 convas.write("\nLogin incorrect\n\n", true);
				 userLogin();
			 });
		 }
	 });
})();

