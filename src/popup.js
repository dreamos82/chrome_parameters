/**
 * chrome_parameters Extension
 *
 * popup.js
 *
 * @version 1.8
 *
 */
var exporters = { csv: create_csv, json: create_json, xml: create_xml };
var browser_handler = getBrowserHandler();
var isChrome = isChromeBrowser();
var dragSourceElement = null;
var dark_colors_values = {
  '--bg-color': '#24241f',
  '--hr-color': '#ffffff',
};
var light_colors_values = {
  '--bg-color': '#ffffff',
  '--hr-color': '#000000',
};


function click(e) {
  if (e.target.id == "update") {
    update_url();
  } else if (e.target.id == "addnew") {
    add_new_parameter();
  } else if (e.target.id == "export") {
    appendExportOptions();
  } else if (e.target.id == "import") {
    get_current_tab(function (tab) {
      var externalScript = "src/content_script.js";
      if (!isChrome) {
        externalScript = "content_script.js"
      }
      browser_handler.tabs.executeScript(tab.id, { file: externalScript }, function (element) {
      });
    });
  } else if (e.target.id == "social_button") {
    var element = document.getElementById("social_bar")
    element.style.display = "block";
  } else if (e.target.id == "options_button") {
    browser_handler.runtime.openOptionsPage();
  } else if (e.target.id == "help_link") {
    browser_handler.tabs.create({ 'url': browser_handler.extension.getURL('src/help.html') }, function (tab) {
    });
  }
}

function update_url() {
  get_current_tab(function (tab) {
    var updated_url = create_updated_url(tab.url);
    console.log(updated_url);
    browser_handler.tabs.update(tab.id, { url: updated_url });
    window.close();
  });
}

function add_new_parameter() {
  var parameter_name_container = document.createElement("input");
  var parameter_value_container = document.createElement("input");
  var container = document.getElementById("container");
  parameter_value_container.setAttribute("id", "new_parameter");
  parameter_value_container.setAttribute("class", "parameter_value");
  parameter_name_container.setAttribute("class", "parameter_name");
  parameter_name_container.setAttribute("type", "text");
  parameter_value_container.addEventListener("keypress", input_keypress);
  parameter_name_container.onblur = function () {
    if (this.value != "") {
      var element = this.parentElement.parentElement.childNodes[1].childNodes[0];
      element.setAttribute("id", this.value);
    }
  };
  parameter_value_container.setAttribute("type", "text");
  add_new_row(parameter_name_container, parameter_value_container);
}

function drag_it(e) {
  var current_target_tr = e.currentTarget;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  dragSourceElement = this;
}

function drag_over(e) {
  e.preventDefault();
}

function drop_it(e) {
  e.stopPropagation();
  console.log(e);
  if (dragSourceElement !== this) {
    console.log(dragSourceElement.innerHTML);
    console.log(this.innerHTML);
    var targetRowHTML = this.innerHTML;
    this.innerHTML = dragSourceElement.innerHTML;
    dragSourceElement.innerHTML = targetRowHTML;
  }
  return false;
}

function add_new_row() {
  var tr_element = document.createElement("tr");
  tr_element.draggable = true;
  tr_element.addEventListener("dragstart", drag_it);
  tr_element.addEventListener("dragover", drag_over);
  tr_element.addEventListener("drop", drop_it);
  for (var i in arguments) {
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
  input_hidden.type = "hidden";
  input_hidden.setAttribute("id", "hash");
  new_element.appendChild(input_hidden);
  container_element.appendChild(new_element);
  container_element.appendChild(document.createElement("hr"));
}

function create_updated_url(url) {
  var container_div = document.getElementById("container");
  //var parameters = container_div.getElementsByTagName("input");
  var parameters = container_div.getElementsByTagName("tr");
  var url_split = url.split("?");
  hash_found = false;
  if (url_split != null) {
    var new_url = url_split[0].replace(/#$/, "") + "?";
  }
  for (i = 0; i < parameters.length; i++) {
    var row_parameters = parameters[i].getElementsByTagName("input");
    var parameter_name = row_parameters[0].value
    var parameter_value = row_parameters[1].value
    console.log(parameter_name);
    if (parameter_name == "hash" || parameter_name == "#") {
      hash_found = true;
      if (new_url.endsWith("&") || new_url.endsWith("?")) {
        new_url = new_url.replace(/[&?]$/, "#");
      } else {
        new_url = new_url + "#";
      }
      continue;
    } else if (parameter_name == "new_parameter" || parameter_name == undefined) {
      continue;
    }

    new_url = new_url + parameter_name;

    if (parameter_value) {
      new_url = new_url + "=" + escape(parameter_value);
    }

    if (i < parameters.length - 1) {
      new_url = new_url + "&";
    }
  }

  return new_url;
}

function get_current_tab(callback) {
  browser_handler.tabs.query({
                               active: true,               // Select active tabs
                               lastFocusedWindow: true,     // In the current window
                             }, function (array_of_Tabs) {
    callback(array_of_Tabs[0]);
  });
}

function parse_url(current_url) {
  var par_start = current_url.indexOf('?');
  var title_div = document.getElementById("title_div");
  if (title_div != undefined) {
    var url_hostname = getHostName(current_url);
    var text_node = document.createTextNode(" for " + url_hostname);
    title_div.appendChild(text_node);
  }

  var hash_position = current_url.lastIndexOf('#');
  if (par_start > 0 && par_start != current_url.length - 1) {
    if (hash_position > par_start) {
      parameter_url = current_url.substring(++par_start, hash_position);
    } else {
      parameter_url = current_url.substring(++par_start);
    }
    var result = parameter_url.split("&");
    document.getElementById("container").innerHTML = "";
    for (var i = 0; i < result.length && result.length > 0; i++) {
      showParameter(result[i]);
    }
    if (hash_position > par_start) {
      /*Improve this piece of code*/
      var sub_result = current_url.substring(++hash_position);
      var sub_array = sub_result.split("&");
      add_hash();
      var k = 0;
      for (k = 0; k < sub_array.length && sub_array.length > 0; k++) {
        console.log(sub_array[k]);
        showParameter(sub_array[k]);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    if (divs[i] != "other_buttons") {
      divs[i].addEventListener('click', click);
    }
  }
  var options_link = document.getElementById("options_button");
  options_link.addEventListener('click', click);
  get_current_tab(function (tab) {
    parse_url(tab.url);
  });
  browser_handler.storage.sync.get('selected_theme', function (result) {
    console.log('selected theme: ' + result.selected_theme);
    isDark = window.matchMedia('(prefers-color-scheme : dark)').matches;
    if (result.selected_theme && result.selected_theme != 'system') {
      var root = document.documentElement;
      if (isDark && result.selected_theme == 'light') {
        applyTheme(result, light_colors_values, root);
      } else if (!isDark && result.selected_theme == 'dark') {
        applyTheme(result, dark_colors_values, root);
      }
    }
  });
});

function input_keypress(event) {
  if (event.keyCode == 13) {
    update_url();
  }
}

/**
 * Append an element to the given element.
 *
 * @param element to append
 */
function appendElement(element) {
  var container_element = document.getElementById("container");
  container_element.appendChild(element);
}

/**
 * Show a parameter line in extension popup.
 *
 * @param parameter - The parameter to show. The string format should be: parameter_name=parameter_value
 * @param afetr_hash - not used
 */
function showParameter(parameter, after_hash) {
  var parameter_array = parameter.split(/=(.+)?/);
  console.log("Par: " + parameter);
  if (parameter_array.length < 1) {
    console.log("No parameter");
    return;
  }
  console.log(parameter_array.length);
  console.log(parameter_array[1]);
  var text_input_element = document.createElement("input");
  text_input_element.type = "text";
  if (parameter_array[1] !== undefined) {
    text_input_element.setAttribute("value", unescape(parameter_array[1]));
  }

  text_input_element.setAttribute("id", parameter_array[0]);
  text_input_element.setAttribute("class", "parameter_value");
  text_input_element.addEventListener("keypress", input_keypress);
  var b_element = document.createElement("input");
  b_element.setAttribute("type", "text");
  b_element.setAttribute("class", "parameter_name");
  b_element.setAttribute("value", parameter_array[0]);
  var img_element = document.createElement("img");
  img_element.addEventListener('click', delete_parameter, false);
  img_element.setAttribute("id", parameter_array[0]);
  img_element.src = '../images/delete.png';
  add_new_row(b_element, text_input_element, img_element);
}

function delete_parameter() {
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
function export_parameters_list(format) {
  var container_div = document.getElementById("container");
  var parameters = container_div.getElementsByClassName("parameter_value");
  var parameters_array = new Array();
  for (i = 0; i < parameters.length; i++) {
    console.log(parameters[i].getAttribute("id"));
    parameters_array[parameters[i].getAttribute("id")] = parameters[i].value;
  }
  var result = exporters[format](parameters_array);
  var link = document.createElement("a");
  var date = new Date();
  link.download = "export" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + date.getHours() + date.getMinutes() + "." + format;
  link.href = "data:text/" + format + ";charset=utf-8," + encodeURIComponent(result);
  if (!isChrome) {
    document.body.appendChild(link);
  }
  link.click();
  if (!isChrome) {
    document.body.removeChild(link);
  }
}

function appendExportOptions() {
  var new_element = document.getElementById("other_button_options");
  if (new_element) {
    new_element.remove();
  } else {
    new_element = document.createElement('div');
    let other_buttons_element = document.getElementById('other_buttons');
    new_element.id = "other_button_options";
    Object.keys(exporters).map((format) => {
      let format_element = document.createElement('div'),
        format_text = document.createTextNode(format.toUpperCase());
      format_element.id = format + "_link";

      format_element.appendChild(format_text);
      format_element.addEventListener('click', function () {
        export_parameters_list(format);
      })
      new_element.appendChild(format_element);
    })
    other_buttons_element.parentNode.insertBefore(new_element, other_buttons_element.nextSibling);
  }

}

/**
 * Create a csv string given a parameters_array.
 *
 * @param parameters_array Associative array where key is the parameter name.
 */
function create_csv(parameters_array) {
  //var csv_file = "data:text/csv;charset=utf-8,";
  var csv_file = "parameter_name,value\n";
  for (var key in parameters_array) {
    csv_file += key + "," + "\"" + parameters_array[key] + "\"\n";
  }
  return csv_file;
}

/**
 * Create a json file given a parameters_array.
 *
 * @param parameters_array Associative array where key is the parameter name.
 */
function create_json(parameter_array) {
  var jsonArray = {};
  for (var key in parameter_array) {
    jsonArray[key] = parameter_array[key];
  }
  var json_file = JSON.stringify(jsonArray);
  return json_file;
}

/**
 * Create a xml file given a parameters_array.
 *
 * @param parameters_array Associative array where key is the parameter name.
 */
function create_xml(parameter_array) {
  var xmlText = "<parameters>\n"
  for (var key in parameter_array) {
    xmlText += "\t<parameter>\n\t\t<key>" + key + "</key>\n\t\t<value>" + parameter_array[key] + "</value>\n\t</parameter>\n";
  }
  xmlText += "</parameters>";
  return xmlText;
}
