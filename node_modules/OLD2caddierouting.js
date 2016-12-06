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
var prix = 0;
var total_prix = 0;

function total(req){
	
	if(typeof req.session.caddy == "undefined")
	{
		console.log('session caddy undefined');
	}
	else
	{
		for(var i=0;i<req.session.caddy.length;i++)
		{
			console.log('boucle for '+req.session.caddy[i].price);
			total_prix = req.session.caddy[i].price+ total_prix;
		}
		console.log(total_prix);
	}
	return total_prix;
};

//route de la page checkout (paiement)
router.get("/checkout.html",function(req,resp){
	console.log(total_prix+' total prix à l\'affichage');
	if(typeof req.user !== 'undefined')
	{
		username = req.user.username;
		console.log('connection mysql affichecaddie');
		mysqlhelper.pool.query('SELECT orders.idcustomer, orders.deleted, orders.id, orders.codeorder, orders.idproduct, orders.quantity, orders.statusdate, orders.status, orders.price, products.label, products.picture FROM orders, products WHERE idcustomer = (SELECT customers.id FROM customers, app_users WHERE app_users.username="'+username+'" AND customers.email = app_users.email) AND products.id = orders.idproduct AND orders.status = "en caddie" AND orders.deleted=0 ',function(err,rows,fields){
			if(err != null)
			{
				console.log(err);
			}
			else
			{	

				total_prix= total(req);
				console.log(total_prix);
				console.log('query ok');
				console.log(JSON.stringify(rows));
			}
			resp.render("checkout.html.twig",{"username":req.user.username, "liste_commande":rows,"total_prix":total_prix});
		});
	}
	else
	{
		if (typeof req.session.caddy == 'undefined') 
		{
		req.session.caddy = [];
		resp.render("checkout.html.twig",{"caddy":req.session.caddy});
		}
		else
		{
			total_prix= total(req);
			console.log(JSON.stringify(req.session.caddy));
			console.log(total_prix);
			resp.render("checkout.html.twig",{"liste_commande":req.session.caddy,"total_prix":total_prix});
		}
	}
});

//route pour ajouter une commande dans le caddie
router.get("/caddie/ajouter/:id/:quantite",function(req,resp){
	var id=req.params.id;
	var quantite=req.params.quantite;
	var params = querystring.parse(url.parse(req.url).query);
	var status = 'en caddie';
	var row = 0;
	mysqlhelper.pool.query('SELECT price, picture FROM products WHERE id = "'+id+'" ',function(err,rows,fields){
		if(err != null)
		{
			console.log(err);
		}
		else
		{
			console.log('query selectprice ok'+JSON.stringify(rows));
		}
		for(i=0; i<rows.length; i++)
		{
			console.log('on passe dans le for');
			row = rows[i];
		}
		console.log('row.price: '+row.price);
		var productprice = row.price;
		var picture = row.picture;
		var prix = quantite*productprice;
		console.log('prix: '+prix);
		if(typeof req.user !== 'undefined')
		{
			username = req.user.username;
			//ajout en session
			if (typeof(req.session.caddy) == 'undefined') 
			{
			    req.session.caddy = [];
			    req.session.caddy.push({'id':id,'quantity':quantite,'price':prix,'status':status,'picture':picture});
				resp.redirect("/single.html/"+id);
				console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
			}
			else
			{
				req.session.caddy.push({'id':id,'quantity':quantite,'price':prix,'status':status,'picture':picture});
				resp.redirect("/single.html/"+id);
				console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
			}
			//ajout en DB
			console.log('connection mysql ajoutecommande');
			mysqlhelper.pool.query('INSERT INTO orders (idproduct, quantity, idcustomer, price, statusdate, codeorder, status) VALUES ("'+id+'", "'+quantite+'", (SELECT customers.id FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), (SELECT price FROM products WHERE id = "'+id+'") * "'+quantite+'", NOW(), (SELECT customers.id FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), "en caddie") ',function(err,rows,fields){
				if(err != null)
				{
					console.log(err);
				}
				else
				{
					console.log('query ok'+rows);
				}
				resp.redirect("/single.html/"+id);
			});
			
		}
		else
		{
			if (typeof(req.session.caddy) == 'undefined') 
			{
			    req.session.caddy = [];
			    req.session.caddy.push({'id':id,'quantity':quantite,'price':prix,'status':status,'picture':picture});
				resp.redirect("/single.html/"+id);
				console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
			}
			else
			{
				req.session.caddy.push({'id':id,'quantity':quantite,'price':prix,'status':status,'picture':picture});
				resp.redirect("/single.html/"+id);
				console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
				
			}
		}
	});
	
});

//route supprimer une commande du caddie
router.get("/caddie/supprimer/:id",function(req,resp){
	var id=req.params.id;
	if(typeof req.user !== 'undefined')
	{
		username = req.user.username;
		console.log('connection mysql caddiedelete');
		mysqlhelper.pool.query('INSERT INTO orders_status_history (codeorder, idcustomer, status, statusdate) VALUES ((SELECT orders.codeorder FROM orders, products WHERE products.id = "'+id+'" AND orders.idproduct = products.id), (SELECT customers.ID FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), "annulée", NOW()) ',function(err,rows,fields){
			if(err != null)
			{
				console.log(message + ' ' + err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			
		});
		mysqlhelper.pool.query('UPDATE orders SET deleted = 1, statusdate = NOW(), status = "annulée" WHERE id = "'+id+'" ',function(err,rows,fields){
			if(err != null)
			{
				console.log(message + ' ' + err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			
		});
		resp.writeHead(200);
        resp.end();
	}
	else
	{
		req.session.caddy.splice(req.params.id,1);
		resp.render("checkout.html.twig");
	}
});

//route modifier la quantité des commandes du caddie
router.get("/caddie/modifier/:id/:quantite",function(req,resp){
	var id=req.params.id;
	var quantite=req.params.quantite;
	var total_prix = 0;
	if(typeof req.user !== 'undefined')
	{
		username = req.user.username;
		if (typeof(req.session.caddy) == 'undefined') 
		{
		    req.session.caddy = [];
			console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
		}
		else
		{
			total_prix= total(req);
			console.log(total_prix);
			req.session.caddy.quantite= quantite;
			console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
		}
		console.log('connection mysql caddie modifié');
		mysqlhelper.pool.query('UPDATE orders SET quantity = "'+quantite+'" WHERE id = "'+id+'" ',function(err,rows,fields){
			if(err != null)
			{
				console.log(message + ' ' + err);
			}
			else
			{
				total_prix= total(req);
				console.log(total_prix);
				console.log('query ok'+rows);
			}
			//resp.writeHead(200);
	        resp.status(200).end(''+total_prix);
		});
	}
	else
	{	
		if (typeof(req.session.caddy) == 'undefined') 
		{
		    req.session.caddy = [];
			console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
		}
		else
		{
			total_prix= total(req);
			console.log(total_prix);
			req.session.caddy.quantite= quantite;
			console.log('contenu du caddie en session: '+JSON.stringify(req.session.caddy));
			//resp.end({"total_prix":total_prix});
			resp.status(200).end(''+total_prix);
		}
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