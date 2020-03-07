var express = require("express");
var app = express();
var bodyparser=require("body-parser");
var mongoose= require("mongoose");
var passport=require("passport");
var localStrategy=require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride=require("method-override");
var flash=require("connect-flash");
var async=require("async");
var nodemailer=require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var crypto=require("crypto");


var User=require("./models/user");
var Feedback = require("./models/feedback");
var Ambulance = require("./models/ambulance");
var List = require("./models/bookinglist");

var active = 0;
var i=0;
var admin=0;
var gambulance;
var glist;
var gt;

app.use(require("express-session")({
    secret:"adventure28",
    resave:false,
    saveUninitialized:false
}));

app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
mongoose.connect("mongodb://localhost/meditech");

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  // res.locals.error=req.flash("error");
  // res.locals.success=req.flash("success");
  next();
});

app.get("/",function(req,res){
  res.render("landing",{page:'landing'});
});

app.get("/userlogin",function(req,res){
  res.render("userlogin");
});

app.get("/adminlogin",function(req,res){
  res.render("adminlogin");
});

app.post("/userregister",function(req, res) {
    console.log("reg");
    var newUser=new User({
        username:req.body.username,
        mobile:req.body.mobile,
        full_name:req.body.fullname,
    });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
              // req.flash("error",err.message);
            return res.redirect("/userlogin");
        }
        passport.authenticate("local")(req,res,function(){
              // req.flash("success","Welcome To QnAHub Mr."+user.username);
            console.log(user);
            res.redirect("/mainpage");
        });
    });
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/mainpage",
        failureRedirect: "/userlogin"
    }) , function(req, res){
});

app.get("/mainpage",function(req, res) {
    var user=req.user ||null;
    if(user!=null){
        res.redirect("/userlogin");
    }
    else{
     res.render("mainpage");
    }
});

app.post("/adminlogin",function(req, res) {
   if(req.body.username=='admin1234' && req.body.password=='admin1234'){
       admin=1;
       res.redirect("/adminhome");
   }
   else{
       res.redirect("/adminlogin");
   }
});

app.get("/adminhome",function(req, res) {

    if(admin==1){
        Ambulance.find({},function(err,ambulances){
       if(err){
           console.log("er1");
           console.log(err);
           res.redirect("/adminlogin");
       }
       else{
           Feedback.find({},function(er,feedbacks){
              if(er){
                  console.log("er2");
                  console.log(er);
                res.redirect("/adminlogin");
              }
              else{
                  console.log(ambulances,feedbacks);
                  res.render("adminhome",{i:i,active:active,feedbacks:feedbacks,ambulances:ambulances});
              }
           });
       }
    });
    }
    else{
        res.redirect("/adminlogin");
    }

});

app.post("/feedbackreceive",function(req,res){

    var newfeedback=new Feedback({
        email:req.body.email,
       full_name:req.body.fullname,
       mobile:req.body.mobile,
       message:req.body.message
    });

    Feedback.create(newfeedback,function(err,feedback){
        if(err){
            console.log(err);
            return res.redirect("/");
        }
        else{
            console.log(feedback);
            return res.redirect("/");
        }
    });

});

app.get("/logout",function(req, res) {
   req.logout();
//   req.flash("success","Succesfully logged out!");
   res.redirect("/");
});

app.post("/newambulance",function(req, res) {
    active = 5;
    var newambulance=new Ambulance({
        amb_id:1,
        vehicle_no:req.body.vno,
        driver_name:req.body.dname,
        driver_contact:req.body.dcont,
        driver_address:req.body.dadd,
        city:req.body.city,
        state:req.body.state,
        zip:req.body.zip,
        status:'Available',
        type:req.body.type,
        reg_date:Date.now(),
        location:'Meditech Office,Jaipur'
    });

    Ambulance.create(newambulance,function(err,ambulance){
        if(err){
            console.log(err);
            return res.redirect("/adminhome");
        }
        else{
            console.log(ambulance);
            return res.redirect("/adminhome");
        }
    });

});

app.get("/showambulanceinfo/:id",function(req, res) {
    active = 2;
    var rides=[];
   Ambulance.findById(req.params.id).populate("previous_rides").exec(function(err,result){
       if(err){
           console.log(err);
       }
       else{
           console.log(result);
           res.render("ambulanceinfo",{result:result});
       }
    });
});


app.get("/editambulanceinfo/:id",function(req, res) {
   Ambulance.findById(req.params.id).populate("previous_rides").exec(function(err,ambulance){
       if(err){
           console.log(err);
       }
       else{
           res.render("ambulanceedit",{ambulance:ambulance});
       }
    });
});



app.post("/applyfilter",function(req, res) {
    active=1;
    if (req.body.type=="all"){
        Ambulance.find({},function(err,ambulances){
       if(err){
           console.log("er1");
           console.log(err);
           res.redirect("/adminlogin");
       }
       else{
           Feedback.find({},function(er,feedbacks){
              if(er){
                  console.log("er2");
                  console.log(er);
                res.render("adminlogin");
              }
              else{
                  console.log(ambulances,feedbacks);
                  res.render("adminhome",{i:i,active:active,feedbacks:feedbacks,ambulances:ambulances});
              }
           });
       }
    });
    }
    else{
        Ambulance.find({type:req.body.type},function(err,ambulances){
       if(err){
           console.log("er1");
           console.log(err);
           res.redirect("/adminlogin");
       }
       else{
           Feedback.find({},function(er,feedbacks){
              if(er){
                  console.log("er2");
                  console.log(er);
                res.render("adminlogin");
              }
              else{
                  console.log(ambulances,feedbacks);
                  res.render("adminhome",{i:i,active:active,feedbacks:feedbacks,ambulances:ambulances});
              }
           });
       }
    });
    }
});

var basic=0;
var advance=0;
var neo=0;
var air=0;
var mort=0;
var pta=0;

app.post("/searchambulance",function(req,res){
    // console.log(req.body.location)
    // console.log(req.body.destination);
    Ambulance.find({status:'Available'},function(err, ambulances) {
        if(err){
            console.log(err);
            res.redirect("/mainpage");
        }
        else{
            // console.log(ambulances);
            ambulances.forEach(function(ambulance){
               if(ambulance.type=="Basic Life Support Ambulance"){
                   basic+=1;
               }
               if(ambulance.type=="Advanced Life Support Ambulance"){
                   advance+=1;
               }
               if(ambulance.type=="Neonatal Ambulance"){
                   neo+=1;
               }
               if(ambulance.type=="Patient Transport Vehicle"){
                   pta+=1;
               }
               if(ambulance.type=="Mortuary Ambulance"){
                   mort+=1;
               }
               if(ambulance.type=="Air Ambulance"){
                   air+=1;
               }
            });
            res.render("booking_page",{pickup:req.body.location,destination:req.body.destination,ambulances:ambulances,basic:basic,advance:advance,mort:mort,pta:pta,air:air,neo:neo});
        }
    });
});



app.put("/updateambulance/:id",function(req,res){
    active=1;
    Ambulance.findByIdAndUpdate(req.params.id,req.body.ambulance,function(err,updatedambulance){
       if(err){
           console.log(err);
           res.redirect("back");
       }
       else{
           console.log(updatedambulance);
           res.redirect("/adminhome");
       }
   }) ;
});

app.delete("/deleteambulance/:id",function(req,res){
    active=1;
    Ambulance.findByIdAndRemove(req.params.id,function(err){
      if(err){
          res.redirect("back");
      }
      else{
          res.redirect("/adminhome");
      }
   });
});

app.post("/confirmbooking",function(req, res) {
    Ambulance.find({type:req.body.type , status:"Available"},function(err, ambulances) {
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            var ambulance=ambulances[0];
            var booking = new List({
               ambulance_id:ambulance._id,
               from:req.body.from,
               to:req.body.to,
               author:{
            id:req.user._id,
            username:req.user.username
                },
                isLive:'1'
            });
         List.create(booking,function(err, booking) {
             if(err){
                 console.log(err);
                 res.redirect("back")
             }
             else{
                 ambulance.previous_rides.push(booking);
                 ambulance.save();
                 User.findById(req.user._id,function(err,founduser){
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }
                    else{
                        founduser.previous_bookings.push(booking);
                        founduser.save();
                        glist=booking;
                        gambulance=ambulance;
                        var t=Math.floor((Math.random() *10)+5);
                        // res.redirect("/changestatus");
                        Ambulance.findByIdAndUpdate(ambulance._id,{
                           $set:{
                               status:'Engaged'
                           }
                       },function(err,updated){
                          if(err){
                              console.log(err);
                              res.redirect("back");
                          }
                          else{
                              console.log(updated);
                            //   res.render("thank_you",{ambulance:gambulance,list:glist,t:gt});
                            const accountSid = 'AC2b6dca4154a03105caade2a3569d2df1';
                            const authToken = 'e7a6457d75e2b89e96729ee055fe95f0';
                            const client = require('twilio')(accountSid, authToken);

                            client.messages
                              .create({
                                 body: 'You have got a new RIDE!!GO to the given location fast!! FROM : '+booking.from + 'TO : '+booking.to,
                                 from: '+12028041787',
                                 to: '+919619730222'
                              })
                              .then(message => console.log(message));
                            res.render("thank_you",{ambulance:ambulance,list:booking,t:t});
                          }
                       });
                        // res.redirect("/changestatus/"+ambulance._id);
                    }
                 });
             }
         });
        }
    });
});

app.put("/changestatus",function(req,res){
   Ambulance.findByIdAndUpdate(gambulance._id,{
       $set:{
           status:'Engaged'
       }
   },function(err,updated){
      if(err){
          console.log(err);
          res.redirect("back");
      }
      else{
          console.log(updated);
          res.render("thank_you",{ambulance:gambulance,list:glist,t:gt});
      }
   });
});

app.get("/onetapbooking",function(req,res){
   res.render("onetapbook");
});

app.post("/adminlogout",function(req, res) {
   admin=0;
   res.redirect("/");
});

app.get("/profile/:id",function(req, res) {
   User.findById(req.params.id,function(err, founduser) {
      if(err){
          console.log(err);
          res.redirect("back");
      }
      else{
          res.render("profile",{user:founduser});
      }
   });
});

app.get("/pastbooking",function(req, res) {
    var pastbooking=[];
    var ambulance_list=[];
   User.findById(req.user._id,function(err, founduser) {
      if(err){
          console.log(err);
          res.redirect("back");
      }
      else{
          console.log(founduser.previous_bookings);
          (founduser.previous_bookings).forEach(function(booking){
              console.log("1");
              console.log(booking);
             List.findById(booking,function(err, found) {
                 if(err){
                     console.log(err);
                 }
                 else{
                     console.log("2");
                     pastbooking.push(found);
                     console.log(found);
                     Ambulance.findById(found.ambulance_id,function(err, foundamb) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("3");
                            console.log(foundamb);
                            ambulance_list.push(foundamb);
                        }
                     });
                 }
             });
          });
      }
   });
        setTimeout(function(){
            console.log("amb list");
          console.log(ambulance_list);
          console.log("past:");
          console.log(pastbooking);
          res.render("prevbooking",{list:pastbooking,ambulances:ambulance_list});
        }, 2000);
});

app.get("/features",function(req,res){
   res.render("features");
});

app.get("/logout",function(req, res) {
    req.logout();
    res.redirect("/");
});

var port = 3000 || process.env.PORT;
var host = '127.0.0.1' || process.env.HOST;
app.listen(port , host , function(){
  console.log("Server running at : http:/"+host+":"+port+"/");
});
