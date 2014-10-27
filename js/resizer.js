function resizeWorkspace(el) {
	var content = getElementsByClass("content", el)[0],
		panel = getElementsByClass("panel", el)[0],
		resizer = getElementsByClass("resizer", el)[0];

	content.style.height = el.offsetHeight - (panel?panel.offsetHeight:0) - (resizer?resizer.offsetHeight:0);
}

window.onresize = function() {
	for (var i = 0; i < Workspaces.length; i++)
		resizeWorkspace(Workspaces[i].target);
}

var resizeMaster = function(workspace) {
	var mouseDownAt;
	var rememberPosition;
	var mouseOffset;
	var resizer = getElementsByClass("resizer", workspace.target)[0];
	var next = document.getElementById(resizer.getAttribute('next'));
	var sum;

	resizer.onmousedown = mouseDown;

	function mouseDown(e) {
		e = fixEvent(e);
		if (e.which!=1) return;

		mouseDownAt = { x: e.pageX, y: e.pageY };

		sum = parseFloat(getMatchedStyle(workspace.target, 'height')) + parseFloat(getMatchedStyle(next, 'height'));

		addDocumentEventHandlers();

		return false;
	}

	function mouseMove(e){
		e = fixEvent(e);

		if (mouseDownAt) {
			if (Math.abs(mouseDownAt.x-e.pageX)<5 && Math.abs(mouseDownAt.y-e.pageY)<5)
				return false;

			mouseOffset = getMouseOffset(resizer, mouseDownAt.x, mouseDownAt.y);

			mouseDownAt = null;
		}

		var offset = getOffset(workspace.target);
		var newH = (e.pageY - mouseOffset.y - offset.top) / document.body.offsetHeight * 100;

		if (newH > 5 && newH < sum - 5) {
			workspace.target.style.height = newH + "%";
			resizeWorkspace(workspace.target);

			next.style.height = sum - newH + '%';
			resizeWorkspace(next);
		}
	}

	function mouseUp() {
		removeDocumentEventHandlers();
	}

	function getMouseOffset(target, x, y) {
		var docPos	= getOffset(target);
		return {x:x - docPos.left, y:y - docPos.top};
	}

	function addDocumentEventHandlers() {
		document.onmousemove = mouseMove;
		document.onmouseup = mouseUp;
		document.ondragstart = document.body.onselectstart = function() {return false;};
	}

	function removeDocumentEventHandlers() {
		document.onmousemove = document.onmouseup = document.ondragstart = document.body.onselectstart = null;
	}
};