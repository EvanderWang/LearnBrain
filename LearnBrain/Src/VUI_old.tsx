import * as React from "react";
import { Button, Card, Elevation, Divider, EditableText } from "@blueprintjs/core";

module ui {
    export class VAddNodeBoard extends React.Component<{ display: boolean, onAdd: (nodeName: string) => void }, {inputDat: string}> {
        intervalID: number;

        inputNodeName: string = "";

        constructor(props) {
            super(props);
            this.state = { inputDat: "" }
        }

        componentDidMount() {
            // Subscribe to changes
        }

        componentWillUnmount() {
            // Clean up listener
        }

        shouldComponentUpdate(nextProps: Readonly<{ display: boolean, onAdd: (nodeName: string) => void }>, nextState: Readonly<{}>, nextContext: any): boolean {
            return nextProps.display != this.props.display;
        }

        handleChange() {
            // Update component state whenever the data source changes
        }

        onAddNode = () => {
            this.props.onAdd(this.inputNodeName);
            this.setState({ inputDat: "" });
            //this.inputNodeName = "";
        }

        render() {
            const widthVal = 400;
            const heightVal = 200;
            const leftVal = document.body.clientWidth / 2 - widthVal / 2;
            const topVal = document.body.clientHeight / 2 - heightVal / 2;

            return (
                <div style={{ position: 'absolute', width: widthVal, height: heightVal, zIndex: 1, left: leftVal, top: topVal, display: this.props.display ? 'inline' : 'none' }}>
                    <Card interactive={false} elevation={Elevation.FOUR}>
                        <p>Create New Node</p>
                        <p><Divider /></p>
                        <p>Node Name: <EditableText defaultValue={this.state.inputDat} placeholder={"enter a node name"} onConfirm={(inputVal: string) => {
                            this.inputNodeName = inputVal;
                        }} onChange={(inputVal: string) => {
                            this.setState((state) => {
                                return { inputDat: inputVal }
                            });
                        }} /></p>
                        <p><Divider /></p>
                        <Button icon="add" onClick={this.onAddNode}>Add Node</Button>
                    </Card>
                </div>
            )
        }
    }

}

export { ui }