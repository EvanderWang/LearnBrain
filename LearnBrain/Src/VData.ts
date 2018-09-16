declare var TheGraph: any;

module data {
    export class VData {
        public graphData: any; 

        constructor() {
            this.graphData = new TheGraph.fbpGraph.Graph();

            // test use
            (<any>window).grap = this.graphData;
        }
    }
}

export { data }