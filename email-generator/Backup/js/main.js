// Ensure the global App object exists
window.App = window.App || {};

// Encapsulate the main execution logic in an IIFE
(function(App) {
    'use strict';

    // Main initialization function
    function init() {
        // 1. Combine all template categories from separate files into one master array
        App.templates = [].concat(...Object.values(App.templateCategories || {}));
        
        // 2. Load data from browser storage
        App.loadState();
        App.loadSessionData();

        // 3. Initialize external libraries
        App.state.quill = new Quill('#output-body-editor', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}], ['link', 'clean']] },
            placeholder: 'Generated email body will appear here...'
        });
        
        if (window.tippy) {
            tippy('[data-tiy-content]');
        }

        // 4. Apply initial settings and populate UI
        App.applyTheme(App.state.theme);
        App.populateTemplates(App.templates);
        App.updateUserName(App.state.userName);
        
        // 5. Restore UI state from the last session
        document.getElementById('recipient-email').value = App.state.fieldValues.recipient_email || '';
        if (App.state.fieldValues.selectedTemplateId) {
            App.state.selectedTemplateId = App.state.fieldValues.selectedTemplateId;
            document.getElementById('template-select').value = App.state.selectedTemplateId;
            
            const template = App.templates.find(c => c.id === App.state.selectedTemplateId);

            if (template) {
                App.renderDynamicFields(template);
                App.renderAllOutputs();
            }
        }

        // 6. Set up all event listeners
        App.setupEventListeners(App.templates);
        
        // 7. Trigger entry animation
        document.getElementById('context-panel').classList.add('stagger-children');
    }
    
    // Start the application once the DOM is ready
    document.addEventListener('DOMContentLoaded', init);

})(window.App);