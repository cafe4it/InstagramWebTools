import _ from 'lodash';

chrome.runtime.onInstalled.addListener(function () {
    var db = {
        users: []
    }
    chrome.storage.local.set({InstagramWebTools: db});
})

let MEDIA = undefined;
let _IS_DETAIL_PAGE = false;
let _IS_USER_PAGE = false;
let _IS_SHOW_PAGE_ACTION = true;

const showPageAction = function (tabId, data) {
    _IS_DETAIL_PAGE = data.isDetailPage;
    _IS_USER_PAGE = data.isUserPage;

    if (_IS_DETAIL_PAGE) {
        chrome.pageAction.show(tabId);
    } else if (_IS_USER_PAGE) {
        chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }

    var title = (_IS_DETAIL_PAGE) ? chrome.i18n.getMessage('popupReadyForDownload') : chrome.i18n.getMessage('extName');
    var popup = (_IS_USER_PAGE) ? 'popup/index.html' : '';

    chrome.pageAction.setTitle({
        title: title,
        tabId: tabId
    });
    chrome.pageAction.setPopup({
        popup: popup,
        tabId: tabId
    });
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'show-contextMenuInstagram') {
        var subTitle = (msg.data.type === 'VIDEO') ? chrome.i18n.getMessage('typeVideo') : chrome.i18n.getMessage('typeImage');
        MEDIA = msg.data;
        //console.info(MEDIA);
        chrome.contextMenus.create({
            id: 'showContextMenuInstagram_SaveAs',
            title: chrome.i18n.getMessage('contextMenu_SaveAs', subTitle),
            contexts: ["all"]
        });
        chrome.contextMenus.create({
            id: 'showContextMenuInstagram_CopyURL',
            title: chrome.i18n.getMessage('contextMenu_CopyURL', subTitle),
            contexts: ["all"]
        });
        chrome.contextMenus.create({
            id: 'showContextMenuInstagram_OpenInNewTab',
            title: chrome.i18n.getMessage('contextMenu_OpenInNewTab', subTitle),
            contexts: ["all"]
        });
    } else if (msg.action === 'remove-contextMenuInstagram') {
        chrome.contextMenus.removeAll();
    } else if (msg.action === 'update-Media') {
        MEDIA = msg.data;
    } else if (msg.action === 'isDetailPage') {
        //showPageAction(sender.tab.id, msg.data);
    } else if (msg.action === 'download-Media') {
        chrome.downloads.download({url: MEDIA.src});
    } else if (msg.action === 'copy-Media') {
        chrome.tabs.sendMessage(sender.tab.id, {action: 'copyURL'});
    } else if (msg.action === 'open-Media') {
        chrome.tabs.create({url: MEDIA.src});
    } else if (msg.action === 'scan-user') {
        chrome.storage.local.get('InstagramWebTools', function (obj) {
            var db = obj.InstagramWebTools;
            var _existsUser = _.find(db.users, function(user){return user.id === msg.data});
            if(!_existsUser){
                db.users.push({
                    id: msg.data,
                    status: 'request',
                    nodes: []
                });
                chrome.storage.local.set({InstagramWebTools: db});
                chrome.browserAction.setBadgeText({text: db.users.length.toString()});
                chrome.tabs.sendMessage(sender.tab.id, {action: 'request-scan-user', data: msg.data},function(response){
                    chrome.storage.local.get('InstagramWebTools', function (obj) {
                        var users = obj.InstagramWebTools.users.map(function (user) {
                            if (user.id === response.id) {
                                user = _.extend(user, {nodes: response.nodes, status: 'completed'});
                            }
                            return user;
                        });
                        chrome.storage.local.set({InstagramWebTools: _.extend(obj.InstagramWebTools, {users: users})});
                    })
                });
            }
        });
    } else if(msg.action === 'download-all'){
        chrome.storage.local.get('InstagramWebTools',function(obj){
            var user = _.find(obj.InstagramWebTools.users, function(user){ return user.id === msg.data.userId});
            if(user){
                var nodes = [];
                switch(msg.data.cmd){
                    case 'button_DownloadAll':
                        nodes = user.nodes;
                        break;
                    case 'button_DownloadImages':
                        nodes = _.filter(user.nodes, function(node){ return node.is_video === false});
                        break;
                    case 'button_DownloadVideos':
                        nodes = _.filter(user.nodes, function(node){ return node.is_video === true});
                        break;
                }

                _.each(nodes, function(node){
                    chrome.downloads.download({url : node.src, filename : node.filename});
                })
            }
        })
    }
});


chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (!MEDIA) return;
    if (info.menuItemId === 'showContextMenuInstagram_SaveAs') {
        chrome.runtime.sendMessage({action: 'download-Media'});
    } else if (info.menuItemId === 'showContextMenuInstagram_CopyURL') {
        chrome.runtime.sendMessage({action: 'copy-Media'});
    } else if (info.menuItemId === 'showContextMenuInstagram_OpenInNewTab') {
        chrome.runtime.sendMessage({action: 'open-Media'});
    }
});

/*chrome.pageAction.onClicked.addListener(function (tab) {
 if (_IS_DETAIL_PAGE && MEDIA && MEDIA.src !== null) {
 chrome.runtime.sendMessage({action: 'download-Media'});
 }
 });*/

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {action: 'tabUpdated'});
    }
});

