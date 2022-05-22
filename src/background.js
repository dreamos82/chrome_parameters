/**
 * browser_handler.parameters Extension
 *
 * background.js
 *
 * @version 2.0
 *
 */

var tag;
var nakedtag;
var browser_handler;
var isBrowserChrome = false;

if(typeof(browser)==='undefined'){
	browser_handler = chrome;
    isBrowserchrome = true;
} else {
	browser_handler = browser;
}



browser_handler.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("Parameter: " + tab.url);
	var i = 0;
	var i = tab.url.indexOf('?');
	var parameter_url = tab.url.substring(i++);
    if(!isBrowserChrome) {
      	browser_handler.pageAction.show(tabId);
    }
});

function getVersion(){
    var manifest_ref = browser_handler.runtime.getManifest();
    return manifest_ref.version;
}

function getManifestVersion() {
    var manifest_ref = browser_handler.runtime.getManifest();
    return manifest_ref.manifest_version
}

function onInstall(manifestVersion){
    console.log("Extension Installed");
    console.log("Manifest version: " + manifestVersion);
    if(manifestVersion == 3) {
        browser_handler.tabs.create({'url': browser_handler.runtime.getURL('src/post_install.html')}, function(tab){});
    } else {
        browser_handler.tabs.create({'url': browser_handler.extension.getURL('src/post_install.html')}, function(tab){});
    }
}

function onUpdate(manifestVersion){
    console.log("Extension Updated");
    console.log("Manifest version: " + manifestVersion);
    if(manifestVersion == 3) {
        browser_handler.tabs.create({'url': browser_handler.runtime.getURL('src/post_update.html')}, function(tab){});
    } else {
        browser_handler.tabs.create({'url': browser_handler.extension.getURL('src/post_update.html')}, function(tab){});
    }
}

browser_handler.runtime.onInstalled.addListener(function(details){
    var current_manifest = getManifestVersion();
    if(current_manifest == 3) {
        browser_handler.storage.local.get(['version'], function(version_value) {
	        //var current_version = getVersion();
            console.log("Current manifest version: " + current_manifest);
            if(version_value == undefined) {
                console.log("Setting value");
                browser_handler.storage.local.set({version: current_version}, function(){
                    console.log("Version number updated...");
                    onInstall(current_manifest);
                });
            } else {
                browser_handler.storage.local.set({version: current_version}, function(){
                    onUpdate(current_manifest);
                });
           }
        });
    } else {
	    var old_version = localStorage['version']
        var current_version = getVersion();
        if (old_version == undefined) {
            localStorage['version'] = current_version;
            onInstall(current_manifest);
        } else if (current_version != old_version) {
       		localStorage['version'] = current_version;
	   		onUpdate(current_manifest);
	    }
    }

}); 


function lastError(){
	if(browser_handler.runtime.lastError){
		console.log(browser_handler.runtime.lastError.message);
	}
}

