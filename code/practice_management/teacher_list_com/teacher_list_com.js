/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('practice_management', 'teacher_list_com/teacher_list_com', 'html!'),
        C.Co('practice_management', 'teacher_list_com/teacher_list_com', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module,table) {
        //获取年级班级
        var api_get_grade =  api.api + "base/class/school_class.action";
        //指导教师列表
        var api_teacher_list = api.api + "GrowthRecordBag/page_tutor_dp";
        //点评学生
        var api_te_stu = api.api + "GrowthRecordBag/tutor_dp";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "teacher_list_com",
                url:api_teacher_list,
                is_init:true,
                remember:false,
                data: {
                    offset:0,
                    rows:15
                },
                // 请求参数
                extend: {
                    fk_bj_id: '',
                    fk_hd_id:"",
                    fk_nj_id:"",
                    __hash__: ""
                },
                dataInfo:[],
                grade_list:[],
                class_list:[],
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "年级",
                        type: "text",
                        from: "njmc"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "bj_mc"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "xsmc"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "xjh"
                    },
                    {
                        title: "活动表现评价",
                        type: "text_desc_width",
                        from: "dp"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                        "<a class='tab-btn tab-objection-btn' title='评价' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"

                    }
                ],
                init:function () {
                    var value = sessionStorage.getItem("te_pro");
                    this.dataInfo = JSON.parse(value);
                    this.extend.fk_hd_id = this.dataInfo.id;
                    var school_id = cloud.user_school_id();
                    ajax_post(api_get_grade,{school_id:school_id},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            case api_te_stu:
                                this.complete_te_stu(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_grade:function (data) {
                    this.grade_list = data.data;
                    this.is_init = true;
                },
                gradeChange:function () {
                    var grade_id = this.extend.fk_nj_id;
                    if(grade_id != ''){
                        var list = this.grade_list;
                        var length = list.length;
                        for(var i = 0; i < length; i++ ){
                            if(grade_id == list[i].grade_id){
                                this.class_list = list[i].class_list;
                            }
                        }
                    }
                },
                classChange:function () {
                    if(this.extend.fk_bj_id != ''){
                        this.extend.__hash__ = new Date();
                    }
                },
                cbopt: function(params) {
                    // 当前数据的id
                    var id = params.data.id;
                    var name = params.data.xsmc;
                    layer.prompt(
                        {title: '请对' + name + "进行活动表现评价",
                            formType: 2,
                            yes: function(index, layero){
                                var val = layero.find(".layui-layer-input").val();
                                if($.trim(val)==''){
                                    toastr.warning('活动表现评价不能为空');
                                }else{
                                    var dp = val;
                                    ajax_post(api_te_stu,{dp:dp,id:id},vm)
                                }
                            }

                        }
                    );

                },
                complete_te_stu:function (data) {
                    toastr.success("评价成功");
                    layer.closeAll();
                    this.extend.__hash__ = new Date();
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
