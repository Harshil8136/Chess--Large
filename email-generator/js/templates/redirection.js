// Ensure the global App object and templateCategories exist
window.App = window.App || {};
App.templateCategories = App.templateCategories || {};

// Define and attach this category's templates
App.templateCategories.redirection = [
    {
        id: 'redirect-to-biller-general',
        name: 'Redirect - General (Refund/Cancel/Acct Change)',
        category: 'Redirection',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Jessica Hill', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06648185', hml_field: '{{{Case.CaseNumber}}}' },
            { key: 'biller_name', label: 'Biller / Service Provider Name', type: 'text', placeholder: 'e.g., Waste Management', hml_field: '{{{Case.Account.Name}}}' },
            { key: 'biller_phone', label: 'Biller\'s Phone Number', type: 'text', placeholder: 'e.g., 866-909-4458', hml_field: '{{{Case.Account.Phone}}}' },
        ],
        subject: {
            variants: [
                'Information Regarding Your {{{Case.Account.Name}}} Account - Case #{{{Case.CaseNumber}}}',
                'Your Inquiry for {{{Case.Account.Name}}} - Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Introduction',
                variants: [ '<p>Thank you for contacting us. My name is {{{Case.Owner.Name}}}, and I\'m assisting with your inquiry for case #{{{Case.CaseNumber}}}.</p>' ]
            },
            {
                block: 'Role Clarification',
                variants: [
                    '<p>As Paymentus is a third-party payment processor for {{{Case.Account.Name}}}, all account management tasks such as refunds, cancellations, or account detail changes must be handled directly by them.</p>',
                    '<p>We process payments on behalf of {{{Case.Account.Name}}}, but for security and privacy, we do not have access to manage your account directly. For assistance with refunds or cancellations, you will need to contact them.</p>',
                ]
            },
            {
                block: 'Call to Action',
                variants: [
                    '<p>Please contact the {{{Case.Account.Name}}} customer service team directly at <strong>{{{Case.Account.Phone}}}</strong>. They will be able to assist you further.</p>'
                ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Advised customer to contact {{{Case.Account.Name}}} at {{{Case.Account.Phone}}} for their request. Clarified Paymentus role as a payment processor.',
                'Redirected customer to their service provider, {{{Case.Account.Name}}}, to handle their inquiry.'
            ]
        }
    },
    {
        id: 'redirect-to-biller-autopay',
        name: 'Redirect - AutoPay / Payment Amount Change',
        category: 'Redirection',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Wanda Mandzuk', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06687861', hml_field: '{{{Case.CaseNumber}}}' },
            { key: 'biller_name', label: 'Biller / Service Provider Name', type: 'text', placeholder: 'e.g., BC Hydro', hml_field: '{{{Case.Account.Name}}}' },
        ],
        subject: {
            variants: [
                'Managing Your {{{Case.Account.Name}}} AutoPay Settings - Case #{{{Case.CaseNumber}}}',
                'Your {{{Case.Account.Name}}} Payment Inquiry - Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hi {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Introduction',
                variants: [ '<p>My name is {{{Case.Owner.Name}}}, following up on your inquiry about changing your monthly payment amounts for {{{Case.Account.Name}}} (Case #{{{Case.CaseNumber}}}).</p>' ]
            },
            {
                block: 'Explanation',
                variants: [
                    '<p>Changes to recurring payment amounts and schedules must be made through the customer portal you have set up. As the payment processor, we do not have access to modify your AutoPay settings directly.</p>',
                ]
            },
            {
                block: 'Instruction',
                variants: [
                    '<p>You can manage your settings by logging into the {{{Case.Account.Name}}} customer portal. Once logged in, look for the "AutoPay" or "Recurring Payments" section to make your desired edits.</p>',
                    '<p>To update your payment details, please log into your account on the {{{Case.Account.Name}}} website. From there, you should find an option for "Scheduled Payments" or "AutoPay" where you can adjust the amounts.</p>',
                ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Advised customer on how to manage their AutoPay settings directly via the {{{Case.Account.Name}}} customer portal.',
                'Redirected customer to the biller\'s online portal to manage their recurring payment details.'
            ]
        }
    },
];