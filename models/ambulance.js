var mongoose=require("mongoose");

var ambulanceSchema= new mongoose.Schema({
    amb_id:String,
    vehicle_no:String,
    driver_name:String,
    driver_contact:String,
    driver_address:String,
    city:String,
    state:String,
    zip:String,
    location:String,
    type:String,
    status:String,
    reg_date:Date,
    previous_rides: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }
]
    
});

module.exports=mongoose.model("Ambulance",ambulanceSchema);