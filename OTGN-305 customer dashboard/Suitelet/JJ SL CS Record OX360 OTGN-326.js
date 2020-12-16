/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
/*******************************************************************************
 * CLIENTNAME:OX Tools
 * OTGN-326
 * OX360 Quarterly report
 * **************************************************************************
 * Date : 04-12-2020
 *
 * Author: Jobin & Jismi IT Services LLP
 * Script Description :
 * Creation of OX360 Report link in customer Record
 * Date created :04-12-2020
 *
 ******************************************************************************/

// Suitetet to display OX360 Report when clicking OX360 Report Button in customer record.
define(['N/search', 'N/runtime', 'N/format', 'N/format/i18n', 'N/file', 'N/record'],
    function (search, runtime, format, formati, file, record) {
        var objects = {};

//function to format number with 2 decimal digits
        function formatCurrency(num) {
            try {
                if (num) {
                    return Number(num).toFixed(2);
                } else {
                    return "0.00";
                }
            } catch (err) {
                return "0.00";
            }
        }

        // function to format amount to Australian currency format
        function makeItCurrency(myNumber) {
            var myFormat = formati.getCurrencyFormatter({currency: "AUD"});
            var newCur = myFormat.format({
                number: myNumber
            });
            return newCur;
        }

        // Function to check values and set default values
        function checkForParameter(parameter, defaultparameter) {
            try {
                if (parameter !== null && parameter !== undefined
                    && parameter !== "null" && parameter !== "NaN"
                    && parameter !== "undefined"
                    && parameter != ""
                    && parameter != " ") {
                    return parameter;
                } else {

                    return defaultparameter;
                }
            } catch (e) {
                log.error("Err@ FN checkForParameter", e);
            }
        }

        function onRequestFxn(context) {
            try {
                var customerid = context.request.parameters.custInternalId;
                var currentuser = customerid;

                if (context.request.method === 'POST') {
                    var csfeedback11 = checkForParameter(context.request.parameters.csfeedback1, "");
                    var csfeedback22 = checkForParameter(context.request.parameters.csfeedback2, "");
                    var csfeedback33 = checkForParameter(context.request.parameters.csfeedback3, "");
                    var csfeedback44 = checkForParameter(context.request.parameters.csfeedback4, "");
                    var csfeedback55 = checkForParameter(context.request.parameters.csfeedback5, "");
                    var customerFeedbackString = "";

                    if (csfeedback11 != "") {
                        customerFeedbackString = csfeedback11 + '\n';
                    }
                    if (csfeedback22 != "") {
                        customerFeedbackString += csfeedback22 + '\n';
                    }
                    if (csfeedback33 != "") {
                        customerFeedbackString += csfeedback33 + '\n';
                    }
                    if (csfeedback44 != "") {
                        customerFeedbackString += csfeedback44 + '\n';
                    }
                    if (csfeedback55 != "") {
                        customerFeedbackString += csfeedback55;
                    }
                    var bboppo11 = checkForParameter(context.request.parameters.bboppo1, "");
                    var bboppo22 = checkForParameter(context.request.parameters.bboppo2, "");
                    var bboppo33 = checkForParameter(context.request.parameters.bboppo3, "");
                    var bboppo44 = checkForParameter(context.request.parameters.bboppo4, "");
                    var bboppo55 = checkForParameter(context.request.parameters.bboppo5, "");
                    var bulkByOppoString = "";

                    if (bboppo11 != "") {
                        bulkByOppoString = bboppo11 + '\n';
                    }
                    if (bboppo22 != "") {
                        bulkByOppoString += bboppo22 + '\n';
                    }
                    if (bboppo33 != "") {
                        bulkByOppoString += bboppo33 + '\n';
                    }
                    if (bboppo44 != "") {
                        bulkByOppoString += bboppo44 + '\n';
                    }
                    if (bboppo55 != "") {
                        bulkByOppoString += bboppo55;
                    }

                    var prdoppo11 = checkForParameter(context.request.parameters.prdoppo1, "");
                    var prdoppo22 = checkForParameter(context.request.parameters.prdoppo2, "");
                    var prdoppo33 = checkForParameter(context.request.parameters.prdoppo3, "");
                    var prdoppo44 = checkForParameter(context.request.parameters.prdoppo4, "");
                    var prdoppo55 = checkForParameter(context.request.parameters.prdoppo5, "");

                    var productOppoString = "";

                    if (prdoppo11 != "") {
                        productOppoString = prdoppo11 + '\n';
                    }
                    if (prdoppo22 != "") {
                        productOppoString += prdoppo22 + '\n';
                    }
                    if (prdoppo33 != "") {
                        productOppoString += prdoppo33 + '\n';
                    }
                    if (prdoppo44 != "") {
                        productOppoString += prdoppo44 + '\n';
                    }
                    if (prdoppo55 != "") {
                        productOppoString += prdoppo55;
                    }


                    var customerRecord = record.load({type: "customer", id: currentuser});


                    if (customerFeedbackString != "" && customerFeedbackString != " ") {
                        var eventRecord = record.create({
                            type: record.Type.CALENDAR_EVENT,
                            isDynamic: true
                        });
                        eventRecord.setValue('title', 'Customer feedback');
                        eventRecord.setValue('message', customerFeedbackString);
                        eventRecord.setValue('company', currentuser);
                        eventRecord.save();
                    }
                    if (bulkByOppoString != "" && bulkByOppoString != " ") {
                        var eventRecord1 = record.create({
                            type: record.Type.CALENDAR_EVENT,
                            isDynamic: true
                        });
                        eventRecord1.setValue('title', 'Bulk buy opportunities');
                        eventRecord1.setValue('message', bulkByOppoString);
                        eventRecord1.setValue('company', currentuser);
                        eventRecord1.save();
                    }
                    if (productOppoString != "" && productOppoString != " ") {
                        var eventRecord2 = record.create({
                            type: record.Type.CALENDAR_EVENT,
                            isDynamic: true
                        });
                        eventRecord2.setValue('title', 'Product opportunities');
                        eventRecord2.setValue('message', productOppoString);
                        eventRecord2.setValue('company', currentuser);
                        eventRecord2.save();
                    }
                    var freeformobject = {};
                    var customerFeedback = [];
                    if (csfeedback11 != "") {
                        customerFeedback[0] = csfeedback11;
                    }
                    if (csfeedback22 != "") {
                        customerFeedback[1] = csfeedback22;
                    }
                    if (csfeedback33 != "") {
                        customerFeedback[2] = csfeedback33;
                    }
                    if (csfeedback44 != "") {
                        customerFeedback[3] = csfeedback44;
                    }
                    if (csfeedback55 != "") {
                        customerFeedback[4] = csfeedback55;
                    }

                    var bulkByOpportunity = [];
                    if (bboppo11 != "") {
                        bulkByOpportunity[0] = bboppo11;
                    }
                    if (bboppo22 != "") {
                        bulkByOpportunity[1] = bboppo22;
                    }
                    if (bboppo33 != "") {
                        bulkByOpportunity[2] = bboppo33;
                    }
                    if (bboppo44 != "") {
                        bulkByOpportunity[3] = bboppo44;
                    }
                    if (bboppo55 != "") {
                        bulkByOpportunity[4] = bboppo55;
                    }

                    var productOpportunity = [];
                    if (prdoppo11 != "") {
                        productOpportunity[0] = prdoppo11;
                    }
                    if (prdoppo22 != "") {
                        productOpportunity[1] = prdoppo22;
                    }
                    if (prdoppo33 != "") {
                        productOpportunity[2] = prdoppo33;
                    }
                    if (prdoppo44 != "") {
                        productOpportunity[3] = prdoppo44;
                    }
                    if (prdoppo55 != "") {
                        productOpportunity[4] = prdoppo55;
                    }

                    freeformobject.k1 = customerFeedback;
                    freeformobject.k2 = bulkByOpportunity;
                    freeformobject.k3 = productOpportunity;
                    var freeformobjectJSON = JSON.stringify(freeformobject);

// sets freeformobjectJSON object to OX360Report (hidden field) in customer record
                    customerRecord.setValue('custentity_jj_customer_ox360_otgn_330', freeformobjectJSON);

                    var customerRecordId = customerRecord.save();
                    var startdate_post = checkForParameter(context.request.parameters.startdate, "");
                    var enddate_post = checkForParameter(context.request.parameters.enddate, "");
                    // redirect to OX360 Quarterly Report pdf
                    var responsePdf = "<html><head></head><body><script>window.location.href='/app/site/hosting/scriptlet.nl?script=1865&deploy=1&currentUser=" + currentuser + "&startdate="+startdate_post+"&enddate="+enddate_post+"'</script></body></html>";

                    context.response.write(responsePdf);
                } else {

                    var startDate = checkForParameter(context.request.parameters.startdate, '');
                    var endDate = checkForParameter(context.request.parameters.enddate, '');
                    var customerSearchObj4 = search.create({
                        type: "customer",
                        filters:
                            [
                                ["internalid", "anyof", currentuser]
                            ],
                        columns:
                            [
                                search.createColumn({name: "internalid", label: "internalId"}),
                                search.createColumn({
                                    name: "entityid",
                                    sort: search.Sort.ASC,
                                    label: "customerName"
                                }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "TO_CHAR({today},'DD.MM.YYYY')",
                                    label: "todaysDate"
                                }),
                                search.createColumn({
                                    name: "custentity_jj_marketing_support_provided",
                                    label: "marketingSupportProvided"
                                }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "{custentity_jj_marketing_support}",
                                    label: "marketingSupportValue"
                                }),

                                search.createColumn({
                                    name: "formulapercent",
                                    formula: "CASE WHEN ({custentity_jj_marketing_support_provided} = 'T' )THEN 0.2 ELSE 0 END",
                                    label: "marketingsupportweighting"
                                }),
                                search.createColumn({
                                    name: "custentity_jj_training_conducted",
                                    label: "trainingConducted"
                                }),

                                search.createColumn({
                                    name: "formulatext",
                                    formula: "{custentity_jj_type_of_training_provided}",
                                    label: "trainingValue"
                                }),

                                search.createColumn({
                                    name: "formulapercent",
                                    formula: "CASE WHEN {custentity_jj_training_conducted} = 'T' THEN 0.2 ELSE 0 END",
                                    label: "trainingWeighting"
                                }),
                                search.createColumn({
                                    name: "image",
                                    label: "merchandisingImage"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    formula: "CASE WHEN {image} is NULL THEN  0 ELSE 0.1END",
                                    label: "merchandisingWeighting"
                                }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "TO_CHAR(TO_DATE('" + startDate + "','YYYY-MM-DD'))",
                                    label: "startDate"
                                }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "TO_CHAR(TO_DATE('" + endDate + "','YYYY-MM-DD'))",
                                    label: "endDate"
                                })
                            ]
                    });
                    customerSearchObj4.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        for (var i = 0; i < customerSearchObj4.columns.length; i++) {
                            objects[customerSearchObj4.columns[i].label] = result.getValue(customerSearchObj4.columns[i]);
                        }
                        return false;
                    });

                    if (startDate == "") {
                        var titlecontent = "<td align='center' style='font-size: 18pt; padding-bottom: -10pt;'> - CURRENT QUARTER</td>";
                    } else {
                        var titlecontent = "<td align='center' style='font-size: 18pt;'> -  " + objects.startDate + " TO " + objects.endDate + "</td>";
                    }


                    var filterarray = [];
                    if (startDate != "" && endDate != "") {
                        filterarray = ["transaction.trandate", "within", objects.startDate, objects.endDate]
                    } else {
                        filterarray = ["transaction.trandate", "within", "thisfiscalquarter"]
                    }

                    var customerSearchObj = search.create({
                        type: "customer",
                        title: "search" + new Date().getTime(),
                        filters:
                            [
                                ["stage", "anyof", "CUSTOMER"],
                                "AND",
                                ["transaction.mainline", "is", "F"],
                                "AND",
                                ["transaction.taxline", "is", "F"],
                                "AND",
                                ["transaction.shipping", "is", "F"],
                                "AND",
                                ["transaction.cogs", "is", "F"],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                ["transaction.accounttype", "anyof", "Income"],
                                "AND",
                                ["internalid", "anyof", currentuser]
                                , "AND"
                                , filterarray

                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "internalid",
                                    summary: "GROUP",
                                    label: "internalId"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "CASE WHEN {transaction.type} = 'Invoice' THEN {transaction.amount} ELSE NULL END",
                                    label: "invoiceAmount"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "CASE WHEN {transaction.type} = 'Sales Order' THEN (({transaction.quantity}-nvl({transaction.quantitycommitted},0)-nvl({transaction.quantityshiprecv},0))*{transaction.rate}) ELSE 0 END",
                                    label: "backOrderedAmount"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "CASE WHEN {transaction.type} = 'Sales Order' THEN {transaction.amount} ELSE NULL END",
                                    label: "soAmount"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "SUM",
                                    formula: "SUM(CASE WHEN {transaction.type} = 'Sales Order' THEN (({transaction.quantity}-nvl({transaction.quantitycommitted},0)-nvl({transaction.quantityshiprecv},0))*{transaction.rate}) ELSE 0 END) / SUM(NULLIF(CASE WHEN {transaction.type} = 'Sales Order' THEN {transaction.amount} ELSE NULL END,0))",
                                    label: "backorderedPercentage"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "SUM",
                                    formula: "(SUM(CASE WHEN {transaction.type} = 'Sales Order' THEN (({transaction.quantity}-nvl({transaction.quantitycommitted},0)-nvl({transaction.quantityshiprecv},0))*{transaction.rate}) ELSE 0 END) / SUM(NULLIF(CASE WHEN {transaction.type} = 'Sales Order' THEN {transaction.amount} ELSE NULL END,0)))*0.2",
                                    label: "backorderdWeighting"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "COUNT",
                                    formula: "Count(distinct CASE WHEN {transaction.type} = 'Credit Memo' AND {transaction.custbody_cred_reason} != 'Pricing adjustment' THEN {transaction.internalid} ELSE NULL END)",
                                    label: "creditmemoCount"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "CASE WHEN {transaction.type} = 'Credit Memo' AND {transaction.custbody_cred_reason} != 'Pricing adjustment' THEN {transaction.amount} ELSE NULL END*-1",
                                    label: "creditReturns"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "SUM",
                                    formula: "SUM(CASE WHEN {transaction.type} = 'Credit Memo' AND {transaction.custbody_cred_reason} != 'Pricing adjustment' THEN {transaction.amount} ELSE NULL END*-1) /  SUM(NULLIF(CASE WHEN {transaction.type} = 'Sales Order' THEN {transaction.amount} ELSE NULL END,0))",
                                    label: "creditReturnsPercentage"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "SUM",
                                    formula: "(SUM(CASE WHEN {transaction.type} = 'Credit Memo' AND {transaction.custbody_cred_reason} != 'Pricing adjustment' THEN {transaction.amount} ELSE NULL END*-1) /  SUM(NULLIF(CASE WHEN {transaction.type} = 'Sales Order' THEN {transaction.amount} ELSE NULL END,0)))*0.15",
                                    label: "creditReturnsWeighting"
                                }),
                                search.createColumn({
                                    name: "estimatedbudget",
                                    summary: "GROUP",
                                    label: "estimatedBudget"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "MAX",
                                    formula: "CASE WHEN {estimatedbudget} is NULL OR  {estimatedbudget}=0 THEN 0 ELSE (SUM(CASE WHEN {transaction.type} = 'Invoice' THEN {transaction.amount} ELSE NULL END)/{estimatedbudget}) END",
                                    label: "salesAgainstTarget"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "MAX",
                                    formula: "(CASE WHEN {estimatedbudget} is NULL OR  {estimatedbudget}=0 THEN 0 ELSE (SUM(CASE WHEN {transaction.type} = 'Invoice' THEN {transaction.amount} ELSE NULL END)/{estimatedbudget}) END)*0.1",
                                    label: "salesAgainstTargetWeighting"
                                })
                            ]
                    });


                    //  log.debug("customerSearchObj", customerSearchObj.save());


                    customerSearchObj.run().each(function (result) {

                        for (var i = 0; i < customerSearchObj.columns.length; i++) {
                            objects[customerSearchObj.columns[i].label] = result.getValue(customerSearchObj.columns[i]);
                        }
                        return false;
                    });

                    var casefilterarray = [];
                    if (startDate != "" && endDate != "") {
                        casefilterarray = ["case.createddate", "within", objects.startDate, objects.endDate]
                    } else {
                        casefilterarray = ["case.createddate", "within", "thisfiscalquarter"]
                    }


                    var customerSearchObj2 = search.create({
                        type: "customer",
                        filters:
                            [
                                ["stage", "anyof", "CUSTOMER"],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                casefilterarray,
                                "AND",
                                ["internalid", "anyof", currentuser]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "internalid",
                                    join: "case",
                                    summary: "COUNT",
                                    label: "casesCount"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "COUNT",
                                    formula: "CASE WHEN {case.status} != 'Closed' THEN {case.internalid} ELSE NULL END",
                                    label: "countOfOpenCases"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "MAX",
                                    formula: "Count(CASE WHEN {case.status} != 'Closed' THEN {case.internalid} ELSE NULL END)/nullif(Count({case.internalid}),0)",
                                    label: "casePercentage"
                                }),
                                search.createColumn({
                                    name: "formulapercent",
                                    summary: "MAX",
                                    formula: "(Count(CASE WHEN {case.status} != 'Closed' THEN {case.internalid} ELSE NULL END)/nullif(Count({case.internalid}),0))*0.15",
                                    label: "caseWeighting"
                                })
                            ]
                    });


                    customerSearchObj2.run().each(function (result) {

                        for (var i = 0; i < customerSearchObj2.columns.length; i++) {

                            objects[customerSearchObj2.columns[i].label] = result.getValue(customerSearchObj2.columns[i]);
                        }
                        return false;
                    });


                    var activityfilterarray = [];
                    if (startDate != "" && endDate != "") {
                        activityfilterarray = ["activity.date", "within", objects.startDate, objects.endDate]
                    } else {
                        activityfilterarray = ["activity.date", "within", "thisfiscalquarter"]
                    }


                    var customerSearchObj5 = search.create({
                        type: "customer",
                        filters:
                            [
                                ["stage", "anyof", "CUSTOMER"],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                activityfilterarray,
                                "AND",
                                ["internalid", "anyof", currentuser]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "COUNT",
                                    formula: "Count(distinct CASE WHEN {activity.type} ='Phone Call' OR {activity.type} ='Event' THEN {activity.internalid} ELSE NULL END)",
                                    label: "activityCount"
                                })
                            ]
                    });
                    customerSearchObj5.run().each(function (result) {
                        // .run().each has a limit of 4,000 results

                        for (var i = 0; i < customerSearchObj5.columns.length; i++) {

                            objects[customerSearchObj5.columns[i].label] = result.getValue(customerSearchObj5.columns[i]);

                        }
                        return true;
                    });


                    var customerSearchObj3 = search.create({
                        type: "customer",
                        filters:
                            [
                                ["isinactive", "is", "F"],
                                "AND",
                                ["stage", "anyof", "CUSTOMER"],
                                "AND",
                                activityfilterarray,
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "Count(distinct CASE WHEN {activity.type} ='Phone Call' OR {activity.type} ='Event' THEN {activity.internalid} ELSE NULL END)",
                                    label: "totalAcivitySum"
                                })
                            ]
                    });

                    customerSearchObj3.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        for (var i = 0; i < customerSearchObj3.columns.length; i++) {
                            objects[customerSearchObj3.columns[i].label] = result.getValue(customerSearchObj3.columns[i]);
                        }
                        return false;
                    });

                    var activityWeighting = ((objects.activityCount / objects.totalAcivitySum) * 100) * 0.1;


                    if (objects.merchandisingImage !== null && objects.merchandisingImage !== undefined
                        && objects.merchandisingImage !== "null" && objects.merchandisingImage !== "NaN"
                        && objects.merchandisingImage !== "undefined"
                        && objects.merchandisingImage != ""
                        && objects.merchandisingImage != " ") {


                        var fileObj = file.load({
                            id: objects.merchandisingImage
                        });
                        var imageurl = fileObj.url;

                    } else {
                        var imageurl = "";
                    }

                    if (objects.marketingSupportProvided == true) {
                        var marketingSupportProvided = 'Yes';
                    } else {
                        var marketingSupportProvided = 'No';
                    }

                    if (objects.trainingConducted == true) {
                        var trainingConducted = 'Yes';
                    } else {
                        var trainingConducted = 'No';
                    }


                    // transaction search to get sales by product category

                    var salesByProductfilterarray = [];
                    if (startDate != "" && endDate != "") {
                        salesByProductfilterarray = ["trandate", "within", objects.startDate, objects.endDate]
                    } else {
                        salesByProductfilterarray = ["trandate", "within", "thisfiscalquarter"]
                    }

                    var invoiceSearchObj = search.create({
                        type: "invoice",
                        filters:
                            [
                                ["mainline", "is", "F"],
                                "AND",
                                ["taxline", "is", "F"],
                                "AND",
                                ["shipping", "is", "F"],
                                "AND",
                                ["type", "anyof", "CustInvc"],
                                "AND",
                                ["accounttype", "anyof", "Income"],
                                "AND",
                                ["customer.internalid", "anyof", currentuser],
                                "AND",
                                salesByProductfilterarray
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "internalid",
                                    join: "customer",
                                    summary: "GROUP",
                                    label: "Customer Internal ID"
                                }),
                                search.createColumn({
                                    name: "custbody_ozlink_entity_name",
                                    summary: "GROUP",
                                    label: "Customer Name"
                                }),
                                search.createColumn({
                                    name: "formulatext",
                                    summary: "GROUP",
                                    formula: "{item.custitem19}",
                                    sort: search.Sort.ASC,
                                    label: "primaryGroup"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "CASE WHEN {type} = 'Invoice' THEN {amount} ELSE NULL END",
                                    label: "salesByProductCategory"
                                }),

                            ]
                    });


                    var productCategoryArray = [];
                    invoiceSearchObj.run().each(function (result) {
                        var tempObj = {};
                        for (var i = 0; i < invoiceSearchObj.columns.length; i++) {
                            tempObj[invoiceSearchObj.columns[i].label] = result.getValue(invoiceSearchObj.columns[i]);
                        }
                        productCategoryArray.push(tempObj);
                        return true;
                    });


                    if (productCategoryArray.length < 1) {
                        var tableContent = "<tr>" +
                            "<td  class=\"data\">Sales by Product Category</td>" +
                            "<td class=\"data\">Total Sales By product category</td>" +
                            "<td class=\"centeraligneddata\"> -- </td>" +
                            "<td class=\"centeraligneddata\"> -- </td>" +
                            "</tr>";

                    } else {
                        var tableContent = "<tr>" +
                            "<td rowspan='" + productCategoryArray.length + "' class=\"data\">Sales by Product Category</td>" +
                            "<td rowspan='" + productCategoryArray.length + "'class=\"data\">Total Sales By product category</td>" +
                            "<td class=\"data\">" + productCategoryArray[0].primaryGroup + "</td>" +
                            "<td class=\"rightaligneddata\">" + makeItCurrency(Number(checkForParameter(productCategoryArray[0].salesByProductCategory, 0))) + "</td>" +
                            "</tr>";

                    }


                    for (var i = 1; i < productCategoryArray.length; i++) {

                        tableContent += "<tr>" +
                            "<td class=\"data\">" + productCategoryArray[i].primaryGroup + "</td>" +
                            "<td class=\"rightaligneddata\">" + makeItCurrency(Number(checkForParameter(productCategoryArray[i].salesByProductCategory, 0))) + "</td>" +
                            "</tr>";

                    }

                    var salesweighting0 = checkForParameter(objects.salesAgainstTargetWeighting, "0.00%").replace("%", "");
                    var salesweighting1 = formatCurrency(salesweighting0);
                    var salesweighting2 = Number(salesweighting1);

                    var backOrderWeighting0 = checkForParameter(objects.backorderdWeighting, "0.00%").replace("%", "");
                    var backOrderWeighting1 = formatCurrency(backOrderWeighting0);
                    var backOrderWeighting2 = Number(backOrderWeighting1);

                    var creditReturnsWeighting0 = checkForParameter(objects.creditReturnsWeighting, "0.00%").replace("%", "");
                    var creditReturnsWeighting1 = formatCurrency(creditReturnsWeighting0);
                    var creditReturnsWeighting2 = Number(creditReturnsWeighting1);

                    var caseWeighting0 = checkForParameter(objects.caseWeighting, "0.00%").replace("%", "");
                    var caseWeighting1 = formatCurrency(caseWeighting0);
                    var caseWeighting2 = Number(caseWeighting1);

                    var activityWeighting1 = formatCurrency(activityWeighting);
                    var activityWeighting2 = Number(activityWeighting1);

                    var merchandisingWeighting0 = checkForParameter(objects.merchandisingWeighting, "0.00%").replace("%", "");
                    var merchandisingWeighting1 = formatCurrency(merchandisingWeighting0);
                    var merchandisingWeighting2 = Number(merchandisingWeighting1);

                    var trainingWeighting0 = checkForParameter(objects.trainingWeighting, "0.00%").replace("%", "");
                    var trainingWeighting1 = formatCurrency(trainingWeighting0);
                    var trainingWeighting2 = Number(trainingWeighting1);

                    var salesAgainstTarget = checkForParameter(objects.salesAgainstTarget, "0.00%").replace("%", "");
                    var salesAgainstTarget1 = formatCurrency(salesAgainstTarget);

                    var backorderedPercentage = checkForParameter(objects.backorderedPercentage, "0.00%").replace("%", "");
                    var backorderedPercentage1 = formatCurrency(backorderedPercentage);


                    var totalWeighting0 = salesweighting2 + backOrderWeighting2 + creditReturnsWeighting2 + caseWeighting2 + activityWeighting2 + merchandisingWeighting2 + trainingWeighting2;
                    var totalWeighting = totalWeighting0.toFixed(2);


                    if (imageurl == "") {
                        var imageContent = '<td style = "text-align: center;"><img src="https://3425005-sb1.app.netsuite.com/core/media/media.nl?id=23774770&c=3425005_SB1&h=4JRD3TXTflztyPx40gQ4uuPCP0_Xgv98YiG3PZt15RdLNUyr&fcts=20201126233413&whence=" alt="No Image"  width="100%"></td>'
                    } else {
                        var imageContent = '<td><img src="' + imageurl + '" alt="Merchandising Image"  width="100%"></td>'
                    }
                    // html content to design portlet
                    var content =
                        '<html>' +
                        '<head>' +
                        '<style>' +
                        'div.layout{width: 90%; padding-left: 5%; padding-right: 5%; padding-top: 3%; padding-bottom: 5%;}' +
                        'table.datatable{border: 1px solid Gray; border-collapse: collapse;}' +
                        'th.heading{font-size: 10pt; text-align: center; padding-left: 3px; border: 1px solid Gray; border-collapse: collapse;}' +
                        'td.data{font-size: 10pt; padding-left: 3px; border: 1px solid Gray; border-collapse: collapse;}' +
                        'td.rightaligneddata{font-size: 10pt; padding-right: 3px; border: 1px solid Gray; border-collapse: collapse; text-align: right;}' +
                        'td.centeraligneddata{font-size: 10pt; padding-right: 3px; border: 1px solid Gray; border-collapse: collapse; text-align: center;}' +
                        'td.total{font-size: 10pt; padding-right: 3px; border: 1px solid Gray; border-collapse: collapse; text-align:right; }' +
                        'tr.heading{background-color:rgb(0, 191, 255); }' +
                        '.btn{width:25%; background-color: #00BFFF; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 2px; float: right;}' +
                        '.btnsave{width:49.7%; background-color: #00BFFF; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 2px;}' +
                        '.dateFilter{width:60%; background-color: #00BFFF; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 2px;}' +

                        '.dateFilterForm{text-align: center;}' +
                        'td.freeform1{width:2%;}' +
                        'td.freeformtext{width:98%;}' +
                        'td input[type=text]{width: 100%; display: inline-block;}' +
                        'td input-block-level {' +
                        '    width: 100%;' +
                        '}' +
                        'input[type="date"] {' +
                        'font-family: "Helvetica", arial, sans-serif;' +
                        'font-size: 18px;' +
                        'border:1px solid #ecf0f1;' +
                        'background:#ecf0f1;' +
                        'padding:5px;' +
                        'display: inline-block !important;' +
                        'visibility: visible !important;' +
                        '}' +
                        'input[type="date"], focus {' +
                        '    color: #95a5a6;' +
                        '    box-shadow: none;' +
                        '    -webkit-box-shadow: none;' +
                        '    -moz-box-shadow: none;' +
                        '}' +
                        '</style>' +
                        '</head>' +

                        '<body>' +
                        '<div class="layout">' +
                        '<table width="100%"><tr><td align="center" style="font-size: 40px"><b>OX360 REPORT</b></td></tr></table>' +
                        '<table width="70%" align="right"><tr>' +
                        titlecontent +
                        '</tr></table>' +
                        '<table style="height: 10px;width: 100%"><tr><td></td></tr></table>' +

                        '<table align="center" width="65%" ><tr><td align="left" width="35%" style="font-size:18px;"><b><label>Start Date:</label></b><input type="date" id="startDate" name="startDate"></td>' +
                        '<td width="35%" style="font-size:18px;"><b><label>End Date:</label></b><input type="date" id="endDate" name="endDate"></td>' +
                        '<td align="left"><button type="submit" class="dateFilter" onclick="myFunction()">Filter</button></td></tr></table>' +
                        '<table style="height: 20px;width: 100%"><tr><td></td></tr></table>' +

                        '<table align="left" width="100%" height="80px" style="border-collapse: collapse;">' +
                        '<tr style = "border:none; margin:none; height:40px;">' +
                        '<td style="background-color:rgb(0, 191, 255); color:white; width:20%; font-size: 20pt;border:none; margin:none; padding-left:3px;"><b>Customer</b></td> ' +
                        '<td style="background-color:rgb(240, 248, 255); font-size: 20pt;border:none; margin:none; padding-left:3px;"><b>' + objects.customerName + '</b></td></tr>' +
                        '<tr style = "border:none; margin:none; height:40px;"><td style="background-color:rgb(0, 191, 255); color:white; width:20%; font-size: 20pt; border:none; margin:none; padding-left:3px;"><b>Date</b></td>' +
                        '<td style="background-color:rgb(240, 248, 255); font-size: 20pt; border:none; margin:none; padding-left:3px;"><b>' + objects.todaysDate + '</b></td>' +
                        '</tr>' +
                        '</table>' +
                        '<br>' +
                        '<table height="5px" width="100%"><tr><td></td></tr></table>' +
                        '<table width="100%" height="20px" style="border-collapse: collapse;"><tr><th style="background-color:rgb(0, 191, 255); color:white;  text-align: center; font-size: 13pt;"><b>OX360 Report</b></th></tr></table>' +
                        '<table height="5px" width="100%"><tr><td></td></tr></table>' +
                        '<table width="100%" class="datatable">' +
                        '<tr style="background-color:rgb(0, 191, 255);"><th class="heading"><b>Area</b></th><th class="heading"><b>Description</b></th><th class="heading"><b>Value</b></th></tr>' +
                        '<tr><td class="data">Sales</td><td class="data">Total Sales During the Period</td><td class="rightaligneddata">' + makeItCurrency(Number(checkForParameter(objects.invoiceAmount, 0))) + '</td></tr>' +
                        '</table>' +
                        '<br>' +
                        '<table  width="100%" class="datatable">' +
                        '<tr class="heading"><th class="heading"><b>Area</b></th><th class="heading"><b>Checkbox Value</b></th><th class="heading"><b>Selected Value</b></th></tr>' +
                        '<tr><td class="data">Marketing Support</td><td class="data">' + marketingSupportProvided + '</td><td class="data" >' + checkForParameter(objects.marketingSupportValue, '<p align="center"> --</p>') + '</td></tr>' +
                        '<tr><td class="data">Training </td><td class="data">' + trainingConducted + '</td><td class="data" >' + checkForParameter(objects.trainingValue, '<p align="center"> --</p>') + '</td></tr>' +
                        '</table>' +
                        '<br>' +
                        '<table width="100%" class="datatable">' +
                        '<tr class="heading"><th class="heading"><b>Area</b></th><th class="heading"><b>Description</b></th><th class="heading"><b>Product Category</b></th><th class="heading"><b>Value</b></th></tr>' +

                        tableContent +

                        '</table>' +
                        '<br>' +
                        '<table width="100%" height="20px" style="border-collapse: collapse;" >' +
                        '<tr><th style="background-color:rgb(0, 191, 255); color:white;  text-align: center; font-size: 13pt; "><b>OX360 Component Weighting</b></th></tr>' +
                        '</table>' +
                        '<table height="5px" width="100%"><tr><td></td></tr></table>' +
                        '<table width="100%" class="datatable">' +
                        '<tr class="heading"><th class="heading"><b>Area</b></th><th class="heading"><b>Description</b></th><th class="heading"><b>Value</b></th><th class="heading"><b>Weighting</b></th></tr>' +
                        '<tr><td class="data">Sales against the Target</td><td class="data">Total sales against target</td><td class="centeraligneddata">' + salesAgainstTarget1 + '%</td><td class="rightaligneddata">' + salesweighting1 + '%</td></tr>' +
                        '<tr><td class="data">Backorders</td><td class="data">Total value of backorders against sales for the period</td><td class="centeraligneddata">' + backorderedPercentage1 + '%</td><td class="rightaligneddata">' + backOrderWeighting1 + '%</td></tr>' +
                        '<tr><td class="data">Credits/returns</td><td class="data">Total value of credits/returns against sales for the period</td><td class="centeraligneddata">' + makeItCurrency(Number(checkForParameter(objects.creditReturns, 0))) + '</td><td class="rightaligneddata">' + creditReturnsWeighting1 + '%</td></tr>' +
                        '<tr><td class="data">Cases</td><td class="data">Total number of cases for the period</td><td class="centeraligneddata">' + objects.casesCount + '</td><td class="rightaligneddata">' + caseWeighting1 + '%</td></tr>' +
                        '<tr><td class="data"># MCI’s</td><td class="data">Number of MCIs achieved by OX team during period(based on customer grade level)</td><td class="centeraligneddata">' + objects.activityCount + '</td><td class="rightaligneddata">' + activityWeighting1 + '%</td></tr>' +
                        '<tr><td class="data">Merchandising</td><td class="data">Condition of merchandising during period</td><td class="data" style="text-align: center;">--</td><td class="rightaligneddata">' + merchandisingWeighting1 + '%</td></tr>' +
                        '<tr><td class="data">Training</td><td class="data">Training completed with store staff during period</td><td class="data" style="text-align: center;">--</td><td class="rightaligneddata">' + trainingWeighting1 + '%</td></tr>' +
                        '<tr><td  class="total" colspan="3" ><b>Total</b></td><td class="rightaligneddata"><b>' + totalWeighting + '%</b></td></tr>' +
                        '</table>' +
                        '<br>' +
                        '<table align="right" width="50%" >' +
                        '<tr class="heading"><td style="color:white; height:70px; text-align: center; font-size: 20pt;">Merchandising</td></tr>' +
                        '<tr style="height:7px;"><td></td></tr>' +
                        '<tr style="width:50%">' + imageContent + '</tr></table>' +

                        '<form method="post">' +
                        '<table width="50%">' +
                        '<tr style="background-color: DeepSkyBlue; color: white; border: 1px white; width: 100%;"><td colspan="2">Customer feedback</td></tr>' +
                        '<tr width: 500px;"><td class="freeform1">1</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="csfeedback1"></td></tr>' +
                        '<tr><td class="freeform1">2</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="csfeedback2"></td></tr>' +
                        '<tr><td class="freeform1">3</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="csfeedback3"></td></tr>' +
                        '<tr><td class="freeform1">4</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="csfeedback4"></td></tr>' +
                        '<tr><td class="freeform1">5</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="csfeedback5"></td></tr>' +
                        '</table>' +
                        '<table width="50%">' +
                        '<tr style="background-color: DeepSkyBlue; color: white; border: 1px white; width: 100%;"><td colspan="2">Bulk buy opportunities</td></tr>' +
                        '<tr><td class="freeform1">1</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="bboppo1"></td></tr>' +
                        '<tr><td class="freeform1">2</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="bboppo2"></td></tr>' +
                        '<tr><td class="freeform1">3</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="bboppo3"></td></tr>' +
                        '<tr><td class="freeform1">4</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="bboppo4"></td></tr>' +
                        '<tr><td class="freeform1">5</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="bboppo5"></td></tr>' +
                        '</table>' +
                        '<table width="50%">' +
                        '<tr style="background-color: DeepSkyBlue; color: white; border: 1px white; width: 100%;"><td colspan="2">Product opportunities</td></tr>' +
                        '<tr><td class="freeform1">1</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="prdoppo1"></td></tr>' +
                        '<tr><td class="freeform1">2</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="prdoppo2"></td></tr>' +
                        '<tr><td class="freeform1">3</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="prdoppo3"></td></tr>' +
                        '<tr><td class="freeform1">4</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="prdoppo4"></td></tr>' +
                        '<tr><td class="freeform1">5</td>' +
                        '<td><input class="input-block-level" type="text" value="" name="prdoppo5"></td></tr>' +
                        '</table>' +
                        '<button type="submit" class="btnsave"> Save and Print OX360 Report</button>' +
                        '</form>' +

                        '</div>' +
                        '<script> ' +
                        'function myFunction(){' +
                        'var queryString = window.location.search;' +
                        'var urlParams = new URLSearchParams(queryString);' +

                        'var currentUserId = urlParams.get("custInternalId");' +
                        'var startDate = document.getElementById("startDate").value;' +
                        'var endDate = document.getElementById("endDate").value;' +


                        'if(startDate=="" && endDate==""){' +
                        'window.location.href=("https://3425005-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1863&deploy=1&custInternalId="+currentUserId+"&startdate="+startDate+"&enddate="+endDate);' +
                        '}' +
                        'else if(startDate!=""&& endDate!=""){' +
                        'if(startDate>endDate){' +
                        'alert( "Start Date is earlier than End Date" );}' +
                        'else{' +
                        'window.location.href=("https://3425005-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1863&deploy=1&custInternalId="+currentUserId+"&startdate="+startDate+"&enddate="+endDate);' +
                        '}' +
                        '}' +
                        'else{' +
                        'alert( "Invalid Date filter" );' +
                        '}' +
                        '}' +
                        '</script>' +
                        '</body>' +
                        '</html>'
                    context.response.write(content);
                    // var scriptObj = runtime.getCurrentScript();
                    // log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());
                }
            } catch (e) {
                log.debug({
                    title: e.name,
                    details: e
                });
            }
        }

        return {
            onRequest: onRequestFxn
        };
    }
);







