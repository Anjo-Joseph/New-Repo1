/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/************************************************************************************************
 * * Brooklyn Bicycle Co. | BROOK **
 * * BROOK-69 | Brooklyn B2B Portal Website tasks **
 * * BROOK-68 | Get all item details using category id **
 * * BROOK-44 | Show item stock info **
 *
 *
 * **********************************************************************************************
 *
 * Author: Jobin & Jismi IT Services LLP
 *
 * Date Created : 28-December-2020
 *
 * Created By: Manu Antony, Jobin & Jismi IT Services LLP
 *
 * REVISION HISTORY
 *
 *
 * 28-December-2020
 *
 ***********************************************************************************************/


define(['N/search'],
    /**
     * @param{search} search
     */
    (search) => {

        /**
         * @description Global variable for storing errors ----> for debuging purposes
         * @type {Array.<Error>}
         * @constant
         */
        const ERROR_STACK = [];

        /**
         * @description Check whether the given parameter argument has value on it or is it empty.
         * ie, To check whether a value exists in parameter
         * @author Manu Antony
         * @date 2020-12-28
         * @param {*} parameter parameter which contains/references some values
         * @param {*} parameterName name of the parameter, not mandatory
         * @returns {Boolean} true if there exist a value else false
         */
        function checkForParameter(parameter, parameterName) {
            if (parameter !== "" && parameter !== null && parameter !== undefined && parameter !== false && parameter !== "null" && parameter !== "undefined" && parameter !== " " && parameter !== 'false') {
                return true;
            } else {
                if (parameterName)
                    log.debug('Empty Value found', 'Empty Value for parameter ' + parameterName);
                return false;
            }
        }

        /**
         * @description To assign a default value if the value argument is empty
         * @author Manu Antony
         * @date 2020-12-28
         * @param {String|Number|Boolean|Object|Array|null|undefined} value
         * @param {String|Number|Boolean|Object|Array} defaultValue
         * @returns {*} either value or defaultValue
         */
        function assignDefaultValue(value, defaultValue) {
            if (checkForParameter(value))
                return value;
            else
                return defaultValue;
        }

        /**
         * @description To round a float number
         * @author Manu Antony
         * @date 2020-12-28
         * @param {Number|String} value
         * @param {Number|String} decimals
         * @returns {Number} Floating Point Number with the given precision
         */
        function roundFloat(value, decimals) {
            decimals = (decimals) ? decimals : 2;
            return Number(Math.round(parseFloat(value) + 'e' + parseInt(decimals)) + 'e-' + parseInt(decimals));
        }

        /**
         * @description To fix a float number to specified decimal parts
         * @author Manu Antony
         * @date 2020-12-28
         * @param {Number|String} value
         * @param {Number|String} decimals
         * @returns {Number|String}
         */
        function fixFloat(value, decimals) {
            decimals = (decimals) ? decimals : 2;
            // return roundFloat(parseFloat(value), parseInt(decimals)).toFixed(parseInt(decimals));
            return parseFloat(value).toFixed(decimals);
        }

        /**
         * @description Common Try-Catch function, applies to Object contains methods/function
         * @author Manu Antony
         * @date 2020-12-28
         * @param {Object.<string,Function|any>} DATA_OBJ Object contains methods/function
         * @param {String} NAME  Name of the Object
         * @returns {void}
         */
        function applyTryCatch(DATA_OBJ, NAME) {
            /**
             * @description  Try-Catch function
             * @author Manu Antony
             * @date 2020-12-28
             * @param {Function} myfunction - reference to a function
             * @param {String} key - name of the function
             * @returns {Function|false}
             */
            function tryCatch(myfunction, key) {
                return function () {
                    try {
                        return myfunction.apply(this, arguments);
                    } catch (e) {
                        log.error("error in " + key, e);
                        ERROR_STACK.push(e);
                        return false;
                    }
                };
            }

            for (let key in DATA_OBJ) {
                if (typeof DATA_OBJ[key] === "function") {
                    DATA_OBJ[key] = tryCatch(DATA_OBJ[key], NAME + "." + key);
                }
            }
        }

        /**
         * @description dataSets from Saved Search and formating Saved Search results
         */
        const dataSets = {
            /**
             * @description Object referencing NetSuite Saved Search
             * @typedef {Object} SearchObj
             * @property {Object[]} filters - Filters Array in Search
             * @property {Object[]} columns - Columns Array in Search
             */
            /**
             * @description to format Saved Search column to key-value pair where each key represents each columns in Saved Search
             * @param {SearchObj} savedSearchObj
             * @param {void|String} priorityKey
             * @returns {Object.<String,SearchObj.columns>}
             */
            fetchSavedSearchColumn: function fetchSavedSearchColumn(savedSearchObj, priorityKey) {
                let columns = savedSearchObj.columns;
                let columnsData = {},
                    columnName = '';
                columns.forEach(function (result, counter) {
                    columnName = '';
                    if (result[priorityKey]) {
                        columnName += result[priorityKey];
                    } else {
                        if (result.summary)
                            columnName += result.summary + '__';
                        if (result.formula)
                            columnName += result.formula + '__';
                        if (result.join)
                            columnName += result.join + '__';
                        columnName += result.name;
                    }
                    columnsData[columnName] = result;
                });
                return columnsData;
            },
            /**
             * @description Representing each result in Final Saved Search Format
             * @typedef formattedEachSearchResult
             * @type {{value:any,text:any}}
             */
            /**
             * @description to fetch and format the single saved search result. ie, Search result of a single row containing both text and value for each columns
             * @param {Object[]} searchResult contains search result of a single row
             * @param {Object.<String,SearchObj.columns>} columns
             * @returns {Object.<String,formattedEachSearchResult>|{}}
             */
            formatSingleSavedSearchResult: function formatSingleSavedSearchResult(searchResult, columns) {
                var responseObj = {};
                for (let column in columns)
                    responseObj[column] = {
                        value: searchResult.getValue(columns[column]),
                        text: searchResult.getText(columns[column])
                    };
                return responseObj;
            },
            /**
             * @description to iterate over and initiate format of each saved search result
             * @param {SearchObj} searchObj
             * @param {void|Object.<String,SearchObj.columns>} columns
             * @returns {[]|Object[]}
             */
            iterateSavedSearch: function iterateSavedSearch(searchObj, columns) {
                if (!checkForParameter(searchObj))
                    return false;
                if (!checkForParameter(columns))
                    columns = dataSets.fetchSavedSearchColumn(searchObj);

                var response = [];
                var searchPageRanges;
                try {
                    searchPageRanges = searchObj.runPaged({
                        pageSize: 1000
                    });
                } catch (err) {
                    return [];
                }
                if (searchPageRanges.pageRanges.length < 1)
                    return [];

                var pageRangeLength = searchPageRanges.pageRanges.length;
                log.debug('pageRangeLength', pageRangeLength);

                for (let pageIndex = 0; pageIndex < pageRangeLength; pageIndex++)
                    searchPageRanges.fetch({
                        index: pageIndex
                    }).data.forEach(function (result) {
                        response.push(dataSets.formatSingleSavedSearchResult(result, columns));
                    });

                return response;
            },
            /**
             * @description - Saved Search for Inventory Items for specific Price Level and Currency (within predefined Categories)
             * @param {Object} parameterObject
             * @param {Number} parameterObject.PRICE_LEVEL - Internal Id of Price level
             * @param {Number} parameterObject.CURRENCY - Internal Id of Currency
             * @param {Number} parameterObject.CATEGORY - Internal Id of Website Category
             * @param {Number} parameterObject.ITEM_INTERNAL_ID - Internal Id of Item
             * @returns {*[]|Object[]}
             */
            executeFetchItemSearch({PRICE_LEVEL = 1, CURRENCY, CATEGORY, ITEM_INTERNAL_ID}) {
                //To handle Inventory Location based on Currency
                let priceLevelFilter = [];
                if (CURRENCY == 1) //Currency   is USD
                    priceLevelFilter.push([
                        ["inventorylocation", "anyof", "2", "1"], //Inventory Location  is any of Smart Warehousing California, Smart Warehousing Pennsylvania
                        "AND",
                        ["pricing.currency", "anyof", "1"] //Pricing : Currency is USD
                    ])
                else if (CURRENCY == 3) //Currency is CAD
                    priceLevelFilter.push([
                        ["inventorylocation", "anyof", "3"], //Inventory Location   is Vertex Canada
                        "AND",
                        ["pricing.currency", "anyof", "3"] //Pricing : Currency is CAD
                    ])


                //To filter in a specific Item if Item Internal Id is feeded
                let internalIdFilter = [];
                if (checkForParameter(ITEM_INTERNAL_ID) && util.isArray(ITEM_INTERNAL_ID))
                    internalIdFilter.push("AND", ["internalid", "anyof"].concat(ITEM_INTERNAL_ID))


                //To filter in a specific website category if category Internal Id is feeded
                let categoryIds = [];
                if (checkForParameter(CATEGORY))
                    categoryIds = [CATEGORY.toString().trim()];
                else
                    categoryIds = Object.keys(APPROVED_CATEGORY);

                const inventoryitemSearchObj = search.create({
                    type: "inventoryitem",
                    filters: [
                        ["type", "anyof", "InvtPart"], //Type   is Inventory Item
                        "AND",
                        ["isonline", "is", "T"], //Display in Web Site  is true
                        "AND",
                        ["isinactive", "is", "F"], //Inactive   is false
                        "AND",
                        [
                            [
                                ["parent.internalidnumber", "isnotempty", ""], //Parent : Internal ID (Number)  is not empty
                                "AND",
                                ["parent.category", "anyof"].concat(categoryIds), //Parent : Category   includes any of categoryIds
                                "AND",
                                ["parent.isonline", "is", "T"], //Parent : Display in Web Site  is true
                                "AND",
                                ["parent.isinactive", "is", "F"] //Parent : Inactive    is false
                            ],
                            "OR",
                            [
                                ["category", "anyof"].concat(categoryIds), //Category   includes any of categoryIds
                                "AND",
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
                                /* [
                                     ["inventorylocation", "anyof", "2", "1"], //Inventory Location is any of Smart Warehousing California, Smart Warehousing Pennsylvania
                                     "AND",
                                     ["pricing.currency", "anyof", "1"] //Pricing : Currency    is USD
                                 ],
                                 "OR",
                                 [
                                     ["inventorylocation", "anyof", "3"], //Inventory Location  is Vertex Canada
                                     "AND",
                                     ["pricing.currency", "anyof", "3"] //Pricing : Currency    is CAD
                                 ],
                                 "OR",*/
                                [
                                    ["inventorylocation.internalidnumber", "isempty", ""] //Inventory Location : Internal ID (Number)   is empty
                                ]
                            ].concat("OR", priceLevelFilter),
                        ],
                        "AND",
                        ["pricing.pricelevel", "anyof", "1", "5", PRICE_LEVEL] //Pricing : Price Level  is any of Base Price, Online Price , PRICE_LEVEL
                    ].concat(internalIdFilter),
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.ASC,
                            label: "item_internalid"
                        }), //Internal ID
                        search.createColumn({
                            name: "formulatext",
                            formula: `'/detail-1?category=${categoryIds.join()}&id='||{internalid}`,
                            label: "item_detailspage_url"
                        }), //Item Details Link
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
                        search.createColumn({
                            name: "formulatext",
                            formula: `'/detail-1?category=${categoryIds.join()}&id='||{parent.internalid}`,
                            label: "item___parent_detailspage_url"
                        }), //Parent : Item Details Link
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
                    ]
                });
                log.debug("executeFetchItemSearch inventoryitemSearchObj", inventoryitemSearchObj);
                let searchResultCount = inventoryitemSearchObj.runPaged().count;
                log.debug("executeFetchItemSearch result count", searchResultCount);
                return dataSets.iterateSavedSearch(inventoryitemSearchObj, dataSets.fetchSavedSearchColumn(inventoryitemSearchObj, 'label'));
            },
            /**
             * @description - Saved Search for listing Website Category details
             * @param {Array.<Number>} CATEGORY - Array containing Internal Id of Website Category
             */
            executeCategorySearch({CATEGORY}) {
                //To filter in a specific website category if category Internal Id is feeded
                let categoryIds = [];
                if (checkForParameter(CATEGORY))
                    categoryIds = ["AND", ["internalid", "anyof", CATEGORY.toString().trim()]];
                else
                    categoryIds = []

                const sitecategorySearchObj = search.create({
                    type: "sitecategory",
                    filters: [
                        ["internalid", "noneof", "-141"],
                        "AND",
                        ["formulatext: {fullname}", "contains", "Brooklyn B2B Home"] //Formula (Text)   contains 'Brooklyn B2B Home'  {fullname}
                    ].concat(categoryIds),
                    columns: [
                        search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "internalid"}),
                        search.createColumn({name: "name", label: "name"}),
                        search.createColumn({name: "longdescription", label: "longdescription"}),
                        search.createColumn({name: "description", label: "description"}),
                        search.createColumn({name: "excludefromsitemap", label: "excludefromsitemap"}),
                        search.createColumn({name: "sitemappriority", label: "sitemappriority"}),
                        search.createColumn({name: "fullname", label: "fullname"}),
                        search.createColumn({name: "hidden", label: "hidden"}),
                        search.createColumn({name: "urlcomponent", label: "urlcomponent"})
                    ]
                });
                log.debug("executeCategorySearch inventoryitemSearchObj", sitecategorySearchObj);
                let searchResultCount = sitecategorySearchObj.runPaged().count;
                log.debug("executeCategorySearch result count", searchResultCount);
                return dataSets.iterateSavedSearch(sitecategorySearchObj, dataSets.fetchSavedSearchColumn(sitecategorySearchObj, 'label'));
            },
            /**
             *
             * @description - Saved Search for Inventory Items for specific for specific keyword send from the Website and returns parent item details or if parent item is not present then returns item details
             * @param {Object} parameterObject
             * @param {Number} parameterObject.PRICE_LEVEL - Internal Id of Price level
             * @param {Number} parameterObject.CURRENCY - Internal Id of Currency
             * @param {Number} parameterObject.LOCATION - Internal Id of the Location
             * @param {Number} parameterObject.SEARCH_KEYWORD - search keyword for the item search
             * @returns {*[]|Object[]}
             */
            executeSearchItemSearch({PRICE_LEVEL, CURRENCY, LOCATION, SEARCH_KEYWORD}) {
                //Filter used for the search the item based on the search keyword
                SEARCH_KEYWORD = SEARCH_KEYWORD.toString().trim()
                //To filter in a specific website category if category Internal Id is feeded
                let categoryIds = Object.keys(APPROVED_CATEGORY);
                const inventoryitemSearchObj = search.create({
                    type: "inventoryitem",
                    filters: [
                        ["type", "anyof", "InvtPart"],
                        "AND",
                        ["pricing.currency", "anyof", CURRENCY],
                        "AND",
                        ["pricing.pricelevel", "anyof", "1", "5", PRICE_LEVEL], //Pricing : Price Level  is any of Base Price, Online Price , PRICE_LEVEL
                        "AND",
                        [
                            [
                                ["isonline", "is", "T"],
                                "AND",
                                ["isinactive", "is", "F"],
                                "AND",
                                // ["pricing.currency", "anyof", CURRENCY],
                                // "AND",
                                // ["pricing.pricelevel", "anyof", "1", "5", PRICE_LEVEL], //Pricing : Price Level  is any of Base Price, Online Price , PRICE_LEVEL
                                // "AND",
                                [
                                    ["displayname", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["vendorname", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["name", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["caption", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["storedescription", "contains", SEARCH_KEYWORD],
                                ]
                            ],
                            "OR",
                            [
                                ["parent.isonline", "is", "T"],
                                "AND",
                                ["parent.isinactive", "is", "F"],
                                "AND",
                                [
                                    ["parent.displayname", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["parent.vendorname", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["parent.name", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["parent.caption", "contains", SEARCH_KEYWORD],
                                    "OR",
                                    ["parent.storedescription", "contains", SEARCH_KEYWORD]
                                ],
                            ],
                        ],
                        "AND",
                        [
                            ["category", "anyof"].concat(categoryIds), //Category   includes any of categoryIds,
                            "OR",
                            ["parent.category", "anyof"].concat(categoryIds), //Category   includes any of categoryIds
                        ],
                        "AND",
                        ["formulanumeric: CASE WHEN ({custitembicycleaccessorycolor} IS NOT NULL OR {custitembicycleaccessorysize} IS NOT NULL OR {custitembicyclecolor} IS NOT NULL OR {custitembicyclesize} IS NOT NULL OR {custitembicyclespeed} IS NOT NULL) THEN 1 ELSE 0 END", "equalto", "1"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "formulanumeric",
                            summary: "GROUP",
                            formula: "NVL({parent.internalid},{internalid})",
                            label: "item_internalid"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            summary: "MAX",
                            formula: `'detail-1?category=CATEGORY_ID&id='||NVL({parent.internalid},{internalid})`,
                            label: "item_detailspage_url"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            summary: "MAX",
                            formula: "NVL({parent.itemid},{itemid})",
                            label: "item_itemid"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            summary: "MAX",
                            formula: "REPLACE(NVL({parent.category},{category}), '>', ':')",
                            label: "item_category"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            summary: "MAX",
                            formula: "NVL({parent.categorynohierarchy},{categorynohierarchy})",
                            label: "item_categorynohierarchy"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            summary: "MAX",
                            formula: "NVL({parent.matrix},{matrix})",
                            label: "item_matrix"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            summary: "MAX",
                            formula: "NVL2(NVL({parent.custitem4}, {custitem4}),'https://3550840.app.netsuite.com'||NVL({parent.custitem4}, {custitem4})||'&resize=2' ,'https://3550840.app.netsuite.com/core/media/media.nl?id=78946&c=3550840&h=KknZmnDCCqHszuxNanGAhglzkY94Tb8t7vlNDh7Z9lP2Wpue' ||'&resize=2')",
                            label: "item_image_thumbnail_url"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "pricing",
                            summary: "GROUP",
                            label: "item___pricing_internalid"
                        }),
                        search.createColumn({
                            name: "currency",
                            join: "pricing",
                            summary: "MAX",
                            label: "item___pricing_currency"
                        }),
                        search.createColumn({
                            name: "unitprice",
                            join: "pricing",
                            summary: "MAX",
                            label: "item___pricing_unitprice"
                        }),
                        search.createColumn({
                            name: "pricelevel",
                            join: "pricing",
                            summary: "MAX",
                            sort: search.Sort.ASC,
                            label: "item___pricing_pricelevel"
                        }).setWhenOrderedBy({
                            name: 'unitprice',
                            join: 'pricing'
                        })
                    ]
                })
                let searchResultCount = inventoryitemSearchObj.runPaged().count;
                log.debug("executeFetchItemSearch result count", searchResultCount);
                return dataSets.iterateSavedSearch(inventoryitemSearchObj, dataSets.fetchSavedSearchColumn(inventoryitemSearchObj, 'label'));
            }
        }
        applyTryCatch(dataSets, 'dataSets');

        /**
         * @description For Processing DataSets
         */
        const dataProcess = {
            /**
             *
             * @param {Object[]} dataArray
             * @returns {Object[]|[]}
             */
            groupsItemsByParent(dataArray) {
                /**
                 * @description To retrieve and format only matrix item related fields
                 * @param obj - The object which holds the value (entire row of saved search)
                 * @param isParent - Denotes to retrieve matrix fields form parent Item
                 * @returns {{}}
                 */
                const retrieveMatrixOptions = (obj, isParent) => {
                    let matrixFields = {};
                    if (isParent)
                        matrixFields = {
                            'item___parent_custitembicycleaccessorycolor': "item_custitembicycleaccessorycolor",
                            'item___parent_custitembicycleaccessorysize': "item_custitembicycleaccessorysize",
                            'item___parent_custitembicyclecolor': "item_custitembicyclecolor",
                            'item___parent_custitembicyclesize': "item_custitembicyclesize",
                            'item___parent_custitembicyclespeed': "item_custitembicyclespeed"
                        };
                    else
                        matrixFields = {
                            'item_custitembicycleaccessorycolor': "item_custitembicycleaccessorycolor",
                            'item_custitembicycleaccessorysize': "item_custitembicycleaccessorysize",
                            'item_custitembicyclecolor': "item_custitembicyclecolor",
                            'item_custitembicyclesize': "item_custitembicyclesize",
                            'item_custitembicyclespeed': "item_custitembicyclespeed"
                        };
                    let responseObj = {};
                    for (let key in matrixFields)
                        responseObj[matrixFields[key]] = {
                            value: obj[key] && obj[key].value ? obj[key].value.split(",") : "",
                            text: obj[key] && obj[key].text ? obj[key].text.split(",") : "",
                        };
                    return responseObj;
                }
                /**
                 * @description To retrieve and format only inventory/stock availability related fields
                 * @param {{}} obj - The object which holds the value (entire row of saved search)
                 * @returns {{}}
                 */
                const retrieveStockAvailability = (obj) => {
                    let stockFields = ['item_inventorylocation', 'item_locationquantityavailable', 'item_locationquantityavailable_text'];
                    let responseObj = {};
                    for (let val of stockFields)
                        responseObj[val] = obj[val];
                    return responseObj;
                }
                /**
                 * @description To retrieve and format only price level related fields
                 * @param {{}} obj - The object which holds the value (entire row of saved search)
                 * @returns {{}}
                 */
                const retrievePriceLevels = (obj) => {
                    let priceFields = ['item___pricing_internalid', 'item___pricing_currency', 'item___pricing_pricelevel', 'item___pricing_unitprice'];
                    let responseObj = {};
                    for (let val of priceFields)
                        responseObj[val] = obj[val];
                    return responseObj;
                }

                let processedResult = dataArray.reduce((acc, el) => {

                    if (el.item_matrix.value) { //if the current item is a Parent Matrix Item
                        //Initialising reference to current element if empty
                        if (!acc[el.item_internalid.value])
                            acc[el.item_internalid.value] = {};
                        if (!acc[el.item_internalid.value].stock_availability)
                            acc[el.item_internalid.value].stock_availability = {};
                        if (!acc[el.item_internalid.value].price_levels)
                            acc[el.item_internalid.value].price_levels = {};
                        if (!acc[el.item_internalid.value].matrix_options)
                            acc[el.item_internalid.value].matrix_options = {};
                        if (!acc[el.item_internalid.value].child_items)
                            acc[el.item_internalid.value].child_items = {};

                        //Attach the Item details into Object
                        acc[el.item_internalid.value] = Object.assign(
                            acc[el.item_internalid.value],
                            el, {
                                matrix_options: retrieveMatrixOptions(el)
                            },
                        );

                        //Associating Inventory Value if present
                        if (el.item_inventorylocation.value) {
                            if (!acc[el.item_internalid.value].stock_availability[el.item_inventorylocation.value])
                                acc[el.item_internalid.value].stock_availability[el.item_inventorylocation.value] = {};
                            acc[el.item_internalid.value].stock_availability[el.item_inventorylocation.value] = retrieveStockAvailability(el);
                        }

                        //Associating Price Level if present
                        if (el.item___pricing_internalid.value) {
                            if (!acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value])
                                acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = {};
                            acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = retrievePriceLevels(el);
                        }


                    } else if (el.item_parent.value) {
                        //if the current item is a child Item
                        //Initializing Parent Reference if empty for current child matrix item
                        if (!acc[el.item_parent.value])
                            acc[el.item_parent.value] = {};
                        if (!acc[el.item_parent.value].stock_availability)
                            acc[el.item_parent.value].stock_availability = {};
                        if (!acc[el.item_parent.value].price_levels)
                            acc[el.item_parent.value].price_levels = {};
                        if (!acc[el.item_parent.value].matrix_options)
                            acc[el.item_parent.value].matrix_options = {};
                        if (!acc[el.item_parent.value].child_items)
                            acc[el.item_parent.value].child_items = {};
                        //Initialising the Item details as child Items under Parent Item
                        if (!acc[el.item_parent.value].child_items[el.item_internalid.value])
                            acc[el.item_parent.value].child_items[el.item_internalid.value] = {};
                        //Initialising child Items Reference under Parent Item
                        if (!acc[el.item_parent.value].child_items[el.item_internalid.value].stock_availability)
                            acc[el.item_parent.value].child_items[el.item_internalid.value].stock_availability = {};
                        if (!acc[el.item_parent.value].child_items[el.item_internalid.value].price_levels)
                            acc[el.item_parent.value].child_items[el.item_internalid.value].price_levels = {};


                        //Adding Parent References if the details are missing
                        if (!acc[el.item_parent.value].item_internalid) {
                            acc[el.item_parent.value] = Object.assign(
                                acc[el.item_parent.value], {
                                    item_baseprice: el.item___parent_baseprice,
                                    item_category: el.item___parent_category,
                                    item_categorynohierarchy: el.item___parent_categorynohierarchy,
                                    item_class: el.item___parent_class,
                                    item_classnohierarchy: el.item___parent_classnohierarchy,
                                    item_custitembicycleaccessorycolor: el.item___parent_custitembicycleaccessorycolor,
                                    item_custitembicycleaccessorysize: el.item___parent_custitembicycleaccessorysize,
                                    item_custitembicyclespeed: el.item___parent_custitembicyclespeed,
                                    item_custitembicyclecolor: el.item___parent_custitembicyclecolor,
                                    item_custitembicyclesize: el.item___parent_custitembicyclesize,
                                    item_detailspage_url: el.item___parent_detailspage_url,
                                    item_displayname: el.item___parent_displayname,
                                    item_image_custitem4: el.item___parent_image_custitem4,
                                    item_image_thumbnail_url: el.item___parent_image_thumbnail_url,
                                    item_image_url: el.item___parent_image_url,
                                    item_internalid: el.item___parent_internalid,
                                    item_inventorylocation: el.item___parent_inventorylocation,
                                    item_itemid: el.item___parent_itemid,
                                    item_itemid_text: el.item___parent_itemid_text,
                                    item_locationquantityavailable: el.item___parent_locationquantityavailable,
                                    item_matrix: el.item___parent_matrix,
                                    item_parent: el.item___parent_parent,
                                    item_salesdescription: el.item___parent_salesdescription,
                                    item_storedescription: el.item___parent_storedescription,
                                    item_storedetaileddescription: el.item___parent_storedetaileddescription,
                                    item_storedisplayname: el.item___parent_storedisplayname,
                                    item_vendorcode: el.item___parent_vendorcode,
                                    item_vendorname: el.item___parent_vendorname
                                }, {
                                    matrix_options: retrieveMatrixOptions(el, true)
                                });
                        }

                        //Adding Child Item (Current Item) References
                        acc[el.item_parent.value].child_items[el.item_internalid.value] = Object.assign(
                            acc[el.item_parent.value].child_items[el.item_internalid.value],
                            el, {
                                matrix_options: retrieveMatrixOptions(el)
                            }
                        );

                        //Associating Inventory Value if present
                        if (el.item_inventorylocation.value) {
                            acc[el.item_parent.value].child_items[el.item_internalid.value].stock_availability = Object.assign(
                                acc[el.item_parent.value].child_items[el.item_internalid.value].stock_availability, {
                                    [el.item_inventorylocation.value]: retrieveStockAvailability(el)
                                });
                            // acc[el.item_parent.value].child_items[el.item_internalid.value].stock_availability[el.item_inventorylocation.value] = retrieveStockAvailability(el);
                        }

                        //Associating Price Level if present
                        if (el.item___pricing_internalid.value) {
                            acc[el.item_parent.value].child_items[el.item_internalid.value].price_levels = Object.assign(
                                acc[el.item_parent.value].child_items[el.item_internalid.value].price_levels, {
                                    [el.item___pricing_internalid.value]: retrievePriceLevels(el)
                                });
                            //acc[el.item_parent.value].child_items[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = retrievePriceLevels(el);
                        }


                    } else { //if the current item is not a matrix item
                        //Initialising reference to current element if empty
                        if (!acc[el.item_internalid.value])
                            acc[el.item_internalid.value] = {};
                        if (!acc[el.item_internalid.value].stock_availability)
                            acc[el.item_internalid.value].stock_availability = {};
                        if (!acc[el.item_internalid.value].price_levels)
                            acc[el.item_internalid.value].price_levels = {};
                        if (!acc[el.item_internalid.value].matrix_options)
                            acc[el.item_internalid.value].matrix_options = {};
                        if (!acc[el.item_internalid.value].child_items)
                            acc[el.item_internalid.value].child_items = {};

                        //Attach the Item details into Object
                        acc[el.item_internalid.value] = Object.assign(
                            acc[el.item_internalid.value],
                            el, {
                                matrix_options: retrieveMatrixOptions(el)
                            },
                        );

                        //Associating Inventory Value if present
                        if (el.item_inventorylocation.value) {
                            if (!acc[el.item_internalid.value].stock_availability[el.item_inventorylocation.value])
                                acc[el.item_internalid.value].stock_availability[el.item_inventorylocation.value] = {};
                            acc[el.item_internalid.value].stock_availability[el.item_inventorylocation.value] = retrieveStockAvailability(el);
                        }

                        //Associating Price Level if present
                        if (el.item___pricing_internalid.value) {
                            if (!acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value])
                                acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = {};
                            acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = retrievePriceLevels(el);
                        }
                    }
                    return acc;
                }, {});
                log.debug('processedResult', processedResult);
                return Object.values(processedResult || {}).filter(el => el.item_internalid);
                //return Object.values(processedResult || {});
            },
            /**
             *
             * @param {Object[]} dataArray
             * @param {Object} APPROVED_CATEGORY
             * @returns {Object[]|[]}
             */
            groupSearchItems(dataArray, APPROVED_CATEGORY) {
                /**
                 * @description To retrieve and format only price level related fields
                 * @param {{}} obj - The object which holds the value (entire row of saved search)
                 * @returns {{}}
                 */
                const retrievePriceLevels = (obj) => {
                    let priceFields = ['item___pricing_internalid', 'item___pricing_currency', 'item___pricing_pricelevel', 'item___pricing_unitprice'];
                    let responseObj = {};
                    for (let val of priceFields)
                        responseObj[val] = obj[val];
                    return responseObj;
                }

                let processedResult = dataArray.reduce((acc, el) => {
                    if (!acc[el.item_internalid.value])
                        acc[el.item_internalid.value] = {};

                    //Attach the Item details into Object
                    acc[el.item_internalid.value] = Object.assign(
                        acc[el.item_internalid.value],
                        el
                    );

                    //Map Category Id into Item URL
                    acc[el.item_internalid.value].item_detailspage_url.value = (acc[el.item_internalid.value].item_detailspage_url.value).toString().replace('CATEGORY_ID', APPROVED_CATEGORY_REVERSEMAP[el.item_category.value] || Object.keys(APPROVED_CATEGORY)[0])

                    if (!acc[el.item_internalid.value].price_levels)
                        acc[el.item_internalid.value].price_levels = {};

                    //Associating Price Level if present
                    if (el.item___pricing_internalid.value) {
                        if (!acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value])
                            acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = {};
                        acc[el.item_internalid.value].price_levels[el.item___pricing_internalid.value] = retrievePriceLevels(el);
                    }
                    return acc;
                }, {});
                log.debug('processedResult', processedResult);
                return Object.values(processedResult || {}).filter(el => el.item_internalid);

            }
        }
        applyTryCatch(dataProcess, 'dataProcess');

        /**
         * @description Approved Currencies
         * @type {{"1": string, "3": string}}
         */
        const APPROVED_CURRENCY = {
            "1": "USD",
            "3": "CAD"
        };

        /**
         * @description Approved WebSite Categories
         * @type {Object<String>}
         */
        const APPROVED_CATEGORY = {};

        /**
         * @description Approved WebSite Categories
         * @type {Object<String>}
         */
        const APPROVED_CATEGORY_REVERSEMAP = {};

        /**
         * @description ApiMethods available to the user
         * @type {{fetchItemsByCategory(): ({reason: string, data: null, status: string}), fetchAllItems(): ({reason: string, data: null, status: string}), fetchSingleItem(): ({reason: string, data: null, status: string})}}
         */
        const apiMethods = {
            /**
             * @description To fetch all Item based on Currency and Price level under the approved category
             * @returns {{reason: (string), data: null, status: string}|{reason: string, data: (Object[]|*[]), status: string}|{reason: string, data: null, status: string}}
             */
            fetchItems() {
                const requestObj = {
                    priceLevel: exports.parameters.priceLevel,
                    currencyId: exports.parameters.currencyId,
                };
                log.debug('requestObj on fetchAllItems', requestObj);

                //to check whether the request has empty value in parameter
                for (let param in requestObj)
                    if (!checkForParameter(requestObj[param]))
                        return {status: 'FAILURE', reason: 'EMPTY_VALUE_IN_PARAMETER', data: null};
                    else
                        requestObj[param] = decodeURIComponent(requestObj[param]).toString().trim();

                if (!Number.isInteger(Number(requestObj.priceLevel)) || !Number.isInteger(Number(requestObj.currencyId)))
                    return {status: 'FAILURE', reason: 'INVALID_INTERNALID', data: null};

                if (!APPROVED_CURRENCY[Number(requestObj.currencyId)])
                    return {status: 'FAILURE', reason: 'INVALID_CURRENCY', data: null}

                //Execute WebSite Category Search
                let websiteCategorySearch = dataSets.executeCategorySearch({});
                Object.assign(APPROVED_CATEGORY, websiteCategorySearch.reduce((acc, el) => {
                    return acc[el.internalid.value] = el.fullname.value, acc;
                }, {}));


                //Saved Search for Inventory Items for specific PriceLevel and Currency
                const itemSearchResult = dataSets.executeFetchItemSearch({
                    PRICE_LEVEL: Number(requestObj.priceLevel),
                    CURRENCY: Number(requestObj.currencyId)
                });

                //Only if there is an array length and not a false response
                if (itemSearchResult && util.isArray(itemSearchResult) && itemSearchResult.length) {
                    log.debug('itemSearchResult', itemSearchResult);
                    return {
                        status: 'SUCCESS',
                        reason: 'RECORD_FOUND',
                        data: {
                            items: dataProcess.groupsItemsByParent(itemSearchResult),
                            categories: websiteCategorySearch
                        }
                    };
                }
                return {status: 'FAILURE', reason: ERROR_STACK.length ? 'ERROR' : 'NO_RECORD_FOUND', data: null};
            },
            /**
             * @description To fetch all Item based on Currency and Price level under the specified category
             * @returns {{reason: (string), data: null, status: string}|{reason: string, data: (Object[]|*[]), status: string}|{reason: string, data: null, status: string}}
             */
            fetchItemsByCategory() {
                const requestObj = {
                    priceLevel: exports.parameters.priceLevel,
                    currencyId: exports.parameters.currencyId,
                    categoryId: exports.parameters.categoryId,
                };
                log.debug('requestObj on fetchItemsByCategory', requestObj);

                //to check whether the request has empty value in parameter
                for (let param in requestObj)
                    if (!checkForParameter(requestObj[param]))
                        return {status: 'FAILURE', reason: 'EMPTY_VALUE_IN_PARAMETER', data: null};
                    else
                        requestObj[param] = decodeURIComponent(requestObj[param]).toString().trim();

                if (!Number.isInteger(Number(requestObj.priceLevel)) || !Number.isInteger(Number(requestObj.currencyId)) || !Number.isInteger(Number(requestObj.categoryId)))
                    return {status: 'FAILURE', reason: 'INVALID_INTERNALID', data: null};

                if (!APPROVED_CURRENCY[Number(requestObj.currencyId)])
                    return {status: 'FAILURE', reason: 'INVALID_CURRENCY', data: null}

                //Execute WebSite Category Search
                let websiteCategorySearch = dataSets.executeCategorySearch({
                    CATEGORY: Number(requestObj.categoryId)
                });
                //let websiteCategorySearch = dataSets.executeCategorySearch({});
                Object.assign(APPROVED_CATEGORY, websiteCategorySearch.reduce((acc, el) => {
                    return acc[el.internalid.value] = el.fullname.value, acc;
                }, {}));

                if (!APPROVED_CATEGORY[Number(requestObj.categoryId)])
                    return {status: 'FAILURE', reason: 'INVALID_CATEGORY', data: null};


                //Saved Search for Inventory Items for specific PriceLevel and Currency
                const itemSearchResult = dataSets.executeFetchItemSearch({
                    PRICE_LEVEL: Number(requestObj.priceLevel),
                    CURRENCY: Number(requestObj.currencyId),
                    CATEGORY: Number(requestObj.categoryId),
                });

                //Only if there is an array length and not a false response
                if (itemSearchResult && util.isArray(itemSearchResult) && itemSearchResult.length) {
                    log.debug('itemSearchResult', itemSearchResult);
                    return {
                        status: 'SUCCESS',
                        reason: 'RECORD_FOUND',
                        data: {
                            items: dataProcess.groupsItemsByParent(itemSearchResult),
                            categories: websiteCategorySearch
                        }
                    };
                }
                return {status: 'FAILURE', reason: ERROR_STACK.length ? 'ERROR' : 'NO_RECORD_FOUND', data: null};

            },
            /**
             * @description To fetch all Item based on Currency and Price level for an specific Items
             * @returns {{reason: (string), data: null, status: string}|{reason: string, data: (Object[]|*[]), status: string}|{reason: string, data: null, status: string}}
             */
            fetchSingleItem() {
                const requestObj = {
                    priceLevel: exports.parameters.priceLevel,
                    currencyId: exports.parameters.currencyId,
                    categoryId: exports.parameters.categoryId,
                    itemId: exports.parameters.itemId,
                };
                log.debug('requestObj on fetchSingleItem', requestObj);

                //to check whether the request has empty value in parameter
                for (let param in requestObj)
                    if (!checkForParameter(requestObj[param]))
                        return {status: 'FAILURE', reason: 'EMPTY_VALUE_IN_PARAMETER', data: null};
                    else
                        requestObj[param] = decodeURIComponent(requestObj[param]);

                if (!Number.isInteger(Number(requestObj.priceLevel)) || !Number.isInteger(Number(requestObj.currencyId)) ||
                    !Number.isInteger(Number(requestObj.categoryId)) || !Number.isInteger(Number(requestObj.itemId)))
                    return {status: 'FAILURE', reason: 'INVALID_INTERNALID', data: null};

                if (!APPROVED_CURRENCY[Number(requestObj.currencyId)])
                    return {status: 'FAILURE', reason: 'INVALID_CURRENCY', data: null}

                //Execute WebSite Category Search
                let websiteCategorySearch = dataSets.executeCategorySearch({
                    CATEGORY: Number(requestObj.categoryId)
                });
                //let websiteCategorySearch = dataSets.executeCategorySearch({});
                Object.assign(APPROVED_CATEGORY, websiteCategorySearch.reduce((acc, el) => {
                    return acc[el.internalid.value] = el.fullname.value, acc;
                }, {}));

                if (!APPROVED_CATEGORY[Number(requestObj.categoryId)])
                    return {status: 'FAILURE', reason: 'INVALID_CATEGORY', data: null};


                //Saved Search for Inventory Items for specific PriceLevel and Currency
                const itemSearchResult = dataSets.executeFetchItemSearch({
                    PRICE_LEVEL: Number(requestObj.priceLevel),
                    CURRENCY: Number(requestObj.currencyId),
                    CATEGORY: Number(requestObj.categoryId),
                    ITEM_INTERNAL_ID: (requestObj.itemId).toString().split(","),
                });

                //Only if there is an array length and not a false response
                if (itemSearchResult && util.isArray(itemSearchResult) && itemSearchResult.length) {
                    log.debug('itemSearchResult', itemSearchResult);
                    return {
                        status: 'SUCCESS',
                        reason: 'RECORD_FOUND',
                        data: {
                            items: dataProcess.groupsItemsByParent(itemSearchResult),
                            categories: websiteCategorySearch
                        }
                    };
                }
                return {status: 'FAILURE', reason: ERROR_STACK.length ? 'ERROR' : 'NO_RECORD_FOUND', data: null};
            },
            /**
             *@description To search the specified item based on Keyword that is send by the Website
             * @returns {{reason: (string), data: null, status: string}|{reason: string, data: (Object[]|*[]), status: string}|{reason: string, data: null, status: string}}
             */
            searchSingleItem() {
                const requestObj = {
                    priceLevel: exports.parameters.priceLevel,
                    locationId: exports.parameters.location,
                    currencyId: exports.parameters.currency,
                    searchKeyword: exports.parameters.query,
                    customerId: exports.parameters.customerid
                }
                for (let param in requestObj)
                    if (!checkForParameter(requestObj[param]))
                        return {status: 'FAILURE', reason: 'EMPTY_VALUE_IN_PARAMETER', data: null};
                    else
                        requestObj[param] = decodeURIComponent(requestObj[param]);

                if (!Number.isInteger(Number(requestObj.priceLevel)) || !Number.isInteger(Number(requestObj.currencyId)) ||
                    !Number.isInteger(Number(requestObj.locationId)) || !Number.isInteger(Number(requestObj.customerId)))
                    return {status: 'FAILURE', reason: 'INVALID_INTERNALID', data: null};

                if (!APPROVED_CURRENCY[Number(requestObj.currencyId)])
                    return {status: 'FAILURE', reason: 'INVALID_CURRENCY', data: null}


                //Execute WebSite Category Search
                let websiteCategorySearch = dataSets.executeCategorySearch({});
                Object.assign(APPROVED_CATEGORY, websiteCategorySearch.reduce((acc, el) => {
                    return acc[el.internalid.value] = el.fullname.value, acc;
                }, {}));
                log.debug("APPROVED_CATEGORY", APPROVED_CATEGORY);
                Object.assign(APPROVED_CATEGORY_REVERSEMAP, websiteCategorySearch.reduce((acc, el) => {
                    return acc[el.fullname.value] = el.internalid.value, acc;
                }, {}));


                const itemSearchResult = dataSets.executeSearchItemSearch({
                    PRICE_LEVEL: Number(requestObj.priceLevel),
                    CURRENCY: Number(requestObj.currencyId),
                    LOCATION: Number(requestObj.locationId),
                    SEARCH_KEYWORD: requestObj.searchKeyword,
                });
                //Only if there is an array length and not a false response
                if (itemSearchResult && util.isArray(itemSearchResult) && itemSearchResult.length) {
                    log.debug('itemSearchResult', itemSearchResult);
                    return {
                        status: 'SUCCESS',
                        reason: 'RECORD_FOUND',
                        data: {
                            items: dataProcess.groupSearchItems(itemSearchResult, APPROVED_CATEGORY),
                        }
                    };
                }
                return {status: 'FAILURE', reason: ERROR_STACK.length ? 'ERROR' : 'NO_RECORD_FOUND', data: null};

            }

        };
        applyTryCatch(apiMethods, 'apiMethods');

        const exports = {
            // context: undefined,
            // method: undefined,
            // parameters: undefined,
            // body: undefined,
            init(context) {
                this.context = context;
                this.method = context.request.method;
                this.parameters = context.request.parameters;
                this.body = context.request.body;
            },
            /**
             * @description To route request based on API Type
             * @returns {{reason: string, data: null, status: string}|undefined|{reason: string, data: null, status: string}}
             */
            routeRequest() {
                if (checkForParameter(exports.parameters.apiType)) {
                    switch (exports.parameters.apiType) {
                        case 'fetchItems':
                            return apiMethods.fetchItems();
                        case 'fetchItemsByCategory':
                            return apiMethods.fetchItemsByCategory();
                        case 'fetchSingleItem':
                            return apiMethods.fetchSingleItem();
                        case 'searchSingleItem':
                            return apiMethods.searchSingleItem();
                        default:
                            return {status: 'FAILURE', reason: 'INVALID_APITYPE', data: null};
                    }
                }
                return {status: 'FAILURE', reason: 'INVALID_APITYPE', data: null};
            },
            /**
             * Defines the Suitelet script trigger point.
             * @param {Object} scriptContext
             * @param {ServerRequest} scriptContext.request - Incoming request
             * @param {ServerResponse} scriptContext.response - Suitelet response
             * @since 2015.2
             */
            onRequest(context) {
                //Initialize Suitelet
                exports.init(context);
                return exports.sendResponse(exports.routeRequest() || {
                    status: 'FAILURE',
                    reason: 'ERROR',
                    data: null
                }), true;
            },
            /**
             * @description Structures and sens the response
             * @param STATUS - It will be either Success or Failure
             * @param REASON - Reason Code
             * @param DATA - Data to be passed if any
             * @returns {boolean}
             */
            sendResponse(STATUS, REASON, DATA) { //All response will be send from this common point
                log.debug(`arguments.length : ${arguments.length}`, arguments);
                if (arguments.length < 2) {
                    DATA = arguments[0].data;
                    REASON = arguments[0].reason;
                    STATUS = arguments[0].status;
                }
                let callBackFunction = this.parameters.callback ? this.parameters.callback : "?";
                return this.context.response.write(`${callBackFunction}('${escape(JSON.stringify({
                    summary: {
                        status: STATUS || (ERROR_STACK && util.isArray(ERROR_STACK) && ERROR_STACK.length > 0 ? 'FAILURE' : null),
                        reason: REASON || null,
                        error: (ERROR_STACK ? ERROR_STACK : null) || null,
                        request: {
                            parameters: this.parameters
                        }
                    },
                    data: (DATA ? DATA : null) || null
                }))}')`), true;
            }
        };
        applyTryCatch(exports, 'exports');

        return exports;

    });