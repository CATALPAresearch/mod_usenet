define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/axios.min.js'
], function ($, Vue, axios) {

    /**
     *  @param content created in buildtree(...) 
     *  var content = {marked: marked, unread: unread, markedhtml: marked,
        picturestatus: val.picturestatus, personal: val.personal, sender: val.sender,
        user_id: val.user_id, margin: margin, sequence: this.sequence++, messageid: val.messageid,
        date: val.date, subject: val.name, calctime: calctime, absender: absender, haschild: childpresent, arraypos: this.arraypos++,
        isSelected: false};
     */


    return Vue.component('post',
        {
            props: ['content', 'courseid'],

            data: function () {
                return {
                    isSelected: false,
                    hiddenfamily: false,

                    poststyle: {
                        cursor: 'pointer',
                    }
                };
            },

            methods:
            {
                setcourseid: function (id) {
                    this.courseid = id;
                },

                togglemarked: function () {
                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .get([
                            M.cfg.wwwroot +
                            "/mod/newsmod/statuschange.php?id=" +
                            this.courseid +
                            "&msgnr=" +
                            this.content.messageid
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
                },

                hideself: function () {
                    this.content.hidden = true;

                },
                showself: function () {
                    this.content.hidden = false;
                }

            },

            computed: {
                poststylechild: function () {
                    if (this.content.haschild) {
                        return this.poststyle;
                    }
                    
                }
            },
            /*
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
            */
            template: `
                <div class = "post" :class="{hidden: content.hidden}">
                    <div class="node px-0" :column="content.margin" :class = "{'font-weight-bold': content.unread}">
                        <div class ="container-fluid px-0">
                            <div class = "row px-0" v-bind:class="{'bg-info': content.isSelected}">
                                
                                
                                <div class = "px-0 col-sm-1 col-md-1 col-lg-1 col-xl-1">

                                    <!-- TODO insert jdenticon -->
                                    
                                    <i class="far fa-star" :class = "{starmarked: content.marked, fas: content.marked }"
                                    v-on:click="togglemarked" title = "Favoriten markieren" :style="poststyle"/>

                                    <i class="fas fa-xs" :class = "{'fa-arrow-down': content.haschild, 'fa-arrow-right': this.hiddenfamily}"
                                    v-on:click="hidefamily" title = "Diskussion ein- oder ausklappen" :style="poststylechild"/>

                                   
                                </div>

                                <div class ="container-fluid px-0 col-sm-11 col-md-11 col-lg-11 col-xl-11">

                                <div class = "row" v-on:click="$emit('getmsg', content.messageid, content.arraypos)" :style="poststyle">
                                    <div class = "col-sm-7 col-md-7 col-lg-7 col-xl-7 text-truncate" :style="{'text-indent': content.margin + 'px'}">
                                        {{content.subject}}
                                    </div>

                                    <div class = "col-sm-3 col-md-3 col-lg-3 col-xl-3 text-truncate">
                                        {{content.personal}}
                                    </div>

                                    <div class="datetime message col-sm-2 col-md-2 col-lg-2 col-xl-2" data-date-format="DD.MM.YYYY">
                                        {{content.calctime}}
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