onmessage = function (e) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var htmlData = request.responseText;
            var _sharedData = htmlData.match(/window._sharedData = (.*)\;<\/script\>/);
            if (_sharedData !== null && _sharedData[1] !== null) {
                var obj = JSON.parse(_sharedData[1]);
                var csrf_token = obj.config.csrf_token;
                var user = obj.entry_data.ProfilePage[0].user;
                var nodes = user.media.nodes || [];
                var userId = user.id;
                var username = user.username;
                var has_next_page = (user.media.page_info) ? user.media.page_info.has_next_page : false;
                var end_cursor = (user.media.page_info) ? user.media.page_info.end_cursor : undefined;

                function fetchNext(has_next_page, end_cursor, userId, csrf_token) {
                    if (!has_next_page) {
                        postMessage(nodes);
                        return;
                    }

                    var postData = "q=ig_user(" + userId + ")+%7B+media.after(" + end_cursor + "%2C+33)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";
                    var queryURL = 'https://www.instagram.com/query/';
                    var request = new XMLHttpRequest();
                    request.onreadystatechange = function () {
                        if (request.readyState == 4) {
                            if (request.status === 200) {
                                var res = JSON.parse(request.responseText);
                                nodes.push.apply(nodes, res.media.nodes);
                                has_next_page = (res.media.page_info) ? res.media.page_info.has_next_page : false;
                                end_cursor = (res.media.page_info) ? res.media.page_info.end_cursor : undefined;
                                fetchNext(has_next_page, end_cursor, userId, csrf_token);
                            } else {
                                fetchNext(false, null, null, null);
                            }
                        }
                    }
                    request.open('POST', queryURL);
                    request.setRequestHeader("x-instagram-ajax", 1);
                    request.setRequestHeader("x-csrftoken", csrf_token);
                    request.setRequestHeader("content-type", 'application/x-www-form-urlencoded; charset=UTF-8');
                    request.send(postData);
                }

                fetchNext(has_next_page, end_cursor, userId, csrf_token);
            }
        }
    }
    request.open('GET', e.data);
    request.send();
}

