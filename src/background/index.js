//import welcome from 'shared/welcome'

//welcome('background/index.js');

let MEDIA = undefined;
let _IS_DETAIL_PAGE = false;
let _IS_USER_PAGE = false;
let _IS_SHOW_PAGE_ACTION = true;

const showPageAction = function (tabId, data) {
    _IS_DETAIL_PAGE = data.isDetailPage;
    _IS_USER_PAGE = data.isUserPage;

    if(_IS_DETAIL_PAGE || _IS_USER_PAGE){
        chrome.pageAction.show(tabId);
    }else{
        chrome.pageAction.hide(tabId);
    }

    var title = (_IS_DETAIL_PAGE) ? chrome.i18n.getMessage('popupReadyForDownload') : chrome.i18n.getMessage('extName');
    var popup = (_IS_USER_PAGE) ? 'popup/index.html' : '';

    chrome.pageAction.setTitle({
        title : title,
        tabId: tabId
    });
    chrome.pageAction.setPopup({
        popup : popup,
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

        if(_IS_DETAIL_PAGE && _IS_SHOW_PAGE_ACTION === false){
            showPageAction(sender.tab.id, true);
        }
    } else if (msg.action === 'remove-contextMenuInstagram') {
        chrome.contextMenus.removeAll();
    } else if (msg.action === 'update-Media') {
        MEDIA = msg.data;
    } else if (msg.action === 'isDetailPage') {
        showPageAction(sender.tab.id, msg.data);
    } else if (msg.action === 'hidePageAction'){
        _IS_SHOW_PAGE_ACTION = false;
        chrome.pageAction.hide(sender.tab.id);
    }
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (!MEDIA) return;
    if (info.menuItemId === 'showContextMenuInstagram_SaveAs') {
        chrome.downloads.download({url: MEDIA.src});
    } else if (info.menuItemId === 'showContextMenuInstagram_CopyURL') {
        chrome.tabs.sendMessage(tab.id, {action: 'copyURL'});
    } else if (info.menuItemId === 'showContextMenuInstagram_OpenInNewTab') {
        chrome.tabs.create({url: MEDIA.src});
    }
});

chrome.pageAction.onClicked.addListener(function (tab) {
    if (_IS_DETAIL_PAGE && MEDIA && MEDIA.src !== null) {
        chrome.downloads.download({url: MEDIA.src});
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {action: 'tabUpdated'});
    }
});
