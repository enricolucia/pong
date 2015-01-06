/* global Handlebars */
(function() {

  // Insert new helpers here
  var helpersDict = {
    /**
     * Analytics link
     */
    'taggedAnchor': function (url, text) {
      return '<a href="' + url + '">' + text + '</a>';
    }
  };

  // Do not touch
  try {
    module.exports = helpersDict;
  } catch(e) {
    for (var k in helpersDict) {
      if (helpersDict.hasOwnProperty(k)) {
        Handlebars.registerHelper(k, helpersDict[k]);
      }
    }
  }

})();



