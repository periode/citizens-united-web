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

var app = express();
var port = 80;

var congress_api_key = 'SmX6QoNToS8vNvDZkK74x84OFSDZ2Ffm6JVgBxWe';


//TWILIO
var accountSid = 'AC91d3b89738a4224421b9f6a2b17ca58f';
var authToken = 'ee5166788f067c314cd049f6eb05b686';
var twilio_client = require('twilio')(accountSid, authToken);
var twilio_number = "+13472864833";
var contacts = {
  "heitkamp": "2022242043",
  "hoeven": "7012504618"
};

app.set('views', 'public/views');
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname,'public','favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bp.urlencoded({
  extended: true
}));
app.use(bp.json());

updateInfo();


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

app.get('/call', function(req, res, err){
  if(err)
    console.log(err);

  res.render('call-congress.pug', {done: false});
  res.end();
});

app.get('/get-congress', function(req, res, err){
  if(err)
    console.log(err);

  var all_members = JSON.parse(fs.readFileSync('public/data/congress.json'));

  res.json(all_members);
  res.end();
})

app.post('/broker-call', function(req, res, err){
  if(err)
    console.log(err);

  var requester = req.body.requester.replace(/\s|-/g,'');
  var number = contacts[req.body.requester];
  var url = 'http://' + req.headers.host + '/outbound-call?number='+number;

  twilio_client.makeCall({
  	to: requester,
  	from: twilio_number,
    url: url
  }, function(err, message) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
      res.render('call-congress.pug', {congress: null, done: true});
      res.end();
    }
  });
});

app.post('/outbound-call', function(req, res) {
    var _number = '+1'+req.query.number;
    console.log('calling',_number);
    res.type('text/xml');
    res.render('brokering', {number: _number});
});

app.post('/email-subscription', function(req, res, err){
  if(err)
    console.log(err);

  var new_subscriber = req.body;

  var obj = JSON.parse(fs.readFileSync('public/data/subscribers.json'));

  var found = false;
  for(var i = 0; i < obj.all_subscribers.length; i++){
    if(obj.all_subscribers[i].email == new_subscriber.email)
      found = true;
  }

  if(!found){

    obj.all_subscribers.push(new_subscriber);

    fs.writeFile('public/data/subscribers.json', JSON.stringify(obj), function(err){
      if(err)
        throw err;
      else{
        console.log('added new subscriber to the database');
        console.log('name',new_subscriber.name);
        console.log('email',new_subscriber.email);
      }
    });

    var message = {thanks: 'thanks, '+new_subscriber.name+', you have been successfully subscribed!'};

    res.render('email-landing.pug', message);
    res.end();
  }else{
    var st = 'we\'ve already found an address matching, '+new_subscriber.email+'!';
    var message = {thanks: st};

    res.render('email-landing.pug', message);
    res.end();
  }
});

app.get('/subscribers', function(req, res, err){
  if(err)
    console.log(err);
  var subscribers = JSON.parse(fs.readFileSync('public/data/subscribers.json'));
  res.json(subscribers);
  res.end();
});

function updateInfo(){
  var options = {
    url : 'https://www.govtrack.us/api/v2/role?current=true',
    headers: {
      "X-API-Key" : congress_api_key
    }
  };

  request(options, function(error, response, body){
    if(error)
      console.log(error);

    var members = JSON.parse(body).objects;
    var c = {
      members: []
    }

    for(var i = 0; i < members.length; i++){

      if(members[i].phone != null){
          var _phone = members[i].phone.toString().replace(/-/g,'');

          var member = {
            name: members[i].person.firstname + ' ' + members[i].person.lastname,
            state : members[i].state,
            party : members[i].party[0],
            phone : _phone
          }

          c.members.push(member);
        }
      }

    fs.writeFile('public/data/congress.json', JSON.stringify(c), function(err){
      if(err)
        throw err;
      else{
        console.log('updated congress database -',c.members.length,'members');
      }
    });
  });
}
