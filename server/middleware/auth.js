const models = require('../models');
const Promise = require('bluebird');
const sessionsFn = require('../models/session.js');

module.exports.createSession = (req, res, next) => {
  console.log('CREATE SESSION RAN');
  if (req.headers.cookie === undefined) {
    console.log('YYYY', sessionsFn.create());
    sessionsFn.create();
    // .then(results => {
    //   console.log('RESSULTS', results);
    req.session = {};
    req.session.hash = 'HASH HERE';
    res.cookies = {};
    res.cookies.shortlyid = {};
    res.cookies.shortlyid.value = '';
      //response.cookies['shortlyid'] to exist
    // });
  }
  next();
};




/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

////


