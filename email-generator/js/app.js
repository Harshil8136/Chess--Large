// This single app.js file contains the logic from state.js, ui.js, events.js, and main.js.
// It uses a global `App` object to communicate, avoiding modern module issues.
// It assumes the split template files (e.g., js/templates/info-gathering.js) are loaded before this script.
(function() {
    'use strict';

    // --- Global App Namespace ---
    window.App = window.App || {};
    App.templates = App.templates || []; // This will be populated by the split template files

    // --- State Logic ---
    App.state = {
        quill: null,
        selectedTemplateId: null,
        fieldValues: {},
        userName: 'Guest',
        theme: 'light',
    };
    App.loadState = function() { /* Omitted for brevity, already provided */ };
    App.saveState = function() { /* Omitted for brevity, already provided */ };
    App.loadSessionData = function() { /* Omitted for brevity, already provided */ };
    App.saveSessionData = function() { /* Omitted for brevity, already provided */ };
    
    // --- UI Logic ---
    const dom = { /* Omitted for brevity, already provided */ };
    
    // NEW: Debounce function to fix cursor jumping
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // MODIFIED: processTemplateString now adds highlight spans
    function processTemplateString(templateString = '') {
        return templateString.replace(/{{(\w+)}}/g, (match, key) => {
            const value = App.state.fieldValues[key] || `[${key}]`;
            // Only highlight if it's a known key and not the placeholder text
            const highlightKeys = ['case_number', 'customer_name', 'account_number', 'biller_name', 'phone_number', 'confirmation_number', 'date', 'amount', 'agent_name'];
            if (highlightKeys.includes(key) && value !== `[${key}]`) {
                return `<span class="highlight highlight-${key}">${value}</span>`;
            }
            return value;
        });
    }

    function assembleDynamicContent(template) { /* Omitted for brevity, already provided */ }

    App.renderOutputs = function() {
        const template = App.templates.find(c => c.id === App.state.selectedTemplateId);
        if (!template) return;
        
        App.state.fieldValues['agent_name'] = App.state.userName;
        dom.outputTo.value = App.state.fieldValues['recipient_email'] || '';

        const assembled = assembleDynamicContent(template);
        dom.outputSubject.value = processTemplateString(assembled.subject);
        dom.outputCaseComment.value = processTemplateString(assembled.caseComment);
        
        const finalBody = processTemplateString(assembled.body);
        if (App.state.quill) {
            // Check current content to avoid unnecessary re-renders that steal focus
            const currentContent = App.state.quill.root.innerHTML;
            if(currentContent !== finalBody) {
                App.state.quill.clipboard.dangerouslyPasteHTML(finalBody);
            }
        }
    };
    // Create a debounced version of the render function
    const debouncedRender = debounce(App.renderOutputs, 300);

    App.populateTemplates = function(templates) { /* Omitted for brevity, already provided */ };
    App.renderDynamicFields = function(template) { /* Omitted for brevity, already provided */ };
    App.updateUserName = function(name) { /* Omitted for brevity, already provided */ };
    App.toggleNameEdit = function(isEditing) { /* Omitted for brevity, already provided */ };
    App.applyTheme = function(theme) { /* Omitted for brevity, already provided */ };

    // --- Events Logic ---
    let isNameEditing = false;
    function handleInput(e) {
        if (e.target.name) {
            App.state.fieldValues[e.target.name] = e.target.value;
            if(e.target.name === 'recipient_email') {
                dom.outputTo.value = e.target.value;
            }
            // Use the debounced function here to prevent cursor jumping
            debouncedRender();
            App.saveSessionData();
        }
    }
    // ... other handlers (handleTemplateChange, handleCopyClick, etc.) remain largely the same
    
    App.setupEventListeners = function(templateData) { /* Omitted for brevity, but uses the modified handleInput */ };

    // --- Main Logic ---
    function init() {
        // This combines all templates loaded from separate files into one array
        App.templates = [].concat(...Object.values(App.templateCategories || {}));
        
        App.loadState();
        App.loadSessionData();
        // ... rest of init function is the same
        App.populateTemplates(App.templates);
        // ... etc.
    }

    document.addEventListener('DOMContentLoaded', init);

    // Full function code omitted for brevity as the key changes are highlighted above.
    // The actual file would contain the full, working functions from the previous classic script version.
})();