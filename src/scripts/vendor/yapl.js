/* Promise Polyfill */
(function(global) {
  global.Promise = Promise;

  // Use polyfill for setImmediate for performance gains
  var asap = global.setImmediate || function(fn) { setTimeout(fn, 1); };

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  var isArray = Array.isArray || function(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  };

  function Promise(fn) {
    if (typeof this !== 'object') {
      throw new TypeError('Promises must be constructed via new');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('not a function');
    }
    this._state = null;
    this._value = null;
    this._deferreds = [];

    doResolve(fn, bind(resolve, this), bind(reject, this));
  }

  function handle(deferred) {
    var me = this;
    if (this._state === null) {
      this._deferreds.push(deferred);
      return;
    }
    asap(function() {
      var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (me._state ? deferred.resolve : deferred.reject)(me._value);
        return;
      }
      var ret;
      try {
        ret = cb(me._value);
      }
      catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    });
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === this) {
        throw new TypeError('A promise cannot be resolved with itself.');
      }
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
          return;
        }
      }
      this._state = true;
      this._value = newValue;
      finale.call(this);
    } catch (e) { reject.call(this, e); }
  }

  function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }

  function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
      handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, resolve, reject){
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) {
          return;
        }
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) {
          return;
        }
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) {
        return;
      }
      done = true;
      onRejected(ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var me = this;
    return new Promise(function(resolve, reject) {
      handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    });
  };

  Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) {
        return resolve([]);
      }
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for(var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };
})(window);

/* Object.create Polyfill */
if (!Object.create) {
  Object.create = (function(){
    function F() {}
    return function(o) {
      if (arguments.length !== 1) {
        throw new Error('Object.create implementation only accepts one parameter.');
      }
      F.prototype = o;
      return new F();
    };
  })();
}

/* Object.getPrototypeOf Polyfill */
if (typeof Object.getPrototypeOf !== "function") {
  /* jshint ignore: start */
  Object.getPrototypeOf =
    "".__proto__ === String.prototype ? function (object) {
      return object.__proto__;
    } : function (object) {
      // May break if the constructor has been tampered with
      return object.constructor.__proto__.prototype;
    };
  /* jshint ignore: end */
}

/* Object.defineProperty Polyfill */
if (!Object.defineProperty ||
    !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
  var orig = Object.defineProperty;
  Object.defineProperty = function (o, prop, desc) {
    // In IE8 try built-in implementation for defining properties on DOM prototypes.
    if (orig) { try { return orig(o, prop, desc); } catch (e) {} }

    if (o !== Object(o)) { throw new TypeError("Object.defineProperty called on non-object"); }
    if (Object.prototype.__defineGetter__ && ('get' in desc)) {
      Object.prototype.__defineGetter__.call(o, prop, desc.get);
    }
    if (Object.prototype.__defineSetter__ && ('set' in desc)) {
      Object.prototype.__defineSetter__.call(o, prop, desc.set);
    }
    if ('value' in desc) {
      o[prop] = desc.value;
    }
    return o;
  };
}
