const Path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();

app.set('views', Path.join(__dirname, '/Core/Theme/'));
app.use(express.urlencoded());
app.use(express.json());
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));
app.use(express.static('Core/Theme/'));
app.set('view engine', 'ejs');
var routes = require('./Core/Routes')(app);
app.listen(3000, function () {
    console.log(`NerdPay Server\n     Started up on http://localhost:3000/`);
});