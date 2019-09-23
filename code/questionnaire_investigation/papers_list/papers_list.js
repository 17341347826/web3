define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('questionnaire_investigation', 'papers_list/papers_list', 'html!'),
        C.Co('questionnaire_investigation', 'papers_list/papers_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html,css, data_center, table,three_menu_module) {
        //查询列表
        var api_find_papers_list = api.api + "ques_naire/page_questionnaire";
        //删除卷子
        var delete_ques_api = api.api+"ques_naire/delete_questionnaire";
        //停止发布
        var stop_release_api = api.api+"ques_naire/stop_questionnaire";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                // 数据接口
                url: api_find_papers_list,
                is_init: false,
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    ques_name__icontains: '',
                    __hash__: ""
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "问卷题目",
                        type: "text",
                        from: "ques_name"
                    },
                    {
                        title: "创建人",
                        type: "text",
                        from: "founder"
                    },
                    {
                        title: "创建单位",
                        type: "text",
                        from: "company_name"
                    },

                    {
                        title: "发布状态",
                        type: "cover_text",
                        from: "data_status",
                        dict: {
                            0: '未发布',
                            1: '已发布'
                        }
                    },
                    {
                        title: "状态",
                        type: "cover_text",
                        from: "status",
                        dict: {
                            0: '启用状态',
                            1: '禁用状态',
                            2: '删除状态'
                        }
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>" +
                        "<a class='tab-btn tab-edit-btn' ms-attr='{disabled:el.data_status==1}' ms-on-click='@oncbopt({current:$idx, type:2})' title='修改试卷'></a>"+
                        "<a class='tab-btn tab-other-edit-btn' ms-attr='{disabled:el.data_status==1}' ms-on-click='@oncbopt({current:$idx, type:3})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-attr='{disabled:el.data_status==1}' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>" +
                        "<a class='tab-btn tab-issue-btn' ms-if='el.data_status==0' ms-on-click='@oncbopt({current:$idx, type:5})' title='发布'></a>" +
                        "<a class='tab-btn tab-issue-btn-disabled' ms-if='el.data_status==1' ms-on-click='@oncbopt({current:$idx, type:6})' title='停止发布'></a>"
                    }
                ],

                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.user_type = data.data.user_type;
                    });
                    self.is_init = true;
                },

                cbopt: function (params) {
                    var self = this;
                    if (params.type == 1) {
                        window.location.href = "#check_roll?id="+params.data._id;
                    }else if(params.type == 2){
                        window.location.href = "#add_papers?id="+params.data._id;
                    }else if(params.type == 3){
                        data_center.remove_key('question_obj');
                        window.location.href = "#add_topic?id="+params.data._id;
                    } else if(params.type == 4){
                        layer.confirm('是否确认删除？', {
                            btn: ['删除','取消'] //按钮
                        }, function(){
                            ajax_post(delete_ques_api,{_id:params.data._id},self);

                        }, function(){

                        });

                    }else if(params.type==5){
                        if (params.data.questio_list.length === 0) {
                            toastr.error('题目为空, 无法发布！');
                            return;
                        }
                        window.location.href = "#release_paper?id="+params.data._id;
                    }
                    else if(params.type==6){
                        layer.confirm('是否确认停止发布？', {
                            btn: ['停止','取消'] //按钮
                        }, function(){
                            self.stop_release(params.data._id);
                        }, function(){

                        });
                    }
                },
                //停止发布
                stop_release:function (id) {
                    ajax_post(stop_release_api,{_id:id},this);
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case delete_ques_api:
                                toastr.success('成功删除！');
                                this.extend.__hash__ = new Date();
                                break;
                            case stop_release_api:
                                this.extend.__hash__ = new Date();
                                break;

                        }
                    } else {
                        toastr.error(msg);
                    }
                    layer.closeAll();
                },

            });
            table.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                this.cb();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: {startDate: "startTime", endDate: "endTime", type: 1}
        }
    });