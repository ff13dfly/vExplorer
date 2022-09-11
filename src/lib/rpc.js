import { ApiPromise, WsProvider } from '@polkadot/api';
import Direct from './direct';
import Gateway from './gateway';

const config={
	endpoint:'',
	entry:'',
};

let wsAPI=null;
const self={
	link:(ck) => {
		if (wsAPI === null) {
			//console.log('ready to link...');
			//console.log(JSON.stringify(config));
			try {
				const provider = new WsProvider(config.endpoint);

				ApiPromise.create({ provider: provider }).then((api) => {
					//console.log('Linked...');
					wsAPI = api;
					ck && ck(true);
				});
			} catch (error) {
				ck && ck(false);
			}
		} else {
			ck && ck(true);
		}
	},
	search: (anchor, ck) => {
		anchor=anchor.toLocaleLowerCase();
		self.link((success) => {
			if(!success) return ck && ck(false);
			wsAPI.query.anchor.anchorOwner(anchor, (res) => {
				let result = { owner: null, blocknumber: 0, name: anchor,raw:{},empty:true};
				if (res.isEmpty) return ck && ck(result);

				result.owner =res.value[0].toHuman();
				result.block = res.value[1].words[0];
				
				wsAPI.rpc.chain.getBlockHash(result.block, (res) => {
					const hash = res.toHex();
					if (!hash) return ck && ck(false);
					wsAPI.rpc.chain.getBlock(hash).then((dt) => {                      
						if (dt.block.extrinsics.length === 1) return ck && ck(result);
						const exs = self.filter(dt,'setAnchor');
						let raw=null;
						for (let i = 0; i < exs.length; i++) {
							const data = exs[i].args;
							if(data.key!== anchor) continue;
							if(data.protocol) data.protocol=JSON.parse(data.protocol);
							if(data.protocol.type === "data" && data.protocol.format === "JSON") data.raw=JSON.parse(data.raw);
							result.data=data;
						}
						result.empty=false;
						ck && ck(result);
					});
				});
				
			});
		});
	},
	filter: (dt, method) => {
		let arr = [];
        dt.block.extrinsics.forEach((ex, index) => {
            const dt=ex.toHuman();
            if (index !== 0 && dt.method.method === method) {
                arr.push(dt.method);
            }
        });
        return arr;
	},
	copy:(obj)=>{
		const res={};
		for(var k in obj){
			res[k]=obj[k];
		}
		return res;
	},
	group:(start,ck)=>{
		//1.设置基础数据
		config.endpoint=start.node;
		config.entry=start.anchor;
		RPC.start=start;

		//2.整理基础方法
		//RPC.common={};
		RPC.common=self.copy(Direct.common);
		RPC.extra={};
		//console.log(JSON.stringify(start));
		if(start.gateway){
			//2.1.combine basic method
			Gateway.set.endpoint(start.server);
			Gateway.set.account(start.account);
			RPC.extra=Gateway.extra;

			//2.2.using gateway common method;
			for(var k in Gateway.common){
				RPC.common[k]=Gateway.common[k];
			}
			
			Gateway.set.init(ck);
		}else{
			//2.3.use direct method as default.
			//console.log(Direct.common);
			for(var k in Direct.common){
				RPC.common[k]=Direct.common[k];
			}
			ck && ck();
		}
	},
	destory:()=>{
		wsAPI=null;
	},
};

const RPC={
	common:{},
	extra:{},
	server:{},
	start:null,
	ready:false,		//websocket状态
	empty:true,			//是否有入口anchor
	init:(start,ck)=>{
		//console.log('RPC init before group by '+JSON.stringify(start));
		self.group(start,() => {
			RPC.ready=false;
			RPC.empty=true;
			self.destory();
			self.search(config.entry,(res)=>{
				if(res===false){
					return ck && ck(false);
				} 
				Direct.set.websocket(wsAPI);
				RPC.ready=true;
	
				if(res.empty) return ck && ck({error:'No entry anchor.'});
	
				RPC.empty=false;
				if(res.data && res.data.raw) RPC.server=res.data.raw;
				ck && ck(true);
			});
		});
	},
	setExtra:(name,fn) => {
		RPC.extra[name]=fn;
	},
};

export default RPC;