/**
 * Created by Administrator on 2018/7/3.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("personal_center","parentInformation/parentInformation",'css!'),
        C.Co("personal_center","parentInformation/parentInformation",'html!'),
        C.CMF("router.js"),
        "layer",C.CMF("data_center.js"), C.CM('page_title')
    ],
    function (avalon,jquery,css,html,router,layer,data_center,page_title){
        //    指定学生关联的家长列表
        var api_mapping_parent=api.PCPlayer+"parent/stu_mapping_parent";
        //学生确认不是家长关联
        var api_sure_not=api.PCPlayer+"parent/stu_sure_not";
        //学生确认家长关联关系
        var api_stu_sure=api.PCPlayer+"parent/stu_sure";
        //重置密码
        var  api_resetpwd=api.PCPlayer+"baseUser/resetpwd.action";
        //申请取消关联该家长
        var api_apply_cancel=api.PCPlayer+"parent/stu_apply_cancel";
        var avalon_define=function(){
            var vm=avalon.define({
                $id: "parentInformation",
                //    登录用户token
                token:'',
                //指定学生关联的家长列表数据
                mapping_parent:{
                    // //家长个数
                    // count:'',
                    // //家长信息集合
                    // list:[{
                    //     //取消关联审核不通过原因
                    //     check_msg:'',
                    //     //家长用户guid
                    //     guid:'',
                    //     //家长id
                    //     id:'',
                    //     //家长身份证号
                    //     parent_code:'',
                    //     parent_emaill:'',
                    //     parent_name:'',
                    //     //家长账号用户名
                    //     parent_num:'',
                    //     parent_phone:'',
                    //     remark:'',
                    //     // 1-已确认；2-确认不是家长；3-待确认；4-申请取消关联；5：已取消关联；6:取消关联不通过
                    //     status:'',
                    //     map_status:''
                    // }]
                },
                //指定学生关联的家长列表请求
                get_mappingParent:function(){
                    ajax_post(api_mapping_parent,{},this);
                },
                //学生信息
                cds: function () {
                    var self = this;
                    // data_center.uin(function (data) {
                    //     self.token=data.token;
                    //     self.get_mappingParent()
                    // });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_mapping_parent:
                                this.complete_mapping_parent(data);
                                break;
                            case api_sure_not:
                                this.complete_sure_not(data);
                                break;
                            case api_stu_sure:
                                this.complete_stu_sure(data);
                                break;
                            //    重置密码
                            case api_resetpwd:
                                this.complete_apply_cancel(data);
                                break;
                            //    申请取消
                            case api_apply_cancel:
                                this.complete_apply_cancel(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //指定学生关联的家长列表
                complete_mapping_parent:function(data){
                    this.mapping_parent=data.data;
                },
                //确认不是家长关联关系
                complete_sure_not:function(data){
                    ajax_post(api_mapping_parent,{},this);
                },
                //确认家长关联关系
                complete_stu_sure:function(data){
                    ajax_post(api_mapping_parent,{},this);
                },
                //申请取消关联 重置密码
                complete_apply_cancel:function(data){
                    ajax_post(api_mapping_parent,{},this);
                },

                // 不是窗口显示
                parentNo_check:function(id){
                    var self = this;
                    layer.confirm('确认该用户不是你的家长吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(){
                        toastr.success('解除成功', {icon: 1});
                        layer.closeAll();
                        // layer.close(id);
                        ajax_post(api_sure_not,{parent_id:id}, self);
                    }, function(){
                    });
                },
                //是窗口显示
                parentYes_check:function(ind){
                    var self=this;
                    layer.confirm('确认该用户是你的家长吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(){
                        toastr.success('关联成功', {icon: 1});
                        // layer.close(ind);
                        layer.closeAll();
                        ajax_post(api_stu_sure,{guid:self.mapping_parent.list[ind].guid,parent_id:self.mapping_parent.list[ind].id}, self);
                    }, function(){
                    });
                },
                //重置密码
                resetPwd_check:function(ind){
                    var self = this;
                    layer.confirm('确定要重置家长密码吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(){
                        toastr.success('密码重置成功', {icon: 1});
                        // layer.close(ind);
                        layer.closeAll();
                        // layer.msg('密码重置成功');
                        ajax_post(api_resetpwd,{id:self.mapping_parent.list[ind].guid}, self);
                    }, function(){
                    });
                },
                //申请取消关联的显示隐藏
                //    申请取消关联该家长
                applyCla_check:function(ind){
                    var self = this;
                    layer.prompt({title: '请说明取消原因', formType: 2}, function(text, index){
                        layer.close(index);
                        if($.trim(text) != ""){
                            // sessionStorage.setItem('text',text);
                            ajax_post(api_apply_cancel,{cancel_msg:text,parent_id:self.mapping_parent.list[ind].id}, self);
                        }
                    });
                },
                //确定
                parentYes_yes:function(ind){
                    ajax_post(api_stu_sure,{guid:this.mapping_parent.list[ind].guid,parent_id:this.mapping_parent.list[ind].id}, this);
                }
            })
            vm.$watch('onReady', function() {
                // this.cds()
                this.get_mappingParent();
                // var s=sessionStorage.getItem('check_msg');
            })
        }
        return {
            view: html,
            define: avalon_define
        }
    })