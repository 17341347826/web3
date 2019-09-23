/**
 * Created by Administrator on 2018/6/21.
 */
define([C.CLF('avalon.js'),
        C.Co("eval_param_set", "e_task_control/type_set_add/type_set_add", "css!"),
        C.Co("eval_param_set", "e_task_control/type_set_add/type_set_add", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"),
        'layer',
        'jquery'
    ],
    function (avalon, growthPublic, html, x, data_center, layer, $) {
        //修改查询
        var api_get_detail = api.growth + "get_detail";
        //保存
        var api_save_type = api.growth + "save_type";
        //指标联动
        var index_linkage = api.api + "Indexmaintain/indexmaintain_findByIndexName";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "type_set_add",
                data: {
                    id: "",
                    type_name: "",
                    type_remark: "",
                    rule: "",
                    type: "1",
                    index_id:"",
                    xz:""
                },
                index_req:{
                    //指标id
                    id:'',
                    //父集指标id（如存在父级指标就传入父级指标id,当查询指标是三级指标是 这就是一级指标id）
                    index_parentid:'',
                    //指标等级:1:一级指标 2:二级指标 3:三级指标（必要条件）
                    index_rank:'',
                },
                //一级指标列表
                first_indexs : [],
                //二级指标列表
                second_indexs : [],
                cd: function () {
                    this.data.id = pmx.type_id;
                    var self = this;
                    data_center.uin(function (data) {
                        var data = JSON.parse(data.data["user"]);
                        self.index_req.index_rank=1;
                        //指标联动--一级指标
                        ajax_post(index_linkage,self.index_req.$model, self);
                    });
                },
                //一级指标切换
                first_change:function(){
                    this.index_req.index_rank=2;
                    //指标联动--一级指标
                    ajax_post(index_linkage,this.index_req.$model, this);
                },
                //取消
                cancel_click:function(){
                  history.go(-1);
                },
                //保存
                save_type: function (e) { /*提交*/
                    this.data.type_remark = this.data.type_name;
                    this.data.rule = this.data.type_name;
                    if ($.trim(this.data.type) == '') {
                        toastr.warning('业务类型不能为空');
                    } else if ($.trim(this.data.type_name) == '') {
                        toastr.warning('类型名称不能为空');
                    }else if ($.trim(this.data.index_id) == '') {
                        toastr.warning('指标不能为空')
                    } else {
                        var self = this;
                        layer.confirm('确认提交？', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            ajax_post(api_save_type, self.data, self);
                            layer.closeAll();
                        });

                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_detail:
                                this.complete_getdetail(data);
                                break;
                            case api_save_type:
                                this.complete_save_type(data);
                                break;
                            case index_linkage:
                                if(this.index_req.index_rank==1){
                                    this.first_indexs=data.data;
                                    if (this.data.id) {//修改
                                        ajax_post(api_get_detail, this.data, this);
                                    }
                                }else if(this.index_req.index_rank==2){
                                    this.second_indexs = data.data;
                                }else{
                                    this.index_req.id='';
                                    this.index_req.index_rank = 2;
                                    this.index_req.index_parentid = Number(data.data[0].index_parentid);
                                    //指标联动--二级指标
                                    ajax_post(index_linkage,this.index_req.$model, this);
                                }
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //获取信息
                complete_getdetail: function (data) {
                    this.data = data.data;
                    this.index_req.id=this.data.index_id;
                    this.index_req.index_rank='';
                    //根据单个二级指标id查询出信息
                    ajax_post(index_linkage,{id:this.index_req.id}, this);
                },
                complete_save_type: function (data) {
                    // window.location = '#real_a_type_set?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                    // '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    window.location = '#real_a_type_set_scheme';
                },
            });
            vm.$watch('onReady', function () {
                this.cd()
            })
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })