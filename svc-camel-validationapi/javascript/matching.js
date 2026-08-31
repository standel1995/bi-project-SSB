/*
**
*This function calls mxPacs002CustomMatchingParams function.
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
*/
function customMatching(exchange){

	var msgType;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();

    var Document ;

    logger.info("In customMatching");

    msgType = getHeader(map,"PLCN_msgType");
    logger.info("customMatching: msgType = " + msgType)

	var msgFamily = getHeader(map, "PLCN_msgFamily");
	logger.info("customMatching: msgFamily = " + msgFamily);

	if(msgFamily != "PSAR") {
		Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	}

    if(msgType == "pacs.002.001.10"){
    	mxPacs002CustomMatchingParams(Document, map, msgType);
    }
    if(msgType == "pacs.002.001.10" && msgFamily == 'SEPAINST'){
    	sepaPacs002CustomMatchingParams(Document, map, msgType);
    }
  	if(msgType == "pacs.004.001.09"){
    	mxPacs004CustomMatchingParams(Document, map, msgType);
    }
	if(msgType == "pain.002.001.10"){
    	mxPain002CustomMatchingParams(Document, map, msgType);
    }
	if (msgType == "camt.056.001.08") {
		sepaCamt056CustomMatchingParams(Document, map, msgType);
	}
	if (msgType == "camt.029.001.09") {
		sepaCamt029CustomMatchingParams(Document, map, msgType);
	}
  	if(msgType == "pacs.007.001.09"){
    	//sepaPacs007CustomMatchingParams(Document, map, msgType);
    	sepaPacs007CustomMatchingParams25(Document, map, msgType);
    }
    if(msgType == "camt.053.001.08") {
    	cbprCamt053CustomMatchingParams(Document, map, msgType);
    }
	if(msgType == "pacs.028.001.03" && msgFamily == 'SEPAINST'){
    	sepaPacs028CustomMatchingParams(Document, map, msgType);
    }
	if(msgType == "ACKX" || msgType == "NAKX"){
    	mxTransmissionReportCustomMatching(exchange, msgType);
	}

	if(msgType == "ACK" && msgFamily == "SEPAINST"){
    	sepaTechAckCustomMatchingParams(Document, map, msgType);
    }

    if(msgType == "PROP" && msgFamily == "PSAR" ){
    	PSARCustomMatchingParams(Document, map, msgType);
    }
	
    if(msgType == "PROP" && msgFamily == "XML" ){
    	PROPCustomMatchingParams(Document, map, msgType);
    }
	
    logger.info("PLCN_validMessage = " + getHeader(map, "PLCN_validMessage"));
}

/**
* mx_pacs002CustomMatchingParams is for Custom Matching
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
* @param {String} msgType - Message Type.
*/
function mxPacs002CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSG_FAMILY","TARGET2");
	setHeader(map,"MSGFAMILY","XML");

	var orgnlBody = convertDocumentToString(Document);
    logger.trace("customMatching: orgnlBody = " + orgnlBody);

	if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
		mtchCurrency = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
	}else {
		mtchCurrency = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
	}
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);

	if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
		txStsPath = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/TxSts";	
	}else {
		txStsPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	}
	txStsVal = getValueFromPath(Document, txStsPath);
	if(txStsVal){
			txStsVal = txStsVal.trim();
	}
	setHeader(map, "PLCN_custom12", txStsVal);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PRIORITYAMOUNTNUM"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("msgDirection: " + msgDirection);

	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "pacs.002.001.10")) {

		if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
			fileOrgMsgId = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlGrpInfAndSts/OrgnlMsgId";
		}else {
			fileOrgMsgId = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlGrpInfAndSts/OrgnlMsgId";	
		}
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);

		if(fileOrgMsgId == null) {
			if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
				fileOrgMsgId = "/Document/FIToFIPmtStsRptSCL/OrgnlGrpInfAndSts/OrgnlMsgId";			
			}else {
				fileOrgMsgId = "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId";
			}
			fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		}
		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}		
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		var transrefnoPath;
		var transrefno;
		if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
			transrefnoPath = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/StsId";
		}else {
			transrefnoPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsId";
		}
		transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Pacs002transrefNo", transrefno);

		if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
			mtchTransrefno = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlTxId"; 
		}else {
			mtchTransrefno = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxId"; 
		}
		//mtchTransrefno = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlEndToEndId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
			mtchAmount = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt";
		}else {
			mtchAmount = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt";
		}
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(mtchTransrefno && fileOrgMsgId){
			txnCustom2 = fileOrgMsgId + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
				mtchCurrency = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
			}else {
				mtchCurrency = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
			}
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}
		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

		/*if(msgDirection == "O"){
			msgDirection = "";
		}
		else if(msgDirection == "I"){
			msgDirection = "";
		}*/		
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		var orgnlMsgNmIdPath;
		var orgnlMsgNmId;
		if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
			orgnlMsgNmIdPath = "/Document/FIToFIPmtStsRptSCL/OrgnlGrpInfAndSts/OrgnlMsgNmId";
		}else {
			orgnlMsgNmIdPath = "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId";	
		}
		orgnlMsgNmId = getValueFromPath(Document,orgnlMsgNmIdPath);

		if(orgnlMsgNmId == null) {
			if(isPatternPresent(orgnlBody, "</FIToFIPmtStsRptSCL>")) {
				orgnlMsgNmIdPath = "/Document/FIToFIPmtStsRptSCL/TxInfAndSts/OrgnlGrpInfAndSts/OrgnlMsgId";			
			}else {
				orgnlMsgNmIdPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlGrpInfAndSts/OrgnlMsgId";
			}
			orgnlMsgNmId = getValueFromPath(Document,orgnlMsgNmIdPath);
		}

		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|M||"+orgnlMsgNmId;
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function mxPacs004CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	var msgFamily;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSGFAMILY","XML");

	msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("msgFamily: "+ msgFamily);

	mtchCurrency = "/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);

	/*var txnRsnCdPath = "/Document/PmtRtr/TxInf/RtrRsnInf/Rsn/Cd";
	var txnRsnCd = getValueFromPath(Document, txnRsnCdPath);
	logger.info("mxPacs004CustomMatchingParams: txnRsn Code = " + txnRsnCd);
	if(txnRsnCd){
		txnRsnCd = txnRsnCd.trim();
	}*/
	txnRsnCd = 'RETN';
	setHeader(map, "PLCN_custom12", txnRsnCd);
	setHeader(map, "PLCNAPI_custom12", txnRsnCd);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("mxPacs004CustomMatchingParams: msgDirection = " + msgDirection);
	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "pacs.004.001.09")) {

		fileOrgMsgId = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);

		if(!fileOrgMsgId){
				fileOrgMsgId = "/Document/PmtRtr/OrgnlGrpInf/OrgnlMsgId";
				fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		}

		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		var transrefnoPath = "/Document/PmtRtr/TxInf/OrgnlInstrId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Pacs004transrefNo", transrefno);

		mtchTransrefno = "/Document/PmtRtr/TxInf/OrgnlEndToEndId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);


		var mtchTransrefnoPath = "/Document/PmtRtr/TxInf/OrgnlTxId";
		var mtchTransrefno1 = getValueFromPath(Document,mtchTransrefnoPath);
		logger.info("mtchTransrefno1: " + mtchTransrefno1);
		if(mtchTransrefno1){
			mtchTransrefno1 = mtchTransrefno1.trim();
		}

		if(mtchTransrefno && fileOrgMsgId){
			txnCustom2 = fileOrgMsgId + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}

		if(mtchTransrefno1 && fileOrgMsgId && msgFamily == "SEPA"){
			logger.info("INSIDE IF LOOP OF customMatching");
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno1);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}

		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

		if(msgDirection == "O"){
			logger.info("inside msgDirection O: " + msgDirection);
			msgDirection = "I";
		}else if(msgDirection == "I"){
			msgDirection = "O";
			logger.info("INSIDE msgDirection I: " + msgDirection);
		}		
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function mxPain002CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSG_FAMILY","CBPR");
	setHeader(map,"MSGFAMILY","XML");

	mtchCurrency = "/Document/CstmrPmtStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
	mtchCurrency = "EUR";//getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);

	msgMode = getHeader(map,"PLCN_msgModeIn");

	if(!msgMode){
		msgMode = getHeader(map,"PLCN_mode");
	}

	logger.info("msgMode: "+ msgMode);

	var txStsPath = "/Document/CstmrPmtStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/TxSts";
	var txStsVal = getValueFromPath(Document, txStsPath);
	if(txStsVal){
		txStsVal = txStsVal.trim();
	}
	setHeader(map, "PLCN_custom12", txStsVal);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PRIORITYAMOUNTNUM"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "pain.002.001.10")) {

		fileOrgMsgId = "/Document/CstmrPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		var transrefnoPath = "/Document/CstmrPmtStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlInstrId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_pain002transrefNo", transrefno);

		mtchTransrefno = "/Document/CstmrPmtStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlEndToEndId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}		
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/CstmrPmtStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(mtchTransrefno && fileOrgMsgId){
			txnCustom2 = fileOrgMsgId + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/CstmrPmtStsRpt/OrgnlPmtInfAndSts/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}

		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}
		if(msgMode){
			if(isPatternPresent(msgMode, "MANUAL")){
					msgDirection = msgDirection;	
			}
			else{
					if(msgDirection == "O"){
						msgDirection = "I";
					}
					else if(msgDirection == "I"){
						msgDirection = "O";
					}			
			}			
		}
		
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function cbprCamt053CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching camt053..");

	var institutionId;
	var UETRId;
	var CreDtTm;
	var instrId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");


	var msgMode = getHeader(map,"PLCN_msgModeIn");

	if(!msgMode){
		msgMode = getHeader(map,"PLCN_mode");
	}

	logger.info("msgMode: "+ msgMode);

	mtchCurrency = "/Document/BkToCstmrStmt/Stmt/Ntry/Amt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("msgFamily: "+ msgFamily);

	var txnRsnCdPath = "/Document/BkToCstmrStmt/Stmt/Ntry/CxlRsnInf/Rsn/Cd";
	var txnRsnCd = getValueFromPath(Document, txnRsnCdPath);
	logger.info("cbprCamt053CustomMatchingParams: txnRsn Code = " + txnRsnCd);
	if(txnRsnCd){
		txnRsnCd = txnRsnCd.trim();
	}
	setHeader(map, "PLCN_custom12", txnRsnCd);
	setHeader(map, "PLCNAPI_custom12", txnRsnCd);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("cbprCamt053CustomMatchingParams: msgDirection: "+ msgDirection);
	
	// txnMtchParam = fileOrgMsgId  + "|" + CreDtTm +"|" + mtchTransrefno + "|"+ UETRId + "|"+ instrId + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "camt.053.001.08")) {

		fileOrgMsgId = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		instrId = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlInstrId";
		instrId = getValueFromPath(Document,instrId);
		// instrId = instrId.trim();
		setHeader(map, "PLCN_instrId",instrId);
		logger.info("instrID: " + instrId);

		UETRId = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlUETR";
	   UETRId = getValueFromPath(Document,UETRId);
	   logger.info("mtchUETR: "+UETRId);
	   setHeader(map, "PLCN_UETR", UETRId);
	   logger.info("mtchUETRId: "+ UETRId);

		   CreDtTm = "/Document/FIToFIPmtCxlReq/Assgnmt/CreDtTm";
		CreDtTm = getValueFromPath(Document,CreDtTm);
		logger.info("mtchCurrency: "+CreDtTm);
		setHeader(map, "PLCN_CreDtTm",CreDtTm);
		logger.info("mtchCreDtTm: "+ CreDtTm);


	    var transRefNoPath = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlInstrId";
		var transRefNoPathValue = getValueFromPath(Document, transRefNoPath);
		logger.info("transRefNoPathValue" + transRefNoPathValue);
		setHeader(map,"PLCN_Camt056transrefNo", transRefNoPathValue);
			

		// var transrefnoPath = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlInstrId";
		// var transrefno = getValueFromPath(Document,transrefnoPath);
		
		mtchTransrefno = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlTxId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlIntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(mtchTransrefno && transRefNoPathValue){
			txnCustom2 = transRefNoPathValue + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/BkToCstmrStmt/Stmt/Ntry/OrgnlIntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}
		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

	/*if(msgMode == "MQ"){
			logger.info("cbprCamt053CustomMatchingParams: inside direction loop ");
		if(msgDirection == "O"){
			logger.info("cbprCamt053CustomMatchingParams: inside direction O loop ");
			msgDirection = "I";
		}else if(msgDirection == "I"){
			logger.info("cbprCamt053CustomMatchingParams: inside direction I loop ");
			msgDirection = "O";
		}
		}*/	
    
  		/*if(msgDirection == "O"){
		 	msgDirection = "I";
		}else if(msgDirection == "I"){
			msgDirection = "O";
		}*/	
			
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		// txnMtchParam = fileOrgMsgId  + "|" + CreDtTm +"|" + mtchTransrefno + "|"+ UETRId + "|"+ instrId + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		//txnMtchParam = "|"+mtchTransrefno+"¿"+transRefNoPathValue+"|"+mtchAmount+"|"+mtchCurrency+"|"+msgDirection+"|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function sepaCamt029CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	
	setHeader(map,"MSG_FAMILY","SEPA");
	setHeader(map,"MSGFAMILY","SEPA");
	

	mtchCurrency = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/IntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("msgFamily: "+ msgFamily);

	var txnRsnCdPath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn/Cd";
	var txnRsnCd = getValueFromPath(Document, txnRsnCdPath);
	logger.info("sepaCamt029CustomMatchingParams: txnRsn Code = " + txnRsnCd);
	if(txnRsnCd){
		txnRsnCd = txnRsnCd.trim();
	}
	setHeader(map, "PLCN_custom12", txnRsnCd);
	setHeader(map, "PLCNAPI_custom12", txnRsnCd);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map, "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "camt.029.001.09")) {

		fileOrgMsgId = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		var transrefnoPath = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlInstrId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Camt029transrefNo", transrefno);

		mtchTransrefno = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/IntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(!priorityAmtNum){
			mtchAmount = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt";
			mtchAmount = getValueFromPath(Document,mtchAmount);
			logger.info("mtchAmount: " + mtchAmount);
			priorityAmtNum = mtchAmount; 
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(mtchTransrefno && fileOrgMsgId){
			txnCustom2 = fileOrgMsgId + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!mtchCurrency){
			mtchCurrency = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/IntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}

		if(!mtchCurrency){
			mtchCurrency = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}
		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

		if(msgDirection == "O"){
			msgDirection = "I";
		}
		else if(msgDirection == "I"){
			msgDirection = "O";
		}		
		
		var OrgnlMsgNmId = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgNmId";
		var OrgnlMsgNmId = getValueFromPath(Document,OrgnlMsgNmId);
		logger.info("OrgnlMsgNmId: "+ OrgnlMsgNmId);
			
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		//txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M||" + OrgnlMsgNmId; //2025 library changes
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function sepaCamt056CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var UETRId;
	var CreDtTm;
	var instrId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");


	var msgMode = getHeader(map,"PLCN_msgModeIn");

	if(!msgMode){
		msgMode = getHeader(map,"PLCN_mode");
	}

	logger.info("msgMode: "+ msgMode);

	mtchCurrency = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("msgFamily: "+ msgFamily);

	var txnRsnCdPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd";
	var txnRsnCd = getValueFromPath(Document, txnRsnCdPath);
	logger.info("sepaCamt056CustomMatchingParams: txnRsn Code = " + txnRsnCd);
	if(txnRsnCd){
		txnRsnCd = txnRsnCd.trim();
	}
	setHeader(map, "PLCN_custom12", txnRsnCd);
	setHeader(map, "PLCNAPI_custom12", txnRsnCd);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("sepaCamt056CustomMatchingParams: msgDirection: "+ msgDirection);
	
	// txnMtchParam = fileOrgMsgId  + "|" + CreDtTm +"|" + mtchTransrefno + "|"+ UETRId + "|"+ instrId + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "camt.056.001.08")) {

		fileOrgMsgId = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		instrId = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlInstrId";
		instrId = getValueFromPath(Document,instrId);
		// instrId = instrId.trim();
		setHeader(map, "PLCN_instrId",instrId);
		logger.info("instrID: " + instrId);

		UETRId = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlUETR";
	   UETRId = getValueFromPath(Document,UETRId);
	   logger.info("mtchUETR: "+UETRId);
	   setHeader(map, "PLCN_UETR", UETRId);
	   logger.info("mtchUETRId: "+ UETRId);

		   CreDtTm = "/Document/FIToFIPmtCxlReq/Assgnmt/CreDtTm";
		CreDtTm = getValueFromPath(Document,CreDtTm);
		logger.info("mtchCurrency: "+CreDtTm);
		setHeader(map, "PLCN_CreDtTm",CreDtTm);
		logger.info("mtchCreDtTm: "+ CreDtTm);


	    var transRefNoPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlInstrId";
		var transRefNoPathValue = getValueFromPath(Document, transRefNoPath);
		logger.info("transRefNoPathValue" + transRefNoPathValue);
		setHeader(map,"PLCN_Camt056transrefNo", transRefNoPathValue);
			

		// var transrefnoPath = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlInstrId";
		// var transrefno = getValueFromPath(Document,transrefnoPath);
		
		mtchTransrefno = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlTxId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(mtchTransrefno && transRefNoPathValue){
			txnCustom2 = transRefNoPathValue + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}
		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

	/*if(msgMode == "MQ"){
			logger.info("sepaCamt056CustomMatchingParams: inside direction loop ");
		if(msgDirection == "O"){
			logger.info("sepaCamt056CustomMatchingParams: inside direction O loop ");
			msgDirection = "I";
		}else if(msgDirection == "I"){
			logger.info("sepaCamt056CustomMatchingParams: inside direction I loop ");
			msgDirection = "O";
		}
		}*/	
    
  		/*if(msgDirection == "O"){
		 	msgDirection = "I";
		}else if(msgDirection == "I"){
			msgDirection = "O";
		}*/	
			
		var OrgnlMsgNmId = "/Document/FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
		var OrgnlMsgNmId = getValueFromPath(Document,OrgnlMsgNmId);
		logger.info("OrgnlMsgNmId: "+ OrgnlMsgNmId);
			
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		// txnMtchParam = fileOrgMsgId  + "|" + CreDtTm +"|" + mtchTransrefno + "|"+ UETRId + "|"+ instrId + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		//txnMtchParam = "|"+mtchTransrefno+"¿"+transRefNoPathValue+"|"+mtchAmount+"|"+mtchCurrency+"|"+msgDirection+"|M";
		//txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M||" + OrgnlMsgNmId; //2025 library changes
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function sepaPacs007CustomMatchingParams(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	var msgFamily;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSGFAMILY","XML");

	msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("msgFamily: "+ msgFamily);

	mtchCurrency = "/Document/FIToFIPmtRvsl/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("sepaPacs007CustomMatchingParams: mtchCurrency =  "+ mtchCurrency);

	/* var rsnCdPath = "/Document/FIToFIPmtRvsl/TxInf/RvslRsnInf/Rsn/Cd";
	rsnCd = getValueFromPath(Document, rsnCdPath);
	if(rsnCd){
		rsnCd = rsnCd.trim();
	}*/

	txStsVal = 'RVRS';
	setHeader(map, "PLCN_custom12", txStsVal);
	setHeader(map, "PLCNAPI_custom12", txStsVal); 

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("sepaPacs007CustomMatchingParams: msgDirection = " + msgDirection);
	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "pacs.007.001.09")) {

		fileOrgMsgId = "/Document/FIToFIPmtRvsl/TxInf/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);

		if(!fileOrgMsgId){
				fileOrgMsgId = "/Document/FIToFIPmtRvsl/OrgnlGrpInf/OrgnlMsgId";
				fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		}

		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		var transrefnoPath = "/Document/FIToFIPmtRvsl/TxInf/OrgnlInstrId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Pacs007transrefNo", transrefno);

		mtchTransrefno = "/Document/FIToFIPmtRvsl/TxInf/OrgnlTxId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("sepaPacs007CustomMatchingParams: mtchTransrefno = " + mtchTransrefno);
	
		mtchAmount = "/Document/FIToFIPmtRvsl/TxInf/OrgnlIntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/FIToFIPmtRvsl/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("sepaPacs007CustomMatchingParams: mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}


		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

	/*if(msgDirection == "O"){
			logger.info("inside msgDirection O: " + msgDirection);
			msgDirection = "I";
		}else if(msgDirection == "I"){
			msgDirection = "O";
			logger.info("inside msgDirection I: " + msgDirection);
		}	*/	
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function sepaPacs007CustomMatchingParams25(Document, map, msgType) {
	logger.info("inside customMatching");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	var msgFamily;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSGFAMILY","XML");

	msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("msgFamily: "+ msgFamily);

	mtchCurrency = "/Document/FIToFIPmtRvsl/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("sepaPacs007CustomMatchingParams: mtchCurrency =  "+ mtchCurrency);

	/* var rsnCdPath = "/Document/FIToFIPmtRvsl/TxInf/RvslRsnInf/Rsn/Cd";
	rsnCd = getValueFromPath(Document, rsnCdPath);
	if(rsnCd){
		rsnCd = rsnCd.trim();
	}*/

	txStsVal = 'RVRS';
	setHeader(map, "PLCN_custom12", txStsVal);
	setHeader(map, "PLCNAPI_custom12", txStsVal); 

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("sepaPacs007CustomMatchingParams: msgDirection = " + msgDirection);
	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||

	if(isPatternPresent(msgType, "pacs.007.001.09")) {

		fileOrgMsgId = "/Document/FIToFIPmtRvsl/TxInf/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);

		if(!fileOrgMsgId){
				fileOrgMsgId = "/Document/FIToFIPmtRvsl/OrgnlGrpInf/OrgnlMsgId";
				fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		}

		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		var transrefnoPath = "/Document/FIToFIPmtRvsl/TxInf/OrgnlInstrId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Pacs007transrefNo", transrefno);

		mtchTransrefno = "/Document/FIToFIPmtRvsl/TxInf/OrgnlTxId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("sepaPacs007CustomMatchingParams: mtchTransrefno = " + mtchTransrefno);
	
		mtchAmount = "/Document/FIToFIPmtRvsl/TxInf/OrgnlIntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/FIToFIPmtRvsl/TxInf/OrgnlIntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("sepaPacs007CustomMatchingParams: mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}


		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

		OrgnlMsgNmId = "/Document/FIToFIPmtRvsl/OrgnlGrpInf/OrgnlMsgNmId";
		OrgnlMsgNmId = getValueFromPath(Document,OrgnlMsgNmId);
		logger.info("sepaPacs007CustomMatchingParams: OrgnlMsgNmId: "+ OrgnlMsgNmId);
			
	/*if(msgDirection == "O"){
			logger.info("inside msgDirection O: " + msgDirection);
			msgDirection = "I";
		}else if(msgDirection == "I"){
			msgDirection = "O";
			logger.info("inside msgDirection I: " + msgDirection);
		}	*/	
		//txnMtchParam = "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M||" + OrgnlMsgNmId; //for testing
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function setCurrentAuthLevel(Document,map) {
	
	var institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("setSchedulingHeader: institutionId = " + institutionId);

	var authLevelKey = institutionId + "." + "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL.STAGES.MATCHING" + "." + "STAGE_ACCESS_CONTROL";
    logger.info("setCurrentAuthLevel: authLevelKey = " + authLevelKey);

    var authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
    logger.info("setCurrentAuthLevel: authLevelValue = " + authLevelValue);

    if(!authLevelValue) {
        authLevelKey = institutionId + "." + "INSTITUTION_DETAILS.AUTHENTICATION_LEVEL" + "." + "INSTITUTION_ACCESS_CONTROL";
        logger.info("setCurrentAuthLevel: authLevelKey = " + authLevelKey);

        authLevelValue = memTblGetTableValue(map, "INST_PARAM", authLevelKey);
        logger.info("setCurrentAuthLevel: authLevelValue = " + authLevelValue);      
    }

    authLevelValue = "MTCH=" + textToNum(authLevelValue);
    logger.info("setCurrentAuthLevel: authLevelValue = " + authLevelValue);

    setHeader(map, "PLCN_currentAuthLevel", authLevelValue);
    setHeader(map, "PLCNAPI_currentAuthLevel", authLevelValue);
    setHeader(map, "PLCN_currentAuthLevel", authLevelValue);
    setHeader(map, "PLCNAPI_processingStage", "MTCH");
    setHeader(map, "PLCNAPI_queueAudit", "TMPTXVWQ");
}

function sepaPacs028CustomMatchingParams(Document, map, msgType) {
	logger.info("In sepaPacs028CustomMatchingParams");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	var msgFamily;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSGFAMILY","XML");

	msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("sepaPacs028CustomMatchingParams: msgFamily: "+ msgFamily);

	if(!msgFamily){
		msgFamily = getHeader(map, "PLCN_msgFamily");
	}

	mtchCurrency = "/Document/FIToFIPmtStsReq/TxInf/IntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("sepaPacs028CustomMatchingParams: mtchCurrency: "+ mtchCurrency);

	/*var txnRsnCdPath = "/Document/FIToFIPmtStsReq/TxInf/RtrRsnInf/Rsn/Cd";
	var txnRsnCd = getValueFromPath(Document, txnRsnCdPath);
	logger.info("sepaPacs028CustomMatchingParams: txnRsn Code = " + txnRsnCd);
	if(txnRsnCd){
		txnRsnCd = txnRsnCd.trim();
	}*/

	txnRsnCd = 'RETN';
	setHeader(map, "PLCN_custom12", txnRsnCd);
	setHeader(map, "PLCNAPI_custom12", txnRsnCd);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PLCN_priorityAmount"); //""
	}
	institutionId = getHeader(map,"PLCN_institutionId"); //PLCNUSNY
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); //""
	msgDirection = getHeader(map, "PLCN_msgDirection"); //I
	logger.info("sepaPacs028CustomMatchingParams: msgDirection = " + msgDirection);
	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;
	//PLCNUSNY|||XXX|I|M|||
	
	var orgnlMsgNmIdPath = "/Document/FIToFIPmtStsReq/OrgnlGrpInf/OrgnlMsgNmId";
	orgnlMsgNmId = getValueFromPath(Document,orgnlMsgNmIdPath);

	if(isPatternPresent(msgType, "pacs.028.001.03")) {

		fileOrgMsgId = "/Document/FIToFIPmtStsReq/TxInf/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);

		if(!fileOrgMsgId){
				fileOrgMsgId = "/Document/FIToFIPmtStsReq/OrgnlGrpInf/OrgnlMsgId";
				fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		}

		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}
		logger.info("fileOrgMsgId: " + fileOrgMsgId);

		if(isPatternPresent(orgnlMsgNmId, "camt.056")){
			var transrefnoPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlInstrId";
			var transrefno = getValueFromPath(Document,transrefnoPath);
			setHeader(map,"PLCN_Pacs004transrefNo", transrefno);
		}
		
		if(isPatternPresent(orgnlMsgNmId, "pacs.008")){
			var transrefnoPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxId";
			var transrefno = getValueFromPath(Document,transrefnoPath);
			setHeader(map,"PLCN_Pacs004transrefNo", transrefno);
		}
		
		var transrefnoPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlInstrId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Pacs004transrefNo", transrefno);

		mtchTransrefno = "/Document/FIToFIPmtStsReq/TxInf/OrgnlEndToEndId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/IntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("sepaPacs028CustomMatchingParams: mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		var mtchTransrefnoPath;
		var mtchTransrefno1; 
		if(isPatternPresent(orgnlMsgNmId, "camt.056")){
			mtchTransrefnoPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlInstrId";
			mtchTransrefno1 = getValueFromPath(Document,mtchTransrefnoPath);
			logger.info("sepaPacs028CustomMatchingParams: mtchTransrefno1: " + mtchTransrefno1);	
		}else {
			mtchTransrefnoPath = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxId";
			mtchTransrefno1 = getValueFromPath(Document,mtchTransrefnoPath);
			logger.info("sepaPacs028CustomMatchingParams: mtchTransrefno1: " + mtchTransrefno1);
		}

		if(mtchTransrefno1){
			mtchTransrefno1 = mtchTransrefno1.trim();
		}

		if(mtchTransrefno && fileOrgMsgId){
			txnCustom2 = fileOrgMsgId + "¿" + mtchTransrefno;
			logger.info("txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("sepaPacs028CustomMatchingParams: mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}

		if(mtchTransrefno1 && fileOrgMsgId && msgFamily == "SEPAINST"){
			logger.info("INSIDE IF LOOP OF customMatching");
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno1);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}

		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + msgDirection + "|M||"+ orgnlMsgNmId;
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("sepaPacs028CustomMatchingParams: txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

function sepaPacs002CustomMatchingParams(Document, map, msgType) {
	logger.info("In sepaPacs002CustomMatchingParams");

	var institutionId;
	var mtchTransrefno;
	var mtchCurrency= "";
	var mtchMessageDirection;
	var priorityAmtNum;
	var txnMtchParam;
	var fileTransrefno;
	var msgDirection;
	var msgDirection1;
	var mtchAmount;
	var mtchAmount1;
	var fileOrgMsgId;
	var txnCustom2;
	txnCustom2 = "";

	setHeader(map,"txnMtchParam", "");

	mtchCurrency = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
	mtchCurrency = getValueFromPath(Document,mtchCurrency);
	logger.info("mtchCurrency: "+ mtchCurrency);
	setHeader(map, "PLCN_currency", mtchCurrency);
	logger.info("sepaPacs002CustomMatchingParams: mtchCurrency: "+ mtchCurrency);

	txStsPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	txStsVal = getValueFromPath(Document, txStsPath);
	logger.info("sepaPacs002CustomMatchingParams: txStsVal: "+ txStsVal);
	
	if(!txStsVal){
		txStsPath = "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/GrpSts";
		txStsVal = getValueFromPath(Document, txStsPath);
	}
	
	if(txStsVal){
			txStsVal = txStsVal.trim();
	}
	setHeader(map, "PLCN_custom12", txStsVal);
	setHeader(map, "PLCNAPI_custom12", txStsVal);

	if(!priorityAmtNum){
		priorityAmtNum = getHeader(map, "PRIORITYAMOUNTNUM"); 
	}
	institutionId = getHeader(map,"PLCN_institutionId"); 
	mtchTransrefno = getHeader(map,  "PLCN_transRefNo"); 
	msgDirection = getHeader(map, "PLCN_msgDirection"); 
	logger.info("sepaPacs002CustomMatchingParams:msgDirection: " + msgDirection);

	
	txnMtchParam = institutionId + "|" + mtchTransrefno + "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "I" + "|" + "M" + "|" + "|" + "|" + mtchTransrefno;

	if(isPatternPresent(msgType, "pacs.002.001.10")) {

		fileOrgMsgId = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId";
		fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);

		if(!fileOrgMsgId){
			fileOrgMsgId = "/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId";
			fileOrgMsgId = getValueFromPath(Document,fileOrgMsgId);
		}
		if(fileOrgMsgId){
			fileOrgMsgId = fileOrgMsgId.trim();
		}		
		logger.info("sepaPacs002CustomMatchingParams:fileOrgMsgId: " + fileOrgMsgId);
		setHeader(map,"PLCN_Pacs002OrgMsgId", fileOrgMsgId);
		setHeader(map,"PLCNAPI_Pacs002OrgMsgId", fileOrgMsgId);

		var transrefnoPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxId";
		var transrefno = getValueFromPath(Document,transrefnoPath);
		setHeader(map,"PLCN_Pacs002TxnId", transrefno);
		setHeader(map,"PLCNAPI_Pacs002TxnId", transrefno);
		
		mtchTransrefno = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlEndToEndId";
		mtchTransrefno = getValueFromPath(Document,mtchTransrefno);
		if(mtchTransrefno){
			mtchTransrefno = mtchTransrefno.trim();
		}
		setHeader(map, "PLCN_mtchTransrefno",mtchTransrefno);
		logger.info("sepaPacs002CustomMatchingParams:mtchTransrefno: " + mtchTransrefno);
	
		mtchAmount = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt";
		mtchAmount = getValueFromPath(Document,mtchAmount);
		logger.info("sepaPacs002CustomMatchingParams:mtchAmount: " + mtchAmount);
		priorityAmtNum = mtchAmount; 
		setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);

		if(mtchTransrefno && fileOrgMsgId){
			txnCustom2 = fileOrgMsgId + "¿" + mtchTransrefno;
			logger.info("sepaPacs002CustomMatchingParams:txnCustom2: " + txnCustom2);
		}
		if(priorityAmtNum){
			setHeader(map,"PLCN_priorityAmount", priorityAmtNum);
			setHeader(map,"PLCN_priorityAmountNum", priorityAmtNum);
		}
		if(!(mtchCurrency)){
			mtchCurrency = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxRef/IntrBkSttlmAmt/@Ccy";
			mtchCurrency = getValueFromPath(Document,mtchCurrency);
			logger.info("sepaPacs002CustomMatchingParams:mtchCurrency: "+ mtchCurrency);
		}
		if(mtchTransrefno && fileOrgMsgId){
			setHeader(map, "PLCN_mtchTransrefno", mtchTransrefno);
			setHeader(map, "PLCN_fileOrgMsgId", fileOrgMsgId);
			//mtchTransrefno = fileOrgMsgId + "¿" + mtchTransrefno;
			
		}
		if(priorityAmtNum == null || mtchCurrency == null ){
			priorityAmtNum = "";
			mtchCurrency = "";
		}

		/*if(msgDirection == "O"){
			msgDirection = "I";
		}
		else if(msgDirection == "I"){
			msgDirection = "O";
		}*/

		var orgnlMsgNmIdPath = '/Document/FIToFIPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId';
		var orgnlMsgNmId = getValueFromPath(Document, orgnlMsgNmIdPath);
		
		//txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "" + "|M";
		txnMtchParam = "|" + priorityAmtNum + "|" + mtchCurrency + "|" + "" + "|M||" + orgnlMsgNmId;
		setHeader(map, "PLCN_txnMtchParam", txnMtchParam);
		logger.info("sepaPacs002CustomMatchingParams:txnMtchParam: " + txnMtchParam);
	}
	setCurrentAuthLevel(Document, map);
	setHeader(map, "txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom2",txnCustom2); //CUSTOM2
	setHeader(map,"PLCN_processId", "TO-MATCH");

	return;
}

/**
* mx_transmissionReportCustomMatching is for Custom Matching
* @param {DOMTree} Document - The message.
* @param {HashMap} map - The header values.
* @param {String} msgType - Message Type.
*/
function mxTransmissionReportCustomMatching(exchange, msgType) {
	logger.info("inside mxTransmissionReportCustomMatching");

	var msgType;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var body = inMsg.getBody(java.lang.String.class);
  	var hdrMap = inMsg.getHeaders();
	var message = inMsg.getBody(java.lang.String.class);
	
	/* setHeader(map,"txnMtchParam", "");
	setHeader(map,"MSG_FAMILY","TARGET2");
	setHeader(map,"MSGFAMILY","XML"); */
	
	var senderReference= getHeader(map, "PLCN_senderReference");
	logger.info("mxTransmissionReportCustomMatching senderReference: " + senderReference);
	
	if(!senderReference){
		var senderReferencePath = "/DataPDU/Header/TransmissionReport/SenderReference";
		senderReference = getValueFromPath(Document,senderReferencePath);
		logger.info("mxTransmissionReportCustomMatching senderReference: " + senderReference);
	}
	
	if(!senderReference){
		senderReference = dataBetweenTokens("<SenderReference>", "</SenderReference>", message);
		logger.info("mxTransmissionReportCustomMatching senderReference: " + senderReference);
	}
	
	logger.info("senderReference: "+ senderReference);
	setHeader(map, "PLCN_senderReference", senderReference);
	logger.info("senderReference: "+ senderReference);

	setHeader(map, "MTCH_SND_REF_VAL",senderReference); //SND_REF_ACKNACK
	logger.info("MTCH_SND_REF_VAL: "+ senderReference);
	
	/* executeRoute.callRouteWithHeader('direct://transmissionMatchCheck', body, hdrMap); */
	
	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_senderReference",senderReference); 
	setHeader(map, "PLCN_senderRef",senderReference); 
	setHeader(map, "PLCNAPI_senderReference",senderReference); 
	setHeader(map, "PLCNAPI_senderRef",senderReference); 
	setHeader(map,"PLCN_processId", "TO-MATCH");
	/* setHeader(map, "PLCN_currentAuthLevel", authLevelValue);
    setHeader(map, "PLCNAPI_currentAuthLevel", authLevelValue);
    setHeader(map, "PLCN_currentAuthLevel", authLevelValue); */
    setHeader(map, "PLCNAPI_processingStage", "MTCH");
    setHeader(map, "PLCNAPI_queueAudit", "TMPTRVWQ");

	return;
}

function sepaTechAckCustomMatchingParams(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In sepaTechAckCustomMatchingParams");

	var usrBody = inMsg.getBody(org.w3c.dom.Document.class);

	var stringBody = inMsg.getBody(java.lang.String.class);
	logger.info("sepaTechAckCustomMatchingParams: String body = " + stringBody);

	var institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("sepaTechAckCustomMatchingParams: institutionId = " + institutionId);

	var messagedirection = getHeader(map, "PLCN_messagedirection");
	logger.info("sepaTechAckCustomMatchingParams: messagedirection = " + messagedirection);


	var value1 = dataBetweenTokens("<MsgRef>","</MsgRef>", stringBody);
	logger.info("sepaTechAckCustomMatchingParams: value1 = " + value1);

	var custom7 = institutionId+"||||"+messagedirection+"|M"+value1;
	logger.info("sepaTechAckCustomMatchingParams: custom7 = " + custom7);
	setHeader(map, "PLCN_custom7Ack", custom7);

	var custom12 = dataBetweenTokens("<PrimitiveReturnCode>","</PrimitiveReturnCode>", stringBody);
	logger.info("sepaTechAckCustomMatchingParams: custom12 = " + custom12);
	setHeader(map, "PLCN_custom12Ack", custom12);

	setCurrentAuthLevel(Document, map);
	setHeader(map, "PLCN_txnMtchParam",txnMtchParam); //CUSTOM7
	setHeader(map, "PLCN_custom12",custom12); 
	setHeader(map,"PLCN_processId", "TO-MATCH");


	logger.info("sepaTechAckCustomMatchingParams completed..");
	
}

function PSARCustomMatchingParams(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In PSARCustomMatchingParams");

	var usrBody = inMsg.getBody(org.w3c.dom.Document.class);

	var stringBody = inMsg.getBody(java.lang.String.class);
	logger.info("PSARCustomMatchingParams: String body = " + stringBody);

	var institutionId = getHeader(map, "PLCN_institutionId");
	logger.info("PSARCustomMatchingParams: institutionId = " + institutionId);

	var messagedirection = getHeader(map, "PLCN_messagedirection");
	logger.info("PSARCustomMatchingParams: messagedirection = " + messagedirection);

	var value1 = stringBody.substring(69,85);//dataBetweenTokens("<MsgRef>","</MsgRef>", stringBody);
	logger.info("PSARCustomMatchingParams: value1 = " + value1);

	if(!value1) {
		value1 = getHeader(map, "PLCNAPI_messageNo");
		logger.info("PSARCustomMatchingParams: value1 = " + value1);
	}

	var custom7 = institutionId+"||||"+messagedirection+"|M"+value1;
	logger.info("PSARCustomMatchingParams: custom7 = " + custom7);
	
	setHeader(map, "PLCN_custom7PSAR", custom7);
	setHeader(map,"PLCN_processId", "TO-MATCH");


	logger.info("PSARCustomMatchingParams completed..");
}

function PROPCustomMatchingParams(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	logger.info("In PROPCustomMatchingParams");

	var usrBody = inMsg.getBody(org.w3c.dom.Document.class);

	var RefPath = "/DEHResponse/Reference";
	var RefValue = getValueFromPath(Document, RefPath);
	logger.info("responceMatchingFirco: RefValue = " + RefValue);
	
	setHeader(map, "PLCN_custom7PROP", "|" + RefValue + "||||");
	setHeader(map,"PLCN_processId", "TO-MATCH");


	logger.info("PROPCustomMatchingParams completed..");	
}

/* function matchingTransmissionReportCheck(exchange) {
	var inMsg;
	var map;
	var orgnlBody;
	var mtchQueryVal;

	logger.info("In matchingTransmissionReportCheck");

  	inMsg = exchange.getIn();
    map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    logger.info("matchingTransmissionReportCheck: = " + exchange.getIn().getHeader("PLCN_duplicateMessage"));
    //mtchQueryVal = getHeader(map, "MTCH_QUERY_VAL"); 
	matchingReportSelectQueryMX(exchange);
	/*var orgnlBody = getHeader(map,"orgnlBody");
	logger.info("matchingTransmissionReportCheck: originalbody = " + orgnlBody);
	inMsg.setBody(orgnlBody);
	logger.info("matchingTransmissionReportCheck: = " + exchange.getIn().getHeader("PLCN_duplicateMessage"));
} */