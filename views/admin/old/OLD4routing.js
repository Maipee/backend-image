var express = require('express');
var mysql = require('mysql');
var dateformat = require('dateformat');
var router = express.Router();
var passport = require('passport');
var cfg = require('config');
var mysqlhelper = require('mysqlhelper2');
var customerid;
var regcustomerid;
var nbitem;

//route de la HP
router.get("/",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		if(req.session.caddy){
			nbitem=req.session.caddy.length;
		}
		else{
			nbitem=0;
		}
		resp.render("index.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
	}
	else
	{
		if(req.session.caddy){
			nbitem=req.session.caddy.length;
		}
		else{
			nbitem=0;
		}
		
		resp.render("index.html.twig",{"nbitem":nbitem});
	}
});

//route de la page contact
router.get("/contact.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		if(req.session.caddy){
			nbitem=req.session.caddy.length;
		}
		else{
			nbitem=0;
		}
		resp.render("contact.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
	}
	else
	{
		if(req.session.caddy){
			nbitem=req.session.caddy.length;
		}
		else{
			nbitem=0;
		}
		resp.render("contact.html.twig",{"nbitem":nbitem});
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
			if(req.session.caddy){
				nbitem=req.session.caddy.length;
			}
			else{
				nbitem=0;
			}
			resp.render("contact.html.twig",{"username":req.user.username, "message":message,"nbitem":nbitem,"role":req.user.role});
		}
		else
		{
			if(req.session.caddy){
				nbitem=req.session.caddy.length;
			}
			else{
				nbitem=0;
			}
			resp.render("contact.html.twig",{"message":message,"nbitem":nbitem});
		}
	});
});

//ROUTES DE REGISTER
//GET
router.get("/register.html",function (req,resp){
	if(req.session.caddy){
		nbitem=req.session.caddy.length;
	}
	else{
		nbitem=0;
	}
	resp.render("register.html.twig",{"nbitem":nbitem});	
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
	
	// 1 INSERT INTO user
	
	mysqlhelper.pool.query('INSERT INTO app_users(username, password, email) VALUES ("'+username+'","'+password+'" ,"'+email+'")',function(err,rows,fields){				
		if(err!=null)
		{
			console.log("Il y a eu une erreur INSERT INTO app_users" + err);
		}
		else
		{
			// 2 INSERT INTO customer
			mysqlhelper.pool.query('INSERT INTO customers(civility, lastname, firstname, email, phone) VALUES ("'+civility+'","'+nom+'","'+prenom+'","'+email+'","'+telephone+'")',function(err,rows,fields){				
				if(err!=null)
				{
					console.log("Il y a eu une erreur INSERT INTO customer" + err);
				}
				else
				{               
					// 3 insert des adresses
					mysqlhelper.pool.query('SELECT id FROM customers WHERE email="'+email+'"',function(err,rows,fields){
						for(i=0;i<rows.length;i++)
						{
							row = rows[i];
							console.log('row :'+row);
						}
						regcustomerid = row.id;
						console.log('regcustomerid: '+regcustomerid);
						
						mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerodom+'","'+ruedom+'","'+CPdom+'","'+villedom+'","domicile","'+regcustomerid+'")',function(err,rows,fields){				
							if(err!=null)
							{
								console.log("Il y a eu une erreur INSERT INTO addresses" + err);
							}
							else
							{
								console.log('envoi INSERT INTO addresses ok');
							}
						});
							//insert bloc adresse courrier
							if(courrier=='on')
							{
								mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerocour+'","'+ruecour+'","'+CPcour+'","'+villecour+'","courrier","'+regcustomerid+'")',function(err,rows,fields){
									if(err != null)
									{
										message = "Il y a eu une erreur dans le block courrier, le formulaire n'a pas été envoyé";
										console.log(message + ' ' + err);
									}
									else
									{
										console.log('query insert bloc courrier');
									}
								});
							}
							//insert bloc livraison 
							if(livraison=='on')
							{
								mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerolivr+'","'+ruelivr+'","'+CPlivr+'","'+villelivr+'","livraison","'+regcustomerid+'")',function(err,rows,fields){
									if(err != null)
									{
										message = "Il y a eu une erreur dans le block livraison, le formulaire n'a pas été envoyé";
										console.log(message + ' ' + err);
									}
									else
									{
										console.log('query insert bloc livraison');
									}
								});
							}
							if(facturation=='on')
							{
								mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerofact+'","'+ruefact+'","'+CPfact+'","'+villefact+'","facturation","'+regcustomerid+'")',function(err,rows,fields){
									if(err != null)
									{
										message = "Il y a eu une erreur dans le block facturation, le formulaire n'a pas été envoyé";
										console.log(message + ' ' + err);
									}
									else
									{
										console.log('query insert bloc facturation');
									}
								});
							}
					});
					console.log('envoi INSERT INTO customer ok');
				}
			});		
			console.log('envoi INSERT INTO app_users ok');
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
					customerid = profil[0].id;
					console.log('customerid: '+customerid);
					console.log('var profil: '+JSON.stringify(profil));
					console.log('var adresses: '+JSON.stringify(adresses));
					if(req.session.caddy){
						nbitem=req.session.caddy.length;
					}
					else{
						nbitem=0;
					}
					resp.render("profil.html.twig",{"username":req.user.username,"allProfil":profil,"adresses":adresses,"nbitem":nbitem,"role":req.user.role});
				});			
			}		
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
			message = "Il y a eu une erreur dans le formulaire, il n'a pas été envoyé";
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
	//update bloc facturation ou insert si adresse facturation non renseignée
	if(facturation=='on')
	{
		mysqlhelper.pool.query('SELECT * FROM addresses WHERE addresstype="facturation" AND idcustomer="'+customerid+'"',function(err,rows,fields){
			if(rows.length > 0)
			{
				mysqlhelper.pool.query('UPDATE addresses SET addresstype = "facturation", num="'+numerofact+'", street="'+ruefact+'", pc="'+CPfact+'", city="'+villefact+'", idcustomer = "'+customerid+'" WHERE addresses.addresstype = "facturation"',function(err,rows,fields){
					console.log('query update bloc facturation');
					console.log('customerid: '+customerid)
					});
			}
			else
			{
				mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerofact+'","'+ruefact+'","'+CPfact+'","'+villefact+'","facturation","'+customerid+'")',function(err,rows,fields){
					if(err != null)
					{
						message = "Il y a eu une erreur dans le block facturation, le formulaire n'a pas été envoyé";
						console.log(message + ' ' + err);
					}
					else{
					console.log('query insert bloc facturation');
					}
				});
			}
			});	
	}
	//update du bloc courrier ou insert si adresse courrier non renseignée
	if(courrier=='on')
	{
		mysqlhelper.pool.query('SELECT * FROM addresses WHERE addresstype="courrier" AND idcustomer="'+customerid+'"',function(err,rows,fields){
			if(rows.length > 0)
			{
				mysqlhelper.pool.query('UPDATE addresses SET addresstype = "courrier", num="'+numerocour+'", street="'+ruecour+'", pc="'+CPcour+'", city="'+villecour+'", idcustomer= "'+customerid+'" WHERE addresses.addresstype = "courrier"',function(err,rows,fields){
					console.log('query update bloc courrier');
				});
			}
			else
			{
				mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerocour+'","'+ruecour+'","'+CPcour+'","'+villecour+'","courrier","'+customerid+'")',function(err,rows,fields){
					if(err != null)
					{
						message = "Il y a eu une erreur dans le block courrier, le formulaire n'a pas été envoyé";
						console.log(message + ' ' + err);
					}
					else{
					console.log('query insert bloc courrier');
					}
				});
			}
		});
			
		
	}
	//update du bloc livraison ou insert si adresse livraison non renseignée
	if(livraison=='on')
	{
		mysqlhelper.pool.query('SELECT * FROM addresses WHERE addresstype="livraison" AND idcustomer="'+customerid+'"',function(err,rows,fields){
			if(rows.length > 0)
			{
				mysqlhelper.pool.query('UPDATE addresses SET addresstype = "livraison", num="'+numerolivr+'", street="'+ruelivr+'", pc="'+CPlivr+'", city="'+villelivr+'", idcustomer = "'+customerid+'" WHERE addresses.addresstype = "livraison"',function(err,rows,fields){
					console.log('query update bloc livraison');
				});
			}
			else
			{
				mysqlhelper.pool.query('INSERT INTO addresses(num, street, pc, city, addresstype, idcustomer) VALUES ("'+numerolivr+'","'+ruelivr+'","'+CPlivr+'","'+villelivr+'","livraison","'+customerid+'")',function(err,rows,fields){
					if(err != null)
					{
						message = "Il y a eu une erreur dans le block livraison, le formulaire n'a pas été envoyé";
						console.log(message + ' ' + err);
					}
					else{
					console.log('query insert bloc livraison');
					}
				});
			}
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
		resp.render("index.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
	}
	else
	{
		
	resp.render("decor.html.twig",{"nbitem":nbitem});
	}
});
//route de la page health (liste de produits de la catégorie health)
router.get("/health.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("health.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
	}
	else
	{
	resp.render("health.html.twig",{"nbitem":nbitem});
	}
});

//route de la page mobile (liste de produits de la catégorie mobile)
router.get("/mobile.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("mobile.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
	}
	else
	{
	resp.render("mobile.html.twig",{"nbitem":nbitem});
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
				if(req.session.caddy){
					nbitem=req.session.caddy.length;
				}
				else{
					nbitem=0;
				}
				resp.render("products.html.twig",{"list_products":rows,"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
			}
			else
			{
				if(req.session.caddy){
					nbitem=req.session.caddy.length;
				}
				else{
					nbitem=0;
				}
				resp.render("products.html.twig",{"list_products":rows,"nbitem":nbitem});
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
				if(req.session.caddy){
					nbitem=req.session.caddy.length;
				}
				else{
					nbitem=0;
				}
				resp.render("single.html.twig",{"products":rows,"username":req.user.username,"nbitem":nbitem,"role":req.user.role
				});
			}
			else
			{
				if(req.session.caddy){
					nbitem=req.session.caddy.length;
				}
				else{
					nbitem=0;
				}
				resp.render("single.html.twig",{"products":rows,"nbitem":nbitem 
				});
			}
	});
});

//route de la page 404
router.get("/404.html",function(req,resp){
	if(typeof req.user !== 'undefined')
	{
		resp.render("404.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
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
		resp.render("login.html.twig",{"username":req.user.username,"nbitem":nbitem,"role":req.user.role});
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