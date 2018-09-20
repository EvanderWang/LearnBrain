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
            this.name = name;
            this.color = baseColor(name);
            if (this.listener) {
                this.listener();
            }
        }

        listenNameChange(onNameChange: () => void) {
            this.listener = onNameChange;
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
        constructor(public source: VNode, public target: VNode, public left: boolean, public right: boolean) {

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
    }
}

export { data }