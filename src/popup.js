/**
 * chrome_parameters Extension
 *
 * popup.js
 *
 * @version 1.3
 *
 */
var exporters = {csv: create_csv};

function click(e) {
	console.log(e.target.id);
	if(e.target.id=="close") {
	  window.close();
	  return;
	} else if(e.target.id=="update"){
	  update_url();
	} else if(e.target.id=="addnew") {
        console.log("Add new parameter");
        add_new_parameter();
    } else if(e.target.id=="export"){
        export_parameters_list("csv");
    } else if(e.target.id=="import"){
        get_current_tab(function(tab){
            chrome.tabs.executeScript(tab.id, {file: "src/content_script.js"}, function(element){
            });

        });
    } else if(e.target.id=="social_button"){
        console.log("Show social bar");
        var element = document.getElementById("social_bar")
        element.style.display = "block";
    }
}

function update_url(){
	get_current_tab(function(tab){
		console.log("Creating new Url");
		var updated_url = create_updated_url(tab.url);
		console.log(updated_url);
		chrome.tabs.update(tab.id, {url: updated_url});
		window.close();
	});
}

function add_new_parameter(){
    var parameter_name_container = document.createElement("input");
    var parameter_value_container = document.createElement("input");
    var container = document.getElementById("container");
    parameter_value_container.setAttribute("id", "new_parameter");
    parameter_value_container.setAttribute("class", "parameter_value");
    parameter_name_container.setAttribute("class", "parameter_name");
    parameter_name_container.setAttribute("type", "text");
    parameter_value_container.addEventListener("keypress", input_keypress);
    parameter_name_container.onblur = function(){
	console.log(this);
        if(this.value!=""){
            //var element = this.nextElementSibling;
	    var element = this.parentElement.parentElement.childNodes[1].childNodes[0];
            element.setAttribute("id", this.value);
            var new_label = document.createElement("input");
            //new_label.appendChild(document.createTextNode(this.value));
	    new_label.className = "parameter_name";
	    new_label.disabled = true;
	    new_label.value = this.value;
            //element.parentElement.replaceChild(new_label, this);
	    element.parentElement.childNodes[0].replaceChild(new_label, this);
        }
    };
    parameter_value_container.setAttribute("type", "text");
    add_new_row(parameter_name_container, parameter_value_container);
}

function add_new_row() {
    var tr_element = document.createElement("tr");
    for(var i in arguments) {
      var td = document.createElement("td");
      td.appendChild(arguments[i]);
      tr_element.appendChild(td);
    }
    appendElement(tr_element);
}

function add_hash() {
	var container_element = document.getElementById("container");
	var new_element = document.createElement("div");
	var input_hidden = document.createElement("input");
	input_hidden.type="hidden";
	input_hidden.setAttribute("id", "hash");
	new_element.appendChild(input_hidden);
	container_element.appendChild(new_element);
	container_element.appendChild(document.createElement("hr"));
}

function create_updated_url(url){
  console.log("Called ");
  var container_div = document.getElementById("container");
  console.log(container_div);
  var parameters = container_div.getElementsByTagName("input");
  var url_split = url.split("?");
  if(url_split!=null){
    var new_url = url_split[0] + "?";
  }
	debugger;
  for(i=0; i<parameters.length; i++){
      if (parameters[i].getAttribute("id") == "hash") {
          new_url = new_url+"#";
          continue;
      } else if(parameters[i].getAttribute("id") == "new_parameter" || parameters[i].getAttribute("id") == undefined ) {
        continue;
      }

      new_url = new_url + parameters[i].id + "=" + escape(parameters[i].value);
      if(i<parameters.length-1){
          new_url = new_url + "&";
      }
  }
  return new_url;
}

function get_current_tab(callback){
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
		callback(array_of_Tabs[0]);
	});
}

function parse_url(current_url){
	var i = current_url.indexOf('?');
	var j = current_url.indexOf('#');
	if(i>0 && i!= current_url.length-1){
		console.log("parameters found!!");
		if (j>i) {
			parameter_url = current_url.substring(++i, j);
		} else {
			parameter_url = current_url.substring(++i);
		}
		console.log(parameter_url);
		var result = parameter_url.split("&");
		console.log(parameter_url.length);
		document.getElementById("container").innerHTML = "";

		for(i=0;i<result.length && result.length>0; i++){
		 showParameter(result[i]);
		}
		if(j>i){
			/*Improve this piece of code*/
			console.log("A: " + current_url.substring(current_url.indexOf("#")));
			console.log("B: " + current_url.substring(current_url.indexOf("?"), j));
			var sub_result = current_url.substring(++j);
			var sub_array = sub_result.split("&");
			add_hash();
			var k = 0;
			for(k=0;k<sub_array.length && sub_array.length>0; k++){
				console.log(sub_array[k]);
				showParameter(sub_array[k]);
			}
			console.log("End");
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
	console.log("added");
    if(divs[i]!="other_buttons"){
      divs[i].addEventListener('click', click);
    }
  }
    get_current_tab(function(tab){
	    parse_url(tab.url);
	});
});

function input_keypress(event){
	if (event.keyCode == 13) {
		update_url();
	}
	console.log(event.keyCode);

}

/**
 * Append an element to the given element.
 *
 * @param element to append
 */
function appendElement(element){
  var container_element = document.getElementById("container");
  container_element.appendChild(element);
}

/**
 * Show a parameter line in extension popup.
 *
 * @param parameter - The parameter to show. The string format should be: parameter_name=parameter_value
 * @param afetr_hash - not used
 */
function showParameter(parameter, after_hash){
  var parameter_array = parameter.split(/=(.+)?/);
  if(parameter_array.length <2) {
    console.log("No parameter");
    return;
  }
  var text_input_element = document.createElement("input");
  text_input_element.type = "text";
  if(parameter_array[1] !== undefined) {
    text_input_element.value = unescape(parameter_array[1]);
  }

  text_input_element.setAttribute("id", parameter_array[0]);
  text_input_element.setAttribute("class", "parameter_value");
  text_input_element.addEventListener("keypress", input_keypress);
  var b_element = document.createElement("input");
  b_element.setAttribute("type", "text");
  b_element.setAttribute("disabled", "disabled");
  b_element.setAttribute("class", "parameter_name");
  b_element.setAttribute("value", parameter_array[0]);
  var img_element = document.createElement("img");
  img_element.addEventListener('click', delete_parameter, false);
  img_element.setAttribute("id", parameter_array[0]);
  img_element.src = '../images/delete.png';
  add_new_row(b_element, text_input_element, img_element);
}

function delete_parameter(){
	console.log('To call');
    var container = this.parentNode.parentNode;
    container.parentNode.removeChild(container);
}

/**
 * Export the current parameters_list in the format provided. Currently available formats are: "csv".
 * To add support for a format, create an exporter function, and add an entry in exporters variable. in key: value format. Where
 * key is the format name, value is the exporter function.
 *
 * @param format - The selected export format
 */
function export_parameters_list(format){
	console.log("Placeholder");
    var container_div = document.getElementById("container");
    var parameters = container_div.getElementsByClassName("parameter_value");
    var parameters_array = new Array();
    for(i=0; i<parameters.length; i++){
        console.log(parameters[i].getAttribute("id"));
        parameters_array[parameters[i].getAttribute("id")] = parameters[i].value;
    }
    var result = exporters[format](parameters_array);
    var link = document.createElement("a");
    var date = new Date();
    link.download = "export"+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getHours()+date.getMinutes()+"." + format;
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(result);
    link.click();
}

/**
 * Create a csv string given a parameters_array.
 *
 * @param parameters_array Associative array where key is the parameter name.
 */
function create_csv(parameters_array){
    //var csv_file = "data:text/csv;charset=utf-8,";
    var csv_file = "parameter_name,value\n";
    for(var key in parameters_array){
        csv_file += key + "," + "\"" + parameters_array[key]+ "\"\n";
    }
    return csv_file;
}
