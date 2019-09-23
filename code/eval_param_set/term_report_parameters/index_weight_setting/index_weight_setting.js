define(['jquery',C.CLF('avalon.js'), "layer",
        C.Co('eval_param_set', 'term_report_parameters/index_weight_setting/index_weight_setting','html!'),
        C.Co('eval_param_set', 'term_report_parameters/index_weight_setting/index_weight_setting','css!'),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM("three_menu_module"), C.CM("select_assembly")
    ],
    function($,avalon,layer,html,css,x,data_center,three_menu_module,select_assembly) {
        //指标查询——一、二级指标
        var api_get_index = api.api+"Indexmaintain/indexmaintain_findByIndexName";
        //查询详情
        var api_get_info = api.api + "Indexmaintain/indexmaintain_findByCountAnalysisInfo";
        //保存
        var api_add_count_analysis = api.api + "Indexmaintain/save_or_update_count_analysis_info";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "index_weight_setting",
                grade_list:[],
                grade_id:"",
                head_value:"",
                grade_name:"",
                fk_school_id:"",
                fk_school_name:'',
                login_name:"",
                login_guid:"",
                index_grade:"",
                cb:function () {
                    var s_grade = cloud.grade_list();
                    this.grade_list = cloud.grade_all_list();
                    this.head_value = this.grade_list[0].name;
                    var grade_value = this.grade_list[0].value;
                    this.grade_id = Number(grade_value.split('|')[0]);
                    var  remark = grade_value.split('|')[1];
                    if(remark == '七年级'){
                        this.index_grade = 7
                    }else if(remark == '八年级'){
                        this.index_grade = 8
                    }else{
                        this.index_grade = 9
                    }
                    this.grade_name = this.grade_list[0].name;
                    this.fk_school_id = cloud.user_school_id();
                    this.fk_school_name = cloud.user_school();
                    var user = cloud.user_user();
                    this.login_name = user.name;
                    this.login_guid = cloud.user_guid();
                    ajax_post(api_get_index,{index_rank:1},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_index:
                                this.complete_get_index(data);
                                break;
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                            case api_add_count_analysis:
                                toastr.success('设置成功');
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                second_index_list:[],
                first_index_list:[],
                dataInfo:[],
                complete_get_index:function (data) {
                    this.first_index_list = data.data;
                    /*获取每个一级指标的权重*/
                    ajax_post(api_get_info,{cs_grade_id:this.grade_id,cs_rank:1,rows:999999,offset:0},this);
                },
                complete_get_info: function (data) {
                    var data_x = data.data.list;
                    var data_length = data_x.length;
                    var firstData = this.first_index_list.$model;
                    var firstLength = firstData.length;
                    var new_arr = [];
                    for (var i = 0; i < firstLength; i++) {
                        firstData[i]['cs_proweight'] = 0.0;
                        firstData[i]['req_id'] ='';
                        for (var j = 0; j < data_length; j++) {
                            if (firstData[i].id == data_x[j].cs_par_indexid) {
                                firstData[i]['cs_proweight'] = data_x[j].cs_proweight;
                                firstData[i]['req_id'] = data_x[j].id;
                            }
                        }

                    }
                    new_arr = firstData;

                    var self = this;
                    var dataList = new_arr;
                    var dataLength = dataList.length;
                    var object_list = {};
                    var count = 0;
                    /*获取每个一级指标下对应的二级指标*/
                    dataList.forEach(function(p1){
                        var xself = self;
                        var request_data = {
                            "index_parentid":p1.id,
                            "index_rank":2,
                            on_request_complete: function(cmd, status, data, is_suc, msg) {
                                count += 1;
                                // 对应每科的成绩情况
                                if (is_suc) {
                                    object_list[request_data.index_parentid] = data.data;
                                    if( count == dataLength ){
                                        // xself.second_index_list = object_list;
                                        for(var i = 0; i < dataLength;i++){
                                            if(object_list[dataList[i].id]){
                                                dataList[i]['second_list'] = object_list[dataList[i].id]
                                            }
                                        }
                                        vm.dataInfo = dataList;
                                        console.log(vm.dataInfo);
                                        vm.request_info(vm.dataInfo);
                                    }

                                } else {
                                    toastr.error(msg);
                                }

                            }
                        };
                        ajax_post(api_get_index, request_data, request_data);
                    });


                },
                find_count:[],
                //获取二级指标权重
                request_info:function (data) {
                    var self = this;
                    var object_list_x = {};
                    var count_x = 0;
                    var dataList = data;
                    var dataLength = dataList.length;
                    var arr = [];
                    dataList.forEach(function(p1){
                        var xself = self;
                        var request_data = {
                            "cs_grade_id":xself.grade_id,
                            "cs_par_indexid":p1.id,
                            "cs_rank":2,
                            on_request_complete: function(cmd, status, data, is_suc, msg) {
                                count_x += 1;
                                if (is_suc) {
                                    object_list_x[request_data.cs_par_indexid] = data.data;
                                    if( count_x == dataLength ){
                                        arr = object_list_x;
                                        //
                                        var obj = {
                                            cs_par_indexid:"",
                                            cs_par_index:"",
                                            cs_sec_index:"",
                                            cs_sec_indexid:"",
                                            id:"",
                                            cs_proweight:""
                                        };

                                        for(key in arr){
                                            if(arr[key].list.length == 0){
                                                for(var i = 0;i < dataLength;i++){
                                                    if(dataList[i].id == key){
                                                        for(var j = 0;j < dataList[i].second_list.length; j++){
                                                            obj.cs_par_indexid = dataList[i].second_list[j].index_parentid;
                                                            obj.cs_par_index =  dataList[i].second_list[j].index_parent;
                                                            obj.cs_sec_index = dataList[i].second_list[j].index_name;
                                                            /*============*/
                                                            obj.cs_sec_indexid = dataList[i].second_list[j].id;
                                                            /*============*/
                                                            obj.id = '';
                                                            obj.cs_proweight = '';
                                                            arr[key].list.push(obj);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        vm.find_count = arr;
                                    }

                                } else {
                                    toastr.error(msg);
                                }

                            }
                        };
                        ajax_post(api_get_info, request_data, request_data);
                    });

                },
                grade_check:function (x) {
                    var grade_value= x.value;
                    this.grade_id = Number(grade_value.split('|')[0]);
                    var  remark = grade_value.split('|')[1];
                    if(remark == '七年级'){
                        this.index_grade = 7
                    }else if(remark == '八年级'){
                        this.index_grade = 8
                    }else{
                        this.index_grade = 9
                    }
                    this.grade_name = x.name;
                    this.dataInfo = [];
                    this.find_count = [];
                    ajax_post(api_get_index,{index_rank:1},this);
                },
                json:function (x) {
                    return JSON.stringify(x);
                },
                //鼠标失去焦点
                blur:function ($idx,value) {
                    var sum = 0;
                    for(var i = 0; i < value.length; i++){
                        sum += Number(value[i].cs_proweight);
                    }
                    this.dataInfo[$idx].cs_proweight = sum;
                    return this.dataInfo[$idx].cs_proweight;
                },
                //提交
                save_data:function () {
                    var dataList = this.find_count.$model;
                    var create_arr = [];
                    for(key in dataList){
                        var every_list = dataList[key].list;
                        var every_length = every_list.length;
                        for(j = 0; j < every_length; j++){
                            if($.trim(every_list[j].cs_proweight) == '' || $.trim(every_list[j].cs_proweight) < 0){
                                toastr.warning('必须填写完才能提交哦');
                                return
                            }
                            else{
                                var obj = {
                                    cjrxm:vm.login_name,//创建人姓名
                                    ejzbid:"",//二级指标id
                                    ejzbnr:"",//二级指标名称
                                    fk_cjryh_id:vm.login_guid + '',//创建人id
                                    fk_nj_id:vm.grade_id + '',//年级id
                                    fk_xx_id:vm.fk_school_id + '',//学校id
                                    id:"",//权重id
                                    njmc:vm.grade_name,//年级名称
                                    xmqz:"",//指标权重
                                    xxmc:vm.fk_school_name,//学校名称
                                    yjzbid:"",//一级指标id
                                    yjzbnr:"",//一级指标名称
                                    zbdj:""//指标等级

                                };
                                obj.yjzbid = every_list[j].cs_par_indexid + '';
                                obj.yjzbnr = every_list[j].cs_par_index;
                                obj.ejzbid = every_list[j].cs_sec_indexid + '';
                                obj.ejzbnr = every_list[j].cs_sec_index;
                                obj.zbdj = '2';
                                obj.id = every_list[j].id + '';
                                obj.xmqz = every_list[j].cs_proweight + '';
                                create_arr.push(obj);
                            }
                        }
                    }
                    var first = this.dataInfo.$model;
                    var firstLength = first.length;

                    //一级指标
                    var first_num = 0;
                    for(var i = 0; i < firstLength; i++){
                        first_num += Number(first[i].cs_proweight);
                    }
                    if(first_num != 100){
                        toastr.warning('评价维度之和必须为100%才能提交')
                    }else{
                        for(var i = 0; i < firstLength; i++){
                            var obj = {
                                cjrxm:this.login_name,//创建人姓名
                                ejzbid:"",//二级指标id
                                ejzbnr:"",//二级指标名称
                                fk_cjryh_id:this.login_guid + '',//创建人id
                                fk_nj_id:this.grade_id + '',//年级id
                                fk_xx_id:this.fk_school_id + '',//学校id
                                id:"",//权重id
                                njmc:this.grade_name,//年级名称
                                xmqz:"",//指标权重
                                xxmc:this.fk_school_name,//学校名称
                                yjzbid:"",//一级指标id
                                yjzbnr:"",//一级指标名称
                                zbdj:""//指标等级

                            };
                            obj.yjzbid = first[i].id + '';
                            obj.yjzbnr = first[i].index_name;
                            obj.zbdj = '1';
                            obj.id = first[i].req_id + '';
                            obj.xmqz = first[i].cs_proweight + '';
                            create_arr.push(obj);
                        }
                        ajax_post(api_add_count_analysis,create_arr,this);
                    }

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