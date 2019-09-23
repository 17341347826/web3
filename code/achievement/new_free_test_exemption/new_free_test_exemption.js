/**
 * Created by Administrator on 2018/3/16.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("achievement","new_free_test_exemption/new_free_test_exemption", "html!"),
        C.Co("achievement","new_free_test_exemption/new_free_test_exemption", "css!"),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CMF("table/table.js"),
        C.CM('three_menu_module')
    ],
    function($, avalon, layer, html,css, x, data_center, tab,three_menu_module) {
        //查询体质测评列表免测数据
        var api_list_check_exempt=api.api+"score/list_new_health";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "new_free_test_exemption",
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
                    flag_exempt:3,//标志免考 0 正常 1 免考(审核通过) 2待审核免考 3 审核不同
                    guid:'',
                    semester_id:'',
                    code__icontains:'',//学籍号
                    name__icontains:'',//姓名
                    __hash__:'',
                },
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
                        title: "状态",
                        type: "cover_text",
                        from: "flag_exempt",
                        dict: {
                            2: '待审核',
                            3: '未通过'
                        }
                    },
                    {
                        title: "未通过原因",
                        type: "text_more",
                        from: "not_pass"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"
                    }
                ],
                cd: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        self.is_init=true;
                        self.extend.fk_school_id=tUserData.fk_school_id.toString();
                    });
                },
                // remember:false,
                cbopt: function(params) {
                    console.log(params);
                    if(params.type==1){//查看
                        sessionStorage.setItem('stu_free_info',JSON.stringify(params.data));
                        window.location='#test_free_audit_detail';
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
            });
            table.cd();
            return table;
        };
        return {
            view:html,
            define:avalon_define
        }
    });