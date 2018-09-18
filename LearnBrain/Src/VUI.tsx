import * as React from "react";
import { Button, Card, Elevation } from "@blueprintjs/core";

module ui {
    export class VAddNodeBoard extends React.Component<{ x: number, y: number, display: boolean, onAdd: () => void }> {
        intervalID: number;

        constructor(props) {
            super(props);
        }

        componentDidMount() {
            // Subscribe to changes
        }

        componentWillUnmount() {
            // Clean up listener
        }

        shouldComponentUpdate(nextProps: Readonly<{ x: number, y: number, display: boolean, onAdd: () => void }>, nextState: Readonly<{}>, nextContext: any): boolean {
            return (nextProps.x != this.props.x) || (nextProps.y != this.props.y) || (nextProps.display != this.props.display);
        }

        handleChange() {
            // Update component state whenever the data source changes
        }

        onAddNode = () => {
            this.props.onAdd();
        }

        render() {
            return (
                <div style={{ position: 'absolute', width: 400, height: 200, zIndex: 1, left: this.props.x, top: this.props.y, display: this.props.display ? 'inline' : 'none' }}>
                    <Card interactive={false} elevation={Elevation.FOUR}>
                        <h5><a href="#">Card heading</a></h5>
                        <p>Card content</p>
                        <Button onClick={this.onAddNode}>Submit</Button>
                    </Card>
                </div>
            )
        }
    }

}

export { ui }