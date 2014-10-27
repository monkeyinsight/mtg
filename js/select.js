var selectMaster = function(el){
	var self = this;
	self.parentOffset;
	self.mouseDownAt;
	self.selectBox;
	self.selectBoxOrigin = {left: 0, top: 0};
	self.selectableElems;
    self.parentDiv = el;

	self.selectBox = document.createElement('div');
	self.selectBox.className = 'drag-to-select';
	self.selectBox.style.display = 'none';
	self.parentDiv.appendChild(self.selectBox);

	el.onmousedown = function(e) {
		self.mouseDown(e, this);
	};
};

selectMaster.prototype = {
	mouseDown: function(e) {
		e = fixEvent(e);
		if (e.which!=1) return;

		this.mouseDownAt = { x: e.pageX, y: e.pageY, el: this.parentDiv };

		this.parentOffset = getOffset(this.parentDiv);
		this.selectBoxOrigin.left = this.mouseDownAt.x - this.parentOffset.left + this.parentDiv.scrollLeft;
		this.selectBoxOrigin.top = this.mouseDownAt.y - this.parentOffset.top + this.parentDiv.scrollLeft;
		this.selectBox.style.left = this.selectBoxOrigin.left;
		this.selectBox.style.top = this.selectBoxOrigin.top;
		this.selectBox.style.display = 'block';

		this.selectableElems = getElementsByClass('card', this.parentDiv);
		for (var i = 0; i < this.selectableElems.length; i++)
			if (this.selectableElems[i].className.match(/selected/))
				this.selectableElems[i].className = this.selectableElems[i].className.replace(/ selected/, '');

		this.addDocumentEventHandlers(this);

		return false;
	},
	mouseMove: function(e){
		e.stopPropagation();
		e = fixEvent(e);

		var left = e.pageX - this.parentOffset.left + this.parentDiv.scrollLeft;
		var top = e.pageY - this.parentOffset.top + this.parentDiv.scrollTop;
		var newLeft = left;
		var newTop = top;
		var newWidth = this.selectBoxOrigin.left - newLeft;
		var newHeight = this.selectBoxOrigin.top - newTop;

		if (left > this.selectBoxOrigin.left) {
			newLeft = this.selectBoxOrigin.left + this.parentDiv.scrollLeft;
			newWidth = left - this.selectBoxOrigin.left - this.parentDiv.scrollLeft;
		}

		if (top > this.selectBoxOrigin.top) {
			newTop = this.selectBoxOrigin.top + this.parentDiv.scrollTop;
			newHeight = top - this.selectBoxOrigin.top - this.parentDiv.scrollTop;
		}

		this.selectBox.style.left = newLeft + 'px';
		this.selectBox.style.top = newTop + 'px';
		this.selectBox.style.width = newWidth + 'px';
		this.selectBox.style.height = newHeight + 'px';

		this.selectElementsInRange();
	},
	mouseUp: function(e){
		e.stopPropagation();

		this.selectBox.style.display = 'none';
		this.selectBox.style.width = '0';
		this.selectBox.style.height = '0';

		this.removeDocumentEventHandlers();
	},
	selectElementsInRange: function() {
		var selectBoxDim = getOffset(this.selectBox);
		selectBoxDim.width = parseInt(this.selectBox.offsetWidth);
		selectBoxDim.height = parseInt(this.selectBox.offsetHeight);
		selectBoxDim.right = selectBoxDim.left + selectBoxDim.width;
		selectBoxDim.bottom = selectBoxDim.top + selectBoxDim.height;

		for (var i = 0; i < this.selectableElems.length; i++) {
			var card = this.selectableElems[i],
				elDim = getOffset(card);

			elDim.width = parseInt(card.offsetWidth);
			elDim.height = parseInt(card.offsetHeight);
			elDim.right = elDim.left + elDim.width;
			elDim.bottom = elDim.top + elDim.height;

			if (
				selectBoxDim.left <= elDim.right && selectBoxDim.right >= elDim.left &&
				(selectBoxDim.top <= elDim.top + 20 && selectBoxDim.bottom >= elDim.top + 2)
				) {
				if (!card.className.match(/selected/))
					card.className += ' selected';
			} else {
				if (card.className.match(/selected/))
					card.className = card.className.replace(/ selected/, '');
			}
		}
	},
	addDocumentEventHandlers: function(obj) {
		document.onmousemove = function(e) {
			obj.mouseMove(e, obj);
		};
		document.onmouseup = function(e) {
			obj.mouseUp(e, obj);
		};
		document.ondragstart = document.body.onselectstart = function() {return false;};
	},
	removeDocumentEventHandlers: function() {
		document.onmousemove = document.onmouseup = document.ondragstart = document.body.onselectstart = null;
	}
}