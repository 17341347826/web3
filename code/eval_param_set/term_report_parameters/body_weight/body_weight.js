define(['jquery',C.CLF('avalon.js'), "layer",
        C.Co('eval_param_set', 'term_report_parameters/body_weight/body_weight','html!'),
        C.Co('eval_param_set', 'term_report_parameters/body_weight/body_weight','css!'),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM("three_menu_module"), C.CM("select_assembly")
    ],
    function($,avalon,layer,html,css,x,data_center,three_menu_module,select_assembly) {
        var api_get_info = api.api + "Indexmaintain/indexmaintain_findByCountAnalysisInfo";
        //保存
        var api_add_count_analysis = api.api + "Indexmaintain/save_or_update_count_analysis_info";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "body_weight",
                grade_list:[],
                grade_id:"",
                head_value:"",
                grade_name:"",
                fk_school_id:"",
                fk_school_name:'',
                login_name:"",
                login_guid:"",
                dataInfo:[],
                req_id:"",
                cb:function () {
                    var s_grade = cloud.grade_list();
                    this.grade_list = any_2_select(s_grade, {name: "grade_name", value: ["grade_id","remark"]});
                    this.head_value = this.grade_list[0].name;
                    var grade_value = this.grade_list[0].value;
                    this.grade_id = Number(grade_value.split('|')[0]);
                    this.grade_name = this.grade_list[0].name;
                    this.fk_school_id = cloud.user_school_id();
                    this.fk_school_name = cloud.user_school();
                    var user = cloud.user_user();
                    this.login_name = user.name;
                    this.login_guid = cloud.user_guid();
                    ajax_post(api_get_info,{cs_content:1,cs_grade_id:this.grade_id,cs_rank:4},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
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
                complete_get_info: function (data) {
                    var list = data.data.list;
                    var count = list[0].cs_procount;
                    this.req_id = list[0].id;
                    this.dataInfo = count.split(",");
                },
                grade_check:function (x) {
                    var grade_value= x.value;
                    this.grade_id = Number(grade_value.split('|')[0]);
                    this.grade_name = x.name;
                    this.dataInfo = [];
                    this.find_count = [];
                    ajax_post(api_get_info,{cs_content:1,cs_grade_id:this.grade_id,cs_rank:4},this);
                },
                //提交
                save_data:function () {
                    var dataList = this.dataInfo.$model;
                    var dataLength = dataList.length;
                    console.log(dataList);
                    var sum = 0;
                    for(var i = 0; i < dataLength; i++){
                        sum += Number(dataList[i]);
                    }
                    if(sum != 100){
                        toastr.warning('学生自评,学生互评,教师评价权重之和必须为100');
                        return;
                    }else{
                        var str = dataList.join(",");
                        var create_arr = [];
                        var obj = {
                            cjrxm:vm.login_name,//创建人姓名
                            // ejzbid:"",//二级指标id
                            // ejzbnr:"",//二级指标名称
                            fk_cjryh_id:vm.login_guid + '',//创建人id
                            fk_nj_id:vm.grade_id + '',//年级id
                            fk_xx_id:vm.fk_school_id + '',//学校id
                            id:vm.req_id+"",//权重id
                            njmc:vm.grade_name,//年级名称
                            xmqz:'100',//指标权重
                            xxmc:vm.fk_school_name,//学校名称
                            // yjzbid:"",//一级指标id
                            // yjzbnr:"",//一级指标名称
                            zbdj:"3",//指标等级
                            mzpjxqz:str,
                            tjnrlx:"1"

                        };
                        create_arr.push(obj);
                        console.log(create_arr);
                    }

                    ajax_post(api_add_count_analysis,create_arr,this);
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