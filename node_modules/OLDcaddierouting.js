var express = require('express');
var router = express.Router();
var passport = require('passport');
var session = require('cookie-session');
var url = require('url');
var querystring = require('querystring');
var mysql = require('mysql');
var cfg=require('config');

//route de la page caddie
router.get("/caddie/afficher",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
		connection.connect();
		console.log('connection mysql affichecaddie');
		connection.query('SELECT * FROM commandes WHERE id_client = (SELECT client.id FROM client, user WHERE user.username="'+username+'" AND client.email = user.email) AND commandes.statut_en_cours = "dans le caddie" AND commades.deleted=0 ',function(err,rows,fields){
			if(err != null)
			{
				console.log(message + ' ' + err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			connection.end();
			resp.render("caddie.html.twig",{"username":req.user.username});
		});
	}
	else
	{
		resp.render("caddie.html.twig",{'caddy':req.session.caddy,});
	}
});

//route pour ajouter une commande dans le caddie
router.get("/caddie/ajouter/:id/:quantite",function(req,resp){
	var id=req.params.id;
	var quantite=req.params.quantite;
	var productname=req.body.productname;
	var numcommande=req.body.numcommande;
	var params = querystring.parse(url.parse(req.url).query);
	console.log('l\'id:' + id + 'la quantite:' + quantite);
	if(typeof req.user !== 'undefined')
	{
		var username = req.user.username;
		var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
		connection.connect();
		console.log('connection mysql ajoutecommande');
		connection.query('INSERT INTO commandes (id_products, quantite, id_client, prix, status_date, numero_commande, statut_en_cours) VALUES ("'+id+'", "'+quantite+'", (SELECT client.id FROM client, user WHERE user.username = "'+username+'" AND user.email = client.email), (SELECT priceht FROM products WHERE ID = "'+id+'") * "'+quantite+'", NOW(), 555555, "dans le caddie") ',function(err,rows,fields){
			if(err != null)
			{
				console.log(err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			connection.end();
			resp.redirect("/single.html");
		});
	}
	else
	{
		if (typeof(req.session.caddy) == 'undefined') 
		{
		    req.session.caddy = [];
			req.session.caddy.push({'id':id,'quantite':quantite});
			resp.redirect("/single.html");
			console.log(JSON.stringify(req.session.caddy));
		}
		else
		{
			req.session.caddy.push({'id':id,'quantite':quantite});
			resp.redirect("/single.html");
			console.log(JSON.stringify(req.session.caddy));
		}
	}
});

//route supprimer une commande du caddie
router.get("/caddie/supprimer/:id",function(req,resp){
	var commandeid=req.params.id;
	if(typeof req.user !== 'undefined')
	{
		var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
		connection.connect();
		console.log('connection mysql caddiedelete');
		connection.query('UPDATE commandes SET deleted = 1, status_date = NOW() WHERE ID = "'+commandeid+'" ',function(err,rows,fields){
			if(err != null)
			{
				console.log(message + ' ' + err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			connection.end();
			resp.render("caddie.html.twig",{"username":req.user.username});
		});
	}
	else
	{
		req.session.caddy.splice(req.params.id,1);
		resp.render("caddie.html.twig");
	}
});

//route modifier la quantité des commandes du caddie
router.get("/caddie/modifier/:id",function(req,resp){
	var commandeid=req.params.id;
	var quantite=req.body.qut;
	if(typeof req.user !== 'undefined')
	{
		var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
		connection.connect();
		console.log('connection mysql caddiedelete');
		connection.query('UPDATE commandes SET quantite = "'+quantite+'" WHERE ID = "'+commandeid+'" ',function(err,rows,fields){
			if(err != null)
			{
				console.log(message + ' ' + err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			connection.end();
			resp.render("caddie.html.twig",{"username":req.user.username});
		});
	}
	else
	{	
		req.session.caddy.quantite = req.body.qut;
		resp.render("caddie.html.twig");
	}
});

//route continuer: retour à la page précédent l'arrivée sur le caddie
router.get("/caddie/continuer",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.redirect("back",{"username":req.user.username});
	}
	else
	{
		resp.redirect("back");
	}
});

//route valider le caddie
router.get("/caddie/valider",function(req,resp){
	resp.render("valider.html.twig",{"username":req.user.username});
});

//route pour clearer le caddie
router.get("/caddie/clear", function(req, resp){
	req.session.caddy = [];
	resp.redirect('/');
});

module.exports = router;