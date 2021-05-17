/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
/************************************************************************************************
 * * Brooklyn Bicycle Co. | BROOK **
 * * BROOK-171 | Create a JSON with category info**
 *
 * **********************************************************************************************
 *
 * Author: Jobin & Jismi IT Services LLP
 *
 * Date Created : 10-May-2021
 *
 *
 * REVISION HISTORY
 *
 *
 * 10-May-2021
 *
 ***********************************************************************************************/
define(['N/search', 'N/task', 'N/file', 'N/runtime', 'N/url', 'N/https'],
    /**
     * @param{search} search
     * @param{task} task
     * @param{file} file
     * @param{runtime} runtime
     * @param{url} url
     * @param{https} https
     */
    (search, task, file, runtime, url, https) => {


        function rescheduleScriptandReturn(startRange, endRange, n, searchString) {
            try {
                log.debug('rescheduleScriptandReturn starts');
                //endrange is the last range of the just finished search.
                //Next search range when rescheduled will start from this endRange
                log.debug('itemArray reschedue', searchString);



                var mrTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: "customscript_jj_ss_json_items_brook_171",
                    deploymentId: "customdeploy_jj_ss_json_items_brook_171",
                    params: {
                        custscript_startrange: startRange,
                        custscript_endrange: endRange,
                        custscript_tot_count: n,
                        custscript_jj_item_array: searchString
                    },
                });
                var scriptTaskId = mrTask.submit();
                log.debug('scriptTaskId', scriptTaskId);

            } catch (e) {
                log.debug({
                    title: e.name,
                    details: e
                });
            }

        }

        //To check whether a value exists in parameter
        function checkForParameter(parameter, parameterName) {
            if (parameter !== null && parameter !== undefined && parameter !== false && parameter !== "null" && parameter !== "undefined" && parameter !== "false" && parameter != "" && parameter != " ")
                return true;
            if (parameterName)
                // LOG.debug("Empty Value found", "Empty Value for parameter " + parameterName);
                return false;
        }

        //To assign a default value if the it is empty
        function assignDefaultValue(value, defaultValue) {
            if (checkForParameter(value)) return value;
            return defaultValue;
        }

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                log.debug('scheduled script starts', 'true');

                //get the current script
                var scriptObj = runtime.getCurrentScript();
                //get the script parameter startRange
                var startRange = scriptObj.getParameter({
                    name: 'custscript_startrange'
                });
                log.debug('startRange', startRange);
                var endRange = scriptObj.getParameter({
                    name: 'custscript_endrange'
                });
                log.debug('endRange', endRange);
                var n = scriptObj.getParameter({
                    name: 'custscript_tot_count'
                });

                var searchStringnew = assignDefaultValue(scriptObj.getParameter({
                    name: 'custscript_jj_item_array'
                }), '');
                log.debug('first searchStringnew', searchStringnew);

                var jsonobject = {}
                var itemarraytest = [];
                if (searchStringnew != '') {

                    var fileObj = file.load({
                        id: 95142
                    });
                    var testcontent = fileObj.getContents();

                    log.debug('testcontent', testcontent);

                    jsonobject = JSON.parse(testcontent);
                    itemarraytest = jsonobject.items;
                    var itemArray = itemarraytest;
                }else{
                    var itemArray = [];
                }



                log.debug('first itemArray', itemArray);
                // log.debug('first itemArraynew', itemArraynew);


                if (startRange == '' || startRange == null) {
                    n = 0;
                }


                var priceLevelFilter = [];
                priceLevelFilter.push([
                    ["inventorylocation", "anyof", "2", "1", "3"], //Inventory Location  is any of Smart Warehousing California, Smart Warehousing Pennsylvania
                    "AND",
                    ["pricing.currency", "anyof", "1", "3"] //Pricing : Currency is USD
                ])
                var columns = [
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.ASC,
                        label: "item_internalid"
                    }), //Internal ID
                    // search.createColumn({
                    //     name: "formulatext",
                    //     formula: `'/detail-1?category=${categoryIds.join()}&id='||{internalid}`,
                    //     label: "item_detailspage_url"
                    // }), //Item Details Link
                    search.createColumn({name: "parent", label: "item_parent"}), //Parent
                    search.createColumn({name: "vendorcode", label: "item_vendorcode"}), //Vendor Code
                    search.createColumn({name: "itemid", label: "item_itemid"}), //Name
                    search.createColumn({name: "formulatext", formula: "{itemid}", label: "item_itemid_text"}), //ITEM NAME/NUMBER
                    search.createColumn({
                        name: "formulatext",
                        formula: "{vendorname}",
                        label: "item_vendorname"
                    }), //VENDOR NAME/CODE
                    search.createColumn({name: "storedisplayname", label: "item_storedisplayname"}), //Store Display Name
                    search.createColumn({name: "displayname", label: "item_displayname"}), //Display Name
                    search.createColumn({name: "salesdescription", label: "item_salesdescription"}), //Description
                    search.createColumn({name: "storedetaileddescription", label: "item_storedetaileddescription"}), //Detailed Description
                    search.createColumn({name: "storedescription", label: "item_storedescription"}), //Store Description
                    search.createColumn({name: "class", label: "item_class"}), //Class
                    search.createColumn({name: "classnohierarchy", label: "item_classnohierarchy"}), //Class (no hierarchy)
                    search.createColumn({name: "category", label: "item_category"}), //Category
                    search.createColumn({name: "categorynohierarchy", label: "item_categorynohierarchy"}), //Category (no hierarchy)
                    search.createColumn({name: "baseprice", label: "item_baseprice"}), //Base Price
                    search.createColumn({name: "matrix", label: "item_matrix"}), //Matrix Item
                    search.createColumn({
                        name: "custitembicycleaccessorycolor",
                        label: "item_custitembicycleaccessorycolor"
                    }), //Bicycle Accessory Color (Custom)
                    search.createColumn({
                        name: "custitembicycleaccessorysize",
                        label: "item_custitembicycleaccessorysize"
                    }), //Bicycle Accessory Size (Custom)
                    search.createColumn({name: "custitembicyclecolor", label: "item_custitembicyclecolor"}), //Bicycle Color (Custom)
                    search.createColumn({name: "custitembicyclesize", label: "item_custitembicyclesize"}), //Bicycle Size (Custom)
                    search.createColumn({name: "custitembicyclespeed", label: "item_custitembicyclespeed"}), //Bicycle Speed (Custom)
                    search.createColumn({
                        name: "formulatext",
                        formula: "NVL2({custitem4},'https://3550840.app.netsuite.com/'||{custitem4}||'&resize=2' ,'https://3550840.app.netsuite.com/core/media/media.nl?id=78946&c=3550840&h=KknZmnDCCqHszuxNanGAhglzkY94Tb8t7vlNDh7Z9lP2Wpue' ||'&resize=2')",
                        label: "item_image_thumbnail_url"
                    }), //Custom Field Images as Store Display Thumbnail
                    search.createColumn({
                        name: "formulatext",
                        formula: "NVL2({custitem4},'https://3550840.app.netsuite.com/'||{custitem4} ,'https://3550840.app.netsuite.com/core/media/media.nl?id=78946&c=3550840&h=KknZmnDCCqHszuxNanGAhglzkY94Tb8t7vlNDh7Z9lP2Wpue')",
                        label: "item_image_url"
                    }), //Custom Field Images
                    search.createColumn({name: "custitem4", label: "item_image_custitem4"}), //Custom Field Images (Custom)
                    search.createColumn({
                        name: "inventorylocation",
                        sort: search.Sort.ASC,
                        label: "item_inventorylocation"
                    }), //Inventory Location
                    search.createColumn({
                        name: "locationquantityavailable",
                        label: "item_locationquantityavailable"
                    }), //Location Available
                    search.createColumn({
                        name: "formulatext",
                        formula: `NVL2(
                                        {locationquantityavailable},
                                        CASE WHEN TO_NUMBER({locationquantityavailable})= 0 THEN 'OUT OF STOCK' ELSE
                                            (CASE WHEN TO_NUMBER({locationquantityavailable})<5 THEN '<5' ELSE
                                                (CASE WHEN TO_NUMBER({locationquantityavailable})<10 THEN '<10' ELSE
                                                    '<'||TO_CHAR(CEIL(TO_NUMBER({locationquantityavailable})/10)*10)
                                                END)
                                            END)
                                        END,
                                        'OUT OF STOCK'
                                      )
                                     `,
                        label: "item_locationquantityavailable_text"
                    }), //Location Available in Text
                    search.createColumn({
                        name: "pricelevel",
                        join: "pricing",
                        label: "item___pricing_pricelevel"
                    }), //Pricing : Price Level
                    search.createColumn({
                        name: "currency",
                        join: "pricing",
                        label: "item___pricing_currency"
                    }), //Pricing : Currency
                    search.createColumn({
                        name: "internalid",
                        join: "pricing",
                        sort: search.Sort.ASC,
                        label: "item___pricing_internalid"
                    }), //Pricing : Internal ID
                    search.createColumn({
                        name: "unitprice",
                        join: "pricing",
                        label: "item___pricing_unitprice"
                    }), //Pricing : Unit Price
                    /*THE FOLLOWING COLUMNS IS FOR THE PARENT ITEMS IF ANY*/
                    search.createColumn({
                        name: "internalid",
                        join: "parent",
                        label: "item___parent_internalid" //Parent : Internal ID
                    }),
                    // search.createColumn({
                    //     name: "formulatext",
                    //     formula: `'/detail-1?category=${categoryIds.join()}&id='||{parent.internalid}`,
                    //     label: "item___parent_detailspage_url"
                    // }), //Parent : Item Details Link
                    search.createColumn({
                        name: "parent",
                        join: "parent",
                        label: "item___parent_parent" //Parent : Parent
                    }),
                    search.createColumn({
                        name: "vendorcode",
                        join: "parent",
                        label: "item___parent_vendorcode" //Parent : Vendor Code
                    }),
                    search.createColumn({
                        name: "itemid",
                        join: "parent",
                        label: "item___parent_itemid" //Parent : Name
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "{parent.itemid}",
                        label: "item___parent_itemid_text" //Parent : ITEM NAME/NUMBER
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "{parent.vendorname}",
                        label: "item___parent_vendorname" //Parent : VENDOR NAME/CODE
                    }),
                    search.createColumn({
                        name: "storedisplayname",
                        join: "parent",
                        label: "item___parent_storedisplayname" //Parent : Store Display Name
                    }),
                    search.createColumn({
                        name: "displayname",
                        join: "parent",
                        label: "item___parent_displayname" //Parent : Display Name
                    }),
                    search.createColumn({
                        name: "salesdescription",
                        join: "parent",
                        label: "item___parent_salesdescription" //Parent : Description
                    }),
                    search.createColumn({
                        name: "storedetaileddescription",
                        join: "parent",
                        label: "item___parent_storedetaileddescription" //Parent : Detailed Description
                    }),
                    search.createColumn({
                        name: "storedescription",
                        join: "parent",
                        label: "item___parent_storedescription" //Parent : Store Description
                    }),
                    search.createColumn({
                        name: "class",
                        join: "parent",
                        label: "item___parent_class" //Parent : Class
                    }),
                    search.createColumn({
                        name: "classnohierarchy",
                        join: "parent",
                        label: "item___parent_classnohierarchy" //Parent : Class (no hierarchy)
                    }),
                    search.createColumn({
                        name: "category",
                        join: "parent",
                        label: "item___parent_category" //Parent : Category
                    }),
                    search.createColumn({
                        name: "categorynohierarchy",
                        join: "parent",
                        label: "item___parent_categorynohierarchy" //Parent : Category (no hierarchy)
                    }),
                    search.createColumn({
                        name: "baseprice",
                        join: "parent",
                        label: "item___parent_baseprice" //Parent : Base Price
                    }),
                    search.createColumn({
                        name: "matrix",
                        join: "parent",
                        label: "item___parent_matrix" //Parent : Matrix Item
                    }),
                    search.createColumn({
                        name: "custitembicycleaccessorycolor",
                        join: "parent",
                        label: "item___parent_custitembicycleaccessorycolor" //Parent : Bicycle Accessory Color (Custom)
                    }),
                    search.createColumn({
                        name: "custitembicycleaccessorysize",
                        join: "parent",
                        label: "item___parent_custitembicycleaccessorysize" //Parent : Bicycle Accessory Size (Custom)
                    }),
                    search.createColumn({
                        name: "custitembicyclecolor",
                        join: "parent",
                        label: "item___parent_custitembicyclecolor" //Parent : Bicycle Color (Custom)
                    }),
                    search.createColumn({
                        name: "custitembicyclesize",
                        join: "parent",
                        label: "item___parent_custitembicyclesize" //Parent : Bicycle Size (Custom)
                    }),
                    search.createColumn({
                        name: "custitembicyclespeed",
                        join: "parent",
                        label: "item___parent_custitembicyclespeed" //Parent : Bicycle Speed (Custom)
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "NVL2({parent.custitem4},'https://3550840.app.netsuite.com/'||{parent.custitem4}||'&resize=2' ,'https://3550840.app.netsuite.com/core/media/media.nl?id=78946&c=3550840&h=KknZmnDCCqHszuxNanGAhglzkY94Tb8t7vlNDh7Z9lP2Wpue' ||'&resize=2')",
                        label: "item___parent_image_thumbnail_url" //Parent : Store Display Thumbnail
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "NVL2({parent.custitem4},'https://3550840.app.netsuite.com/'||{parent.custitem4} ,'https://3550840.app.netsuite.com/core/media/media.nl?id=78946&c=3550840&h=KknZmnDCCqHszuxNanGAhglzkY94Tb8t7vlNDh7Z9lP2Wpue')",
                        label: "item___parent_image_ur" //Parent : Custom Field Images
                    }),
                    search.createColumn({
                        name: "custitem4",
                        join: "parent",
                        label: "item___parent_image_custitem4" //Parent : Custom Field Images (Custom)
                    }),
                ];
                var inventoryitemSearchObj = search.create({
                    type: "inventoryitem",
                    filters: [
                        ["type", "anyof", "InvtPart"], //Type   is Inventory Item
                        "AND",
                        ["isonline", "is", "T"], //Display in Web Site  is true
                        "AND",
                        ["isinactive", "is", "F"], //Inactive   is false


                        // "AND",
                        // ["internalid","anyof","60","421"],


                        "AND",
                        [
                            [
                                ["parent.internalidnumber", "isnotempty", ""], //Parent : Internal ID (Number)  is not empty
                                // "AND",
                                // ["parent.category", "anyof"].concat(categoryIds), //Parent : Category   includes any of categoryIds
                                "AND",
                                ["parent.isonline", "is", "T"], //Parent : Display in Web Site  is true
                                "AND",
                                ["parent.isinactive", "is", "F"] //Parent : Inactive    is false
                            ],
                            "OR",
                            [
                                // ["category", "anyof"].concat(categoryIds), //Category   includes any of categoryIds
                                // "AND",
                                ["isonline", "is", "T"], //Display in Web Site  is true
                                "AND",
                                ["isinactive", "is", "F"] //Inactive    is false
                            ]
                        ],
                        "AND",
                        [
                            [
                                [
                                    ["matrix", "is", "F"], //Matrix Item    is false
                                    "AND",
                                    ["matrixchild", "is", "T"], //Matrix Child Item is true
                                    "AND",
                                    ["formulanumeric: CASE WHEN ({custitembicycleaccessorycolor} IS NOT NULL OR {custitembicycleaccessorysize}  IS NOT NULL OR {custitembicyclecolor} IS NOT NULL OR {custitembicyclesize} IS NOT NULL OR {custitembicyclespeed} IS NOT NULL) THEN 1 ELSE 0 END", "equalto", "1"] //Only Chose Items on the PreApproved Matrix List
                                ],
                                "OR",
                                [
                                    ["matrix", "is", "F"], //Matrix Item    is false
                                    "AND",
                                    ["matrixchild", "is", "F"] //Matrix Child Item  is false
                                ],
                                "OR",
                                [
                                    ["matrix", "is", "T"], //Matrix Item    is true
                                    "AND",
                                    ["matrixchild", "is", "F"] //Matrix Child Item  is false
                                ]
                            ],
                            "AND",
                            [
                                //     /* [
                                //          ["inventorylocation", "anyof", "2", "1"], //Inventory Location is any of Smart Warehousing California, Smart Warehousing Pennsylvania
                                //          "AND",
                                //          ["pricing.currency", "anyof", "1"] //Pricing : Currency    is USD
                                //      ],
                                //      "OR",
                                //      [
                                //          ["inventorylocation", "anyof", "3"], //Inventory Location  is Vertex Canada
                                //          "AND",
                                //          ["pricing.currency", "anyof", "3"] //Pricing : Currency    is CAD
                                //      ],
                                //      "OR",*/
                                [
                                    ["inventorylocation.internalidnumber", "isempty", ""] //Inventory Location : Internal ID (Number)   is empty
                                ],
                            ].concat("OR", priceLevelFilter),
                        ],
                        "AND",
                        ["pricing.pricelevel", "anyof", "1", "5"] //Pricing : Price Level  is any of Base Price, Online Price , PRICE_LEVEL
                    ],
                    columns: columns
                });
                // log.debug("executeFetchItemSearch inventoryitemSearchObj", inventoryitemSearchObj);
                var searchResultCount = inventoryitemSearchObj.runPaged().count;
                log.debug("executeFetchItemSearch result count", searchResultCount);

                var searchResultCount1 = inventoryitemSearchObj.runPaged().count;
                var end = 0;
                //when script initially run startrange will be blank so set startrange as 0.
                if (startRange == '' || startRange == null) {

                    if (searchResultCount1 < 300) {
                        startRange = 0;
                        endRange = searchResultCount1;
                        end = 1;
                    } else {
                        startRange = 0;
                        endRange = 300;
                    }

                }

                startRange = parseInt(startRange);
                endRange = parseInt(endRange);
                var result1;
                result1 = inventoryitemSearchObj.run().getRange({
                    start: startRange,
                    end: endRange
                });



                // var itemArray = [];
                // inventoryitemSearchObj.run().each(function (result) {

                for (var j = 0; j < result1.length; j++) {
                    log.debug('j', j);


                    var itemObj = {};
                    var item_intrId = result1[j].getValue({
                        name: "internalid",
                        sort: search.Sort.ASC,
                        label: "item_internalid"
                    });
                    log.debug('item_intrId', item_intrId);

                    var inventorychilditemSearchObj = search.create({
                        type: "inventoryitem",
                        filters: [
                            ["type", "anyof", "InvtPart"], //Type   is Inventory Item
                            "AND",
                            ["isonline", "is", "T"], //Display in Web Site  is true
                            "AND",
                            ["isinactive", "is", "F"], //Inactive   is false
                            "AND",
                            ["parent.internalid", "anyof", item_intrId],
                            "AND",
                            [
                                [
                                    ["parent.internalidnumber", "isnotempty", ""], //Parent : Internal ID (Number)  is not empty
                                    // "AND",
                                    // ["parent.category", "anyof"].concat(categoryIds), //Parent : Category   includes any of categoryIds
                                    "AND",
                                    ["parent.isonline", "is", "T"], //Parent : Display in Web Site  is true
                                    "AND",
                                    ["parent.isinactive", "is", "F"] //Parent : Inactive    is false
                                ],
                                "OR",
                                [
                                    // ["category", "anyof"].concat(categoryIds), //Category   includes any of categoryIds
                                    // "AND",
                                    ["isonline", "is", "T"], //Display in Web Site  is true
                                    "AND",
                                    ["isinactive", "is", "F"] //Inactive    is false
                                ]
                            ],
                            "AND",
                            [
                                [
                                    [
                                        ["matrix", "is", "F"], //Matrix Item    is false
                                        "AND",
                                        ["matrixchild", "is", "T"], //Matrix Child Item is true
                                        "AND",
                                        ["formulanumeric: CASE WHEN ({custitembicycleaccessorycolor} IS NOT NULL OR {custitembicycleaccessorysize}  IS NOT NULL OR {custitembicyclecolor} IS NOT NULL OR {custitembicyclesize} IS NOT NULL OR {custitembicyclespeed} IS NOT NULL) THEN 1 ELSE 0 END", "equalto", "1"] //Only Chose Items on the PreApproved Matrix List
                                    ],
                                    "OR",
                                    [
                                        ["matrix", "is", "F"], //Matrix Item    is false
                                        "AND",
                                        ["matrixchild", "is", "F"] //Matrix Child Item  is false
                                    ],
                                    "OR",
                                    [
                                        ["matrix", "is", "T"], //Matrix Item    is true
                                        "AND",
                                        ["matrixchild", "is", "F"] //Matrix Child Item  is false
                                    ]
                                ],
                                "AND",
                                [
                                    //     /* [
                                    //          ["inventorylocation", "anyof", "2", "1"], //Inventory Location is any of Smart Warehousing California, Smart Warehousing Pennsylvania
                                    //          "AND",
                                    //          ["pricing.currency", "anyof", "1"] //Pricing : Currency    is USD
                                    //      ],
                                    //      "OR",
                                    //      [
                                    //          ["inventorylocation", "anyof", "3"], //Inventory Location  is Vertex Canada
                                    //          "AND",
                                    //          ["pricing.currency", "anyof", "3"] //Pricing : Currency    is CAD
                                    //      ],
                                    //      "OR",*/
                                    [
                                        ["inventorylocation.internalidnumber", "isempty", ""] //Inventory Location : Internal ID (Number)   is empty
                                    ],
                                ].concat("OR", priceLevelFilter),
                            ],
                            "AND",
                            ["pricing.pricelevel", "anyof", "1", "5"] //Pricing : Price Level  is any of Base Price, Online Price , PRICE_LEVEL
                        ],
                        columns: columns
                    });

                    var searchResultCount = inventorychilditemSearchObj.runPaged().count;
                    log.debug("itemSearchObj result count", searchResultCount);

                    var mainchildObj = {};
                    // var childItemArray = [];

                    inventorychilditemSearchObj.run().each(function (result) {
                        var childitemObj = {};
                        for (var i in columns) {
                            childitemObj[columns[i]['label']] = {
                                text: result.getText(columns[i]),
                                value: result.getValue(columns[i])
                            };
                        }
                        log.debug('childitemObj ', childitemObj);

                        // childItemArray.push(childitemObj);
                        mainchildObj[result.getValue(inventorychilditemSearchObj.columns[0])] = {


                            childitemObj

                        }


                        return true;
                    });
                    log.debug('mainchildObj 80', mainchildObj);
                    itemObj = {
                        childitems: mainchildObj
                    }


                    for (var i in columns) {
                        itemObj[columns[i]['label']] = {
                            text: result1[j].getText(columns[i]),
                            value: result1[j].getValue(columns[i])
                        };
                    }
                    log.debug('itemObj 1016', itemObj);
                    log.debug('itemArray before object push', itemArray);

//todo

                    // var arrayString = JSON.stringify(itemArray);
                    // var arrayfile = file.create({
                    //     name: 'itemarray',
                    //     fileType: 'JSON',
                    //     contents: arrayString,
                    //     folder: 87071
                    // });
                    //
                    // var fileId = arrayfile.save();
                    // log.debug('fileId', fileId);


                    //


                    itemArray.push(itemObj);
                    log.debug('itemarray after push', itemArray);

                    var scriptObj = runtime.getCurrentScript();
                    //
                    var remaining = scriptObj.getRemainingUsage();
                    log.debug('remaining governance inside item loop', remaining);


                    // return true;
                    // });


                }

                // var scriptObj = runtime.getCurrentScript();
                //
                // var remaining = scriptObj.getRemainingUsage();
                // log.debug('final remaining governance', remaining);
                //
                // var Countt = searchResultCount1 / 10;
                // var Count = Math.floor(Countt);
                // log.debug('Count', Count);
                // log.debug('n', n);
                // if (end != 1) {
                //
                //     //rescheduling the script based on the count
                //     if (n < Count - 1) {
                //         log.debug('594', '594');
                //         n++;
                //         log.debug('startRange', startRange);
                //         log.debug('endRange', endRange);
                //         log.debug('n', n);
                //         rescheduleScriptandReturn(startRange + 10, endRange + 10, n, itemArray);
                //     } else if (n == Count - 1) {
                //         n++;
                //         log.debug('startRange', startRange);
                //         log.debug('endRange', endRange);
                //         log.debug('n', n);
                //         var lastCount = parseFloat(searchResultCount1) - parseFloat(endRange);
                //         log.debug('lastCount', lastCount);
                //         rescheduleScriptandReturn(startRange + 10, endRange + lastCount, n,itemArray);
                //     } else {
                //
                //
                //     }
                // }


                log.debug('itemArray', itemArray);
                // var categoryObj = {}

                var columns = [
                    search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "internalid"}),
                    search.createColumn({name: "name", label: "name"}),
                    search.createColumn({name: "longdescription", label: "longdescription"}),
                    search.createColumn({name: "description", label: "description"}),
                    search.createColumn({name: "excludefromsitemap", label: "excludefromsitemap"}),
                    search.createColumn({name: "sitemappriority", label: "sitemappriority"}),
                    search.createColumn({name: "fullname", label: "fullname"}),
                    search.createColumn({name: "hidden", label: "hidden"}),
                    search.createColumn({name: "urlcomponent", label: "urlcomponent"})
                ];
                var categoryArray = [];
                var sitecategorySearchObj = search.create({
                    type: "sitecategory",
                    filters: [
                        ["internalid", "noneof", "-141"],
                        "AND",
                        ["formulatext: {fullname}", "contains", "Brooklyn B2B Home"] //Formula (Text)   contains 'Brooklyn B2B Home'  {fullname}
                    ],
                    columns: columns
                });

                log.debug("executeCategorySearch sitecategorySearchObj", sitecategorySearchObj);
                var searchResultCount = sitecategorySearchObj.runPaged().count;
                log.debug("executeCategorySearch result count", searchResultCount);

                var categoryArray = [];
                sitecategorySearchObj.run().each(function (result) {
                    var categoryObj = {};
                    // var page=result.getText({name: "custrecord_jj_pagefield", label: "Page"});
                    // var location=result.getText({name: "custrecord_jj_locations", label: "Location"});


                    for (var i in columns) {
                        categoryObj[columns[i]['label']] = {
                            text: result.getText(columns[i]),
                            value: result.getValue(columns[i])
                        };
                    }
                    // var fileName=page+"_"+location;
                    // filedata+="window."+fileName.toUpperCase()+"="+JSON.stringify(obj)+";";
                    log.debug('categoryObj 1016', categoryObj);
                    categoryArray.push(categoryObj);
                    return true;
                });


                log.debug('categoryArray', categoryArray);
                var mainObj = {
                    categories: categoryArray,
                    items: itemArray
                };


                log.debug('categoryArray', categoryArray);


                log.debug('mainObj 421', mainObj);
                var searchString = JSON.stringify(mainObj);
                log.debug('searchString', searchString);


                //todo
                var scriptObj = runtime.getCurrentScript();

                var remaining = scriptObj.getRemainingUsage();
                log.debug('final remaining governance', remaining);

                var Countt = searchResultCount1 / 300;
                var Count = Math.floor(Countt);
                log.debug('Count', Count);
                log.debug('n', n);
                if (end != 1) {

                    //rescheduling the script based on the count
                    if (n < Count - 1) {
                        log.debug('594', '594');
                        n++;
                        log.debug('startRange', startRange);
                        log.debug('endRange', endRange);
                        log.debug('n', n);
                        rescheduleScriptandReturn(startRange + 300, endRange + 300, n, searchString);
                    } else if (n == Count - 1) {
                        n++;
                        log.debug('startRange', startRange);
                        log.debug('endRange', endRange);
                        log.debug('n', n);
                        var lastCount = parseFloat(searchResultCount1) - parseFloat(endRange);
                        log.debug('lastCount', lastCount);
                        rescheduleScriptandReturn(startRange + 300, endRange + lastCount, n, searchString);
                    } else {


                    }
                }

//


                var jsonfile = file.create({
                    name: 'itemandCategoryDetails',
                    fileType: 'JSON',
                    contents: searchString,
                    folder: 87071
                });


                log.debug('jsonfile', jsonfile);
                var fileId = jsonfile.save();
                log.debug('fileId', fileId);
            } catch (e) {
                log.debug({
                    title: e.name,
                    details: e
                });
            }
        }

        return {execute}

    });
