/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('character_evaluation_result/result_generation', 'result_list/result_list', 'html!'),
        C.Co('character_evaluation_result/result_generation', 'result_list/result_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        C.CM("table")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly, table) {
        var avalon_define = function () {
            //查询数据
            var api_get_data = api.api + "score/page_feature_project";
            //计算
            var calculation_api = api.api +"score/feature_statis";
            var vm = avalon.define({
                $id: "result_list",
                url: api_get_data,
                remember:false,
                extend: {
                    fk_grade_id: '',
                    fk_semester_id: '',
                    node: '',
                    project_name__icontains: '',
                    __hash__: ""
                },
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init:false,

                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "项目名称",
                    type: "text",
                    from: "project_name"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "类型",
                    type: "html",
                    from: "<span>特色</span>"
                }, {
                    title: "起始时间",
                    type: "text",
                    from: "start_date_time"
                }, {
                    title: "截止时间",
                    type: "text",
                    from: "end_date_time"
                }, {
                    title: "状态",
                    type: "cover_text",
                    from: "node",
                    //1:省2:市3:区县4:校
                    dict: {
                        0: '待统计',
                        1: '统计中',
                        2: '统计完成'
                    }
                }, {
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='修改'></a>" +
                    "<a class='tab-btn calculation-btn' ms-if='el.node==0' ms-on-click='@oncbopt({current:$idx, type:2})' title='计算'></a>"+
                    "<a class='tab-btn calculation-btn-disabled' ms-if='el.node==2' title='已统计'></a>"
                }
                ],

                cbopt: function (params) {
                    if(params.type==1){
                        data_center.set_key('update_result',JSON.stringify(params.data))
                        window.location = "#create_result_generation?update_result="+params.data._id;
                    }
                    if(params.type==2){
                        var grade_no = '';
                        var grade_list = cloud.grade_list();
                        var grade_id = params.data.fk_grade_id;
                        for(var i=0;i<grade_list.length;i++){
                            if(grade_list[i].grade_id==grade_id){
                                grade_no = grade_list[i].remark;
                                break;
                            }
                        }
                        var obj = {
                            '七年级':7,
                            '八年级':8,
                            '九年级':9
                        }
                        toastr.info('统计中')
                        ajax_post(calculation_api,{
                            project_id:params.data._id,
                            grade_no:obj[grade_no]
                        },this)
                    }
                },
                grade_list:[],
                semester_list:[],
                current_semester:'',
                semester_defalut:'',
                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    });
                    this.semester_list = cloud.semester_all_list();
                    this.semester_list.unshift({
                        name:'全部',
                        value:''
                    });
                    this.semester_defalut = this.semester_list[0].name;
                    this.extend.fk_semester_id = this.semester_list[0].value.toString();
                    cloud.semester_current({}, function (url, ars, data) {
                       vm.current_semester = data;
                       for(var i=0;i<vm.semester_list.length;i++){
                           var id = vm.semester_list[i].value.split('|')[0];
                           if(id==vm.current_semester.id){
                               vm.semester_defalut = vm.current_semester.semester_name;
                               vm.extend.fk_semester_id = vm.current_semester.id.toString();
                               vm.is_init = true;
                               vm.extend.__hash__ = new Date();
                               break;
                           }
                       }
                    });
                },
                //切换年级
                grade_sel: function (el,index) {
                    this.extend.fk_grade_id = el.value;
                },
                //切换学年学期
                semester_sel:function (el,index) {
                    this.extend.fk_semester_id = el.value.split('|')[0];
                },
                go_create:function () {
                  window.location = '#create_result_generation'
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case calculation_api:
                                this.extend.__hash__ = new Date();
                                toastr.info('计算完成！');
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
