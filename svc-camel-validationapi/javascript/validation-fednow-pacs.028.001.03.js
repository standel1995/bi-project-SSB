/**
* This function calls externalCodelistValidationFedNowPacs028 and FedNowValidationRulesPacs028 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPacs028Mx(exchange) {
	logger.info("wrapperFedNowPacs028");
	var retVal;
	var commentsB2b;
	var Pacs028ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPacs028:In wrapperFedNowPacs028');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	Pacs028ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS028_VALD_FLAG_MX");
	Pacs028ValdFlagMx = Pacs028ValdFlagMx.trim();
	logger.info("Pacs028ValdFlagMx = " + Pacs028ValdFlagMx);

	if(Pacs028ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPacs028: Calling FedNowValidationRulesPacs028");
		retVal = FedNowValidationRulesPacs028(Pacs028ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs028: retVal from FedNowValidationRulesPacs028 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs028: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs028: Calling externalCodelistValidationFedNowPacs028");
		// 	retVal = externalCodelistValidationFedNowPacs028(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowPacs028 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs028: Calling ibanValidationFedNowPacs028");
		// 	retVal = ibanValidationFedNowPacs028(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowPacs028: txnComments from ibanValidationFedNowPacs028 = " + txnComments);
		// }
	}

	if(Pacs028ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPacs028: Calling FedNowValidationRulesPacs028");
		retVal = FedNowValidationRulesPacs028(pacs028ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs028: retVal from FedNowValidationRulesPacs028 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs028: txnComments = " + txnComments);

		// logger.info("wrapperFedNowPacs028: Calling externalCodelistValidationFedNowPacs028");
		// retVal = externalCodelistValidationFedNowPacs028(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowPacs028 = " + txnComments);			
		

		// logger.info("wrapperFedNowPacs028: Calling ibanValidationFedNowPacs028");
		// ibanValidationFedNowPacs028(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowPacs028: txnComments from ibanValidationFedNowPacs028 = " + txnComments);
	}
}


function FedNowValidationRulesPacs028(Pacs028ValdFlagMx, exchange){
	logger.info("<-- RULE --> FedNowValidationRulesPacs028");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("pacs028ValdFlagMx value: "+ Pacs028ValdFlagMx);
	if(Pacs028ValdFlagMx == "ERROR") {

		//retVal = shaAndSharRulePacs8(Document, map);
		//if(retVal != 0) {
		// return retVal;
		//}
		// retVal =1 
		// return retVal;

		//-- START

			retVal = fedNowMessageIdentificationRulePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

		
		// try {
		// 	retVal = fedNowCurrencyAndAmountRulePacs028(exchange);
		// } catch (e) { logger.info(e); }
		
		

			retVal = fedNowCreationDateAndTimeRulePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = FedNowOriginalMessageIdentificationGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = FedNowOriginalMessageNameIdentificationGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = FedNowOriginalCreationDateTimeRule1Pacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = fedNowOriginalCreationDateTimeGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal =  FedNowOriginalInstructionIdentificationGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = FedNowOriginalEndToEndIdentificationGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = FedNowOriginalUETRGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal =  FedNowOriginalTransactionIdentificationGuidelinePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        }

			retVal = fedNowClearingSystemMemberIdentificationRulePacs028(exchange);
        if (retVal != 0) {
            return retVal;
        
        }
        
       
       
        
        
	}
	return retVal;
}




// Must be date and time when the message is created by 
// the FedNow Sender. 
//
// Time must be in 24-hour clock format and 
// either in Coordinated Universal Time (UTC) or 
// in local time with offset against UTC.

function fedNowCreationDateAndTimeRulePacs028(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;
    path = "/Document/FIToFIPmtStsReq/GrpHdr/CreDtTm";
	value = getValueFromPath(Document, path);


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
            logger.info("----->validflag :" + validflag);
            logger.info("----->Date and Time Rule is fine");
        } else {
            logger.info("----->fedNowCreationDateAndTimeRulePacs028: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("117", "8978", map);
        retVal = 1;
    }
    return retVal;

}

/**
* This function validates Message Identification Rule
* @param {exchange} Document - The message.
* 
*/
function fedNowMessageIdentificationRulePacs028(exchange) {
	logger.info("<-- RULE --> fedNowMessageIdentificationRulePacs028");
	var path;
	var value;
	var validFlag=true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	
	path = "/Document/FIToFIPmtStsReq/GrpHdr/MsgId";
	value = getValueFromPath(Document, path);
	logger.info("----->fedNowMessageIdentificationRulePacs8: MsgId value = " + value);
    logger.info("----->fedNowMessageIdentificationRulePacs8: MsgId type of value = " + typeof value);


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
            logger.info("----->fedNowMessageIdentificationRulePacs8: extDate value = " + extDate);
            retVal = fedNowDateFormatValidate(extDate, 'YYYYMMDD');

            if( retVal == 1)
            {
                validFlag = false;
            }
            //validFlag = true;
            logger.info("----->fedNowMessageIdentificationRulePacs8: validFlag value = " + validFlag);
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

function createADMIMessageForXSDFailure(exchange)
{

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
}
function fedNowCreationDateAndTimeRulePacs028(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("<-- RULE --> FedNowCreationDateAndTimeRulePacs028");
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/GrpHdr/CreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("----->creationDateAndTimeRule : Date" + date);
    logger.info("----->creationDateAndTimeRule : Date" + date);

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
            logger.info("----->validflag :" + validflag);
            logger.info("----->Date and Time Rule is fine");
        } else {
            logger.info("----->fedNowCreationDateAndTimeRulePacs028: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("117", "8978", map);
        retVal = 1;
    }
    return retVal;

}
//Message Identification
	
function FedNowOriginalMessageIdentificationGuidelinePacs028(exchange) {
    logger.info("In FedNowOriginalMessageIdentificationGuidelinePacs028 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlGrpInf/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("FedNowOriginalMessageIdentificationGuidelinePacs028 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalMessageIdentificationGuidelinePacs028 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("133", "7986", map);
        retVal=1;
    }

    return retVal;

}
	
//MessageNameIdentification
function FedNowOriginalMessageNameIdentificationGuidelinePacs028(exchange) {
    logger.info("In FedNowOriginalMessageNameIdentificationGuidelinePacs028 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlGrpInf/OrgnlMsgNmId";
    var value = getValueFromPath(Document, path);
  
    if(value == 'pacs.008.001.08' || value == 'pain.013.001.07' || value == 'pacs.004.001.10'){
        logger.info("FedNowOriginalMessageNameIdentificationGuidelinePacs028 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalMessageNameIdentificationGuidelinePacs028 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("134", "7986", map);
        retVal=1;
    }

    return retVal;
}	
//CreationDatetime	
function FedNowOriginalCreationDateTimeRule1Pacs028(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("FedNowOriginalCreationDateTimeRule1Pacs028 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlGrpInf/OrgnlCreDtTm";
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
            logger.info("FedNowOriginalCreationDateTimeRule1Pacs028: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("132", "8978", map);
        retVal = 1;
    }
    return retVal;

}

function fedNowOriginalCreationDateTimeGuidelinePacs028(exchange){
    logger.info("In fedNowOriginalCreationDateTimeGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlGrpInf/OrgnlCreDtTm";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("fedNowOriginalCreationDateTimeGuidelinePacs028 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("fedNowOriginalCreationDateTimeGuidelinePacs028 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("132", "7986", map);
        retVal=1;
    }

    return retVal;


}

//InstructionIdentification
	
function FedNowOriginalInstructionIdentificationGuidelinePacs028(exchange){ //DONE 28 //SWIFT VALIDATION FAIL
	logger.info("In FedNowOriginalInstructionIdentificationGuidelinePacs028 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalInstructionIdentificationGuidelinePacs028 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalInstructionIdentificationGuidelinePacs028 passed " +value);
        validflag = true;
      /*  logger.info("FedNowOriginalInstructionIdentificationGuidelinePacs028 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("135", "7986", map);
        retVal=1;*/
    }

    return retVal;

}		
	
function FedNowOriginalEndToEndIdentificationGuidelinePacs028(exchange) {
	logger.info("In FedNowOriginalEndToEndIdentificationGuidelinePacs028 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("FedNowOriginalEndToEndIdentificationGuidelinePacs028 passed " +value);
        validflag = true;
    }
    else {
        logger.info("FedNowOriginalEndToEndIdentificationGuidelinePacs028 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("130", "7986", map);
        retVal=1;
    }

    return retVal;
}


function FedNowOriginalUETRGuidelinePacs028(exchange) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In FedNowUETRGuidelinePacs028");
	path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlUETR";
	value = getValueFromPath(Document, path);
	logger.info("FedNowUETRGuidelinePacs028: MsgId value = " + value);
    logger.info("FedNowUETRGuidelinePacs028: MsgId type of value = " + typeof value);


	if(value) 
    {
		var match=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "FedNowUETRGuidelinePacs028 is success");


            logger.info("FedNowUETRGuidelinePacs028: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
		}	
	}
	return retVal;
}	


function FedNowOriginalTransactionIdentificationGuidelinePacs028(exchange){
    logger.info("In FedNowOriginalTransactionIdentificationGuidelinePacs028 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;

    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/OrgnlTxId";
    var value = getValueFromPath(Document, path);

    if (value) {
        logger.info("FedNowOriginalTransactionIdentificationGuidelinePacs028 passed " + value);
        validFlag = true;
    }
    else {
        logger.info("FedNowOriginalTransactionIdentificationGuidelinePacs028 failed " + value);
        // setHeader(map, "PLCN_validMessage", false);
        // retVal = setCommentsForTransaction("136", "7986", map);
        // retVal = 1;
    }

    return retVal;


}




function fedNowClearingSystemMemberIdentificationRulePacs028(exchange){
    logger.info("In fedNowClearingSystemMemberIdentificationRulePacs028  ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;

    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/FIToFIPmtStsReq/TxInf/InstdAgt/FinInstnId/ClrSysMmbId/MmbId ";
    var value= getValueFromPath(Document, path);
    
    if(value){
        logger.info("fedNowClearingSystemMemberIdentificationRulePacs028 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("fedNowClearingSystemMemberIdentificationRulePacs028 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("124", "7986", map);
        retVal=1;
    }

    return retVal;


}