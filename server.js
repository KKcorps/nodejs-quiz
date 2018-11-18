/*
Contains API calls used by web page to get or store data or load appropriate web page
*/

var express = require('express'); //Framework of Nodejs to make things simpler such as API calls
var bodyParser = require('body-parser'); //Required to parse JSON body of POST request 
var session = require('express-session'); //Required to store current User to check if he's logged in or not
var mysql = require('mysql'); //To make mysql queries
var dbQueries = require('./db_queries.js'); //Mysql queries helper function

var fs = require('fs');
var path = require('path');
var path = require('ejs');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'kajolkhare'}));

var content = fs.readFileSync("static/index.html", 'utf8');
app.use("/static", express.static('static'));
app.set('view engine', 'ejs'); //To use .ejs files as HTML files 
//EJS helps in directly accessing nodejs variables in HTML page
//E.g. to decid what buttons to show based on logged in user type

var sess;

var conn;

var numberOfQuestionsInQuiz = 6;

function connectWithHandlers() {
  connection = mysql.createConnection({
    host     : 'us-cdbr-iron-east-01.cleardb.net',
    user     : 'b76ef6a5058cf7',
    password : '3189e5ce',
    database : 'heroku_4d402e4dd2b263c'
  });                                  // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }else{
      console.log('Connected to MySQL!!')
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      conn = connectWithHandlers();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });

  return connection;
}

conn = connectWithHandlers();


//Load Login Page
app.get('/login', function (req, res) {
  res.render('login');
});


//Check if login credential are correct
app.post('/login', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  dbQueries.validateLogin(conn, email, password, function(err, result){
    if(err){
      res.write('<h1>Some error encountered. Please try logging in again.</h1> <a href="/login" class="btn btn-default">Try Again!</a>');
      res.status(500).end();
    }else{
      if(result.length > 0){
        req.session.email = email;
        req.session.account_type = result[0]['account_type'];
        res.redirect('/');
      }else{
        res.write('<h1>Invalid email or password. Please try logging in again.</h1> <a href="/login" class="btn btn-default">Try Again!</a>');
        res.status(403).end();
      }
    }
  })
});


//Logout current User
app.get('/logout', function (req, res) {
  req.session.destroy;

  res.redirect('/login');

});


//Load main page
//Account type can be student or professor
//Contents on the main page are decided on the basis of account type
app.get('/', function (req, res) {
  sess = req.session;
  if(sess.email){
    dbQueries.getAllQuestions(conn, function(result){
      res.render('index',{titles: result, account_type : sess.account_type, questions : result});
    });
    
  }else{
    res.redirect('/login')
  }
});


//Add new questions to Database
app.post('/quiz', function(req, res){

  var questions = req.body.questions;
  var numInserted = 0;
  addQuestionToDB(questions, 0);
  res.send("Added all the questions");

});

//Helper function for above API call
var addQuestionToDB = function(questions, idx){
    if(idx==questions.length) return "SUCCESS";

    var currentQuestion = questions[idx];
    var qText = currentQuestion["question_text"];
    var qOptions = currentQuestion["options"];
    var qCorrectOption = currentQuestion["correct_option"];
    var qExplanation = currentQuestion["explanation"][0];
    dbQueries.addQuestion(conn, qText, qOptions, qCorrectOption, qExplanation, function(dbResult){
      addQuestionToDB(questions, idx+1);
    })
    return "SUCCESS";
}

//Load  the questions of quiz
//Only numberOfQuestionsInQuiz questions are sent to HTML page
app.get('/quiz/:id', function (req, res) {
  dbQueries.getQuestions(conn, numberOfQuestionsInQuiz, function(questions){
    res.send(questions);
  });
});


//Delete a question from quiz
app.delete('/quiz/:id', function (req, res) {
  dbQueries.deleteQuestion(conn, req.params.id, function(result){
    res.send("deleted");
  });
  
});

//Get All the user scores
app.get('/users', function (req, res) {
   dbQueries.getAllScores(conn, function(err, result){
       res.send(result); 
    });
});

//Add user score to DB when quiz is completed
app.post('/users', function(req, res){

  var name = req.body.name;
  var score = req.body.correct;
  var total = req.body.total;

  dbQueries.addScore(conn, name, score, total);
});

//Get all the questions in db for delete questions select box
app.get('/titlesandids', function (req, res) {

  dbQueries.getAllQuestions(conn, function(result){
    res.send(JSON.stringify(result));
  });

});

//RUN the server on port set by enivronment variable PORT or default port 400
var server = app.listen(process.env.PORT || 4000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Shardas Quiz App listening at http://%s:%s', host, port);
});
