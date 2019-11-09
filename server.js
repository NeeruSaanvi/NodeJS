const express = require('express');
var app = express();
const request = require('request');
const bodyParser = require('body-parser');
const getLatestTxn = require('./getLatestTxn');
const getLatestTxnByBlock = require('./getLatestTxnByBlock');
// const createAccount = require('./createAccount');
// const createAccount = require('./createAccount');
const getBalance = require('./getBalance');
const sendTransaction = require('./sendTransaction');
const sendTransactionHash = require('./sendTransactionHash');

var urlencodedParser = bodyParser.urlencoded({ extended: false });


var http = require('http').Server(app);

// var fs = require('fs');

//  var options = {
//     key: fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key'),
//     cert: fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem'),
// };
// var http = require('https').Server(options,app);


var io = require('socket.io')(http);
// io.set('origins', '*:*');

function onRequest(req,res){
res.writeHead(200, {
'Access-Control-Allow-Origin' : '*'
});
};

// const getLatestSyn = require('./getSyn');

//var urlencodedParser = bodyParser.urlencoded({ extended: false });



app.get('/getLatestTxn', function(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('content-type', 'text/javascript');

        getLatestTxn.getLatestTxn(function(err, result) {
            if (!err) {
                res.send({
                    status: 200,
                    txn: result
                });
            } else {
                res.send({
                    status: 400,
                    message: err
                });
            }
        });
    } catch (err) {
        res.send({
            status: 400,
            message: 'Error Getting Txn'
        });
    }
});


app.get('/getLatesttnxByBlock', function(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('content-type', 'text/javascript');

        getLatestTxnByBlock.getLatestTxnByBlock(req.query.blocknumber, function(err, result) {
            if (!err) {
                res.send({
                    status: 200,
                    txn: result
                });
            } else {
                res.send({
                    status: 400,
                    message: 'Error Getting Txn'
                });
            }
        });
    } catch (err) {
        res.send({
            status: 400,
            message: err.message
        });
    }
});


app.post('/getBalance', urlencodedParser, function(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/javascript');
    try {
        console.log('address=', req.body.address);
        getBalance.getBalance(req.body.address, function(err, result) {
            if (!err) {
                res.send({
                    status: 200,
                    balance: result
                });
            } else {
                res.send({
                    status: 400,
                    message: 'Error Getting Balance'
                });
            }
        });
    } catch (err) {
        res.send({
            status: 400,
            message: 'Error Getting Balance'
        });
    }
});


// app.post('/createAccount',urlencodedParser,function (req,res) {

//   res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('content-type', 'text/javascript');

//   username=req.body.username;
//   password=req.body.password;

//   createAccount.createAccount(username,password,function (err,result) {
//     if(!err){
//       res.send({
//         status:200,
//         message:'Wallet Created Successfully',
//         address:result.address,
//         key:result.key
//       });
//     }else {
//       res.send({
//         status:400,
//         message:'Error Creating wallet'+ err
//       });
//     }
//   });


// });


app.post('/sendTransaction', urlencodedParser, function(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/javascript');

    address = req.body.address;
    key = req.body.key;
    to = req.body.to;
    value = req.body.value;
    input = req.body.input;

    console.log(input);

    sendTransaction.sendTransaction(address, key, to, value, input, function(err, result) {
        if (!err) {
            res.send({
                status: 200,
                message: 'Transfer Successfully',
                hash: result
            });
        } else {
            res.send({
                status: 400,
                message: err
            });
        }
    });


});


app.post('/sendTransactionHash', urlencodedParser, function(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', 'text/javascript');

    address = req.body.address;
    key = req.body.key;
    to = req.body.to;
    value = req.body.value;
    hash = req.body.hash;
    input = req.body.input;

    //console.log(req.body);

    sendTransactionHash.sendTransactionHash(address, key, to, value, hash, input, function(err, result) {
        if (!err) {
            res.send({
                status: 200,
                message: 'Transfer Successfully',
                hash: result
            });
        } else {
            res.send({
                status: 400,
                message: err
            });
        }
    });


});




// call API for get result 
var lastResultId = "";
var lastBetId = "";
var lastResultSrNo = "";
var lastResultNumber = "";
var requestLoop = setInterval(function() {


    var options = {
        method: 'POST',
        url: 'http://localhost/checkResult',
        formData: { last_result_id: lastResultId }
    };

    request(options, function(error, response, body) {
        if (error) console.log(error);
        // throw new Error(error);

        // console.log(body);
        var obj = JSON.parse(body);
        if (obj["status"] == true) {
            if (obj["result"].length > 0 &&  !(obj["result"][0]["result_number"] == lastResultNumber  &&  obj["result"][0]['result_serial_no'] ==lastResultSrNo) ) {
                // console.log(body);
                lastResultId = obj["result"][0]['result_id'];
                lastResultNumber = obj["result"][0]["result_number"];
                lastResultSrNo = obj["result"][0]['result_serial_no'];
                if (lastResultNumber.length == 5) {
                    lastResultId = parseInt(lastResultId, 10) + 1;
                }

                // if(obj["result"][0]["result_number"].length == 0)
                // {
                // console.log("dddd");
                // if(getResultSocket)
                //   getResultSocket.emit('getNextBidNumber',parseInt(lastResultId, 10) + 1);
                // }
                // console.log(obj);
                io.sockets.emit('getResult', obj);
            }
            // if (getResultSocket) {
              // console.log('getResult');
              
                // getResultSocket.emit('getNextBidNumber',lastResultSrNo);
            // }

            // getResultSocket.broadcast.emit('getResult',body);
            // console.log(lastResultId);
            // console.log(obj["result"]);

            // if(body[result])
        }

        // if (getResultSocket) {
// console.log('getNextBidNumber');
            // getResultSocket.emit('getResult',obj);
            io.sockets.emit('getNextBidNumber', lastResultSrNo);
        // }

    });



    var options1 = {
        method: 'POST',
        url: 'http://localhost/lottery/get_bat',
        formData: { last_bat_id: lastBetId }
    };

    request(options1, function(error, response, body) {
        if (error) console.log(error);
        // throw new Error(error);


        var obj = JSON.parse(body);
        if (obj["result"].length > 0) {

             // console.log(obj["result"][0]);
            lastBetId = obj["result"][0]['id'];

            // console.log(obj["result"][0]['id']);
            // if(obj["result"][0]["result_number"].length == 5)
            // {
            // lastBetId = parseInt(lastBetId, 10) + 1;
            // }
        }
        // if (getResultSocket)
        // {
          // console.log(obj);
            io.sockets.emit('getLiveBet', obj);
        // }
        // getResultSocket.broadcast.emit('getResult',body);
        // console.log(lastResultId);
        // console.log(obj["result"]);

        // if(body[result])
        // }
    });


    sendBetResult();


}, 2000);


function sendBetResult() {

// console.log(Object.keys(betUsersList));
    Object.keys(betUsersList).forEach((element) => {
        // if (betUsersList.hasOwnProperty(element)) {

             // console.log(element);

            var options = {
                method: 'POST',
                url: 'http://localhost/getLoginWinBats',
                formData: { loginid: element }
            };

            request(options, function(error, response, body) {
                if (error) console.log(error);
                // throw new Error(error);

                var obj = JSON.parse(body);
                // console.log(obj);
                betUsersList[element].emit('getWinBet', obj);

            });
        // }
    });

}



/// socket code 

var getResultSocket;

var betUsersList = {};
// var socketConnectedUser = {};

io.on('connection', function(socket) {
    getResultSocket = socket;

    // socketConnectedUser[username] = socket;
    // console.log("testttsts");
    socket.on('registerGetBetResult', function(username) {
      // console.log(username);
        socket.username = username;
        betUsersList[username] = socket;
    });


    socket.on('disconnect', function() {
        if (socket.username != null && socket.username != undefined) {
            // console.log(betUsersList[socket.username]);
            delete betUsersList[socket.username];
        }
    });

});


http.listen(4000, function() {
    console.log('APP running on 4000');
});