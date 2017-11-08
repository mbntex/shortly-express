const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

///
const userFunctions = require('./models/user.js');
const dbModel = require('./models/model.js');
const cookieParser = require('./middleware/cookieParser.js');
const sessionsFn = require('./models/session.js');
const sessionsAuth = require('./middleware/auth.js');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


///OUR CODE /////////
app.use(cookieParser);
app.use(sessionsAuth.createSession);


/////////////////////


app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});


//OUR CODE//////////////////////////////////////////////////



app.get('/login', (req, res) => {
  console.log('GET request recieved!');
  res.render('login');
});

app.get('/signup', (req, res) => {
  console.log('GET request recieved!');
  res.render('signup');
});

app.post('/login', (req, res) => {
  console.log('POST request recieved!');
  var username = req.body.username;
  var password = req.body.password;
  console.log('username = ', username, 'password = ', password);
  userFunctions.get({username: req.body.username})
  .then(results => {
    if (results) {
      // console.log('GETFNTEST SIGNIN = ', results);
      // console.log('WE HAVE A CURRENT USER');
      if (userFunctions.compare(req.body.password, results.password, results.salt)) {
        //console.log('USER WITH CORRECT PASSWORD');
        res.redirect(301, '/');
      } else {
        //console.log('USER, BUT WRONG PASSWORD');
        res.redirect(301, '/login');
      }
      //res.redirect(301, '/');
    } else {
      //console.log('THIS IS NOT A CURRENT USER');
      res.redirect(301, '/login');
    }  
  });  
});


app.post('/signup', (req, res) => {
  //console.log('POST request recieved!');
  //console.log('REQ123 =', req.body);
  
  //CHECK IF USER EXISTS
  //can call funciton in model this way because of parent child relationship to user.
  userFunctions.testHi();
  userFunctions.getAll({username: req.body.username})
  .then(results => {
    console.log('GETALLTEST = ', results);
    if (results.length > 0) {
      res.redirect(301, '/signup');
    } else {
      var username = req.body.username;
      var password = req.body.password;
      var userNameAndPasswordObj = {username, password};
      //console.log(userNameAndPasswordObj);
      //userFunctions.testHello();
      userFunctions.create(userNameAndPasswordObj);
      res.redirect(301, '/');
    }
  });
  //Simple Promise example
  // userFunctions.get({username: 'David'})
  // .then(results => {
  //   console.log('JUST GET = ', results);
  // }); 
  
});


/////


// GETALLTEST =  [ RowDataPacket {
//     id: 1,
//     username: 'Marco',
//     password: '0c0f099fba859d48e97d7d9c521f15e040845854cce2f3b4069c30f0ba110759',
//     salt: '08204d23402f286bcd425b2a275bf14e4dabc9753fe772e4a4681c05e8063549' } ]
// JUST GET =  RowDataPacket {
//   id: 1,
//   username: 'Marco',
//   password: '0c0f099fba859d48e97d7d9c521f15e040845854cce2f3b4069c30f0ba110759',
//   salt: '08204d23402f286bcd425b2a275bf14e4dabc9753fe772e4a4681c05e8063549' }

//////////////////////////////////////////////////////////////



app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
