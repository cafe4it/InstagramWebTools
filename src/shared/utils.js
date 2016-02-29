var utils = {}

String.prototype.replaceArray = function (find, replace) {
    var replaceString = this;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
};

utils.getPathFromUrl = function(url) {
    return url.split(/[?#]/)[0];
}

utils.getFileNameFromUrl = function(url) {
    var path = this.getPathFromUrl(url);
    return path.split("/").pop();
}

utils.getExtensionFromUrl = function(url) {
    return (/[.]/.exec(url)) ? /[^.]+$/.exec(url) : undefined;
}

utils.validateMediaSrc = function(mediaUrl) {
    var _filter_find = ['/s640x640', '/s750x750'],
        _filter_replace = ['', ''];
    return mediaUrl.replaceArray(_filter_find, _filter_replace);
}

utils.shareToTumblr = function(href, title) {
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
    } catch (z) {
    }
    ;
    try {
        if (!/^(.*\.)?tumblr[^.]*$/.test(l.host)) throw (0);
        tstbklt();
    } catch (z) {
        var a = function () {
            if (!w.open(u, '_blank', 'toolbar=0,resizable=0,status=1,scrollbars=1,width=' + (540 + sw) + ',height=600')) l.href = u;
        };
        setTimeout(a, 10);
    }
}

module.exports = utils;