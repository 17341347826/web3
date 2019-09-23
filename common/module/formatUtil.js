avalon.filters.isNll = function (a) {
    if (a == null || a == undefined) {
        return "";
    } else {
        return a;
    }
};

avalon.filters.return_zero = function (a) {
    if (a == null || a == undefined) {
        return 0;
    } else {
        return a;
    }
};

avalon.filters.filter_null = function(a,dft){
    if(a==null||a==undefined){
        return dft;
    }
    return a;
}

avalon.filters.img = function (img_data) {
    var token = sessionStorage.getItem("token");
    return HTTP_X+"api/file/get?token=" + token + "&img=" + img_data;
};

avalon.filters.student_head = function (a, dft) {
    var head = cloud.user_photo({guid: a});
    if (head == "" || head == undefined)
        return dft;
    return avalon.filters.img(head);
}
avalon.filters.sex = function (a) {
    if (a == "1")
        return "男";
    else (a == "2")
    return "女";
    return ""
}

avalon.filters.grade = function (a) {
    if (a == 7) {
        return "七年级";
    } else if (a == 8) {
        return "八年级";
    } else if (a == 9) {
        return "九年级";
    }
};
avalon.filters.semester = function (a) {
    if (a == 0) {
        return "上学期";
    } else if (a == 1) {
        return "下学期";
    }
};

avalon.filters.json_parse = function (x) {
    return JSON.parse(x)
};
avalon.filters.json = function (x) {
    return JSON.stringify(x)
};
avalon.filters.monReg = function (x) {
    var year = x.substring(0, 4);
    var mon = x.substring(4, x.length);
    return x = year + "-" + mon
};

avalon.filters.weekReg = function (x) {
    var year = x.substring(0, 4);
    var week = x.substring(4, x.length);
    return x = year + "年，第" + week + "周"
};

avalon.filters.fmtDate = function (a) {
    if (a) {
        return a.substring(0, 10)
    }
    return a
};

avalon.filters.mtruncate = function (a, ps, pe) {
        return a.substr(0,ps) + "**" + a.substr(a.length - pe, a.length-1)
}
avalon.filters.double_filter = function (data) {
    return data.toFixed(2)+'%';
}
//百分比保留两位小数
avalon.filters.rj_filter= function (data) {
    if (!data || data == 'undefined' || data=='NaN')
        return 0;
    if(0<data && data<0.01){
       return 0.01;
    }else if(99.99<data && data<100){
        return 99.99;
    }
    return data.toFixed(2);
}
avalon.filters.percent= function (data) {
  if (!value || value == 'undefined' || value=='NaN')
        data = 0;
    return data.toFixed(2);
}
avalon.filters.people = function (data) {
      if (!value || value == 'undefined' || value=='NaN')
        data = 0;
    return Number(data).toFixed(0)
}
// function sortByProperty(property_name) {
//     return function (obj1,obj2) {
//         if(obj1[property_name]){
//             return -1
//         }else {
//             return 1;
//         }
//     }
// }
avalon.filters.isNaN = function (a) {
    if (a == NaN) {
        return "";
    } else {
        return a;
    }
};
//过滤器-string转parseFloat
avalon.filters.str_float = function(str){
    if (!str || str == 'undefined' || str=='null'){
        return 0;
    }
    return parseFloat(str);
};

//过滤器-求绝对值
avalon.filters.absFilter = function(str){
    if (!str || str == 'undefined' || str=='null'){
        return 0;
    }
    return Math.abs(str);
};
