var express = require('express');
var router = express.Router();
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

router.get('/login', (req,res) => {
  var authURL = oauth2.getAuthorizeUrl({
    redirect_uri : 'http://localhost:3000/auth/github/callback',
    // what the users are given access to
    scope : ['gist'],
    state : 'authorize' + Math.round(Math.random() * 9999999)
  });
  res.json({ url : authURL });
});

router.get('/github/callback', (req,res) => {
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
        res.status(401).json(err);
      } else if ( results.error ) {
        res.status(401).json(results.error);
      } else { // everthing worked
        // get token
        // send token back to client
        res.json({ access_token : access_token });
      }
    });
});

module.exports = router;