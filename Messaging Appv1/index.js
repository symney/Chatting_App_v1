console.log("running");
var fs = require("fs");
var async = require("async");
var http = require("http");
var express = require("express");
var symney = require("./Helper/files.js");
var data = require("./database/users.js");
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser");
var session = require("express-session");
var bcrypt = require("bcryptjs");
var users;
exports.collection;
var db;
const salts = 10;
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http)
var clients = 0
var config = 1;
var ip;
var user_collection;
var mongo = require("mongodb").MongoClient
ObjectId = require('mongodb').ObjectId

var passport = require("passport");
var localStrategy = require("passport-local").Strategy

app.use(cookieParser("hjbdofghsdukghsdlkghdjklfghuherjksflgd"))
app.use("/data", express.static("./database/"));
app.use(bodyParser.urlencoded({ encoded: false }));
app.use(bodyParser.json());
app.use(session({
  secret: "hjbdofghsdukghsdlkghdjklfghuherjksflgd",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1800000, secure: false }
}));

passport.use(new localStrategy((username, password, done) => {
  if (config == 1) {
    users.findUsers(username, (err, user) => {
      console.log(user)
      if (err) {
        console.log(err)
        res.end(err)
      }
      else if (!user) {
        console.log("no user with that username")
        done(null, false);
      }
      else if (user) {
        bcrypt.compare(password, user.password, function(err, res) {
          if (res) {
            console.log("done")
            return done(null, user);
          }
          else {
            console.log("incorrect password");
            return done(null, false);
          }
        });
      }
      else {
        console.log("error multiple users with that account")
        res.end("there was a server error")
      }
    })
  }

  else if (config == 2) {
    async.eachSeries(data.users, (user, callback) => {
      if (user.username == username) {
        console.log(username);
        bcrypt.hash(user.password, salts, function(err, hash) {
          bcrypt.compare(password, hash, function(err, res) {
            if (res) {
              console.log("done")
              return done(null, user);
            }
            else {
              if (user == data.users[data.users.length - 1]) {
                console.log("error")
                return done(null, false);
                callback("incorrect password");
              }
              callback();
            }
          });
        });


      }
      else if (!(user.username == username)) {
        if (user == data.users[data.users.length - 1]) {
          console.log("ERROR")
          return done(null, false);
          callback("no username");
          return
        }
        callback();
      }

    })
  }
}))

passport.serializeUser((user, done) => {
  if (config == 1) {
    console.log("serializing")
    console.log(user)
    done(null, user.username)
  }
  else if (config == 2) {
    done(null, user.id)
  }

})

passport.deserializeUser((username/*username or id depending on config*/, done) => {
  if (config == 1) {
    users.findUsers(username, (err, user) => {
      if (err) {
        console.log(err)
        done(null, false);
      }
      else if (!user) {
        console.log("error serializing");
        done(null, false);
      }
      else if (user) {
        done(null, user);
      }
      else {
        console.log("error serializing");
        done(null, false);
      }
    })
  }
  if (config == 2) {
    done(null, data.users[username])
  }

})

app.use(passport.initialize());
app.use(passport.session());













app.use("/home", (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.query != undefined && req.query.user != undefined) {
      next()
    }
    else {
      console.log(req.user)
      res.redirect("/home?user=" + req.user.username)
    }
  }
  else {
    console.log("bad auth")
    res.redirect("login");

  }
});

app.get("/", (req, res) => { res.redirect("/home") });

app.get("/login", (req, res) => { symney.stat_req("database/home.html", res) })
app.get("/home", (req, res) => {
  symney.stat_req("database/ui.html", res)
  res.cookie("user", req.user.username);
})

app.get("/create", (req, res) => { symney.stat_req("database/create.html", res) })

app.post("/login", passport.authenticate("local", {
  failureRedirect: "/login",
  session: true
}), (req, res) => {
  console.log(req.user);
  res.redirect("/home")
});

app.post("/create", (req, res) => {
  console.log(req.body)
  console.log(users);
  users.createUser(req.body.username, req.body.password, (err, results) => {
    if (err) {
      console.log(err)
      res.redirect("/login")
    }
    else {
      users.findUsers(req.body.username, (err, user) => {
        if (err) {
          console.log(err);
        }
        console.log("account successfully created: " + user.username + "   " + user.password)
        req.login(req.body, function(err) {
          if (err) { return next(err); }
          return res.redirect('/home');
        });
      })
    }
  })

});

if (config == 1) {
  function init(callback) {
    async.waterfall([
      (cb) => {
        mongo.connect(""/*MONGO DATABASE URI*/, function(err, client) {
          if (err) {
            console.log(err);
            cb(err)
            return
          }
          db = client.db("chat1database")
          cb(null)

        });
      },
      (cb) => {
        db.collection("users", (err, user_coll) => {
          exports.collection = user_coll;
          users = require("./database/user.js");
          console.log(user_coll)
          cb(null)
        })
      }
    ], callback)
  }
  init(((err, result) => {
    if (err) {
      console.log(err)
    }
    else {
      http.listen(3000);


    }
  }))
}
else if (config == 2) {
  http.listen(3000);
}

io.on("connection", (ws) => {
  clients += 1
  io.emit("client", clients)
  console.log("connection successful");
  ws.on("new message", (message) => {
    console.log(message)
    io.emit("new message", message)
    console.log(message);
  })
  ws.on("disconnect", (ws) => {
    console.log("someone has disconnected");
    clients -= 1;
    io.emit("client", clients)
  })
})






