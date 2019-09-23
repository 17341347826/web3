/**
 * Created by Administrator on 2018/7/4.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "stu_oneself_card/stu_oneself_card", "css!"),
        C.Co("growth_incentive_card", "stu_oneself_card/stu_oneself_card", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),C.CM("three_menu_module")],
    function ($,avalon, css,html, layer, table,data_center,three_menu_module) {
        //过滤器-过滤身份
        avalon.filters.gl_type = function(str){
            if(str == 1){
                return '教师'
            }else if(str == 2){
                return '学生'
            }else if(str == 3){
                return '家长'
            }else if(str == 0){
               return '管理员'
            }
        };
        //获卡详情列表
        var card_list = api.api + "everyday/page_my_gain_card";
        //查询单个标志性卡
        var api_mark_card=api.api+'everyday/get_mark_card';
        //上传
        var url_api_file=api.api+"file/get";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "stu_oneself_card",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //区县
                district_name:'',
                extend: {
                    name:"",
                    code:"",
                    cycle_type:"",
                    fk_class_id:"",
                    fk_grade_id:"",
                    mark_card_id:"",
                    card_name:"",
                    user_type:"1",
                    start_date: "",
                    end_date: "",
                    offset: 0,
                    rows: 10,
                //    状态 -1删除  1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                    status:4,
                },
                //标志性卡图片
                imageUrl:'',
                //发卡时间
                card_year:'',
                card_month:'',
                card_day:'',
                //被发卡人
                stu_name:'',
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                other:{
                    card_name:"",
                    start_time: "",
                    end_time: ""
                },
                //卡片数据
                card_list:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                nameExtend:function () {
                    this.extend.card_name=this.other.card_name;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(card_list,this.extend.$model,this);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //事实依据查看
                factual_basis:function(el){
                    var card_id = el.mark_card_id;
                    var encourage_date = el.encourage_date;
                    var name = el.name;
                    var id = el.id;
                    var data = JSON.stringify(el);
                    var post_data = encodeURIComponent(data);
                    data_center.set_key('factual_id',el.id);
                    if (el.a_attachment){
                        window.location = "#incentive_card_detail?id="+id;
                    }else {
                        toastr.warning("无事实依据");
                        return false;
                    }
                },
                //成长激励卡查看
                card_see:function(el){
                    var card_id = el.mark_card_id;
                    var encourage_date = el.encourage_date;
                    var name = el.name;
                    var id = el.id;
                    this.card_year=encourage_date.substr(0,4);
                    this.card_month=encourage_date.substr(5,2);
                    this.card_day=encourage_date.substr(8,2);
                    this.stu_name=name;
                    //图片信息
                    ajax_post(api_mark_card,{id:card_id},this);
                },
                //评价主体改变
                user_change:function(){
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(card_list,this.extend.$model,this);
                },
                getCompleteDate:function () {
                    var self=this;
                    var datepicker=$("#startTime");
                    datepicker.on("change", function(event) {
                        self.other.start_time = event.delegateTarget.defaultValue;
                        self.extend.start_date=self.other.start_time;
                        layer.load(1, {shade:[0.3,'#121212']});
                        self.data_had = false;
                        ajax_post(card_list,self.extend.$model,self);
                    });
                    datepicker.datepicker('open');
                },
                getCompleteDates:function () {
                    var self=this;
                    var datepicker=$("#endTime");
                    datepicker.on("change", function(event) {
                        self.other.end_time = event.delegateTarget.defaultValue;
                        self.extend.end_date=self.other.end_time;
                        layer.load(1, {shade:[0.3,'#121212']});
                        self.data_had = false;
                        ajax_post(card_list,self.extend.$model,self);
                    });
                    datepicker.datepicker('open');
                },
                init:function () {
                    //0：管理员；1：教师；2：学生；3：家长
                    var user_type = cloud.user_type();
                    var user = cloud.user_user();
                    var stu_info = {};
                    if(user_type == 2){
                        stu_info = user;
                    }else if(user_type == 3){
                        stu_info = user.student;
                    }
                    this.district_name = stu_info.district;
                    this.extend.code = stu_info.code;
                    this.extend.fk_class_id = stu_info.fk_class_id;
                    this.extend.fk_grade_id = stu_info.fk_grade_id;
                    this.extend.name = stu_info.name;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(card_list,this.extend.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //卡片列表
                            case card_list:
                                this.complete_card_list(data);
                                break;
                            //查询单个标志性卡
                            case api_mark_card:
                                this.complete_mark_card(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_card_list:function(data){
                    //获取头像
                    ready_photo(data.data.list,'student_guid');
                    //获取列表信息
                    var list=data.data.list;
                    var list_length = list.length;
                    var token = sessionStorage.getItem("token");
                    for(var i=0;i<list_length;i++){
                        var fjdz = JSON.parse(list[i].a_attachment);
                        list[i].img_arr = [];
                        list[i].video_arr = [];
                        list[i].file_arr = [];
                        for (var j = 0; j < fjdz.length; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (table.suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (table.suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }
                    const new_list = data.data.list;
                    sort_by(new_list,['-encourage_date'])
                    this.card_list = new_list;
                    this.data_had = true;
                    layer.closeAll();
                },
                complete_mark_card:function(data){
                    if(data.data.attachment!=undefined){
                        var ach=JSON.parse(data.data.attachment);
                        this.imageUrl=url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + ach[0].inner_name;
                        $("#card-modal").modal({
                            closeOnConfirm: false
                        });
                    }else{
                        layer.alert('暂无成长激励卡', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }
                },
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define,
            date_input:{startDate:"startTime",endDate:"endTime",type:1}
        }
    });
