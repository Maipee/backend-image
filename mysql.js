var mysql = require ('mysql');
var express = require('express');
var app = express();

app.get("/", function(req,resp){
    //config pour la connection
    var connection = mysql.createConnection({
        host :"localhost",
        database :"site_e_commerce",
        user :"superoot",
        pasword:"route2route"
    });
    //connection avec la bdd
    connection.connect();


    //executer la query puis faire ujne fonction de calback
    connection.query('SELECT * FROM `user` ', function(err,rows,fields)
    {
        //si je n'ai pas d'erreur 
        if(!err)
        {
            //et que mon resultat est plus grand que zero
            if(row.length>0)
            {
                //il va rechercher tous les user et dans la console on va lui construire le username
                for (var i=0; i<rows.length;i++)
                    {
                        dbuser = rows[i].username;
                    }
            }

        }
        else
        console.log(err);

    });

    connection.end();
});

app.listen(8088);

