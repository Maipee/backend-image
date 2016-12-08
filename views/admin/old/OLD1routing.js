var express = require('express');
var mysql = require('mysql');
var dateformat = require('dateformat');
var router = express.Router();
var passport = require('passport');
var cfg = require('config');
var mysqlhelper = require('mysqlhelper2');


// route de la HP
router.get("/",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("index.html.twig",{"username":req.user.username});
	}
	else
	{
		resp.render("index.html.twig");
	}
});

// route de la page contact
router.get("/contact.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("contact.html.twig",{"username":req.user.username});
	}
	else
	{
		resp.render("contact.html.twig");
	}
});

// route après l'envoi du formulaire de contact
router.post("/contact.html",function(req,resp){
	var name = req.body.name;
	var email = req.body.email;
	var subject = req.body.subject;
	console.log('le nom est : '+name);
	console.log('l\' email : '+email);
	console.log('le sujet est : '+subject);
	console.log('connection mysql');
	mysqlhelper.pool.query('INSERT INTO contact_form (id, name, email, subject, emailnotification) VALUES (NULL, "'+name+'", "'+email+'", "'+subject+'", 1)',function(err,rows,fields){
		if(err != null)
		{
			message = "Il y a eu une erreur, le message n'a pas été envoyé";
			console.log(message + ' ' + err);
		}
		else
		{
			message = "Votre message a bien été envoyé";
			console.log('message envoyé');
		}		
		
		if(typeof req.user !== 'undefined')
		{
			resp.render("contact.html.twig",{"username":req.user.username, "message":message});
		}
		else
		{
			resp.render("contact.html.twig",{"message":message});
		}
	});
});

// ROUTES DE REGISTER
// GET
router.get("/register.html",function (req,resp){
resp.render("register.html.twig");	
});
// POST
// route de la page register
router.post("/register.html",function (req,resp){
	var username = req.body.username;
	var password = req.body.password;
	var nom = req.body.nom;
	var civility = req.body.civilite;
	var prenom = req.body.prenom;
	var email = req.body.email;
	var telephone = req.body.telephone;
	var numero = req.body.numero;
	var rue = req.body.rue;
	var cp = req.body.cp;
	var ville = req.body.ville;
	var type = req.body.type;
	// console.log(req.body.type);
	// console.log(req.body.username);
	
	// 1 INSERT INTO user
	
	mysqlhelper.pool.query('INSERT INTO app_users(username, password, email) VALUES ("'+username+'","'+password+'" ,"'+email+'")',function(err,rows,fields){				
		if(err!=null)
		{
			console.log("Il y a eu une erreur INSERT INTO app_users" + err);
		}
		else
		{
			console.log('envoi INSERT INTO app_users ok');
		}
	});

	// 2 INSERT INTO client
	mysqlhelper.pool.query('INSERT INTO customers(civility, lastname, firstname, email, phone) VALUES ("'+civility+'","'+nom+'","'+prenom+'","'+email+'","'+telephone+'")',function(err,rows,fields){				
		if(err!=null)
		{
			console.log("Il y a eu une erreur INSERT INTO customer" + err);
		}
		else
		{
			console.log('envoi INSERT INTO customer ok');
		}
	});		

	// 3 INSERT INTO adresse
	mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numero+'","'+rue+'","'+cp+'","'+ville+'","domicile",(SELECT LAST_INSERT_ID()))',function(err,rows,fields){				
	if(err!=null)
	{
		console.log("Il y a eu une erreur INSERT INTO addresses" + err);
	}
	else
	{
		console.log('envoi INSERT INTO addresses ok');
	}
	});

	resp.redirect("/index.html");	
});		

// route de la page profil
router.get("/profil.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		console.log('connection mysql profil form');
		mysqlhelper.pool.query('SELECT * FROM app_users, customers, addresses WHERE app_users.username = "'+req.user.username+'" AND app_users.email = customers.email AND addresses.idcustomer = customers.id AND addresses.addresstype = "domicile" ',function(err,rows,fields){
		if(err != null)
		{
			console.log(err);
		}
		else
		{
			console.log('query ok'+rows);
		}
		console.log(JSON.stringify(rows));
		resp.render("profil.html.twig",{"username":req.user.username,"allProfil":rows});
		});	
	}
	else
	{
		resp.redirect("index.html");
	}
});

// route après l'envoi du formulaire de profil
router.post("/profil.html",function(req,resp){
	var username = req.body.username;
	var password = req.body.password;
	var nom = req.body.nom;
	var civility = req.body.civilite;
	var prenom = req.body.prenom;
	var email = req.body.email;
	var telephone = req.body.telephone;
	var numero = req.body.numero;
	var rue = req.body.rue;
	var CP = req.body.CP;
	var ville = req.body.ville;
	var type_adr = req.body.type_adr;
	console.log('le nom est : '+nom);
	console.log('connection mysql pour l\'envoi du profil form');
	mysqlhelper.pool.query('UPDATE app_users, customers, addresses SET app_users.username="'+username+'", app_users.password="'+password+'", customers.civility="'+civility+'", customers.lastname="'+nom+'", customers.firstname="'+prenom+'", customers.email="'+email+'", customers.phone="'+telephone+'", addresses.num="'+numero+'", addresses.street="'+rue+'", addresses.pc="'+CP+'", addresses.city="'+ville+'" WHERE app_users.username = "'+req.user.username+'" AND app_users.email = customers.email AND addresses.idcustomer = customers.id AND addresses.addresstype = "domicile"',function(err,rows,fields){
		if(err!=null)
		{
			message = "Il y a eu une erreur, le formulaire n'a pas été envoyé";
			console.log(message + ' ' + err);
			console.log(CP);
		}
		else
		{
			console.log('envoi du formulaire ok');
		}
		resp.redirect("index.html");
	});
});

// redirige la page index.html vers /
router.get("/index.html",function(req,resp){
	resp.redirect("/");
});
// route de la page checkout (paiement)
router.get("/checkout.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		username = req.user.username;
		console.log('connection mysql affichecaddie');
		mysqlhelper.pool.query('SELECT orders.idcustomer, orders.deleted, orders.id, orders.codeorder, orders.idproduct, orders.quantity, orders.statusdate, orders.status, orders.price, products.label, products.picture, products.price FROM orders, products WHERE idcustomer = (SELECT customers.id FROM customers, app_users WHERE app_users.username="'+username+'" AND customers.email = app_users.email) AND products.id = orders.idproduct AND orders.status = "en caddie" AND orders.deleted=0 ',function(err,rows,fields){
			if(err != null)
			{
				console.log(err);
			}
			else
			{
				console.log('query ok'+rows);
			}
			resp.render("checkout.html.twig",{"username":req.user.username, "liste_commande":rows});
		});
	}
	else
	{
		console.log(req.user);
		if (typeof(req.session.caddy) == 'undefined') 
		{
		req.session.caddy = [];
		resp.render("checkout.html.twig",{'caddy':req.session.caddy});
		}
		else
		{
			resp.render("checkout.html.twig",{'caddy':req.session.caddy});
		}
	}
});
// route de la page decor (liste de produits de la catégorie decor)
router.get("/decor.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("index.html.twig",{"username":req.user.username});
	}
	else
	{
	resp.render("decor.html.twig");
	}
});
// route de la page health (liste de produits de la catégorie health)
router.get("/health.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("health.html.twig",{"username":req.user.username});
	}
	else
	{
	resp.render("health.html.twig");
	}
});

// route de la page mobile (liste de produits de la catégorie mobile)
router.get("/mobile.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("mobile.html.twig",{"username":req.user.username});
	}
	else
	{
	resp.render("mobile.html.twig");
	}
});
// route de la page products (liste de produits de la catégorie products)
//!!! refaire tourner CREATE TABLE.sql pour ajouter le chemin des images dans la table products!!!!!!!


router.get("/products.html",function (req,resp){
	if(typeof req.user !== 'undefined'){
			console.log('connection mysql products');
			mysqlhelper.pool.query('SELECT * FROM products WHERE products.deleted=0',function(err,rows,fields){
				if(err != null){
					console.log('query products nok'+err);												
				}else
					resp.render("products.html.twig",{"list_products":rows,"username":req.user.username});
			});
	}
});

// route de la page single (détail du produit)

router.get("/single.html/:id", function (req,resp) {
	if(typeof req.user !== 'undefined'){
	var id=req.params.id;
	console.log('connection mysql products for single');
	mysqlhelper.pool.query('SELECT * FROM products WHERE products.id= "'+id+'"',function(err,rows,fields){
		if(err != null){
			console.log('query products for single nok'+err);												
		}else
			resp.render("single.html.twig",{"products":rows,"username":req.user.username, "img": {
				"img1": "images/si.jpg","img2":"images/si1.jpg","img3":"images/si2.jpg","img4":"images/si3.jpg","img5":"images/s1.jpg","img6":"images/s2.jpg","img7":"images/s3.jpg","img8":"images/s4.jpg"
				},"prod": {
				"lib":"Lorem ipsum dolor sit amet, consectetur adipisicing elit","qut":1,"text":"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.","id":5,"price":32.8
				} 
			});
	});
	}
});

// route de la page 404
router.get("/404.html",function(req,resp){
	resp.render("404.html.twig");
});
// route de la page login
router.get("/login.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("login.html.twig",{"username":req.user.username});
	}
	else
	{
		resp.render("login.html.twig");
	}
});
// route du login après identification
router.post("/login.html",passport.authenticate('local-login',{successRedirect:"/index.html",failureRedirect:"/login.html"}));

// route du logout
router.get("/logout.html",function(req,resp){
	req.logout();
	resp.redirect('index.html');
})

module.exports=router