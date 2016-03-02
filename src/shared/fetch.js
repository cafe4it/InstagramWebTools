import async from 'async';
import _ from 'lodash';
import utils from './utils.js';

function __scanUser(href) {
    var deferred = $.Deferred();
    $.ajax({
        method: 'GET',
        url: href,
        success: function (htmlData, status, jqXHR) {
            var _sharedData = htmlData.match(/window._sharedData = (.*)\;<\/script\>/);
            if (_sharedData !== null && _sharedData[1] !== null) {
                var obj = JSON.parse(_sharedData[1]);
                var user = obj.entry_data.ProfilePage[0].user;
                var nodes = user.media.nodes || [];
                var userId = user.id;
                var username = user.username;
                var has_next_page = (user.media.page_info) ? user.media.page_info.has_next_page : false;
                var end_cursor = (user.media.page_info) ? user.media.page_info.end_cursor : undefined;

                function fetchNext(has_next_page, end_cursor, userId, csrf_token) {
                    if (!has_next_page) {
                        var nodes_video = _.filter(nodes, function (node) {
                            return node.is_video === true
                        });
                        var nodes_photo = [];
                        _.each(nodes, function (node) {
                            if (node.is_video === false) {
                                var filename = username + '/' + utils.getFileNameFromUrl(node.display_src);
                                nodes_photo.push({
                                    code: node.code,
                                    src: node.display_src,
                                    filename: filename,
                                    is_video: node.is_video
                                });
                            }
                        })
                        async.parallel([
                            function (callback) {
                                var status = (nodes_video.length > 0) ? 'request' : 'completed';
                                chrome.runtime.sendMessage({action : 'DB_insertUser',
                                    data : {
                                        userId : href,
                                        nodes : nodes_photo,
                                        status : status
                                    }
                                },function(res){
                                    //console.info('insert photos', res);
                                    callback(null, res);
                                })
                            },
                            function (callback) {
                                if (nodes_video.length > 0) {
                                    async.concat(nodes_video, function (node, callback) {
                                        const href = 'https://www.instagram.com/p/' + node.code + '/?taken-by=' + username + '&__a=1';
                                        $.ajax({
                                            method: 'GET',
                                            url: href,
                                            success: function (data, status, jqXHR) {
                                                var filename = username + '/' + utils.getFileNameFromUrl(data.media.video_url);
                                                callback(null, {
                                                    code: data.media.code,
                                                    src: data.media.video_url,
                                                    is_video: true,
                                                    filename: filename
                                                });
                                            }
                                        })
                                    }, function (err, results) {
                                        chrome.runtime.sendMessage({action : 'DB_insertUser',
                                            data : {
                                                userId : href,
                                                nodes : results,
                                                status : 'completed'
                                            }
                                        },function(res){
                                            //console.info('insert videos', res);
                                            callback(null, res);
                                        })
                                    });
                                } else {
                                    callback(null, true);
                                }
                            }
                        ], function (err, results) {
                            deferred.resolve(true);
                        })


                        return;
                    }
                    ;
                    var postData = "q=ig_user(" + userId + ")+%7B+media.after(" + end_cursor + "%2C+33)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";

                    const queryURL = 'https://www.instagram.com/query/';
                    $.ajax({
                        method: 'POST',
                        headers: {
                            "x-instagram-ajax": 1,
                            "x-csrftoken": csrf_token,
                            "content-type": 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        url: queryURL,
                        data: postData,
                        success: function (res, status, jqXHR) {
                            if (res) {
                                nodes.push.apply(nodes, res.media.nodes);
                                has_next_page = (res.media.page_info) ? res.media.page_info.has_next_page : false;
                                end_cursor = (res.media.page_info) ? res.media.page_info.end_cursor : undefined;
                                fetchNext(has_next_page, end_cursor, userId, csrf_token);
                            } else {
                                fetchNext(false, null, null, null);
                            }
                        }
                    })
                }

                fetchNext(has_next_page, end_cursor, userId, obj.config.csrf_token);

            } else {
                deferred.resolve(null);
            }
        }
    });

    deferred.promise().done(function(results){
        console.log('Result', results);
    });
}

module.exports = __scanUser;