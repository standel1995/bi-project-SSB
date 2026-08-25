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



return {
    getNode:getNode,
    getNodes:getNodes,
    getValueFromPath:getValueFromPath,
    setValueInPath:setValueInPath        
}

}();