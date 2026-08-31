function msgValidationFedPacs008(exchange) {
	var result;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var orgDocument = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var documentString = inMsg.getBody(java.lang.String.class);

	logger.info("In msgValidationFedPacs008");
	logger.trace("msgValidationFedPacs008: documentString = " + documentString);

	setHeader(map, "PLCN_txnForceStopCounter", 0);
	setHeader(map, "PLCN_errorCountAdd", "Y"); //for testing
	logger.info("errorCountAdd: " + getHeader(map, "PLCN_errorCountAdd"));
	setHeader(map, "PLCN_validMessage", true);
	setHeader(map, "PLCN_validFlag", true);

	wrapperCbprPacs008Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	wrapperFedPacs008Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationFedPacs008: PLCN_validMessage = " + result);

	result = getHeader(map, "PLCN_validMessage");
	logger.info("In msgValidationFedPacs008: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "error");
		//setCommentsForTransaction("00", "8183", map);
	}

	inMsg.setBody(orgDocument);
}

function wrapperFedPacs008Mx(exchange) {
	var retVal = 0;
	var pacs08ValdFlag;
	var manualMode;
	var tenantName;

	logger.info('wrapperFedPacs008Mx:In wrapperFedPacs008Mx');
	
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	pacs08ValdFlag = memTblGetTableValue(map, "FLAG-TABLE", "PACS09_VALD_FLAG_MX");
	
	if(pacs08ValdFlag = "ERROR") 
	{
		retVal = FedValidationRulesPacs008(pacs08ValdFlag, exchange);

		if(retVal == 0) {
			logger.info("wrapperFedPacs009Mx: Calling externalCodelistValidation");
			//retVal = externalCodelistValidationCbprPacs009(Document, map);		
			txnComments = getHeader(map, "PLCN_txnComments");
			logger.info("txnComments from externalCodelistValidation = " + txnComments);			
		}

	}

	if(pacs08ValdFlag = "WARNING") {
		retVal = FedValidationRulesPacs008(pacs08ValdFlag, exchange);
		//retVal = externalCodelistValidationCbprPacs009(Document, map);
	}
}

function FedValidationRulesPacs008(pacs08ValdFlag, exchange){
	logger.info("FedValidationRulesPacs008");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var MsgTypecheck;
	MsgTypecheck = getHeader(map, "PLCN_MsgType");
	logger.info("FedValidationRulesPacs008:MsgTypecheck = "+MsgTypecheck);
	retVal = 0;

	if(pacs08ValdFlag == "ERROR") 
	{
		//if(MsgTypecheck && MsgTypecheck !=="LynxPacs008")
		//{
		//	retVal = interbankSettlementCurrencyRulePacs008(Document, map);
		//	if(retVal != 0) {
		//		return retVal;
		//	}
		//}
		
		if(MsgTypecheck =="FedPacs008")
		{
			
			retVal = validateMaximumAmountRuleFedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateIRSTaxPaymentsRule6FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateIRSTaxPaymentsRule2FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateIRSTaxPaymentsRule3FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateIRSTaxPaymentsRule4FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePersonTransparency_IRSRuleFedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePersonTransparency_IRSRule1FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateIRSTaxPaymentsRule5FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateRemittanceInformationRule2FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateServiceLevelCodeGuidelineFedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateFITransparencyRuleFedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePostalAddressRule1FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePostalAddressRule2FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validatePostalAddressRule3FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
			retVal = validateRemittanceInformationRule1FedPacs008(Document, map);
			if(retVal != 0) {
				return retVal;
			}
			
		}
	}
	return retVal;
}


function isNumeric(value) {
    return !isNaN(value);
}

function validateMaximumAmountRuleFedPacs008(Document, map) {  //R3
	logger.info("In validateMaximumAmountRuleFedPacs008");
	var pathamount;
	var amount;
	
	var retVal = 0;
	pathamount = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';
	amount = getValueFromPath(Document, pathamount);
	logger.trace("validateMaximumAmountRuleFedPacs008: amount = " + amount);
	logger.info("validateMaximumAmountRuleFedPacs008: typeof amount = " + typeof amount);
	var amount1 = parseInt(amount);
	logger.info("validateMaximumAmountRuleFedPacs008: typeof amount = " + typeof amount1);
	if(amount1 < 0.00 || amount1 > 9999999999.99)
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("322", "7641", map);
		//if InstdAgt contains one of the Treasury tax payment RTNs, then name of the tax payer must be provided in the Creditor
		return retVal;
	}
	return retVal;
}


function validateIRSTaxPaymentsRule6FedPacs008(Document, map) {  //R4
	logger.info("In validateIRSTaxPaymentsRule6FedPacs008");
	//For IRS tax payments, i.e., if Instructed Agent contains one of the Treasury tax payment RTNs,
	//the name of the tax payer must be provided in the Creditor element (i.e., Creditor/Name).
	var pathMmbId;
	var codeMmbId;
	var path;
	var name;
	var retVal = 0;
	pathMmbId = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId';
	codeMmbId = getValueFromPath(Document, pathMmbId);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Nm';
	name = getValueFromPath(Document, path);
	
	if((codeMmbId == "091036164" || codeMmbId == "091036177") && !name) 
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("946", "7168", map);
		//if InstdAgt contains one of the Treasury tax payment RTNs, then name of the tax payer must be provided in the Creditor
		return retVal;
	}
	return retVal;
}

function validateIRSTaxPaymentsRule2FedPacs008(Document, map) {  //R5
	logger.info("In validateIRSTaxPaymentsRule2FedPacs008");
	var pathMmbId;
	var codeMmbId;
	var path;
	var code;
	var retVal = 0;
	var result;
	pathMmbId = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId';
	codeMmbId = getValueFromPath(Document, pathMmbId);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Cdtr/TaxId';
	code = getValueFromPath(Document, path);
	
	if(code)
	{
		result = isNumeric(code);
	}
	
	if((codeMmbId == "091036164" || codeMmbId == "091036177") && result == false && !code && (code == "000000000" || code == "999999999")) 
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1302", "7169", map);
		//if InstdAgt contains one of the Treasury tax payment RTNs, a Tax Identification Number must be provided in the Creditor
		return retVal;
	}
	return retVal;
}

function validateIRSTaxPaymentsRule3FedPacs008(Document, map) {  //R6
	logger.info("In validateIRSTaxPaymentsRule3FedPacs008");
	var pathMmbId;
	var codeMmbId;
	var path;
	var code;
	var retVal = 0;
	var result;
	pathMmbId = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId';
	codeMmbId = getValueFromPath(Document, pathMmbId);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Tp';
	code = getValueFromPath(Document, path);
	
	if((codeMmbId == "091036164" || codeMmbId == "091036177") && !code) 
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1329", "7170", map);
		// if InstdAgt contains one of the Treasury tax payment RTNs, a Tax Type Code must be provided in the tax remittance component
		return retVal;
	}
	return retVal;
}

function validateIRSTaxPaymentsRule4FedPacs008(Document, map) {  //R7
	logger.info("In validateIRSTaxPaymentsRule4FedPacs008");
	var pathMmbId;
	var codeMmbId;
	var path;
	var code;
	var retVal = 0;
	var result;
	pathMmbId = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId';
	codeMmbId = getValueFromPath(Document, pathMmbId);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Prd/Yr';
	code = getValueFromPath(Document, path);
	
	if((codeMmbId == "091036164" || codeMmbId == "091036177") && !code) 
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1336", "7171", map);
		// if InstdAgt contains one of the Treasury tax payment RTNs, a Tax Year must be provided in the tax remittance component
		return retVal;
	}
	return retVal;
}

function validatePersonTransparency_IRSRuleFedPacs008(Document, map) {  //R8
	logger.info("In validateIRSTaxPaymentsRule4FedPacs008");
	var biccodePath;
	var biccode;
	var mmbIdPath;
	var mmbIdCode;
	var path;
	var name;
	var address;
	var retVal = 0;
	
	biccodePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Id/OrgId/AnyBIC';
	biccode = getValueFromPath(Document, biccodePath);
	
	mmbIdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId';
	mmbIdCode = getValueFromPath(Document, mmbIdPath);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Nm';
	name = getValueFromPath(Document, path);
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr';
	address = getValueFromPath(Document, path);
	
	if(!biccode && !name && !address && (mmbIdCode !== "091036164" || mmbIdCode !== "091036177"))
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("889", "7948", map);
		return retVal;
	}
	return retVal;
	
}

function validatePersonTransparency_IRSRule1FedPacs008(Document, map) {  //R49 R51 R69
	logger.info("In validatePersonTransparency_IRSRule1FedPacs008");
	var biccodePath;
	var biccode;
	var path;
	var name;
	var address;
	var retVal = 0;
	
	var message = inMsg.getBody(java.lang.String.class);
	
	if(isPatternPresent(message, "<UltmtDbtr>"))
	{
		biccodePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr';
		address = getValueFromPath(Document, path);
		if(!biccode && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("693", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<InitgPty>"))
	{
		biccodePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr';
		address = getValueFromPath(Document, path);
		if(!biccode && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("736", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		biccodePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr';
		address = getValueFromPath(Document, path);
		if(!biccode && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("779", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<UltmtCdtr>"))
	{
		biccodePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Id/OrgId/AnyBIC';
		biccode = getValueFromPath(Document, biccodePath);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Nm';
		name = getValueFromPath(Document, path);
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr';
		address = getValueFromPath(Document, path);
		if(!biccode && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1007", "7948", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validateIRSTaxPaymentsRule5FedPacs008(Document, map) {  //R9
	logger.info("In validateIRSTaxPaymentsRule4FedPacs008");
	var pathMmbId;
	var codeMmbId;
	var path;
	var code;
	var retVal = 0;
	var result;
	pathMmbId = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId';
	codeMmbId = getValueFromPath(Document, pathMmbId);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Prd/Tp';
	code = getValueFromPath(Document, path);
	logger.trace("validateIRSTaxPaymentsRule5FedPacs008: code = " + code);
	if(codeMmbId == "091036164" || codeMmbId == "091036177") 
	{
		if(code !=='MM01' && code !== 'MM02' && code !== 'MM03' && code !== 'MM04' && code !== 'MM05' && code !== 'MM06' && code !== 'MM07' && code !== 'MM08' && code !== 'MM09' && code !== 'MM10' && code !== 'MM11' && code !== 'MM12')
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1337", "7172", map);
			//Invalid Period Type code
			return retVal;
		}
	}
	return retVal;
}

function validateRemittanceInformationRule2FedPacs008(Document, map) {  //R10
	logger.info("In validateRemittanceInformationRule2FedPacs008");
	var rltdRmtInf;
	var rmtInf;
	var path;
	var retVal = 0;
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RltdRmtInf';
	rltdRmtInf = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf';
	rmtInf = getValueFromPath(Document, path);
	
	if(rltdRmtInf && rmtInf)
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1080", "7173", map);
		//RltdRmtInf and RmtInf cannot be present together.
		return retVal;
	}
	return retVal;
	
}

function validateServiceLevelCodeGuidelineFedPacs008(Document, map) {  //R14
	logger.info("In validateServiceLevelCodeGuidelineFedPacs008");
	var path;
	var code;
	var retVal = 0;
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/SvcLvl/Cd';
	code = getValueFromPath(Document, path);
	logger.info("validateServiceLevelCodeGuidelineFedPacs008 : code = " + code);
	/* if(code)
	{
		if(code !== "G001" && code !== "G002" && code !== "G003" && code !== "G004" && code !== "G005" && code !== "G006" && code !== "G007" && code !== "G009" && code !== "BKTR" && code !== "NPCA" && code !== "NUGP" && code !== "NURG" && code !== "PRPT" && code !== "SDVA" && code !== "SEPA" && code !== "SVDE" && code !== "URGP" && code !== "URNS" && code !== "INST" && code !== "SRTP" && code !== "SVAT" && code !== "WFSM" && code !== "EOLO" && code !== "SPLI")
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("314", "7484", map);
			return retVal;
		}
	} */
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/SvcLvl/Cd';
	retVal = checkExternalCodelist(path, 'ExternalServiceLevel1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("314", "1556", map);
		retVal = 1;
	}
	return retVal;
	
}

function validateFITransparencyRuleFedPacs008(Document, map) {  //R17 R22 R26 R30
	logger.info("In validateFITransparencyRuleFedPacs008");
	var bicCodePath;
	var bicCode;
	var mmbIdPath;
	var mmbIdCode;
	var path;
	var name;
	var address;
	var chrgsInf;
	var chrgsInfPath;
	var retVal = 0;
	
	var message = inMsg.getBody(java.lang.String.class);
	
	chrgsInfPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf';
	chrgsInf = getValueFromPath(Document, chrgsInfPath);
	
	bicCodePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/BICFI';
	bicCode = getValueFromPath(Document, bicCodePath);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/Nm';
	name = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr';
	address = getValueFromPath(Document, path);
	
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		if(!bicCode && !name && !address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("347", "7927", map);
				return retVal;
			}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1Val;
		var prvsInstgAgt1bicpath;
		var prvsInstgAgt1bicCode;
		var prvsInstgAgt1name;
		var prvsInstgAgt1address;
		
		prvsInstgAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
		prvsInstgAgt1Val = getValueFromPath(Document, prvsInstgAgt1Path);
		
		prvsInstgAgt1bicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/BICFI';
		prvsInstgAgt1bicCode = getValueFromPath(Document, prvsInstgAgt1bicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		if(!prvsInstgAgt1bicCode && !prvsInstgAgt1name && !prvsInstgAgt1address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("379", "7927", map);
				return retVal;
			}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2Val;
		var prvsInstgAgt2bicpath;
		var prvsInstgAgt2bicCode;
		var prvsInstgAgt2name;
		var prvsInstgAgt2address;
		
		prvsInstgAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
		prvsInstgAgt2Val = getValueFromPath(Document, prvsInstgAgt2Path);
		
		prvsInstgAgt2bicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/BICFI';
		prvsInstgAgt2bicCode = getValueFromPath(Document, prvsInstgAgt2bicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2address = getValueFromPath(Document, path);
	
		if(!prvsInstgAgt2bicCode && !prvsInstgAgt2name && !prvsInstgAgt2address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("427", "7927", map);
				return retVal;
			}
	}
		
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3Val;
		var prvsInstgAgt3bicpath;
		var prvsInstgAgt3bicCode;
		var prvsInstgAgt3name;
		var prvsInstgAgt3address;
		
		prvsInstgAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
		prvsInstgAgt3Val = getValueFromPath(Document, prvsInstgAgt3Path);
		
		prvsInstgAgt3bicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/BICFI';
		prvsInstgAgt3bicCode = getValueFromPath(Document, prvsInstgAgt3bicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		if(!prvsInstgAgt3bicCode && !prvsInstgAgt3name && !prvsInstgAgt3address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("475", "7927", map);
				return retVal;
			}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1Val;
		var intrmyAgt1bicpath;
		var intrmyAgt1bicCode;
		var intrmyAgt1name;
		var intrmyAgt1address;
		
		intrmyAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1';
		intrmyAgt1Val = getValueFromPath(Document, intrmyAgt1Path);
		
		intrmyAgt1bicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/BICFI';
		intrmyAgt1bicCode = getValueFromPath(Document, intrmyAgt1bicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1address = getValueFromPath(Document, path);
	
		if(!intrmyAgt1bicCode && !intrmyAgt1name && !intrmyAgt1address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("549", "7927", map);
				return retVal;
			}
	}
		
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2Val;
		var intrmyAgt2bicpath;
		var intrmyAgt2bicCode;
		var intrmyAgt2name;
		var intrmyAgt2address;
		
		intrmyAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2';
		intrmyAgt2Val = getValueFromPath(Document, intrmyAgt2Path);
		
		intrmyAgt2bicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/BICFI';
		intrmyAgt2bicCode = getValueFromPath(Document, intrmyAgt2bicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2address = getValueFromPath(Document, path);
		if(!intrmyAgt2bicCode && !intrmyAgt2name && !intrmyAgt2address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("597", "7927", map);
				return retVal;
			}
	}

	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3Val;
		var intrmyAgt3bicpath;
		var intrmyAgt3bicCode;
		var intrmyAgt3name;
		var intrmyAgt3address;
		
		intrmyAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3';
		intrmyAgt3Val = getValueFromPath(Document, intrmyAgt3Path);
		
		intrmyAgt3bicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/BICFI';
		intrmyAgt3bicCode = getValueFromPath(Document, intrmyAgt3bicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3address = getValueFromPath(Document, path);
	
		if(!intrmyAgt3bicCode && !intrmyAgt3name && !intrmyAgt3address)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("645", "7927", map);
				return retVal;
			}
	}
	
	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgtVal;
		var dbtrAgtbicpath;
		var dbtrAgtbicCode;
		var dbtrAgtname;
		var dbtrAgtaddress;
		
		dbtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt';
		dbtrAgtVal = getValueFromPath(Document, dbtrAgtPath);
		
		dbtrAgtbicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI';
		dbtrAgtbicCode = getValueFromPath(Document, dbtrAgtbicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtaddress = getValueFromPath(Document, path);
	
		if(!dbtrAgtbicCode && !dbtrAgtname && !dbtrAgtaddress)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("841", "7927", map);
				return retVal;
			}
	}
	
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgtVal;
		var cdtrAgtbicpath;
		var cdtrAgtbicCode;
		var cdtrAgtname;
		var cdtrAgtaddress;
		
		cdtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt';
		cdtrAgtVal = getValueFromPath(Document, cdtrAgtPath);
		
		cdtrAgtbicpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI';
		cdtrAgtbicCode = getValueFromPath(Document, cdtrAgtbicpath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtaddress = getValueFromPath(Document, path);
	
		if(!cdtrAgtbicCode && !cdtrAgtname && !cdtrAgtaddress)
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("889", "7927", map);
				return retVal;
			}
	}
	return retVal;
	
}

function validatePostalAddressRule1FedPacs008(Document, map) {  //R16 R21 R25 R29
	logger.info("In validatePostalAddressRule1FedPacs008");

	var chrgsInf;
	var chrgsInfPath;
	var path;
	var name;
	var pstladdress;
	var address;
	var retVal = 0;
	var message = inMsg.getBody(java.lang.String.class);
	chrgsInfPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf';
	chrgsInf = getValueFromPath(Document, chrgsInfPath);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/Nm';
	name = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr';
	pstladdress = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	address = getValueFromPath(Document, path);
	
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		//if((pstladdress && !name) || (!pstladdress && name))
		if(pstladdress && !name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("347", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
		var prvsInstgAgt1name;
		var prvsInstgAgt1pstladdress;
		var prvsInstgAgt1address;
		
		prvsInstgAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		//if((prvsInstgAgt1pstladdress && !prvsInstgAgt1name) || (!prvsInstgAgt1pstladdress && prvsInstgAgt1name))
		if(prvsInstgAgt1pstladdress && !prvsInstgAgt1name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("379", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
		var prvsInstgAgt2name;
		var prvsInstgAgt2pstladdress;
		var prvsInstgAgt2address;
		
		prvsInstgAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		//if((prvsInstgAgt2pstladdress && !prvsInstgAgt2name) || (!prvsInstgAgt2pstladdress && prvsInstgAgt2name))
		if(prvsInstgAgt2pstladdress && !prvsInstgAgt2name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("427", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
		var prvsInstgAgt3name;
		var prvsInstgAgt3pstladdress;
		var prvsInstgAgt3address;
		
		prvsInstgAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		//if((prvsInstgAgt3pstladdress && !prvsInstgAgt3name) || (!prvsInstgAgt3pstladdress && prvsInstgAgt3name))
		if(prvsInstgAgt3pstladdress && !prvsInstgAgt3name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("475", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
		var intrmyAgt1name;
		var intrmyAgt1pstladdress;
		var intrmyAgt1address;
		
		intrmyAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		//if((intrmyAgt1pstladdress && !intrmyAgt1name) || (!intrmyAgt1pstladdress && intrmyAgt1name))
		if(intrmyAgt1pstladdress && !intrmyAgt1name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("549", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
		var intrmyAgt2name;
		var intrmyAgt2pstladdress;
		var intrmyAgt2address;
		
		intrmyAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		//if((intrmyAgt2pstladdress && !intrmyAgt2name) || (!intrmyAgt2pstladdress && intrmyAgt2name))
		if(intrmyAgt2pstladdress && !intrmyAgt2name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("597", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
		var intrmyAgt3name;
		var intrmyAgt3pstladdress;
		var intrmyAgt3address;
		
		intrmyAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		//if((intrmyAgt3pstladdress && !intrmyAgt3name) || (!intrmyAgt3pstladdress && intrmyAgt3name))
		if(intrmyAgt3pstladdress && !intrmyAgt3name)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("645", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<UltmtDbtr>"))
	{
		var ultmtDbtrPath;
		var ultmtDbtr;
		var ultmtDbtrname;
		var ultmtDbtrpstladdress;
		var ultmtDbtraddress;
		
		ultmtDbtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr';
		ultmtDbtr = getValueFromPath(Document, ultmtDbtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/Nm';
		ultmtDbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr';
		ultmtDbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr/AdrLine';
		ultmtDbtraddress = getValueFromPath(Document, path);
		
		if(ultmtDbtrpstladdress && !ultmtDbtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("693", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<InitgPty>"))
	{
		var initgPtyPath;
		var initgPty;
		var initgPtyname;
		var initgPtypstladdress;
		var initgPtyaddress;
		
		initgPtyPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty';
		initgPty = getValueFromPath(Document, initgPtyPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/Nm';
		initgPtyname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr';
		initgPtypstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr/AdrLine';
		initgPtyaddress = getValueFromPath(Document, path);
		
		//if((initgPtypstladdress && !initgPtyname) || (!initgPtypstladdress && initgPtyname))
		if(initgPtypstladdress && !initgPtyname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("736", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPath;
		var dbtr;
		var dbtrname;
		var dbtrpstladdress;
		var dbtraddress;
		
		dbtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr';
		dbtr = getValueFromPath(Document, dbtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Nm';
		dbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr';
		dbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine';
		dbtraddress = getValueFromPath(Document, path);
	
		//if((dbtrpstladdress && !dbtrname) || (!dbtrpstladdress && dbtrname))
		if(dbtrpstladdress && !dbtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("779", "7948", map);
			return retVal;
		}
	}

	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrAgtname;
		var dbtrAgtpstladdress;
		var dbtrAgtaddress;
		
		dbtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
	
		//if((dbtrAgtpstladdress && !dbtrAgtname) || (!dbtrAgtpstladdress && dbtrAgtname))
		if(dbtrAgtpstladdress && !dbtrAgtname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("841", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrAgtname;
		var cdtrAgtpstladdress;
		var cdtrAgtaddress;
		
		cdtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
	
		//if((cdtrAgtpstladdress && !cdtrAgtname) || (!cdtrAgtpstladdress && cdtrAgtname))
		if(cdtrAgtpstladdress && !cdtrAgtname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("889", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPath;
		var cdtr;
		var cdtrname;
		var cdtrpstladdress;
		var cdtraddress;
		
		cdtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr';
		cdtr = getValueFromPath(Document, cdtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Nm';
		cdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr';
		cdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine';
		cdtraddress = getValueFromPath(Document, path);
	
		//if((cdtrpstladdress && !cdtrname) || (!cdtrpstladdress && cdtrname))
		if(cdtrpstladdress && !cdtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("945", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<UltmtCdtr>"))
	{
		var ultmtCdtrPath;
		var ultmtCdtr;
		var ultmtCdtrname;
		var ultmtCdtrpstladdress;
		var ultmtCdtraddress;
		
		ultmtCdtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr';
		ultmtCdtr = getValueFromPath(Document, ultmtCdtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/Nm';
		ultmtCdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr';
		ultmtCdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr/AdrLine';
		ultmtCdtraddress = getValueFromPath(Document, path);
		
		if(ultmtCdtrpstladdress && !ultmtCdtrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1007", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<invcr>"))
	{
		var invcrPath;
		var invcr;
		var invcrname;
		var invcrpstladdress;
		var invcraddress;
		
		invcrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr';
		invcr = getValueFromPath(Document, invcrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Nm';
		invcrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr';
		invcrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/AdrLine';
		invcraddress = getValueFromPath(Document, path);
		
		//if((invcrpstladdress && !invcrname) || (!invcrpstladdress && invcrname))
		if(invcrpstladdress && !invcrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1214", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Invcee>"))
	{
		var invceePath;
		var invcee;
		var invceename;
		var invceepstladdress;
		var invceeaddress;
		
		invceePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee';
		invcee = getValueFromPath(Document, invceePath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Nm';
		invceename = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr';
		invceepstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/AdrLine';
		invceeaddress = getValueFromPath(Document, path);
		
		//if((invceepstladdress && !invceename) || (!invceepstladdress && invceename))
		if(invceepstladdress && !invceename)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1257", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Grnshee>"))
	{
		var grnsheePath;
		var grnshee;
		var grnsheename;
		var grnsheepstladdress;
		var grnsheeaddress;
		
		grnsheePath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee';
		grnshee = getValueFromPath(Document, grnsheePath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Nm';
		grnsheename = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr';
		grnsheepstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/AdrLine';
		grnsheeaddress = getValueFromPath(Document, path);
		
		//if((grnsheepstladdress && !grnsheename) || (!grnsheepstladdress && grnsheename))
		if(grnsheepstladdress && !grnsheename)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1399", "7948", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<GrnshmtAdmstr>"))
	{
		var grnshmtAdmstrPath;
		var grnshmtAdmstr;
		var grnshmtAdmstrname;
		var grnshmtAdmstrpstladdress;
		var grnshmtAdmstraddress;
		
		grnshmtAdmstrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr';
		grnshmtAdmstr = getValueFromPath(Document, grnshmtAdmstrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Nm';
		grnshmtAdmstrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr';
		grnshmtAdmstrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/AdrLine';
		grnshmtAdmstraddress = getValueFromPath(Document, path);

		//if((grnshmtAdmstrpstladdress && !grnshmtAdmstrname) || (!grnshmtAdmstrpstladdress && grnshmtAdmstrname))
		if(grnshmtAdmstrpstladdress && !grnshmtAdmstrname)
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1442", "7948", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validatePostalAddressRule2FedPacs008(Document, map) {  //R18 R23 R27 
	logger.info("In validatePostalAddressRule2FedPacs008");
	
	var path;
	var retVal = 0;
	var message = inMsg.getBody(java.lang.String.class);
	
	if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
		var prvsInstgAgt1name;
		var prvsInstgAgt1address;
		var prvsInstgAgt1dept;
		var prvsInstgAgt1strtnm;
		var prvsInstgAgt1bldgnm;
		var prvsInstgAgt1postbox;
		var prvsInstgAgt1room;
		var prvsInstgAgt1postlcd;
		var prvsInstgAgt1twnnm;
		var prvsInstgAgt1dstrctLocnm;
		var prvsInstgAgt1dstrctnm;
		var prvsInstgAgt1cntrySubdiv;
		var prvsInstgAgt1cntry;
		prvsInstgAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/Nm';
		prvsInstgAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt1dept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt1strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt1bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt1postbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Room';
		prvsInstgAgt1room = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt1postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt1dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt1dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt1cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt1cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt1address && (prvsInstgAgt1dept || prvsInstgAgt1strtnm || prvsInstgAgt1bldgnm || prvsInstgAgt1postbox && prvsInstgAgt1room || prvsInstgAgt1postlcd || prvsInstgAgt1twnnm || prvsInstgAgt1dstrctLocnm || prvsInstgAgt1dstrctnm || prvsInstgAgt1cntrySubdiv || prvsInstgAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("379", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
		var prvsInstgAgt2name;
		var prvsInstgAgt2address;
		var prvsInstgAgt2dept;
		var prvsInstgAgt2strtnm;
		var prvsInstgAgt2bldgnm;
		var prvsInstgAgt2postbox;
		var prvsInstgAgt2room;
		var prvsInstgAgt2postlcd;
		var prvsInstgAgt2twnnm;
		var prvsInstgAgt2dstrctLocnm;
		var prvsInstgAgt2dstrctnm;
		var prvsInstgAgt2cntrySubdiv;
		var prvsInstgAgt2cntry;
		
		prvsInstgAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/Nm';
		prvsInstgAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt2dept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt2strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt2bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Room';
		prvsInstgAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt2cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt2address && (prvsInstgAgt2dept || prvsInstgAgt2strtnm || prvsInstgAgt2bldgnm || prvsInstgAgt2postbox || prvsInstgAgt2room || prvsInstgAgt2postlcd || prvsInstgAgt2twnnm || prvsInstgAgt2dstrctLocnm || prvsInstgAgt2dstrctnm || prvsInstgAgt2cntrySubdiv || prvsInstgAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("427", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
		var prvsInstgAgt3name;
		var prvsInstgAgt3address;
		var prvsInstgAgt3dept;
		var prvsInstgAgt3strtnm;
		var prvsInstgAgt3bldgnm;
		var prvsInstgAgt3postbox;
		var prvsInstgAgt3room;
		var prvsInstgAgt3postlcd;
		var prvsInstgAgt3twnnm;
		var prvsInstgAgt3dstrctLocnm;
		var prvsInstgAgt3dstrctnm;
		var prvsInstgAgt3cntrySubdiv;
		var prvsInstgAgt3cntry;
	
		prvsInstgAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/Nm';
		prvsInstgAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Dept';
		prvsInstgAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/StrtNm';
		prvsInstgAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/BldgNb';
		prvsInstgAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstBx';
		prvsInstgAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Room';
		prvsInstgAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/PstCd';
		prvsInstgAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		prvsInstgAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/DstrctNm';
		prvsInstgAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		prvsInstgAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt3cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt3address && (prvsInstgAgt3dept || prvsInstgAgt3strtnm || prvsInstgAgt3bldgnm || prvsInstgAgt3postbox || prvsInstgAgt3room || prvsInstgAgt3postlcd || prvsInstgAgt3twnnm || prvsInstgAgt3dstrctLocnm || prvsInstgAgt3dstrctnm || prvsInstgAgt3cntrySubdiv || prvsInstgAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("475", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
		var intrmyAgt1name;
		var intrmyAgt1address;
		var intrmyAgt1dept;
		var intrmyAgt1strtnm;
		var intrmyAgt1bldgnm;
		var intrmyAgt1postbox;
		var intrmyAgt1room;
		var intrmyAgt1postlcd;
		var intrmyAgt1twnnm;
		var intrmyAgt1dstrctLocnm;
		var intrmyAgt1dstrctnm;
		var intrmyAgt1cntrySubdiv;
		var intrmyAgt1cntry;
		
		intrmyAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/Nm';
		intrmyAgt1name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Dept';
		intrmyAgt1dept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt1strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt1bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstBx';
		intrmyAgt1postbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Room';
		intrmyAgt1room = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/PstCd';
		intrmyAgt1postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt1dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt1dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt1cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		intrmyAgt1cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt1address && (intrmyAgt1dept || intrmyAgt1strtnm || intrmyAgt1bldgnm || intrmyAgt1postbox || intrmyAgt1room || intrmyAgt1postlcd || intrmyAgt1twnnm || intrmyAgt1dstrctLocnm || intrmyAgt1dstrctnm || intrmyAgt1cntrySubdiv || intrmyAgt1cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("549", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
		var intrmyAgt2name;
		var intrmyAgt2address;
		var intrmyAgt2dept;
		var intrmyAgt2strtnm;
		var intrmyAgt2bldgnm;
		var intrmyAgt2postbox;
		var intrmyAgt2room;
		var intrmyAgt2postlcd;
		var intrmyAgt2twnnm;
		var intrmyAgt2dstrctLocnm;
		var intrmyAgt2dstrctnm;
		var intrmyAgt2cntrySubdiv;
		var intrmyAgt2cntry;
		
		intrmyAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/Nm';
		intrmyAgt2name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Dept';
		intrmyAgt2dept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt2strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt2bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstBx';
		intrmyAgt2postbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Room';
		intrmyAgt2room = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/PstCd';
		intrmyAgt2postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt2dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt2dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt2cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		intrmyAgt2cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt2address && (intrmyAgt2dept || intrmyAgt2strtnm || intrmyAgt2bldgnm || intrmyAgt2postbox || intrmyAgt2room || intrmyAgt2postlcd || intrmyAgt2twnnm || intrmyAgt2dstrctLocnm || intrmyAgt2dstrctnm || intrmyAgt2cntrySubdiv || intrmyAgt2cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("597", "7928", map);
			return retVal;
		}
	}
		
	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
		var intrmyAgt3name;
		var intrmyAgt3address;
		var intrmyAgt3dept;
		var intrmyAgt3strtnm;
		var intrmyAgt3bldgnm;
		var intrmyAgt3postbox;
		var intrmyAgt3room;
		var intrmyAgt3postlcd;
		var intrmyAgt3twnnm;
		var intrmyAgt3dstrctLocnm;
		var intrmyAgt3dstrctnm;
		var intrmyAgt3cntrySubdiv;
		var intrmyAgt3cntry;
		
		intrmyAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/Nm';
		intrmyAgt3name = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Dept';
		intrmyAgt3dept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/StrtNm';
		intrmyAgt3strtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/BldgNb';
		intrmyAgt3bldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstBx';
		intrmyAgt3postbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Room';
		intrmyAgt3room = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/PstCd';
		intrmyAgt3postlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnLctnNm';
		intrmyAgt3dstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/DstrctNm';
		intrmyAgt3dstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/CtrySubDvsn';
		intrmyAgt3cntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		intrmyAgt3cntry = getValueFromPath(Document, path);

		if(intrmyAgt3address && (intrmyAgt3dept || intrmyAgt3strtnm || intrmyAgt3bldgnm || intrmyAgt3postbox || intrmyAgt3room || intrmyAgt3postlcd || intrmyAgt3twnnm || intrmyAgt3dstrctLocnm || intrmyAgt3dstrctnm || intrmyAgt3cntrySubdiv || intrmyAgt3cntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("645", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPath;
		var dbtr;
		var dbtrname;
		var dbtraddress;
		var dbtrdept;
		var dbtrstrtnm;
		var dbtrbldgnm;
		var dbtrpostbox;
		var dbtrroom;
		var dbtrpostlcd;
		var dbtrtwnnm;
		var dbtrdstrctLocnm;
		var dbtrdstrctnm;
		var dbtrcntrySubdiv;
		var dbtrcntry;
		
		dbtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr';
		dbtr = getValueFromPath(Document, dbtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Nm';
		dbtrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine';
		dbtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Dept';
		dbtrdept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/StrtNm';
		dbtrstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/BldgNb';
		dbtrbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/PstBx';
		dbtrpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Room';
		dbtrroom = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/PstCd';
		dbtrpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnNm';
		dbtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnLctnNm';
		dbtrdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/DstrctNm';
		dbtrdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/CtrySubDvsn';
		dbtrcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Ctry';
		dbtrcntry = getValueFromPath(Document, path);
	
		if(dbtraddress && (dbtrdept || dbtrstrtnm || dbtrbldgnm || dbtrpostbox || dbtrroom || dbtrpostlcd || dbtrtwnnm || dbtrdstrctLocnm || dbtrdstrctnm || dbtrcntrySubdiv || dbtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("779", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrAgtname;
		var dbtrAgtaddress;
		var dbtrAgtdept;
		var dbtrAgtstrtnm;
		var dbtrAgtbldgnm;
		var dbtrAgtpostbox;
		var dbtrAgtroom;
		var dbtrAgtpostlcd;
		var dbtrAgttwnnm;
		var dbtrAgtdstrctLocnm;
		var dbtrAgtdstrctnm;
		var dbtrAgtcntrySubdiv;
		var dbtrAgtcntry;
		
		dbtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm';
		dbtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Dept';
		dbtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/StrtNm';
		dbtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/BldgNb';
		dbtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstBx';
		dbtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Room';
		dbtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/PstCd';
		dbtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		dbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		dbtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/DstrctNm';
		dbtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		dbtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		dbtrAgtcntry = getValueFromPath(Document, path);
	
		if(dbtrAgtaddress && (dbtrAgtdept || dbtrAgtstrtnm || dbtrAgtbldgnm || dbtrAgtpostbox || dbtrAgtroom || dbtrAgtpostlcd || dbtrAgttwnnm || dbtrAgtdstrctLocnm || dbtrAgtdstrctnm || dbtrAgtcntrySubdiv || dbtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("841", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrAgtname;
		var cdtrAgtaddress;
		var cdtrAgtdept;
		var cdtrAgtstrtnm;
		var cdtrAgtbldgnm;
		var cdtrAgtpostbox;
		var cdtrAgtroom;
		var cdtrAgtpostlcd;
		var cdtrAgttwnnm;
		var cdtrAgtdstrctLocnm;
		var cdtrAgtdstrctnm;
		var cdtrAgtcntrySubdiv;
		var cdtrAgtcntry;
		
		cdtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/Nm';
		cdtrAgtname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Dept';
		cdtrAgtdept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/StrtNm';
		cdtrAgtstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/BldgNb';
		cdtrAgtbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstBx';
		cdtrAgtpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Room';
		cdtrAgtroom = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/PstCd';
		cdtrAgtpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		cdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnLctnNm';
		cdtrAgtdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/DstrctNm';
		cdtrAgtdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/CtrySubDvsn';
		cdtrAgtcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		cdtrAgtcntry = getValueFromPath(Document, path);
	
		if(cdtrAgtaddress && (cdtrAgtdept || cdtrAgtstrtnm || cdtrAgtbldgnm || cdtrAgtpostbox || cdtrAgtroom || cdtrAgtpostlcd || cdtrAgttwnnm || cdtrAgtdstrctLocnm || cdtrAgtdstrctnm || cdtrAgtcntrySubdiv || cdtrAgtcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("889", "7928", map);
			return retVal;
		}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPath;
		var cdtr;
		var cdtrname;
		var cdtraddress;
		var cdtrdept;
		var cdtrstrtnm;
		var cdtrbldgnm;
		var cdtrpostbox;
		var cdtrroom;
		var cdtrpostlcd;
		var cdtrtwnnm;
		var cdtrdstrctLocnm;
		var cdtrdstrctnm;
		var cdtrcntrySubdiv;
		var cdtrcntry;
		
		cdtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr';
		cdtr = getValueFromPath(Document, cdtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Nm';
		cdtrname = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine';
		cdtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Dept';
		cdtrdept = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/StrtNm';
		cdtrstrtnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/BldgNb';
		cdtrbldgnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/PstBx';
		cdtrpostbox = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Room';
		cdtrroom = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/PstCd';
		cdtrpostlcd = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnNm';
		cdtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnLctnNm';
		cdtrdstrctLocnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/DstrctNm';
		cdtrdstrctnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/CtrySubDvsn';
		cdtrcntrySubdiv = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Ctry';
		cdtrcntry = getValueFromPath(Document, path);
	
		if(cdtraddress && (cdtrdept || cdtrstrtnm || cdtrbldgnm || cdtrpostbox || cdtrroom || cdtrpostlcd || cdtrtwnnm || cdtrdstrctLocnm || cdtrdstrctnm || cdtrcntrySubdiv || cdtrcntry))
		{
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("945", "7928", map);
			return retVal;
		}
	}
	
	return retVal;
	
}

function validatePostalAddressRule3FedPacs008(Document, map) {  //R19 R24 R28
	logger.info("In validatePostalAddressRule3FedPacs008");

	var path;
	var address;
	var chrgsInf;
	var chrgsInfPath;
	var twnnm;
	var cntry;
	var pstladdress;
	var retVal = 0;
	
	var message = inMsg.getBody(java.lang.String.class);
	
	chrgsInfPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf';
	chrgsInf = getValueFromPath(Document, chrgsInfPath);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr';
	pstladdress = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/AdrLine';
	address = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/TwnNm';
	twnnm = getValueFromPath(Document, path);
	
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgsInf/Agt/FinInstnId/PstlAdr/Ctry';
	cntry = getValueFromPath(Document, path);
		
	if(isPatternPresent(message, "<ChrgsInf>"))
	{
		if(pstladdress)
		{
			if(!address && (!twnnm || !cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("347", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt1>"))
	{
		var prvsInstgAgt1Path;
		var prvsInstgAgt1;
		var prvsInstgAgt1pstladdress;
		var prvsInstgAgt1address;
		var prvsInstgAgt1twnnm;
		var prvsInstgAgt1cntry;
		
		prvsInstgAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1';
		prvsInstgAgt1 = getValueFromPath(Document, prvsInstgAgt1Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr';
		prvsInstgAgt1pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt1address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt1twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt1/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt1cntry = getValueFromPath(Document, path);
		
		if(prvsInstgAgt1pstladdress)
		{
			if(!prvsInstgAgt1address && (!prvsInstgAgt1twnnm || !prvsInstgAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("379", "7926", map);
				return retVal;
			}
		}
	}
		
	if(isPatternPresent(message, "<PrvsInstgAgt2>"))
	{
		var prvsInstgAgt2Path;
		var prvsInstgAgt2;
		var prvsInstgAgt2pstladdress;
		var prvsInstgAgt2address;
		var prvsInstgAgt2twnnm;
		var prvsInstgAgt2cntry;
		
		prvsInstgAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2';
		prvsInstgAgt2 = getValueFromPath(Document, prvsInstgAgt2Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr';
		prvsInstgAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt2/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt2cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt2pstladdress)
		{
			if(!prvsInstgAgt2address && (!prvsInstgAgt2twnnm || !prvsInstgAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("427", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<PrvsInstgAgt3>"))
	{
		var prvsInstgAgt3Path;
		var prvsInstgAgt3;
		var prvsInstgAgt3pstladdress;
		var prvsInstgAgt3address;
		var prvsInstgAgt3twnnm;
		var prvsInstgAgt3cntry;
		
		prvsInstgAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3';
		prvsInstgAgt3 = getValueFromPath(Document, prvsInstgAgt3Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr';
		prvsInstgAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/AdrLine';
		prvsInstgAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/TwnNm';
		prvsInstgAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PrvsInstgAgt3/FinInstnId/PstlAdr/Ctry';
		prvsInstgAgt3cntry = getValueFromPath(Document, path);
	
		if(prvsInstgAgt3pstladdress)
		{
			if(!prvsInstgAgt3address && (!prvsInstgAgt3twnnm || !prvsInstgAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("475", "7926", map);
				return retVal;
			}
		}
	}
		
	if(isPatternPresent(message, "<IntrmyAgt1>"))
	{
		var intrmyAgt1Path;
		var intrmyAgt1;
		var intrmyAgt1pstladdress;
		var intrmyAgt1address;
		var intrmyAgt1twnnm;
		var intrmyAgt1cntry;
		
		intrmyAgt1Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1';
		intrmyAgt1 = getValueFromPath(Document, intrmyAgt1Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr';
		intrmyAgt1pstladdress = getValueFromPath(Document, path);
		logger.trace("intrmyAgt1pstladdress = " + intrmyAgt1pstladdress);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt1address = getValueFromPath(Document, path);
		logger.trace("intrmyAgt1address = " + intrmyAgt1address);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt1twnnm = getValueFromPath(Document, path);
		logger.trace("intrmyAgt1twnnm = " + intrmyAgt1twnnm);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt1/FinInstnId/PstlAdr/Ctry';
		intrmyAgt1cntry = getValueFromPath(Document, path);
		logger.trace("intrmyAgt1cntry = " + intrmyAgt1cntry);
	
		if(intrmyAgt1pstladdress)
		{
			if(!intrmyAgt1address && (!intrmyAgt1twnnm || !intrmyAgt1cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("549", "7926", map);
				return retVal;
			}
		}
	}
		
	if(isPatternPresent(message, "<IntrmyAgt2>"))
	{
		var intrmyAgt2Path;
		var intrmyAgt2;
		var intrmyAgt2pstladdress;
		var intrmyAgt2address;
		var intrmyAgt2twnnm;
		var intrmyAgt2cntry;
		
		intrmyAgt2Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2';
		intrmyAgt2 = getValueFromPath(Document, intrmyAgt2Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr';
		intrmyAgt2pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt2address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt2twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt2/FinInstnId/PstlAdr/Ctry';
		intrmyAgt2cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt2pstladdress)
		{
			if(!intrmyAgt2address && (!intrmyAgt2twnnm || !intrmyAgt2cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("597", "7926", map);
				return retVal;
			}
		}
	}
		
	if(isPatternPresent(message, "<IntrmyAgt3>"))
	{
		var intrmyAgt3Path;
		var intrmyAgt3;
		var intrmyAgt3pstladdress;
		var intrmyAgt3address;
		var intrmyAgt3twnnm;
		var intrmyAgt3cntry;
		
		intrmyAgt3Path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3';
		intrmyAgt3 = getValueFromPath(Document, intrmyAgt3Path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr';
		intrmyAgt3pstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/AdrLine';
		intrmyAgt3address = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/TwnNm';
		intrmyAgt3twnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrmyAgt3/FinInstnId/PstlAdr/Ctry';
		intrmyAgt3cntry = getValueFromPath(Document, path);
	
		if(intrmyAgt3pstladdress)
		{
			if(!intrmyAgt3address && (!intrmyAgt3twnnm || !intrmyAgt3cntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("645", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<Dbtr>"))
	{
		var dbtrPath;
		var dbtr;
		var dbtrpstladdress;
		var dbtraddress;
		var dbtrtwnnm;
		var dbtrcntry;
		
		dbtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr';
		dbtr = getValueFromPath(Document, dbtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr';
		dbtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/AdrLine';
		dbtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/TwnNm';
		dbtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Ctry';
		dbtrcntry = getValueFromPath(Document, path);
	
		if(dbtrpstladdress)
		{
			if(!dbtraddress && (!dbtrtwnnm || !dbtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("779", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<DbtrAgt>"))
	{
		var dbtrAgtPath;
		var dbtrAgt;
		var dbtrAgtpstladdress;
		var dbtrAgtaddress;
		var dbtrAgttwnnm;
		var dbtrAgtcntry;
		
		dbtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt';
		dbtrAgt = getValueFromPath(Document, dbtrAgtPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr';
		dbtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/AdrLine';
		dbtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/TwnNm';
		dbtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/PstlAdr/Ctry';
		dbtrAgtcntry = getValueFromPath(Document, path);
	
		if(dbtrAgtpstladdress)
		{
			if(!dbtrAgtaddress && (!dbtrAgttwnnm || !dbtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("841", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<CdtrAgt>"))
	{
		var cdtrAgtPath;
		var cdtrAgt;
		var cdtrAgtpstladdress;
		var cdtrAgtaddress;
		var cdtrAgttwnnm;
		var cdtrAgtcntry;
		
		cdtrAgtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt';
		cdtrAgt = getValueFromPath(Document, cdtrAgtPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr';
		cdtrAgtpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/AdrLine';
		cdtrAgtaddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/TwnNm';
		cdtrAgttwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/PstlAdr/Ctry';
		cdtrAgtcntry = getValueFromPath(Document, path);
	
		if(cdtrAgtpstladdress)
		{
			if(!cdtrAgtaddress && (!cdtrAgttwnnm || !cdtrAgtcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("889", "7926", map);
				return retVal;
			}
		}
	}
	
	if(isPatternPresent(message, "<Cdtr>"))
	{
		var cdtrPath;
		var cdtr;
		var cdtrpstladdress;
		var cdtraddress;
		var cdtrtwnnm;
		var cdtrcntry;
		
		cdtrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr';
		cdtr = getValueFromPath(Document, cdtrPath);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr';
		cdtrpstladdress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/AdrLine';
		cdtraddress = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/TwnNm';
		cdtrtwnnm = getValueFromPath(Document, path);
		
		path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Ctry';
		cdtrcntry = getValueFromPath(Document, path);
	
		if(cdtrpstladdress)
		{
			if(!cdtraddress && (!cdtrtwnnm || !cdtrcntry))
			{
				setHeader(map, "PLCN_validMessage", false);
				retVal = setCommentsForTransaction("945", "7926", map);
				return retVal;
			}
		}
	}
	
	return retVal;
	
}

function validateRemittanceInformationRule1FedPacs008(Document, map) {  //R71
	logger.info("In validateRemittanceInformationRule1FedPacs008");
	
	var ustrdPath;
	var ustrd;
	var strdpath;
	var strd;
	var retVal = 0;
	
	ustrdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Ustrd';
	ustrd = getValueFromPath(Document, ustrdPath);
	
	strdpath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd';
	strd = getValueFromPath(Document, strdpath);
	
	if(ustrd && strd) 
	{
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1110", "7635", map);
		return retVal;
	}
	return retVal;
}

