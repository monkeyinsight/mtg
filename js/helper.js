function fixEvent(e) {
	e = e || window.event;

	if ( e.pageX == null && e.clientX != null ) {
		var html = document.documentElement;
		var body = document.body;
		e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
		e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
	}

	if (!e.which && e.button) {
		e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
	}

	return e;
}

function getOffset(el) {
    if (el.getBoundingClientRect) {
        return getOffsetRect(el);
    } else {
        return getOffsetSum(el);
    }
}

function getOffsetRect(el) {
    var box = el.getBoundingClientRect();
 
    var body = document.body;
    var docElem = document.documentElement;
 
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
 
    return { top: Math.round(top), left: Math.round(left) };
}

function getOffsetSum(el) {
    var top=0, left=0;
    while(el) {
        top = top + parseInt(el.offsetTop);
        left = left + parseInt(el.offsetLeft);
        el = el.offsetParent;
    }
 
    return {top: top, left: left};
}

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        if (property == 'color') {
            return (colorAssign(a[property]) < colorAssign(b[property]) ? -1 : (colorAssign(a[property]) > colorAssign(b[property])) ? 1 : 0) * sortOrder;
        } else {
            return ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0) * sortOrder;
        }
    }
}

function colorAssign(color) {
    switch (color) {
        case 'white':
            return 0;
            break;
        case 'blue':
            return 1;
            break;
        case 'black':
            return 2;
            break;
        case 'red':
            return 3;
            break;
        case 'green':
            return 4;
            break;
        case 'artifact':
            return 5;
            break;
        case 'gold':
            return 6;
            break;
        case 'land':
            return 7;
            break;
        default:
            return 8;
            break;
    }
}

var getElementsByClass = function(classList, node) {			
	var node = node || document,
	list = node.getElementsByTagName('*'), 
	length = list.length,  
	classArray = classList.split(/\s+/), 
	classes = classArray.length, 
	result = [], i,j
	for(i = 0; i < length; i++) {
		for(j = 0; j < classes; j++)  {
			if(list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
				result.push(list[i])
				break
			}
		}
	}
	return result
}

function getMatchedStyle(elem, property){
    var val = elem.style.getPropertyValue(property);

    if (elem.style.getPropertyPriority(property))
        return val;

    var rules = getMatchedCSSRules(elem);

    for(var i = rules.length; i --> 0;){
        var r = rules[i];

        var important = r.style.getPropertyPriority(property);

        if(val == null || important){
            val = r.style.getPropertyValue(property);

            if(important)
                break;
        }
    }

    return val;
}

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for(var key in obj)
        temp[key] = obj[key];
    return temp;
}

function ajax(options) {
    var xmlhttp;
    if (window.XMLHttpRequest)
        xmlhttp = new XMLHttpRequest();
    else
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            if (options.success)
                options.success(xmlhttp.responseText);
        }
    }
    xmlhttp.open(options.type||"GET",options.url,true);
    xmlhttp.send();
}