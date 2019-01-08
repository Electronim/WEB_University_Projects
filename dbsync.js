const fs = require('fs');

module.exports = {
  load: () => {
    let content = {};
    try {
      content = JSON.parse( fs.readFileSync('./my.json') );
    } catch (err) {
      console.log( 'Empty db file' );
    }
    return content;
  },
  save: _content => {
    fs.writeFile('./my.json' , JSON.stringify(_content) , () => {} )
  }
}
