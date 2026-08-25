PelicanXMLUtility = function() {

var XPathConstants = Java.type('javax.xml.xpath.XPathConstants');
var XPathFactory = Java.type('javax.xml.xpath.XPathFactory');

getNode = function(Document, xPath) {

    var xpathFactory = XPathFactory.newInstance();
        // Create XPath object
    var xpath = xpathFactory.newXPath();
    // Create XPathExpression object
    var node =  xpath.evaluate(xPath, Document, XPathConstants.NODE);
    return node;
}

getNodes = function(Document, xPath) {

    var xpathFactory = XPathFactory.newInstance();
        // Create XPath object
    var xpath1 = xpathFactory.newXPath();
    // Create XPathExpression object
    //var nodes =  xpath.evaluate(xPath, Document, XPathConstants.NODESET);
	
	var expr = xpath1.compile(xPath);
	var nodes =  expr.evaluate(Document, XPathConstants.NODESET);
	
	//var messageBody = convertDocumentToString(Document);
	//logger.trace("getNodes: messageBody = " + messageBody);
	//logger.trace("getNodes: xPath = " + xPath);
	
	
	logger.trace("getNodes: nodesLength = " + nodes.getLength());
	for(var i=0; i<nodes.getLength(); i++)
	{
		var n = nodes.item(i);
		logger.trace("getNodes: node n = " + n);
	}
    return nodes;
}

getValueFromPath = function (Document, xPath) {

    var nodes =  getNodes(Document, xPath);
    //logger.trace("getValueFromPath: nodes = " + nodes);
    if(nodes == null)
    	return null;

    var zeroItem = nodes.item(0);
	
    if( zeroItem == null )
    	return null;

	var n = zeroItem.getFirstChild();
    if(n == null)
    	return null;

	return n.getNodeValue();
}

getNodes2 = function(Document, xPath) {

	logger.trace("inside getNodes2()");
    var xpathFactory = XPathFactory.newInstance();
        // Create XPath object
    var xpath1 = xpathFactory.newXPath();
    // Create XPathExpression object
    //var nodes =  xpath.evaluate(xPath, Document, XPathConstants.NODESET);
	
	var expr = xpath1.compile(xPath);
	var nodes =  expr.evaluate(Document, XPathConstants.NODESET);
	
	//var messageBody = convertDocumentToString(Document);
	//logger.trace("getNodes2: messageBody = " + messageBody);
	//logger.trace("getNodes2: xPath = " + xPath);
	
	
	logger.trace("getNodes2: nodesLength = " + nodes.getLength());
	for(var i=0; i<nodes.getLength(); i++)
	{
		var n = nodes.item(i);
		logger.trace("getNodes2: node n = " + n);
	}
    return nodes;
}

setValueInPath = function (Document, xPath, value) {

    var nodes =  getNodes2(Document, xPath);
    logger.trace("setValueInPath: nodes = " + nodes.item(0));
    logger.trace("setValueInPath: xPath = " + xPath);
    if(nodes == null)
    	return 1;

    var zeroItem = nodes.item(0);
	var firstItem = nodes.item(1);
    logger.trace("setValueInPath: zeroItem = " + zeroItem);
    if( zeroItem == null )
    	return 1;


	var n = zeroItem.getFirstChild();
    logger.trace("setValueInPath: n = " + n);
	n.setNodeValue(""+value);
	return Document;
}


createElementWithText = function(Document, elementName, text) {

    var element = Document.createElement(elementName);
    var elementText = Document.createTextNode(text);
    element.appendChild(elementText);
    
    return element;
}

xml2json = function(xml, tab) {
    logger.info("Inside xml2json");
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { // element has child nodes ..
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                  else if (n.nodeType==4) cdataChild++; // cdata section node
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  // text node
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  // cdata node
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  // first occurence of element..
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { // mixed content
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { // pure text
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) { // cdata
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        o["#cdata"] = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         else
            alert("unhandled node type: " + xml.nodeType);
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         ///e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

return {
    getNode:getNode,
    getNodes:getNodes,
    getValueFromPath:getValueFromPath,
    setValueInPath:setValueInPath        
}

}();