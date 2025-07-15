// marked.js v12.0.2 - START
! function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).marked = {})
}(this, (function(e) {
    "use strict";

    function t(e) {
        return e.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|[a-zA-Z0-9]+);/g, ((_, e) => {
            let t, r, n;
            if ("amp" === (e = e.toLowerCase())) return "&";
            if ("apos" === e) return "'";
            if ("gt" === e) return ">";
            if ("lt" === e) return "<";
            if ("quot" === e) return '"';
            if (t = e.match(/^#x([0-9a-f]+)$/i)) return n = parseInt(t[1], 16), String.fromCharCode(n);
            if (r = e.match(/^#(\d+)$/)) return n = parseInt(r[1], 10), String.fromCharCode(n);
            return ""
        }))
    }
    const r = /^ {0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?([^\s>]+)>?(?:[ \t]*\n?[ \t]*((?:"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\))))?$/,
        n = /^!\[(.*?)\]\((.*?)\)/,
        s = /(?:\[(.*?)\]\((.*?)\)|<([^>]*)>|((?:https?|ftp):\/\/[^\s<]*[^<.,:;"')\]\s]))/,
        a = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
    const o = e => a[e];

    function i(e, r) {
        const n = e.href,
            s = e.title ? t(e.title) : null,
            a = e.text;
        return "!" === e.token.charAt(0) ? {
            type: "image",
            raw: e.raw,
            href: n,
            title: s,
            text: t(a)
        } : {
            type: "link",
            raw: e.raw,
            href: n,
            title: s,
            text: a
        }
    }

    function l(e) {
        return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    }
    const c = /<[^>\n]*>/,
        p = /<a\s/i,
        u = /^<a\s/i,
        h = /^<(pre|script|style|textarea)/i,
        g = /^<input/i,
        f = /^<\/a\s/i,
        m = /^<\/(pre|script|style|textarea)/i,
        d = /^ {0,3}(?:(Enter|space|Tab){1,4}|Backspace|Delete|Esc|F1|F2|F3|F4|F5|F6|F7|F8|F9|F10|F11|F12|Up|Down|Left|Right|Home|End|PageUp|PageDown|Insert|NumLock|ScrollLock|PrintScreen|Pause|ContextMenu|Help|Power|Sleep|WakeUp|MediaPlayPause|MediaStop|MediaNextTrack|MediaPreviousTrack|MediaRecord|MediaEject|VolumeMute|VolumeDown|VolumeUp|BrightnessDown|BrightnessUp|AppSwitch|Call|Camera|GoBack|GoHome|HangUp|Pairing|Redo|Undo|Copy|Cut|Paste|SelectAll|ZoomIn|ZoomOut|BrightnessToggle|KeyboardLayoutNext|LaunchApplication1|LaunchApplication2|LaunchMail|LaunchMediaPlayer|LaunchMusicPlayer|LaunchWebBrowser|LaunchWebCam|LaunchContacts|LaunchCalendar|LaunchAssistant|ModeChange|Find|GoForward|ChannelUp|ChannelDown|Exit|Guide|Info|Play|Record|Rewind|FastForward|NextDay|PreviousDay|ToggleFullScreen|PowerOff)\b/,
        b = /^/,
        x = /^<(REPLACED_BY_OPTIONS)\s/,
        y = e => (e || "").toLowerCase();

    function k(e, t) {
        return -1 === e.indexOf(t) ? "" : e
    }
    const w = {};

    function v(e) {
        let t;
        if (void 0 === w.default) {
            t = "";
            for (let e = 0; e < 30; e++) t += "|" + String.fromCharCode(e);
            t += "| ", w.default = new RegExp(`[${t}]`)
        }
        return w.default.test(e)
    }
    const z = /[ \t\n\v\f\r]/;

    function S(e) {
        return e.replace(/[&<>"']/g, o)
    }
    class T {
        constructor(e) {
            this.options = e || {};
            const t = {};
            for (const [r, n] of Object.entries(this.options.renderer || {})) t[r] = n.bind(this.options.renderer);
            this.renderer = new R(t), this.parser = new _(this.options), this.tokenizer = this.parser.tokenizer, this.walkTokens = this.parser.walkTokens.bind(this.parser)
        }
        parse(e, t) {
            return this.parser.parse(e, t)
        }
        static parse(e, t) {
            const r = new T(t);
            return r.parse(e)
        }
        lexer(e, t) {
            return this.parser.lexer(e, t)
        }
        static lexer(e, t) {
            const r = new T(t);
            return r.lexer(e)
        }
        parseInline(e, t) {
            return this.parser.parseInline(e, t)
        }
        static parseInline(e, t) {
            const r = new T(t);
            return r.parseInline(e, t)
        }
        use(...e) {
            this.options.extensions = this.options.extensions || {
                renderers: {},
                childTokens: {}
            };
            for (const t of e) {
                if (t.extensions)
                    for (const e of t.extensions) {
                        const r = e.name;
                        if (!this.options.extensions[r]) throw new Error(`extension "${r}" does not exist`);
                        if (e.renderer) {
                            const t = "string" == typeof e.renderer ? {
                                [r]: e.renderer
                            } : e.renderer;
                            for (const [r, n] of Object.entries(t)) {
                                const e = this.options.extensions[r] || {};
                                e[e.length - 1] ? this.options.extensions[r].splice(e.length - 1, 0, n) : this.options.extensions[r].push(n)
                            }
                        }
                        if (e.tokenizer) {
                            const t = "string" == typeof e.tokenizer ? {
                                [r]: e.tokenizer
                            } : e.tokenizer;
                            for (const [r, n] of Object.entries(t)) {
                                const e = this.options.extensions[r] || {};
                                e[e.length - 1] ? this.options.extensions[r].splice(e.length - 1, 0, n) : this.options.extensions[r].push(n)
                            }
                        }
                        if (e.childTokens)
                            for (const [t, r] of Object.entries(e.childTokens)) {
                                this.options.extensions.childTokens[t] = r
                            }
                    }
                if (t.renderer)
                    for (const [r, n] of Object.entries(t.renderer)) {
                        const e = this.options.renderer[r];
                        this.options.renderer[r] = (...t) => {
                            let r = n.apply(this.options.renderer, t);
                            return !1 === r && (r = e.apply(this.options.renderer, t)), r
                        }
                    }
                if (t.tokenizer)
                    for (const [r, n] of Object.entries(t.tokenizer)) {
                        const e = this.options.tokenizer[r];
                        this.options.tokenizer[r] = (...t) => {
                            let r = n.apply(this.options.tokenizer, t);
                            return !1 === r && (r = e.apply(this.options.tokenizer, t)), r
                        }
                    }
            }
            if (t.walkTokens) this.walkTokens = (e, r) => {
                t.walkTokens.call(this, e), r(e)
            }
        }
    };
    class R {
        constructor(e) {
            this.options = e || {}
        }
        code(e, t, r) {
            const n = (t || "").match(/\S*/);
            let s = n ? n[0] : "";
            this.options.highlight && (s = this.options.highlight(e, s) || s);
            const a = s.split(/\s+/).map((e => this.options.langPrefix + e)).join(" ");
            return `<pre><code${a?' class="'+a+'"':""}>${r?e:l(e)}</code></pre>\n`
        }
        blockquote(e) {
            return `<blockquote>\n${e}</blockquote>\n`
        }
        html(e, t) {
            return e
        }
        heading(e, t, r) {
            const n = `h${t}`,
                s = this.options.headerIds ? this.options.headerPrefix + this.options.slugger.slug(r) : "";
            return `<${n}${s?' id="'+s+'"':""}>${e}</${n}>\n`
        }
        hr() {
            return this.options.xhtml ? "<hr/>\n" : "<hr>\n"
        }
        list(e, t, r) {
            const n = t ? "ol" : "ul",
                s = t && 1 !== r ? ` start="${r}"` : "";
            return `<${n}${s}>\n${e}</${n}>\n`
        }
        listitem(e, t, r) {
            let n = e;
            if (t) {
                if (/<(p|pre|blockquote|table|h\d*|hr|ul|ol|dl|div|address|form|fieldset)>/.test(e.slice(0, 10))) n = `<li>${e}</li>`;
                else if (r)
                    if (e.endsWith("</p>\n")) n = `<li>${e.substring(0,e.length-5)}</li>\n`;
                    else n = `<li>${e}</li>`;
                else n = `<li><p>${e}</p></li>`
            } else n = `<li>${e}</li>\n`;
            return n
        }
        checkbox(e) {
            return "<input " + (e ? "checked " : "") + 'disabled type="checkbox"' + (this.options.xhtml ? " /" : "") + "> "
        }
        paragraph(e) {
            return `<p>${e}</p>\n`
        }
        table(e, t) {
            return t && (t = `<tbody>${t}</tbody>`), `<table>\n<thead>\n${e}</thead>\n${t}</table>\n`
        }
        tablerow(e) {
            return `<tr>\n${e}</tr>\n`
        }
        tablecell(e, {
            header: t,
            align: r
        }) {
            const n = t ? "th" : "td";
            return `<${n}${r?' align="'+r+'"':""}>${e}</${n}>\n`
        }
        strong(e) {
            return `<strong>${e}</strong>`
        }
        em(e) {
            return `<em>${e}</em>`
        }
        codespan(e) {
            return `<code>${e}</code>`
        }
        br() {
            return this.options.xhtml ? "<br/>" : "<br>"
        }
        del(e) {
            return `<del>${e}</del>`
        }
        link(e, t, r) {
            const n = i({
                token: "!" + r,
                href: e,
                title: t,
                text: r
            }, {});
            if (n.type === "link") {
                const e = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(n.href) : S(n.href) : n.href,
                    t = e.replace(/^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,([a-zA-Z0-9+/=]+)$/, "").replace(/#.*$/, "");
                if (null === e) return n.text;
                let r = '<a href="' + e + '"';
                return n.title && (r += ' title="' + n.title + '"'), r += `>${n.text}</a>`, r
            }
            return n
        }
        image(e, t, r) {
            const n = i({
                token: "!" + r,
                href: e,
                title: t,
                text: r
            }, {});
            if (n.type === "image") {
                const e = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(n.href) : S(n.href) : n.href;
                if (null === e) return n.text;
                let t = '<img src="' + e + '" alt="' + n.text + '"';
                return n.title && (t += ' title="' + n.title + '"'), t += this.options.xhtml ? "/>" : ">", t
            }
            return n
        }
        text(e) {
            return e
        }
    };
    class E {
        constructor(e) {
            this.options = e || {}
        }
        space(e) {
            return e.type = "space", e
        }
        code({
            raw: e,
            text: t,
            lang: r,
            escaped: n
        }) {
            const s = {
                raw: e,
                text: t,
                lang: r,
                escaped: n,
                type: "code"
            };
            return this.options.hooks && this.options.hooks.postprocessCode && this.options.hooks.postprocessCode(s), s
        }
        heading({
            raw: e,
            depth: t,
            text: r
        }) {
            const n = {
                raw: e,
                depth: t,
                text: r,
                type: "heading"
            };
            return this.options.hooks && this.options.hooks.postprocessHeading && this.options.hooks.postprocessHeading(n), n
        }
        table({
            raw: e,
            header: t,
            align: r,
            rows: n
        }) {
            const s = {
                raw: e,
                type: "table",
                header: t,
                align: r,
                rows: n
            };
            return this.options.hooks && this.options.hooks.postprocessTable && this.options.hooks.postprocessTable(s), s
        }
        hr({
            raw: e
        }) {
            const t = {
                raw: e,
                type: "hr"
            };
            return this.options.hooks && this.options.hooks.postprocessHr && this.options.hooks.postprocessHr(t), t
        }
        blockquote({
            raw: e,
            text: t,
            tokens: r
        }) {
            const n = {
                raw: e,
                text: t,
                tokens: r,
                type: "blockquote"
            };
            return this.options.hooks && this.options.hooks.postprocessBlockquote && this.options.hooks.postprocessBlockquote(n), n
        }
        list({
            raw: e,
            ordered: t,
            start: r,
            loose: n,
            items: s
        }) {
            const a = {
                raw: e,
                ordered: t,
                start: r,
                loose: n,
                items: s,
                type: "list"
            };
            return this.options.hooks && this.options.hooks.postprocessList && this.options.hooks.postprocessList(a), a
        }
        html({
            raw: e,
            pre: t,
            text: r,
            block: n
        }) {
            const s = {
                raw: e,
                pre: t,
                text: r,
                block: n,
                type: "html"
            };
            return this.options.hooks && this.options.hooks.postprocessHtml && this.options.hooks.postprocessHtml(s), s
        }
        paragraph({
            raw: e,
            text: t,
            pre: r
        }) {
            const n = {
                raw: e,
                text: t,
                type: "paragraph"
            };
            return r && (n.pre = !0), this.options.hooks && this.options.hooks.postprocessParagraph && this.options.hooks.postprocessParagraph(n), n
        }
        text({
            raw: e,
            text: t
        }) {
            const r = {
                raw: e,
                text: t,
                type: "text"
            };
            return this.options.hooks && this.options.hooks.postprocessText && this.options.hooks.postprocessText(r), r
        }
        def({
            raw: e,
            tag: t,
            href: r,
            title: n
        }) {
            const s = {
                raw: e,
                tag: t,
                href: r,
                title: n,
                type: "def"
            };
            return this.options.hooks && this.options.hooks.postprocessDef && this.options.hooks.postprocessDef(s), s
        }
        escape({
            raw: e,
            text: t
        }) {
            return {
                raw: e,
                text: t,
                type: "escape"
            }
        }
        link({
            raw: e,
            href: t,
            title: r,
            text: n,
            tokens: s
        }) {
            return {
                raw: e,
                type: "link",
                href: t,
                title: r,
                text: n,
                tokens: s
            }
        }
        image({
            raw: e,
            href: t,
            title: r,
            text: n
        }) {
            return {
                raw: e,
                type: "image",
                href: t,
                title: r,
                text: n
            }
        }
        strong({
            raw: e,
            text: t,
            tokens: r
        }) {
            return {
                raw: e,
                type: "strong",
                text: t,
                tokens: r
            }
        }
        em({
            raw: e,
            text: t,
            tokens: r
        }) {
            return {
                raw: e,
                type: "em",
                text: t,
                tokens: r
            }
        }
        codespan({
            raw: e,
            text: t
        }) {
            return {
                raw: e,
                type: "codespan",
                text: t
            }
        }
        br({
            raw: e
        }) {
            return {
                raw: e,
                type: "br"
            }
        }
        del({
            raw: e,
            text: t,
            tokens: r
        }) {
            return {
                raw: e,
                type: "del",
                text: t,
                tokens: r
            }
        }
        textinline({
            raw: e,
            text: t
        }) {
            return {
                raw: e,
                type: "text",
                text: t
            }
        }
    }
    class A {
        constructor(e) {
            this.tokens = [], this.tokens.links = {}, this.options = e || {}, this.options.tokenizer = this.options.tokenizer || new E, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options;
            const t = {
                block: [/^ {0,3}(\[(.+)\]:[ \t]*\n?[ \t]*<?([^\s>]+)>?(?:[ \t]*\n?[ \t]*((?:"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\))))?$/, /^<hr>/, /^ {0,3}#+.*/, /^ {0,3}>.*/, /^>(.*)/, /^ {4,}[^\n]+/, /^ {0,3}```[^`\n]*$[^`\n]/, /^ {0,3}~~+.*/, /^ {0,3} {0,3} {0,3}(?:-|\*|_)/, /^\s*\[!(\w+)\][^\n]*/, /^ {0,3}\|?.+\|.*/, /^ {0,3}\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*/, /^ {0,3}[-*+]\s+\S.*/, /^ {0,3}\d+\.\s+\S.*/, /^<(pre|script|style|textarea)/i, /^/, /^<(REPLACED_BY_OPTIONS)\s/, /^ {0,3}(?:(Enter|space|Tab){1,4}|Backspace|Delete|Esc|F1|F2|F3|F4|F5|F6|F7|F8|F9|F10|F11|F12|Up|Down|Left|Right|Home|End|PageUp|PageDown|Insert|NumLock|ScrollLock|PrintScreen|Pause|ContextMenu|Help|Power|Sleep|WakeUp|MediaPlayPause|MediaStop|MediaNextTrack|MediaPreviousTrack|MediaRecord|MediaEject|VolumeMute|VolumeDown|VolumeUp|BrightnessDown|BrightnessUp|AppSwitch|Call|Camera|GoBack|GoHome|HangUp|Pairing|Redo|Undo|Copy|Cut|Paste|SelectAll|ZoomIn|ZoomOut|BrightnessToggle|KeyboardLayoutNext|LaunchApplication1|LaunchApplication2|LaunchMail|LaunchMediaPlayer|LaunchMusicPlayer|LaunchWebBrowser|LaunchWebCam|LaunchContacts|LaunchCalendar|LaunchAssistant|ModeChange|Find|GoForward|ChannelUp|ChannelDown|Exit|Guide|Info|Play|Record|Rewind|FastForward|NextDay|PreviousDay|ToggleFullScreen|PowerOff)\b/, /^ {0,3} {0,3} {0,3}(?:-|\*|_)(?:\n+|$)/, /^ *$/],
                inline: [/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, /^</, /^<(REPLACED_BY_OPTIONS)\s/, /^(?:\*|_){2}/, /^ {2,}\n/, /^(?:\*|_)/, /^!\[(.*?)\]\((.*?)\)/, /(?:\[(.*?)\]\((.*?)\)|<([^>]*)>|((?:https?|ftp):\/\/[^\s<]*[^<.,:;"')\]\s]))/, /^<[a-zA-Z0-9.+-]+@[a-zA-Z0-9-]{2,}(?:\.[a-zA-Z0-9-]{2,})+>/, /^~~+/, /^[^ \t\n\v\f\r]+/, /^[^\n]+?(?=[\\<!\[*`~]|https?:\/\/|ftp:\/\/| {2,}\n|$)/]
            };
            if (this.options.extensions)
                for (const [r, n] of Object.entries(this.options.extensions)) {
                    if (!t[r]) throw new Error(`extension "${r}" does not exist`);
                    for (const e of n) t[r].unshift(e)
                }
            if (this.options.gfm) {
                this.rules = {
                    block: this.rules.block.concat([/^ {0,3}~~+.*/, /^ {0,3}\|?.+\|.*/, /^ {0,3}\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*/]),
                    inline: this.rules.inline.concat([/^ {2,}\n/, /^<(REPLACED_BY_OPTIONS)\s/, /^(?:\*|_){2}/, /^(?:\*|_)/, /^~~+/, /^[^ \t\n\v\f\r]+/, /^[^\n]+?(?=[\\<!\[*`~]|https?:\/\/|ftp:\/\/| {2,}\n|$)/])
                };
                const r = /(^|[^\[])\^\[([^\]]+)\]/;
                r.exec = e => {
                    const t = r.exec(e);
                    if (t) {
                        const e = /\[\^([^\]]+)\]/.exec(t[0]);
                        t.index = t[0].length - e[0].length, t[0] = e[0]
                    }
                    return t
                }
            }
            const a = t.block.map((e => e.source)).join("|"),
                o = t.inline.map((e => e.source)).join("|").replace(/<REPLACED_BY_OPTIONS>/g, (() => "")),
                i = new RegExp(`^${a}`);
            this.rules = {
                block: i,
                inline: new RegExp(`^${o}`)
            }, this.rules.inline.source = this.rules.inline.source.replace(/<REPLACED_BY_OPTIONS>/g, (() => this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.filter((e => g.test(e.source))).map((e => e.source.replace(/<input/i, "<(" + e.name.substring(6, e.name.length - 1) + ")").replace(/ \/>/, ""))).join("|") || ""))
        }
        space(e) {
            const t = /^ */.exec(e);
            if (t && t[0]) {
                const r = {
                    raw: t[0],
                    text: t[0]
                };
                return this.tokenizer.space(r)
            }
        }
        code(e) {
            const t = /^ {4,}[^\n]+/.exec(e);
            if (t) {
                const r = {
                    raw: t[0],
                    text: t[0].replace(/^ {4,}/, ""),
                    lang: void 0,
                    escaped: !1
                };
                return this.tokenizer.code(r)
            }
        }
        fences(e) {
            const t = /^ {0,3}```([^`\n]*)(?:\n|$)([^`\n][\s\S]*?)(?:\n|$) {0,3}```(?!`)/.exec(e);
            if (t) {
                const e = t[2].replace(/\n*$/, ""),
                    r = {
                        raw: t[0],
                        text: e,
                        lang: t[1],
                        escaped: !1
                    };
                return this.tokenizer.code(r)
            }
        }
        heading(e) {
            const t = /^ {0,3}(#+)[ \t]+([^\n]*?)(?:[ \t]+#+)? *(?:\n+|$)/.exec(e);
            if (t) {
                const e = {
                    raw: t[0],
                    depth: t[1].length,
                    text: t[2]
                };
                return this.tokenizer.heading(e)
            }
        }
        hr(e) {
            const t = /^ {0,3}(?:-|\*|_)[ \t]*(?:\1[ \t]*){2,}(?:\n+|$)/.exec(e);
            if (t) {
                const e = {
                    raw: t[0]
                };
                return this.tokenizer.hr(e)
            }
        }
        blockquote(e) {
            const t = /^ {0,3}> ?(.*)(?:\n(?! *(?:[-*]|\d+\.))(?:\1|\s*))*$/.exec(e);
            if (t) {
                let e = t[0].replace(/^ *> ?/gm, "");
                if (!e.trim()) return {
                    raw: t[0],
                    text: e,
                    tokens: [],
                    type: "blockquote"
                };
                const r = this.options.lexer(e);
                return {
                    raw: t[0],
                    text: e,
                    tokens: r,
                    type: "blockquote"
                }
            }
        }
        list(e) {
            let t = /^( *)([*+-]|\d+.)((?:[ \t]*\n(?!\1(?:[*+-]|\d+.) ))*.*)/.exec(e);
            if (!t) return;
            const r = !!t[2],
                n = t[1].length;
            t = t[0].match(/^( *)([*+-]|\d+.)([ \t]*)([\s\S]*?)(?:\n{2,}(?! )(?!\1(?:[*+-]|\d+.)[ \t]*)|$)/);
            let s = t[4].split(/\n(?! )/);
            const a = parseInt(t[2], 10),
                o = 1 === a,
                i = s.length > 1 || /\n\n/.test(t[4]);
            let l = [];
            for (let e = 0; e < s.length; e++) {
                const t = s[e].substring(n + t[2].length + t[3].length);
                let r = /^ {0,4}/.exec(t);
                const o = r ? r[0].length : 0;
                if (o >= this.options.tab) l.push({
                    checked: void 0,
                    loose: !1,
                    task: !1,
                    text: t.replace(/^ {0,4}/, "")
                });
                else {
                    const r = /^\[[ xX]\][ \t]/.exec(t);
                    l.push({
                        checked: !!r && " " !== r[0],
                        loose: !1,
                        task: !!r,
                        text: r ? t.replace(/^\[[ xX]\][ \t]/, "") : t
                    })
                }
            }
            const c = {
                raw: t[0],
                ordered: r,
                start: o ? 1 : a,
                loose: i,
                items: l
            };
            return this.tokenizer.list(c)
        }
        html(e) {
            const t = /^<(pre|script|style|textarea)[\s>][\s\S]*?<\/\1>/.exec(e);
            if (t) {
                const e = t[0],
                    r = {
                        raw: e,
                        pre: !0,
                        text: e,
                        block: !0
                    };
                return this.tokenizer.html(r)
            }
            if (this.options.sanitize) return;
            const r = /^/.exec(e);
            if (r) {
                const e = {
                    raw: r[0],
                    text: r[0],
                    block: !0
                };
                return this.tokenizer.html(e)
            }
            const n = new RegExp(`^<(${this.rules.block.source.substring(2,this.rules.block.source.length-1)})`, "i").exec(e);
            if (n) {
                const e = {
                    raw: n[0],
                    text: n[0],
                    block: !0
                };
                return this.tokenizer.html(e)
            }
        }
        def(e) {
            const t = /^ {0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?([^\s>]+)>?(?:[ \t]*\n?[ \t]*((?:"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\))))?/.exec(e);
            if (t) {
                const e = t[1].toLowerCase().replace(/\s+/g, " "),
                    r = {
                        raw: t[0],
                        tag: e,
                        href: t[2],
                        title: t[3]
                    };
                return this.tokenizer.def(r)
            }
        }
        table(e) {
            const t = /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/.exec(e);
            if (!t) return;
            const r = t[3] ? t[3].trim().split("\n") : [];
            if (0 === r.length && !t[1].includes("|") && !t[2].includes("|")) return;
            const n = t[1].split("|").map((e => e.trim())),
                s = n.length;
            if (s < 1) return;
            const a = t[2].split("|").map((e => e.trim()));
            if (s !== a.length) return;
            const o = a.map((e => /^ *-+: *$/.test(e) ? "right" : /^ *:-+: *$/.test(e) ? "center" : /^ *:-+ *$/.test(e) ? "left" : null));
            let i = [];
            for (const e of r) {
                const t = e.split("|").map((e => e.trim()));
                if (s !== t.length) continue;
                i.push(t)
            }
            const l = {
                raw: t[0],
                header: n,
                align: o,
                rows: i
            };
            return this.tokenizer.table(l)
        }
        lheading(e) {
            const t = /^([^\n]+)\n {0,3}(=+|-+)[ \t]*\n*/.exec(e);
            if (t) {
                const e = {
                    raw: t[0],
                    text: t[1],
                    depth: "=" === t[2].charAt(0) ? 1 : 2
                };
                return this.tokenizer.heading(e)
            }
        }
        paragraph(e) {
            const t = /^([^\n]+(?:\n(?! *(?:[-*]|\d+\.))[^-\n][^\n]+)*)/.exec(e);
            if (t) {
                const r = {
                    raw: t[0],
                    text: t[1].charAt(t[1].length - 1) === "\n" ? t[1].slice(0, -1) : t[1]
                };
                return this.tokenizer.paragraph(r)
            }
        }
        text(e) {
            const t = /^[^\n]+/.exec(e);
            if (t) {
                const r = {
                    raw: t[0],
                    text: t[0]
                };
                return this.tokenizer.text(r)
            }
        }
        escape(e) {
            const t = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/.exec(e);
            if (t) {
                const e = {
                    raw: t[0],
                    text: t[1]
                };
                return this.tokenizer.escape(e)
            }
        }
        link(e) {
            const t = /^!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\x00-\x1f])*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/.exec(e);
            if (t) {
                const e = this.inlineTokens(t[1]);
                return this.tokenizer.link({
                    raw: t[0],
                    href: t[2],
                    title: t[3],
                    text: e,
                    tokens: e
                })
            }
            const r = /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]\[(.*?)\]/.exec(e);
            if (r) {
                const e = this.inlineTokens(r[1]),
                    t = (r[2] || r[1]).toLowerCase().replace(/\s+/g, " ");
                return this.tokenizer.link({
                    raw: r[0],
                    href: t,
                    title: void 0,
                    text: e,
                    tokens: e
                })
            }
            const n = /^((?:https?|ftp):\/\/[^\s<]*[^<.,:;"')\]\s])/.exec(e);
            if (n) {
                const e = {
                    raw: n[0],
                    text: n[1],
                    href: n[1],
                    tokens: [this.tokenizer.textinline({
                        raw: n[1],
                        text: n[1]
                    })]
                };
                return this.tokenizer.link(e)
            }
            const s = /^<([a-zA-Z0-9.+-]+@[a-zA-Z0-9-]{2,}(?:\.[a-zA-Z0-9-]{2,})+)>/.exec(e);
            if (s) {
                const e = s[1],
                    t = "mailto:" + e;
                return this.tokenizer.link({
                    raw: s[0],
                    text: e,
                    href: t,
                    tokens: [this.tokenizer.textinline({
                        raw: e,
                        text: e
                    })]
                })
            }
        }
        reflink(e, t) {
            let r;
            if ((r = /^!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\x00-\x1f])*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/.exec(e)) && !t[r[1].toLowerCase()]) {
                const e = {
                    href: r[2],
                    title: r[3]
                };
                return t[r[1].toLowerCase()] = e, {
                    raw: r[0],
                    href: e.href,
                    title: e.title,
                    text: r[1],
                    tokens: this.inlineTokens(r[1])
                }
            }
            if (r = /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]\[(.*?)\]/.exec(e)) {
                const n = (r[2] || r[1]).replace(/\s+/g, " ").toLowerCase();
                if (!t[n]) return {
                    raw: r[0]
                };
                const s = t[n];
                return {
                    raw: r[0],
                    href: s.href,
                    title: s.title,
                    text: r[1],
                    tokens: this.inlineTokens(r[1])
                }
            }
            return {
                raw: void 0
            }
        }
        strong(e) {
            const t = /^_{2}([\s\S]+?)_{2}(?!_)/.exec(e) || /^\*{2}([\s\S]+?)\*{2}(?!\*)/.exec(e);
            if (t) {
                const e = this.inlineTokens(t[1]);
                return this.tokenizer.strong({
                    raw: t[0],
                    text: t[1],
                    tokens: e
                })
            }
        }
        em(e) {
            const t = /^_(?!\s)([\s\S]+?)(?<!\s)_/.exec(e) || /^\*(?!\s)([\s\S]+?)(?<!\s|\*)\*/.exec(e);
            if (t) {
                const e = this.inlineTokens(t[1]);
                return this.tokenizer.em({
                    raw: t[0],
                    text: t[1],
                    tokens: e
                })
            }
        }
        codespan(e) {
            const t = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/.exec(e);
            if (t) {
                let e = t[2].replace(/\n/g, " ");
                const r = /^ /.test(e) && / $/.test(e);
                return r && (e = e.substring(1, e.length - 1)), this.tokenizer.codespan({
                    raw: t[0],
                    text: l(e)
                })
            }
        }
        br(e) {
            const t = /^ {2,}\n(?!\s*$)/.exec(e);
            if (t) {
                const e = {
                    raw: t[0]
                };
                return this.tokenizer.br(e)
            }
        }
        del(e) {
            const t = /^~~(?=\S)([\s\S]*?\S)~~/.exec(e);
            if (t) {
                const e = this.inlineTokens(t[1]);
                return this.tokenizer.del({
                    raw: t[0],
                    text: t[1],
                    tokens: e
                })
            }
        }
        autolink(e) {
            const t = /^<([^ >]+(@|:\/)[^ >]+)>/.exec(e);
            if (t) {
                const e = t[1],
                    r = e,
                    n = e;
                let s;
                return "@" === t[2] ? (s = "mailto:" + (r = e.charAt(6) == ":" ? this.options.mangle ? this.options.mangle(e) : e : e), n = this.options.mangle ? this.options.mangle(e) : e) : s = r, this.tokenizer.link({
                    raw: t[0],
                    text: l(n),
                    href: s,
                    tokens: [this.tokenizer.textinline({
                        raw: l(n),
                        text: l(n)
                    })]
                })
            }
        }
        url(e, t) {
            let r;
            if (r = /^!?\[(.*?)\]\((.*?)\)/.exec(e)) return t ? {
                type: "url",
                raw: r[0],
                text: r[1],
                href: r[2],
                tokens: this.inlineTokens(r[1])
            } : {
                raw: r[0]
            };
            if (r = /(?:\[(.*?)\]\((.*?)\)|<([^>]*)>|((?:https?|ftp):\/\/[^\s<]*[^<.,:;"')\]\s]))/.exec(e)) {
                const n = l(r[2] || r[1] || r[3] || r[4]),
                    s = r[2] || r[3] || r[4] || r[1],
                    a = r[2] || r[3];
                if (!t && a) return {
                    raw: r[0]
                };
                const o = this.inlineTokens(n);
                return {
                    type: "url",
                    raw: r[0],
                    text: n,
                    href: s,
                    tokens: o
                }
            }
        }
        inlineText(e) {
            const t = /^[^\\<!\[*`~]|^\/(?!\s)|https?:\/\//.exec(e);
            if (t) {
                const e = {
                    raw: t[0],
                    text: l(t[0])
                };
                return this.tokenizer.textinline(e)
            }
        }
        inlineTokens(e, t = []) {
            let r = e,
                n;
            for (this.options.tokenizer || (this.tokenizer = new E); r;) {
                if (n = this.tokenizer.space({
                        raw: r,
                        text: r
                    })) t.push(n), r = r.substring(n.raw.length);
                else if (n = this.tokenizer.escape({
                        raw: r,
                        text: r
                    })) t.push(n), r = r.substring(n.raw.length);
                else if (n = this.tokenizer.tag({
                        raw: r,
                        text: r
                    })) t.push(n), r = r.substring(n.raw.length);
                else if (n = this.tokenizer.reflink({
                        raw: r,
                        text: r
                    }, this.tokens.links)) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.link({
                        raw: r,
                        text: r
                    })) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.autolink({
                        raw: r,
                        text: r
                    })) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.url({
                        raw: r,
                        text: r
                    }, !0)) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.strong({
                        raw: r,
                        text: r
                    })) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.em({
                        raw: r,
                        text: r
                    })) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.codespan({
                        raw: r,
                        text: r
                    })) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.br({
                        raw: r,
                        text: r
                    })) t.push(n), r = r.substring(n.raw.length);
                else if (n = this.tokenizer.del({
                        raw: r,
                        text: r
                    })) n.text && (t.push(n), r = r.substring(n.raw.length));
                else if (n = this.tokenizer.textinline({
                        raw: r,
                        text: r
                    })) t.push(n), r = r.substring(n.raw.length);
                else if (r) throw new Error("Infinite loop on byte: " + r.charCodeAt(0))
            }
            return t
        }
        lexer(e) {
            e = e.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    "), e.endsWith("\n") || (e += "\n");
            let t, r, n, s, a, o, i, l, c;
            for (this.tokens.links = {}; e;) {
                if (r = this.tokenizer.space({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), r.raw.length > 0 && this.tokens.push(r);
                else if (r = this.tokenizer.code({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), r.text.length > 0 && (this.tokens.push(r), r.raw = r.raw.trimEnd());
                else if (r = this.tokenizer.fences({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), this.tokens.push(r);
                else if (r = this.tokenizer.heading({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), this.tokens.push(r);
                else if (r = this.tokenizer.hr({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), this.tokens.push(r);
                else if (r = this.tokenizer.blockquote({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), r.tokens = this.options.lexer(r.text), this.tokens.push(r);
                else if (r = this.tokenizer.list({
                        raw: e,
                        text: e
                    }))
                    for (e = e.substring(r.raw.length), o = r.items, s = 0, a = o.length; s < a; s++) i = o[s], c = i.text, i.tokens = this.options.lexer(c), this.tokens.push(i);
                else if (r = this.tokenizer.html({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), this.tokens.push(r);
                else if (r = this.tokenizer.def({
                        raw: e,
                        text: e
                    })) t = r.tag.toLowerCase().replace(/\s+/g, " "), this.tokens.links[t] || (this.tokens.links[t] = {
                    href: r.href,
                    title: r.title
                }), e = e.substring(r.raw.length);
                else if (r = this.tokenizer.table({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), n = {
                    type: "table_header"
                }, n.tokens = [], l = r.header, s = 0, a = l.length; s < a; s++) n.tokens.push(this.options.lexer(l[s]));
                else if (r = this.tokenizer.lheading({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), this.tokens.push(r);
                else if (r = this.tokenizer.paragraph({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), r.tokens = this.options.lexer(r.text), this.tokens.push(r);
                else if (r = this.tokenizer.text({
                        raw: e,
                        text: e
                    })) e = e.substring(r.raw.length), r.tokens = this.options.lexer(r.text), this.tokens.push(r);
                else if (e) throw new Error("Infinite loop on byte: " + e.charCodeAt(0))
            }
            return this.tokens
        }
    }
    class _ {
        constructor(e) {
            this.tokens = [], this.options = e || {}, this.options.renderer = this.options.renderer || new R, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.tokenizer = new A(this.options), this.slugger = new M, this.options.hooks = this.options.hooks || {}, this.options.renderer.options.slugger = this.slugger, this.options.extensions && this.walkTokens(this.options.extensions.childTokens || {}, (e => this.tokens.push(e)))
        }
        lexer(e) {
            return this.tokenizer.lexer(e)
        }
        parse(e, t) {
            const r = [];
            let n, s, a, o, i, l, c, p, u, h, g, f, m, d, b, x, y;
            if (this.options.hooks && this.options.hooks.preprocess && this.options.hooks.preprocess(e), t) {
                s = e.length;
                let t = 0;
                for (; t < s; t++) {
                    for (o = e[t]; t + 1 < s && "space" !== o.type && o.type === e[t + 1].type; t++) o.raw += e[t + 1].raw, o.text += e[t + 1].text;
                    switch (o.type) {
                        case "space":
                            continue;
                        case "hr":
                            r.push(this.renderer.hr(o));
                            continue;
                        case "heading":
                            r.push(this.renderer.heading(this.parseInline(o.tokens), o.depth, o.text));
                            continue;
                        case "code":
                            r.push(this.renderer.code(o.text, o.lang, o.escaped));
                            continue;
                        case "table":
                            for (u = "", h = 0, c = o.header.length; h < c; h++) u += this.renderer.tablecell(this.parseInline(o.header[h].tokens), {
                                header: !0,
                                align: o.align[h]
                            });
                            for (g = "", h = 0, p = o.rows.length; h < p; h++)
                                for (x = o.rows[h], f = "", d = 0, c = x.length; d < c; d++) f += this.renderer.tablecell(this.parseInline(x[d].tokens), {
                                    header: !1,
                                    align: o.align[d]
                                });
                            g += this.renderer.tablerow(f);
                            r.push(this.renderer.table(this.renderer.tablerow(u), g));
                            continue;
                        case "blockquote":
                            i = this.parse(o.tokens), r.push(this.renderer.blockquote(i));
                            continue;
                        case "list":
                            for (a = o.ordered, l = "", m = o.start, d = 0, b = o.items.length; d < b; d++) y = o.items[d], c = y.task ? '<input ' + (y.checked ? "checked " : "") + 'disabled type="checkbox" ' + (this.options.xhtml ? "/" : "") + "> " : "", p = this.parse(y.tokens, o.loose), o.loose && y.tokens.length && "paragraph" === y.tokens[0].type && (p = p.replace(/^<p>|<\/p>\n$/g, "")), l += this.renderer.listitem(c + p, y.task, o.loose);
                            r.push(this.renderer.list(l, a, m));
                            continue;
                        case "html":
                            r.push(this.renderer.html(o.text, o.block));
                            continue;
                        case "paragraph":
                            r.push(this.renderer.paragraph(this.parseInline(o.tokens)));
                            continue;
                        case "text":
                            i = o.tokens ? this.parseInline(o.tokens) : o.text, r.push(this.renderer.paragraph(i));
                            continue;
                        default:
                            n = 'Token with "' + o.type + '" type was not found.', this.options.silent ? console.error(n) : (() => {
                                throw new Error(n)
                            })()
                    }
                }
            } else
                for (s = this.tokens.length, t = 0; t < s; t++) {
                    for (o = this.tokens[t]; t + 1 < s && "space" !== o.type && o.type === this.tokens[t + 1].type; t++) o.raw += this.tokens[t + 1].raw, o.text += this.tokens[t + 1].text;
                    switch (o.type) {
                        case "space":
                            continue;
                        case "hr":
                            r.push(this.renderer.hr(o));
                            continue;
                        case "heading":
                            r.push(this.renderer.heading(this.parseInline(o.tokens), o.depth, o.text));
                            continue;
                        case "code":
                            r.push(this.renderer.code(o.text, o.lang, o.escaped));
                            continue;
                        case "table":
                            for (u = "", h = 0, c = o.header.length; h < c; h++) u += this.renderer.tablecell(this.parseInline(o.header[h].tokens), {
                                header: !0,
                                align: o.align[h]
                            });
                            for (g = "", h = 0, p = o.rows.length; h < p; h++)
                                for (x = o.rows[h], f = "", d = 0, c = x.length; d < c; d++) f += this.renderer.tablecell(this.parseInline(x[d].tokens), {
                                    header: !1,
                                    align: o.align[d]
                                });
                            g += this.renderer.tablerow(f);
                            r.push(this.renderer.table(this.renderer.tablerow(u), g));
                            continue;
                        case "blockquote":
                            i = this.parse(o.tokens), r.push(this.renderer.blockquote(i));
                            continue;
                        case "list":
                            for (a = o.ordered, l = "", m = o.start, d = 0, b = o.items.length; d < b; d++) y = o.items[d], c = y.task ? '<input ' + (y.checked ? "checked " : "") + 'disabled type="checkbox" ' + (this.options.xhtml ? "/" : "") + "> " : "", p = this.parse(y.tokens, o.loose), o.loose && y.tokens.length && "paragraph" === y.tokens[0].type && (p = p.replace(/^<p>|<\/p>\n$/g, "")), l += this.renderer.listitem(c + p, y.task, o.loose);
                            r.push(this.renderer.list(l, a, m));
                            continue;
                        case "html":
                            r.push(this.renderer.html(o.text, o.block));
                            continue;
                        case "paragraph":
                            r.push(this.renderer.paragraph(this.parseInline(o.tokens)));
                            continue;
                        case "text":
                            i = o.tokens ? this.parseInline(o.tokens) : o.text, r.push(this.renderer.paragraph(i));
                            continue;
                        default:
                            n = 'Token with "' + o.type + '" type was not found.', this.options.silent ? console.error(n) : (() => {
                                throw new Error(n)
                            })()
                    }
                }
            const p = r.join("");
            return this.options.hooks && this.options.hooks.postprocess && this.options.hooks.postprocess(p), p
        }
        parseInline(e, t) {
            const r = [];
            let n, s, a;
            const o = e.length;
            let i = 0;
            for (; i < o; i++) switch (n = e[i], n.type) {
                case "escape":
                    r.push(this.renderer.text(n.text));
                    break;
                case "html":
                    r.push(this.renderer.html(n.text));
                    break;
                case "link":
                case "image":
                    s = n.text, a = t || this.tokens.links[n.href.toLowerCase()], r.push(this.renderer[n.type](a.href, a.title, s));
                    break;
                case "strong":
                    r.push(this.renderer.strong(this.parseInline(n.tokens)));
                    break;
                case "em":
                    r.push(this.renderer.em(this.parseInline(n.tokens)));
                    break;
                case "codespan":
                    r.push(this.renderer.codespan(n.text));
                    break;
                case "br":
                    r.push(this.renderer.br());
                    break;
                case "del":
                    r.push(this.renderer.del(this.parseInline(n.tokens)));
                    break;
                case "text":
                    r.push(this.renderer.text(n.text));
                    break;
                default:
                    const e = 'Token with "' + n.type + '" type was not found.';
                    if (this.options.silent) return console.error(e), void 0;
                    throw new Error(e)
            }
            return r.join("")
        }
        walkTokens(e, t) {
            for (const r of e) switch (t(r), r.type) {
                case "table":
                    for (const e of r.header) this.walkTokens(e.tokens, t);
                    for (const e of r.rows)
                        for (const r of e) this.walkTokens(r.tokens, t);
                    break;
                case "list":
                    this.walkTokens(r.items, t);
                    break;
                default:
                    r.tokens && this.walkTokens(r.tokens, t)
            }
        }
    }
    class M {
        constructor() {
            this.seen = {}
        }
        slug(e, {
            smartypants: t,
            prefix: r
        } = {}) {
            let n = e.toLowerCase().trim();
            t && (n = n.replace(/['"“”‘’]/g, "").replace(/<[^>]*>/g, ""));
            let s = n.replace(/[< >.,`!@#$%^&*()\[\]{}:;'"|\\/?~=+-]/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
            if (!s)
                for (let e = 0; e < 10; e++) s += String.fromCharCode(97 + Math.floor(26 * Math.random()));
            if (this.seen[s]) {
                let e = s;
                do {
                    this.seen[e]++, s = e + "-" + this.seen[e]
                } while (this.seen[s])
            }
            return this.seen[s] = 1, r ? r + s : s
        }
    }
    e.Hooks = E, e.Lexer = A, e.Marked = T, e.Parser = _, e.Renderer = R, e.Slugger = M, e.Tokenizer = E, e.TextRenderer = class {
        strong(e) {
            return e
        }
        em(e) {
            return e
        }
        codespan(e) {
            return e
        }
        del(e) {
            return e
        }
        html(e) {
            return ""
        }
        text(e) {
            return e
        }
        link(e, t, r) {
            return "" + r
        }
        image(e, t, r) {
            return "" + r
        }
        br() {
            return ""
        }
    }, e.defaults = {
        async: !1,
        breaks: !1,
        extensions: null,
        gfm: !0,
        headerIds: !0,
        headerPrefix: "",
        highlight: null,
        hooks: null,
        langPrefix: "language-",
        mangle: !0,
        pedantic: !1,
        renderer: null,
        sanitize: !1,
        sanitizer: null,
        silent: !1,
        slugger: null,
        smartypants: !1,
        tokenizer: null,
        walkTokens: null,
        xhtml: !1,
        include: null
    }, e.getDefaults = function() {
        return {
            async: !1,
            breaks: !1,
            extensions: null,
            gfm: !0,
            headerIds: !0,
            headerPrefix: "",
            highlight: null,
            hooks: null,
            langPrefix: "language-",
            mangle: !0,
            pedantic: !1,
            renderer: null,
            sanitize: !1,
            sanitizer: null,
            silent: !1,
            slugger: null,
            smartypants: !1,
            tokenizer: null,
            walkTokens: null,
            xhtml: !1,
            include: null
        }
    }, e.lexer = function(e, t) {
        return new T(t).lexer(e)
    }, e.marked = new T, e.parse = function(e, t) {
        return new T(t).parse(e)
    }, e.parseInline = function(e, t) {
        return new T(t).parseInline(e)
    }, e.setOptions = function(t) {
        Object.assign(e.defaults, t), Object.assign(e.marked.options, t)
    }, e.use = function(...t) {
        e.marked.use(...t)
    }, e.walkTokens = function(t, r) {
        e.marked.walkTokens(t, r)
    }
}));
// marked.js v12.0.2 - END


// marked-footnote.js v1.4.0 - START
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.markedFootnote = factory());
})(this, (function() {
  'use strict';

  const footnoteRule = /(^|[^\[])\[\^([^\]]+)\]: E*?([^\n\r]*)/;
  const footnoteRefRule = /\[\^([^\]]+)\]/g;
  const refTokens = {};
  let refCount = 0;
  const defaults = {
    description: '<h2>Footnotes</h2>'
  };
  function footnote(options) {
    if (options) {
      Object.assign(defaults, options);
    }
    return {
      extensions: [{
        name: 'footnote',
        level: 'block',
        start(src) {
          const match = src.match(footnoteRule);
          if (match) {
            return match.index + match[1].length;
          }
        },
        tokenizer(src) {
          const match = src.match(footnoteRule);
          if (match) {
            const token = {
              type: 'footnote',
              raw: match[0],
              ref: match[2],
              text: match[3]
            };
            return token;
          }
        },
        renderer(token) {
          if (!refTokens[token.ref]) {
            refTokens[token.ref] = {
              count: ++refCount,
              text: token.text
            };
          }
          return '';
        }
      }, {
        name: 'footnoteRef',
        level: 'inline',
        start(src) {
          const match = src.match(footnoteRefRule);
          if (match) {
            return match.index;
          }
        },
        tokenizer(src) {
          const match = src.match(footnoteRefRule);
          if (match) {
            const token = {
              type: 'footnoteRef',
              raw: match[0],
              ref: match[1]
            };
            return token;
          }
        },
        renderer(token) {
          const ref = refTokens[token.ref];
          if (!ref) {
            return token.raw;
          }
          return `<sup id="fnref:${ref.count}"><a href="#fn:${ref.count}">${ref.count}</a></sup>`;
        }
      }],
      hooks: {
        postprocess(html) {
          if (refCount === 0) {
            return html;
          }
          const refs = Object.values(refTokens);
          let footnotes = defaults.description;
          footnotes += '<ol>';
          for (const ref of refs) {
            footnotes += `<li id="fn:${ref.count}">${ref.text} <a href="#fnref:${ref.count}">\u21a9</a></li>`;
          }
          footnotes += '</ol>';
          refCount = 0;
          for (const key in refTokens) {
            delete refTokens[key];
          }
          return html + footnotes;
        }
      }
    };
  }
  return footnote;
}));
// marked-footnote.js v1.4.0 - END