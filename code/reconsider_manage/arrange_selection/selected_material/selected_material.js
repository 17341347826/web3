/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('reconsider_manage/arrange_selection', 'selected_material/selected_material', 'html!'),
        C.Co('reconsider_manage/arrange_selection', 'selected_material/selected_material', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly) {
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
                $id: "um",
                //图片是否展开（注：如果数据是循环出来，不能用这种方式）
                is_open: false,
                //核查意见
                opinion: '',
                //下拉列表是否初始化
                is_init_sel: true,
                //弹出框，选择的文件名
                file_name: '请选择文件',

                type_arr: [
                    {name: '全部', value: ''},
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
                    mk: '',
                    offset: 0,
                    rows: 10,
                    shzt: 1,
                    fk_xq_id: ''
                },
                //前一次请求的滚动条高度
                old_scroll_top: '',
                count_list: [],
                semester_count: [],
                list: [],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                is_all_count: true,
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
                //分页
                // 数据总数
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转页码
                pageNo: "",
                //获取总页数+当前显示分页数组
                set_total_page:function(count){
                    if(count==0){
                        this.totalPageArr=new Array(this.totalPage);
                    }else{
                        //向上取证
                        this.totalPage=Math.ceil(count/this.extend.rows);
                        this.get_page_ary(this.currentPage,this.totalPage);
                    }
                },
                //计算分页数组(前提count>0)
                get_page_ary:function(c_page,t_page){//当前页数，总页数
                    this.totalPageArr=[];
                    var p_ary=[];
                    if(t_page<=5){//总页数小于5
                        for(var i=0;i<t_page;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page==0 && t_page>5){
                        for(var i=0;i<5;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page+2>=t_page){//
                        var base=t_page-4;
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }else{//c_page+2<t_page
                        //显示的第一个页数
                        var base=Math.abs(c_page-2)==0 ? 1 : Math.abs(c_page-2);
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }
                    this.totalPageArr=p_ary;
                    // console.log(this.totalPageArr);
                },
                //当前页面跳转
                currentPageDate:function(num){
                    this.currentPage=num;
                    this.extend.offset=(num-1)*this.extend.rows;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    //获取数据
                    ajax_post(get_data_api, this.extend.$model, this);
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.extend.rows;
                    return index;
                },
                //跳转操作
                pageNOSure:function(num){
                    if(num<1){
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else if(num>this.totalPage){
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else{
                        this.currentPage=Math.ceil(num);
                        this.extend.offset=(this.currentPage-1)*this.extend.rows;
                        layer.load(1, {shade:[0.3,'#121212']});
                        this.data_had = false;
                        //获取数据
                        ajax_post(get_data_api, this.extend.$model, this)
                    }
                },
                //分页
                //显示方式-列表
                radio_table:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail =1;
                },
                //当前列表序号-列表详情展开收起
                current_index:'',
                //列表查看详情
                person_honor:function(idx,el){
                    // console.log(el);
                    //表格显示：列表-1，详情-2
                    this.list_detail = 2;
                    el.img_arr = [];
                    el.video_arr = [];
                    el.file_arr = [];
                    var token = sessionStorage.getItem("token");
                    var fjdz = JSON.parse(el.fjdz);
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
                            el.video_arr.push(fjdz[j]);
                            continue;
                        }
                        if (vm.suffix_img.indexOf(suffix) != -1) {
                            el.img_arr.push(fjdz[j]);
                            continue;
                        }
                        el.file_arr.push(fjdz[j]);
                    }
                    //单个学生详情
                    this.person_detail = el;
                    this.current_index = idx;
                },
                //列表详情返回列表
                back:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail = 1;
                },
                init: function () {
                    this.district = cloud.user_district();
                    this.semester_arr = cloud.semester_all_list();
                    this.current_semester = this.semester_arr[0];
                    this.extend.fk_xs_id = cloud.user_guid();
                    this.get_data();
                    this.listen_scroll();

                    cloud.ready_photo({guids: [this.extend.fk_xs_id]})
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                listen_scroll: function () {
                    var self = this;
                    if(this.html_display == 2)//表格
                        return;
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
                    this.data_had = false;
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
                            fk_xq_id:Number(this.extend.fk_xq_id)
                        }, this);
                    }

                },
                //跳转页面
                change_page: function (page) {
                    window.location = "#" + page;
                },
                change_tab: function (tab) {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.extend.shzt = tab;
                    this.extend.offset = 0;
                    this.currentPage = 1;
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
                //获取下拉列表选择的数据 (注：每个下拉列表需要传一个方法用于获取数据)
                sel_check: function (el) {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.extend.mk = el.value;
                    this.extend.offset = 0;
                    this.currentPage = 1;
                    this.get_data();
                },
                //学年学期改变
                sel_semester: function (el) {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.current_semester = el;
                    this.extend.offset = 0;
                    this.currentPage = 1;
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
                    layer.alert('操作成功！', {
                        skin: 'layui-layer-molv',
                        closeBtn: 0
                    }, function () {
                        self.get_data();
                        self.html_display = 2;
                        self.list_detail = 1;
                    });
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
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
                                this.count = data.data.count;
                                //获取总页数+当前显示分页数组
                                this.set_total_page(this.count);
                                var token = sessionStorage.getItem("token");
                                for (var i = 0; i < list.length; i++) {
                                    list[i].is_open = false;
                                    if (!list[i].fjdz || list[i].fjdz == null)
                                        continue;
                                    list[i].is_open = false;
                                    var fjdz = JSON.parse(list[i].fjdz);
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
                                        fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token=" + token;
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
                                this.list = list;
                                layer.closeAll();
                                this.data_had = true;
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
                        toastr.error(msg);
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
