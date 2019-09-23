define([
        C.CLF('avalon.js'),
        'layer',
        C.CBF('Growth/home_x', 'html!'),
        C.CBF('Growth/home_x', 'css!'),
        //新增记录+使用状态
        C.CM("add_use_module"),
        //新增记录
        C.CM('add_new_record'),
        //使用状态
        C.CM('user_state'),
        C.CM("activity_performance"),
        // C.CM("audit_chart_module"),
        C.CM("check_dissent_module"),
        C.CM("dissenting_situation_module"),
        C.CM("activity_chart_module_new"),
        //待处理+待审核左右结构
        C.CM("remind_module_new"),
        //待处理+待审核上下结构-校
        C.CM("to_be_treated"),
        //待审核
        C.CM("to_be_audited"),
        //常用功能
        C.CM("individual_desktop_module"),
        //通知公告
        C.CM("notice_module"),
        C.CM("home_performance_module"),
        //待处理（待录入）-学生
        C.CM("remind_stu_module"),
        C.CM("term_evaluate_situation"),//当前学期评级进度情况
        C.CMF("router.js"),
        C.CMF("data_center.js")
    ],
    function (avalon,layer, html,css,add_use_module,add_new_record,user_state,
              activity_performance,check_dissent_module,dissenting_situation_module,
              activity_chart_module_new,remind_module,to_be_treated,to_be_audited,individual_desktop_module,
              notice_module,home_performance_module,remind_stu_module,term_evaluate_situation,
              x, data_center) {

        var avalon_define = function () {
            avalon.filters.fmtDate_notice = function (a) {
                if (a) {
                    return a.substring(0, 19);
                }
            };
            var vm = avalon.define({
                $id: "home_x",
                orderList:[],
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var highest_level = Number(data.data.highest_level);
                        var userData = JSON.parse(data.data['user']);
                        //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师 7个体
                        switch (highest_level) {
                            case 1:
                                self.highest_level = 1;//省级
                                break;
                            case 2:
                                self.orderList = [
                                    // {name:"新增记录",module_name:"ms-add-use-module"},//188
                                    {name:"新增记录",module_name:"ms-add-new-record"},//188
                                    {name:"使用状态",module_name:"ms-use-state"},//188
                                    {name:"通知模块",module_name:"ms-notice-module"},//192
                                    {name:"待处理",module_name:"ms-remind-module-new"},//191
                                    {name:"活跃度",module_name:"ms-activity-chart-module-new"},//193
                                    {name:"个性桌面",module_name:"ms-desktop-module"},//197
                                ];
                                break;
                            case 3:
                                self.orderList = [
                                    // {name:"新增记录",module_name:"ms-add-use-module"},//188
                                    {name:"新增记录",module_name:"ms-add-new-record"},//188
                                    {name:"使用状态",module_name:"ms-use-state"},//188
                                    {name:"通知模块",module_name:"ms-notice-module"},//192
                                    // {name:"活跃度",module_name:"ms-activity-chart-module-new"},//193
                                    // {name:"待处理",module_name:"ms-remind-module-new"},//191
                                    {name:"待审核",module_name:"ms-to-be-audited"},//191
                                    {name:"异议情况",module_name:"ms-dissent-chart-module"},//194
                                    {name:"个性桌面",module_name:"ms-desktop-module"}//197
                                ];
                                break;
                            case 4://校
                                self.orderList = [
                                    // {name:"新增记录",module_name:"ms-add-use-module"},//188
                                    // {name:"新增记录",module_name:"ms-add-new-record"},//188
                                    // {name:"使用状态",module_name:"ms-use-state"},//188
                                    {name:"通知模块",module_name:"ms-notice-module"},//192
                                    // {name:"活跃度",module_name:"ms-activity-chart-module-new"},//193
                                    // {name:"待处理",module_name:"ms-remind-module-new"},//191
                                    // {name:"待处理",module_name:"ms-to-be-treated"},//191
                                    // {name:"审核情况",module_name:"ms-check-dissent-module"},//190 审核情况+异议情况
                                    // {name:"个性桌面",module_name:"ms-desktop-module"}//197
                                ];
                                break;
                            case 6://班主任或普通任课教师
                                if(userData.lead_class_list.length > 0){//班主任
                                    self.orderList = [
                                        // {name:"新增记录",module_name:"ms-add-new-record"},//188
                                        // {name:"使用状态",module_name:"ms-use-state"},//188
                                        {name:"通知模块",module_name:"ms-notice-module"},//192
                                        // {name:"待处理",module_name:"ms-remind-module-new"},//191
                                        // {name:"待处理",module_name:"ms-to-be-treated"},//191
                                        // {name:"新增记录",module_name:"ms-add-use-module"},//188 新增记录+使用状态
                                        // {name:"审核情况",module_name:"ms-check-dissent-module"},//190 审核情况+异议情况
                                        // {name:"活跃度",module_name:"ms-activity-chart-module-new"},//193 日常表现+活动记录 活跃度
                                        // {name:"个性桌面",module_name:"ms-desktop-module"}//197
                                    ];
                                }else{//普通教师
                                    self.orderList = [
                                        {name:"通知模块",module_name:"ms-notice-module"},//192
                                        // {name:"个性桌面",module_name:"ms-desktop-module"}//197
                                    ];
                                }
                                break;
                            case 7://个体--学生、家长
                                self.orderList = [
                                    // {name:"待处理",module_name:"ms-remind-stu-module"},//191
                                    {name:"通知模块",module_name:"ms-notice-module"},//192
                                    // {name:"活动表现",module_name:"ms-activity-performance"},//195
                                    // {name:"日常表现",module_name:"ms-home-performance-module"},//196
                                    // {name:"个性桌面",module_name:"ms-desktop-module"},//197
                                    // {name:"当前学期评价进行情况",module_name:"ms-term-evaluate-situation"}//57
                                ];
                                break;
                        };
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        }
                    } else {
                        layer.msg(msg)
                    }
                }
            });
            vm.$watch('onReady', function () {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });