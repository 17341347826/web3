/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user", "schoolUserControl/teacherUsersControl/teacherUsersControl", "css!"),
        C.Co("user", "schoolUserControl/teacherUsersControl/teacherUsersControl", "html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon,css,html, tab, modal, data_center,three_menu_module) {
        //教师用户管理列表
        var api_teacher_user_list = api.user + "teacher/department_users";
        //教师账号启用、停用
        var api_update_teacher_status = api.user + "teacher/update_status.action";
        //重置密码
        var api_reset_pwd = api.user + "baseUser/resetpwd.action";
        // 可选择角色
        var role_list = api.user + "role/client_choose_role";
        // 保存角色
        var user_role_save = api.user + "user_role/save";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "teacherUsersControl",
                // 列表数据接口
                url: api_teacher_user_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "user_id"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "user_name"
                    },
                    {
                        title: "教师编号",
                        type: "text",
                        from: "account"
                    },
                    {
                        title: "账号",
                        type: "text",
                        from: "account"
                    },
                    {
                        title: "账号状态",
                        type: "cover_text",
                        from: "status",
                        dict: {
                            1: "启用",
                            2: "停用"
                        }
                    },
                    {
                        title: "使用状态",
                        type: "html",
                        from:
                        "<a class='tab-toggle-on-btn tab-btn' title='启用' ms-visible='el.status==1' ms-on-click='@oncbopt({current:$idx, type:2})'></a>" +
                        "<a class='tab-toggle-off-btn tab-btn' title='停用'  ms-visible='el.status==2' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"
                    }, {
                        title: "角色",
                        type: "html",
                        from: "<span ms-for='col in el.userRoles'>{{@col.role_name}}<span ms-if='el.userRoles.length>1'  class='am-margin-horizontal-xs'>/</span></span>"
                    }, {
                        title: "操作",
                        type: "html",
                        from: "" +
                        "<a class='tab-btn tab-rest-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='重置密码'></a>"
                    }
                ],
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
                    fk_school_id: "",
                    // 账号
                    account: "",
                    // 姓名
                    user_name: "",
                    __hash__: ""
                },
                //查询
                demandData: {
                    // 账号
                    account: "",
                    // 姓名
                    user_name: ""
                },
                role: [],
                role_list: [],
                role_user: [],
                //用户id
                userId: "",
                //按钮状态
                paramsType: "",
                user: {
                    fk_school_id: "",
                    school_name: "",
                    school_code: ""
                },
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.userId = params.data.guid;
                        this.role_user = params.data.userRoles;
                        this.modal.msg = "";
                        this.role=[];
                        ajax_post(role_list, {}, this);
                        $("#role-setting").modal({
                            closeOnConfirm: false
                        });
                    } else {
                        // 当前数据的id
                        if (params.type == "1") {
                            this.userId = params.data.user_id;
                            this.modal.title = "启用";
                            this.modal.info = "是否启用此账号？";
                            this.modal.msg = "";
                            this.paramsType = 1;
                        } else if (params.type == "2") {
                            this.userId = params.data.user_id;
                            this.modal.title = "停用";
                            this.modal.info = "是否停用此账号？";
                            this.modal.msg = "";
                            this.paramsType = 2;
                        } else if (params.type == "3") {
                            this.userId = params.data.guid;
                            this.modal.title = "重置密码";
                            this.modal.info = "是否重置此账号密码？";
                            this.modal.msg = "";
                            this.paramsType = 3;
                        }
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }

                },
                rolePowerSetting:function (data) {
                    this.role_list=data;
                    var role=this.role_user;
                    for(var j=0;j<role.length;j++){
                        var roleId=role[j].role_id;
                        this.role.push(roleId);
                    }
                },
                roleSave:function () {
                    ajax_post(user_role_save,{roles:this.role,user:this.userId},this)
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                accountNumDemand: function () {
                    this.extend.account = this.demandData.account;
                },
                teacherNameDemand: function () {
                    this.extend.user_name = this.demandData.user_name;
                },
                sure: function () {
                    if (this.paramsType == 1) {
                        ajax_post(api_update_teacher_status, {id: this.userId, status: 1}, this)
                    } else if (this.paramsType == 2) {
                        ajax_post(api_update_teacher_status, {id: this.userId, status: 2}, this)
                    } else if (this.paramsType == 3) {
                        ajax_post(api_reset_pwd, {id: this.userId}, this)
                    }
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
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            var department_level = data.department_level;
                            if (department_level == "4") {
                                self.user.fk_school_id = data.fk_school_id;
                                self.extend.fk_school_id = data.fk_school_id;
                                self.user.school_name = data.school_name;
                                self.user.school_code = data.school_code;
                            }
                        }
                        self.is_init = true;
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  api_update_teacher_status:
                            this.infoModal(status, msg);
                            break;
                        case  api_reset_pwd:
                            this.infoModal(status, msg);
                            break;
                        case role_list:
                            if(status==200){
                                this.rolePowerSetting(data.data.list);
                            }
                            break;
                        case user_role_save:
                            $("#role-setting").modal("close");
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
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });