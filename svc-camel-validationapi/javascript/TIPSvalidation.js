function orgnlGrpInfoTIPSPacs004Rule(exchange){
	var retVal = 0;
	var orgnlGrpInf2;
	var orgnlGrpInf;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	//var messageBody = inMsg.getBody(java.lang.String.class);


	orgnlGrpInf = isXmlNodePresent4(Document, "PmtRtr","OrgnlGrpInf");
	logger.info("orgnlGrpInfoTIPSPacs004Rule: orgnlGrpInf = " + orgnlGrpInf); 
	orgnlGrpInf2 = isXmlNodePresent(Document, "PmtRtr", "TxInf", "OrgnlGrpInf");
	logger.info("orgnlGrpInfoTIPSPacs004Rule: orgnlGrpInf2 = " + orgnlGrpInf2); 
	var nodes = Document.getElementsByTagName("OrgnlGrpInf"); //Get the <node> tags
	logger.info("orgnlGrpInfoTIPSPacs004Rule: nodes = " + nodes); 
    var amountOfNodes = nodes.length;
	logger.info("orgnlGrpInfoTIPSPacs004Rule: amountOfNodes = " + amountOfNodes); 

	if((amountOfNodes > 1) || (amountOfNodes < 1)){
		setHeader(map, "PLCN_validMessage",false);
		logger.info("orgnlGrpInfoTIPSPacs004Rule: If OriginalGroupInformation is present, then TransactionInformation/OriginalGroupInformation is not allowed.");
		retVal = setCommentsForTransaction("164", "7054", map);	
		return retVal;
	} 
	
	/*if(orgnlGrpInf){
		if(orgnlGrpInf2){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("orgnlGrpInfoTIPSPacs004Rule: If OriginalGroupInformation is present, then TransactionInformation/OriginalGroupInformation is not allowed.");
			retVal = setCommentsForTransaction("164", "7054", map);	
			return retVal;
		}
	} 
	
	if(orgnlGrpInf2){
		if(orgnlGrpInf){
			setHeader(map, "PLCN_validMessage",false);
			logger.info("orgnlGrpInfoTIPSPacs004Rule: If TransactionInformation/OriginalGroupInformation is present, then OriginalGroupInformation is not allowed.");
			retVal = setCommentsForTransaction("167", "7054", map);	
			return retVal;
		}
	}*/ 
	return retVal;
}

function chrgsInfoAndRtrnIntrBkSttlmntAmountRuleTIPSPacs004(exchange) {
	var retVal = 0 ;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	//var messageBody = inMsg.getBody(java.lang.String.class);

	logger.info("In chrgsInfoAndRtrnIntrBkSttlmntAmountRuleTIPSPacs004");
  
  	var res = isXmlNodePresent2(Document, "ChrgsInf");
	logger.info("chrgsInfoAndRtrnIntrBkSttlmntAmountRuleTIPSPacs004: res = " + res);

	if(res == true)
	{
		var res1 = isXmlNodePresent2(Document, "OrgnlIntrBkSttlmAmt");
		logger.info("chrgsInfoAndRtrnIntrBkSttlmntAmountRuleTIPSPacs004: res1 = " + res1);

		var res2 = isXmlNodePresent2(Document, "RtrdIntrBkSttlmAmt");
		logger.info("chrgsInfoAndRtrnIntrBkSttlmntAmountRuleTIPSPacs004: res2 = " + res2);
		
		if(res1 != res2){
			setHeader(map, "PLCN_validMessage",false);
			retVal = setCommentsForTransaction("189", "7925", map);
			return retVal;
		}
	}
	return retVal;
}

// function idCheckRuleTIPS(exchange) {
// 	logger.info("In idCheckRuleTIPS");
// 	var retVal = 0;

// 	var inMsg = exchange.getIn();
// 	var map = inMsg.getHeaders();
// 	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
// 	var messageBody = inMsg.getBody(java.lang.String.class);

// 	//var expression = /^[0-9a-zA-Z\-\?:\(\)\.,'\+](/?([0-9a-zA-Z\-\?:\(\)\.,'\+ ]/?)*[0-9a-zA-Z\-\?:\(\)\.,'\+]+)?/;

// 	if(isPatternPresent(messageBody, "</PmtRtr>")) {

// 		var msgIdPath = '/Document/PmtRtr/GrpHdr/MsgId';
// 		var msgId = getValueFromPath(Document, msgIdPath);
// 		logger.info("idCheckRuleTIPSPacs004: msgId = " + msgId);

// 		var orgMsgIdPath = '/Document/PmtRtr/OrgnlGrpInf/OrgnlMsgId';
// 		var orgMsgId = getValueFromPath(Document, orgMsgIdPath);
// 		logger.info("idCheckRuleTIPSPacs004: orgMsgId = " + orgMsgId);

// 		var retrnIdPath = '/Document/PmtRtr/TxInf/RtrId';
// 		var retrnId = getValueFromPath(Document, retrnIdPath);
// 		logger.info("idCheckRuleTIPSPacs004: retrnId = " + retrnId);

// 		var orgMsgIdPath1 = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgId';
// 		var orgMsgId1 = getValueFromPath(Document, orgMsgIdPath1);
// 		logger.info("idCheckRuleTIPSPacs004: orgMsgId1 = " + orgMsgId1);

// 		var InstrIdPath = '/Document/PmtRtr/TxInf/InstrId';
// 		var InstrId = getValueFromPath(Document, InstrIdPath);
// 		logger.info("idCheckRuleTIPSPacs004: InstrId = " + InstrId);

// 		var end2EndIdPath = '/Document/PmtRtr/TxInf/OrgnlEndToEndId';
// 		var end2EndId = getValueFromPath(Document, end2EndIdPath);
// 		logger.info("idCheckRuleTIPSPacs004: end2EndId = " + end2EndId);

// 		var orgIdPath = '/Document/PmtRtr/TxInf/OrgnlTxId';
// 		var orgId = getValueFromPath(Document, orgIdPath);
// 		logger.info("idCheckRuleTIPSPacs004: orgId = " + orgId);

// 	}

// 	if(isPatternPresent(messageBody, "</RsltnOfInvstgtn>")) {

// 		var msgIdPath = '/Document/RsltnOfInvstgtn/Assgnmt/Id';
// 		var msgId = getValueFromPath(Document, msgIdPath);
// 		logger.info("idCheckRuleTIPSCamt029: msgId = " + msgId);

// 		var orgMsgIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsId';
// 		var orgMsgId = getValueFromPath(Document, orgMsgIdPath);
// 		logger.info("idCheckRuleTIPSCamt029: orgMsgId = " + orgMsgId);

// 		var retrnIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId';
// 		var retrnId = getValueFromPath(Document, retrnIdPath);
// 		logger.info("idCheckRuleTIPSCamt029: retrnId = " + retrnId);

// 		var orgMsgIdPath1 = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlInstrId';
// 		var orgMsgId1 = getValueFromPath(Document, orgMsgIdPath1);
// 		logger.info("idCheckRuleTIPSCamt029: orgMsgId1 = " + orgMsgId1);

// 		// var InstrIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/InstrId';TxInfAndSts
// 		// var InstrId = getValueFromPath(Document, InstrIdPath);
// 		// logger.info("idCheckRuleTIPSCamt029: InstrId = " + InstrId);

// 		var end2EndIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlEndToEndId';
// 		var end2EndId = getValueFromPath(Document, end2EndIdPath);
// 		logger.info("idCheckRuleTIPSCamt029: end2EndId = " + end2EndId);

// 		var orgIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxId';
// 		var orgId = getValueFromPath(Document, orgIdPath);
// 		logger.info("idCheckRuleTIPSCamt029: orgId = " + orgId);

// 	}		
// 	if(expression.test(msgId) || expression.test(orgMsgId) || expression.test(retrnId) || expression.test(orgMsgId1) || expression.test(InstrId) || expression.test(end2EndId) || expression.test(orgId)) {
// 		setHeader(map, "PLCN_validMessage", false);
// 		logger.info("Id character is not valid or as per [0-9a-zA-Z\-\?:\(\)\.,'\+](/?([0-9a-zA-Z\-\?:\(\)\.,'\+ ]/?)*[0-9a-zA-Z\-\?:\(\)\.,'\+]+)?");
// 		retVal = setCommentsForTransaction("0123", "11383", map);
// 		return retVal;
// 	}

	
// 	return retVal;
// }

function lclInstrmCdTIPSPacs004Rule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In lclInstrmCdTIPSPacs004Rule");
 
	var lclInstrmCdPath = "/Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Cd";
	var lclInstrmCd = getValueFromPath(Document, lclInstrmCdPath);
	logger.info("lclInstrmCd = "+ lclInstrmCd);
 
	if(lclInstrmCd){
		if(lclInstrmCd != "INST"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("lclInstrmCdTIPSPacs004Rule: lclInstrmCd : Must be “INST”.");
			retVal = setCommentsForTransaction("011", "7158", map);
			return retVal;
		}
	}
	return retVal;
}

function addtnlInfoGenericRule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	var rsnCdPath;
	var rsnCd;
	var nodes;
	var amountOfNodes;
	
	logger.info("In addtnlInfoGenericRule");

	 if(isPatternPresent(Document1, "</RsltnOfInvstgtn>")) {
		rsnCdPath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn/Cd";
		rsnCd = getValueFromPath(Document, rsnCdPath);
		logger.info("rsnCd = "+ rsnCd);
 
		if(rsnCd == "LEGL" ){
			nodes = Document.getElementsByTagName("AddtlInf"); 
			logger.info("addtnlInfoGenericRule:nodes = "+nodes); 
	   	 	amountOfNodes = nodes.length;
			logger.info("addtnlInfoGenericRule:amountOfNodes = "+amountOfNodes); 

			if(amountOfNodes > 3){
				setHeader(map, "PLCN_validMessage",false);
				logger.info("addtnlInfoGenericRule : If Reason code is 'LEGL' then only 2 occurrences of AddtlInf are allowed.");
				retVal = setCommentsForTransaction("136", "7160", map);
				return retVal;
			}
		}

		if(rsnCd == "AC04" || rsnCd == "AC03"){
			nodes = Document.getElementsByTagName("AddtlInf"); 
			logger.info("addtnlInfoGenericRule:nodes = "+nodes); 
	   	 	amountOfNodes = nodes.length;
			logger.info("addtnlInfoGenericRule:amountOfNodes = "+amountOfNodes); 

			if(amountOfNodes > 11){
				setHeader(map, "PLCN_validMessage",false);
				logger.info("addtnlInfoGenericRule : If Reason code is 'FRAD' then only 10 occurrences of AddtlInf are allowed.");
				retVal = setCommentsForTransaction("136", "7161", map);
				return retVal;
			}
		}

			nodes = Document.getElementsByTagName("AddtlInf"); 
			logger.info("addtnlInfoGenericRule:nodes = "+nodes); 
		   	amountOfNodes = nodes.length;
			logger.info("addtnlInfoGenericRule:amountOfNodes = "+amountOfNodes);

			var addnlInfPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/AddtlInf';
			var addnlInf = getValueFromPath(Document, addnlInfPath);
			logger.info("addtnlInfoGenericRule:addnlInf = "+addnlInf);

			if(amountOfNodes >= 1 &&  (isPatternPresent(addnlInf, "ATR053") || isPatternPresent(addnlInf, "ATR072"))) {
				logger.info("addtnlInfoGenericRule:Additional Info is valid... ");
			}else {
				setHeader(map, "PLCN_validMessage",false);
				logger.info("addtnlInfoGenericRule : At least one occurrence of AddtlInf is mandatory and must start with 'ATR053' or 'ATR072'");
				retVal = setCommentsForTransaction("136", "7162", map);
				return retVal;
			}
	} 

	if(isPatternPresent(Document1, "</PmtRtr>")) {
		nodes = Document.getElementsByTagName("AddtlInf"); 
		logger.info("addtnlInfoGenericRule:nodes = "+nodes); 
	   	amountOfNodes = nodes.length;
		logger.info("addtnlInfoGenericRule:amountOfNodes = "+amountOfNodes);

		var addnlInfPath = '/Document/PmtRtr/TxInf/RtrRsnInf/AddtlInf';
		var addnlInf = getValueFromPath(Document, addnlInfPath);
		logger.info("addtnlInfoGenericRule:addnlInf = "+addnlInf);

		if(amountOfNodes >= 1 &&  (isPatternPresent(addnlInf, "ATR053") || isPatternPresent(addnlInf, "ATR072"))) {
			logger.info("addtnlInfoGenericRule:Additional Info is valid... ");
		}else {
			setHeader(map, "PLCN_validMessage",false);
			logger.info("addtnlInfoGenericRule : At least one occurrence of AddtlInf is mandatory and must start with 'ATR053' or 'ATR072'");
			retVal = setCommentsForTransaction("824", "7162", map);
			return retVal;
		}
	}
	return retVal;
}

function lclInstrmCdSepaInstRule(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	var lclInstrmCdPath;
	var lclInstrmCd;
	
	logger.info("In lclInstrmCdSepaInstRule");

	if(isPatternPresent(Document1, "</RsltnOfInvstgtn>")) {
		lclInstrmCdPath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/PmtTpInf/LclInstrm/Cd";
		lclInstrmCd = getValueFromPath(Document, lclInstrmCdPath);
		logger.info("lclInstrmCd = "+ lclInstrmCd);
	}

 
	if(lclInstrmCd){
		if(lclInstrmCd != "INST"){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("lclInstrmCdSepaInstRule: lclInstrmCd : Must be “INST”.");
			retVal = setCommentsForTransaction("011", "7158", map);
			return retVal;
		}
	}
	return retVal;
}

function setofcharAllowedTipsGenericRule(exchange) {

	logger.info("in setofcharAllowedTipsGenericRule");

	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var messageBody = inMsg.getBody(java.lang.String.class);

	//loop added for pacs008
	if(isPatternPresent(Document1 , "FIToFICstmrCdtTrf")) {
		var grpHdrMsgIdPath = '/Document/FIToFICstmrCdtTrf/GrpHdr/MsgId';
		var grpHdrMsgId = getValueFromPath(Document, grpHdrMsgIdPath);
		if(grpHdrMsgId){
			var grpHdrMsgId1 = charactersAllowedinTips(grpHdrMsgId);
		}
		
		if(grpHdrMsgId && !grpHdrMsgId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("117", "11383", map);
			return retVal;	
		}
		

		var instrIdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/InstrId';
		var instrId = getValueFromPath(Document, instrIdPath);
		if(instrId){
			var instrId1 = charactersAllowedinTips(instrId);
		}
		
		if(instrId && !instrId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("299", "11383", map);
			return retVal;	
		}

		var endToEndIdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId';
		var endToEndId = getValueFromPath(Document, endToEndIdPath);
		if(endToEndId){
			var endToEndId1 = charactersAllowedinTips(endToEndId);
		}
		
		if(endToEndId && !endToEndId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("300", "11383", map);
			return retVal;	
		}

		var txnIdPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/TxId';
		var txnId = getValueFromPath(Document, txnIdPath);
		if(txnId){
			var txnId1 = charactersAllowedinTips(txnId);
		}
		
		if(txnId && !txnId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("301", "11383", map);
			return retVal;	
		}
	}
	
	//loop added for camt.056
	if(isPatternPresent(Document1 , "FIToFIPmtCxlReq")) {
		var grpHdrMsgIdPath = '/Document/FIToFIPmtCxlReq/Assgnmt/Id';
		var grpHdrMsgId = getValueFromPath(Document, grpHdrMsgIdPath);
		var grpHdrMsgId1 = charactersAllowedinTips(grpHdrMsgId);
		
		if(grpHdrMsgId && !grpHdrMsgId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("132", "11383", map);
			return retVal;	
		}

		var orgnlMsgIdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgId';
		var orgnlMsgId = getValueFromPath(Document, orgnlMsgIdPath);
		var orgnlMsgId1 = charactersAllowedinTips(orgnlMsgId);
		
		if(orgnlMsgId && !orgnlMsgId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("181", "11383", map);
			return retVal;	
		}

		var orgnlInstrIdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlInstrId';
		var orgnlInstrId = getValueFromPath(Document, orgnlInstrIdPath);
		if(orgnlInstrId){
			var orgnlInstrId1 = charactersAllowedinTips(orgnlInstrId);
		}
		
		if(orgnlInstrId && !orgnlInstrId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("183", "11383", map);
			return retVal;	
		}

		var orgnlEndToEndIdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlEndToEndId';
		var orgnlEndToEndId = getValueFromPath(Document, orgnlEndToEndIdPath);
		var orgnlEndToEndId1 = charactersAllowedinTips(orgnlEndToEndId);
		
		if(orgnlEndToEndId && !orgnlEndToEndId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("178", "11383", map);
			return retVal;	
		}

		var orgnlTxnIdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxId';
		var orgnlTxnId = getValueFromPath(Document, orgnlTxnIdPath);
		var orgnlTxnId1 = charactersAllowedinTips(orgnlTxnId);

		if(orgnlTxnId && !orgnlTxnId1){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Only certain character set is allowed.");
			retVal = setCommentsForTransaction("187", "11383", map);
			return retVal;	
		}
	}
	
	//loop added for pacs002
	if(isPatternPresent(Document1 , "FIToFIPmtStsRpt")) {
		var grpHdrMsgIdPath = '/Document/FIToFIPmtStsRpt/GrpHdr/MsgId';
		var grpHdrMsgId = getValueFromPath(Document, grpHdrMsgIdPath);
		var grpHdrMsgId1 = charactersAllowedinTips(grpHdrMsgId);

		var orgnlMsgIdPath = '/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId';
		var orgnlMsgId = getValueFromPath(Document, orgnlMsgIdPath);
		var orgnlMsgId1 = charactersAllowedinTips(orgnlMsgId);

		var stsReqIdPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/StsId';
		var stsReqId = getValueFromPath(Document, stsReqIdPath);
		var stsReqId1 = charactersAllowedinTips(stsReqId);

		var orgnlInstrIdPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlInstrId';
		var orgnlInstrId = getValueFromPath(Document, orgnlInstrIdPath);
		if(orgnlInstrId){
		var orgnlInstrId1 = charactersAllowedinTips(orgnlInstrId);
		}

		var orgnlEndToEndIdPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlEndToEndId';
		var orgnlEndToEndId = getValueFromPath(Document, orgnlEndToEndIdPath);
		var orgnlEndToEndId1 = charactersAllowedinTips(orgnlEndToEndId);

		var orgnlTxnIdPath = '/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxId';
		var orgnlTxnId = getValueFromPath(Document, orgnlTxnIdPath);
		var orgnlTxnId1 = charactersAllowedinTips(orgnlTxnId);

		if(!grpHdrMsgId1 || !orgnlMsgId1 || !stsReqId1 || !orgnlInstrId1 || !orgnlEndToEndId1 || !orgnlTxnId1){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("009", "7135", map);
				return retVal;	
		}
	}

	//loop added for pacs028
	if(isPatternPresent(Document1 , "FIToFIPmtStsReq")){
		var grpHdrMsgIdPath = '/Document/FIToFIPmtStsReq/GrpHdr/MsgId';
		var grpHdrMsgId = getValueFromPath(Document, grpHdrMsgIdPath);
		logger.info("setofcharAllowedTipsGenericRule grpHdrMsgId =" + grpHdrMsgId);
		var grpHdrMsgId1 = charactersAllowedinTips(grpHdrMsgId);
		logger.info("setofcharAllowedTipsGenericRule grpHdrMsgId1 =" + grpHdrMsgId1);

		var orgnlMsgIdPath = '/Document/FIToFIPmtStsReq/OrgnlGrpInf/OrgnlMsgId';
		var orgnlMsgId = getValueFromPath(Document, orgnlMsgIdPath);
		logger.info("setofcharAllowedTipsGenericRule orgnlMsgId =" + orgnlMsgId);
		var orgnlMsgId1 = charactersAllowedinTips(orgnlMsgId);
		logger.info("setofcharAllowedTipsGenericRule orgnlMsgId1 =" + orgnlMsgId1);

		var stsReqIdPath = '/Document/FIToFIPmtStsReq/TxInf/StsReqId';
		var stsReqId = getValueFromPath(Document, stsReqIdPath);
		logger.info("setofcharAllowedTipsGenericRule stsReqId =" + stsReqId);
		var stsReqId1 = charactersAllowedinTips(stsReqId);
		logger.info("setofcharAllowedTipsGenericRule stsReqId1 =" + stsReqId1);

		var orgnlInstrIdPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlInstrId';
		var orgnlInstrId = getValueFromPath(Document, orgnlInstrIdPath);
		logger.info("setofcharAllowedTipsGenericRule orgnlInstrId =" + orgnlInstrId);
		if(orgnlInstrId){
		var orgnlInstrId1 = charactersAllowedinTips(orgnlInstrId);
		}

		var orgnlEndToEndIdPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlEndToEndId';
		var orgnlEndToEndId = getValueFromPath(Document, orgnlEndToEndIdPath);
		logger.info("setofcharAllowedTipsGenericRule orgnlEndToEndId =" + orgnlEndToEndId);

		if(orgnlEndToEndId) {
			var orgnlEndToEndId1 = charactersAllowedinTips(orgnlEndToEndId);
			logger.info("setofcharAllowedTipsGenericRule orgnlEndToEndId1 =" + orgnlEndToEndId1);
		}

		var orgnlTxnIdPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxId';
		var orgnlTxnId = getValueFromPath(Document, orgnlTxnIdPath);

		if(orgnlTxnIdPath) {
			var orgnlTxnId1 = charactersAllowedinTips(orgnlTxnId);
		}

		if(grpHdrMsgId1 == false|| orgnlMsgId1 == false || stsReqId1 == false || orgnlInstrId1 == false || orgnlEndToEndId1 == false || orgnlTxnId1 == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("008", "7135", map);
				return retVal;	
		}
	}

	if(isPatternPresent(messageBody, "</PmtRtr>")) {

		var msgIdPath = '/Document/PmtRtr/GrpHdr/MsgId';
		var msgId = getValueFromPath(Document, msgIdPath);
		logger.info("setofcharAllowedTipsGenericRule: msgId = " + msgId);
		if(msgId){
		  msgId = charactersAllowedinTips(msgId);
		 if(msgId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("118", "11383", map);
				return retVal;	
			}
		}



		var orgMsgIdPath = '/Document/PmtRtr/OrgnlGrpInf/OrgnlMsgId';
		var orgMsgId = getValueFromPath(Document, orgMsgIdPath);
		logger.info("setofcharAllowedTipsGenericRule: orgMsgId = " + orgMsgId);
		if(orgMsgId){
		   orgMsgId = charactersAllowedinTips(orgMsgId);
		   if(orgMsgId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("164", "11383", map);
				return retVal;	
			}
		}

		var retrnIdPath = '/Document/PmtRtr/TxInf/RtrId';
		var retrnId = getValueFromPath(Document, retrnIdPath);
		logger.info("setofcharAllowedTipsGenericRule: retrnId = " + retrnId);
		if(retrnId){
		   retrnId = charactersAllowedinTips(retrnId);
		   if(retrnId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("166", "11383", map);
				return retVal;	
			}
		}

		var orgMsgIdPath1 = '/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgId';
		var orgMsgId1 = getValueFromPath(Document, orgMsgIdPath1);
		logger.info("setofcharAllowedTipsGenericRule: orgMsgId1 = " + orgMsgId1);
		if(orgMsgId1){
		   orgMsgId1 = charactersAllowedinTips(orgMsgId1);
		   if(orgMsgId1 == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("168", "11383", map);
				return retVal;	
			}
		}

		var InstrIdPath = '/Document/PmtRtr/TxInf/OrgnlInstrId';
		var InstrId = getValueFromPath(Document, InstrIdPath);
		logger.info("setofcharAllowedTipsGenericRule: InstrId = " + InstrId);
		if(InstrId){
		   InstrId = charactersAllowedinTips(InstrId);
		   if(InstrId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("171", "11383", map);
				return retVal;	
			}
		}

		var end2EndIdPath = '/Document/PmtRtr/TxInf/OrgnlEndToEndId';
		var end2EndId = getValueFromPath(Document, end2EndIdPath);
		logger.info("setofcharAllowedTipsGenericRule: end2EndId = " + end2EndId);
		if(end2EndId){
		   end2EndId = charactersAllowedinTips(end2EndId);
		   if(end2EndId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("172", "11383", map);
				return retVal;	
			}
		}

		var orgIdPath = '/Document/PmtRtr/TxInf/OrgnlTxId';
		var orgId = getValueFromPath(Document, orgIdPath);
		logger.info("setofcharAllowedTipsGenericRule: orgId = " + orgId);
		if(orgId){
		   orgId = charactersAllowedinTips(orgId);
		   if(orgId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("173", "11383", map);
				return retVal;	
			}
		}

	}

	if(isPatternPresent(messageBody, "</RsltnOfInvstgtn>")) {

		var msgIdPath = '/Document/RsltnOfInvstgtn/Assgnmt/Id';
		var msgId = getValueFromPath(Document, msgIdPath);
		logger.info("setofcharAllowedTipsGenericRule: msgId = " + msgId);
		if(msgId){
		   msgId = charactersAllowedinTips(msgId);
		   if(msgId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("132", "11383", map);
				return retVal;	
			}
		}

		var orgMsgIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsId';
		var orgMsgId = getValueFromPath(Document, orgMsgIdPath);
		logger.info("setofcharAllowedTipsGenericRule: orgMsgId = " + orgMsgId);
		if(orgMsgId){
		   orgMsgId = charactersAllowedinTips(orgMsgId);
		   if(orgMsgId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("134", "11383", map);
				return retVal;	
			}
		}

		var retrnIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId';
		var retrnId = getValueFromPath(Document, retrnIdPath);
		logger.info("setofcharAllowedTipsGenericRule: retrnId = " + retrnId);
		if(retrnId){
		   retrnId = charactersAllowedinTips(retrnId);
		    if(retrnId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("160", "11383", map);
				return retVal;	
			}
		}

		var orgMsgIdPath1 = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlInstrId';
		var orgMsgId1 = getValueFromPath(Document, orgMsgIdPath1);
		logger.info("setofcharAllowedTipsGenericRule: orgMsgId1 = " + orgMsgId1);
		if(orgMsgId1){
		   orgMsgId1 = charactersAllowedinTips(orgMsgId1);
		   if(orgMsgId1 == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("162", "11383", map);
				return retVal;	
			}
		}

		// var InstrIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/InstrId';TxInfAndSts
		// var InstrId = getValueFromPath(Document, InstrIdPath);
		// logger.info("setofcharAllowedTipsGenericRule: InstrId = " + InstrId);

		var end2EndIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlEndToEndId';
		var end2EndId = getValueFromPath(Document, end2EndIdPath);
		logger.info("setofcharAllowedTipsGenericRule: end2EndId = " + end2EndId);
		if(end2EndId){
		   end2EndId = charactersAllowedinTips(end2EndId);
		   if(end2EndId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("157", "11383", map);
				return retVal;	
			}
		}

		var orgIdPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxId';
		var orgId = getValueFromPath(Document, orgIdPath);
		logger.info("setofcharAllowedTipsGenericRule: orgId = " + orgId);
		if(orgId){
		   orgId = charactersAllowedinTips(orgId);
		   if(orgId == false){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Only certain character set is allowed.");
				retVal = setCommentsForTransaction("163", "11383", map);
				return retVal;	
			}
		}

	}

	return retVal;
}

function orgnlMsgNmIdTIPSGenericRule(exchange) {

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	logger.info('orgnlMsgNmIdRT1GenericRule: messageBody = ' + messageBody);
	var Document1 = inMsg.getBody(java.lang.String.class);
	logger.info('orgnlMsgNmIdRT1GenericRule: Document1 = ' + Document1);
	var retVal = 0;
	var orgnlMsgNmIdPath;
	var orgnlMsgNmIdValue;
	var orgnlMsgNmIdCheck;

	logger.info('In orgnlMsgNmIdRT1GenericRule');
	
	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("orgnlMsgNmIdRT1GenericRule: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("orgnlMsgNmIdRT1GenericRule: sysDate = " + sysDate);
	
	//loop for camt.056
	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		orgnlMsgNmIdCheck =  isXmlNodePresent3(Document, "Undrlyg","TxInf", "OrgnlGrpInf", "<OrgnlMsgNmId>");
		
		orgnlMsgNmIdPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgNmId';
		orgnlMsgNmIdValue = getValueFromPath(Document, orgnlMsgNmIdPath);
		logger.info("FIToFIPmtCxlReq-orgnlMsgNmIdValue :"+ orgnlMsgNmIdValue);
		
		
		if(sysDate){
			if(sysDate < Date1){
		const orgnlMsgNmIdValue1 = ["pacs.008.001.08"];
		logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

		if(orgnlMsgNmIdCheck){
			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
				logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
			}
			else {
				setHeader(map, "PLCN_validMessage", false);
				logger.info("RsltnOfInvstgtn: Only â€˜pacs.008.001.08â€™ are allowed.");
				retVal = setCommentsForTransaction("182", "7176", map);	//NEW violations to be defined..
				//return retVal;			
			}
		}	
			}else {
				orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

				const orgnlMsgNmIdValue1 = ["pacs.008"];

				if(orgnlMsgNmIdCheck){
					if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
						logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
					}
					else {
						setHeader(map, "PLCN_validMessage",false);
						logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
						retVal = setCommentsForTransaction("169", "7624", map);	//NEW violations to be defined..
						//return retVal;			
					}
				}
			}
		}
	}

	return retVal;
}

function genericAnyBicLEIOthrTipsRule(exchange){ 
	logger.info(" In genericAnyBicLEIOthrTipsRule");
 
	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
 
	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("orgIdRuleSepaPacs8: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("orgIdRuleSepaPacs8: sysDate = " + sysDate);
	
	//CAMT056
	if(isPatternPresent(Document1, "</FIToFIPmtCxlReq>")) {
 
		//ADDED BY SNEHA FOR LIB2025
		if(sysDate >= Date1){
			logger.info("genericAnyBicLEIOthrRule: LIB 2025 ");
			return retVal;
		}
		
		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<OrgId>");
 
		var dbtrOrgIdAnyBICPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
 
		if(dbtrOrgId && !dbtrOrgIdAnyBIC){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("Dbtr-if OrgId is present then only AnyBIC is allowed");
			retVal = setCommentsForTransaction("1007", "7148", map);
			return retVal;
		}

		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<OrgId>");
 
		var ultmtDbtrOrgIdAnyBICPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
		if(ultmtDbtrOrgId && !ultmtDbtrOrgIdAnyBIC){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("UltmtDbtr-if OrgId is present then only AnyBIC is allowed");
			retVal = setCommentsForTransaction("1007", "7148", map);
			return retVal;
		}

	}
 
	return retVal;		
}

function genericAnyBicOthrRule(exchange){ 
	logger.info(" In genericAnyBicOthrRule");
 
	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
 
	//PACS004
	if(isPatternPresent(Document1, "</PmtRtr>")) {
 
		var cdtrOrgId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<OrgId>");
 
		var cdtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
 
		// var cdtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/LEI';
		// var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
 
		var cdtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Cdtr/Pty/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
			if((cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC' or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("2194", "7135", map);//field not present
					return retVal;
				}
			}
		}	
 
		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<OrgId>");
 
		var dbtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
 
		// var dbtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/LEI';
		// var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);
 
		var dbtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/Dbtr/Pty/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdOthr)||(dbtrOrgIdAnyBIC && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC' or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1997", "7135", map);//field not present
					return retVal;
				}
			}
		}
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<OrgId>");
 
		var ultmtDbtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
 
		// var ultmtDbtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/LEI';
		// var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);
 
		var ultmtDbtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC' one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1952", "7135", map);//field not present
					return retVal;
				}
			}
		}
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<OrgId>");
 
		var ultmtCdtrOrgIdAnyBICPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
 
		// var ultmtCdtrOrgIdLEIPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/LEI';
		// var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);
 
		var ultmtCdtrOrgIdOthrPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("2291", "7135", map);//field not present
					return retVal;
				}
			}
		}
	}
 
	//CAMT029
	if(isPatternPresent(Document1, "</RsltnOfInvstgtn>")) {
 
		var cdtrOrgId =  isXmlNodePresent3(Document, "Cdtr","Pty", "Id", "<OrgId>");
 
		var cdtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/OrgId/AnyBIC';
		var cdtrOrgIdAnyBIC = getValueFromPath(Document, cdtrOrgIdAnyBICPath);
 
		// var cdtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/OrgId/LEI';
		// var cdtrOrgIdLEI = getValueFromPath(Document, cdtrOrgIdLEIPath);
 
		var cdtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Cdtr/Pty/Id/OrgId/Othr/Id';
		var cdtrOrgIdOthr = getValueFromPath(Document, cdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Cdtr>")){
			if(cdtrOrgId){
				if((cdtrOrgIdAnyBIC && cdtrOrgIdOthr)||(!cdtrOrgIdAnyBIC && !cdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Cdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC', or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("945", "7135", map); //field not present
					return retVal;
				}
			}
		}	
 
		//DEBTOR
		var dbtrOrgId =  isXmlNodePresent3(Document, "Dbtr","Pty", "Id", "<OrgId>");
 
		var dbtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/OrgId/AnyBIC';
		var dbtrOrgIdAnyBIC = getValueFromPath(Document, dbtrOrgIdAnyBICPath);
 
		// var dbtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/OrgId/LEI';
		// var dbtrOrgIdLEI = getValueFromPath(Document, dbtrOrgIdLEIPath);
 
		var dbtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/Dbtr/Pty/Id/OrgId/Othr/Id';
		var dbtrOrgIdOthr = getValueFromPath(Document, dbtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<Dbtr>")){
			if(dbtrOrgId){
				if((dbtrOrgIdAnyBIC && dbtrOrgIdOthr)||(!dbtrOrgIdAnyBIC && !dbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("Dbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC' or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("779", "7135", map);//field not present
					return retVal;
				}
			}
		}
		//ULTIMATEDEBTOR
		var ultmtDbtrOrgId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<OrgId>");
 
		var ultmtDbtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/AnyBIC';
		var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
 
		// var ultmtDbtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/LEI';
		// var ultmtDbtrOrgIdLEI = getValueFromPath(Document, ultmtDbtrOrgIdLEIPath);
 
		var ultmtDbtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtDbtr/Pty/Id/OrgId/Othr/Id';
		var ultmtDbtrOrgIdOthr = getValueFromPath(Document, ultmtDbtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtDbtr>")){
			if(ultmtDbtrOrgId){
				if((ultmtDbtrOrgIdAnyBIC && ultmtDbtrOrgIdOthr)||(!ultmtDbtrOrgIdAnyBIC && !ultmtDbtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtDbtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC' or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("693", "7135", map);//field not present
					return retVal;
				}
			}
		}
		//ULTIMATECREDITOR
		var ultmtCdtrOrgId =  isXmlNodePresent3(Document, "UltmtCdtr","Pty", "Id", "<OrgId>");
 
		var ultmtCdtrOrgIdAnyBICPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/AnyBIC';
		var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
 
		// var ultmtCdtrOrgIdLEIPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/LEI';
		// var ultmtCdtrOrgIdLEI = getValueFromPath(Document, ultmtCdtrOrgIdLEIPath);
 
		var ultmtCdtrOrgIdOthrPath = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/UltmtCdtr/Pty/Id/OrgId/Othr/Id';
		var ultmtCdtrOrgIdOthr = getValueFromPath(Document, ultmtCdtrOrgIdOthrPath);
 
		if(isPatternPresent(Document1, "<UltmtCdtr>")){
			if(ultmtCdtrOrgId){
				if((ultmtCdtrOrgIdAnyBIC && ultmtCdtrOrgIdOthr)||(!ultmtCdtrOrgIdAnyBIC && !ultmtCdtrOrgIdOthr)){
					setHeader(map, "PLCN_validMessage", false);
					logger.info("UltmtCdtr-If PstlAddr is used & if OrgId is present then Either ‘AnyBIC' or one occurrence of ‘Other’ is allowed");
					retVal = setCommentsForTransaction("1007", "7135", map);//field not present
					return retVal;
				}
			}
		}
	}
	 
	return retVal;		
}

function ustrdStrdNonGenericRuleTips(exchange) {

	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	logger.info("In ustrdStrdNonGenericRuleTips");
 
	var ustrdPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Ustrd";
	var ustrd = getValueFromPath(Document, ustrdPath);
	logger.info("ustrd = "+ ustrd);
	
	if(isPatternPresent(Document1, "<Strd>") && ustrd){
		logger.info("ustrdStrdNonGenericRuleTips: Either ‘Structured’ or ‘Unstructured’ may be present");
		retVal = setCommentsForTransaction("1110", "7120", map);
	}
	
	return retVal;
}


function tipsPacs028MandatoryRule(exchange){
	logger.info("In tipsPacs028MandatoryRule");
	
	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var cdtrAgt =  isXmlNodePresent(Document, "FIToFIPmtStsReq","OrgnlTxRef", "CdtrAgt");
	logger.info("tipsPacs028MandatoryRule:cdtrAgt = " + cdtrAgt);

	if(!cdtrAgt){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("tipsPacs028MandatoryRule:Cdtr Agt is mandatory");
		retVal = setCommentsForTransaction("00", "7145", map);
		return retVal;
	}

	var orgnlInstrIdPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlInstrId';
	var orgnlInstrId = getValueFromPath(Document, orgnlInstrIdPath);
	logger.info("tipsPacs028MandatoryRule orgnlInstrId =" + orgnlInstrId);
	if(!orgnlInstrId){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("tipsPacs028MandatoryRule: OrgnlInstrId is mandatory");
		retVal = setCommentsForTransaction("135", "7146", map);
		return retVal;
	}
	return retVal;	
}

function orgMsgNmIdPacs028TipsRule(exchange) {
	logger.info("In orgMsgNmIdPacs028TipsRule");

	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("orgnlMsgNmIdRT1GenericRule: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("orgnlMsgNmIdRT1GenericRule: sysDate = " + sysDate);
	
	var orgnlMsgNmIdPath = '/Document/FIToFIPmtStsReq/OrgnlGrpInf/OrgnlMsgNmId';
	var orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);

	if(sysDate){
		if(sysDate < Date1){
	const orgnlMsgNmIdValue1 = ["pacs.008.001.08","pacs.008.001.02","camt.056.001.012","camt.056.001.08"];
	logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

	if(orgnlMsgNmIdValue1.includes(orgnlMsgNmId)){
		logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
	}
	else {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("orgMsgNmIdPacs028TipsRule: Only camt.056.001.08 is allowed in orgmsgnmid.");
		retVal = setCommentsForTransaction("134", "7147", map);
		return retVal;
	}
		}else {
			orgnlMsgNmId = orgnlMsgNmId.slice(0, 8);
			logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmId after trim = " + orgnlMsgNmId );

			const orgnlMsgNmIdValue1 = ["pacs.008","camt.056"];
			logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

			if(orgnlMsgNmIdValue1.includes(orgnlMsgNmId)){
				logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
			}
			else {
				setHeader(map, "PLCN_validMessage",false);
				logger.info("orgnlMsgNmIdRT1GenericRule: orgnlMsgNmIdValue value is must begin with 'pacs.008' or 'camt.056'");
				retVal = setCommentsForTransaction("134", "7622", map);	//NEW violations to be defined..
						
			}
		}
	}
	/* if(orgnlMsgNmId != 'camt.056.001.08'){
		setHeader(map, "PLCN_validMessage", false);
		logger.info("orgMsgNmIdPacs028TipsRule: Only camt.056.001.08 is allowed in orgmsgnmid.");
		retVal = setCommentsForTransaction("134", "7147", map);
		return retVal;
	} */
	return retVal;
}

function tipsPacs028AnyBicRule(exchange){
	logger.info("In tipsPacs028AnyBicRule");
	
	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var Date1 = memTblGetTableValue(map, "USER_CONFIG_MAP", "SEPA_LIB2025_DATE");
	logger.info("orgIdRuleSepaPacs8: Date1 = " + Date1);

	var sysDate = getDate();
	logger.info("orgIdRuleSepaPacs8: sysDate = " + sysDate);
	
	//ADDED BY SNEHA FOR LIB2025
	if(sysDate >= Date1){
		logger.info("genericAnyBicLEIOthrRule: LIB 2025 ");
		return retVal;
	}
	
	var ultmtDbtrOrgId =  isXmlNodePresent(Document, "OrgnlTxRef", "UltmtDbtr", "<OrgId>");
	var ultmtDbtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtDbtr/Id/OrgId/AnyBIC';
	var ultmtDbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);
	logger.info("In tipsPacs028AnyBicRule: ultmtDbtrOrgIdAnyBIC" + ultmtDbtrOrgIdAnyBIC);
	logger.info("In tipsPacs028AnyBicRule: ultmtDbtrOrgId" + ultmtDbtrOrgId);

	var dbtrOrgId =  isXmlNodePresent(Document, "OrgnlTxRef", "Dbtr", "<OrgId>");
	var dbtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/Dbtr/Id/OrgId/AnyBIC';
	var dbtrOrgIdAnyBIC = getValueFromPath(Document, ultmtDbtrOrgIdAnyBICPath);

	var ultmtCdtrOrgId =  isXmlNodePresent(Document, "OrgnlTxRef", "UltmtCdtr", "<OrgId>");
	var ultmtCdtrOrgIdAnyBICPath = '/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/UltmtCdtr/Id/OrgId/AnyBIC';
	var ultmtCdtrOrgIdAnyBIC = getValueFromPath(Document, ultmtCdtrOrgIdAnyBICPath);
	logger.info("In tipsPacs028AnyBicRule: ultmtCdtrOrgIdAnyBIC" + ultmtCdtrOrgIdAnyBIC);
	logger.info("In tipsPacs028AnyBicRule: ultmtCdtrOrgId" + ultmtCdtrOrgId);
	
	if(isPatternPresent(Document1, "<UltmtDbtr>") || isPatternPresent(Document1, "<Dbtr>") || isPatternPresent(Document1, "<UltmtCdtr>")){
		if(dbtrOrgId){
			if(!dbtrOrgIdAnyBIC){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("Dbtr-if OrgId is present then only AnyBIC is allowed");
				retVal = setCommentsForTransaction("1007", "7148", map);
				return retVal;
			}
		}
		if(ultmtDbtrOrgId){
			if(!ultmtDbtrOrgIdAnyBIC){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("UltmDbtr-if OrgId is present then only AnyBIC is allowed");
				retVal = setCommentsForTransaction("007", "7148", map);
				return retVal;
			}
		}

		if(ultmtCdtrOrgId){
			if(!ultmtCdtrOrgIdAnyBIC){
				setHeader(map, "PLCN_validMessage", false);
				logger.info("UltmCdtr-if OrgId is present then only AnyBIC is allowed");
				retVal = setCommentsForTransaction("008", "7148", map);
				return retVal;
			}
		}
	}	
	return retVal;	
}

function tipsPrvtIdPacs028NotAllowedRule(exchange){
	
	logger.info("In tipsPrvtIdPacs028NotAllowedRule");
	
	var retVal = 0;
 
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	
	var cdtrPrvtId =  isXmlNodePresent3(Document, "FIToFIPmtStsReq", "Cdtr", "Pty", "<PrvtId>");
	//var ultmtDbtrPrvtId =  isXmlNodePresent3(Document, "UltmtDbtr","Pty", "Id", "<PrvtId>");
	var ultmtcdtrPrvtId =  isXmlNodePresent3(Document, "FIToFIPmtStsReq","UltmtCdtr","Pty", "<PrvtId>");
	var dbtrPrvtId =  isXmlNodePresent3(Document, "FIToFIPmtStsReq","Dbtr","Pty", "<PrvtId>");
	
	if(cdtrPrvtId || ultmtcdtrPrvtId || dbtrPrvtId){
		logger.info("tipsPrvtIdNotAllowedRule- Pty/PrvtId is not allowed");
		retVal = setCommentsForTransaction("00", "7149", map);
		return retVal;
	}
	return retVal;
	
}

function amtLengthCheckRule(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var messageBody = inMsg.getBody(java.lang.String.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var retVal = 0;
	logger.info('In amtLengthCheckRule');
	var ccyCheck;
	var ccyPath;
	var ccyValue;

	if(isPatternPresent(Document1, "<FIToFIPmtCxlReq>")){
		//Clearing system
		
		ccyPath = '/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt';
		ccyValue = getValueFromPath(Document, ccyPath);
		logger.info("ccyValue = "+ ccyValue);
		if(ccyValue && ccyValue.length > 18){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("FIToFIPmtCxlReq-ccyValue is invalid");
			retVal = setCommentsForTransaction("152", "7306", map);
			return retVal;
		}	
	}
	return retVal;
}

function orgMsgNmIdPacs004TipsRule(exchange) {
	logger.info("In orgMsgNmIdPacs004TipsRule");

	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);

	var orgnlMsgNmIdPath = "/Document/PmtRtr/OrgnlGrpInf/OrgnlMsgNmId";
	var orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);

	logger.info("orgMsgNmIdPacs004TipsRule: orgnlMsgNmId before trim 1 = " + orgnlMsgNmId );
	
	if(!orgnlMsgNmId){
		var orgnlMsgNmIdPath1 = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
		var orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath1);
		logger.info("orgMsgNmIdPacs004TipsRule: orgnlMsgNmId before trim 2 = " + orgnlMsgNmId );
	}
	
	if(orgnlMsgNmId){
		orgnlMsgNmId = orgnlMsgNmId.slice(0, 8);
		logger.info("orgMsgNmIdPacs004TipsRule: orgnlMsgNmId after trim = " + orgnlMsgNmId );
	}
	
	const orgnlMsgNmIdValue1 = ["pacs.008"];
	logger.info("RsltnOfInvstgtn-orgnlMsgNmIdValue1 :"+orgnlMsgNmIdValue1);

	if(orgnlMsgNmIdValue1.includes(orgnlMsgNmId)){
		logger.info("RsltnOfInvstgtn: orgnlMsgNmIdValue is correct");
	}
	else {
		setHeader(map, "PLCN_validMessage",false);
		logger.info("orgMsgNmIdPacs004TipsRule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
		retVal = setCommentsForTransaction("134", "7624", map);	//NEW violations to be defined..
				
	}
	return retVal;
}

function orgnlMsgNmIdSepaInstTipsPacs002Rule(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);	
	var retVal;

	logger.info("In orgnlMsgNmIdSepaInstTipsPacs002Rule");

	retVal = 0;

	var orgnlMsgNmIdValue = getValueFromPath(Document, "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId");
	logger.info("orgnlMsgNmIdSepaInstTipsPacs002Rule: orgnlMsgNmIdValue = " + orgnlMsgNmIdValue);

	orgnlMsgNmIdValue = orgnlMsgNmIdValue.slice(0, 8);
	logger.info("orgnlMsgNmIdSepaInstTipsPacs002Rule: orgnlMsgNmIdValue after trim = " + orgnlMsgNmIdValue );

	const orgnlMsgNmIdValue1 = ["pacs.008"];

	if(orgnlMsgNmIdValue1.includes(orgnlMsgNmIdValue)){
		logger.info("orgnlMsgNmIdSepaInstTipsPacs002Rule: orgnlMsgNmIdValue value is begin with 'pacs.008'");
	}else {
		setHeader(map, "PLCN_validMessage",false);
		logger.info("orgnlMsgNmIdSepaInstTipsPacs002Rule: orgnlMsgNmIdValue value is must begin with 'pacs.008'");
		retVal = setCommentsForTransaction("127", "7624", map);	//NEW violations to be defined..
		return retVal;			
	}
	return retVal;	
}
