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
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/axios.min',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/ReaderMessageBody.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/ReaderPostContainer.js',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/VizBubble.js',
], function ($, Vue, axios, MessageBodyContainer, PostContainer, BubbleChart) {

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

    var Reader = function (Log, courseid, messageid) {

        var app = new Vue({
            el: 'newsmod-container',
            data: function () {
                return {
                    message: '',
                    searchstring: '',
                    searchresult: [],
                    hiddenposts: [],        // Stores array pos of searchresult items in array post_list
                    filter_assessment: true,
                    filter_text: true,
                    content: [],
                    info: 'Hallo, ich warte auf Daten vom usenet Server ...',
                    tree_json: '',
                    tree_data: '',
                    treedata: {},
                    tree_built: 0,
                    sequence: 1,
                    iterations: 0,
                    arraypos: 0,
                    post_list: [],
                    singlepostdata: [],
                    msgbodycontainerdisplay: 'none',
                    isreading: false,
                    isanswering: false,
                    iscreatingtopic: false,
                    markedpost: -1
                };
            },

            components: {
                'messagebody-container': MessageBodyContainer,
                'post-container': PostContainer,
                'viz-bubble': BubbleChart
            },

            created: function () {
                Log.add('hello_world', { level: 'fun', target: 'vue is in place' });

                // log interactions (example)
                $('.nav-link-h4').click(function () {
                    Log.add('toc_entry_open', { level: 'h4', target: $(this).attr('href') });
                });
                $('.nav-link-h3').click(function () {
                    Log.add('toc_entry_open', { level: 'h3', target: $(this).attr('href') });
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
                    .then(function (response) {
                        _this.treedata = response.data.children;
                        _this.info = response;
                        _this.tree_data = response.data;
                        _this.buildtree(response.data);
                        return 1;
                    });
            },
            computed: {

            },
            methods: {
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
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" + msgid)
                        .then(response => (this.singlepostdata = response.data, this.iterations = 999));
                    this.msgbodycontainerdisplay = '';      // Set display to "visible"
                    this.iscreatingtopic = false;
                    this.isreading = true;
                    this.isanswering = false;

                    let post = this.findinarr(msgid, this.post_list);

                    let arraypos = post.arraypos;
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
                 * from the server (headers of postings) and gets processed into an array post_data in buildtree(), along with
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

                    let post = this.findinarr(msgid, this.post_list);

                    let arraypos = post.arraypos;

                    arraypos -= 1;
                    this.markedpost = arraypos;


                    msgid = this.post_list[arraypos].messageid;


                    console.log(arraypos);
                    console.log(msgid);

                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" + msgid)
                        .then(response => (this.singlepostdata = response.data, this.iterations = 999));
                    this.msgbodycontainerdisplay = '';      // Set display to "visible"
                    this.iscreatingtopic = false;
                    this.isreading = true;
                    this.isanswering = false;
                },

                onnextmsg: function (msgid) {


                    let post = this.findinarr(msgid, this.post_list);

                    let arraypos = post.arraypos;

                    arraypos += 1;

                    this.markedpost = arraypos;         // Variable is transmitted to "post-container"

                    msgid = this.post_list[arraypos].messageid;


                    console.log(arraypos);
                    console.log(msgid);


                    //msgid = parseInt(msgid);
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" + msgid)
                        .then(response => (this.singlepostdata = response.data, this.iterations = 999));
                    this.msgbodycontainerdisplay = '';      // Set display to "visible"
                    this.iscreatingtopic = false;
                    this.isreading = true;
                    this.isanswering = false;
                },
                /**
                 * Refresh post
                 */
                onansweredmsg: function () {
                    app.post_list.splice(0);    //unset content array
                    this.arraypos = 0;          //reset index counter of content
                    this.msgbodycontainerdisplay = 'none';  //hide msgbodycontainer
                    this.isanswering = false;
                    this.iscreatingtopic = false;
                    this.isreading = false;
                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/phpconn5.php?id=" + courseid)
                        .then(response => (this.info = response, this.tree_data = response.data, this.buildtree(response.data, 1)));

                },

                buildtree: function (tree_data, margin) {
                    //var data = tree_data_children;

                    tree_data.children.forEach(val => {


                        //var marked = val.markedstatus != '0' ? "fas starmarked " : "far ";
                        var marked = val.markedstatus != '0' ? true : false;
                        //var read = val.messagestatus == '0' ? "font-weight-bold " : "";
                        var unread = val.messagestatus == '0' ? true : false;

                        var childpresent = false;
                        if (val.picturestatus > '0') {
                            var jdenticonstring = '<div class="control col-sm-3 col-xl-4"><img title="Name: ' + val.personal + '\r\nE-Mail-Adresse: ' + val.sender + '" src="' + M.cfg.wwwroot + '/user/pix.php/' + val.user_id + '/f1.jpg" width="20" height="20"></img></div>';
                        }
                        else {
                            var options = {
                                background: [255, 255, 255, 255], // rgba white
                                margin: 0.05, // 20% margin
                                size: 20, // 420px square
                                format: 'svg' // use SVG instead of PNG
                            };
                            var jdenticonstring = '';
                            jdenticonstring = jdenticonstring + `'<div class="control col-sm-3 col-xl-4" title="Name: ' + val.personal 
                            + '\r\nE-Mail-Adresse: ' + val.sender + '">
                            <img width=19 height=20 src="data:image/svg+xml;base64,' + data + '"></div>'`;
                        }
                        if (val.children) {
                            childpresent = true;
                        }
                        else {
                            childpresent = false;
                        }

                        if (!val.children) {
                            var childornot = "hidden";
                        }
                        //var treeli = '<li column="' + margin + '" sequence="' + this.sequence + '" marked="' + val.markedstatus + ' " class="node px-0 ' + unread + '" messageid="' + val.messageid + '" data-date="' + new Date(val.date) + '">';
                        //var licontainer = '<div class="px-0 container-fluid"><div class="row px-0"><div class="px-0 col-sm-2 col-xl-2 offset-xl-0 row">';
                        //var sender = '<div class="col-xl-3 px-0">' + val.sender + '</div>';
                        //var subject = '<div  class="col-xl-5 subject col-sm-4 message" style="text-indent: ' + margin + 'px">' + val.name + '</div>';
                        var calctime = new Date(val.date);
                        var options = {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        };
                        calctime = new Date(val.date).toLocaleDateString('de-DE', options) ? new Date(val.date).toLocaleDateString('de-DE', options) : "";
                        var absender = val.personal ? val.personal : val.sender;
                        //var timestamp = '<div class="sender elipse col-xl-3 col-sm-3"><a href="mailto:' + val.sender + '?subject=' + val.name + '">' + absender + '</a></div><div  class="datetime message col-sm-2 col-xl-2" data-date-format="DD.MM.YYYY">' + calctime + '</div>';
                        //var fontpictures = '<i class="marked ' + marked + ' fa-star favorite" style="margin-left:4" /><i class="toggle fas fa-xs fa-arrow-down ' + childornot + '"/>';
                        //var enddiv = '</div>';
                        //app.tree_built += treeli + licontainer + jdenticonstring + fontpictures + enddiv + subject + timestamp + enddiv + enddiv;

                        var content = {
                            marked: marked, unread: unread, markedhtml: marked,
                            picturestatus: val.picturestatus, personal: val.personal, sender: val.sender,
                            user_id: val.user_id, margin: margin, sequence: this.sequence++, messageid: val.messageid,
                            date: val.date, subject: val.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
                            isSelected: false, hidden: false
                        };

                        this.post_list.push(content);
                        // Vue.set(this.post_list, this.arraypos, content);
                        if (val.children) {
                            app.buildtree(val, margin + 25);
                        }

                    });

                },

                newTopic: function () {
                    this.msgbodycontainerdisplay = '';
                    this.iscreatingtopic = true;
                    this.isreading = false;
                    this.isanswering = false;
                },

                search: function (options) {
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/search.php?id=" + courseid + "&searchparam=" + this.searchstring)
                        .then(response => (this.displaysearchresult('', response.data)));
                },

                displaysearchresult: function (options, searchresult) {
                    for (let i = 0; i < this.post_list.length; i++) {
                        let modpost = this.post_list[i];
                        modpost.hidden = true;
                        Vue.set(this.post_list, i, modpost);
                    }

                    for (let i = 0; i < searchresult.length; i++) {
                        this.hiddenposts.push(this.findinarr(searchresult[i].number, this.post_list));

                        let modpost = this.hiddenposts[i];
                        modpost.hidden = false;
                        Vue.set(this.post_list, modpost.arraypos, modpost);
                    }
                },

                resetsearchstring: function () {
                    this.searchstring = '';
                    this.hiddenposts.splice(0);

                    for (let i = 0; i < this.post_list.length; i++) {
                        let modpost = this.post_list[i];
                        modpost.hidden = false;
                        Vue.set(this.post_list, i, modpost);
                    }

                },


            }, // END app methods

            template: `
                <div id="newsmod-container">
                    <viz-bubble v-bind:treedata="treedata"></viz-bubble>
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12">
                                <div class="form-inline float-sm-left">
                                    <button :class="'btn btn-default'" v-on:click="newTopic">
                                        Neues Thema
                                    </button>

                                    <button :class="'btn btn-default fa fa-sync'" v-on:click="">
                                         
                                    </button>

                                    <input v-model="searchstring" placeholder="Suchen..." v-on:click="resetsearchstring">

                                    <button :class="'btn btn-outline-success'" type="submit" v-on:click="search">
                                        Suchen
                                    </button>
                                </div>
                                <div class="text-danger" id="orr">Bitte drehen Sie Ihr Gerät!</div>
                            </div>
                        </div>
                    </div>
                    <div class="container-fluid px-0 ">
                        <div class="px-0">
                            <hr />
                            <div class="col-12 row" >
                                
                                <div class="col-xl-6 col-sm-10" id="tree" style="overflow:scroll; height:500px; margin-bottom:3px" >
                                <post-container v-bind:postlist="post_list" v-bind:markedpost="markedpost"  v-on:displaymsg="ondisplaymsg"></post-container>
                                
                                </div>
                                <div class="col-xl-6 col-sm-10 row-no-padding" id="treeinfo" style="padding-right:0px; height:500px">
                                    <messagebody-container v-bind:postdata="singlepostdata" :isused ="msgbodycontainerdisplay" 
                                    :isreading = "isreading" :isanswering = "isanswering" :iscreatingtopic = "iscreatingtopic" v-on:answeredmsg="onansweredmsg"
                                    v-on:prevmsg="onprevmsg" v-on:nextmsg="onnextmsg">
                                    
                                    </messagebody-container>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            `,
        });


    };// end Reader

    return Reader;
});