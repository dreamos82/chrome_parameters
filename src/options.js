var browser_handler;
var light_colors_values = { '--bg-color': '#ffffff', 
    '--hr-color': '#000000',
    '--txt-color': '#000000'};
var dark_colors_values = { '--bg-color': '#24241f', 
    '--hr-color': '#ffffff',
    '--txt-color': '#ffffff'};

browser_handler = getBrowserHandler()

document.addEventListener('DOMContentLoaded', function () {
    //retrieve_theme();
    browser_handler.storage.sync.get('selected_theme', function(result){
        console.log("Result: " + result.selected_theme);
        isDark = window.matchMedia('(prefers-color-scheme : dark)').matches;
        document.getElementById('color_theme').value = result.selected_theme;
        if(result.selected_theme && result.selected_theme != 'system'){
            console.log("selected_theme: " + result.selected_theme);
            var root = document.documentElement;
            if (isDark && result.selected_theme == 'light'){
                applyTheme(result, light_color_values, root);
            } else if (!isDark && result.selected_theme == 'dark'){
                applyTheme(result, dark_colors_values, root);
            }
        }

    });
    var save_button = document.getElementById('save_button')
    save_button.addEventListener('click', click);
});

function click(e){
    console.log(e.target.id);
    if(e.target.id == 'save_button'){
        console.log('Saving theme');
        var color_theme = document.getElementById('color_theme').value;
        console.log("Value seleted: " + color_theme);
        chrome.storage.sync.set({'selected_theme': color_theme}, function(){
            console.log('Saved');
            document.getElementById('status').textContent = 'Saved';
        });
    }
}

