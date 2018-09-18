//declare var React: any;
declare var ReactDOM: any;
declare var TheGraph: any;

import { data } from "./VData"
import * as React from "react";
import { ui } from "./VUI";

module graph {
    export class VSIcon {
        name: string;
        unicodeAscii: string;
    }

    export class VIconMngr {
        constructor() { }

        static ListIcon(): Array<VSIcon> {
            let ftkeys = Object.keys(TheGraph.FONT_AWESOME);
            let rt = new Array<VSIcon>();
            for (let i = 0; i < ftkeys.length; i++) {
                let ico = new VSIcon();
                ico.name = ftkeys[i];
                ico.unicodeAscii = TheGraph.FONT_AWESOME[ftkeys[i]];
                rt.push(ico);
            }
            return rt;
        }

        static registIcon(i: VSIcon) {
            if (TheGraph.FONT_AWESOME[i.name] == undefined) {
                TheGraph.FONT_AWESOME[i.name] = i.unicodeAscii;
            }
        }

        static registIcons(is: Array<VSIcon>) {
            for (let i = 0; i < is.length; i++) {
                this.registIcon(is[i]);
            }
        }
    }

    export class VPort {
        name: string;
        type: string;
    }

    export class VLibrary {
        name: string;
        description: string;
        icon: string;
        inports: Array<VPort>;
        outports: Array<VPort>;
    }

    export class VGraph {
        element: any;
        library: any;

        constructor(private drawData: data.VData) {
            this.initLibrary();

            var contextMenus = {
                main: {
                    icon: "cog",
                    e4: {
                        icon: "trash-o",
                        iconLabel: "addNode",
                        action: (fbpGraph, itemKey, item) => {
                            let tansStr: string = document.getElementsByClassName("view")[0].attributes["transform"].value;
                            let re = /,|\(|\)/;
                            let trans = tansStr.split(re);

                            let offsetx = Number(trans[5]);
                            let offsety = Number(trans[6]);
                            let scale = Number(trans[4]);

                            let name = prompt("节点名称", "");
                            fbpGraph.addNode(name, "basic node", { x: (fbpGraph.position.x - offsetx) / scale, y: (fbpGraph.position.y - offsety) / scale });
                        }
                    }
                },
                selection: null,
                nodeInport: null,
                nodeOutport: null,
                graphInport: null,
                graphOutport: null,
                edge: {
                    icon: "long-arrow-right",
                    s4: {
                        icon: "trash-o",
                        iconLabel: "delete",
                        action: (fbpGraph, itemKey, item) => {
                            fbpGraph.removeEdge(item.from.node, item.from.port, item.to.node, item.to.port);
                        }
                    }
                },
                node: {
                    s4: {
                        icon: "trash-o",
                        iconLabel: "delete",
                        action: (fbpGraph, itemKey, item) => {
                            fbpGraph.removeNode(itemKey);
                        }
                    },
                },
                group: {
                    icon: "th",
                    s4: {
                        icon: "trash-o",
                        iconLabel: "ungroup",
                        action: (graph, itemKey, item) => {
                            graph.removeGroup(itemKey);
                        },
                    },
                },
            };

            var graph = document.getElementById('graph_editor');
            graph.className = 'the-graph-dark';

            let graph_area = document.getElementById('graph_area');


            var props = {
                width: screen.width,
                height: screen.height,
                graph: drawData.graphData,
                library: this.library,
                menus: contextMenus,
                nodeIcons: {},

                onNodeSelection: () => {
                    console.log("onselect");
                },
                onEdgeSelection: () => {
                    console.log("onselect");
                },
            }

            this.element = React.createElement(TheGraph.App, props);
            ReactDOM.render(this.element, graph);

            ReactDOM.render(<ui.VAddNodeBoard />, document.getElementById('menu'));
        }

        initLibrary() {
            this.library = new Object();
            let baseLib = new VLibrary();
            baseLib.name = "basic node";
            baseLib.description = "basic";
            baseLib.icon = "book-open";
            baseLib.inports = new Array<VPort>();
            let inport = new VPort();
            inport.name = "in";
            inport.type = "common";
            baseLib.inports.push(inport);
            baseLib.outports = new Array<VPort>();
            let outport = new VPort();
            outport.name = "out";
            outport.type = "common";
            baseLib.outports.push(outport);
            this.registLibrary(baseLib);
        }

        registLibrary(lib: VLibrary) {
            this.library[lib.name] = lib;
        }
    }
}

export { graph }