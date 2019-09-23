define(['jquery',
        C.CLF('avalon.js'),
        C.Co("achievement","subject_score/subject_score","css!"),
        C.Co("achievement","subject_score/subject_score","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        'layer',
        C.CM('three_menu_module')
    ],
    function($, avalon, css,html, x, data_center,layer,three_menu_module) {
        //获取学年学期
        var api_get_semester_name= api.api+"base/semester/used_list.action";
        //获取年级
        var api_get_grade=api.PCPlayer+"class/school_class.action";
        //获取初2016年级是几年级
        var api_get_grade_class=api.api+"base/grade/findGrades.action";
        //获取学生信息
        var api_art_evaluation_get_student_info= api.PCPlayer + "baseUser/studentlist.action";
        //获取成绩集合
        var api_get_art_evaluation_list_score= api.api+"score/list_score";
        //保存
        var api_art_evaluation_save_or_update= api.api+"score/save_or_update_score";
        //提交公示
        var api_save_pub=api.api+"score/course_group_make_pub";
        //上传成绩
        var api_uploader_cj=api.api+'score/upload_score_file';
        var avalon_define = function() {
            avalon.filters.code_format = function (str) {
                return '...'+str.substring(16);
            };
            var vm = avalon.define({
                $id: "subject_score",
                index:"",
                show_public_click:false,
                is_show_table:false,
                is_show_btn:true,
                _id:"",
                sex:"",
                /*判断权限操作*/
                user_type: "",
                fileName:"",
                grade_change:[],
                pms:"",
                get_grade_name:"",
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
                show_json:function (x) {
                    return JSON.stringify(x)
                },
                data: {
                    form:{
                        fk_class_id:"",//班级id
                        subject_id:"1000",//科目id
                        fk_grade_id:"",//年级id
                        phase:"",//0上学期 1下学期
                        fk_school_id:"",//学校id
                        year_end:"",
                        year_start:""
                    },
                    //学生信息合集
                    infObj:"",
                    //学科id
                    subject_id:"",
                    //学生用户id
                    student_code:"",
                    // 学年学期
                    semester_name:"",
                    // 班级id(获取学生信息)
                    class:'',
                    class_id:"",
                    grade_str:"",
                    status:"1",
                    // 学年学期集合
                    semester_name_arr:[],
                    // 年级班级集合
                    teach_class_list:[],
                    class_list:[],
                    project_arr:[],
                    // 学科集合
                    subject_arr:[]
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
                    subject_id:"",//科目id
                    phase:"",//0上学期 1下学期
                    year_start:'',
                    year_end:''

                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var fk_school_id=tUserData.fk_school_id;
                        self.data.form.fk_school_id=fk_school_id+"";
                        ajax_post(api_get_grade,{school_id:fk_school_id},self);
                    });
                },
                semesterChange:function () {
                    var get_semester=this.data.semester_name;
                    if(get_semester!=0){
                        var start_time=get_semester.split('|')[0];
                        var end_time=get_semester.split('|')[1];
                        var is_up_or_down=get_semester.split('|')[2];
                        this.data.form.year_start=this.timeChuo(start_time);
                        this.data.form.year_end=this.timeChuo(end_time);

                        // this.project_detail.year_start=this.timeChuo(start_time);
                        // this.project_detail.year_end=this.timeChuo(end_time);
                        if(is_up_or_down==1){
                            this.data.form.phase='0';
                        }else{
                            this.data.form.phase='1';
                        }
                    }
                },
                gradeChange:function () {
                    var grade=this.data.grade_str;
                    if(grade!=0){
                        this.data.form.fk_grade_id=grade.split('|')[0];
                        var grade_name=grade.split('|')[1];
                        for(var i=0;i<this.data.teach_class_list.length;i++){
                            if(grade_name==this.data.teach_class_list[i].grade_name){
                                this.data.class_list=this.data.teach_class_list[i].class_list;
                            }
                        }
                        //将年级转化成1-12
                        ajax_post(api_get_grade_class,{grade_name:grade_name},this);
                    }else{
                        this.data.form.fk_grade_id=0;
                    }
                },
                classChange:function () {
                    if(this.data.class!=0){
                        var get_class=this.data.class;
                        var get_class_id=get_class.split('|')[0];
                        var get_class_name=get_class.split('|')[1];
                        this.data.form.fk_class_id=get_class_id;
                        // this.project_detail.fk_class_id=get_class_id;
                        for(var i=0;i<this.data.class_list.length;i++){
                            if(get_class_id==this.data.class_list[i].class_id){
                                this.data.subject_list=this.data.class_list[i].subject_list
                            }
                        }
                    }else{
                        this.data.form.fk_class_id=0;
                    }
                },
                checkBtn:function () {
                    if(this.data.semester_name==0 || this.data.semester_name==""){
                        toastr.warning("请选择学年学期")
                    }else if(this.data.form.fk_grade_id==0 || this.data.form.fk_grade_id==""){
                        toastr.warning("请选择年级")
                    }else if(this.data.form.fk_class_id==0 || this.data.form.fk_class_id==""){
                        toastr.warning("请选择班级")
                    }
                    else{
                        this.index = layer.load(1, {shade:[0.3,'#121212']});; //0代表加载的风格，支持0-2
                        //获取班级学生信息
                        this.data.fk_class_id= this.data.form.fk_class_id;
                        this.tbody=[];
                        ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.data.fk_class_id}, this);
                    }
                    //艺术和体质测评才会进入公示
                    if(this.data.form.subject_id==10 || this.data.form.subject_id==11){
                        this.show_public_click=true;
                    }

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    var file = $("#file-uploading");
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_semester_name:
                                this.complete_get_semester_name(data);
                                break;
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //获取年级(1-12)
                            case api_get_grade_class:
                                this.complete_get_grade_class(data);
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
                            //提交公示
                            case api_save_pub:
                                this.complete_save_pub(data);
                                break;
                        }
                    } else {
                        layer.close(this.index);
                        toastr.error(msg);
                        this.modal.msg = "上传失败";
                    }
                },
                complete_get_semester_name:function (data) {
                    var semester_data=data.data;
                    this.data.semester_name_arr=semester_data;
                },
                complete_get_grade:function (data) {
                    this.data.teach_class_list=data.data;
                    //获取学年学期
                    ajax_post(api_get_semester_name, {status:this.data.status}, this);
                },
                complete_get_grade_class:function (data) {
                    var get_remark=data.data[0].remark;
                    // this.project_data.due_grade=this.grade_pmx[get_remark].id.toString();
                },
                //学生信息回调
                complete_art_evaluation_get_student_info:function (data) {
                    if(data.data.list==""){
                        toastr.warning("暂无学生信息")
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
                        {title:"序号",type:"index", from:"index"},
                        {title:"姓名",type:"text", from:"name"},
                        {title:"学籍号",type:"text", from:"account"},
                        // {title:"年级",type:"text", from:"grade_name"},
                        // {title:"班级", type:"text",from:"class_name"}
                    ];
                    this.tbodyTd = table_head.concat(course_value);
                    // this.tbodyTd.push({
                    //     title:"操作",
                    //     type:"html",
                    //     from: "<a class='tab-btn tab-edit-btn' ms-click='@edit(el)' ms-if='@el.user_id != @num' title='编辑'></a>" +
                    //     "<a class='tab-btn tab-pass-btn' ms-click='@save(el)' ms-if='@el.user_id == @num' title='保存'></a>"
                    // });
                    this.theadTh=this.tbodyTd;
                    this.tbodyex=this.tbody;
                    layer.close(this.index);
                    this.is_show_table=true;
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
                    var get_semester=this.data.semester_name;
                    var start_time=get_semester.split('|')[0];
                    var end_time=get_semester.split('|')[1];
                    var is_up_or_down=get_semester.split('|')[2];
                    params.year_start=this.timeChuo(start_time);
                    params.year_end=this.timeChuo(end_time);
                    if(is_up_or_down==1){
                        params.phase='0';
                    }else{
                        params.phase='1';
                    }
                    params.subject_id=this.data.form.subject_id;
                    params.fk_grade_id=params.fk_grade_id.toString();
                    params.fk_school_id=params.fk_school_id.toString();
                    params.fk_class_id=params.fk_class_id.toString();
                    this.pms = params;
                    ajax_post(api_art_evaluation_save_or_update, params, this);
                    this.num=-1;
                },
                public_click:function () {
                    ajax_post(api_save_pub,{
                        course:'yscp',
                        fk_class_id:this.data.form.fk_class_id,
                        fk_grade_id:this.data.form.fk_grade_id,
                        fk_school_id:this.data.form.fk_school_id,
                        phase:this.data.form.phase,
                        student_count:this.tbodyex.length,
                        year_start:this.data.form.year_start,
                        year_end:this.data.form.year_end
                    },this);
                },
                complete_save_pub:function (data) {
                    toastr.success('公示成功')
                },
                complete_art_evaluation_save_or_update:function (data) {
                    toastr.success('保存成功');
                    if( data.data.hasOwnProperty("_id")){
                        this.pms._id = data.data._id;
                    }
                },
                //下载模版
                down_score:function () {
                    var subject_id=this.data.form.subject_id;
                    var subject_name='bjks';
                    var fk_school_id=this.data.form.fk_school_id;
                    var get_token=sessionStorage.getItem('token');
                    window.open('http://pj.xtyun.net/api/score/down_score_template?subject_id='+subject_id+"&subject_name="+subject_name+"&fk_school_id="+fk_school_id+'&token='+get_token);

                },
                //批量导入
                uploadingModal: function () {
                    if(this.data.semester_name==0 || this.data.semester_name==""){
                        toastr.warning("请选择学年学期")
                    }else if(this.data.form.fk_grade_id==0 || this.data.form.fk_grade_id==""){
                        toastr.warning("请选择年级")
                    }else{
                        $("#file").val("");
                        this.fileName="";
                        this.modal.msg = "";
                        $("#file-uploading").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //开始上传
                uploading: function () {
                    var files=this.fileName;
                    var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        // this.data.form.file=file;
                        var grade_name=this.data.semester_name;//2017年上学期
                        // this.uploadForm.year=Number(grade_name.substr(0,4));
                        is_up_or_down=grade_name.substr(5,1);
                        if(is_up_or_down=="上"){
                            this.uploadForm.phase=0;
                        }else{
                            this.uploadForm.phase=1;
                        }
                        this.uploadForm.phase= this.data.form.phase;
                        this.uploadForm.subject_id= this.data.form.subject_id;
                        this.uploadForm.year_start= this.data.form.year_start;
                        this.uploadForm.year_end= this.data.form.year_end;
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
                    // this.checkBtn();
                },
                timeChuo:function (h) {
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    }
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }

            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
            });

            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    })