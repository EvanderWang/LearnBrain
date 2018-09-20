import { data } from "./VData";
import * as d3 from "d3";

module graph {
    export class VGraph {
        parent: any;
        selfDom: any;

        forceLayout: any;

        width: number = 0;
        height: number = 0;
        centerOffsetX: number = 0;
        centerOffsetY: number = 0;

        markPosX: number = 0;
        markPosY: number = 0;
        markOffsetBaseX: number = 0;
        markOffsetBaseY: number = 0;

        nodeRadius: number = 24;
        nodeRadiusOverlay: number = 29;

        scale: number = 1.0;

        restart: () => void;

        constructor(initVal: data.VData, nodeSelectChange: (cur: data.VNode | null, last: data.VNode | null) => void) {
            let tick = () => {
                if (selectedNode !== lastSelectedNode) {
                    nodeSelectChange(selectedNode, lastSelectedNode);
                    lastSelectedNode = selectedNode;
                }
                
                // draw directed edges with proper padding from node centers
                path.attr('d', (d: any) => {
                    const deltaX = d.target.x - d.source.x;
                    const deltaY = d.target.y - d.source.y;
                    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const normX = deltaX / dist;
                    const normY = deltaY / dist;
                    const sourcePadding = d.left ? this.nodeRadiusOverlay : this.nodeRadius;
                    const targetPadding = d.right ? this.nodeRadiusOverlay : this.nodeRadius;
                    const sourceX = d.source.x + (sourcePadding * normX);
                    const sourceY = d.source.y + (sourcePadding * normY);
                    const targetX = d.target.x - (targetPadding * normX);
                    const targetY = d.target.y - (targetPadding * normY);

                    return `M${sourceX},${sourceY}L${targetX},${targetY}`;
                });

                circle.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
            }

            // set up SVG for D3
            this.parent = d3.select('#graph_area');
            this.selfDom = this.parent.append('svg')
                .attr('oncontextmenu', 'return false;')
                .style('position', 'absolute');
            this.forceLayout = d3.forceSimulation()
                .force('link', d3.forceLink().id((d: data.VNode) => d.guid).distance(150))
                .force('charge', d3.forceManyBody().strength(-500))
                .on('tick', tick);

            this.resize();
            window.addEventListener('resize', () => { this.resize(); })

            // set up initial nodes and links
            //  - nodes are known by 'id', not by index in array.
            //  - reflexive edges are indicated on the node (as a bold black circle).
            //  - links are always source < target; edge directions are set by 'left' and 'right'.
            const nodes = initVal.nodes;
            const links = initVal.links;

            // define arrow markers for graph links
            this.selfDom.append('svg:defs').append('svg:marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 6)
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', '#000');

            this.selfDom.append('svg:defs').append('svg:marker')
                .attr('id', 'start-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 4)
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M10,-5L0,0L10,5')
                .attr('fill', '#000');

            // line displayed when dragging new nodes
            const dragLine = this.selfDom.append('svg:path')
                .attr('class', 'link dragline hidden')
                .attr('d', 'M0,0L0,0');

            // handles to link and node element groups
            let path = this.selfDom.append('svg:g').selectAll('path');
            let circle = this.selfDom.append('svg:g').selectAll('g');

            // mouse event vars
            let lastSelectedNode = null;
            let selectedNode = null;
            let selectedLink = null;
            let mousedownLink = null;
            let mousedownNode = null;
            let mouseupNode = null;

            let resetMouseVars = () => {
                mousedownNode = null;
                mouseupNode = null;
                mousedownLink = null;
            }

            // update graph (called when needed)
            this.restart = () => {
                // scale
                this.selfDom
                    .attr('width', this.width / this.scale)
                    .attr('height', this.height / this.scale)
                    .style('top', () => -this.height / this.scale * (1 - this.scale) / 2)
                    .style('left', () => -this.width / this.scale * (1 - this.scale) / 2)
                    .style('transform', () => "scale(" + this.scale + ")");

                // path (link) group
                path = path.data(links);

                // update existing links
                path.classed('selected', (d: data.VLink) => d === selectedLink)
                    .style('marker-start', (d: data.VLink) => d.left ? 'url(#start-arrow)' : '')
                    .style('marker-end', (d: data.VLink) => d.right ? 'url(#end-arrow)' : '');

                // remove old links
                path.exit().remove();

                // add new links
                path = path.enter().append('svg:path')
                    .attr('class', 'link')
                    .classed('selected', (d: data.VLink) => d === selectedLink)
                    .style('marker-start', (d: data.VLink) => d.left ? 'url(#start-arrow)' : '')
                    .style('marker-end', (d: data.VLink) => d.right ? 'url(#end-arrow)' : '')
                    .on('mousedown', (d: data.VLink) => {
                        if (d3.event.ctrlKey) return;

                        // select link
                        mousedownLink = d;
                        selectedLink = (mousedownLink === selectedLink) ? null : mousedownLink;
                        selectedNode = null;
                        this.restart();
                    })
                    .merge(path);

                // circle (node) group
                // NB: the function arg is crucial here! nodes are known by id, not by index!
                circle = circle.data(nodes, (d: data.VNode) => d.guid);

                // update existing nodes (reflexive & selected visual states)
                circle.selectAll('circle')
                    .style('fill', (d: data.VNode) => (d === selectedNode) ? d3.rgb(d.color).brighter().toString() : d.color)
                    .style('stroke', (d: data.VNode) => d3.rgb(d.color).darker().toString())

                circle.selectAll('text')
                    .text((d: data.VNode) => d.name)

                // remove old nodes
                circle.exit().remove();

                // add new nodes

                let nodemouseup = (d: data.VNode, selectitem: any) => {
                    if (!mousedownNode) return;

                    // needed by FF
                    dragLine
                        .classed('hidden', true)
                        .style('marker-end', '');

                    // check for drag-to-self
                    mouseupNode = d;
                    if (mouseupNode === mousedownNode) {
                        mousedownNode.fx = null;
                        mousedownNode.fy = null;

                        resetMouseVars();
                        return;
                    }

                    // unenlarge target node
                    d3.select(selectitem).attr('transform', '');

                    // add link to graph (update if exists)
                    // NB: links are strictly source < target; arrows separately specified by booleans
                    const isRight = mousedownNode.guid < mouseupNode.guid;
                    const source = isRight ? mousedownNode : mouseupNode;
                    const target = isRight ? mouseupNode : mousedownNode;

                    const link = links.filter((l) => l.source === source && l.target === target)[0];
                    if (link) {
                        link[isRight ? 'right' : 'left'] = true;
                    } else {
                        links.push({ source, target, left: !isRight, right: isRight });
                    }

                    // select new link
                    selectedLink = link;
                    selectedNode = null;
                    this.restart();
                };

                const g = circle.enter().append('svg:g');
                g.append('svg:circle')
                    .attr('class', 'node')
                    .attr('r', this.nodeRadius)
                    .style('fill', (d: data.VNode) => (d === selectedNode) ? d3.rgb(d.color).brighter().toString() : d.color)
                    .style('stroke', (d: data.VNode) => d3.rgb(d.color).darker().toString())
                    .on('mouseover', function (d: data.VNode) {
                        if (!mousedownNode || d === mousedownNode) return;
                        // enlarge target node
                        d3.select(this).attr('transform', 'scale(1.1)');
                    })
                    .on('mouseout', function (d: data.VNode) {
                        if (!mousedownNode || d === mousedownNode) return;
                        // unenlarge target node
                        d3.select(this).attr('transform', '');
                    })
                    .on('mousedown', (d: data.VNode) => {
                        if (d3.event.ctrlKey) return;

                        // select node
                        mousedownNode = d;
                        selectedNode = (mousedownNode === selectedNode) ? null : mousedownNode;
                        selectedLink = null;

                        if (d3.event.buttons == 1) {
                            // reposition drag line
                            dragLine
                                .style('marker-end', 'url(#end-arrow)')
                                .classed('hidden', false)
                                .attr('d', `M${mousedownNode.x},${mousedownNode.y}L${mousedownNode.x},${mousedownNode.y}`);
                        } else if (d3.event.buttons == 2) {
                            mousedownNode.fx = mousedownNode.x;
                            mousedownNode.fy = mousedownNode.y;
                        }

                        this.restart();
                    })
                    .on('mouseup', function (d: data.VNode) {
                        nodemouseup(d, this);
                    });

                // show node IDs
                g.append('svg:text')
                    .attr('x', 0)
                    .attr('y', 4)
                    .attr('class', 'id')
                    .text((d: data.VNode) => d.name);

                circle = g.merge(circle);

                // set the graph in motion
                (<any>this.forceLayout.nodes(nodes).force('link')).links(links);

                this.forceLayout.alphaTarget(0.3).restart();
            }

            let mousedown = (pos: [number, number]) => {
                if (d3.event.buttons == 4) {
                    this.markOffsetBaseX = this.centerOffsetX;
                    this.markOffsetBaseY = this.centerOffsetY;
                    this.markPosX = pos[0];
                    this.markPosY = pos[1];
                    return;
                }

                // because :active only works in WebKit?
                this.selfDom.classed('active', true);

                if (mousedownNode || mousedownLink) return;

                if (d3.event.ctrlKey) {
                    // insert new node at point
                    const node = new data.VNode("未定义");
                    (<any>node).x = pos[0];
                    (<any>node).y = pos[1];
                    node.listenNameChange(this.restart);
                    nodes.push(node);
                } else {
                    selectedNode = null;
                    selectedLink = null;
                }

                this.restart();
            }

            let mousemove = (pos: [number, number]) => {
                if (d3.event.buttons == 4) {
                    this.centerOffsetX = this.markOffsetBaseX + (pos[0] - this.markPosX);
                    this.centerOffsetY = this.markOffsetBaseY + (pos[1] - this.markPosY);
                    this.repos();
                    return;
                }

                if (!mousedownNode) return;

                if (d3.event.buttons == 1) {
                    // update drag line
                    dragLine.attr('d', `M${mousedownNode.x},${mousedownNode.y}L${pos[0]},${pos[1]}`);
                } else if (d3.event.buttons == 2) {
                    mousedownNode.fx = pos[0];
                    mousedownNode.fy = pos[1];
                }

                this.restart();
            }

            let mouseup = () => {
                if (mousedownNode) {
                    // hide drag line
                    dragLine
                        .classed('hidden', true)
                        .style('marker-end', '');
                }

                // because :active only works in WebKit?
                this.selfDom.classed('active', false);

                // clear mouse event vars
                resetMouseVars();
            }

            let spliceLinksForNode = (node) => {
                const toSplice = links.filter((l) => l.source === node || l.target === node);
                for (const l of toSplice) {
                    links.splice(links.indexOf(l), 1);
                }
            }

            // only respond once per keydown
            let lastKeyDown = -1;
            
            let keydown = () => {
                //d3.event.preventDefault();
            
                if (lastKeyDown !== -1) return;
                lastKeyDown = d3.event.keyCode;
            
                if (!selectedNode && !selectedLink) return;
            
                switch (d3.event.keyCode) {
                    case 8:  // bacespace
                    case 46: // delete
                        if (selectedNode) {
                            nodes.splice(nodes.indexOf(selectedNode), 1);
                            spliceLinksForNode(selectedNode);
                        } else if (selectedLink) {
                            links.splice(links.indexOf(selectedLink), 1);
                        }
                        selectedLink = null;
                        selectedNode = null;
                        this.restart();
                        break;
                }
            }
            
            let keyup = () => {
                lastKeyDown = -1;
            }

            // app starts here
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].listenNameChange(this.restart);
            }

            this.selfDom.on('mousedown', function () { mousedown(d3.mouse(this)); })
                .on('mousemove', function () { mousemove(d3.mouse(this)); })
                .on('mouseup', mouseup)
                .on('wheel.zoom', () => {
                    if (d3.event.wheelDelta > 0) {
                        if (this.scale <= 2.3) {
                            this.scale *= 1.1;
                        }
                    } else {
                        if (this.scale >= 0.3) {
                            this.scale /= 1.1;
                        }
                    }
                    this.restart();
                    this.repos();
                });
            this.parent.attr('tabindex', 1).on('keydown', keydown).on('keyup', keyup);
            this.restart();
        }

        //invertColor(hex: string, bw: boolean) {
        //    if (hex.indexOf('#') === 0) {
        //        hex = hex.slice(1);
        //    }
        //    // convert 3-digit hex to 6-digits.
        //    if (hex.length === 3) {
        //        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        //    }
        //    if (hex.length !== 6) {
        //        throw new Error('Invalid HEX color.');
        //    }
        //    var r = parseInt(hex.slice(0, 2), 16),
        //        g = parseInt(hex.slice(2, 4), 16),
        //        b = parseInt(hex.slice(4, 6), 16);
        //    if (bw) {
        //        // http://stackoverflow.com/a/3943023/112731
        //        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        //            ? '#000000'
        //            : '#FFFFFF';
        //    }
        //    // invert color components
        //    let rstr = (255 - r).toString(16);
        //    let gstr = (255 - g).toString(16);
        //    let bstr = (255 - b).toString(16);
        //    // pad each with zeros and return
        //    return "#" + this.padZero(rstr, rstr.length) + this.padZero(gstr, gstr.length) + this.padZero(bstr, bstr.length);
        //}

        //padZero(str: string, len: number) {
        //    len = len || 2;
        //    var zeros = new Array(len).join('0');
        //    return (zeros + str).slice(-len);
        //}

        resize() {
            this.width = parseInt(this.parent.style("width"));
            this.height = parseInt(this.parent.style("height"));
            this.selfDom
                .attr('width', this.width / this.scale)
                .attr('height', this.height / this.scale)
                .style('top', () => -this.height / this.scale * (1 - this.scale) / 2)
                .style('left', () => -this.width / this.scale * (1 - this.scale) / 2)
                .style('transform', () => "scale(" + this.scale + ")");
            this.repos();
        }

        repos() {
            this.forceLayout.force('x', d3.forceX(this.width / this.scale / 2 + this.centerOffsetX)).force('y', d3.forceY(this.height / this.scale / 2 + this.centerOffsetY));
        }
    }
}

export { graph }