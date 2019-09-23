/**
 * 品德详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("bottom_tab", "css!"),
        C.CM("bottom_tab", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function (avalon, css, html, x, data_center, layer) {
        var pdetail = undefined;
        //市端需要跳转的连接数组
        var tab_href_city = ['city_home','city_menu','person_info'];
        //区县端需要跳转的连接数组
        var tab_href_area = ['area_home','area_menu','person_info'];
        //学校端需要跳转的连接数组
        var tab_href_school = ['school_home','school_menu','person_info'];
        //教师端需要跳转的连接数组
        var tab_href_teacher = ['teacher_home','teacher_menu','person_info'];
        //学生端需要跳转的连接数组
        var tab_href_stu = ['student_home','stu_menu','person_info'];
        //家长端需要跳转的连接数组
        var tab_href_parent = ['parent_home','parent_menu','person_info'];
        // 作品基本详细信息组件
        var detail = avalon.component('ms-bottom-tab', {
            template: html,
            defaults: {
                cur_tab:'',
                is_app:is_app,
                is_weixin:is_weixin,
                is_stu:false,
                //身份:1：教师；2：学生；3：家长;4:市；5：区县；6：校
                ident_type:'',
                cb: function () {

                },
                change_tab:function (index) {
                    // var tab_href = tab_href_teacher;
                    // if(this.is_stu){
                    //     tab_href = tab_href_stu;
                    // }
                    var tab_href = '';
                    if(this.ident_type == 1){//教师
                        tab_href = tab_href_teacher;
                    }else if(this.ident_type == 2){//学生
                        tab_href = tab_href_stu;
                    }else if(this.ident_type == 3){//家长
                        tab_href = tab_href_parent;
                    }else if(this.ident_type == 4){//市
                        tab_href = tab_href_city;
                    }else if(this.ident_type == 5){//区县
                        tab_href = tab_href_area;
                    }else if(this.ident_type == 6){//学校
                        tab_href = tab_href_school;
                    }
                    window.location = '#'+tab_href[index-1];
                },

                onReady: function () {
                    data_center.link(this.$id, this);
                    pdetail = this;
                    this.cb();
                    this.then&&this.then(this);
                }
            }
        })

    });
