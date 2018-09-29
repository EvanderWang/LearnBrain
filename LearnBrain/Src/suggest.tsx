import * as React from "react";
import * as $ from "jquery";

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
        resetOnSelect: true,
    };

    private onLoad = () => {
        this.props.load();
    }

    private onSave = () => {
        this.props.save();
    }

    hotkeyLoad(e: any) {
        window.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key == 'o' && ev.ctrlKey) {
                e.buttonRef.click()
                ev.preventDefault();
                return false;
            }
        });
    }

    hotkeySave(e: any) {
        window.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key == 's' && ev.ctrlKey) {
                e.buttonRef.click()
                ev.preventDefault();
                return false;
            }
        });
    }

    hotkeySearch(e: any) {
        window.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.key == 'f' && ev.ctrlKey) {
                $(e.input).trigger('focus');
                ev.preventDefault();
                return false;
            }
        });
    }

    public render() {
        const { node, minimal, ...flags } = this.state;
        return (
            <ButtonGroup>
                <Button icon="folder-open" onClick={this.onLoad} ref={this.hotkeyLoad}>Load</Button>
                <Button icon="floppy-disk" onClick={this.onSave} ref={this.hotkeySave}>Save</Button>
                <NodeSuggest ref={this.hotkeySearch}
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