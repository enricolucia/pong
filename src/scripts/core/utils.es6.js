/**
 * Safe Object serializer. It won't fail if undefined or null is passed, but
 * returns an empty object representation.
 *
 * @params {Object} obj
 * @return {String} A string representation of the Object passed in.
 */
export var serialize = (obj) => JSON.stringify(obj || {});

/**
 * Safe Object representation deserializer. It won't fail if undefined or null
 * is passed, but returns an empty object. It will still fail if a malformed
 * Object representation is given as the input.
 *
 * @params {String} str: Object representation string.
 * @return {Object} The deserialized Object.
 */
export var deserialize = (str) => JSON.parse(str || '{}');

/**
 * Simple deep object copy function.
 *
 * @params {Object} obj: The Object to be cloned.
 * @return {Object} Deep clone of the input Object.
 */
export var clone = (obj) => deserialize(serialize(obj));

/**
 * Object value lookup. It takes an Object and a String descriptive of the path
 * to traverse to reach the desired value.
 * i.e.
 * obj = {
 *  deep: {
 *   nested: {
 *    value: 42
 *   }
 *  }
 * }
 * path = 'deep.nested.value'
 *
 * @param  {Object} data The object in which the lookup should be performed
 * @param  {String} key The string descriptive of the value path
 * @return {Value || undefined}
 */
export var lookup = (data, key) => {
  return key.split('.').reduce((obj, keyBit) => {
    if (typeof obj === 'object') {
      return obj[keyBit];
    }
    return undefined;
  }, data);
};


var run = (g, cb) => {
  var
    it = g(),
    ret;
  (function iterate(val) {
    ret = it.next(val);
    if (!ret.done) {
      if ('then' in ret.value) {
        ret.value.then(iterate, (err) => {
          cb(err, val);
        });
      } else {
        setTimeout(() => {
          iterate(ret.value);
        }, 0);
      }
    } else {
      cb(null, val);
    }
  })();
};

/**
 * Generator runner which returns a Promise to work with.
 *
 * @param  {Generator} gen
 * @return {Promise}
 */
export var async = (gen) => {
  return new Promise((resolve, reject) => {
    run(gen, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
