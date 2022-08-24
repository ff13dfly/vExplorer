import $ from 'jquery';     //使用其中的JSONP，后面考虑替代

let account='';
let endpoint='';
let spam='';  

let dServers={};
let oServers={};

const self = {
    setEndpoint:(uri)=>{
        endpoint=uri;
    },
    setAccount:(acc)=>{
        account=acc;
    },
    basic: function(ck) {
        const rpc = {
            "method":"system_access",
            "params":{
                "spam":spam,
            }
        };
        self.request(rpc,ck);
    },
    spam:(ck)=>{
        const rpc = {
            "method":"spam",
            "params":{"app":"vExplorer"}
        };
        self.request(rpc,function(res){
            //console.log(`Spam method: ${JSON.stringify(res)}`);
            if(!res.spam) return ck && ck(false);
            spam=res.spam;
            ck && ck();
        });
    },
    pass:(params,index,ck)=>{
        const json={
            "id":"",
            "method":"call",
            "params":{
                "service":"vHistory",
                "fun":"view",
                "spam":spam,
                //"anchor":anchor
            }
        };
        self.request(json,ck);
    },
    order:(params,index,ck)=>{
        //1.从
    },
    view:(anchor,ck)=>{
        //1.从dServer里直接取可用的

        //2.调用pass进行数据获取
        
    },
    history:(anchor,ck)=>{
        // const json={
        //     "id":"",
        //     "method":"call",
        //     "params":{
        //         "service":"vHistory",
        //         "fun":"view",
        //         "spam":spam,
        //         "anchor":anchor
        //     }
        // };
        // self.request(json,ck);
    }, 
    request:(json,ck)=>{
        //console.log(`Request:${JSON.stringify(json)}`);
        //if(json.method==='system_basic' && !!spam) return console.log('Ok');
        if(!account) return ck && ck(false);
        if(!spam && json.method!=='spam'){
            return self.spam(()=>{
                json.params.spam=spam;      //把spam填充到请求里;
                return self.request(json,ck);
            });
        }

        json.jsonrpc="2.0";
        if(!json.id) json.id=account;       //默认设置一个值
        self.jsonp(endpoint, json, function(res) {
            //console.log(`RPC data:${JSON.stringify(res)}`);
            if(!res.result){
                if(res.code && res.code===44){
                    spam='';
                    return self.request(json,ck);
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
    init:(ck)=>{
        dServers={};
        oServers={};
        //console.log('ready to get avalid methods, endpoint:'+endpoint);
        self.basic((res)=>{
            const list=res.list;
            for(var k in list){
                const row=list[k];
                for(var kk in row){
                    const p=row[kk];
                    console.log(p);
                    if(p.type==='direct'){
                        if(dServers===null || !dServers[k]) dServers[k]={active:[],funs:{}};
                        dServers[k].active.push(kk);
                        for(var fun in p.fn){
                            dServers[k].funs[fun]=p.fn[fun];
                        }
                    }

                    if(p.type==='order'){

                    }
                    
                }
            }

            console.log(dServers);
            console.log(oServers);
        });
        ck && ck();
    },
};

const Gateway={
    set:{
        init:self.init,
        account:self.setAccount,
        endpoint:self.setEndpoint,
        spam:self.spam,
    },
    common:{
        search:function(anchor,ck){},
        view:self.view,
        history:self.history,
    },
    extra:{
        pass:{},
        order:{},
        //charge:self.charge,
        //free:self.free,
    },
};

export default Gateway;