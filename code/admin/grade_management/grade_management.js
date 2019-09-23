/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("admin","grade_management/grade_management","css!"),
        C.Co("admin","grade_management/grade_management","html!"),
        C.CM("modal"),C.CM('page_title')],
    function (avalon, css, html,modal,page_title) {
        //类别列表
        var grade_property = api.user + "grade/findGrades.action";
        //编辑
        var grade_save = api.user + "grade/save.action";
        //启停用
        var grade_property_state = api.user + "grade/upd_state.action";
        //删除
        var grade_property_delete = api.user + "grade/delete.action";
        //归档年级数据
        var api_grade_archive = api.user + 'grade/archive';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "grade_management",
                grade_property:[],
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
                    grade_name: "",
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
                        this.modal.info = "是否停用此年级？";
                    }else {
                        this.modal.title = "启用";
                        this.modal.info = "是否启用此年级？";
                    }
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                //删除
                propertyDelete:function (id) {
                    this.modal.title = "删除";
                    this.modal.info = "是否删除此年级？";
                    this.modal.msg = "";
                    this.modal.id=id;
                    this.btnType = 2;
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                },
                sure: function () {
                    if (this.btnType == 4) {
                        ajax_post(grade_property_state,{grade_id:this.modal.id},this)
                    } else if (this.btnType == 2) {
                        ajax_post(grade_property_delete, {grade_id:this.modal.id}, this);
                    }
                },
                //添加
                compile: function () {
                    if (this.compileData.grade_name != "") {
                        ajax_post(grade_save, this.compileData.$model, this);
                    } else {
                        this.modal.msg = "年级名称必填"
                    }
                },
                //归档
                filed:function(id,remark,status){
                    if(remark != '九年级' || status != 1){
                        toastr.warning('当前年级不是九年级，不能归档！');
                        return;
                    }
                    ajax_post(api_grade_archive,{grade_id:id},this);
                },
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.grade_name = "";
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
                    ajax_post(grade_property,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    if(is_suc){
                        switch (cmd) {
                            case  grade_property:
                                this.grade_property=data.data;
                                break;
                            case  grade_save:
                                if (status == 200) {
                                    compileData.modal("close");
                                    ajax_post(grade_property,{},this);
                                }
                                this.infoModal(status, msg);
                                break;
                            case  grade_property_state:
                                info.modal('open');
                                setTimeout(function () {
                                    $("#info-tips").modal('close');
                                }, 1000);
                                this.modal.msg = msg;
                                ajax_post(grade_property,{},this);
                                break;
                            case  grade_property_delete:
                                info.modal('open');
                                setTimeout(function () {
                                    $("#info-tips").modal('close');
                                }, 1000);
                                this.modal.msg = msg;
                                ajax_post(grade_property,{},this);
                                break;
                            //        归档年级数据
                            case api_grade_archive:
                                toastr.success('归档完成！');
                                break;
                        }
                    }else{
                        toastr.error(msg);
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