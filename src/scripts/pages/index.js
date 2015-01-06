/* global io */

var Pong = require('../elements/pong.es6').Pong;
var Lobby = require('../elements/lobby.es6').Lobby;

var
  win = window,
  doc = document,
  math = Math;

window.onload = function() {
  var
    _io = io(),
    canvas = doc.querySelector('canvas'),
    ctx;

  var lobby = new Lobby(_io);

  _io.on('game:ready', function() {
    /* Triggering a resize event for the initial canvas setup */
    lobby.hide();
    ctx = canvas.getContext('2d');
    canvas.width = math.max(win.innerWidth, win.innerHeight);
    canvas.height = math.min(win.innerWidth, win.innerHeight);
    var p = new Pong(_io, ctx);
    p.draw();
  });

};
