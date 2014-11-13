/**
 * chrome_parameters Extension
 *
 * background.js
 *
 * @version 1.1
 *
 */

var tag;

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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	//var url_url = processUrl(tab.url);
	console.log("Parameter: " + tab.url);
	var i = 0;
	console.log(tab.url.length);
	var i = tab.url.indexOf('?');
	if(i==-1){
		console.log("no parameters");
	} else {
		var parameter_url = tab.url.substring(i++);
		console.log(parameter_url);
		chrome.pageAction.show(tabId);
	}	
});

function getVersion(){
    var extension_version = chrome.app.getDetails();
    return extension_version.version;
}

function onInstall(){
    console.log("Extension Installed");
    chrome.tabs.create({'url': chrome.extension.getURL('src/post_install.html')}, function(tab){
    });
}

chrome.runtime.onInstalled.addListener(function(details){
	var current_version = getVersion();
	var old_version = localStorage['version']
	if (current_version != old_version) {
		console.log(old_version);
		if (old_version == undefined) {
			console.log("OnInstall Call");
			localStorage['version'] = current_version;
			onInstall();
		}
	}
	console.log("Reason: " + details.reason);
});