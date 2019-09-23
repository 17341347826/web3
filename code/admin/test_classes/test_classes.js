/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("admin","school_classes/school_classes","css!"),
        C.Co("admin","test_classes/test_classes","html!"),
        C.CM("modal"),C.CM('page_title')],
    function (avalon, css, html,modal,page_title) {
        //类别列表
        var exam_property = api.user + "examproperty/findlist";
        //类别编辑
        var exam_save = api.user + "examproperty/save";
        //启停用
        var exam_property_state = api.user + "examproperty/upd_state";
        //删除
        var exam_property_delete = api.user + "examproperty/delete";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                exam_property:[],
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
                        ajax_post(exam_property_state,{exam_property:this.modal.id},this)
                    } else if (this.btnType == 2) {
                        ajax_post(exam_property_delete, {exam_property:this.modal.id}, this);
                    }
                },
                //添加
                compile: function () {
                    if (this.compileData.property_name != "") {
                        ajax_post(exam_save, this.compileData.$model, this);
                    } else {
                        this.modal.msg = "班级类别必填"
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
                    ajax_post(exam_property,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  exam_property:
                            this.exam_property=data.data;
                            break;
                        case  exam_save:
                            if (status == 200) {
                                compileData.modal("close");
                                ajax_post(exam_property,{},this);
                            }
                            this.infoModal(status, msg);
                            break;
                        case  exam_property_state:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(exam_property,{},this);
                            break;
                        case  exam_property_delete:
                            info.modal('open');
                            setTimeout(function () {
                                $("#info-tips").modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            ajax_post(exam_property,{},this);
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