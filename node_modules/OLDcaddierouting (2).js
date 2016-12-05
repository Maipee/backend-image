var express = require('express');
var router = express.Router();
var passport = require('passport');
var session = require('cookie-session');
var url = require('url');
var querystring = require('querystring');
var mysql = require('mysql');
var cfg = require('config');
var mysqlhelper = require('mysqlhelper2');
var username;

//route pour ajouter une commande dans le caddie
router.get("/caddie/ajouter/:id/:quantite",function(req,resp){
	var id=req.params.id;
	var quantite=req.params.quantite;
	var params = querystring.parse(url.parse(req.url).query);
	console.log('l\'id:' + id + 'la quantite:' + quantite);
	if(typeof req.user !== 'undefined')
	{
		username = req.user.username;
		console.log('connection mysql ajoutecommande');
		connection.pool.query('INSERT INTO orders (idproduct, quantity, idcustomer, price, statusdate, codeorder, status) VALUES ("'+id+'", "'+quantite+'", (SELECT customers.ID FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), (SELECT price FROM products WHERE id = "'+id+'") * "'+quantite+'", NOW(), 555555, "en caddie") ',function(err,rows,fields){
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
router.get("/caddie/modifier/:id/:quantite",function(req,resp){
	var id=req.params.id;
	var quantite=req.params.quantite;
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