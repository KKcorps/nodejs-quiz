/*//update title of tab
Take Quiz, modify quiz, edit quiz, delete quiz
use templating for dropdown quiz selection?
*/
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var dbQueries = require('./db_queries.js');

var fs = require('fs');
var path = require('path');
var path = require('ejs');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'kajolkhare'}));

var content = fs.readFileSync("static/index.html", 'utf8');
app.use("/static", express.static('static'));
app.set('view engine', 'ejs');

var sess;


/*var conn = mysql.createConnection({
	    host     : 'us-cdbr-iron-east-01.cleardb.net',
      user     : 'b76ef6a5058cf7',
      password : '3189e5ce',
      database : 'heroku_4d402e4dd2b263c'
});

conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected to MySQL!");
});*/

var conn;

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

app.get('/login', function (req, res) {
  res.render('login');
});

var incorrectLogin = false

app.post('/login', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  //console.log(email);
  //console.log(password);
  if(email === "kkdfuturestar@gmail.com" && password === "kaykay21") {
    req.session.email = email;
    res.redirect('/');
  }else{
    res.write('<h1>Please try logging in again.</h1> <a href="/login" class="btn btn-default">Try Again!</a>');
    res.status(403).end();
  } 
});

app.get('/', function (req, res) {
  sess = req.session;
  if(sess.email){
    var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
    var jsonContent = JSON.parse(readQuiz);
    var titles = [];
    for (var i = 0; i<jsonContent.length; i++) {
      titles[i] = jsonContent[i]["title"];
    }
    res.render('index',{titles: titles});
  }else{
    res.redirect('/login')
  }
});

app.get('/,/quiz', function (req, res) {
  var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  var titles = [];
  for (var i = 0; i<jsonContent.length; i++) {
    titles[i] = jsonContent[i]["title"];
  }
  res.send(JSON.stringify(titles));
});

app.post('/quiz', function(req, res){
  var sentQuiz = req.body;
  var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  if (jsonContent.length > 0) {
    sentQuiz["id"] = jsonContent[jsonContent.length-1]["id"] + 1;
  }
  jsonContent.push(sentQuiz);

  var jsonString = JSON.stringify(jsonContent);
  fs.writeFile("data/allQuizzes.json", jsonString);

  res.send("updated");
});

app.get('/quiz/:id', function (req, res) {
  /*var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  var targetQuiz;;
  for (var i = 0; i < jsonContent.length; i++) {
    if (jsonContent[i]["id"] === parseInt(req.params.id)) {
      targetQuiz = jsonContent[i];
      break;
    }
  }
  res.send(targetQuiz);*/
  dbQueries.getQuestions(conn, 3, function(questions){
    res.send(questions);
  });
});

app.put('/quiz/:id', function (req, res) {
  var sentQuiz = req.body;
  var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  for (var i = 0; i < jsonContent.length; i++) {
    if (jsonContent[i]["id"] === parseInt(req.params.id)) {
      jsonContent[i] = sentQuiz;
      break;
    }
  }

  var jsonString = JSON.stringify(jsonContent);
  fs.writeFile("data/allQuizzes.json", jsonString);

  res.send("updated");
});

app.delete('/quiz/:id', function (req, res) {
  var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  for (var i = 0; i < jsonContent.length; i++) {
    if (jsonContent[i]["id"] === parseInt(req.params.id)) {
      jsonContent.splice(i, 1);
      break;
    }
  }
  var jsonString = JSON.stringify(jsonContent);
  fs.writeFile("data/allQuizzes.json", jsonString);
  res.send("deleted");
});

app.get('/reset', function (req, res) {
  var readIn = fs.readFileSync("data/defaultallquizzes.json", 'utf8');
  // var readInAdded = fs.readFileSync("data/allQuizzes.json", 'utf8');
  // fs.writeFile("data/allQuizzesRevert.json", readInAdded);
  fs.writeFile("data/allQuizzes.json", readIn);
  res.send("default quizzes restored");
});

app.get('/revert', function (req, res) {
  var readIn = fs.readFileSync("data/allQuizzesRevert.json", 'utf8');
  fs.writeFile("data/allQuizzes.json", readIn);
  res.send("reverted");
});

app.get('/users', function (req, res) {
  var readUsers = fs.readFileSync("data/users.json", 'utf8');
  res.send(readUsers);
});

app.post('/users', function(req, res){
  var jsonString = JSON.stringify(req.body);
  fs.writeFile("data/users.json", jsonString);
  res.send(req.body);
});

app.get('/titles', function (req, res) {
  var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  var titles = "[";
  for (var i = 0; i<jsonContent.length; i++) {
    if (i < jsonContent.length -1)
      titles += "\"" + jsonContent[i]["title"] + "\"" + ", ";
    else
      titles += "\"" + jsonContent[i]["title"] + "\"";
  }
  titles += "]";
  res.send(titles);
});

app.get('/titlesandids', function (req, res) {
  var readQuiz = fs.readFileSync("data/allQuizzes.json", 'utf8');
  var jsonContent = JSON.parse(readQuiz);
  var titles = [];
  for (var i = 0; i<jsonContent.length; i++) {
    titles[i] = jsonContent[i]["title"];
    titles[jsonContent.length + i] = jsonContent[i]["id"];
  }
  res.send(JSON.stringify(titles));
});


var server = app.listen(process.env.PORT || 4000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Shardas Quiz App listening at http://%s:%s', host, port);
});
