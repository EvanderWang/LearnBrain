requirejs.config({
    // baseUrl: basePath,
    paths: {
        "react": "../Third/react/react.development",
        "react-dom": "../Third/react/react-dom.development",
        "tslib": "../Third/tslib/tslib",
        "classnames": "../Third/classnames/index",
        "react-transition-group": "../Third/react-transition-group/react-transition-group.min",
        "dom4": "../Third/dom4/dom4",
        "prop-types": "../Third/prop-types/prop-types",
        "csstype": "../Third/csstype/index.d",
        "d3": "../Third/d3/d3.v5.min",
        "@blueprintjs/icons": "../Third/@blueprintjs/icons.bundle",
        "@blueprintjs/core": "../Third/@blueprintjs/core.bundle",
    },
    // map: {
    //     '*': {
    //         'style': cssPath,
    //         'text': textPath,
    //         'image': imagePath,
    //     }
    // },
    // urlArgs: "SMTLine2.17.150",
});

let scripts = document.getElementsByTagName("script");
let mainpoint = "";
for (let i = 0; i < scripts.length; i++) {
    if(scripts[i].dataset.mainpoint){
        mainpoint = "../" + scripts[i].dataset.mainpoint;
        break;
    }
}

requirejs([mainpoint], ( mp ) => {
    mp.module_main.main();
})
