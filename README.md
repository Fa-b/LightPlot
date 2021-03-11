# Introduction
A lightweight plotting utility for mathematic graphs or realtime data
# Usage
- Download `lightplot.js` or copy into a new file
- Include the lightplot.js file somewhere in the `head` tag your `*.html`:
```html
<head>
  ...
  <script language="javascript" type="text/javascript" src="lightplot.js"></script>
  ...
</head>

```
Somewhere in your html add a `div`:
```html
<div id="plotcontainer" style="width:400px;height:300px;position:relative;"></div>
```

In your js set it up for example like this:
```js
  ...
    max_points = 500;
    lightplot = new LightPlot("plotcontainer", { background: { alpha: 0.0 }, grid: { ticks: { x: 9, y: 5 } }, xaxis: { ticks: 9 }, yaxis: { ticks: 2 } });
    lightplot.setGrid();
    lightplot.setXAxis([0, max_points]);
    lightplot.setYAxis([0, 100]);
    lightplot.addGraph((x) => {return array_of_y_data[Math.round(x)]});
  ...
```
Somewhere in your code where you retrieve data:
```js
  ...
    // in case max_points may change during execution
    while(supplyData.length > max_points)
        supplyData.shift();
    supplyData.push(data.voltage);
    lightplot.setXAxis([0, max_points]);
    lightplot.updateGraph(0);
```
# Remarks
This is a work in progress so a lot may still change.
Please look into the source code for options, options you pass via the constructor can all be overridden

Have fun
