// Ensure the global App object exists
window.App = window.App || {};

// The central state object for the entire application.
App.state = {
    quill: null,
    selectedTemplateId: null,
    fieldValues: {},
    userName: 'Guest',
    theme: 'light',
    currentAssembly: null,
};

/**
 * Loads user name and theme from localStorage.
 */
App.loadState = function() {
    const savedName = localStorage.getItem('emailGenProUser');
    if (savedName) App.state.userName = savedName;
    
    const savedTheme = localStorage.getItem('emailGenProTheme');
    if (savedTheme) App.state.theme = savedTheme;
};

/**
 * Saves user name and theme to localStorage.
 */
App.saveState = function() {
    localStorage.setItem('emailGenProUser', App.state.userName);
    localStorage.setItem('emailGenProTheme', App.state.theme);
};

/**
 * Loads the last form data from the current browser session.
 */
App.loadSessionData = function() {
    const savedData = sessionStorage.getItem('emailGenProSession');
    if (savedData) {
        App.state.fieldValues = JSON.parse(savedData);
    }
};

/**
 * Saves the current form data to the browser session.
 */
App.saveSessionData = function() {
    // Also save the selected template ID for persistence on refresh
    App.state.fieldValues.selectedTemplateId = App.state.selectedTemplateId;
    sessionStorage.setItem('emailGenProSession', JSON.stringify(App.state.fieldValues));
};

/**
 * NEW: Exports the current field values to a JSON file.
 */
App.exportSession = function() {
    const dataStr = JSON.stringify(App.state.fieldValues, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `email-gen-session-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * NEW: Imports field values from a selected JSON file.
 */
App.importSession = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const importedData = JSON.parse(event.target.result);
                App.state.fieldValues = importedData;
                App.saveSessionData(); // Save to session storage
                // Full reload to reflect all imported state correctly
                window.location.reload();
            } catch (err) {
                console.error('Failed to parse JSON file:', err);
                alert('Error: Could not import session. The file may be corrupt.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};