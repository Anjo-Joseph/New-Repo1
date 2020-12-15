/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
/*******************************************************************************
 * CLIENTNAME:OX Tools
 * OTGN-330
 * OX360 Quarterly report PDF
 * **************************************************************************
 * Date : 03-12-2020
 *
 * Author: Jobin & Jismi IT Services LLP
 * Script Description :
 * Render OX360 Report pdf when clicking print button in suitelet page in customer dashboard & in customer Record.
 * Date created :03-12-2020
 *
 ******************************************************************************/
define(['N/render', 'N/search', 'N/file', 'N/format/i18n', 'N/xml', 'N/record'],
    function (render, search, file, formati, xml, record) {
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
// function to display sales by product category table content
        function createTableRows(productCategoryArray) {
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
                    "<td rowspan='" + productCategoryArray.length + "' class=\"data\">Total Sales By product category</td>" +
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
            return tableContent;
        }

// function to replace special characters in url
        function escapeSpecialChar(imageurl) {
            if (imageurl != "" && imageurl != null) {

                imageurl = imageurl.replace(/&/g, '&amp;');
                imageurl = imageurl.replace(/</g, '&lt;');
                imageurl = imageurl.replace(/>/g, '&gt;');
                imageurl = imageurl.replace(/"/g, '&quot;');
                imageurl = imageurl.replace(/'/g, '&apos;');
                return imageurl;
            } else {
                return "https://3425005-sb1.app.netsuite.com/core/media/media.nl?id=23774770&amp;c=3425005_SB1&amp;h=4JRD3TXTflztyPx40gQ4uuPCP0_Xgv98YiG3PZt15RdLNUyr&amp;fcts=20201126233413&amp;whence=";
            }

        }
// function to display customer feedback content table in pdf
        function customerFeedbackContent(customerFreeformTextValueObject) {
            try {
                var customerFreeformTextValueObject_k1 = customerFreeformTextValueObject.k1;
                var customerFreeformTextValueObjectLength = customerFreeformTextValueObject.k1.length;
                    if(customerFreeformTextValueObjectLength !=0){
                    var freeformtextContent = '<tr class=\"heading\" width="100%"><td class=\"heading\" width="100%">Customer feedback</td></tr>'
                    for (var i = 0; i < 5; i++) {
                        if (customerFreeformTextValueObject.k1[i] != null) {
                            freeformtextContent += '<tr class=\"data\" width="100%"><td class=\"data\" width="100%">' + customerFreeformTextValueObject.k1[i] + '</td></tr>'
                        }
                    }
                }

                return freeformtextContent;

            } catch (e) {

                log.error("Err@ FN freeformContent", e);

            }

        }
// function to display bulk by opportunity table content in pdf
        function bulkByOppoContent(customerFreeformTextValueObject) {
            try {

                var customerFreeformTextValueObject_k2 = customerFreeformTextValueObject.k2;
                var customerFreeformTextValueObjectLength = customerFreeformTextValueObject.k2.length;
                if (customerFreeformTextValueObjectLength != 0) {
                    var freeformtextContent = '<tr class=\"heading\"><td class=\"heading\">Bulk buy opportunities</td></tr>'

                    for (var i = 0; i < 5; i++) {
                        if (customerFreeformTextValueObject.k2[i] != null) {
                            freeformtextContent += '<tr class=\"data\"><td class=\"data\">' + customerFreeformTextValueObject.k2[i] + '</td></tr>'
                        }
                    }
                }

                return freeformtextContent;

            } catch (e) {

                log.error("Err@ FN freeformContent", e);

            }

        }
// function to display product opportunity content in pdf
        function productOppoContent(customerFreeformTextValueObject) {
            try {

                var customerFreeformTextValueObject_k3 = customerFreeformTextValueObject.k3;
                var customerFreeformTextValueObjectLength = customerFreeformTextValueObject.k3.length;
                if (customerFreeformTextValueObjectLength != 0) {
                    var freeformtextContent = '<tr class=\"heading\"><td class=\"heading\">Product opportunities</td></tr>'

                    for (var i = 0; i < 5; i++) {
                        if (customerFreeformTextValueObject.k3[i] != null) {
                            freeformtextContent += '<tr class=\"data\"><td class=\"data\">' + customerFreeformTextValueObject.k3[i] + '</td></tr>'
                        }
                    }
                }

                return freeformtextContent;

            } catch (e) {

                log.error("Err@ FN freeformContent", e);

            }

        }


        function onRequestFxn(context) {
            try {
                var objects = {};
                var currentuser = context.request.parameters.currentUser;
                var startDate = checkForParameter(context.request.parameters.startdate, '');
                var endDate = checkForParameter(context.request.parameters.enddate, '');
                var customerRecord = record.load({type: "customer", id: currentuser});
                var customerFreeformTextValue = customerRecord.getValue({
                    fieldId: 'custentity_jj_customer_ox360_otgn_330'
                });
                if (customerFreeformTextValue !== null && customerFreeformTextValue !== undefined
                    && customerFreeformTextValue !== "null" && customerFreeformTextValue !== "NaN"
                    && customerFreeformTextValue !== "undefined"
                    && customerFreeformTextValue != ""
                    && customerFreeformTextValue != " ") {
                    var customerFreeformTextValueObject = JSON.parse(customerFreeformTextValue);
                    var customerFeedbackContent1 = customerFeedbackContent(customerFreeformTextValueObject);
                    var bulkByOppoContent1 = bulkByOppoContent(customerFreeformTextValueObject);
                    var productOppoContent1 = productOppoContent(customerFreeformTextValueObject);
                } else {
                    var customerFeedbackContent1 = "";
                    var bulkByOppoContent1 = "";
                    var productOppoContent1 = "";
                }

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

                var transactionfilterarray = [];
                var casefilterarray = [];
                var activityfilterarray = [];
                var salesByProductfilterarray = [];
                if (startDate != "" && endDate != "") {
                    transactionfilterarray = ["transaction.trandate", "within", objects.startDate, objects.endDate];
                    casefilterarray = ["case.createddate", "within", objects.startDate, objects.endDate];
                    activityfilterarray = ["activity.date", "within", objects.startDate, objects.endDate];
                    salesByProductfilterarray = ["trandate", "within", objects.startDate, objects.endDate];

                } else {

                    transactionfilterarray = ["transaction.trandate", "within", "thisfiscalquarter"];
                    casefilterarray = ["case.createddate", "within", "thisfiscalquarter"];
                    activityfilterarray = ["activity.date", "within", "thisfiscalquarter"];
                    salesByProductfilterarray = ["trandate", "within", "thisfiscalquarter"];
                }
                var customerSearchObj = search.create({
                    type: "customer",
                    // title: "search" + new Date().getTime(),
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
                            , transactionfilterarray
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

                if (objects.marketingSupportProvided == true) {
                    objects.marketingSupportProvided = 'Yes';
                } else {
                    objects.marketingSupportProvided = 'No';
                }

                if (objects.trainingConducted == true) {
                    objects.trainingConducted = 'Yes';
                } else {
                    objects.trainingConducted = 'No';
                }
                objects.marketingSupportValue1 = checkForParameter(objects.marketingSupportValue, '--');
                objects.trainingValue1 = checkForParameter(objects.trainingValue, '--');

                if (objects.merchandisingImage !== null && objects.merchandisingImage !== undefined
                    && objects.merchandisingImage !== "null" && objects.merchandisingImage !== "NaN"
                    && objects.merchandisingImage !== "undefined"
                    && objects.merchandisingImage != ""
                    && objects.merchandisingImage != " ") {
                    var fileObj = file.load({
                        id: objects.merchandisingImage
                    });
                    imageurl = fileObj.url;
                } else {
                    imageurl = "";
                }
                objects.imageurl = escapeSpecialChar(imageurl);
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


                objects.productArrayLength = productCategoryArray.length;

                var tableContent = createTableRows(productCategoryArray);

                var activityWeighting = ((objects.activityCount / objects.totalAcivitySum) * 100) * 0.1;
                objects.activityWeighting1 = formatCurrency(activityWeighting);
                var activityWeighting2 = Number(objects.activityWeighting1);

                objects.invoiceAmount1 = makeItCurrency(Number(checkForParameter(objects.invoiceAmount, 0)));

                var salesAgainstTarget = checkForParameter(objects.salesAgainstTarget, "0.00%").replace("%", "");
                objects.salesAgainstTarget1 = formatCurrency(salesAgainstTarget);

                var salesweighting0 = checkForParameter(objects.salesAgainstTargetWeighting, "0.00%").replace("%", "");
                objects.salesweighting1 = formatCurrency(salesweighting0);
                var salesweighting2 = Number(objects.salesweighting1);

                var backorderedPercentage = checkForParameter(objects.backorderedPercentage, "0.00%").replace("%", "");
                objects.backorderedPercentage1 = formatCurrency(backorderedPercentage);

                var backOrderWeighting0 = checkForParameter(objects.backorderdWeighting, "0.00%").replace("%", "");
                objects.backOrderWeighting1 = formatCurrency(backOrderWeighting0);
                var backOrderWeighting2 = Number(objects.backOrderWeighting1);

                objects.creditReturns1 = makeItCurrency(Number(checkForParameter(objects.creditReturns, 0)));

                var creditReturnsWeighting0 = checkForParameter(objects.creditReturnsWeighting, "0.00%").replace("%", "");
                objects.creditReturnsWeighting1 = formatCurrency(creditReturnsWeighting0);
                var creditReturnsWeighting2 = Number(objects.creditReturnsWeighting1);

                var caseWeighting0 = checkForParameter(objects.caseWeighting, "0.00%").replace("%", "");
                objects.caseWeighting1 = formatCurrency(caseWeighting0);
                var caseWeighting2 = Number(objects.caseWeighting1);

                var merchandisingWeighting0 = checkForParameter(objects.merchandisingWeighting, "0.00%").replace("%", "");
                objects.merchandisingWeighting1 = formatCurrency(merchandisingWeighting0);
                var merchandisingWeighting2 = Number(objects.merchandisingWeighting1);

                var trainingWeighting0 = checkForParameter(objects.trainingWeighting, "0.00%").replace("%", "");
                objects.trainingWeighting1 = formatCurrency(trainingWeighting0);
                var trainingWeighting2 = Number(objects.trainingWeighting1);

                var totalWeighting0 = salesweighting2 + backOrderWeighting2 + creditReturnsWeighting2 + caseWeighting2 + activityWeighting2 + merchandisingWeighting2 + trainingWeighting2;
                objects.totalWeighting = totalWeighting0.toFixed(2);
                var xmlTmplFile = file.load('Templates/PDF Templates/JJ Template OX360 OTGN-330.xml');
                var renderer = render.create();
                var templateContent = xmlTmplFile.getContents();
                templateContent = templateContent.replace('<!--ROW_CONTENT_HERE-->', tableContent);

                templateContent = templateContent.replace('<!--CUSTOMER_FEEDBACK_CONTENT_HERE-->', customerFeedbackContent1);
                templateContent = templateContent.replace('<!--BULK_BY_OPPORTUNITY_CONTENT_HERE-->', bulkByOppoContent1);

                templateContent = templateContent.replace('<!--PRODUCT_OPPORTUNITY_CONTENT_HERE-->', productOppoContent1);


                renderer.templateContent = templateContent;

                renderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "data",
                    data: objects
                });

                var transactionFile = renderer.renderAsPdf();
                context.response.writeFile(transactionFile, true);

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