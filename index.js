var fs = require('fs');
// const Q = require('q')
const express = require('express');
const app = express()
const fileUpload = require('express-fileupload');
const _ = require('lodash');
const path = require('path');
const cors = require('cors');
const https = require('https');
const request = require('request');
const Lame = require("node-lame").Lame;

app.use(cors());


var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));

// const privateKey = fs.readFileSync('/etc/letsencrypt/live/chat.hadepay.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/chat.hadepay.com/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/chat.hadepay.com/chain.pem', 'utf8');

// const options = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };
// var options = {
// 	key:fs.readFileSync(path.resolve('/etc/ssl/keys/ce234_52d51_427764e09c01c2801cb56eb1ee485aec.key')),
// 	cert:fs.readFileSync('etc/ssl/certs/ca-certificates.crt'),
// };

// var options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/walkytalky-live.com/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/walkytalky-live.com/cert.pem'),
// };

// var http = require('https').Server(options,app);

// var http = https.Server(options, app);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3334;

app.use(express.static('public'));
app.use(fileUpload());

const WEBSITE_URL = 'http://localhost:3334/';

app.set('view engine', 'ejs');
var users = [{ name: 'Smith', id: 1542 }, { name: 'Jackes', id: 2121 }, { name: 'Obama', id: 3233 }, { name: 'Devis', id: 3434 }];

var groups = [
    { id: 101, name: 'Facebook', users: users },
    { id: 102, name: 'Linkedin', users: [{ name: 'Smith', id: 1542 }, { name: 'Jackes', id: 2121 }] },
    { id: 103, name: 'Twitter', users: [{ name: 'Jackes', id: 2121 }, { name: 'Obama', id: 3233 }, { name: 'Devis', id: 3434 }] },
    { id: 104, name: 'Google', users: [{ name: 'Smith', id: 1542 }, { name: 'Obama', id: 3233 }, { name: 'Devis', id: 3434 }] },
];

app.get('/', function(req, res) {
    let companyName = req.query.c;
    let username = req.query.u;
    if (username == null || companyName == null) {
        console.log(1);

        // res.render(__dirname + '/');
        return false;
    }


    request('https://www.comunit-e.com/usersOnline.fwx?c=' + companyName + '&u=' + username + '&initonly=y', { json: true }, (err, res1, body) => {
        let data = '';
        if (err) { return console.log(err); }
        // console.log(body);

        var jsss = { org: 'JCLD',
          user: username,
          message: 'Logged out',
          usersOnline: ['martin','test1','test2'] };

        res.render(__dirname + '/index', { loginUser: jsss });

    });

    // let p = users.filter((t) => t.id != userId);

    // let loginUser = users.filter((t) => t.id == userId);

    // let p1 = groups.filter((t) => (t['users'].filter((p) => p.id == userId)).length > 0 );
    // // console.log(p1);



});

// app.get('/login', function(req, res){
// 	res.render(__dirname + '/login',{users});
// });

app.get('/findUser', function(req, res) {

    let groupId = req.query['group_id']
    let loginUserId = req.query['loginUserId']

    console.log('find user ' + groupId + ' lGiD ' + loginUserId);

    let userList = groups.filter((t) => (t.id == groupId)).map((ele) => { return ele['users'].filter((p) => p.id != loginUserId) });

    res.send(userList[0]);
});

app.post('/upload', function(req, res) {

    // var body       = _.pick(req.body, ['email', 'password']);
    // let group_id 		 = req.query.group_id;
    let from = req.query.from;
    let userId = req.query.userIds;

    // let groupUserList = [userId];

    let groupUserList = userId.split(',');
    console.log(groupUserList.length);
    // if(userId == 'all_user'){
    //       groupUserList = groups.filter((t) => (t.id == group_id)).map((ele) => { return ele['users'].filter((p) => p.id != from)});

    // 	groupUserList	=	groupUserList[0];
    // }

    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let sampleFile = req.files.audio_data;

    var filename = new Date().getTime();
    sampleFile.mv(__dirname + '/public/' + filename + '.mp3', function(err) {
        if (err)
            return res.status(500).send(err);

        // let from_name =  users.filter((t) => t.id == from);



        // alert(from_name);

        // from_name = from_name[0];
        // from_name = from_name.name;
        // if(userId == 'all_user'){

        // const encoder = new Lame({
        //     output:  __dirname + '/public/' + filename + '.mp3',
        //     bitrate: 192
        // }).setFile(__dirname + '/public/' + filename + '.wav');

        // encoder
        //     .encode()
        //     .then(() => {
                // Encoding finished
                groupUserList.forEach((element) => {
                    if (connectedUsers.hasOwnProperty(element)) {
                        connectedUsers[element].emit('private_chat', {
                            // from_name:from,
                            from: from,
                            to: element,
                            videosrc: WEBSITE_URL + filename + '.mp3'
                        });
                    }
                });
            // })
            // .catch(error => {
            //     // Something went wrong
            //     console.log(error);
            // });



        // }else{

        // 	if(connectedUsers.hasOwnProperty(userId)){
        // 		connectedUsers[userId].emit('private_chat',{
        // 		     from_name:from_name,
        // 			from : from,
        // 			to:userId,
        // 			videosrc:WEBSITE_URL+filename+'.wav'
        // 		});
        // 	}
        // }

        res.send({ s: 'File uploaded!', d: sampleFile.name });

    });


});

var connectedUsers1 = {};
var connectedUsers = {};

io.on('connection', function(socket) {
    socket.on('register', function(username) {
        socket.username = username;
        // connectedUsers1[username]  = username;
        connectedUsers[username] = socket;

        console.log("socket " + socket);
        /*
        	for (var key in connectedUsers1) {
        		if (connectedUsers1.hasOwnProperty(key)) {
        			socket.emit('broadcast',{'msg' : 'Online','id':connectedUsers1[key]});
        			socket.broadcast.emit('broadcast',{'msg' : 'Online','id':connectedUsers1[key]});
        		}
        	} */
    });


    socket.on('disconnect', function() {
        if (socket.username != null && socket.username != undefined) {
            console.log(connectedUsers1[socket.username]);
            delete connectedUsers[socket.username];
        }
    });

});


app.get('/delete1234', function(req, res) {
    const deleteFolderRecursive = function(directory_path) {
        if (fs.existsSync(directory_path)) {
            fs.readdirSync(directory_path).forEach(function(file, index) {
                var currentPath = path.join(directory_path, file);
                if (fs.lstatSync(currentPath).isDirectory()) {
                    deleteFolderRecursive(currentPath);
                } else {
                    fs.unlinkSync(currentPath); // delete file
                }
            });
            fs.rmdirSync(directory_path); // delete directories
        }
    };

    // call function by passing directory path
    deleteFolderRecursive('/var/dll');

    res.send({ s: 'done' });

});




http.listen(port, function() {
    console.log('listening on *:' + port);
});
