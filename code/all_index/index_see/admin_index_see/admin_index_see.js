/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'index_see/admin_index_see/admin_index_see', 'html!'),
        C.Co('all_index', 'index_see/admin_index_see/admin_index_see', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "admin_index_see",
                // grade_list:[{name:"初2015级", value:7},{name:"初2016级",value:8},{name:"初2017级",value:9}],
                pro_grade_list:[],
                grade_list:[],
                grade_id:'',
                //一级指标渲染数据
                first_index_list: [],
                //当前年级状态下的所有评价要素及关键要素
                all_second_third:{
                    second_ary:[],
                    third_ary:[],
                },
                //评价要素及关键素养
                index_detail_list: [],
                //被选中的一级指标
                checked_first_index: "",
                init: function () {
                    this.first_index_list = cloud.index_list_xz({index_state:2});
                    this.first_index_list.reverse();
                    var g_list = cloud.auto_grade_list({});
                    var obj1= {grade_name:'请选择年级',id:'',remark:''};
                    g_list.splice(0,0,obj1);
                    this.pro_grade_list = g_list;
                    var gradeList = any_2_select(g_list, {name: "grade_name", value: ["id"]});
                    vm.grade_list = gradeList;
                    if (this.first_index_list && this.first_index_list.length > 0) {
                        this.checked_first_index = this.first_index_list[0].id;
                        // this.index_detail_list = cloud.index_detail_xz([this.checked_first_index]);
                        // this.index_detail_list = cloud.index_detail_xz_gradeID([this.checked_first_index],this.grade_id);
                        var detail = cloud.index_detail_xz_gradeID([this.checked_first_index],this.grade_id);
                        this.all_second_third.second_ary = detail.second_ary;
                        this.all_second_third.third_ary = detail.third_ary;
                        this.index_detail_list = this.get_s_t_index(detail,[this.checked_first_index.toString()]);
                    }
                },
                /**
                 * 一二三级指标对应:
                 * info:{second_ary:l2,third_ary:l3}或者{third_ary:l3}；
                 * args:当前选中一级指标id数组
                 */
                get_s_t_index:function(info,args){
                    this.index_detail_list = [];
                    var ret = [];
                    //通过判断是否调用二级指标接口
                    if(info.second_ary){//调用
                        var s_ary = info.second_ary;
                        var t_ary = info.third_ary;
                    }else{//没有调用
                        var s_ary = this.all_second_third.second_ary;
                        var t_ary = info.third_ary;
                    }
                    for(var i = 0; i < s_ary.length; i++ ) {

                        if(args.indexOf(s_ary[i].index_parentid) < 0 )
                            continue;
                        s_ary[i].elements = [];
                        for(var x = 0; x < t_ary.length; x++){
                            if(t_ary[x].index_secondaryid == s_ary[i].id){
                                s_ary[i].elements.push(t_ary[x]);
                            }
                        }
                        ret.push(s_ary[i]);
                    }
                    return ret;
                },
                //年级转换
                garde_remark:function(name){
                    if(name == '七年级') return '7';
                    if(name == '八年级') return '8';
                    if(name == '九年级') return '9';
                    if(name == '请选择年级') return '';
                },
                //年级切换
                change_grade:function(info, index){
                    this.grade_id = '';
                    if(info != '' && info != null || info != undefined){
                        var g_name = this.pro_grade_list[index].remark;
                        this.grade_id = this.garde_remark(g_name);
                    }
                    if (this.first_index_list && this.first_index_list.length > 0) {
                        // this.index_detail_list = cloud.index_detail_xz_gradeID([this.checked_first_index],this.grade_id);
                        var detail = cloud.index_detail_xz_gradeID([this.checked_first_index],this.grade_id);
                        this.all_second_third.third_ary = detail.third_ary;
                        this.index_detail_list = this.get_s_t_index(detail,[this.checked_first_index.toString()]);
                    }
                },
                //点击选择一级指标
                click_first_index: function (id) {
                    var id = "" + id;
                    this.checked_first_index = id;
                    // this.index_detail_list = cloud.index_detail_xz([id]);
                    // this.index_detail_list = cloud.index_detail_xz_gradeID([id],this.grade_id);
                    this.index_detail_list = this.get_s_t_index(this.all_second_third,[this.checked_first_index.toString()]);
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
