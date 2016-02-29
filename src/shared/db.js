import _ from 'lodash';

var db = {}

db.initUser = function(userId, cb){
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var users = obj.InstagramWebTools.users;
        var _user = _.find(users, function(user){return user.id === userId});
        if(_user){
            users = _.map(users, function(user){
                if(user.id === userId){
                    user = _.extend(user, {nodes : [],status : 'request'});
                }
                return user;
            })
        }else{
            users.push({
                id : userId,
                nodes : [],
                status : 'request'
            })
        }
        //console.warn(users);
        chrome.storage.local.set({InstagramWebTools: _.extend(obj.InstagramWebTools, {users: users})}, function () {
            cb(true);
        });
    })
}

db.insertUser = function(userId, nodes, status, cb) {
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var users = obj.InstagramWebTools.users.map(function (user) {
            if (user.id === userId) {
                user = _.extend(user, {nodes: _.union(user.nodes, nodes), status: status});
            }
            return user;
        });

        chrome.storage.local.set({InstagramWebTools: _.extend(obj.InstagramWebTools, {users: users})}, function () {
            cb(true);
        });
    })
}

db.removeUser = function(userId, cb){
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var users = _.filter(obj.InstagramWebTools.users, function(user){ return user.id !== userId});
        chrome.storage.local.set({InstagramWebTools: _.extend(obj.InstagramWebTools, {users: users})}, function () {
            cb(true);
        });
    })
}

db.findUserById = function(userId, cb){
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var users = obj.InstagramWebTools.users;
        var _user = _.find(users, function(user){return user.id === userId});
        cb(_user);
    })
}

module.exports = db;