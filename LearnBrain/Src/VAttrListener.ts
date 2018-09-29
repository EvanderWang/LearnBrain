module attrlistener {
    export interface IVAttrChangeReceiver {
        onchange: (attrName: string, changedData: string) => void;
    }

    export class VAttrChangeListener {
        observer: MutationObserver;

        constructor(private target: Node, private attributeNames: string, private recv: IVAttrChangeReceiver) {
            this.recv.onchange(attributeNames, (<any>this.target).attributes.getNamedItem(this.attributeNames).value);
            this.observer = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => {
                let lastRecord = mutations[0];
                let newValue = (<any>this.target).attributes.getNamedItem(this.attributeNames).value;
                if (lastRecord.type == "attributes" && newValue != lastRecord.oldValue) {
                    this.recv.onchange(<string>lastRecord.attributeName, newValue);
                }
            });
            this.observer.observe(target, { attributes: true, attributeOldValue: true, attributeFilter: [attributeNames] });
        }
    }
}

export { attrlistener }