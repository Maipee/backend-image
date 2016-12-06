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

function total(req){
	console.log('*** Caddie - total calculating *** initialize the total price to 0');
	var total_prix = 0;
	if(typeof req.session.caddy == "undefined")
	{
		console.log('*** Caddie - total calculating *** No caddy in session - No calcul to make');
	}
	else
	{
		console.log('*** Caddie - total calculating *** Caddy in session - with items : ' +JSON.stringify(req.session.caddy));
		for(var i=0;i<req.session.caddy.length;i++)
		{
			console.log('*** Caddie - total calculating *** Caddy in session - order : ' +req.session.caddy[i].id+' on product with id '+ req.session.caddy[i].idproduct +' with price ' + req.session.caddy[i].price);
			total_prix = req.session.caddy[i].price + total_prix;
		}
		console.log('*** Caddie - total calculating *** Caddy in session - with total price : ' +total_prix);
	}
	console.log('*** Caddie - total calculating *** return the following total price ' + total_prix);
	return total_prix;
};

// route de la page checkout (paiement)
router.get("/checkout.html",function(req,resp){
	console.log('*** Caddie - afficher - checkout *** Begin ***');

	if (typeof req.session.caddy == 'undefined'){
		console.log('*** Caddie - afficher - checkout *** No caddy in session - initialize an empty one');
		req.session.caddy = [];
	}
	console.log('*** Caddie - afficher - checkout *** Caddy in session with contents' + JSON.stringify(req.session.caddy));
	var tot = total(req);
	console.log('*** Caddie - afficher - checkout *** Caddy in session total price '+ tot);
	
	if(typeof req.user == 'undefined'){
		console.log('*** Caddie - afficher - checkout *** END - redirect to checkout - no user logged in');
		resp.render("checkout.html.twig",{"liste_commande":req.session.caddy,"total_prix":tot});
	}else{
		username = req.user.username;
		console.log('*** Caddie - afficher - checkout *** user is logged with name ' + username);
		console.log('*** Caddie - afficher - checkout *** SQL query SELECT FROM PRODUCTS ***');
		mysqlhelper.pool.query('SELECT orders.idcustomer, orders.deleted, orders.id, orders.codeorder, orders.idproduct, orders.quantity, orders.statusdate, orders.status, orders.price, products.label, products.picture FROM orders, products WHERE idcustomer = (SELECT customers.id FROM customers, app_users WHERE app_users.username="'+username+'" AND customers.email = app_users.email) AND products.id = orders.idproduct AND orders.status = "en caddie" AND orders.deleted=0 ',function(err,rows,fields){
			if(err != null){
				console.log('*** Caddie - afficher - checkout *** SQL query SELECT FROM PRODUCTS - Error - ' + err);
				//TODO must do something when errors occurs
			}
			else{	
				console.log('*** Caddie - afficher - checkout *** SQL query SELECT FROM PRODUCTS - Success with results ' + JSON.stringify(rows));
				var tot= total(req);
				console.log('*** Caddie - afficher - checkout *** END - redirect to checkout');
				resp.render("checkout.html.twig",{"username":req.user.username, "liste_commande":rows,"total_prix":tot});
			}
		});
	}

	
/*	if(typeof req.user !== 'undefined')
	{
		console.log('*** Caddie - afficher - checkout *** user is logged with name ' + username);
		username = req.user.username;
		console.log('*** Caddie - afficher - checkout *** SQL query SELECT FROM PRODUCTS ***');
		mysqlhelper.pool.query('SELECT orders.idcustomer, orders.deleted, orders.id, orders.codeorder, orders.idproduct, orders.quantity, orders.statusdate, orders.status, orders.price, products.label, products.picture FROM orders, products WHERE idcustomer = (SELECT customers.id FROM customers, app_users WHERE app_users.username="'+username+'" AND customers.email = app_users.email) AND products.id = orders.idproduct AND orders.status = "en caddie" AND orders.deleted=0 ',function(err,rows,fields){
			if(err != null)
			{
				console.log('*** Caddie - afficher - checkout *** SQL query SELECT FROM PRODUCTS - Error - ' + err);
			}
			else
			{	

				console.log('*** Caddie - afficher - checkout *** SQL query SELECT FROM PRODUCTS - Success with results ' + JSON.stringify(rows));
				var tot= total(req);
				console.log('*** Caddie - afficher - checkout *** END - redirect to checkout');
				resp.render("checkout.html.twig",{"username":req.user.username, "liste_commande":rows,"total_prix":tot});
			}
		});
	}
	else
	{
		if (typeof req.session.caddy == 'undefined') 
		{
			console.log('*** Caddie - afficher - checkout *** No caddy in session - initialize an empty one');
			req.session.caddy = [];
		}
			console.log('*** Caddie - afficher - checkout *** Caddy in session with contents' + JSON.stringify(req.session.caddy));
			var tot = total(req);
			console.log('*** Caddie - afficher - checkout *** Caddy in session total price '+ tot);
			console.log('*** Caddie - afficher - checkout *** END - redirect to checkout');
			resp.render("checkout.html.twig",{"liste_commande":req.session.caddy,"total_prix":tot});
	}*/
});

// route pour ajouter une commande dans le caddie
router.get("/caddie/ajouter/:id/:quantite",function(req,resp){
	console.log('*** Caddie - ajouter *** Begin ***');
	var id=req.params.id;
	var quantite=req.params.quantite;
	var params = querystring.parse(url.parse(req.url).query);
	var status = 'en caddie';
	var row = 0;
	console.log('*** Caddie - ajouter *** id:'+id+' qte:'+quantite+' params:'+JSON.stringify(params)+ '***');
	
	
	
	
	console.log('*** Caddie - ajouter *** SQL query SELECT FROM PRODUCTS ***');
	mysqlhelper.pool.query('SELECT price, picture FROM products WHERE id = "'+id+'" ',function(err,rows,fields){
		if(err != null){
			console.log('*** Caddie - ajouter *** SQL query - Error - ***' + err);
		}
		else{
			console.log('*** Caddie - ajouter *** SQL query - Success - with results ***' +JSON.stringify(rows));
		}
		for(i=0; i<rows.length; i++){
			row = rows[i];
			console.log('*** Caddie - ajouter *** SQL query - Success - getting result ***' + JSON.stringify(row));
		}
		var productprice = row.price;
		var picture = row.picture;
		var prix = quantite*productprice;
		console.log('*** Caddie - ajouter *** calculate order price  - '+productprice+' x '+ quantite + ' = ' + prix);

		if (typeof(req.session.caddy) == 'undefined'){
			console.log('*** Caddie - ajouter *** no caddy in session - initialize an empty one');
		    req.session.caddy = [];
		}
		req.session.caddy.push({'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
		console.log('*** Caddie - ajouter *** put infos into the caddy : ' + JSON.stringify(req.session.caddy));
		console.log('*** Caddie - ajouter *** END - redirect to single');
		if(typeof req.user == 'undefined'){
			console.log('*** Caddie - ajouter *** END - user is anonymous');
			resp.status(200).end();
			//resp.redirect("/single.html/"+id);
		}
		else{
			username = req.user.username;
			console.log('*** Caddie - ajouter *** user is logged with name ' + username);
			// ajout en DB
			console.log('*** Caddie - ajouter *** SQL query INSERT INTO ORDERS *** Begin');
			mysqlhelper.pool.query('INSERT INTO orders (idproduct, quantity, idcustomer, price, statusdate, codeorder, status) VALUES ("'+id+'", "'+quantite+'", (SELECT customers.id FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), (SELECT price FROM products WHERE id = "'+id+'") * "'+quantite+'", NOW(), (SELECT customers.id FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), "en caddie") ',function(err,rows,fields){
				if(err != null){
					console.log('*** Caddie - ajouter *** SQL query - Error - ***' + err);
				}
				else{
					console.log('*** Caddie - ajouter *** SQL query - Success***');
				}
				console.log('*** Caddie - ajouter *** END - redirect to single');
				resp.status(200).end();
				//resp.redirect("/single.html/"+id);
			});
			
		}

		
		
		/*if(typeof req.user !== 'undefined'){
			username = req.user.username;
			console.log('*** Caddie - ajouter *** user is logged with name ' + username);
			// ajout en session
			if (typeof(req.session.caddy) == 'undefined'){
				console.log('*** Caddie - ajouter *** no caddy in session - initialize an empty one');
			    req.session.caddy = [];
			    req.session.caddy.push({'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				console.log('*** Caddie - ajouter *** put infos into the caddy' + {'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				console.log('*** Caddie - ajouter *** END - redirect to single');
				resp.redirect("/single.html/"+id);
			}
			else{
				console.log('*** Caddie - ajouter *** caddy in session');
				console.log('*** Caddie - ajouter *** put infos into the caddy' + {'ididproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				req.session.caddy.push({'ididproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				console.log('*** Caddie - ajouter *** END - redirect to single');
				resp.redirect("/single.html/"+id);
			}
			// ajout en DB
			console.log('connection mysql ajoutecommande');
			console.log('*** Caddie - ajouter *** SQL query INSERT INTO ORDERS *** Begin');
			mysqlhelper.pool.query('INSERT INTO orders (idproduct, quantity, idcustomer, price, statusdate, codeorder, status) VALUES ("'+id+'", "'+quantite+'", (SELECT customers.id FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), (SELECT price FROM products WHERE id = "'+id+'") * "'+quantite+'", NOW(), (SELECT customers.id FROM customers, app_users WHERE app_users.username = "'+username+'" AND app_users.email = customers.email), "en caddie") ',function(err,rows,fields){
				if(err != null){
					console.log('*** Caddie - ajouter *** SQL query - Error - ***' + err);
				}
				else{
					console.log('*** Caddie - ajouter *** SQL query - Success***');
				}
				console.log('*** Caddie - ajouter *** END - redirect to single');
				resp.redirect("/single.html/"+id);
			});
			
		}
		else
		{
			console.log('*** Caddie - ajouter *** user is anonymous');
			if (typeof(req.session.caddy) == 'undefined') 
			{
				console.log('*** Caddie - ajouter *** no caddy in session - initialize an empty one');
			    req.session.caddy = [];
			    req.session.caddy.push({'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				console.log('*** Caddie - ajouter *** put infos into the caddy' + {'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				console.log('*** Caddie - ajouter *** END - redirect to single');
				resp.redirect("/single.html/"+id);
			}
			else
			{
				console.log('*** Caddie - ajouter *** caddy in session');
				console.log('*** Caddie - ajouter *** put infos into the caddy' + {'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				req.session.caddy.push({'idproduct':id,'quantity':quantite,'price':prix,'status':status,'picture':picture,'productprice':productprice});
				console.log('*** Caddie - ajouter *** END - redirect to single');
				resp.redirect("/single.html/"+id);
			}
		}*/
	});
	
});

// route supprimer une commande du caddie
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

// route modifier la quantité des commandes du caddie
router.get("/caddie/modifier/:id/:quantite",function(req,resp){
	console.log('*** Caddie - modifier *** Begin ***');
	var id=req.params.id;
	var quantite=req.params.quantite;
	var total_prix = 0;
	
	var fromSession;
	for(var i=0; i< req.session.caddy.length; i++){
		console.log('*** Caddie - modifier *** Finding caddy : ' + i);
		if(req.session.caddy[i].idproduct == id){
			fromSession = req.session.caddy[i];
		}
	}
	if(typeof fromSession !== 'undefined'){
		console.log('*** Caddie - modifier *** Finded caddy : ' + JSON.stringify(fromSession));
		fromSession.quantity = quantite;
		fromSession.price = fromSession.productprice * fromSession.quantity;
		console.log('*** Caddie - modifier ***  '+fromSession.productprice+' * '+fromSession.quantity+' = ' + fromSession.price);
		var tot= total(req);
		if(typeof req.user == 'undefined'){
			console.log('*** Caddie - modifier *** END - anonymous - returning new total : ' + tot);
			resp.status(200).end(''+tot);
		}
		else{
			console.log('*** Caddie - modifier *** Someone logged in with username : '+req.user.username);
			console.log('*** Caddie - modifier *** SQL - UPDATE ORDERS');
			mysqlhelper.pool.query('UPDATE orders SET quantity = "'+fromSession.quantity+'",  price = "'+fromSession.price+'" WHERE id = "'+id+'" ',function(err,rows,fields){
				if(err != null)
				{
					console.log('*** Caddie - modifier *** SQL - UPDATE ORDERS - Error' + err);
				}
				else
				{
					console.log('*** Caddie - modifier *** SQL - UPDATE ORDERS - Success');
					var tot= total(req);
					console.log('*** Caddie - modifier *** END returning new total : ' + tot);
			        resp.status(200).end(''+tot);
//			        resp.status(200).end(JSON.stringify({'total':tot,'nbr_items':req.session.caddy.length}));
				}
			});
		}
	}

	
/*	var id=req.params.id;
	var quantite=req.params.quantite;
	var total_prix = 0;
	if(typeof req.user !== 'undefined')
	{
		console.log('*** Caddie - modifier *** Someone logged in with username : '+req.user.username);
		var fromSession;
		for(var i=0; i< req.session.caddy.length; i++){
			if(req.ssession.caddy[i].id == id){
				fromSession = req.ssession.caddy[i];
			}
		}
		fromSession.quantity = quantite;
		fromSession.price = fromSession.productprice * fromSession.quantite;
		console.log('*** Caddie - modifier *** SQL - UPDATE ORDERS');
		mysqlhelper.pool.query('UPDATE orders SET quantity = "'+quantite+'" WHERE id = "'+id+'" ',function(err,rows,fields){
			if(err != null)
			{
				console.log('*** Caddie - modifier *** SQL - UPDATE ORDERS - Error' + err);
			}
			else
			{
				console.log('*** Caddie - modifier *** SQL - UPDATE ORDERS - Success');
				var tot= total(req);
				console.log('*** Caddie - modifier *** END returning new total : ' + tot);
		        resp.status(200).end(''+tot);
			}
		});
	}
	else
	{	
		console.log('*** Caddie - modifier *** Nobody logged in - anonymous user');
		var fromSession;
		for(var i=0; i< req.session.caddy.length; i++){
			console.log('*** Caddie - modifier *** Finding caddy : ' + i);
			if(req.session.caddy[i].idproduct == id){
				fromSession = req.session.caddy[i];
			}
		}
		if(typeof fromSession !== 'undefined'){
			console.log('*** Caddie - modifier *** Finded caddy : ' + JSON.stringify(fromSession));
			fromSession.quantity = quantite;
			fromSession.price = fromSession.productprice * fromSession.quantite;
			var tot= total(req);
			console.log('*** Caddie - modifier *** END returning new total : ' + tot);
			resp.status(200).end(''+tot);
		}
	}*/
});

// route continuer: retour à la page précédent l'arrivée sur le caddie
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

// route valider le caddie
router.get("/caddie/valider",function(req,resp){
	resp.render("valider.html.twig",{"username":req.user.username});
});

// route pour clearer le caddie
router.get("/caddie/clear", function(req, resp){
	req.session.caddy = [];
	resp.redirect('/');
});

module.exports = router;