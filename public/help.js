window.addEventListener( 'load' , function() {
  Vue.prototype.axios = axios;
  let app = new Vue( {
    el: '#app',
    data: {
      currency: {},
      input: {
        Date: null,
        USD: null,
        EUR: null
      },
      editId: null
    },
    created: function() {
      this.axios.get( '/api/currency' )
        .then( (_response) => {
          this.currency = _response.data.data;
        } );
    },

    methods: {
      remove: function( _id ) {
        this.axios.delete( `/api/currency/${_id}` )
          .then( () => {
            Vue.delete( this.currency , _id );
          } );
      },
      edit: function( _id ) {
        let io = Object.assign( {} , this.currency[_id] );
        this.input = io;
        this.editId = _id;
      },
      commit: function() {
        if ( this.editId === null ) {
          // add
          let oo = Object.assign( {} , this.input );
          axios.post( '/api/currency' , oo )
            .then( _response => {
              if ( _response.data.ret === "OK" ) {
                Vue.set( this.currency , _response.data.id , oo );
              }
            } );
        } else {
          // edit
          for ( let k in this.input ) {
            this.currency[this.editId][k] = this.input[k];
          }
          axios.put( `/api/currency/${this.editId}` , this.currency[this.editId] );
          this.editId = null;
          this.input = {
            Date: null,
            EUR: null,
            USD: null
          }
        }
      }
    },

    filters: {
      number: function( _in ) {
        return Number(_in).toFixed(2)
      }
    }
  } );
} );
