const PORT = process.env.PORT || 3000;

var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var OAuth2 = require('oauth').OAuth2;
var oauth2 = new OAuth2(
  // tells the provider information needed to access github
  process.env.GITHUB_CLIENT_ID,     // client id
  process.env.GITHUB_CLIENT_SECRET, // secret key
  'https://github.com/',             // provider base url
  'login/oauth/authorize',          // provider's login path
  'login/oauth/access_token',       // options
  null
);

// read up on extended function
app.use(bodyParser.urlencoded({ extended : true}));

app.get('/', (req,res) => {
  res.json({ status : 200 });
});

// Step 1: Oauth, getting the provider's auth url

app.get('/auth/login', (req,res) => {
  var authURL = oauth2.getAuthorizeUrl({
    redirect_uri : 'http://localhost:3000/auth/github/callback',
    // what the users are given access to
    scope : ['gist'],
    state : 'authorize' + Math.round(Math.random() * 9999999)
  });
  res.json({ url : authURL });
});

// Step 2: Callback from provider, with code, on successful authorization
// this route must be set _exactly as it is on the provider
// as callback url
// - use the code, to exchange for an access_token
app.get('/auth/github/callback', (req,res) => {
  var code = req.query.code;

  if (code === undefined) {
    return res.status(401).json({ error : 401, message : 'Invalid auth code.' });
  }

  oauth2.getOAuthAccessToken(
    code,
    {
      redirect_uri : 'http://localhost:3000/auth/github/callback'
    },
    (err, access_token, refresh_token, results) => {
      if (err) {
        console.log(err);
        res.status(401).json(err);
      } else if ( results.error ) {
        console.error(results.error);
        res.status(401).json(results.error);
      } else { // everthing worked
        // get token
        // send token back to client
        res.json({ access_token : access_token });
      }
    });
});

app.post('/gists', getAuthBearerToken, (req,res) => {
  // create a new gist from the contents of req.body, asks git to make a new git for you
  request.post({
    // first aregument to POST
    url : 'https://api.github.com/gists',
    json : true,
    headers : {
      Authorization : 'Bearer ' + req.access_token,
      'User-Agent' : 'Node'
    },
    body : {
      description : req.body.description,
      public : true,
      files : JSON.parse(req.body.files)
    }
      // second argument from POST
  }, (err, response, body) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(body);
  });
});

function getAuthBearerToken(req,res,next) {
  if (!req.headers.hasOwnProperty('authorization')) {
    return res.status(401).json(
      { error : 401, message : 'Bearer auth token not found in headers.'
  });
  }
  var auth_header = req.headers.authorization;
  var auth_header_value = auth_header.split(' ');

  // error that handles if its not formatted in the right way
  if (auth_header_value.length !== 2) {
    return res.status(401).json(
      { error : 401, message : 'Authorization header is malformed.' }
    );
  }

  // decorate the req token
  req.access_token = auth_header_value[1];
  next();

}

app.listen(PORT, () => {
  console.log('API listening on PORT: ', PORT);
});
// check the website
// https://api.github.com/gists/3d1125ee6a3162f33578