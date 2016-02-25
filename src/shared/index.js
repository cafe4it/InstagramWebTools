export default function (href) {
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

        var nodes = user.media.nodes;
        var userId = user.id;
        var username = user.username;
        var has_next_page = user.media.page_info.has_next_page;
        var end_cursor = user.media.page_info.end_cursor;
        while (has_next_page) {
            var postData = "q=ig_user(" + userId + ")+%7B+media.after(" + end_cursor + "%2C+33)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";

            const queryURL = 'https://www.instagram.com/query/';
            var res = $.ajax({
                method: 'POST',
                headers: {
                    "x-instagram-ajax": 1,
                    "x-csrftoken": obj.config.csrf_token
                },
                url: queryURL,
                data: postData,
                async: false
            }).responseJSON;
            if (res) {
                nodes.push.apply(nodes, res.media.nodes);
                has_next_page = res.media.page_info.has_next_page;
                end_cursor = res.media.page_info.end_cursor;
            } else {
                has_next_page = false;
            }
        }

        return nodes.map(function (node) {
            if(node.is_video === true){
                const href = 'https://www.instagram.com/p/'+node.code+'/?taken-by='+username+'&__a=1';
                var video = getVideoSrc(href);
                node = _.extend(node, video);
            }
            var filename = username + '/' + getFileNameFromUrl(node.display_src);
            return {
                code: node.code,
                src: node.display_src,
                filename : filename,
                is_video: node.is_video
            }
        });
    }
}

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