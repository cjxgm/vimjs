# Vim.js Components' Public API Document
Written by eXerigumo Clanjor (哆啦比猫/兰威举)<br>


## License
This document is licensed under the terms of<br>
`Creative Commons Attribution (CC-BY) 3.0`.<br>
Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.


## Abstract
This document will explain the public API of each component in vim.js.


## Conventions
This document is organized like this:

### file.js
> Constants

	// some constants

Other explanation.


> Properties

	// accessible properties

Other explanation.


#### Object(type1 param1, type2 param2)
EXPLAIN


#### return\_type Object.method(type1 param1, type2 param2)
EXPLAIN


## Conventions: About the EXPLAIN
EXPLAIN will be like this:


Explanation of the Object or method.


> RETURN

Return value explanation.


> param1

Param1 explanation.


> param2, param3

Explanation of the pair of relative parameters (param2 and param3).


> NOTE

Some notes to the method.


> EXAMPLE

Example of the method.


> OTHER...

Other explanations.


## API Document

### convas.js
> Constants

	// Color Constants

	FG_H		Foreground Color Highlight
	FG_R		Foreground Color Red
	FG_G		Foreground Color Green
	FG_B		Foreground Color Blue

	BG_H		Background Color Highlight
	BG_R		Background Color Red
	BG_G		Background Color Green
	BG_B		Background Color Blue

For more details about color, see `setColor` method.


#### Convas(string id, int w, int h, int font\_size)
You can create a new convas by
```javascript
var convas = new Conavs("blah", 80, 24, 11);
```


> id

A Unique ID. Will be used as the DOM ID of the canvas of convas,
prefixed with "\_\_\_\_\_\_convas\_". For example, if id="vim",
then the DOM ID will be "\_\_\_\_\_\_convas\_vim"


> w, h

The console will be WxH character sized. For example, if w=8 and h=2,
the terminal will be a 8x2 one, which has 8 characters per line with
2 lines.


> font\_size

Font size preferred to use.


> NOTE

The font is currently `WenQuanYi MicroHei Mono (文泉驿等宽微米黑)`.
It can *NOT* be changed without modifying the source for now.

The color scheme is currently `XTerm` (the same as that in GNOME Terminal).
It can *NOT* be changed without modifying the source for now.


#### void Convas.refresh()
Redraw the whole console, ans reset the timer for splashing cursor.

> NOTE

Do *NOT* use this on your own, it will be *REALLY SLOW*!


#### void Convas.readKey(bool is\_echo, (function fn(key\_code)))
Wait a key press. When a key hit, the function fn will be called.


> is_echo

Write the pressed key char into the console or not.


> fn

The call back function


> EXAMPLE

```javascript
// Will repeatedly read what user typed and show it with alert.
convas.readKey(false, function fn(key_code) {	// no echo
	var ch = String.fromCharCode(key_code);
	alert("You pressed " + ch + "!");
	convas.readKey(false, fn);
});
```


#### void Convas.readLine(bool is\_echo, (function fn(line)))
Wait the user to input a line.
When `ENTER` key pressed, the function fn will be called.


> is_echo

Write the pressed key char into the console or not.


> fn

The call back function


> EXAMPLE

```javascript
// Will repeatedly read what user typed and show it with alert.
// One line at a time.
convas.readLine(true, function fn(line) {
	alert("You input `" + line + "'!");
	convas.readLine(false, fn);
});
```


#### void Convas.putChar(char ch)
Put a char into the console above the cursor, and advance the cursor.


> ch

Char to put.


> NOTE

Do *NOT* put a string! Use `write` instead if you want to put a string.
This function regards `\n` as the only new line character. Do *NOT*
use `\r`!


#### void Convas.write(string text)
Write a string into the console at the cursor, advancing the cursor.


> text

String to write.


> NOTE

This function calls `putChar` to write each character, so it receives
`\n`.


#### void Convas.cursorTo(int x, int y)
Move cursor to a specific position (specified by x and y).


> x, y

The coordinate that the cursor will be moved to.
The 2 values are clamped to [0, convas width) and [0, convas height),
perspectively.


#### ({int x, int y}) Convas.getCursorPos()
Get the cursor position. Both x and y at the same time.


> RETURN

The cursor position, in object, { x: 0, y: 0 } for example.


#### void Convas.setCursorPos(({int x, int y}) pos)
Set the cursor position. Both x and y at the same time.

> pos

Position to set to, in object, { x: 0, y: 0 } for example.


#### void Convas.clear()
Clear the console to blank.


#### void Convas.setColor(uint8\_t clr)
Set the color to `clr`, then the following `write` function calls will use
that color.


> clr

The color to set. You'd better use the color constants. For example,
`FG_R` for foreground red, `FG_R|FG_G` for foreground yellow, and
`FG_R|BG_H|BG_B` for foreground red with background highlighted blue.


> DETAILS ABOUT THE COLOR

The color is in fact a uint8\_t. In le-encoded system, it looks like this:

	7 6 5 4    3 2 1 0
	| | | |    | | | `-- R `
	| | | |    | | `---- G | Foreground
	| | | |    | `------ B | Color
	| | | |    `-------- H /
	| | | |
	| | | `------------- R `
	| | `--------------- G | Background
	| `----------------- B | Color
	`------------------- H /


<!-- vim: ft=markdown noet sts=0 ts=4 sw=4
-->
