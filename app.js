//Get Requirements and set instances of them
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var shortUrl = require('./models/shortUrl');
app.use(bodyParser.json());
app.use(cors());
//Connect to the database (localhost may not be correct for me)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://jal94-current-url-ms-4688261:27017/shortUrls');

//Allows node to find static content
app.use(express.static(__dirname +'/public'));


//Creates the database entry
app.get('/new/:urlToShorten(*)', function(req, res, next){
var urlToShorten = req.params.urlToShorten;
//Regex for url
var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
if(regex.test(urlToShorten)===true){
    var short = Math.floor(Math.random()*100000).toString();
    
var data = new shortUrl(
  {
      originalUrl: urlToShorten,
      shorterUrl: short
  }  
);

data.save(function(err){
    if(err){
        return res.send('Error saving to database');
    }
});
    return res.json(data);
}
var data = new shortUrl({
   originalUrl: urlToShorten,
   shorterUrl: 'InvalidURL'
});
return res.json(data);
});

//Query database and forward to originalUrl
app.get('/:urlToForward', function(req, res, next){
   //Stores the value of param
var shorterUrl = req.params.urlToForward;

shortUrl.findOne({'shorterUrl': shorterUrl}, function(err, data){
if(err) return res.send('Error reading database');
var re = new RegExp("^(http|https)://", "i");
var strToCheck = data.originalUrl;
if(re.test(strToCheck)){
    res.redirect(301, data.originalUrl);
}
else{
    res.redirect(301, 'http://' + data.originalUrl);
}
});
});






//Listen to see if everything is working
//(ES6) instead of "function()" use ()=>
//Process is for if on Heroku
app.listen(process.env.PORT || 3000, function(){
    console.log('Everything is working.');
});