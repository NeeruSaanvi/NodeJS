var mysql = require('mysql');


// con.connect(function(err) {
//   if (err) console.log("not connected");
//   console.log("Connected!");
// });


// var connection;

var pool      =    mysql.createPool({
    connectionLimit : 1000, //important
    host: "",
  user: "",
  password: "",
  database: ""
});


function handle_database(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          // res.send({message:'Error in connection database',result:false});
         // return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        let jobId      = req.query.jobId == null ? "0": req.query.jobId;
  let lat      = req.query.lat == null ? "0": req.query.lat;
  let lng      = req.query.lng == null ? "0": req.query.lng;
  let jobStatus = req.query.jobStatus == null ? "0": req.query.jobStatus;

        let query = 'insert into hg_ride_location (jobId, lat, lng, jobStatus) VALUES ('+jobId+', '+lat+', '+lng+', "'+ jobStatus +'")';
  console.log(query);
  connection.query(query, function(err, rows, fields) {
 
   if (!err)
   {
     console.log('save');

    res.send({message:'success',result:true});
  }
   else{
     console.log('Error while performing Query.'+ err);
     res.send({message:'fail',result:false});
   }

        // connection.on('error', function(err) {      
        //       res.send({message:'Error in connection database',result:false});
        //      // return;     
        // });
  });
});
}

module.exports = {
saveDB: function(req,res){
        handle_database(req,res);
}
};



// var con;
// function handleDisconnect() {
//   // con = mysql.createConnection(db_config); // Recreate the connection, since
//   con = mysql.createConnection({
//   host: "hirengo.com.au",
//   user: "pmayxhsqcc",
//   password: "YsUqW6r9Y8",
//   database: "pmayxhsqcc"
// });
//                                             // the old one cannot be reused.

//   con.connect(function(err) {              // The server is either down
//     if(err) {                                     // or restarting (takes a while sometimes).
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
//     }
//     else
//     {
//     	console.log('connected');
//       return true;
//     }                                     // to avoid a hot loop, and to allow our node script to
//   });                                     // process asynchronous requests in the meantime.
//                                           // If you're also serving http, display a 503 error.
//   con.on('error', function(err) {
//     console.log('db error', err);
//     if(err.code === 'PROTOCOL_CONNECTION_LOST') {
//       con.destroy();                    // Connection to the MySQL server is usually
//       handleDisconnect();                         // lost due to either server restart, or a
//     } else {                                      // connnection idle timeout (the wait_timeout
//       throw err;                                  // server variable configures this)
//     }
//   });
// }

// function getConnection()
// {
//   if(con.connected)
//     return con;
//   else
//     if(handleDisconnect())
//     {
//       return con;
//     }
// }


// module.exports = con;

