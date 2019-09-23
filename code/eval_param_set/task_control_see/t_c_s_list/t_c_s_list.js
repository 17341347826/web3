/**
 * Created by Administrator on 2018/5/29.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'task_control_see/t_c_s_list/t_c_s_list','html!'),
        C.Co('eval_param_set', 'task_control_see/t_c_s_list/t_c_s_list','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "t_c_s_list",
                //登陆者信息
                login_info:{},
                //当前登陆者单位id
                work_id:'',
                //身份判断:0：管理员；1：教师；2：学生；3：家长
                ident_type:'',
                //最高等级	user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                high_type:'',
                //三级菜单信息
                three_arr:[],
                //年级列表
                grade_list:[],
                current_grade:"",
                first_grade:'',
                //假数据
                task_ary:[
                    {id:1, "f_name":"学期评价",'module_type':7, "p_name":"学生自评", "start_time":"","end_time":"", 'is_switch':false},
                    {id:2, "f_name":"学期评价",'module_type':8, "p_name":"学生互评", "start_time":"","end_time":"", 'is_switch':false},
                    {id:3, "f_name":"学期评价", 'module_type':0,"p_name":"教师评价", "start_time":"","end_time":"", 'is_switch':false},
                    {id:4, "f_name":"学期评价",'module_type':9, "p_name":"学业成绩", "start_time":"","end_time":"", 'is_switch':false},
                    {id:5, "f_name":"学期评价", 'module_type':14,"p_name":"体质健康", "start_time":"","end_time":"", 'is_switch':false},
                    {id:6, "f_name":"日常评价", 'module_type':10,"p_name":"日常表现", "start_time":"", "end_time":"", "is_switch":false},
                    {id:7, "f_name":"日常评价",'module_type':11, "p_name":"实践与成就", "start_time":"", "end_time":"", "is_switch":false},
                    {id:8, "f_name":"日常评价", 'module_type':5,"p_name":"目标与计划", "start_time":"", "end_time":"", "is_switch":false},
                    {id:9, "f_name":"日常评价", 'module_type':6,"p_name":"实现情况", "start_time":"", "end_time":"", "is_switch":false},
                    {id:10, "f_name":"描述性评价",'module_type':1, "p_name":"自我描述", "start_time":"", "end_time":"", "is_switch":false},
                    {id:11, "f_name":"描述性评价",'module_type':2, "p_name":"同学寄语", "start_time":"", "end_time":"", "is_switch":false},
                    {id:12, "f_name":"描述性评价",'module_type':4, "p_name":"教师评语", "start_time":"", "end_time":"", "is_switch":false},
                    {id:13, "f_name":"描述性评价",'module_type':3, "p_name":"家长寄语", "start_time":"", "end_time":"", "is_switch":false},
                    {id:14, "f_name":"毕业评价",'module_type':12,"p_name":"学生评语","start_time":"", "end_time":"","is_switch":false},
                    {id:15, "f_name":"毕业评价",'module_type':13,"p_name":"教师评语","start_time":"", "end_time":"","is_switch":false},
                ],
                count:count,
                //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                login_level:"",
                init:function () {
                    this.login_info = cloud.user_user();
                    this.login_level = cloud.user_level();
                    this.ident_type = cloud.user_type();
                    this.high_type = cloud.user_level();
                    if(this.ident_type == 3){//家长
                        this.work_id = this.login_info.student.fk_school_id;
                    }else{
                        this.work_id = this.login_info.fk_school_id;
                    }
                    this.grade_list = cloud.grade_all_list_remark();
                    //年级默认值
                    /*判断对象为空：
                    1、es6:Object.keys()方法--获取到对象中的属性名，存到一个数组中，返回数组对象，我们可以通过判断数组的length来判断此对象是否为空
                    2、JSON.stringify(data) == "{}"---将json对象转化为json字符串，再判断该字符串是否为"{}"
                    3、for in 循环判断
                    4、$.isEmptyObject(data)--此方法是jquery将方法3(for in)进行封装，使用时需要依赖jquery
                    5、Object.getOwnPropertyNames(data)---获取到对象中的属性名，存到一个数组中，返回数组对象，我们可以通过判断数组的length来判断此对象是否为空
                     注意：此方法不兼容ie8，其余浏览器没有测试
                    */
                    if(Object.keys(pmx).length != 0){
                        var list = this.grade_list;
                        this.current_grade = pmx.grade_id;
                        for(var i=0;i<list.length;i++){
                            var value = list[i].value;
                            var id = value.split("|")[0];
                            if(id == this.current_grade){
                                this.first_grade = list[i].name;
                                break;
                            }
                        }
                    }else{
                        this.first_grade = this.grade_list[0].name;
                        this.current_grade = this.grade_list[0].value.split("|")[0];
                        this.remark_fun(this.grade_list[0].value.split("|")[1]);
                    }
                    cloud.setting_time_limit({rows:15,offset:0, grade_id: this.current_grade}, function (url, args, data) {
                        //没有数据给默认
                        if(data.length==0){
                            for(var j=0;j<vm.task_ary.length;j++){
                                vm.task_ary[j].start_time = '';
                                vm.task_ary[j].end_time   = '';
                                vm.task_ary[j].is_switch  = false;
                                vm.task_ary[j].work_id    = '';
                            }
                            return;
                        }
                        for(var i = 0; i < data.length; i++ ){
                            var module_type = data[i].module_type;
                            for(var j=0;j<vm.task_ary.length;j++){
                                if(module_type == vm.task_ary[j].module_type){
                                    vm.task_ary[j].start_time = data[i].start_time;
                                    vm.task_ary[j].end_time   = data[i].end_time;
                                    vm.task_ary[j].is_switch  = data[i].is_switch;
                                    vm.task_ary[j].work_id    = data[i].work_id;
                                }
                            }
                        };
                    });
                },
                //年级筛选
                grade_name:"",
                //年级切换
                sel_check:function (el) {
                    // console.log(el.name);
                    // console.log(this.first_grade);
                    var value = el.value;
                    this.current_grade = value.split("|")[0];

                    var name = value.split("|")[1];
                    this.remark_fun(name);
                    var self = this;
                    cloud.setting_time_limit({rows:15,offset:0, grade_id:this.current_grade}, function (url, args, data) {
                        //没有数据给默认
                        if(data.length==0){
                            for(var j=0;j<vm.task_ary.length;j++){
                                vm.task_ary[j].start_time = '';
                                vm.task_ary[j].end_time   = '';
                                vm.task_ary[j].is_switch  = false;
                                vm.task_ary[j].work_id    = '';
                            }
                            return;
                        }
                        for(var i = 0; i < data.length; i++ ){
                            var module_type = data[i].module_type;
                            for(var j=0;j<vm.task_ary.length;j++){
                                if(module_type==vm.task_ary[j].module_type){
                                    vm.task_ary[j].start_time = data[i].start_time;
                                    vm.task_ary[j].end_time   = data[i].end_time;
                                    vm.task_ary[j].is_switch  = data[i].is_switch;
                                    vm.task_ary[j].work_id    = data[i].work_id;
                                    break;
                                }
                            }
                        };
                    });
                },
                remark_fun:function (x) {
                    if(x == "七年级"){
                        this.grade_name = 7;
                    }else if(x == "八年级"){
                        this.grade_name = 8;
                    }if(x == "九年级"){
                        this.grade_name = 9;
                    }
                },
                //开关时间没有提示
                switch_warn:function(){
                    toastr.warning('请先设置开始时间和结束时间');
                },
                //使用状态切换
                switch_btn:function (el) {
                    // console.log(el);
                    if(el.start_time == '' && el.end_time == '' && el.is_switch == false){
                        toastr.warning('请先设置开始时间和结束时间');
                    }
                    var end_time = el.end_time;
                    var start_time = el.start_time;
                    var module_type = el.module_type;
                    var is_switch = el.is_switch;
                    if(is_switch == true){
                        is_switch = false;
                    }else{
                        is_switch = true;
                    }
                    cloud.update_time_limit({end_time:end_time,is_switch:is_switch,module_type:module_type,start_time:start_time,grade_id:vm.current_grade},function (url, ars, data) {
                        cloud.setting_time_limit({rows:15,offset:0, grade_id: vm.current_grade}, function (url, args, data) {
                            for(var i = 0; i < data.length; i++ ){
                                var module_type = data[i].module_type;
                                for(var j=0;j<vm.task_ary.length;j++){
                                    if(module_type == vm.task_ary[j].module_type){
                                        vm.task_ary[j].start_time = data[i].start_time;
                                        vm.task_ary[j].end_time   = data[i].end_time;
                                        vm.task_ary[j].is_switch  = data[i].is_switch;
                                        vm.task_ary[j].work_id    = data[i].work_id;
                                    }
                                }
                            };
                        });
                    })
                },
                //编辑
                edit:function(el){
                    // console.log(el);
                    //login_level 4 校级
                    var name=el.p_name;
                    if(name=="学生自评"){
                        if(this.login_level == 4){
                            window.location='#student_self_evaluation_see?grade_id='+this.current_grade+'&is_switch='+el.is_switch+
                                '&module_type='+el.module_type+"&grade_name="+this.grade_name;
                        }else{
                            window.location='#c_c_scheme_list_see?plan_subjectid='+1+"&grade_id="+this.current_grade+
                                '&is_switch='+el.is_switch+
                                '&module_type='+el.module_type+"&grade_name="+this.grade_name;
                        }
                    }
                    if(name=="学生互评"){
                        if(this.login_level == 4){
                            window.location='#student_mutual_evaluation_see?grade_id='+this.current_grade+'&is_switch='+el.is_switch+
                                '&module_type='+el.module_type+"&grade_name="+this.grade_name;
                        }else{
                            window.location='#c_c_scheme_list_see?plan_subjectid='+2+"&grade_id="+this.current_grade+
                                '&is_switch='+el.is_switch+
                                '&module_type='+el.module_type+"&grade_name="+this.grade_name;
                        }
                    }
                    if(name=="教师评价"){
                        if(this.login_level == 4){
                            window.location='#teacher_evaluation_see?grade_id='+this.current_grade+'&is_switch='+el.is_switch+
                                '&module_type='+el.module_type+"&grade_name="+this.grade_name;
                        }else{
                            window.location='#c_c_scheme_list_see?plan_subjectid='+3+"&grade_id="+this.current_grade+
                                '&is_switch='+el.is_switch+'&module_type='+el.module_type+"&grade_name="+this.grade_name;
                        }
                    }
                    if(name=="体质健康"){
                        window.location='#health_project_mana_see?grade_id='+this.current_grade+'&is_switch='+el.is_switch+
                            '&module_type='+el.module_type;
                    }
                    if(name=="实践与成就"){
                        window.location='#real_a_type_set_see?grade_id='+this.current_grade+'&is_switch='+el.is_switch+
                            '&module_type='+el.module_type+'&start_time='+el.start_time+'&end_time='+el.end_time;
                    }
                },
            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });