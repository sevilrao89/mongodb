// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
require('dotenv').config()
console.log(process.env.MONGODB_URI)
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var request = require('request');
var Article = require("./models/article.js")

var app = express();

//db.article.create({})





app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {


  request('http://time.com/section/health/', function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var urls = []
      var headlines = []

      $('.headline').filter(function () {
        var data = $(this)
        var html = data.html()

        var url = "https://time.com" + html.split("=").join('').split(">")[0].split("href")[1].replace(/['"]+/g, '')
        var headline = html.split(">")[1].split("<")[0].trim()
        headline = headline.split(headline.substring(headline.lastIndexOf("&"), headline.lastIndexOf(";") + 1)).join("")
        urls.push(url);
        headlines.push(headline)


      })

      var summaries = []
      $('.desktop-only.summary').filter(function () {
        var data = $(this);
        var html = data.html()
        html = html.split(html.substring(html.lastIndexOf("&"), html.lastIndexOf(";") + 1)).join("").trim()
        summaries.push(html.trim());
        //if(desktops[i].className.split(" ").includes("summary")){
        //summaries.push(desktops[i].innerHTML.trim())

      })



      console.log(headlines)

      if (urls.length == headlines.length && urls.length == summaries.length) {
        for (var i = 0; i < urls.length; i++) {
          // Article.create({ url:urls[i], headline:headlines[i], summary:summaries[i]})
          // .then(function(article) {
          //   // If saved successfully, print the new Library document to the console
          //   console.log(article);
          // })
          // .catch(function(err) {
          //   // If an error occurs, print it to the console
          //   console.log(err.message);
          // });
        //   var obj = new Article({ url: urls[i], headline: headlines[i], summary: summaries[i] })
        //   obj.save(function (err, resultsaved) {
        //   console.log(resultsaved)
        //   console.log(err)
        // })

        //cant save new article after checking to see if it exists in the database already, 
        //below code with article.findOne not working.   

         console.log("headline",headlines[i])
          Article.findOne( { headline: { $exists: true, $in: [ headlines[i] ] } }, function(err, result){
            if (err) {console.log(err)}
            else{
              if(result == null){
                var obj = new Article({ url: urls[i], headline: headlines[i], summary: summaries[i] })
                obj.save(function (err, resultsaved) {
                console.log(resultsaved)
                console.log(err)
              })
    
              } 
                console.log("result", result)
                console.log("length", urls.length, headlines.length,summaries.length)
              }
          })
          //console.log(exists)
        
        }
        
        Article.find({}, function(err, results){
          if (err){ console.log(err)}
          else{
            res.render("home", {articles:results})
            console.log(results)
          }
        })

      }





      // console.log(urls)
      // console.log(headlines) 
      // console.log(summaries)
    }



  });


});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, function () {
  console.log("connected to mlab")
})



app.listen(3000, function () {
  console.log("listening on port 3000")
});
