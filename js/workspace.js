var paddingTop = 17,
	Workspaces = [];

function checkStack(card, Cards) {
	for (var i = 0; i < Cards.length; i++) {
		var cur = Cards[i];
		if (card != cur) {
			if (parseInt(card.position.top) > parseInt(cur.position.top) - paddingTop && parseInt(card.position.top) < parseInt(cur.position.top) + paddingTop) {
				card.position.top = parseInt(cur.position.top) + paddingTop;
				card.position.zIndex = cur.position.zIndex + 1;
				checkStack(card, Cards);
			}
		}
	}
}

function firstToLast(array) {
	if (array[0]) {
		array[0].position.zIndex = 0;
		array.push(array[0]);
		array.splice(0,1);
	}
	return array;
}

function Workspace(options) {
	if (options.grid)
		this.grid = {0:[]};

	this.target = options.target;
	this.el = getElementsByClass("content", options.target)[0];
	this.el.dropTarget = this;
	this.count = 0;
	Workspaces.push(this);

	if (options.library) {
		this.library = true;
		new Library(this);
	}
	if (options.deck)
		this.deck = true;

	var panel = getElementsByClass("panel", options.target)[0];
	if (panel) {
		var resizer = getElementsByClass("resizer", options.target)[0];
		if (resizer)
			resizeMaster(this);

		resizeWorkspace(this.target);
		var target = this.target;

		var counter = getElementsByClass("counter", panel)[0];
		if (counter)
			this.counter = counter;
	}
	
	this.columnWidth = 132;
	this.grid = {0:[]};

	if (options.selectable) {
		this.select = new selectMaster(this.el);
	}

	if (options.additionalTop) {
		this.additionalTop = options.additionalTop;
	}
}

Workspace.prototype = {
	append: function(el, card, gridId) {
		if (gridId) {
			if (!this.grid[gridId])
				this.grid[gridId] = [];
			this.grid[gridId].push(card);
		} else
			this.grid[0].push(card);

		if (el)
			this.el.appendChild(el);

		this.count++;
		if (this.counter)
			this.counter.innerHTML = this.count;
	},
	remove: function(oldColumn, card) {
		if (this.grid[oldColumn]) {
			for (var i = 0; i < this.grid[oldColumn].length; i++) {
				if (this.grid[oldColumn][i] == card) {
					this.grid[oldColumn].splice(i, 1);
					this.count--;
					if (this.counter)
						this.counter.innerHTML = this.count;
				}
			}
		}
	},
	canAccept: function(dragObject) {
		return true;
	},
	accept: function(dragObject) {
		this.onLeave();
	},
	onLeave: function() {},
	onEnter: function() {},
	restack: function(columns) {
		if (columns && !this.library) {
			for (var i in columns) {
				var c = columns[i],
					Cards = this.grid[c].slice(0);

				firstToLast(Cards);
				for (var j = 0; j < Cards.length; j++)
					Cards[j].position.top = 5 + (this.additionalTop || 0);
				for (var j = 0; j < Cards.length; j++) {
					var card = Cards[j];
					checkStack(card, Cards);
					card.el.style.left = card.position.left + 'px';
					card.el.style.top = card.position.top + 'px';
					card.el.style.zIndex = card.position.zIndex;
				}
			}
		}
	},
	orderBy: function(by) {
		var Cards = [];

		for (var i in this.grid) {
			for (var j = 0; j < this.grid[i].length; j++) {
				Cards.push(this.grid[i][j]);
			}
			this.grid[i] = [];
		}

		Cards.sort(dynamicSort('name'));
		Cards.sort(dynamicSort(by));
		var cur,
			c = -1,
			grids = [];
		for (var i = 0; i < Cards.length; i++) {
			var card = Cards[i];
			if (card[by] != cur) {
				cur = card[by];
				c++;
				grids.push(c);
			}
			card.column = c;
			card.reposition();
			if (!this.grid[c])
				this.grid[c] = [];
			this.grid[c].push(card);
		}
		this.restack(grids);
	},
	getDim: function() {
		var dim = getOffset(this.el);
		dim.width = this.el.offsetWidth;
		dim.height = this.el.offsetHeight;
		if (this.additionalTop) {
			dim.top += this.additionalTop;
			dim.height -= this.additionalTop;
		}
		return dim;
	}
};