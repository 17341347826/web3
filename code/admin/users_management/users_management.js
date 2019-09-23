/**
 * Created by uptang on 2017/4/28.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("admin", "school_classes/school_classes", "css!"),
        C.Co("admin", "users_management/users_management", "css!"),
        C.Co("admin", "users_management/users_management", "html!"),
        C.CM("table"),
        C.CM("modal"),
        "PCAS",C.CM('page_title')],
    function ($, avalon, css1, css2, html, tab, modal, PCAS,page_title) {
        //列表
        var users_list = api.user + "school/department_list";
        //编辑
        var users_save = api.user + "school/save_area.action";
        //启停用
        var users_status = api.user + "school/upd_status";
        //删除
        var users_delete = api.user + "school/deletearea.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                is_init: true,
                // 列表数据接口
                url: users_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "省份",
                    type: "text",
                    from: "province"
                }, {
                    title: "市州",
                    type: "text",
                    from: "city"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "单位名称",
                    type: "text",
                    from: "schoolname"
                }, {
                    title: "单位代码",
                    type: "text",
                    from: "schoolcode"
                }, {
                    title: "联系人",
                    type: "text",
                    from: "linkman"
                }, {
                    title: "学校类别",
                    type: "text",
                    from: "school_property"
                }, {
                    title: "联系电话",
                    type: "text",
                    from: "phone"
                }, {
                    title: "地址",
                    type: "text",
                    from: "address"
                }, {
                    title: "使用状态",
                    type: "html",
                    from:
                    "<span class='am-icon-toggle-on' ms-visible='el.status==1' ms-on-click='@oncbopt({current:$idx, type:2})'></span>" +
                    "<span class='am-icon-toggle-off'  ms-visible='el.status==2' ms-on-click='@oncbopt({current:$idx, type:1})'></span>"
                }, {
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='编辑'></a>" +
                    "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                }],
                // 附加参数
                extend: {
                    province: "",
                    city: "",
                    district: "",
                    schoolcode: "",
                    status: "",
                    __hash__: ""
                },
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //增加、修改
                compileData: {
                    //id
                    id: "",
                    // 所属省
                    province: "",
                    // 所属市
                    city: "",
                    // 所属区县
                    district: "",
                    //代码
                    schoolcode: "",
                    //名称
                    schoolname: "",
                    //等级
                    department_level: "",
                    // 学校类别
                    school_property: "",
                    //学校类型id
                    school_property_id: "",
                    // 联系人
                    linkman: "",
                    // 联系电话
                    phone: "",
                    //通讯地址
                    address: "",
                    //备注
                    remark: ""
                },
                // 学校类别
                school_property: [],
                user: {
                    schoolcode: ""
                },
                paramsType: "",
                phoneFlag: "",
                codeFlag: "",
                nameRegFlag:"",
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此用户？";
                        this.modal.url = users_delete;
                        this.modal.id = params.data.id;
                        this.modal.msg = "";
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "3") {
                        this.modal.title = "修改";
                        this.modal.msg = "";
                        new PCAS("province1", "city1", "area1", "" + params.data.province + "", "" + params.data.city + "", "" +  params.data.district + "");
                        //名称
                        this.compileData.schoolname = params.data.schoolname;
                        //代码
                        this.compileData.schoolcode = params.data.schoolcode;
                        //等级
                        this.compileData.department_level = params.data.department_level;
                        // 省
                        this.compileData.province = params.data.province;
                        // 市
                        this.compileData.city = params.data.city;
                        // 区县
                        this.compileData.district = params.data.district;
                        if (params.data.linkman != null) {
                            // 联系人
                            this.compileData.linkman = params.data.linkman;
                        } else {
                            this.compileData.linkman = "";
                        }
                        if (params.data.phone != null) {
                            // 联系电话
                            this.compileData.phone = params.data.phone;
                            this.phoneFlag = true;
                        } else {
                            this.compileData.phone = "";
                        }
                        if (params.data.address != null) {
                            //通讯地址
                            this.compileData.address = params.data.address;
                        } else {
                            this.compileData.address = "";
                        }
                        this.compileData.id = params.data.id;
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    } else {
                        if (params.type == "1") {
                            this.modal.id = params.data.id;
                            this.modal.title = "启用";
                            this.modal.info = "是否启用此用户？";
                            this.modal.msg = "";
                            this.paramsType = 1;
                        } else if (params.type == "2") {
                            this.modal.id = params.data.id;
                            this.modal.title = "停用";
                            this.modal.info = "是否停用此用户？";
                            this.modal.msg = "";
                            this.paramsType = 2;
                        }
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //查询事件
                nameSearch: function () {
                    this.extend.schoolcode = this.user.schoolcode;
                },
                init: function () {
                    this.$watch("onReady", function () {
                        new PCAS("province", "city", "area");
                    });
                },
                //修改、添加
                compile: function () {
                    this.reg(this.compileData.phone);
                    if(this.compileData.schoolname!=""){
                        var nameReg=/^[\u4e00-\u9fa5]+$/;
                        var numReg = nameReg.test(this.compileData.schoolname);
                        if (numReg) {
                            if (this.compileData.schoolcode != "" &&
                                this.compileData.department_level != "") {
                                if (this.compileData.department_level == 1) {
                                    if (this.compileData.province != "") {
                                        this.phoneSave();
                                    } else {
                                        this.modal.msg = "请选择省份"
                                    }
                                } else if (this.compileData.department_level == 2) {
                                    if (this.compileData.province != "" &&
                                        this.compileData.city != "") {
                                        this.phoneSave();
                                    } else {
                                        this.modal.msg = "请选择省份和市州"
                                    }
                                } else if (this.compileData.department_level == 3
                                    ||this.compileData.department_level == 4) {
                                    if (this.compileData.province != "" &&
                                        this.compileData.city != "" &&
                                        this.compileData.district != "") {
                                        this.phoneSave();
                                    } else {
                                        this.modal.msg = "请选择省份和市州以及区县"
                                    }
                                }
                            } else {
                                this.modal.msg = "请选择或填写，必填或必选项"
                            }
                        } else {
                            this.modal.msg = "请输入中文单位名称"
                        }
                    }else {
                        this.modal.msg = "请输入中文单位名称"
                    }
                },
                phoneSave: function () {
                    if (this.compileData.phone == "") {
                        ajax_post(users_save, this.compileData.$model, this);
                    } else {
                        if (this.phoneFlag) {
                            ajax_post(users_save, this.compileData.$model, this);
                        } else {
                            this.modal.msg = "请输入正确格式的联系电话"
                        }
                    }
                },
                addInfo: function () {
                    var mod = new PCAS("province1", "city1", "area1");
                    mod.SelA.selectedIndex = 0;
                    mod.SelP.selectedIndex = 0;
                    mod.SelC.selectedIndex = 0;
                    this.modal.title = "添加";
                    this.compileData.id = "";
                    //代码
                    this.compileData.schoolcode = "";
                    //名称
                    this.compileData.schoolname = "";
                    // 省
                    this.compileData.province = "";
                    // 市
                    this.compileData.city = "";
                    // 区县
                    this.compileData.district = "";
                    //等级
                    this.compileData.department_level = "";
                    // 联系人
                    this.compileData.linkman = "";
                    // 联系电话
                    this.compileData.phone = "";
                    //通讯地址
                    this.compileData.address = "";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                regMsg: function () {
                    this.modal.msg = "";
                },
                // 删除
                sure: function () {
                    if (this.paramsType == "1") {
                        ajax_post(users_status, {status: 1, department_id: this.modal.id}, this);
                    } else if (this.paramsType == "2") {
                        ajax_post(users_status, {status: 2, department_id: this.modal.id}, this);
                    } else {
                        ajax_post(users_delete, {area_id: this.modal.id}, this);
                    }
                },
                //数据校验
                numReg: function () {
                    var reg = /^(([a-zA-Z]+)|([0-9]+)|([a-zA-Z0-9]+))$/;
                    var numReg = reg.test(this.compileData.schoolcode);
                    if (this.compileData.schoolcode == "") {
                        this.modal.msg = "请填写单位代码"
                    } else {
                        if (!numReg) {
                            this.modal.msg = "请输入正确格式的单位代码,例:11或a11或11a或A11或11A"
                        } else {
                            this.codeFlag = true;
                        }
                    }
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
                        case users_delete:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.extend.__hash__ = new Date();
                            this.modal.msg = msg;
                            break;
                        case users_status :
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.extend.__hash__ = new Date();
                            this.modal.msg = msg;
                            break;
                        case  users_save:
                            if (status == 200) {
                                compileData.modal("close");
                                // 省
                                this.compileData.province = "";
                                // 市
                                this.compileData.city = "";
                                // 区县
                                this.compileData.district = "";
                                //等级
                                this.compileData.department_level = "";
                                var mod = new PCAS("province1", "city1", "area1");
                                mod.SelA.selectedIndex = 0;
                                mod.SelP.selectedIndex = 0;
                                mod.SelC.selectedIndex = 0;
                            }
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