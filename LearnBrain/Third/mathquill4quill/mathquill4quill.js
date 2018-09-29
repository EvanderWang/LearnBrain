(function(Quill, MathQuill) {

  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function areAllDependenciesMet(quill) {
    if (!Quill) {
      console.log("Quill.js not loaded");
      return false;
    }

    if (!MathQuill) {
      console.log("MathQuill.js not loaded");
      return false;
    }

    //if (!quill.options.modules.formula) {
    //  console.log("Formula module not enabled");
    //  return false;
    //}

    return true;
  }

  function applyInputStyles(mqInput) {
    mqInput.style.border = "1px solid #ccc";
    mqInput.style.fontSize = "13px";
    mqInput.style.minHeight = "26px";
    mqInput.style.margin = "0px";
    mqInput.style.padding = "5px 5px";
    mqInput.style.width = "170px";
  }

  function getTooltipElement(quill) {
    return quill.container.getElementsByClassName("ql-tooltip")[0];
  }

  function getTooltipLatexFormulaInput(quill) {
    var tooltip = getTooltipElement(quill);
    return tooltip.getElementsByTagName("input")[0];
  }

  function getTooltipSaveButton(quill) {
    var tooltip = getTooltipElement(quill);
    return tooltip.getElementsByClassName("ql-action")[0];
  }

  Quill.prototype.enableMathQuillFormulaAuthoring = function(setMQ) {
    if (!areAllDependenciesMet(this)) {
      return;
    }

    // replace LaTeX formula input wiht MathQuill input
    var latexInput = getTooltipLatexFormulaInput(this);
    latexInput.id = "ql_tooltip_input_normal";
    latexInput.style.display = "none";
    var mqInput = document.createElement("span");
    mqInput.id = "ql_tooltip_input_math";
    applyInputStyles(mqInput);
    insertAfter(mqInput, latexInput);

    // synchronize MathQuill input and LaTeX formula input
    var mqField = MathQuill.getInterface(2).MathField(mqInput, {
      handlers: {
        edit: function() {
          latexInput.value = mqField.latex();
        }
      }
    });

    setMQ(mqField);

      // don't show the old math when the tooltip gets opened next time
    var saveButton = getTooltipSaveButton(this)
    saveButton.addEventListener("click", function () {
      mqField.latex("");
    });

    $(mqInput).on("keypress", function (ev) {
        if (ev.key == 'Enter') {
            var disevt = document.createEvent("event");
            disevt.initEvent("click", true, true);
            saveButton.dispatchEvent(disevt);
            ev.stopPropagation();
            return false;
        }
    })
  };

})(window.Quill, window.MathQuill);