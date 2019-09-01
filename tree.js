function showtree (h,f,g){
$("form").on('submit',function(e){
    search(e);
});
//$('#tree').append("<div class=loading><i class='fa fa-cog fa-spin fa-5x'></i>loading</div>")
            var id = 0;


            d3.json('phpconn5.php?id='+f, function(err,data){
              if(err){
                $('#tree').append('<p>Fehler in der Datenstruktur</p>');
              }
              if(!data){
                $( "#tree" ).load( "phpconn5.php?id="+f,function(responseTxt, statusTxt, xhr){if (statusTxt == "OK"){
		                $('#tree').append('<p>'+responseTxt+'</p>');
	              $('#tree').empty();

		};})
                //$('#tree').append('<p>Keine Daten vorhanden</p>');
              return;
              }
	            $('#tree').empty();

              data.children.sort(function(a, b) {
                return b.date > a.date;
              });



                var tree = d3.layout.treelist()
                    .childIndent(30)
                    .nodeHeight(25);
//                var svg = ul

           var ul = d3.select("#tree").append("ul").classed("treelist col-sm-12 row container no-gutters", "true");

                function render(data, parent) {
                    var nodes = tree.nodes(data),
                        duration = 250;

                getChildrenProperty(data);

	//var textLabels = text
        //         .attr("x", function(d) { return d.cx; })
        //         .attr("y", function(d) { return d.cy; })
        //         .text( function (d) { return "( " + d.cx + ", " + d.cy +" )"; })
        //         .attr("font-family", "sans-serif")
        //         .attr("font-size", "20px")
        //         .attr("fill", "red");

                function getChildrenProperty(object) {
                  for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                      if (property.toLowerCase().indexOf("children") > -1) {
                        return property;
                      }
                    }
                  }

                  return null;
                }
                function reqListener (d) {
                  $( "#treeinfo" ).text(this.responseText);
                }
	var moodleurl="";
	function callmessage(d) {
                if (d.messageid !=undefined && d.messageid != '0'){
                //var oReq = new XMLHttpRequest();
                $( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" + d.messageid+"&sender="+d.sender,function(responseTxt, statusTxt, xhr){if (statusTxt == "error"){
		alert(d.messageid);
		location.reload();
		};})
		console.log(d);
                            d3.select(this.node).classed("selected", true);

              } else{
		    flatten(nodeEls);
              };
}
                    function toggleChildren(d) {


                        if (d.children && d.id != '1') {
                            d._children = d.children;
                            d.children = null;
                        } else if (d._children && d.id != '1') {
                            d.children = d._children;
                            d._children = null;
                        }
                    }
                    var nodeEls = ul.selectAll("li.node").data(nodes, function (d) {
                        d.id = d.id || ++id;
                        return d.id;
                    });



                    //entered nodes
                    var entered = nodeEls.enter().append("li").classed("node ", true)
                        .style("top", parent.y +"px")
                        .style("opacity", 0)
                        .on("click", function (d) {
                            render(data, d);
                        })
                        .on("mouseover", function (d) {
			    list = d3.select("#li");
			    setInfoParent(this);
			    console.log(this);
                            d3.select(this).classed("selected", true);
                        })
                        .on("mouseout", function (d) {
                            d3.selectAll(".selected").classed("selected", false);
                        });


		    function setInfoParent(d){
 			d.mainBranch="Yes";
			//d3.select().classed("selected", true);
  			if(d.parent){
    			setInfoParent(d.parent);//call recursively itself till no parent.
  			}
//			alert(testnumer++);

  			//console.log(d);
			}
                    //add arrows if it is a folder
                  entered.append("i").attr("class", function (d) {
                        var icon = d.children ? "fa-arrow-down"
                            : d._children ? "fa-arrow-right" : "";
                        return "fas fa-xs " + icon;
                    }).on("click",function (d){toggleChildren(d);});
                    //add icons for folder for file
                    entered.append("i").attr("class", function (d) {
                        var icon = d.children || d._children ? "fa-envelope-open"
                            : "fa-envelope";
                        return "far  " + icon;
                    })
		    .style("background", function(d){

		     var messageDate = Date.now();
		     var color = new Date(d.date).getTime() > (messageDate - (1*24*60*60*1000)) ? "yellow" : "white";
		     return color;
		    });
		    




		    entered.append("i").attr("class", function(d){
			var fontread = "";
			if (d.markedstatus == true ) { fontread ="fas fa-star starmarked";
			}else{
			 fontread = "far fa-star";
			}
//			console.log(d.markedstatus);
			return fontread;}).on("click",function (d){
//			console.log(d3.select(this));
                        stars = d3.select(this);
			$.get( "search.php?id="+f+"&msgnr="+d.messageid +"&marked="+d.markedstatus, function() {
			stars.classed("far", !stars.classed("far"));
			stars.classed("fas", !stars.classed("fas"));
			stars.classed("starmarked", !stars.classed("starmarked"));
			});
                        //$( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" + d.messageid+"&sender="+d.sender,function(responseTxt, statusTxt, xhr){if (statusTxt == "error"){
			//d3.select(this).classed("fas starmarked", d3.select(this).classed("fas starmarked"));
			});

                        //.html(function (d) { return "<img src=https://mmo-inside.de/moodle/user/pix.php/"+d.user_id +"/f1.jpg width=20 height=20>"; });
		    
		    entered.append("tspan").attr("class", "html")
			.attr("x", "100")
                        .html(function (d) { 
			return "<img src=https://mmo-inside.de/moodle/user/pix.php/"+d.user_id +"/f1.jpg width=20 height=20>"; });
                    //add text

                    entered.append("tspan").attr("class", function(d) {
			if (d.messagestatus == false ) { var fontread ="font-weight-bold";}
			return "col-sm filename " + fontread;
			})
			.style("dx", ".5em")
			.style("dy", ".9em")
			.text(function (d) { //return d.name;
		    if (d.name.length <= "50") return d.name.concat("          .");
    		    	return d.name.substr(0, "50").concat("...");
		     })     .on("click", function(d) {
			    $('.node').append('<div class="node date" style="top: 30px; opacity: 1; position:absolute; Left: 300px;"></div>');
  			    d3.select(this).select(".font-weight-bold").classed("font-weight-bold", false);
                            d3.selectAll(".seltrue").classed("seltrue", false);
                            d3.select(this).classed("seltrue", true);
			    //callmessage(d);
		     })
                    entered.append("tspan").attr("class", function(d) {
			if (d.messagestatus == false ) { var fontread ="font-weight-bold";}
			return "offset-sm-2 filename " + fontread;
			})
			.style("margin-left", "50px")
			.text(function (d) { //return d.name;
		    if (d.name.length <= "50") return d.sender;
    		    return d.name.substr(0, "50").concat("...");})

                    //update caret direction
                    nodeEls.select("i").attr("class", function (d) {
                        var icon = d.children ? "fa-arrow-down"
                            : d._children ? "fa-arrow-right" : "";
                        //collapseLevel(data);
                        return "fas fa-xs " + icon;
                    })
                    //update position with transition
                    nodeEls.transition().duration(duration)
                        .style("top", function (d) { return (d.y - tree.nodeHeight()) + "px";})
                        .style("left", function (d) { return d.x + "px"; })
                        .style("opacity", 1);
                    nodeEls.exit().remove();

                    if(!data.start){
//		    alert("data");
		    var flatdata = data;
		    if(!g){
		    flatten(nodeEls);
		    }else {
                $( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" + g,

function(responseTxt, statusTxt, xhr){if (statusTxt == "error"){

		location.reload();
		};})
		 }
                    nodeEls.each(function(d){
                     // if (d.children && d.depth > 0) {
                     //   d._children = d.children;
		    //
                    //    d.children = null;
                    //  }
                    });
                    data.start=1;
                    render(data,data);
                  };
                }
                render(data, data);
            });
function custom_sort(a, b) {
    alert(new Date(a.date).getTime());
    return new Date(a.date).getTime() - new Date(b.date).getTime();
}
function flatten (flatdata){

	$('#treeinfo').empty();
	$('#treeinfo').append("<ul class=listsort>");
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	flatdata.each(function(d){
	var messageDate = new Date(d.date).getTime();
        var localDate = new Date(d.date);
	if(typeof(d.sender) != 'undefined' && !isNaN(messageDate)){
	$('#treeinfo ul').append("<li class=itemsort data-event-date="+messageDate+"> "+ d.sender +" schrieb am "+localDate.toLocaleString("de-DE", options) + "</li>");
        }
	});
	$('#treeinfo ul').append("</ul>");
        var items = $(".itemsort");
        var container = $(".listsort");
        items.sort(function(a,b){
        a = parseFloat($(a).attr("data-event-date"));
        b = parseFloat($(b).attr("data-event-date"));
        return a<b ? -1 : a>b ? 1 : 0;
    }).each(function(){
        container.prepend(this);
    });
}
}
