const tools = {
	shortenAddress: (address, n) => {
		if (n === undefined) n = 10;
		return address.substr(0, n) + '...' + address.substr(address.length - n, n);
	},
	u8toString: (arr) => {
		let str = '0x';
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] < 16) str += '0';
			str += arr[i].toString(16);
		}
		return str;
	},
	hex2str: (hex) => {
		if (!hex) return false;
		var trimedStr = hex.trim();
		var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
		var len = rawStr.length;
		if (len % 2 !== 0) { alert("Illegal Format ASCII Code!"); return ""; }
		var curCharCode;
		var resultStr = [];
		for (var i = 0; i < len; i = i + 2) {
			curCharCode = parseInt(rawStr.substr(i, 2), 16);
			resultStr.push(String.fromCharCode(curCharCode));
		}
		return resultStr.join("");
	},
	hex2ab: (hex) => {
		const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
			return parseInt(h, 16)
		}));
		return typedArray.buffer;
	},
}

export default tools;