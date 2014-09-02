function click(e) {
	console.log(e.target.id);
	if(e.target.id=="close") { 
	  window.close();
	  return;
	} else if(e.target.id=="parse_button") {
	  get_current_tab(function(tab){
	    parse_url(tab.url);
	  });
	} else if(e.target.id=="update"){
	  get_current_tab(function(tab){
	    console.log("Creating new Url");
	    var updated_url = create_updated_url(tab.url);
	    console.log(updated_url);
	    chrome.tabs.update(tab.id, {url: updated_url});
	    window.close();
	  });
	}
}

function add_hash() {
	var container_element = document.getElementById("container");
	var new_element = document.createElement("div");
	var input_hidden = document.createElement("input");
	input_hidden.type="hidden";
	input_hidden.setAttribute("id", "hash");
	new_element.appendChild(input_hidden);
	container_element.appendChild(new_element);
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
    if (parameters[i].getAttribute("id") == "hash") {
	new_url = new_url+"#";
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
  p_element.appendChild(document.createTextNode(parameter_array[0] + "="));
  p_element.appendChild(text_input_element);	
  appendElement(p_element);
}
