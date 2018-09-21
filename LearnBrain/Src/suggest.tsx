import * as React from "react";

import { H5, MenuItem, Switch, ButtonGroup, Button } from "@blueprintjs/core";
import { Example, IExampleProps } from "@blueprintjs/docs-theme";
import { Suggest } from "@blueprintjs/select";
import { nodeSelectProps } from "./nodes";
import { data } from "./VData";
import { graph } from "./VGraph";

const NodeSuggest = Suggest.ofType<data.VNode>();

export interface ISuggestProp {
    graphEditor: graph.VGraph;
    save: () => void;
    load: () => void;
}

export interface ISuggestState {
    closeOnSelect: boolean;
    node: data.VNode;
    minimal: boolean;
    openOnKeyDown: boolean;
    resetOnSelect: boolean;
    resetOnQuery: boolean;
}

export class NodeSuggestClass extends React.PureComponent<ISuggestProp, ISuggestState> {
    public state: ISuggestState = {
        closeOnSelect: true,
        node: data.globalData.nodes[0],
        minimal: true,
        openOnKeyDown: false,
        resetOnQuery: true,
        resetOnSelect: false,
    };

    private onLoad = () => {
        this.props.load();
    }

    private onSave = () => {
        this.props.save();
    }

    public render() {
        const { node, minimal, ...flags } = this.state;
        return (
            <ButtonGroup>
                <Button icon="folder-open" onClick={this.onLoad}>Load</Button>
                <Button icon="floppy-disk" onClick={this.onSave}>Save</Button>
                <NodeSuggest
                    {...nodeSelectProps}
                    {...flags}
                    inputValueRenderer={this.renderInputValue}
                    noResults={<MenuItem disabled={true} text="No results." />}
                    onItemSelect={this.handleValueChange}
                    popoverProps={{ minimal }}
                />
            </ButtonGroup>
        );
    }

    private renderInputValue = (node: data.VNode) => node.name;

    private handleValueChange = (node: data.VNode) => {
        this.setState({ node });
        this.props.graphEditor.setSelectNode(node);
    };

    private handleSwitchChange(prop: keyof ISuggestState) {
        return (event: React.FormEvent<HTMLInputElement>) => {
            const checked = event.currentTarget.checked;
            this.setState(state => ({ ...state, [prop]: checked }));
        };
    }
}