// ===================================================================================
//  DEBUG.JS
//  Controls the draggable and resizable debug log console.
// ===================================================================================

function initLogBox() {
    const originalConsole = { log: console.log, error: console.error, warn: console.warn };
    const logToBox = (message, type) => {
        let content = '';
        const timestamp = `<span class="text-gray-500">${new Date().toLocaleTimeString()}:</span>`;
        let logClass = type;
        let prefix = '';
        let body = '';
        if (typeof message === 'object' && message !== null && message.logType) {
            logClass = `log-${message.logType}`;
            prefix = `<span class="log-prefix">[${message.logType.toUpperCase().replace('_', ' ')}]</span>`;
            switch (message.logType) {
                case 'analysis':
                    const info = CLASSIFICATION_DATA[message.classification] || {};
                    let detail = message.deep ? '(Deep)' : '';
                    if (message.hasOwnProperty('evalBefore')) { detail += ` Eval: ${message.evalBefore} → ${message.evalAfter}`; }
                    body = `Move <b>${message.move}</b> | CPL: ${message.cpl.toFixed(0)} | Class: <b class="${info.color || ''}">${message.classification}</b> ${detail}`;
                    break;
                case 'engine_move':
                    body = `Best move: <b>${message.move}</b> | Eval: ${message.eval}`;
                    break;
                case 'info':
                    body = message.text;
                    break;
                default:
                    body = JSON.stringify(message);
            }
            content = `${timestamp} ${prefix} ${body}`;
        } else {
            let formattedMessage = '';
            try { formattedMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message; } catch (e) { formattedMessage = '[[Unserializable Object]]'; }
            content = `${timestamp} ${formattedMessage}`;
        }
        logBoxContent.append(`<div class="log-message ${logClass}">${content}</div>`);
        logBoxContent.scrollTop(logBoxContent[0].scrollHeight);
    };
    console.log = function() { originalConsole.log.apply(console, arguments); logToBox(arguments[0], 'log-info'); };
    console.error = function() { originalConsole.error.apply(console, arguments); logToBox(arguments[0], 'log-error'); };
    console.warn = function() { originalConsole.warn.apply(console, arguments); logToBox(arguments[0], 'log-warn'); };
    logBoxToggle.on('change', function() { logBoxContainer.toggleClass('hidden', !this.checked); if (this.checked) console.log({ logType: 'info', text: 'Debug log opened.' }); });
    logBoxClearBtn.on('click', () => { logBoxContent.empty(); console.log({ logType: 'info', text: 'Log cleared.' }); });
    logBoxCloseBtn.on('click', () => logBoxToggle.prop('checked', false).trigger('change'));
    let isDragging = false, isResizing = false;
    let offset = { x: 0, y: 0 };
    logBoxHeader.on('mousedown', function(e) {
        if ($(e.target).is('button, img')) return;
        isDragging = true;
        let containerOffset = logBoxContainer.offset();
        offset.x = e.clientX - containerOffset.left;
        offset.y = e.clientY - containerOffset.top;
        e.preventDefault();
    });
    logBoxResizeHandle.on('mousedown', function(e) {
        isResizing = true;
        e.preventDefault();
    });
    $(document).on('mousemove', function(e) {
        if (isDragging) { logBoxContainer.css({ top: e.clientY - offset.y, left: e.clientX - offset.x }); }
        if (isResizing) {
            const containerOffset = logBoxContainer.offset();
            const newWidth = e.clientX - containerOffset.left;
            const newHeight = e.clientY - containerOffset.top;
            logBoxContainer.css({ width: `${newWidth}px`, height: `${newHeight}px` });
        }
    }).on('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
}