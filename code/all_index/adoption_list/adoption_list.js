/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("all_index", "share_adopt_first_examine/share_adopt_first_examine", "css!"),
        C.Co("all_index", "adoption_list/adoption_list", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),C.CM('three_menu_module'),
        C.CMF("formatUtil.js")],
    function ($, avalon, css, html, layer, table, data_center,three_menu_module, formatUtil) {
        //获取指标数据
        var share_index_api = api.api + "Indexmaintain/indexmaintain_findadoptreviewlist";
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "adoption_list",
                url: share_index_api,
                index_state:"",
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: true,
                extend: {
                    index_adoption_personid:"",
                    index_state: 3,//1:待审核2:审核通过3:审核不通过
                    index_rank: '',//指标等级(1:一级2:二级3:三级)
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
                        from: '<input type="button" ms-attr="{disabled:el.index_state!=3}" :class="[(el.index_state==3 ? \'tab-details-btn\':\'tab-details-btn-disabled\'),\'tab-btn\']" ms-on-click="@oncbopt({current:$idx,type:1})" title="查看">'

                        // from: "<a :if='el.index_state==3' class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"
                    }],
                //页面跳转
                firstIndex: function() {
                    window.location = '#share_frist_index_list';
                },
                secondIndex: function() {
                    window.location = '#share_second_index_list';
                },
                thirdIndex: function() {
                    window.location = '#share_third_index_list';
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var user_data=JSON.parse(data.data['user']);
                        self.extend.index_adoption_personid = user_data.guid;
                    });
                    self.is_init = true;
                },
                init: function () {
                    this.cb();
                },
                cbopt: function (params) {
                    if (params.type == 1) {
                        var self = this;
                        var index_review_reason=params.data.index_review_reason;
                        layer.open({
                            title: "审核未通过原因",
                            content: '<div><p>'+index_review_reason+'</p></div>',
                            yes: function (index, layero) {
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