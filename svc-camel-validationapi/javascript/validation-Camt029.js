/**
* This function calls externalCodelistValidationFedNowCAMT029 and FedNowValidationRulesCAMT029 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowCAMT029Mx(exchange) {
	logger.info("wrapperFedNowCAMT029Mx");
	var retVal;
	var commentsB2b;
	var camt029ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowCAMT029Mx:In wrapperFedNowCAMT029Mx');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	
	camt029ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "CAMT029_VALD_FLAG_MX");
	camt029ValdFlagMx = camt029ValdFlagMx.trim();
	logger.info("camt029ValdFlagMx = " + camt029ValdFlagMx);

	if(camt029ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowCAMT029Mx: Calling FedNowValidationRulesCAMT029");
		retVal = FedNowValidationRulesCAMT029(camt029ValdFlagMx, exchange);
		logger.info("wrapperFedNowCAMT029Mx: retVal from FedNowValidationRulesCAMT029 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowCAMT029Mx: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowCAMT029Mx: Calling externalCodelistValidationFedNowCAMT029");
		// 	retVal = externalCodelistValidationFedNowCAMT029(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowCAMT029 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowCAMT029Mx: Calling ibanValidationFedNowCAMT029");
		// 	retVal = ibanValidationFedNowCAMT029(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowCAMT029Mx: txnComments from ibanValidationFedNowCAMT029 = " + txnComments);
		// }
	}

	if(camt029ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowCAMT029Mx: Calling FedNowValidationRulesCAMT029");
		retVal = FedNowValidationRulesCAMT029(camt029ValdFlagMx, exchange);
		logger.info("wrapperFedNowCAMT029Mx: retVal from FedNowValidationRulesCAMT029 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowCAMT029Mx: txnComments = " + txnComments);

		// logger.info("wrapperFedNowCAMT029Mx: Calling externalCodelistValidationFedNowCAMT029");
		// retVal = externalCodelistValidationFedNowCAMT029(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowCAMT029 = " + txnComments);			
		

		// logger.info("wrapperFedNowCAMT029Mx: Calling ibanValidationFedNowCAMT029");
		// ibanValidationFedNowCAMT029(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowCAMT029Mx: txnComments from ibanValidationFedNowCAMT029 = " + txnComments);
	}
}


function FedNowValidationRulesCAMT029(camt029ValdFlagMx, exchange){
	logger.info("FedNowValidationRulesCAMT029");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("camt029ValdFlagMx value: "+ camt029ValdFlagMx);
	if(camt029ValdFlagMx == "ERROR") {

		
	try{
	retVal = fedNowOriginalUETRGuidelineCamt029(exchange);
	} catch(e){ logger.info(e); }
	
	try{
		retVal = fedNowCountrySubdivisonCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowCreationDateAndTimeRuleCamt029(exchange);
			} catch(e){ logger.info(e); }
		try{
			retVal = fedNowIdentificationRuleCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowPreferredContactMethodRule1Camt029(exchange);
		} catch(e){ logger.info(e); }

		try{
			retVal = fedNowPreferredContactMethodRule2Camt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowPreferredContactMethodRule3Camt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalTransactionIdentificationRule1Camt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalEndToEndIdentificationGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalCreationDateTimeGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalMessageIdentificationGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalMessageNameIdentificationGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalCreationDateTimeRule1Camt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalInstructionIdentificationGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowOriginalEndToEndIdentificationGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
		retVal = fedNowTransactionIdentificationCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowRoutingNumberGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowCurrencyAndAmountRuleCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowClearingChannelGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowReturnRequestStatusRuleCamt029(exchange);
		} catch(e){ logger.info(e); }
		try{
		retVal = fedNowReasonCodeGuidelineCamt029(exchange); 
		} catch(e){ logger.info(e); }
		try{
			retVal = fedNowReasonCodeRuleCamt029(exchange);
		} catch(e){ logger.info(e); }
		// try{
		// 	retVal = fedNowReturnPaymentRule1Camt029(exchange);
		// } catch(e){ logger.info(e); }
		try{
			retVal = fedNowChargesGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		// try{
		// 	retVal = fedNowReasonProprietaryRuleCamt029(exchange);
		// } catch(e){ logger.info(e); }
	
		try{
			retVal = fedNowCreatorGuidelineCamt029(exchange);
		} catch(e){ logger.info(e); }
		// try{
		// 	retVal = fedNowReturnRequestRejectionRule1Camt029(exchange);
		// } catch(e){ logger.info(e); }
		
		// try{
		// 	retVal = fedNowReturnRequestResponseRule1Camt029(exchange);
		// } catch(e){ logger.info(e); }
		

	}
	return retVal;
}

/*
Camt029
*/
/*
If used, 
this should be the UETR of the original message to which this returns request message relates.
*/
function fedNowOriginalUETRGuidelineCamt029(exchange) {
	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In OriginalUETRGuidelineCamt029");
	path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlUETR";
	value = getValueFromPath(Document, path);
	logger.info("OriginalUETRGuidelineCamt029: MsgId value = " + value);
    logger.info("OriginalUETRGuidelineCamt029: MsgId type of value = " + typeof value);


	if(value) 
    {
		var match=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

        if( match.test(value) ) 
        {
            validFlag = true;
			logger.info( "OriginalUETRGuidelineCamt029 is success");


            logger.info("OriginalUETRGuidelineCamt029: validFlag value = " + validFlag);
        }
		else{
			retVal = 1;
		}	
	}
	return retVal;
}


/*
"""CountrySubDivisionGuideline"":
The country subdivision should be provided in line with 
the ISO 3166-2 standard for countries and subdivisions, 
i.e., use of a two-character code to represent a U.S. state (e.g., 'NY' for New York)."

*/

function fedNowCountrySubdivisonCamt029(exchange) {
    var path;
    var countrySubDivisonName;
    var validflag;
    var retVal = 0;

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/Chrgs/Agt/FinInstnId/PstlAdr/CtrySubDvsn";
    countrySubDivisonName = getValueFromPath(Document, path);
    logger.info("country: subdivision" + countrySubDivisonName);
     var ctrySubdivison="US-";
     var result=ctrySubdivison.concat(countrySubDivisonName)


    var xValue = memTblGetTableValue(map, "CountrySubDivisions", result);
    logger.info("CountrySubDivisions : " + xValue);

    if (xValue) {
        validflag = true;
        logger.info("CountrySubdivisonCamt029 passed");
         
    }
    else {
        logger.info("CountrySubdivisonCamt029 failed");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("181", "1405", map);
        retVal=1;
    }
}

/*
"""CreationDateTimeRule"":
Must be date and time when the message is created by the FedNow Sender. 
Time must be in 24-hour clock format and either in Coordinated Universal Time (UTC) 
or in local time with offset against UTC."

*/


function fedNowCreationDateAndTimeRuleCamt029(exchange) {
    var path;
    var date;
    var validflag;
    var retVal = 0;
    var msgDate;


    logger.info("InCreationDateAndTimeRuleCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/Assgnmt/CreDtTm";
    date = getValueFromPath(Document, path);
    logger.info("creationDateAndTimeRule : Date" + date);
    logger.info("creationDateAndTimeRule : Date" + date);

    if (typeof date === 'string') {
        msgDate = date;
    } else {
        msgDate = date.toString();
    }
 
    if (msgDate) {
        var regexForUtc = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/g;
        if (regexForUtc.test(msgDate)) {
            validflag = true;
            logger.info("validflag :" + validflag);
            logger.info("Date and Time Rule is fine");
        } else {
            logger.info("CreationDateAndTimeRuleCamt029: invalid");
            setHeader(map, "PLCN_validMessage", false);
            retVal = setCommentsForTransaction("410", "8144", map);
            retVal = 1;
        }
    } else {
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("131", "8978", map);
        retVal = 1;
    }
    return retVal;

}

/*
"""IdentificationRule"":
Must be unique for a given calendar day. 

Identification is a reference assigned by the sender of the message, 
and is composed of the Calendar Date (8 numerical characters, CCYYMMDD), 
the sender's FedNow Connection Party Identifier (9 alphanumerical characters), 
and a reference assigned by the sender (up to 18 characters permissible for a text element). "

*/

function fedNowIdentificationRuleCamt029(exchange) {
	var path;
	var value;
	var validFlag=true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("In IdentificationRuleCamt029");
	path = "/Document/RsltnOfInvstgtn/Assgnmt/Id";
	value = getValueFromPath(Document, path);
	logger.info("IdentificationRuleCamt029: MsgId value = " + value);
    logger.info("IdentificationRuleCamt029: MsgId type of value = " + typeof value);


	if(value) 
    {
        var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;

        //var sValue = value.toString();

        if( validatorRegex.test(value) ) 
        {
            var extDate = value.slice(0,8);
            logger.info("IdentificationRuleCamt029: extDate value = " + extDate);
            retVal = DateFormatValidate(extDate, 'YYYYMMDD');

            if( retVal == 1)
            {
                validFlag = false;
            }
            //validFlag = true;
            logger.info("IdentificationRuleCamt029: validFlag value = " + validFlag);
        }
		if(!validFlag) 
        {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("132", "738", map);
			retVal = 1;
		}

		//ibanUpper(exchange, path, value);		
	}
	return retVal;
}
function DateFormatValidate(inputDate, format)
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
/*
"""PreferredContactMethodRule1"":
If Preferred Method to contact the Case Creator is Email, then Email Address must be present.

*/


function fedNowPreferredContactMethodRule1Camt029(exchange){

    logger.info("In PreferredContactMethodRule1Camt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/RslvdCase/Cretr/Pty/CtctDtls/EmailAdr";
    var value = getValueFromPath(Document, path);
   
    logger.info("PreferredContactMethodRule1Camt029 : EmailId " +value);
    if(value){
        logger.info("PreferredContactMethodRule1Camt029 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("PreferredContactMethodRule1Camt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("206", "7986", map);
        retVal=1;
    }

    return retVal;
}

/*
""PreferredContactMethodRule2"":
If Preferred Method to contact the Case Creator is Mobile or Cell Phone, then Mobile Number must be present.
*/

function fedNowPreferredContactMethodRule2Camt029(exchange){

    logger.info("In PreferredContactMethodRule2Camt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/RslvdCase/Cretr/Pty/CtctDtls";
    var value = getValueFromPath(Document, path);
   
    logger.info("PreferredContactMethodRule2Camt029 : MobileNo " +value);
    if(value){
        logger.info("PreferredContactMethodRule2Camt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("PreferredContactMethodRule2Camt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("204", "7986", map);
        retVal=1;
    }

    return retVal;
}

/*
""PreferredContactMethodRule3"":
If Preferred Method to contact the Case Creator is Phone, then Phone Number must be present."
*/

function fedNowPreferredContactMethodRule3Camt029(exchange){

    logger.info("In PreferredContactMethodRule3Camt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/RslvdCase/Cretr/Pty/CtctDtls/PhneNb";
    var value = getValueFromPath(Document, path);
   
    logger.info("PreferredContactMethodRule3Camt029 : phoneNo " +value);
    if(value){
        logger.info("PreferredContactMethodRule3Camt029 passed " +value);
        validFlag = true;
    }
    else {
        logger.info("PreferredContactMethodRule3Camt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("209", "7986", map);
        retVal=1;
    }

    return retVal;
}

/*

"OriginalTransactionIdentificationGuideline"	
If used, 
this should be the Transaction Identification of the original payment
 instruction to which the original return request message relates (e.g., pacs.008).

*/
       
function fedNowOriginalTransactionIdentificationRule1Camt029(exchange){
    logger.info("In fedNowOriginalTransactionIdentificationGuidelineCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    path="/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlTxId";
    var value=getValueFromPath(Document,path)
    if( value ){
        logger.info("OriginalTransactionIdentificationGuidelineCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalTransactionIdentificationGuidelineCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("163", "7986", map);
        retVal=1;
    }

    return retVal;




}

/* 

"OriginalEndToEndIdentificationGuideline"	
If used,
this element should be the End To End Identification of the original payment
instruction to which the original return request message relates (e.g., pacs.008).

*/

function fedNowOriginalEndToEndIdentificationGuidelineCamt029(exchange){
    logger.info("In OriginalEndToEndIdentificationGuidelineCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlEndToEndId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalEndToEndIdentificationGuidelineCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalEndToEndIdentificationGuidelineCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("157", "7986", map);
        retVal=1;
    }

    return retVal;


}

function fedNowOriginalCreationDateTimeGuidelineCamt029(exchange){
    logger.info("In OriginalCreationDateTimeGuidelineCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlCreDtTm";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalCreationDateTimeGuidelineCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalCreationDateTimeGuidelineCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("159", "7986", map);
        retVal=1;
    }

    return retVal;


}


function fedNowOriginalMessageIdentificationGuidelineCamt029(exchange){
    logger.info("In OriginalMessageIdentificationGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validFlag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
    var validatorRegex =/^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;
    if(validatorRegex.test(value) ){
        logger.info("OriginalMessageIdentificationGuideline passed " +value);
        validFlag = true;
    }
    else {
        logger.info("OriginalMessageIdentificationGuideline failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("160", "7986", map);
        retVal=1;
    }

    return retVal;


}

function fedNowOriginalMessageNameIdentificationGuidelineCamt029(exchange){
    logger.info("In OriginalMessageNameIdentificationGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlMsgId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalMessageNameIdentificationGuideline passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalMessageNameIdentificationGuideline failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("160", "7986", map);
        retVal=1;
    }

    return retVal;


}



function fedNowOriginalCreationDateTimeRule1Camt029(exchange){
    logger.info("In OriginalCreationDateTimeGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlGrpInf/OrgnlCreDtTm";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalCreationDateTimeGuideline passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalCreationDateTimeGuidelines failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("159", "7986", map);
        retVal=1;
    }

    return retVal;


}



function fedNowOriginalInstructionIdentificationGuidelineCamt029(exchange){
    logger.info("In OriginalInstructionIdentificationGuideline ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/OrgnlInstrId";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("OriginalInstructionIdentificationGuideline passed " +value);
        validflag = true;
    }
    else {
        logger.info("OriginalInstructionIdentificationGuideline failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("162", "7986", map);
        retVal=1;
    }

    return retVal;


}


function fedNowCurrencyAndAmountRuleCamt029(exchange) {
    logger.info("In CurrencyAndAmountRule1Camt029");
    var AmtPath;
    var Amt;
    var retVal = 0;
    var currPath;
    var curr;
    var validFlag;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    currPath  = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/IntrBkSttlmAmt/@Ccy';
    AmtPath    = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/IntrBkSttlmAmt';
    Amt = getValueFromPath(Document, AmtPath);
    curr = getValueFromPath(Document, currPath);
    
    logger.info("Amt:" + Amt);
    logger.info("curr:" + curr);

    if (Amt && curr) 
    {
        if (curr == "USD" && Amt > 0) {
            validFlag = true;
            logger.info("CurrencyAndAmountRule1Camt029 is success");
        }
    }

    if( !validFlag)
    {
        logger.info("The codes USD only use for show the currency");
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("197", "7951", map);
        return retVal;
    }
    return retVal;
}


function fedNowTransactionIdentificationCamt029 (exchange) {
    logger.info("In fedNowTransactionIdentificationCamt029");
    var path;
    var value;
    var retVal = 0;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    
    path1 = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/TxId'
    value1 = getValueFromPath(Document, path1);
    path2 = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/UETR'
    value2 = getValueFromPath(Document, path2);

    

    if( value1 || value2 )
    {
           validflag = true;
           logger.info( "fedNowTransactionIdentificationCamt029 is success");
            
    } 
    
     
    
    else {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "fedNowTransactionIdentificationCamt029 is failure");
            retVal = setCommentsForTransaction("199", "7984", map);
            return retVal;
    }
    
    return retVal;
    
}




function fedNowClearingChannelGuidelineCamt029 (exchange) {
    logger.info("In ClearingChannelGuidelineCamt029");
    var path;
    var value;
    var retVal = 0;
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = '/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/ClrChanl'
    value = getValueFromPath(Document, path);
    logger.info("value:" + value);

    if( value == "MPNS" || value == "RTGS" || value == "RTNS")
    {
           validflag = true;
           logger.info( "ClearingChannelGuidelineCamt029 is success");
            
    } else {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "ClearingChannelGuidelineCamt029 is failure");
            retVal = setCommentsForTransaction("194", "7984", map);
            return retVal;
    }
    
    return retVal;
    
}

function fedNowReturnRequestStatusRuleCamt029(exchange) {

    logger.info("ReturnRequestStatusRuleCamt029");

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var path;
    var retVal = 0;
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/Sts/Conf";
    RetVal=  checkExternalCodelist(path, 'ExternalInvestigationExecutionConfirmation1Code', Document, map);
    if(RetVal) 
      {
           validflag = true;
           logger.info( "ReturnRequestStatusRuleCamt029 is success");
            
    } else {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "ReturnRequestStatusRuleCamt029 is failure");
            retVal = setCommentsForTransaction("223", "7984", map);
            return retVal;
    } 

    return retVal;
}



function fedNowReasonCodeGuidelineCamt029(exchange) {

    logger.info("ReasonCodeGuidelineCamt029");

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var path;
    var retVal = 0;
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn/Cd";
    RetVal=  checkExternalCodelist(path, 'ExternalPaymentCancellationRejection1Code', Document, map);

    
    if(RetVal) 
      {
           validflag = true;
           logger.info( "ReasonCodeGuidelineCamt029 is success");
            
    } else {
        setHeader(map, "PLCN_validMessage", false);
        logger.info( "ReasonCodeGuidelineCamt029 is failure");
            retVal = setCommentsForTransaction("156", "7984", map);
            return retVal;
    } 

    return retVal;
}


function fedNowReasonCodeRuleCamt029(exchange){
    logger.info("In ReasonCodeRuleCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn/Cd";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("ReasonCodeRuleCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("ReasonCodeRuleCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("156", "7986", map);
        retVal=1;
    }

    return retVal;


}


function fedNowRoutingNumberGuidelineCamt029(exchange){
    logger.info("In RoutingNumberGuidelineCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Orgtr/Id/OrgId/Othr/Id";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("RoutingNumberGuidelineCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("RoutingNumberGuidelineCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("150", "7986", map);
        retVal=1;
    }

    return retVal;

}




function fedNowReturnPaymentRule1Camt029(exchange) {

    logger.info("ReturnPaymentRule1Camt029");

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var path;
    var retVal = 0;
    var cRetVal = 0;
    var dRetVal = 0;
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);
    var validFlag;

    path = "/Document/RsltnOfInvstgtn/Sts/Conf";
    cRetVal=  checkExternalCodelist(path, 'ExternalInvestigationExecutionConfirmation1Code', Document, map);

    
    if(cRetVal == "IPAY" || cRetVal == "PECR") {
        logger.info("ReturnPaymentRule1Camt029 failure ");
        setHeader(map, "PLCN_validMessage", false);
        cRetVal = setCommentsForTransaction("181", "1556", map);
        cRetVal = 1;
       
    }
    else{
        setHeader(map, "PLCN_validMessage", false);
        cRetVal = setCommentsForTransaction("223", "1556", map);
        cRetVal = 1;

    }


//     path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf";
//     dRetVal= getValueFromPath(Document, path);

//     if(dRetVal) {
//         logger.info("ReturnPaymentRule1Camt029");
//         setHeader(map, "PLCN_validMessage", false);
//         dRetVal = setCommentsForTransaction("181", "1556", map);
//         dRetVal = 1;
//     }

//     if( cRetVal ==1 || dRetVal == 1)
//     {
//         logger.info("ReturnPaymentRule1Camt029 is success");
//         retVal = 1;
//     }
// else{
//     logger.info("ReturnPaymentRule1Camt029 is failed");

// }
    return retVal;
}

function fedNowChargesGuidelineCamt029(exchange){
    logger.info("In ChargesGuidelineCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/RsltnRltdInf/Chrgs";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("ChargesGuidelineCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("ChargesGuidelineCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("166", "7986", map);
        retVal=1;
    }

    return retVal;

}


function fedNowReasonProprietaryRuleCamt029(exchange){
    logger.info("In ReasonProprietaryRuleCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag = true;
    var  cRetVal;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn/Cd";
    cRetVal=  checkExternalCodelist(path, 'ExternalPaymentCancellationRejection1Code', Document, map);
    logger.info("cRetval is" +cRetVal);

  
    if(cRetVal){
        logger.info("ReasonProprietaryRuleCamt029 passed " +value);
        logger.info ("validflag" + validflag);
    }
    else {
        logger.info("ReasonProprietaryRuleCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("156", "7986", map);
        retVal=1;
    }

    return retVal;

}



function fedNowCreatorGuidelineCamt029(exchange){
    logger.info("In CreatorGuidelineCamt029 ")
    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var retVal = 0;
    var validflag;
    var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
    path = "/Document/RsltnOfInvstgtn/RslvdCase/Cretr";
    var value = getValueFromPath(Document, path);
  
    if(value ){
        logger.info("CreatorGuidelineCamt029 passed " +value);
        validflag = true;
    }
    else {
        logger.info("CreatorGuidelineCamt029 failed " +value);
        setHeader(map, "PLCN_validMessage", false);
        retVal = setCommentsForTransaction("202", "7986", map);
        retVal=1;
    }

    return retVal;

}


function fedNowReturnRequestRejectionRule1Camt029(exchange) 
{

    logger.info("ReturnRequestRejectionRule1Camt029");

    var inMsg = exchange.getIn();
    var map = inMsg.getHeaders();
    var path;
    var cRetVal;
    var validFlag;
    var Document= exchange.getIn().getBody(org.w3c.dom.Document.class);

    path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn/Cd";
    cRetVal=  checkExternalCodelist(path, 'ExternalPersonIdentification1Code', Document, map);


    if (cRetVal) {
        logger.info("ReturnRequestRejectionRule1Camt029 failure");
        setHeader(map, "PLCN_validMessage", false);
        cRetVal = setCommentsForTransaction("156", "1556", map);
        cRetVal = 1;
    }


    else {
        logger.info("ReturnRequestRejectionRule1Camt029 success");
        validFlag = true;
    }

    return cRetVal;
}


// function fedNowReturnRequestResponseRule1Camt029(exchange){
//     logger.info("In ReturnRequestResponseRule1Camt029 ")
//     var inMsg = exchange.getIn();
//     var map = inMsg.getHeaders();
//     var retVal = 0;
//     var validflag;
//     var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
//     path = "/Document/RsltnOfInvstgtn/CxlDtls/TxInfAndSts/CxlStsRsnInf/Rsn";
//     var value = getValueFromPath(Document, path);
  
//     if(value ){
//         logger.info("ReturnRequestResponseRule1Camt029 passed " +value);
//         validflag = true;
//     }
//     else {
//         logger.info("ReturnRequestResponseRule1Camt029 failed " +value);
//         setHeader(map, "PLCN_validMessage", false);
//         retVal = setCommentsForTransaction("322", "7986", map);
//         retVal=1;
//     }

  //  return retVal;

//}
