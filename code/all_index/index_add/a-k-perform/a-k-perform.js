/**
 * Created by Administrator on 2018/5/28.
 */
define([
        C.CLF('avalon.js'),'select2',
        'layer',
        C.Co('all_index', 'index_add/a-k-perform/a-k-perform', 'html!'),
        C.Co('all_index', 'index_add/a-k-perform/a-k-perform', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly")
    ],
    function (avalon,select2, layer, html, css, data_center, select_assembly) {
        //查询所有作者
        var api_get_all_teacher = api.api + "base/teacher/chooseteacher.action";
        //年级
        // var find_grades = api.api + "base/grade/findGrades.action";
        // 指标详情
        var index_details = api.api + "Indexmaintain/indexmaintain_findByIndexValue";
        //添加指标
        var index_add = api.api + "Indexmaintain/indexmaintain_addIndexVaule";
        //修改指标
        var index_update_sure = api.api + "Indexmaintain/indexmaintain_updateIndex";
        //指标联动
        var index_linkage = api.api + "Indexmaintain/indexmaintain_findByIndexName";
        //修改指标状态(审核,使用,类型)
        var index_update_state=api.api+"Indexmaintain/indexmaintain_updateIndexState";
        var avalon_define = function (prm) {
            var vm = avalon.define({
                $id: "a-k-perform",
                //评价主体对应下面的内容切换-默认:日常表现-true,其他三个模块-false
                con_type:false,
                //评价主体数组
                eval_ary:[
                    {index:0,value:1,name:'自评'},
                    {index:1,value:2,name:'组评'},
                    {index:2,value:3,name:'班评'},
                    {index:3,value:4,name:'日常表现'}
                    ],
                eval_subs:[],
                //评价主体数组转字符串
                eval_str:'',
                //作者
                author_info:'',
                //评价主体切换
                check_btn:function (val) {
                    //获取之前的checkbox的值
                    var pre=this.eval_subs;
                    // console.log(pre);
                    if(pre.length > 1 && pre.indexOf("日常表现") >= 0){
                        layer.alert('自评、组评、班评不可与日常表现同批添加', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        this.eval_subs = [];
                        pre = [];
                        this.con_type = false;
                        return;
                    }
                    if(pre.indexOf("日常表现") == -1){
                        this.con_type = false;
                    }else{
                        this.con_type = true;
                    }
                },
                indexFlag: "",
                //年级集
                arr_grade: [],
                //作者集
                teacher_arr: [],
                //当前用户基本信息
                userInfo:{
                    fk_school_id:'',
                    guid:'',
                    teacher_name:'',
                    teacher_num:'',
                },
                //一级指标集
                frist_index: [],
                //二级指标集
                second_index: [],
                //修改指标参数：updata_data:{....}+updata_id
                updata_id:'',
                updata_data: {
                    id: "",
                    index_parentid: "",
                    index_parent: "",
                    index_secondary: "",
                    index_secondaryid: "",
                    index_name: "",
                    index_apply: "",
                    index_review: "",
                    index_isoption: "",//是否带选项 1带2不带
                    index_value: "",
                    index_author: "",
                    index_authorid: "",
                    index_grade: "",
                    index_gradeid: "",
                    index_option_content: [],
                    index_values: [],
                    index_type: 0,
                    index_start_interval:"",
                    index_end_interval:"",
                },
                //添加指标
                data: {
                    // id: "",
                    index_parentid: "",
                    index_parent: "",
                    index_secondary: "",
                    index_secondaryid: "",
                    index_name: "",
                    index_apply: "",
                    index_review: "",
                    index_isoption: "",//是否带选项 1带2不带
                    index_value: "",
                    index_author: "",
                    index_authorid: "",
                    index_grade: "",
                    index_gradeid: "",
                    index_option_content: [],
                    index_values: [],
                    index_type: 0,
                    index_start_interval:"",
                    index_end_interval:"",
                    index_rank:3,
                },
                //选中的一级指标 id+名称
                frist_id_name: "",
                //选中的二级指标 id+名称
                second_id_name: "",
                //答案选项数
                totalAnswerNum: 0,
                //答案数组
                arr_option: [],
                //选择的年级
                grade:[],
                //未通过原因
                index_notpass:'',
                //使用状态
                index_use_state:'',
                save_data: function () {
                    //评价主体
                    var ap="";
                    for(var i=0;i<this.eval_subs.length;i++){
                        if(i!=this.eval_subs.length-1){
                            ap+=this.eval_subs[i]+',';
                        }else{
                            ap+=this.eval_subs[i]
                        }
                    }
                    this.data.index_apply=ap;
                    this.data.index_parentid = this.frist_id_name.split('|')[0];
                    this.data.index_parent = this.frist_id_name.split('|')[1];
                    this.data.index_secondaryid =  this.second_id_name.split('|')[0];
                    this.data.index_secondary = this.second_id_name.split('|')[1];
                    if (!$.trim(this.data.index_parentid)) {
                        layer.alert("评价维度不能为空")
                        return false
                    }
                    if (!$.trim(this.data.index_secondaryid)) {
                        layer.alert("评价要素不能为空")
                        return false
                    }
                    if (!$.trim(this.data.index_name)) {
                        layer.alert("关键表现不能为空")
                        return false
                    }
                    if (!$.trim(this.data.index_apply)) {
                        layer.alert("评价主体不能为空")
                        return false
                    }
                    if (!$.trim(this.data.index_review)) {
                        layer.alert("考察要点不能为空")
                        return false
                    }
                    this.data.index_option_content = []
                    this.data.index_values = []
                    this.data.index_isoption = this.arr_option.length > 0 ? 1 : 2;
                    if (this.data.index_isoption == 1) {
                        for (item in this.arr_option) {
                            if (!$.trim(this.arr_option[item].question)) {
                                layer.alert("请填写选项答案内容。")
                                return false
                            }
                            if (!$.trim(this.arr_option[item].score)) {
                                layer.alert("请填写选项答案分值。")
                                return false
                            }
                            if (this.arr_option[item].score < 0) {
                                layer.alert("请填写大于0的选项答案分值。");
                                return false
                            }else{
                                var score_x = Number(this.arr_option[item].score);
                                this.arr_option[item].score = score_x.toFixed(1);
                            }
                            this.data.index_option_content.push(this.arr_option[item].question)
                            this.data.index_values.push(this.arr_option[item].score)
                        }
                    }else{
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
                    }
                    if ($.trim(this.data.index_apply)=='日常表现') {
                        if(!$.trim(this.data.index_start_interval)){
                            layer.alert("分值开始区间不能为空")
                            return false
                        }
                        // if(Number(this.data.index_start_interval) < 0){
                        //     layer.alert("分值开始区间不能小于0")
                        //     return false
                        // }
                        if(Number(this.data.index_end_interval) < Number(this.data.index_start_interval)){
                            layer.alert("分值开始区间小于结束区间")
                            return false
                        }
                        if(!$.trim(this.data.index_end_interval)){
                            layer.alert("分值结束区间不能为空")
                            return false
                        }
                        if(Number(this.data.index_end_interval) > 999){
                            layer.alert("分值结束区间不能大于999")
                            return false
                        }
                        if(Number($.trim(this.data.index_value)) > Number(this.data.index_end_interval-this.data.index_start_interval)){
                            layer.alert("默认加减分不能大于分值结束区间")
                            return false
                        }
                        if(Number($.trim(this.data.index_value)) < Number(this.data.index_start_interval)){
                            layer.alert("默认加减分不能小于分值开始区间")
                            return false
                        }
                    }
                    grade_id = [];
                    grade_name = [];
                    var get_grade = this.grade;
                    var get_length = get_grade.length;
                    for(var i = 0; i < get_length; i++){
                        var every = get_grade[i];
                        var id = every.split('|')[0];
                        var value = every.split('|')[1];
                        grade_id.push(id);
                        grade_name.push(value);
                    }
                    // for(i in this.grade){
                    //     for(k in this.arr_grade){
                    //         if(this.grade[i]==this.arr_grade[k].id){
                    //             grade_id.push(this.arr_grade[k].id)
                    //             grade_name.push(this.arr_grade[k].remark)
                    //         }
                    //     }
                    // }
                    if(grade_id.length==0){
                        layer.alert("请选择使用年级");
                        return false
                    }
                    this.data.index_grade  = grade_name.join("/");
                    this.data.index_gradeid  = grade_id.join(", ");
                    if(!$.trim(this.data.index_authorid)){
                        layer.alert("作者不能为空");
                        return false
                    }
                    if (this.updata_id) {
                       var updata=this.data;
                        var obj={
                          id:this.updata_id
                        };
                        this.updata_data=Object.assign(updata,obj);
                        ajax_post(index_update_sure, this.updata_data, this);
                    } else {
                        ajax_post(index_add, this.data.$model, this);
                    }
                },
                index_workid:"",
                // 初始化
                init: function () {
                    this.data.index_type = Number(prm.index_type);
                    //先把整个学校的开始加载进来
                    var self = this;
                    data_center.uin(function (data) {
                        var data = JSON.parse(data.data["user"]);
                        self.userInfo.fk_school_id = data.fk_school_id;
                        self.userInfo.teacher_name = data.school_name;
                        self.userInfo.guid = data.guid;
                        self.userInfo.teacher_num = data.account;
                        self.data.index_work = data.school_name
                        self.index_workid=data.fk_school_id
                        //查询
                        ajax_post_sync(api_get_all_teacher, { fk_school_id: data.fk_school_id }, self);
                        this.index_workid = data.fk_school_id
                        ajax_post_sync(index_linkage, { index_rank: 1}, self);
                        // ajax_post_sync(find_grades, { status: 1 }, self);
                        //数据回显
                        if (prm.id) {
                            ajax_post_sync(index_details, { id: prm.id }, self);
                        }
                    });
                },
                change_firstIndex:function(){
                    this.indexFlag = 1;
                    ajax_post(index_linkage, { index_parentid:  this.frist_id_name.split('|')[0], index_rank: 2}, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_all_teacher:
                                var list = data.data;
                                list.unshift(this.userInfo);
                                this.teacher_arr = list;
                                // $("#teacher_select").select2();
                                // var self = this;
                                // $("#teacher_select").on("change", function (e) {
                                //     self.data.index_author = $("#teacher_select").val().split('|')[0];
                                //     self.data.index_authorid = $("#teacher_select").val().split('|')[1];
                                // });
                                break;
                            //    年级
                            // case find_grades:
                            //     this.arr_grade = data.data;
                            //     break;
                            case index_linkage:
                                if (this.indexFlag) {
                                    this.second_index = data.data;
                                } else {
                                    this.frist_index = data.data;
                                }
                                this.indexFlag = "1";
                                break;
                            //    指标详情--回显数据才调
                            case index_details:
                                this.complete_index_detail(data);
                                break;
                            case index_add:
                                window.location = prm.index_type==1?"#admin_index_see":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_index_see":"";
                                break;
                            case index_update_sure:
                                this.complete_updata_sure(data);
                                break;
                            case index_update_state:
                                window.location = prm.index_type==1?"#admin_index_see":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_index_see":"";
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //指标详情--编辑
                complete_index_detail:function(data){
                    //不通过原因
                    this.index_notpass = data.data.index_notpass;
                    //使用状态
                    this.index_use_state = data.data.index_use_state;
                    this.updata_id = data.data.id;//指标id
                    this.data.index_workid = data.data.index_workid//单位id
                    //一级指标
                    this.frist_id_name =  data.data.index_parentid + "|" + data.data.index_parent;
                    this.data.index_secondary =data.data.index_parentid;
                    this.data.index_secondaryid =  data.data.index_secondary;
                    //二级指标
                    this.indexFlag = "1";
                    ajax_post_sync(index_linkage, { index_parentid: data.data.index_parentid}, this);
                    this.second_id_name =  data.data.index_secondaryid + '|' + data.data.index_secondary
                    this.data.index_parentid =  data.data.index_secondaryid;
                    this.data.index_parent = data.data.index_parent;
                    //关键表现
                    this.data.index_name = data.data.index_name;
                    //主体
                    this.data.index_apply = data.data.index_apply;
                    if(this.data.index_apply.indexOf('/') != -1){
                        this.eval_subs=this.data.index_apply.split('/');
                    }else{
                        this.eval_subs =this.data.index_apply.split(',');
                    }
                    /*es6:判断主体中是否有'日常表现'：有-con_type = true;没有-con_type = false*/
                    if(this.eval_subs.find((element) => (element == '日常表现')) == '日常表现'){
                        this.con_type = true;
                    }else{
                        this.con_type = false;
                    }
                    //要点
                    this.data.index_review = data.data.index_review;
                    //选项数
                    this.totalAnswerNum = data.data.arr_option.length
                    this.toggle = data.data.arr_option.length > 0 ? false : true;
                    //选项内容
                    this.arr_option = data.data.arr_option || [];
                    //最大分值
                    this.data.index_value = data.data.index_value;
                    this.data.index_start_interval=data.data.index_start_interval;
                    this.data.index_end_interval=data.data.index_end_interval;

                    //作者
                    // this.data.index_author = data.data.index_author;
                    // this.data.index_authorid = data.data.index_authorid;
                    var tea_arr = this.teacher_arr;
                    var tea_id = data.data.index_authorid;
                    var tea_num = '';
                    var tea_guid = '';
                    for(var i=0;i<tea_arr.length;i++){
                        var id= tea_arr[i].guid;
                        if(id == tea_id){
                            this.data.index_author = tea_arr[i].teacher_name;
                            this.data.index_authorid = tea_arr[i].guid;
                            tea_num =  tea_arr[i].teacher_num;
                            tea_guid = id;
                            break;
                        }
                    }
                    // $("#select2-teacher_select-container").text(this.data.index_author +'|'+ tea_guid);
                    this.author_info = this.data.index_author +'|'+ tea_guid;
                    //适用年级开始
                    this.data.index_grade = data.data.index_grade;
                    this.data.index_gradeid = data.data.index_gradeid;
                    var grade_name = this.data.index_grade.split("/");
                    var grade_id = this.data.index_gradeid.split(",");
                    for(i = 0; i < grade_name.length; i++){
                        var str = Number(grade_id[i])+'|'+grade_name[i];
                        this.grade.push(str);
                    }
                    //当前可用的年级
                    //适用年级结束
                    //指标类型
                    this.data.index_type = data.data.index_type;
                },
                back:function(){
                    window.location = prm.index_type==1?"#index_set":prm.index_type==2 ? "#feature_index_see": prm.index_type==3 ? "#share_third_index_list":"";
                },
                complete_updata_sure:function(data){
                    //审核状态
                    ajax_post(index_update_state,{
                        id:Number(prm.id),
                        index_state:1,
                        index_type:this.data.index_type,
                        index_use_state:this.index_use_state ,
                        index_notpass:this.index_notpass,
                    },this);
                },
                toggle: true,
                //改变答案选项数
                change_totalAnswerNum: function () {//改变答案选项数量
                    if (this.totalAnswerNum == 0) {
                        this.toggle = true;
                    } else {
                        this.toggle = false;
                    }
                    var of = this.totalAnswerNum - this.arr_option.length
                    for (var i = 0; i < Math.abs(of); i++) {
                        if (of < 0) {
                            // this.arr_option.pop(this.arr_option.length - 1, 1)
                            this.arr_option.pop();
                        } else {
                            var nc = String.fromCharCode('A'.charCodeAt() + this.arr_option.length)
                            this.arr_option.push({
                                "title": "选项答案" + nc,
                                "question": "",
                                "score": ""
                            });
                        }
                    }
                },
                is_disabled: false
            });
            vm.$watch('onReady', function () {
                vm.init();
                // $(".js-example-basic-single").select2();
                $("#teacher_select").select2();
                $("#teacher_select").on("change", function (e) {
                    vm.data.index_author = $("#teacher_select").val().split('|')[0];
                    vm.data.index_authorid = $("#teacher_select").val().split('|')[1];
                });
            });
            vm.$watch("eval_subs", function () {
                var index_apply = vm.eval_subs;
                if ("日常表现" == index_apply) {
                    vm.totalAnswerNum = 0
                    vm.change_totalAnswerNum();
                    vm.is_disabled = true
                } else {
                    vm.is_disabled = false
                    vm.data.index_start_interval=""
                    vm.data.index_end_interval=""
                }
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
