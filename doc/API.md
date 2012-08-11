# Vim.js Components' Public API Document
Written by eXerigumo Clanjor (哆啦比猫/兰威举)<br>

## License
This document is licensed under the terms of<br>
`Creative Commons Attribution (CC-BY) 3.0`.<br>
Copyright (C) eXerigumo Clanjor (哆啦比猫/兰威举), 2010-2012.

## Abstract
This document will explain the public API of each component in vim.js.

## Conventions
## API Document
### convas.js
> Constants

	>> Color Constants

		FG_H		Foreground Color Highlight
		FG_R		Foreground Color Red
		FG_G		Foreground Color Green
		FG_B		Foreground Color Blue

		BG_H		Background Color Highlight
		BG_R		Background Color Red
		BG_G		Background Color Green
		BG_B		Background Color Blue

#### Convas(String id, int w, int h, int font\_size)
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


#### void Convas.refresh()
Redraw the whole console, ans reset the timer for splashing cursor.

> NOTE

Do *NOT* use this on your own, it will be *REALLY SLOW*!


<!-- vim: ft=markdown noet sts=0 ts=4 sw=4
-->
