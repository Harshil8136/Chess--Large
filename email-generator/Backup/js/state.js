// Ensure the global App object exists
window.App = window.App || {};

// The central state object for the entire application.
App.state = {
    quill: null,
    selectedTemplateId: null,
    fieldValues: {},
    userName: 'Guest',
    theme: 'light',
    currentAssembly: null, // NEW: Will hold the currently generated {subject, body, caseComment}
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