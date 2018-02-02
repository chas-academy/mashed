/** Stuff I usually use */

/**
 * Because we want .on() to attach event listeners in our code
 */
Node.prototype.on = window.on = function(name, fn) {
  this.addEventListener(name, fn);
};

NodeList.prototype.__proto__ = Array.prototype;

NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
  this.forEach(function (elem, i) {
    elem.on(name, fn);
  });
};

export function urlEncodeData(data) {
  return Object.keys(data)
    .map(key => {
      return [key, data[key]].map(encodeURIComponent).join("=");
    })
    .join("&");
}

export function getPromiseDataFromArray(promises) {
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((res) => {
        return res.map(type => { 
          return type.status === 200 ? type.json() : reject(type.statusText)
        });
      })
      .catch(reason => console.log(reason))
      .then(res => {
        Promise.all(res).then(resolve);
      })
      .catch(reject);
  });
}

export function flatten(array) {
  const flat = [].concat(...array);
  return flat.some(Array.isArray) ? flatten(flat) : flat;
}
