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

function populateTabledetails(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var tdKey = rs.get("TDKEY");
	var tdValue = rs.get("TDVALUE");
	var tdidCode = rs.get("TDIDCODE");

	if(tdValue == null || tdValue.equals("")){
		tdValue = "";
	}

	hash.put(tdKey, tdValue);
	var hzlMap = exchange.getIn().getHeader("HZL_MAPS", java.lang.String.class);
	exchange.getIn().setHeader(hzlMap, hash);

	logger.info("populateTabledetails: key = " + tdKey);
	logger.info("populateTabledetails: value = " + tdValue);
}

function populateViewPaylib(exchange) {
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
    var key = rs.get("BICCODE");
    var value = "Y";

    if(key) {
        hash.put(key, value);
        exchange.getIn().setHeader("VALID_BICS", hash);        
    }
}

function populateInstParam(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var institutionId = rs.get("INSTITUTIONID"); 
	var path = rs.get("PATH");
	var paramName = rs.get("PARAMNAME");

	var paramValue = rs.get("PARAMVALUE");
	var pathInstd = institutionId + "."+ path + "." + paramName;

	if(pathInstd){
		hash.put(pathInstd, paramValue);
		logger.info("populateInstParam: key = " + pathInstd);
		logger.info("populateInstParam: value = " + paramValue);
		exchange.getIn().setHeader("INST_PARAM", hash);	
	}

	var key = institutionId + "."+ paramName + "."+ paramValue;
	hash.put(key, path);
	logger.info("populateInstParam: key = " + key);
	logger.info("populateInstParam: value = " + path);
	exchange.getIn().setHeader("INST_PARAM", hash);	
}

function populateInstHierarchy(exchange) {
	logger.info("Body in HazelCastLoader:" + exchange.getIn().getBody());
	logger.info("Headers in HazelCastLoader:" + exchange.getIn().getHeaders());
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var parentInstitution = rs.get("PARENTINSTITUTION");
	var childInstitution = rs.get("CHILDINSTITUTION");

	logger.info("populateInstHierarchy: childInstitution = " + childInstitution);
	logger.info("populateInstHierarchy: parentInstitution = " + parentInstitution);
	
	hash.put(childInstitution, parentInstitution);
	exchange.getIn().setHeader("INST_HIERARCHY", hash);		
}

function populateClgsys(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var CL_CLGSYS_ID = rs.get("CL_CLGSYS_ID");
	var CL_INSTITUTIONID = rs.get("CL_INSTITUTIONID"); 
	var CL_START_TIME = rs.get("CL_START_TIME");
	var CL_CUTOFF_TIME = rs.get("CL_CUTOFF_TIME");
	var CL_THURSDAY = rs.get("CL_THURSDAY");
	var CL_FRIDAY = rs.get("CL_FRIDAY");
	var CL_SATURDAY = rs.get("CL_SATURDAY");
	var CL_SUNDAY = rs.get("CL_SUNDAY");
	var CL_CLGSYS_ID_OFFSET = rs.get("CL_CLGSYS_ID_OFFSET");
	var CL_RELEASE_IMMEDIATE = rs.get("CL_RELEASE_IMMEDIATE");

	var value = "|" + CL_START_TIME + "|" +  CL_CUTOFF_TIME + "|" +  CL_THURSDAY + "|" +  CL_FRIDAY + "|" +  CL_SATURDAY + "|" +  CL_SUNDAY + "|" + CL_CLGSYS_ID_OFFSET + "|" +  CL_RELEASE_IMMEDIATE;
	hash.put(CL_CLGSYS_ID, value);
	exchange.getIn().setHeader("CLGSYS", hash);
}

function populateMxClgId(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var CL_CLGSYS_ID = rs.get("CL_CLGSYS_ID");

	hash.put(CL_CLGSYS_ID, "Y");
	exchange.getIn().setHeader("MX_CLG_ID_MAP", hash);
}

function populateClStartTime(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var CL_CLGSYS_ID = rs.get("CL_CLGSYS_ID");
	var CL_START_TIME = rs.get("CL_START_TIME");

	hash.put(CL_CLGSYS_ID, CL_START_TIME);
	exchange.getIn().setHeader("CL_START_TIME_MAP", hash);
}

function populateChlHoliday(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var clgSysId = rs.get("CHL_CLGSYS_ID");
	var chlInstitutionId = rs.get("CHL_INSTITUTIONID");
	var chlHolidayDate = rs.get("CHL_HOLIDAY_DATE");

	var key = chlInstitutionId + "_" + clgSysId + "_" + chlHolidayDate;
	hash.put(key, chlHolidayDate);
	exchange.getIn().setHeader("CHL_HOLIDAY", hash);

	logger.info("populateChlHoliday: key = " + key);
	logger.info("populateChlHoliday: value = " + chlHolidayDate);
}

function populateLangDesc(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();
	var rs = exchange.getIn().getBody(java.util.Map.class);

	var moduleCode = rs.get("MODULECODE");
	var itemNo = rs.get("ITEMNO");
	var langDesc1 = rs.get("LANGDESC1");

	var key = moduleCode + "|" + itemNo;
	hash.put(key, langDesc1);
	exchange.getIn().setHeader("LANGDESC", hash);

	logger.info("populateLangDesc: key = " + key);
	logger.info("populateLangDesc: value = " + langDesc1);
}

function populateChChannel(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();
	var rs = exchange.getIn().getBody(java.util.Map.class);

	var channel = rs.get("CH_CHANNEL_ID");
	var institutionId = rs.get("CH_INSTITUTIONID");
	var key = channel + "|" + institutionId;
	var value = rs.get("CH_ENCRYPT_REQ");

	hash.put(key, value);
	exchange.getIn().setHeader("LAU_CONFIG", hash);

	logger.info("populateChChannel: key = " + key);
	logger.info("populateChChannel: value = " + value);
}

function populateaccountNumber(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var institutionId = rs.get("INSTITUTION_ID"); 
	logger.info("populateaccountNumber: institutionId = " + institutionId);
	var bankCode = rs.get("BANK_CODE");
	var accountIban = rs.get("ACCOUNT_IBAN");
	logger.info("populateaccountNumber: bankCode = " + bankCode);
	logger.info("populateaccountNumber: accountIban = " + accountIban);
	var accNumber = rs.get("ACCOUNT_NUMBER");
	var inputChannel = rs.get("INPUT_CHANNEL");
	var accCurrency = rs.get("ACCOUNT_CURR");

	var pathInstd = institutionId + "_"+ bankCode;
	var pathIBAN = institutionId + "_"+ accountIban;

	if(pathInstd){
		hash.put(pathInstd, accNumber);
		logger.info("populateaccountNumber: key = " + pathInstd);
		logger.info("populateaccountNumber: value = " + accNumber);
		exchange.getIn().setHeader("ACCOUNT_MASTER", hash);	
	}

	if(pathIBAN){
		hash.put(pathIBAN, accNumber);
		logger.info("populateaccountNumber: key = " + pathIBAN);
		logger.info("populateaccountNumber: value with iban = " + accNumber);
		exchange.getIn().setHeader("ACCOUNT_MASTER", hash);	
	}
}

function populateAccountCurrency(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var institutionId = rs.get("INSTITUTION_ID"); 
	logger.info("populateaccountCurrency: institutionId = " + institutionId);
	var bankCode = rs.get("BANK_CODE");
	logger.info("populateaccountCurrency: bankCode = " + bankCode);
	var accNumber = rs.get("ACCOUNT_NUMBER");
	var accCurrency = rs.get("ACCOUNT_CURR");
	
	var pathCurr = institutionId + "_"+ bankCode;
	
	if(pathCurr){
		hash.put(pathCurr, accCurrency);
		logger.info("populateaccountCurrency: key = " + pathCurr);
		logger.info("populateaccountCurrency: value Curr = " + accCurrency);
		exchange.getIn().setHeader("ACC_MASTER_CURR", hash);	
	}
}

function populateaccountchannel(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var institutionId = rs.get("INSTITUTION_ID"); 
	logger.info("populateaccountchannel: institutionId = " + institutionId);
	var bankCode = rs.get("BANK_CODE");
	var accountIban = rs.get("ACCOUNT_IBAN");
	logger.info("populateaccountchannel: bankCode = " + bankCode);
	logger.info("populateaccountchannel: accountIban = " + accountIban);
	var accNumber = rs.get("ACCOUNT_NUMBER");
	logger.info("populateaccountchannel: accNumber = " + accNumber);
	var inputChannel = rs.get("INPUT_CHANNEL");

	var pathInstd = institutionId + "_"+ bankCode;
	var pathIBAN = institutionId + "_"+ accountIban;

	if(pathInstd){
		hash.put(pathInstd, inputChannel);
		logger.info("populateaccountchannel: key = " + pathInstd);
		logger.info("populateaccountchannel: value = " + inputChannel);
		exchange.getIn().setHeader("ACC_MASTER_CHANNEL", hash);	
	}
	
	if(pathIBAN){
		hash.put(pathIBAN, inputChannel);
		logger.info("populateaccountchannel: key = " + pathIBAN);
		logger.info("populateaccountchannel: value with IBAN = " + inputChannel);
		exchange.getIn().setHeader("ACC_MASTER_CHANNEL", hash);	
	}
	
}

function populatequeueTable(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var hash = new HashMap();

	var rs = exchange.getIn().getBody(java.util.Map.class);
	var institutionId = rs.get("INSTITUTIONID"); 
	logger.info("populatequeueTable: institutionId = " + institutionId);
	var queueId = rs.get("QUEUEID");
	logger.info("populatequeueTable: queueId = " + queueId);
	var processingStage = rs.get("PROCESSING_STAGE");

	var pathInstd = institutionId + "_"+ queueId;

	if(pathInstd){
		hash.put(pathInstd, processingStage);
		logger.info("populatequeueTable: key = " + pathInstd);
		logger.info("populatequeueTable: value = " + processingStage);
		exchange.getIn().setHeader("QUEUE", hash);	
	}
}