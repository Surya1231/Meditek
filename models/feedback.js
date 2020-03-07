var mongoose=require("mongoose");

var FeedbackSchema = new mongoose.Schema({
   email:String,
   full_name:String,
   mobile:String,
   message:String
});


module.exports=mongoose.model("Feedback",FeedbackSchema);
