define(['jquery',
        C.CLF('avalon.js'),
        "layer",
        C.Co('eval_param_set', 'public_audit_control/public_audit_control', 'html!'),
        C.Co('eval_param_set', 'public_audit_control/public_audit_control', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, x, data_center, three_menu_module) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //审核公式管控-编辑
        var api_edit_pub = api.api+'GrowthRecordBag/publicity_audit_edit';
        var avalon_define = function () {
            //是否审核
            avalon.filters.check = function (str){
                if(str == '1' || str == '2' || str == '3' || str == '2,3' || str == '3,2'){
                    return '是';
                }else if(str == '0'){
                    return '否';
                }
            };
            //公示范围
            avalon.filters.range = function(str){
                if(str == '0'){
                    return '不公示';
                }else if(str == '1'){
                    return '全校可见'
                }else if(str == '2'){
                    return '本年级可见'
                }else if(str == '3'){
                    return '本班可见'
                }
            };
            var vm = avalon.define({
                $id: "quota",
                //最高等级:	user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                highest_level:'',
                //身份：0：管理员；1：教师；2：学生；3：家长
                ident_type:'',
                list: [
                    {
                        mkid:1,
                        content: '日常表现',
                        department: '',
                        range: '',
                        time: '',
                        stu:''
                    },
                    {
                        mkid:2,
                        content: '综合实践活动',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:3,
                        content: '成就奖励',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:4,
                        content: '学业成绩',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:9,
                        content: '艺术测评',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:5,
                        content: '体质健康测评',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:6,
                        content: '成长激励卡',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:7,
                        content: '学期评价',
                        department: '',
                        range: '',
                        time: ''
                    },
                    {
                        mkid:8,
                        content: '毕业评价',
                        department: '',
                        range: '',
                        time: ''
                    }
                ],
                //审核
                par_check:'',
                kid_check:[],
                //编辑请求参数
                edit_req:{
                    //公示范围。0.不公示1.全校可见2.本年级可见3.本班可见
                    gsfw:'',
                    // 公示时间
                    gssj:"",
                    //模块id.1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                    mkid:'',
                    //是否审核.0否1是2学生录入教师审3教师录入评价小组审
                    sfsh:'',
                    //学生确认。0否1是
                    xsqr:0
                },
                init: function () {
                    //最高等级:1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    this.highest_level = Number(cloud.user_level());
                    //身份：0：管理员；1：教师；2：学生；3：家长
                    this.ident_type = Number(cloud.user_type());
                    //查询
                    ajax_post(api_query_pub,{},this);
                },
                //编辑页面
                edit: function (el) {
                    var self = this;
                    self.edit_req.mkid = el.mkid;
                    var content = el.content;
                    //数据回显
                    self.edit_req.gsfw = el.range;
                    self.edit_req.gssj = el.time;

                    self.edit_req.sfsh = el.department;
                    //日常表现
                    if (el.mkid == 1) {
                        // self.edit_req.xsqr = el.stu;
                        //初始化那个录入那个审核
                        self.kid_check = [];
                        //学生确认现在默认为否（后期补）
                        self.edit_req.xsqr = 0;
                        if(el.department === '0'){//区分空和0
                            self.par_check = 0;
                        }else if(el.department !=0){
                            //字符串变数组
                            var ms = el.department.split(',');
                            self.par_check = 1;
                            self.kid_check = ms;
                        }
                        var layer_index = layer.open({
                            title: '日常表现公示审核设置',
                            type: 1,
                            area: ['600px', '400px'],
                            content: $('#daily_layer')
                            , btn: ['确定', '取消']
                            , yes: function (index1, layero) {
                                if(self.par_check == 0){
                                    self.edit_req.sfsh = self.par_check;
                                }else if(self.par_check == 1){
                                    //数组变字符串
                                    var ms = self.kid_check.join(',');
                                    self.edit_req.sfsh = ms;
                                }
                                if(self.par_check === ''){
                                    toastr.warning('请选择是否审核');
                                }else if(self.par_check == 1 && self.kid_check.length == 0){//审核选是，就必须选择至少一种方式审核
                                    toastr.warning('请选择审核模式');
                                }else if(self.edit_req.sfsh === ''){
                                    toastr.warning('请选择是否需要学生确认');
                                }else if(self.edit_req.gsfw === ''){
                                    toastr.warning('请选择公示范围');
                                }else if(self.edit_req.gsfw != '' && self.edit_req.gsfw != 0 && self.edit_req.gssj == ''){//公示范围选择公示，就必须选择公示时间
                                    toastr.warning('请选择公示时间');
                                }else{
                                    if(self.edit_req.gsfw == '' || self.edit_req.gsfw == 0){
                                        self.edit_req.gssj = null
                                    }
                                    //编辑
                                    ajax_post(api_edit_pub,self.edit_req.$model,self);
                                    layer.close(layer_index);
                                }
                            }, cancel: function () {
                                self.par_check = '';
                                self.kid_check = '';
                                self.edit_req.gsfw = '';
                                self.edit_req.gssj = '';
                                self.edit_req.mkid = '';
                                self.edit_req.sfsh = '';
                                // self.edit_req.xsqr = '';
                            }
                        });
                        return;
                    }
                    //除日常表现外
                    //mkid(模块id).1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                    self.par_check = el.department;
                    var other_layer = layer.open({
                        title: content+'公示审核设置',
                        type: 1,
                        area: ['600px', '300px'],
                        content: $('#other_layer')
                        , btn: ['确定', '取消']
                        , yes: function (index1, layero) {
                            if(self.edit_req.sfsh == '' && el.mkid != 4 && el.mkid !=5){
                                toastr.warning('请选择是否审核');
                            }else if(self.edit_req.gsfw === ''){
                                toastr.warning('请选择公示范围');
                            }else if(self.edit_req.gsfw != '' && self.edit_req.gsfw != 0 && self.edit_req.gssj == ''){//公示范围选择公示，就必须选择公示时间
                                toastr.warning('请选择公示时间');
                            }else{
                                if(self.edit_req.gsfw == '' || self.edit_req.gsfw == 0){
                                    self.edit_req.gssj = null;
                                }
                                if(el.mkid == 4 || el.mkid==5){
                                    self.edit_req.sfsh = null;
                                }
                                //成长激励卡：最初需求是否审核设置为’否‘,后来开放可以设置‘是’,但是‘是’的流程没有，学期评价和毕业评评价也是如此
                                // if(el.mkid == 6){
                                //     self.edit_req.sfsh = 0;
                                // }
                                //学生确认
                                self.edit_req.xsqr = null;
                                //编辑
                                ajax_post(api_edit_pub,self.edit_req.$model,self);
                                layer.close(other_layer);
                            }
                        },
                        cancel: function () {
                            self.edit_req.gsfw = '';
                            self.edit_req.gssj = '';
                            self.edit_req.mkid = '';
                            self.edit_req.sfsh = '';
                            // self.edit_req.xsqr = '';
                        }
                    });

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //    编辑
                            case api_edit_pub:
                                this.complete_edit_pub(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //查询
                complete_query_pub:function(data){
                    var list = this.list;
                    var pub_list = data.data;
                    if(data.data == null || data.data == undefined || data.data.length == 0){
                        return;
                    }
                    for(var i=0;i<pub_list.length;i++){
                        var id = pub_list[i].mkid;
                        for(var j=0;j<list.length;j++){
                            if(id == list[j].mkid){
                                if(id == 1){
                                    list[j].stu = pub_list[i].xsqr;
                                }
                                list[j].department = pub_list[i].sfsh;
                                list[j].range = pub_list[i].gsfw;
                                list[j].time = pub_list[i].gssj ? pub_list[i].gssj : '';
                                break;
                            }
                        }
                    }
                    this.list = list;
                },
            //    编辑
                complete_edit_pub:function(data){
                    //清空之前的选择
                    this.par_check = '';
                    this.kid_check = '';
                    this.edit_req.gsfw = '';
                    this.edit_req.gssj = '';
                    this.edit_req.mkid = '';
                    this.edit_req.sfsh = '';
                    // this.edit_req.xsqr = '';
                    //查询
                    ajax_post(api_query_pub,{},this);
                },
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });