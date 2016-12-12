var http = require('http');
var express = require('express');
var bp = require('body-parser');
var pug = require('pug');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var http = require('http');
var request = require('request');
var querystring = require('querystring');

//--- ROUTES
var api = require('./routes/api');
var call = require('./routes/call');
var newsletter = require('./routes/newsletter');

var app = express();
var port = 80;

app.set('views', 'public/views');
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname,'public','favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bp.urlencoded({extended: true}));
app.use(bp.json());

var server = http.createServer(app).listen(port, function(err){
  if(err)
    console.log(err);
  console.log('server started on port',port);
});


app.get('/', function(req, res, err){
  if(err)
    console.log(err);

  res.render('index.pug');
  res.end();
});

//--- CALL
app.get('/call', call.landing);
app.post('/initiate-call', call.initiate_call);
app.post('/broker-call', call.broker_call);

//--- NEWSLETTER
app.get('/newsletter', newsletter.landing);
app.post('/newsletter/new', newsletter.add_new_subscriber);
app.get('/newsletter/get-all', newsletter.get_all_subscribers);
app.get('/newsletter/unsubscribe', newsletter.remove_subscriber);

//--- API
app.get('/get-congress', api.get_all_congress);
app.get('/update-congress', api.update_congress);

app.get('/update-bills-schedule', api.update_bills_schedule);
app.get('/get-bills-schedule', api.get_bills_schedule);

app.post('/email-subscription', api.add_new_subscriber);
app.get('/subscribers', api.get_all_subscribers);
