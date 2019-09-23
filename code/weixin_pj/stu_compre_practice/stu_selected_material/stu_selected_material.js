/**
 * Created by Administrator on 2018/8/2.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'stu_compre_practice/stu_selected_material/stu_selected_material','html!'),
        C.Co('weixin_pj', 'stu_compre_practice/stu_selected_material/stu_selected_material','css!'),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($,avalon,layer, html,css,x, data_center,weui) {
        //时间过滤
        avalon.filters.time_ten = function(data){
            return data.substr(0,10);
        };
        //获取列表数据
        var get_data_api = api.api + "GrowthRecordBag/student_list_lx_data";
        //获取每一个类别的份数
        var count_api = api.api + "GrowthRecordBag/count_zh_mk";
        //品德遴选
        var morality_choose_api = api.api + "GrowthRecordBag/morality_chooseTypical";
        //学业水平遴选
        var study_choose_api = api.api + "GrowthRecordBag/study_chooseTypical";
        //身心健康遴选
        var health_choose_api = api.api + "GrowthRecordBag/healthActivity_chooseTypical";
        //艺术素养遴选
        var art_choose_api = api.api + "GrowthRecordBag/artactivity_chooseTypical";
        //社会实践遴选
        var practic_choose_api = api.api + "GrowthRecordBag/practice_chooseTypical";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "stu_selected_material",
                //身份判断
                user_type:'',
                //图片是否展开（注：如果数据是循环出来，不能用这种方式）
                is_open: false,
                //核查意见
                opinion: '',
                //下拉列表是否初始化
                is_init_sel: true,
                //弹出框，选择的文件名
                file_name: '请选择文件',
                //综合实践状态：审核状态 1待审核 2审核通过 3审核不通过4归档(必传不能为空）
                parctice_type:[
                    {name:'待审核',value:'1'},
                    {name:'未通过',value:'3'},
                    {name:'已通过',value:'2'},
                    {name:'已归档',value:'4'}
                ],
                //综合实践类型
                type_arr: [
                    // {name: '全部', value: ''},
                    {name: '思想品德', value: '1'},
                    {name: '艺术素养', value: '2'},
                    {name: '社会实践', value: '3'},
                    {name: '学业水平', value: '4'},
                    {name: '身心健康', value: '5'}
                ],
                semester_arr: [],
                current_semester: '',
                extend: {
                    fk_xs_id: '',
                    mk: '1',
                    offset: 0,
                    rows: 15,
                    shzt: 1,
                    fk_xq_id: ''
                },
                //前一次请求的滚动条高度
                old_scroll_top: '',
                count_list: [],
                semester_count: [],
                list: [],
                is_all_count: true,
                //菜单改变
                menu_change:function(num){
                    if(num == 2){
                        window.location = '#stu_no_selected_material';
                    }else if(num == 1){
                        window.location = '#stu_record_material';
                    }
                },
                init: function () {
                   this.cd();
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function(data){
                        var user_type = cloud.user_type();
                        self.user_type = user_type;
                        if(user_type == 2){//学生
                            self.district = cloud.user_district();
                            self.extend.fk_xs_id = cloud.user_guid();
                        }else if(user_type == 3){//家长
                            self.district = cloud.parent_stu().district;
                            self.extend.fk_xs_id = cloud.parent_stu().guid;
                        }
                        self.semester_arr = cloud.semester_all_list();
                        self.current_semester = self.semester_arr[0];
                        self.get_data();
                        self.listen_scroll();

                        cloud.ready_photo({guids: [self.extend.fk_xs_id]})
                    });
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var h = $(document.body).height();//网页文档的高度
                        var c = $(document).scrollTop();//滚动条距离网页顶部的高度
                        var wh = $(window).height(); //页面可视化区域高度

                        if (Math.ceil(wh + c) >= h) {
                            if (self.list.length < self.extend.rows)
                                return;
                            self.extend.rows += 15;
                            self.old_scroll_top = h;
                            self.get_data();
                        }
                    })

                },
                get_data: function () {
                    this.extend.fk_xq_id = this.current_semester.value.split('|')[0];
                    this.is_all_count = true;
                    this.get_count(this.is_all_count);
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(get_data_api, this.extend.$model, this);
                },
                get_count: function (is_all) {
                    if (is_all) {
                        ajax_post(count_api, {
                            fk_xs_id: this.extend.fk_xs_id,
                            sfdx: 1,
                            shzt: this.extend.shzt
                        }, this);
                    } else {
                        ajax_post(count_api, {
                            fk_xs_id: this.extend.fk_xs_id,
                            sfdx: 1,
                            shzt: this.extend.shzt,
                            // fk_xq_id:Number(this.extend.fk_xq_id)
                        }, this);
                    }

                },
                //跳转页面
                change_page: function (page) {
                    window.location = "#" + page;
                },
                change_tab: function () {
                    // this.extend.shzt = tab;
                    this.get_data();
                },
                //图片展开或收起，注：如果数据循环出来，逻辑不一定这么写
                open_close: function (w, index) {
                    if (w == 'open') {
                        this.list[index].is_open = true;
                    } else {
                        this.list[index].is_open = false;
                    }
                },
                //综合实践类型
                prac_index:'',
                //获取下拉列表选择的数据 (注：每个下拉列表需要传一个方法用于获取数据)
                sel_check: function () {
                    // this.extend.mk = el.value;
                    this.get_data();
                },
                //学年学期信息
                sem_info:'',
                //学年学期改变
                sel_semester: function () {
                    this.current_semester = el;
                    this.get_data();
                },
                choose: function (url, id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 0,
                        status: 0
                    }, this);
                },
                health_choose:function (url,id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 0,
                        hea_state: 2
                    }, this);
                },
                art_choose:function (url,id) {
                    ajax_post(url, {
                        id: id,
                        isTypical: 0,
                        art_state: 2
                    }, this);
                },
                user_photo: cloud.user_photo,
                url_img: url_img,
                //取消遴选
                no_pass: function (el) {
                    switch (el.mk) {
                        case 1:
                            this.choose(morality_choose_api, el.id);
                            break;
                        case 2:
                            this.art_choose(art_choose_api, el.id);
                            break;
                        case 3:
                            this.choose(practic_choose_api, el.id);
                            break;
                        case 4:
                            this.choose(study_choose_api, el.id);
                            break;
                        case 5:
                            this.health_choose(health_choose_api, el.id);
                            break;
                        default:
                            break;
                    }
                },

                deal_msg: function () {
                    var self = this;
                    $.alert("操作成功！", "信息", function() {
                        self.get_data();
                    });
                },
                to_show_video:function(src){
                    sessionStorage.setItem('video_src',src)
                    window.location.href = "#show_video"
                },
                deal_file: function (list) {
                    const suffix_video = ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'];
                    const suffix_img = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
                    for (var i = 0, len = list.length; i < len; i++) {
                        var fjdz = JSON.parse(list[i].fjdz);
                        list[i].img_arr = [];
                        list[i].video_arr = [];
                        list[i].file_arr = [];
                        for (var j = 0, len2 = fjdz.length; j < len2; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ sessionStorage.getItem('token');
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }
                    return list;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case count_api:
                                if (!data.data)
                                    return;
                                if (this.is_all_count) {
                                    this.count_list = data.data;
                                } else {
                                    this.semester_count = data.data;
                                }


                                if (this.is_all_count) {
                                    this.is_all_count = false;
                                    this.get_count(this.is_all_count);
                                }

                                break;
                            case get_data_api:
                                if (!data.data)
                                    return;
                                var list = data.data.list;
                                for (var i = 0; i < list.length; i++) {
                                    list[i].is_open = false;
                                    list[i].photo_guid = JSON.parse(list[i].fjdz);
                                }
                                sort_by(list,['-cjsj'])
                                this.list = this.deal_file(list);
                                layer.closeAll();
                                if (this.old_scroll_top > 0) {
                                    $(window).scrollTop(this.old_scroll_top);
                                }
                                break;
                            case morality_choose_api:
                                //品德
                                this.deal_msg();
                                break;
                            case art_choose_api:
                                //品德
                                this.deal_msg();
                                break;
                            case practic_choose_api:
                                //品德
                                this.deal_msg();
                                break;
                            case study_choose_api:
                                //品德
                                this.deal_msg();
                                break;
                            case health_choose_api:
                                //品德
                                this.deal_msg();
                                break;
                            default:
                                break;
                        }
                    } else {
                        $.alert(msg);
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
