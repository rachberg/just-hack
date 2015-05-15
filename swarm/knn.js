// PDS Collect a list of nodes to draw rectangles, adding extent and depth data
function nodes(quadtree) {
    var nodes = [];
    quadtree.depth = 0; // root
    quadtree.visit(function(node, x1, y1, x2, y2) {
        node.x1 = x1;
        node.y1 = y1;
        node.x2 = x2;
        node.y2 = y2;
        nodes.push(node);
        for (var i=0; i<4; i++) {
            if (node.nodes[i]) node.nodes[i].depth = node.depth+1;
        }
    });
    return nodes;
}


// calculate mindist between searchpoint and rectangle
function mindist(x, y, x1, y1, x2, y2){
    var dx1 = x - x1, dx2 = x - x2, dy1 = y - y1, dy2 = y - y2;

    if (dx1*dx2 < 0) { // x is between x1 and x2
        if (dy1*dy2 < 0) { // (x,y) is inside the rectangle
            return 0; // return 0 as point is in rect
        }
        return Math.min(Math.abs(dy1),Math.abs(dy2));
    }
    if (dy1*dy2 < 0) { // y is between y1 and y2
        // we don't have to test for being inside the rectangle, it's already tested.
        return Math.min(Math.abs(dx1),Math.abs(dx2));
    }
    return Math.min( Math.min(euclidDistance(x,y,x1,y1),euclidDistance(x,y,x2,y2)), Math.min(euclidDistance(x,y,x1,y2),euclidDistance(x,y,x2,y1)) );
}
// Find the nodes within the specified rectangle.
function knearest(bestqueue, resultqueue, x, y, k) {
    // sort children according to their mindist/dist to searchpoint
    bestqueue.sort(function(a, b){
        // add minidst to nodes if not there already
        [a, b].forEach(function(val, idx, array){
            if(val.mindist == undefined){
                val.scanned = true;
                if(val.leaf){
                    val.point.scanned=true;
                    val.mindist = euclidDistance(x, y, val.x, val.y);
                }else{
                    val.mindist = mindist(x, y, val.x1, val.y1, val.x2, val.y2);
                }
            }
        });
        return b.mindist - a.mindist;
    });

    // add nearest leafs if any
    for (var i=bestqueue.length-1; i>=0; i--){
        var elem = bestqueue[i];
        if(elem.leaf){
            elem.point.selected = true;
            bestqueue.pop();
            resultqueue.push(elem);
        }else{
            break;
        }
        if(resultqueue.length >=k){
            break;
        }
    }

    // check if enough points found
    if(resultqueue.length >=k || bestqueue.length == 0){
        // return if k neighbors found
        return;
    }else{
        // add child nodes to bestqueue and recurse
        var vistitednode = bestqueue.pop();
        vistitednode.visited = true;
        // add nodes to queue
        vistitednode.nodes.forEach(function(val, idx, array){
            bestqueue.push(val);
        });
        // recursion
        knearest(bestqueue, resultqueue, x, y, k);
    }
}
