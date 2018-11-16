
module.exports = {
      getQuestions : function(conn, numQuestions, callback) {
            var sqlQuery = "SELECT * FROM questions ORDER BY RAND() LIMIT " +  numQuestions;
            conn.query(sqlQuery, function (err, result) {
                  if(err) throw err;
                  //console.log(result);
                  return callback(result);
            });
      },
      addQuestion : function(conn, questionText, options, correctAns, explanation, callback) {
            var sqlQuery = "INSERT INTO Questions(question_text, option1, option2, option3, option4, correct_option, explaination) VALUES( '" + questionText + "' ,'" + options[0] + "' , '" + options[1] + "' , '" + options[2] + "' , '" + options[3] + "' , '" + correctAns + "' , '" + explanation + "' )";
            conn.query(sqlQuery, function (err, result) {
                  if(err) throw err;
                  //console.log(result);
                  return callback(result);
            });     
      },
      validateLogin : function(conn, email, password, callback){
            var sqlQuery = "SELECT * FROM Users where email='"+email+"' AND password='"+password+"'";
            conn.query(sqlQuery, function(err, result){
                  //if(err) throw err;
                  return callback(err, result);
            });
      },
      addScore : function(conn, name, correct, total){
            var sqlQuery = "INSERT INTO Scores(student_name, user_correct, user_total) VALUES('" + name + "', '" + correct + "', '" + total + "' )";
            conn.query(sqlQuery, function(err, result){
                  //if(err) throw err;
                  return callback(err, result);
            })
      },
      getAllScores : function(conn, callback){
            var sqlQuery = "SELECT * FROM Scores";
            conn.query(sqlQuery, function(err, result){
                  //if(err) throw err;
                  return callback(err, result);
            });
      }
};


