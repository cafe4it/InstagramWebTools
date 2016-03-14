import _ from 'lodash';
import LocalStorage from '../shared/db.js';

const _AnalyticsCode = 'UA-74453743-1';
let service, tracker;

var importScript = (function (oHead) {
    //window.analytics = analytics;
    function loadError(oError) {
        throw new URIError("The script " + oError.target.src + " is not accessible.");
    }

    return function (sSrc, fOnload) {
        var oScript = document.createElement("script");
        oScript.type = "text\/javascript";
        oScript.onerror = loadError;
        if (fOnload) {
            oScript.onload = fOnload;
        }
        oHead.appendChild(oScript);
        oScript.src = sSrc;
    }

})(document.head || document.getElementsByTagName("head")[0]);

importScript(chrome.runtime.getURL('shared/google-analytics-bundle.js'), function () {
    console.info('google analytics platform loaded...');
    service = analytics.getService('instagram_easy_downloader');
    tracker = service.getTracker(_AnalyticsCode);
    tracker.sendAppView('App view');
});


chrome.runtime.onInstalled.addListener(function () {
    //amplitude.logEvent('Installed');
    var db = {
        users: []
    }
    chrome.storage.local.set({InstagramWebTools: db});
})

let MEDIA = undefined;
let _IS_DETAIL_PAGE = false;
let _IS_USER_PAGE = false;
let _IS_SHOW_PAGE_ACTION = true;

//let _INSTAGRAM_TAB_ID = undefined;

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

function trackerSingleEvent(action) {
    var fullPost = 'https://www.instagram.com' + MEDIA.postUrl;
    var actionName = action + ((MEDIA.type) ? (' ' + MEDIA.type.toLowerCase()) : '');
    tracker.sendEvent('App', actionName, fullPost);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'show-PageAction') {
        tracker.sendEvent('App', 'Open', sender.url || sender.tab.url | '', sender.tab.id);
        chrome.pageAction.show(sender.tab.id);

    } else if (msg.action === 'change-Url-Of-User') {
        tracker.sendEvent('App', 'Surf', msg.data || '');
    } else if (msg.action === 'show-contextMenuInstagram') {
        chrome.contextMenus.removeAll();
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
    } else if (msg.action === 'download-Media') {
        chrome.downloads.download({url: MEDIA.src});
        trackerSingleEvent('Download');
    } else if (msg.action === 'copy-Media') {
        chrome.tabs.sendMessage(sender.tab.id, {action: 'copyURL'});
        trackerSingleEvent('Copy');
    } else if (msg.action === 'open-Media') {
        chrome.tabs.create({url: MEDIA.src});
        trackerSingleEvent('Open');
    } else if (msg.action === 'DB_initUser') {
        tracker.sendEvent('App', 'Scan', msg.data);
        LocalStorage.initUser(msg.data, function () {
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'request-scan-user',
                data: msg.data
            });
            //_gaq.push(['_trackEvent', 'Scan clicked', msg.data]);
            sendResponse(true);
        })
    } else if (msg.action === 'DB_insertUser') {
        LocalStorage.insertUser(msg.data.userId, msg.data.nodes, msg.data.status, function (result) {
            sendResponse(result);
        })
    } else if (msg.action === 'DB_removeUser') {
        LocalStorage.removeUser(msg.data.userId, function (result) {
            sendResponse(result);
        })
    }
    else if (msg.action === 'download-all') {
        chrome.storage.local.get('InstagramWebTools', function (obj) {
            var user = _.find(obj.InstagramWebTools.users, function (user) {
                return user.id === msg.data.userId
            });
            if (user) {
                var nodes = [];
                var label = 'Download';
                switch (msg.data.cmd) {
                    case 'button_DownloadAll':
                        nodes = user.nodes;
                        label = 'Download All'
                        break;
                    case 'button_DownloadImages':
                        nodes = _.filter(user.nodes, function (node) {
                            return node.is_video === false
                        });
                        label = 'Download Images'
                        break;
                    case 'button_DownloadVideos':
                        nodes = _.filter(user.nodes, function (node) {
                            return node.is_video === true
                        });
                        label = 'Download Videos'
                        break;
                }

                tracker.sendEvent('App', label, msg.data.userId);

                _.each(nodes, function (node) {
                    chrome.downloads.download({url: node.src, filename: node.filename});
                })
            }
        })
    } else if(msg.action === 'click-Ads'){
        tracker.sendEvent('App', 'Click ads', msg.data);
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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {action: 'tabUpdated'});
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, changeInfo) {
    //tracker.sendEvent('App', 'Close', '', tabId);
})
