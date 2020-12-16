/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
/*******************************************************************************
 * CLIENTNAME:OX Tools
 * OTGN-326
 * OX360 report Button in Customer record
 * **************************************************************************
 * Date : 03-12-2020
 *
 * Author: Jobin & Jismi IT Services LLP
 * Script Description :
 * links OX360 Report Button in customer record to OX360 Report suitelet page
 * Date created :03-12-2020
 *
 ******************************************************************************/
define(['N/url','N/record','N/currentRecord'],
    function (url,record,currentRecord) {
        function pageInit(context) {
            console.log("pageinit works!!");
        }
        function printbutton() {

            var customerRecord = currentRecord.get();
            var customerInternalId = customerRecord.getValue('id');
            // links to suitelet page
            var output = url.resolveScript({
                scriptId: 'customscript_jj_sl_csrecordox360_otgn326',
                params: {
                    custInternalId: customerInternalId
                },
                deploymentId: 'customdeploy_jj_sl_cs_rec_ox360_otgn326',
                returnExternalUrl: false
            });
            window.open(output, "");
        }

        return {
            printbutton: printbutton,
            pageInit: pageInit
        };
    });