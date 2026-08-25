function cashForecastingCheck(exchange) {
	var inMsg = exchange.getIn();
	var map = inMsg.getHeaders();
	var Document = exchange.getIn().getBody(org.w3c.dom.Document.class);
	var msgType;
	var readMsgdb = exchange.getIn().getBody();
	logger.info("cashForecastingCheck: readMsgdb = " + readMsgdb);
	setHeader(map, "ORG_body", readMsgdb);
	
	logger.info("In cashForecastingCheck");

    institutionId = getHeader(map, "PLCN_institutionId");
    logger.info("cashForecastingCheck: institutionId = " + institutionId);

	var plcnInternalcall = getHeader(map,"PLCN_call");
	logger.info("cashForecastingCheck: plcnInternalcall = " + plcnInternalcall);
	plcnInternalcall = plcnInternalcall.toString();

	var msgFamily = getHeader(map, "PLCN_msgFamilyDB");
	logger.info("cashForecastingCheck: msgFamily = " + msgFamily);

   	var custom13 = getHeader(map, "PLCN_custom13");
	logger.info("cashForecastingCheck: custom13 = " + custom13);

	msgType = getHeader(map, "PLCN_msgType");
	logger.info("cashForecastingCheck: msgType = " + msgType);

	if(isPatternPresent(msgFamily,"SEPA")  && plcnInternalcall == "true" && isPatternPresent(custom13, "CASH_FORECASTING=Y")){
		logger.info("cashForecastingCheck: custom13 = " + custom13);
		setHeader(map, "PLCN_cashForeCastingReq", "true");
		setHeader(map, "PLCN_queueAudit", "TMPBALQ1");
		custom13 = replacePattern(custom13, "CASH_FORECASTING=Y", "CASH_FORECASTING=D");
		setHeader(map, "PLCN_custom13", custom13);
		setHeader(map, "PLCNAPI_custom13", custom13);
		logger.info("cashForecastingCheck: custom13 = " + custom13);
	}else{
	    setHeader(map, "PLCN_cashForeCastingReq", "false");
	}

	logger.info("cashForecastingCheck: PLCN_cashForeCastingReq = " + getHeader(map,"PLCN_cashForeCastingReq"));
}