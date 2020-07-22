function init() {
	// Set engine address according to query parameter
	const urlParams = new URLSearchParams(window.location.search);
	const engineAddress = urlParams.get('engine');	
	console.log(engineAddress);
	ComputeEngine.openConnection(undefined, engineAddress);
	
	CytoscapeEditor.init();

	ComputeEngine.getBifurcationTree((e, r) => {
		for (node of r) {
			console.log("Node: ", node);
			CytoscapeEditor.ensureNode(node);
		}
	}, true);

	CytoscapeEditor.applyTreeLayout();

}