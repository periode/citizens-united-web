function selectArea(area){
  var el = document.getElementById(area)
  var state = el.getAttribute('class');

  if(state == 'areas')
    el.setAttribute('class', 'areas selected');
  else
    el.setAttribute('class', 'areas');
}


function subscribe(){
  var selected = document.getElementsByClassName('selected');
  var areas = [];
  for(var i = 0; i < selected.length; i++){
    areas.push(selected[i].innerText);

    if(selected[i].innerText == 'All Areas'){
      areas = "All Areas";
      break;
    }
  }
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var state = document.getElementById('state').value;

  var subscriber = {
    name: name,
    email: email,
    state: state,
    areas: areas
  };

  for(var field in subscriber){
    if(subscriber[field] == '' || subscriber == null){
        setError('Oops, it seems you forgot to specify your <u>'+field+'</u>.');
        return;
    }
  }

  setSuccess('Thank you!<br>We\'ve successfully added <u>'+email+'</u> to the Congress Newsletter.');

  console.log(subscriber);
}

function setSuccess(msg){
  document.getElementById('status').innerHTML = msg;
  document.getElementById('status').setAttribute('class', 'success');
}

function setError(err){
  document.getElementById('status').innerHTML = err;
  document.getElementById('status').setAttribute('class', 'error');
}
