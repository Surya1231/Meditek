var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username:String,
   full_name:String,
   mobile:String,
   password:String,
   resetPasswordToken:String,
   resetPasswordExpires:Date,
   previous_bookings: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }
]
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);
