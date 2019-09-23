define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'new_school_health/new_school_health', 'html!'),
        C.Co('achievement', 'new_school_health/new_school_health', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM('three_menu_module'),
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, fmt) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //获取进度接口
        var api_get_progress = api.api + 'score/get_up_progress';
        //状态过滤器
        avalon.filters.processFilters = function(str){
            if(str == '已提交' || str == '已修改'){
                return '未公示';
            }else if(str == '公示中' || str == '已归档'){
                return str;
            }else if(str == '公示结束'){
                return '待审核';
            }else if(str == '' || str == undefined || str == null){
                return '未上传';
            }
        };
        var avalon_define = function (args) {
            //上传成绩
            var api_uploader_cj = api.api + 'score/upload_new_health_file';
            avalon.filters.code_format = function (str) {
                return '...' + str.substring(16);
            };
            var semester_full = [];
            var grade_list = [];
            var vm = avalon.define({
                $id: "new_school_health",
                //下拉列表是否显示初始值
                is_init: true,
                //当前选中学年学期序号
                current_sems_index: 0,
                //当前学年学期id
                current_semester_id:'',
                //当前学年学期学年
                current_semster_year:'',
                grade_list: [],
                class_list: [],
                sem_list: [],
                score_list: [],
                //赋值一份成绩出来：方便做姓名和学籍号模糊查询
                score_list_copy:[],
                //学生列表
                stu_list:[],
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                //查询参数
                form_list_score: {
                    current_process:'',//当前进度（已提交 ，已修改，公示中，已归档）
                    fk_class_id:'',
                    fk_grade_id:'',
                    fk_school_id:'',
                    flag_exempt:'',//标志免考 0 正常 1 免考(审核通过) 2待审核免考 3 审核不同
                    guid:'',
                    offset:0,
                    rows:9999,
                    semester_id:'',
                    code__icontains:'',//学籍号
                    name__icontains:'',//姓名
                },
                //上传文件
                form_uploader: {
                    semester_id: "",
                    semester_year:'',
                },
                // 模态框 -- 批量上传那些事。
                file_name: "",
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                login_level: "",//当前登录人角色
                //方便编辑页面数据回显
                class_name:'',
                grade_name:'',
                sem_name:'',
                init: function () {
                    setTimeout(function (args) {
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        vm.login_level = cloud.user_level();
                        //1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        if (vm.login_level == 4) {
                            grade_list = cloud.grade_list();
                        } else {
                            grade_list = cloud.auto_grade_list({});
                        }
                        var dataLength = grade_list.length;
                        for (var i = 0; i < dataLength; i++) {
                            grade_list[i]['name'] = grade_list[i].grade_name;
                            grade_list[i]['value'] = grade_list[i].grade_id;
                        }
                        vm.grade_list = grade_list;
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);
                },
                //年级改变
                change_grade: function (value, index) {
                    this.form_list_score.fk_grade_id = value.grade_id.toString();
                    this.grade_name = value.name;
                    var grade_ls = grade_list;
                    var ori_class = grade_ls[index].class_list;
                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]});
                    this.class_list = sel_class_ls;
                    // this.change_class(sel_class_ls[0], 0);
                    this.form_list_score.fk_class_id = this.class_list[0].value;
                    this.class_name = this.class_list[0].name;
                    this.stu_list =  cloud.class_members({fk_class_id: Number(this.class_list[0].value)});

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    sort_by(semester_full, ["-start_date"]);
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    this.current_semester_id = this.sem_list[0].value;
                    this.current_semster_year = this.sem_list[0].name.substr(0,11);
                    this.change_sems(this.sem_list[0], 0);
                    // 修改对应显示信息
                    data_center.scope("score_edit_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    data_center.scope("score_edit_opt_class", function (p) {
                        p.head_value = ori_class[0].class_name;
                    });
                    data_center.scope("score_edit_opt_sem", function (p) {
                        p.head_value = semester_full[0].semester_name;
                    });
                },
                //班级改变
                change_class: function (value, index) {
                    this.form_list_score.fk_class_id = value.value;
                    this.class_name = value.name;
                    this.stu_list = cloud.class_members({fk_class_id: Number(value.value)});
                    this.query_score();
                },
                //学年学期改变
                change_sems: function (value, index) {
                    this.current_sems_index = index;
                    this.form_uploader.semester_id = value.value;
                    this.form_uploader.semester_year = value.name.substr(0,11);
                    this.form_list_score.semester_id = value.value;
                    this.sem_name = value.name;
                    this.query_score();
                },
                //查询
                query_score: function () {
                    this.score_list = [];
                    this.score_list_copy = [];
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    var stu_list = JSON.parse(JSON.stringify(this.stu_list));
                    cloud.new_health_list(this.form_list_score.$model, function (url, args, data, is_suc, msg) {
                        layer.close(index);
                        if (!is_suc) {
                            toastr.error(msg);
                            return;
                        }
                        var score_list = data.list;
                        //合并数据
                        for(var i=0,len = stu_list.length;i<len;i++){
                            stu_list[i].has_score = false;
                            var guid = stu_list[i].guid;
                            for(var j=0,lens = score_list.length;j<lens;j++){
                                if(guid == score_list[j].guid){
                                    stu_list[i] = $.extend(stu_list[i],score_list[j]);
                                    stu_list[i].has_score = true;
                                }
                            }
                        }
                        vm.score_list = stu_list;
                        vm.score_list_copy = vm.score_list;
                    });
                },
                //学籍号和姓名模糊查询
                code_search:function(){
                    this.score_list = [];
                    var list = JSON.parse(JSON.stringify(this.score_list_copy));
                    if(vm.form_list_score.code__icontains == ''){
                        this.score_list = list;
                        return;
                    }
                    var s_list = [];
                    for(var i=0,len=list.length;i<len;i++){
                        if(list[i].code.indexOf(vm.form_list_score.code__icontains)>-1){
                            s_list.push(list[i]);
                        }
                    }
                    this.score_list = s_list;
                },
                //姓名模糊查询
                name_search:function(){
                    this.score_list = [];
                    var list = JSON.parse(JSON.stringify(this.score_list_copy));
                    if(vm.form_list_score.name__icontains == ''){
                        this.score_list = list;
                        return;
                    }
                    var s_list = [];
                    for(var i=0,len=list.length;i<len;i++){
                        if(list[i].name.indexOf(vm.form_list_score.name__icontains)>-1){
                            s_list.push(list[i]);
                        }
                    }
                    this.score_list = s_list;
                },
                /**
                 * 公示点击:目前按照需求只有校管理员才能发布公式
                 * */
                publicity: function () {
                    var txt = '请将全年级学生测试成绩导入，确认无误后在发布公示，发布公示后，将不可撤销，不可更改，确认发布公示？';
                    layer.confirm(txt, {
                        btn: ['继续', '取消'] //按钮
                    }, function () {
                        toastr.info('发布公示中，请稍等');
                        vm.make_pub();
                    }, function () {
                        layer.closeAll();
                    });
                },
                //公示确定
                make_pub: function () {
                    layer.closeAll();
                    // if(!cloud.is_school_leader()){
                    //     form["fk_class_id"] = vm.form_list_score.fk_class_id + ''
                    // }else{
                    //     form["fk_class_id"] = "";
                    // }
                    var req = {
                        fk_class_id:'',
                        fk_grade_id:this.form_list_score.fk_grade_id,
                        fk_school_id:this.form_list_score.fk_school_id,
                        semester_id:this.current_semester_id,
                    };
                    cloud.public_new_health(req, function (url, args, data, is_suc, msg) {
                        if(!is_suc){
                            toastr.error(msg);
                        }else{
                            toastr.success('公示设置成功');
                            vm.query_score();
                        }
                    });
                },
                //撤销公示
                cancel_publicity:function(){
                    layer.confirm('是否撤销公示', {
                        btn: ['继续', '取消'] //按钮
                    }, function () {
                        var req = {
                            fk_class_id:'',
                            fk_grade_id:vm.form_list_score.fk_grade_id,
                            fk_school_id:vm.form_list_score.fk_school_id,
                            semester_id:vm.current_semester_id,
                        };
                        layer.closeAll();
                        toastr.info('撤销公示中，请稍等');
                        cloud.cancel_public_new_health(req, function (url, args, data, is_suc, msg) {
                            if(!is_suc){
                                toastr.error(msg);
                            }else{
                                toastr.success('撤销公示成功');
                                vm.query_score();
                            }
                        });
                    }, function () {
                        layer.closeAll();
                    });
                },
                //免测
                free_test: function () {
                    var year_start = time_2_str(semester_full[this.current_sems_index].start_date);
                    var year_end = time_2_str(semester_full[this.current_sems_index].end_date);
                    location.href = "#new_free_test_based?year_start=" + year_start +
                        "&year_end=" + year_end + "&semester_id="+this.form_uploader.semester_id + "&semester_year=" + this.form_uploader.semester_year;
                },
                //批量导入
                uploading: function () {
                    var files = this.file_name;
                    // var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    var a=files.split(""); //先拆分成数组
                    var b=files.split("").reverse(); //再反转，但还是数组
                    var c=files.split("").reverse().join("");//最后把数组变成字符串
                    var subFile=c.substring(0,c.indexOf("."));
                    if (subFile == "xslx" || subFile == "slx") {
                        if (vm.login_level == 4) {//校级
                            vm.form_list_score.fk_class_id = '';
                        }
                        // this.modal.msg = "正在上传，请勿取消";
                        fileUpload(api_uploader_cj, this);
                        //获取进度延迟一秒
                        setTimeout(function(){
                            ajax_post(api_get_progress,{url:'upload_new_health_file'},vm);
                        },1000);
                    } else {
                        this.error_has = true;
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                uploadingModal: function () {
                    $("#file").val("");
                    this.file_name = "";
                    this.modal.msg = "";
                    this.error_has = false;
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });

                },
                //下载模版
                down_score: function () {
                    window.open(api.api +'score/down_new_health_template');
                },
                //录入
                input_score: function () {
                    if(sessionStorage.getItem('health_stu_code')){
                        sessionStorage.removeItem('health_stu_code');
                    }
                    //公式管控
                    ajax_post(api_query_pub,{},this);
                },
                //编辑修改
                score_edit:function(index,el){
                    if(el.current_process == '已归档'){
                        layer.alert('数据已归档，如需修改，请联系管理员先撤销公示', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
                    sessionStorage.setItem('health_stu_code',el.code+'|'+el.name);
                    //公式管控
                    ajax_post(api_query_pub,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                        //     上传
                            case api_uploader_cj:
                                // $("#file-uploading").modal({
                                //     closeOnConfirm: true
                                // });
                                // toastr.success('上传成功');
                                // this.query_score();
                                break;
                            //获取进度接口
                            case api_get_progress:
                                this.complete_get_progress(data);
                                break;
                        }
                    }else{
                        if (cmd == api_uploader_cj) {

                        }else{
                            toastr.error(msg);
                        }
                    }
                },
                //公式管控
                complete_query_pub:function(data){
                    var list = data.data;
                    if(list != null && list.length>0){
                        for(var i=0;i<list.length;i++){
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if(mkid == 5){//体质健康测评
                                location.href = "#new_school_health_edit?sem_name="+this.sem_name+
                                '&class_name='+this.class_name+'&grade_name='+this.grade_name+
                                    '&fk_class_id='+this.form_list_score.fk_class_id+
                                    '&fk_grade_id='+this.form_list_score.fk_grade_id+
                                    '&semester_id='+this.form_list_score.semester_id;
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        ,anim: 4 //动画类型
                    });
                },
                //'错误信息，请检查：'信息显示隐藏：true-显示，false-隐藏
                error_has:false,
                //进度条
                is_progress_show:false,
                progress_scale:'0%',
                // 进度接口
                complete_get_progress:function(data){
                    if(JSON.stringify(data.data) == '{}'){//错误信息提示
                        this.error_has = true;
                        this.is_progress_show = false;
                        // this.modal.msg = '请求过时';
                        return;
                    }else if(data.data.indexOf('%') == -1){//错误信息提示
                        this.error_has = true;
                        this.modal.msg = data.data;
                        this.is_progress_show = false;
                        return;
                    }
                    this.error_has = false;
                    this.modal.msg = '上传进度：' + data.data;
                    this.progress_scale = data.data;
                    this.is_progress_show = true;
                    if(data.data == "100.0%"){
                        this.is_progress_show = false;
                        $("#file-uploading").modal({
                            closeOnConfirm: true
                        });
                        toastr.success('上传成功');
                        this.query_score();
                        return;
                    }
                    setTimeout(function(){
                        ajax_post(api_get_progress,{url:'upload_new_health_file'},vm);
                    },5000);
                },
            });
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
            });
            vm.init();
            return vm;
        }


        return {
            view: html,
            define: avalon_define
        }
    });
