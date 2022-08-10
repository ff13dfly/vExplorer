import { ApiPromise, WsProvider } from '@polkadot/api';

const config={
	endpoint:'ws://localhost:9944',
	entry:'anchor',
};
let wsAPI=null;
const self={
	link: (server, ck) => {
		if (wsAPI === null) {
			const wsPvd = new WsProvider(server);
			ApiPromise.create({ provider: wsPvd }).then((api) => {
				wsAPI = api;
				ck && ck();
			});
		} else {
			ck && ck();
		}
	},
	search: (anchor, ck) => {
		API.link(server, () => {
			wsAPI.query.anchor.anchorOwner(anchor, (res) => {
				if (res.isEmpty) {
					ck && ck({ owner: 0, blocknumber: 0, anchor: anchor });
				} else {
					const owner = encodeAddress(res.value[0].toHex());
					const block = res.value[1].words[0];
					let result = { owner: owner, blocknumber: block, anchor: anchor };
					wsAPI.query.anchor.sellList(anchor, (dt) => {
						if (dt.value.isEmpty) return ck && ck(result);
						const cost = dt.value[1].words[0];
						result.cost = cost;
						ck && ck(result);
					});
				}
			});
		});
	},
};

exports.entry=function(){
	
}