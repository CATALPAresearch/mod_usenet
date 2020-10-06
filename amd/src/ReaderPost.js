/**
 *
 *
 * @module     mod_usenet
 * @class      Post
 * @copyright  Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    GNU GPLv3
 */
define([
    M.cfg.wwwroot + '/mod/usenet/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/usenet/lib/build/axios.min.js',
], function (Vue, axios) {

    /**
     *  @param content created in buildtree(...) 
     *  var content={marked: marked, unread: unread, markedhtml: marked,
        picturestatus: val.picturestatus, personal: val.personal, sender: val.sender,
        user_id: val.user_id, margin: margin, sequence: this.sequence++, messageid: val.messageid,
        date: val.date, subject: val.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
        isSelected: false};
     */


    return Vue.component('post',
        {
            props: [ 'content', 'courseid', 'log' ],

            data: function () {
                return {
                    isSelected: false,
                    hiddenChildren: false,
                    identiconstring: "data:image/svg+xml;base64," + this.content.identicon,
                    textindent: {
                        'text-indent': this.content.margin + 'px'
                    },
                };
            },

            created() {
                this.textindent = 'text-indent: ' + this.content.margin + 'px';
            },

            methods:
            {
                
                toggleMarkedMessage: function (event) {
                    event.preventDefault();
                    this.content.marked = !this.content.marked;
                    this.$emit('log', 'message_mark_' + this.content.marked ? 'marked' : 'unmarked', { message_id: this.content.messagenumber, message_author: this.message.personal })
                    // TODO: Why do we get something from the server here?
                    axios.get([
                            M.cfg.wwwroot +
                            "/mod/usenet/php/statuschange.php?id=" +
                            this.courseid +
                            "&msgnr=" +
                            this.content.messagenumber
                        ].join())
                        .then();
                },

                displayMessage: function (messagenumber, arraypos, event) {
                    this.$emit('getmsg', messagenumber, arraypos)
                    this.$emit('log', 'message_list_click', { message_id: messagenumber, message_pos: arraypos })
                    //event.preventDefault();
                },

                hideChildren: function (event) { 
                    if (this.hiddenChildren == false) {
                        this.hiddenChildren = true;
                        this.$emit('hideChildren', this.content.children);
                    } else {
                        this.hiddenChildren = false;
                        this.$emit('showChildren', this.content.children);
                    }
                    this.$emit('setSelected', this.content.messagenumber);
                    this.$emit('log', 'message_children_' + this.hiddenChildren ? 'shown' : 'hidden', { message_id: this.content.messagenumber });
                    event.preventDefault();
                },

                // Called by container 'ReaderPostContainer'
                hideself: function () {
                    this.content.hidden = true;

                },
                // Called by container 'ReaderPostContainer'
                showself: function () {
                    this.content.hidden = false;
                }

            },

            template: `
                <div class="post" :class="{hidden: content.hidden}">
                    <div class="node px-0" :column="content.margin" :class="{'font-weight-bold': content.unread}">
                        <div class="container-fluid px-0">
                            <div class="row px-0 mx-0" :class="{'bg-info': content.isSelected}" >
                                <div class="px-0 col-1 col-xs-1 col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                    <i class="fas fa-sm pt-2 px-sm-3 pr-xs-2 pl-xs-3 pl-md-2 p-1" 
                                        :class="{'fa-chevron-down': content.haschild, 'fa-chevron-right': this.hiddenChildren}" 
                                        style="cursor:pointer"
                                        v-on:click="hideChildren($event)" 
                                        title="Diskussion ein- oder ausklappen"
                                        />
                                </div>
                                <div 
                                    class="px-0 col-11 col-xs-11 col-sm-11 col-md-11 col-lg-11 col-xl-11" 
                                    style="display:inline-block;"
                                    >
                                    <div class="row poststyle mb-xs-2">
                                        
                                        <div 
                                            :style="textindent" 
                                            class="col-3 col-xs-7 col-sm-3 col-md-3 col-lg-3 col-xl-3 
                                            order-1 order-sm-1 text-truncate px-0"
                                            v-on:click="displayMessage(content.messagenumber, content.arraypos, $event)"
                                            >
                                            <img style="width:20px; height:20px;" :src="this.content.identicon" :title="this.content.personal"/>
                                            {{content.personal}}
                                        </div>
                                    
                                        <div 
                                            class="col-6 col-xs-11 col-sm-6 col-md-11 col-lg-6 col-xl-6 
                                            order-xs-3 order-md-2 
                                            text-truncate px-0"
                                            style="left:4px;"
                                            v-on:click="displayMessage(content.messagenumber, content.arraypos, $event)"
                                            >
                                            {{content.subject}}
                                        </div>

                                        <div 
                                            class="col-3 col-xs-5 col-sm-3 col-md-3 col-lg-3 col-xl-3" 
                                            class="order-2 order-md-3"
                                            class="px-0"
                                            data-date-format="DD.MM.YYYY">
                                            <span v-on:click="displayMessage(content.messagenumber, content.arraypos, $event)" style="font-size:0.9em">{{content.calctime}}</span>
                                            <i class="far fa-star poststyle d-xs-block" :class="{starmarked: content.marked, fas: content.marked }"
                                        v-on:click="toggleMarkedMessage($event)" title="Favoriten markieren"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `
        });
});