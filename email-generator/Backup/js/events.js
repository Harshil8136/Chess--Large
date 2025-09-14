// Ensure the global App object exists
window.App = window.App || {};

// Encapsulate event logic in an IIFE
(function(App) {
    'use strict';

    let isNameEditing = false;
    let templates = [];

    // --- Handler Functions ---
    /**
     * Handles template selection. This triggers a full, top-to-bottom render.
     */
    function handleTemplateChange(e) {
        App.state.selectedTemplateId = e.target.value;
        const preservedValues = {
            recipient_email: App.state.fieldValues.recipient_email,
        };
        App.state.fieldValues = preservedValues;
        
        const template = templates.find(c => c.id === App.state.selectedTemplateId);
        if (template) {
            App.state.currentAssembly = App.assembleDynamicContent(template);
            App.renderDynamicFields(template);
            App.renderAllOutputs();
        } else {
            App.state.currentAssembly = null;
            App.renderDynamicFields(null);
            App.renderAllOutputs();
        }
        App.saveSessionData();
    }

    /**
     * SIMPLIFIED: Handles real-time input. Now makes a single call to the unified
     * update function for maximum efficiency and reliability.
     */
    function handleInput(e) {
        if (e.target.name) {
            App.state.fieldValues[e.target.name] = e.target.value;
            
            // Call the single, unified function to update all outputs instantly.
            App.updateAllPlaceholders();
            
            App.saveSessionData();
        }
    }

    async function handleCopyClick(e) {
        const button = e.target.closest('.copy-btn');
        if (!button) return;
        const targetId = button.dataset.target;
        let success = false;
        try {
            if (targetId === 'output-body-editor') {
                const htmlContent = App.state.quill.root.innerHTML;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
                success = true;
            } else {
                const targetElement = document.getElementById(targetId);
                if (targetElement && targetElement.value) {
                    await navigator.clipboard.writeText(targetElement.value);
                    success = true;
                }
            }
            if (success && window.tippy) {
                const instance = tippy(button, {
                    content: 'Copied!', trigger: 'manual', theme: 'success',
                    onHidden: (inst) => inst.destroy(),
                });
                instance.show();
                setTimeout(() => instance.hide(), 1500);
            }
        } catch (err) { console.error('Failed to copy:', err); }
    }

    function handleNameEdit() {
        isNameEditing = !isNameEditing;
        App.toggleNameEdit(isNameEditing);
        if (!isNameEditing) {
            const newName = document.getElementById('user-name').textContent.trim();
            App.state.userName = newName || 'Guest';
            App.updateUserName(App.state.userName);
            App.state.fieldValues['agent_name'] = App.state.userName;
            App.saveState();

            // Call the single, unified function to update the new name everywhere.
            App.updateAllPlaceholders();
        }
    }

    function handleThemeToggle() {
        App.state.theme = App.state.theme === 'light' ? 'dark' : 'light';
        App.applyTheme(App.state.theme);
        App.saveState();
    }

    // --- Public Setup Function ---
    App.setupEventListeners = function(templateData) {
        templates = templateData;
        const controlsPanel = document.getElementById('controls-panel');
        const editorPanel = document.getElementById('editor-panel');
        const contextPanel = document.getElementById('context-panel');
        const shuffleBtn = document.getElementById('shuffle-btn');
        const templateSelect = document.getElementById('template-select');
        const editNameBtn = document.getElementById('edit-name-btn');
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const userNameSpan = document.getElementById('user-name');

        templateSelect.addEventListener('change', handleTemplateChange);
        controlsPanel.addEventListener('input', handleInput);
        
        editorPanel.addEventListener('click', handleCopyClick);
        contextPanel.addEventListener('click', handleCopyClick);

        editNameBtn.addEventListener('click', handleNameEdit);
        themeToggleBtn.addEventListener('click', handleThemeToggle);
        
        shuffleBtn.addEventListener('click', () => {
            const template = templates.find(c => c.id === App.state.selectedTemplateId);
            if (template) {
                App.state.currentAssembly = App.assembleDynamicContent(template);
                App.renderAllOutputs();
            }
        });

        userNameSpan.addEventListener('blur', () => { if (isNameEditing) handleNameEdit(); });
        userNameSpan.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleNameEdit(); }});
    };

})(window.App);