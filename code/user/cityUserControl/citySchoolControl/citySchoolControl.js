/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("user","user_public/css/user","css!"),
        C.Co("user","schoolUserControl/classControl/classControlList","css!"),
        C.Co("user","cityUserControl/citySchoolControl/citySchoolControl","css!"),
        C.Co("user","cityUserControl/citySchoolControl/citySchoolControl","html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"),C.CM('three_menu_module'),
        "PCAS"],
    function (avalon, css1,css2,css, html, tab, modal, data_center,three_menu_module, PCAS) {
        //市级-学校维护
        var api_city_school = api.user + "school/schoolList.action";
        //市级-学校删除
        var api_city_school_delete = api.user + "school/delete.action";
        //学校类别
        var api_school_property = api.user + "schoolproperty/findlist.action";
        //市级-学校编辑
        var api_city_school_save = api.user + "school/save_school.action";
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        //市级-学校导入
        var api_city_school_import = api.user + "school/import_school.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                is_init: false,
                // 列表数据接口
                url:  api_city_school,
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
                    title: "学校名称",
                    type: "text",
                    from: "schoolname"
                }, {
                    title: "学校代码",
                    type: "text",
                    from: "schoolcode"
                },
                    {
                        title: "区县",
                        type: "text",
                        from: "district"
                    },
                    {
                        title: "学校类别",
                        type: "text",
                        from: "school_property"
                    },
                    {
                        title: "所属区域",
                        type: "text",
                        from: "qysx"
                    },
                    {
                        title: "地址",
                        type: "min_text",
                        from: "address",
                        min_width:"white-space"
                    },
                    {
                        title: "联系人",
                        type: "text",
                        from: "linkman"
                    },
                    {
                        title: "联系电话",
                        type: "text",
                        from: "phone"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                    }
                ],
                // 附加参数
                extend: {
                    department_level: 4,
                    province:"",
                    city: "",
                    //区县
                    district: "",
                    //学校名称
                    schoolname: "",
                    //教师id
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
                    //学校代码
                    schoolcode: "",
                    //学校名称
                    schoolname: "",
                    // 所属省
                    province: "",
                    // 所属市
                    city: "",
                    //学校等级
                    department_level: "",
                    // 所属区县
                    district: "",
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
                    remark: "",
                    qysx:''
                },
                // 学校类别
                school_property: [],
                //上传文件名
                fileName: "",
                schoolImport: {
                    // 返回名
                    fileBackName: "",
                    //已存在的学校代码
                    exist_code: [],
                    // 已存在的学校名称
                    exist_name: [],
                    // 文件格式错误
                    format_error: [],
                    // 校验未通过地区
                    refuse_area: [],
                    //校验未通过的学校类别
                    refuse_property: [],
                    //重复的学校代码
                    repeate_code: [],
                    //重复的学校名称
                    repeate_name: []
                },
                user: {
                    department_level: "",
                    //省
                    province: "",
                    //市
                    city: "",
                    //区县
                    district: "",
                    schoolname: "",
                    school_property: ""
                },
                phoneFlag: "",
                //修改时学校类别
                current_school_property:'',
                //修改时学校类别id
                current_school_property_id:'',
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此学校？";
                        this.modal.url =  api_city_school_delete;
                        // 当前数据的id
                        this.modal.id = params.data.id;
                        this.modal.msg = "";
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "2") {
                        this.modal.title = "修改";
                        this.modal.msg = "";
                        //学校代码
                        this.compileData.schoolcode = params.data.schoolcode;
                        //学校名称
                        this.compileData.schoolname = params.data.schoolname;
                        // 所属省
                        this.compileData.province = params.data.province;
                        // 所属市
                        this.compileData.city = params.data.city;
                        //学校等级
                        this.compileData.department_level = params.data.department_level;
                        // 所属区县
                        this.compileData.district = params.data.district;
                        //所属区域
                        this.compileData.qysx = (params.data.qysx == null) ? '': params.data.qysx;
                        //获取学校类别
                        ajax_post(api_school_property, {status: 1}, this);
                        // 学校类别
                        // this.compileData.school_property = params.data.school_property;
                        this.current_school_property = params.data.school_property;
                        //学校类型id
                        // this.user.school_property = params.data.school_property_id + "|" + params.data.school_property + "";
                        this.current_school_property_id = params.data.school_property_id;
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
                        if (this.user.department_level == "2" ){
                            new PCAS("province1", "city1", "area2", "" + this.user.province + "", "" + this.user.city + "",  "" + this.compileData.district + "");
                        }
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                        new PCAS("province1", "city1", "area1", "" + this.user.province + "", "" + this.user.city + "", "" + this.compileData.district + "");
                    }
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                nameSearch: function () {
                    this.extend.schoolname = this.user.schoolname;
                },
                init: function () {
                    this.cds();
                    // ajax_post(api_school_property, {status: 1}, this);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            //1：省级；2：市州级；3：区县级；4：校级
                            var department_level = data.department_level;
                            self.user.department_level = department_level;
                            if (department_level == "2" || department_level == "3") {
                                self.user.province = data.province;
                                self.user.city = data.city;
                                self.user.district = data.district;
                                self.extend.province = data.province;
                                self.extend.city = data.city;
                                self.extend.district = data.district;
                                self.compileData.district = data.district;
                                self.is_init = true;
                            }
                            if (department_level == "2" ){
                                new PCAS("province1", "city1", "area2", "" + data.province + "", "" + data.city + "", '请选择');
                            }
                        }
                    });
                },
                //修改、添加
                compile: function (){
                    this.reg(this.compileData.phone);
                    if (this.compileData.schoolname != "" && this.compileData.schoolcode != "" && this.compileData.area != "") {
                        if(this.compileData.qysx==''){
                            toastr.warning('请输入上所述区域')
                            return;
                        }
                        if (this.user.school_property != "") {
                            var txt = this.user.school_property;
                            var id = txt.substring(0, txt.indexOf("|"));
                            var property = txt.substring(txt.indexOf("|") + 1, txt.length);
                            this.compileData.school_property = property;
                            this.compileData.school_property_id = id;
                            if (this.compileData.phone == "") {
                                ajax_post(api_city_school_save, this.compileData.$model, this);
                            } else {
                                if (this.phoneFlag) {
                                    ajax_post(api_city_school_save, this.compileData.$model, this);
                                } else {
                                    this.modal.msg = "请输入正确格式的联系电话"
                                }
                            }
                        } else {
                            this.modal.msg = "请选择学校类别"
                        }
                    } else {
                        this.modal.msg = "学校名称、学校代码、所属区县和学校类别必填或必选"
                    }
                },
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.id = "";
                    //学校代码
                    this.compileData.schoolcode = "";
                    //学校名称
                    this.compileData.schoolname = "";
                    // 所属省
                    this.compileData.province = this.user.province;
                    // 所属市
                    this.compileData.city = this.user.city;
                    //学校等级
                    this.compileData.department_level = "";
                    // 所属区县
                    this.compileData.district = this.extend.district;
                    // 学校类别
                    this.user.school_property = "";
                    //所属区域
                    this.compileData.qysx = '';
                    //学校类别
                    this.compileData.school_property = '';
                    //学校类型id
                    this.compileData.school_property_id = "";
                    //当前学校类别
                    this.current_school_property = '';
                    //当前学校类别id
                    this.current_school_property_id = '';
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
                    //获取学校类别
                    ajax_post(api_school_property, {status: 1}, this);
                    new PCAS("province1", "city1", "area1", "" + this.compileData.province + "", "" + this.compileData.city + "","" + this.extend.district + "");
                },
                regMsg: function () {
                    this.modal.msg = "";
                },
                //上传
                uploadingModal: function () {
                    this.modal.title = "上传文件";
                    $("#file").val("");
                    this.fileName = "";
                    this.fileChange();
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
                },
                uploading: function () {
                    var file = this.fileName;
                    var subFile = file.substring(file.indexOf(".") + 1, file.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        this.modal.msg = "正在上传，请勿取消";
                        fileUpload(api_file_upload, this);
                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                fileChange: function () {
                    this.schoolImport.fileBackName = "";
                    this.modal.msg = "";
                    //已存在的学校代码
                    this.schoolImport.exist_code = "";
                    // 已存在的学校名称
                    this.schoolImport.exist_name = "";
                    // 文件格式错误
                    this.schoolImport.format_error = "";
                    // 校验未通过地区
                    this.schoolImport.refuse_area = "";
                    //校验未通过的学校类别
                    this.schoolImport.refuse_property = "";
                    //重复的学校代码
                    this.schoolImport.repeate_code = "";
                    //重复的学校名称
                    this.schoolImport.repeate_name = "";
                },
                // 删除
                sure: function () {
                    ajax_post(this.modal.url, {school_id: this.modal.id}, this);
                },
                //数据校验
                numReg: function () {
                    var reg = /^(([0]{1}[1-9]{1,2})|((?!0)\d{1,3})|(00[1-9])|([1-9]\d{2})|(\d[1-9]\d))$/;
                    var numReg = reg.test(this.compileData.class_name);
                    if (this.compileData.class_name == "") {
                        this.modal.msg = "请选择年级以及输入班级名称"
                    } else {
                        if (!numReg) {
                            this.modal.msg = "请输入正确格式的班级名称"
                        } else {
                            this.flag = true;
                        }
                    }
                },
                reg:function (phone) {
                    var reg = /^((1(3|4|5|7|8)\d{9})|([0]{1}[1-9]{1}[0-9]{1}-[0-9]{8}|[0]{1}[1-9]{2}[0-9]{1}-[0-9]{7}))$/;
                    this.phoneFlag= reg.test(phone);
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
                    if (status == 200) {
                        this.extend.__hash__ = new Date();
                    }

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    var file = $("#file-uploading");
                    switch (cmd) {
                        case  api_school_property:
                            this.school_property = data.data;
                            this.compileData.school_property = this.current_school_property;
                            this.user.school_property = this.current_school_property_id + "|" + this.current_school_property + "";
                            break;
                        case  api_city_school_save:
                            if (status == 200) {
                                compileData.modal("close");
                                this.extend.__hash__ = new Date();
                                toastr.success('提交成功')
                                return
                            }
                            toastr.error(msg);

                            // this.infoModal(status, msg);
                            break;
                        case api_file_upload:
                            if (status == 200) {
                                this.schoolImport.fileBackName = data.data.file;
                                ajax_post(api_city_school_import, {file: this.schoolImport.fileBackName}, this);
                            }
                            this.modal.msg = msg;
                            break;
                        case  api_city_school_delete:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.extend.__hash__ = new Date();
                            this.modal.msg = msg;
                            break;
                        case  api_city_school_import:
                            if (status == 200) {
                                file.modal('close');
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.extend.__hash__ = new Date();
                            } else if (status == 205) {
                                //已存在的学校代码
                                this.schoolImport.exist_code = data.data.exist_code;
                                // 已存在的学校名称
                                this.schoolImport.exist_name = data.data.exist_name;
                                // 文件格式错误
                                this.schoolImport.format_error = data.data.format_error;
                                // 校验未通过地区
                                this.schoolImport.refuse_area = data.data.refuse_area;
                                //校验未通过的学校类别
                                this.schoolImport.refuse_property = data.data.refuse_property;
                                //重复的学校代码
                                this.schoolImport.repeate_code = data.data.repeate_code;
                                //重复的学校名称
                                this.schoolImport.repeate_name = data.data.repeate_name;
                            }
                            this.modal.msg = msg;
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