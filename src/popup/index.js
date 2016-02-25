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
var buttons = _.map(icons, function (ii) {
    var label = chrome.i18n.getMessage(ii.id);
    var a = document.createElement('a');
    a.setAttribute('class', 'cmd tooltip-top');
    a.setAttribute('data-tooltip',label);
    a.setAttribute('data-cmd',ii.id);
    var img = document.createElement('img');
    img.setAttribute('src',ii.src);
    img.setAttribute('alt',label);
    img.setAttribute('style','width:19px;height:19px;')
    a.appendChild(img);

    return $(a).prop('outerHTML');
}).join('&nbsp;');
$(document).ready(function () {
    $('th.col1').html(chrome.i18n.getMessage('popup_table_col1'));
    $('th.col2').html(chrome.i18n.getMessage('popup_table_col2'));
    chrome.storage.local.get('InstagramWebTools', function (obj) {
        var db = obj.InstagramWebTools;
        var tr = _.template('<tr><td><%=userName%></td><td style="text-align: right"><%=total%>/<%=totalVideos%></td><td data-id="<%=userId%>"><%=buttons%></td></tr>');

        var html = '<tr><td colspan="3" style="text-align: center">'+chrome.i18n.getMessage('popup_table_empty')+'</td></tr>';
        if (db.users.length > 0) {
            html = db.users.map(function (user) {
                var username = user.id.match(/instagram.com\/(.*)\//),
                    username = (username[1]) ? username[1] : user.id;
                return tr({
                    userName : username,
                    userId: user.id,
                    total: user.nodes.length,
                    totalVideos: _.filter(user.nodes, function (node) {
                        return node.is_video === true
                    }).length || 0,
                    buttons: buttons
                });
            });
        }
        $('table tbody').html(html);
    });
    $('table').on('click','a.cmd',function(){
        var userId = $(this).parent().data('id');
        var cmd = $(this).data('cmd');
        chrome.runtime.sendMessage({
            action : 'download-all',
            data : {
                userId : userId,
                cmd : cmd
            }
        })
    })

    $('#btnClearAll').on('click', function (e) {
        e.preventDefault();
        var db = {
            users: []
        }
        chrome.storage.local.set({InstagramWebTools: db});
    })
});
