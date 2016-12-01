//--- API
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var congress_api_key = 'SmX6QoNToS8vNvDZkK74x84OFSDZ2Ffm6JVgBxWe';
var house_url = "http://docs.house.gov/floor/";

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

//--- NEWSLETTER

//--- GET SCHEDULE
var scheduled_bills = [];
var total_bills = 0;
var week = '';

exports.update_bills_schedule = function(){
  request(house_url, function(err, resp, body){
    if(err)
      console.log(err);

    var $ = cheerio.load(body);

    //parse week
    var all_header = $('#primaryContent').find('h1').text();
    var start = all_header.indexOf('Week');
    var end = all_header.indexOf('2016')+4;
    var header = all_header.substring(start, end);
    week = header.toLowerCase().replace(/[^A-Za-z0-9]+/g, '_');

    //parse each individual item scheduled for the week
    $('.floorItem').each(function(){
      if($(this).find('.legisNum').text().toString().toLowerCase().replace(/\s|\./g,'') != ''){
        var bill = {
          bill_id: $(this).find('.legisNum').text().toString().toLowerCase().replace(/\s|\./g,''),
          title: $(this).find('.floorText').text(),
          policy_area: '',
          committees: 'unspecified',
          subjects: [],
          status: '',
          link: $(this).find('.files').find('a').attr('href')
        };

        //hit the propublica API for subjects
        if(bill.bill_id.indexOf('hr') > -1 && bill.bill_id.indexOf('senate') == -1){
          get_bills_subject(bill);

          //keep track of how many bills we're populating
          total_bills++;
        }
      }
    });
  });
}

function get_bills_subject(bill){
    var options = {
      url : 'https://api.propublica.org/congress/v1/114/bills/'+bill.bill_id+'/subjects.json',
      headers: {
        "X-API-Key" : congress_api_key
      }
    };

    request(options, function(err, resp, body){
      if(err){
        console.log(err);
      }else{
        if(bill != undefined){
          bill.committees = JSON.parse(body).results[0].committees;

          for(var j = 0; j < JSON.parse(body).results[0].subjects.length; j++){
            bill.subjects.push(JSON.parse(body).results[0].subjects[j].name);
          }
        }
      }

      //hitting congress.gov to get policy area
      get_bill_policy_area(bill);
    });
}

function get_bill_policy_area(bill){
  var bill_url = 'https://www.congress.gov/bill/114th-congress/house-bill/'+bill.bill_id.replace('hr','');

  request(bill_url, function(err, resp, body){
    if(err)
      console.log(err);

    var $ = cheerio.load(body);
    var flag = false;
    var policy_area = 'unspecified';
    $('.tertiary_section').each(function(){
      var els = $(this).find('.plain').find('li');
      if(flag){
        policy_area = els[0].children[0].data;
        return;
      }

      flag = true;
    });

    bill.policy_area= policy_area;

    scheduled_bills.push(bill);

    if(scheduled_bills.length == total_bills){
      fs.writeFile('public/data/newsletter/scheduled_bills_'+week+'.json', JSON.stringify(scheduled_bills), function(err){
        if(err){
          throw(err);
        }else{
          console.log('successfully added',scheduled_bills.length,'bills for the week of',week);
        }
      });
    }
  });
}

exports.get_bills_schedule = function(req, res, err){
  if(err)
    console.log(err);

  var file = fs.readdirSync('public/data/newsletter')[0]
  var bills = JSON.parse(fs.readFileSync('public/data/newsletter/'+file));
  res.json(bills);
}



//--- EMAIL SUBSCRIBERS

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
