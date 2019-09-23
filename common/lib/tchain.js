define([], function() {
    var task_chain = function() {
        this.guid_task = function(guid, caller, parent) {
            this.guid = guid;
            this.caller = caller;
            this.parent = parent;
            this.is_matched = function(guid) {
                if (guid == this.guid) {
                    return true;
                } else {
                    return false;
                }
            };
            this.do = function(p1, p2, p3, p4, p5, p6, p7, p8, p9) {
                if (this.parent != undefined) {
                    this.parent[this.caller](p1, p2, p3, p4, p5, p6, p7, p8, p9);
                } else {
                    this.caller(p1, p2, p3, p4, p5, p6, p7, p8, p9);
                }
            };
        }

        this.task_chain = [];
        this.push_guid_task = function(task_uuid, task_caller, parent) {
            var guid_task = new this.guid_task(task_uuid, task_caller, parent);
            this.task_chain.push(
                guid_task
            );
        };

        this.do = function(task_guid, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
            var vlen = this.task_chain.length;
            for (var i = 0; i < vlen; i++) {
                if (this.task_chain[i].is_matched(task_guid)) {
                    this.task_chain[i].do(p1, p2, p3, p4, p5, p6, p7, p8, p9);
                    break;
                }
            }
        };
    }
    
    var mul_ajax_promis = function (reqlist, reqpms) {

        this.reqlist = reqlist;
        this.reqpms = reqpms;

        this.suc_list = [];
        this.faild_list = [];

        this.cb = undefined;
        this.then = function (fc) {
            this.cb = fc;
        };

        this.on_request_complete = function(cmd, status, data, is_suc, msg){
            if(is_suc){
                this.suc_list.push({data:data, url:cmd});
            }else{
                this.faild_list.push({msg:msg, url:cmd});
            }
            if(this.reqlist.length == this.suc_list.length+this.faild_list.length){
                this.cb(this.suc_list, this.faild_list);
            }
        };

        this.init = function () {
            var self = this;
            for(var i in this.reqlist){
                ajax_post(this.reqlist[i], this.reqpms[i], this)
            }
        }

        this.init();
    }
    

    return {
        make_task_chain: function() {
            return new task_chain();
        },
        make_ajax_promis: function (reqlist, reqpms) {
            return new mul_ajax_promis(reqlist, reqpms);
        }
    };
});