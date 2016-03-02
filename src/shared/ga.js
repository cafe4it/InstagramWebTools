var _AnalyticsCode = 'UA-74453743-1';
var service = undefined;
var tracker = tracker;

var importScript = (function (oHead) {

    function loadError (oError) {
        throw new URIError("The script " + oError.target.src + " is not accessible.");
    }

    return function (sSrc, fOnload) {
        var oScript = document.createElement("script");
        oScript.type = "text\/javascript";
        oScript.onerror = loadError;
        if (fOnload) { oScript.onload = fOnload; }
        oHead.appendChild(oScript);
        oScript.src = sSrc;
    }

})(document.head || document.getElementsByTagName("head")[0]);

importScript(chrome.runtime.getURL('shared/google-analytics-bundle.js'),function(){
    console.info('google analytics platform loaded...');
    service = analytics.getService('instagram_easy_downloader');
    tracker = service.getTracker(_AnalyticsCode);
});

//module.exports = tracker;

/*
(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = chrome.runtime.getURL('shared/google-analytics-bundle.js');
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);

})();*/
