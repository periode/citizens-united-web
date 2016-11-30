function subscribe(){
  var _email = document.getElementById('email').value;
  var _name = document.getElementById('name').value;

  var _data = {
    name: _name,
    email: _email
  }

  document.getElementById('status').setAttribute('style', 'opacity: 1');
  document.getElementById('status').innerText = "Processing...";

  $.ajax({
    type: 'POST',
    url: '/email-subscription',
    data: _data
  }).done(function(data){
    document.getElementById('email').value = "";
    document.getElementById('name').value = "";

    if(data == "found")
      document.getElementById('status').innerText = "Already found a subscription to "+_email+".";
    else
      document.getElementById('status').innerText = "Successfully subscribed!";
  }).fail(function(data){
    document.getElementById('status').innerText = "Something seems to have gone wrong... Please check your email address.";
  });
}
