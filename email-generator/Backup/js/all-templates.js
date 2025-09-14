// This is a consolidated file containing all template data.

// Ensure the global App object and templateCategories exist
window.App = window.App || {};
App.templateCategories = App.templateCategories || {};

// --- From biller-comms.js ---
App.templateCategories.billerComms = [
    {
        id: 'acknowledge-biller-request',
        name: 'Biller - Acknowledge Request',
        category: 'Biller Communications',
        fields: [
            { key: 'biller_contact_name', label: 'Biller Contact Name', type: 'text', placeholder: 'e.g., Rickaye Edwards', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06681513', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Re: Your Request - Case #{{{Case.CaseNumber}}}' ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Acknowledgement', variants: [ '<p>Thank you for reaching out. My name is {{{Case.Owner.Name}}}, and I have received your request regarding case #{{{Case.CaseNumber}}}.</p><p>I am looking into this now and will get back to you with an update very soon.</p>', '<p>This email is to confirm I\'ve received your inquiry for case #{{{Case.CaseNumber}}}. I am currently reviewing it and will provide a substantive update shortly.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Acknowledged request from biller contact. Emailed to advise that the case is under review and an update will follow.', 'Sent initial acknowledgement to biller. Case is pending action.' ] }
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
        subject: { variants: [ 'PT - Negative File Removal Request - Case #{{{Case.CaseNumber}}}' ] },
        body: [ { block: 'Main Body', variants: [ '<p>Hi Team,</p><p>Please assist with a removal of the negative file for the following:</p><ul><li>SalesForce Case #: {{{Case.CaseNumber}}}</li><li>Biller TLA: {{{Case.Account.Name}}}</li><li>Processor: {{{Processor_Name__c}}}</li><li>Customer Account #: {{{Case.Account.AccountNumber}}}</li></ul><p>Thank you,</p><p>{{{Case.Owner.Name}}}</p>' ] } ],
        caseComment: { variants: [ 'Submitted internal request to the Negative File team to unblock account {{{Case.Account.AccountNumber}}}.', 'Sent unblocking request for case {{{Case.CaseNumber}}} to the appropriate internal team.' ] }
    }
];

// --- From follow-ups.js ---
App.templateCategories.followUps = [
    {
        id: 'follow-up-48hr-closure',
        name: 'Follow-Up - 48hr Closure Notice',
        category: 'Follow-Ups',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Amelia Wilson', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06649572', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Following Up on Your Request - Case #{{{Case.CaseNumber}}}', 'Final Follow-Up Regarding Case #{{{Case.CaseNumber}}}', ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Reminder', variants: [ '<p>I\'m reaching out to follow up on your recent inquiry, case number {{{Case.CaseNumber}}}. To proceed, we are still waiting for the information we previously requested.</p>', '<p>This is a follow-up regarding your case #{{{Case.CaseNumber}}}. We have not yet received the information needed to continue our investigation.</p>' ] },
            { block: 'Closure Notice', variants: [ '<p>If you no longer need assistance, please let us know. If we don\'t hear from you within the next <strong>48 hours</strong>, we will assume the issue is resolved and close this case.</p>', '<p>Should you still require help, please reply with the requested details. Otherwise, this case will be closed in the next 2 business days due to no response.</p>' ] },
            { block: 'Closing', variants: [ '<p>Thank you.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Sent follow-up email. Advised case will be closed in 48hrs if no response is received. Case pending customer response.', 'Notified customer that case will be closed due to inactivity if required information is not provided within 2 business days.' ] }
    }
];

// --- From info-gathering.js ---
App.templateCategories.infoGathering = [
    {
        id: 'request-general-info',
        name: 'Info - Request General Details',
        category: 'Information Gathering',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Jane Doe', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06653743', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Regarding Your Inquiry - Case #{{{Case.CaseNumber}}}', 'More Information Needed for Your Request - Case #{{{Case.CaseNumber}}}', ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Introduction', variants: [ '<p>Thank you for reaching out to Paymentus. My name is {{{Case.Owner.Name}}}, and I\'ll be assisting you with your request, case number {{{Case.CaseNumber}}}.</p>', ] },
            { block: 'Core Request', variants: [ '<p>To help us investigate, could you please provide a few more details? We will need:</p><ul><li>The name of the company you paid the bill to</li><li>The account number associated with the payment</li><li>The date and amount of the payment in question</li></ul>', '<p>To proceed with your request, please reply with the following information:</p><ul><li>The name of your service provider</li><li>Your account number</li><li>The date and amount of the transaction</li></ul>', ] },
            { block: 'Closing', variants: [ '<p>Once we have these details, we can look into this for you. You can also call us at 1-800-420-1663 to provide this information securely.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Emailed customer to request additional details (biller, account #, amount, date). Case pending customer response.', 'Sent request for information to customer to proceed with their inquiry.' ] }
    },
    {
        id: 'request-biller-info',
        name: 'Info - Request Biller Name',
        category: 'Information Gathering',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Wendy Bangs', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06630485', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Action Required: Your Inquiry - Case #{{{Case.CaseNumber}}}', 'Regarding Your Request - Case #{{{Case.CaseNumber}}}', ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Introduction', variants: [ '<p>Thank you for your message. My name is {{{Case.Owner.Name}}}, and I\'m assisting with your inquiry, case #{{{Case.CaseNumber}}}.</p>' ] },
            { block: 'Core Request', variants: [ '<p>To help you get this resolved, could you please provide the full name of your service provider (e.g., "City of Sandston Public Works," etc.) and your account number with them?</p>', '<p>To direct you to the right place, I\'ll need a little more information. Could you please reply with the name of your biller or service provider?</p>', ] },
            { block: 'Closing', variants: [ '<p>Once you provide that information, I can help you find their contact details so you can quickly complete your request.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Emailed customer to request the name of their service provider and account number.', 'Sent request for biller information to customer to assist with their inquiry.' ] }
    },
];

// --- From redirection.js ---
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
        subject: { variants: [ 'Information Regarding Your {{{Case.Account.Name}}} Account - Case #{{{Case.CaseNumber}}}', 'Your Inquiry for {{{Case.Account.Name}}} - Case #{{{Case.CaseNumber}}}', ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Introduction', variants: [ '<p>Thank you for contacting us. My name is {{{Case.Owner.Name}}}, and I\'m assisting with your inquiry for case #{{{Case.CaseNumber}}}.</p>' ] },
            { block: 'Role Clarification', variants: [ '<p>As Paymentus is a third-party payment processor for {{{Case.Account.Name}}}, all account management tasks such as refunds, cancellations, or account detail changes must be handled directly by them.</p>', '<p>We process payments on behalf of {{{Case.Account.Name}}}, but for security and privacy, we do not have access to manage your account directly. For assistance with refunds or cancellations, you will need to contact them.</p>', ] },
            { block: 'Call to Action', variants: [ '<p>Please contact the {{{Case.Account.Name}}} customer service team directly at <strong>{{{Case.Account.Phone}}}</strong>. They will be able to assist you further.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Advised customer to contact {{{Case.Account.Name}}} at {{{Case.Account.Phone}}} for their request. Clarified Paymentus role as a payment processor.', 'Redirected customer to their service provider, {{{Case.Account.Name}}}, to handle their inquiry.' ] }
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
        subject: { variants: [ 'Managing Your {{{Case.Account.Name}}} AutoPay Settings - Case #{{{Case.CaseNumber}}}', 'Your {{{Case.Account.Name}}} Payment Inquiry - Case #{{{Case.CaseNumber}}}', ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hi {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Introduction', variants: [ '<p>My name is {{{Case.Owner.Name}}}, following up on your inquiry about changing your monthly payment amounts for {{{Case.Account.Name}}} (Case #{{{Case.CaseNumber}}}).</p>' ] },
            { block: 'Explanation', variants: [ '<p>Changes to recurring payment amounts and schedules must be made through the customer portal you have set up. As the payment processor, we do not have access to modify your AutoPay settings directly.</p>', ] },
            { block: 'Instruction', variants: [ '<p>You can manage your settings by logging into the {{{Case.Account.Name}}} customer portal. Once logged in, look for the "AutoPay" or "Recurring Payments" section to make your desired edits.</p>', '<p>To update your payment details, please log into your account on the {{{Case.Account.Name}}} website. From there, you should find an option for "Scheduled Payments" or "AutoPay" where you can adjust the amounts.</p>', ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Advised customer on how to manage their AutoPay settings directly via the {{{Case.Account.Name}}} customer portal.', 'Redirected customer to the biller\'s online portal to manage their recurring payment details.' ] }
    },
];

// --- From status-updates.js ---
App.templateCategories.statusUpdates = [
    {
        id: 'password-reset-complete',
        name: 'Status - Password Reset Complete',
        category: 'Status Updates',
        fields: [
            { key: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'e.g., Maria Villagrana', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06645585', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Your Password Has Been Reset - Case #{{{Case.CaseNumber}}}', 'Confirmation of Your Password Reset - Case #{{{Case.CaseNumber}}}', ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>', '<p>Hi {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Confirmation', variants: [ '<p>I hope this message finds you well. I would like to inform you that the password for your account has been successfully reset.</p><p>I have sent you a separate email containing the temporary credentials. Please note, this password will expire in 24 hours.</p>', '<p>This email is to confirm that your account password has been reset. A second email with a temporary password has been sent to your registered address and will expire in 24 hours.</p>', ] },
            { block: 'Closing', variants: [ '<p>If you encounter any challenges, please feel free to call us at 1-800-420-1663 for assistance.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Processed password reset and sent confirmation email. Advised customer of separate email with temporary credentials.', 'Completed password reset. Notified customer to check for temporary password email.' ] }
    },
    {
        id: 'neg-file-removal-initiated',
        name: 'Status - Negative File Removal Initiated',
        category: 'Status Updates',
        fields: [
            { key: 'biller_contact_name', label: 'Biller Contact Name', type: 'text', placeholder: 'e.g., Lisa Jacobson', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06586450', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Update on Your Request - Case #{{{Case.CaseNumber}}}', 'Regarding Your Negative File Request - Case #{{{Case.CaseNumber}}}' ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Introduction', variants: [ '<p>Thank you for your patience. My name is {{{Case.Owner.Name}}}, and I\'m providing an update on your request for case #{{{Case.CaseNumber}}}.</p>' ] },
            { block: 'Action & Timeline', variants: [ '<p>We have submitted the request to our payment processor to remove the account from the Negative File. Please note that this process typically takes <strong>3 to 5 business days</strong> to complete.</p>', '<p>The request to unblock the account has been sent to our payment processor. The standard turnaround time for this is 3 to 5 business days.</p>' ] },
            { block: 'Closing', variants: [ '<p>I will reach out to you as soon as I have confirmation that the process is complete.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Submitted negative file removal request to processor. Advised biller of 3-5 business day timeline.', 'Informed biller that unblocking request is in progress with a 3-5 day ETA.' ] }
    },
    {
        id: 'neg-file-removal-complete',
        name: 'Status - Negative File Removal Complete',
        category: 'Status Updates',
        fields: [
            { key: 'biller_contact_name', label: 'Biller Contact Name', type: 'text', placeholder: 'e.g., Tange Cox', hml_field: '{{{Case.Contact.Name}}}' },
            { key: 'case_number', label: 'Case Number', type: 'text', placeholder: 'e.g., 06617596', hml_field: '{{{Case.CaseNumber}}}' },
        ],
        subject: { variants: [ 'Update: Account Unblocked - Case #{{{Case.CaseNumber}}}', 'Action Complete: Negative File Removed - Case #{{{Case.CaseNumber}}}' ] },
        body: [
            { block: 'Greeting', variants: [ '<p>Hello {{{Case.Contact.Name}}},</p>', '<p>Hi {{{Case.Contact.Name}}},</p>' ] },
            { block: 'Confirmation', variants: [ '<p>Great news! This is a follow-up to let you know that the requested account has been successfully removed from the Negative File.</p>', '<p>I\'m happy to inform you that the block on the account for case #{{{Case.CaseNumber}}} has been removed.</p>' ] },
            { block: 'Next Step', variants: [ '<p>The customer can now proceed with making a payment. Please advise them to wait <strong>24 hours</strong> before attempting the payment to ensure the system is fully updated.</p>', ] },
            { block: 'Closing', variants: [ '<p>If you have any further questions, please let me know.</p>' ] },
            { block: 'Signature', variants: [ '<hr><div class="signature-placeholder"><i class="fa-solid fa-paste"></i>&nbsp; Paste formatted signature here</div>' ] }
        ],
        caseComment: { variants: [ 'Confirmed with biller that negative file block was removed. Advised of 24hr wait period before customer payment.', 'Emailed biller to notify that account has been unblocked. Advised 24hr wait time.' ] }
    }
];