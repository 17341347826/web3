define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'index_set/index_set', 'html!'),
        C.Co('all_index', 'index_set/index_set', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, table, three_menu_module) {
        var api_index_import = api.api + "Indexmaintain/batch_import_eval_index";
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "index-set",
                pro_grade_list:[],
                grade_list: [],
                grade_id: "",
                first_index_list: [],
                first_index_type: "",
                //当前年级状态下的所有评价要素及关键要素
                all_second_third:{
                    second_ary:[],
                    third_ary:[],
                },
                //三级指标
                detail_l3: [],
                //二级指标
                detail_l2: [],
                first_num: 0,
                false_data: [],//批量导入指标错误信息
                init: function () {
                    // this.grade_list = cloud.grade_all_list();
                    var g_list = cloud.auto_grade_list({});
                    var obj1= {grade_name:'请选择年级',id:'',remark:''};
                    g_list.splice(0,0,obj1);
                    this.pro_grade_list = g_list;
                    var gradeList = any_2_select(g_list, {name: "grade_name", value: ["id"]});
                    vm.grade_list = gradeList;
                    this.first_index_list = cloud.index_list_xz({});
                    this.first_index_list.reverse();
                    if (this.first_index_list.length == 0) {
                        return
                    }

                    this.first_index_id = this.first_index_list[0].id;
                    this.first_index_type = this.first_index_list[0].index_type;
                    // this.detail_l2 = cloud.ary_index_detail_xs_l2([this.first_index_id]);
                    // this.detail_l3 = cloud.ary_index_detail_xs_l3_gradeID([this.first_index_id],this.grade_id);
                    var all_detail = cloud.index__xz_sz_gradeID([this.first_index_id],this.grade_id);
                    this.all_second_third.second_ary = all_detail.second_ary;
                    this.all_second_third.third_ary = all_detail.third_ary;
                    var current_detail = this.get_s_t_index(all_detail,[this.first_index_id.toString()]);
                    this.detail_l2 = current_detail.second_ary;
                    this.detail_l3 = current_detail.third_ary;
                },
                /**
                 * 一二三级指标对应:
                 * info:{second_ary:l2,third_ary:l3}或者{third_ary:l3}；
                 * args:当前选中一级指标id数组
                 */
                get_s_t_index:function(info,args){
                    this.detail_l2 = [];
                    this.detail_l3 = [];
                    var s_ret = [];
                    var t_ret = [];
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
                        s_ret.push(s_ary[i]);
                        for(var x = 0; x < t_ary.length; x++){
                            if(t_ary[x].index_secondaryid == s_ary[i].id){
                                t_ret.push(t_ary[x]);
                            }
                        }
                    }
                    return {second_ary:s_ret,third_ary:t_ret};
                },
                as_status: function (status) {
                    if (status == 2)
                        return "已审核"
                    if (status == 1)
                        return "待审核"
                    if (status == 3)
                        return "未通过"

                },
                //关键表现：未通过鼠标放上去显示未通过原因
                no_pass_hover:function(status,reason,$index){
                    if(status == 3){
                        layer.tips(reason,'#index-state'+$index, {
                            tips: [3, '#50C9C1'],
                            time: 3000
                        });
                    }
                },
                cb: function () {
                },
                //年级转换
                garde_remark:function(name){
                    if(name == '七年级') return '7';
                    if(name == '八年级') return '8';
                    if(name == '九年级') return '9';
                    if(name == '请选择年级') return '';
                },
                //年级切换
                sel_check: function (info, index) {
                    // this.grade_id = info.value;
                    this.grade_id = '';
                    if(info != '' && info != null || info != undefined){
                        var g_name = this.pro_grade_list[index].remark;
                        this.grade_id = this.garde_remark(g_name);
                    }
                    if (this.first_index_list && this.first_index_list.length > 0) {
                        // this.detail_l3 = cloud.ary_index_detail_xs_l3_gradeID([this.first_index_id],this.grade_id);
                        var detail = cloud.index__xz_sz_gradeID([this.first_index_id],this.grade_id);
                        this.all_second_third.third_ary = detail.third_ary;
                        var current_detail = this.get_s_t_index(this.all_second_third,[this.first_index_id.toString()]);
                        this.detail_l2 = current_detail.second_ary;
                        this.detail_l3 = current_detail.third_ary;
                    }
                },
                //一级指标切换
                first_change: function (num, id) {
                    this.first_num = num;
                    this.first_index_id = id;

                    // this.detail_l2 = cloud.ary_index_detail_xs_l2([this.first_index_id]);
                    // this.detail_l3 = cloud.ary_index_detail_xs_l3_gradeID([this.first_index_id]);
                    var current_detail = this.get_s_t_index(this.all_second_third,[this.first_index_id.toString()]);
                    this.detail_l2 = current_detail.second_ary;
                    this.detail_l3 = current_detail.third_ary;
                },
                //添加指标
                add_index: function (index, index_state) {
                    if (index_state != 2 || index_state == undefined) {
                        //一级添加
                        if (index == 1) {
                            if (this.first_index_list.length == 0) {
                                window.location = "#add_first_index?index_type=" + 1 + "&grade_id=" + this.grade_id;

                            } else {
                                window.location = "#add_first_index?index_type=" + this.first_index_type + "&grade_id=" + this.grade_id;

                            }
                        } else if (index == 2) {
                            if (this.first_index_list.length == 0) {
                                //二级添加
                                window.location = "#a_a_element?index_type=" + 2 + "&grade_id=" + this.grade_id;

                            } else {
                                //二级添加
                                window.location = "#a_a_element?index_type=" + this.first_index_type + "&grade_id=" + this.grade_id;

                            }
                        } else {
                            if (this.first_index_list.length == 0) {
                                window.location = "#a-k-perform?index_type=" + 3 + "&grade_id=" + this.grade_id;
                            } else {
                                //三级添加
                                window.location = "#a-k-perform?index_type=" + this.first_index_type + "&grade_id=" + this.grade_id;

                            }
                        }
                    }

                },
                //一级指标修改
                edit_first_index:function(index,id){
                    window.location = "#add_first_index?index_type=" + index + "&id=" + id;
                },
                //指标编辑
                edit_index: function (index, index_state, id, el) {
                    console.log(el);
                    if (index_state != 2 || index_state == undefined) {
                        //一级添加
                        if (index == 1) {
                            window.location = "#add_first_index?index_type=" + this.first_index_type + "&grade_id=" + this.grade_id;
                        } else if (index == 2) {
                            //二级添加
                            window.location = "#a_a_element?index_type=" + this.first_index_type + "&grade_id=" + this.grade_id + "&id=" + id;
                        } else {
                            //三级添加
                            window.location = "#a-k-perform?index_type=" + this.first_index_type + "&grade_id=" + this.grade_id + "&id=" + id;
                        }
                    }

                },
                delete_index: function (num, id, $ind, index_state) {
                    if (index_state != 2 || index_state == undefined) {
                        this.delete_data(id, $ind, num)
                    }
                },
                delete_data: function (id, $ind, num) {
                    var self = this;
                    layer.confirm('你确定要删除吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        //删除
                        toastr.info('正在删除中', {icon: 1});
                        cloud.del_first_index({id: id}, function () {
                            if (num == 1) {
                                vm.first_index_list.splice($ind, 1);
                            }
                            if (num == 2) {
                                vm.detail_l2.splice($ind, 1);
                            }
                            if (num == 3) {
                                vm.detail_l3.splice($ind, 1);
                            }
                            layer.closeAll();
                        });

                    });
                },
                //修改指标的启停用
                update_use_state: function (index_rank, id, use_state, ind, index_state) {
                    var self = this;
                    if (use_state == 1) {
                        layer.open({
                            title: "提示",
                            content: '是否停用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                cloud.upd_idnex_use({id: id, index_use_state: 2,index_state:index_state}, function (url, args, data) {
                                    if (index_rank == 2) {
                                        self.detail_l2[ind].index_use_state = 2;
                                    } else {
                                        self.detail_l3[ind].index_use_state = 2;
                                    }
                                });

                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else {
                        layer.open({
                            title: "提示",
                            content: '是否启用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                cloud.upd_idnex_use({id: id, index_use_state: 1,index_state:index_state});
                                if (index_rank == 2) {
                                    self.detail_l2[ind].index_use_state = 1;
                                } else {
                                    self.detail_l3[ind].index_use_state = 1;
                                }
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                    // if (index_state == 2) {
                    //     var self = this;
                    //     if (use_state == 1) {
                    //         layer.open({
                    //             title: "提示",
                    //             content: '是否停用该指标？',
                    //             btn: ['确定', '取消'],
                    //             yes: function (index, layero) {
                    //                 cloud.upd_idnex_use({id: id, index_use_state: 2,index_state:index_state}, function (url, args, data) {
                    //                     if (index_rank == 2) {
                    //                         self.detail_l2[ind].index_use_state = 2;
                    //                     } else {
                    //                         self.detail_l3[ind].index_use_state = 2;
                    //                     }
                    //                 });
                    //
                    //                 layer.close(index);
                    //             },
                    //             btn2: function (index, layero) {
                    //                 layer.close(index);
                    //             }
                    //         });
                    //     } else {
                    //         layer.open({
                    //             title: "提示",
                    //             content: '是否启用该指标？',
                    //             btn: ['确定', '取消'],
                    //             yes: function (index, layero) {
                    //                 cloud.upd_idnex_use({id: id, index_use_state: 1,index_state:index_state});
                    //                 if (index_rank == 2) {
                    //                     self.detail_l2[ind].index_use_state = 1;
                    //                 } else {
                    //                     self.detail_l3[ind].index_use_state = 1;
                    //                 }
                    //                 layer.close(index);
                    //             },
                    //             btn2: function (index, layero) {
                    //                 layer.close(index);
                    //             }
                    //         });
                    //     }
                    // } else {
                    //     toastr.warning('该指标暂未审核，不可启用');
                    // }
                },
                file_name: "",
                modal_msg: "",
                index_import: function () {
                    $("#file").val("");
                    this.file_name = "";
                    this.modal_msg = "";
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });

                },
                /*模版下载*/
                down_index: function () {
                    var HTTP_X = location.origin;
                    window.open(HTTP_X + "/common/template/指标信息模板.xls");
                },
                /*上传*/
                uploading: function () {
                    this.false_data = [];
                    var files = this.file_name;
                    var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        // var params = $("#uploadForm").serialize();
                        // ajax_post(api_index_import,{},this);
                        fileUpload(api_index_import, this)
                    } else {
                        vm.modal_msg = '请上传excel文件'
                    }

                },
                cancel: function () {
                    this.false_data = [];
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_index_import:
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                toastr.success('导入成功');
                                vm.init();
                                break;

                        }
                    } else {
                        if (cmd == api_index_import) {
                            this.false_data = data.data;
                        }
                        toastr.error(msg)
                    }
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