const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

/*
Why is passport.use(new LocalStrategy(User.authenticate())); missing? See below:

Simplified Passport/Passport-Local Configuration
---
Starting with version 0.2.1 passport-local-mongoose adds a helper method createStrategy 
as static method to your schema. The createStrategy is responsible to setup passport-local 
LocalStrategy with the correct options.
The reason for this functionality is that when using the usernameField option to 
specify an alternative usernameField name, for example "email" passport-local would 
still expect your frontend login form to contain an input field with name "username" 
instead of email. This can be configured for passport-local but this is double the work. 
So we got this shortcut implemented.
*/

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());