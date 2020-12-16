/**
 *@NApiVersion 2.x
 *@NScriptType Portlet
 */
/*******************************************************************************
 * CLIENTNAME:OX Tools
 * OTGN-319
 * OX360 report Portlet in customer dashboard
 * **************************************************************************
 * Date : 20-11-2020
 *
 * Author: Jobin & Jismi IT Services LLP
 * Script Description :
 * Creation of OX360 Report Portlet in Customer dashboard.
 * Date created :20-11-2020
 *
 ******************************************************************************/
// portlet script to dispaly OX360 Report in Customer Dashboard Portlet
define(['N/search', 'N/runtime', 'N/format', 'N/format/i18n', 'N/file'],
    function (search, runtime, format, formati, file) {
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


        function render(params) {
            try {
                params.portlet.title = "OX360 Report";


                var currentuser = runtime.getCurrentUser().id;
                //saved search to get customer details
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
                            , ["transaction.trandate", "within", "thisfiscalquarter"]
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
                            ["case.createddate", "within", "thisfiscalquarter"],
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


                var customerSearchObj5 = search.create({
                    type: "customer",
                    filters:
                        [
                            ["stage", "anyof", "CUSTOMER"],
                            "AND",
                            ["isinactive", "is", "F"],
                            "AND",
                            ["activity.date", "within", "thisfiscalquarter"],
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
                            ["activity.date", "within", "thisfiscalquarter"]
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
                            ["trandate", "within", "thisfiscalquarter"]
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
                    var imageContent = '<td style = "text-align: center;"><img src="https://3425005-sb1.app.netsuite.com/core/media/media.nl?id=23774770&c=3425005_SB1&h=4JRD3TXTflztyPx40gQ4uuPCP0_Xgv98YiG3PZt15RdLNUyr&fcts=20201126233413&whence=" alt="No Image"  width="500"></td>'
                } else {
                    var imageContent = '<td><img src="' + imageurl + '" alt="Merchandising Image"  width="500"></td>'
                }
                // html content to design portlet
                var content =
                    '<html>'+
                    '<head>' +
                    '<style>' +
                    'table.datatable{border: 1px solid Gray; border-collapse: collapse;}' +
                    'th.heading{font-size: 10pt; text-align: center; padding-left: 3px; border: 1px solid Gray; border-collapse: collapse;}' +
                    'td.data{font-size: 10pt; padding-left: 3px; border: 1px solid Gray; border-collapse: collapse;}' +
                    'td.rightaligneddata{font-size: 10pt; padding-right: 3px; border: 1px solid Gray; border-collapse: collapse; text-align: right;}' +
                    'td.centeraligneddata{font-size: 10pt; padding-right: 3px; border: 1px solid Gray; border-collapse: collapse; text-align: center;}' +
                    'td.total{font-size: 10pt; padding-right: 3px; border: 1px solid Gray; border-collapse: collapse; text-align:right; }' +
                    'tr.heading{background-color:rgb(0, 191, 255); }' +
                    '.btn{background-color: #00BFFF; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 2px; float: right;' +
                    '</style>'+
                    '</head>' +
                    '<body>' +
                    '<table align="left" width="70%" height="80px" style="border-collapse: collapse;">' +
                    '<tr style = "border:none; margin:none; height:40px;">' +
                    '<td style="background-color:rgb(0, 191, 255); color:white; width:20%; font-size: 20pt;border:none; margin:none; padding-left:3px;"><b>Customer</b></td> ' +
                    '<td style="background-color:rgb(240, 248, 255); font-size: 20pt;border:none; margin:none; padding-left:3px;"><b>' + objects.customerName + '</b></td></tr>' +
                    '<tr style = "border:none; margin:none; height:40px;"><td style="background-color:rgb(0, 191, 255); color:white; width:20%; font-size: 20pt; border:none; margin:none; padding-left:3px;"><b>Date</b></td><td style="background-color:rgb(240, 248, 255); font-size: 20pt; border:none; margin:none; padding-left:3px;"><b>' + objects.todaysDate + '</b></td>' +
                    '</tr>' +
                    '</table>' +

                    // '<button class="btn" onclick="window.open(\'http://google.com\')">Print OX360 Report</button>' +

                    '<button class="btn" onclick="window.open(\'/app/site/hosting/scriptlet.nl?script=1865&deploy=1&currentUser='+currentuser+'\')">Print OX360 Report</button>' +

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
                    '<table align="right" width="500px" >' +
                    '<tr class="heading"><td style="color:white; height:70px; text-align: center; font-size: 20pt;">Merchandising</td></tr>' +
                    '<tr style="height:7px;"><td></td></tr>' +
                    '<tr>' + imageContent + '</tr></table>' +
                    '</body>'+
                    '</html>'

                params.portlet.html = content;

                // var scriptObj = runtime.getCurrentScript();
                // log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());
            } catch (e) {
                log.debug({
                    title: e.name,
                    details: e
                });
            }
        }


        return {
            render: render
        };
    }
);
