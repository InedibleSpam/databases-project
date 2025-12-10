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



// This is the function that will populate the drop downs for the website, it returns all the airports in the DB. up to date

async function get_airports() {
  let citys = await query_DB("select city from airport");
  console.log(cities);
  return cities;
}


// This function gives the prices of the tickets that will populate areas in the website. up to date

async function get_prices() {
  let price = await query_DB("select price from ticket");
  return price;
}


// This function handles ticket buying, inputting the proper information into the info into both ticket and passenger
// up to date for user/passenger patch. 

 async function buy_tick(use_email, user_password, tic_price, seat_class, depart_port, num_ticks, carry_on) {
  let use_id_obj = await query_DB("select use_id from user where use_email = ?", [use_email]);
  let use_id = use_id_obj[0].use_id;
  let use_id_num = Number(use_id);
  
  let use_password_obj = await query_DB("select use_password from user where use_id = ?", [use_id_num]);
  let use_password = use_password_obj[0].use_password;
  let use_password_str = use_password.toString();
  
  if (use_password_str == user_password) {
    let air_id_obj = await query_DB("select air_id from airport where city = ?", [depart_port]);
    let air_id = air_id_obj[0].air_id;
    let air_id_num = Number(air_id);
    let vals = [use_id_num, tic_price, seat_class, air_id_num, num_ticks];
    query_DB("insert into ticket(use_id, price, class, airport, num_tickets) values(?, ?, ?, ?, ?)", vals);
    
    let vals2 = [use_id_num, carry_on];
    let passenger = await query_DB("insert into passenger(pass_id, use_id, carryon) values(?, ?)", vals2);
    console.log(passenger);
  } else {
    console.log("Your password is incorrect, please try again.");
  }
}


// This function records the users payments in the DB. up to date for user/passenger patch.

async function make_pay(use_email, user_password, price, payment_type) {
  const d = new Date();
  const month = d.getMonth();
  const day = d.getDate();
  const year = d.getFullYear();
  const dates = month + "/" + day + "/" + year;
  
  let use_id_obj = await query_DB("select use_id from user where use_email = ?", [use_email]);
  let use_id = use_id_obj[0].use_id;
  let use_id_num = Number(use_id);
  
  let use_password_obj = await query_DB("select use_password from user where use_id = ?", [use_id_num]);
  let use_password = use_password_obj[0].use_password;
  let use_password_str = use_password.toString();
  if (use_password_str == user_password) {
    let vals = [pass_id_num, price, dates, payment_type];
    let worked = await query_DB("insert into payment(use_id, price, date, pay_type) values(?, ?, ?, ?)", vals);
    console.log(worked);
  } else {
    console.log("Your password is incorrect, please try again.");
  }

  
}


// This function makes the user a member, it requires them to pay $80, it adds info into the member, payment and user tables 
// up to date for user/passenger patch.

async function add_mem(use_email, user_password, pay_type) {
  const d = new Date();
  const month = d.getMonth();
  const day = d.getDate();
  const year = d.getFullYear();
  const dates = month + "/" + day + "/" + year;
  

  let use_id_obj = await query_DB("select use_id from user where use_email = ?", [use_email]);
  let use_id = use_id_obj[0].use_id;
  let use_id_num = Number(use_id);

  let use_password_obj = await query_DB("select use_password from user where use_id = ?", [use_id_num]);
  let use_password = use_password_obj[0].use_password;
  let use_password_str = use_password.toString();
  
  if (use_password_str == user_password) {
    let vals = [use_id_num, 500];
    let worked = await query_DB("insert into member(use_id, points) values(?, ?)", vals);
    console.log(worked);

    let vals2 = [use_id_num, 80, dates, pay_type];
    let payed = await query_DB("insert into payment(use_id, price, date, pay_type) values(?, ?, ?, ?)", vals2);
    console.log(payed);
    
    let member_obj = await query_DB("select mem_id from member where use_id = ?", [use_id_num]);
    console.log(member);
    let member = member_obj[0].mem_id;
    let mem_num = Number(member);
    
    let is_mem = await query_DB("update user set mem_id = ?",[mem_num]);
    console.log(is_mem);
  
  } else {
    console.log("Your password is incorrect, please try again.");
  }
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

// This function allows for the checking of bags, it does not require payment. Up to date for user/passenger patch.

async function check_bag(use_email, user_password, bag_weight) {
  let use_id_obj = await query_DB("select use_id from user where use_email = ?", [use_email]);
  let use_id = use_id_obj[0].use_id;
  let use_id_num = Number(use_id);

  let use_password_obj = await query_DB("select use_password from user where use_id = ?", [use_id_num]);
  let use_password = use_password_obj[0].use_password;
  let use_password_str = use_password.toString();

  if(use_password_str == user_password) {
    let vals = [bag_weight, use_id_num];
    let worked = await query_DB("insert into luggage(weight, use_id) values(?, ?)", vals);
    console.log(worked);
    
  } else {
    console.log("Your password is incorrect, please try again.");
  }
}


