var members;

function init(){
  $.ajax({
    url : '/get-congress'
  }).done(function(data){
    members = data.members;

    var states = document.getElementById("state");

    var all = document.createElement('option');
    all.innerText = 'ANY';
    all.setAttribute('value', 'all');
    states.append(all);

    var sorted_states = sortStates();

    var added = [];
    for(var i = 0; i < sorted_states.length; i++){
        var state = document.createElement('option');
        state.innerText = sorted_states[i];
        state.setAttribute('value', sorted_states[i]);
        states.append(state);
    }
  })
}

function sortStates(){
  var s = [];

  var added = [];
  for(var i  = 0; i < members.length; i++){
    var hasBeenAdded = false;

    for(var j = 0; j < added.length; j++){
      if(added[j] == members[i].state)
        hasBeenAdded = true;
    }

    if(!hasBeenAdded){
      s.push(members[i].state);
      added.push(members[i].state);
    }
  }

  s.sort();

  return s;
}
