import $ from 'jquery';		//JSONP的实现
let account='';
let endpoint='';
let spam='';

const self = {
    setEndpoint:function(uri){
        endpoint=uri+'?callback=?';
    },
    setAccount:function(acc){
        account=acc;
    },
    spam: function(ck) {
        const rpc = {
            "method":"spam",
            "params":{"app":"vManager"}
        };
        self.request(rpc,function(res){
            spam=res.spam;
            ck && ck(res);
        });
    },
    request:function(json,ck){
        json.jsonrpc="2.0";
        if(!json.id) json.id=account;       //默认设置一个值
        self.jsonp(endpoint, json, function(res) {
            if(!res.result){
                if(res.code && res.code==44){
                    self.spam(function(){
                        //self.request(json,ck);
                        //ck && ck({code:666});
                    });
                }else{
                    self.error(res);
                    ck && ck(res);
                }
            }else{
                ck && ck(res.result);
            }
        });
    },
    jsonp: function(server, data, ck) {
        //console.log(server);
        console.log(JSON.stringify(data));
        var cfg = {
            type: 'post',
            url: server,
            data: data,
            async: false,
            success: function(res) {
                ck && ck(res);
            }
        };
        $.getJSON(cfg);
    }
};

const Gateway={
    init:{
        account:self.setAccount,
        endpoint:self.setEndpoint,
    },
	search:function(anchor,ck){},
	view:function(anchor,ck){},
	write:function(anchor,data,ck){},
	history:function(anchor,ck){},
    sell:function(){},
    buy:function(){},
}
export default Gateway;