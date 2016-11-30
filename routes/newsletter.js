// NEWSLETTER


//--- RENDER WEBPAGE
exports.landing = function(req, res, err){
  if(err)
    console.log(err);

  res.render('newsletter.pug');
}
