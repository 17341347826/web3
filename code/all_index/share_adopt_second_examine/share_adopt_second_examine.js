/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("all_index", "share_adopt_first_examine/share_adopt_first_examine", "css!"),
        C.Co("all_index", "share_adopt_second_examine/share_adopt_second_examine", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js"), C.CM('three_menu_module')],
    function ($, avalon, css, html, layer, table, data_center, formatUtil,three_menu_module) {
        //获取指标数据
        var share_index_api = api.api + "Indexmaintain/indexmaintain_findadoptreviewlist";
        //审核接口
        var share_check_api = api.api + "Indexmaintain/indexmaintain_reviewadoptindex";
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "share_adopt_second_examine",
                url: share_index_api,
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: true,
                extend: {
                    index_state: 1,//1:待审核2:审核通过3:审核不通过
                    index_rank: 2,//指标等级(1:一级2:二级3:三级)
                    __hash__: ""
                },
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "指标名称",
                    type: "text",
                    from: "index_name"
                },{
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
                },
                    {
                        title: "作者",
                        type: "text_desc_width",
                        from: "index_author"
                    }, {
                        title: "使用频率",
                        type: "text",
                        from: "index_used"
                    },
                    // {
                    //
                    //     title: "指标等级",
                    //     type: "text",
                    //     from: "index_rank"
                    // },
                    {
                        title: "创建单位",
                        type: "text_desc_width",
                        from: "index_work"
                    }, {
                        title: "创建时间",
                        type: "text",
                        from: "index_time"
                    },

                    {
                        title: "操作",
                        type: "html",
                        from: '<input type="button" ms-attr="{disabled:el.index_state!=1}" :class="[(el.index_state==1 ? \'tab-audit-btn\':\'tab-audit-btn-disabled\'),\'tab-btn\']" ms-on-click="@oncbopt({current:$idx,type:2})" title="审核">'
                    }],
                init: function () {
                    this.is_init = true;
                },
                cbopt: function (params) {
                    if (params.type == 2) {
                        var self = this;
                        layer.open({
                            title: "提示",
                            content: '审核是否通过？',
                            btn: ['通过', '不通过', '取消'],
                            yes: function (index, layero) {
                                ajax_post(share_check_api,{
                                    id:params.data.id,
                                    index_review_reason:'',
                                    index_state:2
                                },self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.prompt({title: '审核意见', formType: 2}, function (pass, index) {
                                    if (!pass) {
                                        toastr.warning('审核意见不能为空');
                                    } else {
                                        ajax_post(share_check_api, {
                                            id:params.data.id,
                                            index_review_reason:pass,
                                            index_state:3
                                        }, self);
                                        layer.close(index);
                                    }
                                });
                                layer.close(index);
                            },
                            btn3: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case share_check_api:
                                toastr.success('审核成功');
                                this.extend.__hash__ = new Date();
                                break;

                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.$watch("extend.index_state", function () {
                vm.extend.__hash__=new Date();
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });