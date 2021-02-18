var storedTheme;
var themeChanged = false;
function getBrowserHandler(){
    var browser_handler;
    if(typeof(browser)==='undefined'){
	    browser_handler = chrome;
    } else {
    	browser_handler = browser;
    }
    return browser_handler;
}

function isChromeBrowser(){
    if(typeof(browser) === 'undefined'){
        return true;
    }
    return false;
}

function applyTheme(selected_theme, color_values, root){
    console.log("Called");
    for (var key in color_values){
        console.log(color_values[key]);
        root.style.setProperty(key, color_values[key]);
    }

}
