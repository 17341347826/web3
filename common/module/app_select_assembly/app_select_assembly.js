/**
 * 品德详情组件
 */
define([
        C.CLF('avalon.js'),

        C.CM("app_select_assembly", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function (avalon,  html, x, data_center, layer) {
        var pdetail = undefined;
        // 作品基本详细信息组件
        var detail = avalon.component('ms-select-assembly', {
            template: html,
            defaults: {
                //下拉列表option中的数据
                data_arr: [],
                //select显示的文字
                head_value:{grade:"请选择年级", class:"请选择班级", semester:"请选择学期"},
                //是否显示下拉option部分
                show_option: false,
                //下拉列表是否显示初始值
                is_init:false,
                is_disabled:false,
                cb: function () {
                    if(this.is_init&&this.data_arr.length>0){
                        this.head_value = this.data_arr[0].name;
                    }
                },

                //主页面传过来的方法，在主页面实现获取数据
                sel_check: function (el) {
                },
                //改变select显示的值
                change_head: function (el) {
                    this.head_value = el.name;
                    this.show_option = false;
                },
                sel_value:"",
                //显示option
                click_head: function () {
                    if(this.is_disabled)
                        return;
                    this.show_option = !this.show_option;
                    if (this.show_option) {
                        var textbox = document.getElementsByClassName("select-option");
                        textbox[0].focus();
                    }
                },
                //隐藏option
                hide_option: function () {
                    this.show_option = !this.show_option;
                },
                onReady: function () {
                    data_center.link(this.$id, this);
                    pdetail = this;
                    this.cb();
                    this.then&&this.then(this);
                    var self = this;
                    this.$watch("sel_value", function () {
                            var vno = Number(self.sel_value);
                            self.sel_check(self.data_arr[vno], vno )
                    });
                }
            }
        })

    });
