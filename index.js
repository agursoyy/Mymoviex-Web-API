// FileName: index.js
// Import express
let express = require('express')
let apiRoutes = require("./api-routes")
let bodyParser = require("body-parser");
let mongoose = require('mongoose');
var cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();

// Initialize the app
let app = express();
app.use(cors());
// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
 }));
app.use(bodyParser.json());
// Setup server port
var port = process.env.PORT || 5000;
// Send message for default URL
//app.get('/', (req, res) => res.send('Hello World with Express'));
app.use('/api',apiRoutes);
// Launch app to listen to specified port

//mongoose.connect('mongodb://localhost/mymoviex', { useNewUrlParser: true,useCreateIndex: true});
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true,useCreateIndex: true});
console.log(process.env.PORT);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Db connected successfully")
});
app.listen(port, function () {
     console.log("Running RestHub on port " + port);
});
module.exports = app;