import { data } from "./VData"
import { graph } from "./VGraph";
import { text } from "./VText";

//import { MultiSelectExample } from "./select";
import { NodeSuggestClass } from "./suggest";

import * as React from "react";
import * as ReactDOM from "react-dom";

module module_main{
    export function main() {
        //let graphData = new data.VData();
        let textEditor = new text.VText();
        let graphEditor = new graph.VGraph(data.globalData, (cur: data.VNode | null, last: data.VNode | null) => {
            data.globalData.selectNode(cur);
            textEditor.setDisplayNode(cur);
        });

        let save = () => {
            textEditor.preSave();

            let now = new Date();
            let text = data.globalData.Save();
            let blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            let anchor = document.createElement('a');
            anchor.download = "LearnBrain_" + now.toLocaleString() + ".lb";
            anchor.href = ((<any>window).webkitURL || window.URL).createObjectURL(blob);
            anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
            anchor.click();
        }
            ;
        let mse = React.createElement(NodeSuggestClass, {
            graphEditor: graphEditor,
            save: save,
            load: () => {
                document.getElementById('load_hidden_file').click();
            }
        }, null);
        ReactDOM.render(mse, document.getElementById('menu'));

        let fileinput = <HTMLInputElement>document.getElementById('load_hidden_file');
        fileinput.addEventListener('change', (ev: Event) => {
            var reader = new FileReader();
            reader.onload = (dat) => {
                let datStr: string = (<any>dat.currentTarget).result;
                data.globalData.Load(datStr, graphEditor.restart);
                graphEditor.restart();
            };
            reader.readAsText((<any>ev.target).files[0])
        });

        window.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.ctrlKey && ev.keyCode == 83) {
                save();
                ev.preventDefault();
                return false;
            }
        });

        // test use
        (<any>window).data = data.globalData;
    }
}

export { module_main }
