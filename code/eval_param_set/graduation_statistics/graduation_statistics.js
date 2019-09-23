/**
 * Created by Administrator on 2018/7/16.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "graduation_statistics/graduation_statistics", "css!"),
        C.Co("eval_param_set", "graduation_statistics/graduation_statistics", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon, css, html, layer,data_center,three_menu_module) {
        //获取年级(市级 区县)
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询毕业报告是否已生成
        var api_query_generate=api.api+'Indexmaintain/bybgWeightSet_queryIsGenerate';
        //生成毕业统计
        var api_generate_count=api.api+'Indexmaintain/bybg_operation_generate_by_count';
        //查询当前年级公示的等级
        var api_grade_publish = api.api+'Indexmaintain/query_public_rank';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "graduation_statistics",
                //发布状态:-1-统计 发布=1，撤销发布=0
                is_publish:-1,
                //年级集合
                grade_list:[],
                //统计结果
                sta_data:[],
                //是否能生成:0-不能生成；1-能生成 2-发布公示 3-撤销公示
                pro_change:'',
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        //获取市管理员年级集合
                        ajax_post(api_get_grade,{status:1},self);
                    });
                },
                //计算统计
                produce:function(params){
                    // console.log(params);
                    var id=params.id;
                    layer.load(1, {
                        shade: [0.1,'#fff'] //0.1透明度的白色背景
                    });
                    ajax_post(api_generate_count,{grade_id:id},this);
                },
                //发布公式、撤销公示
                publish_btn:function(){
                    window.location = '#graduation_result_view';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            // 查询毕业报告是否已生成
                            case api_query_generate:
                                this.complete_query_generate(data);
                                break;
                            //获取毕业报告当前是否发布撤销发布
                            case api_grade_publish:
                                this.complete_grade_publish(data);
                                break;
                            // 生成统计
                            case api_generate_count:
                                if(msg != 'OK'){
                                    toastr.error(msg);
                                    return;
                                }
                                this.complete_generate_count(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                    if(cmd==api_generate_count){
                        layer.closeAll();
                    }
                },
                complete_get_grade:function(data){
                    this.grade_list=data.data;
                    var list=data.data;
                    var ids='';
                    for(var i=0;i<list.length;i++){
                        if(i==list.length-1){
                            ids=ids+list[i].id;
                        }else{
                            ids=ids+list[i].id+',';
                        }
                    }
                    ajax_post(api_query_generate,{grade_ids:ids},this);
                },
                //生成年级
                pro_grade:'',
                //合并
                complete_query_generate:function(data){
                    var grade= this.grade_list;
                    if(data.data != null){
                        var pro = data.data;
                        //合并年级和生成
                        for(var i=0;i<grade.length;i++){
                            for(var j=0;j<pro.length;j++){
                                if(grade[i].id==pro[j].gradeId){
                                    grade[i].isGenerate=pro[j].isGenerate;
                                    grade[i].pro_change=1;
                                }
                            }
                            if(grade[i].hasOwnProperty('isGenerate')==false){
                                grade[i].isGenerate=0;
                                grade[i].pro_change=0;
                            }
                        }
                        this.grade_list = grade;
                        //公示状态接口
                        var pub_type = false;
                        for(var i=0;i<pro.length;i++){
                            var id = pro[i].gradeId;
                            //当前报告已生成
                            if(pro[i].isGenerate == 1) {
                                this.pro_grade = id;
                                pub_type = true;
                                ajax_post(api_grade_publish, {grade_id: id}, this);
                            }
                        }
                        if(pub_type == false){
                            this.sta_data = grade;
                        }

                    }else{
                        for(var i=0;i<grade.length;i++) {
                            grade[i].isGenerate=0;
                            grade[i].pro_change=0;
                        }
                        this.sta_data=grade;
                    }
                    // if(data.data!=null){
                    //     var pro=data.data.list;
                    //     for(var i=0;i<grade.length;i++){
                    //         for(var j=0;j<pro.length;j++){
                    //             if(grade[i].id==pro[j].gradeId){
                    //                 grade[i].isGenerate=pro[j].isGenerate;
                    //                 grade[i].pro_change=1;
                    //             }
                    //         }
                    //         if(grade[i].hasOwnProperty('isGenerate')==false){
                    //             grade[i].isGenerate=0;
                    //             grade[i].pro_change=0;
                    //         }
                    //     }
                    // }else{
                    //     for(var i=0;i<grade.length;i++) {
                    //         grade[i].isGenerate=0;
                    //         grade[i].pro_change=0;
                    //     }
                    // }
                    // this.sta_data=grade;
                },
                complete_grade_publish:function(data){
                    console.log(this.grade_list);
                    var grade = this.grade_list;
                    //生成列表数据
                    var pub = data.data;
                    for(var i=0;i<grade.length;i++){
                        var id = grade[i].id;
                        if(id == this.pro_grade && pub == null){//发布公式
                            grade[i].pro_change = 2;
                        }else if(id == this.pro_grade && pub != null){//撤销公示
                            grade[i].pro_change = 3;
                        }
                    }
                    this.sta_data=grade;
                },
                complete_generate_count:function(data){
                    toastr.success('生成毕业统计成功！');
                    //获取市管理员年级集合
                    ajax_post(api_get_grade,{status:1},this);
                },
            });
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
