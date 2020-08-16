/**
 * Newsgroup reader
 * @module     mod/newsmod/Reader
 * @class      newsmod
 * @copyright  2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */


define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/axios.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/identicon.min.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/ReaderMessageBody.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/ReaderPostContainer.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/VizBubble.js',
], function ($, Vue, axios, Identicon, MessageBodyContainer, PostContainer, BubbleChart) {

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    /*
    props: ['subject', 'messagenum', 'personal', 'sender', 'messagestatus',
                            'markedstatus', 'picturestatus', 'user_id', 'date', 'children'],
    
    */

        var Reader = function (Log, courseid, messageid, instanceName) {
            
        var app = new Vue({
            el: 'newsmod-container',
            data: function () {
                return {
                    instanceName: 'Newsgroup',
                    showMessageBody: false,
                    searchstring: '',
                    searchresult: [],
                    hiddenposts: [],        // Stores array pos of searchresult items in array post_list
                    filter_assessment: true,
                    filter_text: true,
                    content: [],
                    tree_data: '',
                    treedata_viz: {},           // data just for viz_bubble
                    sequence: 1,
                    arraypos: 0,
                    post_list: [],
                    post_list_section: [],      // section of tree_data is stored here (contains currently viewed section)
                    post_list_section_size: 0,
                    singlepostdata: [],
                    msgbodycontainerdisplay: 'none',
                    isreading: false,
                    isanswering: false,
                    iscreatingtopic: false,
                    markedpost: -1,
                    courseid: courseid,
                    hideloadingicon: true,
                    hideloadingiconRMB: true,       // hideloadingiconReaderMessageBody
                    identiconstring: "",
                    viewportsize: 'none',
                    showmodal: false,
                    displayerrormsg: false,
                    newsgroup_name: '',
                    newsgroup_postquantity: 0,
                    fetch_postquantity: 50,         // Quantity to load and display in one go
                    start: '6500',
                    end: '6600',
                    errorMessages: [],
                    searchresultmsg: '',
                    statesearchresult: false,
                    statesRMB: {                // States for ReaderMessageBody
                        CanSelectNext: true,
                        CanSelectPrev: true
                    }
                };
            },

            components: {
                'messagebody-container': MessageBodyContainer,
                'post-container': PostContainer,
                'viz-bubble': BubbleChart
            },

            created: function () {
                this.instanceName = instanceName;
                /**
                 * Initialisation of variables with empty values
                 * to prevent "undefined variable" error messages
                 * 
                 */

                this.singlepostdata.header = { name: '', subject: '' };


                Log.add('hello_world', { level: 'fun', target: 'vue is in place' });

                // log interactions (example)
                $('.nav-link-h4').click(function () {
                    Log.add('toc_entry_open', { level: 'h4', target: $(this).attr('href') });
                });
                $('.nav-link-h3').click(function () {
                    Log.add('toc_entry_open', { level: 'h3', target: $(this).attr('href') });
                });


                window.addEventListener("resize", this.Windowresizehandler);


                if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 576) {
                    this.viewportsize = 'mobile';
                }
                else {
                    this.viewportsize = 'other';
                }

            },

            destroyed() {
                window.removeEventListener("resize", this.Windowresizehandler);
            },


            mounted: function () {
                const h = messageid; // !!??
                const f = courseid;
                const g = 0;
                let id = 0;

                //this.getgroupinfo();

                this.hideloadingicon = false;

                //returned data is already js object (axios automaticly converts json to js obj)
                axios
                    .get(M.cfg.wwwroot + "/mod/newsmod/php/phpconn5.php?id=" + courseid)
                    .then(function (response) {
                        if (app.check_for_error(response.data)) {
                            app.post_list.push(app.prepare_postdata(response.data));

                        } else {
                            app.treedata_viz = response.data.children;
                            app.info = response;
                            app.tree_data = response.data;
                            app.buildtree(response.data, 1);
                        }

                    }).catch(function (error) {
                        console.error(error);
                    })
                    .then(function () {
                        app.hideloadingicon = true;
                    });
            },

            computed: {

            },
            methods: {
                hideMessageBody: function(){
                    this.showMessageBody = false;
                },
                Windowresizehandler: function () {
                    if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 576) {
                        this.viewportsize = 'mobile';
                        if (this.msgbodycontainerdisplay == '') {       // msgbodycontainer is used (its set to 'hide' if not used)
                            this.showmodal = true;
                        }

                    }
                    else {
                        this.viewportsize = 'other';
                        this.showmodal = false;
                    }
                },

                getgroupinfo: function () {
                    axios
                        .get(M.cfg.wwwroot + "/mod/newsmod/php/groupinfo.php?id=" + courseid)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.post_list.push(app.prepare_postdata(response.data));

                            } else {
                                app.processgroupinfo(response.data);
                            }

                        }).catch(function (error) {
                            console.error(error);
                        });
                },

                processgroupinfo: function (groupinfo) {
                    app.newsgroup_name = groupinfo.groupname;
                    app.newsgroup_postquantity = groupinfo.lastarticle - groupinfo.firstarticle + 1;

                   // app.start = parseInt(groupinfo.firstarticle);
                   // app.end = parseInt(groupinfo.lastarticle);
                    console.log(groupinfo);

                    /* axios
                    .get(M.cfg.wwwroot + "/mod/newsmod/php/fetchtree.php?id=" + courseid + "&start=" + app.start + "&end=" + app.end)
                    .then(function (response) {
                        if (app.check_for_error(response.data)) {
                            app.post_list.push(app.prepare_postdata(response.data));
            
                        } else {
                            console.log(response.data);
                            app.buildtree(response.data);
                        }

                    }).catch(function (error) {
                        console.error(error);
                    }); */
                },


                getMessageTree: function () {
                    return this.tree_data.children;
                },
                findinarr: function (key, inputArray) {
                    for (let i = 0; i < inputArray.length; i++) {
                        if (inputArray[i].messageid === key) {
                            return inputArray[i];
                        }
                    }
                },

                ondisplaymsg: function (msgid) {
                    this.showMessageBody = true;
                    this.hideloadingiconRMB = false;

                    axios
                        .get(M.cfg.wwwroot + "/mod/newsmod/php/messageid.php?id=" + courseid + "&msgnr=" + msgid)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.post_list.push(app.prepare_postdata(response.data));

                            } else {
                                app.singlepostdata = response.data;
                                app.identiconstring = app.getidenticon(app.singlepostdata.header.from + app.singlepostdata.header.name);
                            }
                        }).catch(function (error) {
                            console.error(error);
                        }).then(function () {
                            app.hideloadingiconRMB = true;
                        });


                    this.msgbodycontainerdisplay = ''; // Set display to "visible"
                    this.iscreatingtopic = false;
                    this.isreading = true;
                    this.isanswering = false;

                    let post = this.findinarr(msgid, this.post_list);

                    let arraypos = post.arraypos;
                    this.markedpost = arraypos;

                    if (this.viewportsize == 'mobile') {
                        this.showmodal = true;
                    }

                    this.stateupdateRMB();


                },

                setSelected: function (arraypos) {
                    this.markedpost = arraypos;
                },

                /**
                 * 
                 * @param {*} msgid
                 * 
                 * function is called from button click "(Show) Previous message"
                 * Shows previous message in thread
                 * 
                 * Notes:
                 * 
                 * When the page is first loaded, a json data structure is fetched
                 * from the server (headers of postings) and is processed into an array post_data in buildtree(), along with
                 * the corresponding position on the array
                 * 
                 * When user clicks on a post however, post data (header and body) is fetched from server,
                 * lacking the matching position on existing array post_data
                 * Position on array post_data is found by searching for param msgid (every post has a msgid, whatever the source)
                 * Previous post is then loaded by getting the correct msgid from the previous post on the array post_list
                 * 
                 * Why is this important:
                 * msgid is an ascending number, increasing with each posting/reply. 
                 * multiple threads in a newsgroup can be replied to, so msgid doesnt represent the
                 * order/structure of one thread
                 * 
                 * User expection is to see the next/prev post from a thread as shown from array post_list,
                 * so fetching the next/prev post by msgid doesnt result in expected behavior
                 * 
                 * 
                 * 
                 * Future todo:
                 *      only fetch body from server and attach it to element on array post_list
                 */
                onprevmsg: function (msgid) {

                    this.hideloadingiconRMB = false;

                    let post = this.findinarr(msgid, this.post_list);

                    let arraypos = post.arraypos;

                    arraypos -= 1;
                    this.markedpost = arraypos;


                    msgid = this.post_list[arraypos].messageid;

                    let modpost = this.findinarr(msgid, this.post_list);                // Set next message to visible if it was hidden
                    modpost.hidden = false;
                    Vue.set(this.post_list, arraypos, modpost);

                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/php/messageid.php?id=" + courseid + "&msgnr=" + msgid)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.post_list.push(app.prepare_postdata(response.data));

                            } else {
                                app.singlepostdata = response.data;
                                app.identiconstring = app.getidenticon(app.singlepostdata.header.from + app.singlepostdata.header.name);
                            }
                        }).catch(function (error) {
                            console.error(error);
                        }).then(function () {
                            app.hideloadingiconRMB = true;
                        });
                    this.msgbodycontainerdisplay = '';      // Set display to "visible"
                    this.iscreatingtopic = false;
                    this.isreading = true;
                    this.isanswering = false;

                    this.stateupdateRMB();



                },

                onnextmsg: function (msgid) {

                    this.hideloadingiconRMB = false;

                    let post = this.findinarr(msgid, this.post_list);

                    let arraypos = post.arraypos;

                    arraypos += 1;

                    this.markedpost = arraypos;         // Variable is transmitted to "post-container"

                    msgid = this.post_list[arraypos].messageid;

                    let modpost = this.findinarr(msgid, this.post_list);                // Set next message to visible if it was hidden
                    modpost.hidden = false;
                    Vue.set(this.post_list, arraypos, modpost);

                    //msgid = parseInt(msgid);
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/php/messageid.php?id=" + courseid + "&msgnr=" + msgid)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.post_list.push(app.prepare_postdata(response.data));

                            } else {
                                app.singlepostdata = response.data;
                                app.identiconstring = app.getidenticon(app.singlepostdata.header.from + app.singlepostdata.header.name);
                            }
                        }).catch(function (error) {
                            console.error(error);
                        }).then(function () {
                            app.hideloadingiconRMB = true;
                        });

                    this.msgbodycontainerdisplay = '';      // Set display to "visible"
                    this.iscreatingtopic = false;
                    this.isreading = true;
                    this.isanswering = false;

                    this.stateupdateRMB();
                    

                },

                stateupdateRMB: function () {
                    if (this.markedpost <= 0) {
                        Vue.set(this.statesRMB, "CanSelectPrev", false);
                    }
                    else {
                        Vue.set(this.statesRMB, "CanSelectPrev", true);
                    }

                    if (this.markedpost >= this.post_list_section_size - 1) {
                        Vue.set(this.statesRMB, "CanSelectNext", false);
                    }
                    else {
                        Vue.set(this.statesRMB, "CanSelectNext", true);
                    }
                },

                /**
                 * Refresh post
                 */
                onansweredmsg: function () {
                    
                    this.hideloadingicon = false;

                    app.post_list.splice(0);    //unset content array
                    this.arraypos = 0;          //reset index counter of content
                    this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                    this.isanswering = false;
                    this.iscreatingtopic = false;
                    this.isreading = false;
                    let _this = this;
                    // Timeout of 2 seconds. Reason: After user posted a message, page gets refreshed with new data
                    // but server might not have the new message available yet, depending on server load (?)
                    setTimeout(function () {
                        app.refresh();
                    }, (2000));

                },

                prepare_postdata: function (postdata_raw, margin = 1) {

                    var marked = postdata_raw.markedstatus != '0' ? true : false;
                    var unread = postdata_raw.messagestatus == '0' ? true : false;

                    var identiconstring;
                    var childpresent = false;
                    if (postdata_raw.picturestatus > '0') {
                        identiconstring = M.cfg.wwwroot + '/user/pix.php/' + postdata_raw.user_id + '/f1.jpg';
                    } else {
                        var options = {
                            background: [255, 255, 255, 255], // rgba white
                            margin: 0.05, // 20% margin
                            size: 20, // 420px square
                            format: 'svg' // use SVG instead of PNG
                        };
                        identiconstring = this.getidenticon(postdata_raw.sender + postdata_raw.personal);

                    }

                    if (postdata_raw.children) {
                        childpresent = true;
                    }
                    else {
                        childpresent = false;
                    }

                    if (!postdata_raw.children) {
                        var childornot = "hidden";
                    }
                    var calctime = new Date(postdata_raw.date);
                    var options = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    };
                    calctime = new Date(postdata_raw.date).toLocaleDateString('de-DE', options) ? new Date(postdata_raw.date).toLocaleDateString('de-DE', options) : "";
                    var absender = postdata_raw.personal ? postdata_raw.personal : postdata_raw.sender;
                    //var timestamp = '<div class="sender elipse col-xl-3 col-sm-3"><a href="mailto:' + postdata_raw.sender + '?subject=' + postdata_raw.name + '">' + absender + '</a></div><div  class="datetime message col-sm-2 col-xl-2" data-date-format="DD.MM.YYYY">' + calctime + '</div>';
                    var family;
                    if (postdata_raw.children) {
                        family = this.getfamily(postdata_raw);
                    }

                    var content = {
                        marked: marked, unread: unread, markedhtml: marked,
                        picturestatus: postdata_raw.picturestatus, personal: postdata_raw.personal, sender: postdata_raw.sender,
                        user_id: postdata_raw.user_id, margin: margin, sequence: this.sequence++, messageid: postdata_raw.messageid,
                        date: postdata_raw.date, subject: postdata_raw.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
                        isSelected: false, hidden: false, family: family, identicon: identiconstring
                    };

                    return content;
                },

                buildtree: function (tree_data, margin) {
                    if (tree_data.children === undefined) {
                        console.error("tree_data.children not defined", tree_data);
                    }
                    tree_data.children.forEach(val => {

                        let content = this.prepare_postdata(val, margin);

                        this.post_list.push(content);

                        this.post_list_section_size++;

                        if (val.children) {
                            app.buildtree(val, margin + 15);    //original margin val: margin + 25
                        }

                    });
                },

                getfamily: function (rootnode) {
                    var children = [];

                    if (rootnode.children) {
                        var childrenamount = rootnode.children.length;

                        for (let i = 0; i < childrenamount; i++) {
                            children.push(rootnode.children[i].messageid);
                            if (rootnode.children[i].children) {
                                children.push(app.getfamily(rootnode.children[i]));
                            }
                        }
                    }
                    return children;
                },

                newTopic: function () {
                    this.msgbodycontainerdisplay = '';
                    this.showMessageBody = true;
                    this.iscreatingtopic = true;
                    this.isreading = false;
                    this.isanswering = false;
                },

                search: function (options) {

                    this.hideallposts();

                    this.statesearchresult = false;
                    this.hideloadingicon = false;

                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/php/search.php?id=" + courseid + "&searchparam=" + this.searchstring)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                //app.post_list.push(app.prepare_postdata(response.data));
                                app.errorMessages.push(response.data);
                                //app.displayerrormsg = true;
                            } else {
                                app.displaysearchresult('', response.data);
                            }
                        })
                        .catch(error => (
                            console.error(error)
                        ))
                        .then(function () {
                            app.hideloadingicon = true;
                        });
                },

                hideallposts: function () {
                    for (let i = 0; i < this.post_list.length; i++) {
                        let modpost = this.post_list[i];
                        modpost.hidden = true;
                        Vue.set(this.post_list, i, modpost);
                    }
                },

                showallposts: function () {
                    for (let i = 0; i < this.post_list.length; i++) {
                        let modpost = this.post_list[i];
                        modpost.hidden = false;
                        Vue.set(this.post_list, i, modpost);
                    }
                    // todo this cant stay here
                    this.statesearchresult = false;
                },

                displaysearchresult: function (options, searchresult) {

                    this.hideallposts();

                    this.hiddenposts.splice(0);

                    this.statesearchresult = true;
                    this.searchresultmsg = searchresult.length;

                    for (let i = 0; i < searchresult.length; i++) {
                        this.hiddenposts.push(this.findinarr(searchresult[i].messagenum, this.post_list));
                        let modpost = this.hiddenposts[i];
                        if (typeof modpost.hidden !== 'undefined') {
                            modpost.hidden = false;
                            Vue.set(this.post_list, modpost.arraypos, modpost);
                        }
                        else {
                            console.error("error displaysearchresult");
                        }
                    }
                    //this.hideloadingicon = true;
                },

                resetsearchstring: function () {
                    this.searchstring = '';
                    this.hiddenposts.splice(0);

                    if (this.displayerrormsg) {
                        this.post_list.pop();
                        this.arraypos--;
                        this.displayerrormsg = false;
                    }

                    this.showallposts();

                },
                // TODO: make sure all elements are reset, also look at onansweredmsg
                refresh: function () {

                    this.hideloadingicon = false;
                    this.statesearchresult = false;

                    this.isreading = false;
                    this.isanswering = false;
                    this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                    this.markedpost = -1;
                    this.arraypos = 0;

                    this.post_list.splice(0);

                    if (this.viewportsize == 'mobile') {
                        this.showmodal = false;
                    }

                    axios
                        .get(M.cfg.wwwroot + "/mod/newsmod/php/phpconn5.php?id=" + courseid)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.post_list.push(app.prepare_postdata(response.data));

                            } else {
                                app.treedata_viz = response.data.children;
                                app.info = response;
                                app.tree_data = response.data;
                                app.buildtree(response.data, 1);
                            }

                        }).catch(function (error) {
                            console.error(error);
                        })
                        .then(function () {
                            app.hideloadingicon = true;
                        });
                },

                getidenticon: function (input) {
                    var options = {
                        background: [255, 255, 255, 0], // rgba white/transparent background
                        margin: 0.05, // 20% margin
                        size: 20, // 420px square
                        format: 'svg' // use SVG instead of PNG
                    };
                    // TODO: fix feed


                    var identiconhash = this.hash64(input, true);
                    var identicondata = new Identicon(identiconhash, options).toString();
                    return "data:image/svg+xml;base64," + identicondata;
                },
                /**
                 * Calculate a 32 bit FNV-1a hash
                 * Found here: https://gist.github.com/vaiorabbit/5657561
                 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
                 *
                 * @param {string} str the input value
                 * @param {boolean} [asString=false] set to true to return the hash value as 
                 *     8-digit hex string instead of an integer
                 * @param {integer} [seed] optionally pass the hash of the previous chunk
                 * @returns {integer | string}
                 */
                hash32: function (str, asString, seed) {
                    /*jshint bitwise:false */
                    var i, l,
                        hval = (seed === undefined) ? 0x811c9dc5 : seed;

                    for (i = 0, l = str.length; i < l; i++) {
                        hval ^= str.charCodeAt(i);
                        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
                    }
                    if (asString) {
                        // Convert to 8 digit hex string
                        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
                    }
                    return hval >>> 0;
                },

                hash64: function (str, asString) {
                    var h1 = this.hash32(str, asString);  // returns 32 bit (as 8 byte hex string)
                    return h1 + this.hash32(h1 + str, asString);  // 64 bit (as 16 byte hex string)
                },

                check_for_error: function (serverreturn) {
                    if (typeof serverreturn.is_error !== 'undefined') {
                        return true;
                    } else {
                        return false;
                    }
                },

                error_to_alert: function (error) {
                    app.errorMessages.push();
                }





            }, // END app methods
            template: `
                <div id="newsmod-container">
                    <h3 class="mb-4"><img style="width:30px; height:30px;" src="pix/icon.svg"> {{ instanceName }}</h3>
                    <div class="d-flex">
                        <div class="d-flex mr-auto">
                            <button class="btn btn-primary btn-sm" :disabled="iscreatingtopic" v-on:click="newTopic" title="Eine neue Nachricht erstellen">
                                <i class="fa fa-pen"></i>
                                Neue Nachricht
                            </button>

                            <button class="btn btn-light btn-sm" v-on:click="refresh" title="Neue Nachrichten abholen">
                                    <i class="fa fa-sync"></i>
                                    <span class="d-none d-md-inline">aktualisieren</span>
                            </button>
                        </div>
                        <div class="search d-flex">
                            <input 
                                class="form-control form-control-sm d-inline ml-2" 
                                v-model="searchstring" 
                                placeholder="Suchen..." 
                                v-on:keyup.enter="search"
                                :style="[ viewportsize==='mobile' ? {width:70+'%'} : {width:150+'px'} ]"
                                >

                            <button class="btn btn-light btn-sm" type="submit" v-on:click="search" title="In allen Nachrichten suchen">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                        
                    </div>
                    <ul class="nav nav-tabs mt-3">
                        <li class="nav-item pt-0">
                            <a class="nav-link  pt-0 pb-0 active" data-toggle="pill" href="#viewlist">
                                <i class="fa fa-list"></i>
                            </a>
                        </li>
                        <li class="nav-item  pt-0">
                            <a class="nav-link pt-0  pb-0" data-toggle="pill" href="#viewbubbles">
                                <i class="fa fa-spinner"></i>
                            </a>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div class="container-fluid px-2 border-left tab-pane active" id="viewlist">
                            <div class="pt-4 pl-0">
                                <div class="row" >
                                <!--
                                    <div v-if="showMessageBody" class="d-block d-sm-none">
                                        <messagebody-container 
                                            v-bind:courseid="courseid"
                                            v-bind:postdata="singlepostdata"
                                            :identiconstring = "identiconstring"
                                            :isused ="msgbodycontainerdisplay" 
                                            :isreading="isreading" 
                                            :isanswering="isanswering" 
                                            :iscreatingtopic="iscreatingtopic"
                                            :viewportsize = "viewportsize"
                                            :hideloadingicon = "hideloadingiconRMB"
                                            v-on:answeredmsg="onansweredmsg"
                                            v-on:prevmsg="onprevmsg" 
                                            v-on:nextmsg="onnextmsg"
                                            v-on:hideMessageBody="hideMessageBody"
                                            >
                                        </messagebody-container>
                                    </div>
                                -->
                                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 border-right" id="tree" style="overflow-y:auto; overflow-x:hidden; margin-bottom:3px; height: auto" >
                                        <div v-for="error in errorMessages" class="alert">
                                            {{ error.errordescr }}
                                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div v-if = "statesearchresult" class = "alert">
                                            Ihre Suche hat {{ searchresultmsg }} Treffer erzielt
                                            <button type="button" class="close" aria-label="Close" v-on:click = "showallposts">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <post-container 
                                            v-bind:courseid="courseid" 
                                            v-bind:postlist="post_list" 
                                            v-bind:markedpost="markedpost" 
                                            :showloadingicon="hideloadingicon"
                                            :viewportsize = "viewportsize"
                                            v-on:displaymsg="ondisplaymsg"
                                            v-on:setSelected="setSelected">
                                        </post-container>
                                    </div>
                                    <div class="col-xl-6 col-lg-6 col-md-12 d-none d-sm-inline" id="treeinfo">
                                        <!-- , {modal: showmodal} :class="['col-xl-6', 'col-lg-6', 'col-md-12', 'col-sm-12', 'col-12']"-->
                                        <messagebody-container 
                                            v-bind:courseid="courseid" 
                                            v-bind:postdata="singlepostdata"
                                            :identiconstring = "identiconstring"
                                            :isused ="msgbodycontainerdisplay" 
                                            :isreading="isreading" 
                                            :isanswering="isanswering" 
                                            :iscreatingtopic="iscreatingtopic"
                                            :viewportsize = "viewportsize"
                                            :hideloadingicon = "hideloadingiconRMB"
                                            :statesRMB = "statesRMB"
                                            v-on:answeredmsg="onansweredmsg"
                                            v-on:prevmsg="onprevmsg" 
                                            v-on:nextmsg="onnextmsg"
                                            v-on:hideMessageBody="hideMessageBody">
                                        </messagebody-container>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <viz-bubble v-bind:treedata="treedata_viz" class="tab-pane fade" id="viewbubbles"></viz-bubble>
                    </div>
                </div>
            `,
        });


    };// end Reader

    return Reader;
});