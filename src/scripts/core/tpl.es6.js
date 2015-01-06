/* global Handlebars */

var
  doc = document,
  tmpDiv = doc.createElement('div'),
  HB = Handlebars;

export var render = (key, data) => {
  var
    frag = doc.createDocumentFragment(),
    el;
  tmpDiv.innerHTML = HB.templates[key](data || {});
  while ((el = tmpDiv.firstChild)) {
    frag.appendChild(el);
  }
  return frag;
};
export var renderString = (key, data) => {
  return HB.templates[key](data || {});
};
export var get = (key) => {
  return HB.templates[key];
};
