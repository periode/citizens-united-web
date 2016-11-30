//--- CALL CONGRESS
var api = require('./api');

var accountSid = 'AC91d3b89738a4224421b9f6a2b17ca58f';
var authToken = 'ee5166788f067c314cd049f6eb05b686';
var twilio_client = require('twilio')(accountSid, authToken);
var twilio_number = "+13472864833";

//--- RENDER WEB PAGE
exports.landing = function(req, res, err){
  if(err)
    console.log(err);

  res.render('call-congress.pug', {done: false});
  res.end();
}

//--- INITIATE CALL BETWEEN USER AND TWIML
exports.initiate_call = function(req, res, err){
  if(err)
    console.log(err);

  var requester = req.body.requester.replace(/\s|-/g,'');
  var number = req.body.representative;
  var url = 'http://' + req.headers.host + '/broker-call?number='+number;

  console.log('requester',requester);
  console.log('number',number);

  twilio_client.makeCall({
  	to: requester,
  	from: twilio_number,
    url: url
  }, function(err, message) {
    if (err) {
        console.log(err);
        res.status(500).send(err);
    } else {
      res.writeHead(200);
      res.end();
    }
  });
}

//--- RENDER TWIML IN ORDER TO BROKER CONNECTION
exports.broker_call = function(req, res) {
    var _number = '+1'+req.query.number;
    console.log('calling',_number);
    res.type('text/xml');
    res.render('brokering.pug', {number: _number});
}
