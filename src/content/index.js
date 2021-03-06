import Clipboard from 'clipboard';

var _IS_DETAIL_PAGE = false;


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
        //console.log(elem,e.target);
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

        if(_mediaSrc){
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
            _mediaSrc = rs._mediaSrc,
                _mediaType = rs._mediaType
        }
    }

    if ((_mediaSrc && _mediaType) === false) return;
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
        removeMenuContext();
    })

}

function removeMenuContext() {
    chrome.runtime.sendMessage({action: 'remove-contextMenuInstagram'});
}

function isDetailPage(href){
    var detailPageRegex = /instagram\.com\/p\//g;
    _IS_DETAIL_PAGE = (href.match(detailPageRegex) !== null);
    chrome.runtime.sendMessage({action : 'isDetailPage', data : _IS_DETAIL_PAGE});
    if(_IS_DETAIL_PAGE){
        var rs = getMediaSrc('article._j5hrx');
        if (rs && rs._mediaSrc !== null && rs._mediaType !== null) {
            chrome.runtime.sendMessage({action: 'update-Media',
                data: {
                    src: rs._mediaSrc,
                    type: rs._mediaType
                }
            });
        }else{
            //1 vai truong hop co loi, ko lay duoc du lieu...
            chrome.runtime.sendMessage({action : 'hidePageAction'});
        }
    }
}
/*----Extend------*/

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'tabUpdated') {
        setTimeout(function(){
            isDetailPage(window.location.href);
        },100);
    } else if (msg.action === 'copyURL') {
        if (!$('#btnClipboard').attr('data-clipboard-text')) return;
        $('#btnClipboard').click();
    }
});
