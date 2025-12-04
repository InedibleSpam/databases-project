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
  }
  });
});
}



// This is the function that will populate the drop downs for the website, it returns all the airports in the DB. confirmed operational 

async function get_airports() {
  let citys = await query_DB("select city from airport");
  console.log(citys);
  return citys;
}


// This function gives the prices of the tickets that will populate areas in the website. confirmed operational 

async function get_prices() {
  let price = await query_DB("select price from ticket");
  return price;
}


// This function handles ticket buying, inputting the proper information into the DB. works

 async function buy_tick(email, password, price, seat_class, depart_port, num_ticks) {
  let pass_id_obj = await query_DB("select pass_id from passenger where pass_email = ?", [email]);
  let pass_id = pass_id_obj[0].pass_id;
  let pass_id_num = Number(pass_id);
  
  let pass_password_obj = await query_DB("select password from passenger where pass_id = ?", [pass_id_num]);
  let pass_password = pass_password_obj[0].password;
  let pass_password_str = pass_password.toString();
  
  if (pass_password_str == password) {
    let air_id_obj = await query_DB("select air_id from airport where city = ?", [depart_port]);
    let air_id = air_id_obj[0].air_id;
    let air_id_num = Number(air_id);
    let vals = [pass_id_num, price, seat_class, air_id_num, num_ticks];
    query_DB("insert into ticket(pass_id, price, class, airport, num_tickets) values(?, ?, ?, ?, ?)", vals);
    return true;
  } else {
    console.log("Your password is incorect, please try again.");
  }
}


// This function records the users payments in the DB.

async function make_pay(email, password, tick_price, pay_type) {
  const d = new Date();
  const month = d.getMonth();
  const day = d.getDate();
  const year = d.getFullYear();
  const dates = month + "/" + day + "/" + year;
  let pass_id_obj = await query_DB("select pass_id from passenger where pass_email = ?", [email]);
  let pass_id = pass_id_obj[0].pass_id;
  let pass_id_num = Number(pass_id);
  
  let pass_password_obj = await query_DB("select password from passenger where pass_id = ?", [pass_id_num]);
  let pass_password = pass_password_obj[0].password;
  let pass_password_str = pass_password.toString();
  if (pass_password_str == password) {
    let vals = [pass_id_num, tick_price, dates, pay_type];
  query_DB("insert into payment(pass_id, tick_price, date, type) values(?, ?, ?, ?)", vals);
  return true;
  } else {
    console.log("Your password is incorect, please try again.");
  }

  
}


// This function makes the user a member

async function add_mem(email) {
  let pass_id_obj = await query_DB("select pass_id from passenger where pass_email = ?", [email]);
  let pass_id = pass_id_obj[0].pass_id;
  let pass_id_num = Number(pass_id);
  let vals = [pass_id_num, 500];
  query_DB("insert into member(pass_id, points) values(?, ?)", vals);
  return true;
}


// This function returns the number of seats in the plane, used to know when not to buy tickets.

async function seat_num() {
  let num = await query_DB("select seats from plane");
  return num;
}



// This function allows for filtering by price

async function search_by_price(max_price, min_price) {
  let prices = await query_DB("select price from ticket where price < ? and price > ?", [max_price, min_price]);
  return prices;
}



// This function filters by seat_class

async function search_by_class(seat_class) {
  let class_ = await query_DB("select class from ticket where class = ?", [seat_class]);
  return class_;
}


async function check_bag(email, password, bag_weight) {
  let pass_id_obj = await query_DB("select pass_id from passenger where pass_email = ?", [email]);
  let pass_id = pass_id_obj[0].pass_id;
  let pass_id_num = Number(pass_id);

  let pass_password_obj = await query_DB("select password from passenger where pass_id = ?", [pass_id_num]);
  let pass_password = pass_password_obj[0].password;
  let pass_password_str = pass_password.toString();

  if(pass_password_str == password) {
    let vals = [bag_weight, pass_id_num];
    query_DB("insert into luggage(weight, pass_id) values(?, ?", vals);
    return true;
  } else {
    console.log("Your password is incorect, please try again.");
  }
}


