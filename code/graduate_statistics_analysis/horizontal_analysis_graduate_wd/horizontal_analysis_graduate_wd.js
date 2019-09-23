define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'horizontal_analysis_graduate_wd/horizontal_analysis_graduate_wd', 'html!'),
        C.Co('graduate_statistics_analysis', 'horizontal_analysis_graduate_wd/horizontal_analysis_graduate_wd', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/graduation_eval_horizontal_analysis";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "horizontal_analysis_graduate_wd",
                //用户基本信息
                user:{},
                //用户身份:user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                ident_type:'',
                // 年級信息
                grade_list: [],
                grade_id:'',
                //区县
                area_list:[],
                area_name:'',
                //学校
                school_name:'',
                //班级
                class_list:[],
                class_id:'',
                //  市维度
                city_headers:[],
                city_analyze_list:[],
                //  区县维度头
                district_headers:[],
                district_analyze_list:[],

                school_headers:[],
                school_analyze_list:[],

                class_headers:[],
                class_analyze_list:[],
                //数据备份一份
                city_data_backups:[],
                area_data_backups:[],
                school_data_backups:[],
                class_data_backups:[],
                init: function () {
                    this.user = cloud.user_user();
                    //用户身份
                    this.ident_type = cloud.user_level();
                    this.grade_list = cloud.grade_list_graduation();
                    if(this.ident_type <4){//市、区县
                        this.area_list = cloud.sel_area_list();
                    }
                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    this.grade_list.unshift(obj);
                    this.area_list.unshift(obj);
                    this.query();
                },
                to_page:function (url) {
                    window.location.href = url;
                },
                //年级筛选
                sel_change_grade: function (el) {
                    this.grade_id = el.value;
                    this.class_list = [];
                    this.class_id = '';
                    if(this.ident_type == 4 && this.grade_id != ''){//校
                        var all_class_list = cloud.find_class_simple({fk_grade_id:this.grade_id});
                        this.class_list = any_2_select(all_class_list, {name: "class_name", value: ["id"]});
                        var obj = {
                            name: '全部',
                            value: ''
                        };
                        this.class_list.unshift(obj);
                    }
                    this.city_analyze_list     = this.city_data_backups;
                    this.class_analyze_list    = this.class_data_backups;
                    //区县
                    if(this.ident_type == 2 && this.area_name != '' && this.area_name != '全部'){
                        var area_list = this.ary_class(this.area_data_backups,'district_name',this.area_name);
                    }else{
                        var area_list = this.area_data_backups;
                    }
                    //学校
                    if(this.ident_type < 4 && this.school_name != ''){
                        var school_list = this.fuzzy_query(this.school_data_backups,'school_name', this.school_name);
                    }else{
                        var school_list = this.school_data_backups;
                    }
                    //班级
                    if(this.ident_type == 4 && this.class_id != ''){
                        var class_list =  this.ary_class(this.class_data_backups,'fk_class_id',this.class_id);
                    }else{
                        var class_list = this.class_data_backups;
                    }
                    if(el.name == '全部'){
                        this.district_analyze_list = area_list;
                        this.school_analyze_list   = school_list;
                        return;
                    }
                    this.city_analyze_list     = this.ary_class(this.city_analyze_list,'fk_grade_id',el.value);
                    this.district_analyze_list = this.ary_class(area_list,'fk_grade_id',el.value);
                    this.school_analyze_list   = this.ary_class(school_list,'fk_grade_id',el.value);
                    this.class_analyze_list    = this.ary_class(class_list,'fk_grade_id',el.value);
                },
                //区县筛选
                sel_change_area:function(el){
                    this.area_name = el.name;
                    if(this.grade_id != ''){
                        var area_list =  this.ary_class(this.area_data_backups,'fk_grade_id',this.grade_id);
                    }else{
                        var area_list = this.area_data_backups;
                    }
                    if(el.name == '全部'){
                        this.district_analyze_list = area_list;
                        return;
                    }
                    this.district_analyze_list = this.ary_class(area_list,'district_name',el.name);
                },
                //学校查询
                school_search:function(){
                    if(this.grade_id != ''){
                        var school_list =  this.ary_class(this.school_data_backups,'fk_grade_id',this.grade_id);
                    }else{
                        var school_list = this.school_data_backups;
                    }
                    if(this.school_name == ''){
                        this.school_analyze_list = school_list;
                        return;
                    }
                    this.school_analyze_list = this.fuzzy_query(school_list,'school_name', this.school_name)
                },
                //班级筛选
                sel_change_class:function(el){
                    this.class_id = el.value;
                    if(this.grade_id != ''){
                        var class_list =  this.ary_class(this.class_data_backups,'fk_grade_id',this.grade_id);
                    }else{
                        var class_list = this.class_data_backups;
                    }
                    if(el.name == '全部'){
                        this.class_analyze_list = class_list;
                        return;
                    }
                    this.class_analyze_list = this.ary_class(class_list,'fk_class_id',this.class_id);
                },
                //数组分类--根据字段将数组提取成新数组
                ary_class:function(arr,zd_name,class_name){//arr-数组，zd_name--字段名称，class_name--筛选值
                    var ary = [];
                    for(var i=0;i<arr.length;i++){
                        if(class_name == arr[i][zd_name]){
                            ary.push(arr[i]);
                        }
                    }
                    return ary;
                },
                //模糊查询--输入一些值查询出含有这个值的数据
                fuzzy_query:function(arr,zd_name,mf_name){//arr-数组,zd_name--模糊查询字段名称，mf_name -- 输入模糊查询的值
                    var ary = [];
                    for(var i=0;i<arr.length;i++){
                        var name = arr[i][zd_name];
                        if(name.indexOf(mf_name)>0){
                            ary.push(arr[i]);
                        }
                    }
                    return ary;
                },
                //年级id转年级名称
                nameId_change:function(id){
                    var list = this.grade_list;
                    for(var i=0;i<list.length;i++){
                        if(id == list[i].value){
                            return list[i].name;
                        }
                    }
                },
                //合并单元格
                merge_cell:function(arr,zd_name,name,idx){//arr-数组，zd_name--字段名称,name--值，idx--序号
                    var count = 0;
                    if(idx > 0 && arr[idx-1][zd_name] == name)
                        return count;
                    for(var i=0;i<arr.length;i++){
                        if(arr[i][zd_name] == name){
                            count++;
                        }
                    }
                    return count;
                },
                query:function () {
                    cloud.bypj_hx_wd({},function (url, args, ret, is_suc, msg) {
                        var default_sub_item = {rs: "", zb_pjf: "", zb_mc: "", fk_semester_id: ""};
                        vm.city_headers.clear();
                        vm.district_headers.clear();
                        vm.school_headers.clear();
                        vm.class_headers.clear();
                        vm.city_analyze_list.clear();
                        vm.district_analyze_list.clear();
                        vm.school_analyze_list.clear();
                        vm.class_analyze_list.clear();
                        // var ret = {
                        //     city_cnt:[
                        //         {city_name:'眉山市',fk_grade_id:1,
                        //                 sub_list:[
                        //                     {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                     {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                     {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                     {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                     {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //                 ]},
                        //         {city_name:'眉山市',fk_grade_id:2,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {city_name:'眉山市',fk_grade_id:3,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         ],
                        //     district_cnt:[
                        //         {district_name:'东坡区',fk_grade_id:1,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'999'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {district_name:'东坡区',fk_grade_id:2,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {district_name:'东坡区',fk_grade_id:3,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {district_name:'武侯区',fk_grade_id:1,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'999'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {district_name:'武侯区',fk_grade_id:2,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {district_name:'武侯区',fk_grade_id:3,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //     ],
                        //     school_cnt:[
                        //         {fk_school_id:9,school_name:'学唐云一中',fk_grade_id:1,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云一中',fk_grade_id:2,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云一中',fk_grade_id:3,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云二中',fk_grade_id:1,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云二中',fk_grade_id:2,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云二中',fk_grade_id:3,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云三中',fk_grade_id:1,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云三中',fk_grade_id:2,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {fk_school_id:9,school_name:'学唐云三中',fk_grade_id:3,
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //     ],
                        //     school_class_cnt:[
                        //         {class_name:'001',fk_class_id:20,fk_grade_id:1,grade_name:'初2016级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'003',fk_class_id:22,fk_grade_id:1,grade_name:'初2016级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'002',fk_class_id:21,fk_grade_id:1,grade_name:'初2016级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'004',fk_class_id:23,fk_grade_id:1,grade_name:'初2016级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'001',fk_class_id:20,fk_grade_id:2,grade_name:'初2017级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'003',fk_class_id:22,fk_grade_id:2,grade_name:'初2017级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'002',fk_class_id:21,fk_grade_id:2,grade_name:'初2017级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //         {class_name:'004',fk_class_id:23,fk_grade_id:2,grade_name:'初2017级',
                        //             sub_list:[
                        //                 {zb_mc:'思想品德',zb_pjf:'0.01'},
                        //                 {zb_mc:'学业水平',zb_pjf:'0.36'},
                        //                 {zb_mc:'身心健康',zb_pjf:'0.35'},
                        //                 {zb_mc:'艺术素养',zb_pjf:'5.34'},
                        //                 {zb_mc:'社会实践',zb_pjf:'5.34'},
                        //             ]},
                        //     ],
                        // };
                        if(ret){
                            if(vm.ident_type == 2){//市
                                //抽离市数据
                                var city_zb = abstract(ret.city_cnt, "sub_list");
                                city_zb = concat(city_zb);
                                city_zb = abstract(city_zb, "zb_mc");
                                vm.city_headers = unique(city_zb);
                                if(vm.city_headers.length>0){
                                    ret.city_cnt.forEach(function (data) {
                                        if(data && data.sub_list){
                                            data.sub_list = padding(data.sub_list, "zb_mc", vm.city_headers.$model, default_sub_item);

                                        }
                                    });
                                    vm.city_analyze_list = ret.city_cnt;
                                    vm.city_data_backups = ret.city_cnt;
                                    // vm.deal_data(vm.district_analyze_list,'district','district_chart_id');
                                }
                            }
                            if(vm.ident_type < 4){//市、区县
                                //抽离区县数据
                                var dist_zb = abstract(ret.district_cnt, "sub_list");
                                dist_zb = concat(dist_zb);
                                dist_zb = abstract(dist_zb, "zb_mc");
                                vm.district_headers = unique(dist_zb);
                                if(vm.district_headers.length>0){
                                    ret.district_cnt.forEach(function (data) {
                                        if(data&&data.sub_list){
                                            data.sub_list = padding(data.sub_list, "zb_mc", vm.district_headers.$model, default_sub_item);

                                        }
                                    });
                                    vm.district_analyze_list = ret.district_cnt;
                                    vm.area_data_backups = ret.district_cnt;
                                    // vm.deal_data(vm.district_analyze_list,'district','district_chart_id');
                                }
                            }
                            // 抽离学校数据
                            var sch_zb = abstract(ret.school_cnt, "sub_list");
                            sch_zb = concat(sch_zb)
                            sch_zb = abstract(sch_zb, "zb_mc");
                            vm.school_headers = unique(sch_zb);
                            if(vm.school_headers.length&&vm.school_headers.length>0){
                                ret.school_cnt.forEach(function (data) {
                                    data.sub_list = padding(data.sub_list, "zb_mc", vm.school_headers.$model, default_sub_item);
                                });
                                vm.school_analyze_list = ret.school_cnt;
                                vm.school_data_backups = ret.school_cnt;
                                // vm.deal_data(vm.school_analyze_list,'school','school_chart_id');
                            }
                            if(vm.ident_type == 4){
                                // 抽离班级数据
                                var cls_zb = abstract(ret.school_class_cnt, "sub_list");
                                cls_zb = concat(cls_zb)
                                cls_zb = abstract(cls_zb, "zb_mc");
                                vm.class_headers = unique(cls_zb);
                                if(vm.class_headers&&vm.class_headers.length>0){
                                    ret.school_class_cnt.forEach(function (data) {
                                        data.sub_list = padding(data.sub_list, "zb_mc", vm.class_headers.$model, default_sub_item);
                                    });
                                    vm.class_analyze_list = ret.school_class_cnt;
                                    vm.class_data_backups = ret.school_class_cnt;
                                    // vm.deal_data(vm.class_analyze_list,'class','class_chart_id');
                                }
                            }
                        }
                        // if(ret){
                        //     //抽离区县数据
                        //     var dist_zb = abstract(ret.city_cnt, "sub_list");
                        //     dist_zb = concat(dist_zb);
                        //     dist_zb = abstract(dist_zb, "zb_mc");
                        //     vm.district_headers = unique(dist_zb);
                        //     if(vm.district_headers.length>0){
                        //         ret.city_cnt.forEach(function (data) {
                        //             if(data&&data.sub_list){
                        //                 data.sub_list = padding(data.sub_list, "zb_mc", vm.district_headers.$model, default_sub_item);
                        //
                        //             }
                        //         });
                        //         vm.district_analyze_list = ret.city_cnt;
                        //         // vm.deal_data(vm.district_analyze_list,'district','district_chart_id');
                        //     }
                        //     // 抽离学校数据
                        //     var sch_zb = abstract(ret.district_cnt, "sub_list");
                        //     sch_zb = concat(sch_zb)
                        //     sch_zb = abstract(sch_zb, "zb_mc");
                        //     vm.school_headers = unique(sch_zb);
                        //     if(vm.school_headers.length&&vm.school_headers.length>0){
                        //         ret.district_cnt.forEach(function (data) {
                        //             data.sub_list = padding(data.sub_list, "zb_mc", vm.school_headers.$model, default_sub_item);
                        //         });
                        //         vm.school_analyze_list = ret.district_cnt;
                        //         // vm.deal_data(vm.school_analyze_list,'school','school_chart_id');
                        //     }
                        //
                        //     // 抽离班级数据
                        //     var cls_zb = abstract(ret.school_cnt, "sub_list");
                        //     cls_zb = concat(cls_zb)
                        //     cls_zb = abstract(cls_zb, "zb_mc");
                        //     vm.class_headers = unique(cls_zb);
                        //     if(vm.class_headers&&vm.class_headers.length>0){
                        //         ret.school_cnt.forEach(function (data) {
                        //             data.sub_list = padding(data.sub_list, "zb_mc", vm.class_headers.$model, default_sub_item);
                        //         });
                        //         vm.class_analyze_list = ret.school_cnt;
                        //         // vm.deal_data(vm.class_analyze_list,'class','class_chart_id');
                        //     }
                        // }
                    });
                },
                deal_data:function (data, type, div_id) {

                }
            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
                    vm.init();
                })
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
