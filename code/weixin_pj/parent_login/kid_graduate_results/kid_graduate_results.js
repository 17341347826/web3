/**
 * Created by Administrator on 2018/9/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj/parent_login", "kid_graduate_results/kid_graduate_results", "css!"),
        C.Co("weixin_pj/parent_login", "kid_graduate_results/kid_graduate_results", "html!"),
        C.CMF("data_center.js"),
        "jquery-weui",C.CLF('base64.js')
    ],
    function ($, avalon,css, html, data_center,weui,bs64) {
        //获取表头
        var api_get_table_head=api.api+"Indexmaintain/bybg_get_all_index_name";
        //获取数据
        var api_get_info=api.api+"Indexmaintain/bybg_operation_by_count_result_view";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "kid_graduate_results",
                //登陆者信息-学生信息
                ident_info:{},
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
                    is_publish:'',
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
                            self.ident_info = dataList;
                            self.form.stu_num = dataList.account;
                            self.form.grade_id = dataList.fk_grade_id;
                            self.form.class_id = dataList.fk_class_id;
                            var school_id = dataList.fk_school_id;
                        }else if(userType == 3){
                            var stu = dataList.student;
                            self.ident_info = stu;
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
                //毕业档案
                graduate_archives:function(el){
                    var info = this.ident_info;
                    var portfolio_stu = info.guid + '|' + info.grade_name + '|' + info.fk_grade_id + '|' + info.fk_school_id + '|' +
                        info.sex + '|' + info.province + '|' + info.city + '|' + info.district + '|' + info.fk_class_id + '|' + info.code;
                    var param = {
                        class_id: info.fk_class_id,
                        grade_id: info.fk_grade_id,
                        stu_num: info.stu_num,
                        school_id:info.fk_school_id
                    };
                    cloud.get_bybg_count_result_list(param, function (url, args, data) {
                        if (data == null || data.list.length == 0) {
                            $.alert("该学生还未生成毕业评价数据!");
                        } else {
                            sessionStorage.setItem('portfolio_stu', portfolio_stu);
                            sessionStorage.setItem('g_export_data',JSON.stringify(self.export_extend));
                            var token = sessionStorage.getItem('token');
                            var bs_info = bs64.encoder(portfolio_stu);
                            var f_url = '/Growth/index.html#graduation_file?portfolio_stu='+bs_info;
                            var url = bs64.encoder(f_url);
                            window.console.info(url);
                            var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                            window.open(dz)
                        }
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
                        $.alert(msg);
                    }
                },
                //获取表头
                complete_get_table_head:function (data) {
                    // var list = [
                    //     {
                    //         semester_name:'2017-2018学年（上）',
                    //         values:[
                    //             {name:'思想品德',score:12},
                    //             {name:'学业水平',score:13},
                    //             {name:'艺术素养',score:14},
                    //             {name:'社会实践',score:15},
                    //             {name:'身心健康',score:16},
                    //         ],
                    //         score_plus:24,
                    //         zf:94,
                    //         rank:'B'
                    //     }
                    // ];
                    // this.get_info = list;
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
                                    var obj = {};
                                   obj.name = this.tbodyThead[k];
                                   obj.score = '';
                                    index_value.push(obj);
                                }
                            } else {
                                values = list[i].index_value.split(',');
                                if(list[i][list[i].length-1]==",")
                                    values.pop();
                                var table_title_length = this.tbodyThead.length;
                                for (var k = 0; k < table_title_length; k++) {
                                    var obj = {};
                                    obj.name = this.tbodyThead[k];
                                    obj.score = values[k];
                                    index_value.push(obj);
                                }
                            }
                            list[i].values = index_value;
                        }
                        this.get_info = list;
                        // console.log(this.get_info);
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