function showtree (h,f,g){
            var id = 0;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if(this.readyState == 0){
$('#tree').append('Anfrage nicht initialisiert<br/>');
   }
  if(this.readyState == 1){
$('#tree').append('Server Verbindung hergestellt<br/>');
   }
  if(this.readyState == 2){
$('#tree').append('Anfrage erhalten<br/>');
   }
  if(this.readyState == 3){
$('#tree').append('Anfrage verarbeiten<br/>');
   }
  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(this.responseText);
$('#tree').empty();
$('#tree').append('<ul>');


$("#tree").on("click", "*" , function(event){
    switch($(this).prop('nodeName')) {
  	case "I":
	if($(this).hasClass("toggle")){
	}
	else if($(this).hasClass("favorite")){
	$(this).toggleClass("fas starmarked");
	$(this).toggleClass("far");
	}
    break;
  	case "DIV1":
	$(this).parent().parent().parent().removeClass("font-weight-bold");
	markedstatus = $(this).parent().find(".favorite").hasClass('far') ? true : false;
	$(".seltrue").removeClass("seltrue");
	$(this).parent().addClass("seltrue");
    break;
  	default:
} 
})

moodleurl = myObj.moodleurl;
buildTree(myObj, 1);
if(g){
        $( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" + g,function(responseTxt, statusTxt, xhr){
	if (statusTxt == "error"){$('#treeinfo').append("$statusTxt")}
	if (statusTxt == "success"){
	if($('.loginerrors').length>0){
		window.location.reload;
	}
	$("#messagehead").get(0).scrollIntoView();}
	})
}

$(".node").on("mouseover", function(d){
	$(this).toggleClass("selected");
}).on("mouseout", function(d){
	$(this).toggleClass("selected");

})
}
$(".toggle").on("click", function(d){
 $(this).toggleClass('fa-arrow-down');
 $(this).toggleClass('fa-arrow-right');
 $(this).hasClass('fa-arrow-right') ?  hideNext($(this).parent().parent().parent().parent(), 8) : showNext($(this).parent().parent().parent().parent(), 8);
;
})
$( "form" ).submit(function( event ) {
search(event);
});
function hideNext (test, column){
	if(column <= $(test).next().attr("column") && !$(test).next().hasClass('hidden')  ){
	$(test).next().hasClass('hidden') ? $(test).next().removeClass('hidden'): $(test).next().addClass('hidden');
	hideNext($(test).next(), column);

	}else {	
	 return;
	}

}
function showNext (test, column){

	if(column <= $(test).next().attr("column") && $(test).next().hasClass('hidden')  ){
	$(test).next().hasClass('hidden') ? $(test).next().removeClass('hidden'): $(test).next().addClass('hidden');
	showNext($(test).next(), column);
	}else {	
	 return;
	}

}
function buildTree(myObj, margin){
	jQuery.each(myObj.children, function (d, val){
		var marked = val.markedstatus != '0' ? "fas starmarked " : "far ";
		var read = val.messagestatus == '0' ? "font-weight-bold " : "";
		if(val.picturestatus > '0'){
		var jdenticonstring = '<div class="control col-sm-7 col-xl-3 "><img title="Name: '+ val.personal+'\r\nE-Mail-Adresse: '+ val.sender  +'" src="' + moodleurl +'/user/pix.php/'+val.user_id+'/f1.jpg" width="20" height="20"></img></div>';
		}else{
		var jdenticonstring = '<img style="visibility:hidden" src="' + moodleurl +'/user/pix.php/'+val.user_id+'/f1.jpg" width="0" height="20"></img>';
		jdenticonstring = jdenticonstring + '<div class="control col-sm-7 col-xl-3" title="Name: '+ val.personal+'\r\nE-Mail-Adresse: '+ val.sender  +'">' + jdenticon.toSvg(val.sender, 19,{lightness: { color: [0.40, 0.80], grayscale: [0.30, 0.90]}, saturation: { color: 0.50, grayscale: 0.00}, backColor: "#86444400"})+ '</div>';
		}
		if(!val.children){
		var childornot = "hidden";
		}
		var treeli = '<li column="'+ margin+'" class="node '+ read +'" messageid="'+ val.messageid +'">';
		var licontainer ='<div class="container-fluid"><div class="row"><div class="col-sm-2 col-xl-3 offset-xl-0">';
		var sender = '<div class="col-xl-3">'+val.sender+'</div>';
		var subject = '<div  class="col-xl-5 col-sm-8 offset-xl-1 message" style="margin-left:'+margin+'">'+val.name+'</div>';
		var calctime = isNaN(val.date) ? $.format.date(new Date(val.date).getTime(), "dd/MM/yyyy"): "";
		var timestamp = '<div  class="datetime col-sm-1 col-xl-3" style="margin-left:-'+margin+'">'+ calctime +'</div>';
		var fontpictures ='<i style="margin-left:10" class="marked '+marked+' fa-star favorite" /><i class="toggle fas fa-xs fa-arrow-down '+childornot+'"/>';
		var enddiv ='</div>';
		$('ul').append(treeli + licontainer +jdenticonstring + fontpictures + enddiv +subject+ timestamp+enddiv+enddiv);
		buildTree(val, margin + 8);
	});
}
$('.marked').on("click", function(d){ console.log($(this).parent().parent().parent().parent().attr('messageid'));
	$.get( "statuschange.php?id="+f+"&msgnr="+$(this).parent().parent().parent().parent().attr('messageid') +"&marked=true",function(data){console.log(data);});
})
$('.message').on("click", function(d){ 
	$(this).parent().parent().parent().removeClass("font-weight-bold");
        $( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" +$(this).parent().parent().parent().attr('messageid'),function(responseTxt, statusTxt, xhr){
	if (statusTxt == "error"){$('#treeinfo').append("$statusTxt")}
	if (statusTxt == "success"){
	if($('.loginerrors').length>0){
		window.location.reload;
	}
	$("#messagehead").get(0).scrollIntoView();}
	})

})


function toggle(e){
	//console.log(e.attr('class'));
	switch(e.attr('class')){
	case "far fa-star":
	$(this).toggleClass("fas");
        $(this).toggleClass("far");
	$.get( "search.php?id="+f+"&msgnr="+$(this).parent().attr('messageid') +"&marked="+d.markedstatus)
	break;
	case "far":
	break;
	default:
	}
};
}
xmlhttp.open("GET", "phpconn5.php?id="+f, true);
xmlhttp.send(); 
}


