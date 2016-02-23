import 'purecss/build/base.css';
import 'purecss/build/buttons.css';
import 'shared/page.css';
import _ from 'lodash';

var _CURRENT_USERNAME = null;

$(document).ready(function(){
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action : 'popup_AskUser'},function(res){
            _CURRENT_USERNAME = res.username;
        })
    });


    $('#btnDownloadAll').click(function(e){
        //queryUsername();
    })
});

function queryUsername(){
    if(_CURRENT_USERNAME === null || _CURRENT_USERNAME === '') return;

    var userUrl = 'https://www.instagram.com/' + _CURRENT_USERNAME;
    var htmlData = $.ajax({
        method : 'GET',
        url : userUrl,
        async: false
    }).responseText;

    var _sharedData = htmlData.match(/window._sharedData = (.*)\;<\/script\>/);
    var cookies = htmlData.match(/Set-Cookie: (.*);/);

    if(_sharedData !== null && _sharedData[1] !== null){
        var obj = JSON.parse(_sharedData[1]);
        var user = obj.entry_data.ProfilePage[0].user;

        var postData = "q=ig_user("+user.id+")+%7B+media.after("+user.media.page_info.end_cursor+"%2C+50)+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow";
        //console.log('data', postData);
        const queryURL = 'https://www.instagram.com/query/';
        var res = $.ajax({
            method: 'POST',
            url : queryURL,
            data : postData,
            async : false
        }).responseJSON;
        console.info(res);
    }
}