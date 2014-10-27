var dragMaster = (function() {

	var dragObject;
	var mouseDownAt;

	var currentDropTarget,
		movableElements;

	function mouseDown(e) {
		e.stopPropagation();
		e = fixEvent(e);
		if (e.which!=1) return;

		mouseDownAt = { x: e.pageX, y: e.pageY, el: this };

		movableElements = getElementsByClass('selected', this.dragObject.workspace.el);

		if (movableElements && !this.className.match(/selected/) || !movableElements) {
			for (var i = 0; i < movableElements.length; i++)
				movableElements[i].className = movableElements[i].className.replace(/ selected/, '');
			movableElements = null;
			dragObject = this.dragObject;
		}

		addDocumentEventHandlers();

		return false;
	}

	function mouseMove(e){
		e.stopPropagation();
		e = fixEvent(e);

		var newTarget = getCurrentTarget(e)
		
		if (currentDropTarget != newTarget) {
			if (currentDropTarget) {
				currentDropTarget.onLeave();
			}
			if (newTarget) {
				newTarget.onEnter();
			}
			currentDropTarget = newTarget;
		}

		if (mouseDownAt) {
			if (Math.abs(mouseDownAt.x-e.pageX)<5 && Math.abs(mouseDownAt.y-e.pageY)<5)
				return false;

			if (movableElements) {
				var newMovableElements = [];
				for (var i = 0; i < movableElements.length; i++)
					newMovableElements.push(moveElement(movableElements[i]));
				movableElements = newMovableElements;
				mouseDownAt = null;
			} else {
				moveElement(mouseDownAt.el);
				mouseDownAt = null;
			}
		}

		if (movableElements) {
			for (var i = 0; i < movableElements.length; i++)
				movableElements[i].dragObject.onDragMove(e.pageX, e.pageY);
		} else
			dragObject.onDragMove(e.pageX, e.pageY);

		return false;
	}

	function moveElement(el) {
		var mouseOffset = getMouseOffset(el, mouseDownAt.x, mouseDownAt.y);

		return el.dragObject.onDragStart(mouseOffset);
	}
	
	function mouseUp(e){
		e.stopPropagation();
		if (!dragObject && !movableElements) {
			mouseDownAt = null;
		} else {
			if (currentDropTarget) {
				if (movableElements) {
					for (var i = 0; i < movableElements.length; i++) {
						currentDropTarget.accept(movableElements[i].dragObject);
						movableElements[i].dragObject.position.parentDiv = currentDropTarget.el;
						movableElements[i].dragObject.onDragSuccess(currentDropTarget);
					}
				} else {
					currentDropTarget.accept(dragObject);
					dragObject.position.parentDiv = currentDropTarget.el;
					dragObject.onDragSuccess(currentDropTarget);
				}
			} else {
				if (movableElements) {
					for (var i = 0; i < movableElements.length; i++)
						movableElements[i].dragObject.onDragFail();
				} else
					dragObject.onDragFail();
			}

			if (movableElements) {
				for (var i = 0; i < movableElements.length; i++)
					if (movableElements[i].className.match(/selected/))
						movableElements[i].className = movableElements[i].className.replace(/ selected/, '');
			}
		}
		dragObject = null;
		movableElements = null;
		currentDropTarget = null;
		removeDocumentEventHandlers();
	}

	function getMouseOffset(target, x, y) {
		var docPos	= getOffset(target);
		return {x:x - docPos.left, y:y - docPos.top};
	}

	
	function getCurrentTarget(e) {
		if (navigator.userAgent.match('MSIE') || navigator.userAgent.match('Gecko'))
			var x=e.clientX, y=e.clientY;
		else
			var x=e.pageX, y=e.pageY;

		if (movableElements) {
			for (var i = 0; i < movableElements.length; i++)
				movableElements[i].dragObject.hide();
			var el = document.elementFromPoint(x,y);
			for (var i = 0; i < movableElements.length; i++)
				movableElements[i].dragObject.show();
		} else {
			dragObject.hide();
			var el = document.elementFromPoint(x,y);
			dragObject.show();
		}

		while (el) {
			if (el.dropTarget && el.dropTarget.canAccept(dragObject)) {
				el.dropTarget.x = x;
				el.dropTarget.y = y;
				return el.dropTarget;
			}
			el = el.parentNode;
		}
		
		return null;
	}

	function addDocumentEventHandlers() {
		document.onmousemove = mouseMove;
		document.onmouseup = mouseUp;
		document.ondragstart = document.body.onselectstart = function() {return false;};
	}

	function removeDocumentEventHandlers() {
		document.onmousemove = document.onmouseup = document.ondragstart = document.body.onselectstart = null;
	}

	return {
		makeDraggable: function(el){
			el.onmousedown = mouseDown;
		}
	}
}());