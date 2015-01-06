/* window.performance Polyfill */
(function(){
  var
    win = window,
    performance = win.performance;

  // prepare base perf object
  if (typeof performance === 'undefined') {
    performance = {};
  }

  if (!performance.now){
    var nowOffset = new Date().getTime();
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart;
    }
    performance.now = function now(){
      return Date.now() - nowOffset;
    };
  }

})();

/* requestAnimationFrame Polyfill */
(function() {
  var
    win = window,
    performance = win.performance,
    lastTime = 0,
    vendors = ['ms', 'moz', 'webkit', 'o'];

  for(var x = 0; x < vendors.length && !win.requestAnimationFrame; ++x) {
    win.requestAnimationFrame = win[vendors[x]+'RequestAnimationFrame'];
    win.cancelAnimationFrame = win[vendors[x]+'CancelAnimationFrame'] ||
        win[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!win.requestAnimationFrame) {
    win.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = win.setTimeout(function() { callback(performance.now()); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!win.cancelAnimationFrame) {
    win.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());
