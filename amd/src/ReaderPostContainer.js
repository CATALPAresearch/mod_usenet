/**
 * 
 *
 * @module     mod_usenet
 * @class      Post Container
 * @copyright  Niels Seidel <niels.seidel@fernuni-hagen.de> AND Konstantin Friedrich
 * @license    GNU GPLv3
 */

define([
    M.cfg.wwwroot + '/mod/usenet/amd/src/ReaderPost.js',
    M.cfg.wwwroot + '/mod/usenet/lib/build/vue.min.js'
], function (Post, Vue) {


    return Vue.component('post-container',
        {
            props: [
                'postlist',
                'markedpost',
                'courseid',
                'showloadingicon',
                'log'
            ],

            data: function () {
                return {
                    previouspost: -1

                };
            },

            components: {
                'post': Post
            },

            watch: {
                markedpost: function () {

                    if (this.markedpost != -1) {
                        var modpost = this.postlist[this.markedpost];
                        modpost.isSelected = true;
                        modpost.unread = false;
                        Vue.set(this.postlist, this.markedpost, modpost);

                        if (this.previouspost != -1)    // was there a post previously selected ?
                        {
                            if (this.previouspost != this.markedpost)  // is the user not clicking on the same post ?
                            {
                                if (typeof this.postlist[this.previouspost] !== 'undefined') {
                                    modpost = this.postlist[this.previouspost];
                                    modpost.isSelected = false;
                                    Vue.set(this.postlist, this.previouspost, modpost);
                                }
                            }
                        }
                        this.previouspost = this.markedpost;   // current post is next previouspost
                    } else {
                        if (typeof this.postlist[this.previouspost] !== 'undefined') {
                            let modpost = this.postlist[this.previouspost];
                            modpost.isSelected = false;
                            Vue.set(this.postlist, this.previouspost, modpost);
                        }
                        else { } // nothing to be done, just wait for data to load
                    }
                },


            },

            methods: {
                logger:function(action, value){
                    this.$emit('log', action, value);
                },
                
                // Function ongetmsg called by event getmsg, getmsg-event is emitted by 'post' (child component)
                ongetmsg: function (msgid, arraypos) {

                    this.$emit('displaymsg', msgid);

                    // Mark the clicked post with blue bg-colour & unmark previous clicked post
                    // "unbold" the clicked post, marking it as read
                    // why vue.set: vue cant track following changes to array:
                    // When you directly set an item with the index, e.g. vm.items[indexOfItem] = newValue
                    // When you modify the length of the array, e.g. vm.items.length = newLength
                    //
                    // Vue.set() helps,
                    // see https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
                    //var modpost = this.postlist[arraypos];
                    var modpost = this.findinarr(msgid, this.postlist);

                    arraypos = this.postlist.indexOf(modpost);
                    modpost.isSelected = true;
                    modpost.unread = false;
                    Vue.set(this.postlist, arraypos, modpost);

                    if (this.previouspost != -1) {    // was there a post previously selected ?

                        if (this.previouspost != arraypos) {  // is the user not clicking on the same post ?

                            if (typeof this.postlist[this.previouspost] !== 'undefined') {
                                modpost = this.postlist[this.previouspost];
                                modpost.isSelected = false;
                                Vue.set(this.postlist, this.previouspost, modpost);
                            } 
                        } 
                    } 
                    this.previouspost = arraypos;   // current post is next previouspost
                    window.scroll({
                        top: 200,
                        left: 0,
                        behavior: 'smooth'
                    });
                    //document.body.scrollTop = 200;
                    //document.documentElement.scrollTop = 200;

                }, 

                // This function calls function of child members
                hideChildren: function (children) {
                    var memberid = [];

                    this.traverseChildren(children, memberid);

                    for (var i = 0; i < memberid.length; i++) {
                        let inte = parseInt(memberid[i]);
                        this.$refs[inte][0].hideself();
                    }
                },

                showChildren: function (children) {
                    var memberid = [];

                    this.traverseChildren(children, memberid);

                    for (var i = 0; i < memberid.length; i++) {
                        let inte = parseInt(memberid[i]);
                        this.$refs[inte][0].showself();
                    }
                },

                traverseChildren: function (children, memberid) {

                    for (var i = 0; i < children.length; i++) {
                        if (Array.isArray(children[i])) {
                            this.traverseChildren(children[i], memberid);
                        } else {
                            memberid.push(children[i]);
                        }
                    }

                },
                // When a post is clicked, set the background of post to 'blue' (visual feedback to user)
                // Event is triggered by click on a post in ReaderPost.js and is bubbled up to
                // Reader.js, where processing takes place
                setSelectedUP: function (messagenumber) {
                    this.$emit('setSelected', messagenumber);
                },

                findinarr: function (key, inputArray) {
                    for (let i = 0; i < inputArray.length; i++) {
                        if (inputArray[i].messagenumber === key) {
                            return inputArray[i];
                        }
                    }
                },
            }, // END component methods

            template: `
                <div class="post-container">
                    <div :class="{'hidden': showloadingicon, 'text-center': true, 'my-2': true}" style="opacity:0.5;">
                        <i class="fas fa-circle-o-notch fa-spin fa-3x"/>
                    </div>
                    <post v-for='singlepost in postlist' 
                        v-bind:content='singlepost' 
                        v-bind:key = 'singlepost.messagenumber'
                        v-bind:courseid = 'courseid'
                        :ref='singlepost.messagenumber'
                        @getmsg='ongetmsg'
                        @hideChildren='hideChildren'
                        @showChildren='showChildren'
                        @setSelected='setSelectedUP'
                        @log='logger'
                        >
                    </post>
                </div>
                `
        }); 
});