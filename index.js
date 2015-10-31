var express = require('express');
var app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req,res) =>{
  res.jspon({ status : 200 });
});

app.listen(PORT, () => {
  console.log('API listening on PORT: ', PORT);
});