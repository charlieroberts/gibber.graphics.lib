gibber.graphics.lib
==========

This library provides the 3D graphics capabilities of Gibber. It currently only exists to be (optionally) included when building Gibber's main library; however, in the past it has been standalone and we hope to get it to that point again soon.

This library is primarily a thin set of wrappers around [marching.js](https://charlieroberts.github.com/marching), a 3D ray marching / constructive solid geometry library. The wrappers provide a unified set of commands for sequencing / scheduling changes to the graphics library.
