//--- API
var fs = require('fs');
var request = require('request');

var congress_api_key = 'SmX6QoNToS8vNvDZkK74x84OFSDZ2Ffm6JVgBxWe';

//--- GET CURRENT LIST OF CONGRESS
exports.get_all_congress = function(req, res, err){
  if(err)
    console.log(err);

  var all_members = JSON.parse(fs.readFileSync('public/data/congress.json'));

  res.json(all_members);
  res.end();
}

//--- UPDATE LIST OF CONGRESS
exports.update_congress = function(req, res, err){
  var options = {
    url : 'https://www.govtrack.us/api/v2/role?current=true',
    headers: {
      "X-API-Key" : congress_api_key
    }
  };

  request(options, function(error, response, body){
    if(error){
      console.log(error);
    }else{
      var members = JSON.parse(body).objects;
      var all_members = {
        members: []
      };

      for(var i = 0; i < members.length; i++){
        if(members[i].phone != null){
            var _phone = members[i].phone.toString().replace(/-/g,'');
            var member = {
              name: members[i].person.firstname + ' ' + members[i].person.lastname,
              state : members[i].state,
              party : members[i].party[0],
              phone : _phone
            }
            all_members.members.push(member);
          }
        }

      fs.writeFile('public/data/congress.json', JSON.stringify(all_members), function(err){
        if(err)
          throw err;
        else{
          console.log('updated congress database -',all_members.members.length,'members');
        }
      });

      res.json(all_members);
      res.end();
    }
  });
}


//--- GET LIST OF GLOBAL EMAIL SUBSCRIBERS
exports.get_all_subscribers = function(req, res, err){
  if(err)
    console.log(err);
  var subscribers = JSON.parse(fs.readFileSync('public/data/subscribers.json'));
  res.json(subscribers);
  res.end();
}

//ADD NEW SUBSCRIBER
exports.add_new_subscriber = function(req, res, err){
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

    res.writeHead(200);
    res.write('created');
    res.end();
  }else{
    console.log('already found subscriber');
    var st = 'we\'ve already found an address matching, '+new_subscriber.email+'!';
    var message = {thanks: st};

    res.writeHead(200);
    res.write('found');
    res.end();
  }
}
