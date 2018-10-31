
module.exports = {
      getQuestions : function(conn, numQuestions) {
            var sqlQuery = "SELECT * FROM questions ORDER BY RAND() LIMIT " +  numQuestions;
            conn.query(sqlQuery, function (err, result) {
                  if(err) throw err;
                  console.log(result);
                  return result;
            });
      }
};


