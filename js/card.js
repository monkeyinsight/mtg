var Card = function(options, workspace, gridId) {
	console.log(options);
	if (options && workspace) {
		for (var i in options)
			this[i] = options[i];

		var card = document.createElement("div");
		if (options.colors) {
			this.color = (options.colors.length > 1 ? 'gold' : (options.colors[0] ? options.colors[0].toLowerCase() : ''));
			card.className = 'card ' + this.color;
		}

		var title = document.createElement("div");
		title.className = 'title';
		title.innerHTML = options.name;
		if (options.manaCost) {
			var manacost = document.createElement("span")
			manacost.className = 'manacost';
			manacost.innerHTML = options.manaCost.replace(/{(.+?)}/g, '<img height="10" src="img/$1.png">').toLowerCase();
			title.appendChild(manacost);
		}
		card.appendChild(title);

		var image = document.createElement("div");
		image.className = 'image';
		image.style.backgroundImage = "url(\"img/" + options.set + "/" + options.name + ".jpg\")";
		card.appendChild(image);

		var type = document.createElement("div");
		type.className = 'type';
		type.innerHTML = options.type||'';
		card.appendChild(type);

		var description = document.createElement("div");
		description.className = 'description';
		description.innerHTML = options.text||'';
		card.appendChild(description);

		if (options.power) {
			var power = document.createElement("div");
			power.className = 'power';
			power.innerHTML = options.power + '/' + options.toughness;
			card.appendChild(power);
		}

		workspace.append(card, this, gridId);
		this.workspace = workspace;
		this.el = card;

		var self = this;
		if (this.workspace.library) {	
			this.el.ondblclick = function() {
				self.addToDeck();
			};
		} else if (this.workspace.deck || this.workspace.sideboard) {
			this.el.ondblclick = function() {
				self.removeFromDeck();
			};
		}
	}

	this.options = options;
	this.rememberPosition = [];
	this.mouseOffset = [];
	this.el.dragObject = this;
	this.el.dragObject.column = 0;
	this.position = {
		top: 5,
		left: 5,
		zIndex: 0,
		parentDiv: this.el.parentNode
	};

	dragMaster.makeDraggable(this.el);

	return this;
};

Card.prototype = {
	onDragStart: function(offset) {
		var s = this.position;
		this.rememberPosition = {top: s.top, position: this.el.style.position, left: s.left, zIndex: s.zIndex, parentDiv: this.workspace.el, column: this.column, el: this.el};

		if (this.workspace.library)
			this.el = this.clone = this.el.cloneNode(true);

		this.el.style.position = 'absolute';
		this.el.style.zIndex = 1000;

		document.body.appendChild(this.el);
		
		this.mouseOffset = offset;

		return this.el;
	},
	onDragMove: function(x, y) {
		this.el.style.top =  y - this.mouseOffset.y +'px';
		this.el.style.left = x - this.mouseOffset.x +'px';
	},
	onDragSuccess: function(dropTarget) {
		if (dropTarget.grid) {
			var oldColumn = this.rememberPosition.column;

			if (this.rememberPosition.parentDiv.dropTarget)
				this.rememberPosition.parentDiv.dropTarget.remove(oldColumn, this);

			if (this.workspace.library) {
				this.onDragFail();

				var column = dropTarget.x > dropTarget.columnWidth ? Math.floor(dropTarget.x / dropTarget.columnWidth) : 0,
					card = new Card(this.options, dropTarget, column);

				card.position.left = column * dropTarget.columnWidth + 5;

				dropTarget.restack([column]);
				this.el = this.rememberPosition.el;
			} else {
				if (dropTarget.library) {
					this.removeFromDeck();
				} else {
					this.position.parentDiv.appendChild(this.el);
					this.workspace = dropTarget;

					var column = dropTarget.x > this.workspace.columnWidth ? Math.floor(dropTarget.x / this.workspace.columnWidth) : 0;
					this.column = column;
					this.position.left = column * this.workspace.columnWidth + 5;
					this.position.zIndex = 0;

					dropTarget.append(false, this, column);

					if (this.rememberPosition.parentDiv == this.position.parentDiv)
						dropTarget.restack(oldColumn != column ? [oldColumn, column] : [column]);
					else {
						this.rememberPosition.parentDiv.dropTarget.restack([oldColumn]);
						this.position.parentDiv.dropTarget.restack([column]);
					}
				}
			}
		}
	},
	onDragFail: function() {
		if (this.position.parentDiv && !this.workspace.library)
			this.position.parentDiv.appendChild(this.el);
		if (this.clone)
			this.clone.parentElement.removeChild(this.clone);
		var s = this.el.style;
		this.position.top = this.rememberPosition.top;
		this.position.left = this.rememberPosition.left;
		this.position.zIndex = this.rememberPosition.zIndex;
		this.position.parentDiv = this.rememberPosition.parentDiv;
		s.top = this.rememberPosition.top + 'px';
		s.left = this.rememberPosition.left + 'px';
		s.zIndex = this.rememberPosition.zIndex;
		s.position = this.rememberPosition.position;
	},
	reposition: function() {
		this.position.parentDiv.appendChild(this.el);
		if (!this.workspace.library) {
			this.position.left = this.column * this.workspace.columnWidth + 5;
			this.position.zIndex = 0;
			var s = this.el.style;
			s.top = this.position.top;
			s.left = this.position.left;
			s.zIndex = this.position.zIndex;
		}
	},
	hide: function() {
		this.el.style.display = 'none';
	},
	show: function() {
		this.el.style.display = '';
	},
	addToDeck: function() {
		for (var i = 0; i < Workspaces.length; i++) {
			if (Workspaces[i].deck) {
				var card = new Card(this.options, Workspaces[i], 0);

				card.position.left = 5;

				Workspaces[i].restack([0]);
			}
		}
	},
	removeFromDeck: function() {
		if (this.workspace)
			this.workspace.remove(this.column, this);

		this.workspace.restack([this.column]);
		this.el.parentElement.removeChild(this.el);
		delete this;
	}
};