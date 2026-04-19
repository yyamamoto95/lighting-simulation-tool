//run-> npm install, npm start,
//open-> http://localhost:3000/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var ejs = require('ejs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//json to csv
function json2csv(json) {
  var header = Object.keys(json[0]).join(',') + "\n";
  //console.log(header);

  var body = json.map(function(d){
      return Object.keys(d).map(function(key) {
          return d[key];
      }).join(',');
  }).join("\n");

  return body;
}


app.get('/cgi', function(req, res) {
  fs.readFile('public/cgi/data.csv', 'utf8', function (err, text) {
    if (err) console.log(err);
    var json = [];
    var spl1 = text.split('\n');
    for (n in spl1){
      let spl2 = spl1[n].split(',');
      let elm = {
        'name':spl2[0],
        'color': spl2[1],
        'intensity': spl2[2],
        'position_x': spl2[3], 
        'position_y': spl2[4],
        'position_z': spl2[5],
        'target_x': spl2[6],
        'target_y': spl2[7],
        'target_z': spl2[8]
      };
      json.push(elm);
    };

    res.json(json);
  });

});

app.post('/cgi', function(req, res) {
  var data = req.body;
  console.log(data);
  var csv  = json2csv(req.body);
  fs.writeFile('public/cgi/data.csv', csv , 'utf-8', function(err) {
      if(err){
        console.log(err);
      }
      res.send(true);
  })

},
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
