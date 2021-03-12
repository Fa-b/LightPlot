/** The MIT License (MIT)

Copyright (c) 2021 Fa-b

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var defaultGraphColors = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
];

var createCanvas = function (container, zIndex, xOffset, yOffset) {
    var canvas = document.createElement("canvas");
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = container.getBoundingClientRect();
    // Give the canvas pixel dimensions of their
    // size * the device pixel ratio.
	canvas.style.left = (xOffset?xOffset:0);
	canvas.style.bottom = (yOffset?yOffset:0);
    canvas.width = rect.width;
    canvas.width *= dpr;
    canvas.height = rect.height;
    canvas.height *= dpr;
    let ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr
    canvas.style.position = "absolute";
    canvas.style.width = canvas.width / dpr + 'px';
    canvas.style.height = canvas.height / dpr + 'px';
    canvas.style.zIndex = zIndex;
    ctx.scale(dpr, dpr);
    
    container.appendChild(canvas);

    return {"ctx": ctx, "width": rect.width, "height": rect.height};
}

// Axis class
var defaultGridOpts = {ticks: { x: 0, y: 5 }, offset: { x: 0, y: 0 }, type: "linear", color: "#D3D3D3", lineWidth: 1, alpha: 1.0};
var defaultXAxisOpts = {ticks: 5, tickSize: 10, tickOffset: 0, offset: { x: 0, y: 0 }, arrow: { show: true, size: 5, position:"right" }, type: "linear", position: "bottom", color: "#000000", lineWidth: 1, alpha: 1.0};
var defaultYAxisOpts = {ticks: 5, tickSize: 10, tickOffset: 0, offset: { x: 0, y: 0 }, arrow: { show: true, size: 5, position:"top" }, type: "linear", position: "left", color: "#000000", lineWidth: 1, alpha: 1.0};

function LightAxis(xRange, yRange, placeholder, options) {
    if(!Array.isArray(xRange) || !Array.isArray(yRange) || placeholder === undefined)
		throw new Error("You need to at least specify x and y ranges and a container id or instance.");
	if(typeof placeholder === "string")
		this.container = document.getElementById(placeholder);
	else if(placeholder instanceof LightPlot)
		this.container = placeholder.container;
	
	// keep track of affecting changes (avoid updating without changes)
	this.lastGridOffsetX;
	this.lastGridOffsetY;
	this.lastXAxisOffsetX;
	this.lastXAxisOffsetY;
	this.lastYAxisOffsetX;
	this.lastYAxisOffsetY;
	this.lastxDomainOffset;
	this.xDomainOffset;
	this.lastyDomainOffset;
	this.yDomainOffset;
	
	if(options === undefined)
		options = {};
	this.setAxis(xRange, yRange, options);
}

LightAxis.prototype.setAxis = function(xRange, yRange, options) {
	if(!Array.isArray(xRange))
		options = xRange;
	else if(!Array.isArray(yRange))
		options = yRange;
	if(!options)
		options = {};
	if(typeof options !== "object")
		throw new Error("Object required for options");
		
	this.setGrid(options.grid);
	this.setXAxis(xRange, options.xaxis);
	this.setYAxis(yRange, options.yaxis);
}

LightAxis.prototype.setGrid = function(options) {
    if(!this.grid)
        this.grid = createCanvas(this.container, 2);
    this.grid = {...defaultGridOpts, ...this.grid, ...options};
	if(options) {
		this.grid.ticks = {...defaultGridOpts.ticks, ...options.ticks};
		this.grid.offset = {...defaultGridOpts.offset, ...options.offset};
	}
	
	if(this.lastGridOffsetX !== this.grid.offset.x || this.lastGridOffsetY != this.grid.offset.y) {
		this.container.removeChild(this.grid.ctx.canvas);
		this.grid.ctx = createCanvas(this.container, 2, this.grid.offset.x, this.grid.offset.y).ctx;
		
		this.lastGridOffsetX = this.grid.offset.x;
		this.lastGridOffsetY = this.grid.offset.y;
	}

    this.updateGrid();
}

// Todo: multiple axes 
LightAxis.prototype.setXAxis = function(range = null, options) {
    if(!this.xaxis)
        this.xaxis = createCanvas(this.container, 4);

    if(Array.isArray(range)) {
        this.xaxis.domain = {from: range[0], to: range[1]};
    }
	
    this.xaxis = {...defaultXAxisOpts, ...this.xaxis, ...options};
	if(options) {
		this.xaxis.offset = {...defaultXAxisOpts.offset, ...options.offset};
		this.xaxis.arrow = {...defaultXAxisOpts.arrow, ...options.arrow};
	}
	
	if(this.lastXAxisOffsetX !== this.xaxis.offset.x || this.lastXAxisOffsetY != this.xaxis.offset.y) {
		this.container.removeChild(this.xaxis.ctx.canvas);
		this.xaxis.ctx = createCanvas(this.container, 4, this.xaxis.offset.x, this.xaxis.offset.y).ctx;
		
		this.lastXAxisOffsetX = this.xaxis.offset.x;
		this.lastXAxisOffsetY = this.xaxis.offset.y;
	}
	
	this.lastxDomainOffset = this.xDomainOffset;
	this.xDomainOffset = (-1 * this.xaxis.domain.from) * (this.xaxis.width)/(this.xaxis.domain.to - this.xaxis.domain.from);
    
	if(this.lastxDomainOffset !== this.xDomainOffset)
		this.update();
	else
		this.updateXAxis();
}

LightAxis.prototype.setYAxis = function(range = null, options) {
    if(!this.yaxis)
        this.yaxis = createCanvas(this.container, 4);

    if(Array.isArray(range)) {
        this.yaxis.domain = {from: range[0], to: range[1]};
    }

    this.yaxis = {...defaultYAxisOpts, ...this.yaxis, ...options};
	if(options) {
		this.yaxis.offset = {...defaultYAxisOpts.offset, ...options.offset};
		this.yaxis.arrow = {...defaultYAxisOpts.arrow, ...options.arrow};
	}
	
	if(this.lastYAxisOffsetX !== this.yaxis.offset.x || this.lastYAxisOffsetY != this.yaxis.offset.y) {
		this.container.removeChild(this.yaxis.ctx.canvas);
		this.yaxis.ctx = createCanvas(this.container, 4, this.yaxis.offset.x, this.yaxis.offset.y).ctx;
		
		this.lastYAxisOffsetX = this.yaxis.offset.x;
		this.lastYAxisOffsetY = this.yaxis.offset.y;
	}
	
	this.lastyDomainOffset = this.yDomainOffset;
	this.yDomainOffset = (-1 * this.yaxis.domain.from) * (this.yaxis.height)/(this.yaxis.domain.to - this.yaxis.domain.from);
	
	if(this.lastyDomainOffset !== this.yDomainOffset)
		this.update();
	else
		this.updateYAxis();
}

LightAxis.prototype.updateGrid = function() {
	if(this.grid) {
        if(this.grid.type == "linear") {
            if(this.grid.ticks.x) {
                var xInterval = this.grid.width / (this.grid.ticks.x + 1);
            }
            if(this.grid.ticks.y) {
                var yInterval = this.grid.height / (this.grid.ticks.y + 1);
            }

            this.grid.ctx.clearRect(0, 0, this.grid.width, this.grid.height);
            this.grid.ctx.globalAlpha = this.grid.alpha;
            this.grid.ctx.strokeStyle = this.grid.color;
            this.grid.ctx.lineWidth = this.grid.lineWidth;
            let offset = (this.grid.ctx.lineWidth % 2 == 1) ? 0.5 : 0;
            this.grid.ctx.beginPath();

            if(xInterval) {
				let shift = this.xDomainOffset % xInterval;
                for(let i = 0; i <= this.grid.ticks.x; ++i) {
                    this.grid.ctx.moveTo(i * xInterval + offset + shift, 0);
                    this.grid.ctx.lineTo(i * xInterval + offset + shift, this.grid.height);
                }
            }
            
            if(yInterval) {
				let shift = yInterval - this.yDomainOffset % yInterval;
                for(let i = 0; i <= this.grid.ticks.y; ++i) {
                    this.grid.ctx.moveTo(0, i * yInterval - offset + shift);
                    this.grid.ctx.lineTo(this.grid.width, i * yInterval - offset + shift);
                }
            }

            this.grid.ctx.stroke();
        }
    }
}

LightAxis.prototype.updateXAxis = function() {
	if(this.xaxis){
		
        this.xaxis.ctx.clearRect(0, 0, this.xaxis.width, this.xaxis.height);
        this.xaxis.ctx.globalAlpha = this.xaxis.alpha;
        this.xaxis.ctx.strokeStyle = this.xaxis.color;
        this.xaxis.ctx.lineWidth = this.xaxis.lineWidth;
        let offset = (this.xaxis.ctx.lineWidth % 2 == 1) ? 0.5 : 0;
        this.xaxis.ctx.beginPath();

        var yPos = this.xaxis.height - offset - this.yDomainOffset;
		var xArrStart = this.xaxis.width;
		var xArrEnd = xArrStart - this.xaxis.arrow.size;

		if(this.xaxis.arrow.position === "left") {
			xArrStart = 0;
			xArrEnd = xArrStart + this.xaxis.arrow.size;
		}
		
        if(this.xaxis.position === "top") { // Doesn't make much sense this way
            yPos = offset + this.yDomainOffset;
        }

        this.xaxis.ctx.moveTo(0, yPos);
        this.xaxis.ctx.lineTo(this.xaxis.width, yPos);
		
        if(this.xaxis.type == "linear") {
			let half = this.xaxis.tickSize / 2 - this.xaxis.tickOffset;
            var tickStart = yPos + half;
            var tickEnd = yPos - half;

            if(this.xaxis.ticks) {
                var xInterval = this.xaxis.width / (this.xaxis.ticks + 1);
            }

            if(xInterval) {
				let shift = this.xDomainOffset % xInterval;
                for(let i = 0; i <= this.xaxis.ticks; ++i) {
					let pos = i * xInterval + shift;
					if(pos === xArrStart)
						continue;
                    this.xaxis.ctx.moveTo(pos + offset, tickStart);
                    this.xaxis.ctx.lineTo(pos + offset, tickEnd);
                }
            }
        }
		
		if(this.xaxis.arrow.show) {
			this.xaxis.ctx.moveTo(xArrStart, yPos);
			this.xaxis.ctx.lineTo(xArrEnd, yPos + this.xaxis.arrow.size);
			this.xaxis.ctx.moveTo(xArrStart, yPos);
			this.xaxis.ctx.lineTo(xArrEnd, yPos - this.xaxis.arrow.size);
			
		}

        this.xaxis.ctx.stroke();
    }
}

LightAxis.prototype.updateYAxis = function() {
	if(this.yaxis){

        this.yaxis.ctx.clearRect(0, 0, this.yaxis.width, this.yaxis.height);
        this.yaxis.ctx.globalAlpha = this.yaxis.alpha;
        this.yaxis.ctx.strokeStyle = this.yaxis.color;
        this.yaxis.ctx.lineWidth = this.yaxis.lineWidth;
        let offset = (this.yaxis.ctx.lineWidth % 2 == 1) ? 0.5 : 0;
        this.yaxis.ctx.beginPath();

        var xPos = offset + this.xDomainOffset;
		var xArrStart = 0;
		var xArrEnd = xArrStart + this.xaxis.arrow.size;
		
		if(this.yaxis.arrow.position === "bottom") {
			xArrStart = this.yaxis.height;
			xArrEnd = xArrStart - this.xaxis.arrow.size;
		}

        if(this.yaxis.position === "right") { // Doesn't make much sense this way
            xPos = this.yaxis.width - offset - this.xDomainOffset;
        }

        this.yaxis.ctx.moveTo(xPos, this.yaxis.height);
        this.yaxis.ctx.lineTo(xPos, 0);

        if(this.yaxis.type == "linear") {
			let half = this.yaxis.tickSize / 2 + this.yaxis.tickOffset;
            var tickStart = xPos + half;
            var tickEnd = xPos - half;

            if(this.yaxis.ticks) {
                var yInterval = this.yaxis.height / (this.yaxis.ticks + 1);
            }

            if(yInterval) {
				let shift = this.yDomainOffset % yInterval;
                for(let i = 0; i <= this.yaxis.ticks; ++i) {
					let pos = i * yInterval - shift;
					if(pos === xArrStart)
						continue;
                    this.yaxis.ctx.moveTo(tickStart, pos - offset);
                    this.yaxis.ctx.lineTo(tickEnd, pos - offset);
                }
            }
        }
		
		if(this.yaxis.arrow.show) {
			this.yaxis.ctx.moveTo(xPos, xArrStart);
			this.yaxis.ctx.lineTo(xPos + this.yaxis.arrow.size, xArrEnd);
			this.yaxis.ctx.moveTo(xPos, xArrStart);
			this.yaxis.ctx.lineTo(xPos - this.yaxis.arrow.size, xArrEnd);
			
		}

        this.yaxis.ctx.stroke();
    }
}

LightAxis.prototype.update = function() {
	this.lastxDomainOffset = this.xDomainOffset;
	this.lastyDomainOffset = this.yDomainOffset;
	
	this.updateGrid();
	this.updateXAxis();
	this.updateYAxis();
}

//Graph class
var defaultGraphOpts = {axis: 0, offset: { x: 0, y: 0 }, color: defaultGraphColors, lineWidth: 1, alpha: .5};

function LightGraph(axis, lambda, placeholder, options) {
    if(!(axis instanceof LightAxis) || typeof lambda !== "function" || placeholder === undefined)
		throw new Error("You need to at least provide a axis instance, a callback math function and a container id or instance.");
	if(typeof placeholder === "string")
		this.container = document.getElementById(placeholder);
	else if(placeholder instanceof LightPlot)
		this.container = placeholder.container;
	
    if(!this.graph)
        this.graph = createCanvas(this.container, 3);

	this.graph.axis = axis;
	this.graph.function = lambda;
	
	this.lastGraphOffsetX;
	this.lastGraphOffsetY;
	
	if(options === undefined)
		options = {};
	this.setGraph(options);
}

LightGraph.prototype.setGraph = function(options) {
	if(typeof options !== "object")
		throw new Error("Object required for options");
		
	this.graph = {...defaultGraphOpts, ...this.graph, ...options};
	if(options) {
		this.graph.offset = {...defaultGraphOpts.offset, ...options.offset};
	}
	
	if(this.lastGraphOffsetX !== this.graph.offset.x || this.lastGraphOffsetY != this.graph.offset.y) {
		this.container.removeChild(this.graph.ctx.canvas);
		this.graph.ctx = createCanvas(this.container, 4, this.graph.offset.x, this.graph.offset.y).ctx;
		
		this.lastGraphOffsetX = this.graph.offset.x;
		this.lastGraphOffsetY = this.graph.offset.y;
	}
	
    this.update();
}

LightGraph.prototype.update = function() {    
    this.graph.ctx.clearRect(0, 0, this.graph.width, this.graph.height);
    this.graph.ctx.globalAlpha = this.graph.alpha;
    this.graph.ctx.fillStyle = this.graph.color;
	this.graph.ctx.lineWidth = this.graph.lineWidth;
	let offset = (this.graph.ctx.lineWidth % 2 == 1) ? 0.5 : 0;

    // Todo: improve redraw algorithm, instead of drawing each pixel new on update, keep track of indices where it actually changes (in time domain)
    //We cache previous y2 values because they're the same as y1 on the next iteration.
    var cacheY1 = null;
    var cacheY1Pixel = null;
    for(var i = 0; i <= this.graph.width; i++){
        var x = ((i)  * ((this.graph.axis.xaxis.domain.to - this.graph.axis.xaxis.domain.from) / this.graph.width)) + this.graph.axis.xaxis.domain.from;
        
        if(x < this.graph.axis.xaxis.domain.from || x > this.graph.axis.xaxis.domain.to)
            continue;
        
        var y1 = (cacheY1 == null) ? this.graph.function(x) : cacheY1;
        var y2 = this.graph.function(x+((this.graph.axis.xaxis.domain.to - this.graph.axis.xaxis.domain.from) / this.graph.width));
        
        var y1Pixel = (cacheY1Pixel == null) ? ((y1 - this.graph.axis.yaxis.domain.from) * (this.graph.height) / (this.graph.axis.yaxis.domain.to - this.graph.axis.yaxis.domain.from)) : cacheY1Pixel;
        var y2Pixel = ((y2 - this.graph.axis.yaxis.domain.from) * (this.graph.height) / (this.graph.axis.yaxis.domain.to - this.graph.axis.yaxis.domain.from));
        
        var point = Math.max(y1Pixel, y2Pixel);
        var height = Math.abs(y1Pixel-y2Pixel)+this.graph.lineWidth;
        
        this.graph.ctx.fillRect(i + offset, this.graph.height - point - offset, this.graph.lineWidth, height);
        
        cacheY1 = y2;
        cacheY1Pixel = y2Pixel;
    }
}

//Plot class
var defaultBGOpts = {offset: { x: 0, y: 0 }, color: "#FFFFFF", alpha: 1.0};

function LightPlot(placeholder, options) {
	this.axes = []
    this.graphs = [];
    this.container = document.getElementById(placeholder);

    this.lastBGOffsetX;
	this.lastBGOffsetY;

	if(options === undefined)
		options = {};
    this.optionsOverride = options;
    this.setBackground();
}

LightPlot.prototype.setBackground = function(options) {
    if(!this.background)
        this.background = createCanvas(this.container, 1);
    this.background = {...defaultBGOpts, ...this.optionsOverride.background, ...this.background, ...options};
	if(options) {
		this.background.offset = {...defaultBGOpts.offset, ...options.offset};
	}
	
	if(this.lastBGOffsetX !== this.background.offset.x || this.lastBGOffsetY != this.background.offset.y) {
		this.container.removeChild(this.background.ctx.canvas);
		this.background.ctx = createCanvas(this.container, 4, this.background.offset.x, this.background.offset.y).ctx;
		
		this.lastBGOffsetX = this.background.offset.x;
		this.lastBGOffsetY = this.background.offset.y;
	}

    this.updateBackground();
}

LightPlot.prototype.addAxis = function(axis, options){
	if(axis instanceof LightAxis) {
		axis.setAxis(options);
		this.axes.push(axis);
		return axis;
	} else if(typeof axis === "object" && axis.xrange && axis.yrange && options == undefined)
		options = axis;
	delete options.yrange;
	delete options.xrange;
	let ax = new LightAxis(axis.xrange, axis.yrange, this.container, options);
	this.axes.push(ax);	
	return ax;
}

LightPlot.prototype.addGraph = function(graph, options){
	if(options === undefined)
		options = {};
	if(!options.color)
		options.color = defaultGraphColors[this.graphs.length];
	
	if(graph instanceof LightGraph) {
		graph.setGraph(options);
		this.graphs.push(graph);
		return graph;
	} else if(typeof graph === "object" && graph.axis && graph.lambda)
		options = graph;
	delete options.axis;
	delete options.lambda;
	if(graph.axis && typeof graph.axis === "number")
		graph.axis = this.axes[graph.axis];
	let gr = new LightGraph(graph.axis, graph.lambda, this.container, options);
    this.graphs.push(gr);
    return gr;
}

LightPlot.prototype.update = function() {
    this.updateBackground();

	this.axes.forEach(axis => axis.update());
	this.graphs.forEach(graph => graph.update());
} 

LightPlot.prototype.updateBackground = function() {
    this.background.ctx.clearRect(0, 0, this.background.width, this.background.height);
    this.background.ctx.globalAlpha = this.background.alpha;
    this.background.ctx.fillStyle = this.background.color;
    this.background.ctx.fillRect(0, 0, this.background.width, this.background.height);
}