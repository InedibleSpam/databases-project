let database = require('Library');

let dbconn =  database.createConnection({
    host: "localhost",
    user: "root",
    password: "poo.py",

});

dbconn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
