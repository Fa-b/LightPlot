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

var createCanvas = function (container, zIndex) {
    var canvas = document.createElement("canvas");
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = container.getBoundingClientRect();
    // Give the canvas pixel dimensions of their
    // size * the device pixel ratio.
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

var defaultBGOpts = {offset: { x: 0, y: 0 }, color: "#FFFFFF", alpha: 1.0};
var defaultGridOpts = {ticks: { x: 0, y: 5 }, offset: { x: 0, y: 0 }, type: "linear", color: "#D3D3D3", lineWidth: 1, alpha: 1.0};
var defaultXAxisOpts = {ticks: 0, tickSize: 10, tickOffset: 0, offset: { x: 0, y: 0 }, type: "linear", position: "top", color: "#000000", lineWidth: 1, alpha: 1.0};
var defaultYAxisOpts = {ticks: 5, tickSize: 10, tickOffset: 0, offset: { x: 0, y: 0 }, type: "linear", position: "left", color: "#000000", lineWidth: 1, alpha: 1.0};
var defaultGraphOpts = {offset: { x: 0, y: 0 }, color: defaultGraphColors, lineWidth: 1, alpha: .5};

function LightPlot(placeholder, options){
    this.container;
    this.optionsOverride;
    this.graphs = [];
    this.container = document.getElementById(placeholder);

    this.optionsOverride = options;
    this.setBackground();
	
	this.xDomainOffset;
	this.yDomainOffset;

    this.updateAll();

}

LightPlot.prototype.setBackground = function(options) {
    if(!this.background)
        this.background = createCanvas(this.container, 1);
    this.background = {...this.background, ...defaultBGOpts, ...this.optionsOverride.background, ...options};

    this.updateBackground();
}
    
LightPlot.prototype.setGrid = function(options) {
    if(!this.grid)
        this.grid = createCanvas(this.container, 2);
    this.grid = {...this.grid, ...defaultGridOpts, ...this.optionsOverride.grid, ...options};

    this.updateGrid();
    this.updateXAxis();
    this.updateYAxis();
}

// Todo: multiple axes 
LightPlot.prototype.setXAxis = function(range = null, options) {
    if(!this.xaxis)
        this.xaxis = createCanvas(this.container, 4);

    if(range) {
        this.xaxis.domain = {from: range[0], to: range[1]};
    }

    this.xaxis = {...this.xaxis, ...defaultXAxisOpts, ...this.optionsOverride.xaxis, ...options};

    this.updateXAxis();
    this.updateYAxis();
    this.updateGrid();
}

LightPlot.prototype.setYAxis = function(range = null, options) {
    if(!this.yaxis)
        this.yaxis = createCanvas(this.container, 4);

    if(range) {
        this.yaxis.domain = {from: range[0], to: range[1]};
    }

    this.yaxis = {...this.yaxis, ...defaultYAxisOpts, ...this.optionsOverride.yaxis, ...options};

    this.updateYAxis();
    this.updateXAxis();
    this.updateGrid();
}

// Todo: graphs should be assigned to axes
LightPlot.prototype.addGraph = function(lambda, options){
    this.graphs.push(createCanvas(this.container, 3));
    let idx = this.graphs.length - 1;

    if(typeof lambda === "function")
        this.graphs[idx].function = lambda;
    if(typeof lambda === "object" && object === undefined)
        object = lambda;

    this.graphs[idx] = {...this.graphs[idx], ...defaultGraphOpts, ...options};
	
	console.log(this.graphs[idx]);

    this.updateGraph(idx);

    return idx;
}

LightPlot.prototype.updateAll = function() {
    this.updateBackground();
    this.updateGrid();
    this.updateXAxis();
    this.updateYAxis();
    for(let i = 0; i < this.graphs.length; i++) {
        this.updateGraph(i);
    }
} 

LightPlot.prototype.updateBackground = function() {
    this.background.ctx.clearRect(this.background.offset.x, this.background.offset.y, this.background.width, this.background.height);
    this.background.ctx.globalAlpha = this.background.alpha;
    this.background.ctx.fillStyle = this.background.color;
    this.background.ctx.fillRect(this.background.offset.x, this.background.offset.y, this.background.width, this.background.height);
}

LightPlot.prototype.updateGrid = function() {
    if(this.grid) {
        if(this.grid.type == "linear") {
            if(this.grid.ticks.x) {
                var xInterval = this.grid.width / (this.grid.ticks.x + 1);
            }
            if(this.grid.ticks.y) {
                var yInterval = this.grid.height / (this.grid.ticks.y + 1);
            }

            this.grid.ctx.clearRect(this.grid.offset.x, this.grid.offset.y, this.grid.width, this.grid.height);
            this.grid.ctx.globalAlpha = this.grid.alpha;
            this.grid.ctx.strokeStyle = this.grid.color;
            this.grid.ctx.strokeWidth = this.grid.lineWidth;
            let offset = (this.grid.ctx.strokeWidth % 2 == 1) ? 0.5 : 0;
            this.grid.ctx.beginPath();

            if(xInterval) {
				let shift = this.xDomainOffset % xInterval;
                for(let i = 0; i <= this.grid.ticks.x; ++i) {
                    this.grid.ctx.moveTo(i * xInterval + offset + shift, this.grid.offset.y);
                    this.grid.ctx.lineTo(i * xInterval + offset + shift, this.grid.height);
                }
            }
            
            if(yInterval) {
				let shift = yInterval - this.yDomainOffset % yInterval;
                for(let i = 0; i <= this.grid.ticks.y; ++i) {
                    this.grid.ctx.moveTo(this.grid.offset.x, i * yInterval - offset + shift);
                    this.grid.ctx.lineTo(this.grid.width, i * yInterval - offset + shift);
                }
            }

            this.grid.ctx.stroke();
        }
    }
}
    
LightPlot.prototype.updateXAxis = function() {
    if(this.xaxis){
        this.xDomainOffset = (-1 * this.xaxis.domain.from) * (this.xaxis.width)/(this.xaxis.domain.to - this.xaxis.domain.from);

        this.xaxis.ctx.clearRect(this.xaxis.offset.x, this.xaxis.offset.y, this.xaxis.width, this.xaxis.height);
        this.xaxis.ctx.globalAlpha = this.xaxis.alpha;
        this.xaxis.ctx.strokeStyle = this.xaxis.color;
        this.xaxis.ctx.strokeWidth = this.xaxis.lineWidth;
        let offset = (this.xaxis.ctx.strokeWidth % 2 == 1) ? 0.5 : 0;
        this.xaxis.ctx.beginPath();

        var yPos = this.xaxis.height - this.xaxis.offset.y - offset - this.yDomainOffset;

        if(this.xaxis.position === "bottom") { // Doesn't make much sense this way
            yPos = this.xaxis.offset.y + offset + this.yDomainOffset;
        }

        this.xaxis.ctx.moveTo(this.xaxis.offset.x, yPos);
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
					if(pos === this.xDomainOffset)
						continue;
                    this.xaxis.ctx.moveTo(pos + offset, tickStart);
                    this.xaxis.ctx.lineTo(pos + offset, tickEnd);
                }
            }
        }

        this.xaxis.ctx.stroke();
    }
}
    
LightPlot.prototype.updateYAxis = function() {
    if(this.yaxis){
        this.yDomainOffset = (-1 * this.yaxis.domain.from) * (this.yaxis.height)/(this.yaxis.domain.to - this.yaxis.domain.from);

        this.yaxis.ctx.clearRect(this.yaxis.offset.x, this.yaxis.offset.y, this.yaxis.width, this.yaxis.height);
        this.yaxis.ctx.globalAlpha = this.yaxis.alpha;
        this.yaxis.ctx.strokeStyle = this.yaxis.color;
        this.yaxis.ctx.strokeWidth = this.yaxis.lineWidth;
        let offset = (this.yaxis.ctx.strokeWidth % 2 == 1) ? 0.5 : 0;
        this.yaxis.ctx.beginPath();

        var xPos = this.yaxis.offset.x + offset + this.xDomainOffset;

        if(this.yaxis.position === "right") { // Doesn't make much sense this way
            xPos = this.yaxis.width - this.yaxis.offset.x - offset - this.xDomainOffset;
        }

        this.yaxis.ctx.moveTo(xPos, this.yaxis.height - this.yaxis.offset.y);
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
					if(pos === this.yDomainOffset)
						continue;
                    this.yaxis.ctx.moveTo(tickStart, pos - offset);
                    this.yaxis.ctx.lineTo(tickEnd, pos - offset);
                }
            }
        }

        this.yaxis.ctx.stroke();
    }
}

// Todo, associate graphs with axes..
LightPlot.prototype.updateGraph = function(idx) {
    let graph = this.graphs[idx];
    
    graph.ctx.clearRect(graph.offset.x, graph.offset.y, graph.width, graph.height);
    graph.ctx.globalAlpha = graph.alpha;
    graph.ctx.fillStyle = Array.isArray(graph.color) ? defaultGraphColors[idx] : graph.color;
	graph.ctx.strokeWidth = graph.lineWidth;
	let offset = (graph.ctx.strokeWidth % 2 == 1) ? 0.5 : 0;


    // Todo: improve redraw algorithm, instead of drawing each pixel new on update, keep track of indices where it actually changes (in time domain)
    //We cache previous y2 values because they're the same as y1 on the next iteration.
    var cacheY1 = null;
    var cacheY1Pixel = null;
    for(var i = 0; i <= graph.width; i++){
        var x = ((i)  * ((this.xaxis.domain.to - this.xaxis.domain.from) / graph.width)) + this.xaxis.domain.from;
        
        if(x < this.xaxis.domain.from || x > this.xaxis.domain.to)
            continue;
        
        var y1 = (cacheY1 == null) ? graph.function(x) : cacheY1;
        var y2 = graph.function(x+((this.xaxis.domain.to - this.xaxis.domain.from) / graph.width));
        
        var y1Pixel = (cacheY1Pixel == null) ? ((y1 - this.yaxis.domain.from) * (graph.height) / (this.yaxis.domain.to - this.yaxis.domain.from)) : cacheY1Pixel;
        var y2Pixel = ((y2 - this.yaxis.domain.from) * (graph.height) / (this.yaxis.domain.to - this.yaxis.domain.from));
        
        var point = Math.max(y1Pixel, y2Pixel);
        var height = Math.abs(y1Pixel-y2Pixel)+graph.lineWidth;
        
        graph.ctx.fillRect(i + offset, graph.height - point - offset, graph.lineWidth, height);
        
        cacheY1 = y2;
        cacheY1Pixel = y2Pixel;
    }
}