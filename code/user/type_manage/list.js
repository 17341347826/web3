define([
        C.CLF('avalon.js'),
        'layer',
        C.Co("user","type_manage/type_manage","css!"),
        C.Co('user','type_manage/list','html!'),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM("table"),C.CM('page_title')
    ],
    function( avalon, layer,css, html, x, data_center,tab,page_title) {
        var api_page_list=api.growth+"page_list_type";
        var api_delete_type=api.growth+"delete_type";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "table",
                // 数据接口
                url: api_page_list,
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    type_name: "",
                    type: "",
                    __hash__:""
                },
                is_init:true,
                // 表头名称
                theadTh: [{
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "类型名称",
                        type: "text",
                        from: "type_name"
                    },
                    {
                        title: "描述",
                        type: "min_text",
                        from: "type_remark",
                        min_width:"white-space"
                    },
                    {
                        title: "业务类型",
                        type: "cover_text",
                        from: "type",
                        dict: {
                            1: '作品作业',
                            2: '品德发展',
                            3: '成就奖励',
                            4: '实践活动',
                            5: '艺术素养',
                            6: '研究型学习',
                            7: '身心健康',
                        }
                    },
                    {
                        title: "一级指标",
                        type: "min_text",
                        from: "first_index_name",
                        min_width:"white-space"
                    },
                    {
                        title: "二级指标",
                        type: "min_text",
                        from: "second_index_name",
                        min_width:"white-space"
                    },
                    {
                        title: "详情",
                        type: "html",
                        from: "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='编辑'></a>" +
                            "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='删除'></a>"
                    }
                ],
                cbopt: function(params) {
                    // 当前数据的id
                    var id = params.data.id;
                   switch(params.type){
                        case 1:
                            window.location = "#input_type?type_id="+id;
                            break;
                        case 2:
                            var self = this;
                            layer.confirm('确认删除？', {
                                btn: ['确定', '取消'] //按钮
                            }, function() {
                                ajax_post(api_delete_type,{id:id},self);
                                layer.closeAll();
                            });
                            break;

                   }
                },
                //添加
                add: function() {
                    window.location = "#input_type";
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_delete_type:
                                this.complete_api_delete_type(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_api_delete_type:function(data){
                    this.extend.__hash__=new Date();
                }
            });
            
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });