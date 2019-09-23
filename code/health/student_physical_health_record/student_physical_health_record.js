define(['jquery',
        C.CLF('avalon.js'),
        C.Co("health","student_physical_health_record/student_physical_health_record","html!"),
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
        //获取成绩集合
        var api_get_art_evaluation_list_score= api.api+"score/health_project_query";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "teacher_edit_art_evaluation",
                index:"",
                /*判断权限操作*/
                user_type: "",
                fileName:"",
                show_json:function (x) {
                    return JSON.stringify(x)
                },
                body:[],
                data: {
                    form:{
                        code:"",
                        phase:"",
                        project:"",
                        year:""
                    },
                    // 学年学期
                    semester_name:"",
                    status:"1",
                    // 学年学期集合
                    semester_name_arr:[],
                    //项目
                    project_list:[],
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
                        toastr.warning("请选择学年学期");
                    }else{
                        var is_up_or_down=get_semester_name.substr(-3,1);
                        this.data.form.year=get_semester_name.substr(0,4);
                        if(is_up_or_down=="上"){
                            this.data.form.phase="0";
                            this.project_data.phase="0";
                        }else{
                            this.data.form.phase="1";
                            this.project_data.phase="1";
                        }
                    }
                },
                projectChange:function () {
                    var project_id=this.data.form.project;
                    if(project_id==0){
                        toastr.warning("请选择测评方案");
                    }
                },
                checkBtn:function () {
                    if(this.data.form.project==""){
                        toastr.warning("请先选择")
                    }else{
                        this.index = layer.load(1, {shade:[0.3,'#121212']}); //0代表加载的风格，支持0-2
                        //获取成绩+学科指标
                        ajax_post(api_get_art_evaluation_list_score, this.data.form, this);
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
                            //获取学生基本信息
                            case api_send_token:
                                this.complete_send_token_get_student_info(data);
                                break;
                            //获取年级(高三)
                            case get_grade_remark:
                                this.project_data.due_grade=data.data[0].id.toString();
                                ajax_post(api_get_project,this.project_data,this);
                                break;
                            //获取项目
                            case api_get_project:
                                this.complete_get_project(data);
                                break;
                            //获取成绩集合
                            case api_get_art_evaluation_list_score:
                                this.complete_get_art_evaluation_list_score(data);
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
                complete_send_token_get_student_info:function (data) {
                    var userData = JSON.parse(data.data["user"]);
                    this.data.form.code=userData.code;
                    var grade_remark=userData.grade_name;
                    this.tbody=[
                        {name:userData.name,code:userData.code,account:userData.code,grade_name:userData.grade_name,class_name:userData.class_name}
                    ];
                    ajax_post(get_grade_remark,{grade_name:grade_remark,status:1},this);
                },
                //获取项目
                complete_get_project:function (data) {
                    this.data.project_list=data.data.list;
                },
                //获取成绩+学科指标回调
                complete_get_art_evaluation_list_score:function (data) {
                    //取成绩集合
                    var tbody_score=data.data;
                    for(var x = 0; x < this.tbody.length; x++ ){
                        var student = this.tbody[x];
                        for(var i = 0; i < tbody_score.columns.length; i++ ){
                            var subject = tbody_score.columns[i];
                            this.tbody[x][subject.alias] = tbody_score.data[subject.alias];
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
                    this.theadTh=this.tbodyTd;
                    this.tbodyex=this.tbody;

                    layer.close(this.index);
                },
                showDate: function (col_confi, row_data) {
                    return row_data[col_confi.from]
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