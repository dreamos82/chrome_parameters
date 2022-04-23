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

    if(typeof(browser)==='undefined'){
		browser_handler = chrome;
    } else {
		browser_handler = browser;
    }



browser_handler.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("Parameter: " + tab.url);
	var i = 0;
	var i = tab.url.indexOf('?');
	var parameter_url = tab.url.substring(i++);
    //console.log(browser_handler.action);
	//browser_handler.action.show(tabId);
});

function getVersion(){
    var manifest_ref = browser_handler.runtime.getManifest();
    return manifest_ref.version;
}

function getManifestVersion() {
    var manifest_ref = browser_handler.runtime.getManifest();
    return manifest_ref.manifest_version
}

function onInstall(){
    console.log("Extension Installed");
    browser_handler.tabs.create({'url': browser_handler.runtime.getURL('src/post_install.html')}, function(tab){
    });
}

function onUpdate(){
    console.log("Extension Updated");
    browser_handler.tabs.create({'url': browser_handler.runtime.getURL('src/post_update.html')}, function(tab){
    });
}

browser_handler.runtime.onInstalled.addListener(function(details){
    var current_manifest = getManifestVersion();
    if(current_manifest -- 3) {
        browser_handler.storage.local.get(['version'], function(version_value) {
	        var current_version = getVersion();
            console.log("Current manifest version: " + current_manifest);
            if(version_value == undefined) {
                console.log("Setting value");
                browser_handler.storage.local.set({version: current_version}, function(){
                    console.log("Version number updated...");
                    onInstall();
                });
            } else {
                browser_handler.storage.local.set({version: current_version}, function(){
                    onUpdate();
                });
           }
        });
    } else {
	    var old_version = localStorage['version']
	    if (current_version != old_version) {
	    	if (old_version == undefined) {
	    		localStorage['version'] = current_version;
	    		onInstall();
	    	} else {
	    		localStorage['version'] = current_version;
	    		onUpdate();
	    	}
	    }
    }

}); 


function lastError(){
	if(browser_handler.runtime.lastError){
		console.log(browser_handler.runtime.lastError.message);
	}
}

