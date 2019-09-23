/**
 * Created by Administrator on 2018/3/19.
 */
define(['jquery',C.CLF('avalon.js'), "layer",
        C.Co("eval_param_set","graduation_report_parameters/weight_set/weight_set",'css!'),
        C.Co("eval_param_set","graduation_report_parameters/weight_set/weight_set",'html!'),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($,avalon,layer,css,html,x,data_center,page_title) {
        //获取年级(市级 区县)
        var api_get_grade= api.user+"grade/findGrades.action";
        //查询当前可操作的学年学期
        var api_get_semester=api.user+'semester/grade_opt_semester';
        //查询权重设置
        var api_query_weight=api.api+'Indexmaintain/bybgWeightSet_queryWeight';
        //添加/设置权重
        var api_save_weight=api.api+'Indexmaintain/bybgWeightSet_saveWeightSet';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "weight-set",
                id:"",
                //单选方式:0-三年期间评价累计得分的平均分;1-自定义三年期间各评价累计得分权重
                radio_type:1,
                //年级
                demo_grade:'',
                //年级集合
                grade_list:[],
                //学年学期
                semester_info:'',
                //学年学期集合
                semester_list:[],
                //权重数据集合
                weight_data:[],
                //保存/修改权重
                req_data:{
                    //权重设置方式	number
                    generation_method:'',
                    //年级id	number
                    grade_id:'',
                    //年级名字	string
                    grade_name:'',
                    //权重明细string "[{'semeter_id':'1','semeter_name':'2015-2016学年（上）','weight':'25'}]"
                    weight_detail:'',
                },
                cb: function() {
                    var self=this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        var school_id=dataList.fk_school_id;
                        //获取市管理员年级集合
                        ajax_post(api_get_grade,{status:1},self);
                    });
                },
                //年级切换
                grade_change:function(){
                    var grade=this.demo_grade;
                    var id=Number(grade.split('|')[0]);
                    ajax_post(api_get_semester,{grade_id:id},this);
                },
                //单选切换
                radio_click:function(e){
                    if(e==1){//三年期间评价累计得分的平均分
                        this.radio_type=0;
                    }else if(e==2){//自定义三年期间各评价累计得分权重
                        this.radio_type=1;
                    }
                },
                //保存
                btn_save:function(data){
                    // console.log(this.req_data.generation_method);
                    // console.log(this.weight_data);
                    var weight=this.weight_data;
                    //单选方式
                    var type=this.radio_type;
                    //权重之和
                    var score=0;
                    this.req_data.grade_id=Number(this.demo_grade.split('|')[0]);
                    this.req_data.grade_name=this.demo_grade.split('|')[1];
                    var detail=[];
                    //赋值
                    if(type==0){
                        this.req_data.weight_detail='';
                        score=0;
                    }else if(type==1){
                        for(var i=0;i<weight.length;i++){
                            score=score+Number(weight[i].weight);
                            detail[i]={'semeter_id':weight[i].id.toString(),'semeter_name':weight[i].semester_name,'weight':weight[i].weight};
                        }
                        this.req_data.weight_detail=JSON.stringify(detail);
                    }
                    if(this.semester_list.length!=6){
                        toastr.warning('请确认三年六个学期是否已全部生成学期评价结果');
                    }else if(this.req_data.generation_method==''){
                        toastr.warning('请选择毕业综合素质评价生成方式');
                    }else if(this.req_data.generation_method==2 && score!=100){
                        toastr.warning('自定义三年期间各评价累计得分权重之和必须为100');
                    }else{
                        ajax_post(api_save_weight,this.req_data.$model,this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级集合
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            // 学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //    查询权重设置
                            case api_query_weight:
                                this.complete_query_weight(data);
                                break;
                            //添加权重设置
                            case api_save_weight:
                                this.complete_save_weight(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_get_grade:function(data){
                    this.grade_list=data.data.reverse();
                    this.demo_grade=this.grade_list[0].id+'|'+this.grade_list[0].grade_name;
                    var id=Number(this.demo_grade.split('|')[0]);
                    ajax_post(api_get_semester,{grade_id:id},this);
                },
                //学年学期
                complete_get_semester:function(data){
                    this.semester_list=data.data.list;
                    var id=Number(this.demo_grade.split('|')[0]);
                    if(this.semester_list.length==6){
                        //查询权重设置
                        ajax_post(api_query_weight,{grade_id:id},this);
                    }else{
                        var semester=data.data.list;
                        for(var i=0;i<semester.length;i++){
                            semester[i].weight='';
                        }
                        this.weight_data=semester;
                        toastr.info('请确认三年六个学期是否已全部生成学期评价结果')
                    }
                },
                //权重查询
                complete_query_weight:function(data){
                    var semester=this.semester_list;
                    if(data.data!=null && data.data!=[]){
                        var ary=data.data;
                        var g_method=ary.generationMethod;
                        this.req_data.generation_method=g_method;
                        if(g_method==1){
                            for(var i=0;i<semester.length;i++){
                                semester[i].weight='';
                            }
                        }else if(g_method==2){
                            var weight=JSON.parse(ary.weightDetail);
                            for(var i=0;i<semester.length;i++){
                                for(var j=0;j<weight.length;j++){
                                    if(semester[i].semester_name==weight[j].semeter_name){
                                        semester[i].weight=weight[j].weight;
                                    }
                                }
                            }
                        }
                    }else{
                        for(var i=0;i<semester.length;i++){
                            semester[i].weight='';
                        }
                    }
                    console.log(semester);
                    this.weight_data=semester;
                },
                //保存权重
                complete_save_weight:function(data){
                    toastr.success('设置成功');
                    var id=Number(this.demo_grade.split('|')[0]);
                    //查询权重设置
                    ajax_post(api_query_weight,{grade_id:id},this);
                },
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