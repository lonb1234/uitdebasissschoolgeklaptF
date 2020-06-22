const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var md5 = require('md5');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use(session({
  secret: "keyboardCat 1234",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-jeu:XcP1YyXDL3xGMmb6@cluster0-4muqy.mongodb.net/<dbname>?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set("useCreateIndex", true);
const postSchema = {
  title: String,
  content: String,
  type: String
};

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
})


const Post = mongoose.model("Post", postSchema);


userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});





//front
app.get("/", function(req, res) {
  Post.find({}, function(err, posts) {
    res.render("home", {
      posts: posts
    });
  });
});

app.get("/kind", function(req, res) {
  Post.find({
    type: "Kind"
  }, function(err, posts) {
    res.render("kind", {
      posts: posts
    });
  });
});

app.get("/kort", function(req, res) {
  Post.find({
    type: "Kort"
  }, function(err, posts) {
    res.render("kort", {
      posts: posts
    });
  })
})

app.get("/dynamisch", function(req, res) {
  Post.find({
    type: "Dynamisch"
  }, function(err, posts) {
    res.render("dynamisch", {
      posts: posts
    });
  })
})

app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
    });
  });
});


//authentication
// app.get("/register", function(req, res) {
//   res.render("register")
// })
//
// app.post("/register", function(req, res) {
//   User.register({
//     username: req.body.username
//   }, req.body.password, function(err, user) {
//     if (err) {
//       console.log(err)
//     } else {
//       passport.authenticate('local')(req, res, function() {
//         res.redirect("/blogmenu")
//       })
//     }
//   })
// });

app.get("/login", function(req, res) {
  res.render("login")
})

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/blogmenu")
      })
    }
  })
})


//back
app.get("/blogmenu", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("blogmenu")
  } else(res.redirect("/login"))
})

app.get("/compose", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("compose")
  } else(res.redirect("/login"))
})

app.post("/compose", function(req, res) {
  if (req.isAuthenticated()) {
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody,
      type: req.body.type
    });
    post.save(function(err) {
      if (!err) {
        res.redirect("/compose");
      }
    })
  } else(res.redirect("/login"))
});

app.get("/delete", function(req, res) {
  if (req.isAuthenticated()) {
    Post.find({}, function(err, posts) {
      res.render("delete", {
        posts: posts
      });
    })
  } else(res.redirect("/login"))
});

app.post("/delete", function(req, res) {
  if (req.isAuthenticated()) {
    const checkedBox = req.body.checkbox
    var i;
    for (i = 0; i < checkedBox.length; i++) {
      Post.findByIdAndRemove(checkedBox, function(err) {
        if (!err) {
          console.log("deleted")
        } else {
          console.log("not deleted")
        }
      })
    }
    res.redirect("/delete")
  } else(res.redirect("/login"))
})

app.get("/edit", function(req, res) {
  if (req.isAuthenticated()) {
    Post.find({}, function(err, posts) {
      res.render("edit", {
        posts: posts
      });
    })
  }
});

app.get("/edits/:postId", function(req, res) {
  if (req.isAuthenticated()) {
    const requestedPostId = req.params.postId;
    Post.findOne({
      _id: requestedPostId
    }, function(err, post) {
      res.render("editing", {
        title: post.title,
        content: post.content,
        type: post.type,
        ident: post._id
      });
    });
  } else(res.redirect("/login"))
});

app.post("/edits/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  if (req.isAuthenticated()) {
    var newvalues = {
      $set: {
        title: req.body.postTitle,
        content: req.body.postBody,
        type: req.body.type
      }
    };
    Post.updateOne({
      _id: requestedPostId
    }, newvalues, function(err) {
      if (!err) {
        res.redirect("/edit");
      }
    })
  } else(res.redirect("/login"))
});



app.listen(process.env.PORT);
