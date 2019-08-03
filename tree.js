function showtree (h,f){

            var id = 0;
            d3.json('phpconn5.php?id='+f, function(err,data){
                var tree = d3.layout.treelist()
                    .childIndent(10)
                    .nodeHeight(30);
                    var svg = ul

                var ul = d3.select("#tree").append("ul").classed("treelist", "true");

                function render(data, parent) {
                    var nodes = tree.nodes(data),
                        duration = 250;

                getChildrenProperty(data);
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

function callmessage(d) {
                if (d.messageid !=undefined && d.messageid != '0'){
                var oReq = new XMLHttpRequest();
                $( "#treeinfo" ).load( "messageid.php?id="+f+"&msgnr=" + d.messageid +"&sender="+ d.sender)

//                oReq.addEventListener("loadend", reqListener);
//                oReq.open("GET", "messageid.php?id="+ f +"&msgnr=" + d.messageid + "&sender=" + d.sender);
//		oReq.responseType = "document";
//                oReq.send();
//$( "#treeinfo" )
              } else{
		    flatten(nodeEls);

		//flatten(flatdata);
                //$( "#treeinfo" ).load( "messageid.php?id=66&msgnr=" + d.messageid )
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
                    var entered = nodeEls.enter().append("li").classed("node", true)
                        .style("top", parent.y +"px")
                        .style("opacity", 0)
                        .style("height", tree.nodeHeight() + "px")
                        .on("click", function (d) {
                          callmessage(d);
                            render(data, d);
                        })
                        .on("mouseover", function (d) {
                            d3.select(this).classed("selected", true);
                        })
                        .on("mouseout", function (d) {
                            d3.selectAll(".selected").classed("selected", false);
                        });

                    //add arrows if it is a folder
                    entered.append("i").attr("class", function (d) {
                        var icon = d.children ? "fa-arrow-down"
                            : d._children ? "fa-arrow-right" : "";
                        return "fa " + icon;
                    }).on("click",function (d){toggleChildren(d);});
                    //add icons for folder for file
                    entered.append("i").attr("class", function (d) {
                        var icon = d.children || d._children ? "glyphicon-folder-close"
                            : "fa-envelope";
                        return "fa " + icon;
                    });
                    //add text
                    entered.append("span").attr("class", "filename")
                        .html(function (d) { return d.name; });
                    //update caret direction
                    nodeEls.select("i").attr("class", function (d) {
                        var icon = d.children ? " fa-arrow-down"
                            : d._children ? "fa-arrow-right" : "";
                        //collapseLevel(data);
                        return "fa " + icon;
                    });
                    //update position with transition
                    nodeEls.transition().duration(duration)
                        .style("top", function (d) { return (d.y - tree.nodeHeight()) + "px";})
                        .style("left", function (d) { return d.x + "px"; })
                        .style("opacity", 1);
                    nodeEls.exit().remove();

                    if(!data.start){

		    var flatdata = data;
		    flatten(nodeEls);
                    nodeEls.each(function(d){


                     // if (d.children && d.depth > 0) {
                     //   d._children = d.children;
		    //
                    //    d.children = null;
                    //  }
                    }
                    );
                    data.start=1;
                    render(data,data);
                  };


                }

                render(data, data);
                function activitylog(){
                  //d3.selectAll("#treeinfo").append
                }

            });
	function flatten (flatdata){

	flatdata.sort(function(a, b) {
		//console.log(new Date(b.date));
 if (a.date > b.date) return -1;
  if (a.date < b.date) return 1;
return 0;


	});
	$('#treeinfo').empty();
	flatdata.each(function(d){
	var messageDate = new Date(d.date);
	if(typeof(d.sender) != 'undefined' && !isNaN(messageDate.getDate())){
	$('#treeinfo').append(messageDate.getDate() +"/" +(messageDate.getMonth()+1) +"/"+messageDate.getFullYear()+" " +d.sender+"<BR>");
	console.log(d.date + d.sender);
}
	});
}
}
