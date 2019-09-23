/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user", "cityUserControl/city_sibling_user/city_sibling_user", "css!"),
        C.Co("user", "cityUserControl/city_sibling_user/city_sibling_user", "html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon, css, html, tab, modal, data_center, three_menu_module) {
        // 用户列表
        var teacher_list = api.user + "teacher/department_users";
        // 添加
        var teacher_save = api.user + "teacher/saveTeacher.action";
        // 删除
        var teacher_delete = api.user + "teacher/delete.action";
        // 可选择角色
        var role_list = api.user + "role/client_choose_role";
        // 重置密码
        var reset_pwd = api.user + "baseUser/resetpwd.action";
        // 保存角色
        var user_role_save = api.user + "user_role/save";
        //修改教师用户状态
        var api_update_status = api.user + 'teacher/update_status.action';

        //修改教师用户状态-批量
        var api_batch_status = api.user + 'teacher/batch_upd_status';
        //批量重置用户密码
        var api_batch_resetpwd = api.user + 'baseUser/batch_resetpwd';
        //批量删除记录
        var api_batch_del = api.user + 'teacher/batch_del';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "city_sibling_user",
                // 列表数据接口
                url: teacher_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [
                    {
                        title: "<input type='checkbox' name='checkAll' id='checkAll'  value='全选'  ms-on-click='@oncbopt({current:$idx, type:7})'>全选",
                        type: "html",
                        from: "<input type='checkbox' ms-attr='{value:el.user_id+\"|\"+el.guid}'  name='checkper' class='checkper' ms-on-click='@oncbopt({current:$idx, type:6})'>"
                    },
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    }, {
                        title: "账号",
                        type: "text",
                        from: "account"
                    }, {
                        title: "姓名",
                        type: "text",
                        from: "user_name"
                    }, {
                        title: "联系电话",
                        type: "text",
                        from: "phone"
                    }, {
                        title: "使用状态",
                        type: "html",
                        from: "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.status==1' ms-on-click='@oncbopt({current:$idx, type:9})'></a>" +
                        "<a class='tab-toggle-off-btn tab-btn'  ms-visible='el.status==2' ms-on-click='@oncbopt({current:$idx, type:8})'></a>"
                    }, {
                        title: "角色",
                        type: "html",
                        from: "<span ms-for='col in el.userRoles'>{{@col.role_name}}<span ms-if='el.userRoles.length>1'  class='am-margin-horizontal-xs'>/</span></span>"
                    }, {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>" +
                        "<a class='tab-btn tab-rest-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='重置密码'></a>" +
                        "<a class='tab-btn tab-role-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='角色设置'></a>"
                    }],
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: "",
                    type:'',
                },
                // 附加参数
                extend: {
                    account: "",
                    __hash__: ""
                },
                //增加
                compileData: {
                    id: "",
                    //名称
                    teacher_name: "",
                    //账号
                    teacher_num: "",
                    // 电话
                    phone: ""
                },
                other: {
                    account: ""
                },
                role: [],
                role_list: [],
                role_user: [],
                userId: "",
                paramsType: "",
                phoneFlag: "",
                //用户等级
                department_level: "",
                //批量改变状态:1：启用；2：停用
                stu_status: '1',
                //批量状态、批量删除
                stu_ids: [],
                //批量重置密码
                stu_guids: [],
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            self.department_level = data.department_level;
                        }
                    });
                },
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "5") {
                        this.modal.title = "修改";
                        this.modal.msg = "";
                        this.compileData.id = params.data.user_id;
                        //账号
                        this.compileData.teacher_num = params.data.account;
                        // 姓名
                        this.compileData.teacher_name = params.data.user_name;
                        if (params.data.phone != null) {
                            // 联系电话
                            this.compileData.phone = params.data.phone;
                            this.phoneFlag = true;
                        } else {
                            this.compileData.phone = "";
                        }
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "2") {
                        this.userId = params.data.guid;
                        this.role_user = params.data.userRoles;
                        this.modal.msg = "";
                        this.role = [];
                        ajax_post(role_list, {}, this);
                        $("#role-setting").modal({
                            closeOnConfirm: false
                        });

                    } else {
                        if (params.type == "3") {
                            this.userId = params.data.guid;
                            this.modal.title = "重置密码";
                            this.modal.info = "是否重置此账号密码？";
                            this.modal.msg = "";
                            this.paramsType = 3;
                            this.modal.type = '3';
                        } else if (params.type == "4") {
                            this.userId = params.data.user_id;
                            this.modal.title = "删除";
                            this.modal.info = "是否删除此账号？";
                            this.modal.msg = "";
                            this.paramsType = 4;
                            this.modal.type = '4';
                        } else if (params.type == '6') {//单个checkbox
                            var list = this.stu_ids;
                            var guid_list = this.stu_guids;
                            var ary = $('.checkper');
                            var value = params.data.user_id;
                            var guid = params.data.guid;
                            var index = params.current;
                            /*判断checkbox是否选中（参照本页面）:
                             html格式:ary[index].checked  //true/false
                             js格式：$('#checkAll').is(':checked')  //true/false
                             * */
                            if (ary[index].checked) {//选中   所有版本:true/false
                                list.push(value);
                                guid_list.push(guid);
                            } else {//未选中
                                list.remove(value);
                                guid_list.remove(guid);
                            }
                            this.stu_ids = list;
                            this.stu_guids = guid_list;
                        } else if (params.type == '7') {//全选
                            //获取所有checkbox元素
                            var ary = $('.checkper');
                            //判断全选是否选中
                            if ($('#checkAll').is(':checked')) {//选中  is(':checked')----所有版本:true/false
                                var num_ary = [];
                                var guid_ary = [];
                                for (var i = 0; i < ary.length; i++) {
                                    var value = ary[i].value.split('|');
                                    var num = Number(value[0]);
                                    var guid = Number(value[1]);
                                    // 设置元素为选中状态
                                    ary[i].checked = true;
                                    num_ary.push(num);
                                    guid_ary.push(guid);
                                }
                                this.stu_ids = num_ary;
                                this.stu_guids = guid_ary;
                            } else {//未选中
                                for (var i = 0; i < ary.length; i++) {
                                    // 设置元素为未选中状态
                                    ary[i].checked = false;
                                }
                                this.stu_ids = [];
                                this.stu_guids = [];
                            }
                        } else if (params.type == "8") {
                            this.userId = params.data.user_id;
                            this.modal.title = "启用";
                            this.modal.info = "是否启用此账号？";
                            this.modal.msg = "";
                            this.paramsType = 8;
                            this.modal.type = '1';
                        } else if (params.type == "9") {
                            this.userId = params.data.user_id;
                            this.modal.title = "停用";
                            this.modal.info = "是否停用此账号？";
                            this.modal.msg = "";
                            this.paramsType = 9;
                            this.modal.type = '2';
                        }
                        if (params.type != '6' && params.type != '7') {
                            $("#delete-modal").modal({
                                closeOnConfirm: false
                            });
                        }
                    }

                },
                //每一次批量操作完成后打扫工作
                clean_stu: function () {
                    //全选变为未选中状态
                    // $('#checkAll').checked = false;不行
                    $('#checkAll').attr("checked", false);
                    //获取所有checkbox元素
                    var ary = $('.checkper');
                    //单个checkbox修改
                    for (var i = 0; i < ary.length; i++) {
                        // 设置元素为未选中状态
                        ary[i].checked = false;
                    }
                    this.stu_ids = [];
                    this.stu_guids = [];
                },
                //批量修改状态
                batch_status: function () {
                    var list = this.stu_ids;
                    if (list.length == 0) {
                        toastr.warning('请勾选用户');
                        return;
                    }
                    $('#change_status').modal({
                        closeOnConfirm: false
                    });
                },
                //保存修改状态
                save_status: function () {
                    //批量修改状态
                    ajax_post(api_batch_status, {id_arr: this.stu_ids, status: this.stu_status}, this);
                },
                //批量重置密码
                batch_resetpwd: function () {
                    var list = this.stu_guids;
                    if (list.length == 0) {
                        toastr.warning('请勾选用户');
                        return;
                    }
                    ajax_post(api_batch_resetpwd, {guid_arr: list}, this);
                },
                //批量删除
                batch_del: function () {
                    var list = this.stu_ids;
                    if (list.length == 0) {
                        toastr.warning('请勾选用户');
                        return;
                    }
                    ajax_post(api_batch_del, {id_arr: list}, this);
                },
                rolePowerSetting: function (data) {
                    this.role_list = data;
                    var role = this.role_user;
                    for (var j = 0; j < role.length; j++) {
                        var roleId = role[j].role_id;
                        this.role.push(roleId);
                    }
                },
                roleSave: function () {
                    ajax_post(user_role_save, {roles: this.role, user: this.userId}, this)
                },
                //modal确定按钮
                sure: function () {
                    if (this.paramsType == 3) {
                        ajax_post(reset_pwd, {id: this.userId}, this)
                    } else if (this.paramsType == 4) {
                        ajax_post(teacher_delete, {teacher_id: this.userId}, this)
                    } else if (this.paramsType == 8) {//启用
                        ajax_post(api_update_status, {id: this.userId, status: 1}, this);
                    } else if (this.paramsType == 9) {//停用
                        ajax_post(api_update_status, {id: this.userId, status: 2}, this);
                    }
                },
                //modal信息确认
                modal_insure_info:function(){
                    var info = $("#info-tips");
                    info.modal('close');
                },
                nameSearch: function () {
                    this.extend.account = this.other.account;
                },
                //添加
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.teacher_num = "";
                    this.compileData.teacher_name = "";
                    this.compileData.phone = "";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                reg: function (phone) {
                    var reg = /^((1(3|4|5|7|8)\d{9})|([0]{1}[1-9]{1}[0-9]{1}-[0-9]{8}|[0]{1}[1-9]{2}[0-9]{1}-[0-9]{7}))$/;
                    this.phoneFlag = reg.test(phone);
                },
                phoneReg: function () {
                    this.reg(this.compileData.phone);
                    if (this.compileData.phone != '') {
                        if (!this.phoneFlag) {
                            this.modal.msg = "请输入11位手机号码或区号 - 号码的固定电话";
                        } else {
                            this.phoneFlag = true
                        }
                    }
                },
                compile: function () {
                    this.reg(this.compileData.phone);
                    if (this.compileData.teacher_num == "" || this.compileData.teacher_name == "") {
                        this.modal.msg = "账号和姓名必填";
                        return;
                    }
                    if (this.compileData.teacher_num.length < 6 || this.compileData.teacher_num.length > 18) {
                        this.modal.msg = "账号位数有误,请输入6至18位的账号";
                        return;
                    }
                    if (this.compileData.phone == "") {
                        ajax_post(teacher_save, this.compileData.$model, this);
                        return;
                    }
                    if (!this.phoneFlag) {
                        this.modal.msg = "请输入正确格式的联系电话"
                        return;
                    }
                    ajax_post(teacher_save, this.compileData.$model, this);


                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        this.extend.__hash__ = new Date();
                        info.modal('open');
                        if(this.modal.type != '3'){
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000)
                        }
                    }
                    this.modal.msg = msg;
                },
                init: function () {
                    this.is_init = true;
                    this.cds();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    if(is_suc){
                        switch (cmd) {
                            case  teacher_save:
                                if (status == 200) {
                                    compileData.modal("close");
                                }
                                this.infoModal(status, msg);
                                break;
                            case  reset_pwd:
                                // info.modal('open');
                                // setTimeout(function () {
                                //     info.modal('close');
                                // }, 1000);
                                // this.modal.msg = msg;
                                this.infoModal(status, msg);
                                break;
                            case  teacher_delete:
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.modal.msg = msg;
                                this.extend.__hash__ = new Date();
                                break;
                            case role_list:
                                if (status == 200) {
                                    this.rolePowerSetting(data.data.list);
                                }
                                break;
                            case user_role_save:
                                info.modal('open');
                                $("#role-setting").modal("close");
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.modal.msg = '角色设置成功';
                                this.extend.__hash__ = new Date();
                                break;
                            //   修改用户状态
                            case  api_update_status:
                                this.infoModal(status, msg);
                                break;
                            // 批量修改用户状态
                            case api_batch_status:
                                this.complete_batch_status(data);
                                break;
                            //        批量重置密码
                            case api_batch_resetpwd:
                                this.complete_batch_resetpwd(data);
                                break;
                            //        批量删除
                            case api_batch_del:
                                this.complete_batch_del(data);
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                //批量修改状态
                complete_batch_status: function (data) {
                    $('#change_status').modal({
                        closeOnConfirm: true
                    });
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success('批量修改状态成功');
                },
                //    批量重置密码
                complete_batch_resetpwd: function (data) {
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success(data.message);
                },
                //    批量删除
                complete_batch_del: function (data) {
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success('批量删除成功');
                },
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });