/**
 * chrome_parameters Extension
 *
 * This script contains logic for csv import.
 * content_script.js
 * @version 1.1
 *
 */

var fileChooser = document.createElement("input");
fileChooser.type = 'file';
fileChooser.addEventListener('change', function (evt) {
    console.log('inside content script change event');
    var f= evt.target.files[0];
    if(f){
        var reader = new FileReader();
        reader.onload = function(e){
            var contents = e.target.result;
            var parameters = contents.split('\n');
            var url_array = document.location.href.split('?', 1)[0] + '?';
            for(var i = 0; i <parameters.length-1; i++){
                var comma_index = parameters[i].indexOf(",");
                if (comma_index == -1) {
                    alert("Wrong file format");
                    break;
                }
                var parameter = parameters[i].substr(0, comma_index) + '=' + parameters[i].substr(comma_index+'='.length);
                if (!(parameter.substr(0, comma_index) == "parameter_name")) {
                    if(i!=1) {
                        url_array += '&';
                    }
                    url_array += parameter;
                }
            }
            console.log(url_array);
            url_array = url_array.replace(/"/g, '');
            document.location.href= url_array;
        }
        reader.readAsText(f);
    }
});

document.body.appendChild(fileChooser);
fileChooser.click();