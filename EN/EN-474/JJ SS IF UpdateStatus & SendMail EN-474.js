/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/task'],

    function (search, record, email, runtime, task) {

        /**
         * Definition of the Scheduled script trigger point.
         *
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
         * @Since 2015.2
         */
        function execute(scriptContext) {


            try {
                var currentDate = new Date();
                log.debug('EXECUTION STARTS', 'EXECUTION BEGINS AT ' + (currentDate.toUTCString()));
                var ItemFulfillment_InternaIDs, ItemFulfillment_SearchResults, ItemFulfillment_TransactionNumber,
                    ItemFulfillment_Status, IF_UpdatedSuccessfully = [];


                ItemFulfillment_SearchResults = search.load({
                    id: 'customsearch1844',
                    type: search.Type.ITEM_FULFILLMENT
                });
                var ItemFulfillmentCount = ItemFulfillment_SearchResults.runPaged().count;
                log.debug("ItemFulfillmentCount", ItemFulfillmentCount);

                if (ItemFulfillmentCount > 0) {
                    ItemFulfillment_SearchResults.run().each(function (result) {
                        log.debug("result", result.length);
                        ItemFulfillment_TransactionNumber = result.getValue({
                            name: "transactionnumber"
                        });
                        ItemFulfillment_Status = result.getValue({
                            name: "statusRef"
                        });
                        if (ItemFulfillment_Status == 'packed') {
                            ItemFulfillment_InternaIDs = result.getValue({
                                name: "internalid"
                            });

                            var iFrecord = record.load({
                                type: record.Type.ITEM_FULFILLMENT,
                                id: ItemFulfillment_InternaIDs,
                                isDynamic: true,
                            });
                            var item = iFrecord.getValue({
                                fieldId: "item"
                            });
                            var itemLineCount = iFrecord.getLineCount({
                                'sublistId': 'item'
                            });
                            log.debug("itemLineCount", '_'+itemLineCount+'_');

                            if (itemLineCount>0) {
                                log.debug("itemLineCount 59", itemLineCount);

                                record.submitFields({
                                    type: record.Type.ITEM_FULFILLMENT,
                                    id: ItemFulfillment_InternaIDs,
                                    values: {
                                        shipstatus: 'C'
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                                IF_UpdatedSuccessfully.push(ItemFulfillment_TransactionNumber);
                            }
                        }

                        var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
                        log.debug("remainingUsage", remainingUsage);
                        if (parseInt(remainingUsage) < 500) {
                            //sendmail(IF_UpdatedSuccessfully);
                            return rescheduleScript();
                        }

                        return true;
                    });
                }

                log.debug("IF_UpdatedSuccessfully", IF_UpdatedSuccessfully);
                sendmail(IF_UpdatedSuccessfully)
                currentDate = new Date();
                var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
                log.debug('FINAL remainingUsage', remainingUsage);
                log.debug('EXECUTION ENDS', 'EXECUTION ENDS AT ' + (currentDate.toUTCString()));

            } catch (e) {
                log.debug("Error@ execute", e);
                log.error("Error@ execute", e);
            }

        }

        function sendmail(IF_UpdatedSuccessfully) {
            try {
                if (IF_UpdatedSuccessfully.length > 0) {
                    var senderId = 257318;
                    var recipientEmail = 'bally@enlightensmiles.com,anjo@jobinandjismi.com';
                    var recipientId = 12;
                    email.send({
                        author: senderId,
                        recipients: recipientEmail,
                        subject: 'Mark Orders as Ship Completed',
                        body: 'The Orders marked as shipped are ' + '<b>' + IF_UpdatedSuccessfully.toString() + '</b>'
                    });
                }

            } catch (e) {
                log.debug("Error@ sendmail", e);
                log.error("Error@ sendmail", e);
            }
        }

        function rescheduleScript() {
            try {
                var currentDate = new Date();
                log.debug('EXECUTION RESCHEDULES', 'EXECUTION RESCHEDULES AT ' + (currentDate.toUTCString()));
                var remainingTime = runtime.getCurrentScript().getRemainingUsage();
                log.debug("Remaining governance units", remainingTime);
                var rescheduleTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: "customscript_jj_if_updatestatus_en474",
                    deploymentId: "customdeploy_jj_if_updatestatus_en474",
                    params: {}
                });
                var scriptTaskId = rescheduleTask.submit();
                log.debug("reschedule scriptTaskId ", scriptTaskId);
                return true;

            } catch (e) {
                log.debug("Error@ rescheduleScript", e);
                log.error("Error@ rescheduleScript", e);
            }
        }

        return {
            execute: execute
        };

    });