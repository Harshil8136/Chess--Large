// Ensure the global App object and templateCategories exist
window.App = window.App || {};
App.templateCategories = App.templateCategories || {};

// Define and attach this category's templates
App.templateCategories.infoGathering = [
    {
        id: 'request-general-info',
        name: 'Info - Request General Details',
        category: 'Information Gathering',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Jane Doe', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06653743', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [
                'Regarding Your Inquiry - Case #{{{Case.CaseNumber}}}',
                'More Information Needed for Your Request - Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Introduction',
                variants: [
                    '<p>Thank you for reaching out to Paymentus. My name is {{{Case.Owner.Name}}}, and I\'ll be assisting you with your request, case number {{{Case.CaseNumber}}}.</p>',
                ]
            },
            {
                block: 'Core Request',
                variants: [
                    '<p>To help us investigate, could you please provide a few more details? We will need:</p><ul><li>The name of the company you paid the bill to</li><li>The account number associated with the payment</li><li>The date and amount of the payment in question</li></ul>',
                    '<p>To proceed with your request, please reply with the following information:</p><ul><li>The name of your service provider</li><li>Your account number</li><li>The date and amount of the transaction</li></ul>',
                ]
            },
            {
                block: 'Closing',
                variants: [ '<p>Once we have these details, we can look into this for you. You can also call us at 1-800-420-1663 to provide this information securely.</p>' ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Emailed customer to request additional details (biller, account #, amount, date). Case pending customer response.',
                'Sent request for information to customer to proceed with their inquiry.'
            ]
        }
    },
    {
        id: 'request-biller-info',
        name: 'Info - Request Biller Name',
        category: 'Information Gathering',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Wendy Bangs', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06630485', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [
                'Action Required: Your Inquiry - Case #{{{Case.CaseNumber}}}',
                'Regarding Your Request - Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Introduction',
                variants: [ '<p>Thank you for your message. My name is {{{Case.Owner.Name}}}, and I\'m assisting with your inquiry, case #{{{Case.CaseNumber}}}.</p>' ]
            },
            {
                block: 'Core Request',
                variants: [
                    '<p>To help you get this resolved, could you please provide the full name of your service provider (e.g., "City of Sandston Public Works," etc.) and your account number with them?</p>',
                    '<p>To direct you to the right place, I\'ll need a little more information. Could you please reply with the name of your biller or service provider?</p>',
                ]
            },
            {
                block: 'Closing',
                variants: [ '<p>Once you provide that information, I can help you find their contact details so you can quickly complete your request.</p>' ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Emailed customer to request the name of their service provider and account number.',
                'Sent request for biller information to customer to assist with their inquiry.'
            ]
        }
    },
];