define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min'
    ], function ($, Vue) {

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
            props: ['content'],

            data: function () {
                return {
                    isSelected: false
                };
            },

            methods:
            {
                togglemarked: function () {
                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .get([
                            M.cfg.wwwroot,
                            "/mod/newsmod/statuschange.php?id=",
                            courseid,
                            "&msgnr=",
                            this.content.messageid
                        ].join())
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
                <div class = "post" :class="{hidden: this.content.hidden}">
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
                `
        });
});