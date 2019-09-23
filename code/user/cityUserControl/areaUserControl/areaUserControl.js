/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("user","cityUserControl/areaUserControl/areaUserControl","css!"),
        C.Co("user","cityUserControl/areaUserControl/areaUserControl","html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"),C.CM('three_menu_module'),
        "PCAS"],
    function (avalon, css, html, tab, modal, data_center,three_menu_module, PCAS) {
        //市级-区县列表
        var api_city_area_list = api.user + "school/arealist.action";
        //市级-区县编辑
        var api_city_area_save = api.user + "school/save_area.action";
        //重置密码
        var api_reset_pwd = api.user + "baseUser/resetpwd.action";
        //市级-区县删除
        var api_city_area_delete = api.user + "school/deletearea.action";
        //修改状态--区县和学校一个接口
        var api_update_status = api.user + 'school/upd_status';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "areaUserControl",
                is_init: false,
                // 列表数据接口
                url: api_city_area_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 3000
                },
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "区县代码",
                    type: "text",
                    from: "schoolcode"
                },
                    {
                        title: "管理员",
                        type: "text",
                        from: "schoolname"
                    },
                    {
                        title: "联系电话",
                        type: "text",
                        from: "phone"
                    },{
                        title: "使用状态",
                        type: "html",
                        from:
                        "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.status==1' ms-on-click='@oncbopt({current:$idx, type:9})'></a>"+
                        "<a class='tab-toggle-off-btn tab-btn'  ms-visible='el.status==2' ms-on-click='@oncbopt({current:$idx, type:8})'></a>"
                    },{
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"+
                        "<a class='tab-btn tab-rest-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='重置密码'></a>"
                    }
                ],
                // 附加参数
                extend: {
                    city: "",
                    //区县
                    district: "",
                    //区县代码
                    schoolcode: "",
                    __hash__: ""
                },
                // 模态框
                modal: {
                    user_id: "",
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: "",
                    type:'',
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
                user: {
                    department_level: "",
                    //地区代码
                    schoolcode: "",
                    // 所属省
                    province: "",
                    // 所属市
                    city: "",
                    // 所属区县
                    district: ""
                },
                phoneFlag: "",
                btnType: "",
                paramsType:'',
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此区县？";
                        // 当前数据的id
                        this.modal.id = params.data.id;
                        this.modal.msg = "";
                        this.modal.type = '4';
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
                        new PCAS("province1", "city1", "area1", "" + this.user.province + "", "" + this.user.city + "", "" + this.compileData.district + "");
                    } else if (params.type == "3") {
                        this.modal.title = "重置密码";
                        this.modal.info = "是否重置密码？";
                        // 当前数据的id
                        this.modal.user_id = params.data.user_id;
                        this.modal.msg = "";
                        this.modal.type = '3';
                        this.btnType = 3;
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }else if (params.type == "8") {
                        this.userId = params.data.id;
                        this.modal.title = "启用";
                        this.modal.info = "是否启用此账号？";
                        this.modal.msg = "";
                        this.paramsType = 8;
                        this.modal.type = '1';
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "9") {
                        this.userId = params.data.id;
                        this.modal.title = "停用";
                        this.modal.info = "是否停用此账号？";
                        this.modal.msg = "";
                        this.paramsType = 9;
                        this.modal.type = '2';
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                nameSearch: function () {
                    this.extend.schoolcode = this.user.schoolcode;
                },
                user_level:'',
                init: function () {
                    this.user_level = cloud.user_level();
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            var department_level = data.department_level;
                            self.user.department_level = department_level;
                            if (department_level == "2") {
                                self.user.province = data.province;
                                self.user.city = data.city;
                                self.extend.city = data.city;
                                self.is_init = true;
                                new PCAS("province", "city", "area", "" + data.province + "", "" + data.city + "");
                            }else if(department_level == "3"){
                                self.user.province = data.province;
                                self.user.city = data.city;
                                self.extend.city = data.city;
                                self.user.district = data.district;
                                self.is_init = true;
                                new PCAS("province", "city", "area", "" + data.province + "", "" + data.city + "");
                            }
                        }
                    });
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
                                    ajax_post(api_city_area_save, this.compileData.$model, this);
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
                addInfo: function () {
                    this.modal.title = "添加";
                    //地区代码
                    this.compileData.schoolcode = "";
                    // 所属省
                    this.compileData.province = this.user.province;
                    // 所属市
                    this.compileData.city = this.user.city;
                    // 所属区县
                    this.compileData.district = "";
                    // 管理员
                    this.compileData.schoolname = "";
                    // 联系电话
                    this.compileData.phone = "";
                    this.compileData.id="";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                    new PCAS("province1", "city1", "area1", "" + this.user.province + "", "" + this.user.city + "","" + this.user.district + "");
                },
                regMsg: function () {
                    this.modal.msg = "";
                },
                // model操作删除
                sure: function () {
                    if (this.btnType == 4) {
                        ajax_post(api_city_area_delete, {area_id: this.modal.id}, this);
                    } else if (this.btnType == 3) {
                        ajax_post(api_reset_pwd, {id: this.modal.user_id}, this);
                    }else if(this.paramsType == 8){//启用
                        ajax_post(api_update_status,{department_id: this.userId, status: 1},this);
                    }else if(this.paramsType == 9){//停用
                        ajax_post(api_update_status,{department_id: this.userId, status: 2},this);
                    }
                },
                //modal操作确认信息
                modal_insure_info:function(){
                    var info = $("#info-tips");
                    info.modal('close');
                },
                //数据校验
                phoneReg: function () {
                    var reg = /^((1(3|4|5|7|8)\d{9})|([0]{1}[1-9]{1}[0-9]{1}-[0-9]{8}|[0]{1}[1-9]{2}[0-9]{1}-[0-9]{7}))$/;
                    var phoneReg = reg.test(this.compileData.phone);
                    if (this.compileData.phone != '') {
                        if (!phoneReg) {
                            this.modal.msg = "请输入11位手机号码或区号 - 号码的固定电话";
                        } else {
                            this.phoneFlag = true
                        }
                    }
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
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  api_city_area_save:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            break;
                        case  api_city_area_delete:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.extend.__hash__ = new Date();
                            this.modal.msg = msg;
                            break;
                        case  api_reset_pwd:
                            // $("#info-tips").modal('open');
                            // setTimeout(function () {
                            //     $("#info-tips").modal('close');
                            // }, 1000);
                            // this.modal.msg = msg;
                            this.infoModal(status, msg);
                            break;
                        //   修改用户状态
                        case  api_update_status:
                            this.infoModal(status, msg);
                            break;
                    }
                }
            });
            table.$watch('onReady', function () {
                table.init();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });