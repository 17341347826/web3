/**
 * Created by Administrator on 2018/8/17.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user","districtUserControl/districtSchoolControl/districtSchoolControl","css!"),
        C.Co("user","districtUserControl/districtSchoolControl/districtSchoolControl","html!"),
        C.CM("table"),
        C.CM("modal"),C.CM('three_menu_module'),
        C.CMF("data_center.js"),"PCAS"],
    function (avalon, css, html, tab, modal,three_menu_module, data_center,PCAS) {
        //重置密
        var api_reset_pwd = api.user+ "baseUser/resetpwd.action";
        //区县-学校删除
        var api_delete_school = api.user + "school/delete.action";
        //区县-学校列表
        // var api_city_area_list = api.user + "school/arealist.action";
        var api_city_area_list = api.user + "school/schoolList.action";
        //区县-学校编辑
        var api_edit_school = api.user + "school/save_school.action";
        //修改状态--区县和学校一个接口
        var api_update_status = api.user + 'school/upd_status';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "districtSchoolControl",
                // 列表数据接口
                url: api_city_area_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "学校名称",
                    type: "text",
                    from: "schoolname"
                }, {
                    title: "学校代码",
                    type: "text",
                    from: "schoolcode"
                }, {
                    title: "管理员",
                    type: "text",
                    from: "linkman"
                }, {
                    title: "联系电话",
                    type: "text",
                    from: "phone"
                },{
                    title: "使用状态",
                    type: "html",
                    from:
                    "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.status==1' ms-on-click='@oncbopt({current:$idx, type:9})'></a>"+
                    "<a class='tab-toggle-off-btn tab-btn'  ms-visible='el.status==2' ms-on-click='@oncbopt({current:$idx, type:8})'></a>"
                }, {
                    title: "操作",
                    type: "html",
                    from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                    "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"+
                        "<a class='tab-btn tab-rest-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='重置密码'></a>"
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
                    department_level: 4,
                    district: "",
                    schoolcode: "",
                    schoolname: "",
                    __hash__: ""
                },
                //增加、修改
                compileData: {
                    //地区id
                    id: "",
                    //地区代码
                    schoolcode: "",
                    // 所属省
                    province: "",
                    // 所属市
                    city: "",
                    // 所属区县
                    district: "",
                    schoolname:"",
                    // 联系人
                    linkman: "",
                    // 联系电话
                    phone: "",
                    //备注
                    remark: ""
                },
                other: {
                    schoolcode: "",
                    schoolname: ""
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            //管理员用户信息下：1：省级；2：市州级；3：区县级；4：校级
                            var department_level = data.department_level;
                            if (department_level == "3") {
                                self.extend.district = data.district;
                                self.is_init = true;
                            }
                        }
                    });
                },
                paramsType:'',
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此学校？";
                        // 当前数据的id
                        this.modal.id = params.data.id;
                        this.modal.msg = "";
                        this.btnType = 4;
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "2") {
                        this.modal.title = "修改";
                        this.modal.msg = "";
                        //地区代码
                        this.compileData.schoolcode = params.data.schoolcode;
                        // 所属省
                        this.compileData.province = params.data.province;
                        // 所属市
                        this.compileData.city = params.data.city;
                        // 所属区县
                        this.compileData.district = params.data.district;
                        this.compileData.schoolname=params.data.schoolname;
                        if (params.data.phone != null) {
                            // 联系电话
                            this.compileData.phone = params.data.phone;
                            this.phoneFlag = true;
                        } else {
                            this.compileData.phone = "";
                        }
                        this.compileData.id = params.data.id;
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                        new PCAS("province1", "city1", "area1", "" + this.compileData.province + "", "" + this.compileData.city + "", "" + this.compileData.district + "");
                    } else if (params.type == "3") {
                        this.modal.id = params.data.user_id;
                        this.modal.title = "重置密码";
                        this.modal.info = "是否重置密码？";
                        this.modal.msg = "";
                        this.paramsType = 3;
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }else if (params.type == "8") {
                        this.userId = params.data.id;
                        this.modal.title = "启用";
                        this.modal.info = "是否启用此账号？";
                        this.modal.msg = "";
                        this.paramsType = 8;
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "9") {
                        this.userId = params.data.id;
                        this.modal.title = "停用";
                        this.modal.info = "是否停用此账号？";
                        this.modal.msg = "";
                        this.paramsType = 9;
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //modal操作
                sure: function () {
                   if(this.paramsType == 4){ //删除
                       ajax_post(api_delete_school,{school_id: this.modal.id},this);
                    }else if(this.paramsType == 3){ // 重置密码
                        ajax_post(api_reset_pwd, {id: this.modal.id}, this);
                    }else if(this.paramsType == 8){//启用
                        ajax_post(api_update_status,{department_id: this.userId, status: 1},this);
                    }else if(this.paramsType == 9){//停用
                        ajax_post(api_update_status,{department_id: this.userId, status: 2},this);
                    }
                },
                //修改、添加
                compile: function () {
                    if(this.compileData.schoolname!=""){
                        var nameReg=/^[\u4e00-\u9fa5]+$/;
                        var numReg = nameReg.test(this.compileData.schoolname);
                        if(numReg){
                            if (this.compileData.district != "" &&
                                this.compileData.schoolcode != "") {
                                if (this.compileData.phone == ""
                                    || this.phoneFlag) {
                                    ajax_post(api_edit_school, this.compileData.$model, this);
                                } else {
                                    this.modal.msg = "请输入正确格式的联系电话"
                                }
                            } else {
                                this.modal.msg = "请填写或选择，必填或必选项"
                            }
                        }else {
                            this.modal.msg = "请输入中文名称"
                        }
                    }else {
                        this.modal.msg = "请输入中文名称（必填）"
                    }
                },
                //查询
                schoolNameSearch: function () {
                    this.extend.schoolname = this.other.schoolname
                },
                schoolCodeSearch: function () {
                    this.extend.schoolcode = this.other.schoolcode
                },
                init: function () {
                    this.cds();
                },
                //modal接口操作返回--数据处理
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
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        //编辑
                        case  api_edit_school:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            break;
                        case  api_reset_pwd:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            this.extend.__hash__ = new Date();
                            break;
                        //    删除
                        case  api_delete_school:
                            this.infoModal(status, msg);
                            break;
                        //   修改用户状态
                        case  api_update_status:
                            this.infoModal(status, msg);
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