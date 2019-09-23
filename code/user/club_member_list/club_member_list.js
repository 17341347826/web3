/**
 * Created by Administrator on 2018/9/18.
 */
define([
        C.CLF('avalon.js'),"jquery","layer",
        C.Co("user","club_member_list/club_member_list","css!"),
        C.Co("user","club_member_list/club_member_list","html!"),
        C.CM("table"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon,$,layer,css, html, tab, data_center,three_menu_module) {
        //获取指定学校的年级班级集合--校领导、教师不用
        var api_grade_class = api.user + 'class/school_class.action';
        //查询某个人有哪些社团
        var api_query_communitys = api.api + 'GrowthRecordBag/query_communitys_by_fzrid';
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        // 导入社团人员
        var api_import_memeber = api.growth + "import_community_members";
        //查询所有社团
        var api_query_member=api.growth + 'query_community_members';
        //删除社团
        var api_delete_member = api.growth + 'delete_community_member';
        //修改社团
        var api_uptade_member = api.growth + 'update_community_member';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "club_member_list",
                // 列表数据接口
                url: api_query_member,
                remember:false,
                is_init: false,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                //年级
                grade_list:[],
                //班级
                class_list:[],
                //社团名称
                club_list:[],
                club_name:'',
                //联系方式状态
                phone_type:false,
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
                    //负责人guid
                    fk_fzr_id:'',
                    fk_nj_id:'',
                    fk_bj_id:'',
                    xsxm:'',
                    __hash__:''
                },
                //增加、修改
                compileData: {
                    //班级名称
                    bjmc:'',
                    //班级id:'
                    fk_bj_id:'',
                    //年级id:'
                    fk_nj_id:'',
                    //社团id:'
                    fk_st_id:'',
                    //学生id:'
                    fk_xs_id:'',
                    //学校id:'
                    fk_xx_id:''	,
                    id:'',
                    //联系方式:'
                    lxfs	:'',
                    //年级名称:'
                    njmc	:'',
                    //qq:'
                    qq	:'',
                    //社团名称:'
                    stmc	:'',
                    //性别:'
                    xb	:'',
                    //学籍号:'
                    xjh	:'',
                    //学生姓名:'
                    xsxm	:'',
                    //学校名称:'
                    xxmc	:'',
                },
                //修改信息
                model_msg:'',
                //上传文件名
                fileName: "",
                //上传文件
                importData: {
                    // 返回名
                    fileBackName: "",
                    //已经存在的学籍号
                    exist_student: [],
                    // 文件格式错误的工作表
                    format_error: [],
                    // 校验未通过的班级
                    refuse_class: [],
                    // 校验未通过的年级
                    refuse_grade: [],
                    //校验未通过的学校
                    refuse_school: [],
                    //在当前文件中重复的学籍号
                    repeate_student: []
                },
                //文件返回错误
                upload_msg:[],
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "社团名称",
                        type: "text",
                        from: "stmc"
                    },
                    {
                        title: "年级",
                        type: "text",
                        from: "njmc"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "bjmc"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "xsxm"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "xjh"
                    },
                    {
                        title: "性别",
                        type: "cover_text",
                        from: "xb",
                        //1:男2:女
                        dict: {
                            1: '男',
                            2: '女',
                        }
                    },
                    {
                        title: "联系方式",
                        type: "text",
                        from: "lxfs"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='修改'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='删除'></a>"
                    }],
                //  列表按钮操作
                cbopt: function (params) {
                    var self=this;
                    var id=params.data.id;
                    //console.log(params);
                    // 当前数据的id
                    if (params.type == "2") {
                        layer.confirm('是否删除此社团信息？', {
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            ajax_post(api_delete_member,{id:id},self);
                            layer.closeAll();
                        });
                    } else if (params.type == "1") {
                        window.location = '#club_member_add?info='+JSON.stringify(params.data);
                        // $("#compileData").modal({
                        //     closeOnConfirm: false
                        // });
                        // //班级名称
                        // self.compileData.bjmc     = params.data.bjmc;
                        // //班级id
                        // self.compileData.fk_bj_id = params.data.fk_bj_id;
                        // //年级名称
                        // self.compileData.njmc     = params.data.njmc;
                        // //年级id
                        // self.compileData.fk_nj_id = params.data.fk_nj_id;
                        // //社团名称
                        // self.compileData.stmc     = params.data.stmc;
                        // //社团id
                        // self.compileData.fk_st_id = params.data.fk_st_id;
                        // //学生id
                        // self.compileData.fk_xs_id = params.data.fk_xs_id;
                        // //学校id
                        // self.compileData.fk_xx_id = params.data.fk_xx_id;
                        // //id
                        // self.compileData.id       = id;
                        // //联系方式
                        // self.compileData.lxfs     = params.data.lxfs;
                        // //qq
                        // self.compileData.qq       = params.data.qq;
                        // //性别
                        // self.compileData.xb       = params.data.xb;
                        // //学籍号
                        // self.compileData.xjh      = params.data.xjh;
                        // //学生姓名
                        // self.compileData.xsxm     = params.data.xsxm;
                        // //学校名称
                        // self.compileData.xxmc     = params.data.xxmc;
                    }
                },
                //修改提交
                update_member:function(){
                    ajax_post(api_uptade_member,this.compileData.$model,this);
                },
                // 获取年级
                init: function () {
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var higType = data.data.highest_level;
                        var tUser = JSON.parse(data.data.user);
                        self.extend.fk_fzr_id = tUser.guid;
                        var school_id = tUser.fk_school_id;
                        if(higType == 4){//校
                            // //年级班级
                            // ajax_post(api_grade_class,{school_id:school_id},self);
                        }else if(higType == 5 || higType == 6){//年级、教师
                            // var list = tUser.lead_class_list;
                            // list = list.concat(tUser.teach_class_list);
                            // self.grade_list = self.aryobj_deweighting(list,'grade_id');
                            // self.class_list = self.grade_list[0].class_list;
                        }
                        //年级班级
                        ajax_post(api_grade_class,{school_id:school_id},self);
                        self.is_init = true;
                    //    查询社团
                        ajax_post(api_query_communitys,{},self);
                    });
                },
                //数组对象去重: 利用对象访问属性的方法，判断对象中是否存在key
                aryobj_deweighting:function(arr,name){
                    var ary = [];
                    var obj = {};
                    for(var i=0;i<arr.length;i++){
                        if(!obj[arr[i].key]){
                            ary.push(arr[i]);
                            obj[arr[i].key] = true;
                        }
                    }
                    return ary;
                },
                //年级改变
                grade_change:function(){
                    this.extend.fk_bj_id = '';
                    this.class_list = [];
                    var id = this.extend.fk_nj_id;
                    var list = this.grade_list;
                    for(var i=0;i<list.length;i++){
                        if(id == list[i].grade_id){
                            this.class_list = list[i].class_list;
                            break;
                        }
                    }
                },
                //联系方式
                phone_check: function() {
                    var self = this;
                    var reg = /^((1(3|4|5|7|8)\d{9}))$/;
                    var _txt = $("#phone").val();
                    if (reg.test(_txt)) {
                        self.phone_type = true;
                        self.modal.msg = "";
                    } else {
                        self.phone_type = false;
                        self.modal.msg  = "请输入正确的联系方式";
                    }
                },
                //上传
                uploadingModal: function () {
                    if(this.club_name == ''){
                        layer.alert('请选择社团名称', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
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
                        // fileUpload(api_file_upload, this);
                        fileUpload(api_import_memeber, this);
                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                fileChange: function () {
                    this.modal.msg = "";
                    // this.importData.fileBackName = "";
                    // //已经存在的学籍号
                    // this.importData.exist_student = "";
                    // // 文件格式错误的工作表
                    // this.importData.format_error = "";
                    // // 校验未通过的班级
                    // this.importData.refuse_class = "";
                    // // 校验未通过的年级
                    // this.importData.refuse_grade = "";
                    // //校验未通过的学校
                    // this.importData.refuse_school = "";
                    // //在当前文件中重复的学籍号
                    // this.importData.repeate_student = "";
                },
                //页面切换
                gra_change:function(num){
                    if(num == 2){
                        window.location = '#club_notice';
                    }else if(num == 3){
                        window.location = '#recruit_infor_list';
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd) {
                            //文件上传
                            // case  api_file_upload:
                            //     if (status == 200) {
                            //        var file_info = data.data.file;
                            //         ajax_post(api_import_memeber, {communityName:this.club_name,file: file_info}, this);
                            //     }
                            //     this.modal.msg = msg;
                            //     break;
                            //        导入社团人员
                            case api_import_memeber:
                                // if(status == 200){
                                //     $("#file-uploading").modal({
                                //         closeOnConfirm: true
                                //     });
                                //     this.extend.__hash__ = new Date();
                                // }else{
                                //     this.complete_import_member(data);
                                // }
                                this.complete_import_member(data);
                                break;
                            //    年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //        查询社团
                            case api_query_communitys:
                                this.club_list = data.data;
                                break;
                            //        删除社团成员
                            case api_delete_member:
                                toastr.success('删除成功');
                                this.extend.__hash__ = new Date();
                                break;
                        //        修改社团
                            case api_uptade_member:
                                this.complete_update_member(data);
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }

                },
                //导入社团成员错误判断
                complete_import_member:function(data){
                    if(data.data == null || data.data.length == 0){
                        $("#file-uploading").modal({
                            closeOnConfirm: true
                        });
                        this.extend.__hash__ = new Date();
                    }else{
                        this.upload_msg = data.data;
                    }

                },
                //年级班级
                complete_grade_class:function (data) {
                    this.grade_list = data.data;
                    // this.class_list = this.grade_list[0].class_list;
                },
            //    修改社团成员
                complete_update_member:function(data){
                    $("#compileData").modal({
                        closeOnConfirm: true
                    });
                    toastr.success('修改成功');
                    this.extend.__hash__ = new Date();
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