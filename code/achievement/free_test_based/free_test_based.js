/**
 * Created by Administrator on 2018/3/12.
 */
define([C.CLF('avalon.js'), "jquery", "layer", "select2",
        C.Co("achievement","free_test_based/free_test_based", "css!"),
        C.Co("achievement","free_test_based/free_test_based", "html!"),
        C.CMF("viewer/viewer.js"), C.CMF("uploader/uploader.js"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon, $, layer, select2, css, html, viewer, uploader, x, data_center, three_menu_module) {
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //获取学生信息
        var api_student_info = api.user + "baseUser/studentlist.action";
        // var api_student_info= api.PCPlayer + "student/class_used_stu";
        //标记为免考
        var api_save_free_exempt = api.api + "score/health_flag_exempt";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "free_test_based",
                type: "",
                files: [],
                student_arr: "",
                //学生信息
                student_info: [],
                //请求参数
                request_data: {
                    uploader_url: api_file_uploader,
                    form: {
                        attachment:[],
                        //城市	string
                        city:'',
                        // 学籍号	string
                        code:'',
                        //区县	string
                        district:'',
                        //省份	string
                        province:'',
                        //学生性别	string
                        sex:'',
                        //学生guid	number
                        guid:'',
                        //学生名称 string
                        name:'',
                        //班级名称
                        class_name:'',
                        //年级名称
                        grade_name:'',
                        //班级id	string
                        fk_class_id:pmx.fk_class_id.toString(),
                        //年级id	string
                        fk_grade_id	:pmx.fk_grade_id.toString(),
                        //学校id	string
                        fk_school_id:pmx.fk_school_id.toString(),
                        //体质测评项目id	string
                        project_id:pmx._id,
                        //学期结束时间	string
                        year_end:pmx.year_end,
                        //学期开始时间	string:
                        year_start:pmx.year_start,
                    }
                },
                /*提交*/
                save_daily: function (e) {
                    // console.log($("#student_select").val());
                    //学生
                    var student_info = $("#student_select").val().split('|');
                    this.request_data.form.guid=Number(student_info[0]);
                    this.request_data.form.name=student_info[1];
                    this.request_data.form.code=student_info[2];
                    this.request_data.form.province=student_info[3];
                    this.request_data.form.district=student_info[4];
                    this.request_data.form.city=student_info[5];
                    this.request_data.form.sex=student_info[6];
                    this.request_data.form.class_name=student_info[8];
                    this.request_data.form.grade_name=student_info[7];
                    //依据
                    var uploaderWorks = data_center.ctrl("uploader_free_based");
                    var is_complete = uploaderWorks.is_finished();
                    if (student_info==0 || student_info==null || student_info=='') {
                        toastr.warning('请选择学生');
                    }else{
                        if (is_complete == true) {
                            var files = uploaderWorks.get_files();
                            this.request_data.form.attachment = JSON.stringify(files);
                            var self=this;
                            if(files.length==0){
                                layer.alert('该条记录需要上传相关证据，如无证据将不能申请免测', {
                                    // skin: 'layui-layer-lan'
                                    closeBtn: 0
                                    ,anim: 4 //动画类型
                                });
                            }else{
                                ajax_post(api_save_free_exempt, self.request_data.form, self);

                            }
                            // ajax_post(api_save_free_exempt, this.request_data.form, this);
                        }
                    }


                },
                //取消
                back:function(){
                    window.location.href = '#school_health';
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        if (cArr.length == 1 && cArr[0].class_list.length == 1) {//一个年级一个班主任
                            var id=cArr[0].class_list[0].class_id;
                            //获取学生信息
                            ajax_post(api_student_info, {fk_class_id:id,status:'1'}, self);
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学生信息
                            case api_student_info:
                                this.complete_student_info(data);
                                break;
                            //    保存
                            case api_save_free_exempt:
                                this.complete_save_free_exempt(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_student_info: function (data) {
                    if (data.data.list == "") {
                        toastr.error("暂无学生信息");
                        this.student_arr = [];
                    } else {
                        this.student_arr = data.data.list;
                    }
                },
                complete_save_free_exempt: function (data) {
                    layer.confirm('是否继续对其他学生添加免测', {
                        btn: ['确定', '取消'] //按钮
                    }, function() {
                        //强制刷新当前页面
                        history.go(0);
                        layer.closeAll();
                    },function () {
                        window.location='#school_health';
                        layer.closeAll();
                    });
                },
            });
            vm.$watch('onReady', function () {
                vm.cb();
                $(".js-example-basic-single").select2();
                $("#student_select").on("change", function (e) {
                    vm.student_info = $("#student_select").val();
                });
            });
            // vm.cb();
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: {startDate: "my-datepicker", type: 3}
        }
    });