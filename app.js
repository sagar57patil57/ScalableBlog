const express = require('express');
const path = require('path');
const app = new express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require('connect-flash');

const indexrouter = require('./routes/index');
const userrouter = require('./routes/user');
const blogrouter = require('./routes/blog');
const uploadimage = require('./routes/uploadimage');
require('./services/cache');

//databases
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rednode');
mongoose.set('useCreateIndex', true)

app.use(connectFlash());

const mongoStore = connectMongo(expressSession);

app.use(expressSession({
	secret: 'secret key',
	store: new mongoStore({
		mongooseConnection: mongoose.connection
	}),
	cookie: { secure: false }
}));

app.use(function(req, res, next){		//to make session data availabe in templates
        res.locals.session = req.session;
        next();
});

app.use(fileUpload());

app.set('view engine', 'ejs');//view engine

//statc assests
const publicDirPath = path.join(__dirname, '/public');
//const partialsPath = path.join(__dirname, '/views/partials');
//app.set('views', path.join(__dirname, '../views'));

app.use(express.static(publicDirPath));
//ejs.registerPartials(partialsPath);

//bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(3000,()=>{
	console.log('connected');
});

//routing

app.use('/',indexrouter);
app.use('/user',userrouter);
app.use('/blog',blogrouter);
app.use('/uploadimage',uploadimage);

app.get('*',(req, res)=>{
	res.send('404 Page');
});