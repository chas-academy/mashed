/**
 * Because we want .on() to attach event listeners in our code. This is not a
 * named export but is executed when this module is required.
 */
Node.prototype.on = window.on = function(name, fn) {
  this.addEventListener(name, fn);
};

NodeList.prototype.__proto__ = Array.prototype;

NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn) {
  this.forEach(function(elem) {
    elem.on(name, fn);
  });
};

/**
 * Function that accepts a single level object which is turned into an urlEncoded
 * string
 * @param  {Object} parmas The parameters as an object
 * @return {String}        The parameters as an urlEncoded string
 */
export function urlEncodeData(params) {
  return Object.keys(params)
    .map(key => {
      return [key, params[key]].map(encodeURIComponent).join('=');
    })
    .join('&');
}

/**
 * [getPromiseDataFromArray description]
 * @param  {Array} promises An array of Promises
 * @return {Promise}        A Promise that, when resolved, contains the returned
 *                          data for each individual Promise.
 */
export function getPromiseData(promises) {
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(res => {
        return res.map(type => {
          return type.status === 200 ? type.json() : reject(type.statusText);
        });
      })
      .catch(reason => console.log(reason))
      .then(res => {
        Promise.all(res).then(resolve);
      })
      .catch(reject);
  });
}

/**
 * Recursively flattens any nested array
 * @param  {Array} array  The input array, may be nested
 * @return {Array}        The resulting flattened, single leveled array
 */
export function flatten(array) {
  const flat = [].concat(...array);
  return flat.some(Array.isArray) ? flatten(flat) : flat;
}
