var routing=require('routing');
var xpress=require('express');
var app=xpress();
var passport=require('passport');
var bodyparser=require('body-parser');
var session= require('express-session');
var auth=require('authentification');
var df=require('dateformat');

//configuration de passport
// récupération du contenu du formulaire en tableau
app.use(bodyparser.json());
// Pour que bodyparser accepte UTF8
app.use(bodyparser.urlencoded({extended:true}));
// Manière de travailler avec passeport utilisation du user dans la session
	// la session, clé de cryptage
app.use(session({secret:"thisissecret",resave:true,saveUninitidized:true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,resp,next){
	console.log("Time:" + df(Date.now(), "dddd,mm dS,yyyy,h:MM:ss"),req.method,req.url);
	next();
});

//j'indique avec la variable xpress le dossier des CSS, JS et image
app.use(xpress.static('public'));

app.use("/",routing);

app.listen(8088);