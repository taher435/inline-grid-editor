var _activeEdit = null;
var _editContainer;

var InlineEditor = function (element, options, cb) {
    var defaultOptions = {
        openDirection: "right",
        editIconPosition: "left",
        width: 165,
        editorElementId: null,
        saveButtonId: "btnSave",
        cancelButtonId: "btnCancel",
        onClose: null, //Called before closing the editor
        moveable: false, // future use
        editableClassName: 'editable'
    };

    this.optionsToApply = $.extend({}, defaultOptions, options);
    this.element = $(element);
    this.width = this.optionsToApply.width + "px";

    this.cb = cb;
    this.onClose = this.optionsToApply.onClose;
    
    this.saveButtonId = this.optionsToApply.saveButtonId;
    this.cancelButtonId = this.optionsToApply.cancelButtonId;

    var defaultEditor = $("<div class='editor hide' style='background-color: #FFF;border: 1px solid #AAA;padding: 4px;text-align:left'>" +
                            "<div><input type='text' class='input-medium' /></div>" +
                            "<div style='margin:top:3px'>" +
                                "<button class='btn btn-success' id='btnSave'>Save</button>&nbsp;" +
                                "<button class='btn btn-cancel' id='btnCancel'>Cancel</button>" +
                            "</div>" +
                           "</div>");

    this.editor = (this.optionsToApply.editorElementId == "" || this.optionsToApply.editorElementId == null) ? defaultEditor : $("#" + this.optionsToApply.editorElementId);

    this.editableInput = $(this.element.find(".editor-value")[0]);    
    $("<i class='icon-pencil icon-small inlineEditIndicator'></i>").appendTo(this.element);
    this.editIcon = $(this.element.find(".inlineEditIndicator")[0]);
    this.element.on("mouseenter", $.proxy(this.show, this));
    this.element.on("mouseleave", $.proxy(this.hide, this));

};

InlineEditor.prototype = {
    show: function () {

        if (this.element.attr("class").indexOf("editable") != -1) {
            this.editableInput.css({ "border": "1px solid #BBB", "cursor": "pointer", "padding-left": "2px", "padding-rigth" : "2px" });
            this.editableInput.on("click", $.proxy(function (e) { this.open(e); }, this));
            this.editIcon.on("click", $.proxy(function (e) { this.open(e); }, this));
        }
        return;
    },

    hide: function () {
        if (_activeEdit == null || !this.element.is(_activeEdit))
            this.editableInput.css({ "border": "transparent", "cursor": "default", "padding-left": "0px", "padding-rigth": "0px" });
    },

    open: function (e) {
        _activeEdit = this.element;
        //this.close();

        var top = this.editableInput.offset().top + this.editableInput.outerHeight();
        var left = this.editableInput.offset().left + this.editableInput.outerWidth();

        _editContainer.children().hide();
        var editor = this.editor.appendTo(_editContainer);
        editor.css({
            "position": "absolute",
            "top": top,
            "left": this.optionsToApply.openDirection == "right" ? left : (left - this.editableInput.width() - editor.width())
        });

        var editVal = $(this.element.find(".editor-value")[0]).attr("value");
        var inputField = $(editor.find("input[type='text']")[0]);
        
        inputField.val(editVal);        
        editor.show();
        _editContainer.show();
        inputField.focus();
        inputField.select();

        var me = this;

        $("#" + this.saveButtonId).unbind("click");
        $("#" + this.cancelButtonId).unbind("click");

        $("#" + this.saveButtonId).on("click", function () {
            if (typeof (me.cb) == "function") {
                var newValue = inputField.val();
                me.cb(me.element, newValue, me);
                $((me.element).find("span")[0]).val(newValue)
                _activeEdit = null;
                //Not calling the close function here, because the user may want to do something on click of save (like show validations)
                //Leaving the closing part to the user.
            }
        });

        $("#" + this.cancelButtonId).on("click", function (e) {            
            _activeEdit = null;
            me.close();            
        });
        
        e.stopPropagation();
        return false;
    },

    close: function () {
        var me = this;
        $(".editor-value").each(function () {
            if (!me.element.is(_activeEdit))
                $(this).css({ "border": "transparent", "cursor": "default", "padding-left": "0px", "padding-rigth": "0px" });
        });
        
        if (this.onClose != null && typeof (this.onClose) == "function")
            this.onClose(); 
        
        _activeEdit = null;
        _editContainer.hide();
    },

    destroy: function () {
        //remove editable class
        this.element.removeClass(this.optionsToApply.editableClassName);
        this.element.children('span').removeClass('editor-value');

        //unbind from click event
        this.element.children('span').unbind('click');        
        this.element.children('i').remove();        
        this.element.unbind('click');
    }
};

$.fn.inlineedit = function (options, cb) {
    if ($('#editorContainer').length == 0) {
        _editContainer = $("<div id='editorContainer'></div>").appendTo($("body"));
    }
    
    this.each(function () {
        var el = $(this);
        if (!el.data('inlineedit')) {            
            el.data('inlineedit', new InlineEditor(el, options, cb));           
        }
            
    });
   
    return this;
};