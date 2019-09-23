/**
 * Created by uptang on 2017/4/28.
 */

define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj", "person_center/stu_person_data/stu_person_data", "css!"),
        C.Co("weixin_pj", "person_center/stu_person_data/stu_person_data", "html!"),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"),
        C.CMF("uploader/uploader.js")

    ],
    function ($, avalon, css, html, data_center, viewer, uploader) {
        //查询照片
        var student_img_api = api.user+"baseUser/get_appoint_student_user.action";
        //查看学生信息
        var student_msg_api = api.user+"student/stu_info";
        //更改学生照片
        var change_photo_api=api.api+"base/student/edit_stu_photo";
        //修改学生信息
        var api_update= api.user+"student/upd_stu_info";
        var url_api_file=api.api+"file/get";
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //获取个性名片列表
        var api_card_list = api.api + 'GrowthRecordBag/card_list';
        //个性名片编辑保存
        var api_card_update = api.api + 'GrowthRecordBag/card_update';
        //过滤器
        avalon.filters.sex_change = function (str) {
            if(str == 1){
                return '男'
            }else if(str == 2){
                return '女'
            }
        };
        //将null变成空
        avalon.filters.isNull = function(str){
            if(str == null){
                return ''
            }
            return str;
        };
        var avalon_define = function () {
            var wx_daily_create = avalon.define({
                $id: "stu_person_data",
                //学生政治面貌
                stu_political:[
                    {name:"共青团员"},
                    {name:"少先队员"},
                    {name:'群众'}
                ],
                //家长政治面貌
                politicalList:[
                    {name:"中共党员"},
                    {name:"中共预备党员"},
                    {name:"群众"},
                    {name:"民革党员"},
                    {name:"民盟盟员"},
                    {name:"民建会员"},
                    {name:"民进会员"},
                    {name:"农工党党员"},
                    {name:"致公党党员"},
                    {name:"九三学社社员"},
                    {name:"台盟盟员"},
                    {name:"无党派人士"},
                    {name:"九三学社社员"}
                ],
                //民族
                nationList:[
                    {name:"汉族"},
                    {name:"壮族"},
                    {name:"回族"},
                    {name:"满族"},
                    {name:"维吾尔族"},
                    {name:"苗族"},
                    {name:"彝族"},
                    {name:"土家族"},
                    {name:"藏族"},
                    {name:"蒙古族"},
                    {name:"侗族"},
                    {name:"布依族"},
                    {name:"瑶族"},
                    {name:"白族"},
                    {name:"朝鲜族"},
                    {name:"哈尼族"},
                    {name:"黎族"},
                    {name:"哈萨克族"},
                    {name:"傣族"},
                    {name:"畲族"},
                    {name:"傈僳族"},
                    {name:"东乡族"},
                    {name:"仡佬族"},
                    {name:"拉祜族"},
                    {name:"佤族"},
                    {name:"水族"},
                    {name:"纳西族"},
                    {name:"羌族"},
                    {name:"土族"},
                    {name:"仫佬族"},
                    {name:"锡伯族"},
                    {name:"柯尔克孜族"},
                    {name:"景颇族"},
                    {name:"达斡尔族"},
                    {name:"撒拉族"},
                    {name:"布朗族"},
                    {name:"毛南族"},
                    {name:"塔吉克族"},
                    {name:"普米族"},
                    {name:"阿昌族"},
                    {name:"怒族"},
                    {name:"鄂温克族"},
                    {name:"京族"},
                    {name:"基诺族"},
                    {name:"德昂族"},
                    {name:"保安族"},
                    {name:"俄罗斯族"},
                    {name:"裕固族"},
                    {name:"乌孜别克族"},
                    {name:"门巴族"},
                    {name:"鄂伦春族"},
                    {name:"独龙族"},
                    {name:"赫哲族"},
                    {name:"高山族"},
                    {name:"珞巴族"},
                    {name:"塔塔尔族"},
                    {name:"未识别民族"},
                    {name:"入籍外国人"}
                ],
                //文化程度
                cultureList:[
                    {name: "研究生"},
                    {name:"大学本科"},
                    {name:"大学专科"},
                    {name:"专科学校"},
                    {name:"中专"},
                    {name:"中技"},
                    {name:"技工学校"},
                    {name:"高中"},
                    {name:"初中"},
                    {name:"小学"},
                    {name:"文盲或半文盲"}
                ],
                //健康状况
                health_list:[
                    {name:'健康'},
                    {name:'良好'},
                    {name:'一般'},
                    {name:'较弱'},
                    {name:'有慢性疾病'},
                    {name:'有生理缺陷'},
                    {name:'残疾'}
                ],
                img_src_down:'common/images/wx-dowm.png',
                img_src_up:'common/images/wx-up.png',
                //基本信息图片路径
                base_src:'',
                //家庭状况图片路径
                family_src:'',
                //监管图片路径
                jian_src:'',
                //个性名片图片路径
                card_src:'',
                //学生学号
                guid:'',
                //获取图片中的用户id
                user_id:'',
                //是否显示个人基础信息
                show_base:true,
                //是否显示父母信息
                show_parents:false,
                //是否显示监管信息
                show_jq:false,
                //是否显示个性名片
                show_card:false,
                //照片信息
                photo_src:'common/images/img-holder.png',
                //获取的学生信息
                user_info:{},
                //个性名片
                person_card:[],
                init: function () {
                    this.base_src = this.img_src_up;
                    this.family_src = this.img_src_down;
                    this.jian_src = this.img_src_down;
                    this.card_src = this.img_src_down;
                    this.get_user_guid();
                    this.photo_change();

                },
                //头像改变
                photo_change:function () {
                    var $galleryImg = $("#img-upload");
                    var self = this;
                    $galleryImg.on("change", function (e){
                        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
                        var file = files[0];
                        if (url) {
                            src = url.createObjectURL(file);
                        } else {
                            src = e.target.result;
                        }
                        self.photo_src = src;
                        var fm = new FormData();
                        fm.append("file", file, file.name);
                        fm.append("note", "from weixin");
                        fm.append("token", window.sessionStorage.getItem("token"));
                        fileUpload(api_file_uploader, self, fm);


                    })
                },
                //展开或收起
                open_close:function (w) {
                    if(w==1){
                        this.show_base = !this.show_base;
                        if(this.show_base){
                            this.show_parents = false;
                            this.show_jq = false;
                            this.show_card = false;
                            this.base_src = this.img_src_up;
                        }else {
                            this.base_src = this.img_src_down;
                        }
                    }else if(w==2){
                        this.show_parents = !this.show_parents;

                        if(this.show_parents){
                            this.show_base = false;
                            this.show_jq = false;
                            this.show_card = false;
                            this.family_src = this.img_src_up;
                        }else {
                            this.family_src = this.img_src_down;
                        }

                    }else if(w==3){
                        this.show_jq = !this.show_jq;
                        if(this.show_jq){
                            this.show_base = false;
                            this.show_parents = false;
                            this.show_card = false;
                            this.jian_src = this.img_src_up;
                        }else {
                            this.jian_src = this.img_src_down;
                        }
                    }else if(w == 4){
                        if(this.person_card.length == 0){
                            $.alert('暂无个性名片');
                            return;
                        }
                        this.show_card = !this.show_card;
                        if(this.show_card){
                            this.show_base = false;
                            this.show_jq = false;
                            this.show_parents = false;
                            this.card_src = this.img_src_up;
                        }else{
                            this.card_src = this.img_src_down;
                        }
                    }
                },
                save_sp_address:function () {
                    console.log('1111')
                },
                //获取学生学号
                get_user_guid:function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.guid=JSON.parse(data.data["user"]).guid;
                        self.get_user_info(student_img_api);
                        self.get_user_info(student_msg_api);
                    //    个性名片
                        self.get_user_info(api_card_list);
                    });
                },
                //获取学生信息及照片
                get_user_info:function (url) {
                    ajax_post(url,{guid:this.guid},this);
                },
                //保存
                save_user_info:function () {
                    ajax_post(api_update,this.user_info.$model,this);
                },
                data_change:function () {
                    this.save_user_info();
                },
                //个性名片修改保存
                card_change:function(){
                    ajax_post(api_card_update,this.person_card,this);
                },
                uploader_img:function (data) {
                    ajax_post(change_photo_api,{
                        photo:JSON.stringify(data.data),
                        student_id:this.user_id
                    },this);
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case student_msg_api:
                                this.deal_user_info(data);
                                break;
                            case student_img_api:
                                this.deal_img(data);
                                break;
                            case api_update:
                                break;
                            case api_file_uploader:
                                this.uploader_img(data);
                                break;
                            case change_photo_api:
                                console.dir(data.data)
                                break;
                            //    个性名片
                            case api_card_list:
                                this.complete_card_list(data);
                                break;
                            //    个性保存
                            case api_card_update:
                                this.complete_card_updata(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                //处理图片数据
                deal_img:function (data) {
                    if(!data.data||data.data==null)
                        return;
                    this.user_id = data.data.user_id;
                    if(data.data.photo != null && data.data.photo != ''){
                        var urlP=JSON.parse(data.data.photo);
                        this.photo_src = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + urlP.inner_name;
                    }
                },
                deal_user_info:function (data) {
                    if(!data.data||data.data==null)
                        return;
                    this.user_info = data.data;
                    //去掉返回的null
                    for(var key in this.user_info){
                        if(this.user_info[key]==null){
                            this.user_info[key] = '';
                        }
                    }
                },
                //个性名片
                complete_card_list:function(data){
                    this.person_card = data.data;
                },
            //    个性名片修改保存
                complete_card_updata:function(data){
                    //个性名片
                    this.get_user_info(api_card_list);
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
