// Ensure the global App object exists
window.App = window.App || {};

// Encapsulate event logic in an IIFE
(function(App) {
    'use strict';

    let isNameEditing = false;
    let templates = [];

    // --- Handler Functions ---
    /**
     * Handles template selection. Triggers a full render and immediately hydrates the new chips.
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
            App.renderAllOutputs(); // This renders the body with chips and then hydrates them
        } else {
            App.state.currentAssembly = null;
            App.renderDynamicFields(null);
            App.renderAllOutputs();
        }
        App.saveSessionData();
    }

    /**
     * Handles real-time input by calling the unified placeholder update function.
     */
    function handleInput(e) {
        if (e.target.name) {
            App.state.fieldValues[e.target.name] = e.target.value;
            App.updateAllPlaceholders();
            App.saveSessionData();
        }
    }

    /**
     * Handles all copy button clicks with a safer fallback for the email body.
     */
    async function handleCopyClick(e) {
        const button = e.target.closest('.copy-btn');
        if (!button) return;
        const targetId = button.dataset.target;
        let success = false;

        try {
            if (targetId === 'output-body-editor') {
                const htmlContent = App.state.quill.root.innerHTML;
                try {
                    // Modern approach: Copy rich text (HTML)
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
                    success = true;
                } catch (err) {
                    // Fallback: If rich text fails, copy plain text
                    console.warn('Rich text copy failed, falling back to plain text.', err);
                    const textContent = App.state.quill.root.textContent;
                    await navigator.clipboard.writeText(textContent);
                    success = true;
                }
            } else {
                // For simple text fields (Subject, Case Comment, etc.)
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
        } catch (err) { console.error('Failed to copy content:', err); }
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
                App.renderAllOutputs(); // Renders new variation and hydrates chips with current values
            }
        });

        userNameSpan.addEventListener('blur', () => { if (isNameEditing) handleNameEdit(); });
        userNameSpan.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleNameEdit(); }});
    };

})(window.App);