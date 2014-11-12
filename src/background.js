/**
 * chrome_parameters Extension
 *
 * background.js
 *
 * @version 1.1
 *
 */

var tag;

var fileChooser = document.createElement('input');
fileChooser.type = 'file';
fileChooser.addEventListener('change', function () {
    alert('called ---');
});

var form = document.createElement('form');
form.appendChild(fileChooser);


/* Listen for messages from popup */
chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === 'importFromFile') {
        alert('message received');
        fileChooser.click();
        //fileChooser.click();
        chrome.tabs.query({
		active: true,               // Select active tabs
		lastFocusedWindow: true     // In the current window
	}, function(array_of_Tabs) {
		// Since there can only be one active tab in one active window, 
		//  the array has only one element
		/*var tab = array_of_Tabs[0];
		// Example:
		var url = tab.url;
		alert("Url: " + url);
		// ... do something with url variable
		new_url = url;*/
	});
    }
});


file_import = function(element, tab){
    element.addEventListener('change', function(evt){
        alert("asasdads");
        read_single_file(evt,tab);
    }, false);
    element.click();
    console.log("uffa");
}

function read_single_file(evt, tab){
    alert("called asd");
    console.log("Called file event" + tab.url);
    var f= evt.target.files[0];
    if(f){
        var reader = new FileReader();
        reader.onload = function(e){
        var contents = e.target.result;
	    var parameters = contents.split('\n');
        var url_array = tab.url.split('?', 1)[0] + '?';
	    for(var i = 0; i <parameters.length-1; i++){
		  var comma_index = parameters[i].indexOf(",");
		  if (comma_index == -1) {
              alert("Wrong file format");
			 break;
		  }
		  var parameter = parameters[i].substr(0, comma_index) + '=' + parameters[i].substr(comma_index+'='.length);
		  if (!(parameter.substr(0, comma_index) == "parameter_name")) {
              //showParameter(parameter);
              if(i!=0) {
                  url_array += '&';
              }
              url_array += parameter
		  }
	    }
        console.log(url_array);
        chrome.tabs.update(tab.id, {url: url_array});
//        alert("update");
        }
        reader.readAsText(f);
    }
    debugger;
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