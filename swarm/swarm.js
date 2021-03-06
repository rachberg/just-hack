
var data = [];
var link_array = [];
var numPoints = 150;
var link_dist = 0.01;
var speed = 0.00005
//var k_closest = 10;
var colors = ["rgb(255, 48, 124)",
              "rgb(189, 34, 92)",
              "rgb(0, 219, 187)",
              "rgb(0, 127, 109)",
              "rgb(250, 255, 120)",
              "rgb(229, 219, 55)"];

//var color = d3.scale.linear()
//       .domain([0,1])  // min/max of data
//       .range("rgb(255, 48, 124)", "rgb(229, 219, 55)")
//       .interpolate(interpolateLab)
//
var color = d3.scale.linear()
        .domain([0,1./6, 2./6, 3./6, 4./6, 5./6])
        .range(colorbrewer.RdYlBu[6])
        //.interpolate(d3.interpolateHcl)


var numColors = colors.length;
for (var i = 0; i < numPoints; i++) {
    data.push({xloc: Math.random(), yloc: Math.random() , xvel: speed*(Math.random() - 0.5), yvel: speed * (Math.random() - 0.5), idx: i});
}


function euclidDistance(ax, ay, bx, by){
    return (Math.pow(ax-bx, 2) + Math.pow(ay-by, 2));
}

function updateLinks() {
    link_array = [];
    for (var i=0; i< numPoints;i++) {
        for (var j=i+1; j < numPoints; j++) {
            var dist = euclidDistance(data[i].xloc, data[i].yloc, data[j].xloc, data[j].yloc);
            if (dist < link_dist) {
                    var yloc1 = data[i].yloc;
                    //link_array.push([i,j, 1 - dist/link_dist, colors[Math.floor(yloc1 * colors.length)]])
                    link_array.push([i,j, 1 - dist/link_dist, color(yloc1)]);
                    //if (i == 1) {console.log(color(yloc1))};
                }
            }
        }
    }
//function quadTreelinks() {
//    quadtree = d3.geom.quadtree()
//                 .extent([[-1, -1], [w + 1, h + 1]])
//                 .x(function (d) { return d.xloc})
//                 .y(function (d) { return d.yloc})
//                 (data)
//    link_array = [];
//    for (var i=0; i< numPoints;i++) {
//        var bestqueue = new Array(quadtree);
//        var result = [];
//        knearest(bestqueue, result, data[i].xloc, data[i].yloc, k_closest);
//        for (j = 0; j < k_closest; j++)
//            var neighbor = result[j].point;
//            var dist = euclidDistance(data[i].xloc, data[i].yloc, neighbor.xloc, neighbor.yloc);
//            if (dist < link_dist) {
//                link_array.push([i, neighbor.idx, 1 - (dist/link_dist), color(data[i].yloc)]);
//            }
//    }
//}
updateLinks()
var w = window.innerWidth,
    h = window.innerHeight,
    spacing = 1,
    x = d3.scale.linear()
        .domain([0, 1])
        .range([0, w]),
    y = d3.scale.linear()
        .domain([0, 1])
        .range([0, h])
//    quadtree = d3.geom.quadtree()
//                 .extent([[-1, -1], [w + 1, h + 1]])
//                 .x(function (d) { return d.xloc})
//                 .y(function (d) { return d.yloc})
//                 (data)

    var latest = performance.now()
    last = latest,
    fps = [];

for (i=0; i<=100; i++) {
    fps.push(30);
}

var chart = d3.select("body").append("svg")
            .attr("class", "chart")
            .attr("width", w)
            .attr("height", h);

chart.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", function(d) { 
        return x(d.xloc); 
    })
    .attr("cy", function(d) { 
        return y(d.yloc); 
    })
    .attr("r", 1.5)
    .style("stroke", "grey");

var path = chart.selectAll("line")
    .data(link_array)
    .enter().append("line")
    .attr("x1", function(d) { return data[d[0]].xloc * w})
    .attr("y1", function(d) { return data[d[0]].yloc * h})
    .attr("x2", function(d) { return data[d[1]].xloc * w})
    .attr("y2", function(d) { return data[d[1]].yloc * h})
    .attr("opacity", function(d) { return d[2]})
    .style("stroke", function(d) { return d[3]})

function motion(e, index, array) { 
    e.xloc = e.xloc + e.xvel;
    e.yloc = e.yloc + e.yvel;

    if (Math.random() > 0.6) {
        e.xvel = e.xvel + speed*(Math.random() - .5);
        e.yvel = e.yvel + speed*(Math.random() - .5);
    }

    if (e.xloc > 1) { e.xloc = 1;  e.xvel = -1 * e.xvel}
    if (e.xloc < 0) { e.xloc = 0;  e.xvel = -1 * e.xvel}
    if (e.yloc > 1) { e.yloc = 1;  e.yvel = -1 * e.yvel}
    if (e.yloc < 0) { e.yloc = 0;  e.yvel = -1 * e.yvel}
}
var count = 0;
d3.timer(function(elapsed) {
    count++;
    data.forEach(motion);
    //quadTreelinks();
    updateLinks();

    chart.selectAll("circle")
        .attr("cx", function(d) { return x(d.xloc); })
        .attr("cy", function(d) { return y(d.yloc); });

    chart.selectAll("line")
        .data(link_array)
        .attr("x1", function(d) { return data[d[0]].xloc * w})
        .attr("y1", function(d) { return data[d[0]].yloc * h})
        .attr("x2", function(d) { return data[d[1]].xloc * w})
        .attr("y2", function(d) { return data[d[1]].yloc * h})
        .attr("opacity", function(d) { return d[2]})
        .style("stroke", function(d) { return d[3]})

    latest = performance.now()
    fps.push(1/(latest-last)*1000);
    fps.shift();
    last = latest;

    d3.select("#fps span").text(Math.floor((count/elapsed)*1000));
    d3.select("#links span").text(link_array.length);
});
