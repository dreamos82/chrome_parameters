var exporters = {csv: create_csv};

function click(e) {
	console.log(e.target.id);
	if(e.target.id=="close") { 
	  window.close();
	  return;
	} else if(e.target.id=="update"){
	  get_current_tab(function(tab){
	    console.log("Creating new Url");
	    var updated_url = create_updated_url(tab.url);
	    console.log(updated_url);
	    chrome.tabs.update(tab.id, {url: updated_url});
	    window.close();
	  });
	} else if(e.target.id=="addnew") {
        console.log("Add new parameter");
        add_new_parameter();
    } else if(e.target.id=="export"){
        export_parameters_list("csv");
    }
}

function add_new_parameter(){
    var parameter_name_container = document.createElement("input");
    var parameter_value_container = document.createElement("input");
    var container = document.getElementById("container");
    var p_element = document.createElement("p");
    var div_element = document.createElement("div");
    parameter_value_container.setAttribute("id", "new_parameter");
    parameter_name_container.setAttribute("type", "text");
    parameter_name_container.onblur = function(){
        if(this.value!=""){
            var element = this.nextElementSibling;
            element.setAttribute("id", this.value);
            var new_label = document.createElement("b");
            new_label.appendChild(document.createTextNode(this.value));
            element.parentElement.replaceChild(new_label, this);
        }
    };
    parameter_value_container.setAttribute("type", "text");
    p_element.appendChild(parameter_name_container);
    p_element.appendChild(document.createTextNode("=")); 
    p_element.appendChild(parameter_value_container);
    appendElement(p_element);
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
  for(i=0; i<parameters.length; i++){
      debugger;
      if (parameters[i].getAttribute("id") == "hash") {
          new_url = new_url+"#";
          continue;
      } else if(parameters[i].getAttribute("id") == "new_parameter" || parameters[i].getAttribute("id") == undefined ) {
        continue;
      }
        
      new_url = new_url + parameters[i].id + "=" + parameters[i].value;
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

function appendElement(element){
  var newdiv = document.createElement("div");
  newdiv.appendChild(element);
  var container_element = document.getElementById("container");
  container_element.appendChild(newdiv);
}

function showParameter(parameter, after_hash){
  var p_element = document.createElement("p");
  var parameter_array = parameter.split("=");
  if(parameter_array.length <2) {
    console.log("No parameter");
    return;
  }
  var text_input_element = document.createElement("input");
  text_input_element.type = "text";
  text_input_element.value = parameter_array[1];
  text_input_element.setAttribute("id", parameter_array[0]);
  var b_element = document.createElement("b");
  b_element.appendChild(document.createTextNode(parameter_array[0] + " = "));
  p_element.appendChild(b_element);
  p_element.appendChild(text_input_element);	
  appendElement(p_element);
}

function export_parameters_list(format){
	console.log("Placeholder");
    var container_div = document.getElementById("container");
    var parameters = container_div.getElementsByTagName("input");
    var parameters_array = new Array();
    for(i=0; i<parameters.length; i++){   
        console.log(parameters[i].getAttribute("id"));
        parameters_array[parameters[i].getAttribute("id")] = parameters[i].value;
    }
    var result = exporters[format](parameters_array);
    var encodedUri = encodeURI(result);
    window.open(encodedUri);
}

function create_csv(parameters_array){
    var csv_file = "data:text/csv;charset=utf-8,";    
    for(var key in parameters_array){
        csv_file += key + "," + parameters_array[key]+"\n"
        console.log(key + "," + parameters_array[key]);
    }
    return csv_file;
}