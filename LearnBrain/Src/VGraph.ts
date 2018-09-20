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

        constructor() {
            let tick = () => {
                // draw directed edges with proper padding from node centers
                path.attr('d', (d: any) => {
                    const deltaX = d.target.x - d.source.x;
                    const deltaY = d.target.y - d.source.y;
                    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const normX = deltaX / dist;
                    const normY = deltaY / dist;
                    const sourcePadding = d.left ? 17 : 12;
                    const targetPadding = d.right ? 17 : 12;
                    const sourceX = d.source.x + (sourcePadding * normX);
                    const sourceY = d.source.y + (sourcePadding * normY);
                    const targetX = d.target.x - (targetPadding * normX);
                    const targetY = d.target.y - (targetPadding * normY);

                    return `M${sourceX},${sourceY}L${targetX},${targetY}`;
                });

                circle.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
            }

            // set up SVG for D3
            const colors = d3.scaleOrdinal(d3.schemeCategory10);

            this.parent = d3.select('#graph_area');
            this.selfDom = this.parent.append('svg').attr('oncontextmenu', 'return false;');
            this.forceLayout = d3.forceSimulation()
                .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
                .force('charge', d3.forceManyBody().strength(-500))
                .on('tick', tick);

            this.resize();
            window.addEventListener('resize', () => { this.resize(); })

            // set up initial nodes and links
            //  - nodes are known by 'id', not by index in array.
            //  - reflexive edges are indicated on the node (as a bold black circle).
            //  - links are always source < target; edge directions are set by 'left' and 'right'.
            const nodes = [
                { id: 0, reflexive: false },
                { id: 1, reflexive: true },
                { id: 2, reflexive: false }
            ];
            let lastNodeId = 2;
            const links = [
                { source: nodes[0], target: nodes[1], left: false, right: true },
                { source: nodes[1], target: nodes[2], left: false, right: true }
            ];

            // init D3 drag support
            const drag = d3.drag()
                .on('start', (d: any) => {
                    if (!d3.event.active) this.forceLayout.alphaTarget(0.3).restart();

                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (d: any) => {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                })
                .on('end', (d: any) => {
                    if (!d3.event.active) this.forceLayout.alphaTarget(0);

                    d.fx = null;
                    d.fy = null;
                });

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
            let restart = () => {
                // path (link) group
                path = path.data(links);

                // update existing links
                path.classed('selected', (d: any) => d === selectedLink)
                    .style('marker-start', (d: any) => d.left ? 'url(#start-arrow)' : '')
                    .style('marker-end', (d: any) => d.right ? 'url(#end-arrow)' : '');

                // remove old links
                path.exit().remove();

                // add new links
                path = path.enter().append('svg:path')
                    .attr('class', 'link')
                    .classed('selected', (d: any) => d === selectedLink)
                    .style('marker-start', (d: any) => d.left ? 'url(#start-arrow)' : '')
                    .style('marker-end', (d: any) => d.right ? 'url(#end-arrow)' : '')
                    .on('mousedown', (d: any) => {
                        if (d3.event.ctrlKey) return;

                        // select link
                        mousedownLink = d;
                        selectedLink = (mousedownLink === selectedLink) ? null : mousedownLink;
                        selectedNode = null;
                        restart();
                    })
                    .merge(path);

                // circle (node) group
                // NB: the function arg is crucial here! nodes are known by id, not by index!
                circle = circle.data(nodes, (d: any) => d.id);

                // update existing nodes (reflexive & selected visual states)
                circle.selectAll('circle')
                    .style('fill', (d: any) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id))
                    .classed('reflexive', (d: any) => d.reflexive);

                // remove old nodes
                circle.exit().remove();

                // add new nodes
                const g = circle.enter().append('svg:g');

                g.append('svg:circle')
                    .attr('class', 'node')
                    .attr('r', 12)
                    .style('fill', (d: any) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id))
                    .style('stroke', (d: any) => d3.rgb(colors(d.id)).darker().toString())
                    .classed('reflexive', (d: any) => d.reflexive)
                    .on('mouseover', function (d: any) {
                        if (!mousedownNode || d === mousedownNode) return;
                        // enlarge target node
                        d3.select(this).attr('transform', 'scale(1.1)');
                    })
                    .on('mouseout', function (d: any) {
                        if (!mousedownNode || d === mousedownNode) return;
                        // unenlarge target node
                        d3.select(this).attr('transform', '');
                    })
                    .on('mousedown', (d: any) => {
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

                        restart();
                    })
                    .on('mouseup', function (d: any) {
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
                        d3.select(this).attr('transform', '');

                        // add link to graph (update if exists)
                        // NB: links are strictly source < target; arrows separately specified by booleans
                        const isRight = mousedownNode.id < mouseupNode.id;
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
                        restart();
                    });

                // show node IDs
                g.append('svg:text')
                    .attr('x', 0)
                    .attr('y', 4)
                    .attr('class', 'id')
                    .text((d: any) => d.id);

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

                if (d3.event.ctrlKey || mousedownNode || mousedownLink) return;

                // insert new node at point
                //const point = d3.mouse(this.parent);
                const node = { id: ++lastNodeId, reflexive: false, x: pos[0], y: pos[1] };
                nodes.push(node);

                restart();
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

                restart();
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
                d3.event.preventDefault();

                if (lastKeyDown !== -1) return;
                lastKeyDown = d3.event.keyCode;

                // ctrl
                if (d3.event.keyCode === 17) {
                    circle.call(drag);
                    this.selfDom.classed('ctrl', true);
                }

                if (!selectedNode && !selectedLink) return;

                switch (d3.event.keyCode) {
                    case 8: // backspace
                    case 46: // delete
                        if (selectedNode) {
                            nodes.splice(nodes.indexOf(selectedNode), 1);
                            spliceLinksForNode(selectedNode);
                        } else if (selectedLink) {
                            links.splice(links.indexOf(selectedLink), 1);
                        }
                        selectedLink = null;
                        selectedNode = null;
                        restart();
                        break;
                    case 66: // B
                        if (selectedLink) {
                            // set link direction to both left and right
                            selectedLink.left = true;
                            selectedLink.right = true;
                        }
                        restart();
                        break;
                    case 76: // L
                        if (selectedLink) {
                            // set link direction to left only
                            selectedLink.left = true;
                            selectedLink.right = false;
                        }
                        restart();
                        break;
                    case 82: // R
                        if (selectedNode) {
                            // toggle node reflexivity
                            selectedNode.reflexive = !selectedNode.reflexive;
                        } else if (selectedLink) {
                            // set link direction to right only
                            selectedLink.left = false;
                            selectedLink.right = true;
                        }
                        restart();
                        break;
                }
            }

            function keyup() {
                lastKeyDown = -1;

                // ctrl
                if (d3.event.keyCode === 17) {
                    circle.on('.drag', null);
                    this.selfDom.classed('ctrl', false);
                }
            }

            // app starts here
            this.selfDom.on('mousedown', function () { mousedown(d3.mouse(this)); })
                .on('mousemove', function () { mousemove(d3.mouse(this)); })
                .on('mouseup', mouseup);
            //d3.select(window)
            //    .on('keydown', keydown)
            //    .on('keyup', keyup);
            restart();
        }

        resize() {
            this.width = parseInt(this.parent.style("width"));
            this.height = parseInt(this.parent.style("height"));
            this.selfDom.attr('width', this.width).attr('height', this.height);
            this.repos();
        }

        repos() {
            this.forceLayout.force('x', d3.forceX(this.width / 2 + this.centerOffsetX)).force('y', d3.forceY(this.height / 2 + this.centerOffsetY));
        }
    }
}

export { graph }