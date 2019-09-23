define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'share_index_see/share_index_see','html!'),
        C.Co('all_index', 'share_index_see/share_index_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function (avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "share-index-see",
                //年级
                pro_grade_list:[],
                grade_list: [],
                grade_id: "",
                //一级指标渲染数据
                first_index_list:[],
                 //二级指标渲染
                second_index_list:[],
                //三级指标渲染
                third_index_list:[],
                //被选中的一级指标
                checked_first_index:"",
                //排序方案
                sort_list:[{"name":"采纳","value":3},{"name":"点赞","value":2},{"name":"综合排名","value":1}],
                //被选中的排序方案下标
                sort_idx:0,
                //当前登录人
                department_level:"",
                //当前登录人单位id
                login_schoolId:"",
                user_type:"",
                sort_type_change:function(idx){
                    this.sort_idx=idx
                    this.third_index_list = cloud.index_list_gx({
                        index_parentid:this.checked_first_index,
                        index_state: 2,
                        index_rank:3,
                        sort_mod:this.sort_list[this.sort_idx].value,
                        index_gradeid:this.grade_id,
                    })
                },
                init: function () {
                    // this.grade_list = cloud.grade_all_list();
                    //获取年级
                    var g_list = cloud.auto_grade_list({});
                    var obj1= {grade_name:'请选择年级',id:'',remark:''};
                    g_list.splice(0,0,obj1);
                    this.pro_grade_list = g_list;
                    var gradeList = any_2_select(g_list, {name: "grade_name", value: ["id"]});
                    vm.grade_list = gradeList;
                    this.user_type=Number(cloud.user_type())
                    this.department_level = Number(cloud.user_level());
                    this.login_schoolId = cloud.user_user().fk_school_id;
                    this.first_index_list = cloud.index_list_gx({index_rank:1,index_state: 2,offset:0,rows:99999});
                    this.first_index_list.reverse();
                    if(this.first_index_list && this.first_index_list.length > 0){
                        this.checked_first_index=this.first_index_list[0].id
                        this.find_index_detail_gx();
                    }
                },
                //点击选择一级指标
                click_first_index:function(id){
                    this.checked_first_index = id
                    this.find_index_detail_gx();
                },
                find_index_detail_gx:function(){
                    this.second_index_list = cloud.index_list_gx({index_parentid:this.checked_first_index,index_state: 2,index_rank:2})
                    this.third_index_list = cloud.index_list_gx({
                        index_parentid:this.checked_first_index,
                        index_state: 2,
                        index_rank:3,
                        sort_mod:this.sort_list[this.sort_idx].value,
                        index_gradeid:this.grade_id,
                    })
                },
                //指标点赞
                click_like:function(id,fk_index_id,is_like){
                    var pms = {id:id,fk_index_id:fk_index_id};
                    if(is_like){
                        $.extend(pms,{cancel_like:1})
                    }else{
                        $.extend(pms,{cancel_like:''})
                    }
                    cloud.dz_gx_index(pms,function(url,args,data,is_suc,msg){
                        vm.third_index_list = cloud.index_list_gx({
                            index_parentid:vm.checked_first_index,
                            index_state: 2,
                            index_rank:3,
                            sort_mod:vm.sort_list[vm.sort_idx].value,
                            index_gradeid:vm.grade_id,
                        })
                    });
                    // location.reload();
                    
                },
                //采纳指标
                click_adopt:function($index,el){
                    layer.open({
                        title: "提示",
                        content: '是否确认采纳该共享指标？',
                        btn: ['确定', '取消'],
                        yes: function (index, layero) {
                            if(el.index_rank == 3){
                                cloud.cn_gx_index({id:el.id},function(url,args,data,is_suc,msg){
                                    vm.third_index_list = cloud.index_list_gx({
                                        index_parentid:vm.checked_first_index,
                                        index_state: 2,
                                        index_rank:3,
                                        sort_mod:vm.sort_list[vm.sort_idx].value,
                                        index_gradeid:this.grade_id,
                                    })
                                });
                                vm.third_index_list[$index].index_adoption_state = 1;
                            }    
                            layer.close(index);                        
                        },
                        btn2: function (index, layero) {
                            layer.close(index);
                        }
                    });
                },
                //查看详情
                click_see:function (el) {
                    window.location = "#index_details?id="+el.id+"&index_type="+el.index_type;

                },
                //年级转换
                garde_remark:function(name){
                    if(name == '七年级') return '7';
                    if(name == '八年级') return '8';
                    if(name == '九年级') return '9';
                    if(name == '请选择年级') return '';
                },
                //年级改变
                sel_grade:function (info,index) {
                    this.grade_id = '';
                    if(info != '' && info != null || info != undefined){
                        var g_name = this.pro_grade_list[index].remark;
                        this.grade_id = this.garde_remark(g_name);
                    }
                    this.third_index_list = cloud.index_list_gx({
                        index_parentid:this.checked_first_index,
                        index_state: 2,
                        index_rank:3,
                        sort_mod:this.sort_list[this.sort_idx].value,
                        index_gradeid:this.grade_id,
                    })
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