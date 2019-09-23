/**
 * Created by Administrator on 2018/5/25.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        'select2',
        C.Co('all_index', 'index_add/a_a_element/a_a_element', 'html!'),
        C.Co('all_index', 'index_add/a_a_element/a_a_element', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly")
    ],
    function (avalon, layer,select2, html, css, data_center, select_assembly) {
        //查询所有教师
        var api_get_all_teacher = api.api + "base/teacher/chooseteacher.action";
        // 指标详情
        var index_details = api.api + "Indexmaintain/indexmaintain_findByIndexInfo";
        //添加指标
        var index_add = api.api + "Indexmaintain/indexmaintain_addIndexmaintain";
        //修改指标
        var index_update_sure = api.api + "Indexmaintain/indexmaintain_updateIndex";
        //指标联动
        var index_linkage = api.api + "Indexmaintain/indexmaintain_findByIndexName";
        //修改指标状态(审核,使用,类型)
        var index_update_state=api.api+"Indexmaintain/indexmaintain_updateIndexState";
        var avalon_define = function (prm) {
            var vm = avalon.define({
                $id: "a_a_element",
                teacher_arr:[],
                frist_index:[],
                data:{
                    id:"",
                    index_author:"",
                    index_authorid:"",
                    index_name:"",
                    index_rank:2,
                    index_type:0,
                    index_parent:"",
                    index_parentid:"",
                    index_review:"",
                    index_work:"",
                    index_isoption:2,
                    index_value:"",
                    index_use_state:2//index_use_state -1:删除1:启用 2:停用,创建时 传 停用，审核通过才是启用
                },
                //未通过原因
                index_notpass:'',
                //作者信息
                author_info:'',
                frist_id_name:"",
                save_data:function(){
                    this.data.index_parentid=this.frist_id_name.split('|')[0];
                    this.data.index_parent=this.frist_id_name.split('|')[1];
                    this.data.index_author = this.author_info.split('|')[0];
                    this.data.index_authorid = this.author_info.split('|')[1];
                    if(!$.trim(this.data.index_parentid)){
                        layer.alert("一级指标不能为空")
                        return false
                    }
                    if(!$.trim(this.data.index_name)){
                        layer.alert("二级指标名称不能为空")
                        return false
                    }
                    if(!$.trim(this.data.index_review)){
                        layer.alert("考察要点不能为空")
                        return false
                    }
                    if(!$.trim(this.data.index_authorid)){
                        layer.alert("作者不能为空")
                        return false
                    }
                    if(!this.data.index_value){
                        layer.alert("分数不能为空")
                        return false
                    }
                    if(isNaN($.trim(this.data.index_value))){
                        layer.alert("分数必须是数字类型。")
                        return false
                    }
                    if(Number($.trim(this.data.index_value))<=0){
                        layer.alert("请填写分数,并且大于0")
                        return false
                    }
                    if(this.data.id){
                        ajax_post(index_update_sure,this.data.$model,this);
                    }else{
                        ajax_post(index_add,this.data.$model,this);
                    }
                },
                first_index_change:function () {
                    var id = this.frist_id_name.split('|')[0]
                    for(var i=0;i<this.frist_index.length;i++){
                        if(id==this.frist_index[i].id){
                            data_center.set_key("index_index",i);
                            break;
                        }
                    }
                },
                back:function(){
                    // window.location = prm.index_type==1?"#admin_index_see":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_index_see":"";
                    window.location = '#index_set';
                },
                //当前用户基本信息
                userInfo:{
                    fk_school_id:'',
                    guid:'',
                    teacher_name:'',
                    teacher_num:'',
                },
                // 初始化
                init: function () {
                    var first_index_str = data_center.get_key('add_point_first_index');
                    if(first_index_str){
                        var first_index = JSON.parse(first_index_str);
                        this.frist_id_name = first_index.id+'|'+first_index.index_name;
                    }


                    this.data.index_type=prm.index_type
                    //先把整个学校的开始加载进来
                    var self = this;
                    data_center.uin(function (data) {
                        var data = JSON.parse(data.data["user"]);
                        self.userInfo.fk_school_id = data.fk_school_id;
                        self.userInfo.teacher_name = data.school_name;
                        self.userInfo.guid = data.guid;
                        self.userInfo.teacher_num = data.account;
                        self.data.index_work =  data.school_name;
                        ajax_post_sync(api_get_all_teacher,{fk_school_id:data.fk_school_id},self);
                        ajax_post_sync(index_linkage, {index_rank: 1}, self);
                    });
                },

                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_all_teacher:
                                var list = data.data;
                                list.unshift(this.userInfo);
                                this.teacher_arr = list;
                                //为了回显作者
                                if(prm.id){
                                    ajax_post_sync(index_details,{id:prm.id},this);
                                }
                                break;
                            case index_linkage:
                                this.frist_index=data.data;
                                break;
                            case index_details:
                                this.data.id=data.data.id;
                                this.data.index_name=data.data.index_name;
                                this.data.index_rank=data.data.index_rank;
                                this.data.index_type=data.data.index_type;
                                this.data.index_parent=data.data.index_parent;
                                this.data.index_parentid=data.data.index_parentid;
                                this.data.index_review=data.data.index_review;
                                this.data.index_work=data.data.index_work;
                                this.frist_id_name=this.data.index_parentid+"|"+this.data.index_parent;
                                this.data.index_value=data.data.index_value;
                                this.data.index_use_state=2;
                                this.index_notpass = data.data.index_notpass;
                                this.author_info = data.data.index_author + '|' + data.data.index_authorid;
                                break;
                            case index_add:
                                window.location = prm.index_type==1?"#admin_index_see":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_index_see":"";
                                break;
                            case index_update_sure:
                                this.complete_updata_sure(data);
                                break;
                            case index_update_state:
                                window.location = prm.index_type==1?"#index_set":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_index_see":"";
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
                        index_use_state:this.data.index_use_state,
                        index_notpass:this.index_notpass,
                    },this);
                }
            });
            vm.$watch('onReady', function () {
                $("#teacher_select").select2();
                $("#teacher_select").on("change", function (e) {
                    vm.author_info = $("#teacher_select").val()
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
