/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user","user_public/css/user","css!"),
        C.Co("user","schoolUserControl/classControl/classControlList","css!"),
        C.Co("user","districtUserControl/districtStuInfo/districtStuInfo","html!"),
        C.CM("table"),
        C.CM("modal"),C.CM('three_menu_module'),
        C.CMF("data_center.js")],
    function (avalon,css1,css2, html, tab, modal,three_menu_module, data_center) {
        // 学生信息列表
        var api_student_list = api.user + "student/studentList.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                // 列表数据接口
                url:  api_student_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "student_name"
                    },
                    {
                        title: "性别",
                        type: "cover_text",
                        from: "sex",
                        dict: {
                            1: '男',
                            2: '女'
                        }
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "student_num"
                    },{
                        title: "学校名称",
                        type: "text",
                        from: "school_name"
                    },
                    {
                        title: "年级",
                        type: "text",
                        from: "grade_name"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "科类",
                        type: "cover_text",
                        from: "arts_or_science",
                        dict: {
                            0: '不分文理',
                            1: '文科',
                            2: '理科'
                        }
                    },
                    {
                        title: "学生类别",
                        type: "cover_text",
                        from: "current_or_over",
                        dict: {
                            0: "不分应往届",
                            1: "应届",
                            2: "往届"
                        }
                    }],
                // 附加参数
                extend: {
                    district: "",
                    school_name:"",
                    student_num: "",
                    student_name: "",
                    __hash__: ""
                },
                other: {
                    school_name:"",
                    student_num: "",
                    student_name: ""
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            var department_level = data.department_level;
                            if (department_level == "3") {
                                self.extend.district = data.district;
                                self.is_init = true;
                            }
                        }
                    });
                },
                //查询
                schoolNameSearch: function () {
                    this.extend.school_name = this.other.school_name
                },
                studentNameSearch: function () {
                    this.extend.student_name = this.other.student_name
                },
                studentNumSearch: function () {
                    this.extend.student_num = this.other.student_num
                },
                init: function () {
                    this.cds();
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });