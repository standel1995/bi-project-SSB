/* This function calls wrapperLynxPacs008Mx function. */
function msgValidationLynxPacs008(exchange) {
	logger.trace("msgValidationLynxPacs008");
	var result;
	var inMsg;
	var map;

	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	logger.trace("In msgValidationLynxPacs008");

	setHeader(map, "txnForceStopCounter", 0);
	setHeader(map, "errorCountAdd", "Y"); //for testing
	logger.trace("errorCountAdd: " + getHeader(map,"errorCountAdd"));
	setHeader(map,"PLCN_validMessage", true);
	setHeader(map, "validFlag", true);
	
	wrapperCbprPacs008Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	wrapperLynxPacs008Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationLynxPacs008: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "repair");
	}
}

function wrapperLynxPacs008Mx(exchange) {
	logger.trace("wrapperLynxPacs008Mx");
	var retVal;
	var commentsB2b;
	var pacs08ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.trace('wrapperLynxPacs008Mx:In wrapperLynxPacs008Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pacs08ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS08_VALD_FLAG_MX");
	pacs08ValdFlagMx = pacs08ValdFlagMx.trim();
	logger.trace("pacs08ValdFlagMx = " + pacs08ValdFlagMx);

	if(pacs08ValdFlagMx == 'ERROR') {

		logger.trace("wrapperLynxPacs008Mx: Calling LynxValidationRulesPacs008");
		retVal = lynxValidationRulesPacs008(pacs08ValdFlagMx, exchange);
		logger.trace("wrapperLynxPacs008Mx: retVal from LynxValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperLynxPacs008Mx: txnComments = " + txnComments);

	}

	if(pacs08ValdFlagMx == 'WARNING') {

		logger.trace("wrapperLynxPacs008Mx: Calling lynxValidationRulesPacs008");
		retVal = lynxValidationRulesPacs008(pacs08ValdFlagMx, exchange);
		logger.trace("wrapperlynxPacs008Mx: retVal from lynxValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.trace("wrapperlynxPacs008Mx: txnComments = " + txnComments);
		
	}
}

function lynxValidationRulesPacs008(pacs08ValdFlagMx, exchange){
	logger.trace("lynxValidationRulesPacs008");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	if(pacs08ValdFlagMx == "ERROR") {
		logger.trace("inside if loop");
		retVal = lynxInstructionForCreditorCodeRulePacs8(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = lynxTextualLocalInstrumentPacs8(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
		retVal = country_of_Residence_rule2025_pacs008(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
	}
	return retVal;
}

function lynxInstructionForCreditorCodeRulePacs8(exchange){
	logger.trace("In lynxInstructionForCreditorCodeRulePacs8");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var cdValue;
	var cdPath;
	var cdPath1;
	var lynxFlag;
	
	var retVal = 0;
	
	cdPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstrForCdtrAgt/Cd";
	logger.trace("cdPath = " + cdPath);
	cdValue1 = getValueFromPath(Document, cdPath);
	logger.trace("cdValue1 = " + cdValue1);
	
	cdPath1 = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstrForCdtrAgt[2]/Cd";
	logger.trace("cdPath1 = " + cdPath1);
	cdValue2 = getValueFromPath(Document, cdPath1);
	logger.trace("cdValue2 = " + cdValue2);
	
	if(cdValue1 && cdValue2)
	{
		if(cdValue1 == cdValue2)
		{
			setHeader(map, "PLCN_validMessage",false);
			setHeader(map, "PLCN_validMessage","false");
			retVal = setCommentsForTransaction("1050", "1229", map);  /* need to check violation  */
			return retVal;
		}
	}
	
	return retVal;
}

function lynxTextualLocalInstrumentPacs8(exchange){
	logger.trace("In lynxTextualLocalInstrumentPacs8");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var lclInstrmPath;
	var lclInstrm;
	var temp;
	var settlemntMec;
	var settlemntPrio;
	var lynxFlag;
	
	var retVal = 0;
	
	lclInstrmPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Prtry";
	logger.trace("lclInstrmPath = " + lclInstrmPath);
	lclInstrm = getValueFromPath(Document, lclInstrmPath);
	logger.trace("lclInstrm = " + lclInstrm);

	if(lclInstrm)
	{
		temp = lclInstrm;
		logger.trace("lclInstrm = " + lclInstrm);
		/* settlemntMec = temp.substr(0,1);
		logger.trace("settlemntMec = " + settlemntMec);
		
		settlemntPrio = temp.substr(1,2);
		logger.trace("settlemntPrio = " + settlemntPrio); */
		
			if(!(lclInstrm == "1" || lclInstrm == "2" || lclInstrm == "R" || lclInstrm == "201" || lclInstrm == "203" || lclInstrm == "205"))
			{
				logger.trace("in for loop");
				setHeader(map, "PLCN_validMessage",false);
				setHeader(map, "PLCN_validMessage","false");
				retVal = setCommentsForTransaction("316", "1229", map);  /* need to check violation  */
				return retVal;
			}
		
		
		/*if(settlemntMec)
		{
			if(settlemntMec != "1" || settlemntMec != "2" || settlemntMec != "R")
			{
				setHeader(map, "PLCN_validMessage",false);
				setHeader(map, "PLCN_validMessage","false");
				retVal = setCommentsForTransaction("29", "1229", map);
				return retVal;
			}
		}
		
		if(settlemntPrio)
		{
			if(settlemntPrio != "01" || settlemntPrio != "03" || settlemntPrio != "05")
			{
				setHeader(map, "PLCN_validMessage",false);
				setHeader(map, "PLCN_validMessage","false");
				retVal = setCommentsForTransaction("29", "1229", map);
				return retVal;
			}
		}*/	
	}
	return retVal;
}

/* This function calls wrapperLynxPacs009Mx function. */
function msgValidationLynxPacs009(exchange) {
	var result;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.trace("In msgValidationLynxPacs009");

	setHeader(map, "txnForceStopCounter", 0);
	setHeader(map, "errorCountAdd", "Y"); //for testing
	logger.trace("errorCountAdd: " + getHeader(map,"errorCountAdd"));
	setHeader(map,"PLCN_validMessage", true);
	setHeader(map, "validFlag", true);

	wrapperCbprPacs009Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));
	
	wrapperLynxPacs009Mx(exchange);
	logger.trace("PLCN_validMessage = " + getHeader(map,"PLCN_validMessage"));

	result = getHeader(map, "PLCN_validMessage");
	logger.trace("In msgValidationLynxPacs009: PLCN_validMessage = " + result);

	if(result) {
		setHeader(map, "status", "valid");
	}else {
		setHeader(map, "status", "repair");
	}
}

function wrapperLynxPacs009Mx(exchange) {
	var retVal = 0;
	var pacs09ValdFlag;

	logger.trace('wrapperLynxPacs009Mx:In wrapperLynxPacs009Mx');
	
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	pacs09ValdFlag = memTblGetTableValue(map, "FLAG-TABLE", "PACS09_VALD_FLAG_MX");

	if(pacs09ValdFlag = "ERROR") {
		retVal = lynxValidationRulesPacs009(pacs09ValdFlag, exchange);
		logger.trace("lynxValidationRulesPacs009: Out of lynxValidationRulesPacs009");
	}

	if(pacs09ValdFlag = "WARNING") {
		retVal = lynxValidationRulesPacs009(pacs09ValdFlag, exchange);	
	}
}

function lynxValidationRulesPacs009(pacs09ValdFlag, exchange){
	logger.trace("lynxValidationRulesPacs009");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	if(pacs09ValdFlag == "ERROR") {
		logger.trace("inside if loop");

		retVal = lynxTextualLocalInstrumentPacs9(exchange);
		if(retVal != 0) {
			return retVal;
		}
		
	}
	return retVal;
}

function lynxTextualLocalInstrumentPacs9(exchange){
	logger.trace("In lynxTextualLocalInstrumentPacs9");
	
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	var lclInstrmPath;
	var lclInstrm;
	var temp;
	var settlemntMec;
	var settlemntPrio;
	var lynxFlag;
	
	var retVal = 0;
	
	
	lclInstrmPath = "/Document/FICdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Prtry";
	logger.trace("lclInstrmPath = " + lclInstrmPath);
	lclInstrm = getValueFromPath(Document, lclInstrmPath);
	logger.trace("lclInstrm = " + lclInstrm);

	if(lclInstrm)
	{
		logger.trace("lclInstrm = " + lclInstrm);
		if(!(lclInstrm == "1" || lclInstrm == "2" || lclInstrm == "R" || lclInstrm == "201" || lclInstrm == "203" || lclInstrm == "205"))
			{
				logger.trace("in for loop");
				setHeader(map, "PLCN_validMessage",false);
				setHeader(map, "PLCN_validMessage","false");
				retVal = setCommentsForTransaction("178", "1229", map);  /* need to check violation  */
				return retVal;
			}
		/* lclInstrm = temp;
		logger.trace("lclInstrm = " + lclInstrm);
		settlemntMec = temp.substr(0,1);
		logger.trace("settlemntMec = " + settlemntMec);
		
		settlemntPrio = temp.substr(1,2);
		logger.trace("settlemntPrio = " + settlemntPrio);
		
		if(settlemntMec)
		{
			if(settlemntMec != "1" || settlemntMec != "2" || settlemntMec != "R")
			{
				setHeader(map, "PLCN_validMessage",false);
				setHeader(map, "PLCN_validMessage","false");
				retVal = setCommentsForTransaction("29", "1229", map);  /* need to check violation  */
				/* return retVal;
			}
		}
		
		if(settlemntPrio)
		{
			if(settlemntPrio != "01" || settlemntPrio != "03" || settlemntPrio != "05")
			{
				setHeader(map, "PLCN_validMessage",false);
				setHeader(map, "PLCN_validMessage","false");
				retVal = setCommentsForTransaction("29", "1229", map);  /* need to check violation  
				return retVal;
			}
		} */ 	
	}
	return retVal;	
}

function country_of_Residence_rule2025_pacs008(exchange){
	logger.trace("In country_of_Residence_rule2025");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var lclInstrmPath;
	var lclInstrm;
	var temp;
	var settlemntMec;
	var settlemntPrio;
	var lynxFlag;
	
	var retVal = 0;
	
	//CreditTransferTransactionInformation/Creditor/CountryOfResidence
	//CreditTransferTransactionInformation/Debtor/CountryOfResidence
	//CreditTransferTransactionInformation/InitiatingParty/CountryOfResidence
	//CreditTransferTransactionInformation/UltimateCreditor/CountryOfResidence
	//CreditTransferTransactionInformation/UltimateDebtor/CountryOfResidence
	//CreditTransferTransactionInformation/RemittanceInformation/Structured/Invoicee/CountryOfResidence
	//CreditTransferTransactionInformation/RemittanceInformation/Structured/Invoicer/CountryOfResidence
	//CreditTransferTransactionInformation/RemittanceInformation/Structured/GarnishmentRemittance/Garnishee/CountryOfResidence
	//CreditTransferTransactionInformation/RemittanceInformation/Structured/GarnishmentRemittance/GarnishmentAdministrator/CountryOfResidence
	
	
	var cdtrCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/CtryOfRes';
	logger.trace("cdtrCtryResPath = " + cdtrCtryResPath);
	var cdtrCtryRes = getValueFromPath(Document, cdtrCtryResPath);
	logger.trace("cdtrCtryRes = " + cdtrCtryRes);
	var cdtrPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/Ctry';
	logger.trace("cdtrPstlCtryPath = " + cdtrPstlCtryPath);
	var cdtrPstlCtry = getValueFromPath(Document, cdtrPstlCtryPath);
	logger.trace("cdtrPstlCtry = " + cdtrPstlCtry);
	
	if(cdtrCtryRes && cdtrPstlCtry && cdtrCtryRes == cdtrPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("986", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	var dbtrCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/CtryOfRes';
	logger.trace("dbtrCtryResPath = " + dbtrCtryResPath);
	var dbtrCtryRes = getValueFromPath(Document, dbtrCtryResPath);
	logger.trace("dbtrCtryRes = " + dbtrCtryRes);
	var dbtrPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/PstlAdr/Ctry';
	logger.trace("dbtrPstlCtryPath = " + dbtrPstlCtryPath);
	var dbtrPstlCtry = getValueFromPath(Document, dbtrPstlCtryPath);
	logger.trace("dbtrPstlCtry = " + dbtrPstlCtry);
	
	if(dbtrCtryRes && dbtrPstlCtry && dbtrCtryRes == dbtrPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("820", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	
	var initgPtyCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/CtryOfRes';
	logger.trace("initgPtyCtryResPath = " + initgPtyCtryResPath);
	var initgPtyCtryRes = getValueFromPath(Document, initgPtyCtryResPath);
	logger.trace("initgPtyCtryRes = " + initgPtyCtryRes);
	var initgPtyPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InitgPty/PstlAdr/Ctry';
	logger.trace("initgPtyPstlCtryPath = " + initgPtyPstlCtryPath);
	var initgPtyPstlCtry = getValueFromPath(Document, initgPtyPstlCtryPath);
	logger.trace("initgPtyPstlCtry = " + initgPtyPstlCtry);
	
	if(initgPtyCtryRes && initgPtyPstlCtry && initgPtyCtryRes == initgPtyPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("777", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	var ultmtCdtrCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/CtryOfRes';
	logger.trace("ultmtCdtrCtryResPath = " + ultmtCdtrCtryResPath);
	var ultmtCdtrCtryRes = getValueFromPath(Document, ultmtCdtrCtryResPath);
	logger.trace("ultmtCdtrCtryRes = " + ultmtCdtrCtryRes);
	var ultmtCdtrPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtCdtr/PstlAdr/Ctry';
	logger.trace("ultmtCdtrPstlCtryPath = " + ultmtCdtrPstlCtryPath);
	var ultmtCdtrPstlCtry = getValueFromPath(Document, ultmtCdtrPstlCtryPath);
	logger.trace("ultmtCdtrPstlCtry = " + ultmtCdtrPstlCtry);
	
	if(ultmtCdtrCtryRes && ultmtCdtrPstlCtry && ultmtCdtrCtryRes == ultmtCdtrPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("1048", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	
	var ultmtDbtrCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/CtryOfRes';
	logger.trace("ultmtDbtrCtryResPath = " + ultmtDbtrCtryResPath);
	var ultmtDbtrCtryRes = getValueFromPath(Document, ultmtDbtrCtryResPath);
	logger.trace("ultmtDbtrCtryRes = " + ultmtDbtrCtryRes);
	var ultmtDbtrPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/UltmtDbtr/PstlAdr/Ctry';
	logger.trace("ultmtDbtrPstlCtryPath = " + ultmtDbtrPstlCtryPath);
	var ultmtDbtrPstlCtry = getValueFromPath(Document, ultmtDbtrPstlCtryPath);
	logger.trace("ultmtDbtrPstlCtry = " + ultmtDbtrPstlCtry);
	
	if(ultmtDbtrCtryRes && ultmtDbtrPstlCtry && ultmtDbtrCtryRes == ultmtDbtrPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("734", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	
	var invcrCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtryOfRes';
	logger.trace("invcrCtryResPath = " + invcrCtryResPath);
	var invcrCtryRes = getValueFromPath(Document, invcrCtryResPath);
	logger.trace("invcrCtryRes = " + invcrCtryRes);
	var invcrPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/Ctry';
	logger.trace("invcrPstlCtryPath = " + invcrPstlCtryPath);
	var invcrPstlCtry = getValueFromPath(Document, invcrPstlCtryPath);
	logger.trace("invcrPstlCtry = " + invcrPstlCtry);
	
	if(invcrCtryRes && invcrPstlCtry && invcrCtryRes == invcrPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("1255", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	var invceeCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtryOfRes';
	logger.trace("invceeCtryResPath = " + invceeCtryResPath);
	var invceeCtryRes = getValueFromPath(Document, invceeCtryResPath);
	logger.trace("invceeCtryRes = " + invceeCtryRes);
	var invceePstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/Ctry';
	logger.trace("invceePstlCtryPath = " + invceePstlCtryPath);
	var invceePstlCtry = getValueFromPath(Document, invceePstlCtryPath);
	logger.trace("invceePstlCtry = " + invceePstlCtry);
	
	if(invceeCtryRes && invceePstlCtry && invceeCtryRes == invceePstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("1298", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	var grnsheeCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtryOfRes';
	logger.trace("grnsheeCtryResPath = " + grnsheeCtryResPath);
	var grnsheeCtryRes = getValueFromPath(Document, grnsheeCtryResPath);
	logger.trace("grnsheeCtryRes = " + grnsheeCtryRes);
	var grnsheePstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/Ctry';
	logger.trace("grnsheePstlCtryPath = " + grnsheePstlCtryPath);
	var grnsheePstlCtry = getValueFromPath(Document, grnsheePstlCtryPath);
	logger.trace("grnsheePstlCtry = " + grnsheePstlCtry);
	
	if(grnsheeCtryRes && grnsheePstlCtry && grnsheeCtryRes == grnsheePstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("1440", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	
	var grnshmtAdmstrCtryResPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtryOfRes';
	logger.trace("grnshmtAdmstrCtryResPath = " + grnshmtAdmstrCtryResPath);
	var grnshmtAdmstrCtryRes = getValueFromPath(Document, grnshmtAdmstrCtryResPath);
	logger.trace("grnshmtAdmstrCtryRes = " + grnshmtAdmstrCtryRes);
	var grnshmtAdmstrPstlCtryPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/Ctry';
	logger.trace("grnshmtAdmstrPstlCtryPath = " + grnshmtAdmstrPstlCtryPath);
	var grnshmtAdmstrPstlCtry = getValueFromPath(Document, grnshmtAdmstrPstlCtryPath);
	logger.trace("grnshmtAdmstrPstlCtry = " + grnshmtAdmstrPstlCtry);
	
	if(grnshmtAdmstrCtryRes && grnshmtAdmstrPstlCtry && grnshmtAdmstrCtryRes == grnshmtAdmstrPstlCtry)
	{
		setHeader(map, "PLCN_validMessage",false);
		setHeader(map, "PLCN_validMessage","false");
		retVal = setCommentsForTransaction("1483", "7045", map);  /* need to check violation  */
		return retVal;	
	}
	return retVal;
}