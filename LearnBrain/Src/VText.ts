declare var Quill: any;

import { data } from "./VData";

module text {
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

                ['clean'],                                         // remove formatting button
                ['omega'],
            ];

            this.quill = new Quill('#quill_editor', {
                modules: {
                    formula: true,
                    toolbar: toolbarOptions
                },
                theme: 'snow',
            });

            this.quill.keyboard.addBinding({
                key: 220,
                shortKey: true
            }, (range, context) => {
                this.quill.theme.tooltip.edit('formula');
            });

            //this.quill.enableMathQuillFormulaAuthoring();

            this.quill.format('font', 'monaco');
            this.quill.format('size', '20px');
            this.quill.disable();

            let doFormat = () => {
                let length = this.quill.getLength();
                this.quill.formatText(0, length, 'font', 'monaco');
                this.quill.formatText(0, length, 'size', '20px');
            };

            var customButton = document.querySelector('.ql-omega');
            customButton.addEventListener('click', doFormat);

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