var XPathConstants = Java.type('javax.xml.xpath.XPathConstants');
var XPathFactory = Java.type('javax.xml.xpath.XPathFactory');
var HashMap = Java.type('java.util.HashMap');
//var Entry = Java.type('java.util.Map.Entry');
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
var JavaScriptDBHandler = Java.type("ai.pelican.camel.js.database.JavaScriptDBHandler");
var InterActFile = Java.type("ai.pelican.camel.interact.InterActFile");
var AuthCodeGenerator = Java.type("ai.pelican.camel.authentication.AuthCodeGenerator");
var AppHeaderHandler = Java.type("ai.pelican.camel.bah.AppHeaderHandler");

var DOMSource = Java.type("javax.xml.transform.dom.DOMSource");
var StringWriter = Java.type("java.io.StringWriter");
var StreamResult = Java.type("javax.xml.transform.stream.StreamResult");
var TransformerFactory = Java.type("javax.xml.transform.TransformerFactory");
var Transformer = Java.type("javax.xml.transform.Transformer");
var OutputKeys = Java.type("javax.xml.transform.OutputKeys");
var ExecuteCamelRoute = Java.type('ai.pelican.camel.js.processor.ExecuteCamelRoute');
var Base64 = Java.type('java.util.Base64');

function proxyresolutionCheck(exchange){
	var inMsg;
	var msgdbMap;
	var map;
	var Document;
	var Document1;
	var msgType;
	var readMsgdb;
	var sanctionFlag;
	var proxyresolutionCheck;
	var institutionId;

	logger.info("In proxyresolutionCheck");

	inMsg = exchange.getIn();
	msgdbMap = new HashMap();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	Document1 = inMsg.getBody(java.lang.String.class);

	setHeader(map, "PLCN_ProxyResFlag", true);

	var plcnInternalcall = getHeader(map,"PLCN_call");
	logger.info("proxyresolutionCheck: plcnInternalcall = " + plcnInternalcall);

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("proxyresolutionCheck: msgFamily = " + msgFamily);

	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("proxyresolutionCheck: custom13 = " + custom13);

	var proxyResolutionConfigured = false;
	setHeader(map, "PLCN_proxyResolutionConfigured", proxyResolutionConfigured);

	if(proxyResolutionConfigured == false) {
		setHeader(map, "PLCN_ProxyResExit", false);
	}	

	/*institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("schedulingCheck: institutionId = " + institutionId);	

	sanctionPath = institutionId.concat(".PROCESSING_STAGES.SANCTION_SCANNING.PRODUCTS");
	logger.info("proxyresolutionCheck: sanctionPath = " + sanctionPath);
	var sanctionCode = memTblGetTableValue(map, "INST_PARAM", sanctionPath);
	logger.info("proxyresolutionCheck: sanctionCode = " + sanctionCode);

	var productCode = getHeader(map, "PLCN_productCode");
	logger.info("proxyresolutionCheck: productCode = " + productCode);

	if(isPatternPresent(sanctionCode, productCode)) {
		proxyresolutionCheck = true;
	}else {
		proxyresolutionCheck = false;
	}

	setHeader(map, "PLCN_proxyresolutionCheck", proxyresolutionCheck);

	if(proxyresolutionCheck == true) {
		logger.info("inside if loop to call createOfacRequest")
		createOfacRequest(exchange);
	}*/
}