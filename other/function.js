function retrieve(sql, values = []){
  connection.query(sql, values, (err, results) => {
  if (err) throw err;
  console.log(results);
  return results;
});

// There's the sql query function, for it to work on a different system replace "connection" 
// with whatever your connection variable is called, also as a quick note I learned that 
// instead of %s as in python javascript uses ? to represent variables.  