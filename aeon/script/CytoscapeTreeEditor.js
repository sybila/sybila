let EdgeMonotonicity = {
	unspecified: "unspecified",
	activation: "activation",
	inhibition: "inhibition",
}

/*
	Responsible for managing the cytoscape editor object. It has its own representation of the graph,
	but it should never be updated directly. Instead, always use LiveModel to specify updates.
*/
let CytoscapeEditor = {
	
	// Reference to the cytoscape library "god object"
	_cytoscape: undefined,
	
	init: function() {
		this._cytoscape = cytoscape(this.initOptions());			
	},


	initOptions: function() {
		return {
			container: document.getElementById("cytoscape-editor"),			
			// Some sensible default auto-layout algorithm
  			layout: {
	            animate: true,
	            animationDuration: 300,
	            animationThreshold: 250,
	            refresh: 20,
	            fit: true,
	            name: 'cose',
	            padding: 250,
	            nodeRepulsion: function(node) { return 100000; },
	            nodeDimensionsIncludeLabels: true,
        	},
        	autoungrabify: false,
        	boxSelectionEnabled: false,
  			selectionType: 'single', 
  			style: [
  				{ 	// Style of the graph nodes
  					'selector': 'node[type="leaf"]',
  					'style': {
  						// 
  						'label': 'data(label)',	
  						// put label in the middle of the node (vertically)
  						//'text-valign': 'center',
  						'width': 'label', 'height': 'label',
  						// a rectangle with slightly sloped edges
  						//'shape': 'round-rectangle',
  						// when selecting, do not display any overlay
  						'overlay-opacity': 0,
  						// other visual styles
		                'padding': 0,		                
		                'background-color': '#dddddd',
		                'background-opacity': '0',
		                'font-family': 'symbols',
		                'font-size': '12pt',
		                'border-width': '0px',
		                'border-color': '#bbbbbb',
		                'border-style': 'solid',
  					}
  				},
  				/*{
  					'selector': 'node[type="decision"]'
  				} */ 				 			
  			]
		}
	},

	ensureNode(treeData) {		
		let node = this._cytoscape.getElementById(treeData.id);
		if (node !== undefined && node.length > 0) {
			let data = node.data();
			this._applyTreeData(data, treeData);
			return node;
		} else {
			console.log("add");			
			let data = this._applyTreeData({ id: treeData.id }, treeData);
			return this._cytoscape.add({
				id: data.id,
				data: data, 
				grabbable: false,
				position: { x: 0.0, y: 0.0 }
			});
		}
	},

	_applyTreeData(data, treeData) {
		if (data.id != treeData.id) {
			error("Updating wrong node.");
		}
		data.treeData = treeData;
		data.type = treeData.type;
		if (treeData.type == "leaf") {
			data.label = JSON.parse(treeData.class).map(x => x[0]).sort().join('');			
			data.label += "(" + treeData.cardinality + ")";
		}
		return data;
	},

	applyTreeLayout() {
		this._cytoscape.layout({
			name: 'breadthfirst',
			spacingFactor: 0.5,
			roots: [0],
			directed: true,
			//animate: true,
			fit: false,
		}).start();
	},

	edgeOptions() {
		return {
			preview: true, // whether to show added edges preview before releasing selection
	        hoverDelay: 150, // time spent hovering over a target node before it is considered selected
	        handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
	        snap: false,
	        snapThreshold: 50,
	        snapFrequency: 15,
	        noEdgeEventsInDraw: false,
	        disableBrowserGestures: true, 
	        nodeLoopOffset: -50,
	        // The `+` button should be drawn on top of each node
	        handlePosition: function(node) { return 'middle top'; },
	        handleInDrawMode: false,
	        edgeType: function(sourceNode, targetNode) { return 'flat'; },
	        // Loops are always allowed
	        loopAllowed: function(node) { return true; },	        
	        // Initialize edge with default parameters
	        edgeParams: function(sourceNode, targetNode, i) {
	            return { data: { observable: true, monotonicity: EdgeMonotonicity.unspecified }};
	        },
	        // Add the edge to the live model
	        complete: function(sourceNode, targetNode, addedEles) {	        	
	        	if (!LiveModel.addRegulation(sourceNode.id(), targetNode.id(), true, EdgeMonotonicity.unspecified)) {
	        		addedEles.remove();	// if we can't create the regulation, remove new edge
	        	} else {
	        		CytoscapeEditor._initEdge(addedEles[0]);
	        	}	        	
	        },
		};
	},
}