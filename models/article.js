var mongoose = require("mongoose")

// why?
var Schema = mongoose.Schema;

var articleSchema = new Schema({
headline: {
    type:String,
    required: true
},

url: {
  type:String,
  required: true
  
},

summary: {
  type:String,
  required: true
}

})

var Article = mongoose.model("Article", articleSchema);

module.exports = Article;