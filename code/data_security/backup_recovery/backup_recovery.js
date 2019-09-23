/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('data_security', 'backup_recovery/backup_recovery', 'html!'),
        C.Co('data_security', 'backup_recovery/backup_recovery', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module,table) {
        //手动备份列表
        var api_get_list_hand = api.api + "base/backup/get";
        //自动备份列表
        var api_get_list_auto = api.api + "base/backup_set/get_set";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "backup_recovery",
                is_init:false,
                dataList:[],
                data: {
                    offset:0,
                    rows:15
                },
                url:'',
                // 请求参数
                extend: {
                    __hash__: ""
                },
                type_list:[
                    {name:"手动备份",value:1},
                    {name:"自动备份",value:2}
                ],
                type_sel:1,
                params:{
                    login_level:"",
                    guid:""
                },
                theadTh:[],
                autoHead: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "备份描述",
                        type: "text",
                        from: "bk_desc"
                    },
                    {
                        title: "备份时间	",
                        type: "text",
                        from: "bk_time"
                    },
                    {
                        title: "类型",
                        type: "cover_text",
                        from: "bk_type",
                        dict: {
                            0: '完全备份',
                            1: '增量备份'
                        }
                    },
                    {
                        title: "本地备份",
                        type: "cover_text",
                        from: "local",
                        dict: {
                            0: '失败',
                            1: '成功'
                        }
                    },
                    {
                        title: "异地备份",
                        type: "cover_text",
                        from: "remote",
                        dict: {
                            0: '失败',
                            1: '成功'
                        }
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                        "<a class='tab-btn tab-edit-btn' title='恢复' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"+
                        "<a class='tab-btn tab-download' title='下载' ms-on-click='@oncbopt({current:$idx, type:2})'></a>"
                    }
                ],
                init:function () {
                    var login_level = cloud.user_level();
                    this.url = api_get_list_hand;
                    this.theadTh = this.autoHead;
                    this.is_init = true;
                },
                cbopt: function(params) {
                    // 当前数据的id
                    var id = params.data.id;
                    var grade_id = params.data.fk_nj_id;
                    var grade_name = params.data.njmc;
                    var bt = params.data.bt;

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_list_auto:
                                this.dataList = data.data.list;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                choose:function (num) {
                    if(num == 1){//自动备份设置
                        window.location = "#automatic_backup";
                    }else{//手动备份
                        window.location = "#manual_backup";
                    }
                },
                type_change:function (el) {
                    this.type_sel = el.value;
                    if(el.value == 1){//手动备份
                        this.theadTh = this.autoHead;
                        this.url = api_get_list_hand;
                        this.is_init = true;
                        this.extend.__hash__=new Date();
                    }else{
                        ajax_post(api_get_list_auto,{},this);
                    }
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
