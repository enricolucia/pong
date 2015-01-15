// configuration of express app for
//   handlebars and static content

var
  fs = require('fs'),
  express = require('express'),
  exHb  = require('express-handlebars'),
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http),

  tokenizer = new (require('hashids'))(
      'Geeno was here!', 5, 'ABCDEFGHIJKLMNPQRSTUVWXYZ'),

  // inheritance hack
  // FIXME should be a WeakMap
  PARTIALS = {},

  // helpers dict
  helpers = require('./handlebars.helpers.js'),
  handler, tpl, fetchJson;

module.exports = http;


// Extending custom helpers with Handlebars.java specific ones
helpers.precompile = function() {
  // Do absolute nothing.
};
helpers.partial = function(partialName, partialObj) {
  PARTIALS[partialName] = partialObj.fn;
};
helpers.block = function(blockName, blockObj) {
  var json = fetchJson(blockName);
  for (var k in json) {
    if (json.hasOwnProperty(k)) {
      blockObj.data.root[k] = json[k];
    }
  }
  if (blockName in PARTIALS) {
    return PARTIALS[blockName](blockObj.data.root);
  }
  return blockObj.fn(blockObj.data.root);
};


// serve static files
app.use(express.static('public'));

tpl = exHb.create({
  defaultLayout: 'mainlayout',
  extname: '.hbs',
  layoutsDir: 'views/',
  partialsDir: 'views/',
  helpers: helpers
});

// set templates location
app.engine('.hbs', tpl.engine);
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views/');


fetchJson = function(id) {
  var json;
  try {
    json = JSON.parse(fs.readFileSync(
      app.get('views') + id + '.json',
      'utf-8'
    ));
  } catch (e) {
    json = {};
  } finally {
    return json;
  }
};

// all requests handler
handler = function(req, res) {
  var json = fetchJson(req.params.template);
  res.render(req.params.template, json);
};


app.param(function(name, fn) {
  if (fn instanceof RegExp) {
    return function(req, res, next, val) {
      var captures;
      if ((captures = fn.exec(String(val)))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    };
  }
});
// Needed to suppress .ico and other files with extension failure messages.
app.param('template', /^\w+$/);
app.get('/:template', handler);

// default index handler
app.get('/', function(req) {
  req.params.template = 'index';
  handler.apply(null, arguments);
});


var sessions = {};

/* Socket */
io.on('connection', function(socket) {
  socket.on('pong:ball-info', function(data) {
    var opponent = socket.playerType === 'host' ? 'guest' : 'host';
    sessions[socket.sessionId][opponent].emit('pong:ball-coming', data);
  });
  socket.on('pong:opponent-info', function(/*data*/) {
    // console.log(data);
  });

  socket.on('pong:goal', function(data) {
    var opponent = socket.playerType === 'host' ? 'guest' : 'host';
    sessions[socket.sessionId][opponent].emit('pong:goal-scored', data);
  });


  /* Lobby communications */
  socket.emit('game:player-connected');

  socket.on('player:create-session', function(data) {
    var d = new Date();
    var token = tokenizer.encode(parseInt('1' +
        d.getMinutes() + '' + d.getSeconds()));
    socket.playerType = 'host';
    socket.sessionId = token;
    sessions[token] = {};
    sessions[token].host = socket;
    sessions[token].host.canvas = data;
    socket.emit('game:token-created', {
      token: token
    });

    socket.on('disconnect', function () {
      playerLeft(sessions[socket.sessionId]['guest']);
    });

  });

  function playerLeft (player) {
    console.log(player);
    var data = {
      message: 'Opponent left pong!'
    };
    player.emit('pong:player-left', data.message);
  };

  socket.on('player:joining', function(data) {
    if (sessions[data.token]) {
      socket.playerType = 'guest';
      socket.sessionId = data.token;
      sessions[data.token].guest = socket;
      sessions[data.token].guest.canvas = data.canvasOpponent;
      socket.emit('game:ready');
      sessions[data.token].host.emit('game:ready');
      sessions[data.token].host.emit('game:opponent-canvas',
      data.canvasOpponent);
      sessions[data.token].guest.emit('game:opponent-canvas',
      sessions[data.token].host.canvas);
    } else {
      socket.emit('game:error', {
        message: 'Token not valid.'
      });
    }

  socket.on('disconnect', function () {
    playerLeft(sessions[socket.sessionId]['host']);
  });

  });
});
