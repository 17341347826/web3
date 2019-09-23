/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_management', 'my_term_results/my_term_results','html!'),
        C.Co('self_evaluation_management', 'my_term_results/my_term_results','css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,three_menu_module) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "my_term_results",
                data:{
                    fk_grade_id:"",
                    fk_semester_id:"",
                    guid:"",
                    listType:10,
                    workid:"",
                    offset:0,
                    rows:999
                },
                semester_list:[],
                info:[],
                index:"",
                head:[],
                init:function () {
                    var semester_list = [];
                    var dataList = [];
                    var user_type = cloud.user_type();
                    if(user_type != 3){//目前只知道学生也会用
                        this.data.fk_grade_id = cloud.user_grade_id();
                        this.data.guid = cloud.user_guid();
                        this.data.workid = cloud.user_school_id();
                    }else if(user_type == 3){//家长
                        this.data.fk_grade_id = cloud.parent_stu().fk_grade_id;
                        this.data.guid = cloud.parent_stu().guid;
                        this.data.workid = cloud.parent_stu().fk_school_id;
                    }
                    semester_list = cloud.grade_semester_list({grade_id:this.data.fk_grade_id});
                    cloud.my_term_result(vm.data.$model,function (url, s, data) {
                        dataList = data;
                        var dataLength = dataList.length;
                        //获取表头
                        for(var i=0;i<dataList.length;i++){
                            if(dataList[i].evaluate_grade_list.length>0){
                                vm.head = dataList[i].evaluate_grade_list;
                                break;
                            }
                        }
                        if(dataLength != 0){
                            var semesterLength = semester_list.length;
                            for(var i = 0;i < semesterLength; i++){
                                for(var j = 0;j < dataLength; j++){
                                    if(dataList[j].semester_id == semester_list[i].id){
                                        semester_list[i]['list'] = dataList[j].evaluate_grade_list;
                                        semester_list[i]['sum_score'] =  dataList[j].sum_score;
                                        semester_list[i]['daily_evaluation_score'] =  Number(dataList[j].daily_evaluation_score).toFixed(1);
                                        semester_list[i]['grade_name'] =  dataList[j].grade_name;
                                        vm.index = i;
                                    }
                                }
                            }
                            //组表格数据
                            for(var i=0;i<semester_list.length;i++){
                                if(semester_list[i].hasOwnProperty('list')){
                                    var len = semester_list[i].list.length;
                                    if(len == 0){
                                        for(var j=0;j<vm.head.length;j++){
                                            var obj = {};
                                            obj.signname1 = '';
                                            obj.evaluate_score = '';
                                            semester_list[i].list.push(obj);
                                        }
                                    }
                                }else{
                                    semester_list[i]['list'] = [];
                                    for(var j=0;j<vm.head.length;j++){
                                        var obj = {};
                                        obj.signname1 = '';
                                        obj.evaluate_score = '';
                                        semester_list[i]['list'].push(obj);
                                    }
                                }

                            }
                            vm.semester_list = semester_list;
                            // console.log(vm.head);
                            console.log(vm.semester_list);

                        }

                    })
                }
            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });