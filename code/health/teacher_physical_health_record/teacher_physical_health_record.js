define(['jquery',
        C.CLF('avalon.js'),
        C.Co("health","teacher_physical_health_record/teacher_physical_health_record","html!"),
        C.Co("growth","art_evaluation/teacher_edit_art_evaluation/teacher_edit_art_evaluation","css!"),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM('page_title'),'layer'
    ],
    function($, avalon, html,css, x, data_center,page_title,layer) {
        //获取学年学期
        var api_get_semester_name= api.api+"base/semester/used_list.action";
        //获取年级班级
        var api_send_token=api.PCPlayer+"baseUser/sessionuser.action";
        //获取年级(高一)
        var get_grade_remark=api.api+"base/grade/findGrades.action";
        //获取测评项目
        var api_get_project=api.api+"score/health_project_list";
        //获取学生信息
        var api_art_evaluation_get_student_info= api.PCPlayer + "baseUser/studentlist.action";
        //获取成绩集合
        var api_get_art_evaluation_list_score= api.api+"score/health_project_score_list";
        //保存
        var api_art_evaluation_save_or_update= api.api+"score/health_score_set";
        //
        var api_uploader_cj=api.api+"score/uploader_cj";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "teacher_edit_art_evaluation",
                index:"",
                sex:"",
                /*判断权限操作*/
                user_type: "",
                fileName:"",
                pms:"",
                show_json:function (x) {
                    return JSON.stringify(x)
                },
                project_grade:"",
                get_grade_remark:"",
                grade_pmx:{
                    "一年级":{id:1},
                    "二年级":{id:2},
                    "三年级":{id:3},
                    "四年级":{id:4},
                    "五年级":{id:5},
                    "六年级":{id:6},
                    "七年级":{id:7},
                    "八年级":{id:8},
                    "九年级":{id:9},
                    "高一":{id:10},
                    "高二":{id:11},
                    "高三":{id:12}
                },
                data: {
                    form:{
                        _id:"",
                        fk_class_id:"",//班级id
                        fk_school_id:""//学校id
                    },
                    //学生信息合集
                    infObj:"",
                    //学科id
                    subject_id:"",
                    //学生用户id
                    student_code:"",
                    // 学年学期
                    semester_name:"",
                    // 科目id
                    course_name:"",
                    // 班级id(获取学生信息)
                    fk_class_id:"",
                    status:"1",
                    // 学年学期集合
                    semester_name_arr:[],
                    // 年级班级集合
                    teach_class_list:[],
                    //年级(高三)
                    grade_remark_list:[],
                    //项目
                    project_list:[],
                    // 学科集合
                    subject_arr:[]
                },
                project_data:{
                    phase:"",
                    //适用年级
                    due_grade:"",
                    is_runing:true,
                    all:'',
                    rows:'',
                    end:'',
                    start:'',
                    offset:'',
                    name__icontains:''
                },
                // 表头名称
                theadTh: [],
                tbodyTd:[],
                //表内容(学生信息)
                tbody:[],
                tbodyex:[],
                //表内容(学生成绩)
                // tbody_score:[],
                num:"",
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                uploadForm:{
                    class_id:"",//班级id
                    subject_id:"",//科目id
                    grade_id:"",//年级id
                    phase:"",//0上学期 1下学期
                    school_id:"",//学校id
                    year:""//2017
                },
                get_all_info:function () {
                    //获取学年学期
                    ajax_post(api_get_semester_name, {status:this.data.status}, this);
                    //获取年级班级
                    ajax_post(api_send_token, {}, this);
                },
                semesterChange:function () {
                   var get_semester_name=this.data.semester_name;
                   if(get_semester_name==0){
                       toastr.warning('请选择学年学期');
                   }else{
                       var is_up_or_down=get_semester_name.substr(-3,1);
                       if(is_up_or_down=="上"){
                           this.project_data.phase="0";
                       }else{
                           this.project_data.phase="1";
                       }
                   }
                },
                changeGrade:function () {
                    var grade_name=this.project_grade;
                    if(grade_name==0){
                        toastr.warning("请先选择年级");
                    }else{
                        this.project_data.due_grade=this.grade_pmx[grade_name].id.toString();
                        ajax_post(api_get_project,this.project_data,this);
                    }
                },
                classChange:function () {
                    if(this.data.form.class_id==0){
                        toastr.warning('请选择班级');
                    }
                },
                projectChange:function () {
                  var project_id=this.data.form._id;
                  if(project_id==0){
                      toastr.warning('请选择测评方案');
                  }
                },
                checkBtn:function () {
                    if(this.data.form._id==""){
                        toastr.warning('请先选择');
                    }else{
                        this.index = layer.load(1, {shade:[0.3,'#121212']}); //0代表加载的风格，支持0-2
                        //获取班级学生信息
                        this.data.fk_class_id= this.data.form.fk_class_id;
                        ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.data.fk_class_id}, this);

                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;
                    })
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    var file = $("#file-uploading");
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_semester_name:
                                this.complete_get_semester_name(data);
                                break;
                            //获取老师基本信息
                            case api_send_token:
                                this.complete_send_token_get_teacher_info(data);
                                break;
                            //获取年级(高三)
                            case get_grade_remark:
                                this.complete_grade_remark(data);
                                break;
                            //获取项目
                            case api_get_project:
                                this.complete_get_project(data);
                                break;
                            //获取学生信息
                            case api_art_evaluation_get_student_info:
                                this.complete_art_evaluation_get_student_info(data);
                                break;
                            //获取成绩集合
                            case api_get_art_evaluation_list_score:
                                this.complete_get_art_evaluation_list_score(data);
                                break;
                            case  api_uploader_cj:
                                this.complete_uploader_cj(data);
                                break;
                            case api_art_evaluation_save_or_update:
                                this.complete_art_evaluation_save_or_update(data);
                                break;
                        }
                    } else {
                        toastr.error('操作失败');
                    }
                },
                complete_get_semester_name:function (data) {
                    var self=this;
                    var semester_data=data.data;
                    self.data.semester_name_arr=semester_data;
                },
                complete_send_token_get_teacher_info:function (data) {
                    var self=this;
                    var cArr = [];
                    var userType = data.data.user_type;
                    if (userType == "1") {//老师
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.teach_class_list;
                        self.data.teach_class_list = cArr;
                        for(var i=0;i<cArr.length;i++){
                            self.data.form.fk_class_id = cArr[i].class_id.toString();
                            self.data.form.fk_school_id= cArr[i].school_id.toString();
                            self.get_grade_remark= cArr[i].grade_id.toString();
                        }
                        ajax_post(get_grade_remark,{id:self.get_grade_remark,status:1},self);
                    }
                },
                //获取年级(高三)
                complete_grade_remark:function (data) {
                    this.data.grade_remark_list=data.data;
                },
                //获取项目
                complete_get_project:function (data) {
                    this.data.project_list=data.data.list;
                },
                //学生信息回调
                complete_art_evaluation_get_student_info:function (data) {
                    if(data.data.list==""){
                        toastr.error('暂无学生信息');
                    }else{
                        this.tbody=data.data.list;
                    }
                    //获取成绩+学科指标
                    ajax_post(api_get_art_evaluation_list_score, this.data.form, this);
                },
                //获取成绩+学科指标回调
                complete_get_art_evaluation_list_score:function (data) {
                    //取成绩集合
                    var tbody_score=data.data;
                    // alert(JSON.stringify(tbody_score))
                    for(var x = 0; x < this.tbody.length; x++ ){
                        var student = this.tbody[x];
                        for(var i = 0; i < tbody_score.columns.length; i++ ){
                            var subject = tbody_score.columns[i];
                            if( tbody_score.hasOwnProperty(student.code) ){
                                this.tbody[x][subject.alias] = tbody_score[student.code][subject.alias];
                                this.tbody[x]._id = tbody_score[student.code]._id
                            }else{

                                this.tbody[x][subject.alias] = {
                                    "value":"",
                                    "score":"",
                                    "level":""
                                }
                            }
                        }
                    }
                    //获取到所有学科
                    var course_value=data.data.columns;
                    var table_head = [
                        {name:"序号",type:"index", from:"index"},
                        {name:"姓名",type:"text", from:"name"},
                        {name:"学籍号",type:"text", from:"account"},
                        {name:"年级",type:"text", from:"grade_name"},
                        {name:"班级", type:"text",from:"class_name"}
                    ];
                    this.tbodyTd = table_head.concat(course_value);
                    this.tbodyTd.push({
                        name:"操作",
                        type:"html",
                        from: "<a class='tab-btn tab-edit-btn' ms-click='@edit(el)' ms-if='@el.user_id != @num' title='编辑'></a>" +
                        "<a class='tab-btn tab-pass-btn' ms-click='@save(el)' ms-if='@el.user_id == @num' title='保存'></a>"
                    });
                    this.theadTh=this.tbodyTd;
                    this.tbodyex=this.tbody;

                    layer.close(this.index);
                },
                showDate: function (col_confi, row_data) {
                    if (col_confi.type == "html") {
                        return col_confi.from;
                    }
                    return row_data[col_confi.from]
                },
                edit: function (params) {
                    params.data = this.tbody[params.current];
                    this.sex=params.sex;
                    this.num=params.user_id;
                },
                save:function (params) {
                    var grade_name=this.data.semester_name;//2017年上学期
                    params.year=this.data.form.year;//测试使用
                    is_up_or_down=grade_name.substr(5,1);
                    if(is_up_or_down=="上"){
                        params.phase="0";
                    }else{
                        params.phase="1";
                    }
                    // params.subject_id=this.data.form.subject_id;
                    params.fk_grade_id=params.fk_grade_id.toString();
                    params.fk_school_id=params.fk_school_id.toString();
                    params.fk_class_id=params.fk_class_id.toString();
                    params.project=this.data.form._id;
                    this.pms = params;
                    ajax_post(api_art_evaluation_save_or_update, params, this);
                    this.num=-1;
                },
                complete_art_evaluation_save_or_update:function (data) {
                    toastr.success('保存成功');
                    if( data.data.hasOwnProperty("_id")){
                        this.pms._id = data.data._id;
                    }
                },
                //批量导入
                uploadingModal: function () {
                    $("#file").val("");
                    this.fileName="";
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
                },
                //开始上传
                uploading: function () {
                    var file=this.fileName;
                    var subFile = file.substring(file.indexOf(".") + 1, file.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        // this.data.form.file=file;
                        var grade_name=this.data.semester_name;//2017年上学期
                        this.uploadForm.year=Number(grade_name.substr(0,4));
                        is_up_or_down=grade_name.substr(5,1);
                        if(is_up_or_down=="上"){
                            this.uploadForm.phase=0;
                        }else{
                            this.uploadForm.phase=1;
                        }
                        this.uploadForm.class_id= this.data.form.class_id;
                        this.uploadForm.grade_id= this.data.form.grade_id;
                        this.uploadForm.school_id= this.data.form.school_id;
                        this.uploadForm.subject_id= this.data.form.subject_id;
                        this.modal.msg = "正在上传，请勿取消";
                        console.log("this.data.form"+JSON.stringify(this.data.form));
                        fileUpload(api_uploader_cj,this);

                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                complete_uploader_cj:function (data) {
                    $("#file-uploading").modal({
                        closeOnConfirm: true
                    });
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
                this.get_all_info();
            });

            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    })