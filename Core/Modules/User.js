const crypto = require('crypto');
const Database = require('./Database');
const DB = new Database({ db: 'NerdPay' });

const Permissions = {
    CREATEORDER: 1,
    DELETEORDER: 2,
    MODIFYORDER: 4,
    MODIFYSETTINGS: 8,
    VIEWORDER: 16
};
const Permission = {
    UNKNOWN: 0,
    USER: Permissions.VIEWORDER,
    MERCHANT: Permissions.VIEWORDER | Permissions.CREATEORDER | Permissions.DELETEORDER | Permissions.MODIFYORDER,
    ADMIN: Permissions.VIEWORDER | Permissions.CREATEORDER | Permissions.DELETEORDER | Permissions.MODIFYORDER | Permissions.MODIFYSETTINGS
};
//Make em immutable
Object.freeze(Permission);
Object.freeze(Permissions);

class User {
    constructor() {
        this.id = undefined;
        this.username = null;
        this.loggedIn = false;
        this.walletAddress = null;
        this.orders = [];
        this.settings = {};
        this.permmask = null;
    }
    login({ username = null, password = null } = { username: null, password: null }) {
        var self = this;
        return new Promise(function (success, reject) {
            DB.connect().then(() => {
                DB.tables.users.findOne({ name: username }, {}, (err, res) => {
                    if (res) {
                        var hash = crypto.pbkdf2Sync(password, res.salt,  
                            1000, 64, `sha512`).toString(`hex`); 
                        if (hash === res.password) {
                            self.username = res.name;
                            self.loggedIn = true;
                            self.permmask = res.permissions;
                            self.walletAddress = res.walletAddress;
                            self.id = res._id;
                            success(true);
                        }
                        else {
                            success(false);
                        }
                    }
                    else {
                        success(false);
                    }
                });
            });
        });
    }
    logout(session) { 
        session.destroy();
     }
    update() { /* TODO */ }
    isLoggedIn() { return this.loggedIn; }
    static create(
        { username = null, password = null, walletAddress = null, perms = 0 } =
        { username: null, password: null, walletAddress: null, perms: 0 }) {
        var salt = crypto.randomBytes(16).toString('hex'); 
        var hash = crypto.pbkdf2Sync(password, salt,  
            1000, 64, `sha512`).toString(`hex`); 
        var model = {
            name: username,
            password: hash,
            walletAddress: walletAddress,
            permissions: perms,
            salt: salt
        };
        return new Promise(function (success, reject) {
                DB.connect().then(() => 
                {
                    DB.tables.users.countDocuments({ name: model.name }, {}, (err, count) => {
                        if (!count && !err) {
                            DB.tables.users.insertOne(model, function (err, res) {
                                if (err) { reject(err); }
                                else { success(res.insertedId); DB.close(); }
                            });
                        }
                        else if (err) {
                            if (err) { reject(err); }
                            DB.close();
                        }
                        else {
                            reject(new Error('Username: ' + model.name + ' is not unique. It already exists in the database.'));
                            DB.close();
                        }
                    });
                });
            });
        }
}
exports.User = User;
exports.UserTypes = Permission;
exports.Permissions = Permissions;