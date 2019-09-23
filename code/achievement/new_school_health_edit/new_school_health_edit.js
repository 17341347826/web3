define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'new_school_health_edit/new_school_health_edit', 'html!'),
        C.Co('achievement', 'new_school_health_edit/new_school_health_edit', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "select2",
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, select2,formatUtil) {
        //体质健康
        var avalon_define = function (args) {
            var grade_list= [];
            var semester_full = [];
            var vm = avalon.define({
                $id: "new_school_health_edit",
                is_init:true,
                current_sems_index:0,
                filter: {code: "", name: ""},
                //判断当前用户是否选择了学生：
                current_student_pos: -1,
                headers: [],
                grade_list: [],
                class_list: [],
                sem_list: [],
                //学生列表
                stu_list:[],
                //体质测评列表
                score_list:[],
                is_disable_input:false,
                filter_sex:make_filter(function (line) {
                    if(line.for_sex == vm.score.sex)
                        return true;
                    return false;
                }),
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                //查询体质测评列表参数
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
                //保存、编辑请求参数
                extend:{
                    _id:'',
                    code:'',
                    //  标准分	string
                    criteria_score:'',
                    // 	附加分	string
                    extra_score:'',
                    //	身高	string
                    height:'',
                    // 立定跳远	string
                    ldty:'',
                    //立定跳远等级	string
                    ldty_lv:'',
                    //立定跳远评分	string
                    ldty_score:'',
                    // 1000米跑	string
                    run_1000:'',
                    //1000米跑(附加分)	string
                    run_1000_extra:'',
                    // 1000米跑等级	string
                    run_1000_lv:'',
                    // 1000米跑评分	string
                    run_1000_score:'',
                    //50米跑	string
                    run_50:'',
                    //50米跑等级	string
                    run_50_lv:'',
                    //50米跑评分	string
                    run_50_score:'',
                    //800米跑	string
                    run_800:'',
                    //800米跑附加分	string
                    run_800_extra:'',
                    // 800米跑等级	string
                    run_800_lv:'',
                    //   	800米跑评分	string
                    run_800_score:'',
                    semester_id:'',
                    // 学年（必要）	string
                    semester_year:'',
                    // 总分	string
                    total_score	:'',
                    //总分等级	string
                    total_score_lv:'',
                    //肺活量	string
                    vital_capacity:'',
                    vital_capacity_lv:'',
                    vital_capacity_score:'',
                    //   体重	string
                    weight:'',
                    weight_lv:'',
                    weight_score:'',
                    // 引体向上	string
                    ytxs:'',
                    // 引体向上附加分	string
                    ytxs_extra:'',
                    ytxs_lv:'',
                    ytxs_score:'',
                    //仰卧起坐(一分钟)	string
                    ywqz:'',
                    //仰卧起坐(一分钟 附加分)	string
                    ywqz_extra:'',
                    ywqz_lv:'',
                    ywqz_scor:'',
                    //坐位体前屈	string
                    zqqq:'',
                    zqqq_lv:'',
                    zqqq_score:'',
                },
                //当前选中学生体质测评信息
                current_stuInfo:{},
                init: function () {
                    setTimeout(function () {
                        // -> 不同的身份，获取的班级，年级列表不一样
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name:"grade_name", value:["grade_id"]});
                        //参数赋值
                        if(args && vm.first_enter){
                           var grade_index = vm.get_ary_index(vm.grade_list,'value',args.fk_grade_id);
                            vm.change_grade(vm.grade_list[grade_index], grade_index);
                        }else{
                            vm.change_grade(vm.grade_list[0], 0);
                        }
                        //初始化学籍号和姓名
                        $("#code_select").select2();
                        $("#name_select").select2();
                        $("#code_select").on("select2:select", vm.student_code_change);
                        $("#name_select").on("select2:select", vm.student_name_change);
                    }, 0);
                },
                inputLimits:function (e, type) {
                    e.currentTarget.value=e.currentTarget.value.replace(/^[0]+[0-9]*$/gi,"");
                    var limitNum = e.currentTarget.value.replace(/[^0-9.]+/g, "");
                    if (limitNum >= 0 && limitNum <= type) {
                        e.currentTarget.value = limitNum;
                    } else {
                        e.currentTarget.value = type;
                    }
                },
                //根据值，查询在当前数组中的序号
                get_ary_index:function(ary,name,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(ary[i][name] == value){
                            return i;
                        }
                    }
                },
                //年级改变
                change_grade: function (value, index) {
                    this.current_student_pos = -1;
                    this.form_list_score.fk_grade_id = value.value;
                    var ori_class = grade_list[index].class_list;
                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]});
                    this.class_list = sel_class_ls;
                    //参数赋值
                    if(args && this.first_enter){
                        this.form_list_score.fk_class_id = args.fk_class_id;
                    }else{
                        this.form_list_score.fk_class_id =  this.class_list[0].value;
                    }
                    this.stu_list =  cloud.class_members({fk_class_id: Number(this.form_list_score.fk_class_id)});
                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    sort_by(semester_full, ["+start_date"]);
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    //参数赋值
                    if(args && this.first_enter){
                        var sem_index = vm.get_ary_index(vm.sem_list,'value',args.semester_id);
                        vm.change_sems(vm.sem_list[sem_index], sem_index);
                    }else{
                        this.change_sems(this.sem_list[0], 0);
                    }
                    // 修改对应显示信息
                    if(args && this.first_enter){
                        data_center.scope("score_edit_opt_grade", function (p) {
                            p.head_value = args.grade_name;
                        });
                        data_center.scope("score_edit_opt_class", function (p) {
                            p.head_value = args.class_name;
                        });
                        data_center.scope("score_edit_opt_sem", function (p) {
                            p.head_value = args.sem_name;
                        });
                    }else{
                        data_center.scope("score_edit_opt_grade", function (p) {
                            p.head_value = value.name;
                        });
                        data_center.scope("score_edit_opt_class", function (p) {
                            p.head_value = ori_class[0].class_name;
                        });
                        data_center.scope("score_edit_opt_sem", function (p) {
                            p.head_value = semester_full[0].semester_name;
                        });
                    }
                },
                //班级改变
                change_class: function (value, index) {
                    this.current_student_pos = -1;
                    this.stu_list = [];
                    //将之前填写的置位空
                    Object.keys(vm.extend).forEach(key => vm.extend[key] = '');
                    this.extend.semester_id = this.sem_list[this.current_sems_index].value;
                    this.extend.semester_year =  this.sem_list[this.current_sems_index].name.substr(0,11);
                    this.form_list_score.fk_class_id = value.value;
                    this.stu_list =  cloud.class_members({fk_class_id: Number(value.value)});
                    this.query_score();
                },
                //学年学期改变
                change_sems: function (value, index) {
                    this.current_student_pos = -1;
                    //将之前填写的置位空
                    Object.keys(vm.extend).forEach(key => vm.extend[key] = '');
                    // 查询学期下的体质测评
                    this.current_sems_index = index;
                    this.extend.semester_id = value.value;
                    this.extend.semester_year = value.name.substr(0,11);
                    this.form_list_score.semester_id = value.value;
                    this.query_score();
                },
                //頁面首次：
                first_enter:true,
                //查询体质测评成绩与学生列表组合
                query_score:function(){
                    this.score_list = [];
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    var stu_list = this.stu_list;
                    cloud.new_health_list(this.form_list_score.$model, function (url, args, data, is_suc, msg) {
                        layer.close(index);
                        if (!is_suc) {
                            toastr.error(msg);
                            return;
                        }
                        var score_list = data.list;
                        //合并数据:has_score(有无成绩)：true-有，false-没有
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
                        //判断是否刷新和首次进入
                        if(!vm.first_enter) return;
                        //判断是否编辑点击进去的
                        var health_stu_code = sessionStorage.getItem('health_stu_code');
                        if(health_stu_code){
                            vm.first_enter = false;
                            var stu_code = health_stu_code.split('|')[0];
                            var stu_name = health_stu_code.split('|')[1];
                            var stu_idx = vm.get_code_inde(vm.score_list,'code',stu_code);
                            // $("#name_select").select2("val", stu_idx.toString());
                            // $("#code_select").select2("val", stu_idx.toString());
                            $("#select2-code_select-container").text(stu_code);
                            $('#select2-name_select-container').text(stu_name);
                            vm.current_student_pos = Number(stu_idx);
                            vm.get_info(vm.current_student_pos);
                        }
                    });
                },
                //编辑进来的要去查询学籍号在当前成绩列表的序号
                get_code_inde:function(ary,name,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(ary[i][name] == value){
                            return i;
                        }
                    }
                },
                //学籍号改变
                student_code_change: function (e) {
                    //将之前填写的置位空
                    Object.keys(vm.extend).forEach(key => vm.extend[key] = '');
                    this.current_student_pos = Number(e.target.value);
                    if (this.current_student_pos == -1)
                        return;
                    if ($("#name_select").val() != e.target.value)
                        $("#name_select").select2("val", e.target.value);
                    this.get_info(this.current_student_pos);
                },
                //姓名改变
                student_name_change: function (e) {
                    //将之前填写的置位空
                    Object.keys(vm.extend).forEach(key => vm.extend[key] = '');
                    this.current_student_pos = Number(e.target.value);
                    if (this.current_student_pos == -1)
                        return;
                    if ($("#code_select").val() != e.target.value)
                        $("#code_select").select2("val", e.target.value);
                    this.get_info(this.current_student_pos);
                },
                //姓名、学籍号选择赋值
                get_info:function(idx){
                    //当前子女信息
                    this.current_stuInfo = this.score_list[idx];
                    this.extend.code = this.score_list[idx].code;
                    this.extend.semester_id = this.sem_list[this.current_sems_index].value;
                    this.extend.semester_year =  this.sem_list[this.current_sems_index].name.substr(0,11);
                    //判断是否已经录入并赋值
                    var has_score = this.score_list[idx].has_score;
                    if(has_score){
                        var info  = this.score_list[idx];
                        this.extend._id = info._id;
                        this.extend.height = info.height;
                        this.extend.weight = info.weight;
                        this.extend.weight_lv = info.weight_lv;
                        this.extend.weight_score = info.weight_score;
                        this.extend.total_score = info.total_score;
                        this.extend.total_score_lv = info.total_score_lv;
                        this.extend.criteria_score = info.criteria_score;
                        this.extend.extra_score = info.extra_score;
                        this.extend.ldty = info.ldty;
                        this.extend.ldty_lv = info.ldty_lv;
                        this.extend.ldty_score = info.ldty_score;
                        this.extend.run_50 = info.run_50;
                        this.extend.run_50_lv = info.run_50_lv;
                        this.extend.run_50_score = info.run_50_score;
                        if(this.current_stuInfo.sex == 1){//男
                            this.extend.run_1000 = info.run_1000;
                            this.extend.run_1000_lv = info.run_1000_lv;
                            this.extend.run_1000_score = info.run_1000_score;
                            this.extend.run_1000_extra = info.run_1000_extra;
                            this.extend.ytxs = info.ytxs;
                            this.extend.ytxs_lv = info.ytxs_lv;
                            this.extend.ytxs_score = info.ytxs_score;
                            this.extend.ytxs_extra = info.ytxs_extra;
                        }else if(this.current_stuInfo.sex == 2){//女
                            this.extend.run_800 = info.run_800;
                            this.extend.run_800_lv = info.run_800_lv;
                            this.extend.run_800_score = info.run_800_score;
                            this.extend.run_800_extra = info.run_800_extra;
                            this.extend.ywqz = info.ywqz;
                            this.extend.ywqz_lv = info.ywqz_lv;
                            this.extend.ywqz_extra = info.ywqz_extra;
                            this.extend.ywqz_scor = info.ywqz_scor;
                        }
                        this.extend.vital_capacity = info.vital_capacity;
                        this.extend.vital_capacity_lv = info.vital_capacity_lv;
                        this.extend.vital_capacity_score = info.vital_capacity_score;
                        this.extend.zqqq = info.zqqq;
                        this.extend.zqqq_lv = info.zqqq_lv;
                        this.extend.zqqq_score = info.zqqq_score;
                        // console.log( this.extend.$model);
                    }
                },
                //保存
                save_score: function () {
                    //sex:1-男；2-女
                    var sex = this.current_stuInfo.sex;
                    if(this.extend.height === ''){
                        toastr.warning('请填写身高');
                        return;
                    }
                    if(this.extend.weight === ''){
                        toastr.warning('请填写体重');
                        return;
                    }
                    if(this.extend.weight_score === ''){
                        toastr.warning('请填写体重评分');
                        return;
                    }
                    if(this.extend.weight_lv === ''){
                        toastr.warning('请填写体重等级');
                        return;
                    }
                    if(this.extend.vital_capacity === ''){
                        toastr.warning('请填写肺活量');
                        return;
                    }
                    if(this.extend.vital_capacity_score === ''){
                        toastr.warning('请填写肺活量评分');
                        return;
                    }
                    if(this.extend.vital_capacity_lv === ''){
                        toastr.warning('请填写肺活量等级');
                        return;
                    }
                    if(this.extend.run_50 === ''){
                        toastr.warning('请填写50米跑');
                        return;
                    }
                    if(this.extend.run_50_score === ''){
                        toastr.warning('请填写50米跑评分');
                        return;
                    }
                    if(this.extend.run_50_lv === ''){
                        toastr.warning('请填写50米跑等级');
                        return;
                    }
                    if(this.extend.ldty === ''){
                        toastr.warning('请填写立定跳远');
                        return;
                    }
                    if(this.extend.ldty_score === ''){
                        toastr.warning('请填写立定跳远评分');
                        return;
                    }
                    if(this.extend.ldty_lv === ''){
                        toastr.warning('请填写立定跳远等级');
                        return;
                    }
                    if(this.extend.zqqq === ''){
                        toastr.warning('请填写坐位体前屈');
                        return;
                    }
                    if(this.extend.zqqq_score === ''){
                        toastr.warning('请填写坐位体前屈评分');
                        return;
                    }
                    if(this.extend.zqqq_lv == ''){
                        toastr.warning('请填写坐位体前屈等级');
                        return;
                    }
                    if(sex == 1){//男
                        if(this.extend.run_1000 === ''){
                            toastr.warning('请填写1000米跑');
                            return;
                        }
                        if(this.extend.run_1000_score === ''){
                            toastr.warning('请填写1000米跑评分');
                            return;
                        }
                        if(this.extend.run_1000_lv === ''){
                            toastr.warning('请填写1000米跑等级');
                            return;
                        }
                        if(this.extend.run_1000_extra === ''){
                            toastr.warning('请填写1000米跑附加分');
                            return;
                        }
                        if(this.extend.ytxs === ''){
                            toastr.warning('请填写引体向上');
                            return;
                        }
                        if(this.extend.ytxs_score === ''){
                            toastr.warning('请填写引体向上评分');
                            return;
                        }
                        if(this.extend.ytxs_lv === ''){
                            toastr.warning('请填写引体向上等级');
                            return;
                        }
                        if(this.extend.ytxs_extra === ''){
                            toastr.warning('请填写引体向上附加分');
                            return;
                        }
                    }else if(sex == 2){//女
                        if(this.extend.run_800 === ''){
                            toastr.warning('请填写800米跑');
                            return;
                        }
                        if(this.extend.run_800_score === ''){
                            toastr.warning('请填写800米跑评分');
                            return;
                        }
                        if(this.extend.run_800_lv === ''){
                            toastr.warning('请填写800米跑等级');
                            return;
                        }
                        if(this.extend.run_800_extra === ''){
                            toastr.warning('请填写800米跑附加分');
                            return;
                        }
                        if(this.extend.ywqz === ''){
                            toastr.warning('请填写一分钟仰卧起坐');
                            return;
                        }
                        if(this.extend.ywqz_scor === ''){
                            toastr.warning('请填写一分钟仰卧起坐评分');
                            return;
                        }
                        if(this.extend.ywqz_lv === ''){
                            toastr.warning('请填写一分钟仰卧起坐等级');
                            return;
                        }
                        if(this.extend.ywqz_extra === ''){
                            toastr.warning('请填写一分钟仰卧起坐附加分');
                            return;
                        }
                    }
                    if(this.extend.criteria_score === ''){
                        toastr.warning('请填写标准分');
                        return;
                    }
                    if(this.extend.criteria_score === ''){
                        toastr.warning('请填写附加分');
                        return;
                    }
                    if(this.extend.criteria_score === ''){
                        toastr.warning('请填写总分');
                        return;
                    }
                    if(this.extend.criteria_score === ''){
                        toastr.warning('请填写总分等级');
                        return;
                    }
                    cloud.edit_new_health(vm.extend, function (url, args, data, is_suc, msg) {
                        if (!is_suc) {
                            toastr.error(msg);
                            return;
                        }
                        window.location = "#new_school_health";
                    });
                },
                //取消
                cancle:function () {
                    window.location = "#new_school_health";
                }
            });


            vm.$watch('onReady', function () {
                vm.init();
            });
            //  vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });