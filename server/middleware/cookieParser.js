const queryString = require('querystring');
const sessionsFn = require('../models/session.js');
const sessionsMiddleFn = require('./auth.js');



const parseCookies = (req, res, next) => {
  console.log('parseCookies Ran!!!');
  console.log('TT', typeof req.headers.cookie);
  if (req.headers.cookie === undefined) {
    console.log('NO COOKIE FOUND');
    req.cookies = {};
  } else {
    var cleanUp = function (string) {
      var output = {};
      var arr = string.split('; ');
      for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].split('=');
      }
      for (var j = 0; j < arr.length; j++) {
        output[arr[j][0]] = arr[j][1];
      }
      console.log('CURRENT OUTPUT = ', output);
      return output;
    };
    req.cookies = cleanUp(req.headers.cookie);

  }
  next();
};

module.exports = parseCookies;
