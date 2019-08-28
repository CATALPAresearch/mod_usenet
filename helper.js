function search(e){
  e.preventDefault();
  let searchParams = new URLSearchParams(window.location.search);
  let param = searchParams.get('id');
  //$.post("search.php?id="+param+"&msgnr=", { userInput : $(".form-control").val() }, function(data){ alert(data);});
  uri = encodeURI("search.php?id="+param+"&searchparam="+ $(".form-control").val());
  $( "#treeinfo" ).load( uri ,function(responseTxt, statusTxt, xhr){if (statusTxt == "OK"){
                                $('#tree').append('<p>'+responseTxt+'</p>');
                      $('#tree').empty();

                };})


}
function answerButton(){
  var z =$("#answerbutton").text();
  if (z.indexOf("Antworten")>=0){
    var x = $("#messagebody").text();
    $("#messagebody").replaceWith("<textarea id=messagebody cols=50 rows=40/>");
    var f = x.split('\n');

var u="";
for(var i=0;i<f.length;i++){
    u = u +">"+ f[i]+"\n";
}
    $("#messagebody").val(u);
    $("#answerbutton").text("Senden");
  }else if (z.indexOf("Senden")>=0){
    var subject = $('#subject').text();
    var text = $('#messagebody').val();
    subject = "Re: " + subject;
let searchParams = new URLSearchParams(window.location.search);
let param = searchParams.get('id');
$.post("posttest.php?id="+param+"&msgnr=" +$('#messagehead').attr('messageid'), { userInput : text, subject : subject }, function(data){ alert(data);});
    alert("nachricht gesendet");
    location.reload(false);
  }

}
function createButton(){
    //alert("test");
    $('#treeinfo').empty();
    $("#treeinfo").append("<label for=subject>Betreff:</label>");
    $("#treeinfo").append("<input id=subjectnew class=form-control type=text size=50/>");
    $("#treeinfo").append("<a class='btn btn-primary' id=answerbutton onclick='javascript: sendButton();'>Senden</a><BR>");
    $("#treeinfo").append("<label for=messagebody>Text:</label><br/>");
    $("#treeinfo").append("<textarea id=messagebody cols=10 rows=40/>");
}

function sendButton(){
    var subject = $('#subjectnew').val();
    alert(subject);
    let searchParams = new URLSearchParams(window.location.search);
    let param = searchParams.get('id');
    var text = $('#messagebody').val();
    $.post("posttest.php?id="+param+"&msgnr=new", { userInput : text, subject : subject }, function(data,status){ switch(status){
    case "success":
	alert("Nachricht versandt "+ data);
    location.reload(false);
	break;
    case "error":
	alert(data);
	break;
    default:
	break;
    };});
}

