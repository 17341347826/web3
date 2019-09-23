/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor/entry_progress', 'stu_practice/stu_practice', 'html!'),
        C.Co('evaluation_condition_monitor/entry_progress', 'stu_practice/stu_practice', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"), C.CMF("formatUtil.js"),
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly,formatUtil) {

        //获取班级当前可用的学生
        var api_get_student = api.user+'student/class_used_stu';
        //综合实践数据
        // var api_get_practice=api.api+'GrowthRecordBag/zh_sc_jd';

        var api_get_practice = api.api + 'GrowthRecordBag/hdsc_input_progress';
        avalon.filters.get_avg = function (value) {
            return value.toFixed(1);
        }
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "stu_practice",
                //学年学期数组
                semester_list: [],
                //年级数组
                grade_list: [],
                grade_info:'',
                //班级数组
                class_list: [],
                //学生集合
                stu_list:[],
                req_data:{
                    //班级id （必传）	number
                    fk_class_id:'',
                    //学期id（必传）	number
                    fk_xq_id:''
                },
                //综合实践数据：
                //班级
                pra_bj:{},
                //模块
                pra_mk:[],
                //学生
                pra_xs:[],
                //人均上传材料
                rj_sc:'',
                //上传学生占比
                xs_zb:'',
                //所有学生表头
                thead_xs:[],
                //班级学生综合实践上传总进度
                sj_list:[],
                //班级学生综合实践上传分类进度
                sj_fl_list:[],
                //班级学生遴选上传材料详情
                lx_list:[],
                //接口数据请求
                ajax_data:function(){
                    this.sj_list = [];
                    this.sj_fl_list = [];
                    this.lx_list = [];
                    ajax_post(api_get_practice,{
                        fk_bj_id:Number(this.req_data.fk_class_id),
                        fk_nj_id:Number(this.grade_info),
                        fk_xq_id:Number(this.req_data.fk_xq_id),
                        fk_xx_id:Number(cloud.user_depart_id()),
                        qxmc:cloud.user_district(),
                        szmc:cloud.user_city(),
                        user_level:cloud.user_level(),
                    },this);
                },
                //初始化
                //-----------学期，年级，班级选择----------------------
                semester_sel: function (el) {
                    //    综合实践
                    // ajax_post(api_get_practice,this.req_data.$model,this);
                    this.ajax_data();
                },
                grade_sel: function (el) {
                    var list = this.grade_list;
                    var g_id = this.grade_info;
                    for(var i=0;i<list.length;i++){
                        var id = list[i].grade_id;
                        if(id == g_id){
                            this.class_list = list[i].class_list;
                            this.req_data.fk_class_id = list[i].class_list[0].class_id;
                        }
                    }
                    this.class_sel();
                },
                class_sel: function () {
                    if(this.req_data.fk_class_id != ''){
                        // ajax_post(api_get_practice,this.req_data.$model,this);
                        // ajax_post(api_get_student,{fk_class_id:this.req_data.fk_class_id},this);
                        this.ajax_data();
                    }
                },
                //数据返回，模块匹配：模块编号 1思想 2艺术 3社会实践 4学业水平 5身体健康
                mk_pp:function(mk){
                    var name = '';
                    if(mk == 1){
                        name = '思想品德';
                    }else if(mk == 2){
                        name = '艺术素养';
                    }else if(mk == 3){
                        name = '社会实践';
                    }else if(mk == 4){
                        name = '学业水平';
                    }else if(mk == 5){
                        name = '身心健康';
                    }
                    return name;
                },
                //计算百分比
                 percentage:function(num,total){
                     num = parseFloat(num);
                     total = parseFloat(total);
                     if (isNaN(num) || isNaN(total)) {
                         return "-";
                     }
                     return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%");
                 },
                //-------------------------
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        //0：管理员；1：教师；2：学生；3：家长
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        self.highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.grade_list=cloud.auto_grade_list();

                        var semester_full = cloud.grade_semester_list({grade_id: Number(self.grade_list[0].grade_id)});
                        // semester_full = sort_by(semester_full, ["-start_date"]);
                        // self.semester_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});

                        self.semester_list = sort_by(semester_full, ["-start_date"]);
                        self.req_data.fk_xq_id = self.semester_list[0].id;
                        self.class_list=self.grade_list[0].class_list;
                        self.grade_info =self.grade_list[0].grade_id;
                        self.req_data.fk_class_id =self.class_list[0].class_id;
                    //    获取班级学生
                        ajax_post(api_get_student,{fk_class_id:self.req_data.fk_class_id},self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //    获取学生
                            case api_get_student:
                                this.complete_get_student(data);
                                break;
                            //    综合实践
                            case api_get_practice:
                                this.complete_get_practice(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //获取学生
                complete_get_student:function(data){
                    this.stu_list = data.data.list;
                    //    综合实践
                    // ajax_post(api_get_practice,this.req_data.$model,this);
                    this.ajax_data();
                },
                //综合实践数据
                complete_get_practice:function(data){
                    this.sj_list = data.data.class_cnt;
                    this.sj_fl_list = data.data.hdsc_sort_detail;
                    //获取表头
                    // var thead = [];
                    // for(var i=0;i<this.sj_fl_list.length;i++){
                    //     var obj={};
                    //     obj.name = this.sj_fl_list[i].mkmc;
                    //     thead.push(obj);
                    // }
                    // this.thead_xs = thead;
                    this.lx_list = data.data.hdsc_detail;

                    //
                    // var stu_list = this.stu_list;
                    // //班级表：
                    // this.pra_bj = data.data.bj[0];
                    //
                    // //求百分比
                    // this.rj_sc =Number(this.pra_bj.lx_num)/stu_list.length;
                    // this.rj_sc = this.rj_sc.toFixed(2);
                    // this.xs_zb = Number(this.pra_bj.count_rs)/stu_list.length*100;
                    // this.xs_zb = this.xs_zb.toFixed(2)+'%';
                    // // this.xs_zb = this.percentage(,stu_list.length);
                    //
                    // //模块表：
                    // this.pra_mk = data.data.mk;
                    //
                    // //学生表：
                    // var xs = data.data.xs;
                    // //表头
                    // var thead = [];
                    // for(var i=0;i<this.pra_mk.length;i++){
                    //     var obj={};
                    //     obj.name = this.pra_mk[i].mkmc;
                    //     thead.push(obj);
                    // }
                    // this.thead_xs = thead;
                    // this.pra_xs = [];
                    // //表格数据合并
                    // if(xs.length == 0){//数据为空
                    //     for(var i=0;i<stu_list.length;i++){
                    //         var mk_value=[];
                    //         for(var j=0;j<this.pra_mk.length;j++){
                    //             var obj={};
                    //             obj.value= '';
                    //             mk_value.push(obj);
                    //         }
                    //         //模块值数组
                    //         stu_list[i].mk_value = mk_value;
                    //     //    上传材料总数
                    //         stu_list[i].all_mk = '';
                    //     }
                    //     this.pra_xs = stu_list;
                    // }else{//数据不为空
                    //     // var xs=[
                    //     //     {fk_xs_id:5260,mk_1:1,mk_2:2,mk_3:4,mk_4:5,mk_5:6},
                    //     //     {fk_xs_id:5263,mk_1:1,mk_2:2,mk_3:4,mk_4:5,mk_5:6}
                    //     // ];
                    //     for(var i=0;i<stu_list.length;i++){
                    //         var guid = stu_list[i].guid;
                    //         for(var j=0;j<xs.length;j++){
                    //             var id = xs[j].fk_xs_id;
                    //             if(guid == id){
                    //                 //mk_1	品德发展的遴选数;mk_2	艺术的遴选数;mk_3社会实践的遴选数
                    //                 //mk_4	学业水平的遴选数;mk_5	身体健康的遴选数
                    //                 stu_list[i].mk_1 =  xs[j].mk_1;
                    //                 stu_list[i].mk_2 =  xs[j].mk_2;
                    //                 stu_list[i].mk_3 =  xs[j].mk_3;
                    //                 stu_list[i].mk_4 =  xs[j].mk_4;
                    //                 stu_list[i].mk_5 =  xs[j].mk_5;
                    //                 stu_list[i].mk_all = xs[j].mk_1+xs[j].mk_2+xs[j].mk_3+xs[j].mk_4+xs[j].mk_5;
                    //                 break;
                    //             }else{
                    //                 stu_list[i].mk_1 =  0;
                    //                 stu_list[i].mk_2 =  0;
                    //                 stu_list[i].mk_3 =  0;
                    //                 stu_list[i].mk_4 =  0;
                    //                 stu_list[i].mk_5 =  0;
                    //                 stu_list[i].mk_all = 0;
                    //
                    //             }
                    //         }
                    //     }
                    //     this.pra_xs = stu_list;
                    // }
                    // // console.log(this.pra_xs)
                },
            });
            vm.cds();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
