/**
 * Created by uptang on 2017/9/4.
 */

define([ "jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("notice", "create_notice/create_notice", "css!"),
        C.Co("notice", "create_notice/style", "css!"),
        C.Co("notice", "create_notice/create_notice", "html!"),
        C.CMF("formatUtil.js"),
        C.CMF("uploader/uploader.js"),
        C.CMF("data_center.js")
    ],
    function ($,avalon,layer, css1,css2,html,formatUtil,uploader, data_center) {
        //文件上传
        var api_file_uploader = api.api+"file/uploader";
        //添加通知
        var add_api = api.api + "Indexmaintain/indexmaintain_addNoticeInfo";
        //获取年级列表
        var getGrade_api = api.api + "base/grade/findGrades.action";
        //修改
        var update_api = api.api + "Indexmaintain/indexmaintain_updNoticeInfo";
        //获取修改详情
        var get_detail_api = api.api + "Indexmaintain/indexmaintain_selByIdNewNoticeInfo";
        var avalon_define = function (par) {
            var table = avalon.define({
                $id: "start",
                files: [],
                files_length:'',
                uploader_url: api_file_uploader,
                highest_level: 4,
                is_disabled: {
                    disabled_city: false,
                    disabled_disc: false,
                    disabled_sch: false
                },
                user_list:[
                    {id:"1",name:"市"},
                    {id:"2",name:"区县"},
                    {id:"3",name:"学校"},
                    {id:"4",name:"教师"},
                    {id:"5",name:"家长"},
                    {id:"6",name:"学生"}
                ],
                level:"",
                init: function () {
                    this.level = cloud.user_level();
                    //判断哪些复选框需要disabled
                    this.fun_is_disabled();
                    //获取年级下拉列表
                    this.showGradeList();
                    if(!par.id){
                        //初始化富文本
                        this.init_textarea();
                    }

                    //判定时候为修改
                    this.showUpdateMessage();
                },
                instance:'',
                init_textarea:function (content_html) {
                    if(!content_html){
                        content_html = '';
                    }
                    var title_width = $("#notice-title").width();
                    this.instance = new TINY.editor.edit('editor',{
                        id:'input',
                        width:title_width,
                        height:175,
                        cssclass:'te',
                        controlclass:'tecontrol',
                        rowclass:'teheader',
                        dividerclass:'tedivider',
                        controls:['bold','italic','underline','strikethrough','|','subscript','superscript','|',
                            'orderedlist','unorderedlist','|','outdent','indent','|','leftalign',
                            'centeralign','rightalign','blockjustify','|','unformat','|','undo','redo','n',
                            'font','size','style','|','image','hr','link','unlink','|','cut','copy','paste','print'],
                        footer:true,
                        fonts:['Verdana','Arial','Georgia','Trebuchet MS'],
                        content:content_html,
                        xhtml:true,
                        cssfile:'style.css',
                        bodyid:'editor',
                        footerclass:'tefooter',
                        toggle:{text:'source',activetext:'wysiwyg',cssclass:'toggle'},
                        resize:{cssclass:'resize'}
                    });

                },
                //判断家长或学生时候选择
                change_check:function () {
                    var has_par = this.data.mainBody.indexOf('5');
                    var has_stu = this.data.mainBody.indexOf('6');
                    if (has_par == -1 && has_stu == -1) {
                        this.is_show_grade = false;
                    } else {
                        this.is_show_grade = true;
                    }
                },
                fun_is_disabled: function () {
                    var user_info = sessionStorage.getItem('user_info')
                    user_info = JSON.parse(user_info);
                    var user = JSON.parse(user_info.data.user);
                    if (user_info.data.user_type == '0') {
                        var level = user.department_level;
                        if (level == 3) {
                            this.is_disabled.disabled_city = true;
                        } else if (level == 4) {
                            this.is_disabled.disabled_city = true;
                            this.is_disabled.disabled_disc = true;
                        }
                    }
                },
                showGradeList: function () {
                    ajax_post(getGrade_api, {status: 1}, this)
                },
                data: {
                    content: "",
                    title: "",
                    mainBody: [],
                    gradeIds:[],
                    attachment_html:'',
                },
                //获取的年级的列表
                garde_data: [],
                //获取复选框选择的年级
                grade_checked_value: [],
                //时候显示年级
                is_show_grade: false,

                submitBtn: function () {
                    this.instance.post();
                    // console.log(this.data.content)
                    var uploaderWorks = data_center.ctrl("card_uploader");
                    var is_complete=uploaderWorks.is_finished();
                    if(is_complete==true){
                        var files = uploaderWorks.get_files();
                        table.data.attachment_html = JSON.stringify(files);
                    }
                    if (!$.trim(this.data.title)) {
                        toastr.warning("名称不能为空");
                        return false;
                    } else if (!$.trim(this.data.content)) {
                        toastr.warning("描述不能为空");
                        return false;
                    }else if(this.data.mainBody.length==0){
                        toastr.warning("请选择主体");
                        return false;
                    }
                    // else if( is_complete!=true || files.length == 0){
                    //     toastr.warning("请上传附件");
                    //     return false;
                    // }

                    var self = this;
                    layer.confirm('确认提交？', {
                        btn: ['确认', '取消'] //按钮
                    }, function () {
                        if (par.id) {
                            var update_message = {
                                content:self.data.content,
                                id:par.id,
                                mainBody:self.data.mainBody,
                                state:self.data.state,
                                title:self.data.title,
                                gradeIds:self.data.gradeIds,
                                attachment_html:self.data.attachment_html,
                            }
                            var files = uploaderWorks.get_files();
                            self.files_length=files.length;
                            ajax_post(update_api,update_message, self)
                        } else {
                            var files = uploaderWorks.get_files();
                            self.files_length=files.length;
                            ajax_post(add_api, self.data.$model, self)
                        }

                        layer.closeAll();
                    });

                },
                backToED: function () {
                    window.location = "#evaluation_dimension";
                },
                back:function () {
                  window.history.back(-1);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case getGrade_api:
                                this.garde_data = data.data;
                                break;
                            case add_api:
                                window.location = "#notice_list";
                                break;
                            case update_api:
                                window.location = "#notice_list";
                                break;
                            case get_detail_api:
                                this.data = data.data;
                                //附件
                                this.files = JSON.parse(this.data.attachment_html);
                                this.init_textarea(this.data.content);
                                this.data.mainBody = [];
                                if(this.data.grade){
                                    var grade_str = this.data.grade;
                                    this.data.gradeIds = grade_str.split(',');
                                }else {
                                    this.data.gradeIds = [];
                                }
                                if(this.data['teacher']){
                                    this.data.mainBody.push(this.data['teacher']);
                                }
                                if(this.data['parents']){
                                    this.data.mainBody.push(this.data['parents']);
                                }
                                if(this.data['school']){
                                    this.data.mainBody.push(this.data['school']);
                                }
                                if(this.data['student']){
                                    this.data.mainBody.push(this.data['student']);
                                }
                                if(this.data['city']){
                                    this.data.mainBody.push(this.data['city']);
                                }
                                if(this.data['county']){
                                    this.data.mainBody.push(this.data['county']);
                                }
                                this.change_check();


                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //判断添加还是修改
                showUpdateMessage: function () {
                    if (par.id) {
                        ajax_post(get_detail_api, {
                            id: par.id
                        }, this);
                    }

                }
            });

            require(["tinyeditor"], function (j) {
                table.init();
            });
            // table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });