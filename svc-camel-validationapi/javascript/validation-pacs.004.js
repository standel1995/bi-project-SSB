/**
* This function calls externalCodelistValidationFedNowPacs004 and FedNowValidationRulesPacs004 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPacs004Mx(exchange) {
	logger.info("wrapperFedNowPacs004Mx");
	var retVal;
	var commentsB2b;
	var pacs04ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPacs004Mx:In wrapperFedNowPacs004Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	pacs04ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS04_VALD_FLAG_MX");
	pacs04ValdFlagMx = pacs04ValdFlagMx.trim();
	logger.info("pacs04ValdFlagMx = " + pacs04ValdFlagMx);

	if(pacs04ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPacs004Mx: Calling FedNowValidationRulesPacs004");
		retVal = FedNowValidationRulesPacs004(pacs04ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs004Mx: retVal from FedNowValidationRulesPacs004 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs004Mx: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs004Mx: Calling externalCodelistValidationFedNowPacs004");
		// 	retVal = externalCodelistValidationFedNowPacs004(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowPacs004 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs004Mx: Calling ibanValidationFedNowPacs004");
		// 	retVal = ibanValidationFedNowPacs004(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowPacs004Mx: txnComments from ibanValidationFedNowPacs004 = " + txnComments);
		// }
	}

	if(pacs04ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPacs004Mx: Calling FedNowValidationRulesPacs004");
		retVal = FedNowValidationRulesPacs004(pacs04ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs004Mx: retVal from FedNowValidationRulesPacs004 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs004Mx: txnComments = " + txnComments);

		// logger.info("wrapperFedNowPacs004Mx: Calling externalCodelistValidationFedNowPacs004");
		// retVal = externalCodelistValidationFedNowPacs004(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowPacs004 = " + txnComments);			
		

		// logger.info("wrapperFedNowPacs004Mx: Calling ibanValidationFedNowPacs004");
		// ibanValidationFedNowPacs004(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowPacs004Mx: txnComments from ibanValidationFedNowPacs004 = " + txnComments);
	}
}


function FedNowValidationRulesPacs004(pacs04ValdFlagMx, exchange){
	logger.info("FedNowValidationRulesPacs004");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("pacs04ValdFlagMx value: "+ pacs04ValdFlagMx);
	if(pacs04ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs2(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}

		try {
			retVal = fedNowMessageIdentificationRulePacs004(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowCreationDateAndTimeRulePacs004(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = fedNowCurrencyAndAmountRulePacs004(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowOriginalMessageIdentificationGuidelinePacs004(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowOriginalMessageNameIdentificationGuidelinePacs004(exchange);
		} catch (e) { logger.info(e); }  
		try {
			retVal = FedNowOriginalInstructionIdentificationGuidelinePacs004(exchange);
		} catch (e) { logger.info(e); }
		try {
			retVal = FedNowOriginalEndToEndIdentificationGuidelinePacs004(exchange);
		} catch (e) { logger.info(e); }

		try {
			retVal = FedNowOriginalTransactionIdentificationGuidelinePacs004(exchange);
		} catch (e) { logger.info(e); }
	    try {
			retVal = FedNowOriginalUETRGuidelinePacs004(exchange);
		} catch (e) { logger.info(e); } 
		try {
			retVal = fedNowCurrencyAndAmountRulePacs004(exchange);
		} catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowOriginalInterbankSettlementAmountGuidelinePacs004(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowOriginalInterbankSettlementDateGuidelinePacs004(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		retVal = fedNowReturnedInterbankSettlementAmountGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	try {
		retVal = fedNowCompensationAmountGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }

	try {
		retVal = fedNowCountrySubdivisonPacs004(exchange);
	} catch (e) { logger.info(e); }
	try {
		retVal = fednowProxyTypeGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	try {
		retVal = fedNowAccountTypeGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	try {
		retVal = fedNowAccountIdentificationProxyGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	try {
		retVal = fedNowDebtorNameRulePacs004(exchange);
	} catch (e) { logger.info(e); }
	
	try {
		retVal = fedNowDebtorAgentNameGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	
	try {
		retVal = fedNowReturnReasonCodeGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	try {
		retVal = FedNowRoutingNumberGuidelinePacs004(exchange);
	} catch (e) { logger.info(e); }
	
	try {
		retVal =fedNowLocalInstrumentRule1Pacs004 (exchange);
	} catch (e) { logger.info(e); }
	     
	try {
		   retVal = fedNowPreferredContactMethodRule1Pacs004(exchange);
	   } catch (e) { logger.info(e); }

	   try {
		   retVal = fedNowPreferredContactMethodRule2Pacs004(exchange);
	   } catch (e) { logger.info(e); }
	   try {
		   retVal = fedNowPreferredContactMethodRule3Pacs004(exchange);
	   } catch (e) { logger.info(e); }
		

       
	}
	return retVal;
}







function fedNowMessageIdentificationRulePacs004(exchange) {
	logger.info("<-- RULE --> fedNowMessageIdentificationRulePacs004");
	var path;
	var value;
	var validFlag=true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	
	path = "/Document/PmtRtr/GrpHdr/MsgId";
	value = getValueFromPath(Document, path);
	logger.info("----->fedNowMessageIdentificationRulePacs004: MsgId value = " + value);
    logger.info("----->fedNowMessageIdentificationRulePacs004: MsgId type of value = " + typeof value);


	if(value) 
    {
		// Logic to validate the MsgId
        // Must be unique for a given calendar day. 
        // 
        // Message Identification is a reference assigned by the sender of the message, 
        // and is composed of the Calendar Date (8 numerical characters, CCYYMMDD), 
        // the sender's FedNow Connection Party Identifier (9 alphanumerical characters), 
        // and a reference assigned by the sender (up to 18 characters permissible for a 
        // text element). 
        //
        // 1. Should be in the following foramt
        //     CCYYMMDD@@@@@@@@@##################
        //     CC : Century (2 number)
        //     YY : Year (2 number)
        //     MM : Month (2 number)
        //     DD : Day (2 number)
        //     @@ : FedNow Connection Party Identifier (9 alphanumerical characters)
        //     ## : a reference assigned by the sender (up to 18 characters permissible for a text element)

        // REGEX --> ^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$
        
        var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;

        //var sValue = value.toString();

        if( validatorRegex.test(value) ) 
        {
            var extDate = value.slice(0,8);
            logger.info("----->fedNowMessageIdentificationRulePacs004: extDate value = " + extDate);
            retVal = fedNowDateFormatValidate(extDate, 'YYYYMMDD');

            if( retVal == 1)
            {
                validFlag = false;
            }
            //validFlag = true;
            logger.info("----->fedNowMessageIdentificationRulePacs004: validFlag value = " + validFlag);
        }
		if(!validFlag) 
        {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("118", "738", map);
			retVal = 1;
		}

		//ibanUpper(exchange, path, value);		
	}
	return retVal;
}
function fedNowDateFormatValidate(inputDate, format)
{
    // 0=VALID
    // 1=INVALID
   var retVal = 0;
   
   var extDateMoment = moment(inputDate, format);

    logger.info("----->fedNowDateFormatValidate: extDateMoment value = " + extDateMoment);
    
   if( !extDateMoment.isValid() )
   {
       logger.info("----->InValid Date");
       retVal = 1;
   }

    return retVal;
}

function FedNowCreationDateAndTimeRulePacs004(exchange) {
	var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;
    logger.info("In FedNowCreationDateAndTimeRulePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/GrpHdr/CreDtTm";
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
            logger.info("In FedNowCreationDateAndTimeRulePacs004: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("119", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("410", "8978", map);
        retVal = 1;
    }
    return retVal;

}
function fedNowOriginalTransactionIdentificationRule1Pacs004(exchange){
    logger.info("In  fedNowOriginalTransactionIdentificationRule1Pacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var path;
    var path2;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    path = "/Document/PmtRtr/TxInf/OrgnlTxId";
    var transactionId = getValueFromPath(Document, path);

    logger.info("transactionId: "+ transactionId);
    path2 ="/Document/PmtRtr/TxInf/OrgnlUETR";
    var uetrValue = getValueFromPath(Document,path2)
    logger.info("UETR: "+uetrValue);
    if(transactionId || uetrValue ){
        logger.info("fedNowOriginalTransactionIdentificationRule1Pacs004 passed ");
        validflag = true;
    }
    else 
        logger.info("fedNowOriginalTransactionIdentificationRule1Pacs004 failed ");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("173", "7986", map);
        retVal=1;
    

    return retVal;
}
	
function FedNowOriginalMessageIdentificationGuidelinePacs004(exchange) {
    logger.info("In FedNowOriginalMessageIdentificationGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("FedNowOriginalMessageIdentificationGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalMessageIdentificationGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("168", "7986", map);
        retVal=1;
    }

    return retVal;

}	
//MessageNameIdentification
function FedNowOriginalMessageNameIdentificationGuidelinePacs004(exchange) {
    logger.info("In FedNowOriginalMessageNameIdentificationGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalMessageNameIdentificationGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalMessageNameIdentificationGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("169", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowOriginalCreationDateTimeGuidelinePacs004(exchange){
    logger.info("In fedNowOriginalCreationDateTimeGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlCreDtTm";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalCreationDateTimeGuidelinePacs004 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("fedNowOriginalCreationDateTimeGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("170", "7986", map);
        retVal=1;
    }

    return retVal;


}	
//CreationDatetime	
function FedNowOriginalCreationDateTimeRule1Pacs004(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("FedNowOriginalCreationDateTimeRule1Pacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlGrpInf/OrgnlCreDtTm";
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
            logger.info("FedNowOriginalCreationDateTimeRule1Pacs004: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("170", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("170", "8978", map);
        retVal = 1;
    }
    return retVal;

}
//InstructionIdentification
	
function FedNowOriginalInstructionIdentificationGuidelinePacs004(exchange){ //DONE 28 //SWIFT VALIDATION FAIL
	logger.info("In FedNowOriginalInstructionIdentificationGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalInstructionIdentificationGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalInstructionIdentificationGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("171", "7986", map);
        retVal=1;
    }

    return retVal;

}		
	
function FedNowOriginalEndToEndIdentificationGuidelinePacs004(exchange) {
	logger.info("In FedNowOriginalEndToEndIdentificationGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalEndToEndIdentificationGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalEndToEndIdentificationGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("172", "7986", map);
        retVal=1;
    }

    return retVal;
}
function FedNowOriginalTransactionIdentificationGuidelinePacs004(exchange){
    logger.info("In FedNowOriginalTransactionIdentificationGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    path="/Document/PmtRtr/TxInf/OrgnlTxId";
    var value=getValueFromPath(Document,path)
    if( value ){
        logger.info("FedNowOriginalTransactionIdentificationGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalTransactionIdentificationGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("173", "7944", map);
        retVal=1;
    }

    return retVal;


}

function FedNowOriginalUETRGuidelinePacs004(exchange) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In FedNowUETRGuidelinePacs004");
	path = "/Document/PmtRtr/TxInf/OrgnlUETR";
	value = getValueFromPath(Document, path);
	logger.info("FedNowUETRGuidelinePacs004: MsgId value = " + value);
    logger.info("FedNowUETRGuidelinePacs004: MsgId type of value = " + typeof value);


	if(value) 
    {
		var match=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "FedNowUETRGuidelinePacs004 is success");


            logger.info("FedNowUETRGuidelinePacs004: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
		}	
	}
	return retVal;
}

function fedNowCurrencyAndAmountRulePacs004(exchange) {
	logger.info("In fedNowCurrencyAndAmountRulePacs004");
    var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var retVal = 0;
    var iintrbnksttlcurrPath;
    var intrbnksttlcurr;
	var validFlag;
	var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	iintrbnksttlcurrPath  = '/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt/@Ccy';
    intrBkSttlmAmtPath    = '/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
    intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);
	
    logger.info("intrBkSttlmAmt:" + intrBkSttlmAmt);
    logger.info("intrbnksttlcurr:" + intrbnksttlcurr);

	if (intrBkSttlmAmt && intrbnksttlcurr) 
	{
		if (intrbnksttlcurr == "USD" && intrBkSttlmAmt > 0) {
			validFlag = true;
			logger.info("In fedNowCurrencyAndAmountRulePacs004 passed");
		}
	}

	if( !validFlag)
	{
		logger.info("The codes USD only use for show the currency");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("177", "7951", map);
		return retVal;
	}


	return retVal;

}	
function fedNowOriginalInterbankSettlementAmountGuidelinePacs004(exchange){
    logger.info("In fedNowOriginalInterbankSettlementAmountGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalInterbankSettlementAmountGuidelinePacs004 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("fedNowOriginalInterbankSettlementAmountGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("177", "7986", map);
        retVal=1;
    }

    return retVal;


}
function fedNowOriginalInterbankSettlementDateGuidelinePacs004(exchange){
    logger.info("In fedNowOriginalInterbankSettlementDateGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmDt";
    var value = getValueFromPath(Document, path);

    if(value ){
        logger.info("fedNowOriginalInterbankSettlementDateGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("fedNowOriginalInterbankSettlementDateGuidelinePacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("178", "7986", map);
        retVal=1;
    }

    return retVal;
}

function fedNowReturnedInterbankSettlementAmountGuidelinePacs004(exchange){
    logger.info("In fedNowReturnedInterbankSettlementAmountGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var path;
    var originalPath;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt ";
    var returnIntrBkSttlmAmt = getValueFromPath(Document, path);
    originalPath="/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt"
    var originalIntrBkSttlmAmt= getValueFromPath(Document,originalPath);
    var compensationAmountPath="/Document/PmtRtr/TxInf/CompstnAmt";
    var compensationAmount=getValueFromPath(Document,compensationAmountPath);
    if(returnIntrBkSttlmAmt!==originalIntrBkSttlmAmt){
        logger.info("compensation amount "+compensationAmount);
        logger.info("fedNowReturnedInterbankSettlementAmountGuidelinePacs004 passed ");
        validflag = true;
    }
    else {
        logger.info("fedNowReturnedInterbankSettlementAmountGuidelinePacs004 failed ");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("179", "7986", map);
        retVal=1;
    }

    return retVal;
}










function fedNowCurrencyAndAmountRule2Pacs004(exchange)
 {
	
	logger.info("<-- RULE --> FedNowCurrencyAndAmountRule2Pacs004");
	var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var retVal = 0;
    var iintrbnksttlcurrPath;
    var intrbnksttlcurr;
	var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	iintrbnksttlcurrPath  = '/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt/@Ccy';
    intrBkSttlmAmtPath    = '/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
    intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);

	// FedNow Service product offering is now offerig USD only
	// so return valid.
   
	return retVal;

}
function fedNowCompensationAmountGuidelinePacs004(exchange){
    logger.info("In fedNowCompensationAmountGuidelineGuidelinePacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var path;
    var originalPath;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/RtrdIntrBkSttlmAmt ";
    var returnIntrBkSttlmAmt = getValueFromPath(Document, path);
    originalPath="/Document/PmtRtr/TxInf/OrgnlIntrBkSttlmAmt"
    var originalIntrBkSttlmAmt= getValueFromPath(Document,originalPath);
    var compensationAmountPath="/Document/PmtRtr/TxInf/CompstnAmt";
    var compensationAmount=getValueFromPath(Document,compensationAmountPath);
    if(returnIntrBkSttlmAmt!==originalIntrBkSttlmAmt){
        logger.info("restocking fee"+compensationAmount);
        logger.info("CompensationAmountGuidelineGuidelinePacs004 passed ");
        validflag = true;
    }
    else {
        logger.info("CompensationAmountGuidelineGuidelinePacs004 failed ");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("192", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowCountrySubdivisonPacs004(exchange) {

	logger.info("<-- RULE --> FedNowCountrySubdivisonPacs004");
    var path;
    var countrySubDivisonName;
    var validflag;
    var retVal = 0;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/PstlAdr/CtrySubDvsn";
    countrySubDivisonName = getValueFromPath(Document, path);
    logger.info("----->country: subdivision: " + countrySubDivisonName);
     var ctrySubdivison="US-";
     var result=ctrySubdivison.concat(countrySubDivisonName)


    var xValue = memTblGetTableValue(map, "CountrySubDivisions", result);
    logger.info("----->CountrySubDivisions : " + xValue);

    if (xValue) {
        //The country subdivision should be provided in line with 
        //the ISO 3166-2 standard for countries and subdivisions, i.e.,
        // use of a two-character code to represent a
        // U.S. state (e.g., 'NY' for New York).
        // We require countries data and validate whether it 
        // following ISO 3166-2 standard
        validflag = true;
        logger.info("----->fedNowCountrySubdivisonPacs004 passed");
         
    }
    else {
        logger.info("----->fedNowCountrySubdivisonPacs004 failed");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("446", "1405", map);
        retVal=1;
    }


    return retVal;

}

function fedNowDebtorNameRulePacs004(exchange) {
    var debtpath;
    var validflag;
    var retVal = 0;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    logger.info("<-- RULE --> FedNowDebtorNameGuidelinePacs004");
    debtpath = "/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/Nm";
    var value = getValueFromPath(Document, debtpath);
    logger.info("----->name: "+ value);
    /* """DebtorAgentNameGuideline"":
     It is recommended that the FedNow Sender includes
      the name of the Debtor Agent."*/
   /*  if (value != null || value != "" || value != undefined) { */
   if(value){
        logger.info("----->fednowDebtorNameRulePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("----->fednowDebtorNamePacs004 failed"+value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("431", "7986", map);
        retVal=1;
    }

    return retVal;
}

function fedNowAccountTypeGuidelinePacs004(exchange) {

    logger.info("<-- RULE --> FedNowAccountTypeGuidelinePacs004");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
    var path;
    var retVal = 0;
	var cRetVal = 0;
	var dRetVal = 0;
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/PmtRtr/TxInf/RtrChain/CdtrAcct/Tp/Cd";
    cRetVal=  checkExternalCodelist(path, 'ExternalCashAccountType1Code', Document, map);

    
	if(cRetVal) {
        logger.info("----->fedNowAccountTypeGuidelinePacs004:CdtrAcct Tp/Cd");
		setHeader(map, "PLCN_validMessage", false);
		cRetVal = setCommentsForTransaction("181", "1556", map);
		cRetVal = 1;
    }


	path = "/Document/PmtRtr/TxInf/RtrChain/DbtrAcct/Tp/Cd";
    dRetVal= checkExternalCodelist(path, 'ExternalCashAccountType1Code', Document, map);

    if(dRetVal) {
        logger.info("----->fedNowAccountTypeGuidelinePacs004:DbtrAcct: tp/Cd");
		setHeader(map, "PLCN_validMessage", false);
		dRetVal = setCommentsForTransaction("181", "1556", map);
		dRetVal = 1;
    }

	if( cRetVal ==1 || dRetVal == 1)
	{
		retVal = 1;
	}

    return retVal;
}


function fedNowAccountIdentificationProxyGuidelinePacs004(exchange) {

    logger.info("<-- RULE --> FedNowAccountIdentificationProxyGuidelinePacs004");
    var dbtracct;
    var dbtracctPath;
    var retVal = 0;
    var validflag;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);
    dbtracctPath = '/Document/PmtRtr/TxInf/RtrChain/DbtrAcct/Prxy/Id';
    dbtracct = getValueFromPath(Document, dbtracctPath);
    logger.info("fedNowAccountIdentificationProxyGuidelinePacs004: dbtracct = " + dbtracct);
    // retVal = checkCodelist(path, 'ProxyAccountidentificationType1Code', Document, map);
    /* logger.info("Pac008testfile(Prxy)-V0.4.1: dbtracct = " + dbtracct);
 */


    if(dbtracct == "PROXY"){
        validflag = true;
        
        logger.info( "----->fedNowAccountIdentificationProxyGuidelinePacs004 is success");
    }
    else{
        logger.info( "----->fedNowAccountIdentificationProxyGuidelinePacs004 is failed")
        logger.info("retVal: " +retVal)
    }
    return retVal;
}


function fednowProxyTypeGuidelinePacs004(exchange) {



	logger.info("<-- RULE --> fednowProxyTypeGuidelinePacs004");
	//logger.info(" VALID -- > XSD Rule and XPATH mismatch");
	
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    var path;
    var retVal = 0;
	var cRetVal =0;
	var dRetVal =0;

    path = "/Document/PmtRtr/TxInf/RtrChain/DbtrAcct/Prxy/Tp/Cd";
    dRetVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

    if (dRetVal) {
        logger.info("----->fednowProxyTypeGuidelinePacs004:DbtrAcct-TP/CD");
        setHeader(map, "PLCN_validMessage", false);
        dRetVal = setCommentsForTransaction("148", "7984", map);
        dRetVal = 1;
    }

    path = "/Document/PmtRtr/TxInf/RtrChain/CdtrAcct/Prxy/Tp/Cd";
    cRetVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);


    if (cRetVal) {
        logger.info("----->fednowProxyTypeGuidelinePacs004:tp/cd");
        setHeader(map, "PLCN_validMessage", false);
        cRetVal = setCommentsForTransaction("181", "7984", map);
        cRetVal = 1;
    }

	if( cRetVal==1 || dRetVal ==1 )
	{
		retVal =1;
	}

    return retVal;
}
function fedNowDebtorAgentNameGuidelinePacs004(exchange) {
    var debtpath;
    var validflag;
    var retVal = 0;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    logger.info("<-- RULE --> FedNowDebtorAgentNameGuidelinePacs004");
    debtpath = "/Document/PmtRtr/TxInf/RtrChain/DbtrAgt/FinInstnId/Nm";
    var value = getValueFromPath(Document, debtpath);
    logger.info("----->name: "+ value);
    /* """DebtorAgentNameGuideline"":
     It is recommended that the FedNow Sender includes
      the name of the Debtor Agent."*/
   /*  if (value != null || value != "" || value != undefined) { */
   if(value){
        logger.info("----->fednowDebtorAgentNameGuidelinePacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("----->fednowDebtorAgentNameGuidelinePacs004 failed"+value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("431", "7986", map);
        retVal=1;
    }

    return retVal;
}
function FedNowRoutingNumberGuidelinePacs004(exchange){
	logger.info("In FedNowRoutingNumberGuidelinePacs004");
    var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = "/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/Id/OrgId/Othr/Id";
	value = getValueFromPath(Document, path);
	
	
	if(value) 
    {
		var match= /^\d{9}$/;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "FedNowRoutingNumberGuidelinePacs004 is success");
            logger.info("FedNowRoutingNumberGuidelinePacs004: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
            logger.info( "FedNowRoutingNumberGuidelinePacs004 is failed");
		}	
	}
	return retVal;
}
function fedNowPreferredContactMethodRule1Pacs004(exchange){

    logger.info("In FedNowPreferredContactMethodRule1Pacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var path;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/CtctDtls/EmailAdr";
	
    var value = getValueFromPath(Document, path);
   
    logger.info("FedNowPreferredContactMethodRule1Pacs004 : EmailId " +value);
    if(value){
        logger.info("FedNowPreferredContactMethodRule1Pacs004 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("FedNowPreferredContactMethodRule1Pacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowPreferredContactMethodRule2Pacs004(exchange){

    logger.info("In FedNowPreferredContactMethodRule2Pacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var path;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/CtctDtls/MobNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("FedNowPreferredContactMethodRule2Pacs004 : MobileNo " +value);
    if(value){
        logger.info("FedNowPreferredContactMethodRule2Pacs004 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowPreferredContactMethodRule2Pacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;
}
function fedNowPreferredContactMethodRule3Pacs004(exchange){

    logger.info("In FedNowPreferredContactMethodRule3Pacs004 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var path;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/PmtRtr/TxInf/RtrRsnInf/Orgtr/CtctDtls/PhneNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("FedNowPreferredContactMethodRule3Pacs004 : phoneNo " +value);
    if(value){
        logger.info("FedNowPreferredContactMethodRule3Pacs004 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("FedNowPreferredContactMethodRule3Pacs004 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("322", "7986", map);
        retVal=1;
    }

    return retVal;
}

function fedNowReturnReasonCodeGuidelinePacs004(exchange) {
	logger.info("inside fedNowReturnReasonCodeGuidelinePacs004");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/PmtRtr/TxInf/RtrRsnInf/Rsn/Cd';
	retVal = checkExternalCodelist(path, 'ExternalReturnReason1Code', Document, map);

	if(retVal) {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "fedNowReturnReasonCodeGuidelinePacs004 is failure");
            retVal = setCommentsForTransaction("822", "5252", map);
            retVal=1;
      
	}
    else {
        validflag = true;
        logger.info( "fedNowReturnReasonCodeGuidelinePacs004 is success");
    } 
	return retVal;
}
function fedNowLocalInstrumentRule1Pacs004 (exchange) {
	logger.info("<-- RULE --> FedNowLocalInstrumentRule1Pacs004");
	var lclInstrm;
	var lclInstrmPath;
	var retVal = 0;
    var validflag;
    var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    lclInstrmPath = '/Document/PmtRtr/TxInf/OrgnlTxRef/PmtTpInf/LclInstrm/Prtry';
	lclInstrm = getValueFromPath(Document, lclInstrmPath);
	logger.info("----->fedNowLocalInstrumentRule1Pacs004: lclInstrm = " + lclInstrm);

	if(lclInstrm == "FDNA"){
		validflag = true;
		logger.info("----->PLCN_validMessage");
		logger.info( "----->fedNowLocalInstrumentRule1Pacs004 is success");
    }
	else{
		setHeader(map, "PLCN_validMessage", false);
		logger.info( "----->fedNowLocalInstrumentRule1Pacs004 is Failed");
		retVal = setCommentsForTransaction("1102", "7984", map);
		retVal = 1;
	}
	
	return retVal;


}








