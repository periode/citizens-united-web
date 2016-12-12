function submit(){
  var _email = document.getElementById('address').value;

  $.ajax({
    type: 'POST',
    url: '/newsletter/unsubscribe',
    data: {email: _email}
  }).done(function(data){
    document.getElementById('email').value = "";

    if(data == "not found")
      setError('No such email address in our contact book (<u>'+_email+'</u>).');
    else if(data == "success")
      setSuccess('Oh well...<br>We\'ve successfully removed <u>'+email+'</u> from the Congress Newsletter.');

  }).fail(function(data){
    document.getElementById('status').innerText = "Something seems to have gone wrong... Please check your email address.";
  });
}

function setSuccess(msg){
  document.getElementById('status').innerHTML = msg;
  document.getElementById('status').setAttribute('class', 'success');
}

function setError(err){
  document.getElementById('status').innerHTML = err;
  document.getElementById('status').setAttribute('class', 'error');
}
