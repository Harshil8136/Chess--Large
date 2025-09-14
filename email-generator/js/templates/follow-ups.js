// Ensure the global App object and templateCategories exist
window.App = window.App || {};
App.templateCategories = App.templateCategories || {};

// Define and attach this category's templates
App.templateCategories.followUps = [
    {
        id: 'follow-up-48hr-closure',
        name: 'Follow-Up - 48hr Closure Notice',
        category: 'Follow-Ups',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Amelia Wilson', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06649572', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [
                'Following Up on Your Request - Case #{{{Case.CaseNumber}}}',
                'Final Follow-Up Regarding Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Reminder',
                variants: [
                    '<p>I\'m reaching out to follow up on your recent inquiry, case number {{{Case.CaseNumber}}}. To proceed, we are still waiting for the information we previously requested.</p>',
                    '<p>This is a follow-up regarding your case #{{{Case.CaseNumber}}}. We have not yet received the information needed to continue our investigation.</p>'
                ]
            },
            {
                block: 'Closure Notice',
                variants: [
                    '<p>If you no longer need assistance, please let us know. If we don\'t hear from you within the next <strong>48 hours</strong>, we will assume the issue is resolved and close this case.</p>',
                    '<p>Should you still require help, please reply with the requested details. Otherwise, this case will be closed in the next 2 business days due to no response.</p>'
                ]
            },
            {
                block: 'Closing',
                variants: [ '<p>Thank you.</p>' ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Sent follow-up email. Advised case will be closed in 48hrs if no response is received. Case pending customer response.',
                'Notified customer that case will be closed due to inactivity if required information is not provided within 2 business days.'
            ]
        }
    }
];