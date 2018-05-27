const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
var logger = require('morgan');
require('dotenv').config()


mongoose.Promise = require('bluebird');
mongoose.connect(process.env.mongoUrl);
mongoose.connection.on('connected', () => {
  console.log('Connected to Database '+ process.env.mongoUrl);
});
mongoose.connection.on('error', (err) => {
  console.log('Database error '+err);
});

const app = express();
app.use(logger('dev'));
// CORS Middleware
app.use(cors());
// Body Parser Middleware
app.use(bodyParser.json());
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
//Routes
const users = require('./routes/users');
const confirmation = require('./routes/confirmation');
app.use('/users', users);
app.use('/confirmation', confirmation);


//Prod and Dev runs differently for hot reloading.
//Logic to determine if running build in prod and act accordingly ie: serve static assists from build
if(process.env.NODE_ENV === 'production' && process.env.frontEnd === 'React'){
  //If we are in prod and your determined front end is React use this setup / folder
  app.use(express.static('client/build'));
  const path = require('path');
  app.get('*', (req,res)=>{
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}else if(process.env.frontEnd === 'Angular' ){
  //Else use angulars folder
  app.use(express.static(path.join(__dirname, 'angular-src/dist')));
  app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, './angular-src/dist/index.html'));
  });
}

//Your local dev port or for heroku use the env port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
module.exports = app;