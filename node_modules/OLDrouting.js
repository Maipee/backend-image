var xpress=require('express');
var app=xpress();
var passport=require('passport');
var bodyparser=require('body-parser');
var session= require('express-session');
var auth=require('authentification');
var df=require('dateformat');
var router=xpress.Router();
var mysql=require('mysql');
var cfg=require('config');
//les produits en dur
var products=[
			{id:"1",ref:"1",label:"Lorem",price:"123",image:"images/fa.jpg"},
			{id:"2",ref:"2",label:"Lorem",price:"123",image:"images/fa1.jpg"},
			{id:"3",ref:"3",label:"Lorem",price:"123",image:"images/fa2.jpg"},
			{id:"4",ref:"4",label:"Lorem",price:"123",image:"images/fa3.jpg"},
			{id:"5",ref:"5",label:"Lorem",price:"123",image:"images/fa4.jpg"},
			{id:"6",ref:"6",label:"Lorem",price:"123",image:"images/fa5.jpg"},
			{id:"7",ref:"7",label:"Lorem",price:"123",image:"images/fa6.jpg"},
			{id:"8",ref:"8",label:"Lorem",price:"123",image:"images/fa5.jpg"},
			{id:"9",ref:"9",label:"Lorem",price:"123",image:"images/fa6.jpg"},
			{id:"10",ref:"10",label:"Lorem",price:"123",image:"images/fa6.jpg"},
			{id:"11",ref:"11",label:"Lorem",price:"123",image:"images/fa5.jpg"},
			{id:"12",ref:"12",label:"Lorem",price:"123",image:"images/fa6.jpg"}
			];

//j'indique la route de l'index
router.get("/",function (req,resp){	
	if (typeof req.user !== 'undefined'){
		console.log('type defined');
		return resp.render('index.html.twig',{"username":req.user.username});
	}
	else {
		console.log('type undefined');
		resp.render('index.html.twig');
	}
});

//Je créé les routes
	//je créé la route pour la racine et ne pas voir le "index.html" dans l'URL
router.get("/index.html",function (req,resp){
	resp.redirect("/");	
});

router.get("/contact.html",function (req,resp){
	if (typeof req.user !== 'undefined'){
		return resp.render("contact.html.twig",{"username":req.user.username});
	}
	resp.render("contact.html.twig");
});

router.post("/contact.html",function (req,resp){
	var name=req.body.name;
	var email=req.body.email;
	var subject=req.body.subject;
console.log(name);
console.log(email);
console.log(subject);
	
var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});

connection.connect();

connection.query('insert into contact_form (namecontact,email,subject,emailNotification) values ("'+name+'","'+email+'","'+subject+'","'+1+'")',
		function(err,rows,fields){
				if(!err){					
				}
		});
connection.end();
resp.redirect("/contact.html");	
});

//route de la page profil
router.get("/profil.html",function(req,resp){
	
		if(typeof req.user !== 'undefined')
		{
			var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
			connection.connect();
			console.log('connection mysql profil form'+req.user.username);
			var sql='SELECT * FROM user, client, adresse WHERE user.username="'+req.user.username+'" AND user.email=client.email AND adresse.id_client=client.id AND adresse.type="Domicile" ';
			connection.query(sql,function(err,rows,fields){
				
				console.log(sql);
				if(err != null)
				{
					console.log( ' ' + err);
				}
				else
				{
					console.log('query ok'+rows);
				}
				connection.end();
				console.log(rows.length);
				console.log("rows = "+JSON.stringify(rows));
				resp.render("profil.html.twig",{"username":req.user.username,"allProfil":rows});
			});
			
		}
		else
		{
			resp.redirect("/index.html");
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
	var numero = req.body.numero;
	var rue = req.body.rue;
	var cp = req.body.cp;
	var ville = req.body.ville;
	var type = req.body.type;
	console.log('le nom est : '+nom);
	var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
	connection.connect();
	console.log('connection mysql pour l\'envoi du profil form');
	connection.query('UPDATE user, client, adresse SET user.username="'+username+'", user.password="'+password+'", client.civilite="'+civility+'", client.nom="'+nom+'", client.prenom="'+prenom+'", client.email="'+email+'", client.telephone="'+telephone+'", adresse.numero="'+numero+'", adresse.rue="'+rue+'", adresse.cp="'+cp+'", adresse.ville="'+ville+'" WHERE user.username = "'+req.user.username+'" AND user.email = client.email AND adresse.id_client = client.id AND adresse.type = "Domicile"',function(err,rows,fields){
		if(err!=null)
		{
			console.log("Il y a eu une erreur, le formulaire n'a pas été envoyé" + err);
		}
		else
		{
			console.log('envoi du formulaire ok');
		}
		connection.end();
		resp.redirect("/index.html");
	});
	
});
// ROUTES DE REGISTER
	//GET
router.get("/register.html",function (req,resp){
	resp.render("register.html.twig");	
});
	//POST
router.post("/register.html",function (req,resp){
	var connection = mysql.createConnection({host:cfg.DB.dbhost,database:cfg.DB.dbname,user:cfg.DB.dbusername,password:cfg.DB.dbpwd});
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
	var idClient;
	//console.log(req.body.type);
	//console.log(req.body.username);
	connection.connect();
		
	// 1 INSERT INTO user
			
		connection.query('INSERT INTO user(username, password,email) VALUES ("'+username+'","'+password+'" ,"'+email+'")'),function(err,rows,fields){				
		if(err!=null)
		{
			console.log("Il y a eu une erreur INSERT INTO user" + err);
		}
		else
		{
			console.log('envoi INSERT INTO user ok');
		}
		connection.end();
		};
	//2 INSERT INTO client	
		connection.query('INSERT INTO client(civilite, nom,prenom,email,telephone) VALUES ("'+civility+'","'+nom+'","'+prenom+'","'+email+'","'+telephone+'")'),function(err,rows,fields){				
			if(err!=null)
		{
			console.log("Il y a eu une erreur INSERT INTO client" + err);
		}
		else
		{
			console.log('envoi INSERT INTO client ok');
			idClient = rows.insertId
		}
		connection.end();
		};						
	//3 INSERT INTO adresse avec idClient
		connection.query('INSERT INTO adresse(numero,rue,cp,ville,type,id_client) VALUES ("'+numero+'","'+rue+'","'+cp+'","'+ville+'","Domicile",(SELECT LAST_INSERT_ID()))'),function(err,rows,fields){				
		if(err!=null)
		{
			console.log("Il y a eu une erreur INSERT INTO adresse" + err);
		}
		else
		{
			console.log('envoi INSERT INTO adresse ok');
		}
		connection.end();
		};
		resp.redirect("/index.html");
});

router.get("/404.html",function (req,resp){
	resp.render("404.html.twig");	
});

router.get("/checkout.html",function (req,resp){
	resp.render("checkout.html.twig");	
});

router.get("/decor.html",function (req,resp){
	resp.render("decor.html.twig");	
});

router.get("/health.html",function (req,resp){
	resp.render("health.html.twig");	
});

router.get("/mobile.html",function (req,resp){
	resp.render("mobile.html.twig");	
});

router.get("/products.html",function (req,resp){
	// Si je suis connecté, dans le if les produits
	if (typeof req.user !== 'undefined'){
		return resp.render("products.html.twig",{"username":req.user.username,"list_products":products}		
		);
	}	
	resp.render("products.html.twig",
			{"list_products":products});	
});

/////////////////////////////////////////////////////////////////////////////////
//////////////////Route single produit info////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

router.get("/single.html", function (req, resp) {
if(typeof req.user !== 'undefined') {
resp.render("single.html.twig", { "username": req.user.username , "img": {
"img1": "images/si.jpg","img2":"images/si1.jpg","img3":"images/si2.jpg","img4":"images/si3.jpg","img5":"images/s1.jpg","img6":"images/s2.jpg","img7":"images/s3.jpg","img8":"images/s4.jpg"
}
,"prod": {
"lib":"Lorem ipsum dolor sit amet, consectetur adipisicing elit","qut":1,"text":"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.","id":5,"price":32.8
}


});
}
else {

resp.render("single.html.twig", {"img": {
"img1": "images/si.jpg","img2":"images/si1.jpg","img3":"images/si2.jpg","img4":"images/si3.jpg","img5":"images/s1.jpg","img6":"images/s2.jpg","img7":"images/s3.jpg","img8":"images/s4.jpg"
}
,"prod": {
"lib":"Lorem ipsum dolor sit amet, consectetur adipisicing elit","qut":1,"text":"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.","id":5,"price":32.8
}


});



}
});

	//Je créé la route pour se logguer
router.get("/login.html",function (req,resp){
	resp.render("login.html.twig");	
});
	// Utilisation de passport
		//la route
router.post("/login.html",passport.authenticate('local-login',{successRedirect:"/index.html",failureRedirect:"/login.html"
}));

router.get("/logout.html",function (req,resp){
	req.logout();
	resp.redirect ("/");
})



module.exports=router;






