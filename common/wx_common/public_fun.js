/**
 *  object数组排序算法
 * @param data 数据源
 * @param by 排序依据 如["+id", "-name"]表示，以id升序排列，以name降序排列
 * @param is_desc 是否降序
 */
function sort_by(data, by) {
    function item_sort(a, b) {
        for (var x = 0; x < by.length; x++) {
            var opt = by[x][0];
            var cur_key = by[x].substr(1);
            if (a[cur_key] > b[cur_key]) {
                return opt == "+" ? 1 : -1;
            } else if (a[cur_key] < b[cur_key]) {
                return opt == "+" ? -1 : 1;
            } else {
                continue
            }
        }
        return 0;
    }

    data.sort(item_sort);
    return data;
}
function timeChuo(h,is_date) {
    var timestamp3 = h / 1000;
    var newDate = new Date();
    newDate.setTime(timestamp3 * 1000);
    Date.prototype.format = function (format) {
        var date = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S+": this.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    };
    var getTimeIs = newDate.format('yyyy-MM-dd');
    if(is_date){
        getTimeIs = newDate.format('yyyy-MM-dd hh:mm:ss');
    }

    return getTimeIs;
}
