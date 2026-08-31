/**
* This function calls externalCodelistValidationFedNowPacs008 and FedNowValidationRulesPacs008 function. Header variable PLCN_validMessage is set to false if violation is raised otherwise it is set to true.
* @param {CamelExchange} exchange - The exchange.
*/
function wrapperFedNowPacs008Mx(exchange) {
	logger.info("wrapperFedNowPacs008");
	var retVal;
	var commentsB2b;
	var pacs008ValdFlagMx;
	var txnComments;
	var inMsg;
	var map;
	var Document;

	logger.info('wrapperFedNowPacs008:In wrapperFedNowPacs008');
	inMsg = exchange.getIn();
	map = inMsg.getHeaders();
	Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	pacs008ValdFlagMx = memTblGetTableValue(map, "FLAG-TABLE", "PACS08_VALD_FLAG_MX");
	pacs008ValdFlagMx = pacs008ValdFlagMx.trim();
	logger.info("pacs008ValdFlagMx = " + pacs008ValdFlagMx);

	if (pacs008ValdFlagMx == 'ERROR') {

		logger.info("wrapperFedNowPacs008: Calling FedNowValidationRulesPacs008");
		retVal = fedNowValidationRulesPacs008(pacs008ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs008: retVal from FedNowValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs008: txnComments = " + txnComments);

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs008: Calling externalCodelistValidationFedNowPacs008");
		// 	retVal = externalCodelistValidationFedNowPacs008(Document, map);		
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("txnComments from externalCodelistValidationFedNowPacs008 = " + txnComments);			
		// }

		// if(retVal == 0) {
		// 	logger.info("wrapperFedNowPacs008: Calling ibanValidationFedNowPacs008");
		// 	retVal = ibanValidationFedNowPacs008(exchange);
		// 	txnComments = getHeader(map, "PLCN_txnComments");
		// 	logger.info("wrapperFedNowPacs008: txnComments from ibanValidationFedNowPacs008 = " + txnComments);
		// }
	}

	if (pacs008ValdFlagMx == 'WARNING') {

		logger.info("wrapperFedNowPacs008: Calling FedNowValidationRulesPacs008");
		retVal = fedNowValidationRulesPacs008(pacs008ValdFlagMx, exchange);
		logger.info("wrapperFedNowPacs008: retVal from FedNowValidationRulesPacs008 = " + retVal);
		txnComments = getHeader(map, "PLCN_txnComments");
		logger.info("wrapperFedNowPacs008: txnComments = " + txnComments);

		// logger.info("wrapperFedNowPacs008: Calling externalCodelistValidationFedNowPacs008");
		// retVal = externalCodelistValidationFedNowPacs008(Document, map);		
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("txnComments from externalCodelistValidationFedNowPacs008 = " + txnComments);			


		// logger.info("wrapperFedNowPacs008: Calling ibanValidationFedNowPacs008");
		// ibanValidationFedNowPacs008(exchange);
		// txnComments = getHeader(map, "PLCN_txnComments");
		// logger.info("wrapperFedNowPacs008: txnComments from ibanValidationFedNowPacs008 = " + txnComments);
	}
}


function fedNowValidationRulesPacs008(pacs008ValdFlagMx, exchange) {
	logger.info("<-- RULE --> FedNowValidationRulesPacs008");
	var retVal;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	retVal = 0;

	logger.info("pacs08ValdFlagMx value: " + pacs008ValdFlagMx);
	if (pacs008ValdFlagMx == "ERROR") {



		//-- START
		retVal = fedNowMessageIdentificationRulePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowCreationDateAndTimeRulePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowRemittanceInformationRule1Pacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowEndToEndIdentificationRule2Pacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowEndToEndIdentificationRule1Pacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fednowUETRGuidelinePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowServiceLevelCodeGuidelinePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowLocalInstrumentRule1Pacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowCategoryPurposeProprietaryRulePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowCurrencyAndAmountRulePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowCurrencyAndAmountRule2Pacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowCountrySubdivisonPacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowAccountIdentificationProxyGuidelinePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowAccountTypeGuidelinePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		// retVal = fednowProxyTypeGuidelinePacs008(exchange);
		// if (retVal != 0) {
		// 	return retVal;
		// }
		retVal = fedNowDebtorAgentNameGuidelinePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		retVal = fedNowPurposeCodeGuidelinePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}
		 retVal = fedNowRemittanceInformationRule2Pacs008(exchange);
		 if(retVal != 0) {
			return retVal;
		 }
		retVal = fedNowRemittanceInformationStructuredRulePacs008(exchange);
		if (retVal != 0) {
			return retVal;
		}


	}
	return retVal;
}




function fedNowDebtorAgentNameGuidelinePacs008(exchange) {
	var debtpath;
	var validFlag;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	logger.info("<-- RULE --> FedNowDebtorAgentNameGuidelinePacs008");
	debtpath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/Nm";
	var value = getValueFromPath(Document, debtpath);
	logger.info("----->name: " + value);
	

	if (value) {
		logger.info("----->fednowDebtorAgentNameGuidelinePacs008 passed " + value);
		validFlag = true;
	}
	else {
		logger.info("----->fednowDebtorAgentNameGuidelinePacs008 failed " + value);
		validFlag = true;
	}

	return retVal;
}



         //The country subdivision should be provided in line with 
		//the ISO 3166-2 standard for countries and subdivisions, i.e.,
		// use of a two-character code to represent a
		// U.S. state (e.g., 'NY' for New York).
		// We require countries data and validate whether it 
		// following ISO 3166-2 standard

function fedNowCountrySubdivisonPacs008(exchange) {

	logger.info("<-- RULE --> FedNowCountrySubdivisonPacs008");
	var path;
	var countrySubDivisonName;
	var validflag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr/CtrySubDvsn";
	countrySubDivisonName = getValueFromPath(Document, path);
	logger.info("----->country: subdivision: " + countrySubDivisonName);
	if(countrySubDivisonName)
	 {
	var ctrySubdivison = "US-";
	var result = ctrySubdivison.concat(countrySubDivisonName)
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
		logger.info("----->fedNowCountrySubdivisonPacs008 passed");
		logger.info("return retVal:" +retVal);
	}
	else {
		logger.info("----->fedNowCountrySubdivisonPacs008 failed");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("961", "1405", map);
		retVal = 1;
	}
 } else
	{
		validflag = true;
		logger.info("----->fedNowCountrySubdivisonPacs008 passed");
		logger.info("return retVal:" +retVal);	
	}


	

	return retVal;

}
function fedNowRemittanceInformationRule2Pacs008(exchange) {

	//Unstructured and Structured remittance information must not be combined.
	logger.info("<-- RULE --> FedNowRemittanceInformationRule2Pacs008");
	var structuredPath;
	var validflag;
	var retVal = 0;
	var structuredPathValue;
	var unStructuredPath;
	var unStructuredPathValue;


	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	structuredPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd";
	structuredPathValue = getValueFromPath(Document, structuredPath);
	logger.info("structured path value is"+structuredPathValue)
	unStructuredPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Ustrd";
	unStructuredPathValue = getValueFromPath(Document, unStructuredPath);




	if ((structuredPathValue && !unStructuredPathValue) || (!structuredPathValue && unStructuredPathValue)) {
		//validflag = false;
		validflag = true;
		logger.info("----->unStructuredPathValue is " + unStructuredPathValue);

	} else {
		if (unStructuredPath) {
			logger.info("----->fedNowRemittanceInformationRule2 failed");
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1112", "7987", map);
			return retVal = 1;
		} else {
		logger.info("----->fedNowRemittanceInformationRule2 failed");
		setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("1111", "7987", map);
	 return	retVal = 1;
		}

	}




	//RemittanceInformationRule2 :Unstructured and Structured 
	//remittance information must not be combined."//

	//Information supplied to enable the matching/reconciliation of an entry
	// with the items that the payment is intended to settle, 
	//such as commercial invoices in an accounts' receivable system, 
	// in an unstructured form.

	return retVal;
}




/**""UETRGuideline"":
If the payment is sent as a result of a request for 
payment message (pain.013) that is being honored,
then this should be the UETR of that request for payment 
message if a UETR was provided."**/


function fednowUETRGuidelinePacs008(exchange) {

	var path;
	var value;
	var validFlag;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	logger.info("<-- RULE --> FednowUETRGuidelinePacs008");
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/UETR";
	value = getValueFromPath(Document, path);
	logger.info("----->fednowUETRGuidelinePacs8: MsgId value = " + value);
	logger.info("----->fednowUETRGuidelinePacs8: MsgId type of value = " + typeof value);


	if (value) {
		var match = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/g;

		if (match.test(value)) {
			validFlag = true;
			logger.info("----->fednowUETRGuidelinePacs008 is success");


			logger.info("----->fednowUETRGuidelinePacs8: validFlag value = " + validFlag);
		}
		else {
			retVal = 1;
		}
	} else {
		     validFlag = true;
			logger.info("----->fednowUETRGuidelinePacs008 is success");
	}
	return retVal;
}

/*"""ServiceLevelCodeGuideline"":
If used, the element should contain a four alphanumeric character code from the ISO 20022 
ExternalServiceLevel1Code list.
For complete documentation on the code list, refer to the ISO 20022 website (www.iso20022.org)."
 */


function fedNowServiceLevelCodeGuidelinePacs008(exchange) {
	logger.info("<-- RULE --> FedNowServiceLevelCodeGuidelinePacs008");
	var path;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/SvcLvl/Cd';
	retVal = checkExternalCodelist(path, 'ExternalServiceLevel1Code', Document, map);
	logger.info("retVal: " + retVal);

	if (retVal) {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("----->fedNowServiceLevelCodeGuidelinePacs008 is Failure ");
		retVal = setCommentsForTransaction("314", "5795", map);
		retVal = 1;
	} else {
		logger.info("----->fedNowServiceLevelCodeGuidelinePacs008 is success");
		logger.info("retVal: " + retVal)

	}
	return retVal;


}


/*"""LocalInstrumentRule1"":
Local Instrument must contain a four alphanumeric character code representing a FedNow Service product code. 

For FedNow Service Release 1, 
the code 'FDNA' must be used to identify a 
FedNow Service account to account customer credit transfer." */



function fedNowLocalInstrumentRule1Pacs008(exchange) {
	logger.info("<-- RULE --> FedNowLocalInstrumentRule1Pacs008");
	var lclInstrm;
	var lclInstrmPath;
	var retVal = 0;
	var validflag;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	lclInstrmPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Prtry';
	lclInstrm = getValueFromPath(Document, lclInstrmPath);
	logger.info("----->fedNowLocalInstrumentRule1Pacs008: lclInstrm = " + lclInstrm);

	if (lclInstrm == "FDNA") {
		validflag = true;
		logger.info("----->PLCN_validMessage");
		logger.info("----->fedNowLocalInstrumentRule1Pacs008 is success");
	}
	else {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("----->fedNowLocalInstrumentRule1Pacs008 is Failed");
		retVal = setCommentsForTransaction("318", "7984", map);
		retVal = 1;
	}

	return retVal;


}

/* 
"""CategoryPurposeProprietaryRule"":
Category Purpose must contain a four alphanumeric character code 
to identify the type of customer that initiated the payment. 

For FedNow Service Release 1, 
one of the following codes must be used: 
'CONS' for credit transfers initiated by a consumer, 
'BIZZ' for credit transfers initiated by a business entity, 
and 'GOVT' for credit transfers initiated by a government agency."

*/

function fedNowCategoryPurposeProprietaryRulePacs008(exchange) {
	logger.info("<-- RULE --> FedNowCategoryPurposeProprietaryRulePacs008");
	var path;
	var value;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/CtgyPurp/Prtry'
	value = getValueFromPath(Document, path);
	logger.info("----->value:" + value);
	// logger.info("prop:" + prop);

	if (value) {
		var uValue = value.toUpperCase();
		if (uValue == "CONS" || uValue == "BIZZ" || uValue == "GOVT") {
			validflag = true;
			logger.info("----->fedNowCategoryPurposeProprietaryRulePacs008 is success");

		} else {
			logger.info("----->fedNowCategoryPurposeProprietaryRulePacs008 is failure");
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("321", "8186", map);
			return retVal;
		}
	} else {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("----->fedNowCategoryPurposeProprietaryRulePacs008 is failure");
		retVal = setCommentsForTransaction("321", "8186", map);
		return retVal;
	}

	return retVal;



}


/*
"PurposeCodeGuideline"":
If used, this element should contain a four alphanumeric character code from the ISO 20022 ExternalPurpose1Code list.

For complete documentation on the code list, refer to the ISO 20022 website (www.iso20022.org)."
*/
function fedNowPurposeCodeGuidelinePacs008(exchange) {
	logger.info("<-- RULE --> FedNowPurposeCodeGuidelinePacs008");
	var Purppath;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	Purppath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Purp/Cd';
	var purValue=getValueFromPath(Document,Purppath);
	retVal = checkExternalCodelist(Purppath, 'ExternalPurpose1Code', Document, map);
	logger.info("----->retVal: " + retVal);

if(purValue){
	if (retVal) {
		setHeader(map, "PLCN_validMessage", false);
		logger.info("----->fedNowPurrposeCodeGuidelinePacs008 is Failure ");
		retVal = setCommentsForTransaction("1061", "7999", map);
		retVal = 1;
	} else {
		logger.info("----->fedNowPurrposeCodeGuidelinePacs008 is success");
		logger.info("retVal: " + retVal)
	}
	} else {
		logger.info("----->fedNowPurrposeCodeGuidelinePacs008 is success");
		logger.info("retVal: " + retVal)

	}
	return retVal;


}




function fedNowRemittanceInformationStructuredRulePacs008(exchange) {

	/*"RemittanceInformationStructuredRule"
	The combined length of all elements, excluding ISO 20022 XML tags,
	across all occurrences of the Structured remittance information component must not 
	exceed the maximum number of characters as defined by the FedNow Service.
	*/

	logger.info("<-- RULE --> FedNowRemittanceInformationStructuredRulePacs008");
	var structuredPath;
	var retVal = 0;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);


	var xPathList = new Array();
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/Tp/CdOrPrtry/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/Tp/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/Nb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/RltdDt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Id/Tp/CdOrPrtry/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Id/Tp/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Id/Nb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Id/RltdDt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Desc");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/DuePyblAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/CdtNoteAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/TaxAmt/Tp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/TaxAmt/Amt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/AdjstmntAmtAndRsn/Amt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/AdjstmntAmtAndRsn/CdtDbtInd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/AdjstmntAmtAndRsn/Rsn");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/AdjstmntAmtAndRsn/AddtlInf");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocInf/LineDtls/Amt/RmtdAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/DuePyblAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/DscntApldAmt/Tp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/DscntApldAmt/Amt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/CdtNoteAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/TaxAmt/Tp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/TaxAmt/Amt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/AdjstmntAmtAndRsn/Amt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/AdjstmntAmtAndRsn/CdtDbtInd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/AdjstmntAmtAndRsn/Rsn");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/AdjstmntAmtAndRsn/AddtlInf");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/RfrdDocAmt/RmtdAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/CdtrRefInf/Tp/CdOrPrtry/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/CdtrRefInf/Tp/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/CdtrRefInf/Ref");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/AdrTp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/SubDept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/StrtNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/BldgNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/BldgNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/Flr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/PstBx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/Room");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/PstCd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/TwnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/TwnLctnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/DstrctNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/CtrySubDvsn");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/Ctry");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/PstlAdr/AdrLine");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Id/OrgId/AnyBIC");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Id/OrgId/LEI");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Id/OrgId/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Id/OrgId/Othr/SchmeNm/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/Id/OrgId/Othr/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtryOfRes");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/NmPrfx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/PhneNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/MobNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/FaxNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/EmailAdr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/EmailPurp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/JobTitl");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/Rspnsblty");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/Othr/ChanlTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcr/CtctDtls/PrefrdMtd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/AdrTp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/SubDept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/StrtNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/BldgNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/BldgNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/Flr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/PstBx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/Room");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/PstCd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/TwnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/TwnLctnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/DstrctNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/CtrySubDvsn");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/Ctry");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/PstlAdr/AdrLine");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Id/OrgId/AnyBIC");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Id/OrgId/LEI");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Id/OrgId/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Id/OrgId/Othr/SchmeNm/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/Id/OrgId/Othr/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtryOfRes");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/NmPrfx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/PhneNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/MobNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/FaxNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/EmailAdr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/EmailPurp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/JobTitl");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/Rspnsblty");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/Othr/ChanlTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/Invcee/CtctDtls/PrefrdMtd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Cdtr/TaxId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Cdtr/RegnId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Cdtr/TaxTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Dbtr/TaxId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Dbtr/RegnId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Dbtr/TaxTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Dbtr/Authstn/Titl");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Dbtr/Authstn/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/UltmtDbtr/TaxId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/UltmtDbtr/RegnId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/UltmtDbtr/TaxTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/UltmtDbtr/Authstn/Titl");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/UltmtDbtr/Authstn/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/AdmstnZone");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/RefNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Mtd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/TtlTaxblBaseAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/TtlTaxAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Dt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/SeqNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Tp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Ctgy");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/CtgyDtls");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/DbtrSts");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/FrmsCd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/CertId");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Prd/Yr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Prd/Tp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Prd/FrToDt/FrDt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/Prd/FrToDt/ToDt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/Rate");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/TaxblBaseAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/TtlAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/Dtls/Prd/Yr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/Dtls/Prd/Tp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/Dtls/Prd/FrToDt/FrDt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/Dtls/Prd/FrToDt/ToDt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/TaxAmt/Dtls/Amt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/TaxRmt/Rcrd/AddtlInf");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Tp/CdOrPrtry/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Tp/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/AdrTp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/SubDept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/StrtNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/BldgNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/BldgNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/Flr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/PstBx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/Room");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/PstCd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/TwnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/TwnLctnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/DstrctNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/CtrySubDvsn");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/Ctry");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/PstlAdr/AdrLine");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/AnyBIC");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/LEI");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/Othr/SchmeNm/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/Id/OrgId/Othr/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtryOfRes");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/NmPrfx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/PhneNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/MobNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/FaxNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/EmailAdr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/EmailPurp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/JobTitl");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/Rspnsblty");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/Othr/ChanlTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Grnshee/CtctDtls/PrefrdMtd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/AdrTp/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/SubDept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/StrtNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/BldgNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/BldgNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/Flr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/PstBx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/Room");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/PstCd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/TwnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/TwnLctnNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/DstrctNm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/CtrySubDvsn");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/Ctry");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/PstlAdr/AdrLine");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/AnyBIC");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/LEI");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/Othr/SchmeNm/Cd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/Id/OrgId/Othr/Issr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtryOfRes");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/NmPrfx");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/Nm");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/PhneNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/MobNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/FaxNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/EmailAdr");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/EmailPurp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/JobTitl");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/Rspnsblty");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/Dept");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/Othr/ChanlTp");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/Othr/Id");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/GrnshmtAdmstr/CtctDtls/PrefrdMtd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/RefNb");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/Dt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/RmtdAmt");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/FmlyMdclInsrncInd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/GrnshmtRmt/MplyeeTermntnInd");
	xPathList.push("/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Strd/AddtlRmtInf");

	var data = "";
	for (i = 0; i < xPathList.length; i++) {

		structuredPath = xPathList[i];
		retVal = getValueFromPath(Document, structuredPath, map);

		data += retVal;
		//logger.info("data" +data.length);
	}



	if (data.length > 4000) {
		logger.info("----->fedNowRemittanceInformationStructuredRulePacs008 is failed");
		setHeader(map, "PLCN_validMessage", false);

		retVal = setCommentsForTransaction("1016", "7988", map);
		retVal = 1;

	}
	else {
		logger.info("----->fedNowRemittanceInformationStructuredRulePacs008 is success ");

		logger.info("retVal: " + retVal)

	}


	return retVal;


}

// Must be date and time when the message is created by 
// the FedNow Sender. 
//
// Time must be in 24-hour clock format and 
// either in Coordinated Universal Time (UTC) or 
// in local time with offset against UTC.


function fedNowCreationDateAndTimeRulePacs008(exchange) {
	var path;
	var date;
	var validflag;
	var retVal = 0;
	var msgDate;


	logger.info("<-- RULE --> FedNowCreationDateAndTimeRulePacs008");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = "/Document/FIToFICstmrCdtTrf/GrpHdr/CreDtTm";
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
			logger.info("----->fedNowCreationDateAndTimeRulePacs008: invalid");
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("118", "8144", map);
			retVal = 1;
		}
	} else {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("118", "8144", map);
		retVal = 1;
	}
	return retVal;

}

/* Rules:
Related Remittance Information and Remittance Information must not be combined.
i.e., message should contain only either Related Remittance information (or) Remittance information, but both should not be present */


function fedNowRemittanceInformationRule1Pacs008(exchange) {
	logger.info("<-- RULE --> fedNowRemittanceInformationRule1Pacs008");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var retVal = 0;
	var remPath;
	var relRemPath;

	relRemPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RltdRmtInf";
	var relRemPathValue = getValueFromPath(Document, relRemPath);
	remPath = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf";
	var remPathValue = getValueFromPath(Document, remPath);

	if (relRemPathValue && remPathValue) {
		logger.info("----->Both tags  ");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1080", "7981", map);
		retVal = 1;
	} else if (relRemPathValue || !remPathValue) {
		validflag = true;
		logger.info("----->relRemPathValue is " + relRemPathValue);
		return retVal;
	} else if (!relRemPathValue || remPathValue) {
		validflag = true;
		logger.info("----->remPathValue is " + remPathValue);
		return retVal;
	} else {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("1080", "7981", map);
		retVal = 1;
	}


	return retVal;
}


// "EndToEndIdentificationGuideline1":
// If no EndToEndIdentification is available, then "NOTPROVIDED" should be used. 

function fedNowEndToEndIdentificationRule1Pacs008(exchange) {
	logger.info("<-- RULE --> FedNowEndToEndIdentificationRule1Pacs008");
	var path;
	var endToEnd;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId";
	// var msgType = getHeaders(map,"PaymentType")
	endToEnd = getValueFromPath(Document, path);
	logger.info("----->fedNowEndToEndIdentificationRule1: endToEnd" + endToEnd);

	if (!endToEnd) {
		logger.info("----->fedNowEndToEndIdentificationRule1Pacs008: For no value")
		EndToEndId = "NOT PROVIDED"
		// path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId";
		// setValueInPath(Document, path , EndToEndId);
		logger.info("----->Setting EndToEndIdentification as NOTPROVIDED" + EndToEndId);
		setHeader(map, "PLCN_endToEnd", EndToEndId);
	} else {
		logger.info("----->Setting EndToEndIdentification" + endToEnd);
		setHeader(map, "PLCN_endToEnd", endToEnd);
	}
	return retVal;
}


// If the payment is sent as a result of a request for 
// payment message (pain.013) that is being honored, 
// then this should be the EndToEndIdentification of that request for payment message.

function fedNowEndToEndIdentificationRule2Pacs008(exchange) {
	logger.info("<-- RULE --> fedNowEndToEndIdentificationRule2Pacs008");
	var path;
	var endToEnd;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId";
	// var msgType = getHeader (map,"PaymentType")
	endToEnd = getValueFromPath(Document, path);
	logger.info("----->fedNowEndToEndIdentificationRule1: endToEnd" + endToEnd);

	// if(endToEnd){
	//     if(msgType == "FEDNOWPAIN.013.001.07"){


	//     }
	// }


	return retVal;
}


// Rule: It should contain 4 Alphanumeric Characters according to  ISO 20022 
// Frequently used codes from the ISO 20022
// ExternalProxyAccountType1Code code list include, 
// but are not limited to, the following: 
// TELE    Telephone Number
// EMAL    Email Address

// For complete documentation on the code list, 
// refer to the ISO 20022 website (www.iso20022.org).


/* function fednowProxyTypeGuidelinePacs008(exchange) {



	logger.info("<-- RULE --> fednowProxyTypeGuidelinePacs008");
	//logger.info(" VALID -- > XSD Rule and XPATH mismatch");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var path;
	var retVal = 0;
	var cRetVal = 0;
	var dRetVal = 0;

	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAcct/Prxy/Tp/Cd";
	dRetVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);
	logger.info("----->fednowProxyTypeGuidelinePacs008:DbtrAcct-TP/CD: dRetVal: " + dRetVal);
	if (dRetVal) {
		logger.info("----->fednowProxyTypeGuidelinePacs008:DbtrAcct-TP/CD");
		setHeader(map, "PLCN_validMessage", false);
		dRetVal = setCommentsForTransaction("148", "7984", map);
		dRetVal = 1;
	}

	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Prxy/Tp/Cd";
	cRetVal = checkExternalCodelist(path, 'ExternalProxyAccountType1Code', Document, map);

	logger.info("----->fednowProxyTypeGuidelinePacs008:tp/cd: cRetVal: " + cRetVal);
	if (cRetVal) {
		logger.info("----->fednowProxyTypeGuidelinePacs008:tp/cd");
		setHeader(map, "PLCN_validMessage", false);
		cRetVal = setCommentsForTransaction("1004", "7984", map);
		cRetVal = 1;
	}

	if (cRetVal == 1 || dRetVal == 1) {
		retVal = 1;
	}

	return retVal;
}  */


/* function fednowPurposeCodeGuidelinePacs008(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	var path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Purp/Cd";
	// var purpcd = getValueFromPath(Document,path);
	retVal = checkExternalCodelist(path, 'ExternalPurpose1Code', Document, map);

	if(retVal) {
		setHeader(map, "PLCN_validMessage", false);
		logger.info( "fednowPurposeCodeGuidelinePacs008 is Failure ");
		retVal = setCommentsForTransaction("2", "1556", map);
		retVal = 1;
	} else {
		logger.info( "fednowPurposeCodeGuidelinePacs008 is success");
		logger.info("retVal:"  + retVal)
	}

	return retVal;	


 
}*/


//Acceptance Date Time is present when a transaction has been settled 
//(i.e., Transaction Status is 'ACSC' or 'ACWP').
// IF TRAN_STATUS_PRESENT  THEN ACCEPETANCE_DATE SHOULD BE PRESENT
//Value in the above 2 tags must be present if "TXNSTS" have values as either "ACSC" or "ACWP"

function fedNowAcceptanceDateTimeRule1Pacs008(exchange) {
	logger.info("<-- RULE --> fedNowAcceptanceDateTimeRule1Pacs008");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var AccptncDtTm;
	var txSts;
	var retVal = 0;
	var extDateMoment = moment(inputDate, format);

	txSts = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txSts);
	AccptncDtTmPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/AccptncDtTm";
	AccptncDtTmPath = getValueFromPath(Document, AccptncDtTm);
	logger.info("----->fedNowAcceptanceDateTimeRule1Pacs008: extDateMoment value = " + extDateMoment);

	if (extDateMoment.isValid()) {
		retVal = setValueInPath(Document, txStsVal, "ACSC");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("410", "738", map);
		retVal = 1;
	}
	return retVal;

}


function fedNowAcceptanceDateTimeRule2Pacs008(exchange) {
	logger.info("<-- RULE --> fedNowAcceptanceDateTimeRule2Pacs008");
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var Document1 = inMsg.getBody(java.lang.String.class);
	var AccptncDtTm;
	var txSts;
	var retVal = 0;
	var extDateMoment = moment(inputDate, format);
	txSts = "/Document/FIToFIPmtStsRpt/TxInfAndSts/TxSts";
	txSts = getValueFromPath(Document, txSts);
	AccptncDtTmPath = "/Document/FIToFIPmtStsRpt/TxInfAndSts/AccptncDtTm";
	AccptncDtTmPath = getValueFromPath(Document, AccptncDtTm);
	logger.info("----->fedNowAcceptanceDateTimeRule2Pacs008: extDateMoment value = " + extDateMoment);

	if (extDateMoment.isValid()) {
		retVal = setValueInPath(Document, retVal, "ACSC");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("410", "738", map);
		retVal = 1;
	}
	return retVal;

}



/*"""CurrencyAndAmountRule1"":
	For FedNow Service Release 1 currency must be 'USD' 
	and amount must be greater than zero.
*/

function fedNowCurrencyAndAmountRulePacs008(exchange) {
	logger.info("<-- RULE --> FedNowCurrencyAndAmountRulePacs008");
	var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var retVal = 0;
	var iintrbnksttlcurrPath;
	var intrbnksttlcurr;
	var validFlag;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	iintrbnksttlcurrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy';
	intrBkSttlmAmtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
	intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);

	logger.info("----->intrBkSttlmAmt:" + intrBkSttlmAmt);
	logger.info("----->intrbnksttlcurr:" + intrbnksttlcurr);

	if (intrBkSttlmAmt && intrbnksttlcurr) {
		if (intrbnksttlcurr == "USD" && intrBkSttlmAmt > 0) {
			validFlag = true;
			logger.info("----->In fedNowCurrencyAndAmountRulePacs008");
		}
	}

	if (!validFlag) {
		logger.info("----->The codes USD only use for show the currency");
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("323", "7951", map);
		return retVal;
	}


	return retVal;

}


/*
""CurrencyAndAmountRule2"":
The amount and currency must be in line with 
restrictions defined by the FedNow Service product offering 
identified in the Local Instrument. 
*/


function fedNowCurrencyAndAmountRule2Pacs008(exchange) {

	logger.info("<-- RULE --> FedNowCurrencyAndAmountRule2Pacs008");
	var intrBkSttlmAmtPath;
	var intrBkSttlmAmt;
	var retVal = 0;
	var iintrbnksttlcurrPath;
	var intrbnksttlcurr;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	intrBkSttlmAmtPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy';
	iintrbnksttlcurrPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt';
	intrBkSttlmAmt = getValueFromPath(Document, intrBkSttlmAmtPath);
	intrbnksttlcurr = getValueFromPath(Document, iintrbnksttlcurrPath);

	// FedNow Service product offering is now offerig USD only
	// so return valid.

	return retVal;

}





//If used, this element should contain a four alphanumeric character code from the ISO 20022 ExternalCashAccountType1Code code list.
//Frequently used codes from the ISO 20022 ExternalCashAccountType1Code code list include, but are not limited to, the following: 
//CACC    Current Account
//CHAR    Charges Account
//MOMA    Money Market Account
//SACC    Settlement Account
//SVGS    Savings Account

//For complete documentation on the code list, refer to the ISO 20022 website (www.iso20022.org).


function fedNowAccountTypeGuidelinePacs008(exchange) {

	logger.info("<-- RULE --> FedNowAccountTypeGuidelinePacs008");

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var path;
	var retVal = 0;
	var cRetVal = 0;
	var dRetVal = 0;
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);

	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Tp/Cd";
	cRetVal = checkExternalCodelist(path, 'ExternalCashAccountType1Code', Document, map);
	logger.info("CdtrAcct/Tp/Cd: "+ cRetVal);

	if (cRetVal) {
		logger.info("----->fedNowAccountTypeGuidelinePacs008:CdtrAcct Tp/Cd");
		setHeader(map, "PLCN_validMessage", false);
		cRetVal = setCommentsForTransaction("998", "7996", map);
		cRetVal = 1;
	}


	path = "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAcct/Tp/Cd";
	dRetVal = checkExternalCodelist(path, 'ExternalCashAccountType1Code', Document, map);
	logger.info("DbtrAcct/Tp/Cd: "+ dRetVal);

	if (dRetVal) {
		logger.info("----->fedNowAccountTypeGuidelinePacs008:DbtrAcct: tp/Cd");
		setHeader(map, "PLCN_validMessage", false);
		dRetVal = setCommentsForTransaction("832", "7996", map);
		dRetVal = 1;
	}

	if (cRetVal == 1 || dRetVal == 1) {
		retVal = 1;
	}

	return retVal;
}

//AccountIdentificationProxyGuideline":
//If a proxy is used as account identification, 
//then the value "PROXY" should be used in the
//Account/Identification/Other/Identification element, 
//and the proxy should be given in the Proxy/Identification element. 
//If there is "Proxy" tag under <DbtrAcct> OR <CbtrAcct>, it must always contains the value as "Proxy" (and no other value)


function fedNowAccountIdentificationProxyGuidelinePacs008(exchange) {

	logger.info("<-- RULE --> FedNowAccountIdentificationProxyGuidelinePacs008");
	var dbtracct;
	var dbtracctPath;
	var retVal = 0;
	var validflag;
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	dbtracctPath = '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAcct/Id/Othr/Id';
	dbtracct = getValueFromPath(Document, dbtracctPath);
	logger.info("fedNowAccountIdentificationProxyGuidelinePacs008: dbtracct = " + dbtracct);
	// retVal = checkCodelist(path, 'ProxyAccountidentificationType1Code', Document, map);
	/* logger.info("Pac008testfile(Prxy)-V0.4.1: dbtracct = " + dbtracct);
 */


	if (dbtracct == "PROXY") {
		validflag = true;

		logger.info("----->fedNowAccountIdentificationProxyGuidelinePacs008 is success");
	}
	else {
		// logger.info("----->fedNowAccountIdentificationProxyGuidelinePacs008 is failed");
		// setHeader(map, "PLCN_validMessage", false);
		// retVal = setCommentsForTransaction("181", "1556", map);
		// retVal = 1;
		// logger.info("retVal: " + retVal)

		validflag = true;

		logger.info("----->fedNowAccountIdentificationProxyGuidelinePacs008 is success");
	}
	return retVal;
}


/**
* This function validates Message Identification Rule
* @param {exchange} Document - The message.
* 
*/
function fedNowMessageIdentificationRulePacs008(exchange) {
	logger.info("<-- RULE --> fedNowMessageIdentificationRulePacs008");
	var path;
	var value;
	var validFlag = true;
	var retVal = 0;

	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);


	path = "/Document/FIToFICstmrCdtTrf/GrpHdr/MsgId";
	value = getValueFromPath(Document, path);
	logger.info("----->fedNowMessageIdentificationRulePacs8: MsgId value = " + value);
	logger.info("----->fedNowMessageIdentificationRulePacs8: MsgId type of value = " + typeof value);


	if (value) {
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

		var validatorRegex = /^\d{8}[a-zA-Z0-9]{9}[a-zA-Z0-9]{1,18}$/g;

		//var sValue = value.toString();

		if (validatorRegex.test(value)) {
			var extDate = value.slice(0, 8);
			logger.info("----->fedNowMessageIdentificationRulePacs8: extDate value = " + extDate);
			retVal = fedNowDateFormatValidate(extDate, 'YYYYMMDD');

			if (retVal == 1) {
				validFlag = false;
			}
			//validFlag = true;
			logger.info("----->fedNowMessageIdentificationRulePacs8: validFlag value = " + validFlag);
		} else {
			setHeader(map, "PLCN_validMessage", false);
			retVal = setCommentsForTransaction("117", "8194", map);
			retVal = 1;
		}

		//ibanUpper(exchange, path, value);		
	}  else {
		setHeader(map, "PLCN_validMessage", false);
		retVal = setCommentsForTransaction("117", "8194", map);
		retVal = 1;
	}
	return retVal;
}

function fedNowDateFormatValidate(inputDate, format) {
	// 0=VALID
	// 1=INVALID
	var retVal = 0;

	var extDateMoment = moment(inputDate, format);

	logger.info("----->fedNowDateFormatValidate: extDateMoment value = " + extDateMoment);

	if (!extDateMoment.isValid()) {
		logger.info("----->InValid Date");
		retVal = 1;
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
