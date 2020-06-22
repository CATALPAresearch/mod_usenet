define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/axios.min.js'
], function ($, Vue, axios) {

    return Vue.component('messagebody-container',
        {
            props: ['postdata', 'isused', 'isreading', 'isanswering', 'iscreatingtopic', 'courseid'],

            data: function () {
                return {
                    answerbuttontext: 'Antworten',  // Text is toggled between 'Antworten' and 'Senden'
                    textareacontent: '',
                    value: '',
                    usrinput_subject: '',
                    textarea_usrinput: ''
                };
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
                        // this.textareacontent = this.postdata.messagebody;
                        this.isreading = true;
                        this.isanswering = false;


                        // Why PARAMS: axios also converts js objects to json on POST
                        // which is incompatible with moodles "data_submitted()"
                        // thats why the classic approach of urlsearchparams() is needed 
                        const params = new URLSearchParams();
                        params.append('userInput', this.textarea_usrinput);
                        if (this.postdata.header === undefined) {
                            this.postdata.header = {subject:'', references:'', id:-1};
                        }
                        params.append('subject', this.postdata.header.subject);
                        params.append('references', this.postdata.header.references);
                        params.append('uid', this.postdata.header.id);

                        axios   //returned data is already js object (axios automaticly converts json to js obj)
                            .post(M.cfg.wwwroot + "/mod/newsmod/posttest.php?id=" + this.courseid + "&msgnr=" + this.postdata.header.id,
                                params)
                            .then(response => (this.value = response));

                        this.$emit('answeredmsg');

                        //{ userInput : this.textareacontent, subject : this.postdata.header.subject, references : this.postdata.header.references, uid : this.postdata.header.id }

                    }


                },

                prevmsg: function () {   // Number = messageid
                    this.$emit('prevmsg', this.postdata.header !== undefined ? this.postdata.header.number : 0);
                },

                nextmsg: function () {
                    this.$emit('nextmsg', this.postdata.header !== undefined ? this.postdata.header.number : 0);
                },


                createtopic: function () {
                    const params = new URLSearchParams();
                    params.append('userInput', this.textarea_usrinput);
                    params.append('subject', this.usrinput_subject);


                    axios   //returned data is already js object (axios automaticly converts json to js obj)
                        .post(M.cfg.wwwroot + "/mod/newsmod/posttest.php?id=" + this.courseid + "&msgnr=new",
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
            },

            template: `
                <div class = "messagebody-container" :style = "{display: isused}">
                    <div class="row-no-padding" style="padding-right:0px">
                        <div class="col-xl">
                            <template v-if = "iscreatingtopic">
                                <button :class="'btn btn-primary'" v-on:click="createtopic">
                                    Senden
                                </button>
                                <br/>
                                <label>
                                    Betreff:
                                </label>
                                <textarea v-model="usrinput_subject" :class="{'form-control': true}" cols=30 rows=1> </textarea>
                                <label>
                                    Text:
                                </label>
                                <br/>
                                <textarea v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=17> </textarea>                        
                            </template>
                            <template v-else>
                            <div>
                                {{postdata.header.name}}
                            </div>
                            <div>
                                {{postdata.header.subject}}
                            </div>
                            </template>
                        </div>
                    </div>

                    <template v-if="iscreatingtopic"></template>

                    <template v-else>
                        <div class="row control-bar">
                            <button class="btn btn-sm btn-outline-primary" v-on:click="onanswerbuttonclick" title="Beitrag beantworten">
                                <i class="fa fa-reply"></i>
                                {{answerbuttontext}}
                            </button>
                            <button class="btn btn-sm btn-light" v-on:click="prevmsg" title="Die vorherige Nachricht anzeigen">
                                <i class="fa fa-arrow-left"></i>
                                Vorherige Nachricht
                            </button>
                            <button class="btn btn-sm btn-light" v-on:click="nextmsg" title="Die nächste Nachricht anzeigen">
                                 Nächste Nachricht 
                                 <i class="fa fa-arrow-right"></i>    
                            </button>
                        </div>
                        <template v-if="isreading">
                            <div class="row-no-padding" :style="{'overflow-y': 'scroll', height: '335.9px'}">
                                <div>
                                    <!-- 'white-space': 'pre-line' is needed here because v-model automatically formats nl it seems -->
                                    <span :style="{'white-space': 'pre-line'}"> {{textareacontent}}</span>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="form-group" :style="{'overflow-y': 'scroll', height: '335.9px'}">
                                <textarea v-model="textarea_usrinput" :class="{'form-control': true, hidden: isreading}" cols=90 rows=17> </textarea>
                            </div>
                        </template>
                    </template>                        
                </div>
            `,
        });     // END component messagebody-container
});