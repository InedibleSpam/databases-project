let mysql = require('mysql');

let dbconn =  mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "poo.py",
    database: "EastWest"

});

dbconn.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
});


// Function for user sign-in
function userSignIn(name, email, password) {
    const sign_in_prompt = "insert into passenger(pass_name, pass_email, password) values(?, ?, ?)";
    let email_search = "select * from passenger where pass_email = ?";

//Checks to see if email already exists
    dbconn.query(email_search, [email], function(err, results) {
        if (err) throw err;

        if (results.length > 0) {
            console.log("Email already registered.");
        } 
        
        else {
//Registers new user
            dbconn.query(sign_in_prompt, [name, email, password], function(err, results) {
                if (err) throw err;
                console.log("User registered successfully.");
        
            });
        }
    });
}

//userSignIn("Jim Timson", "jimmyt@outlook.com", "poo.py_file"); This is a test function call.
 
// Function for user login
function userLogin(email, password) {
    const login_prompt = "select * from passenger where pass_email = ? and password = ?";

    //Checks to see if the account exists
    dbconn.query(login_prompt, [email, password], function(err, results) {
        if (err) throw err;

        if (results.length > 0) {
            console.log("Login successful.");
            return ("Welcome, " + results[0].pass_name + "!");  
        } 
        
        else {
            console.log("Invalid email or password.");
        }
    });
}


//console.log(userLogin("jimmyt@outlook.com","poo.py_file"));