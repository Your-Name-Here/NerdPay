var MongoClient = require('mongodb').MongoClient;

class Database {
    constructor(params) {
        var self = this;

        this.db = undefined;
        this.dbo = undefined;        
        this.dbname = params.db;
        this.tables = {
            users: undefined,
            roles: undefined,
            addresses: undefined
        }
        
    }
    connect() {
        var url = 'mongodb://localhost:27017/';
        var self = this;

        // Connect to the db
        return new Promise(function (success, reject) {
            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
                if (err) { reject(err); }
                self.dbo = db.db(self.dbname);
                self.db = db;
                self.tables.users = self.dbo.collection("Users");
                self.tables.addresses = self.dbo.collection("Addresses");
                self.tables.roles = self.dbo.collection("Roles");
                self.tables.settings = self.dbo.collection("Settings");
                success();
            });
        });
    }
    /**
     * Closes the database connection
     */
    close() {
        this.db.close();
    }
    /**
     * Fetch all users in the user table
     * @returns {Promise} Array containing all of the users.
     */
    getAllUsers() {
        var self = this;
        return new Promise(function (success, reject) {
            self.tables.users.find({}).toArray(function (err, result) {
            
                if (err) { reject(err); }

                success(result);
            });
         });
    }
    /**
     * Add a user to the database
     * @param {Object} opts The user Object. Requires name and role properties.
     * @param {string} opts.name The user name.
     * @param {string} opts.role The user role.
     * @returns {Promise} Array containing the user row. 
     */
    insertUser(opts) {
        var self = this;
        var user = { name: opts.name, role: opts.role };
        return new Promise(function (success, reject) {
            self.tables.users.insertOne(user, function (err, res) {
                if (err) { reject(err); }
                success(res);
            });
        });
    }
    /**
     * Get a setting value from the database
     * @param {string} val The name of the setting
     * @returns {Object}
     */
    getSetting(val) {
        var query = { name: val };
        var self = this;
        return new Promise(function (success, reject) {
            self.tables.settings.find(query).toArray(function (err, result) {
                if (err) { reject(err); }
                success(result);
            });
        });
    }
    /**
     * Set a setting value in the database, or insert it into the settings table if it doesnt exist. 
     * @param {Object} query The setting object, requires name and value properties.
     * @param {string} query.name The name of the setting
     * @param {*} query.value The value of the setting
     * @returns {Promise} [Promise] enum | 1 = Updated user, 2 = Insert new user
     */
    setSetting(query) {
        var self = this;
        return new Promise(function (success, reject) {
            self.tables.settings.find({name: query.name}).toArray(function (err, result) {
                if (err) {
                    reject(err);
                }
                if (result.length > 0) { // Setting exists, update it
                    var newvalues = { $set: { value: query.value } };
                    self.tables.settings.updateOne({name: query.name}, newvalues, function(err, res) {
                        if (err) throw err;
                        success(1);
                      });
                } else { // Insert it
                    self.tables.settings.insertOne({name: query.name, value: query.value}, function(err, res) {
                        if (err) throw err;
                        success(2);
                      });
                }
            });
        });
    }
    
}
module.exports = Database;