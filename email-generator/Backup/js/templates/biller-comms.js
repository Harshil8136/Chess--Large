// Ensure the global App object and templateCategories exist
window.App = window.App || {};
App.templateCategories = App.templateCategories || {};

// Define and attach this category's templates
App.templateCategories.billerComms = [
    {
        id: 'acknowledge-biller-request',
        name: 'Biller - Acknowledge Request',
        category: 'Biller Communications',
        fields: [
            { key: 'biller_contact_name', label: 'Biller Contact Name', type: 'text', placeholder: 'e.g., Rickaye Edwards', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06681513', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [
                'Re: Your Request - Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Acknowledgement',
                variants: [
                    '<p>Thank you for reaching out. My name is {{{Case.Owner.Name}}}, and I have received your request regarding case #{{{Case.CaseNumber}}}.</p><p>I am looking into this now and will get back to you with an update very soon.</p>',
                    '<p>This email is to confirm I\'ve received your inquiry for case #{{{Case.CaseNumber}}}. I am currently reviewing it and will provide a substantive update shortly.</p>'
                ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Acknowledged request from biller contact. Emailed to advise that the case is under review and an update will follow.',
                'Sent initial acknowledgement to biller. Case is pending action.'
            ]
        }
    },
    {
        id: 'internal-neg-file-request',
        name: 'Internal - Request Negative File Removal',
        category: 'Biller Communications',
        fields: [
            { key: 'case_number', label: 'SalesForce Case #', type: 'text', placeholder: 'e.g., 00123456', hml_field: '{{{Case.CaseNumber}}}' },
            { key: 'customer_account_number', label: 'Customer Account #', type: 'text', placeholder: 'e.g., 987654321', hml_field: '{{{Case.Account.AccountNumber}}}' },
            { key: 'biller_name', label: 'Biller TLA', type: 'text', placeholder: 'e.g., GRIN', hml_field: '{{{Case.Account.Name}}}' },
            { key: 'processor_name', label: 'Processor', type: 'text', placeholder: 'e.g., Braintree', hml_field: '{{{Processor_Name__c}}}' },
        ],
        subject: {
            variants: [ 'PT - Negative File Removal Request - Case #{{{Case.CaseNumber}}}' ]
        },
        body: [
            {
                block: 'Main Body',
                variants: [
                    '<p>Hi Team,</p><p>Please assist with a removal of the negative file for the following:</p><ul><li>SalesForce Case #: {{{Case.CaseNumber}}}</li><li>Biller TLA: {{{Case.Account.Name}}}</li><li>Processor: {{{Processor_Name__c}}}</li><li>Customer Account #: {{{Case.Account.AccountNumber}}}</li></ul><p>Thank you,</p><p>{{{Case.Owner.Name}}}</p>'
                ]
            }
        ],
        caseComment: {
            variants: [
                'Submitted internal request to the Negative File team to unblock account {{{Case.Account.AccountNumber}}}.',
                'Sent unblocking request for case {{{Case.CaseNumber}}} to the appropriate internal team.'
            ]
        }
    }
];