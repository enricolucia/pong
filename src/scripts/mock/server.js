// caching serialazer
var Pretender = require('./lib/pretender.js');
var serialize = require('../core/utils.es6').serialize;
var responses = require('./responses.js').responses;

var responseHandler = function(k, req){
  var res = responses[k];
  if (req.queryParams.fails) {
    return [404, {
        'Content-Type': 'application/json'
      },
      serialize(res.failure || 'Not found.')
    ];
  } else {
    return [200, {
        'Content-Type': 'application/json'
      },
      serialize(res.success || res)
    ];
  }
};

/* exported server */ // Not true, it is just to shut JSHint up.
var server = new Pretender(function() {
  for (var k in responses) {
    if (responses.hasOwnProperty(k)) {
      this.get(k, responseHandler.bind(this, k));
    }
  }
});


