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
if (subject.search("Re: ")!= '-1'){
     subject = "Re: " + subject;
    }
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
    $("#treeinfo").append("<input id=subjectnew size=50/>");
    $("#treeinfo").append("<a class='btn btn-primary' id=answerbutton onclick='javascript: sendButton();'>Senden</a><BR>");
    $("#treeinfo").append("<label for=messagebody>Text:</label>");
    $("#treeinfo").append("<textarea id=messagebody cols=10 rows=40/>");
}

function sendButton(){
    var subject = $('#subjectnew').val();
    alert(subject);
    let searchParams = new URLSearchParams(window.location.search);
    let param = searchParams.get('id');
    var text = $('#messagebody').val();
    $.post("posttest.php?id="+param+"&msgnr=" +$('#messagehead').attr('messageid'), { userInput : text, subject : subject }, function(data,status){ switch(status){
    case "success":
	alert("Nachricht versandt");
    location.reload(false);
	break;
    case "error":
	alert(data);
	break;
    default:
	break;
    };});
}

