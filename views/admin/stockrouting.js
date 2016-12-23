var express = require('express');
var df = require('dateformat');
var passport = require('passport');
var router = express.Router();
var mysql = require('mysql');
var cfg = require('config');
var sqlhelper = require('mysqlhelper2');
var nodemailer = require('nodemailer');

router.get("/stock/list.html", function (req, resp) {
	
	var liststocks = {};
	console.log("Module stock*** START *** SQL - List all stocks ***")
	sqlhelper.pool.query('SELECT * FROM STOCK',function(err,rows,fields){
		if(err != null)
		{
			console.log("Module stock*** SQL end with errors - get NO result - get an error : " + err);
		}
		else
		{
			liststocks = rows;
			console.log("Module stock*** SQL end without errors - get a result : " + JSON.stringify(rows));
		}
		console.log("Module stock*** END *** SQL - List all stocks - Rendering results")
		resp.render("admin/stocks.html.twig", {"liststocks":liststocks});
});
});
router.get("/stock/managment.html", function (req, resp) {
	
	var liststocks = {};
	console.log("Module stock*** START *** SQL - List all stocks ***")
	sqlhelper.pool.query('SELECT PRODUCTS.ID, PRODUCTS.LABEL, PRODUCTS.STOCK, STOCK.QTY, STOCK.IDSUPPLIER FROM PRODUCTS , STOCK WHERE PRODUCTS.ID=STOCK.IDPRODUCT GROUP BY PRODUCTS.ID, STOCK.QTY, STOCK.IDSUPPLIER',function(err,rows,fields){
		if(err != null)
		{
			console.log("Module stock*** SQL end with errors - get NO result - get an error : " + err);
		}
		else
		{
			liststocks = rows;
			console.log("Module stock*** SQL end without errors - get a result : " + JSON.stringify(rows));
		}
		console.log("Module stock*** END *** SQL - List all stocks - Rendering results")
		resp.render("admin/managment.html.twig", {"liststocks":liststocks});
});
});

///////////////////////route "admin/stock/moidif/:id" ////////////////////////////////////////////////admin/stock/moidif/5
router.post("/stock/modif/:id", function (req, resp) {

    var id = req.params.id;
    var qty_m = req.body.st_m;
    var qty_e = req.body.st_e;
    console.log("id = "+id+" quantite magasin = "+qty_m+"  quantite entrepot = "+qty_e);

    
    //UPDATE `products` SET `stock` = '15' WHERE `products`.`id` = 6;
    sqlhelper.pool.query("UPDATE `products` SET `stock` = ? WHERE `products`.`id` =? ",[qty_m,id], function (err, rows, fields) {
        
        //function qui renvoie une erreur si il y a un probleme
        // on verifie dans la console le valeur de err pour voir si il y a une erreur
        //console.log("err :" + err);
        //si il y a une erreur donc si la valeur err est differente de null
        if (err != null) {
            //on enregistre le message d'erreur'
            //message = "Il y a eu une erreur dans la query";
            //on log pour voir le mesage si il passe
            //console.log(message + ' ----- ' + err);
        }
        else {      //UPDATE `stock` SET `qty` = '10' WHERE `stock`.`id` = 5 
                    sqlhelper.pool.query("UPDATE `stock` SET `qty` = ? WHERE `stock`.`id` = ? ",[qty_e,id], function (err, rows, fields) {

                            if (err != null) {
                    //on enregistre le message d'erreur'
                    message = "Il y a eu une erreur dans la query";
                    //on log pour voir le mesage si il passe
                    console.log(message + ' ----- ' + err);

                            }
                            else {
                    //sinon il n'y a pas d'erreur donc on ajoute la nouvelle valeur au message
                    message = "La recuperation des données c'est bien passé ";
                    //on log pour voir le mesage si il passe
                    console.log('message bien reussi avec le message : ' + message);
                    resp.redirect("/admin/stock/managment.html");
                            }

                    });
            

       

            }  
    });
});



///stock/transfer/{{ st.id }}
///////////////////////route "admin/stock/moidif/:id" ////////////////////////////////////////////////admin/stock/moidif/5
router.get("/stock/transfer/:id/:qt", function (req, resp) {

    var id = req.params.id;
    var qt = parseInt(req.params.qt);

    console.log("id = "+id+" quantite = "+qt);
        
    // SELECT products.stock, stock.qty FROM products, stock WHERE products.id = stock.idproduct group by products.id, stock.qty
    sqlhelper.pool.query("SELECT products.stock, stock.qty FROM products, stock WHERE products.id = stock.idproduct AND products.id = ? ",[id], function (err, rows, fields) {
       //console.log('rows : '+JSON.stringify(rows));

        var qutm = parseInt(rows[0].stock);
        var qute = parseInt(rows[0].qty);
        console.log("qutm = "+qutm+" qute  = "+qute );
        var newqute =qute-qt;
        var newqutm=qutm+qt;
        console.log("nouvelle quantite magasin : "+newqutm);
        console.log("nouvelle quantite entrepot : "+newqute);

        
        if (err != null) {
            //on enregistre le message d'erreur'
            message = "Il y a eu une erreur dans la query";
            //on log pour voir le mesage si il passe
            console.log(message + ' ----- ' + err);
        }
        else {      
                sqlhelper.pool.query("UPDATE `products` SET `stock` = ? WHERE `products`.`id` =? ",[newqutm,id], function (err, rows, fields) {

                        if (err != null) {
                        //on enregistre le message d'erreur'
                        message = "Il y a eu une erreur dans la query";
                        //on log pour voir le mesage si il passe
                        console.log(message + ' ----- ' + err);
                        }
                        else { 
                                //UPDATE `stock` SET `qty` = ? WHERE `stock`.`id` = ? 
                                sqlhelper.pool.query("UPDATE `stock` SET `qty` = ? WHERE `stock`.`id` = ?  ",[newqute,id], function (err, rows, fields) {


                                        if (err != null) {
                                //on enregistre le message d'erreur'
                                message = "Il y a eu une erreur dans la query";
                                //on log pour voir le mesage si il passe
                                console.log(message + ' ----- ' + err);
                                }
                                else { 

                                      resp.redirect("/admin/stock/managment.html");


                                }

                                

                                 });       


                        }


                });

        }
   
    
    



   

    });
});


module.exports = router;
