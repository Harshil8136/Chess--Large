// ===================================================================================
//  DRAWING.JS
//  Shared functions for drawing arrows and highlights on board overlays.
// ===================================================================================

function drawArrow(from, to, color, svgOverlay, boardInstance, boardElement) {
    if (!svgOverlay || !boardInstance || !boardElement) return;
    const boardWidth = boardElement.width();
    if (!boardWidth || boardWidth === 0) return;
    const squareSize = boardWidth / 8;
    const isFlipped = boardInstance.orientation() === 'black';
    const getCoords = (square) => {
        let col = square.charCodeAt(0) - 'a'.charCodeAt(0);
        let row = parseInt(square.charAt(1)) - 1;
        if (isFlipped) { col = 7 - col; row = 7 - row; }
        return { x: col * squareSize + squareSize / 2, y: (7 - row) * squareSize + squareSize / 2 };
    };
    const fromCoords = getCoords(from);
    const toCoords = getCoords(to);
    const markerId = `arrowhead-${svgOverlay.attr('id')}-${color.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (svgOverlay.find(`#${markerId}`).length === 0) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', markerId);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '5');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '3.5');
        marker.setAttribute('markerHeight', '3.5');
        marker.setAttribute('orient', 'auto-start-reverse');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        path.style.fill = color;
        marker.appendChild(path);
        svgOverlay.append(marker);
    }
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromCoords.x);
    line.setAttribute('y1', fromCoords.y);
    line.setAttribute('x2', toCoords.x);
    line.setAttribute('y2', toCoords.y);
    line.style.stroke = color;
    line.style.strokeWidth = '14px';
    line.setAttribute('marker-end', `url(#${markerId})`);
    svgOverlay.append(line);
}

function redrawUserShapes(boardElement, svgOverlay, boardInstance, shapes) {
    svgOverlay.empty();
    boardElement.find('.square-55d63').removeClass('highlight-user-green highlight-user-red highlight-user-yellow highlight-user-blue');
    if (!boardInstance) return;
    shapes.forEach(shape => {
        if (shape.type === 'highlight') {
            boardElement.find(`.square-${shape.square}`).addClass(`highlight-user-${shape.color}`);
        } else if (shape.type === 'arrow') {
            drawArrow(shape.from, shape.to, shape.color, svgOverlay, boardInstance, boardElement);
        }
    });
}