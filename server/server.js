require('dotenv').config({path: __dirname + './../.env'});

const express 				= require('express'),
			bodyParser 			= require('body-parser'),
			cookieParser 		= require('cookie-parser'),
			morgan					= require('morgan'),
			session 				= require('express-session'),
			passport				= require('passport'),
			flash						= require('connect-flash'),
			LocalStrategy 	= require('passport-local').Strategy,
			MongoStore 			= require('connect-mongo')(session),
			expressValidator= require('express-validator'),
			path 						= require('path'),
			promisify 			= require('es6-promisify'),
			ejs							= require('ejs')

//#############  DATABASE ###########
const mongoose = require('mongoose');
const mongo_options = { 
	server: { 
		socketOptions: { 
			keepAlive: 300000, 
			connectTimeoutMS: 30000 
		} 
	}, 
  replset: { 
  	socketOptions: { 
  		keepAlive: 300000, 
  		connectTimeoutMS : 30000 
  	} 
  } 
};       
mongoose.connect(process.env.MONGODB_URI, mongo_options);
mongoose.Promise = global.Promise;  
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});
require('./models/User');

const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection}) 
const sessionMiddleware = session({
	secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false,
  store: sessionStore
})

//#######################################

const app = express();
app.disable('x-powered-by');
app.use(morgan('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'))
app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(expressValidator()); 

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport.js')
app.use(flash());

app.use((req, res, next) => {
  res.locals.flashes = req.flash(); 
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Promise > Callback !!
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});


const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
	console.log('Server started on port: ' + port)
});

//############## SOCKET.IO & GAME LOGIC ###################

const io = require('socket.io')(server)
const passportSocketIo = require('passport.socketio')
const ioSessionMiddleWare = {
		cookieParser,
		key: 'connect.sid',
		secret: process.env.SECRET,
		store: sessionStore,
}

io.use(passportSocketIo.authorize(ioSessionMiddleWare))
require('./components/lobby.js')(io)
require('./components/doodle')(io) //Doodle Game Entry point
app.use('/', require('./routes'))
