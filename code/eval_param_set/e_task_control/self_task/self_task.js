/**
 * Created by Administrator on 2018/5/29.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'e_task_control/self_task/self_task', 'html!'),
        C.Co('eval_param_set', 'e_task_control/self_task/self_task', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly,table,three_menu_module) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //获取列表数据
        var get_list = api.api + "Indexmaintain/find_county_evaluatepro_list";
        //删除列表数据
        var delete_msg_api = api.api + "Indexmaintain/delete_county_evaluatepro";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "self_task",
                url: get_list,
                //年级
                grade_list: [],
                grade_info:'',
                //table
                remember:false,
                //开关
                is_init: false,
                only_hash: false,
                data: {
                    offset: 0,
                    rows:10,
                },
                // 请求参数
                extend: {
                    pro_end_time: '',
                    //应用年级	string
                    pro_grade: '',
                    //应用年级id	number
                    pro_gradeid: '',
                    pro_name: '',
                    //项目级别--1:省 2:市 3:区县 4:校
                    pro_rank: 2,
                    pro_start_time: '',
                    //审核状态	number	1:待审核 2:审核通过 3:审核不通过  所有为空
                    pro_state: '',
                    //评价主体--1:学生自评 2:学生互评 3:教师评价 4:家长评价
                    pro_type:1,
                    //单位id(必填)	number
                    pro_workid: '',
                    __hash__: ""
                },
                // 表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },{
                        title: "任务名称",
                        type: "text",
                        from: "pro_name"
                    },{
                        title: "年级",
                        type: "text",
                        from: "pro_grade"
                    },{
                        title: "开始时间",
                        type: "text",
                        from:"pro_start_time"
                    },{
                        title: "结束时间",
                        type: "text",
                        from:"pro_end_time"
                    },{
                        title: "创建人",
                        type: "text",
                        from:"pro_work"
                    },{
                        title: "创建时间",
                        type: "text",
                        from:"pro_time"
                    },{
                        title: "操作",
                        type: "html",
                        from:
                            "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"+
                            "<a class='tab-btn tab-setting-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>"+
                            "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='删除'></a>"
                    }
                ],
                cbopt: function(params) {
                    console.log(params);
                    if(params.type==1){//查看
                        window.location = "#create_task?project_id=" + params.data.id;
                    }else if(params.type==2){//编辑
                        window.location = "#evaluation_project_create?project_id=" + params.data.id;
                    }else if(params.type==3){//删除
                        var id=params.data.id;
                        ajax_post(delete_msg_api, {id: id}, this);
                    }
                },
                //创建任务
                create_btn:function(){
                    // window.location = "#create_task?pro_rank=" + this.extend.pro_rank;
                    window.location = "#student_add_self_evaluation";
                },
                //年级改变
                gradeChange:function(){
                    // console.log(this.is_init);
                    // console.log(this.only_hash);
                    // this.only_hash = false;
                    // this.extend.__hash__ = new Date();
                    this.extend.pro_grade=this.grade_info.split('|')[1];
                    this.extend.pro_gradeid=this.grade_info.split('|')[0];
                    this.extend.__hash__ = new Date();
                },
                init:function(){
                    // this.is_init=true;
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if (userType == 0) {
                            self.is_init = true;
                            self.only_hash = true;
                            self.extend.pro_workid = Number(tUserData.fk_school_id);
                            // self.extend.pro_rank = parseInt(tUserData.department_level);
                            // self.only_hash = false;
                            // self.extend.__hash__ = new Date();
                            //年级
                            ajax_post(api_get_grade, {status: "1"}, self);
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_grade:
                                if (data.data) {
                                    this.grade_list = data.data;
                                }
                                break;
                            case delete_msg_api:
                                this.extend.__hash__ = new Date();
                                toastr.success('删除成功');
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                go_href:function () {
                    window.location = "#item_programme_management?url_type=1";
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
