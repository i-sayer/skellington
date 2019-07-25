/*
    utility code for selector based dom creation
    Ian Sayer - November 2015, December 2016
    add xml ns compat

          _z.dom() - bare minimum zencoding => dom element creation
*/
var _z = (function () {
    /**
        @description use css style selector string to generate DOM elements.
        @parameter {string} selector - list of element.class#id[+sibling|>child]
        @parameter [array|object] - Array or Object used for textContent|attribute substitution for ; character: "div;0", ["My text"] | "a;0", [{href:"mylink.com"}]
        @returns {dom element|documentFragment} 
    */
    var dom = function (str, formatitems) {
        var retval = document.createDocumentFragment();
        var fr = str.match(/(^[^>+]+|[>+]+[^>+]+)/g); // list of (node) (+sibbling) (>child)
        var curlev = retval;
        var tmp;
        for (var i = 0, f; f = fr[i]; i++) {
            var ename, p, sub = f.match(/(\W*[\w| |/|\-|\\|=)|:]+)/g);
            ename = sub[0];
            while (ename.charAt(0) == '+') {
                ename = ename.substr(1);
                curlev = curlev.parentNode;
            }
            curlev = curlev || retval; // documentFragment if at top
            if (ename.charAt(0) == '>') {
                ename = ename.substr(1);
            }
            var ena = ename.split(":");
            //p = (ena.length > 1) ? document.createElementNS(ena[0],ename) : document.createElement(ename);
            if (ena.length > 1) {
                if (ena[0] == "svg") {
                    p = document.createElementNS("http://www.w3.org/2000/svg", ena[1]);
                } else
                    p = document.createElementNS(ena[0], ename);
            } else
                p = document.createElement(ename);
            var classes = [];
            for (var j = 1, s = sub[0].substr(1); (j < sub.length) && (s = sub[j]); j++) {
                switch (s.charAt(0)) {
                    case '.':
                        classes.push(s.substr(1));
                        break;
                    case '#':
                        p.id = s.substr(1);
                        break;
                    case '<':
                        p.appendChild(document.createElement(s.substr(1)));
                        break;
                    case '&':
                        p.appendChild(document.createTextNode(String.fromCharCode(parseInt(s.substr(1), 16))));
                        break;
                    case '^':
                        tmp = s.split("=");
                        if (tmp.length > 1)
                            p.setAttribute(tmp[0].substr(1), tmp[1]);
                        else
                            //p.textContent = s.substr(1);
                            p.appendChild(document.createTextNode(s.substr(1)));
                        break;
                    case ';':
                        var o = formatitems[s.substr(1)];
                        if (typeof o == "object") {
                            for (var k in o) {
                                p.setAttribute(null, k, o[k]);
                            }
                        }
                        else {
                                p.innerHTML = o;
                        }
                        break;
                    case '`':
                        o = formatitems[s.substr(1)];
                        if (typeof o == "object") {
                            for (k in o) {
                                p.setAttribute(k, o[k]);
                            }
                        }
                        else {
                            p.textContent = o;
                        }
                        break;
                }
            }
            if (classes.length) {
                p.className = classes.join(" ");
            }
            curlev = curlev.appendChild(p);
            if (s.charAt(0) == '*') {
                s = s.substr(1);
                while (s.length) {
                    while (s[0] == "p") {
                        s = s.substr(1);
                        p = curlev = curlev.parentNode;
                    }
                    var qty = parseInt(s);
                    for (j = 1; j < qty; j++) {
                        p = curlev.parentNode.appendChild(p.cloneNode(true));
                    }
                    s = s.substr(Math.floor(Math.log10(qty) + 1));
                }
            }
        }
        return retval.childNodes.length == 1 ? retval.firstChild : retval;
    }
    /**
        @description wrapper for dom() that returns string version for testing
        @returns {string} 
    */
    var dom2str = function (str, formatitems) {
        return (dom(str, formatitems).outerHTML);
    }

    /**
        @description build object with name:values => selector:rules
        @parameter {number} sheet - index of stylesheet
        @returns {object} 
    */
    var css2json = function (sheet) {
        var a = Array.prototype.slice.call(sheet.cssRules);
        var kk = {};
        a.forEach(function (x) {
            if (x.type != CSSRule.STYLE_RULE)
                return;
            var im = {};
            var s = x.style.cssText.split(";");
            s.forEach(function (y) {
                j = y.split(":");
                if (j.length > 1) {
                    im[j[0].trim()] = j[1].trim();
                }
            });
            kk[x.selectorText] = im;
        });
        return kk; // use JSON.stringify(kk) for text
    }

    /**
        @description take object with name:values => selector:rules and insert a stylesheet
        @parameter {object} bb - the object that defines selectors:rules
    */
    var json2css = function (bb) {
        // create stylesheet based on json object, use browser prefix if required
        var style = document.createElement("style");
        document.head.appendChild(style);
        var txt = "";
        for (selector in bb) {
            var rules = [];
            var vals = bb[selector];
            for (att in vals) {
                rules.push(att + ":" + vals[att]);
            }
            txt += selector + "{ " + rules.join("; ") + " }";
        }
        style.innerHTML = txt;
    };

    // very small date formater
    var date = {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        mons: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        format: function (s, wd) {
            //var wd = d || this.date;
            var h = wd.getHours(), apm = (h>11)?"p":"a";
            h = h % 12;
            if (h == 0)
                h = 12;
            __m = {
                D: this.days[wd.getDay()],
                M: this.mons[wd.getMonth()],
                n: wd.getDate(),
                Y: wd.getFullYear(),
                h: ("\u2007" + h).slice(-2),
                t: ("0" + wd.getMinutes()).slice(-2)+apm
            };
            __m.d = __m.D.slice(0, 3);
            __m.m = __m.M.slice(0, 3);
            return s.replace(/\w+/g, function (match) { return __m[match] });
        }
    };

    // polyfill for IE Math.log10
    if (!Math.log10)
        Math.log10 = function (x) { return Math.log(x) / Math.LN10 };

    return {
        dom: dom,
        dom2str: dom2str,
        css2json: css2json,
        json2css: json2css,
        date: date
    };
})();