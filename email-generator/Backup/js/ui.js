// Ensure the global App object exists
window.App = window.App || {};

// Encapsulate UI logic in an IIFE
(function(App) {
    'use strict';

    // Private DOM references for this module
    const dom = {
        body: document.body,
        greetingText: document.getElementById('user-name'),
        editNameBtn: document.getElementById('edit-name-btn'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        templateSelect: document.getElementById('template-select'),
        dynamicFieldsContainer: document.getElementById('dynamic-fields-container'),
        outputTo: document.getElementById('output-to'),
        outputSubject: document.getElementById('output-subject'),
        outputCaseComment: document.getElementById('output-case-comment'),
    };

    const getRandomVariant = (variants) => {
        if (Array.isArray(variants) && variants.length > 0) {
            return variants[Math.floor(Math.random() * variants.length)];
        }
        return '';
    };

    function processTemplateString(templateString = '') {
        const currentTemplate = App.templates.find(c => c.id === App.state.selectedTemplateId);
        if (!currentTemplate) return templateString;

        const allFields = [...(currentTemplate.fields || []), { key: 'agent_name', hml_field: '{{{Case.Owner.Name}}}' }];
        
        const hmlToKeyMap = new Map();
        allFields.forEach(field => {
            if (field.hml_field) { // Check if hml_field exists
                const normalizedHml = field.hml_field.replace(/[{}]/g, '').trim();
                hmlToKeyMap.set(normalizedHml, field.key);
            }
        });

        return templateString.replace(/{{{([\s\w.]+)}}}/g, (match, hmlPath) => {
            const key = hmlToKeyMap.get(hmlPath.trim());
            if (!key) return match;

            const value = App.state.fieldValues[key] || '';
            const content = value.trim() !== '' ? value : match;
            
            return `<span class="highlight highlight-${key}">${content}</span>`;
        });
    }
    
    App.assembleDynamicContent = function(template) {
        if (!template) return null;
        
        const subject = getRandomVariant(template.subject?.variants);
        const caseComment = getRandomVariant(template.caseComment?.variants);
        const bodyBlocks = Array.isArray(template.body) ? template.body : [];
        const body = bodyBlocks.map(block => getRandomVariant(block?.variants)).join('');
        
        return { subject, body, caseComment };
    };

    App.updateAllPlaceholders = function() {
        if (!App.state.currentAssembly) return;

        let { subject, caseComment } = App.state.currentAssembly;
        
        const currentTemplate = App.templates.find(c => c.id === App.state.selectedTemplateId);
        if (!currentTemplate) return;
        
        const allFields = [...(currentTemplate.fields || []), { key: 'agent_name', hml_field: '{{{Case.Owner.Name}}}' }];

        allFields.forEach(field => {
            const key = field.key;
            const placeholder = field.hml_field;
            const value = App.state.fieldValues[key] || '';
            
            // **CRITICAL FIX**: Add a defensive check here. If hml_field is missing from
            // the template data, skip this field to prevent the .replaceAll() crash.
            if (!placeholder) {
                return; 
            }

            const displayValue = value.trim() !== '' ? value : placeholder;
            
            subject = subject.replaceAll(placeholder, displayValue);
            caseComment = caseComment.replaceAll(placeholder, displayValue);

            if (App.state.quill) {
                const elements = App.state.quill.root.querySelectorAll(`.highlight-${key}`);
                elements.forEach(el => {
                    if (el.textContent !== displayValue) {
                        el.textContent = displayValue;
                    }
                });
            }
        });

        dom.outputSubject.value = subject;
        dom.outputCaseComment.value = caseComment;
    };

    App.renderStaticOutputs = function() {
        if (!App.state.currentAssembly) {
            dom.outputSubject.value = '';
            dom.outputCaseComment.value = '';
            return;
        }
        App.updateAllPlaceholders();
    };

    App.renderQuillBody = function() {
        const assembly = App.state.currentAssembly;
        if (!assembly || !App.state.quill) {
            if (App.state.quill) App.state.quill.setText('');
            return;
        }
        
        const finalBody = processTemplateString(assembly.body);
        App.state.quill.clipboard.dangerouslyPasteHTML(finalBody);
    };
    
    App.renderAllOutputs = function() {
        App.state.fieldValues['agent_name'] = App.state.userName;
        App.renderQuillBody();
        App.renderStaticOutputs();
        dom.outputTo.value = App.state.fieldValues['recipient_email'] || '';
    };

    App.populateTemplates = function(templates) {
        dom.templateSelect.innerHTML = '<option value="" disabled selected>Choose a template...</option>';
        const categoryMap = {};
        templates.forEach(t => {
            const category = t.category || 'General';
            if (!categoryMap[category]) categoryMap[category] = [];
            categoryMap[category].push(t);
        });

        Object.keys(categoryMap).sort().forEach(categoryName => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoryName;
            categoryMap[categoryName].forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.name;
                optgroup.appendChild(option);
            });
            dom.templateSelect.appendChild(optgroup);
        });
    };

    App.renderDynamicFields = function(template) {
        dom.dynamicFieldsContainer.innerHTML = '';
        if (!template || !template.fields || template.fields.length === 0) return;

        const group = document.createElement('div');
        group.className = 'control-group field-group animate-fade-in-up';

        template.fields.forEach(field => {
            if (field.hml_field === '{{{Case.Owner.Name}}}') return;

            const fieldHtml = `
                <label for="field-${field.key}">${field.label}</label>
                <input 
                    type="${field.type}" 
                    id="field-${field.key}" 
                    name="${field.key}" 
                    placeholder="${field.placeholder || ''}" 
                    value="${App.state.fieldValues[field.key] || ''}"
                    data-tippy-content="Salesforce Field: ${field.hml_field || 'N/A'}"
                >
            `;
            group.innerHTML += fieldHtml;
        });
        dom.dynamicFieldsContainer.appendChild(group);

        if (window.tippy) {
            tippy(dom.dynamicFieldsContainer.querySelectorAll('[data-tippy-content]'));
        }
    };

    App.updateUserName = function(name) {
        dom.greetingText.textContent = name || 'Guest';
    };



    App.toggleNameEdit = function(isEditing) {
        dom.greetingText.setAttribute('contenteditable', isEditing);
        const icon = dom.editNameBtn.querySelector('i');
        if (isEditing) {
            icon.className = 'fa-solid fa-check';
            dom.greetingText.focus();
            document.execCommand('selectAll', false, null);
        } else {
            icon.className = 'fa-solid fa-pencil';
        }
    };

    App.applyTheme = function(theme) {
        dom.body.classList.toggle('dark-mode', theme === 'dark');
        const icon = dom.themeToggleBtn.querySelector('i');
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    };

})(window.App);