///////////////////////////////////////////////////----->require
var xpress = require('express');
var passport = require('passport');
//bodyparser va recuperer les element de l'url pour recuperer les donner du formulaire
var bodyparser = require('body-parser');
var session = require('express-session');
var app = xpress();
//on appel le module que l'on a créé dnas node_module'
var auth = require('authentification');
//on appel le module qui s'ocupe des routes
var routing = require('routing');
//on appel le module qui s'ocupe du caddie
var caddierouting = require('caddierouting');

var url = require('url');
//on appel le module qui s'occupe des routes admin
var admin = require('admin');
//on appel le module qui s'occupe de config
var cfg = require('config');
//on appel le module qui s'occupe d'envoyer des mails
var mailrouting = require('emailrouting');
//on appel le module product routing correstion du product manager
var productrouting = require('productrouting');
//on appel le module order routing correction du order manager
var oderrouting = require('oderrouting');
//on appel le module order routing correction du order manager
var stockoderrouting = require('stockoderrouting');

///////////////////////////////////////////////////----->USE
//pour utiliser les fichiers static css img js
app.use(xpress.static('public'));
//pour utiliser les fichiers static en admin
app.use(xpress.static('public/admin'));
//configuration du module passport
//pour que passport puisse recuperer sous forme de tablo en json le rersultat du formulaire
app.use(bodyparser.json());
//bodyparser accepte utf8
app.use(bodyparser.urlencoded({extended: true}));
//c'est le mot secret pour pouvoir crypter et la persistance dans le serveur avec initialized
app.use(session({secret:"Thissecret",resave:true, saveUminitialized : true}));
// initialise passport tel que confirer
app.use(passport.initialize());
//et demare passport en monde session
app.use(passport.session());
//Utilisation du product routing de fabrice
app.use('/admin',productrouting);
//Utilisation du order routing de fabrice
app.use('/admin',oderrouting);
//Utilisation du order routing de fabrice
app.use('/admin',stockoderrouting);

//pour utiliser un format de date lisible
var df = require('dateformat');

app.use(function(req,res,next){
    var user = 'anonymous'
    if(typeof req == 'undefined'){
        console.log('Time : ',df(Date.now(),cfg.APP.dateformat),req.method,user,req.url);
        }
    //le next est la pour appliquer tout ce qui est avant à le faire à tout ce qui suit
    next();
});



//pour voir dans le log la route , get ou post et la date
// On utilise routing.js dans le node_module, bien le mettre à la fin, car tout est configuré pour faire marché ce qui suit
app.use("/",routing);


//on utilise la route admin comme redirection avec le fichier admin
app.use("/admin",admin);

//on utilise la route / comme redirection avec le fichier caddirouting
app.use("/",caddierouting);

//on utilise le mailrouting pour l'envoi de mail
app.use("/",mailrouting);

//gestion de la page 404
app.use(function(req,resp){
    //si on eu une requent qui n'a eu aucune reponse
    if(typeof req.user =='undefined'){
        //alors on redirige vers la page 404
        resp.status(404).render('404.html.twig');

    }
    else
    {
        resp.status(404).render('404.html.twig',{"username":req.user.username});
    }
resp.render

});
//on ecoute l'aplication
app.listen(8088);
