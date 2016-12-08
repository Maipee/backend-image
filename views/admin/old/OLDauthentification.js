var mysql = require('mysql');
var express = require('express');
var app = express();
var passport = require('passport');
var ls = require('passport-local').Strategy;
var mysqlhelper = require('mysqlhelper');
//on créé 2 users en dur

/*var users = [
	{"id":11,"username":"toto","password":"toto","role":"ROLE_GUEST"},
	{"id":22,"username":"guest","password":"guest","role":"ROLE_GUEST"}];
//on créé une variable qui simule le fait d'aller chercher des données en DB*/
var dbuser = null;
//var connection = mysql.createConnection({host:"localhost",database:"formation",user:"jo",password:"headshot91"});

	
//on serialise l'objet user à l'ouverture de la session
passport.serializeUser(function(user,done){
	done(null,user.id);
});

//on le deserialise à la fermeture de la session
passport.deserializeUser(function(id,done){
	done(null,dbuser);
});

//on utilise le module passport pour gérer la connexion
passport.use('local-login',new ls(function(username,password,done){
	//on fait une boucle qui va parcourir le tableau de users créé plus haut
	//s'il trouve un équivalent username + mdp
	//alors on charge dbuseravec ses informations.
	//connection.connect();
	mysqlhelper.query('SELECT * FROM user',function(err,rows,fields){
		if(!err)
		{
			if(rows.length>0)
			{
				for(var i=0;i<rows.length;i++)
				{
					if(username==rows[i].username)
					{
						dbuser=rows[i];
					}
				}
			}
			else
			{
				console.log(err);		
			}
		}
		console.log('close');
		//connection.end();
		if(dbuser != null)
		{
			return done(null,dbuser);
		}
		else
		{
			return done(null,false,{"message":"pas de user"});
		}
	});
	//si le dbuser (qui était initialisé à null, n'est plus null, on le renvoi, sinno on renvoi un message d'erreur
	mysqlhelper.close();
}));
