import async from 'async';
import _ from 'lodash';

var syncScanUser = function (href) {
    var htmlData = $.ajax({
        method: 'GET',
        url: href,
        async: false
    }).responseText;

    var _sharedData = htmlData.match(/window._sharedData = (.*)\;<\/script\>/);
    var cookies = htmlData.match(/Set-Cookie: (.*);/);

    if (_sharedData !== null && _sharedData[1] !== null) {
        var obj = JSON.parse(_sharedData[1]);
        //console.log(obj);
        var user = obj.entry_data.ProfilePage[0].user;

        var nodes = user.media.nodes || [];
        var userId = user.id;
        var username = user.username;
        var has_next_page = (user.media.page_info) ? user.media.page_info.has_next_page : false;
        var end_cursor = (user.media.page_info) ? user.media.page_info.end_cursor : undefined;
        while (has_next_page) {
            var postData = "q=ig_user(" + userId + ")+%7B+media.after(" + end_cursor + "%2C+33)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";

            const queryURL = 'https://www.instagram.com/query/';
            var res = $.ajax({
                method: 'POST',
                headers: {
                    "x-instagram-ajax": 1,
                    "x-csrftoken": obj.config.csrf_token,
                    "content-type" : 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                url: queryURL,
                data: postData,
                async: false
            }).responseJSON;
            if (res) {
                nodes.push.apply(nodes, res.media.nodes);
                has_next_page = (res.media.page_info) ? res.media.page_info.has_next_page : false;
                end_cursor = (res.media.page_info) ? res.media.page_info.end_cursor : undefined;
            } else {
                has_next_page = false;
            }
        }

        var result = nodes.map(function (node) {
            if (node.is_video === true) {
                const href = 'https://www.instagram.com/p/' + node.code + '/?taken-by=' + username + '&__a=1';
                var video = getVideoSrc(href);
                node = _.extend(node, video);
            }
            var filename = username + '/' + getFileNameFromUrl(node.display_src);
            return {
                code: node.code,
                src: node.display_src,
                filename: filename,
                is_video: node.is_video
            }
        });
        return result;
    }
}
/*export default function (href) {
    console.warn('Begin scan....');
    async.waterfall([
        function (callback) {
            console.log('Query info of user...');
            var htmlData = $.ajax({
                method: 'GET',
                url: href,
                async: false
            }).responseText;
            var _sharedData = htmlData.match(/window._sharedData = (.*)\;<\/script\>/);
            var cookies = htmlData.match(/Set-Cookie: (.*);/);
            if (_sharedData !== null && _sharedData[1] !== null) {
                var obj = JSON.parse(_sharedData[1]);
                var user = obj.entry_data.ProfilePage[0].user;
                console.warn(user);
                callback(null, {
                    userId: user.id,
                    username: user.username,
                    nodes: user.media.nodes || [],
                    has_next_page: (user.media.page_info) ? user.media.page_info.has_next_page : false,
                    end_cursor: (user.media.page_info) ? user.media.page_info.end_cursor : undefined,
                    csrf_token: obj.config.csrf_token
                })
            } else {
                callback(null, null);
            }
        },
        function (userInfo, callback) {
            if (userInfo) {
                var has_next_page = userInfo.has_next_page;
                var end_cursor = userInfo.end_cursor;
                var page_ = 1;
                if (has_next_page) {
                    async.whilst(
                        function () {
                            return has_next_page === true;
                        },
                        function (callback) {
                            try{
                                var postData = "q=ig_user(" + userInfo.userId + ")+%7B+media.after(" + end_cursor + "%2C+33)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";
                                const queryURL = 'https://www.instagram.com/query/';
                                const referer = 'https://www.instagram.com/' + userInfo.username
                                var res = $.ajax({
                                    method: 'POST',
                                    headers: {
                                        "x-instagram-ajax": 1,
                                        "x-csrftoken": userInfo.csrf_token
                                    },
                                    url: queryURL,
                                    data: postData,
                                    async: false
                                }).responseJSON;
                                if(res.media){
                                    has_next_page = (res.media.page_info) ? res.media.page_info.has_next_page : false;
                                    end_cursor = (res.media.page_info) ? res.media.page_info.end_cursor : undefined;
                                    console.info(page_,res);
                                    page_++;
                                    callback(null, (res.media && res.media.nodes) ? res.media.nodes : []);
                                }
                            }catch(ex){
                                console.error(ex);
                            }
                        },
                        function (err, result) {
                            var _nodes = _.union(userInfo.nodes, result),
                                userInfo = _.pick(userInfo, ['userId', 'username']);
                            callback(null, _.extend(userInfo, {nodes: _nodes}));
                        }
                    )
                } else {
                    callback(null, userInfo);
                }
            } else {
                callback(null, null);
            }
        }
    ], function (err, results) {
        console.warn(results);
    })
}*/

function getVideoSrc(href) {
    var res = $.ajax({
        type: "GET",
        url: href,
        async: false
    }).responseJSON;
    return {
        display_src: res.media.video_url
    }
}

function getPathFromUrl(url) {
    return url.split(/[?#]/)[0];
}

function getFileNameFromUrl(url) {
    var path = getPathFromUrl(url);
    return path.split("/").pop();
}

function insertNodes(userId, nodes, cb) {
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var users = obj.InstagramWebTools.users.map(function (user) {
            if (user.id === userId) {
                user = _.extend(user, {nodes: nodes});
            }
            return user;
        });
        chrome.storage.local.set({InstagramWebTools: _.extend(obj.InstagramWebTools, {users: users})}, function () {
            cb(true);
        });
    })
}

function _syncScanUser(href) {
    var request = new XMLHttpRequest();
    request.open('GET', href, false);
    request.send(null);
    if (request.status === 200) {
        var htmlData = request.responseText;
        var _sharedData = htmlData.match(/window._sharedData = (.*)\;<\/script\>/);
        if (_sharedData !== null && _sharedData[1] !== null) {
            var obj = JSON.parse(_sharedData[1]);
            var user = obj.entry_data.ProfilePage[0].user;
            var nodes = user.media.nodes || [];
            var userId = user.id;
            var username = user.username;
            var has_next_page = (user.media.page_info) ? user.media.page_info.has_next_page : false;
            var end_cursor = (user.media.page_info) ? user.media.page_info.end_cursor : undefined;
            while (has_next_page) {
                var postData = "q=ig_user(" + userId + ")+%7B+media.after(" + end_cursor + "%2C+33)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";

                const queryURL = 'https://www.instagram.com/query/';
                request = new XMLHttpRequest();
                request.open('POST', queryURL, false);
                request.setRequestHeader("x-instagram-ajax", 1);
                request.setRequestHeader("x-csrftoken", obj.config.csrf_token);
                request.setRequestHeader("content-type", 'application/x-www-form-urlencoded; charset=UTF-8');
                request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                request.send(postData);
                if(request.status === 200){
                    var res = JSON.parse(request.responseText);
                    if (res) {
                        nodes.push.apply(nodes, res.media.nodes);
                        has_next_page = (res.media.page_info) ? res.media.page_info.has_next_page : false;
                        end_cursor = (res.media.page_info) ? res.media.page_info.end_cursor : undefined;
                    } else {
                        has_next_page = false;
                    }
                }else{
                    has_next_page = false;
                }

            }
            var result = nodes.map(function (node) {
                if (node.is_video === true) {
                    const href = 'https://www.instagram.com/p/' + node.code + '/?taken-by=' + username + '&__a=1';
                    var video = _getVideoSrc(href);
                    node = _.extend(node,video);
                }
                var filename = username + '/' + getFileNameFromUrl(node.display_src);
                return {
                    code: node.code,
                    src: node.display_src,
                    filename: filename,
                    is_video: node.is_video
                }
            });
            return result;
        }
    }
}

function _getVideoSrc(href) {
    var request = new XMLHttpRequest();
    request.open('GET', href, false);
    request.send(null);
    if (request.status === 200) {
        var res = JSON.parse(request.responseText);
        return {
            code: res.media.code,
            is_video: true,
            display_src: res.media.video_url
        }
    }
    return null;
}


module.exports = _syncScanUser;