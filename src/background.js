/**
 * browser_handler.parameters Extension
 *
 * background.js
 *
 * @version 1.2
 *
 */

var tag;
var nakedtag;
var browser_handler;


/*
 * This code snippet is needed to detect if we are on browser_handler.or firefox*/
if(typeof(browser)==='undefined'){
		browser_handler = chrome;
} else {
		browser_handler = browser;
}

/**
* Get the url paramater identified by sParam
* @param {String} sParam The parameter that we want to read from url.
* @return The parameter value if available, null otherwise
*/
function getURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
	return null;
}

browser_handler.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("Parameter: " + tab.url);
	var i = 0;
	console.log(tab.url.length);
	var i = tab.url.indexOf('?');
	var parameter_url = tab.url.substring(i++);
	browser_handler.pageAction.show(tabId);
});

function getVersion(){
    var extension_version = browser_handler.app.getDetails();
    return extension_version.version;
}

function onInstall(){
    console.log("Extension Installed");
    browser_handler.tabs.create({'url': browser_handler.extension.getURL('src/post_install.html')}, function(tab){
    });
}

function onUpdate(){
    console.log("Extension Updated");
    browser_handler.tabs.create({'url': browser_handler.extension.getURL('src/post_update.html')}, function(tab){
    });
}

browser_handler.runtime.onInstalled.addListener(function(details){
	var current_version = getVersion();
	var old_version = localStorage['version']
	if (current_version != old_version) {
		console.log(old_version);
		if (old_version == undefined) {
			console.log("OnInstall Call");
			localStorage['version'] = current_version;
			onInstall();
		} else {
			localStorage['version'] = current_version;
			onUpdate();
		}
	}
	console.log("Reason: " + details.reason);
});

/*
browser_handler.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(details.method == "POST")
            console.log(JSON.stringify(details));
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestBody"]
);*/

function lastError(){
	if(browser_handler.runtime.lastError){
		console.log(browser_handler.runtime.lastError.message);
	}
}

