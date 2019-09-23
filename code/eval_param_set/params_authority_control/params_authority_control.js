/**
 * Created by Administrator on 2018/7/14.
 */
define(['jquery',C.CLF('avalon.js'), "layer",
        C.Co("eval_param_set","params_authority_control/params_authority_control",'css!'),
        C.Co("eval_param_set","params_authority_control/params_authority_control",'html!'),
        C.CMF("router.js"), C.CMF("data_center.js")
    ],
    function($,avalon,layer,css,html,x,data_center) {
        //获取年级
        var api_get_grade= api.user+"grade/findGrades.action";
        //市管理员参数权限控制列表请求接口-查询统计项目控制参数
        //市管理员参数权限控制列表请求接口-查询统计项目控制参数
        var api_get_project = api.api+'score/get_project_control';
        //市管理员参数权限控制編輯-保存或修改统计项目控制参数
        var api_edit_project = api.api+'score/edit_project_control';
        var avalon_define = function() {
            //过滤器
            avalon.filters.identSure = function(num){
                //num:统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                if(num == 1){
                    return '省'
                }else if(num == 2){
                    return '市'
                }else if(num == 3){
                    return '区'
                }else if(num == 4){
                    return '校'
                }
            };
            var vm = avalon.define({
                $id: "params_authority_control",
                id:"",
                //市
                city:'',
                //单选方式:0-三年期间评价累计得分的平均分;1-自定义三年期间各评价累计得分权重
                radio_type:1,
                //年级
                demo_grade:'',
                //年级集合
                grade_list:[],
                grade_info:'',
                //列表数据
                pro_list:'',
                //保存
                req_data:{
                    city:'',
                    fk_grade_id:'',
                    //创建者单位	number	@mock=2
                    fk_unit_id:'',
                    //统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校	number
                    unit_lv:'',
                },
                cb: function() {
                    var self=this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        self.city = dataList.city;
                        self.req_data.city = dataList.city;
                        //年级
                        ajax_post(api_get_grade,{status:1},self);
                    });
                },
                //年级切换
                gradeChange:function(){
                    this.req_data.fk_grade_id = this.grade_info;
                    //    请求那个身份控制的参数设置
                    ajax_post(api_get_project,{city:this.city,fk_grade_id:this.grade_info},this);
                },
                //单选切换
                radio_click:function(e){
                    this.req_data.fk_unit_id = this.pro_list.fk_unit_id;
                },
                //保存
                btn_save:function(data){
                    if(this.req_data.unit_lv == ''){
                        toastr.warning('请确认参数权限控制方式');
                    }else{
                        //保存控制方式
                        ajax_post(api_edit_project,this.req_data.$model,this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级集合
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                        //        身份参数设置列表
                            case api_get_project:
                                this.complete_project_control(data);
                                break;
                        //保存控制方式
                            case api_edit_project:
                                this.complete_edit_project(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_get_grade:function(data){
                    this.grade_list = data.data;
                    this.grade_info = data.data[0].id;
                    this.req_data.fk_grade_id = this.grade_info;
                //    请求那个身份控制的参数设置
                    ajax_post(api_get_project,{city:this.city,fk_grade_id:this.grade_info},this);
                },
            //    列表
                complete_project_control:function(data){
                    this.pro_list = '';
                    if(JSON.stringify(data.data) != "{}"){
                        this.pro_list = data.data;
                        console.log('1');
                    }
                },
            //    保存控制方式
                complete_edit_project:function(data){
                    toastr.success('设置成功');
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