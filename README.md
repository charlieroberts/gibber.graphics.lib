gibber.graphics.lib
==========

This library provides the 2D and 3D graphics capabilities of Gibber.

## Building (for development)

You can simply download the repo and skip straight to the usage section if you don't need to modify the library. If you want to modify gibber.lib, here's how to build it:

1. If you don't have it, install npm (the node.js package manager) from http://npmjs.org
2. Inside the top level of the repo, run `npm install` in the terminal.
3. Run `gulp`. This is a build module that is installed in step 2.

The build outputs a two UMD file, gibber.graphics.lib.js and gibber.graphics.lib.min.js.

## Usage
The library can be used with plain script tags, CommonJS or AMD style includes. Below is an example HTML file that plays a simple drum beat, bass line, and random melody.

```html
<html>

<head>
  <script src='build/gibber.graphics.lib.js'></script>
</head>

<body></body>

<script>
Gibber.init() // REQUIRED!

a = Gibber.Graphics.Geometry.Cube()
a.spin(.0005)
</script>

</html>
```

If you want to use CommonJS (node or browserify), just use the following to start things off (assuming you have the module installed):

```js
Gibber = require( 'gibber.graphics.lib' )
Gibber.init()
Gibber.Graphics.init()
``` 