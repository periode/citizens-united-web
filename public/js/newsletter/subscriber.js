function selectArea(area){
  var el = document.getElementById(area)
  var state = el.getAttribute('class');

  if(state == 'areas')
    el.setAttribute('class', 'areas selected');
  else
    el.setAttribute('class', 'areas');
}

function selectCommittee(comm){
  var el = document.getElementById(comm)
  var state = el.getAttribute('class');

  if(state == 'committees')
    el.setAttribute('class', 'committees selected');
  else
    el.setAttribute('class', 'committees');
}


function subscribe(){
  var selected_areas = document.getElementsByClassName('areas selected');
  var areas = [];
  for(var i = 0; i < selected_areas.length; i++){
    areas.push(selected_areas[i].innerText.replace("'", "&#39;"));

    if(selected_areas[i].innerText == 'All Areas'){
      areas = "All Areas";
      break;
    }
  }

  var selected_committees = document.getElementsByClassName('committees selected');
  var committees = [];
  for(var i = 0; i < selected_committees.length; i++){
    committees.push(selected_committees[i].innerText.replace("'", "&#39;"));

    if(selected_committees[i].innerText == 'All Committees'){
      selected_committees = "All Committees";
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
    areas: areas,
    committees: committees
  };

  for(var field in subscriber){
    if(subscriber[field] == '' || subscriber == null){
        setError('Oops, it seems you forgot to specify your <u>'+field+'</u>.');
        return;
    }
  }

  $.ajax({
    type: 'POST',
    url: '/newsletter/new',
    data: subscriber
  }).done(function(data){
    document.getElementById('email').value = "";
    document.getElementById('name').value = "";

    if(data == "found")
      setError('Already found a subscription to '+_email+'.');
    else
      setSuccess('Thank you!<br>We\'ve successfully added <u>'+email+'</u> to the Congress Newsletter.');

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


function switchDisplay(){
  if(document.getElementById('committees').style.display == 'none'){
    document.getElementById('policy_areas_header').setAttribute('class', 'six columns background');
    document.getElementById('committees_header').setAttribute('class', 'six columns foreground');

    document.getElementById('policy_areas').setAttribute('style', 'display: none');
    document.getElementById('committees').setAttribute('style', 'display: table');
  }else{
    document.getElementById('policy_areas_header').setAttribute('class', 'six columns foreground');
    document.getElementById('committees_header').setAttribute('class', 'six columns background');

    document.getElementById('policy_areas').setAttribute('style', 'display: table');
    document.getElementById('committees').setAttribute('style', 'display: none');
  }
}
