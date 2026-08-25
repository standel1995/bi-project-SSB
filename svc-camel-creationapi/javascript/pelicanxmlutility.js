var XPathConstants = Java.type('javax.xml.xpath.XPathConstants');
var XPathFactory = Java.type('javax.xml.xpath.XPathFactory');
var HashMap = Java.type('java.util.HashMap');
var Entry = Java.type('java.util.Map.Entry');
var BigDecimal = Java.type('java.math.BigDecimal');
var JavaDate = Java.type('java.util.Date');
var System = Java.type('java.lang.System');
var ArrayList = Java.type("java.util.ArrayList");
var DocumentBuilderFactory = Java.type("javax.xml.parsers.DocumentBuilderFactory");

//var Logger = Java.type("org.apache.log4j.Logger");
var Logger = Java.type("org.slf4j.Logger");
var Logger = Java.type("org.slf4j.LoggerFactory");
var logger = Logger.getLogger("JavaScript");
var JSHelperClass = Java.type("ai.pelican.camel.utils.JSHelperClass");
var EncryptDecrypt = Java.type("ai.pelican.camel.authentication.EncryptDecrypt");
var DocumentBuilderFactory = Java.type('javax.xml.parsers.DocumentBuilderFactory');
var TransformerFactory = Java.type('javax.xml.transform.TransformerFactory');
var StringWriter = Java.type('java.io.StringWriter');
var DOMSource = Java.type('javax.xml.transform.dom.DOMSource');
var StreamResult = Java.type('javax.xml.transform.stream.StreamResult');

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
    var xpath = xpathFactory.newXPath();
    // Create XPathExpression object
    var nodes =  xpath.evaluate(xPath, Document, XPathConstants.NODESET);
    return nodes;
}

getValueFromPath = function (Document, xPath) {

    var nodes =  getNodes(Document, xPath);
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

setValueInPath = function (Document, xPath, value) {

    var nodes =  getNodes(Document, xPath);
    if(nodes == null)
    	return 1;

    var zeroItem = nodes.item(0);
    if( zeroItem == null )
    	return 1;


	var n = zeroItem.getFirstChild();
	n.setNodeValue(""+value);
	return 0;
}

createElementWithText = function(Document, elementName, text) {

    var element = Document.createElement(elementName);
    var elementText = Document.createTextNode(text);
    element.appendChild(elementText);
    
    return element;
}



return {
    getNode:getNode,
    getNodes:getNodes,
    getValueFromPath:getValueFromPath,
    setValueInPath:setValueInPath        
}

}();