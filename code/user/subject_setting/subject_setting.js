// define(["jquery", C.CLF('avalon.js'),'layer','amazeui',
//         C.Co('growth','subject_setting/subject_setting','css!'),
//         C.Co('growth','subject_setting/subject_setting','html!'),
//         C.CMF("router.js"), C.CMF("data_center.js"),
//         C.CM('page_title')
//     ],
//     function($, avalon,layer,amazeui, css,html, x, data_center,page_title) {
//         //获取学科
//         var api_get_subject_list=api.PCPlayer+"subject/subjectList.action";
//         //获取指标
//         var api_get_index=api.api+"Indexmaintain/indexmaintain_findByIndexName";
//         //保存
//         var api_save_or_update_subject_max_score=api.api+"score/save_or_update_subject_max_score";
//         //查询
//         var api_check_list=api.api+"score/list_subject_max_score";
//         var avalon_define = function() {
//             var table = avalon.define({
//                 $id: "subject_setting",
//                 subject_list:[],
//                 first_index_list:[],
//                 second_index_list:[],
//                 city:"",
//                 first_index:"",
//                 second_index:"",
//                 get_index:"",
//                 module_score:"",
//                 current_el:"",
//                 module_name:"",
//                 grade_no:7,
//                 index_workid:"",
//                 cb: function() {
//                     var self = this;
//                     data_center.uin(function(data) {
//                         var userData= JSON.parse(data.data["user"]);
//                         self.city=userData.city;
//                         self.index_workid=Number(userData.fk_school_id);
//                         ajax_post(api_get_subject_list,{status:"1"},self);
//                     });
//
//                 },
//                 gradeChange:function () {
//                     this.table_subject=[];
//                     ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
//                 },
//                 on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
//                     if (is_suc) {
//                         switch (cmd) {
//                             //获取科目集合
//                             case api_get_subject_list:
//                                 this.complete_get_subject_list(data);
//                                 break;
//                             //查询
//                             case api_check_list:
//                                 this.complete_check_list(data);
//                                 break;
//                             //查询指标
//                             case api_get_index:
//                                 if(this.get_index==1){//一级指标
//                                     this.complete_get_first_index(data);
//                                 }else if(this.get_index==2){//二级指标
//                                     this.complete_get_second_index(data);
//                                 }else if(this.get_index==3){//回显获得一级指标后请求二级指标
//                                     this.complete_update_second_index(data);
//                                 }
//                                 break;
//                             //保存
//                             case api_save_or_update_subject_max_score:
//                                 this.complete_save_or_update_subject_max_score(data);
//                                 break;
//                         }
//                     } else {
//                         layer.msg(msg);
//                     }
//                 },
//                 complete_get_subject_list:function (data) {
//                     this.subject_list=data.data;
//                     ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
//                 },
//                 table_subject:[],
//                 complete_check_list:function (data) {
//                     var subject_list=this.subject_list;
//                     var subject_list_length=subject_list.length;
//                     var sub={};
//                     this.table_subject=[];
//                     var dataList=data.data;
//                     var dataList_length=dataList.length;
//                     if(dataList_length>0){
//                         for(var i=0;i<subject_list_length;i++){
//                             var every_sub=subject_list[i];
//                             sub.city=this.city;
//                             sub.grade_no=this.grade_no;
//                             sub.max_score='';
//                             sub.subject_id=every_sub.subject_code;
//                             sub.subject_name=every_sub.subject_name;
//                             sub.first_name="";
//                             sub.second_index_name="";
//                             sub.first_index="";
//                             sub.second_index="";
//                             this.table_subject.push(sub);
//                         }
//                         for(var i=0;i<this.table_subject.length;i++){
//                             for(var j=0;j<dataList_length;j++){
//                                 if(this.table_subject[i].subject_id == dataList[j].subject_id){
//                                     this.table_subject[i].max_score=dataList[j].max_score;
//                                     this.table_subject[i].first_name=dataList[j].first_name;
//                                     this.table_subject[i].second_index_name=dataList[j].second_index_name;
//                                     this.table_subject[i].first_index=dataList[j].first_index;
//                                     this.table_subject[i].second_index=dataList[j].second_index;
//
//                                 }
//                             }
//                         }
//
//                     }else{
//                         for(var i=0;i<subject_list_length;i++){
//                             var every_sub=subject_list[i];
//                             sub.city=this.city;
//                             sub.grade_no=this.grade_no;
//                             sub.max_score='';
//                             sub.subject_id=every_sub.subject_code;
//                             sub.subject_name=every_sub.subject_name;
//                             sub.first_name="";
//                             sub.second_index_name="";
//                             sub.first_index="";
//                             sub.second_index="";
//                             this.table_subject.push(sub);
//                         }
//                     }
//                 },
//                 complete_get_first_index:function (data) {
//                     var el=this.current_el;
//                     this.first_index_list=data.data;
//                     var first_index = this.first_index;
//                     var second_index = this.second_index;
//                     var f_index=el.first_index;
//                     var f_name=el.first_name;
//                     var s_index=el.second_index;
//                     var s_name=el.second_index_name;
//                     var index_parentid=this.first_index_list[0].id;
//
//
//                     if(!f_index && !f_name && !s_index && !s_name){//第一次没有值
//                         this.first_index=index_parentid+"|"+this.first_index_list[0].index_name;
//                         first_index=this.first_index;
//                         //一级指标
//                         el.first_index=Number(first_index.split("|")[0]);
//                         el.first_name=first_index.split("|")[1];
//                         this.current_el=el;
//                         this.get_index=2;
//                         ajax_post(api_get_index,{index_rank:2,index_workid:this.index_workid,index_parentid:index_parentid},this);
//                     }else{
//                         //一级指标
//                         var f_list=this.first_index_list;
//                         var f_list_length=f_list.length;
//                         for(var i=0;i<f_list_length;i++){
//                             if(f_index==f_list[i].id){
//                                 this.first_index=f_list[i].id+'|'+f_list[i].index_name;
//                             }
//                         }
//                         this.get_index=3;
//                         ajax_post(api_get_index,{index_rank:2,index_workid:this.index_workid,index_parentid:f_index},this);
//                     }
//                 },
//                 complete_get_second_index:function (data) {
//                     this.second_index_list=data.data;
//                     this.second_index=this.second_index_list[0].id+"|"+this.second_index_list[0].index_name;
//                     var el=this.current_el;
//                     el.second_index=Number(this.second_index_list[0].id);
//                     el.second_index_name=this.second_index_list[0].index_name;
//                 },
//                 //编辑
//                 add_score:function (el) {
//                     this.module_name=el.subject_name;
//                     this.module_score=el.max_score;
//                     this.get_index=1;
//                     this.current_el=el;
//                     $("#content_div").modal({
//                         closeOnConfirm: false
//                     });
//                     ajax_post(api_get_index,{index_rank:1,index_workid:this.index_workid},this);
//                 },
//                 complete_update_second_index:function (data) {
//                     this.second_index_list=data.data;
//                     //二级指标
//                     var el=this.current_el;
//                     var s_index=el.second_index;
//                     var s_name=el.second_index_name;
//                     var s_list=this.second_index_list;
//                     var s_list_length=s_list.length;
//                     for(var i=0;i<s_list_length;i++){
//                         if(s_index==s_list[i].id){
//                             this.second_index=s_list[i].id+'|'+s_list[i].index_name;
//                         }
//                     }
//                 },
//                 save_btn:function () {
//                     var text=this.module_score;
//                     if((/^(\+|-)?\d+$/.test( text )) && text>0 && text<=200){
//                         this.current_el.max_score=text;
//                         ajax_post(api_save_or_update_subject_max_score,
//                             this.current_el,this);
//                     }else{
//                         layer.msg('请填写大于0小于200的正整数');
//                     }
//                 },
//                 cancel_btn:function () {
//                     ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
//
//                 },
//                 firstIndex:function () {
//                     var first_index=this.first_index;
//                     var index_parentid=first_index.split("|")[0];
//                     this.current_el.first_index=Number(first_index.split("|")[0]);
//                     this.current_el.first_name=first_index.split("|")[1];
//                     this.get_index=2;
//                     ajax_post(api_get_index,{index_rank:2,index_workid:this.index_workid,index_parentid:index_parentid},this);
//                 },
//                 secondIndex:function () {
//                     var second_index=this.second_index;
//                     this.current_el.second_index=Number(second_index.split("|")[0]);
//                     this.current_el.second_index_name=second_index.split("|")[1];
//                 },
//                 complete_save_or_update_subject_max_score:function (data) {
//                     $("#content_div").modal({
//                         closeOnConfirm: true
//                     });
//                     ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
//                 }
//
//             });
//             table.$watch("onReady", function() {
//                 $(".am-dimmer").css("display","none");
//                 this.cb();
//
//             });
//             return table;
//         };
//         return {
//             view: html,
//             define: avalon_define
//         }
//     });



/*根据需求更改*/
define(["jquery", C.CLF('avalon.js'),'layer','amazeui',
        C.Co('user','subject_setting/subject_setting','css!'),
        C.Co('user','subject_setting/subject_setting','html!'),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($, avalon,layer,amazeui, css,html, x, data_center,three_menu_module) {
        //获取学科
        var api_get_subject_list=api.api+"score/list_subject";
        //获取指标
        var api_get_index=api.api+"Indexmaintain/indexmaintain_findByIndexName";
        //保存
        var api_save_or_update_subject_max_score=api.api+"score/save_or_update_subject_full_score";
        //查询
        var api_check_list=api.api+"score/list_subject_full_score";
        //启停用
        var api_is_open_or_stop=api.api+"score/switch_subject_full_score";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "subject_setting",
                type:"",
                subject_list:[],
                first_index_list:[],
                second_index_list:[],
                city:"",
                first_index:"",
                second_index:"",
                get_index:"",
                module_score:"",
                current_el:"",
                module_name:"",
                grade_no:7,
                index_workid:"",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData= JSON.parse(data.data["user"]);
                        self.city=userData.city;
                        self.index_workid=Number(userData.fk_school_id);
                        ajax_post(api_get_subject_list,{subject_id:'1000'},self);
                    });

                },
                gradeChange:function () {
                    this.table_subject=[];
                    ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取科目集合
                            case api_get_subject_list:
                                this.complete_get_subject_list(data);
                                break;
                            //查询
                            case api_check_list:
                                this.complete_check_list(data);
                                break;
                            //查询指标
                            case api_get_index:
                                if(this.get_index==1){//一级指标
                                    this.complete_get_first_index(data);
                                }else if(this.get_index==2){//二级指标
                                    this.complete_get_second_index(data);
                                }else if(this.get_index==3){//回显获得一级指标后请求二级指标
                                    this.complete_update_second_index(data);
                                }
                                break;
                            //保存
                            case api_save_or_update_subject_max_score:
                                this.complete_save_or_update_subject_max_score(data);
                                break;
                            //改变状态
                            case api_is_open_or_stop:
                                this.complete_is_open_or_stop(data);
                                break;
                        }
                    } else {
                        layer.msg(msg);
                    }
                },
                complete_get_subject_list:function (data) {
                    this.subject_list=data.data;
                    ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
                },
                table_subject:[],
                complete_check_list:function (data) {
                    var subject_list=this.subject_list.$model;
                    var subject_list_length=subject_list.length;
                    var sub={};
                    this.table_subject=[];
                    var dataList=data.data;
                    var dataList_length=dataList.length;
                    if(dataList_length>0){
                        for(var i=0;i<subject_list_length;i++){
                            var every_sub=subject_list[i];
                            sub.city=this.city;
                            sub.grade_no=this.grade_no;
                            sub.max_score='';
                            sub.subject_id=every_sub.subject_id;
                            sub.subject_name=every_sub.title;
                            sub.first_name="";
                            sub.second_index_name="";
                            sub.first_index="";
                            sub.second_index="";
                            sub.alias=every_sub.alias;
                            sub.type=every_sub.type;
                            sub.status="";
                            sub._id="";
                            this.table_subject.push(sub);
                        }
                        for(var i=0;i<this.table_subject.length;i++){
                            for(var j=0;j<dataList_length;j++){
                                if(this.table_subject[i].subject_name == dataList[j].subject_name){
                                    if(dataList[j].hasOwnProperty('max_score')){
                                        this.table_subject[i].max_score=dataList[j].max_score;
                                    }else{
                                        this.table_subject[i].max_score='';
                                    }
                                    this.table_subject[i].first_name=dataList[j].first_name;
                                    this.table_subject[i].second_index_name=dataList[j].second_index_name;
                                    this.table_subject[i].first_index=dataList[j].first_index;
                                    this.table_subject[i].second_index=dataList[j].second_index;
                                    this.table_subject[i]._id=dataList[j]._id;
                                    this.table_subject[i].status=dataList[j].status;

                                }
                            }
                        }

                    }else{
                        for(var i=0;i<subject_list_length;i++){
                            var every_sub=subject_list[i];
                            sub.city=this.city;
                            sub.grade_no=this.grade_no;
                            sub.max_score='';
                            sub.subject_id=every_sub.subject_id;
                            sub.subject_name=every_sub.title;
                            sub.first_name="";
                            sub.second_index_name="";
                            sub.first_index="";
                            sub.second_index="";
                            sub.alias=every_sub.alias;
                            sub.type=every_sub.type;
                            this.table_subject.push(sub);
                        }
                    }
                    console.log(this.table_subject)

                },
                complete_get_first_index:function (data) {
                    var el=this.current_el;
                    this.first_index_list=data.data;
                    var first_index = this.first_index;
                    var second_index = this.second_index;
                    var f_index=el.first_index;
                    var f_name=el.first_name;
                    var s_index=el.second_index;
                    var s_name=el.second_index_name;
                    var index_parentid=this.first_index_list[0].id;


                    if(!f_index && !f_name && !s_index && !s_name){//第一次没有值
                        this.first_index=index_parentid+"|"+this.first_index_list[0].index_name;
                        first_index=this.first_index;
                        //一级指标
                        el.first_index=Number(first_index.split("|")[0]);
                        el.first_name=first_index.split("|")[1];
                        this.current_el=el;
                        this.get_index=2;
                        ajax_post(api_get_index,{index_rank:2,index_parentid:index_parentid},this);
                    }else{
                        //一级指标
                        var f_list=this.first_index_list;
                        var f_list_length=f_list.length;
                        for(var i=0;i<f_list_length;i++){
                            if(f_index==f_list[i].id){
                                this.first_index=f_list[i].id+'|'+f_list[i].index_name;
                            }
                        }
                        this.get_index=3;
                        ajax_post(api_get_index,{index_rank:2,index_parentid:f_index},this);
                    }
                },
                complete_get_second_index:function (data) {
                    this.second_index_list=data.data;
                    this.second_index=this.second_index_list[0].id+"|"+this.second_index_list[0].index_name;
                    var el=this.current_el;
                    el.second_index=Number(this.second_index_list[0].id);
                    el.second_index_name=this.second_index_list[0].index_name;
                },
                //编辑
                add_score:function (el,type) {
                    this.type = type;
                    this.module_name=el.subject_name;
                    this.module_score=el.max_score;
                    this.get_index=1;
                    this.current_el=el;
                    $("#content_div").modal({
                        closeOnConfirm: false
                    });
                    ajax_post(api_get_index,{index_rank:1},this);
                },
                complete_update_second_index:function (data) {
                    this.second_index_list=data.data;
                    //二级指标
                    var el=this.current_el;
                    var s_index=el.second_index;
                    var s_name=el.second_index_name;
                    var s_list=this.second_index_list;
                    var s_list_length=s_list.length;
                    for(var i=0;i<s_list_length;i++){
                        if(s_index==s_list[i].id){
                            this.second_index=s_list[i].id+'|'+s_list[i].index_name;
                        }
                    }
                },
                save_btn:function () {
                    var text=this.module_score;
                    if( this.type == 'nor'){
                        if((/^(\+|-)?\d+$/.test( text )) && text>0 && text<=200){
                            this.current_el.max_score=text;
                            ajax_post(api_save_or_update_subject_max_score,
                                this.current_el,this);
                        }else{
                            layer.msg('请填写大于0小于200的正整数');
                        }
                    }else{
                        ajax_post(api_save_or_update_subject_max_score,
                            this.current_el,this);
                    }

                },
                cancel_btn:function () {
                    ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);

                },
                firstIndex:function () {
                    var first_index=this.first_index;
                    var index_parentid=first_index.split("|")[0];
                    this.current_el.first_index=Number(first_index.split("|")[0]);
                    this.current_el.first_name=first_index.split("|")[1];
                    this.get_index=2;
                    ajax_post(api_get_index,{index_rank:2,index_parentid:index_parentid},this);
                },
                secondIndex:function () {
                    var second_index=this.second_index;
                    this.current_el.second_index=Number(second_index.split("|")[0]);
                    this.current_el.second_index_name=second_index.split("|")[1];
                },
                complete_save_or_update_subject_max_score:function (data) {
                    $("#content_div").modal({
                        closeOnConfirm: true
                    });
                    ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
                },
                is_open:function (el,num) {
                    ajax_post(api_is_open_or_stop,{_id:el._id},this);
                },
                complete_is_open_or_stop:function (data) {
                    ajax_post(api_check_list,{city:this.city,grade_no:this.grade_no},this);
                }

            });
            table.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();

            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });