/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
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
 * Creation of OX360 Button in customer Record and links to OX360 Report suitelet page
 * Date created :03-12-2020
 *
 ******************************************************************************/
define(['N/url','N/record'],
    function (url,record) {
        function beforeLoad(scriptContext) {
            try {
log.debug('test','test');
                scriptContext.form.addButton({
                    id: 'custpage_jj_0x360print',
                    label: 'OX360 Report',
                    functionName: 'printbutton'
                });

                scriptContext.form.clientScriptFileId = '23775878';


            }catch (e) {
                log.debug({
                    title: e.name,
                    details: e
                });
            }
        }

        return {
            beforeLoad: beforeLoad
        };
    }
);