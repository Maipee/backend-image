var express = require('express');
var mysql = require('mysql');
var dateformat = require('dateformat');
var router = express.Router();
var passport = require('passport');
var cfg = require('config');
var mysqlhelper = require('mysqlhelper2');

//route de la HP
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

//route de la page contact
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

//route après l'envoi du formulaire de contact
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

//ROUTES DE REGISTER
//GET
router.get("/register.html",function (req,resp){
	resp.render("register.html.twig");	
});
//POST
//route de la page register
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

	//2 INSERT INTO client
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

	//3 INSERT INTO adresse
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

//route de la page profil
router.get("/profil.html",function(req,resp){
	var profil;
	var adresses;
	
	if(typeof req.user !== 'undefined')
	{
		console.log('connection mysql profil form');
		mysqlhelper.pool.query('SELECT * FROM app_users, customers WHERE app_users.username = "'+req.user.username+'" AND app_users.email = customers.email',function(err,rows,fields){
			if(err != null)
			{
				console.log(err);
			}
			else
			{
				console.log('query profil ok');
				profil=rows;
				//select pour le bloc adresse
				mysqlhelper.pool.query('SELECT * FROM addresses WHERE idcustomer="'+profil[0].id+'"',function(err,rows,fields){
					if(err !=null)
					{
						console.log(err);
					}
					else
					{
						adresses=rows;
						console.log('query adresses ok');
					}	
					console.log(JSON.stringify(rows));
				});
				console.log(profil);
				resp.render("profil.html.twig",{"username":req.user.username,"allProfil":profil,"adresses":adresses});
			}
			console.log(JSON.stringify(rows));
			
		});
		
		
	}
	else
	{
		resp.redirect("index.html");
	}
});

//route après l'envoi du formulaire de profil
router.post("/profil.html",function(req,resp){
	var username = req.body.username;
	var password = req.body.password;
	var nom = req.body.nom;
	var civility = req.body.civilite;
	var prenom = req.body.prenom;
	var email = req.body.email;
	var telephone = req.body.telephone;
	
	var numerodom = req.body.numerodomicile;
	var ruedom = req.body.ruedomicile;
	var CPdom = req.body.CPdomicile;
	var villedom = req.body.villedomicile;
	
	var numerofact = req.body.numerofacturation;
	var ruefact = req.body.ruefacturation;
	var CPfact = req.body.CPfacturation;
	var villefact = req.body.villefacturation;
	
	var numerocour = req.body.numerocourrier;
	var ruecour = req.body.ruecourrier;
	var CPcour = req.body.CPcourrier;
	var villecour = req.body.villecourrier;
	
	var numerolivr = req.body.numerolivraison;
	var ruelivr = req.body.ruelivraison;
	var CPlivr = req.body.CPlivraison;
	var villelivr = req.body.villelivraison;
	
	var livraison = req.body.checkboxlivraison;
	var facturation = req.body.checkboxfacturation;
	var courrier = req.body.checkboxcourrier;
	
	console.log('le nom est : '+nom);
	console.log('connection mysql pour l\'envoi du profil form');
	
	//update profil + bloc adresse domicile
	mysqlhelper.pool.query('UPDATE app_users, customers, addresses SET app_users.username="'+username+'", app_users.password="'+password+'", customers.civility="'+civility+'", customers.lastname="'+nom+'", customers.firstname="'+prenom+'", customers.phone="'+telephone+'", addresses.num="'+numerodom+'", addresses.street="'+ruedom+'", addresses.pc="'+CPdom+'", addresses.city="'+villedom+'" WHERE app_users.username = "'+req.user.username+'" AND app_users.email = customers.email AND addresses.idcustomer = customers.id AND addresses.addresstype = "domicile"',function(err,rows,fields){
		if(err!=null)
		{
			message = "Il y a eu une erreur, le formulaire n'a pas été envoyé";
			console.log(message + ' ' + err);
		}
		else
		{
			console.log('envoi du formulaire ok');
		}
		
	});
	console.log('etat box facturation: '+facturation);
	console.log('etat box courrier: '+courrier);
	console.log('etat box livraison: '+livraison);
	//update bloc facturation
	if(facturation=='on')
	{
		mysqlhelper.pool.query('UPDATE app_users, customers, addresses SET addresses.addresstype = "facturation", addresses.num="'+numerofact+'", addresses.street="'+ruefact+'", addresses.pc="'+CPfact+'", addresses.city="'+villefact+'", addresses.idcustomer = (SELECT customers.id from customers, app_users WHERE app_users.email = customers.email) WHERE app_users.username = "'+username+'" AND app_users.email = customers.email AND addresses.idcustomer = customers.id AND addresses.addresstype = "facturation"',function(err,rows,fields){
		console.log('query update bloc facturation');
		});
	}
	//update du bloc courrier
	if(livraison=='on')
	{
		mysqlhelper.pool.query('UPDATE app_users, customers, addresses SET addresses.addresstype = "courrier", addresses.num="'+numerocour+'", addresses.street="'+ruecour+'", addresses.pc="'+CPcour+'", addresses.city="'+villecour+'", addresses.idcustomer = (SELECT customers.id from customers, app_users WHERE app_users.email = customers.email) WHERE app_users.username = "'+username+'" AND app_users.email = customers.email AND addresses.idcustomer = customers.id AND addresses.addresstype = "courrier"',function(err,rows,fields){
			console.log('query update bloc courrier');
		});
	}
	//update du bloc livraison
	if(courrier=='on')
	{
		mysqlhelper.pool.query('UPDATE app_users, customers, addresses SET addresses.addresstype = "livraison", addresses.num="'+numerolivr+'", addresses.street="'+ruelivr+'", addresses.pc="'+CPlivr+'", addresses.city="'+villelivr+'", addresses.idcustomer = (SELECT customers.id from customers, app_users WHERE app_users.email = customers.email) WHERE app_users.username = "'+username+'" AND app_users.email = customers.email AND addresses.idcustomer = customers.id AND addresses.addresstype = "livraison"',function(err,rows,fields){
			console.log('query update bloc livraison');
		});
	}
	resp.redirect("index.html");
});

//redirige la page index.html vers /
router.get("/index.html",function(req,resp){
	resp.redirect("/");
});

//route de la page decor (liste de produits de la catégorie decor)
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
//route de la page health (liste de produits de la catégorie health)
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

//route de la page mobile (liste de produits de la catégorie mobile)
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
	mysqlhelper.pool.query('SELECT * FROM products WHERE products.deleted=0',function(err,rows,fields){
		if(err != null){
			console.log('*** Query SQL *** SELECT ALL PRODUCTS - Error *** '+err);												
		}else
			console.log('*** Query SQL *** SELECT ALL PRODUCTS - Success *** ');												
			if(typeof req.user !== 'undefined')
			{
				resp.render("products.html.twig",{"list_products":rows,"username":req.user.username});
			}
			else
			{
				resp.render("products.html.twig",{"list_products":rows});
			}
	});
});

// route de la page single (détail du produit)

router.get("/single.html/:id", function (req,resp) {
	var id=req.params.id;
	mysqlhelper.pool.query('SELECT * FROM products WHERE products.id= "'+id+'"',function(err,rows,fields){
		if(err != null){
			console.log('*** Query SQL *** SELECT ONE PRODUCT - Error *** ' + err);												
		}else
			console.log('*** Query SQL *** SELECT ONE PRODUCT - Success *** ');												
			if(typeof req.user !== 'undefined')
			{
				resp.render("single.html.twig",{"products":rows, "img": {
					"img1": "images/si.jpg","img2":"images/si1.jpg","img3":"images/si2.jpg","img4":"images/si3.jpg","img5":"images/s1.jpg","img6":"images/s2.jpg","img7":"images/s3.jpg","img8":"images/s4.jpg"
					},"username":req.user.username
				});
			}
			else
			{
				resp.render("single.html.twig",{"products":rows, "img": {
					"img1": "images/si.jpg","img2":"images/si1.jpg","img3":"images/si2.jpg","img4":"images/si3.jpg","img5":"images/s1.jpg","img6":"images/s2.jpg","img7":"images/s3.jpg","img8":"images/s4.jpg"
					}
				});
			}
	});
});

//route de la page 404
router.get("/404.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("404.html.twig",{"username":req.user.username});
	}
	else
	{
		resp.render("404.html.twig");
	}
});
//route de la page login
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
//route du login après identification
router.post("/login.html",passport.authenticate('local-login',{successRedirect:"/index.html",failureRedirect:"/login.html"}));

//route du logout
router.get("/logout.html",function(req,resp){
	req.logout();
	resp.redirect('index.html');
});
module.exports = router;