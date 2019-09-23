/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user", "role_privileges/role_privileges_list/role_privileges_list", "css!"),
        C.Co("user", "role_privileges/role_privileges_list/role_privileges_list", "html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon, css, html, tab, modal, data_center,three_menu_module) {
        // 角色集合
        var role_list = api.user + "role/client_role";
        // 添加角色
        var role_save = api.user + "role/save.action";
        // 删除角色
        var role_delete = api.user + "role/delete";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "role_privileges",
                // 列表数据接口
                url: role_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 9999
                },
                is_init: false,
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "角色名称",
                    type: "text",
                    from: "role_name"
                }, {
                    title: "角色等级",
                    type: "cover_text",
                    from: "role_level",
                    dict: {
                        1: "省级",
                        2: "市级",
                        3: "区县",
                        4: "校级",
                        5: "年级",
                        6: "班级"
                    }
                }, {
                    title: "角色类型",
                    type: "cover_text",
                    from: "role_type",
                    dict: {
                        0: "管理员",
                        1: "教师",
                        2: "学生",
                        3: "家长"
                    }
                }, {
                    title: "权限分配",
                    type: "html",
                    from: "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>"
                }, {
                    title: "操作",
                    type: "html",
                    from:
                    "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                }],
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                // 附加参数
                extend: {
                    __hash__: ""
                },
                //增加
                compileData: {
                    //角色等级
                    role_level: "",
                    //角色名称
                    role_name: "",
                    // 角色类型
                    role_type: ""
                },
                //用户等级
                department_level: "",
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            self.department_level = JSON.parse(data.data["user"]).department_level;
                        }
                    });
                    this.is_init = true;
                },
                //  列表按钮操作
                cbopt: function (params) {
                    //删除
                    if (params.type == "4") {
                        this.modal.id = params.data.id;
                        this.modal.url = role_delete;
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此条信息？";
                        this.modal.msg = "";
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "2") {
                        data_center.set_key("role_privileges_setting", params);
                        window.location = "#role_privileges_setting"
                    }
                },
                //添加
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.role_name = "";
                    this.compileData.role_level = "";
                    this.compileData.role_type = "";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                compile: function () {
                    if (this.compileData.role_name != "") {
                        if (this.department_level == 4) {
                            if (this.compileData.role_level != "" &&
                                this.compileData.role_type != "") {
                                ajax_post(role_save, this.compileData.$model, this)
                            } else {
                                this.modal.msg = "所有选项必填或必选";
                            }
                        } else {
                            ajax_post(role_save, this.compileData.$model, this)
                        }
                    } else {
                        this.modal.msg = "所有选项必填或必选";
                    }
                },
                // 删除
                sure: function () {
                    ajax_post(this.modal.url, {role_id: this.modal.id}, this);
                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        this.extend.__hash__ = new Date();
                        info.modal('open');
                        setTimeout(function () {
                            info.modal('close');
                        }, 1000)
                    }
                    this.modal.msg = msg;
                },
                // 获取年级
                init: function () {
                    this.cds();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  role_save:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            break;
                        case  role_delete:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            this.extend.__hash__ = new Date();
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