define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/axios.min.js',
], function ($, Vue, axios) {

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
            props: ['content', 'courseid', 'viewportsize'],

            data: function () {
                return {
                    isSelected: false,
                    hiddenfamily: false,
                    identiconstring: "data:image/svg+xml;base64," + this.content.identicon,

                    poststylechild: {
                        cursor: 'pointer',
                    },

                    // TODO recode these 2 styles
                    borderstyle: {
                        'border-left': 'solid black 0px'
                    },
                    textindent: {
                        'text-indent': this.content.margin + 'px'
                    },

                    postpadding: '0px',         // postpadding is a reactive var used in :style="{'padding-bottom': this.postpadding}"
                    // and '0px' is just the initial value for padding
                    paddingSVPval: '5px',       // paddingSmallViewPortval
                    paddingOVPval: '0px'        // paddingOtherViewPortval
                };
            },

            created() {
                //window.addEventListener("resize", this.Windowresizehandler);
                var borderwidth = 0;

                // If the viewport is smaller than 576px (which is breakpoint for col-[number] class, very small screens)
                // then insert a small bottom padding to posts
                // also, do a bunch of other stuff for mobile users
                if (this.viewportsize == 'mobile') {
                    this.postpadding = this.paddingSVPval;
                    this.textindent = 'text-indent: 0px';
                    let borderwidth = 0;
                    if (this.content.family) {
                        borderwidth = this.flatten(this.content.family).length;
                    }
                    this.borderstyle = 'border-left: solid black ' + borderwidth + 'px';
                }
                else {
                    this.postpadding = this.paddingOVPval;
                    this.textindent = 'text-indent: ' + this.content.margin + 'px';
                    this.borderstyle = 'border-left: solid black 0px';
                }

            },
            /*
                        destroyed() {
                            window.removeEventListener("resize", this.Windowresizehandler);
                        },
            */

            watch: {
                viewportsize: function () {
                    if (this.viewportsize == 'mobile') {
                        this.postpadding = this.paddingSVPval;
                        this.textindent = 'text-indent: 0px';
                        let borderwidth = 0;
                        if (this.content.family) {
                            borderwidth = this.flatten(this.content.family).length;
                        }
                        this.borderstyle = 'border-left: solid black ' + borderwidth + 'px';
                    }
                    else {
                        this.postpadding = this.paddingOVPval;
                        this.textindent = 'text-indent: ' + this.content.margin + 'px';
                        this.borderstyle = 'border-left: solid black 0px';
                    }
                }
            },

            methods:
            {
                // Converts nested arrays to 1d array, so the total amount of children can be retrieved with .length
                //  this function is used to determine border width at left side of posts, representing amount of children posts
                flatten: function (value) {
                    return Object.prototype.toString.call(value) === '[object Array]' ?
                        [].concat.apply([], value.map(this.flatten)) :
                        value;
                },

                /*  Windowresizehandler: function() {
                     if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 576) {
                         this.postpadding=this.paddingSVPval;
                         this.textindent='text-indent: 0px';
                         let borderwidth=0;
                         if (this.content.family) {
                             borderwidth=this.flatten(this.content.family).length;
                         }
                         this.borderstyle='border-left: solid black ' + borderwidth + 'px';
                         this.SVP=true;
                     }
                     else {
                         this.postpadding=this.paddingOVPval;
                         this.textindent='text-indent: ' + this.content.margin + 'px';
                         this.borderstyle='border-left: solid black 0px'; 
                         this.SVP=false;
                     }
                 }, */

                setcourseid: function (id) {
                    this.courseid = id;
                },

                togglemarked: function () {
                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .get([
                            M.cfg.wwwroot +
                            "/mod/newsmod/php/statuschange.php?id=" +
                            this.courseid +
                            "&msgnr=" +
                            this.content.messagenumber
                        ].join())
                        .then();

                    if (this.content.marked) {
                        this.content.marked = false;
                    }
                    else {
                        this.content.marked = true;
                    }
                },
                hidefamily: function () {
                    if (this.hiddenfamily == false) {
                        this.hiddenfamily = true;
                        this.$emit('hidefamily', this.content.family);
                    } else {
                        this.hiddenfamily = false;
                        this.$emit('showfamily', this.content.family);
                    }
                    this.$emit('setSelected', this.content.arraypos);
                },

                // Called by container 'ReaderPostContainer'
                hideself: function () {
                    this.content.hidden = true;

                },
                showself: function () {
                    this.content.hidden = false;
                }

            },

            computed: {
                poststylechildcnd: function () {
                    if (this.content.haschild) {
                        return this.poststylechild;
                    }

                },
            },

            template: `
                <div class="post" :class="{hidden: content.hidden}" :style="{'padding-bottom': this.postpadding}">
                    <div class="node px-0" :column="content.margin" :class="{'font-weight-bold': content.unread}">
                        <div class ="container-fluid px-0">
                            <div class="row px-0 mx-0" :class="{'bg-info': content.isSelected}" >
                                
                                <div class="px-0  col-1 col-xs-1 col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                    <i class="fas fa-sm pt-2 px-3" 
                                        :class="{'fa-caret-down': content.haschild, 'fa-caret-right': this.hiddenfamily}" 
                                        :style="poststylechildcnd"
                                        v-on:click="hidefamily" 
                                        title="Diskussion ein- oder ausklappen"
                                        />
                                </div>

                                <div 
                                    class="px-0 col-11 col-xs-11 col-sm-11 col-md-11 col-lg-11 col-xl-11" 
                                    style="display:inline-block;"
                                    >
                                    <div class="row poststyle mb-xs-2" v-on:click="$emit('getmsg', content.messagenumber, content.arraypos)">
                                        
                                        <div class="col-3 order-1 order-sm-1 col-xs-8 col-sm-3 col-md-3 col-lg-3 col-xl-3 text-truncate px-0">
                                            <img class="" style="width:20px; height:20px;" :src="this.content.identicon" :title="this.content.personal"/>
                                            {{content.personal}}
                                        </div>
                                    
                                        <div class="col-6 order-3 order-md-2 col-xs-11 col-sm-6 col-md-6 col-lg-6 col-xl-6 text-truncate px-0" :style="textindent" style="margin-left:25px;">
                                            {{content.subject}}
                                        </div>

                                        <div class="col-2 order-2 order-md-3 col-xs-4 col-sm-2 col-md-2 col-lg-2 col-xl-2 px-0" data-date-format="DD.MM.YYYY">
                                            <span style="font-size:0.9em">{{content.calctime}}</span>
                                            <i class="far fa-star poststyle d-xs-block" :class="{starmarked: content.marked, fas: content.marked }"
                                        v-on:click="togglemarked" title="Favoriten markieren"/>
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