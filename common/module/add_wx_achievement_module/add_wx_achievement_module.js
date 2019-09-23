define([
        C.CLF('avalon.js'),
        'layer',"date_zh",
        C.CM("add_wx_achievement_module", "html!"),
        C.CM("add_wx_achievement_module", "css!"),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"), C.CMF("uploader/uploader.js")
    ],
    function(avalon,layer,date_zh, html, css,data_center,viewer, uploader) {
        var pdetail = undefined;
        var vm = avalon.component('ms-add-wx-achievement-module', {
            template: html,
            defaults: {
                //审核公式管控-查询
                api_query_pub : api.api+'GrowthRecordBag/publicity_audit_query',
                //文件上传
                api_file_uploader : api.api+"file/uploader",
                //成就修改
                api_save_or_updateAchievement : api.growth+"achievement_updateAchievement",
                //添加成就
                api_save_or_update_achievement : api.growth+"achievement_addAchievement",
                //成就详细
                api_get_achievement_detail_by_id : api.growth+"achievement_findByAchievementID",
                //查询成就类型（实际是成就性质）
                ach_type : api.growth+'list_ach_type',
                //查询type_name（实际是成就类型）
                api_get_type_name  :  api.api + "GrowthRecordBag/list_type",
                //根据成就类型查询成就级别
                ach_level : api.growth+"list_ach_level",
                //根据成就奖励类型+等级查询成就等级
                ach_rank : api.growth+'list_ach_rank',
                //查询个性特长设,
                api_get_personality_list  :  api.api + "GrowthRecordBag/find_personality_set_list",
                type:"",
                files: [],
                save_click_dis:false,
                //成就奖励公示
                achieve_pub:false,
                data: {
                    pxm:"",
                    uploader_url: api.api+"file/uploader",
                    form: {
                        id: "",
                        ach_state: 1,
                        /*作品状态*/
                        //-1:删除1:待审核2:提交草稿3:未通过4:审核通过
                        ach_enclosure: [],
                        //传附件
                        xz: "",
                        /*成就类型*/
                        ach_name: "",
                        /*成就名称*/
                        ach_date: "",
                        /*完成时间*/
                        ach_level: "",
                        /*成就级别*/
                        ach_rank: "",
                        /*成就等级*/
                        ach_feel: "",/*感想描述*/
                        ach_type:"",
                        sftc:0
                    },
                    //成就性质
                    achievementType:[],
                    //成就类型
                    typeList: [],
                    //成就级别
                    achievementLevel:[],
                    //成就等级
                    achievementRank: [],
                },
                sftc_arr:[],
                //是否显示标注个性特长:false-不显示，true-显示
                speciality_show:false,
                //避免重复提交：true-可以提交，false-不可以提交
                btn_had:true,
                //初始化
                init:function(){
                    //初始化附件部分
                    this.file_uploader();
                    //公示管控
                    ajax_post(this.api_query_pub,{},this);
                },
                cds:function(){
                    var self = this;
                    data_center.uin(function (data) {
                        self.get_ach_type();
                    });
                },
                //成就类型
                get_ach_type:function(){
                    ajax_post(this.ach_type,{},this);
                },
                checkboxChange:function () {
                    if(this.sftc_arr.length == 1){
                        this.data.form.sftc = 1;
                    }else{
                        this.data.form.sftc = 0;
                    }
                },
                //成就性质改变
                ach_xz_change:function(){
                    var ach_type = this.data.form.xz;
                    this.data.achievementLevel = [];
                    this.data.form.ach_level = '';
                    this.data.achievementRank = [];
                    this.data.form.ach_rank = '';
                    if (ach_type != '') {
                        //成就级别
                        ajax_post(this.ach_level, {ach_type: ach_type}, this);
                        ajax_post(this.api_get_type_name, {type: 3, xz: ach_type}, this);
                        this.data.form.ach_level = '';
                        this.data.achievementLevel = [];
                    }
                },
                //成就类型点击
                ach_type_click:function(){
                    if(this.data.form.xz == 0 || this.data.form.xz == ''){
                        $.alert('请先选择成就性质');
                    }
                    var type = this.data.form.ach_type;
                    if(this.personality_list.indexOf(type) > -1){
                        this.speciality_show = true;
                    }else{
                        this.speciality_show = false;
                    }
                },
                //成就级别改变
                ach_level_change:function(){
                    var ach_type = this.data.form.xz;
                    var ach_level = this.data.form.ach_level;
                    this.data.achievementRank = [];
                    this.data.form.ach_rank = '';
                    if (ach_type != '' && ach_level != '') {
                        //成就等级
                        ajax_post(this.ach_rank, {ach_type: ach_type, ach_level: ach_level}, this);
                    }
                },
                //成就级别点击
                ach_level_click: function(){
                    if(this.data.form.xz == 0 || this.data.form.xz == ''){
                        $.alert('请先选择成就性质');
                    }
                },
                //成就等级选项改变
                rankChange: function () {
                    if (this.data.form.ach_rank == 0) {
                        this.data.form.ach_rank = '';
                        this.data.form.ach_level = 0;
                    }
                },
                /*
               * 成就等级点击:
               * 必须成就性质和成就级别选择了才能出现数据
               * */
                rankClick:function(){
                    if(this.data.form.xz == 0 || this.data.form.xz == '' || this.data.form.ach_level == '' || this.data.form.ach_level == 0){
                        $.alert('请先选择成就性质和成就级别');
                    }
                },
                rules: { required: true, number: true },
                getType:function () {
                    if(this.pmx){
                        this.type=this.pxm.params_type;
                    }
                },
                getId: function() {
                    if(this.pmx){
                        this.data.form.id = this.pxm.achieve_id; //编辑
                    }
                },
                url_for: function(get_guid) {
                    return url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + get_guid;
                },
                getCompleteDate: function() {
                    $("#achievement_input").on("change", function(event) {
                        vm.data.form.ach_date = event.currentTarget.value;
                    });
                    $('#achievement_input').datepicker('open');
                },
                save_data: function(e) { /*提交*/
                    //判断公示管控是否设置
                    if(this.achieve_pub == false){
                        $.alert('市管理员公示审核管控还未设置', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
                    var achievement = data_center.ctrl("achievement");
                    var type=this.data.form.xz;
                    var type_rank=this.data.form.ach_rank;
                    var type_level=this.data.form.ach_level;
                    if(type=='参赛获奖'){
                        for(var i=0;i<this.data.achievementRank.length;i++){
                            if(type_rank==this.data.achievementRank[i].ach_rank){
                                this.data.form.score=this.data.achievementRank[i].score;
                            }
                        }
                    }else if(type=='荣誉称号'){
                        for(var i=0;i<this.data.achievementLevel.length;i++){
                            if(type_level==this.data.achievementLevel[i].ach_level){
                                this.data.form.score=this.data.achievementLevel[i].score;
                            }
                        }
                    }
                    if ($.trim(this.data.form.ach_name)=="") {
                        $.alert('请填写成就名称');
                        return;
                    }else if ($.trim(this.data.form.ach_name).length > 60) {
                        $.alert('输入的成就名称不能超过60个字符');
                        return;
                    } else if (this.data.form.xz == "") {
                        $.alert('请选择成就性质');
                        return;
                    }else if (this.data.form.ach_type == 0) {
                        $.alert('请选择成就类型');
                        return;
                    }else if (this.data.form.ach_level=="") {
                        $.alert('请填写成就级别');
                        return;
                    }else if (this.data.form.xz!="荣誉称号" && this.data.form.ach_rank=="") {
                        $.alert('请填写成就等级');
                        return;
                    }else if (this.data.form.ach_date=="") {
                        $.alert('请填写获得时间');
                        return;
                    } else if ($.trim(this.data.form.ach_feel)=="") {
                        $.alert('请填写成就感想');
                        return;
                    }else{
                        var str = '[';
                        for (var i = 0; i < this.files.length; i++) {

                            if (i == this.files.length - 1) {
                                str = str + this.files[i];
                            } else {
                                str = str + this.files[i] + ',';
                            }
                        }
                        str += ']';
                        this.data.form.ach_enclosure = str;
                        var self = this;
                        if (self.data.form.id) {
                            self.btn_had = false;
                            ajax_post(self.api_save_or_updateAchievement, self.data.form, self);

                        } else {
                            self.btn_had = false;
                            ajax_post(self.api_save_or_update_achievement, self.data.form, self);

                        }
                    }
                },
                /*修改--回显数据*/
                product_modify: function() {
                    ajax_post(this.api_get_achievement_detail_by_id, { id: this.data.form.id }, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询公式管控
                            case this.api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            case this.api_save_or_update_achievement:
                                this.complete_saveOrUpdateAchievement(data);
                                break;
                            case this.api_get_achievement_detail_by_id:
                                this.complete_achievement_detail_by_id(data);
                                break;
                            case this.api_save_or_updateAchievement:
                                this.complete_saveOrUpdateAchievement(data);
                                break;
                            //成就类型
                            case this.ach_type:
                                this.data.achievementType=data.data;
                                break;
                            //成就级别
                            case this.ach_level:
                                this.data.achievementLevel=data.data;
                                break;
                            //成就等级
                            case this.ach_rank:
                                this.data.achievementRank=data.data;
                                break;
                            case this.api_get_personality_list:
                                this.complete_get_personality_list(data);
                                break;
                            case this.api_get_type_name:
                                // this.data.form.ach_type = data.data[0].type_name;
                                this.data.typeList = data.data;
                                break;
                            case this.api_file_uploader:
                                this.load_success_index++;
                                if (this.load_success_index == this.all_load_index) {
                                    this.sub_disabled = false;
                                    $.hideLoading();
                                }
                                var file_data = data.data;
                                var file_data_str = JSON.stringify(file_data);
                                this.files.push(file_data_str);
                                break;

                        }
                    } else {
                        if(cmd == this.api_save_or_update_achievement){
                            self.btn_had = true;
                        }
                        $.alert(msg);
                    }
                },
                //查询
                find_per:function () {
                    ajax_post(this.api_get_personality_list,{fk_realistic_moduletid:3},this);
                },
                //公式管控查询
                complete_query_pub:function(data){
                    var self = this;
                    var list = data.data;
                    if(list != null && list.length>0){
                        for(var i=0;i<list.length;i++){
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if(mkid == 3){//成就奖励
                                self.achieve_pub = true;
                                self.cds();
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        ,anim: 4 //动画类型
                    });
                },
                personality_list:[],
                complete_get_personality_list:function (data) {
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for(var i = 0; i < dataLength;i++){
                        var obj = {name:dataList[i].ps_type_name};
                        this.personality_list.push(obj);
                    }
                },
                complete_saveOrUpdateAchievement:function (data) {
                    window.location = '#stu_honor_reward';
                },
                complete_achievement_detail_by_id:function (data) {
                    this.data.form.id            = data.data.id;
                    this.data.form.ach_state     = data.data.ach_state;
                    /*作品状态*/
                    //-1:删除1:待审核2:提交草稿3:未通过4:审核通过
                    this.data.form.ach_enclosure = data.data.ach_enclosure;
                    //传附件
                    this.data.form.xz            = data.data.xz;
                    /*成就类型*/
                    this.data.form.ach_name      = data.data.ach_name;
                    this.data.form.ach_date      = data.data.ach_date;
                    this.data.form.ach_level     = data.data.ach_level;
                    this.data.form.ach_rank      = data.data.ach_rank;
                    this.data.form.ach_feel      = data.data.ach_feel;
                    this.data.form.ach_type      = data.data.ach_type;
                    this.data.form.sftc          = data.data.sftc;
                    // vm.data.form = data.data;
                    this.files = data.data.ach_enclosures;
                    ajax_post(this.api_get_type_name, {type: 3, xz: data.data.xz}, this);
                    //成就级别
                    ajax_post(ach_level, {ach_type: data.data.xz}, this);
                    if (data.data.ach_type != "荣誉称号") {
                        this.data.form.ach_rank = data.data.ach_rank;
                        //成就等级
                        //{"ach_type":"参赛获奖","ach_level":"区县级"}
                        ajax_post(this.ach_rank, {ach_type: data.data.xz, ach_level: data.data.ach_level}, this);

                    }
                },
                onReady: function () {
                    this.find_per();
                    this.getType();
                    this.getId();
                    if (this.data.form.id) { /*有id是修改*/
                        this.product_modify();
                    }
                    //控制获奖时间小于当前时间
                    var nTime = new Date();
                    var format = nTime.getFullYear() + "-" + (nTime.getMonth()+1) + "-" + nTime.getDate() + " " + (nTime.getHours()) + ":" + nTime.getMinutes();
                    var param = {'max':format};
                    $("#achievement_input").datetimePicker(param);
                    this.init();

                },
                //加载未完成按钮不能点击
                sub_disabled: false,
                disabled_class: 'disabled_class',
                all_load_index: 0,
                load_success_index: 0,
                can_hide_uploader: false,
                //判断是否是图片文件
                is_img_file: true,
                //是否确认上传文件
                not_up_loader: false,
                //判断是否重复文件上传
                file_name_arr: [],
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

                            fileUpload(this.api_file_uploader, self, fm);
                        }

                    }


                },

            }
        });
    })