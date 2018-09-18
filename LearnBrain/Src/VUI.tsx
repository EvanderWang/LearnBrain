// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
import { Button, Card, Elevation } from "@blueprintjs/core";
import * as PropTypes from "prop-types";

module ui {
    export class VAddNodeBoard extends React.Component {
        static propTypes = {
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }

        constructor(props) {
            super(props);
        }

        componentDidMount() {
            // Subscribe to changes
        }

        componentWillUnmount() {
            // Clean up listener
        }

        handleChange() {
            // Update component state whenever the data source changes
        }

        onAddNode() {
            console.log("add");
        }

        render() {
            return (
                <div style={{ position: 'absolute', width: 400, height: 200, zIndex: 1 }}>
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