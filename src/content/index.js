import Clipboard from 'clipboard';
import _ from 'lodash';

import '../shared/reset.css';
import './index.css';

var _IS_DETAIL_PAGE = false;
var _IS_USER_PAGE = false;
const icons = [
    {
        id: 'contextMenu_SaveAs',
        path: require('../icons/contextmenu_saveas.png')
    }, {
        id: 'contextMenu_CopyURL',
        path: require('../icons/contextmenu_copyurl.png')
    }, {
        id: 'contextMenu_OpenInNewTab',
        path: require('../icons/contextmenu_openinnewtab.png')
    }, {
        id: 'contextMenu_ShareToTumblr',
        path: require('../icons/contextmenu_sharetotumblr.png')
    }
]

$(document).on('ready', function () {
//Clipboard
    //isDetailPage(window.location.href);
    var btnClipboard = document.createElement('button');
    btnClipboard.id = 'btnClipboard';
    btnClipboard.style.cssText = 'display : none!important;width : 0px !imporant; height : 0px !important;';
    document.body.appendChild(btnClipboard);
    new Clipboard('#btnClipboard');
//Clipboard

//SaveAs
    /*    var btnSaveAs = document.createElement('a');
     btnSaveAs.id = 'btnSaveAs';
     btnSaveAs.style.cssText = 'display : none!important;width : 0px !imporant; height : 0px !important;';
     document.body.appendChild(btnSaveAs);
     $(btnSaveAs).on('click', debounce(function (event) {
     console.log('download.')
     }, 500));*/

    $(document.body).on('mouseenter', 'a._8mlbc,article > div._22yr2, div._rudo5, a._c2kdw', function (e) {
        var context = $(this).parent().context;
        var elem = (!$(context).hasClass('_c2kdw')) ? context : $(this).parent();
        //if($(elem).find('._1lp5e').length > 0) return; //video
        showMenuContext(elem);
        //chrome.runtime.sendMessage({elem : e.target});
    })
})


/*----Extend------*/
String.prototype.replaceArray = function (find, replace) {
    var replaceString = this;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
};

function getPathFromUrl(url) {
    return url.split(/[?#]/)[0];
}

function getExtensionFromUrl(url) {
    return (/[.]/.exec(url)) ? /[^.]+$/.exec(url) : undefined;
}

function getFileNameFromUrl(url) {
    var path = getPathFromUrl(url);
    return path.split("/").pop();
}

function validateMediaSrc(mediaUrl) {
    var _filter_find = ['/s640x640', '/s750x750'],
        _filter_replace = ['', ''];
    return mediaUrl.replaceArray(_filter_find, _filter_replace);
}

function getMediaSrc(elem) {
    var rs = $(elem).find('img[id^="pImage_"], video');
    //console.warn(rs);
    if (rs.length > 0) {
        var _media = rs[0],
            _mediaSrc = $(_media).attr('src'),
            _mediaType = $(rs[0]).is('video') ? 'VIDEO' : 'IMAGE' || null;

        if (_mediaSrc) {
            _mediaSrc = validateMediaSrc(_mediaSrc);
            return {
                _mediaSrc: _mediaSrc,
                _mediaType: _mediaType,
                _mediaName: getFileNameFromUrl(_mediaSrc)
            }
        }
    }
    return null;
}

function throttle(func, interval) {
    var lastCall = 0;
    return function () {
        var now = Date.now();
        if (lastCall + interval < now) {
            lastCall = now;
            return func.apply(this, arguments);
        }
    };
}

function debounce(func, interval) {
    var lastCall = -1;
    return function () {
        clearTimeout(lastCall);
        var args = arguments;
        lastCall = setTimeout(function () {
            func.apply(this, args);
        }, interval);
    };
}

function getVideoUrl(postUrl) {
    var defer = $.Deferred();
    defer.then(function () {
        appAPI.request.get({
            url: postUrl,
            onSuccess: function () {

            }
        })
    })
}

function showMenuContext(elem) {
    var _mediaSrc = null, _mediaType = null;
    if ($(elem).find('._1lp5e').length > 0) {
        var postUrl = ($(elem).is('a')) ? $(elem).attr('href') : null;
        var res = $.ajax({
            type: "GET",
            url: postUrl + '&__a=1',
            async: false
        }).responseText;
        res = $.parseJSON(res);
        if (res.media && res.media.is_video === true) {
            _mediaSrc = res.media.video_url;
            _mediaType = 'VIDEO';
        }
    } else {
        var rs = getMediaSrc(elem);
        if (rs) {
            _mediaSrc = rs._mediaSrc;
            _mediaType = rs._mediaType;
        }
    }


    if ((_mediaSrc && _mediaType) === false) return;

    addToolsPerMedia(elem, _mediaSrc, _mediaType);

    chrome.runtime.sendMessage({
        action: 'show-contextMenuInstagram',
        data: {
            src: _mediaSrc,
            type: _mediaType
        }
    });

    //console.info(_mediaSrc, _mediaType);

    if (_IS_DETAIL_PAGE) {
        $('#btnClipboard').attr('data-clipboard-text', _mediaSrc);
        //$('#btnSaveAs').attr({'href' :  _mediaSrc, 'download' : getFileNameFromUrl(_mediaSrc)});
    } else {
        $(elem).on('contextmenu', function () {
            $('#btnClipboard').attr('data-clipboard-text', _mediaSrc);
            //$('#btnSaveAs').attr({'href' :  _mediaSrc, 'download' : getFileNameFromUrl(_mediaSrc)});
        })
    }


    $(elem).mouseleave(function () {
        //$('#btnClipboard').attr('data-clipboard-text', null);
        //$('#btnSaveAs').attr({'download' :  null,'href' : null});
        /*var tools = $(elem).find('div.InstagramWebTool')[0];
         if (tools) elem.removeChild(tools);*/
        removeMenuContext();
    })

}

function addToolsPerMedia(elem, _mediaSrc, _mediaType) {
    if ($(elem).find('div.InstagramWebTools').length <= 0) {
        var div = document.createElement('div');
        div.setAttribute('class', 'reset-this InstagramWebTools');
        var subTitle = (_mediaType === 'VIDEO') ? chrome.i18n.getMessage('typeVideo') : chrome.i18n.getMessage('typeImage');
        var buttons = ['contextMenu_SaveAs', 'contextMenu_CopyURL', 'contextMenu_OpenInNewTab','contextMenu_ShareToTumblr'];
        if(_mediaType === 'VIDEO') buttons = ['contextMenu_SaveAs', 'contextMenu_CopyURL', 'contextMenu_OpenInNewTab'];
        buttons.map(function (ii, i) {
            var tooltip = chrome.i18n.getMessage(ii, subTitle);
            var link = document.createElement('a');
            var img = document.createElement('img');
            img.setAttribute('src', icons[i].path);
            link.setAttribute('class', 'tooltip-bottom tools');
            link.setAttribute('data-tooltip', tooltip);
            link.setAttribute('data-button', ii);
            //img.setAttribute('style', 'width : 19px; height : 19px; z-index : 9999');
            link.appendChild(img);
            div.appendChild(link);
            $(link).on('click', function (e) {
                e.preventDefault();
                var button = $(this).data('button');
                var action = '';
                switch (button) {
                    case 'contextMenu_SaveAs':
                        action = 'download-Media';
                        break;
                    case 'contextMenu_CopyURL':
                        $('#btnClipboard').attr('data-clipboard-text', _mediaSrc);
                        action = 'copy-Media';
                        break;
                    case 'contextMenu_OpenInNewTab':
                        action = 'open-Media';
                        break;
                    case 'contextMenu_ShareToTumblr':
                        shareToTumblr(_mediaSrc,'');
                        break;
                }
                chrome.runtime.sendMessage({
                    action: action
                });
            })
        })
        /*        var button = document.createElement('img');
         button.setAttribute('class', 'reset-this button_DownloadThis');
         button.setAttribute('src', require('../icons/download-icon-18x18.png'));*/
        var wrapper = $(elem).find('div._sppa1')[0];
        if (wrapper) {
            wrapper.appendChild(div);
            /*var firstChild = wrapper.childNodes[0];
             wrapper.insertBefore(button, firstChild);*/
        }
    }
}

function removeMenuContext() {
    chrome.runtime.sendMessage({action: 'remove-contextMenuInstagram'});
}

function isDetailPage(href) {
    var detailPageRegex = /instagram\.com\/p\//g,
        userPageRegex = /instagram\.com\/[\w\.]+\/$/g;
    _IS_DETAIL_PAGE = detailPageRegex.test(href);
    _IS_USER_PAGE = userPageRegex.test(href);
    chrome.runtime.sendMessage({
        action: 'isDetailPage', data: {
            isDetailPage: _IS_DETAIL_PAGE,
            isUserPage: _IS_USER_PAGE
        }
    });
    if (_IS_DETAIL_PAGE) {
        var rs = getMediaSrc('article._j5hrx');
        if (rs && rs._mediaSrc !== null && rs._mediaType !== null) {
            chrome.runtime.sendMessage({
                action: 'update-Media',
                data: {
                    src: rs._mediaSrc,
                    type: rs._mediaType
                }
            });
        } else {
            //1 vai truong hop co loi, ko lay duoc du lieu...
            chrome.runtime.sendMessage({action: 'hidePageAction'});
        }
    }

    if (_IS_USER_PAGE) {
        if ($('#InstagramWebTools').length > 0) return;
        var div = document.createElement('div');
        div.id = 'InstagramWebTools';
        div.setAttribute('class', 'reset-this');
        ['button_DownloadAll', 'button_DownloadImages', 'button_DownloadVideos'].map(function (i) {
            var button = document.createElement('button');
            button.textContent = chrome.i18n.getMessage(i);
            button.setAttribute('class', '_k2yal _csba8 _i46jh _nv5lf');
            button.id = i;
            div.appendChild(button);
        });

        var header = $('article > header')[0];
        header.parentNode.insertBefore(div, header.nextSibling);
        var a = document.createElement('a');
        a.setAttribute('style','display:none!important');
        a.id = '640684';
        header.parentNode.insertBefore(a, div.nextSibling);
        if (window.AED_SHOW) {
            window.AED_SHOW({wid: '640684',shortkey:'qRzBeqbMb', size:'468x60', custom:{}});
        } else {
            window.AED_ONLOAD = window.AED_ONLOAD || [];
            window.AED_ONLOAD.push({wid:'640684',shortkey:'qRzBeqbMb',size:'468x60',custom:{}});
            if (!document.getElementById("ae-ad-script-$")) {
                var s = document.createElement("script"),
                    h = document.getElementsByTagName("head")[0];
                s.id = 'ae-ad-script-$';
                s.charset = "utf-8";
                s.async = !0;
                s.src = "https://i.alicdn.com/ae-game/thirdparty/show-window/index.js";
                h.insertBefore(s, h.firstChild)
            }
        }
    }
}
/*----Extend------*/

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'tabUpdated') {
        setTimeout(function () {
            isDetailPage(window.location.href);
        }, 100);
    } else if (msg.action === 'copyURL') {
        if (!$('#btnClipboard').attr('data-clipboard-text')) return;
        $('#btnClipboard').click();
    } else if (msg.action === 'popup_AskUser' && _IS_USER_PAGE) {
        sendResponse({username: window.location.pathname.match(/[\w\.]+/g)[0] || ''});
    }
});

function queryUsername() {

    var userUrl = window.location.href;
    var htmlData = $.ajax({
        method: 'GET',
        url: userUrl,
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
        var has_next_page = (user.media.page_info) ? user.media.page_info.has_next_page : false;
        var end_cursor = (user.media.page_info) ? user.media.page_info.end_cursor : '';
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

        console.log('total', nodes.length);
    }
}

function shareToTumblr(href, title){
    var d = document,
        w = window,
        e = w.getSelection,
        k = d.getSelection,
        x = d.selection,
        s = (e ? e() : (k) ? k() : (x ? x.createRange().text : 0)),
        f = 'https://www.tumblr.com/widgets/share/tool',
        l = d.location,
        e = encodeURIComponent,
        p = '?url=' + e(href) + '&title=' + e(title) + '&selection=' + e(s) + '&shareSource=bookmarklet',
        u = f + p,
        sw = 0,
        sd;
    try {
        sd = d.createElement('div');
        sd.style.height = '100px';
        sd.style.width = '100px';
        sd.style.overflow = 'scroll';
        d.body.appendChild(sd);
        sw = sd.offsetWidth - sd.clientWidth;
        d.body.removeChild(sd);
    } catch (z) {};
    try {
        if (!/^(.*\.)?tumblr[^.]*$/.test(l.host)) throw (0);
        tstbklt();
    } catch (z) {
        var a = function() {
            if (!w.open(u, '_blank', 'toolbar=0,resizable=0,status=1,scrollbars=1,width=' + (540 + sw) + ',height=600')) l.href = u;
        };
        setTimeout(a, 10);
    }
}

function shareToFacebook(href, title){
    var d = document,
        f = 'https://www.facebook.com/share',
        l = d.location,
        e = encodeURIComponent,
        p = '.php?src=bm&v=4&i=1456309156&u=' + e(href) + '&t=' + e(title);
    1;
    try {
        if (!/^(.*\.)?facebook\.[^.]*$/.test(l.host)) throw (0);
        share_internal_bookmarklet(p)
    } catch (z) {
        var a = function() {
            if (!window.open(f + 'r' + p, 'sharer', 'toolbar=0,status=0,resizable=1,width=626,height=436')) l.href = f + p
        };
        if (/Firefox/.test(navigator.userAgent)) setTimeout(a, 0);
        else {
            a()
        }
    }
}