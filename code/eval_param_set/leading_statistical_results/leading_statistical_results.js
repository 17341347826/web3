/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",'layer',
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "leading_statistical_results/leading_statistical_results", "css!"),
        C.Co("eval_param_set", "leading_statistical_results/leading_statistical_results", "html!"),
        C.CM("table"),
        C.CMF("data_center.js"), "PCAS",C.CM('three_menu_module')],
    function ($, layer,avalon,css, html, table, data_center, PCAS,three_menu_module) {
        //获取区县
        var api_get_area= api.PCPlayer+"school/arealist.action";
        //获取学校
        var api_get_school = api.PCPlayer+"school/schoolList.action";
        //获取年级
        var api_get_grade=api.PCPlayer+"class/school_class.action";
        //查询项目
        //查询等级设置个数 Indexmaintain/indexmaintain_findByCountRankParameterInfo
        var api_get_c_rank_count=api.api+"score/get_lev_count";
        //获取表头
        var api_get_table_head=api.api+"Indexmaintain/indexmaintain_findTitle";
        //获取数据
        var api_get_info=api.api+"Indexmaintain/indexmaintain_findEvaluateRating";
        //发布公示
        var api_release_result=api.api+"Indexmaintain/results_release";
        //撤销发布
        var api_revoke_publication=api.api+"Indexmaintain/results_revoke";
        //获取初2016年级是几年级
        var api_get_grade_class=api.api+"base/grade/findGrades.action";
        //获取学年的时间
        var api_get_time = api.api+"base/semester/year_date";
        //查询项目详情
        var api_get_project_detail = api.api + "Indexmaintain/get_project_detail";

        //回显（判断哪个身份来）
        var api_get_project_control = api.api + "score/get_project_control";
        //下载学期评价excel模板
        var api_doload_excel = api.api + 'Indexmaintain/getTermEvaluationExcelTemplate';
        //上传学期评价数据excel
        var api_import_excel = api.api + 'Indexmaintain/importSemesterEvaluateData';
        //文件上传
        var api_upload_extract = api.api + "file/upload_extract";
        //文件上传
        // var api_file_uploader = api.api + "file/uploader";
        //上传学期评价报告文件zip
        var api_import_report = api.api + 'Indexmaintain/importSemesterReoprtZipFiles';
        //上传学期评价对应的学期报告文件数据-导入报告
        var api_import_report_datas = api.api + 'Indexmaintain/importSemesterReportDatas';
        //获取文件地址
        var url_file_api = api.api + "file/get";
        //存放导入报告的文件信息
        var new_files = undefined;


        //后台同步数据
        var api_synchronism_rank = api.api + 'score/synchronism_rank_parameter';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "leading_statistical_results",
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
                due_grade:"",
                is_public:'',
                teach_class_list:[],
                get_gradeId:"",
                project_obj:[],
                class_list:[],
                show_level:false,
                level:[],
                rank_count_arr:['A','B','C','D'],//等级个数
                //需要组合的数据
                get_thead:[],
                // student_obj:[],
                get_info:[],
                //组合完的数据
                tbodyThead:[
                    {signName1:"道德品质"},
                    {signName1:"社会实践"},
                    {signName1:"学业水平"},
                ],
                table_show:false,
                //请求数据(发布时的传参)
                request_data:{
                    subjectId:'',
                    gradeName:'',
                    semester_id:""
                },
                //撤销发布
                revoke_public:{
                    subjectId:''
                },
                form:{
                    schoolId:'',
                    gradeId:'',
                    classId:'',
                    subjectId:"",
                    gradeName:"",
                    offset:0,
                    rows:99999,
                },
                start_time:"",
                end_time:"",
                project_id:"",
                //切换年级
                grade_info:"",
                get_grade_info_name:"",
                //切换项目
                project_info:"",
                get_project_info_name:"",
                layer_index:"",
                city:"",
                district:"",
                //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                highest_level:"",
                //同步数据接口参数
                synchronousData_req:{
                    //这是要进行统计的学校	string	1,2,3,4
                    arr_school_id:'',
                    //市	string	成都市
                    city:'',
                    //统计数据来源的结束时间	string	一般是用户设置或是学期的结束时间
                    end_time:'',
                    //年级id	number	统计的年级
                    fk_grade_id:'',
                    //规则创建者的单位id	number
                    fk_unit_id:'',
                    //实际年级7	number	7初一 8初二 9初三
                    grade_no:'',
                    //统计的项目id	number
                    project_id:'',
                    //学期id	string
                    semester_id:'',
                    //统计数据来源起始时间	string	一般是用户设置或是学期的开始时间
                    start_time:'',
                },
                get_semester:function () {
                    this.is_public = pmx.status;
                    this.form.subjectId = Number(pmx.pro_id);
                    this.semester_start = pmx.ca_start_semester;
                    this.semester_end = pmx.ca_end_semester;
                    this.request_data.semester_id = Number(pmx.semester_id);
                    this.request_data.subjectId = Number(pmx.pro_id);
                    this.revoke_public.subjectId = Number(pmx.pro_id);
                    this.synchronousData_req.semester_id = pmx.semester_id;
                    this.synchronousData_req.start_time = pmx.ca_start_semester;
                    this.synchronousData_req.end_time = pmx.ca_end_semester;
                    this.synchronousData_req.fk_grade_id = Number(pmx.grade_id);
                    this.synchronousData_req.grade_no = this.grade_filter(pmx.remark);
                    this.synchronousData_req.project_id = Number(pmx.pro_id);
                    this.cb();
                },
                //年级过滤
                grade_filter:function(info){
                    var name = info.substr(0,3);
                    if(name == '七年级'){
                        return 7;
                    }else if(name == '八年级'){
                        return 8;
                    }else if(name == '九年级'){
                        return 9;
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var fk_school_id=tUserData.fk_school_id;
                        self.form.schoolId=fk_school_id;
                        self.highest_level = data.data.highest_level;
                        self.synchronousData_req.city = tUserData.city;
                        // self.synchronousData_req.fk_unit_id = tUserData.fk_school_id;
                        if(self.highest_level == 2){//市
                            self.city = tUserData.city;
                            ajax_post(api_get_area,{city:self.city},self);
                        }else if(self.highest_level == 3){//区县
                            self.district = tUserData.school_name;
                            ajax_post(api_get_school,{district:self.district},self);
                        }
                        else{//学校
                            ajax_post(api_get_grade,{school_id:fk_school_id},self);
                        }
                    //    判断哪个身份设置学期
                        ajax_post(api_get_project_control,{city:tUserData.city,fk_grade_id:Number(pmx.grade_id)},self);
                    });
                },
                //切换区县
                areaChange:function () {
                    var area = this.area_info;
                    var district = area.split('|')[1];
                    ajax_post(api_get_school,{district:district},this);
                },
                //切换学校
                schoolChange:function () {
                    var school = this.school_info;
                    var school_id = school.split("|")[0];
                    this.synchronousData_req.arr_school_id = school_id.toString();
                    ajax_post(api_get_grade,{school_id:school_id},this);
                },
                classChange:function () {
                    ajax_post(api_get_info,this.form,this);
                },
                //切换等级
                rankChange:function () {
                    ajax_post(api_get_info,this.form,this);
                },
                //导入结果文件名
                fileName:'',
                //上传excel
                uploadForm:{
                    gradeId:'',
                    semesterId:'',
                    subjectId:'',
                },
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //导入结果重复提交：true-可以点击，false-不可以点击
                btn_had:true,
                //导入结果
                import_result:function(){
                    $("#file").val("");
                    this.fileName="";
                    this.modal.msg = "";
                    this.import_excel_return = [];
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
                },
                //导入结果前同步数据
                upload_before:function(){
                    //查询统计项目控制参数
                    cloud.get_project_control({ city: this.synchronousData_req.city,fk_grade_id:this.synchronousData_req.fk_grade_id},function (url, ars, data) {
                        //统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                        var unit_lv = data.unit_lv;
                        var dept_info = cloud.get_dept_high_info();
                        //department_level：当前统计的单位登记，就是当前登陆者级别（1-省级；2-市级；3-区县级；4-校级）
                        if(unit_lv == 2){//市
                            vm.synchronousData_req.fk_unit_id = dept_info.city_id;
                        }else if(unit_lv == 3){
                            vm.synchronousData_req.fk_unit_id = dept_info.district_id;
                        }else if(unit_lv == 4 && data.department_level == 4){//学校创建的学校统计
                            vm.synchronousData_req.fk_unit_id = dept_info.district_id;
                        }
                        //后台同步数据
                        ajax_post(api_synchronism_rank,vm.synchronousData_req.$model,vm);
                    })
                },
                //导入结果上传
                uploading:function(){
                    var files=this.fileName;
                    // var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    var a=files.split(""); //先拆分成数组
                    var b=files.split("").reverse(); //再反转，但还是数组
                    var c=files.split("").reverse().join("");//最后把数组变成字符串
                    var subFile=c.substring(0,c.indexOf("."));
                    if (subFile == "xslx" || subFile == "slx") {
                        this.uploadForm.gradeId    = pmx.grade_id;
                        this.uploadForm.semesterId = pmx.semester_id;
                        this.uploadForm.subjectId  = pmx.pro_id;
                        this.modal.msg = "正在上传，请勿取消";
                        if(this.btn_had){
                            this.btn_had = false;
                            fileUpload(api_import_excel,this);
                        }
                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                //下载模板
                down_score:function(){
                    var gradeId = pmx.grade_id;
                    var semesterId = pmx.semester_id;
                    //项目id
                    var subjectId = pmx.pro_id;
                    var token = sessionStorage.getItem('token');
                    window.open(location.origin+'/api/Indexmaintain/getTermEvaluationExcelTemplate?gradeId='+gradeId+'&semesterId='+semesterId
                        +'&subjectId='+subjectId+ '&token=' + token);
                },
                //导入报告提示
                import_tips:function(){
                    layer.tips('文件名称请按照"学籍号-姓名.pdf"格式,文件最大上传500M', '#import_data',{
                        tips: [1, '#3595CC'],
                        time: 2000
                    });
                },
                //导入报告ajax
                term_fileUpload:function(cmd, who, fmd) {
                    var form_data = fmd;
                    if (fmd == undefined)
                        form_data = new FormData($("#term_report_im")[0]);
                    $.ajax({
                        url: cmd,
                        data: form_data,
                        type: 'post',
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr) {
                            var token = window.sessionStorage.getItem("token");
                            xhr.setRequestHeader('Token', token);
                        },
                        success: function (repsData, statusCode, xhr) {
                            if (repsData.status != 200) { /*失败*/
                                if (repsData.message != '未知错误') {
                                    who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
                                }
                            } else { /*成功*/
                                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message)
                            }
                        }
                    })
                },
                //导入报告
                import_report: function () {
                    var self = this;
                    var  $galleryImg = $("#import_report");
                    $galleryImg.on("change", function (e) {
                        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
                        new_files = files;
                        for (var i = 0, len = files.length; i < len; ++i) {
                            var file = files[i];
                            var file_name_arr = file.name.split('.');
                            var suffix_name = file_name_arr[file_name_arr.length - 1];
                            suffix_name = suffix_name.toLowerCase();
                            if (suffix_name != 'zip') {
                                toastr.error('所选文件不正确');
                                return;
                            }
                            if (suffix_name == 'zip') {
                                layer.load(1, {
                                    shade: [0.1, '#fff'] //0.1透明度的白色背景
                                });
                                var form_data = new FormData();
                                form_data.append('file',file,file.name);
                                form_data.append('gradeId',pmx.grade_id);
                                form_data.append('semesterId',pmx.semester_id);
                                form_data.append('subjectId',pmx.pro_id);
                                self.term_fileUpload(api_import_report, self, form_data);
                            }
                        }
                    })
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取区县
                            case api_get_area:
                                this.complete_get_area(data);
                                break;
                                //获取学校
                            case api_get_school:
                                this.complete_get_school(data);
                                break;
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //获取等级个数
                            case api_get_c_rank_count:
                                this.complete_get_c_rank_count(data);
                                break;
                            //获取表头
                            case api_get_table_head:
                                this.complete_get_table_head(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                            //发布
                            case api_release_result:
                                this.complete_release_result(data);
                                break;
                            //撤销发布
                            case api_revoke_publication:
                                this.complete_revoke_publication(data);
                                break;
                            //转化年级
                            case api_get_grade_class:
                                this.complete_get_grade_class(data);
                                break;
                            //获取学年
                            case api_get_time:
                                this.complete_get_time(data);
                                break;
                            case api_get_project_detail:
                                this.complete_get_project_detail(data);
                                break;

                            //学期哪个身份设置
                            case api_get_project_control:
                                this.complete_term_control(data);
                                break;
                            //    导入结果前数据同步
                            case api_synchronism_rank:
                                this.complete_synchronism_rank(data);
                                break;
                            //    导入excel
                            case api_import_excel:
                                this.complete_import_excel(data);
                                break;
                            //  上传学期报告文件（zip）-导入报告
                            case api_import_report:
                                this.complete_import_report(data);
                                break;
                            //上传文件-zip
                            case api_upload_extract:
                                layer.closeAll();
                                // this.import_data(data);
                                this.complete_upload_extract(data);
                                break;
                         // 上传学期评价对应的学期报告文件数据-导入报告
                            case api_import_report_datas:
                                this.complete_import_report_datas(data);
                                break;

                        }
                    } else {
                        if(cmd == api_import_excel){
                            this.btn_had = true;
                            this.modal.msg = msg;
                        }else{
                            toastr.error(msg);
                        }
                    }
                },
                //哪个身份设置学期参数
                term_set_type:false,
                complete_term_control:function(data){
                    if(data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    //统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                    var lv = data.data.unit_lv;
                    if(this.highest_level == lv){
                        this.term_set_type = true;
                    }
                },
                //上传excel返回数据
                import_excel_return:"",
                //上传结果前同步数据
                complete_synchronism_rank:function(data){
                    this.uploading();
                },
                //上传excel
                complete_import_excel:function (data) {
                    if(data.data != null){
                        this.modal.msg='';
                        this.import_excel_return= data.data;
                    }else{
                        $("#file-uploading").modal({
                            closeOnConfirm: true
                        });
                        this.show_level = true;
                        this.is_public = 2;
                        //查看列表数据
                        ajax_post(api_get_info,this.form,this);
                    }
                },
                // 上传学期报告文件（zip）-导入报告
                complete_import_report:function(data){
                    for(var i=0;i<new_files.length;i++){
                        var file = new_files[i];
                        var fm = new FormData();
                        fm.append("file", file, file.name);
                        fm.append("note", "from term");
                        fm.append("token", window.sessionStorage.getItem("token"));
                        fileUpload(api_upload_extract, this, fm);
                    }
                    $("#import_report").val('');
                },
                //上传文件zip-文件服务中转站
                //有问题的文件
                error_files: [],
                complete_upload_extract:function(data){
                    var new_data = [];
                    this.error_files = [];
                    var ext = '';
                    var is_right_ext = true;
                    //Array.isArray()判断某个值是否为数组，返回布尔类型
                    if (!Array.isArray(data.data)) {//不是
                        //判断文件后缀
                        ext = data.data.ext;
                        if (ext != '.pdf') {
                            toastr.error('所选文件后缀名不正确');
                            return;
                        }
                        new_data.push(data.data);
                    } else {//是
                        var data_length = data.data.length;
                        // for (var i = 0; i < data_length; i++) {
                        //     //判断文件后缀
                        //     ext = data.data[i].ext;
                        //     if (ext != '.pdf') {
                        //         //存错误的文件，方便显示
                        //         this.error_files.push(data.data[i].inner_name);
                        //         //判断是否有错误文件
                        //         is_right_ext = false;
                        //         break;
                        //     }
                        //     new_data.push(data.data[i])
                        // }
                        var term_zips = JSON.stringify(data.data);
                        ajax_post(api_import_report_datas,{
                                wjlj:term_zips,
                                gradeId:pmx.grade_id,
                                semesterId:pmx.semester_id,
                                subjectId:pmx.pro_id}
                            ,this);
                    }
                    // var self = this;
                    // //如果有错误文件，给出提示
                    // this.right_data = new_data;
                    // if (!is_right_ext) {
                    //     var current_layer = layer.confirm('压缩包中有文件不正确，是否确定导入？', {
                    //         btn: ['是', '否'] //按钮
                    //     }, function () {
                    //         self.get_exit_student();
                    //         layer.close(current_layer);
                    //     }, function () {
                    //
                    //     });
                    // } else {
                    //     self.get_exit_student();
                    // }
                },
                //上传学期评价对应的学期报告文件数据-导入报告
                complete_import_report_datas:function(data){
                    toastr.success('上传成功！');
                    //获取数据
                    ajax_post(api_get_info,this.form,this);
                },
                areaList:[],
                area_info:"",
                complete_get_area:function (data) {
                    this.areaList = data.data.list;
                    this.area_info = this.areaList[0].id+'|'+this.areaList[0].district;
                    var district = this.areaList[0].district;
                    ajax_post(api_get_school,{district:district},this);
                },
                schoolList:[],
                school_info:"",
                complete_get_school:function (data) {
                    this.schoolList = data.data.list;
                    this.school_info = this.schoolList[0].id+'|'+this.schoolList[0].schoolname;
                    this.synchronousData_req.arr_school_id = this.schoolList[0].id.toString();
                    var school_id = this.schoolList[0].id;
                    ajax_post(api_get_grade,{school_id:school_id},this);
                },
                complete_get_grade:function (data) {
                    this.teach_class_list=data.data;
                    var get_grade_id = Number(pmx.grade_id);
                    for(var i = 0; i<this.teach_class_list.length;i++){
                        if(get_grade_id == this.teach_class_list[i].grade_id){
                            this.class_list=this.teach_class_list[i].class_list;
                        }
                    }
                    this.form.classId=this.class_list[0].class_id;
                    this.get_gradeId = get_grade_id;
                    this.form.gradeId = get_grade_id;
                    this.get_grade_info_name = pmx.grade_name;
                    this.grade_info = this.form.gradeId + '|' + this.get_grade_info_name;
                    /**
                     * 目前由于后台原因跳过这个，正确的是应该有这个
                     *   //获取等级个数
                     // ajax_post(api_get_c_rank_count,{project_id:this.request_data.subjectId},this);
                     * */
                    /**
                     * 目前由于后台原因临时等级使用假数据
                     * */
                    var rank_count_obj={
                        "1":{level:['A']},
                        "2":{level:['A','B']},
                        "3":{level:['A','B','C']},
                        "4":{level:['A','B','C','D']},
                        "5":{level:['A','B','C','D','E']}
                    };
                    var rank_count = '4';
                    this.rank_count_arr = rank_count_obj[rank_count].level;
                    this.show_level=true;
                    /**
                     * 目前由于后台原因临时在此处调用
                     * */
                    //获取表头
                    ajax_post(api_get_table_head,{subjectId:this.request_data.subjectId,semester_id:this.request_data.semester_id,grade_id:this.form.gradeId},this);
                },
                //学期开始时间
                semester_start:'',
                //学期结束时间
                semester_end:'',

                complete_get_c_rank_count:function (data) {
                    var rank_count_obj={
                        "1":{level:['A']},
                        "2":{level:['A','B']},
                        "3":{level:['A','B','C']},
                        "4":{level:['A','B','C','D']},
                        "5":{level:['A','B','C','D','E']}
                    };
                    var rank_count=data.data;
                    this.rank_count_arr=rank_count_obj[rank_count].level;
                    // this.form.gradeName = this.rank_count_arr[0];
                    this.show_level=true;

                    //获取表头
                    ajax_post(api_get_table_head,{subjectId:this.request_data.subjectId,semester_id:this.request_data.semester_id,grade_id:this.form.gradeId},this);
                },
                //获取表头
                complete_get_table_head:function (data) {
                    var dataL = data.data;
                    /**
                     * 目前后台原因，写的假数据
                     * */
                    dataL = [{signName1:'思想品德'},{signName1:'学业水平'},{signName1:'身心健康'},{signName1:'艺术素养'},{signName1:'社会实践'}];
                    var arr = ['加分项','综合分值','综合评价'];
                    for(var i =0 ;i<arr.length;i++){
                        var add_={};
                        add_.signName1 = arr[i];
                        dataL.push(add_)
                    }
                    this.get_thead=dataL;
                    //获取数据
                    ajax_post(api_get_info,this.form,this);
                },
                //得到数据
                complete_get_info:function (data) {
                    this.get_info = [];
                    if(!data.data){
                        this.table_show=false;
                        toastr.error('暂无数据');

                    }else{
                        var dataList=data.data.list;
                        for(var i=0;i<dataList.length;i++){
                            var scoreValue = dataList[i].scoreValue;//总分
                            var score_plus;
                            if(dataList[i].score_plus == null){
                                score_plus = '';
                            }else{
                                score_plus = dataList[i].score_plus;//加分
                            }
                            dataList[i].percentileOne+=','+score_plus+',';
                            dataList[i].percentileOne+=scoreValue;
                            dataList[i].percentileOne=dataList[i].percentileOne.split(',');
                        }
                        dataList.index_name=this.get_thead;
                        this.tbodyThead=dataList.index_name;
                        this.get_info=dataList;
                        this.p_show=false;
                        //将年级转化成1-12
                        var get_remark = pmx.remark;
                        var grade = get_remark.substring(0,3);
                        this.due_grade=this.grade_pmx[grade].id.toString()+"";

                        ajax_post(api_get_time,{start_date:this.timeChuo(this.semester_start),end_date:this.timeChuo(this.semester_end)},this);
                    }

                },
                complete_get_time:function (data) {
                    this.year_start_date = data.data.start_date;
                    this.year_end_date = data.data.end_date;
                    this.table_show=true;
                },
                //发布
                release_click:function () {
                    var grade_name=this.get_grade_info_name;
                    var self=this;
                    if(this.level.length>0){
                        this.request_data.gradeName=this.level.join(",");
                        layer.confirm(grade_name+'确定要发布吗', {
                                btn: ['确定','取消'] //按钮
                            }, function(){
                                ajax_post(api_release_result,self.request_data,self);
                                layer.closeAll();
                                layer.open({
                                    title: "温馨提示",
                                    closeBtn:0,
                                    content: '<div><p>正在发布中,请稍后</p></div>',
                                    yes: function (index, layero) {
                                        self.layer_index=index;
                                    }
                                });
                            },
                            function(){
                                layer.closeAll();
                            });
                    }else{
                        toastr.warning('请先选择需要公示的等级再进行发布')
                    }
                },
                //撤销发布
                revoke_click:function () {
                    var self=this;
                    var grade_name=this.get_grade_info_name;
                    layer.confirm(grade_name+'确定要撤销发布吗', {
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            ajax_post(api_revoke_publication,self.revoke_public,self);
                            layer.closeAll();
                        },
                        function(){
                            layer.closeAll();
                        });
                },
                complete_release_result:function () {
                    layer.closeAll();
                    toastr.success('发布成功');
                    ajax_post(api_get_project_detail,{id:Number(pmx.pro_id)},this);
                },
                complete_revoke_publication:function (data) {
                    toastr.success("撤回成功");
                    ajax_post(api_get_project_detail,{id:Number(pmx.pro_id)},this);
                },
                complete_get_project_detail:function (data) {
                    this.is_public = data.data.zt;
                    ajax_post(api_get_info,this.form,this);
                },
                //项目名称
                projectName:'',
                //页面跳转stu_evaluate_report传的参数
                check:function (el) {
                    //判断数据来源：如果数据来源于外部导入，就不跳转页面之间打开pdf
                    if(el.sjly == 2){//外部导入
                        var wjlj = JSON.parse(el.wjlj);
                        var path = url_file_api+ "?token=" + sessionStorage.getItem("token") + "&img=" + wjlj.guid;
                        window.open(path);
                        return;
                    }
                    var get_guid=el.studentId;
                    window.location='#stu_evaluate_report?project_id='+this.project_id +
                        "&start_time="+this.start_time +
                        "&end_time="+ this.end_time +
                        "&get_guid="+get_guid +
                        "&studentNum=" + el.studentNum+'' +
                        '&semester_start='+this.semester_start+
                        "&semester_end="+this.semester_end+
                        "&grade_id="+this.form.gradeId+
                        "&school_id="+this.form.schoolId+
                        "&due_grade="+this.due_grade+
                        "&year_start_date="+this.year_start_date+
                        "&year_end_date="+this.year_end_date;
                },
                //js把时间戳转为为普通日期格式
                timeChuo:function(h){
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
                    };
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                vm.get_semester();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });