
const express = require("express");
const app = express();
const ejs = require("ejs");
const cors = require("cors");
require("./config/database");
require("dotenv").config(); 
require("./config/passport");
const User = require("./models/user.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const passport = require("passport");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const MongoStore = require("connect-mongo");

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions",
  }),
//   cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

// get
app.get("/", (req,res)=>{
    res.render("index");
})

app.get("/about", (req,res)=>{
    res.render("about");
})

app.get("/registration", (req,res)=>{
    res.render("registration");
})

const checkLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/profile");
    }
    next();
};
app.get("/login", checkLoggedIn, (req,res)=>{
    res.render("login");
})

// app.get("/login", (req,res)=>{
//     res.render("login");
// })
// app.get("/profile",(req,res)=>{
//     res.render("profile");
    // if(req.isAuthenticated()) {
    //     res.render("profile");
    // }
    // res.redirect("/login");
// })

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
};
  
  // profile protected 
app.get("/profile", checkAuthenticated, (req, res) => {
    res.render("profile");
});

// post
app.post("/registration", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user) {
            return res.status(400).send("User already exists!");
        }
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            const newUser = new User({
              username: req.body.username,
              password: hash,
              phone: req.body.phone,
            });
            await newUser.save();
            res.redirect("/login");
          });
        // const newUser = new User(req.body);
        // await newUser.save();
        // res.status(201).redirect("/login");
    } catch (err) {
        res.status(500).send("There was an error -> " + err.message);
    }
});

app.post(
    "/login",
    (req, res, next) => {
        console.log("Login route reached.");
        next(); // Continue to Passport authentication
    },
    passport.authenticate("local", {
        failureRedirect: "/login",
        successRedirect: "/profile",
    })
);
//log out 
app.get("/logout", (req, res) => {
    try {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

module.exports = app;