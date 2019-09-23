/**
 * Created by Administrator on 2018/3/15.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("achievement","test_free_audit/test_free_audit","css!"),
        C.Co("achievement","test_free_audit/test_free_audit","html!"),
        C.CMF("data_center.js"),C.CMF("table/table.js")
    ],
    function($, avalon, layer, css, html,data_center, tab) {
        //查询体质测评列表免测数据
        var api_list_check_exempt=api.api+"score/list_new_health";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "ss",
                // 数据接口
                url: api_list_check_exempt,
                is_init:false,
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    current_process:'',//当前进度（已提交 ，已修改，公示中，已归档）
                    fk_class_id:'',
                    fk_grade_id:'',
                    fk_school_id:'',
                    flag_exempt:2,//标志免考 0 正常 1 免考(审核通过) 2待审核免考 3 审核不同
                    guid:'',
                    semester_id:'',
                    code__icontains:'',//学籍号
                    name__icontains:'',//姓名
                    __hash__:'',
                },
                //返回数据
                dataList:'',
                // 表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "code"
                    },
                    {
                        title: "年级",
                        type: "text",
                        from: "grade_name"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"                    }
                ],
                cd: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        self.is_init=true;
                        self.extend.fk_school_id=tUserData.fk_school_id.toString();
                    });
                },

                cbopt: function(params) {
                    console.log(params);
                    if(params.type==1){//审核
                        sessionStorage.setItem('stu_free_info',JSON.stringify(params.data));
                        window.location.href = '#free_test_audit_detail';
                    }
                }

            });
            table.cd();
            return table;
        };
        return {
            view:html,
            define:avalon_define
        }
    });