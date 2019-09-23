/**
 * Created by Administrator on 2018/3/5.
 */
define([
        "jquery",C.CLF('avalon.js'),'layer',
        C.Co('user','school_club_number_list/school_club_number_list','css!'),
        C.Co('user','school_club_number_list/school_club_number_list','html!'),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module'), 'jquery_print'
    ],
    function($,avalon,layer,css,html, x, data_center,three_menu_module,jquery_print){
        //获取区县集合
        var api_get_disc=api.PCPlayer+'school/arealist.action';
        //获取区县下全部学校年级集合
        var api_disc_grade=api.PCPlayer+'school/sub_school_grade_list';
        //社团统计
        var api_get_info = api.growth+"communityManagement_communityStatistics";
        //社团导出
        var api_club_export = api.api+'GrowthRecordBag/export_communitys_count';
        var avalon_define=function(){
            var vm=avalon.define({
                $id:'school_club_number_list',
                //身份
                highest_level:'',
                //区县
                district:'',
                disc_list:[],
                //学校
                school:'',
                school_list:[],
                //数据：两个装
                evaluation_data:[],
                evaluation_two:[],
                //区县筛选下数据
                evaluation_district:[],
                //区县改变
                disc_change:function(){
                    var self=this;
                    self.school_list = [];
                    self.school='';
                    self.evaluation_data=self.evaluation_two;
                    if(self.district == ''){
                        self.evaluation_data=self.evaluation_two;
                    }else {
                        var id=Number(self.district.split('|')[0]);
                        var dis=self.district.split('|')[1];
                        var choose_ary=[];
                        var com_ary=[];
                        choose_ary=self.evaluation_data;
                        for(var i=0;i<choose_ary.length;i++){
                            if(dis==choose_ary[i].district){
                                com_ary.push(choose_ary[i]);
                            }
                        }
                        self.evaluation_data=com_ary;
                        self.evaluation_district=self.evaluation_data;
                        //学校
                        ajax_post(api_disc_grade,{department_id:id,grade_id:0},self);
                    }
                },
                //学校改变
                school_change:function(){
                    var self=this;
                    if(self.highest_level==2){//市
                        self.evaluation_data=self.evaluation_district;
                        if(self.school == ""){
                            self.evaluation_data=self.evaluation_district;
                        }else{
                            var school_name=self.school;
                            var choose_ary=[];
                            var com_ary=[];
                            choose_ary=self.evaluation_data;
                            for(var i=0;i<choose_ary.length;i++){
                                if(school_name==choose_ary[i].schoolname){
                                    com_ary.push(choose_ary[i]);
                                }
                            }
                            self.evaluation_data=com_ary;
                        }
                    }else if(self.highest_level==3){//区县
                        self.evaluation_data=self.evaluation_two;
                        if(self.school == ""){
                            self.evaluation_data=self.evaluation_two;
                        }else{
                            var school_name=self.school;
                            var choose_ary=[];
                            var com_ary=[];
                            choose_ary=self.evaluation_data;
                            for(var i=0;i<choose_ary.length;i++){
                                if(school_name==choose_ary[i].schoolname){
                                    com_ary.push(choose_ary[i]);
                                }
                            }
                            self.evaluation_data=com_ary;
                        }
                    }
                },
                cd:function(){
                    var self=this;
                    data_center.uin(function(data){
                        var cArr = [];
                        var highest_level = data.data.highest_level;
                        self.highest_level = highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if(highest_level == 2){//市级用户
                            //市
                            var city=tUserData.city;
                            //区县
                            ajax_post(api_get_disc,{city:city},self);
                        }else if(highest_level == 3){//区县级用户
                            var department_id =tUserData.fk_school_id;
                            //学校
                            ajax_post(api_disc_grade,{department_id:department_id,grade_id:0},self);
                        }else if(highest_level == 4){//校级用户
                            //获取社团个数string	2：按市级。3：按区县。4：按学校
                            ajax_post(api_get_info,{departmentleveltype:'4'},self);
                        }

                    })
                },
                //导出
                club_export:function(){
                    var url = api_club_export + '?token=' + sessionStorage.getItem('token') + '&departmentleveltype=' + 4;
                    window.open(url);
                },
                //打印
                club_printing:function(){
                    // bdhtml=window.document.body.innerHTML;//获取当前页的html代码
                    // sprnstr="<!--startprint-->";//开始打印标识字符串有17个字符
                    // eprnstr="<!--endprint-->";//结束打印标识字符串
                    // prnhtml=bdhtml.substr(bdhtml.indexOf(sprnstr)+17);//从开始打印标识之后的内容
                    // prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//截取开始标识和结束标识之间的内容
                    // window.document.body.innerHTML=prnhtml;//把需要打印的指定内容赋给body.innerHTML
                    // window.print();//调用浏览器的打印功能打印指定区域
                    // window.document.body.innerHTML=bdhtml;//重新给页面内容赋值；
                    // window.location.reload();
                    $('#print_content').print({
                        globalStyles:true
                    });
                },
                detail:function(e){
                    window.location='#leader_club_detail?&id='+e + '&departmentleveltype=' + 4;
                },
                on_request_complete:function(cmd, status, data, is_suc, msg){
                    if(is_suc){
                        switch(cmd){
                            //区县
                            case api_get_disc:
                                this.complete_get_disc(data);
                                break;
                            //学校
                            case api_disc_grade:
                                this.complete_get_school(data);
                                break;
                            //    进度
                            case api_get_info:
                                this.complete_get_count(data);
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                //区县
                complete_get_disc:function(data){
                    this.disc_list=data.data.list;
                    //获取社团个数string	2：按市级。3：按区县。4：按学校
                    ajax_post(api_get_info,{departmentleveltype:'4'},this);
                },
                //学校去重
                complete_get_school:function(data){
                    var list=data.data.list;
                    var schoolId=[];
                    var schoolName=[];
                    var sub={};
                    for(var i=0;i<list.length;i++){
                        schoolId[i]=list[i].school_id;
                        schoolName[i]=list[i].schoolname;
                    }
                    var school_id=$.unique(schoolId);
                    var school_name=$.unique(schoolName);
                    for(var i=0;i<school_id.length;i++){
                        sub.school_id=school_id[i];
                        sub.schoolname=school_name[i];
                        this.school_list.push(sub);
                    }
                    if(this.highest_level==3){
                        //获取社团个数string	2：按市级。3：按区县。4：按学校
                        ajax_post(api_get_info,{departmentleveltype:'4'},this);
                    }
                },
                //数据
                complete_get_count:function(data){
                    this.evaluation_data=data.data.list;
                    this.evaluation_two=data.data.list;
                },
                go_href:function (num) {
                    if(num == 1){
                        window.location = "#city_club_number_list";
                    }else if(num == 2){
                        window.location = "#district_club_number_list";
                    }else{
                        window.location = "#school_club_number_list";
                    }
                }
            });
            vm.$watch('onReady',function(){
                this.cd();
            });
            return vm;
        }
        return{
            view:html,
            define:avalon_define
        }
    }
)