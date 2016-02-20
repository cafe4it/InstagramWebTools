//import welcome from 'shared/welcome'

//welcome('background/index.js');

let MEDIA = undefined;
let _IS_DETAIL_PAGE = false;
let _IS_SHOW_PAGE_ACTION = true;

const showPageAction = function (tabId, isShow) {
    chrome.pageAction.show(tabId);
    _IS_DETAIL_PAGE = isShow;
    var title = (_IS_DETAIL_PAGE) ? "Ready for download" : "Instagram Web Tools";
    var popup = (_IS_DETAIL_PAGE) ? "" : "popup/index.html";

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
        var subTitle = (msg.data.type === 'VIDEO') ? 'video' : 'image';
        MEDIA = msg.data;
        //console.info(MEDIA);
        chrome.contextMenus.create({
            id: 'showContextMenuInstagram_SaveAs',
            title: "Save " + subTitle + " as...",
            contexts: ["all"]
        });
        chrome.contextMenus.create({
            id: 'showContextMenuInstagram_CopyURL',
            title: "Copy " + subTitle + " URL",
            contexts: ["all"]
        });
        chrome.contextMenus.create({
            id: 'showContextMenuInstagram_OpenInNewTab',
            title: "Open " + subTitle + " in new tab",
            contexts: ["all"]
        });

        if(_IS_SHOW_PAGE_ACTION === false){
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
})