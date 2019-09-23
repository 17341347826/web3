/**
 * Created by Administrator on 2017/4/17.
 *
 */

// 全局标志位
var arr = [
    api.api + 'base/baseUser/sessionuser.action',
    //评价结果发布调取年级
    api.api + 'base/class/school_class.action',
    //评价结果发布调取项目
    api.api + 'Indexmaintain/find_list_project',
    //标志性卡公示
    api.api + 'everyday/page_gain_card_by_status',
    // 学生列表
    api.api + "everyday/statistics_indexall",
    //学校列表
    api.PCPlayer + "school/schoolList.action",
    //年级列表 // 班级列表
    api.PCPlayer + "class/school_class.action",
    //年级----班级列表
    api.PCPlayer + "class/findClassSimple.action",
    //首页 新增记录 审核情况 日常表现(指标)
    api.api + "GrowthRecordBag/home_page_statistics",
    //获取当前学年学期
    api.api + "base/semester/current_semester.action",
];

var encode_skip_list = [location.origin + "/api/base/baseUser/login.action", api.api+"base/baseUser/updpwd"];
document.write("<script type='text/javascript' src='common/lib/bin/jsencrypt.js'></script>");
document.write("<script type='text/javascript' src='common/lib/rsa_public_key.js'></script>");
// document.write("<script type='text/javascript' src='//cdn.bootcss.com/layer/3.0/layer.min.js'></script>");
document.write("<script type='text/javascript' src='common/lib/layer.min.js'></script>");

// var public_key="-----BEGIN PUBLIC KEY-----"+
//     "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDVkXq/WLyQKhgYXJ4Cq5gh65Cj"+
//     "+0YFtVjJ4jnBNXtnTtOyqiTUf0Klu/cPKSlqYnkNaPQY5m4BOKS3aFAiFpPCRZbI"+
//     "qNfRCBlUv6wk9U7afl+6cb6NBTzBC4fLh3fhYWtbR+WYMIpj0iIYMPqnpAesCj7i"+
//     "cj85yZrois0j8fxDtQIDAQAB"+
//     "-----END PUBLIC KEY-----"
function report(func_code) {
    var cmd = api.user + "log_visit/save_visit";
    var pms = {
        visit_page: func_code
    }
    $.ajax({
        method: "POST",
        url: cmd,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(pms),
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            if (token != undefined && token != "")
                xhr.setRequestHeader('Token', token);
        }, //这里设置header
        success: function (repsData, statusCode, xhr) {
        },
        error: function (repsData, status, xhr) {
        }
    })
}

function encryption(cmd,data) {
    // var is_skip_encode = false;
    // if(encode_skip_list.indexOf(cmd)==-1 && window.location.protocol!='https:'){
    //     is_skip_encode = true;
    // }
    // if(is_skip_encode){
    //     var publicKey = public_key;
    //     var encrypt = new JSEncrypt(); // 实例化加密对象
    //     encrypt.setPublicKey(publicKey); // 设置公钥
    //     data = encrypt.encrypt(JSON.stringify(data));
    //     return data;
    // }
    return JSON.stringify(data);
}


function ajax_post(cmd, data, who, is_check) {
    if (false) {
        window.location = api.skip_on_not_login;
    } else {
        var ask_for = true;
        //=======防止5秒内请求重复请求=============
        // var cmd_list_queue = cmd.substr(cmd.length - 10);
        //查询问卷接口可能在5秒内重复调用
        // var cmd_paper = cmd.substr(cmd.length - 17);
        //查询可回答的问卷列表判定请求时候带参数
        // var cmd_answer_paper = cmd.substr(cmd.length - 16);
        // if(cmd_answer_paper&&cmd_answer_paper=='page_start_quest'){
        //     if(data.power==''){
        //         ask_for = false;
        //     }
        // }
        //判断请求是否是sessonuser,因为sessionuser页面加载进来会请求多次
        // cmd_str != 'sessionuser.action' && cmd_list_queue != 'list_queue'
        // && cmd_paper != 'get_questionnaire'
        // if (arr.indexOf(cmd) < 0) { //可以进行重复刷新
        if(0){
            //请求代理
            var cmd_agent = sessionStorage.getItem('cmd_agent');
            //参数代理
            var data_agent = sessionStorage.getItem('data_agent');
            //判断cmd代理是否存在
            if (!cmd_agent) {
                sessionStorage.setItem('cmd_agent', cmd);
                var data_agent_string = JSON.stringify(data);
                sessionStorage.setItem('data_agent', data_agent_string);
                sessionStorage.setItem('start_time_agent', new Date().getTime())
            } else {
                var data_str = JSON.stringify(data);
                //如果两次请求不相等或者数据参数不相等，替换cmd代理的数据
                if (cmd != cmd_agent || data_str != data_agent) {
                    sessionStorage.setItem('cmd_agent', cmd);
                    sessionStorage.setItem('data_agent', data_str);
                    sessionStorage.setItem('start_time_agent', new Date().getTime())
                } else {
                    //如果两次请求接口相同，并且参数相同
                    var now_time = new Date().getTime();
                    var start_time = sessionStorage.getItem('start_time_agent');
                    //比较两次请求的时间差
                    var time_differ = now_time - parseInt(start_time);
                    if (time_differ / 1000 < 5) {
                        ask_for = false;
                    } else {
                        sessionStorage.setItem('start_time_agent', new Date().getTime())
                    }

                }
            }
        }
        //=================
        if (ask_for) {
            var HTTP_X = location.origin;
            //登录
            var api_is_online = HTTP_X + "/api/base/log_visit/online";
            //
            var api_get_online = HTTP_X + '/api/base/baseUser/get_onlie_time';
            var myDate = new Date();//获取系统当前时间
            var first_time = '';
            var old_time = '';

           data = encryption(cmd,data);
           if(window.location.hash == ''){//登录进来首页

           }else{
               //定义数据加载
               // var dLoading = layer.load(1, {shade:[0.3,'#121212']});
           }
            $.ajax({
                method: "POST",
                url: cmd,
                dataType: "json",
                contentType: "application/json",
                xhrFields: {
                    withCredentials: true
                },
                data: data,
                beforeSend: function (xhr) {
                    var token = window.sessionStorage.getItem("token");
                    if (token != undefined && token != "") {
                        xhr.setRequestHeader('Token', token);
                        // //判断ajax请求的时间
                        var first_time = myDate.getTime();//毫秒数
                        old_time = window.sessionStorage.getItem("set_first_time");
                        if (old_time == null) {//第一次没有时间
                            window.sessionStorage.setItem('set_first_time', first_time);
                        } else {
                            var time_value = (first_time - old_time) / 1000 / 60;//得到分
                            //获取用户在线时间
                            var online_time = sessionStorage.getItem('online_time')/60;
                            if (time_value > online_time) {
                                layer.msg('因您长时间未操作已自动退出，请重新登录');
                                sessionStorage.removeItem("set_first_time");
                                sessionStorage.removeItem("token");
                                sessionStorage.removeItem("user_info");
                                setTimeout(
                                    function () {
                                        var HTTP_X = location.origin;
                                        var login_remark = window.sessionStorage.getItem("login_remark");
                                        if (login_remark == 'wei_xin') {
                                            window.location = HTTP_X + "/Growth/wx_pj.html";
                                        } else if (login_remark == 'v_xy') {
                                            window.location = HTTP_X + "/Growth/wx_xy.html";
                                        } else {
                                            window.location = HTTP_X + "/Growth/new_index.html";

                                        }
                                    },2000
                                );
                                return false;
                            }else if (time_value > (online_time/2)-1 && time_value < online_time) {
                                window.sessionStorage.setItem('set_first_time', first_time);
                                ajaxPostOnline(api_is_online, {})
                            }else{
                                window.sessionStorage.setItem('set_first_time', first_time);
                            }
                        }
                    }
                },

                success: function (repsData, statusCode, xhr) {
                    // if(dLoading){
                    //     layer.close(dLoading);
                    // }
                    if (xhr.status == 401) {
                        alert('权限失效,为了您的安全,请重新登录!');
                        setTimeout(function () {
                            sessionStorage.removeItem("set_first_time");
                            var HTTP_X = location.origin;
                            window.location = HTTP_X + "/Growth/new_index.html";
                            return false;
                        }, 5000);
                    } else {
                        if (repsData.status != 200) { /*失败*/
                            // var str = HTTP_X + '/api/base/baseUser/login.action';
                            // if(HTTP_X != 'http://127.0.0.1' && HTTP_X != 'http://192.168.0.249:54321'){
                            //     if(cmd != str){
                            //         repsData.message = '操作失败';
                            //     }
                            // }
                            who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
                        } else { /*成功*/
                            who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message);
                        }
                    }
                },
                error: function (repsData, status, xhr) {
                    // if(dLoading){
                    //     layer.close(dLoading);
                    // }
                    who.on_request_complete(cmd, status, {}, false, repsData.message)
                }
            })
        }
    }
}
/**
 * 请求二维码
 * */
function ajax_post_code(cmd,data,who){
    data = encryption(cmd,data);
    $.ajax({
        method: "POST",
        url: cmd,
        dataType: "json",
        contentType: "application/json",
        xhrFields: {
            withCredentials: true
        },
        data: data,
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            if (token != undefined && token != "") {
                xhr.setRequestHeader('Token', token);
            }
        },
        success: function (repsData, statusCode, xhr) {
            if (repsData.status != 200) { /*失败*/
                who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
            } else { /*成功*/
                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message);
            }
        }
        ,
        error: function (repsData, status, xhr) {
            who.on_request_complete(cmd, status, {}, false, repsData.message)
        }
    })
}

/*同步*/
function ajax_post_sync(cmd, data, who) {
    data = encryption(cmd,data);
    var resp = $.ajax({
        method: "POST",
        url: cmd,
        dataType: "json",
        contentType: "application/json",
        data: data,
        async: false,
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            if (token != undefined && token != "")
                xhr.setRequestHeader('Token', token);
        }, //这里设置header
        success: function (repsData, statusCode, xhr) {
            if (repsData.status != 200) { /*失败*/
                if (repsData.message != '未知错误') {
                    who.on_request_complete(cmd, repsData.status, repsData, false, repsData.msg)
                }
            } else { /*成功*/
                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.msg)
            }
        },
        error: function (repsData, status, xhr) {
            who.on_request_complete(cmd, status, {}, false, "")
        }
    });
    return resp;
}


function ajax_get(cmd,form, who) {
    var html = "";
    var resp = jQuery.ajax({
        method: "GET",
        url: cmd,
        data:form,
        dataType: 'html',
        async: false,
        success: function (data) {
            //html = data;
            who.on_request_complete(data)
        }
    });
    return html;
}
//文件上传
function fileUpload(cmd, who, fmd) {
    var form_data = fmd;
    if (fmd == undefined)
        form_data = new FormData($("#uploadForm")[0])
    $.ajax({
        url: cmd,
        data: form_data,
        type: 'post',
        dataType: 'json',
        contentType: false,
        processData: false,
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            xhr.setRequestHeader('Token', token);
        },
        success: function (repsData, statusCode, xhr) {
            if (repsData.status != 200) { /*失败*/
                if (repsData.message != '未知错误') {
                    who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
                }
            } else { /*成功*/
                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message)
            }
        }
    })
}

function form_data_commit(cmd, form, who) {

    $.ajax({
        url: cmd,
        data: new FormData($("#" + form)[0]),
        type: 'post',
        dataType: 'json',
        contentType: false,
        processData: false,
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            xhr.setRequestHeader('Token', token);
        },
        success: function (repsData, statusCode, xhr) {
            if (repsData.status != 200) { /*失败*/
                if (repsData.message != '未知错误') {
                    who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
                }
            } else { /*成功*/
                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message)
            }
        },
        error: function (repsData, status, xhr) {
            who.on_request_complete(cmd, status, {}, false, "")
        }
    });
}

//form_data
function form_data(cmd, data, who) {
    if (!window.sessionStorage.getItem("token")) {
        window.location = "pj.xtyun.net/Growth/new_index.html";
    } else {
        $.ajax({
            method: "POST",
            url: cmd,
            dataType: "json",
            data: data,
            beforeSend: function (xhr) {
                var token = window.sessionStorage.getItem("token");
                if (token != undefined && token != "")
                    xhr.setRequestHeader('Token', token);
            }, //这里设置header
            success: function (repsData, statusCode, xhr) {
                if (repsData.status != 200) { /*失败*/
                    if (repsData.message != '未知错误') {
                        who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
                    }
                } else { /*成功*/
                    who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message)
                }
            },
            error: function (repsData, status, xhr) {
                who.on_request_complete(cmd, status, {}, false, "")
            }
        })

    }
}

//学业质量
function ajaxPost(cmd, data, who) {
    data = encryption(cmd,data);
    $.ajax({
        method: "POST",
        url: cmd,
        dataType: "json",
        contentType: "application/json",
        data: data,
        //可以添加到原生xhr对象上的key/value对，可以通过它来设置跨域的withCredentials为true。
        xhrFields: {withCredentials: true},
        success: function (repsData, statusCode, xhr) {
            // alert(repsData.status);
            if (repsData.status != 200) { /*失败*/
                who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
            } else { /*成功*/
                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message)
            }
        },
        error: function (repsData, status, xhr) {
            who.on_request_complete(cmd, status, {}, false, "")
        }
    })
}
//学业质量
function ajaxGet(cmd,data, who) {

    var resp = jQuery.ajax({
        method: "GET",
        //发送请求的地址。为空表示当前页
        url: cmd,
        //预期服务器返回的数据类型：可用值为xml，html，script，json，jsonp，text
        dataType: 'json',
        //发送到服务器的额数据的内容编码类型
        contentType: "application/json",
        //请求方式
        async: false,
        success: function (repsData, statusCode, xhr) {
            // alert(repsData.status);
            if (repsData.status != 200) { /*失败*/
                who.on_request_complete(cmd, repsData.status, repsData, false, repsData.message)
            } else { /*成功*/
                who.on_request_complete(cmd, repsData.status, repsData, true, repsData.message)
            }
        },
        error: function (repsData, status, xhr) {
            who.on_request_complete(cmd, status, {}, false, "")
        }
    });
    return resp;
}
//是否在线
function ajaxPostOnline(cmd, data) {
    data = encryption(cmd,data);
    $.ajax({
        method: "POST",
        url: cmd,
        dataType: "json",
        contentType: "application/json",
        data: data,
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            if (token != undefined && token != "")
                xhr.setRequestHeader('Token', token);

        }, //这里设置header
        success: function (repsData, statusCode, xhr) {
            if (repsData.status != 200) { /*失败*/
                window.location = HTTP_X + "/Growth/new_index.html";
            } else { /*成功*/
            }
        },
        error: function (repsData, status, xhr) {
            window.location = HTTP_X + "/Growth/new_index.html";
        }
    })
}