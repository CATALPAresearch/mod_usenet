function search(e){
  e.preventDefault();
  let searchParams = new URLSearchParams(window.location.search);
  let param = searchParams.get('id');
  uri = encodeURI("search.php?id="+param+"&searchparam="+ $(".form-control").val());
   $( "#treeinfo" ).load( uri ,function(responseTxt, statusTxt, xhr){if (statusTxt == "OK"){
                                $('#treeinfo').append('<p>'+responseTxt+'</p>');
	};})


}

function navigateNext(){
//e.stopImmediatePropagation();
if ($('.seltrue').attr("column")<$('.seltrue').next().attr("column")){
var g = $('.seltrue').next().attr('messageid');
let searchParams = new URLSearchParams(window.location.search);
let param = searchParams.get('id');

var x = $('.seltrue');
$(x).toggleClass('seltrue');
$(x).next().toggleClass('seltrue');
$( "#treeinfo" ).load( "messageid.php?id="+param+"&msgnr=" + g,function(responseTxt, statusTxt, xhr){
if ($('.seltrue').attr("column")>$('.seltrue').next().attr("column")){
$('#nextbutton').toggleClass('disabled');
}

        })
var x = $('.seltrue').attr('messageid');
}
}

function navigatePrevius(){
if($('#previusbutton').hasClass('disabled')){return;}
if ($('.seltrue').attr("column")>$('.seltrue').prev().attr("column")){
var g = $('.seltrue').prev().attr('messageid');
let searchParams = new URLSearchParams(window.location.search);
let param = searchParams.get('id');

var x = $('.seltrue');
$(x).toggleClass('seltrue');
$(x).prev().toggleClass('seltrue');

$( "#treeinfo" ).load( "messageid.php?id="+param+"&msgnr=" + g,function(responseTxt, statusTxt, xhr){
if ($('.seltrue').attr("column")<$('.seltrue').prev().attr("column")){
$('#previusbutton').toggleClass('disabled');
}
        })
}
}
function answerButton(){
   var z =$("#answerbutton").text();
  if (z.indexOf("Antworten")>=0){
    var x = $("#messagebody").text();
    $("#messagebody").replaceWith("<div class='form-group shadow-textarea'><textarea class='form-control' id=messagebody cols=90 rows=17/></div>");
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
$.post("posttest.php?id="+param+"&msgnr=" +$('#messagehead').attr('messageid'), { userInput : text, subject : subject }, function(data){ });


    alert("nachricht gesendet");


    location.reload(false);
  }

}
function createButton(){
    //alert("test");
    $('#treeinfo').empty();
    $("#treeinfo").append("<a class='btn btn-primary' id=answerbutton onclick='javascript: sendButton();'>Senden</a><BR>");
    $("#treeinfo").append("<label for=subject>Betreff:</label>");
    $("#treeinfo").append("<input id=subjectnew class=form-control type=text size=50/>");
    $("#treeinfo").append("<label for=messagebody>Text:</label><br/>");
    $("#treeinfo").append("<div class='form-group shadow-textarea'><textarea class='form-control' id=messagebody cols=100 rows=19/></div>");
}

function sendButton(){
    var subject = $('#subjectnew').val();
    let searchParams = new URLSearchParams(window.location.search);
    let param = searchParams.get('id');
    var text = $('#messagebody').val();
    $.post("posttest.php?id="+param+"&msgnr=new", { userInput : text, subject : subject }, function(data,status){ switch(status){
    case "success":
$('#treeinfo').empty();
$('#treeinfo').append("<div class='alert alert-success' role='alert'><h4 class='alert-heading'>Nachricht Versand</h4><p></p><hr><p class='mb-0'><p class='font-weight-bold'></p></p></div>");

	break;
    case "error":
	alert(data);
	break;
    default:
	break;
    };});
}
