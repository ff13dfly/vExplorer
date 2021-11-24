(function() {
    var cache = '';
    var self = {
        run: function(proto, raw, block, owner) {
            //console.log(raw)
            cache = raw;
            if (!self.checkApp(raw)) {
                var dom = '<h2>Anchor app code error.</h2>';
            } else {
                var dom = `<hr><p>Anchor app is ready to go. On block ${block} owned by ${owner}</p>`;
            }
            dom += `<div class="row gy-2">
                <div class="col-md-9 col-lg-9 col-xs-12"><textarea disabled="disabled" cols="3" style="width:100%">${cache}</textarea></div>
                <div class="col-md-3 col-lg-3 col-xs-12 text-end">
                    <button class="btn btn-md btn-primary" id="app_button">Load App on chain</button>
                </div>
            </div>`;
            return { dom: dom, auto: self.auto };
        },
        auto: function(linker) {
            //console.log(linker);
            if (!cache) {
                $(linker.container).html('<h2>Anchor app code error.</h2>');
            }

            $('#app_button').off('click').on('click', function() {
                eval(cache);
                anchorApp(linker);
                $(linker.container).html('');
            });
        },
        checkApp: function(str) {
            var rst = str.indexOf('function anchorApp(');
            return rst == -1 ? false : true;
        },
    }

    window.vex = self;
})();