//TODO do ajax requests to call instead of loading a new page


function startCall(){
  var _requester = document.getElementById('phoneNumber').value;
  var _representative = document.getElementById('contacts-list').value;

  document.getElementById('status').setAttribute('style', 'opacity: 1');
  document.getElementById('status').innerText = "Processing...";

  var _data = {
    requester: _requester,
    representative: _representative
  };

  $.ajax({
    type: 'POST',
    url: '/initiate-call',
    data: _data
  }).done(function(data){
    document.getElementById('status').innerText = "Thank you! You should be receiving a phone call soon.";
  }).fail(function(data){
    document.getElementById('status').innerText = "Something seems to have gone wrong... Please check your phone number includes the country code.";
  });
}
