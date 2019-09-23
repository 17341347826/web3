/**
 * Created by uptang on 2017/4/28.
 */

define(['jquery',
        C.CLF("avalon.js"),
        C.Co2("weixin_pj", "input_information", "css!"),
        C.Co2("weixin_pj", "input_information", "html!"),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"),
        C.CMF("uploader/uploader.js"),
        "select2",
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, css, html, data_center, viewer, uploader, select2,formatUtil) {
        avalon.filters.sub_event_name = function (str) {
            if (str.length > 10) {
                return str.substr(0, 10) + '...';
            } else {
                return str;
            }
        }
        var avalon_define = function () {
            //文件上传
            var api_file_uploader = api.api + "file/uploader";
            //获取学生信息
            var api_art_evaluation_get_student_info = api.PCPlayer + "baseUser/studentlist.action";
            //指标查询
            var api_index_check = api.api + "Indexmaintain/indexmaintain_findByIndexName";
            //保存录入
            var api_save_daily_performance = api.api + "everyday/save_or_update_everyday";
            //修改回显数据
            var wx_daily_create = avalon.define({
                $id: "input_information",
                //获取的所有的学生
                student_arr: [],
                events_arr: [],
                //点击添加的时候需要发送的数据
                response_data: {
                    fk_class_id: '',
                    third_index_form: {
                        // //单位ID
                        // index_workid: "",
                        //级别
                        index_rank: 3,
                        index_apply: "日常表现"
                    }
                },
                request_data: {
                    uploader_url: api_file_uploader,
                    form: {
                        attachment: "",
                        class_name: "",

                        //描述
                        description: "",
                        //日常表现时间
                        everyday_date: "",
                        fk_class_id: "",
                        fk_grade_id: "",
                        fk_school_id: "",
                        frist_index: "",
                        frist_index_id: "",
                        grade_name: "",

                        id: "",
                        //评价项
                        item: "",
                        item_id: "",
                        //加分类型 1加分2减分
                        mark_type: "",

                        school_name: "",
                        score: "",
                        second_index: "",
                        second_index_id: "",
                        student_list: [],
                    }
                },
                //选择的日期
                select_date: '',
                //描述
                descript: '',
                //加减的分数
                score: '',
                //选择的名字
                stu_message: {
                    select_name: '请选择',
                    select_id: '',
                    select_code: ''
                },
                events_message: {
                    event_name: '请选择',
                    event_id: ''
                },

                name_search_value: '',
                event_search_value: '',
                clear_name_list: function () {
                    this.name_search_value = '';
                    this.search_name();
                },
                //打开姓名下拉菜单
                open_name_popup: function () {
                    $("#name-popup").popup();
                    this.search_name();
                },
                //搜索框事件
                search_name: function () {
                    var val = this.name_search_value;
                    var obj = $("#name_sel_container ul");
                    this.nameSearch(val, obj);
                },
                //事件下拉菜单
                open_event_popup: function () {
                    $("#enent-popup").popup();
                    this.search_event();
                },
                search_event: function () {
                    var val = this.event_search_value;
                    var obj = $("#event_sel_container ul");
                    this.nameSearch(val, obj);
                },

                nameSearch: function (name, obj) {
                    var val = name;
                    var lis = obj.find("li");
                    var str = "";
                    if (val != null && val.length > 0) {
                        for (var i = 0; i < lis.length; i++) {
                            var index = lis.eq(i).text().indexOf(val);
                            if (index >= 0) {
                                lis.eq(i).show();
                                str += i;
                            } else {
                                lis.eq(i).hide();
                            }
                        }
                    } else {
                        lis.show();
                        str = "";
                    }
                },
                //选择学生
                student_change:function () {
                    for(var i=0;i<this.student_arr.length;i++){
                        if(this.stu_message.select_id==this.student_arr[i].guid){
                            this.stu_message.select_name = this.student_arr[i].name;
                            this.stu_message.select_code = this.student_arr[i].code;
                            break;
                        }
                    }
                },
                init: function () {
                    $("#date").calendar({
                        onChange: function (p, values, displayValues) {
                            console.log(values, displayValues);
                        }
                    });
                    // $("#date-sel").datetimePicker();
                    this.file_uploader();
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        if (userType == "1") {//老师
                            //一个年级一个班主任
                            if (cArr.length == 1 && cArr[0].class_list.length == 1) {
                                self.request_data.form.fk_class_id = Number(cArr[0]['class_list'][0].class_id);
                                self.request_data.form.fk_grade_id = Number(cArr[0].grade_id);
                                self.request_data.form.fk_school_id = Number(cArr[0].school_id);
                                self.request_data.form.class_name = cArr[0]['class_list'][0].class_name;
                                self.request_data.form.school_name = cArr[0].school_name;
                                self.request_data.form.grade_name = cArr[0].grade_name;
                                self.response_data.fk_class_id = cArr[0]['class_list'][0].class_id;
                                // self.response_data.third_index_form.index_workid = Number(cArr[0].school_id);
                            }
                        }
                        else if (userType == "2") {
                            self.response_data.fk_class_id = tUserData.fk_class_id;
                            self.request_data.form.fk_class_id = Number(tUserData.fk_class_id);
                            self.request_data.form.fk_grade_id = Number(tUserData.fk_grade_id);
                            self.request_data.form.fk_school_id = Number(tUserData.fk_school_id);
                            self.request_data.form.class_name = tUserData.class_name;
                            self.request_data.form.school_name = tUserData.school_name;
                            self.request_data.form.grade_name = tUserData.grade_name;
                        }
                        self.get_some_msg();

                    });
                },
                end_load_names: false,
                end_load_event: false,

                file_arr: [],
                get_some_msg: function () {
                    $.showLoading();
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.response_data.fk_class_id}, this);
                    ajax_post(api_index_check, this.response_data.third_index_form, this);
                },
                //获取事件
                get_item_index: function () {
                },
                stu_name_li: function (id, name, code) {
                    this.stu_message.select_name = name;
                    this.stu_message.select_code = code;
                    this.stu_message.select_id = id;
                    $.closePopup();
                    this.name_search_value = '';
                },
                //判断是否是图片文件
                is_img_file: true,
                //是否确认上传文件
                not_up_loader: false,
                //判断是否重复文件上传
                file_name_arr: [],
                //是否显示加载效果
                // hide_uploader:false,
                //加载未完成按钮不能点击
                sub_disabled: false,
                disabled_class: 'disabled_class',
                all_load_index: 0,
                load_success_index: 0,
                can_hide_uploader: false,
                files_g: [],
                //关键表现分值开始值
                index_start_interval:'',
                //关键表现分值结束值
                index_end_interval:'',
                file_uploader: function () {
                    var self = this;
                    var $gallery = $("#gallery"), $galleryImg = $("#galleryImg");
                    var tmpl = '<li class="weui-uploader__file" style="background-image:url(#url#)"></li>',
                        $uploaderInput = $("#uploaderInput"),
                        $uploaderFiles = $("#uploaderFiles");
                    $uploaderInput.on("change", function (e) {

                        self.sub_disabled = true;
                        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;

                        //初始化加载成功的数量
                        self.all_load_index = files.length;
                        self.load_success_index = 0;
                        for (var i = 0, len = files.length; i < len; ++i) {
                            var file = files[i];
                            if (url) {
                                src = url.createObjectURL(file);
                            } else {
                                src = e.target.result;
                            }
                            self.deal_file(file, tmpl, src, i, len);
                            if (self.not_up_loader) {
                                break;
                            }
                        }
                        if (self.not_up_loader) {
                            $("#uploaderInput").val('');
                            var uploader_files_length = $('#uploaderFiles').children().length;
                            if (uploader_files_length > 0) {
                                $("#uploaderFiles").empty();
                            }
                            if (self.file_arr.length > 0) {
                                self.file_arr = [];
                            }
                            $.hideLoading();
                            return;
                        }
                        for (var i = 0, len = files.length; i < len; ++i) {
                            var file = files[i];
                            var suffix_name_arr = file.name.split('.');
                            var suffix_name = suffix_name_arr[suffix_name_arr.length - 1];
                            if (suffix_name == 'jpg' || suffix_name == 'jpeg' || suffix_name == 'png') {
                                self.deal_img(file).then(function () {
                                    if (self.not_up_loader) {
                                        $("#uploaderInput").val('');
                                        self.file_name_arr = [];
                                        self.sub_disabled = false;
                                        var uploader_files_length = $('#uploaderFiles').children().length;
                                        if (uploader_files_length > 0) {
                                            $("#uploaderFiles").empty();
                                        }
                                        if (self.file_arr.length > 0) {
                                            self.file_arr = [];
                                        }
                                    }
                                })
                            }
                        }


                    });
                    $uploaderFiles.on("click", "li", function () {
                        $galleryImg.attr("style", this.getAttribute("style"));
                        $gallery.fadeIn(100);
                    });
                    $gallery.on("click", function () {
                        $gallery.fadeOut(100);
                    });


                },
                //判断图片大小
                deal_img: function (file) {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        var reader = new FileReader;
                        reader.readAsDataURL(file);
                        reader.onload = function (evt) {
                            var image = new Image();
                            image.onload = function () {
                                var width = this.width;
                                var height = this.height;
                                var ratio = width > height ? height / width : width / height;//长宽比
                                if (width < 300 || height < 300 || ratio < 0.5) {
                                    $.alert("图片长宽不合格");
                                    self.not_up_loader = true;
                                    resolve(self.not_up_loader);
                                } else {
                                    self.not_up_loader = false;
                                    resolve(self.not_up_loader);
                                }
                            }
                            image.src = evt.target.result;
                        }
                    })
                },
                delete_img: function () {
                    var bc_url = $("#galleryImg").css('backgroundImage');
                    var bc_url_arr = bc_url.split('/');
                    var url_str = bc_url_arr[bc_url_arr.length - 1];
                    var url = url_str.split('"')[0];
                },
                //处理文件
                deal_file: function (file, tmpl, src, index, len) {
                    var self = this;
                    var valid_fmt = ['mp4', 'wmv', 'avi', 'rmvb', "pdf", "pptx", "doc",
                        "xls", "txt", "docx", "jpg", "jpeg", "png", "rar", "xlsx"];
                    var suffix_name_arr = file.name.split('.');
                    var suffix_name = suffix_name_arr[suffix_name_arr.length - 1];
                    suffix_name = suffix_name.toLowerCase();
                    if (valid_fmt.indexOf(suffix_name) < 0) {
                        $.alert("文件格式不支持");
                        self.file_name_arr = [];
                        self.sub_disabled = false;
                        self.not_up_loader = true;
                    } else if (file.size > 100 * 1024 * 1024) {
                        $.alert("文件过大");
                        self.sub_disabled = false;
                        self.file_name_arr = [];
                        self.not_up_loader = true;
                    } else {
                        if (suffix_name == 'jpg' || suffix_name == 'jpeg' || suffix_name == 'png') {
                            self.is_img_file = true;
                        } else {
                            self.is_img_file = false;
                        }
                        self.not_up_loader = false;
                        if (!self.not_up_loader) {
                            for (var i = 0; i < self.file_name_arr.length; i++) {
                                if (file.name == self.file_name_arr[i]) {
                                    self.sub_disabled = false;
                                    return
                                }
                            }
                            self.file_name_arr.push(file.name);
                            if (!self.is_img_file) {
                                $("#uploaderFiles").append($(tmpl.replace('#url#', 'common/images/file.png')));
                            } else {
                                $("#uploaderFiles").append($(tmpl.replace('#url#', src)));
                            }
                            var fm = new FormData();
                            fm.append("file", file, file.name);
                            fm.append("note", "from weixin");
                            fm.append("token", window.sessionStorage.getItem("token"));
                            if (index == 0) {
                                $.showLoading();
                            }
                            // if(index==len-1){
                            //     self.hide_uploader = true;
                            // }

                            fileUpload(api_file_uploader, self, fm);
                        }

                    }


                },

                submit_btn: function () {

                    //如果不能点击，不执行
                    if (this.sub_disabled) {
                        return;
                    }
                    var obj = {
                        code: this.stu_message.select_code,
                        guid: this.stu_message.select_id,
                        name: this.stu_message.select_name
                    };
                    this.request_data.form.student_list.push(obj);
                    this.request_data.form.description = this.descript;
                    this.request_data.form.everyday_date = this.select_date;
                    var str = '[';
                    for (var i = 0; i < this.file_arr.length; i++) {

                        if (i == this.file_arr.length - 1) {
                            str = str + this.file_arr[i];
                        } else {
                            str = str + this.file_arr[i] + ',';
                        }
                    }
                    str += ']';
                    this.request_data.form.attachment = str;
                    this.request_data.form.item_id = this.events_message.event_id;
                    this.request_data.form.item = this.events_message.event_name;
                    if (this.request_data.form.student_list.length == 0) {
                        $.alert("请选择学生")
                        return;
                    } else if (this.events_message.event_id == '') {
                        $.alert("请选择事件")
                        return;
                    } else if (this.request_data.form.everyday_date == '') {
                        $.alert("请选择日期")
                        return;
                    } else if (this.request_data.form.description == '') {
                        $.alert("请填写描述")
                        return;
                    } else if (this.request_data.form.mark_type == '') {
                        $.alert("请选择加减分");
                        return;
                    }
                    //算出加减分的最大值
                    var max_score = '';
                    if(this.request_data.form.mark_type == 1){//加分
                        max_score = this.index_end_interval;
                    }else if(this.request_data.form.mark_type == 2){//减分
                        max_score = Math.abs(this.index_start_interval);
                    }
                    if (this.score == '' || this.score < 0.1 || this.score>max_score) {
                        $.alert('分值必须在0.1-'+max_score+'之间');
                        return;
                    }
                    if (this.request_data.form.mark_type == "2") {//减分
                        this.request_data.form.score = "-" + this.score;
                    } else {
                        this.request_data.form.score = this.score;
                    }
                    $.showLoading();
                    ajax_post(api_save_daily_performance, this.request_data.form, this);

                },
                events_li: function (id, name) {
                    this.events_message.event_name = name;
                    this.events_message.event_id = id;
                    $.closePopup();
                    this.event_search_value = '';
                },
                close_loadeing_panel: function () {
                    if (this.end_load_names && this.end_load_event) {
                        $.hideLoading();
                    }
                },
                //事件选择
                event_change:function () {
                    //清空之前的选择
                    this.request_data.form.mark_type = '';
                    for(var i=0;i<this.events_arr.length;i++){
                        if(this.events_arr[i].id==this.events_message.event_id){
                            this.events_message.event_name = this.events_arr[i].index_name;
                            this.index_start_interval = this.events_arr[i].index_start_interval;
                            this.index_end_interval = this.events_arr[i].index_end_interval;
                            //当只有加分或者减分的时候，判断选中
                            if(this.index_start_interval >= 0){//加分
                                this.request_data.form.mark_type = 1
                            }
                            if(this.index_end_interval <= 0){//减分
                                this.request_data.form.mark_type = 2
                            }
                            break;
                        }
                    }
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学生信息
                            case api_art_evaluation_get_student_info:
                                this.complete_art_evaluation_get_student_info(data);
                                break;
                            //   指标查询
                            case api_index_check:
                                this.complete_index_check(data);
                                break;
                            case api_file_uploader:
                                this.load_success_index++;
                                if (this.load_success_index == this.all_load_index) {
                                    this.sub_disabled = false;
                                    $.hideLoading();
                                }

                                var file_data = data.data;
                                var file_data_str = JSON.stringify(file_data);
                                this.file_arr.push(file_data_str);
                                break;
                            case api_save_daily_performance:
                                $.hideLoading();
                                $.toast("录入成功");
                                window.location = "#stu_per_score";
                                break;
                        }
                    } else {
                        if (!msg || msg == null || msg == '') {
                            msg = '无信息'
                        }
                        $.alert(msg);
                        $.hideLoading();
                    }
                },
                //学生信息
                complete_art_evaluation_get_student_info: function (data) {
                    if (data.data.list == "") {
                        $.alert("暂无学生信息");
                        this.student_arr = [];
                    } else {
                        this.student_arr = data.data.list;
                    }
                    this.end_load_names = true;
                    this.close_loadeing_panel();
                },
                //指标信息
                complete_index_check:function(data){
                    this.events_arr = data.data;
                    if(data.data.length == 0 || data.data == [] || data.data == null) {
                        $.hideLoading();
                        return;
                    }
                    this.request_data.form.frist_index = data.data[0].index_parent;
                    this.request_data.form.second_index = data.data[0].index_secondary;
                    this.request_data.form.frist_index_id = data.data[0].index_parentid;
                    this.request_data.form.second_index_id = data.data[0].index_secondaryid;
                    this.end_load_event = true;
                    this.close_loadeing_panel();
                },
            });

            require(["jquery-weui"], function (j) {
                require(['swiper', 'city_picker'], function (a, b) {
                    wx_daily_create.init();
                })
            });


            return wx_daily_create;
        }


        return {
            view: html,
            define: avalon_define
        }
    });