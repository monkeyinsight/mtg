var filters = getElementsByClass("filter");
for (var i = 0; i < filters.length; i++) {
	var filter = filters[i];

	filter.onclick = function(e) {
		e.preventDefault();
		if (this.className.match(/selected/))
			this.className = this.className.replace(/ selected/, '');
		else
			this.className += ' selected';

		for (var i = 0; i < Workspaces.length; i++)
			if (Workspaces[i].library)
				Workspaces[i].search();
	}
}