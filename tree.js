function showtree (h,f,g){
            var id = 0;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function(data) {
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
$('#tree').append('Anfrage verarbeiten<br/>'+ this.response);
   }
  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(this.responseText);
$('#tree').empty();
$('#tree').append('<ul class="treeinfo">');
//$('#treeinfo').append('<ul class="activity">');
//myObj.sort(function(a, b) {
//    var dateA = new Date(a.date), dateB = new Date(b.date);
//    return dateB - dateA;
//});
var data = eval(myObj);
var results = data['children'];

//SortTime
//results.sort(function(obj1, obj2) { return new Date(obj1.date).getTime() - new Date(obj2.date).getTime();
//}).reverse();
//SortName
//results.sort(function(a, b) { 
//   var compA = a.name.toUpperCase();
//   var compB = b.name.toUpperCase();
//   return (compA > compB) ? -1 : (compA < compB) ? 1 : 0;
//});

//Filter
//$('.marked').not('.starmarked').each(function (index,value){$(value).parent().parent().parent().parent().addClass('hidden');});




moodleurl = myObj.moodleurl;
var jdenticonstring = '<div class="control col-sm-3 col-xl-4 px-0 ">' + jdenticon.toSvg('sortname', 19,{lightness: { color: [0.40, 0.80], grayscale: [0.30, 0.90]}, saturation: { color: 0.50, grayscale: 0.00}, backColor: "#86444400"})+'</div><img style="visibility:hidden" src="" width="0" height="20"></img>';
var fontpictures ='<i style="margin-left:2" class="sortmarked fas fa-star" /><i class="sorttoggel fas fa-xs fa-arrow-down "/>';

$('.treeinfo').append("<li class=' node header'><div class='container-fluid px-0'><div class='row'><div class='favorite px-0 col-sm-1 col-xl-1 offset-xl-0 row'>"+jdenticonstring+fontpictures+"</div><div class='col-xl-5  col-sm-4 sortsubject'>Betreff</div><div class='absender col-sm-3 col-xl-3'>Absender</div><div class='sortdatetime datetime px-0 col-sm-1 col-xl-2' >Datum</div></div></div></div></div></li>");
sequence=1;
checkOrientation();
buildTree(myObj, 1);
reloadBindings();

//buildActivityLog(myObj);

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


$( "form" ).submit(function( event ) {
event.preventDefault();
event.stopImmediatePropagation();
if($('input').val().length < '1'){
$('.node').not('.header').removeClass('hidden');
};
var xmlhttpsearch = new XMLHttpRequest();
xmlhttpsearch.onreadystatechange = function(data) {
  if(this.readyState == 0){
   }
  if(this.readyState == 1){
   }
  if(this.readyState == 2){
   }
  if(this.readyState == 3){
   }
  if (this.readyState == 4 && this.status == 200) {
//if (isJsonString(this.responseText)){
var search = JSON.parse(this.responseText);
$('.node').not('.header').addClass('hidden');
$(search).each(function(e,d){
	 $('[messageid="'+d.uid+'"]').removeClass('hidden');
	});
   }
//}
}
xmlhttpsearch.open("GET", "search.php?id="+f+ "&searchparam="+ $(".form-control").val(), true);
xmlhttpsearch.send();
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
		var data = eval(myObj);
		var results = data['children'];
		var marked = val.markedstatus != '0' ? "fas starmarked " : "far ";
		var read = val.messagestatus == '0' ? "font-weight-bold " : "";
		if(val.picturestatus > '0'){
		var jdenticonstring = '<div class="control col-sm-3 col-xl-1 px-0 "><img title="Name: '+ val.personal+'\r\nE-Mail-Adresse: '+ val.sender  +'" src="' + moodleurl +'/user/pix.php/'+val.user_id+'/f1.jpg" width="20" height="20"></img></div>';
		}else{
		var jdenticonstring = '<img style="visibility:hidden" src="' + moodleurl +'/user/pix.php/'+val.user_id+'/f1.jpg" width="0" height="20"></img>';
		jdenticonstring = jdenticonstring + '<div class="px-0 control col-sm-3 col-xl-4" title="Name: '+ val.personal+'\r\nE-Mail-Adresse: '+ val.sender  +'">' + jdenticon.toSvg(val.sender, 19,{lightness: { color: [0.40, 0.80], grayscale: [0.30, 0.90]}, saturation: { color: 0.50, grayscale: 0.00}, backColor: "#86444400"})+ '</div>';
		}
		if(!val.children){
		var childornot = "hidden";
		}
		var treeli = '<li column="'+ margin+'" sequence="'+ sequence++ +'" marked="'+val.markedstatus +' " class="node px-0 '+ read +'" messageid="'+ val.messageid +'" data-date="'+ new Date(val.date)+'">';
		var licontainer ='<div class="px-0 container-fluid"><div class="row px-0"><div class="px-0 col-sm-1 col-xl-1 offset-xl-0 row">';
		var sender = '<div class="col-xl-3 px-0">'+val.sender+'</div>';
		var subject = '<div  class="col-xl-5 col-sm-4 message" style="border-left-width: '+margin +'px;border-color: white;border-left-style: solid">'+val.name+'</div>';
		var calctime = new Date(val.date);
var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

calctime= new Date(val.date).toLocaleDateString('de-DE', options) ? new Date(val.date).toLocaleDateString('de-DE', options):"" ;
		var absender = val.personal ? val.personal : val.sender;
		var timestamp = '<div class=" message col-xl-3 col-sm-3">'+ absender +'</div><div  class="datetime px-0 col-sm-2 col-xl-2" data-date-format="DD.MM.YYYY">'+ calctime +'</div>';
		var fontpictures ='<i style="margin-left:2" class="marked '+marked+' fa-star favorite" /><i class="toggle fas fa-xs fa-arrow-down '+childornot+'"/>';
		var enddiv ='</div>';
		$('.treeinfo').append(treeli + licontainer +jdenticonstring + fontpictures + enddiv +subject+ timestamp+enddiv+enddiv);
		buildTree(val, margin + 25);
	});
return;
}
function reloadBindings(){


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

$('.node').not('.header').on("mouseover", function(d){
	$(this).toggleClass("selected");
}).on("mouseout", function(d){
	$(this).toggleClass("selected");

})

$('input').on('input', function (e) {
	if ($(this).val().length < '3'){
	}

});



$('.header').on("mouseover", function(d){
	$(this).toggleClass("selectedheader");
}).on("mouseout", function(d){
	$(this).toggleClass("selectedheader");
})


}


$(".toggle").on("click", function(d){
 $(this).toggleClass('fa-arrow-down');
 $(this).toggleClass('fa-arrow-right');
 $(this).hasClass('fa-arrow-right') ?  hideNext($(this).parent().parent().parent().parent(), 8) : showNext($(this).parent().parent().parent().parent(), 8);

})

$('.sortdatetime').on('click', function(d) {
	sortbyDate();
})
$('body').bind('orientationchange', function(e) {
	checkOrientation();
});



$('.absender').on('click', function(d) {
	sortbyAbsender();
})
$('.sortsubject').on('click', function(d) {
	sortbyName();
})

$('.sortmarked').on('click', function(d) {
	sortbyFavorite();
})

$('.sorttoggel').on('click', function(d) {
	sortbyTree();
})

$('.marked').on("click", function(d){ 
	$.get( "statuschange.php?id="+f+"&msgnr="+$(this).parent().parent().parent().parent().attr('messageid') +"&marked=true",function(data){});
})

$('.message').on("click", function(d){ 
	$(this).parent().parent().parent().removeClass("font-weight-bold");
	$('.seltrue').removeClass('seltrue');
	$(this).parent().parent().parent().addClass("seltrue");
        $( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" +$(this).parent().parent().parent().attr('messageid'),function(responseTxt, statusTxt, xhr){
	if (statusTxt == "error"){$('#treeinfo').append("$statusTxt")}
	if (statusTxt == "success"){
	if($('.loginerrors').length>0){	
		window.location.reload;
	}
	$('#nextbutton').bind('click', function(){navigateNext(this)});

	$('#previusbutton').bind('click', function(){navigatePrevius(this)});
	$("#treeinfo").get(0).scrollIntoView();}
	})
})}

function sortbyDate(){
$(".node").not('.header').sort(function(a,b){ 
    return new Date($(a).attr("data-date")) < new Date($(b).attr("data-date"));
}).each(function(){
    $(".treeinfo").append(this);
})
}

function sortbyTree(){
//$('.treeinfo').empty();

//$('.treeinfo').append("<li class='px-0 node header'><div class='container-fluid px-0'><div class='row px-0'><div class='favorite px-0 col-sm-2 col-xl-1 offset-xl-0'>"+jdenticonstring+fontpictures+"</div><div class='col-xl-7 px-0 col-sm-8 sortsubject'>Betreff</div><div class='sortdatetime datetime px-0 col-sm-1 col-xl-' >Datum</div></div></div></div></div></li>");
//location.reload(true);
$(".node").not('.header').sort(function(a,b){ 
    return parseInt($(a).attr("sequence")) > parseInt($(b).attr("sequence"));
}).each(function(){
    $(".treeinfo").append(this);
})


//buildTree(myObj,1);
//reloadBindings();

}
function checkOrientation() {
	if(typeof window.orientation == 'undefined') {
		//not a mobile 
		return true;
	}
	if(Math.abs(window.orientation) != 90) {
		//portrait mode
		$('#orr').fadeIn().bind('touchstart', function(e) {
			e.preventDefault();
		});
		return false;
	}
	else {
		//landscape mode
		$('#orr').fadeOut();
		return true;
	}
};


function sortbyFavorite(){
$(".node").not('.header').sort(function(a, b) {
   var compA = $(a).attr("marked").toUpperCase();
   var compB = $(b).attr("marked").toUpperCase();
   return (compA > compB) ? -1 : (compA < compB) ? 1 : 0;
}).each(function() { $(".treeinfo").append(this); });
}

function sortbyName(){
$(".node").not('.header').sort(function(a, b) { 
   var compA = $(a).text().toUpperCase();
   var compB = $(b).text().toUpperCase();
   return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
}).each(function() { $(".treeinfo").append(this); });

}
function sortbyAbsender(){
$(".node").not('.header').sort(function(a, b) { 
   var compA = $(a).text().toUpperCase();
   var compB = $(b).text().toUpperCase();
   return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
}).each(function() { $(".treeinfo").append(this); });

}


$(".timelist").each(function(fff,elem ){
$(elem).append(
//	$.format.prettyDate(new Date(parseInt($(elem).attr("timestamp"))).getTime(),"dd MM yyyy")
);

});
$('#treeinfo li').sort(function(a, b) {
    return $(b).data('timestamp') - $(a).data('timestamp');
  }).appendTo('#treeinfo');



function toggle(e){
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

