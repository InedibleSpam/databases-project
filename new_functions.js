const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'impact150*',
  database: 'mydb'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});


// this is the function that allows you to query the DB. confirmed operational 

function query_DB(sql, values = []) {
  return new Promise((resolve, reject) => {
  connection.query(sql, values, (err, results) => {
  if (err) {
    return reject(err);
  }else{
    resolve(results);
    return true;
  }
  });
});
}

// This function returns all the airports in the database, it does not take any parameters.

async function get_airports() {
  let citys = await query_DB("select city from airport");
//   console.log(cities);
  return cities;
}


// This function gives the prices of the tickets that will populate areas in the website.
// It does not take any parameters, it returns all the prices.

async function get_prices() {
  let price = await query_DB("select price from ticket");
  return price;
}


// This function returns the user_id and password so that it can be used in other functions

async function get_user_info(use_email) {
    let use_id_obj = await query_DB("select user_id from user where user_email = ?", [email]);
    let use_id = use_id_obj[0].use_id;
    let use_id_num = Number(use_id);
    
    let use_password_obj = await query_DB("select user_password from user where user_id = ?", [use_id_num]);
    let use_password = use_password_obj[0].use_password;
    let use_password_str = use_password.toString();

    return use_id_num, use_password_str;
}


// This function allows users to become members, it adds information into the database, 
// it takes in parameters, user_password and user_email and the payment_type it does not return anything.
// It also logs the users membership payment into the payment table.  

async function become_member(password, email, type) {
    const d = new Date();
    const month = d.getMonth();
    const day = d.getDate();
    const year = d.getFullYear();
    const dates = month + "/" + day + "/" + year;
    
    use_id, use_pass = get_user_info(email);

    if (use_pass == password) {
        let vals = [use_id, 500]
        query_DB("insert into member(user_id, points) values(?, ?)", vals)

        let vals2 = [use_id, 85, dates, type];
        query_DB("insert into payment(user_id, tick_price, date, type) values(?, ?, ?, ?)", vals2);
    }  else {
        console.log("Your password is incorrect, please try again.");
  }
} 

// This function inserts data into the database in the passenger and payment tables, making the user a registered passenger.
// It takes in params, user_password, user_email, wether or not the passenger has a carryon, the id of the ticket they are buying and their payment type.

async function buy_ticket(password, email, carryon, tick_id, pay_type) {
    const d = new Date();
    const month = d.getMonth();
    const day = d.getDate();
    const year = d.getFullYear();
    const dates = month + "/" + day + "/" + year;
    
    use_id, use_pass = get_user_info(email);

    if (use_pass == password) {
        let vals = [carryon, tick_id];
        query_DB("insert into passenger(user_id, carryon, ticket_id) values(?, ?, ?)", vals);
        
        let price = query_DB("select price from ticket where tick_id = ?", [tick_id]);
        let vals2 = [use_id, price, dates, pay_type];
        query_DB("insert into payment(user_id, tick_price, date, type) values(?, ?, ?, ?)", vals2);
    } else {
        console.log("Your password is incorrect, please try again.");
    }
}


