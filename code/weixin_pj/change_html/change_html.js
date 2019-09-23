/**
 * Created by Administrator on 2018/3/8.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "change_html/change_html", "css!"),
        C.Co("weixin_pj", "change_html/change_html", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function($, avalon,css,html, x,data_center,weui) {
        var avalon_define = function(pmx) {
            var user_type = cloud.user_type();
            if(user_type == 1&&pmx.type=="home"){//教师
                window.location = '#teacher_home';
            }
            else if(user_type == 1&&pmx.type=="pj")//教师
            {
                window.location = '#teacher_menu';
            }
            else if(user_type == 1&&pmx.type=="mine")//教师
            {
                window.location = '#person_info';
            }
            else if(user_type == 2 &&pmx.type=="home"){//学生
                window.location = '#student_home';
            }
            else if(user_type == 2 &&pmx.type=="pj"){//学生
                window.location = '#stu_menu';
            }
            return;

            var vm = avalon.define({
                $id: "change_html",
            });

            return vm;
        };
        return {
            view: "",
            define: avalon_define
        }
    });




