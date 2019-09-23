/**
 * Created by Administrator on 2018/6/21.
 */
define(
    [
        C.CLF('avalon.js'), "layer",
        C.Co("eval_param_set", "graduation_report_parameters/graduation_level_check/graduation_level_check", 'css!'),
        C.Co("eval_param_set", "graduation_report_parameters/graduation_level_check/graduation_level_check", 'html!'),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM("three_menu_module")
    ],
    function (avalon,layer,css,html,x,data_center,three_menu_module) {
        //获取年级(市级 区县)
        var api_get_grade_leader = api.PCPlayer+"grade/findGrades.action";
        //查询等级设置详情
        // var api_get_find_by_count_rank=api.api+"Indexmaintain/indexmaintain_findByCountRankParameterInfo";
        var api_get_find_by_count_rank = api.api+"Indexmaintain/indexmaintain_findByCountRankParameterInfo_by";
        var avalon_define = function (pmx) {
            var default_class_list_as_grade = {
                c_classname:"全部班级",
                class_id:"",
                A:{startscore:'',endscore:''},
                B:{startscore:'',endscore:''},
                C:{startscore:'',endscore:''},
                D:{startscore:'',endscore:''},
                E:{startscore:'',endscore:''}
            };
            var vm = avalon.define({
                $id: "graduation_level_check",
                level_count: 5,
                //等级划分方式
                split_method: 1,
                char_start: "A",
                is_show_add:false,
                is_show_update:false,
                is_show_table:false,
                is_show_p:false,
                level_list: ['A', 'B', 'C', 'D', 'E'],
                class_list:[default_class_list_as_grade],
                //按分数段设置的等级+年级统一标准
                add_data:{
                    id:"",
                    c_classid:[],
                    c_classname:[],
                    c_number:[],
                    c_rank:[],
                    c_grade:"",
                    c_gradeid:"",
                    //标准 1年级统一 2按照各班级
                    c_standard:"",
                    //等级个数
                    c_rankcount:'',
                    //等级划分方式 1按分数段 2按人数比
                    c_rankway:"",
                    //分数段数组
                    c_scoregroup:[]
                },
                avg_width: 0,
                //年级集合
                grade_list:[],
                //年级id
                grade_id:"",
                highest_level:"",
                cb: function() {
                    var self=this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        self.highest_level = data.data.highest_level;
                        self.city = dataList.city;
                        self.district = dataList.district;
                        //年级
                        ajax_post(api_get_grade_leader,{status:1},self);
                    });
                },
                //年级改变
                grade_change:function () {
                    var get_grade=this.get_grade;
                    this.grade_id=get_grade.split('|')[1];
                    this.add_data.c_grade=get_grade.split('|')[0];
                    this.add_data.c_gradeid=get_grade.split('|')[1].toString();
                    ajax_post(api_get_find_by_count_rank,{c_gradeid:this.add_data.c_gradeid},this);
                    // ajax_post(api_get_find_by_count_rank,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取市管理员年级
                            case api_get_grade_leader:
                                this.complete_get_grade(data);
                                break;
                            //获取详情
                            case api_get_find_by_count_rank:
                                this.complete_get_find_by_count_rank(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //绑定年级名字
                get_grade:'',
                //年级
                complete_get_grade: function (data) {
                    this.grade_list=data.data;
                    if(JSON.stringify(pmx) == "{}"){
                        this.get_grade=this.grade_list[0].grade_name+'|'+this.grade_list[0].id;
                        this.add_data.c_gradeid=data.data[0].id.toString();
                        this.add_data.c_grade=data.data[0].grade_name;
                    }else{
                        this.grade_id=pmx.grade_id;
                        var grade_name=pmx.grade_name;
                        this.get_grade=grade_name+'|'+this.grade_id;
                        this.add_data.c_grade=pmx.grade_name;
                        this.add_data.c_gradeid=pmx.grade_id.toString();
                    }
                    ajax_post(api_get_find_by_count_rank,{c_gradeid:this.add_data.c_gradeid},this);
                    // ajax_post(api_get_find_by_count_rank,{},this);
                },
                //详情
                complete_get_find_by_count_rank:function (data) {
                    if(data.data.length==0){
                        this.is_show_table=false;
                        this.is_show_p=true;
                        this.is_show_add=true;
                        this.is_show_update=false;
                    }else{
                        this.is_show_add=false;
                        this.is_show_update=true;
                        data = data.data[0];
                        this.add_data.id=data.id;
                        this.split_method=data.c_rankway;
                        // this.strand=data.c_standard;
                        this.level_count=data.c_rankcount;
                        this.add_data.c_rankway=data.c_rankway;
                        this.add_data.c_standard=data.c_standard;
                        this.add_data.c_rankcount=data.c_rankcount;

                        var start_code = vm.char_start.charCodeAt();
                        var level_count = data.c_rankcount;
                        if(level_count == 0)return;

                        var rank_list =  data.countRankParameterInfoList;
                        var class_count  = rank_list.length / level_count;
                        var levels = [];
                        var classes = [];
                        for( var i = 0; i < levels; i++ ){
                            levels.push(rank_list[i].c_rank)//[A,B,C,D,E]
                        }
                        for( var i = 0; i < class_count ; i++ ){
                            var dic = rank_list[i*level_count];
                            if(this.add_data.c_rankway==1){
                                for( var x = 0; x < level_count; x++ ){
                                    dic[String.fromCharCode(start_code+x)] = {
                                        startscore:rank_list[i*level_count+x].startscore,
                                        endscore:rank_list[i*level_count+x].endscore
                                    }

                                }
                            }else{
                                for( var x = 0; x < level_count; x++ ){
                                    dic[String.fromCharCode(start_code+x)] = {
                                        startscore:rank_list[i*level_count+x].c_number
                                    }

                                }
                            }

                            classes.push(dic);
                        }
                        this.class_list=classes;
                        this.is_show_table=true;
                        this.is_show_p=false;
                    }
                },
                //修改
                update_btn:function () {
                    var grade_id;
                    var grade_name;
                    grade_id=this.add_data.c_gradeid;
                    grade_name=this.add_data.c_grade;
                    window.location = "#graduation_level_update?grade_id="+grade_id+"&grade_name="+grade_name;
                },
                //设置
                add_btn:function () {
                    var grade_id;
                    var grade_name;
                    grade_id=this.add_data.c_gradeid;
                    grade_name=this.add_data.c_grade;
                    //获取年级可操作学年学期
                    var sem_list = cloud.grade_semester_list({grade_id: Number(grade_id)});
                    //必须是九年级且必须有6个学年学期
                    if(sem_list.length == 6){
                        window.location = "#graduation_level_update?grade_id="+grade_id+"&grade_name="+grade_name;
                    }else{
                        toastr.warning('当前时间不是九年级下期，不能进行等级设置！');
                    }

                }
            });

            // 求平均宽
            vm.avg_width = (100 / (vm.level_count + 1)).toFixed(2);
            vm.$watch('level_count', function (a, b) {
                var col_bak = vm.level_list.$model;
                var mod = a - b;
                vm.level_count = a;
                vm.avg_width = (100 / (a + 1)).toFixed(2);
                if (mod > 0) {
                    // 补足
                    var start_code = vm.char_start.charCodeAt();
                    var ori_len = vm.level_list.length;
                    for (var i = 1; i <= mod; ++i) {
                        var char = String.fromCharCode(start_code + i + ori_len - 1);
                        col_bak.push(char)
                    }
                }
                else if (mod < 0) {
                    // 清除多余项
                    col_bak.splice(vm.level_list.length - Math.abs(mod), Math.abs(mod));
                }
                vm.level_list = col_bak;
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