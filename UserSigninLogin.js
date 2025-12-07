let EastWestDB = require('mysql');

let dbconn =  EastWestDB.createConnection({
    host: "localhost",
    user: "root",
    password: "poo.py",
    database: "EastWest"

});

dbconn.connect(function(error) {
    if (error) throw error;
    console.log("Connected");
});


// Function for user sign-in
function userSignUp(first_name,last_name, user_email, password) {
    const sign_in_prompt = "insert into user(fname, lname, user_email, user_password) values(?, ?, ?, ?)";
    let email_search = "select * from user where user_email = ?";

//Checks to see if email already exists
    dbconn.query(email_search, [user_email], function(error, results) {
        if (error) throw error;

        if (results.length > 0) {
            return ("Email already registered.");
        } 
        
        else {
//Registers new user
            dbconn.query(sign_in_prompt, [first_name, last_name, user_email, password], function(error, results) {
                if (error) throw error;
                return ("User registered successfully.");
        
            });
        }
    });
}


// Function for user login
function userLogin(user_email, user_password) {
    const login_prompt = "select * from user where user_email = ? and user_password = ?";

//Checks to see if the account actually exists
    dbconn.query(login_prompt, [user_email, user_password], function(error, results) {
        if (error) throw error;

        if (results.length > 0) {
            console.log("Login successful.");
            return ("Welcome, " + results[0].fname, results[0].lname + "!");  
        } 

        
        else {
            console.log("Invalid email or password.");
        }
    });
}


//userLogin("jimmyt@outlook.com", "poo.py");