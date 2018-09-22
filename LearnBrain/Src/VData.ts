import * as d3 from "d3";

module data {
    let baseColor: d3.ScaleOrdinal<string, string> = d3.scaleOrdinal(d3.schemeCategory10);;

    export class VNode {
        listener: (() => void) | null
        textObject: string | null = null;

        constructor(public name: string, public color?: string, public guid?: string) {
            if (this.guid == undefined) {
                this.guid = this.genGUID();
            }
            
            if (this.color == undefined) {
                this.color = baseColor(name);
            }
        }

        changeName(name: string) {
            if (this.name != name) {
                this.name = name;
                this.color = baseColor(name);
                if (this.listener) {
                    this.listener();
                }
            }
        }

        listenNameChange(onNameChange: () => void) {
            this.listener = onNameChange;
        }

        Save(): string {
            return JSON.stringify({
                name: this.name,
                color: this.color,
                guid: this.guid,
                textObject: this.textObject,
            });
        }

        Load(json: string) {
            let dat = JSON.parse(json);
            this.name = dat.name;
            this.color = dat.color;
            this.guid = dat.guid;
            this.textObject = dat.textObject;
        }

        //private hash(val: string): number {
        //    let hash = 0, i, chr;
        //    if (val.length === 0) return hash;
        //    for (i = 0; i < val.length; i++) {
        //        chr = val.charCodeAt(i);
        //        hash = ((hash << 5) - hash) + chr;
        //        hash |= 0; // Convert to 32bit integer
        //    }
        //    return hash;
        //};

        private genGUID(): string {
            var len = 32;//32长度
            var radix = 16;//16进制
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = [], i;
            radix = radix || chars.length;
            if (len) {
                let shift = 0;
                for (i = 0; i < len; i++) {
                    uuid[i + shift] = chars[0 | Math.random() * radix];
                    if ((7 == i) || (11 == i) || (15 == i) || (19 == i)) {
                        shift++;
                        uuid[i + shift] = '-';
                    }
                }
            }
            else {
                var r;
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }
            let str = uuid.join('').toLowerCase();

            return str;
        }
    }

    export class VLink {
        constructor(public source: VNode, public target: VNode, public left: boolean, public right: boolean) { }

        Save(): string {
            return JSON.stringify({
                source: this.source.guid,
                target: this.target.guid,
                left: this.left,
                right: this.right,
            });
        }

        Load(json: string, search: (guid: string) => VNode) {
            let obj = JSON.parse(json);
            this.source = search(obj.source);
            this.target = search(obj.target);
            this.left = obj.left;
            this.right = obj.right;
        }
    }

    export class VData {
        public nodes: Array<VNode>;
        public links: Array<VLink>;

        constructor() {
            this.nodes = new Array<VNode>();
            this.links = new Array<VLink>();

            // init test
            //this.nodes.push(new VNode("有理数"));
            //this.nodes.push(new VNode("无理数"));
            //this.nodes.push(new VNode("有理数性质"));
            //
            //this.links.push(new VLink(this.nodes[0], this.nodes[1], false, true));
            //this.links.push(new VLink(this.nodes[1], this.nodes[2], false, true));
        }

        // 3 level
        useRelationPainter(myNode: VNode, targetNode: VNode): string {
            let baseColor = d3.rgb(myNode.color).brighter().brighter().toString();
            let darkerColor = myNode.color;
            let darkestColor = d3.rgb(myNode.color).darker().darker().toString();
            if (myNode === targetNode) {
                return baseColor;
            } else {
                for (let i = 0; i < this.links.length; i++) {
                    if (this.links[i].source === targetNode && this.links[i].target === myNode) {
                        return darkerColor;
                    } else if (this.links[i].source === myNode && this.links[i].target === targetNode) {
                        return darkerColor;
                    }
                }
                return darkestColor;
            }
        }

        Save(): string {
            let nodesStr = new Array<string>();
            for (let i = 0; i < this.nodes.length; i++) {
                nodesStr.push(this.nodes[i].Save());
            }

            let linksStr = new Array<string>();
            for (let i = 0; i < this.links.length; i++) {
                linksStr.push(this.links[i].Save());
            }

            let jsonArr = { nodes: nodesStr, links: linksStr }
            return JSON.stringify(jsonArr);
        }

        Load(dat: string) {
            this.Clear();

            let datJson = JSON.parse(dat);
            let nodesJson = datJson.nodes;
            for (let i = 0; i < nodesJson.length; i++) {
                let nodei = new VNode("");
                nodei.Load(nodesJson[i]);
                this.nodes.push(nodei);
            }

            let linksJson = datJson.links;
            for (let i = 0; i < linksJson.length; i++) {
                let linki = new VLink(null,null,false,false);
                linki.Load(linksJson[i], (guid: string): VNode => { return this.findNodeByGUID(guid); });
                this.links.push(linki);
            }
        }

        Clear() {
            this.nodes.splice(0, this.nodes.length);
            this.links.splice(0, this.links.length);
        }

        private findNodeByGUID(guid: string): VNode {
            for (let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].guid == guid) {
                    return this.nodes[i];
                }
            }

            console.error('error at find node, load data error');
            return null;
        }
    }

    export var globalData = new VData();
}

export { data }