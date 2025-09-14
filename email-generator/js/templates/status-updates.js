// Ensure the global App object and templateCategories exist
window.App = window.App || {};
App.templateCategories = App.templateCategories || {};

// Define and attach this category's templates
App.templateCategories.statusUpdates = [
    {
        id: 'password-reset-complete',
        name: 'Status - Password Reset Complete',
        category: 'Status Updates',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Maria Villagrana', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06645585', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [
                'Your Password Has Been Reset - Case #{{{Case.CaseNumber}}}',
                'Confirmation of Your Password Reset - Case #{{{Case.CaseNumber}}}',
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>', '<p>Hi {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Confirmation',
                variants: [
                    '<p>I hope this message finds you well. I would like to inform you that the password for your account has been successfully reset.</p><p>I have sent you a separate email containing the temporary credentials. Please note, this password will expire in 24 hours.</p>',
                    '<p>This email is to confirm that your account password has been reset. A second email with a temporary password has been sent to your registered address and will expire in 24 hours.</p>',
                ]
            },
            {
                block: 'Closing',
                variants: [ '<p>If you encounter any challenges, please feel free to call us at 1-800-420-1663 for assistance.</p>' ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Processed password reset and sent confirmation email. Advised customer of separate email with temporary credentials.',
                'Completed password reset. Notified customer to check for temporary password email.'
            ]
        }
    },
    {
        id: 'neg-file-removal-initiated',
        name: 'Status - Negative File Removal Initiated',
        category: 'Status Updates',
        fields: [
            { key: 'biller_contact_name', label: 'Biller Contact Name', type: 'text', placeholder: 'e.g., Lisa Jacobson', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06586450', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [ 'Update on Your Request - Case #{{{Case.CaseNumber}}}', 'Regarding Your Negative File Request - Case #{{{Case.CaseNumber}}}' ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Introduction',
                variants: [ '<p>Thank you for your patience. My name is {{{Case.Owner.Name}}}, and I\'m providing an update on your request for case #{{{Case.CaseNumber}}}.</p>' ]
            },
            {
                block: 'Action & Timeline',
                variants: [
                    '<p>We have submitted the request to our payment processor to remove the account from the Negative File. Please note that this process typically takes <strong>3 to 5 business days</strong> to complete.</p>',
                    '<p>The request to unblock the account has been sent to our payment processor. The standard turnaround time for this is 3 to 5 business days.</p>'
                ]
            },
            {
                block: 'Closing',
                variants: [ '<p>I will reach out to you as soon as I have confirmation that the process is complete.</p>' ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Submitted negative file removal request to processor. Advised biller of 3-5 business day timeline.',
                'Informed biller that unblocking request is in progress with a 3-5 day ETA.'
            ]
        }
    },
    {
        id: 'neg-file-removal-complete',
        name: 'Status - Negative File Removal Complete',
        category: 'Status Updates',
        fields: [
            { key: 'biller_contact_name', label: 'Biller Contact Name', type: 'text', placeholder: 'e.g., Tange Cox', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06617596', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: {
            variants: [
                'Update: Account Unblocked - Case #{{{Case.CaseNumber}}}',
                'Action Complete: Negative File Removed - Case #{{{Case.CaseNumber}}}'
            ]
        },
        body: [
            {
                block: 'Greeting',
                variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>', '<p>Hi {{{Case.Contact.Name}}},</p>' ]
            },
            {
                block: 'Confirmation',
                variants: [
                    '<p>Great news! This is a follow-up to let you know that the requested account has been successfully removed from the Negative File.</p>',
                    '<p>I\'m happy to inform you that the block on the account for case #{{{Case.CaseNumber}}} has been removed.</p>'
                ]
            },
            {
                block: 'Next Step',
                variants: [
                    '<p>The customer can now proceed with making a payment. Please advise them to wait <strong>24 hours</strong> before attempting the payment to ensure the system is fully updated.</p>',
                ]
            },
            {
                block: 'Closing',
                variants: [ '<p>If you have any further questions, please let me know.</p>' ]
            },
            {
                block: 'Signature',
                variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ]
            }
        ],
        caseComment: {
            variants: [
                'Confirmed with biller that negative file block was removed. Advised of 24hr wait period before customer payment.',
                'Emailed biller to notify that account has been unblocked. Advised 24hr wait time.'
            ]
        }
    }
];