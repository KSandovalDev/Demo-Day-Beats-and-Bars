module.exports = function (app, passport, db, multer, ObjectId) {



// Image Upload Code =========================================================================
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
});
var upload = multer({storage: storage});




  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/home', isLoggedIn, function (req, res) {
    let uId = ObjectId(req.session.passport.user)
    db.collection('userprofile').updateOne(
      { username: req.user.local.email },
     { $setOnInsert: { username: req.user.local.email } },
     { upsert: true },
   ),
   db.collection('userprofile').find({userId: uId}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('profile.ejs', {
      result : result
    })
  })})

  app.get('/swiping', isLoggedIn, function (req, res) {
   db.collection('userprofile').find().toArray((err, result) => {
    if (err) return console.log(err)
    result = result.filter(data=>data.username !== req.user.local.email)
    res.render('swiping.ejs', {
      result : result
    })
  })})

  app.post("/home",
    upload.array("photos", 10), function (req, res) {
      const files = req.files
      console.log(files, req.body)
      res.redirect("/home")
    }
  );

  //Handle Get request for  user setup page
  app.get('/userSetup', isLoggedIn, function (req, res) {
    res.render('usersetup.ejs', {
      user: req.user,
    })
  });

  app.get('/matches', isLoggedIn, function (req, res) {
    db.collection('userprofile').find({username: req.user.local.email}).toArray((err, result) => {
     if (err) return console.log(err)
    let emails = []
    if( result[0].peopleILiked && result[0].usersWhoLikedMe){
    emails = result[0].peopleILiked.filter(email=>result[0].usersWhoLikedMe.includes(email))
    }
   
      
   
      db.collection('userprofile').find().toArray((err, Finalresult) => {
        if (err) return console.log(err)
    
        var filtered = []
           for(var email in emails){
            filtered.push(Finalresult.filter(data=>data.username == emails[email]))
            }
          
            console.log(filtered)
        res.render('matches.ejs',{
          filtered: filtered,
        })
   })})})



  app.post('/userSetup', upload.single('file-to-upload'), (req, res, next) => {
    let uId = ObjectId(req.session.passport.user)
    db.collection('userprofile')
    .findOneAndUpdate({
      username: req.user.local.email
    }, {
      $set: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        imgPath: 'images/uploads/' + req.file.filename,
        userId: uId,
        peopleILiked: [],
        usersWhoLikedMe: [],
        bio:req.body.bio,
        name:req.user.username,
        soundCloudCode:req.body.soundCloudCode,
        youtubeCode:req.body.youtubeCode,
        spotifyCode:req.body.spotifyCode,
        genre1:req.body.genre1,
        genre2:req.body.genre2,
        genre3:req.body.genre3,
        genre4:req.body.genre4,
        instrument:req.body.instrument,
        instrumentLevel:req.body.instrumentLevel,
        looking:req.body.looking,
        influences:req.body.influences,
        instagramLink:req.body.instagramLink
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.redirect(`/home`)
    })
})


app.get('/chat/:username', isLoggedIn, function (req, res) {
  res.render('chat.ejs', {
    user: req.user,
    username: req.params.username,
  })
});


app.post('/likeUser', (req, res) => {
//// LINE 132 TODO
  // ADD EMAIL TO LIKED ARRAY ONLY IF EMAIL IS NOT ALREADY IN THERE
  //update peopleILiked
  db.collection('userprofile')
  .findOneAndUpdate({username:req.user.local.email}, {
    $push: {
      peopleILiked:req.body.userEmail
      }
  }, {
  sort: {_id: 1},
   upsert: false
  }, (err, result) => {
    if (err) return res.send(err)
    //update array of other person
    db.collection('userprofile')
    .findOneAndUpdate({username:req.body.userEmail}, {
      $push: {
        usersWhoLikedMe:req.user.local.email
    }
    }, {
    sort: {_id: 1},
     upsert: false
 }, (err, result) => {
      if (err) return res.send(err)
      res.redirect('/swiping')
    })
  })
})








  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/messages', (req, res) => {
    db.collection('messages').save({ name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown: 0 }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/home')
    })
  })




  // app.delete('/messages', (req, res) => {
  //   db.collection('messages').findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('Message deleted!')
  //   })
  // })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home', // redirect to the secure home section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
 
    successRedirect: '/home', // redirect to the secure home section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/home');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
