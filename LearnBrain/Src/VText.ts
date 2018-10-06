declare var Quill: any;

import * as $ from "jquery";
import { data } from "./VData";
import { attrlistener } from "./VAttrListener";

module text {
    class VSwitcher {
        val: boolean = true;
    }

    class VTooltipShownReceiver implements attrlistener.IVAttrChangeReceiver {
        lastRange: { index: number, length: number } | null;

        constructor(private tooltip: Element, private quill: any, private MathQuill: any, private fromButton: VSwitcher) {
            this.quill.on('selection-change', (range, oldRange, source) => {
                this.lastRange = range;
            });
        }

        onchange(attrName: string, changedData: string) {
            if (this.lastRange && changedData.indexOf("ql-hidden") == -1) {
                let quill_editor = document.getElementById("quill_editor");
                let quill_area = document.getElementById("quill_area");
                let select_bounds = this.quill.getBounds(this.lastRange.index, 0);
                let select_fixleft = quill_area.offsetLeft + quill_editor.offsetLeft + select_bounds.left;
                let select_fixtop = quill_area.offsetTop + quill_editor.offsetTop + select_bounds.top;

                let showposleft = select_fixleft - this.tooltip.clientWidth / 2;
                let showpostop = select_fixtop + select_bounds.height;

                this.tooltip.setAttribute("style", "position: fixed; z-index: 10;left: " + showposleft + "px; top: " + showpostop + "px");

                if (!this.fromButton.val) {
                    this.fromButton.val = true;
                    let mode = this.tooltip.getAttribute('data-mode');
                    if (mode == "formula") {
                        this.MathQuill.focus();
                    }
                }
            }
        }
    }

    class VTooltipModeReceiver implements attrlistener.IVAttrChangeReceiver {
        constructor(/*private tooltip: Element, private quill: any*/) {}

        onchange(attrName: string, changedData: string) {
            let mathinput = document.getElementById("ql_tooltip_input_math");
            let normalinput = document.getElementById("ql_tooltip_input_normal");

            if (changedData == "formula") {
                mathinput.style.display = "inline-block";
                normalinput.style.display = "none";
            } else {
                mathinput.style.display = "none";
                normalinput.style.display = "inline-block";
            }
        }
    }


    export class VText {
        quill: any;
        currentNode: data.VNode | null = null;

        constructor() {
            let Font = Quill.import('formats/font');
            Font.whitelist = ['monaco'];
            Quill.register(Font, true);

            let Size = Quill.import('attributors/style/size');
            Size.whitelist = ['16px', '20px', '24px', '28px', '32px'];
            Quill.register(Size, true);

            var toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': Size.whitelist }],  // custom dropdown
                //[{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': Font.whitelist }],
                [{ 'align': [] }],

                ['link', 'image', 'video'],
                ['formula'],

                //['clean'],                                         // remove formatting button
                ['lb-format'],
                ['lb-formula'],
            ];

            this.quill = new Quill('#quill_editor', {
                modules: {
                    //formula: true,
                    toolbar: toolbarOptions
                },
                theme: 'snow',
            });
            

            // set quill tooltip manager
            let fromButtonSwitcher = new VSwitcher();

            this.quill.enableMathQuillFormulaAuthoring((MathQuill: any) => {
                let tooltip = document.getElementsByClassName("ql-tooltip")[0];
                tooltip.setAttribute("data-mode", "formula");
                let receiver_shown = new VTooltipShownReceiver(tooltip, this.quill, MathQuill, fromButtonSwitcher);
                let receiver_mode = new VTooltipModeReceiver();
                let listener_shown = new attrlistener.VAttrChangeListener(tooltip, "class", receiver_shown);
                let listener_mode = new attrlistener.VAttrChangeListener(tooltip, "data-mode", receiver_mode);
            });

            this.quill.format('font', 'monaco');
            this.quill.format('size', '20px');
            this.quill.disable();

            this.quill.keyboard.addBinding({
                key: 220, // BACK_SLASH
                shortKey: true
            }, (range, context) => {
                fromButtonSwitcher.val = false;
                this.quill.theme.tooltip.edit('formula');
            });

            this.quill.keyboard.addBinding({
                key: 42, // MACOS BACK_SLASH
                shortKey: true
            }, (range, context) => {
                fromButtonSwitcher.val = false;
                this.quill.theme.tooltip.edit('formula');
            });

            let doFormat = () => {
                let length = this.quill.getLength();
                this.quill.formatText(0, length, 'font', 'monaco');
                this.quill.formatText(0, length, 'size', '20px');
            };

            var customFormatButton = document.querySelector('.ql-lb-format');
            customFormatButton.addEventListener('click', doFormat);

            window.addEventListener('keydown', (ev: KeyboardEvent) => {
                if (ev.key == 'm' && ev.ctrlKey) {
                    doFormat();
                    ev.preventDefault();
                    return false;
                }
            });

            this.quill.on('text-change', (delta, oldDelta, source) => {
                if (source == 'user') {
                    let ctns = this.quill.getContents();
                    if (ctns.ops.length > 0) {
                        let line1: string = ctns.ops[0].insert;
                        let lidx = line1.indexOf('<');
                        let ridx = line1.indexOf('>');
                        if (lidx != -1 && ridx != -1) {
                            let name = line1.substr(lidx + 1, ridx - lidx - 1);
                            if (this.currentNode) {
                                this.currentNode.changeName(name);
                            } else {
                                console.error('enable state error.');
                            }
                        }
                    }
                }
            });

            // test use
            (<any>window).quill = this.quill;
        }

        setDisplayNode(node: data.VNode | null) {
            if (this.currentNode) {
                this.currentNode.textObject = JSON.stringify(this.quill.getContents());
            }

            if (node) {
                if (node.textObject) {
                    this.quill.setContents(JSON.parse(node.textObject));
                } else {
                    this.quill.setContents(JSON.parse('{"ops":[{"insert":"<' + node.name + '>\\n\\n\\n"}]}'));
                }
                this.quill.enable();
                this.quill.focus();
                let len = this.quill.getLength();
                this.quill.setSelection(len);
            } else {
                this.quill.disable();
                this.quill.setContents();
            }

            this.currentNode = node;
        }

        preSave() {
            if (this.currentNode) {
                this.currentNode.textObject = JSON.stringify(this.quill.getContents());
            }
        }
    }
}

export { text }