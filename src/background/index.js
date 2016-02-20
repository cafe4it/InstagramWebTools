//import welcome from 'shared/welcome'

//welcome('background/index.js');

let MEDIA = undefined;

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'show-contextMenuInstagram') {
        var subTitle = (msg.data.type === 'VIDEO') ? 'video' : 'image';
        MEDIA = msg.data;
        console.info(MEDIA);
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
    } else if (msg.action === 'remove-contextMenuInstagram') {
        chrome.contextMenus.removeAll();
    } else if (msg.action === 'update-Media'){
        MEDIA = msg.data;
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
})

// Setting popup icon

// When we defined browser_action
if (chrome.browserAction) {
    chrome.browserAction.setIcon({
        path: require("icons/webpack-38.png")
    })

// When we defined page_action
} else if (chrome.pageAction) {

    const showPageAction = function (tabId) {
        chrome.pageAction.show(tabId);

        chrome.pageAction.setIcon({
            path: require("icons/webpack-38.png"),
            tabId: tabId
        })
    }

    chrome.runtime.onInstalled.addListener(function () {
        // Replace all rules ...
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
            // With a new rule ...
            chrome.declarativeContent.onPageChanged.addRules([
                {
                    // That fires when a page's URL contains a 'g' ...
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: {hostEquals: 'instagram.com'},
                        })
                    ],
                    // And shows the extension's page action.
                    actions: [new chrome.declarativeContent.ShowPageAction()]
                }
            ]);
        });
    });


    // Show page action on each page update
    /*  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
     showPageAction(tabId)
     });*/
}

// When the extension is installed or upgraded ...
