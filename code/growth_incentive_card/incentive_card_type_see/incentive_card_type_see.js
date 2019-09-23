/**
 * Created by Administrator on 2018/7/12.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('growth_incentive_card', 'incentive_card_type_see/incentive_card_type_see','html!'),
        C.Co('growth_incentive_card', 'incentive_card_type_see/incentive_card_type_see','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //成长激励卡公示列表
        var api_card_pub=api.api+'everyday/page_gain_card_by_status';
        //标志性卡公式中撤销
        var api_revoke_open = api.api+'everyday/revoke_open';
        //标志性卡撤销中-删除
        var api_delete_card = api.api+'everyday/delete_gain_card';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "incentive_card_type_see",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //显示方式：图文-1，表格-2
                html_display:2,
                //表格显示：列表-1，详情-2
                list_detail:1,
                //单个学生详情
                person_detail:{},
                //当前列表序号-列表详情展开收起
                current_index:'',
                //登录者姓名
                ident_name:'',
                //区县名称
                district_name:'',
                //年级列表
                grade_list:[],
                grade_info:'',
                //班级列表
                class_list:[],
                //学籍号
                stu_num:'',
                //姓名
                stu_name:'',
                //图片展开收起
                open_close:false,
                daily_num:-1,
                //日常表现列表数据
                card_list:[],
                // 查询所用到的参数
                form_list_score: {
                    fk_class_id: "",
                    fk_grade_id:'',
                    fk_school_id:'',
                    //记录状态	number -1：删除 0：撤销 1：公示，2：待审核，3：审核不通过，4：归档
                    status:1,
                    offset:0,
                    rows:10,
                    code:'',
                    name:'',
                },
                //分页
                // 数据总数
                count:'',
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
                        this.totalPage=Math.ceil(count/this.form_list_score.rows);
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
                    this.form_list_score.offset=(num-1)*this.form_list_score.rows;
                    //获取数据
                    //    成绩奖励
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.form_list_score.rows;
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
                        this.form_list_score.offset=(this.currentPage-1)*this.form_list_score.rows;
                        //获取数据
                        //    成绩奖励
                        ajax_post(api_card_pub,this.form_list_score.$model,this);
                    }
                },
                //分页
                //数据类型转换
                data_change:function(a){
                    return JSON.parse(a);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                gradeChange:function(){
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                //班级改变
                class_change: function () {
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                init:function () {
                    this.cb();
                },
                //图片展开收起
                img_open:function(idx,num){
                    if(num==0){//收起
                        this.open_close=false;
                        this.daily_num=-1;
                    }else if(num==1){//展开
                        this.open_close=true;
                        this.daily_num=idx;
                    }
                },
                //学籍号
                code_search:function(){
                    this.form_list_score.code = this.stu_num;
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                //姓名
                name_search:function(){
                    this.form_list_score.name = this.stu_name;
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                //新增卡片
                add_card:function(){
                    //审核公式管控
                    ajax_post(api_query_pub,{},this);
                    // window.location='#incentive_card_grant';
                },
                //状态切换
                change_status:function(num){
                    this.form_list_score.status = num;
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                //公式中-撤销
                revoke_card:function(id,num){
                    var self = this;
                    if(num != 0){
                        layer.alert('当前存在异议数，不能撤销', {
                           closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
                    layer.confirm('你确定要撤销吗？', {
                        btn: ['确定','取消']
                    }, function(){
                        ajax_post(api_revoke_open,{id:id},self);
                    });
                },
                //撤销中-删除
                delete_card:function(id){
                    var self = this;
                    layer.confirm('你确定要删除吗？', {
                        btn: ['确定','取消']
                    }, function(){
                        ajax_post(api_delete_card,{id:id},self);
                    });
                },
                //撤销中-编辑
                edit_card:function(id){
                    window.location='#signCard_echo?pId='+id;
                },
                //显示方式-列表
                radio_table:function(){
                    //表格显示：列表-1，详情-2
                    this.list_detail =1;
                },
                //列表查看详情
                person_honor:function(idx,el){
                    // console.log(el);
                    //表格显示：列表-1，详情-2
                    this.list_detail = 2;
                    el.img_arr = [];
                    el.video_arr = [];
                    el.file_arr = [];
                    var token = sessionStorage.getItem("token");
                    var fjdz = JSON.parse(el.a_attachment);
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
                //滚动加载
                scoll_load:function(){
                    var self = this;
                    var rows = self.form_list_score.rows;
                    var offset = self.form_list_score.offset;
                    //浏览器的高度加上滚动条的高度 == 总高度
                    var totalHeight =  parseFloat($(window).height()) +  parseFloat($(window).scrollTop());
                    if ($(document).height() - totalHeight < 250 && self.count > rows) { //当文档的高度小于或者等于总的高度时，开始动态加载数据
                        self.form_list_score.rows = rows + 10;
                        //成长激励卡
                        ajax_post(api_card_pub,self.form_list_score.$model,self);
                    }
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.form_list_score.fk_xs_id=tUserData.guid;
                        if(userType==1){//教师
                            // self.form_list_score.fk_grade_id=tUserData.teach_class_list[0].grade_id;
                            self.ident_name=tUserData.name;
                            self.district_name=tUserData.district;
                            self.grade_list = cloud.auto_grade_list();
                            console.log(self.grade_list);
                            self.class_list = self.grade_list[0].class_list;
                            self.form_list_score.fk_school_id=tUserData.fk_school_id;
                        }
                        self.grade_info = self.grade_list[0].grade_id;
                        self.form_list_score.fk_grade_id = self.grade_list[0].grade_id;
                        self.form_list_score.fk_class_id=self.class_list[0].class_id;
                        //    日常表现列表
                        ajax_post(api_card_pub,self.form_list_score.$model,self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //成长激励卡列表
                            case api_card_pub:
                                this.complete_daily_pub(data);
                                break;
                        //        撤销
                            case api_revoke_open:
                                this.complete_revoke_open(data);
                                break;
                        //        删除
                            case api_delete_card:
                                this.complete_delete_card(data);
                                break;
                        //        审核公式管控-查询
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                complete_daily_pub:function(data){
                    this.count=data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                    this.card_list = [];
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
                    this.card_list = list;
                    $(window).scrollTop(0)
                },
                //撤销
                complete_revoke_open:function(data){
                    if(this.html_display == 2 && this.list_detail == 2){
                        this.html_display = 1;
                    }
                    layer.closeAll();
                    toastr.success('撤销成功');
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
            //    删除
                complete_delete_card:function(data){
                    if(this.html_display == 2 && this.list_detail == 2){
                        this.html_display = 1;
                    }
                    layer.closeAll();
                    toastr.success('删除成功');
                    // 成长激励卡列表
                    ajax_post(api_card_pub,this.form_list_score.$model,this);
                },
                //公式管控查询
                complete_query_pub:function(data){
                    var list = data.data;
                    if(list != null && list.length>0){
                        for(var i=0;i<list.length;i++){
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if(mkid == 6){//成长激励卡
                                window.location='#incentive_card_grant';
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        ,anim: 4 //动画类型
                    });
                },
            });
            vm.$watch('onReady', function () {
                $(window).scroll(function(){
                    // vm.scoll_load();
                });
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });