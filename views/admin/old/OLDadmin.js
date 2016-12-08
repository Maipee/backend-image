var express = require('express');
var df = require('dateformat');
var passport = require('passport');
var router = express.Router();
var mysql = require('mysql');
//var cfg=require('config');


router.use(function (req, resp, next) {
    //dans la console on ecrit les parametres cidessous
    console.log("Time : " + df(Date.now(), "dddd,mm dS,yyyy,h:MM:ss"), req.method, req.url);

    next();
});
/////////////////////////////////////////////////////////////////////////////////
//////////////////Route ADMIN////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

///////////////////////route "/" ////////////////////////////////////////////////
router.get("/index.html", function (req, resp) {
    //si le user enregistré en session est different de nul (typeof verifi le type de donné)
    if (typeof req.user !== 'undefined') {
        //alors je renvoie le twig avec un tablo qui recupere les elements de username
        resp.render("admin/index.html.twig", { "username": req.user.username });
    }
    //sinon je renvoie le user a la page login pour authentification
    else {
        resp.redirect("/login.html");
    }
});

///////////////////////route "/index.html" ////////////////////////////////////////////////
router.get("/", function (req, resp) {
    //on crée une route qui recupere tous les liens de "/admin" et redirige sur la route principal de admin
    resp.redirect("/admin/index.html");
});


/////////////////////////////////////////////////////////////////////////////////
//////////////////Route log out admin////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

router.get("/logout.html", function (req, resp) {
    //on eteint la session et on redirige vers l'index publique
    req.logout();
    resp.redirect("/");

});

/////////////////////////////////////////////////////////////////////////////////
//////////////////Route ADMIN form_contact////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

///////////////////////route "/" ////////////////////////////////////////////////
router.get("/form.html", function (req, resp) {
    //on initialise la variable message à null
    var message = null;
    //on se connecte à la bdd par le creatConnection avec les parametres de connexion
    var connection = mysql.createConnection({host:"localhost",database:"formation",user:"poweruser",password:"power"});
    //connection avec la bdd
    connection.connect();
    //on envoi un message pour verifier dans la console si la connection à bien été effectué
   // console.log('connnection mysql');
    //executer la query, soit inserer dans la tab email puis faire une fonction de calback
    //!!!!!!!!!!!!!!!!!!! Penser à changer par au nom de votre table qui recupere les email du formulaire de contact !!!!!!!!!!!!!!!!!!!!!
    connection.query("SELECT * FROM `contact_form`", function (err, rows, fields) {
        //function qui renvoie une erreur si il y a un probleme
        // on verifie dans la console le valeur de err pour voir si il y a une erreur
        //console.log("err :" + err);
        //si il y a une erreur donc si la valeur err est differente de null
        if (err != null) {
            //on enregistre le message d'erreur'
            message = "Il y a eu une erreur dans la query";
            //on log pour voir le mesage si il passe
            //console.log(message + ' ----- ' + err);

        }
        else {
            //sinon il n'y a pas d'erreur donc on ajoute la nouvelle valeur au message
            message = "La recuperation des données c'est bien passé ";
            //on log pour voir le mesage si il passe
            //console.log('message bien reussi avec le message : ' + message);
        }
        //on log pour voir le mesage si il passe en fin de connection
        //console.log('connection end ' + message);
        //fin de connection    
        connection.end();

        //console.log(' message hors de la fonction : ' + message);
        //si le user enregistré en session est different de nul (typeof verifie le type de donné et le transforme en chaine de caractere)
        if (typeof req.user !== 'undefined') {

            //alors je renvoie le twig avec un tablo qui recupere les elements de username et le tablo des mail a afficher
            resp.render("admin/contact_form.html.twig", { "form_email": rows });
        }
        //sinon je renvoie le user a la page login pour authentification
        else {
            resp.redirect("/login.html");
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////
//////////////////Route modif envoi form statu admin////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

///////////////////////route "/" ////////////////////////////////////////////////
router.get("/formenvoi/:id", function (req, resp) {
    var id = req.params.id;
    //UPDATE `email` SET `emailnotitificatino` = '1' WHERE `email`.`id` = 80; 

    var connection = mysql.createConnection({host:"localhost",database:"formation",user:"poweruser",password:"power"});
  //connection avec la bdd
  connection.connect();
  console.log('connnection mysql');

  //executer la query, soit inserer dans la tab email puis faire uje fonction de calback
  //!!!!!!!!!!!!!!!!!!! Penser à changer par au nom de votre table qui recupere les email du formulaire de contact !!!!!!!!!!!!!!!!!!!!!
  connection.query("UPDATE `contact_form` SET `emailNotification` = '1' WHERE `contact_form`.`id` = "+id+";  ",

    //function qui renvoie une erreur si il y a un probleme
    function (err, rows, fields) {
      console.log("err :" + err);

      if (err != null) {
        message = "Il y a eu une erreur votre message n'a pas était envoyé";

        console.log(message + ' ----- ' + err);

      }
      else {
        message = "Votre message à bien été envoyé, merci ";

        console.log('message bien reussi avec le message : ' + message);
      }

      console.log('connection end ' + message);
      connection.end();

      console.log(' message hors de la fonction : ' + message);
      resp.writeHead(200);
        resp.end();
    });
    




    
});


//exportation du module
module.exports = router;