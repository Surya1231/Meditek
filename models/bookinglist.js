var mongoose=require("mongoose");

var listSchema= new mongoose.Schema({
    ambulance_id:String,
    from:String,
    to:String,
    isLive:String,
     author:{
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            username:String
    },
    
    
});

module.exports=mongoose.model("List",listSchema);