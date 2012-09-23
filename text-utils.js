
/**** text-utils.js ***************************************************
 * Text Utilities: text formater, etc.
 *
 * Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2012.
 * Under GPLv2. ABSOLUTELY NO WARRANTY!
 **********************************************************************/

function formatTextLeft(text, width)
{
	text = text.slice(0, width);
	while (text.length < width) text += ' ';
	return text;
}


function formatTextRight(text, width)
{
	text = text.slice(0, width);
	while (text.length < width) text = ' ' + text;
	return text;
}


function formatTextTwoSides(left, right, width)
{
	return left + formatTextRight(right, width-left.length);
}

