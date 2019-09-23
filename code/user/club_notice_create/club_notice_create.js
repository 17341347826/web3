/**
 * Created by Administrator on 2018/9/20.
 */
define([ "jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("user", "club_notice_create/club_notice_create", "css!"),
        C.Co("user", "club_notice_create/style", "css!"),
        C.Co("user", "club_notice_create/club_notice_create", "html!"),
        C.CMF("formatUtil.js"),
        C.CMF("uploader/uploader.js"),
        C.CMF("data_center.js")
    ],
    function ($,avalon,layer, css1,css2,html,formatUtil,uploader, data_center) {
        //查询某个人有哪些社团
        var api_query_communitys = api.api + 'GrowthRecordBag/query_communitys_by_fzrid';
        //获取系统当前时间
        // var api_server_time = api.api+'base/baseUser/current_time';
        //添加修改社团通知
        var api_save_update = api.api+'GrowthRecordBag/save_update_community_notice';
        //文件上传
        var api_file_uploader = api.api+"file/uploader";
        var avalon_define = function (pmx) {
            var table = avalon.define({
                $id: "club_notice_create",
                highest_level: 4,
                //登陆者highest_level
                level:"",
                //社团名称
                club_list:[],
                club_info:'',
                //添加修改
                req_data: {
                    id:'',
                    //标题
                    bt: "",
                    //发布时间--社团通知不需要传
                    fbsj:"",
                    //社团id
                    fk_st_id: '',
                    //社团名称
                    stmc:'',
                    //内容
                    tznr:'',
                },
                init: function () {
                    //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    this.level = cloud.user_level();
                    if(pmx.notice_info){
                        var info = JSON.parse(pmx.notice_info);
                        this.req_data.fk_st_id = info.fk_st_id;
                        this.req_data.stmc = info.stmc;
                        this.club_info = this.req_data.fk_st_id +'|' + this.req_data.stmc;
                        this.req_data.bt = info.bt;
                        this.req_data.tznr = info.tznr;
                    }
                    // 初始化富文本
                    this.init_textarea();
                    //查询某个人有哪些社团
                    ajax_post(api_query_communitys,{},this);
                },
                instance:'',
                init_textarea:function (content_html) {
                    if(!content_html){
                        content_html = '';
                    }
                    var title_width = $("#notice-title").width();
                    this.instance = new TINY.editor.edit('editor',{
                        id:'notice-con',
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
                //提交
                submitBtn: function () {
                    this.req_data.fk_st_id = Number(this.club_info.split('|')[0]);
                    this.req_data.stmc = this.club_info.split('|')[1];
                    this.instance.post();
                    if (!$.trim(this.club_info)) {
                        toastr.warning("社团名称不能为空");
                        return;
                    }else if (!$.trim(this.req_data.bt)) {
                        toastr.warning("标题不能为空");
                        return;
                    } else if (!$.trim(this.req_data.tznr)) {
                        toastr.warning("内容不能为空");
                        return;
                    }
                    var self = this;
                    layer.confirm('确认提交？', {
                        btn: ['确认', '取消'] //按钮
                    }, function () {
                        if(pmx.notice_info){
                            var info = JSON.parse(pmx.notice_info);
                            self.req_data.id = info.id;
                            // 修改社团通知
                            ajax_post(api_save_update,self.req_data.$model,self);
                        }else{
                            // 添加社团通知
                            ajax_post(api_save_update,self.req_data.$model,self);
                        }
                        // 添加社团通知
                        // ajax_post(api_save_update,self.req_data.$model,self);
                        layer.closeAll();
                    });

                },
                //取消
                back:function () {
                    window.location = '#club_notice';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //查询某个人有哪些社团
                            case api_query_communitys:
                                this.complete_query_communitys(data);
                                break;
                            // //    系统当前时间
                            // case api_server_time:
                            //     this.req_data.fbsj = time_2_str(data.data.current_time);
                            //     break;
                            //添加修改社团通知
                            case api_save_update:
                                this.complete_save_update(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //查询某个人有哪些社团
                complete_query_communitys:function(data){
                    this.club_list = data.data;
                //    获取系统当前时间
                //     ajax_post(api_server_time,{},this);
                },
                //添加修改社团通知
                complete_save_update:function(data){
                    window.location = '#club_notice';
                },
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