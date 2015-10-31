var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');

// read up on extended function
router.use(bodyParser.urlencoded({ extended : true}));

router.get('/:id', getAuthBearerToken, (req,res)=> {
  request.get({
    url : 'https://api.github.com/gists/' + req.params.id,
    headers : {
      Authorization : 'Bearer ' + req.access_token,
      'User-Agent' : 'Node'
    }
  }, (err, response, body) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(body);
  });
});

router.post('/', getAuthBearerToken, (req,res) => {
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

module.exports = router;