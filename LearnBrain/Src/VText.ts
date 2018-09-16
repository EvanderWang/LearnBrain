declare var Quill: any;


module text {
    export class VText {
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

            var quill = new Quill('#quill_editor', {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow',
            });

            quill.format('font', 'monaco');
            quill.format('size', '20px');

            var customButton = document.querySelector('.ql-omega');
            customButton.addEventListener('click', function () {
                var range = quill.getSelection();
                if (range) {
                    quill.formatText(range.index, range.length, "color", "red");
                }
            });

            customButton.addEventListener('hover', function () {
                console.log("hover");
            });

            // test use
            (<any>window).quill = quill;
        }
    }
}

export { text }