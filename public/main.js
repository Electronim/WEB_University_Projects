window.addEventListener( 'load', ()=> {
    var ID = null;
    var CHANNELS = [];

    Vue.prototype.axios = axios;
    let app = new Vue({
        el: '#app',
        data: {
            news: {},
            sharedN: {},
            unsharedN: {},
            channels: {},
            newsInput: {
                title: null,
                date: null,
                author: null,
                photo: null,
                content: null,
                keywords: [],
                mediachannels: []
            },
            newsEditId: null,
            channelsEditId: null,
            newPhoto: "photos/no_image.svg"
        },

        created: function() {
            this.axios.get( '/api/channels' )
            .then( (_response) => {
                this.channels = _response.data.data;
            } );

            this.axios.get( '/api/news' )
                .then( (_response) => {
                    this.news = _response.data.data;
                    this.update();
                    this.merger( this.news );
                });
        },

        methods: {
            check1: function() {
                let ch = document.getElementById("option1").checked;
                return ch;
            },

            check2: function() {
                let ch = document.getElementById("option2").checked;
                return ch;
            },

            reset: function() {
                app.$forceUpdate();
            },

            update: function() {
                let shN = [];
                let unshN = [];

                for (let id in this.news) {
                    if (this.news[id].mediachannels === null || 
                        this.news[id].mediachannels.length === 0 ||
                        (this.news[id].mediachannels[0].length === 0)) {

                        unshN.push(this.news[id]);
                    } else {
                        shN.push(this.news[id]);
                    }
                }

                this.unsharedN = Object.assign({}, unshN);
                this.sharedN = Object.assign({}, shN);
            },

            onFileChange(e) {
                const file = e.target.files[0];
                this.newPhoto = "photos/" + file["name"];
            },

            newsRemove: function( _id ) {
                this.axios.delete( `/api/news/${_id}`)
                .then( () => {
                    Vue.delete(this.news, _id);
                });

                this.update();
            },

            channelsRemove: function( _id ) {
                this.axios.delete( `/api/channels/${_id}`)
                .then ( () => {
                    Vue.delete(this.channels, _id);
                });
            },

            newsEdit: function( _id ) {
                let obj = Object.assign( {}, this.news[_id] );
                this.newPhoto = this.news[_id]["photo"];
                this.newsInput = obj;

                this.newsEditId = _id;
                this.update();
            },

            merger: function( news ) {
                for (let _new in news) {
                    for (let _name of news[_new]["mediachannels"]) {
                        if (_name === "") continue;
                        ID = null;
            
                        for (let channel in CHANNELS) {
                            let str1, str2;

                            if (typeof(_name) === 'string')
                                str1 = _name.toLowerCase();
                            if (typeof(CHANNELS[channel]["name"]) === 'string')
                                str2 = CHANNELS[channel]["name"].toLowerCase();
                        
                            if (str1 === str2) {
                                ID = channel;
                                break;
                            }
                        }

                        if (ID === null) {
                            let obj = {
                                name: _name,
                                news: []
                            }
        
                            obj.news.push(news[_new]);
                            CHANNELS.push(obj);
                        } else {
                            CHANNELS[ID]["news"].push(news[_new]);
                        }
                    }
                }

                this.channelsEdit();
            },

            channelsEdit: function() {
                for (let chan in CHANNELS) {
                    let str1, str2, id = null;

                    for (let el in this.channels) {
                        if (typeof(CHANNELS[chan]["name"]) === 'string')
                            str1 = CHANNELS[chan]["name"].toLowerCase();
                        if (typeof(this.channels[el]["name"]) === 'string')
                            str2 = this.channels[el]["name"].toLowerCase();

                        if (str1 === str2) {
                            id = el;
                            break;
                        }
                    }

                    if (id === null) {
                        axios.post(`/api/channels`, CHANNELS[chan])
                        .then( _response => {
                            if ( _response.data.ret === "OK") {
                                Vue.set(this.channels, _response.data.id, CHANNELS[chan]);
                            }
                        });
                    } else {
                        axios.put( `/api/channels/${id}`, CHANNELS[chan] );

                        if (CHANNELS[chan]["news"] === null) {
                            this.channelsRemove( id );
                        }
                    } 
                }

                for (let el in this.channels) {
                    let str1, str2, is = 0;

                    for (let chan in CHANNELS) {
                        if (typeof(CHANNELS[chan]["name"]) === 'string')
                            str1 = CHANNELS[chan]["name"].toLowerCase();
                        if (typeof(this.channels[el]["name"]) === 'string')
                            str2 = this.channels[el]["name"].toLowerCase();

                        is |= (str1 === str2);
                    }

                    if (is === 0) {
                        this.channelsRemove(el);
                    }
                }
            },

            newsCommit: function() {
                if ( this.newsEditId === null) {
                    // add
                    if (typeof(this.newsInput.keywords) === 'string') {
                        let helper = this.newsInput.keywords.split(/[ ,]+/);
                        this.newsInput.keywords = helper;
                    }

                    if (typeof(this.newsInput.mediachannels) === 'string') {
                        helper = this.newsInput.mediachannels.split(/[ ,]+/);
                        this.newsInput.mediachannels = helper;
                    }

                    let obj = Object.assign( {}, this.newsInput );
                    obj["photo"] = this.newPhoto;
                    
                    if (obj.content === null || obj.title === null || 
                        obj.data === null || obj.author === null) {
                        alert("Please complete all the text input data!");
                        return ;
                    }
                    axios.post(`/api/news`, obj)
                    .then( _response => {
                        if ( _response.data.ret === "OK") {
                            Vue.set(this.news, _response.data.id, obj);
                        }
                    });

                    this.newsInput = {
                        title: null,
                        date: null,
                        author: null,
                        photo: null,
                        content: null,
                        keywords: null,
                        mediachannels: null
                    }
                    this.newPhoto = "photos/no_image.svg";
                    this.update();
                    this.reset();
                } else {
                    // edit
                    
                    if (typeof(this.newsInput.keywords) === 'string') {
                        let helper = this.newsInput.keywords.split(/[,]+/);
                        this.newsInput.keywords = helper;
                    }

                    if (typeof(this.newsInput.mediachannels) === 'string') {
                        helper = this.newsInput.mediachannels.split(/[ ,]+/);
                        this.newsInput.mediachannels = helper;
                    }

                    for ( let k in this.newsInput )
                        this.news[this.newsEditId][k] = this.newsInput[k];
                    this.news[this.newsEditId]["photo"] = this.newPhoto;

                    if (this.news[this.newsEditId].content === null || this.news[this.newsEditId].title === null || 
                        this.news[this.newsEditId].data === null || this.news[this.newsEditId].author === null || 
                        this.news[this.newsEditId].content === "" || this.news[this.newsEditId].title === "" || 
                        this.news[this.newsEditId].data === "" || this.news[this.newsEditId].author === "") {
                        alert("Please complete all the text input data!");
                        return ;
                    }

                    axios.put( `/api/news/${this.newsEditId}`, this.news[this.newsEditId] );
                    this.newsEditId = null;
                    this.newsInput = {
                        title: null,
                        date: null,
                        author: null,
                        photo: null,
                        content: null,
                        keywords: null,
                        mediachannels: null
                    }
                    this.newPhoto = "photos/no_image.svg";

                    this.update();
                }

                this.channelsEdit(this.news);
            }
        },

        filters: {
        }
    });
});