/**
 *
 *
 * @module     mod_usenet
 * @class      Post Container
 * @copyright  Niels Seidel <niels.seidel@fernuni-hagen.de>, Konstantin Friedrich
 * @license    GNU GPLv3
 * 
 * TODO:
 * - modularize code 
 * - remove redundancies like axios
 * - remove states 
 * - param courseid is the instance id 
 */

define([
    M.cfg.wwwroot + '/mod/usenet/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/usenet/lib/build/axios.min.js',
    M.cfg.wwwroot + '/mod/usenet/lib/build/identicon.min.js',
    M.cfg.wwwroot + '/mod/usenet/amd/src/ReaderMessageBody.js',
    M.cfg.wwwroot + '/mod/usenet/amd/src/ReaderPostContainer.js',
    M.cfg.wwwroot + '/mod/usenet/amd/src/VizBubble.js',
], function (Vue, axios, Identicon, MessageBodyContainer, PostContainer, BubbleChart) {

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

        var Reader = function (the_logger, courseid, messageid, instanceName, instance_id) {
            
        var app = new Vue({
            el: 'usenet-container',
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
                    sequence: 0,
                    arraypos: 0,
                    post_list: [],
                    post_list_sections: [],      // neatly divided sections of post_list are here
                    post_list_section_size: 50,
                    post_list_section_reservespace: 10,  // Buffer space for threads that cant fit into remaining section_size space
                    view_section: 0,
                    singlepostdata: [],
                    threadlist: [],
                    msgbodycontainerdisplay: 'none',
                    isreading: false,
                    isanswering: false,
                    iscreatingtopic: false,
                    markedpost: -1,
                    courseid: courseid,
                    instanceid: instance_id,
                    hideloadingicon: true,
                    hideloadingiconRMB: true,       // hideloadingiconReaderMessageBody
                    identiconstring: "",
                    showmodal: false,
                    displayerrormsg: false,
                    newsgroup_name: '',
                    newsgroup_postquantity: 0,
                    fetch_postquantity: 50,         // Quantity to load and display in one go
                    start: '0',
                    end: '0',
                    errorMessages: [],
                    searchresultmsg: '',
                    statesearchresult: false,
                    statesRMB: {                // States for ReaderMessageBody
                        CanSelectNext: true,
                        CanSelectPrev: true
                    },
                    statesview_section: {                // States for ReaderMessageBody
                        CanSelectNext: true,
                        CanSelectPrev: false
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
                this.singlepostdata.header = { name: '', subject: '' };
            },

        
            mounted: function () {
                this.initiatecontact();
            },

            methods: {
                logger(action, value) {
                    the_logger.add(action, value)
                },
                hideMessageBody: function () {
                    this.showMessageBody = false;
                },

                initiatecontact: function () {
                    let _this = this;
                    this.hideloadingicon = false;

                    this.getgroupinfo().then(function (response) {
                        axios
                            .get(M.cfg.wwwroot + "/mod/usenet/php/fetchtree.php?id=" + _this.instanceid + "&start=" + app.start + "&end=" + app.end)
                            .then(function (response) {
                                if (app.check_for_error(response.data)) {
                                    app.errorMessages.push(response.data);

                                } else {
                                    console.log('xxxx', JSON.stringify(response.data))
                                    app.treedata_viz = response.data.children;
                                    app.info = response;
                                    app.tree_data = response.data;
                                    app.gettree(response.data);
                                }

                            }).catch(function (error) {
                                console.error(error);
                            }).then(function () {
                                app.hideloadingicon = true;
                            });
                    });
                },

                getgroupinfo: function () {
                    return axios
                        .get(M.cfg.wwwroot + "/mod/usenet/php/groupinfo.php?id=" + this.instanceid)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.errorMessages.push(response.data);

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

                    app.start = parseInt(groupinfo.firstarticle);
                    app.end = parseInt(groupinfo.lastarticle);
                },


                getMessageTree: function () {
                    return this.tree_data.children;
                },
                findinarr: function (key, inputArray) {
                    for (let i = 0; i < inputArray.length; i++) {
                        if (inputArray[i].messagenumber === key) {
                            return inputArray[i];
                        }
                    }
                },

                ondisplaymsg: function (messagenum) {
                    this.showMessageBody = true;
                    this.hideloadingiconRMB = false;
                    
                    axios
                        .get(M.cfg.wwwroot + "/mod/usenet/php/messageid.php?id=" + this.instanceid + "&msgnr=" + messagenum)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.errorMessages.push(response.data);

                            } else {
                                console.log("response: ", response.data);
                                // FIXME check if data / data.header exists and if it is an object!!
                                response.data.header = app.prepare_postdata(response.data.header);
                                app.singlepostdata = response.data;
                                if (app.singlepostdata.header === undefined){
                                    return;
                                }
                                if (app.singlepostdata.header.from && app.singlepostdata.header.name){
                                    app.identiconstring = app.getidenticon(app.singlepostdata.header.from + app.singlepostdata.header.name);
                                }
                                
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

                    let post = this.findinarr(messagenum, this.post_list);

                    let arraypos = this.post_list.indexOf(post);
                    this.markedpost = arraypos;

                    this.stateupdateRMB();
                },

                setSelected: function (messagenumber) {
                    let post = this.findinarr(messagenumber, this.post_list);
                    this.markedpost = this.post_list.indexOf(post);
                },

                /**
                 * 
                 * @param {*} messagenum
                 * 
                 * function is called from button click "(Show) Previous message"
                 * Shows previous message in thread
                 * 
                 * Notes:
                 * 
                 * When the page is first loaded, a json data structure is fetched
                 * from the server (headers of postings) and is processed into an array post_data in gettree(), along with
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
                onprevmsg: function (messagenum) {

                    this.hideloadingiconRMB = false;

                    let post = this.findinarr(messagenum, this.post_list);

                    let arraypos = this.post_list.indexOf(post);

                    arraypos -= 1;
                    this.markedpost = arraypos;


                    messagenum = this.post_list[arraypos].messagenumber;

                    let modpost = this.findinarr(messagenum, this.post_list);                // Set next message to visible if it was hidden
                    modpost.hidden = false;
                    Vue.set(this.post_list, arraypos, modpost);

                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/usenet/php/messageid.php?id=" + this.instanceid + "&msgnr=" + messagenum)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.errorMessages.push(response.data);

                            } else {
                                app.singlepostdata = response.data;
                                if (app.singlepostdata.header.from && app.singlepostdata.header.name){
                                    app.identiconstring = app.getidenticon(app.singlepostdata.header.from + app.singlepostdata.header.name);
                                }
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

                onnextmsg: function (messagenum) {

                    this.hideloadingiconRMB = false;

                    let post = this.findinarr(messagenum, this.post_list);

                    let arraypos = this.post_list.indexOf(post);

                    arraypos += 1;

                    this.markedpost = arraypos;         // Variable is transmitted to "post-container"

                    messagenum = this.post_list[arraypos].messagenumber;

                    let modpost = this.findinarr(messagenum, this.post_list);                // Set next message to visible if it was hidden
                    modpost.hidden = false;
                    Vue.set(this.post_list, arraypos, modpost);

                    //msgid = parseInt(msgid);
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/usenet/php/messageid.php?id=" + this.instanceid + "&msgnr=" + messagenum)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                app.errorMessages.push(response.data);

                            } else {
                                app.singlepostdata = response.data;
                                response.data.header = app.prepare_postdata(response.data.header);
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

                displayPreviousPostlist: function (event) {
                    if (this.view_section > 0) {
                        if (this.markedpost != -1) {
                            let modpost = this.post_list[this.markedpost];
                            modpost.isSelected = false;
                        }

                        this.markedpost = -1;
                        this.post_list = this.post_list_sections[--this.view_section];
                        this.logger('messagelist_previous_click', { postlist_section: this.view_section });
                        this.isreading = false;
                        this.isanswering = false;
                        this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                        this.arraypos = 0;
                        this.stateupdateview_selection();
                    }
                    event.preventDefault();
                },

                displayNextPostlist: function (event) {
                    if (this.view_section < this.post_list_sections.length - 1) {
                        if (this.markedpost != -1) {
                            let modpost = this.post_list[this.markedpost];
                            modpost.isSelected = false;
                        }

                        this.markedpost = -1;
                        this.post_list = this.post_list_sections[++this.view_section];
                        this.logger('messagelist_next_click', { postlist_section: this.view_section });
                        this.isreading = false;
                        this.isanswering = false;
                        this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                        this.arraypos = 0;
                        this.stateupdateview_selection();
                    }
                    event.preventDefault();
                },

                selectPostlist: function (page, event) {
                    if (this.markedpost != -1) {
                        let modpost = this.post_list[this.markedpost];
                        modpost.isSelected = false;
                    }

                    this.markedpost = -1;
                    this.post_list = this.post_list_sections[page];
                    this.logger('postlist_seclect_click', { postlist_section: page });
                    this.view_section = page;
                    this.isreading = false;
                    this.isanswering = false;
                    this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                    this.arraypos = 0;
                    this.stateupdateview_selection();
                    event.preventDefault();
                },

                stateupdateview_selection: function () {
                    if (this.view_section <= 0) {
                        Vue.set(this.statesview_section, "CanSelectPrev", false);
                    }
                    else {
                        Vue.set(this.statesview_section, "CanSelectPrev", true);
                    }

                    if (this.view_section >= this.post_list_sections.length - 1) {
                        Vue.set(this.statesview_section, "CanSelectNext", false);
                    }
                    else {
                        Vue.set(this.statesview_section, "CanSelectNext", true);
                    }
                },

                stateupdateRMB: function () {
                    if (this.markedpost <= 0) {
                        Vue.set(this.statesRMB, "CanSelectPrev", false);
                    }
                    else {
                        Vue.set(this.statesRMB, "CanSelectPrev", true);
                    }

                    if (this.markedpost >= this.post_list_sections[this.view_section].length - 1) {
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
                    this.post_list_sections.splice(0);
                    this.threadlist.splice(0);
                    this.arraypos = 0;          //reset index counter of content
                    this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                    this.showMessageBody = false;
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

                gettree: function (tree_data) {

                    this.buildthread_starter(tree_data, this.threadlist);


                    this.buildsections(this.threadlist, this.post_list_sections,
                        this.post_list_section_size, this.post_list_section_reservespace);


                    this.post_list = this.post_list_sections[0];

                },

                buildsections: function (threadlist, sectionlist, sectionsize, reserve_space) {
                    var remainingspace = sectionsize;
                    var reservespace = reserve_space;
                    var sectionindex = 0;
                    sectionlist[sectionindex] = [];
                    for (let i = 0; i < threadlist.length; i++) {

                        if (threadlist[i].length > sectionsize) {    // is the thread larger than slots are available on a single section ?
                            for (let j = 0; j < threadlist[i].length; j++) {
                                sectionlist[sectionindex].push(threadlist[i][j]);
                            }
                            sectionindex++;
                            sectionlist[sectionindex] = [];
                            remainingspace = sectionsize;
                            reservespace = reserve_space;
                            continue;
                        }

                        if (threadlist[i].length > remainingspace) {
                            if (threadlist[i].length > remainingspace + reservespace) {
                                sectionindex++;
                                sectionlist[sectionindex] = [];
                                remainingspace = sectionsize;
                                reservespace = reserve_space;
                            } else {
                                remainingspace = threadlist[i].length;
                                reservespace = 0;
                            }

                        }

                        if (threadlist[i].length <= remainingspace) {
                            for (let j = 0; j < threadlist[i].length; j++) {
                                sectionlist[sectionindex].push(threadlist[i][j]);
                            }
                            remainingspace -= threadlist[i].length;
                        }
                    }
                },

                buildthread_starter: function (tree_data, threadlist) {
                    if (typeof tree_data.children === 'undefined') {
                        console.error("tree_data.children not defined", tree_data);
                    }
                    tree_data.children.forEach(threadhead => {

                        threadlist.push(this.buildthread(threadhead, 1));

                    });
                },

                buildthread: function (threadhead, margin, thread = 0) {
                    if (thread == 0) {
                        thread = [];
                    }
                    thread.push(this.prepare_postdata(threadhead, margin));

                    if (typeof threadhead.children !== 'undefined') {
                        threadhead.children.forEach(val => {


                            if (val.children) {
                                app.buildthread(val, margin + 15, thread);    //original margin val: margin + 25
                            } else {
                                thread.push(this.prepare_postdata(val, margin + 15));
                            }

                        });
                    }
                    return thread;
                },


                buildtree_classic: function (tree_data, margin) {
                    if (typeof tree_data.children === 'undefined') {
                        console.error("tree_data.children not defined", tree_data);
                    }
                    tree_data.children.forEach(val => {

                        let content = this.prepare_postdata(val, margin);

                        this.post_list.push(content);

                        if (val.children) {
                            app.buildtree_classic(val, margin + 15);    //original margin val: margin + 25
                        }

                    });

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
                        year: '2-digit', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric'
                    };
                   
                    calctime = new Date(postdata_raw.date).toLocaleDateString('de-DE', options) ? new Date(postdata_raw.date).toLocaleDateString('de-DE', options) : "";
                    var absender = postdata_raw.personal ? postdata_raw.personal : postdata_raw.sender;
                    //var timestamp = '<div class="sender elipse col-xl-3 col-sm-3"><a href="mailto:' + postdata_raw.sender + '?subject=' + postdata_raw.name + '">' + absender + '</a></div><div  class="datetime message col-sm-2 col-xl-2" data-date-format="DD.MM.YYYY">' + calctime + '</div>';
                    let children;
                    if (postdata_raw.children) {
                        children = this.getChildren(postdata_raw);
                    }

                    var content = {
                        marked: marked, unread: unread, markedhtml: marked,
                        picturestatus: postdata_raw.picturestatus, personal: postdata_raw.personal, sender: postdata_raw.sender,
                        user_id: postdata_raw.user_id, margin: margin, sequence: this.sequence++, messageid: postdata_raw.messageid, messagenumber: postdata_raw.number,
                        date: postdata_raw.date, subject: postdata_raw.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
                        isSelected: false, hidden: false, children: children, identicon: identiconstring
                    };

                    return content;
                },

                getChildren: function (rootnode) {
                    var children = [];

                    if (rootnode.children) {
                        var childrenamount = rootnode.children.length;

                        for (let i = 0; i < childrenamount; i++) {
                            children.push(rootnode.children[i].number);
                            if (rootnode.children[i].children) {
                                children.push(app.getChildren(rootnode.children[i]));
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
                    this.logger('new_message_click', {});
                    // not working: this.$nextTick(() => this.$refs.newMessageSubject.focus())
                },

                search: function (options) {
                    let _this = this;
                    this.hideallposts();

                    this.statesearchresult = false;
                    this.hideloadingicon = false;
                    this.logger('search_submit', { search_term: this.searchstring });
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/usenet/php/search.php?id=" + this.instanceid + "&searchparam=" + this.searchstring)
                        .then(function (response) {
                            if (app.check_for_error(response.data)) {
                                //app.post_list.push(app.prepare_postdata(response.data));
                                app.errorMessages.push(response.data);
                                //app.displayerrormsg = true;
                            } else {
                                app.displaysearchresult('', response.data);
                                _this.logger('search_result', { search_term: _this.searchstring, result_length: response.data.length, results: response.data.map(function(d){ return d.messagenum; }) });
                                console.log('SEARCH', response.data);
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
                        if(modpost){
                            modpost.hidden = false;
                            Vue.set(this.post_list, i, modpost);
                        }
                    }
                    // todo this cant stay here
                    this.statesearchresult = false;
                },

                hideSearchResults: function(){
                    this.showallposts();
                    this.logger('search_results_close', {});
                },

                displaysearchresult: function (options, searchresult) {

                    this.hideallposts();

                    this.hiddenposts = []; 

                    this.statesearchresult = true;
                    this.searchresultmsg = searchresult.length;
                    
                    for (let i = 0; i < searchresult.length; i++) {
                        let modpost = this.findinarr(searchresult[i].messagenum, this.post_list);
                        
                        if (modpost !== undefined) {
                            modpost.hidden = false;
                            this.hiddenposts.push(modpost);
                            Vue.set(this.post_list, modpost.arraypos, modpost);
                        } else {
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
                    this.logger('refresh_messages_click', {});
                    this.hideloadingicon = false;
                    this.statesearchresult = false;

                    this.isreading = false;
                    this.isanswering = false;
                    this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                    this.markedpost = -1;
                    this.arraypos = 0;

                    this.post_list.splice(0);
                    this.post_list_sections.splice(0);
                    this.threadlist.splice(0);

                    
                    this.initiatecontact();
                },

                getidenticon: function (input) {
                    var options = {
                        background: [255, 255, 255, 0], // rgba white/transparent background
                        margin: 0.05, // 20% margin
                        size: 20, // 420px square
                        format: 'svg' // use SVG instead of PNG
                    };

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

            },

            template: `
                <div id="usenet-container">
                    <h3 class="mb-4"><img style="width:30px; height:30px;" src="pix/icon.svg"> {{ instanceName }}</h3>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-primary btn-sm" :disabled="iscreatingtopic" v-on:click="newTopic" title="Eine neue Nachricht erstellen">
                            <i class="fa fa-pen"></i>
                            <span class="d-none d-sm-inline">Neue Nachricht</span>
                        </button>

                        <button class="btn btn-light btn-sm" v-on:click="refresh" title="Neue Nachrichten abholen">
                            <i class="fa fa-sync"></i>
                            <span class="d-none d-md-inline">aktualisieren</span>
                        </button>

                        <div class="mr-auto px-2">
                            <div class="d-flex">
                                <div>
                                    <a class="page-link py-1 px-2 my-0" :class="{disabled: !statesview_section.CanSelectPrev}" v-on:click="displayPreviousPostlist($event)" 
                                        href="#" title="Vorherige Seite">
                                        <i class="fa fa-chevron-left"></i>
                                    </a>
                                </div>
                                <div class="d-none d-sm-inline m-0 p-0">
                                    <a v-for="(el, index) in post_list_sections"
                                        class="page-link d-inline py-1 px-2 my-0"
                                        href="#"
                                        v-on:click="selectPostlist(index, $event)"
                                        :class="{'bg-info': view_section == index}"
                                        >
                                        {{index+1}}
                                    </a>
                                </div>
                                <div>
                                    <a  
                                        class="page-link py-1 px-2 my-0" 
                                        :class="{disabled: !statesview_section.CanSelectNext}" 
                                        v-on:click="displayNextPostlist($event)" 
                                        href="#" title="Nächste Seite">
                                        <i class="fa fa-chevron-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="search d-flex">
                            <input 
                                class="form-control form-control-sm d-inline ml-2" 
                                v-model="searchstring" 
                                placeholder="Suchen..." 
                                v-on:keyup.enter="search"
                                style="width:90px"
                                >

                            <button class="btn btn-light btn-sm" type="submit" v-on:click="search" title="In allen Nachrichten suchen">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                        
                    </div>

                    <!-- The tabs should shown if alternative visualization are available. -->
                    <ul class="nav nav-tabs mt-3">
                        <li class="nav-item pt-0">
                            <a class="nav-link  pt-0 pb-0 active" v-on:click="logger('list_view_select',{})" data-toggle="pill" href="#viewlist">
                                <i class="fa fa-list"></i>
                            </a>
                        </li>
                        <li class="nav-item  pt-0">
                            <a class="nav-link pt-0  pb-0"  v-on:click="logger('bubble_view_select',{})" data-toggle="pill" href="#viewbubbles">
                                <i class="fa fa-spinner"></i>
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <div class="container-fluid px-2 border-left border-xs-none tab-pane active" id="viewlist">
                            <div class="pt-4 pl-0">
                                <div class="row">
                                    <div 
                                        id="tree"
                                        class="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 
                                        order-2 order-xs-2 order-sm-2 order-md-2 order-lg-1 order-xl-1 
                                        border-right"
                                        style="overflow-y:auto; overflow-x:hidden; margin-bottom:3px; height:auto" >
                                        <div v-for="error in errorMessages" class="alert alert-danger">
                                            {{ error.errordescr }}
                                            <button type="button" class="close" v-on:click="logger('error_alert_close', { error_message: error.errordescr })" data-dismiss="alert" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div v-if="statesearchresult" class="alert alert-success">
                                            Ihre Suche hat {{ searchresultmsg }} Treffer erzielt
                                            <button type="button" class="close" aria-label="Close" v-on:click="hideSearchResults()">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <post-container 
                                            v-bind:courseid="instanceid" 
                                            v-bind:postlist="post_list" 
                                            v-bind:markedpost="markedpost" 
                                            :showloadingicon="hideloadingicon"
                                            v-on:displaymsg="ondisplaymsg"
                                            v-on:setSelected="setSelected"
                                            v-on:log="logger"
                                            >
                                        </post-container>
                                    </div>
                                    <div v-if="showMessageBody" 
                                        id="treeinfo"    
                                        class="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 
                                        order-1 order-xs-1 order-sm-1 order-md-1 order-lg-2 order-xl-2 
                                        d-inline"
                                        >
                                        <messagebody-container 
                                            v-bind:courseid="instanceid" 
                                            v-bind:postdata="singlepostdata"
                                            :identiconstring = "identiconstring"
                                            :isused ="msgbodycontainerdisplay" 
                                            :isreading="isreading" 
                                            :isanswering="isanswering" 
                                            :iscreatingtopic="iscreatingtopic"
                                            :hideloadingicon = "hideloadingiconRMB"
                                            :statesRMB = "statesRMB"
                                            v-on:answeredmsg="onansweredmsg"
                                            v-on:prevmsg="onprevmsg" 
                                            v-on:nextmsg="onnextmsg"
                                            v-on:hideMessageBody="hideMessageBody"
                                            v-on:log="logger"
                                            >
                                        </messagebody-container>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <viz-bubble 
                            id="viewbubbles"    
                            class="tab-pane fade"
                            v-bind:treedata="treedata_viz" 
                            v-on:log="logger"
                            ></viz-bubble>
                    </div>
                </div>
            `,
        });


    };// end Reader

    return Reader;
});