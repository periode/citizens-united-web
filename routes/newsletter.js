// NEWSLETTER
var fs = require('fs');
var mailer = require('nodemailer');
var pug = require('pug');

var months = {
  'jan':0,
  'feb':1,
  'mar':2,
  'apr':3,
  'may':4,
  'jun':5,
  'jul':6,
  'aug':7,
  'sep':8,
  'oct':9,
  'nov':10,
  'dec':11
};

var policy_areas = [
  'All Areas',
  'Agriculture and Food',
  'Animals',
  'Armed Forces and National Security',
  'Arts, Culture, Religion',
  'Civil Rights and Liberties, Minority Issues',
  'Commerce',
  'Congress',
  'Crime and Law Enforcement',
  'Economics and Public Finance',
  'Education',
  'Emergency Management',
  'Energy',
  'Environmental Protection',
  'Families',
  'Finance and Financial Sector',
  'Foreign Trade and International Finance',
  'Government Operations and Politics',
  'Health',
  'Housing and Community Development',
  'Immigration',
  'International Affairs',
  'Labor and Employment',
  'Law',
  'Native Americans',
  'Public Lands and Natural Resources',
  'Science, Technology, Communications',
  'Social Sciences and History',
  'Social Welfare',
  'Sports and Recreation',
  'Taxation',
  'Transportation and Public Works',
  'Water Resources Development'
];


var committees = [
  'All Committees',
  'Administration',
  'Agriculture',
  'Appropriations',
  'Armed Services',
  'Education and the Workforce',
  'Energy and Commerce',
  'Financial Services',
  'Foreign Affairs',
  'Homeland Security',
  'Natural Resources',
  'Oversight and Government Reform',
  'Rules',
  'Science, Space, and Technology',
  'Small Business',
  'Standards of Official Conduct',
  'Budget',
  'Judiciary',
  'Transportation and Infrastructure',
  'Veterans\' Affairs',
  'Ways and Means',
  'Permanent Select Committee On Intelligence',
  'Select Committee On Benghazi',
];

var mg_user = 'postmaster@mg.citizens-united.com';
var mg_pass = '4b3d4d464b3fed0f5e14a514f42ea2d7';

var smtpConfig = {
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true,
  auth: {
    user: mg_user,
    pass: mg_pass
  }
};

var transporter = mailer.createTransport(smtpConfig);

function sendMail(html, text, recipient){

  var mail_content = {
    from: '"Congress Newsletter" <postmaster@mg.citizens-united.com>',
    to: recipient,
    subject: 'Congress Newsletter - '+getCurrentDate(),
    text: 'hello',
    html: html
  }

  transporter.sendMail(mail_content, function(err, info){
    if(err)
      return console.log(err);

    console.log('mail sent',info.response);
  });
}

//--- RENDER WEBPAGE
exports.landing = function(req, res, err){
  if(err)
    console.log(err);

  res.render('newsletter.pug', {areas : policy_areas, committees: committees});
}

exports.manage = function(req, res, err){
  if(err)
    console.log(err);

  res.render('newsletter_manage.pug');
}

exports.add_new_subscriber = function(req, res, err){
  var new_subscriber = req.body;

  var obj = JSON.parse(fs.readFileSync('public/data/newsletter/subscribers.json'));

  var found = false;
  for(var i = 0; i < obj.all_subscribers.length; i++){
    if(obj.all_subscribers[i].email == new_subscriber.email)
      found = true;
  }

  if(!found){

    obj.all_subscribers.push(new_subscriber);

    fs.writeFile('public/data/newsletter/subscribers.json', JSON.stringify(obj), function(err){
      if(err)
        throw err;
      else{
        console.log('added new subscriber to the congress newsletter');
        console.log(new_subscriber);
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
};

exports.get_all_subscribers = function(req, res, err){
  var obj = JSON.parse(fs.readFileSync('public/data/newsletter/subscribers.json'));

  res.json(obj);
};

exports.remove_subscriber = function(req, res, err){
  var to_remove = req.body.email;
  var obj = JSON.parse(fs.readFileSync('public/data/newsletter/subscribers.json'));

  var success = false;
  for(var i = 0; i < obj.all_subscribers.length; i++){
    if(obj.all_subscribers[i].email == to_remove){
      obj.all_subscribers.splice(i, 1);
      success = true;
    }
  }

  if(success){
    fs.writeFile('public/data/newsletter/subscribers.json', JSON.stringify(obj), function(err){
      if(err)
        throw err;
      else{
        console.log('removed',to_remove);
        res.send("success");
      }
    });
  }else{
    res.send("not found");
  }
}


//SENDING OUT NEWSLETTER
function setupNewsletter(){
  var all_subscribers = JSON.parse(fs.readFileSync('public/data/newsletter/subscribers.json')).all_subscribers;
  var path = pickMostRecentBill(fs.readdirSync('public/data/newsletter/scheduled_bills'));
  var upcoming_schedule = JSON.parse(fs.readFileSync('public/data/newsletter/scheduled_bills/'+path));

  for(var i = 0; i < all_subscribers.length; i++){
    var parcel = {
      recipient: all_subscribers[i],
      bills: []
    };

    //tagged all areas, just push the whole thing
    if(parcel.recipient.committees == "All Committees"){
      parcel.bills = upcoming_schedule;
    }else{
      //go through one upcoming area at a time
      for(var j = 0; j < upcoming_schedule.length; j++){
        var upcoming_area = upcoming_schedule[j].policy_area;
        var upcoming_committees = upcoming_schedule[j].committees;

        //compare with all the registered areas
        for(var k = 0; k < parcel.recipient.areas.length; k++){
          if(parcel.recipient.areas[k] == upcoming_area){
            parcel.bills.push(upcoming_schedule[j]);
            break
          }
        }

        //compare with all the registered committees and make sure you don't duplicate
        for(var k = 0; k < parcel.recipient.committees.length; k++){
          if(upcoming_committees.indexOf(parcel.recipient.committees[k]) > -1
            && parcel.bills[parcel.bills-1] != upcoming_schedule[j]){
            parcel.bills.push(upcoming_schedule[j]);
            break;
          }
        }
      }
    }

    if(parcel.bills.length != 0)
      formatNewsletter(parcel);
  }
}

function formatNewsletter(_parcel){
  var content = {bills: _parcel.bills, date: getCurrentDate()};

  var fn = pug.compileFile('public/views/email/default_email.pug');
  var html = fn(content);

  // sendMail(html, 'hey', _parcel.recipient.email);
}

setupNewsletter();

function getCurrentDate(){
  var date = new Date();
  var timestamp = date.getDate()+'/'+(date.getMonth()+1);

  return timestamp;
}

function pickMostRecentBill(bills){
  var most_recent = '';
  var most_recent_year = 0;
  var most_recent_month = 0;
  var most_recent_day = 0;

  for(var i = 0; i < bills.length; i++){
    var y = parseInt(bills[i].substring(15, 19));
    var m = bills[i].substring(8, 11);
    var d = parseInt(bills[i].substring(12, 14));

    if(y >= most_recent_year){
      if(months[m] >= most_recent_month){
        if(d >= most_recent_day){
          most_recent = bills[i];

          most_recent_year = y;
          most_recent_month = m;
          most_recent_day = d;
        }
      }
    }
  }

  return most_recent;
}
