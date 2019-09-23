/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_management', 'my_daily_results/my_daily_results','html!'),
        C.Co('self_evaluation_management', 'my_daily_results/my_daily_results','css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,three_menu_module) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "my_daily_results",
                semester_list:[],
                init:function () {
                    var semester_list = [];
                    var dataList = [];
                    var fk_grade_id = '';
                    var guid = '';
                    if(cloud.user_type()!=3){
                        fk_grade_id = cloud.user_grade_id();
                        guid = cloud.user_guid();
                    }
                    if(cloud.user_type()==3){
                        var studentInfo = JSON.parse(sessionStorage.getItem('studentInfo'));
                        fk_grade_id = studentInfo.fk_grade_id;
                        guid = studentInfo.guid;
                    }
                    semester_list = cloud.grade_semester_list({grade_id:fk_grade_id});

                    cloud.my_daily_result({guid:guid},function (url, s, data) {
                        dataList = data;
                        var dataLength = dataList.length;
                        var semesterLength = semester_list.length;
                        if(dataLength != 0){
                            for(var i = 0;i < semesterLength; i++){
                                for(var j = 0;j < dataLength; j++){
                                    if(dataList[j].fk_semester_id == semester_list[i].id){
                                        semester_list[i]['jl_fz'] = dataList[j].jl_fz;
                                        semester_list[i]['mbjh_fz'] =  dataList[j].mbjh_fz;
                                        semester_list[i]['rcbx_tc_fz'] =  dataList[j].rcbx_tc_fz;
                                        semester_list[i]['sjhd_fz'] =  dataList[j].sjhd_fz;
                                        semester_list[i]['z_fz'] =  dataList[j].z_fz;
                                    }
                                }
                            }
                        }else{
                            for(var i = 0;i < semesterLength; i++){
                                semester_list[i]['jl_fz'] = '';
                                semester_list[i]['mbjh_fz'] =  '';
                                semester_list[i]['rcbx_tc_fz'] =  '';
                                semester_list[i]['sjhd_fz'] =  '';
                                semester_list[i]['z_fz'] =  '';
                            }
                        }
                        vm.semester_list = semester_list;
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