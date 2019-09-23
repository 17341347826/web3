define([
        C.CLF('avalon.js'),'select2',
        'layer',
        C.Co('all_index', 'add_first_index/add_first_index','html!'),
        C.Co('all_index', 'add_first_index/add_first_index','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly")
    ],
    function (avalon,select2,layer, html,css, data_center,select_assembly) {
        //查询所有教师
        var api_get_all_teacher = api.PCPlayer + "teacher/chooseteacher.action";
        // 指标详情
        var index_details = api.api + "Indexmaintain/indexmaintain_findByIndexInfo";
        //添加指标
        var index_add = api.api + "Indexmaintain/indexmaintain_addIndexmaintain";
        //修改指标
        var index_update_sure = api.api + "Indexmaintain/indexmaintain_updateIndex";
        //修改指标状态(审核,使用,类型)
        var index_update_state=api.api+"Indexmaintain/indexmaintain_updateIndexState";
        var avalon_define = function (prm) {

            var vm = avalon.define({
                $id: "add-first-index",
                /*------------------------------------------*/
                teacher_arr:[],
                data:{
                    id:"",
                    index_author:"",
                    index_authorid:"",
                    index_name:"",
                    index_rank:1,
                    index_type:1,
                    index_work:"",
                    index_isoption:2,
                    index_use_state:2//index_use_state -1:删除1:启用 2:停用,创建时 传 停用，审核通过才是启用
                },
                //作者信息
                author_info:'',
                //未通过原因
                index_notpass:'',
                save_data:function(){
                    if(this.author_info != ''){
                        var info = this.author_info.split('|');
                        this.data.index_author = info[0];
                        this.data.index_authorid = info[1];
                    }
                    if(!$.trim(this.data.index_name)){
                        toastr.info("指标名称不能为空")
                        return false
                    }
                    if(this.data.index_name.length>10){
                        toastr.info("指标名称过长")
                        return
                    }
                    //行政指标作者不必填
                    if(!$.trim(this.data.index_authorid)){
                        toastr.info("作者不能为空")
                        return false
                    }
                    if(this.data.id){
                        ajax_post(index_update_sure,this.data.$model,this);
                    }else{
                        ajax_post(index_add,this.data.$model,this);
                    }
                },
                grade_list:[],
                //当前用户基本信息
                userInfo:{
                    fk_school_id:'',
                    guid:'',
                    teacher_name:'',
                    teacher_num:'',
                },
                // 初始化
                init: function () {
                    this.data.index_type=prm.index_type;
                    this.grade_list = cloud.grade_all_list();
                    //先把整个学校的开始加载进来
                    var self = this;
                    data_center.uin(function (data) {
                        var data = JSON.parse(data.data["user"]);
                        self.userInfo.fk_school_id = data.fk_school_id;
                        self.userInfo.teacher_name = data.school_name;
                        self.userInfo.guid = data.guid;
                        self.userInfo.teacher_num = data.account;
                        ajax_post_sync(api_get_all_teacher,{fk_school_id:data.fk_school_id},self);
                        if(prm.id){
                            ajax_post(index_details,{id:prm.id},self);
                        }else{
                            self.data.index_work =  data.school_name
                        }
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_all_teacher:
                                var list = data.data;
                                list.unshift(this.userInfo);
                                this.teacher_arr = list;
                                break;
                            case index_details:
                                this.data.id=data.data.id,
                                    this.data.index_author=data.data.index_author,
                                    this.data.index_authorid=data.data.index_authorid,
                                    this.data.index_name=data.data.index_name,
                                    this.data.index_rank=data.data.index_rank,
                                    this.data.index_type=data.data.index_type,
                                    this.data.index_work=data.data.index_work,
                                    this.data.index_use_state=2;
                                    //不通过原因
                                    this.index_notpass = data.data.index_notpass;
                                    $("#select2-teacher_select-container").text(this.data.index_author);
                                break;
                            case index_add:
                                window.location = prm.index_type==1?"#index_set":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_frist_index_list":"";
                                break;
                            case index_update_sure:
                                this.complete_updata_sure(data);
                                break;
                            case index_update_state:
                                window.location = prm.index_type==1?"#index_set":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_frist_index_list":"";
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_updata_sure:function(data){
                    //审核状态
                    ajax_post(index_update_state,{
                        id:Number(prm.id),
                        index_state:1,
                        index_type:this.data.index_type,
                        index_use_state:this.data.index_use_state ,
                        index_notpass:this.index_notpass,
                    },this);
                },
                //一级指标切换
                first_change:function (num) {
                    this.first_num = num;
                },
                cancel:function () {
                    window.location = 'javascript:history.go(-1);'
                }

            });
            vm.$watch('onReady', function () {
                $("#teacher_select").select2();
                $("#teacher_select").on("change", function (e) {
                    vm.data.index_author = $("#teacher_select").val().split('|')[0];
                    vm.data.index_authorid = Number($("#teacher_select").val().split('|')[1]);
                });
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });