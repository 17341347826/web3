/**
 * Created by Administrator on 2018/9/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("notice", "operation_manual/operation_manual", "css!"),
        C.Co("notice", "operation_manual/operation_manual", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js"),
    ],
    function ($, avalon, css, html, layer, data_center, formatUtil) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "operation_manual",
                //身份判断
                ident_type:'',
                list:[],
                //页面切换
                gra_change:function(){
                    window.location = '#common_problem';
                },
                //链接跳转
                href_turn:function(url){
                    window.location = url;
                },
                init:function () {
                    //1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师；7-学生
                    var highest_level = cloud.user_level();
                    //0：管理员；1：教师；2：学生；3：家长
                    var user_type = cloud.user_type();
                    if(highest_level == 1){//省
                    }else if(highest_level == 2){//市
                        this.list = [
                            {question:"市级系统管理员",
                                answer:"学生综合素质评价操作手册2.0（市_系统管理员）.pdf",
                                url:'http://qiniu.xtyun.net/%E7%AE%A1%E7%90%86%E8%80%85%E5%92%8C%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98.pdf'
                            },
                            {question:"市级管理者",
                                answer:"学生综合素质评价操作手册2.0（市_管理者）.pdf",
                                url:'http://qiniu.xtyun.net/%E7%AE%A1%E7%90%86%E8%80%85%E5%92%8C%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98.pdf'
                            },
                        ]
                    }else if(highest_level == 3){//区县
                        this.list = [
                            {question:"区县系统管理员",
                                answer:"学生综合素质评价操作手册2.0（区县_系统管理员）.pdf",
                                url:'http://qiniu.xtyun.net/%E7%AE%A1%E7%90%86%E8%80%85%E5%92%8C%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98.pdf'
                            },
                            {question:"区县管理者",
                                answer:"学生综合素质评价操作手册2.0（区县_管理者）.pdf",
                                url:'http://qiniu.xtyun.net/%E7%AE%A1%E7%90%86%E8%80%85%E5%92%8C%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98.pdf'
                            },
                        ]
                    }else if(highest_level == 4){//学校
                        this.list = [
                            {question:"学校系统管理员",
                                answer:"学生综合素质评价操作手册2.0（学校_系统管理员）.pdf",
                                url:'http://qiniu.xtyun.net/%E7%AE%A1%E7%90%86%E8%80%85%E5%92%8C%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98.pdf'
                            },
                            {question:"学校管理者",
                                answer:"学生综合素质评价操作手册2.0（学校_管理者）.pdf",
                                url:'http://qiniu.xtyun.net/%E7%AE%A1%E7%90%86%E8%80%85%E5%92%8C%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98.pdf'
                            },
                            {question:"教师",
                                answer:"学生综合素质评价操作手册2.0（教师）.mp4",
                                url:'http://qiniu.xtyun.net/%E6%95%99%E5%B8%88.pdf'
                            },
                            {question:"学生",
                                answer:"学生综合素质评价操作手册2.0（学生）.pdf",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E7%94%9F%E3%80%81%E5%AE%B6%E9%95%BF.pdf'
                            },
                            {question:"家长",
                                answer:"学生综合素质评价操作手册2.0（家长）.mp4",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E7%94%9F%E3%80%81%E5%AE%B6%E9%95%BF.pdf'
                            },
                        ]
                    }else if(highest_level == 5 || highest_level == 6){//教师
                        this.list = [
                            {question:"教师",
                                answer:"学生综合素质评价操作手册2.0（教师）.mp4",
                                url:'http://qiniu.xtyun.net/%E6%95%99%E5%B8%88.pdf'
                            },
                            {question:"学生",
                                answer:"学生综合素质评价操作手册2.0（学生）.pdf",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E7%94%9F%E3%80%81%E5%AE%B6%E9%95%BF.pdf'
                            },
                            {question:"家长",
                                answer:"学生综合素质评价操作手册2.0（家长）.mp4",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E7%94%9F%E3%80%81%E5%AE%B6%E9%95%BF.pdf'
                            },
                        ]
                    }else if(highest_level == 7 && user_type == 2){//学生
                        this.list = [
                            {question:"学生",
                                answer:"学生综合素质评价操作手册2.0（学生）.pdf",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E7%94%9F%E3%80%81%E5%AE%B6%E9%95%BF.pdf'
                            },
                        ]
                    }else if(highest_level == 7 && user_type == 3){//家长
                        this.list = [
                            {question:"家长",
                                answer:"学生综合素质评价操作手册2.0（家长）.mp4",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E7%94%9F%E3%80%81%E5%AE%B6%E9%95%BF.pdf'
                            },
                        ]
                    }else if(highest_level == 41 && user_type == 1){//高中招生学校
                        this.list = [
                            {question:"高中招生学校",
                                answer:"学生综合素质评价操作手册2.0（高中招生学校）.pdf",
                                url:'http://qiniu.xtyun.net/%E5%AD%A6%E5%94%90%E4%BA%91%C2%B7%E5%AD%A6%E7%94%9F%E7%BB%BC%E5%90%88%E7%B4%A0%E8%B4%A8%E8%AF%84%E4%BB%B7%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C%EF%BC%88%E9%AB%98%E4%B8%AD%E6%8B%9B%E7%94%9F%E5%AD%A6%E6%A0%A1%EF%BC%89.docx'
                            }
                        ]
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