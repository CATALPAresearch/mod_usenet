define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/axios.min.js'
], function ($, Vue, axios) {

    return Vue.component('messagebody-container',
        {
            props: ['postdata', 'isused', 'isreading', 'isanswering', 'iscreatingtopic', 'courseid',
                'identiconstring', 'viewportsize', 'hideloadingicon'],

            data: function () {
                return {
                    answerbuttontext: 'Antworten',  // Text is toggled between 'Antworten' and 'Senden'
                    textareacontent: '',
                    value: '',
                    usrinput_subject: '',
                    textarea_usrinput: '',
                    ismobile: false,
                };
            },

            created: function () {
                if (this.viewportsize == 'mobile') {
                    this.ismobile = true;
                }
                else {
                    this.ismobile = false;
                }
            },

            methods: {

                onanswerbuttonclick: function () {
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

                        axios   //returned data is already js object (axios automaticly converts json to js obj)
                            .post(M.cfg.wwwroot + "/mod/newsmod/php/posttest.php?id=" + this.courseid + "&msgnr=" + this.postdata.header.id,
                                params)
                            .then(response => (this.value = response));

                        this.$emit('answeredmsg');

                        //{ userInput : this.textareacontent, subject : this.postdata.header.subject, references : this.postdata.header.references, uid : this.postdata.header.id }

                    }


                },
                convertDate: function(date){
                    console.log(date)
                    date = date * 1000;
                    var options = {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric'
                    };
                    return new Date(date).toLocaleDateString('de-DE', options) ? new Date(date).toLocaleDateString('de-DE', options) : "";
                },
                prevmsg: function () {   // Number=messageid
                    this.$emit('prevmsg', this.postdata.header !== undefined ? this.postdata.header.number : 0);
                },

                nextmsg: function () {
                    this.$emit('nextmsg', this.postdata.header !== undefined ? this.postdata.header.number : 0);
                },

                closemodal: function () {
                    this.$emit('closemodal');
                },


                createtopic: function () {
                    const params = new URLSearchParams();
                    params.append('userInput', this.textarea_usrinput);
                    params.append('subject', this.usrinput_subject);


                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .post(M.cfg.wwwroot + "/mod/newsmod/php/posttest.php?id=" + this.courseid + "&msgnr=new",
                            params)
                        .then(response => (this.value = response));

                    this.$emit('answeredmsg');
                },

            },

            watch: {
                postdata: function () {      // when postdata changes (user clicks on a different post), reset stuff
                    this.textareacontent = this.postdata.messagebody;
                    this.isreading = true;
                    this.isanswering = false;
                    this.answerbuttontext = "Antworten";
                },
                iscreatingtopic: function () {
                    if (this.iscreatingtopic) {
                        this.textarea_usrinput = '';
                    }

                },
                viewportsize: function () {
                    if (this.viewportsize == 'mobile') {
                        this.ismobile = true;
                    }
                    else {
                        this.ismobile = false;
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
                <div :class="{'messagebody-container': true}" :style="{display: isused}">
                    <div class="" style="padding-right:0px">
                        <div class="">
                            
                            <!-- Create new message -->
                            <template v-if="iscreatingtopic">
                                <div class="mb-2 pl-1 pb-1">
                                    <div class="mx-0 control-bar">
                                        <button :class="'btn btn-sm btn-primary'" v-on:click="createtopic">
                                        Senden</button>
                                        <template v-if="ismobile">
                                            <button class="fas fa-times ml-auto align-self-center" v-on:click="closemodal"
                                            style="margin-right: 30px">
                                            </button>
                                        </template>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label hidden for="inputsubject">Betreff:</label>
                                    <input id="inputsubject" placeholder="Betreff" v-model="usrinput_subject" :class="{'form-control': true}"/>
                                </div>
                                <div class="form-group">
                                    <label hidden for="inputtext">Text:</label>
                                    <textarea id="inputtext" placeholder="Beitragstext" v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=10> </textarea>
                                </div>
                            </template>

                            <!-- Read message -->
                            <template v-else>
                            <div class="bg-infoX border-bottom mb-2 pl-1 pb-1">
                                <div class="mx-0 mb-3 control-bar" :class="{hidden: postdata.header.is_error}">
                                    <button class="btn btn-sm btn-outline-primary mr-3" v-on:click="onanswerbuttonclick" title="Beitrag beantworten">
                                        <i class="fa fa-reply"></i>
                                        {{answerbuttontext}}
                                    </button>
                                    <button class="btn btn-sm btn-light mr-1" v-on:click="prevmsg" title="Die vorherige Nachricht anzeigen">
                                        <i class="fa fa-arrow-left"></i>
                                        Vorherige Nachricht
                                    </button>
                                    <button class="btn btn-sm btn-light" v-on:click="nextmsg" title="Die nächste Nachricht anzeigen">
                                        Nächste Nachricht 
                                        <i class="fa fa-arrow-right"></i>    
                                    </button>
                                </div>
                                <div class="">
                                    <div>
                                        <div class="d-flex">
                                            <img style="height:40px; width:40px;" :src="this.identiconstring"/>
                                            <span class="mr-auto pt-1" >
                                                <a :href="'mailto:' + postdata.header.from">{{postdata.header.name}}</a>
                                            </span>
                                            <span class="pt-1">{{ convertDate(postdata.header.date) }}</span>
                                        </div>
                                        <div class="bold">
                                            {{postdata.header.subject}}
                                        </div>
                                    </div>
                                    <template v-if="ismobile">
                                        <button class="fas fa-times ml-auto align-self-center" v-on:click="closemodal">
                                        </button>
                                        <!-- 
                                        <button type="button" class="close ml-auto align-self-center" aria-label="Close" v-on:click="closemodal">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        -->
                                    </template>
                                </div>
                            </div>
                            </template>
                        </div>
                    </div>

                    <template v-if="iscreatingtopic"></template>

                    <template v-else>
                        <template v-if="isreading">
                            <div :class="{hidden: hideloadingicon}">
                                <i class="fas fa-cog fa-spin fa-5x"/>
                            </div>
                            <div class="">
                                <!-- 'white-space': 'pre-line' is needed here because v-model automatically formats nl it seems -->
                                <p :style="{'white-space': 'pre-line', 'overflow': 'auto', 'height': 'auto'}"> {{textareacontent}}</p>
                            </div>
                        </template>
                        <template v-else>
                            <div class="form-group">
                                <textarea v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=10> </textarea>
                            </div>
                        </template>
                    </template>                        
                </div>
            `,
        });     // END component messagebody-container
});