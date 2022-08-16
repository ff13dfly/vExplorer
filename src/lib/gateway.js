import $ from 'jquery';		//JSONP的实现
import JsonP from 'jsonp';

let account='';
let endpoint='';
let spam='';

const self = {
    setEndpoint:(uri)=>{
        endpoint=uri;
    },
    setAccount:(acc)=>{
        account=acc;
    },
    spam:(ck)=>{
        const rpc = {
            "method":"spam",
            "params":{"app":"vExplorer"}
        };
        self.request(rpc,function(res){
            spam=res.spam;
            ck && ck(res);
        });
    },

    view:(anchor,ck)=>{
        const json={
            "id":"",
            "method":"call",
            "params":{
                "service":"vHistory",
                "fun":"view",
                "spam":spam,
                "anchor":anchor
            }
        };
        self.request(json,ck);
    },
    history:(anchor,ck)=>{
        const json={
            "id":"",
            "method":"call",
            "params":{
                "service":"vHistory",
                "fun":"view",
                "spam":spam,
                "anchor":anchor
            }
        };
        self.request(json,ck);
    }, 
    request:(json,ck)=>{
        if(!account){
            //console.log('No account to request.');
            return false;
        }
        json.jsonrpc="2.0";
        if(!json.id) json.id=account;       //默认设置一个值
        self.jsonp(endpoint, json, function(res) {
            if(!res.result){
                if(res.code && res.code===44){
                    self.spam();
                }else{
                    self.error(res);
                    ck && ck(res);
                }
            }else{
                ck && ck(res.result);
            }
        });
    },
    jsonp:(server,data,ck)=>{
        var uri=server+'?';
        if(data.id) uri += `id=${data.id}&`;
        if(data.method) uri += `method=${data.method}&`;
        for(var k in data.params) uri += `${k}=${data.params[k]}&`;
        uri+='callback=?';
        console.log(uri);
        $.getJSON({type:'get',url:uri,async:false,success:function(res){
            if(!res.result || !res.result.success){
                console.log('server failed,messsage:'+res.message);
            } 
            ck && ck(res);
        }});
    },
};

const Gateway={
    init:{
        account:self.setAccount,
        endpoint:self.setEndpoint,
        spam:self.spam,
    },
	search:function(anchor,ck){},
	view:self.view,
	write:function(anchor,data,ck){},
	history:self.history,
    sell:function(){},
    buy:function(){},
}
export default Gateway;