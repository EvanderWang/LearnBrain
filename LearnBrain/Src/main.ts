import { data } from "./VData"
import { graph } from "./VGraph";
import { text } from "./VText";


module module_main{
    export function main() {
        let graphData = new data.VData();
        let textEditor = new text.VText();
        let graphEditor = new graph.VGraph(graphData, (cur: data.VNode | null, last: data.VNode | null) => {
            textEditor.setDisplayNode(cur);
        });

        //window.addEventListener('keypress', () => {
        //    graphData.change();
        //    graphEditor.restart();
        //});

        // test use
        //(<any>window).data = graphData;
    }
}

export { module_main }
