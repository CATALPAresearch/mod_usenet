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
$.post("posttest.php?id="+param+"&msgnr=" +$('#messagehead').attr('messageid')+"&sender=rpatzer@gmx.de", { userInput : text, subject : subject }, function(data){ alert(data);});
    alert("nachricht gesendet");
    location.reload(false);
  }

}
function createButton(){
    //alert("test");
    $('#treeinfo').empty();
    //$("#contentree").append("<textarea id=messagebody cols=50 rows=40/>");
    //$("#answerbutton").text("Senden");

}

