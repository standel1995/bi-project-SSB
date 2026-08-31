/**
* This function calls externalCodelistValidationfedNowPacs002 and fedNowValidationRulesPacs002 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPacs002Mx(exchange) {
	logger.info("wrapperFedNowPacs002Mx");
	var retVal;
	var commentsB2b;
	var pacs02ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPacs002Mx:In wrapperFedNowPacs002Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pacs02ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS02_VALD_FLAG_MX");
	pacs02ValdFlagMx = pacs02ValdFlagMx.trim();
	logger.info("pacs02ValdFlagMx = " + pacs02ValdFlagMx);

	if(pacs02ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPacs002Mx: Calling fedNowValidationRulesPacs002");
		retVal = fedNowValidationRulesPacs002(pacs02ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs002Mx: retVal from fedNowValidationRulesPacs002 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs002Mx: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs002Mx: Calling externalCodelistValidationfedNowPacs002");
		// 	retVal = externalCodelistValidationfedNowPacs002(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationfedNowPacs002 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs002Mx: Calling ibanValidationfedNowPacs002");
		// 	retVal = ibanValidationfedNowPacs002(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowPacs002Mx: txnComments from ibanValidationfedNowPacs002 = " + txnComments);
		// }
	}

	if(pacs02ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPacs002Mx: Calling fedNowValidationRulesPacs002");
		retVal = fedNowValidationRulesPacs002(pacs02ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs002Mx: retVal from fedNowValidationRulesPacs002 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs002Mx: txnComments = " + txnComments);

		// logger.info("wrapperFedNowPacs002Mx: Calling externalCodelistValidationfedNowPacs002");
		// retVal = externalCodelistValidationfedNowPacs002(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationfedNowPacs002 = " + txnComments);			
		

		// logger.info("wrapperFedNowPacs002Mx: Calling ibanValidationfedNowPacs002");
		// ibanValidationfedNowPacs002(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowPacs002Mx: txnComments from ibanValidationfedNowPacs002 = " + txnComments);
	}
}


function fedNowValidationRulesPacs002(pacs02ValdFlagMx, exchange){
	logger.info("fedNowValidationRulesPacs002");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("pacs02ValdFlagMx value: "+ pacs02ValdFlagMx);
	if(pacs02ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs2(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}

		try {
			retVal = fedNowAcceptanceDateTimeRule1Pacs002(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowAcceptanceDateTimeRule2Pacs002(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowRoutingNumberGuidelinePacs002(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowStatusReasonInformationRulePacs002(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowOrignalTransactionIdentificationRule1Pacs002(exchange);
		} catch (e) { logger.info(e); }  
		try {
			retVal = fedNowEffectiveInterbankSettlementDateRule1Pacs002(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowProprietaryReasonGuidelinePacs002(exchange);
		} catch (e) { logger.info(e); }

		try {
			retVal = fedNowTransactionStatusRejectRule1Pacs002(exchange);
		} catch (e) { logger.info(e); }
	    try {
			retVal = fedNowOriginalTransactionIdentificationGuidelinePacs002(exchange);
		} catch (e) { logger.info(e); } 
		try {
			retVal = fedNowOriginalCreationDateTimeGuidelinePacs002(exchange);
		} catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowOriginalInstructionIdentificationGuidelinePacs002(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowOriginalUETRGuidelinePacs002(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowPreferredContactMethodRule1Pacs002(exchange);
	   } catch (e) { logger.info(e); }

	   try {
		   retVal = fedNowPreferredContactMethodRule2Pacs002(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowPreferredContactMethodRule3Pacs002(exchange);
	   } catch (e) { logger.info(e); }
		try {
			retVal = fedNowCreationDateAndTimeRulePacs002(exchange);
		  } catch (e) { logger.info(e); }
		  try {
			retVal = fedNowCodeReasonGuidelinePacs002(exchange);
	    } catch (e) { logger.info(e); }
       try {
		   retVal = fedNowTransactionStatusCodeRulePacs002(exchange);
	   } catch (e) { logger.info(e); } 

       try {
		retVal = fedNowOriginalEndToEndIdentificationGuidelinePacs002(exchange);
	   } catch (e) { logger.info(e); } 
	   try {
		retVal = fedNowOriginalMessageIdentificationGuidelinePacs002(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowOriginalMessageNameIdentificationGuidelinePacs002(exchange);
		} catch (e) { logger.info(e); }
	}
	return retVal;
}












//Pacs002 Business message 
	
//creation date time rule
  // This is the calendar date and time in New York City (Eastern Time) when 
   //the message is created by the fedNow Service application. Time is in 24-hour 
   //clock format and includes the offset against the Coordinated Universal Time (UTC).

   function fedNowCreationDateAndTimeRulePacs002(exchange) {
	var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("In fedNowCreationDateAndTimeRulePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/GrpHdr/CreDtTm";
    date = getValueFromPath(Document, path);
logger.info("fedNowCreationDateAndTimeRulePacs002 : Date" + date);
logger.info("fedNowCreationDateAndTimeRulePacs002 : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
    // 2022-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 2022-04-01 22.00 
    // Check for AM/PM in the date string 
    // if AM/PM is present it is not in 24 Hour Format
    // if not found then treat this string as valid

    if (msgDate) {
        var regexForUtc = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/g;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("In fedNowCreationDateAndTimeRulePacs002: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("119", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("119", "8978", map);
        retVal = 1;
    }
    return retVal;

}
//Message Identification
	
function fedNowOriginalMessageIdentificationGuidelinePacs002(exchange) {
    logger.info("In fedNowOriginalMessageIdentificationGuidelinePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("fedNowOriginalMessageIdentificationGuidelinePacs002 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalMessageIdentificationGuidelinePacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("126", "7986", map);
        retVal=1;
    }

    return retVal;

}	
//MessageNameIdentification
function fedNowOriginalMessageNameIdentificationGuidelinePacs002(exchange) {
    logger.info("In fedNowOriginalMessageNameIdentificationGuidelinePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlGrpInf/OrgnlMsgNmId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalMessageNameIdentificationGuidelinePacs002 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalMessageNameIdentificationGuidelinePacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("127", "7986", map);
        retVal=1;
    }

    return retVal;
}	
//CreationDatetime	
function fedNowOriginalCreationDateTimeGuidelinePacs002(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("fedNowOriginalCreationDateTimeGuidelinePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlGrpInf/OrgnlCreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
     } else if(typeof date === 'object'){  /*Teja*/
        msgDate = false;
    } else {
        msgDate = date.toString();
    }
    // 2022-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 2022-04-01 22.00 
    // Check for AM/PM in the date string 
    // if AM/PM is present it is not in 24 Hour Format
    // if not found then treat this string as valid

    if (msgDate) {
        var regexForUtc = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/g;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("fedNowCreationDateAndTimeRulePacs002: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("128", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("128", "8978", map);
        retVal = 1;
    }
    return retVal;

}
//InstructionIdentification
	
function fedNowOriginalInstructionIdentificationGuidelinePacs002(exchange){ //DONE 28 //SWIFT VALIDATION FAIL
	logger.info("In fedNowOriginalInstructionIdentificationGuidelinePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalInstructionIdentificationGuidelinePacs002 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalInstructionIdentificationGuidelinePacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("129", "7986", map);
        retVal=1;
    }

    return retVal;

}		
	
function fedNowOriginalEndToEndIdentificationGuidelinePacs002(exchange) {
	logger.info("In fedNowOriginalEndToEndIdentificationGuidelinePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value){
        logger.info("fedNowOriginalEndToEndIdentificationGuidelinePacs002 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalEndToEndIdentificationGuidelinePacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("130", "7986", map);
        retVal=1;
    }

    return retVal;
}


function fedNowOriginalUETRGuidelinePacs002(exchange) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In fedNowUETRGuidelinePacs002");
	path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlUETR";
	value = getValueFromPath(Document, path);
	logger.info("fedNowUETRGuidelinePacs002: MsgId value = " + value);
    logger.info("fedNowUETRGuidelinePacs002: MsgId type of value = " + typeof value);


	if(value) 
    {
		var match=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "fedNowUETRGuidelinePacs002 is success");


            logger.info("fedNowUETRGuidelinePacs002: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
		}	
	}
	return retVal;
}	
function fedNowPreferredContactMethodRule1Pacs002(exchange){

    logger.info("In fedNowPreferredContactMethodRule1Pacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/EmailAdr";
	
    var value = getValueFromPath(Document, path);
   
    logger.info("fedNowPreferredContactMethodRule1Pacs002 : EmailId " +value);
    if(value){
        logger.info("fedNowPreferredContactMethodRule1Pacs002 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("fedNowPreferredContactMethodRule1Pacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowPreferredContactMethodRule2Pacs002(exchange){

    logger.info("In fedNowPreferredContactMethodRule2Pacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/MobNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("fedNowPreferredContactMethodRule2Pacs002 : MobileNo " +value);
    if(value){
        logger.info("fedNowPreferredContactMethodRule2Pacs002 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowPreferredContactMethodRule2Pacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowPreferredContactMethodRule3Pacs002(exchange){

    logger.info("In fedNowPreferredContactMethodRule3Pacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Orgtr/CtctDtls/PhneNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("fedNowPreferredContactMethodRule3Pacs002 : phoneNo " +value);
    if(value){
        logger.info("fedNowPreferredContactMethodRule3Pacs002 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("fedNowPreferredContactMethodRule3Pacs002 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowCodeReasonGuidelinePacs002(exchange) {
	logger.info("inside fedNowCodeReasonGuidelinePacs002");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Rsn/Cd';
	retVal = checkExternalCodelist(path, 'ExternalStatusReason1Code', Document, map);

	if(retVal) {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "FedNowCodeReasonGuidelinePacs002 is failure");
            retVal = setCommentsForTransaction("12", "5252", map);
            return retVal;
        
	}
    else {
        validflag = true;
        logger.info( "FedNowCodeReasonGuidelinePacs002 is success"); 
    } 
	return retVal;
}

function fedNowTransactionStatusCodeRulePacs002(exchange) {
	logger.info("fedNowTransactionStatusCodeRulePacs002");
	var path;
    var validflag;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts';
	retVal = checkExternalCodelist(path, 'FEDNOW_TRANS_STATUS', Document, map);
    	if(retVal) {
        setHeader(map, "PLCN_validMessage", false);
       retVal = setCommentsForTransaction("133", "1556", map);
       retVal = 1;

	}
    else {

       
                   logger.info("fedNowTransactionStatusCodeRulePacs002 passed " +retVal);
            validflag = true;
       }
	return retVal;
}

function fedNowOrignalTransactionIdentificationRule1Pacs002(exchange){
logger.info("In  fedNowOrignalTransactionIdentificationRule1Pacs002 ")
var inMsg = exchange.getIn();
var map = inMsg.getHeaders();
var retVal = 0;
var validflag;
var path;
var path2;
var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxId";
var value1 = getValueFromPath(Document, path);

logger.info("value1: "+ value1);
path2 ="/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlUETR";
var value2 = getValueFromPath(Document,path2)
logger.info("value2: "+ value1);
if(value1 || value2 ){
    logger.info("fedNowOrignalTransactionIdentificationRule1Pacs002 passed ");
    validflag = true;
}
else {
    logger.info("fedNowOrignalTransactionIdentificationRule1Pacs002 failed ");
    setHeader(map, "PLCN_validMessage", false);
    retVal = setCommentsForTransaction("131", "7988", map);
    retVal=1;
}

return retVal;

}


function fedNowOriginalTransactionIdentificationGuidelinePacs002(exchange){
    logger.info("In fedNowOriginalTransactionIdentificationGuidelinePacs002 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;

    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlTxId";
    var value1 = getValueFromPath(Document, path);
    path2="/Document/FIToFIPmtStsRpt/TxInfAndSts/OrgnlUETR";
    var value2=getValueFromPath(Document,path2)
    if(value1 || value2 ){
        logger.info("fedNowOriginalTransactionIdentificationGuidelinePacs002 passed " + value1);
        validFlag = true;
    }
    else {
        logger.info("fedNowOriginalTransactionIdentificationGuidelinePacs002 failed " + value2);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("131", "7986", map);
        retVal=1;
    }

    return retVal;


}


//If Transaction Status is 'RJCT', then Status Reason Information must be present.

function fedNowTransactionStatusRejectRule1Pacs002(exchange) {

	logger.info("In fedNowTransactionStatusRejectRule1Pacs002");
	var txStsPath;
	var txSts;
	var stsRsnInfPath;
	var stsRsnInf;
	var retVal;
	retVal = 0;
    var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	txStsPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txStsPath);
	logger.info("txSts: " + txSts);

	stsRsnInfPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Rsn/Cd";
	stsRsnInf = getValueFromPath(Document, stsRsnInfPath);
	logger.info("stsRsnInf: " + stsRsnInf);

	if(txSts == "RJCT") {
		if(stsRsnInf){
			setHeader(map, "PLCN_validMessage", false);
			logger.info("If If Transaction Status is 'RJCT', then Status Reason Information must be present.");
			retVal = setCommentsForTransaction("179", "7966", map);
			return retVal;			
		}

	}
	return retVal;

 }


function fedNowEffectiveInterbankSettlementDateRule1Pacs002(exchange) {
    var validflag;
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    logger.info("In fedNowEffectiveInterbankSettlementDateRule1Pacs002 ")
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
    var retVal;
	retVal = 0;
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var txSts= "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	var txStsValue = getValueFromPath(Document,txSts);
	var FctvIntrBkSttlmDtPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/FctvIntrBkSttlmDt/Dt";
	var FctvIntrBkSttlmDtPathValue = getValueFromPath(Document, FctvIntrBkSttlmDtPath);
	if(txStsValue =="ACSC"){
	if(FctvIntrBkSttlmDtPathValue){
        logger.info("fedNowEffectiveInterbankSettlementDateRule1Pacs002 passed " +FctvIntrBkSttlmDtPathValue);
        validflag = true;
    }
}
else{
    logger.info("fedNowEffectiveInterbankSettlementDateRule1Pacs002 failed " +FctvIntrBkSttlmDtPathValue);
    setHeader(map, "PLCN_validMessage", false);
    retVal = setCommentsForTransaction("185", "7987", map);
    retVal=1;
}
	return retVal;

}

//This element is present when a message is rejected by the fedNow Service application and contains
// the fedNow Service application rejection reason in coded form.

function fedNowProprietaryReasonGuidelinePacs002(exchange) {
	logger.info("In fedNowProprietaryReasonGuidelinePacs002");
	var txStsPath;
	var txSts;
	var retVal;
	retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    reasonCodePath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Rsn/Cd";
	reasonCode = getValueFromPath(Document, reasonCodePath);
	logger.info("fedNowProprietaryReasonGuidelinePacs002: reasonCode = " + reasonCode);
    
	txSts = getValueFromPath(Document, reasonCodePath);
	logger.info("reasonCode: " + reasonCode);
	if(reasonCode == "RJCT") {
			setHeader(map, "PLCN_validMessage", false);
			logger.info("If TransactionStatus/Code equals RJCT, then “Status Reason Information/Reason” is mandatory.");
			retVal = setCommentsForTransaction("179", "7996", map);
			return retVal;			

	}
	return retVal;
}
function fedNowStatusReasonInformationRulePacs002(exchange) {
	logger.info("In fedNowStatusReasonInformationRulePacs002");
	var txStsPath;
	var txSts;
	var stsRsnInfPath;
	var stsRsnInf;
	var retVal;
	retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	txStsPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txStsPath);
	logger.info("txSts: " + txSts);

	stsRsnInfPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf";
	stsRsnInf = getValueFromPath(Document, stsRsnInfPath);
	logger.info("stsRsnInf: " + stsRsnInf);

	if(txSts == "RJCT") {
		if(!stsRsnInf){
			setHeader(map, "PLCN_validMessage", false);
			logger.info(" Status Reason Information For messages rejected by the fedNow Service application.");
			retVal = setCommentsForTransaction("134", "7966", map);
			return retVal;			
		}

	}
	return retVal;
}


function fedNowAcceptanceDateTimeRule1Pacs002(exchange){
	logger.info("In fedNowAcceptanceDateTimeRule1Pacs002");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
    var validflag;
	var retVal;
	retVal = 0;
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var txSts= "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	var txStsValue = getValueFromPath(Document,txSts);
    logger.info("txstatus value" + txStsValue);
	var AccptncDtTmPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/AccptncDtTm";
	var AccptncDtTmPathValue = getValueFromPath(Document, AccptncDtTmPath);
	if(txStsValue=="ACSC"){
	if(AccptncDtTmPathValue){
        logger.info("fedNowAcceptanceDateTimeRule1Pacs002 passed " + AccptncDtTmPathValue);
        validflag = true;
    }
}
else{
    logger.info("fedNowAcceptanceDateTimeRule1Pacs002 failed " + AccptncDtTmPathValue);
    setHeader(map, "PLCN_validMessage", false);
    retVal = setCommentsForTransaction("183", "7987", map);
    retVal=1;
}
	return retVal;

}
function fedNowAcceptanceDateTimeRule2Pacs002(exchange){
    logger.info("In fedNowAcceptanceDateTimeRule2Pacs002")
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/AccptncDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
    // 2022-04-01 10.00 PM UTC/LOCAL TIME ZONE-SERVER TIME ZONE)
    // 2022-04-01 22.00 
    // Check for AM/PM in the date string 
    // if AM/PM is present it is not in 24 Hour Format
    // if not found then treat this string as valid

    if (msgDate) {
        var regexForUtc = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/g;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("In fedNowCreationDateAndTimeRulePacs002: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("183", "8978", map);
        retVal = 1;
    }
    return retVal;
}


function fedNowRoutingNumberGuidelinePacs002(exchange){
	logger.info("In fedNowRoutingNumberGuidelinePacs002");
    var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = "/Document/FIToFIPmtStsRpt/TxInfAndSts/StsRsnInf/Orgtr/Id/OrgId/Othr/Id";
	value = getValueFromPath(Document, path);
	
	
	if(value) 
    {
		var match= /^\d{9}$/;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "fedNowRoutingNumberGuidelinePacs002 is success");
            logger.info("fedNowRoutingNumberGuidelinePacs002: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
            logger.info( "fedNowRoutingNumberGuidelinePacs002 is failed");
		}	
	}
	return retVal;
}

function createADMIMessageForXSDFailure(exchange) {

	logger.info("XML_VALID_ERROR --> createADMIMessageForXSDFailure");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();

	var msgdbMap = new HashMap();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var readMsgdb = inMsg.getHeaders().get("ACEQ_READ_MSGDB");
	var audit = new HashMap();
	var institutionId = getHeader(map, "PLCN_institutionId");

	var queueId = "ERRORQ";
	setHeader(map, "PLCN_queue", queueId);
	setHeader(map, "PLCN_displayFlag", "Y");
	setHeader(map, "PLCN_processingStage", "ERR");
	setHeader(map, "PLCN_ERRORQ", true);
	setHeader(map, "PLCN_repairReqFinal", "true");


	// var messageNo = readMsgdb.get("MESSAGENO") ;





	// audit = new HashMap();
	// audit.put("MESSAGENO", messageNo);
	// audit.put("QUEUEID", queueId);
	// //audit.put("USERNAME","ADMIN1");
	// audit.put("APPLICATION","ACEQ_CMP");
	// audit.put("MODULENAME","ACEQWRITE");
	// audit.put("ACTION","WRITE");
	// audit.put("AUDITTEXT","Message number " +  "<" + messageNo + ">" + " read from DB and written into Queue " +  "'" + queueId + "'");
	// audit.put("INSTITUTIONID", institutionId);

}

