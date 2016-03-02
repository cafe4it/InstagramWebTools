import 'purecss/build/base-min.css';
import 'purecss/build/tables-min.css';
import 'purecss/build/buttons-min.css';
import '../shared/tooltip.css';
import 'shared/page.css';
import _ from 'lodash';

var buttonTpl = _.template('<a class="<%=className%> cmd tooltip-top" data-tooltip="<%=label%>"><img src="<%=imgSrc%>" alt="<%=label%>"/></a>');
var icons = [
    {id: 'button_DownloadAll', src: require('../icons/button_downloadall.png')},
    {id: 'button_DownloadImages', src: require('../icons/button_downloadimages.png')},
    {id: 'button_DownloadVideos', src: require('../icons/button_downloadvideos.png')}
];

var iconsOther = [
    {id: 'button_ReScanUser', src: require('../icons/button_rescanuser.png')},
    {id: 'button_RemoveUser', src: require('../icons/button_removeuser.png')}
]

//var bannerSrc = require('../icons/popup_banner.png');

const loadingBarSrc = require('../icons/loadingBar.gif');
const loadingBar = '<img src="' + loadingBarSrc + '" width=110px/>'

function buttonsBuilder(_icons) {
    return _.map(_icons, function (ii) {
        var label = chrome.i18n.getMessage(ii.id);
        var a = document.createElement('a');
        a.setAttribute('class', 'cmd tooltip-top');
        a.setAttribute('data-tooltip', label);
        a.setAttribute('data-cmd', ii.id);
        var img = document.createElement('img');
        img.setAttribute('src', ii.src);
        img.setAttribute('alt', label);
        img.setAttribute('style', 'width:19px;height:19px;')
        a.appendChild(img);

        return $(a).prop('outerHTML');
    }).join('&nbsp;');
}

var buttons = buttonsBuilder(icons);
var buttonsOther = buttonsBuilder(iconsOther);

$(document).ready(function () {
    //$('#popup_banner').attr('src', bannerSrc);
    $('th.col1').html(chrome.i18n.getMessage('popup_table_col1'));
    $('th.col2').html(chrome.i18n.getMessage('popup_table_col2'));
    loadTableData();

    $('table').on('click', 'a.cmd', function () {
        var userId = $(this).parent().data('id');
        var cmd = $(this).data('cmd');
        var action = 'download-all';
        var data = {
            userId: userId,
            cmd: cmd
        }
        switch (cmd) {
            case 'button_RemoveUser':
                action = 'DB_removeUser'
                break;
            case 'button_ReScanUser':
                action = 'DB_initUser'
                data = userId;
                break;
        }
        chrome.runtime.sendMessage({
            action: action,
            data: data
        }, function () {
            if (action !== 'download-all') {
                loadTableData();
            }
        })
    })

    $('#btnClearAll').on('click', function (e) {
        e.preventDefault();
        var self = this;
        var db = {
            users: []
        }
        chrome.storage.local.set({InstagramWebTools: db}, function () {
            loadTableData();
        });
    })
});

function loadTableData() {
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var db = obj.InstagramWebTools;
        var tr = _.template('<tr><td><%=userName%></td><td style="text-align: right"><%=total%>/<%=totalImages%>/<%=totalVideos%></td><td data-id="<%=userId%>"><%=buttons%></td><td data-id="<%=userId%>"><%=buttonsOther%></td></tr>');

        var html = '<tr><td colspan="4" style="text-align: center">' + chrome.i18n.getMessage('popup_table_empty') + '</td></tr>';
        if (db.users.length > 0) {
            //console.warn(db.users);
            html = db.users.map(function (user) {
                var username = user.id.match(/instagram.com\/(.*)\//),
                    username = (username[1]) ? username[1] : user.id;
                return tr({
                    userName: username,
                    userId: user.id,
                    total: user.nodes.length,
                    totalVideos: _.filter(user.nodes, function (node) {
                        return node.is_video === true
                    }).length || 0,
                    totalImages: _.filter(user.nodes, function (node) {
                        return node.is_video === false
                    }).length || 0,
                    buttons: (user.status === 'request') ? loadingBar : buttons,
                    buttonsOther: buttonsOther
                });
            });
        }
        $('table tbody').html(html);
    });
}
