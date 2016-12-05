// NEWSLETTER
var fs = require('fs');
var mailer = require('nodemailer');

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

var smtpConfig = {
  host: 'smtp.mailgun.org',
  port: 465,
  secure: true,
  auth: {
    user: 'postmaster@sandbox426582edff3249c085152793ef37ba6e.mailgun.org',
    pass: '78c2cab6d8eeea4f42aad99062903857'
  }
};

var transporter = mailer.createTransport(smtpConfig);

function sendMail(note, destination){
  var mail_content = {
    from: '"Congress Newsletter" <newsletter@mg.citizens-united.com>',
    to: 'pierre.depaz@gmail.com',
    subject: 'a quick reminder',
    text: '',
    html: 'hello, world'
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

  res.render('newsletter.pug', {areas : policy_areas});
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
