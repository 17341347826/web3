/**
 * Created by Administrator on 2018/1/8.
 */
define([C.CLF("avalon.js"),'jquery',
        C.Co2("weixin_pj", "give_trial", "css!"),
        C.Co2("weixin_pj", "give_trial", "html!"),"jquery-weui"
    ],
    function (avalon,jquery, css, html,weui) {
        var avalon_define = function () {
            // 添加申请试用
            var apply_use=api.growth+"applyuse_addapplyuse";
            var vm = avalon.define({
                $id: "give_trial",
                //提示信息
                msg:'',
                // 试用产品提示语
                pro_type:true,
                //注册数据
                signData:{
                    tryout:'',
                    company:'',
                    username:'',
                    phone:'',
                    useraddress:'',
                    usermessage:'',
                    mail:''
                },
                //试用产品
                product_ary:[
                    {id:'1',product:'综合素质评价'},
                    {id:'2',product:'学业质量测评'},
                    {id:'3',product:'阅卷云平台'},
                    {id:'4',product:'走班选课排课'},
                    {id:'5',product:'错题本'}
                ],
                //各个判断状态
                a1:false,
                a2:false,
                a3:false,
                a4:false,
                //试用产品
                a5:false,
                //删除
                // option_move:function(){
                //     this.pro_type=false;
                // },
                //试用产品
                product_check:function(){
                    var self=this;
                    var _txt = $("#trial-product").val();
                    console.log('试用产品：'+_txt);
                    if ($.trim(_txt)!='') {
                        self.a5=true;
                        //    颜色改变
                        $('#give_trial .weui-select').css('color','#000');
                    } else {
                        self.a5=false;
                        // self.msg = "请选择试用产品";
                        //    颜色改变
                         $('#give_trial .weui-select').css('color','#CFCFCF');
                    }
                },
                //公司
                factory_check:function(){
                    var self=this;
                    var _txt = $("#trial-factory").val();
                    console.log('公司：'+_txt);
                    if ($.trim(_txt)!='') {
                        self.a1=true;
                    } else {
                        self.a1=false;
                        self.msg = "请输入单位名称";
                    }
                },
                //姓名判断
                name_check:function(){
                    var self=this;
                    var reg=/^[\u4e00-\u9fa5]+$/;
                    var _txt = $("#trial-name").val();
                    console.log('姓名：'+_txt);
                    if (reg.test(_txt) && $.trim(_txt)!='') {
                        self.a2=true;
                    } else {
                        self.a2=false;
                        self.msg = "姓名请输入中文";
                    }
                },
                //电话
                phone_check:function(){
                    var self=this;
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#trial-tel").val();
                    console.log('电话：'+_txt);
                    if (reg.test(_txt) && $.trim(_txt)!='') {
                        self.a3=true;
                    } else {
                        self.a3=false;
                        self.msg="请输入正确的电话号码";
                    }
                },
                //邮箱
                mail_check:function(){
                    var self=this;
                    var reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                    var _txt = $("#trial-mail").val();
                    console.log('邮箱：'+_txt);
                    if (reg.test(_txt) && $.trim(_txt)!='') {
                        self.a4=true;
                    } else {
                        self.a4=false;
                        self.msg="请输入正确的邮箱地址";
                    }
                },
                // 提交
                sign:function(){
                    var self=this;
                    if (self.a1==true && self.a2==true && self.a3==true && self.a5==true) {
                        if($("#trial-mail").val()!=''){
                            if( self.a4==true){
                                self.msg='';
                                ajax_post(apply_use,self.signData.$model, self,1);
                            }else{
                                self.msg="请输入正确的邮箱地址";
                            }
                        }else if($("#trial-mail").val()==''){
                            self.msg='';
                            ajax_post(apply_use,self.signData.$model, self,1);
                        }
                    } else {
                        if(self.a1==false){
                            self.msg = "请输入单位名称";
                        }else if(self.a2==false){
                            self.msg = "姓名请输入中文";
                        }else if(self.a3==false){
                            self.msg = "请输入正确的电话号码";
                        }else if(self.a5==false){
                            self.msg = "请选择试用产品";
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case apply_use:
                            if(status == 200){
                                this.complete_apply(data);
                            }else{
                                this.msg="申请试用失败";
                            }
                            break;
                    }
                },
                //申请试用成功
                complete_apply:function(){
                    var self=this;
                    $.alert({
                        title: '',
                        text: '提交成功，我们将会在1个工作日内与您联系，请保持电话畅通。',
                        onOK: function () {
                            //点击确认
                            self.signData.tryout='';
                            self.signData.company='';
                            self.signData.username='';
                            self.signData.phone='';
                            self.signData.useraddress='';
                            self.signData.usermessage='';
                            self.signData.mail='';
                            $('#give_trial .weui-select').css('color','#CFCFCF');
                            self.a1=false;
                            self.a2=false;
                            self.a3=false;
                            self.a4=false;
                            self.a5=false;
                        }
                    });
                }
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });