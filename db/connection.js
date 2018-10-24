const mongoose = require('mongoose');
const mongoDbUri = 'mongodb://root:root123@ds123963.mlab.com:23963/issue-tracker-2018';
mongoose.connect(mongoDbUri, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', function() {
    console.log(mongoDbUri, "connection error!");
});
db.once('open', function() {
  console.log(mongoDbUri, "conneced!");
});