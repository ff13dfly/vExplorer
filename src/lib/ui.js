import { WOW } from 'wowjs';

const map={};

const animates={
    out: "animate__backOutUp",
    in: "animate__backOutDown",
};
const UI={
	regComponent: (name, cls) => {
        map[name] = cls;
        return true;
    },
    autoHide: (name, way, hide) => {
        var cls = map[name];
        var ani = animates[way];
        if (!cls || !ani) return false;

        var wow = new WOW(
            {
                boxClass: cls,
                animateClass: ani,
                offset: 100,
                callback: function (box) {
                    if (hide) box.style.display = "none";
                },
                scrollContainer: null
            }
        );
        wow.init();
    },
    autoShow: (name,ani) => {
        var cls = map[name];
        var elements = document.getElementsByClassName(cls);
        if(!elements || elements.length<1) return false;
        var box=elements[0];
        box.style.display = "block";
    },
};

export default UI;