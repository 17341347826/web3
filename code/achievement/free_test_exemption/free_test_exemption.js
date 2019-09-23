/**
 * Created by Administrator on 2018/3/16.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("achievement","free_test_exemption/free_test_exemption", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CMF("table/table.js"),
        C.CM('three_menu_module')
    ],
    function($, avalon, layer, html, x, data_center, tab,three_menu_module) {
        //审核免测列表
        var api_list_check_exempt=api.api+"score/health_list_check_exempt";
        //删除免测列表
        var api_check_exempt = api.api + "score/health_check_exempt";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "free_test_exemption",
                // 数据接口
                url: api_list_check_exempt,
                is_init:false,
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    //学校id	string
                    fk_school_id:'',
                    //免考标记	number	2待审核免考 3审核不通过免考,不传查所有
                    flag_exempt:'',
                    __hash__:'',
                },
                //返回数据
                dataList:'',
                //删除
                check_data:{
                    //体质测评成就的guid	string
                    _id:'',
                    //免考标记	number	1免考（审核通过）3审核不通过（回到正常学生状态） 0-删除
                    flag_exempt:0,
                    //不通过意见	string
                    not_pass:'',
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
                        type: "text",
                        from: "not_pass"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='删除'></a>"+
                        "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>"
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
                    // 当前数据的id
                    var _id = params.data._id;
                    //列表免考标记
                    var flagExempt=params.data.flag_exempt;
                    var self=this;
                    if(params.type==1){//删除
                        self.check_data._id=_id;
                        if(flagExempt==3){
                            self.check_data.not_pass=params.data.not_pass;
                        }
                        layer.confirm('确定要删除免考申请吗？', {
                            btn: ['确定','取消'] //按钮
                        },function(){
                            ajax_post(api_check_exempt,self.check_data.$model,self);
                            toastr.success('删除成功', {icon: 1});
                        });
                    }else if(params.type==2){//查看
                        window.location='#physique_check_detail?_id='+_id;
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //审核免测列表
                            case api_list_check_exempt:
                                this.complete_check_exempt(data);
                                break;
                            //删除
                            case api_check_exempt:
                                this.complete_delete(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_check_exempt:function(data){
                    this.dataList=data.data.list;
                },
                complete_delete:function(data){
                    this.extend.__hash__ = new Date();
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