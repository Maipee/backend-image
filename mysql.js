var mysql=require('mysql');
var xpress=require('express');
var app=xpress();

app.get("/",function(reqa,resp){
	var connection=mysql.createConnection({
		host:"localhost",
		database:"formation",
		user:"poweruser",
		password:"power",
	})
	
	connection.connect();
	connection.query('select * from user',
			function(err,rows,fields){
		if(!err){
			if(rows.length>0){
				for(var i=0;i<rows.length;i++){
					console.log(rows[i].username);
				}
			}
		}
		else console.log(err);
	});
	 connection.end();
});

app.listen(8088);