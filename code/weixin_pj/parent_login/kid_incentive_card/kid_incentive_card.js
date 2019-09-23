/**
 * Created by Administrator on 2018/7/31.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co('weixin_pj', 'parent_login/kid_incentive_card/kid_incentive_card','html!'),
        C.Co('weixin_pj', 'parent_login/kid_incentive_card/kid_incentive_card','css!'),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui",'swiper'
    ],
    function ($,avalon, html,css,x, data_center,weui,swiper) {
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
        var api_card_list = api.api + "everyday/page_my_gain_card";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "kid_incentive_card",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
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
                    user_type:"",
                    start_date: "",
                    end_date: "",
                    offset: 0,
                    rows: 10,
                    //状态 -1删除  1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
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
                init: function () {
                    var self = this;
                    //0：管理员；1：教师；2：学生；3：家长
                    var user_type = cloud.user_type();
                    var user = cloud.user_user();
                    var stu_info = {};
                    if(user_type == 2){
                        stu_info = user;
                    }else if(user_type == 3){
                        stu_info = user.student;
                    }
                    self.district_name = stu_info.district;
                    self.extend.code = stu_info.code;
                    self.extend.fk_class_id = stu_info.fk_class_id;
                    self.extend.fk_grade_id = stu_info.fk_grade_id;
                    self.extend.name = stu_info.name;
                    ajax_post(api_card_list,self.extend.$model,self);

                    //开始时间和结束时间的一直获取值
                    $("#start_date").calendar({
                        onChange: function (p, values, displayValues) {
                            self.extend.start_date = values[0];
                            ajax_post(api_card_list,self.extend.$model,self);
                        }
                    });
                    $("#end_date").calendar({
                        onChange: function (p, values, displayValues) {
                            self.extend.end_date = values[0];
                            ajax_post(api_card_list,self.extend.$model,self);
                        }
                    });
                },
                //评价卡名称
                nameExtend:function () {
                    this.extend.card_name=this.other.card_name;
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                //开始时间
                // start_date_change:function(){
                //     var self=this;
                //     $("#start-date").calendar();
                //     var start= $("#start-date");
                //     start.on('change',function(){
                //         ajax_post(api_card_list,self.extend.$model,self);
                //     });
                // },
                // //结束时间
                // end_date_change:function(){
                //     var self=this;
                //     $("#end_date").calendar();
                //     var end= $("#end_date");
                //     end.on('change',function(){
                //         ajax_post(api_card_list,self.extend.$model,self);
                //     });
                // },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //数据类型转换
                data_change:function(a){
                    return JSON.parse(a);
                },
                //评价主体改变
                user_change:function(){
                    ajax_post(api_card_list,this.extend.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //卡片列表
                            case api_card_list:
                                this.complete_card_list(data);
                                break;
                            default:
                                break;

                        }
                    } else {
                        $.alert(msg)
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
                            if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }
                    this.card_list = data.data.list;
                },
            });
            require(["jquery-weui"], function (j) {
                require(['swiper'], function (a, b) {
                    vm.init();
                })
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });