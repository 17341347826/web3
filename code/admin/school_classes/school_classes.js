/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("admin","school_classes/school_classes","css!"),
        C.Co("admin","school_classes/school_classes","html!"),
        C.CM("modal"),C.CM('three_menu_module')],
    function (avalon, css, html,modal,three_menu_module) {
        //类别列表
        var school_property = api.user + "schoolproperty/findlist.action";
        //类别编辑
        var school_property_save = api.user + "schoolproperty/save.action";
        //启停用
        var school_property_state = api.user + "schoolproperty/upd_state.action";
        //删除
        var school_property_delete = api.user + "schoolproperty/delete.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                school_property:[],
                // 模态框
                modal: {
                    user_id: "",
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //增加
                compileData: {
                    property_name: "",
                    //备注
                    remark: ""
                },
                btnType:"",
                //  列表按钮操作
                statusOn:function (id,status) {
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 4;
                    if(status==1){
                        this.modal.title = "停用";
                        this.modal.info = "是否停用此类别？";
                    }else {
                        this.modal.title = "启用";
                        this.modal.info = "是否启用此类别？";
                    }
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                //删除
                propertyDelete:function (id) {
                    this.modal.title = "删除";
                    this.modal.info = "是否删除此类别？";
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 2;
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                sure: function () {
                    if (this.btnType == 4) {
                        ajax_post(school_property_state,{school_property:this.modal.id},this)
                    } else if (this.btnType == 2) {
                        ajax_post(school_property_delete, {school_property:this.modal.id}, this);
                    }
                },
                //添加
                compile: function () {
                    if (this.compileData.property_name != "") {
                        ajax_post(school_property_save, this.compileData.$model, this);
                    } else {
                        this.modal.msg = "学校类别必填"
                    }
                },
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.property_name = "";
                    this.compileData.remark="";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                regMsg: function () {
                    this.modal.msg = "";
                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        info.modal('open');
                        setTimeout(function () {
                            info.modal('close');
                        }, 1000)
                    }
                    this.modal.msg = msg;
                },
                init:function () {
                   ajax_post(school_property,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  school_property:
                            this.school_property=data.data;
                            break;
                        case  school_property_save:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            ajax_post(school_property,{},this);
                            break;
                        case  school_property_state:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(school_property,{},this);
                            break;
                        case  school_property_delete:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(school_property,{},this);
                            break;
                    }
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });