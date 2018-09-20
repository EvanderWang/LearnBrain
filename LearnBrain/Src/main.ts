import { data } from "./VData"
import { graph } from "./VGraph";
import { text } from "./VText";


module module_main{
    export function main() {
        //graph.VIconMngr.registIcon({ name: "brush", unicodeAscii: "\uf55d" });
        //graph.VIconMngr.registIcon({ name: "book-open", unicodeAscii: "\uf518" });

        let graphData = new data.VData();
        let graphEditor = new graph.VGraph();
        let textEditor = new text.VText();
    }
}

export { module_main }
