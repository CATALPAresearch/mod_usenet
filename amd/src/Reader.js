/**
 * Newsgroup reader
 * @module     mod/newsmod/Reader
 * @package    mod_newsmod
 * @class      newsmod
 * @copyright  2020 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define([
    'jquery' // maybe not needed? We should stick with native javascript
], function ($) {

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
        var Reader = function (Vue, d3, axios, utils, log, courseid, messageid) {

        var app = new Vue({
            el: '#newsmod-container',
            data: function () {
                return {
                    message: '',
                    search: '',
                    filter_assessment: true,
                    filter_text: true,
                    content: [],
                    info: ''
                };
            },
            created: function () {
                log.add('hello_world', { level: 'fun', target: 'vue is in place' });

                // log interactions (example)
                $('.nav-link-h4').click(function () {
                    log.add('toc_entry_open', { level: 'h4', target: $(this).attr('href') });
                });
                $('.nav-link-h3').click(function () {
                    log.add('toc_entry_open', { level: 'h3', target: $(this).attr('href') });
                });

            },
            mounted: function () {
                const h = messageid; // !!??
                const f = courseid;
                const g = 0;
                let _this = this;
                let id = 0;
                axios
                    .get(M.cfg.wwwroot + "/mod/newsmod/phpconn5.php?id=" + courseid)
                    .then(response => (this.info = response));    
            },
            computed: {

            },
            methods: {
                doo: function (data, obj) {

                        try {
                            myObj = JSON.parse(obj.responseText);
                        } catch (e) {
                            var err_response = obj.responseText;
                            var err_status = obj.statusText;
                            var errormsg = obj.err_response + " " + obj.err_status;
                            $('#treeinfo').append(obj.errormsg);
                        }
                        $('#tree').empty();
                        $('#tree').append('<ul class="treeinfo">');
                        console.log(myObj)
                        
                        return;
                        try {
                            var data = eval(myObj);
                        }
                        catch (e) {
                            $('#treeinfo').append("Error eval(...)" + myObj);
                            $('#tree').append('<ul class="treeinfo">');
                        }

                        var results = data['children'];

                        moodleurl = myObj.moodleurl;
                        var options = {
                            background: [255, 255, 255, 255], // rgba white
                            margin: 0.05, // 20% margin
                            size: 20, // 420px square
                            format: 'svg' // use SVG instead of PNG
                        };
                        var jdenticonstring = '<div class="control col-sm-3 col-xl-4  "><img width=19 height=20 src="data:image/svg+xml;base64,' + new Identicon(btoa("identification"), options) + '"></img></div>';
                        var fontpictures = '<i style="margin-left:4" class="sortmarked fas fa-star" /><i class="sorttoggel fas fa-xs fa-arrow-down "/>';

                        $('.treeinfo').append("<li class=' node header'><div class='container-fluid px-0'><div class='row'><div class='favorite px-0 col-sm-2 col-xl-2 offset-xl-0 row'>" + jdenticonstring + fontpictures + "</div><div class='col-xl-5  col-sm-4 sortsubject'>Betreff</div><div class='absender col-sm-3 col-xl-3'>Absender</div><div class='sortdatetime datetime col-sm-2 col-xl-2 text-nowrap' >Datum</div></div></div></div></div></li>");
                        sequence = 1;
                        checkOrientation();
                        buildTree(myObj, 1);
                        reloadBindings();

                        //buildActivityLog(myObj);

                        if (gggg) {
                            $("#treeinfo").load("messageid.php?id=" + courseid + "&msgnr=" + g, function (responseTxt, statusTxt, xhr) {
                                if (statusTxt == "error") {
                                    $('#treeinfo').append("$statusTxt")
                                }
                                if (statusTxt == "success") {
                                    if ($('.loginerrors').length > 0) {
                                        window.location.reload;
                                    }
                                    $("#messagehead").get(0).scrollIntoView();
                                }
                            });
                        }
                    

                }
            }
                /* ,
                dooWhenReady: function () {
                    $(".toggle").on("click", function (d) {
                        $(this).toggleClass('fa-arrow-down');
                        $(this).toggleClass('fa-arrow-right');
                        $(this).hasClass('fa-arrow-right') ?
                            hideNext($(this).parent().parent().parent().parent(), 8) :
                            showNext($(this).parent().parent().parent().parent(), 8);
                    });

                    $("#reloadbutton").on("click", function (d) {
                        xmlhttp.open("GET", "phpconn5.php?id=" + f, true);
                        xmlhttp.send();
                    });

                    $('.sortdatetime').on('click', function (d) {
                        sortbyDate();
                    });

                    $('body').bind('orientationchange', function (e) {
                        checkOrientation();
                    });

                    $('.absender').on('click', function (d) {
                        sortbyAbsender();
                    });

                    $('.sortsubject').on('click', function (d) {
                        sortbyName();
                    });

                    $('.sortmarked').on('click', function (d) {
                        sortbyFavorite();
                    });

                    $('.sorttoggel').on('click', function (d) {
                        sortbyTree();
                    });

                    $('.marked').on("click", function (d) {
                        $.get("statuschange.php?id=" + f + "&msgnr=" + $(this).parent().parent().parent().parent().attr('messageid') + "&marked=true", function (data) { });
                    });


                    $('.message').on("click", function (d) {
                        $(this).parent().parent().parent().removeClass("font-weight-bold");
                        $('.seltrue').removeClass('seltrue');
                        $(this).parent().parent().parent().addClass("seltrue");
                        if ($(this).parent().parent().parent().attr('messageid') > 0) {
                            $("#treeinfo").load("messageid.php?id=" + f + "&msgnr=" + $(this).parent().parent().parent().attr('messageid'), function (responseTxt, statusTxt, xhr) {
                                if (statusTxt == "error") {
                                    $('#treeinfo').append("$statusTxt")
                                }
                                if (statusTxt == "success") {
                                    if ($('.loginerrors').length > 0) {
                                        window.location.reload;
                                    }

                                    $("#treeinfo").get(0).scrollIntoView();
                                }
                            });
                        }
                    });

                    $(".timelist").each(function (fff, elem) {
                        $(elem).append(
                            //	$.format.prettyDate(new Date(parseInt($(elem).attr("timestamp"))).getTime(),"dd MM yyyy")
                        );
                    });

                    $('#treeinfo li').sort(function (a, b) {
                        return $(b).data('timestamp') - $(a).data('timestamp');
                    }).appendTo('#treeinfo');

                    $("form").submit(function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        if ($('input').val().length < '1') {
                            $('.node').not('.header').removeClass('hidden');
                        } else {

                            $('.node').not('.header').addClass('hidden');
                            $('#tree').append('<div class="fa fa-cog fa-spin fa-5x searchresult"></div>');
                        }
                        var xmlhttpsearch = new XMLHttpRequest();
                        xmlhttpsearch.onload = function () {
                            $('.searchresult').remove();

                        };
                        xmlhttpsearch.onreadystatechange = function (data) {

                            if (this.readyState == 0) {

                            }
                            if (this.readyState == 1) { }
                            if (this.readyState == 2) { }
                            if (this.readyState == 3) { }
                            if (this.readyState == 4 && this.status == 200) {
                                //if (isJsonString(this.responseText)){

                                var search = JSON.parse(this.responseText);

                                $(search).each(function (e, d) {
                                    $('.searchresult').remove();
                                    $('[messageid="' + d.uid + '"]').removeClass('hidden');
                                });
                            }
                            //}
                        };
                        xmlhttpsearch.open("GET", "search.php?id=" + f + "&searchparam=" + $(".form-control").val(), true);
                        xmlhttpsearch.send();
                    });
                },
                buildTree: function (myObj, margin) {
                    jQuery.each(myObj.children, function (d, val) {
                        var data = eval(myObj);
                        var results = data['children'];
                        var marked = val.markedstatus != '0' ? "fas starmarked " : "far ";
                        var read = val.messagestatus == '0' ? "font-weight-bold " : "";
                        if (val.picturestatus > '0') {
                            var jdenticonstring = '<div class="control col-sm-3 col-xl-4"><img title="Name: ' + val.personal + '\r\nE-Mail-Adresse: ' + val.sender + '" src="' + moodleurl + '/user/pix.php/' + val.user_id + '/f1.jpg" width="20" height="20"></img></div>';
                        } else {
                            var options = {
                                background: [255, 255, 255, 255], // rgba white
                                margin: 0.05, // 20% margin
                                size: 20, // 420px square
                                format: 'svg' // use SVG instead of PNG
                            };

                            var data = new Identicon(btoa(val.sender).length > 15 ? btoa(val.sender) : btoa("keine e-mail angegeben"), options).toString();
                            var jdenticonstring = ''; //'<img style="visibility:hidden" src="' + moodleurl +'/user/pix.php/'+val.user_id+'/f1.jpg" width="0" height="20"></img>';
                            jdenticonstring = jdenticonstring + '<div class="control col-sm-3 col-xl-4" title="Name: ' + val.personal + '\r\nE-Mail-Adresse: ' + val.sender + '"><img width=19 height=20 src="data:image/svg+xml;base64,' + data + '"></div>';
                            // + jdenticon.toSvg(val.sender, 19,{lightness: { color: [0.40, 0.80], grayscale: [0.30, 0.90]}, saturation: { color: 0.50, grayscale: 0.00}, backColor: "#86444400"})+ '</div>';
                        }
                        if (!val.children) {
                            var childornot = "hidden";
                        }
                        var treeli = '<li column="' + margin + '" sequence="' + sequence++ + '" marked="' + val.markedstatus + ' " class="node px-0 ' + read + '" messageid="' + val.messageid + '" data-date="' + new Date(val.date) + '">';
                        var licontainer = '<div class="px-0 container-fluid"><div class="row px-0"><div class="px-0 col-sm-2 col-xl-2 offset-xl-0 row">';
                        var sender = '<div class="col-xl-3 px-0">' + val.sender + '</div>';
                        var subject = '<div  class="col-xl-5 subject col-sm-4 message" style="text-indent: ' + margin + 'px">' + val.name + '</div>';
                        var calctime = new Date(val.date);
                        var options = {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        };
                        calctime = new Date(val.date).toLocaleDateString('de-DE', options) ? new Date(val.date).toLocaleDateString('de-DE', options) : "";
                        var absender = val.personal ? val.personal : val.sender;
                        var timestamp = '<div class="sender elipse col-xl-3 col-sm-3"><a href="mailto:' + val.sender + '?subject=' + val.name + '">' + absender + '</a></div><div  class="datetime message col-sm-2 col-xl-2" data-date-format="DD.MM.YYYY">' + calctime + '</div>';
                        var fontpictures = '<i class="marked ' + marked + ' fa-star favorite" style="margin-left:4" /><i class="toggle fas fa-xs fa-arrow-down ' + childornot + '"/>';
                        var enddiv = '</div>';
                        $('.treeinfo').append(treeli + licontainer + jdenticonstring + fontpictures + enddiv + subject + timestamp + enddiv + enddiv);
                        buildTree(val, margin + 25);
                    });
                    return;
                },
                showNext: function (test, column) {
                    if (column <= $(test).next().attr("column") && $(test).next().hasClass('hidden')) {
                        $(test).next().hasClass('hidden') ? $(test).next().removeClass('hidden') : $(test).next().addClass('hidden');
                        showNext($(test).next(), column);
                    } else {
                        return;
                    }
                },

                hideNext: function (test, column) {
                    if (column <= $(test).next().attr("column") && !$(test).next().hasClass('hidden')) {
                        $(test).next().hasClass('hidden') ? $(test).next().removeClass('hidden') : $(test).next().addClass('hidden');
                        hideNext($(test).next(), column);
                    } else {
                        return;
                    }
                },
                checkOrientation: function () { // this should be moved to Utils
                    if (typeof window.orientation == 'undefined') {
                        //not a mobile
                        return true;
                    }
                    if (Math.abs(window.orientation) != 90) {
                        //portrait mode
                        $('#orr').fadeIn().bind('touchstart', function (e) {
                            e.preventDefault();
                        });
                        return false;
                    } else {
                        //landscape mode
                        $('#orr').fadeOut();
                        return true;
                    }
                },
                sortbyTree: function () {
                    $(".node").not('.header').not('.hidden').sort(function (a, b) {
                        return parseInt($(a).attr("sequence"), 10) > parseInt($(b).attr("sequence"), 10);
                    }).each(function () {
                        $(".treeinfo").append(this);
                    });
                },
                sortbyDate() {
                    $(".node").not('.header').not('.hidden').sort(function (a, b) {
                        return new Date($(a).attr("data-date")) < new Date($(b).attr("data-date"));
                    }).each(function () {
                        $(".treeinfo").append(this);
                    });
                },
                sortBySelector: function (selector) {
                    $(".node").not('.header').not('.hidden').sort(function (a, b) {
                        var compA = $(a).attr(selector).toUpperCase();
                        var compB = $(b).attr(selector).toUpperCase();
                        return (compA > compB) ? -1 : (compA < compB) ? 1 : 0;
                    }).each(function () {
                        $(".treeinfo").append(this);
                    });
                },
                sortbyFavorite: function () { // must be replaced by sortBySelector
                    $(".node").not('.header').not('.hidden').sort(function (a, b) {
                        var compA = $(a).attr("marked").toUpperCase();
                        var compB = $(b).attr("marked").toUpperCase();
                        return (compA > compB) ? -1 : (compA < compB) ? 1 : 0;
                    }).each(function () {
                        $(".treeinfo").append(this);
                    });
                },
                sortbyName: function () { // must be replaced by sortBySelector
                    $(".node").not('.header').not('.hidden').sort(function (a, b) {
                        var compA = $(a).find('.subject').text().toUpperCase();
                        var compB = $(b).find('.subject').text().toUpperCase();
                        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
                    }).each(function () {
                        $(".treeinfo").append(this);
                    });
                },
                sortbyAbsender: function () { // must be replaced by sortBySelector
                    $(".node").not('.header').not('.hidden').sort(function (a, b) {
                        var compA = $(a).find('.sender').text().toUpperCase();
                        var compB = $(b).find('.sender').text().toUpperCase();
                        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
                    }).each(function () {
                        $(".treeinfo").append(this);
                    });
                },

                reloadBindings: function () {
                    $("#tree").on("click", "*", function (event) {
                        switch ($(this).prop('nodeName')) {
                            case "I":
                                if ($(this).hasClass("toggle")) { } else if ($(this).hasClass("favorite")) {
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
                    });

                    $('.node').not('.header').on("mouseover", function (d) {
                        $(this).toggleClass("selected");
                    }).on("mouseout", function (d) {
                        $(this).toggleClass("selected");

                    })

                    $('input').on('input', function (e) {
                        if ($(this).val().length < '3') { }
                    });

                    $('.header').on("mouseover", function (d) {
                        $(this).toggleClass("selectedheader");
                    }).on("mouseout", function (d) {
                        $(this).toggleClass("selectedheader");
                    });

                },
                toggle: function (e) {
                    switch (e.attr('class')) {
                        case "far fa-star":
                            $(this).toggleClass("fas");
                            $(this).toggleClass("far");
                            $.get("search.php?id=" + f + "&msgnr=" + $(this).parent().attr('messageid') + "&marked=" + d.markedstatus)
                            break;
                        case "far":
                            break;
                        default:
                    }
                }
            }*/
        });


    };// end Reader

    return Reader;
});