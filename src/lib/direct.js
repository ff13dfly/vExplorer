let wsAPI = null;

const self = {
	setServer: (ws, ck) => {

	},
	search: (anchor, ck) => {
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
	},
};

exports.direct = {
	node: null,
	gateway: null,
};