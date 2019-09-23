/**
 * Created by Administrator on 2018/7/14.
 */
define(['jquery',C.CLF('avalon.js'), "layer",
        C.Co("eval_param_set","term_statistics/term_statistics",'css!'),
        C.Co("eval_param_set","term_statistics/term_statistics",'html!'),
        C.CMF("router.js"), C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function($,avalon,layer,css,html,x,data_center,three_menu_module) {
        //学年学期
        var api_get_sem = api.api+'base/semester/semester_grade_mapping';
        //查询统计分析参数基础设置-列表
        var api_stac_list = api.api+'Indexmaintain/indexmaintain_findByCountAnalysis';
        //撤销统计
        var api_reset_analysis = api.api + 'Indexmaintain/reset_count_analysis';
        //查询统计项目控制参数
        var api_project_control = api.api + 'score/get_project_control';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "term_statistics",
                //身份判断
                user_type:'',
                data:{
                    ca_end_semester:"",
                    ca_endtime:"",
                    ca_grade:"",
                    ca_gradeid:"",
                    ca_name:"",
                    ca_remark:"",
                    ca_semester:"",
                    ca_start_semester:"",
                    ca_starttime:"",
                    semester_id:"",
                    list:[]
                },
                statistics_data:{
                    arr_school_id:"",
                    city:"",
                    end_time:"",
                    fk_grade_id:"",//number
                    fk_unit_id:"",//规则创建者的单位id number
                    grade_no:"",//实际年级7 7初一 8初二 9初三 number
                    project_id:"",//number
                    semester_id:"",
                    start_time:""
                },
                //市
                city:'',
                //单选方式:0-三年期间评价累计得分的平均分;1-自定义三年期间各评价累计得分权重
                radio_type:1,
                //年级
                demo_grade:'',
                //年级集合
                grade_list:[],
                grade_info:'',
                //学年学期
                sem_list:[],
                sem_info:'',
                //列表数据
                stac_list:'',
                //保存
                req_data:{
                    offset:0,
                    rows:99999,
                    ca_gradeid:'',
                    //状态(1:未统计2已统计)
                    ca_state:'',
                    /*
                    * 1: '未统计',//即没统计也没迁移
                     2: '已统计',//统计完
                     3: '迁移完毕',//可以进行统计
                     4: '已统计(已发布)',
                     5: '已归档',
                     6: '迁移中',
                     7: '统计中'
                    * */
                    ca_workid:''
                },
                old_data:[],
                work_id:"",
                //进度条显示:false-不显示，true-显示
                is_progress_show:false,
                //进度刻度
                progress_scale:0,
                cb: function() {
                    this.statistics_data.city = cloud.user_city();
                    // this.statistics_data.fk_unit_id = cloud.user_school_id();
                    this.user_type = cloud.user_type();
                    var self=this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        self.req_data.ca_workid = dataList.fk_school_id;
                        var login_level = data.data.highest_level;
                        if(login_level == 4){
                            var school_name = cloud.user_school();
                            var school_id = cloud.user_school_id();
                            vm.work_id = school_id;
                            vm.statistics_data.arr_school_id = school_id + '';
                            vm.data.list = [
                                {school_id:school_id,school_name:school_name}
                            ];
                        }else{
                            var list = cloud.school_list();
                            var length = list.length;
                            var str = '';
                            for(var i = 0; i < length; i++){
                                var obj = {school_id:"",school_name:""};
                                obj.school_id = list[i].id;
                                str +=  list[i].id + ',';
                                obj.school_name = list[i].schoolname;
                                vm.data.list.push(obj);
                            }
                            str = str.substring(0,str.length-1);
                            vm.statistics_data.arr_school_id = str;
                        }
                        //年级
                        ajax_post(api_get_sem,{},self);
                    });
                },
                //计算产品测试用的
                re_remark_js:function(remark,el){
                    switch (remark){
                        case '九年级':
                            vm.statistics_data.grade_no = 9;
                            break;
                        case '八年级':
                            vm.statistics_data.grade_no = 8;
                            break;
                        case '七年级':
                            vm.statistics_data.grade_no = 7;
                            break;
                    }
                    cloud.add_count_analysis(this.data.$model,function (url, ars, data) {
                        vm.statistics_data.project_id = data;
                        //显示进度条
                        vm.progress_type();
                        cloud.score_statistics(vm.statistics_data.$model,function (url, ars, data) {
                            vm.cb();
                            vm.progress_scale = 100;
                            setTimeout(setTimeout(function(){
                                vm.is_progress_show = false;
                            }, 3000));
                        })
                    });
                },
                //结果生成调的-9.20之前线上用的
                re_remark:function (remark,el) {
                    switch (remark){
                        case '九年级':
                            vm.statistics_data.grade_no = 9;
                            break;
                        case '八年级':
                            vm.statistics_data.grade_no = 8;
                            break;
                        case '七年级':
                            vm.statistics_data.grade_no = 7;
                            break;
                    }
                    cloud.add_count_analysis(this.data.$model,function (url, ars, data) {
                        vm.statistics_data.project_id = data;
                        vm.release(el);
                    });
                },
                //进度条显示
                progress_type:function(){
                    this.is_progress_show = true;
                    //生成4-8的随机数
                    // var num = parseInt(Math.random()*4+8, 8);
                    var self = this;
                    // for(var i=0;i<4;i++){
                    //     setTimeout(setTimeout(function(){
                    //         self.progress_scale = self.progress_scale + 20;
                    //     }, 8000));
                    // }
                    setTimeout(setTimeout(function(){
                        self.progress_scale = self.progress_scale + 20;
                        setTimeout(setTimeout(function(){
                            self.progress_scale = self.progress_scale + 20;
                            setTimeout(setTimeout(function(){
                                self.progress_scale = self.progress_scale + 20;
                                setTimeout(setTimeout(function(){
                                    self.progress_scale = self.progress_scale + 20;
                                }, 8000));
                            }, 8000));
                        }, 8000));
                    }, 1000));
                },
                //年级切换
                gradeChange:function(){
                    var sem_id = this.sem_info;
                    var grade_id = this.grade_info;
                    this.req_data.ca_gradeid = grade_id;
                    this.change_select(grade_id,sem_id);
                    //    请求那个身份控制的参数设置
                },
                semChange:function (el) {
                    var sem_id = this.sem_info;
                    var dataList = this.sem_list;
                    var dataLength = dataList.length;
                    for(var i = 0; i < dataLength; i++){
                        if(sem_id == dataList[i].id){
                            this.grade_list = dataList[i].grades;
                        }
                    }
                    ajax_post(api_stac_list,this.req_data.$model,this);
                },
                change_select:function (grade_id,semester_id) {
                    var old_info = this.old_data.$model;
                    var oldLength = old_info.length;
                    var arr = [];
                    if(grade_id == 0 && semester_id == 0){
                        this.stac_list = old_info;
                    }else{
                        for(var i = 0; i < oldLength; i ++){
                            if(grade_id != 0 && semester_id != 0){
                                if(grade_id == old_info[i].grade_id && semester_id == old_info[i].sem_id){
                                    arr.push(old_info[i]);
                                }
                            }else if(grade_id == old_info[i].grade_id || semester_id == old_info[i].sem_id){
                                arr.push(old_info[i]);
                            }
                        }
                        this.stac_list = arr;
                    }
                },
                //撤销
                revoke_statistics:function(el){
                    // console.log(el);
                    var self = this;
                    layer.confirm('您正在进行不可逆操作，确定继续撤销？', {
                        btn: ['确定','取消'] //按钮
                    }, function(){
                        var project_id = el.pro_id;
                        ajax_post(api_reset_analysis,{id:project_id},self);
                        layer.closeAll();
                    }, function(){
                        layer.closeAll();
                    });
                },
                //计算-产品测试需要，临时加的
                cal_one:function(el){
                    this.data.ca_end_semester = this.timeChuo(el.end_date);
                    this.data.ca_endtime =  this.timeChuo(el.end_date);
                    this.data.ca_grade = el.grade_name;
                    this.data.ca_gradeid = el.grade_id;
                    this.data.ca_name = '';
                    this.data.ca_remark = '';
                    this.data.ca_semester = el.semester_name;
                    this.data.ca_start_semester = this.timeChuo(el.start_date);
                    this.data.ca_starttime = this.timeChuo(el.start_date);
                    this.data.semester_id = el.sem_id;
                    this.statistics_data.end_time = this.data.ca_end_semester;
                    this.statistics_data.start_time = this.data.ca_starttime;
                    this.statistics_data.fk_grade_id = el.grade_id;
                    this.statistics_data.semester_id = el.sem_id;
                    var remark = el.remark;
                    remark = remark.substring(0,3);
                    //查询统计项目控制参数
                    cloud.get_project_control({ city: this.statistics_data.city,fk_grade_id:this.statistics_data.fk_grade_id},function (url, ars, data) {
                        //统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                        var unit_lv = data.unit_lv;
                        var dept_info = cloud.get_dept_high_info();
                        //department_level：当前统计的单位登记，就是当前登陆者级别（1-省级；2-市级；3-区县级；4-校级）
                        if(unit_lv == 2){//市
                            vm.statistics_data.fk_unit_id = dept_info.city_id;
                        }else if(unit_lv == 3){
                            vm.statistics_data.fk_unit_id = dept_info.district_id;
                        }else if(unit_lv == 4 && data.department_level == 4){//学校创建的学校统计
                            vm.statistics_data.fk_unit_id = dept_info.district_id;
                        }
                        vm.re_remark_js(remark,el);
                    })
                },
                //结果管理
                cal:function (el) {
                    this.data.ca_end_semester = this.timeChuo(el.end_date);
                    this.data.ca_endtime =  this.timeChuo(el.end_date);
                    this.data.ca_grade = el.grade_name;
                    this.data.ca_gradeid = el.grade_id;
                    this.data.ca_name = '';
                    this.data.ca_remark = '';
                    this.data.ca_semester = el.semester_name;
                    this.data.ca_start_semester = this.timeChuo(el.start_date);
                    this.data.ca_starttime = this.timeChuo(el.start_date);
                    this.data.semester_id = el.sem_id;
                    this.statistics_data.end_time = this.data.ca_end_semester;
                    this.statistics_data.start_time = this.data.ca_starttime;
                    this.statistics_data.fk_grade_id = el.grade_id;
                    this.statistics_data.semester_id = el.sem_id;
                    var remark = el.remark;
                    remark = remark.substring(0,3);
                    //查询统计项目控制参数
                    cloud.get_project_control({ city: this.statistics_data.city,fk_grade_id:this.statistics_data.fk_grade_id},function (url, ars, data) {
                        //统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                        var unit_lv = data.unit_lv;
                        var dept_info = cloud.get_dept_high_info();
                        //department_level：当前统计的单位登记，就是当前登陆者级别（1-省级；2-市级；3-区县级；4-校级）
                        if(unit_lv == 2){//市
                            vm.statistics_data.fk_unit_id = dept_info.city_id;
                        }else if(unit_lv == 3){
                            vm.statistics_data.fk_unit_id = dept_info.district_id;
                        }else if(unit_lv == 4 && data.department_level == 4){//学校创建的学校统计
                            vm.statistics_data.fk_unit_id = dept_info.district_id;
                        }
                        vm.re_remark(remark,el);
                    })
                    // window.location = "#leading_statistical_results?semester_id=" + 4 +
                    //     "&grade_id=" + 3 +
                    //     "&grade_name=" + '初2015级' +
                    //     "&remark=" + '九年级' +
                    //     "&pro_id=" + 19 +
                    //     "&status=" + 2 +
                    //     "&ca_start_semester=" + '2018-03-02' +
                    //     "&ca_end_semester=" + '2018-09-30';

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        //        学年学期
                            case api_get_sem:
                                this.complete_get_sem(data);
                                break;
                        //        列表
                            case api_stac_list:
                                this.complete_stac_list(data);
                                break;
                        //        撤销统计
                            case api_reset_analysis:
                                this.complete_reset_analysis(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //学年学期
                complete_get_sem:function(data){
                    var dataList = data.data.list;
                    this.sem_list = dataList;
                    this.sem_info = this.sem_list[0].id;
                    this.grade_list = this.sem_list[0].grades;
                //    统计列表
                    ajax_post(api_stac_list,this.req_data.$model,this);
                },
            //    列表
                complete_stac_list:function(data){
                    var g_list = this.grade_list;
                    var sem_list = this.sem_list;
                    var stac_list = data.data.list;
                    var list = [];
                    //重组学年学期和年级
                    for(var i=0;i<sem_list.length;i++){
                        if(this.sem_info == sem_list[i].id){
                            for(var j=0;j<g_list.length;j++){
                                var obj = {};
                                obj.sem_id = sem_list[i].id;
                                obj.semester_index = sem_list[i].semester_index;
                                obj.semester_name = sem_list[i].semester_name;
                                obj.start_date = sem_list[i].start_date;
                                obj.end_date = sem_list[i].end_date;
                                obj.grade_id = g_list[j].id;
                                obj.grade_name = g_list[j].grade_name;
                                obj.remark = g_list[j].remark;
                                obj.status = '';
                                list.push(obj);
                            }
                        }
                    }
                    if(stac_list.length > 0){
                        for(var i=0;i<stac_list.length;i++){
                            var g_id = stac_list[i].ca_gradeid;
                            var s_id = stac_list[i].semester_id;
                            for(var j=0;j<list.length;j++){
                                if(g_id == list[j].grade_id && s_id == list[j].sem_id){
                                    list[j].status = stac_list[i].ca_state;
                                    list[j].pro_id = stac_list[i].id;
                                    list[j].ca_end_semester = stac_list[i].ca_end_semester;
                                    list[j].ca_start_semester = stac_list[i].ca_start_semester;
                                }
                            }
                        }
                    }
                    this.stac_list = list;
                    this.old_data = list;
                },
                release:function (el) {
                    window.location = "#leading_statistical_results?semester_id=" + el.sem_id +
                            "&grade_id=" + el.grade_id +
                            "&grade_name=" + el.grade_name +
                            "&remark=" + el.remark +
                            "&pro_id=" + this.statistics_data.project_id +
                            "&status=" + el.status +
                            "&ca_start_semester=" + el.start_date +
                            "&ca_end_semester=" + el.end_date;
                    // window.location = "#leading_statistical_results?semester_id=" + 4 +
                    //     "&grade_id=" + 3 +
                    //     "&grade_name=" + '初2015级' +
                    //     "&remark=" + '九年级' +
                    //     "&pro_id=" + 19 +
                    //     "&status=" + 2 +
                    //     "&ca_start_semester=" + '2018-03-02' +
                    //     "&ca_end_semester=" + '2018-09-30';

                },
                //撤销统计
                complete_reset_analysis:function(data){
                    //    统计列表
                    ajax_post(api_stac_list,this.req_data.$model,this);
                },
                //时间戳
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
            vm.$watch('onReady', function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });