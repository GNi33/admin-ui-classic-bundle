/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GPLv3 and PCL
 */

pimcore.registerNS("pimcore.document.editables.video");
/**
 * @private
 */
pimcore.document.editables.video = Class.create(pimcore.document.editable, {

    initialize: function($super, id, name, config, data, inherited) {
        $super(id, name, config, data, inherited);

        data.allowedTypes = config.allowedTypes;
        this.data = data;
    },

    render: function () {
        this.setupWrapper();

        var element = Ext.get("pimcore_video_" + this.name);

        var button = new Ext.Button({
            iconCls: "pimcore_icon_edit",
            cls: "pimcore_edit_link_button",
            handler: this.openEditor.bind(this)
        });
        button.render(element.insertHtml("afterBegin", '<div class="pimcore_video_edit_button"></div>'));
        if (this.inherited) {
            button.hide();
        }
        this.button = button;
        var emptyContainer = element.query(".pimcore_editable_video_empty")[0];
        if (emptyContainer) {
            //we have to update container id for video editable inside non-reloadable blocks
            //https://github.com/pimcore/pimcore/issues/9969
            emptyContainer.id = 'video_' + uniqid();
            emptyContainer = Ext.get(emptyContainer);
            emptyContainer.on("click", this.openEditor.bind(this));
        }

        if(this.config["required"]) {
            this.required = this.config["required"];
        }
        this.checkValue();
    },

    openEditor: function () {

        // disable the global dnd handler in this editmode/frame
        window.dndManager.disable();

        this.window = pimcore.helpers.editmode.openVideoEditPanel(this.data, {
            save: this.save.bind(this),
            cancel: this.cancel.bind(this)
        });
    },

    save: function () {

        // enable the global dnd dropzone again
        window.dndManager.enable();

        // close window
        this.window.hide();

        var values = this.window.getComponent("form").getForm().getFieldValues();
        this.data = values;



        this.reloadDocument();
    },

    cancel: function () {

        // enable the global dnd dropzone again
        window.dndManager.enable();

        this.window.hide();
    },

    checkValue: function (mark) {
        var data = this.data;

        if(typeof data.path == 'undefined' || data.path === null || data.path == '') {
            value = null;
        } else {
            value = 'ok';
        }

        if (this.required) {
            this.validateRequiredValue(value, this.button, this, mark);
        }
    },

    getValue: function () {
        return this.data;
    },

    getType: function () {
        return "video";
    },

    setInherited: function(inherited, el) {
        this.inherited = inherited;

        // if an element given is as optional second parameter we use this for the mask
        if(!(el instanceof Ext.Element)) {
            el = Ext.get(this.id);
        }

        // check for inherited elements, and mask them if necessary
        if(this.inherited) {
            var mask = el.mask();
            new Ext.ToolTip({
                target: mask,
                showDelay: 100,
                trackMouse:true,
                html: t("click_right_to_overwrite")
            });
            mask.on("contextmenu", function (e) {
                var menu = new Ext.menu.Menu();
                menu.add(new Ext.menu.Item({
                    text: t('overwrite'),
                    iconCls: "pimcore_icon_overwrite",
                    handler: function (item) {
                        this.button.show();
                        this.setInherited(false);
                    }.bind(this)
                }));
                menu.showAt(e.getXY());

                e.stopEvent();
            }.bind(this));
        } else {
            el.unmask();
        }
    },
});
