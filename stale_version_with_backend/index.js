const express = require('express')
const app = express()
const port = 3377
var bodyParser = require("body-parser");

var routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use('/public', express.static(__dirname + '/public'));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"))

app.post('/api/smiles_to_sdf', routes.api.smiles_to_sdf);

app.post('/api/new_compound', routes.api.new_compound);
// app.get('/api/sdf', routes.api.sdf)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
