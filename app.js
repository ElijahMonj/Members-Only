const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { check, validationResult } = require('express-validator');
const mongoDb = "mongodb+srv://admin:admin@cluster0.3hfbcxb.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
    isAdmin: { type: Boolean, required: true }
  })
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  
  async function getValueAsync() {
    let coll = mongoose.connection.db.collection("messages");
    let data = await coll.find({}, {limit:10, sort:{name:-1}}).toArray();
    //console.log(data)
    res.render("index", { user: req.user, messages: data });
  }
  getValueAsync()
  
  
  
});
//homepage
app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
//logout
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
//sign up page
app.post("/sign-up",[
  check('username').notEmpty(),
  check('password').isLength({ min: 5 }),
  check('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
      
    }
    return true;
  }),
  
], (req, res, next) => {
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }else{
    console.log("----------------")
  let x;
  if (req.body.isAdmin) {
    x=true
  } else {
    x=false
  }
  console.log(x);
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    isMember:false,
    isAdmin: x,
  }).save(err => {
    if (err) { 
      return next(err);
    }
    res.redirect("/");
  });
  }
  

});
//write on database
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    });
  })
);
//check if user is valid
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
//for cookie

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);
//to create a log in post

app.post('/delete', (req, res) => {
  console.log(req.body.usr) 
  var MongoClient = require('mongodb').MongoClient;
  let client=new MongoClient(mongoDb);
  qwer=`ObjectID("${req.body.usr}")`
  console.log(qwer);
  const  ObjectID = require('mongodb').ObjectId;
  async function run() {
    try {
      const database = client.db("test");
      const movies = database.collection("messages");
      // Query for a movie that has title "Annie Hall"
      const query = { _id: ObjectID(req.body.usr) };
      const result = await movies.deleteOne(query);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
        
      }
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
  setTimeout(refresh, 500);
  function refresh(){
    res.redirect('/')
  }
})
//TEST----
app.post('/new', function(req,res){
  
  var MongoClient = require('mongodb').MongoClient;
  

MongoClient.connect(mongoDb, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  let date = new Date();  
  let options = {  
    weekday: "long", year: "numeric", month: "short",  
    day: "numeric", hour: "2-digit", minute: "2-digit"  
  };  
  var newStory = [
    { name: req.body.usr , message: req.body.newMessage, time:date.toLocaleTimeString("en-us", options)},   
  ];
  dbo.collection("messages").insertMany(newStory, function(err, res) {
    if (err) throw err;
    
    db.close();
  });
});
async function getValueAsync() {
  
  let coll = mongoose.connection.db.collection("messages");
  let data = await coll.find({}, {limit:10, sort:{name:-1}}).toArray();
  console.log("-------------------------")
  console.log(data)
  console.log("-------------------------")
}
getValueAsync()
setTimeout(refresh, 500);
  function refresh(){
    res.redirect('/')
  }
})
//TEST----
app.listen(3000, () => console.log("app listening on port 3000!"));