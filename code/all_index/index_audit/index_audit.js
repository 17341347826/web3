/**
 * Created by uptang on 2017/6/22.
 */
define([
        C.CLF('avalon.js'),
        C.Co("all_index", "index_audit/index_audit", "css!"),
        C.Co("all_index", "index_audit/index_audit", "html!"),
        C.CM("table"),
        "layer",
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon, css, html, tab, layer, data_center,three_menu_module) {
        //指标列表
        var index_list = api.api + "Indexmaintain/indexmaintain_findIndexmaintainBean";
        //修改状态
        var update_index_state = api.api + "Indexmaintain/indexmaintain_updateIndexState";

        var avalon_define = function (pmx) {
            var table = avalon.define({
                $id: "table",
                url:index_list,
                is_init: false,
                data:{
                    offset: 0,
                    rows: 15
                },
                remark:'',
                //请求参数
                extend:{
                    index_name:"",//指标名称
                    index_rank:1,//指标等级(1:一级指标 2:二级指标 3:评价内容)
                    index_state:1,//审核状态(1:待审核 2:审核通过 3:审核未通过)
                    index_type:"",//指标类型(1:行政指标 2:特色指标 3:共享指标)
                    index_workid:"",
                    __hash__:"",
                },
                remember:false,
                theadTh:[
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "指标名称",
                        type: "text_desc_width",
                        from: "index_name"
                    },
                    {
                        title: "指标属性",
                        type: "cover_text",
                        from: "index_type",
                        dict: {
                            1: '行政指标',
                            2: '特色指标',
                            3: '共享指标'
                        }
                    },
                    {
                        title: "审核状态",
                        type: "cover_text",
                        from: "index_state",
                        dict: {
                            1: '待审核',
                            2: '审核通过',
                            3: '审核未通过'
                        }
                    },
                    {
                        title: "作者",
                        type: "text_desc_width",
                        from: "index_author"
                    },
                    {
                        title: "创建单位",
                        type: "text_desc_width",
                        from: "index_work"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "index_time"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"
                    }
                ],
                //一级指标列表
                firstIndex: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "指标名称",
                        type: "text_desc_width",
                        from: "index_name"
                    },
                    {
                        title: "指标属性",
                        type: "cover_text",
                        from: "index_type",
                        dict: {
                            1: '行政指标',
                            2: '特色指标',
                            3: '共享指标'
                        }
                    },
                    {
                        title: "审核状态",
                        type: "cover_text",
                        from: "index_state",
                        dict: {
                            1: '待审核',
                            2: '审核通过',
                            3: '审核未通过'
                        }
                    },
                    {
                        title: "作者",
                        type: "text_desc_width",
                        from: "index_author"
                    },
                    {
                        title: "创建单位",
                        type: "text_desc_width",
                        from: "index_work"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "index_time"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"
                    }
                ],
                //二级指标列表
                secondIndex: [
                    {
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "一级指标",
                    type: "text",
                    from: "index_parent"
                }, {
                    title: "二级指标",
                    type: "text_desc_width",
                    from: "index_name"
                }, {
                    title: "考察要点",
                    type: "text_desc_width",
                    from: "index_review"
                }, {
                    title: "指标属性",
                    type: "cover_text",
                    from: "index_type",
                    dict: {
                        1: '行政指标',
                        2: '特色指标',
                        3: '共享指标'
                    }
                }, {
                    title: "审核状态",
                    type: "cover_text",
                    from: "index_state",
                    dict: {
                        1: '待审核',
                        2: '审核通过',
                        3: '审核未通过'
                    }
                }, {
                    title: "作者",
                    type: "text_desc_width",
                    from: "index_author"
                }, {
                    title: "创建单位",
                    type: "text_desc_width",
                    from: "index_work"
                }, {
                    title: "创建时间",
                    type: "text",
                    from: "index_time"
                }, {
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"
                }],
                //评价内容---评价内容
                thirdIndex: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "一级指标",
                        type: "text",
                        from: "index_parent"
                    },
                    {
                        title: "二级指标",
                        type: "text_desc_width",
                        from: "index_secondary"
                    },
                    {
                        title: "考察项标题",
                        type: "text_desc_width",
                        from: "index_name"
                    },
                    {
                        title: "指标属性",
                        type: "cover_text",
                        from: "index_type",
                        dict: {
                            1: '行政指标',
                            2: '特色指标',
                            3: '共享指标'
                        }
                    },
                    {
                        title: "审核状态",
                        type: "cover_text",
                        from: "index_state",
                        dict: {
                            0: '草稿',
                            1: '待审核',
                            2: '审核通过',
                            3: '不通过'
                        }
                    },
                    {
                        title: "创建人",
                        type: "text_desc_width",
                        from: "index_founder"
                    },
                    {
                        title: "创建单位",
                        type: "text_desc_width",
                        from: "index_work"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "index_time"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                        "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>"+
                        "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"
                    }
                ],
                cbopt:function(params) {//oncbopt回调函数
                    if(params.type==1){//审核
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '该指标是否通过审核？',
                            // closeBtn: 2, //不显示关闭按钮
                            shadeClose: true,//点击空白关闭弹框
                            btn: ['通过', '不通过'],
                            yes: function (index, layero) {
                                layer.close(index);
                                if(params.data.index_state==1){
                                    //index_use_state 通过1 不通过2
                                    ajax_post(update_index_state,{"id":params.data.id,"index_state":2,index_use_state:1},self);
                                }else{
                                    toastr.error('当前记录已审核');
                                }
                            },
                            btn2: function (index, layero) {
                                layer.prompt({title: '请输入审核意见', formType: 2}, function(text, index){
                                    layer.close(index);
                                    if(params.data.index_state==1) {
                                        ajax_post(update_index_state,{"id": params.data.id,"index_notpass":text,"index_state":3,index_use_state:2},self);
                                    }else{
                                        toastr.warning("当前记录已审核。");
                                    }
                                });
                            },cancel: function(){
                                //右上角关闭回调
                            }
                        });
                    }else if(params.type==2){
                        window.location = "#index_details?id="+params.data.id+"&index_type="+params.data.index_type;

                    }
                },
                on_request_complete:function(url,status, data, is_suc, msg){
                    if(is_suc){
                        switch(url){
                            case update_index_state:
                                this.complete_update_index_state(data);
                                break
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                complete_update_index_state:function (data) {
                    this.extend.__hash__=new Date();
                },
                //一级指标列表
                firstIndexList: function () {
                    this.remark = 0;
                    this.extend.index_rank = 1;
                    this.theadTh = this.firstIndex;
                    this.is_init = true;
                    this.extend.__hash__=new Date();
                },
                //二级指标列表
                secondIndexList: function () {
                    this.remark = 1;
                    this.extend.index_rank = 2;
                    this.theadTh = this.secondIndex;
                    this.extend.__hash__=new Date();
                },
                //评价内容---评价内容列表
                thirdIndexList: function () {
                    this.remark = 2;
                    this.extend.index_rank = 3;
                    this.theadTh = this.thirdIndex;
                    this.extend.__hash__=new Date();
                },
                cb:function () {
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        var level = data.data.highest_level;
                        //index_type指标类型(1:行政指标 2:特色指标 3:共享指标)
                        if(level != 2){
                            table.extend.index_type = 2;
                        }else{
                            table.extend.index_type = 1;
                        }
                        table.extend.index_workid = dataList.fk_school_id;
                        if(pmx.remark){
                            table.thirdIndexList();
                        }else{
                            table.firstIndexList();
                        }



                    });

                }
            });
            table.cb();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });