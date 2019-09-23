/**
 * Created by Administrator on 2018/6/15.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_results', 'by_evaluation_results/by_evaluation_results','html!'),
        C.Co('self_evaluation_results', 'by_evaluation_results/by_evaluation_results','css!'),
        C.CM("three_menu_module"),
        C.CMF("data_center.js"),
        C.CM('page_title')
    ],
    function ($,avalon,layer,html,css,three_menu_module,data_center,page_title) {
        //获取表头
        var api_get_table_head=api.api+"Indexmaintain/bybg_get_all_index_name";
        //获取数据
        var api_get_info=api.api+"Indexmaintain/bybg_operation_by_count_result_view";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "by_evaluation_results",
                //表头
                tbodyThead:[],
                //毕业数据
                get_info:[],
                form:{
                    //number	年级id
                    grade_id: '',
                    class_id: '',
                    //string	要筛选的评价等级A,B,C,D
                    rank: '',
                    //是否归档	number	1，已归档0，未归档
                    is_file:1,
                    //是否发布	number	1，已发布，0未发布
                    is_publish:1,
                    //学生学号
                    stu_num:''
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType=data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest=data.data.highest_level;
                        if(userType == 2){
                            self.form.stu_num = dataList.account;
                            self.form.grade_id = dataList.fk_grade_id;
                            self.form.class_id = dataList.fk_class_id;
                            var school_id = dataList.fk_school_id;
                        }else if(userType == 3){
                            var stu = dataList.student;
                            self.form.stu_num = stu.account;
                            self.form.grade_id = stu.fk_grade_id;
                            self.form.class_id = stu.fk_class_id;
                            var school_id = stu.fk_school_id
                        }
                        //表头
                        ajax_post(api_get_table_head, {
                            grade_id: self.form.grade_id,
                            school_id:school_id,
                        }, self)
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取表头
                            case api_get_table_head:
                                this.complete_get_table_head(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //获取表头
                complete_get_table_head:function (data) {
                    if (!data.data || data.data.zb_name == '')
                        return;
                    this.tbodyThead = data.data.zb_name.split(',');
                    //结果查看
                    this.get_table_data();
                },
                //结果查看
                get_table_data: function () {
                    this.get_info = [];
                    //获取数据
                    ajax_post(api_get_info,this.form,this);
                },
                //得到数据
                complete_get_info:function (data) {
                    if(data.data!=null){
                        var list = data.data.list;
                        var list_length = list.length;
                        for (var i = 0; i < list_length; i++) {
                            var index_value = [];
                            if (list[i].index_value == null || list[i].index_value == '') {
                                var table_title_length = this.tbodyThead.length;
                                for (var k = 0; k < table_title_length; k++) {
                                    var str = '';
                                    index_value.push(str);
                                }
                            } else {
                                index_value = list[i].index_value.split(',');
                                if(list[i][list[i].length-1]==",")
                                    index_value.pop();
                            }
                            list[i].values = index_value;
                        }
                        this.get_info = list;
                    }
                },
                init:function(){
                    this.cb();
                },

            });
            vm.$watch('onReady', function () {
                vm.init();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });