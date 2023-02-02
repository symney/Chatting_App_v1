var bcrypt = require("bcryptjs");
var collection = require("../index.js").collection;



exports.findUsers = function find(username, callback) {

  collection.find({ username: username }).toArray((err, user) => {
    if (err) {
      callback(err)
    }
    else if (user.length = 1) {
      callback(null, user[0])
    }
    else if (user.length = 0) {

      callback(null, null)
    }
    else {
      err = "to many users with username"
      callback(err)
    }

  })
}

exports.createUser = function(username, password, callback) {
  console.log(collection)
  collection.insert({ username: username }, { safe: true }, (err, sum) => {
    if (err) {
      callback(err)
    }
    else {
      bcrypt.hash(password, 10, (err, hash) => {
        collection.updateOne({ username: username }, { $set: { password: hash } }, callback);
      })
    }
  })
}