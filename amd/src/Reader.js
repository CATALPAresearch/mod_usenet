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
    'jquery', // maybe not needed? We should stick with native javascript
], function ($) {
    
    
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
    

        var Reader = function (Vue, d3, axios, utils, log, courseid, messageid) {

            
            /**
             * 
             * 
             * 
             *  @param content created in buildtree(...) 
             *  var content = {marked: marked, unread: unread, markedhtml: marked,
                picturestatus: val.picturestatus, personal: val.personal, sender: val.sender,
                user_id: val.user_id, margin: margin, sequence: this.sequence++, messageid: val.messageid,
                date: val.date, subject: val.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
                isSelected: false};
             * 
             */
            Vue.component('post', 
            {
                props: ['content'],

                data: function() {
                    return {
                        isSelected: false,
                        
                    };
                },

                methods:
                {
                    togglemarked: function() {
                        axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/statuschange.php?id=" + courseid + "&msgnr=" +this.content.messageid)
                        .then();

                        if (this.content.marked) {
                            this.content.marked = false;
                        }
                        else {
                            this.content.marked = true;
                        }
                    }
                },

                template: `
                <div class = "post">
                    <li class="node px-0" :column="content.margin" :sequence="content.sequence" :marked="content.marked"
                    :messageid="content.messageid" :data-date="new Date(content.date)" :class = "{'font-weight-bold': content.unread}">
                        <div class ="container-fluid px-0">
                            <div class = "row px-0" v-bind:class="{'bg-info': content.isSelected}">
                                
                                
                                <div class = "px-0 col-sm-2 col-md-2 col-lg-2 col-xl-2" v-on:click="togglemarked">

                                    <!-- TODO insert jdenticon -->

                                    <template v-if="content.marked">
                                    <i class="fas starmarked fa-star" />
                                    </template>
                                    <template v-else>
                                    <i class="far fa-star" />
                                    </template>

                                    <template v-if="content.haschild">
                                    <i class="fas fa-xs fa-arrow-down" />
                                    </template>
                                    <template v-else>
                                    </template>
                                </div>


                                <div class = "col-sm-5 col-md-5 col-lg-5 col-xl-5" :style="{'text-indent': content.margin + 'px'}" v-on:click="$emit('getmsg', content.messageid, content.arraypos)">
                                    {{content.subject}}
                                </div>

                                <div class = "col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                    {{content.personal}}
                                </div>

                                <div class="datetime message col-sm-2 col-md-2 col-lg-2 col-xl-2" data-date-format="DD.MM.YYYY">
                                    {{content.calctime}}
                                </div>
                            </div>
                        </div>
                    </li>
                </div>
                `,


            });
            
            Vue.component('post-container', 
            {
                props: ['postlist', 'mytree_data', 'mytree_built', 'iterations'],

                
                data: function() {
                    return {
                        messagetest: '',
                        messagetest3: '',
                        previouspost: -1,
                    };
                },

                methods: 
                {
                    // Function ongetmsg called by event getmsg, getmsg-event is emitted by 'post' (child component)
                    
                    ongetmsg: function (msgid, arraypos)
                    {
                        axios   // returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" +msgid)
                        .then(response => (this.messagetest = response.data));
                        
                        this.$emit('displaymsg', msgid);

                        // Mark the clicked post with blue bg-colour & unmark previous clicked post
                        // "unbold" the clicked post, marking it as read
                        // why vue.set: vue cant track following changes to array:
                            // When you directly set an item with the index, e.g. vm.items[indexOfItem] = newValue
                            // When you modify the length of the array, e.g. vm.items.length = newLength
                            //
                            // Vue.set() helps, see https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats   
                        var modpost = this.postlist[arraypos];
                        console.log(modpost);
                        modpost.isSelected = true;
                        modpost.unread = false;
                        Vue.set(this.postlist, arraypos, modpost);      

                        if (this.previouspost != -1)    // was there a post previously selected ?
                        {
                            if (this.previouspost != arraypos)  // is the user not clicking on the same post ?
                            {
                                modpost = this.postlist[this.previouspost];
                                modpost.isSelected = false;
                                Vue.set(this.postlist, this.previouspost, modpost);  
                            }                          
                        }
                        this.previouspost = arraypos;   // current post is next previouspost
                        
                    }, // END event method ongetmsg

                }, // END component methods

                template: `
                    <div class ="post-container">
                        <post    
                        v-for="singlepost in postlist"
                        v-bind:content="singlepost"
                        v-bind:key = "singlepost.messageid"
                        v-on:getmsg="ongetmsg">
                        
                        </post>
                    </div>
                `,

            }); // END component post-container


        Vue.component('messagebody-container',
        {
            props: ['postdata', 'isused', 'isreading', 'isanswering', 'iscreatingtopic'],

            data: function() {
                return {
                    answerbuttontext: 'Antworten',  // Text is toggled between 'Antworten' and 'Senden'
                    textareacontent: '',
                    value: '',
                    usrinput_subject: '',
                    textarea_usrinput: '',

                    
                };
            },

            methods: {

                onanswerbuttonclick: function() {
                    this.answerbuttontext = this.answerbuttontext == 'Antworten' ? 'Senden' : 'Antworten';
                    
                    if (this.isreading) {
                        this.isreading = false;
                        this.isanswering = true;

                                // previous post is included in a reply
                                    // placing ">" to distinguish old message from new reply 
                        var messagesplit = this.textareacontent.split('\n');
                        var newmessage = "\n";
                        for (var i = 0; i < messagesplit.length; i++) {
                            newmessage = newmessage + ">" + messagesplit[i] + "\n";
                        }
                        this.textarea_usrinput = newmessage;
                    }
                    else {                      // ==If user is answering a post
                        // this.textareacontent = this.postdata.messagebody;
                        this.isreading = true;
                        this.isanswering = false;


                        // Why PARAMS: axios also converts js objects to json on POST
                            // which is incompatible with moodles "data_submitted()"
                            // thats why the classic approach of urlsearchparams() is needed 
                        const params = new URLSearchParams();
                        params.append('userInput', this.textarea_usrinput);
                        params.append('subject', this.postdata.header.subject);
                        params.append('references', this.postdata.header.references);
                        params.append('uid', this.postdata.header.id);
                        
                        axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .post(M.cfg.wwwroot + "/mod/newsmod/posttest.php?id=" + courseid + "&msgnr=" + this.postdata.header.id,
                        params)
                        .then(response => (this.value = response));

                        this.$emit('answeredmsg');

//{ userInput : this.textareacontent, subject : this.postdata.header.subject, references : this.postdata.header.references, uid : this.postdata.header.id }

                    }
                    

                },

                prevmsg: function() {
                    this.$emit('prevmsg', this.postdata.header.number);
                },

                nextmsg: function() {
                    this.$emit('nextmsg', this.postdata.header.number);
                },


                createtopic: function() {
                    const params = new URLSearchParams();
                    params.append('userInput', this.textareacontent);
                    params.append('subject', this.usrinput_subject);
                    
                    
                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                    .post(M.cfg.wwwroot + "/mod/newsmod/posttest.php?id=" + courseid + "&msgnr=new",
                    params)
                    .then(response => (this.value = response));

                    this.$emit('answeredmsg');
                },

            },

           

            watch: {
                postdata: function() {      // when postdata changes (user clicks on a different post), reset stuff
                    this.textareacontent = this.postdata.messagebody;
                    this.isreading = true;
                    this.isanswering = false;
                    this.answerbuttontext = "Antworten";
                },
                iscreatingtopic: function( ) {
                    if (this.iscreatingtopic) {
                        this.textarea_usrinput = '';
                    }
                    
                },
            },

            template: `
                <div class = "messagebody-container" :style = "{display: isused}">
                    <div class="row-no-padding" style="padding-right:0px">
                        <div class="col-xl">
                            <template v-if = "iscreatingtopic">
                                <button :class="'btn btn-primary'" v-on:click="createtopic">
                                    Senden
                                </button>
                                <BR></BR>
                                <label>
                                    Betreff:
                                </label>
                                <textarea v-model="usrinput_subject" :class="{'form-control': true}" cols=30 rows=1> </textarea>
                                <label>
                                    Text:
                                </label>
                                <BR></BR>
                                <textarea v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=17> </textarea>                        
                            </template>
                            <template v-else>
                                <div>{{postdata.header.name}}
                                </div>
                                <div>{{postdata.header.subject}}
                                </div>
                            </template>
                        </div>
                    </div>

                    <template v-if = "iscreatingtopic">
                    </template>

                    <template v-else>
                    

                        <div class="row">
                            <button :class="'btn btn-primary'" v-on:click="onanswerbuttonclick">
                                {{answerbuttontext}}
                            </button>
                            <button :class="'btn btn-primary'" v-on:click="prevmsg">
                                Vorherige Nachricht
                            </button>
                            <button :class="'btn btn-primary'" v-on:click="nextmsg">
                                Nächste Nachricht
                            </button>
                        </div>
                        <template v-if="isreading">
                            <div :class="'row-no-padding'" :style="{'overflow-y': 'scroll', height: '335.9px'}">
                                <div>
                                    <!-- 'white-space': 'pre-line' is needed here because v-model automatically formats nl it seems -->
                                    <span :style="{'white-space': 'pre-line'}"> {{textareacontent}}</span>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div :class="'form-group'" :style="{'overflow-y': 'scroll', height: '335.9px'}">
                                <textarea v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=17> </textarea>
                            </div>
                        </template>
                    </template>                        
                </div>
            `,
        });     // END component messagebody-container

            

        var app = new Vue({
            el: 'newsmod-container',
            data: function () {
                return {
                    message: '',
                    search: '',
                    filter_assessment: true,
                    filter_text: true,
                    content: [],
                    info: 'Hallo, ich warte auf Daten vom usenet Server ...',
                    tree_json: '',
                    tree_data: '',
                    tree_built: 0,
                    sequence: 1,
                    iterations: 0,
                    arraypos: 0,
                    post_list: [],
                    singlepostdata:[],
                    msgbodycontainerdisplay: 'none',
                    isreading: false,
                    isanswering: false,
                    iscreatingtopic: false
                };
            },
            components: {
                //testcomp,
                // home,
                // test
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
                
                axios   //returned data is already js object (axios automaticly converts json to js obj)
                    .get(M.cfg.wwwroot + "/mod/newsmod/phpconn5.php?id=" + courseid)
                    .then(response => (this.info = response, this.tree_data = response.data, this.buildtree(response.data, 1)));

                
            },
            computed: {

            },
            methods: {

                ondisplaymsg: function (msgid)
                {
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" +msgid)
                        .then(response => (this.singlepostdata = response.data,this.iterations = 999));
                        this.msgbodycontainerdisplay = '';      // Set display to "visible"
                        this.iscreatingtopic = false;
                        this.isreading = true;
                        this.isanswering = false;  
                    
                },
                onprevmsg: function(msgid) {
                
                    console.log(msgid);


                    msgid = parseInt(msgid, 10);
                    msgid = msgid - 1;
                    msgid = msgid.toString();

                    console.log(msgid);

                    
                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" +msgid)
                        .then(response => (this.singlepostdata = response.data,this.iterations = 999));
                        this.msgbodycontainerdisplay = '';      // Set display to "visible"
                        this.iscreatingtopic = false;
                        this.isreading = true;
                        this.isanswering = false;
                },

                onnextmsg: function(msgid) {
                    msgid = parseInt(msgid, 10);
                    msgid = msgid + 1;
                    msgid = msgid.toString();

                    console.log(msgid);

                    axios   // Returned data is already js object (axios automaticly converts json to js obj)
                        .get(M.cfg.wwwroot + "/mod/newsmod/messageid.php?id=" + courseid + "&msgnr=" +msgid)
                        .then(response => (this.singlepostdata = response.data,this.iterations = 999));
                        this.msgbodycontainerdisplay = '';      // Set display to "visible"
                        this.iscreatingtopic = false;
                        this.isreading = true;
                        this.isanswering = false;
                },
                /**
                 * Refresh post
                 */
                onansweredmsg: function() {
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


                
                buildtree: function (tree_data,margin) {
                    
                    
                    //var data = tree_data_children;
                    
                    tree_data.children.forEach(val => {
                            
                           
                        //var marked = val.markedstatus != '0' ? "fas starmarked " : "far ";
                        var marked = val.markedstatus != '0' ? true : false;
                        //var read = val.messagestatus == '0' ? "font-weight-bold " : "";
                        var unread = val.messagestatus == '0' ? true : false;

                        var childpresent = false;
                        if (val.picturestatus > '0') 
                        {
                            var jdenticonstring = '<div class="control col-sm-3 col-xl-4"><img title="Name: ' + val.personal + '\r\nE-Mail-Adresse: ' + val.sender + '" src="' + M.cfg.wwwroot + '/user/pix.php/' + val.user_id + '/f1.jpg" width="20" height="20"></img></div>';
                        } 
                        else 
                        {
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
                        if (val.children)
                        {
                            childpresent = true;
                        }
                        else
                        {
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
                        
                        var content = {marked: marked, unread: unread, markedhtml: marked,
                            picturestatus: val.picturestatus, personal: val.personal, sender: val.sender,
                            user_id: val.user_id, margin: margin, sequence: this.sequence++, messageid: val.messageid,
                            date: val.date, subject: val.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
                            isSelected: false};
                        
                        this.post_list.push(content);
                        //Vue.set(this.post_list, this.arraypos, content);
                        if (val.children)
                        {
                            app.buildtree(val,margin + 25);
                        }
                        
                        
                    });
                    
                },

                newTopic: function() {
                    this.msgbodycontainerdisplay = ''; 
                    this.iscreatingtopic = true;
                    this.isreading = false;
                    this.isanswering = false;    
                }
                
            }, // END app methods

            template: `
                <div id="newsmod-container">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12">
                                <div class="form-inline float-sm-left">
                                    <button :class="'btn btn-default'" v-on:click="newTopic">
                                        Neues Thema
                                    </button>

                                    <button :class="'btn btn-default fa fa-sync'" v-on:click="">
                                         
                                    </button>

                                    <input type="text" class="form-control" placeholder="Suchen...">

                                    <button :class="'btn btn-outline-success'" type="submit" v-on:click="">
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
                                <post-container v-bind:postlist="post_list" v-bind:iterations="iterations"  v-on:displaymsg="ondisplaymsg"></post-container>
                                
                                </div>
                                <div class="col-xl-6 col-sm-10 row-no-padding" id="treeinfo" style="padding-right:0px; height:500px">
                                    <messagebody-container v-bind:postdata = "singlepostdata" :isused ="msgbodycontainerdisplay" 
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