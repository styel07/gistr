const PORT = process.env.PORT || 3000;

var express = require('express');
var app = express();
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


app.listen(PORT, () => {
  console.log('API listening on PORT: ', PORT);
});