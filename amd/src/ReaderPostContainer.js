define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/amd/src/ReaderPost.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min'
], function ($, Post, Vue) {

    
    return Vue.component('post-container',
            {
                props: ['postlist', 'markedpost'],


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
                        var modpost = this.postlist[this.markedpost];
                        modpost.isSelected = true;
                        modpost.unread = false;
                        Vue.set(this.postlist, this.markedpost, modpost);

                        if (this.previouspost != -1)    // was there a post previously selected ?
                        {
                            if (this.previouspost != this.markedpost)  // is the user not clicking on the same post ?
                            {
                                modpost = this.postlist[this.previouspost];
                                modpost.isSelected = false;
                                Vue.set(this.postlist, this.previouspost, modpost);
                            }
                        }
                        this.previouspost = this.markedpost;   // current post is next previouspost

                    }

                },

                methods:
                {
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
                        var modpost = this.postlist[arraypos];
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

                    } // END event method ongetmsg
                }, // END component methods
                template: "<div class ='post-container'><post v-for='singlepost in postlist' v-bind:content='singlepost' v-bind:key = 'singlepost.messageid' v-on:getmsg='ongetmsg'></post></div>"
            }); // END component post-container

        
});