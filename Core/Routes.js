const Path = require('path');
const BlockchainWS = require(Path.resolve('Core/Modules/Blockchain'));
const Database = require(Path.resolve('Core/Modules/Database'));
const User = require(Path.resolve('Core/Modules/User'));
const BCws = new BlockchainWS();
const DB = new Database({
    // Database connection info
    db: 'NerdPay'
});

module.exports = function (app) {

    app.get('/', function (req, res) {
        console.log(req.session.id);
        var vars = {
            title: 'Welcome to NerdPay!',
            toWallet: 'jfsaoiu34985ujosdikfjlksdmf',
            user: undefined
        }
        if (typeof req.session.id != 'undefined') {
            vars.user = req.session.user;
        }
        res.render('index', vars);
    });
    app.get('/login', function (req, res) {
        res.render('login', {
            err: req.query.e,
            title: 'Welcome to NerdPay!',
            toWallet: 'jfsaoiu34985ujosdikfjlksdmf',
            user: undefined
        });
    });
    app.get('/signup', function (req, res) {
        res.render('signup', {
            err: req.query.e,
            title: 'NerdPay: Sign Up',
            toWallet: 'jfsaoiu34985ujosdikfjlksdmf',
            user: undefined
        });
    });
    app.get('/profile', function (req, res) {
        User.permissions
        res.render('userProfile', {
            userID: req.query.u,
            title: 'NerdPay: <Username>',
            user: undefined
        });
    });
    app.get('/logout', function (req, res) {
        req.session.destroy(() => {
            req.session = null;
            res.redirect('/');
        });
    });
    app.post('/login/process', function (req, res) {
        DB.connect().then(() => {
            
            // Check username and password
            var user = new User.User();
            user.login({ username: req.body.username, password: req.body.password }).then((success) => {
                if (success) {
                    req.session.loggedIn = true;
                    req.session.user = user;
                    res.redirect('/profile?u='+user.id);
                } else {
                    res.redirect('/login?e=wrong');
                }
            });
        }).catch((err) => {console.log(err.message)});
    });
    app.get('/order', function (req, res) {
        if (typeof req.query.id === 'undefined') {
            res.send("What order?!", 404);
            return;
        }
        DB.connect().then(() => {
            DB.getSetting('master_wallet_address')
                .then((pass) => {
                    BCws.watchAddress(req.session.user.walletAddress);   
                    var template_data = {
                        user: req.session.user,
                        title: 'NerdPay! Order #12345',
                        order_id: '12345',
                        items: [
                            { name: 'One Month of Flow Stratagy', quantity: 1, price: 0.10 },
                            { name: 'One Month of Lambot Premium Subscription', quantity: 6, price: 0.05 },
                        ],
                        total: { btc: 0.0, usd: 0.00 },
                        toWallet: req.session.user.walletAddress
                    };
                    
                    template_data.items.forEach((item, i) => {
                        template_data.total.usd += item.price * item.quantity;
                    });
                    BCws.getBTCPrice().then((val) => {
                        template_data.total.btc = template_data.total.usd / val;
                        res.render('invoice', template_data);
                    });
                })
                .catch((err) => { console.log(err.message); });
        })
    });
    
    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('*', function(req, res){
        res.status(404).send('Da fuck is this?!');
    });
  
}