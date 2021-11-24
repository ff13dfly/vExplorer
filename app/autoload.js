;
(function($) {
    var endpoint = ''; //启动的url
    var container = ''; //加载app的dom的id
    var me = {
        'protocol': {
            'data': {
                'entry': 'show',
                'source': 'data.js',
            },
            'app': {
                'entry': 'run',
                'source': 'app.js',
            },
            'NFT': {
                'entry': 'show',
                'source': 'nft.js',
            },
            '3DNFT': {
                'entry': 'render',
                'source': '3dnft.js',
            },
        },
        'preter': 'vex',
    };
    var self = {
        auto: function(vurl, anchor, con) {
            //console.log(anchor);
            if (!anchor) return self.info('<h2>No anchor to access.<h2>');

            endpoint = vurl;
            container = con;

            self.info('<h2>Ready to get anchor from vCache...</h2>');
            self.getAnchor(anchor, function(res) {
                if (!res.success || !res.data) return self.info('<h2>No such anchor : ' + anchor + '</h2>');
                //console.log(res);
                var protocol = res.data.more;
                self.router(protocol, self.hex2str(res.data.raw), res.data.block, res.data.owner);
                //self.router(protocol, self.hex2str(res.data.raw), res.data.block, res.data.owner);
            });
        },

        router: function(proto, raw, block, owner) {
            //console.log(raw);
            $(container).html('');
            if (!me.protocol[proto.type]) return self.showUnkown(proto, raw);
            var tg = me.protocol[proto.type];
            var linker = { anchor: self.getAnchor, decode: self.hex2str, container: container };
            self.load(tg.source, function() {
                var dt = window[me.preter][tg.entry](proto, raw, block, owner);
                if (dt.dom) $(container).html(dt.dom);
                if (dt.auto) dt.auto(linker);
            });
        },
        showUnkown: function(proto, raw) {
            var dom = '<h2>Unkown anchor type.</h2><hr>';
            dom += '<h3>Protocol:' + JSON.stringify(proto) + '</h3><br>';
            dom += '<h3>Raw data:' + raw + '</h3>';
            $(container).html(dom);

        },
        checkApp: function(str) {
            var rst = str.indexOf('function anchorApp(');
            return rst == -1 ? false : true;
        },

        //获取数据的方法

        hex2str: function(hex) {
            //console.log(hex);
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
        info: function(txt) {
            $(container).html(txt);
        },
        getAnchor: function(anchor, ck) {
            var furl = endpoint + anchor + '?callback=?';
            $.getJSON({
                type: 'get',
                url: furl,
                async: false,
                success: function(res) {
                    if (!res.success) return ck && ck(false);
                    ck && ck(res);
                }
            });
        },
        load: function(fa, ck) {
            var purl = 'app/' + fa;
            $.ajax({
                url: purl,
                timeout: 20000,
                success: function(res) {
                    ck && ck(res);
                }
            });
        },
    }
    window.vExplorer = self.auto;
})($);