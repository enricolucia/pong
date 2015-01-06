/* global reqwest */
import { registry } from './storeRegistry.es6';
import { serialize, clone, lookup, async } from './utils.es6';

var req = reqwest;

var extendProps = (props, data) => {
  if (props.data) {
    for (var k in data) {
      if (data.hasOwnProperty(k)) {
        props.data[k] = data[k];
      }
    }
  } else {
    props.data = data;
  }
};


/**
 * Helper class that takes care of the communication with remote APIs. It will
 * be treated as a Singleton whenever an external module requires it as a
 * dependency.
 */
class Store {
  constructor() {
    this._cache = {};
  }

  /**
   * Method to asynchronously fetch data from a remote service.
   *
   * @param  {String} id: A string identifier for remote resource descriptor
   *                      registered in the storeRegistry.
   * @param  {Object} data: Optional data object which overrides default data
   *                        defined in the resource descriptor.
   * @return {Promise}
   */
  get(id, data) {
    var
      cache = this._cache,
      regProps = clone(registry[id]),
      mapProps = null,
      comboData = null,
      cacheId = data ? id + serialize(data) : id,
      comboProps;

    if (cache[cacheId]) {
      return cache[cacheId];
    }

    if (regProps instanceof Array) {
      cache[cacheId] = async(function* asyncGetCombo() {
        try {
          while((comboProps = regProps.shift())) {
            mapProps = comboProps.map || null;
            if (comboProps.id) {
              comboProps = registry[comboProps.id];
            }
            if (mapProps !== null) {
              for (var k in mapProps) {
                if (mapProps.hasOwnProperty(k)) {
                  comboProps.data[mapProps[k]] = lookup(comboData, k);
                }
              }
            }
            mapProps = null;
            extendProps(comboProps, data);
            comboData = yield req(comboProps);
          }
          return comboData;
        } catch(err) {
          throw err;
        }
      });
    } else {
      cache[cacheId] = async(function* asyncGet() {
        try {
          extendProps(regProps, data);
          return yield req(regProps);
        } catch(err) {
          throw err;
        }
      });
    }
    return cache[cacheId];
  }

  post(id, data) {
    // TODO
    console.log(id, data);
  }
}

/**
 * An instance of Store will be exported, to make sure it will be a Singleton
 * everytime it is required as a dependency.
 */
export var store = new Store();
