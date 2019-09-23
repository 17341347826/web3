/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('grading_audit', 'grading_audit_list/grading_audit_list', 'html!'),
        C.Co('grading_audit', 'grading_audit_list/grading_audit_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        C.CM("table")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly, table) {
        var avalon_define = function () {
            //查询数据
            var api_get_data = api.api + "score/page_statis_rule";

            var vm = avalon.define({
                $id: "grading_audit_list",
                url: api_get_data,
                remember: false,
                extend: {
                    fk_grade_id: '',
                    fk_school_id: '',
                    lv_node: '',
                    __hash__: ""
                },
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: true,

                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "学校",
                    type: "text",
                    from: "unit_name"
                }, {
                    title: "上传状态",
                    type: "html",
                    from: "<span ms-if='el.lv_partition.length==0'>未上传</span>" +
                    "<span ms-if='el.lv_partition.length!=0'>已上传</span>"
                }, {
                    title: "审核状态",
                    type: "cover_text",
                    from: "lv_node",
                    //1:省2:市3:区县4:校
                    dict: {
                        1: '待审核',
                        2: '已审核',
                        3: '未通过'
                    }
                }, {
                    title: "操作",
                    type: "html",
                    from: "<a class='tab-btn tab-audit-btn' ms-if='el.lv_node!=2' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>" +
                    "<a class='tab-btn tab-audit-btn-disabled' ms-if='el.lv_node==2' ms-on-click='@oncbopt({current:$idx, type:1})' title='已审核'></a>"+
                    "<a class='tab-btn tab-detail-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>" +
                    "<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='修改'></a>"
                }
                ],

                cbopt: function (params) {
                    var obj = {}
                    obj.fk_grade_id = params.data.fk_grade_id;
                    obj.fk_unit_id = params.data.fk_unit_id;

                    for(var i=0;i<this.grade_list.length;i++){
                        if(this.grade_list[i].value==obj.fk_grade_id){
                            obj.grade_name = this.grade_list[i].name;
                            break;
                        }
                    }
                    obj.school_name = params.data.unit_name;
                    if (params.type == 1) {
                        obj.way = 'audit'
                    }
                    if (params.type == 2) {
                        obj.way = 'check'
                    }
                    if (params.type == 3) {
                        obj.way = 'update'
                        obj._id = params.data._id;
                    }
                    data_center.set_key('grading_audit_audit', JSON.stringify(obj))
                    window.location = "#grading_audit_audit";
                },
                grade_list: [],
                school_list: [],
                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.grade_list.unshift({
                        name: '全部',
                        value: ''
                    });
                    this.school_list = cloud.sel_school_list();
                    this.school_list.unshift({
                        name: '全部',
                        value: ''
                    })
                },
                //切换年级
                grade_sel: function (el, index) {
                    this.extend.fk_grade_id = el.value;
                },
                //切换学年学期
                school_sel: function (el, index) {
                    this.extend.fk_school_id = el.value.split('|')[0];
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
