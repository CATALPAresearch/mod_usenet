/**
 * 
 *
 * @module     mod_usenet
 * @class      Message body
 * @copyright  Niels Seidel <niels.seidel@fernuni-hagen.de> AND Konstantin Friedrich
 * @license    GNU GPLv3
 */
define([
    M.cfg.wwwroot + '/mod/usenet/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/usenet/lib/build/axios.min.js'
], function (Vue, axios) {

    return Vue.component('messagebody-container',
        {
            props: [
                'postdata',
                'isused',
                'isreading',
                'isanswering',
                'iscreatingtopic',
                'courseid',
                'identiconstring',
                'hideloadingicon',
                'statesRMB',
                'log'
            ],

            data: function () {
                return {
                    textareacontent: '',
                    value: {},
                    usrinput_subject: '',
                    textarea_usrinput: ''
                };
            },

            methods: {
                logger: function (action, value) {
                    this.$emit('log', action, value);
                },

                replyMessage: function () {

                    this.isreading = false; // TODO: smell
                    this.isanswering = true;

                    // previous post is included in a reply
                    // placing ">" to distinguish old message from new reply 
                    var messagesplit = this.textareacontent.split('\n');
                    var newmessage = "\n";
                    for (var i = 0; i < messagesplit.length; i++) {
                        newmessage = newmessage + ">" + messagesplit[i] + "\n";
                    }
                    this.textarea_usrinput = newmessage;
                    // set focus on textarea
                    this.$nextTick(() => this.$refs.replyText.focus());

                },

                previousMessage: function () {   // Number=messageid
                    this.$emit('prevmsg', this.postdata.header !== undefined ? this.postdata.header.messagenumber : 0);
                },

                nextMessage: function () {
                    this.$emit('nextmsg', this.postdata.header !== undefined ? this.postdata.header.messagenumber : 0);
                },

                hideParentMessageBody: function () {
                    this.$emit('hideMessageBody');
                    this.$emit('log', 'message_body_panel_close', {})
                },

                submitNewMessage: function () {
                    this.$emit('log', 'message_body_panel_submit_new', {});
                    const params = new URLSearchParams();
                    params.append('userInput', this.textarea_usrinput);
                    params.append('subject', this.usrinput_subject);

                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .post(
                            M.cfg.wwwroot + "/mod/usenet/php/posttest.php?id=" + this.courseid + "&msgnr=new",
                            params
                            )
                        .then(response => (this.value = response));

                    this.$emit('answeredmsg');
                },

                submitReplyMessage: function () {
                    // ==If user is answering a post
                    // this.textareacontent=this.postdata.messagebody;
                    this.isreading = true;
                    this.isanswering = false;

                    // Why PARAMS: axios also converts js objects to json on POST
                    // which is incompatible with moodles "data_submitted()"
                    // thats why the classic approach of urlsearchparams() is needed 
                    const params = new URLSearchParams();
                    params.append('userInput', this.textarea_usrinput);
                    
                    if (this.postdata.header === undefined) {
                        this.postdata.header = { subject: '', references: '', id: -1 };
                    }
                    params.append('subject', this.postdata.header.subject);
                    params.append('references', this.postdata.header.references);
                    params.append('uid', this.postdata.header.id);

                    axios
                        .post(M.cfg.wwwroot + "/mod/usenet/php/posttest.php?id=" + this.courseid + "&msgnr=" + this.postdata.header.id,
                            params)
                        .then(response => (this.value = response));

                    this.$emit('answeredmsg');

                }
            },

            watch: {
                postdata: function () {      // when postdata changes (user clicks on a different post), reset stuff
                    this.textareacontent = this.postdata.messagebody;
                    this.isreading = true;
                    this.isanswering = false;
                },
                iscreatingtopic: function () {
                    if (this.iscreatingtopic) {
                        this.textarea_usrinput = '';
                    }

                },
                /**
                 * When user requests a new message to display in textarea of ReaderMessageBody,
                 * then show the loading icon and delete previous content
                 */
                hideloadingicon: function () {
                    if (this.hideloadingicon == false) {
                        this.textareacontent = "";
                    }
                }
            },

            template: `
                <div> <!-- :class="{'messagebody-container': true}" :style="{display: isused}"-->
                    <!-- Create new message -->
                    <template v-if="iscreatingtopic">
                        <div class="border-bottom ml-3 mb-1 pl-1 pb-1">
                            <div class="mb-2 pl-1 pb-1">
                                <div class="mx-0 control-bar">
                                    <span class="bold">Neue Nachricht verfassen</span>
                                    <button type="button" class="close ml-auto align-self-center d-block d-sm-none" aria-label="Close" v-on:click="hideParentMessageBody">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label hidden for="inputsubject">Betreff:</label>
                                <input ref="newMessageSubject" id="inputsubject" placeholder="Betreff" v-model="usrinput_subject" :class="{'form-control': true}"/>
                            </div>
                            <div class="form-group">
                                <label hidden for="inputtext">Text:</label>
                                <textarea id="inputtext" placeholder="Beitragstext" v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=10> </textarea>
                                <button class="btn btn-sm btn-primary mt-1" :disabled="isanswering" v-on:click="submitNewMessage">Senden</button>
                                <button class="btn btn-sm btn-link mt-1 float-right d-block d-sm-none" v-on:click="hideParentMessageBody">Nachricht verwerfen</button>
                            </div>
                        </div>
                    </template>


                    <!-- Read or reply to a message -->
                    <template v-else>
                        <div class="border-bottom ml-3 mb-1 pl-1 pb-1">
                            <div class="mx-0 mb-3 control-bar"><!-- :class="{hidden: postdata.header.is_error}" -->
                                <button class="btn btn-sm btn-outline-primary mr-3" :hidden="isanswering" v-on:click="replyMessage" title="Beitrag beantworten">
                                    <i class="fa fa-reply"></i>
                                    Antworten
                                </button>
                                <button class="btn btn-sm btn-light mr-0" :disabled = "!statesRMB.CanSelectPrev" v-on:click="previousMessage" title="Die vorherige Nachricht anzeigen">
                                    <i class="fa fa-chevron-left"></i>
                                </button>
                                <span class="mx-0">Nachricht</span>
                                <button class="btn btn-sm btn-light ml-0" :disabled = "!statesRMB.CanSelectNext" v-on:click="nextMessage" title="Die nächste Nachricht anzeigen">
                                    <i class="fa fa-chevron-right"></i>    
                                </button>
                                <button type="button" class="close ml-auto align-self-center d-block d-sm-none" aria-label="Close" v-on:click="hideParentMessageBody">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div>
                                <div v-if="postdata.header !== undefined">
                                    <div class="d-flex">
                                        <img style="height:40px; width:40px;" :src="postdata.header.identicon"/>
                                        <span class="mr-auto pt-1" >
                                            <a :href="'mailto:' + postdata.header.sender">{{postdata.header.personal}}</a>
                                        </span>
                                        <span class="pt-1">{{ postdata.header.calctime }}</span>
                                    </div>
                                    <div class="bold">
                                        {{postdata.header.subject}}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    
                        <!-- Body for reading a message -->
                        <template v-if="isreading">
                            <div :class="{hidden: hideloadingicon, 'text-center': true, 'my-2': true}" style="opacity:0.5;">
                                <i class="fas fa-circle-o-notch fa-spin fa-3x"/>
                            </div>
                            <div class="border-bottom ml-3 mb-3 pl-1 pb-3" :style="{'white-space': 'pre-line'}">
                               {{textareacontent}}
                            </div>
                        </template>

                        <!-- Body for a reply message -->
                        <template v-else>
                            <div class="form-group ml-3 mb-3 pl-1 pb-3">
                                <textarea ref="replyText" v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=10></textarea>
                                <button class="btn btn-sm mt-3 btn-primary" v-on:click="submitReplyMessage">Absenden</button>
                                <button class="btn btn-sm mt-3 btn-link float-right d-block d-sm-none" v-on:click="hideParentMessageBody">Nachricht verwerfen</button>
                            </div>
                        </template>
                    </template>                        
                </div>
            `,
        });
});