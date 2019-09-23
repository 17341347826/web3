define(
    [
        C.CLF('avalon.js'), "layer",
        C.Co("eval_param_set", "term_report_parameters/level_check/level_check", 'css!'),
        C.Co("eval_param_set", "term_report_parameters/level_check/level_check", 'html!'),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function (avalon,
              layer,
              css,
              html,
              x,
              data_center,three_menu_module) {
        //获取年级(校管理)
        var api_get_grade = api.PCPlayer + "class/school_class.action";
        //获取年级(市级 区县)
        var api_get_grade_leader = api.PCPlayer+"grade/findGrades.action";
        //查询详情
        var api_get_find_by_count_rank=api.api+"Indexmaintain/indexmaintain_findByCountRankParameterInfo";
        //保存
        var api_add_count_analysis=api.api+"Indexmaintain/indexmaintain_addCountAnalysisInfo";
        //查询项目权重详情
        var api_get_info=api.api+"Indexmaintain/indexmaintain_findByCountAnalysisInfo";
        //修改
        var api_update_count_analysis=api.api+"Indexmaintain/indexmaintain_updateCountAnalysisInfo";
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
                $id: "level_check",
                level_count: 5,
                split_method: 1,
                char_start: "A",
                is_show_add:false,
                is_show_update:false,
                is_show_table:false,
                is_show_p:false,
                strand:1,
                grade:"",
                grade_id:"",
                level_list: ['A', 'B', 'C', 'D', 'E'],
                //总分
                weight_score:'',
                //判断总分是否有数据,true:有数据，false：没有数据
                weight_type:'',
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
                // get_update_info:function () {
                //     this.grade_id=pmx.grade_id;
                //     var grade_name=pmx.grade_name;
                //     this.grade=grade_name+'|'+this.grade_id;
                //     this.add_data.c_grade=pmx.grade_name;
                //     this.add_data.c_gradeid=pmx.grade_id;
                //     ajax_post(api_get_find_by_count_rank,{c_gradeid:this.add_data.c_gradeid},this);
                //     if(this.strand==2)
                //     {
                //         this.refresh_class_exam_item(this.grade_id, this.level_list);
                //     }
                //     else
                //     {
                //         this.class_list = [default_class_list_as_grade]
                //     }
                // },
                grade_list:[],
                highest_level:"",
                cb: function() {
                    var self=this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        self.highest_level = data.data.highest_level;
                        if(self.highest_level == 2 || self.highest_level ==3 ){//市区
                            self.city = dataList.city;
                            self.district = dataList.district;
                            ajax_post(api_get_grade_leader,{status:1},self);
                        }else{//学校
                            var school_id=dataList.fk_school_id;
                            ajax_post(api_get_grade,{school_id:school_id},self)
                        }


                    });
                },
                //添加总分
                save_weight:function(){
                    var id=Number(this.grade.split('|')[1]);
                    var name=this.grade.split('|')[0];
                    //总分
                    var weight_value=[];
                    weight_value.push(this.weight_score);
                    if(this.weight_score==''){
                        toastr.warning("必填,不能为空");
                        return;
                    }else if(Number(this.weight_score)<0){
                        toastr.warning("不能填负数");
                        return;
                    }
                    if(this.weight_type==false){
                        //添加
                        ajax_post(api_add_count_analysis,{cs_rank:0,cs_grade:name,cs_grade_id:id,cs_proweight:weight_value},this);
                    }else{
                        //修改
                        ajax_post(api_update_count_analysis,{cs_rank:0,cs_grade:name,cs_grade_id:id,cs_proweight:weight_value},this);
                    }
                },
                refresh_class_exam_item:function (grade_id, new_lev) {

                    if( grade_id == undefined )
                    {
                        var class_list = [default_class_list_as_grade];
                        var class_len = class_list.length;
                        var ele_count = new_lev.length;
                        for( var x = 0;x < class_len; x++ ){
                            for( var n = 0; n < ele_count; n++ ){
                                var cur_lev = new_lev[n];
                                if( !class_list[x].hasOwnProperty(cur_lev) ){
                                    class_list[x][cur_lev] = {
                                        "startscore":"",
                                        "endscore":""
                                    }
                                }
                            }
                        }
                        this.class_list = class_list;
                        return;
                    }
                    var grade_length=this.grade_list.length;
                    for(var i=0;i<grade_length;i++){
                        if(this.grade_list[i].grade_id==this.grade_id){
                            var class_list = this.grade_list[i].class_list;
                            var class_len = class_list.length;
                            var ele_count = new_lev.length;
                            for( var x = 0;x < class_len; x++ ){
                                for( var n = 0; n < ele_count; n++ ){
                                    var cur_lev = new_lev[n];
                                    if( !class_list[x].hasOwnProperty(cur_lev) ){
                                        class_list[x][cur_lev] = {
                                            "startscore":"",
                                            "endscore":""
                                        }
                                    }else{
                                        var s = 0;
                                        s = 1;
                                    }
                                }
                            }
                            this.class_list = class_list;
                            break;
                        }
                    }
                },
                grade_change:function () {
                    var get_grade=this.grade;
                    this.grade_id=get_grade.split('|')[1];
                    this.add_data.c_grade=get_grade.split('|')[0];
                    this.add_data.c_gradeid=get_grade.split('|')[1];
                    ajax_post(api_get_find_by_count_rank,{c_gradeid:this.add_data.c_gradeid},this);
                    //查询总分
                    ajax_post(api_get_info,{cs_rank:0,cs_grade_id:this.grade_id},this);

                    if(this.strand==2)
                    {
                        this.refresh_class_exam_item(this.grade_id, this.level_list);
                    }
                    else
                    {
                        this.class_list = [default_class_list_as_grade]
                    }
                },
                //按班级设置
                strand_change:function () {
                    if(this.strand==2)
                    {
                        this.refresh_class_exam_item(this.grade_id, this.level_list);
                    }
                    else
                    {
                        this.class_list = [default_class_list_as_grade]
                    }
                },
                t_abstrace:function (obj, key ,num) {
                    var s = [];
                    for( var i = 0; i < obj.length; ++i ){
                        // s.push(obj[i][key]);
                        s = s.concat(Array(num).fill(obj[i][key]))

                    }
                    return s;
                },
                t_abstrace_rank:function (obj ,num) {
                    var s = [];
                    for( var i = 0; i < num; ++i ){
                        // s.push(obj[i][key]);
                        s = s.concat(obj.$model)
                    }
                    return s;
                },
                t_level_abstract_min:function () {
                    var ret = []
                    var clen = this.class_list.length;
                    var vlen = this.level_list.length;
                    for(var i = 0; i < clen; ++i ){
                        for( var c = 0; c < vlen; ++c ){
                            var cur = this.class_list[i][this.level_list[c]];
                            var value = cur.startscore;
                            ret.push(value)
                        }
                    }
                    return ret;
                },
                t_level_abstract_min_max:function () {
                    var ret = []
                    var clen = this.class_list.length;
                    var vlen = this.level_list.length;
                    for(var i = 0; i < clen; ++i ){
                        for( var c = 0; c < vlen; ++c ){
                            var cur = this.class_list[i][this.level_list[c]];
                            var value = cur.startscore.toString() + '-' + cur.endscore.toString();
                            ret.push(value)
                        }
                    }
                    return ret;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            case api_get_grade_leader:
                                this.complete_get_grade(data);
                                break;
                            //获取详情
                            case api_get_find_by_count_rank:
                                this.complete_get_find_by_count_rank(data);
                                break;
                            //添加总分
                            case api_add_count_analysis:
                                this.complete_add_weight(data);
                                break;
                            //查询
                            case api_get_info:
                                this.complete_get_weight(data);
                                break;
                            //修改权重总分
                            case api_update_count_analysis:
                                this.complete_updata_weight(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //修改权重总分
                complete_updata_weight:function(data){
                    toastr.success("修改成功");
                },
                //查询权重分值
                complete_get_weight:function(data){
                    var dataList=data.data.list;
                    if(dataList.length>0){
                        this.weight_type=true;
                        this.weight_score=dataList[0].cs_proweight;
                    }else{
                        this.weight_type=false;
                    }
                },
                //总分
                complete_add_weight:function(data){
                    var id=Number(this.grade.split('|')[1]);
                    //查询总分
                    ajax_post(api_get_info,{cs_rank:0,cs_grade_id:id},this);
                },
                complete_get_grade: function (data) {
                    this.grade_list=data.data;


                    if(this.highest_level == 2 || this.highest_level ==3 ){//市区
                        this.grade=this.grade_list[0].grade_name+'|'+this.grade_list[0].id;
                        this.add_data.c_gradeid=data.data[0].id;
                    }else{//学校
                        this.grade=this.grade_list[0].grade_name+'|'+this.grade_list[0].grade_id;
                        this.add_data.c_gradeid=data.data[0].grade_id;
                    }
                    this.add_data.c_grade=data.data[0].grade_name;




                    // this.grade_id=data.data[0].grade_id;
                    if(JSON.stringify(pmx) == "{}"){
                        ajax_post(api_get_find_by_count_rank,{c_gradeid:this.add_data.c_gradeid},this);
                    }else{
                        this.grade_id=pmx.grade_id;
                        var grade_name=pmx.grade_name;
                        this.grade=grade_name+'|'+this.grade_id;
                        this.add_data.c_grade=pmx.grade_name;
                        this.add_data.c_gradeid=pmx.grade_id;
                        ajax_post(api_get_find_by_count_rank,{c_gradeid:this.add_data.c_gradeid},this);
                    }
                    var id=Number(this.grade.split('|')[1]);
                    //查询总分
                    ajax_post(api_get_info,{cs_rank:0,cs_grade_id:id},this);
                },
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
                        this.strand=data.c_standard;
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
                update_btn:function () {
                    var get_grade=this.grade;
                    var grade_id;
                    var grade_name;
                    if(get_grade==''){
                        grade_id=this.add_data.c_gradeid;
                        grade_name=this.add_data.c_grade;
                        window.location = "#level_update?grade_id="+grade_id+"&grade_name="+grade_name;
                    }else{
                        grade_name=get_grade.split('|')[0];
                        grade_id=get_grade.split('|')[1];
                        window.location = "#level_update?grade_id="+grade_id+"&grade_name="+grade_name;
                    }
                },
                add_btn:function () {
                    var get_grade=this.grade;
                    var grade_id;
                    var grade_name;
                    if(get_grade==''){
                        grade_id=this.add_data.c_gradeid;
                        grade_name=this.add_data.c_grade;
                        window.location = "#level_add?grade_id="+grade_id+"&grade_name="+grade_name;
                    }else{
                        grade_name=get_grade.split('|')[0];
                        grade_id=get_grade.split('|')[1];
                        window.location = "#level_add?grade_id="+grade_id+"&grade_name="+grade_name;
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
                if( vm.strand == 1)
                    vm.refresh_class_exam_item(undefined, col_bak)
                else
                    vm.refresh_class_exam_item(vm.grade_id, col_bak)
                vm.level_list = col_bak;
            });
            vm.$watch('onReady', function() {
                this.cb();
                // this.get_update_info();
            });
            vm.$watch('strand', function(a,b){
                if( a == 1)
                    vm.refresh_class_exam_item(undefined, this.level_list)
                else
                    vm.refresh_class_exam_item(vm.grade_id, this.level_list )
            });


            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });