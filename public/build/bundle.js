
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (Image) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Image__default = /*#__PURE__*/_interopDefaultLegacy(Image);

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\BackgroundTop.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\BackgroundTop.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Meetups";
    			attr_dev(h1, "class", "top_text svelte-1a2lc9k");
    			add_location(h1, file$2, 8, 2, 321);
    			attr_dev(div, "class", "top_container svelte-1a2lc9k");
    			set_style(div, "background-image", "url('" + /*bgImage*/ ctx[0] + "')");
    			add_location(div, file$2, 7, 0, 247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BackgroundTop', slots, []);
    	let bgImage = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZnJlZSUyMGxpYnJhcnl8ZW58MHx8MHx8&w=1000&q=80";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BackgroundTop> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Image: Image__default["default"], bgImage });

    	$$self.$inject_state = $$props => {
    		if ('bgImage' in $$props) $$invalidate(0, bgImage = $$props.bgImage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgImage];
    }

    class BackgroundTop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundTop",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var AY = "2022-2023";
    var AcademicYear = {
    	AY: AY,
    	"Sem 1": "2022-08-08",
    	"Sem 2": "2023-01-09",
    	"Special Term 1": "2023-05-08",
    	"Special Term 2": "2023-06-19"
    };

    /* src\DynamicTextField.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "src\\DynamicTextField.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (168:0) {#each Array(num_links) as _, i}
    function create_each_block$1(ctx) {
    	let div;
    	let input;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "class", "ttLink");
    			attr_dev(input, "name", "DynamicField");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "size", "121");
    			attr_dev(input, "id", `link_${/*i*/ ctx[14]}`);
    			attr_dev(input, "placeholder", "Enter Timetable Link!");
    			add_location(input, file$1, 169, 4, 5757);
    			add_location(div, file$1, 168, 2, 5746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(168:0) {#each Array(num_links) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (181:0) {#if num_links > 1}
    function create_if_block_2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "button");
    			input.value = "- Remove last timetable link";
    			add_location(input, file$1, 181, 2, 5970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*removeField*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(181:0) {#if num_links > 1}",
    		ctx
    	});

    	return block;
    }

    // (189:0) {#if num_links < 5}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "+ Add link";
    			attr_dev(button, "class", "svelte-17eexwn");
    			add_location(button, file$1, 189, 2, 6105);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*addField*/ ctx[3]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(189:0) {#if num_links < 5}",
    		ctx
    	});

    	return block;
    }

    // (196:0) {#if !free_slot_generated}
    function create_if_block$1(ctx) {
    	let br;
    	let t;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t = space();
    			img = element("img");
    			add_location(br, file$1, 197, 4, 6300);
    			if (!src_url_equal(img.src, img_src_value = "dual_ring.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 198, 4, 6310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(196:0) {#if !free_slot_generated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let br;
    	let t0;
    	let p0;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let button;
    	let strong;
    	let t7;
    	let t8;
    	let div1;
    	let p1;
    	let t9;
    	let mounted;
    	let dispose;
    	let each_value = Array(/*num_links*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block0 = /*num_links*/ ctx[1] > 1 && create_if_block_2(ctx);
    	let if_block1 = /*num_links*/ ctx[1] < 5 && create_if_block_1(ctx);
    	let if_block2 = !/*free_slot_generated*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			br = element("br");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Find your Time and Space !";
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			button = element("button");
    			strong = element("strong");
    			strong.textContent = "Find Time";
    			t7 = space();
    			if (if_block2) if_block2.c();
    			t8 = space();
    			div1 = element("div");
    			p1 = element("p");
    			t9 = text(/*message*/ ctx[2]);
    			add_location(br, file$1, 163, 2, 5655);
    			add_location(p0, file$1, 164, 2, 5665);
    			add_location(div0, file$1, 162, 0, 5646);
    			add_location(strong, file$1, 193, 2, 6227);
    			attr_dev(button, "class", "svelte-17eexwn");
    			add_location(button, file$1, 192, 0, 6178);
    			add_location(p1, file$1, 203, 2, 6464);
    			attr_dev(div1, "class", "freeslot_div");
    			attr_dev(div1, "contenteditable", "false");
    			if (/*message*/ ctx[2] === void 0) add_render_callback(() => /*div1_input_handler*/ ctx[6].call(div1));
    			add_location(div1, file$1, 202, 0, 6385);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, br);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, strong);
    			insert_dev(target, t7, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p1);
    			append_dev(p1, t9);

    			if (/*message*/ ctx[2] !== void 0) {
    				div1.innerHTML = /*message*/ ctx[2];
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", prevent_default(/*submitLink*/ ctx[5]), false, true, false),
    					listen_dev(div1, "input", /*div1_input_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*num_links*/ 2) {
    				each_value = Array(/*num_links*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t3.parentNode, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*num_links*/ ctx[1] > 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*num_links*/ ctx[1] < 5) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t5.parentNode, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!/*free_slot_generated*/ ctx[0]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(t8.parentNode, t8);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*message*/ 4) set_data_dev(t9, /*message*/ ctx[2]);

    			if (dirty & /*message*/ 4 && /*message*/ ctx[2] !== div1.innerHTML) {
    				div1.innerHTML = /*message*/ ctx[2];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t7);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DynamicTextField', slots, []);
    	var free_slot_generated = true;
    	var num_links = 1;
    	let links = "";

    	//Message will be the message that will be printed out
    	var message = "";

    	const addField = () => {
    		$$invalidate(1, num_links += 1);
    	}; // console.log(num_links);

    	const removeField = div => {
    		$$invalidate(1, num_links -= 1);
    	};

    	let list_of_modules = new Map();

    	const semester = {
    		"sem-1": "semester1",
    		"sem-2": "semester2",
    		"st-i": "specialterm1",
    		"st-ii": "specialterm2"
    	};

    	const lesson_type = {
    		LEC: "Lecture",
    		TUT: "Tutorial",
    		SEC: "Sectional Teaching",
    		LAB: "Laboratory",
    		PTUT: "Packaged Tutorial",
    		PLEC: "Packaged Lecture"
    	};

    	var lesson_slot = {
    		Monday: [["0800", "0800"]],
    		Tuesday: [["0800", "0800"]],
    		Wednesday: [["0800", "0800"]],
    		Thursday: [["0800", "0800"]],
    		Friday: [["0800", "0800"]]
    	};

    	async function submitLink() {
    		//Variable Declaration
    		$$invalidate(2, message = "");
    		$$invalidate(0, free_slot_generated = false);
    		var module_list = new Map();
    		document.querySelectorAll("#ttLink");
    		let nus_tt_links = [];
    		let each_timetable_module = "";

    		for (let i = 0; i < num_links; i += 1) {
    			const val = document.getElementById(`link_` + i).value;
    			nus_tt_links.push(val);
    		}

    		(async () => {
    			// const ay = "2022-2023"; // Manually keyed in if json file doesnt load.
    			AcademicYear.AY;

    			$$invalidate(2, message = "");

    			//This for-loop is for each links.
    			for (let i = 0; i < nus_tt_links.length; i += 1) {
    				//Splitting the links into 2 parts. The first part contains the semester while the second part contains the timetable itself
    				each_timetable_module = nus_tt_links[i].split("?");

    				//Splitting the timetable into each individual modules
    				var each_module_class = each_timetable_module[1].split("&");

    				var sem = each_timetable_module[0].match("(sem-1)|(sem-2)|(st-i)|(st-ii)")[0];

    				// var = semester[(each_timetable_module[0]).match(/\w+-\w/)[0]];
    				//For loop to iterate through each of the modules
    				for (let j = 0; j < each_module_class.length; j += 1) {
    					//Splitting each of the module into their module code and their classes (At this point the class code and class type is still not split)
    					var splitted_module_slot = each_module_class[j].split("=");

    					//Split the class into different types (Lab, Tut) etc
    					var module_slot_timetable = splitted_module_slot[1].split(",");

    					var module_lesson_type = new Map();

    					//Loop into each of the module timetable
    					for (let l = 0; l < module_slot_timetable.length; l += 1) {
    						//Split the class type and store into module_lesson_type (which is a map containing their class)
    						var split = module_slot_timetable[l].split(":");

    						module_lesson_type.set(split[0], split[1]);
    					}

    					//After all the classes type has been configured into a map, store into the module list where the module list will contain
    					//the module code as the key and the map of class type and class code as the value
    					module_list.set(splitted_module_slot[0], module_lesson_type);

    					for (var [key, value] of module_lesson_type.entries()) {
    						// Get the timetable info from the database through the server.
    						const response = await fetch("http://localhost:3000", {
    							method: "post",
    							headers: {
    								Accept: "application/json",
    								"Content-Type": "application/json"
    							},
    							body: JSON.stringify({
    								type: "free slot",
    								module_code: splitted_module_slot[0],
    								class_type: lesson_type[key],
    								class_code: value,
    								semester: semester[sem]
    							})
    						});

    						var data = await response.json();

    						for (var class_num = 0; class_num < data["result"].length; class_num += 1) {
    							lesson_slot[data["result"][class_num]["LessonDay"]].push([
    								data["result"][class_num]["StartTime"],
    								data["result"][class_num]["endTime"]
    							]);
    						}
    					}
    				}

    				module_list.clear();
    			}

    			for (const [key, value] of Object.entries(lesson_slot)) {
    				//2359 is the end of the search. Can be change to differnt class timing. But take note that the class in NUS ends latest at 9pm
    				lesson_slot[key].push(["2359", "2359"]);

    				value.sort();

    				// console.log(key, value);
    				//Check through the classes each day
    				for (var i = 0; i < value.length - 1; i += 1) {
    					//Check if there is any slots in between each classes
    					if (parseInt(value[i][1]) < parseInt(value[i + 1][0])) {
    						//Append the message if there is a free slot
    						$$invalidate(2, message += key + ": " + value[i][1] + "-" + value[i + 1][0] + "<br/>");
    					}
    				}
    			}

    			$$invalidate(0, free_slot_generated = true);
    		})();
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DynamicTextField> was created with unknown prop '${key}'`);
    	});

    	function div1_input_handler() {
    		message = this.innerHTML;
    		$$invalidate(2, message);
    	}

    	$$self.$capture_state = () => ({
    		App,
    		AcademicYear,
    		free_slot_generated,
    		num_links,
    		links,
    		message,
    		addField,
    		removeField,
    		list_of_modules,
    		semester,
    		lesson_type,
    		lesson_slot,
    		submitLink
    	});

    	$$self.$inject_state = $$props => {
    		if ('free_slot_generated' in $$props) $$invalidate(0, free_slot_generated = $$props.free_slot_generated);
    		if ('num_links' in $$props) $$invalidate(1, num_links = $$props.num_links);
    		if ('links' in $$props) links = $$props.links;
    		if ('message' in $$props) $$invalidate(2, message = $$props.message);
    		if ('list_of_modules' in $$props) list_of_modules = $$props.list_of_modules;
    		if ('lesson_slot' in $$props) lesson_slot = $$props.lesson_slot;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		free_slot_generated,
    		num_links,
    		message,
    		addField,
    		removeField,
    		submitLink,
    		div1_input_handler
    	];
    }

    class DynamicTextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DynamicTextField",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var LT17 = {
    	roomName: "Lecture Theatre 17",
    	floor: 1,
    	location: {
    		x: 103.77401107931558,
    		y: 1.2936062312700383
    	}
    };
    var LT16 = {
    	roomName: "Lecture Theatre 16",
    	floor: 1,
    	location: {
    		x: 103.77386420264736,
    		y: 1.2939170885884703
    	}
    };
    var LT10 = {
    	roomName: "Lecture Theatre 10",
    	floor: 2,
    	location: {
    		x: 103.7720594590288,
    		y: 1.2949157602130599
    	}
    };
    var LT3 = {
    	roomName: "Lecture Theatre 3",
    	floor: 6,
    	location: {
    		x: 103.77340105516473,
    		y: 1.297782788396538
    	}
    };
    var LT1 = {
    	roomName: "Seminar Room @ LT19",
    	floor: 4,
    	location: {
    		x: 103.77129296022898,
    		y: 1.2995128919233356
    	}
    };
    var LT5 = {
    	roomName: "Lecture Theatre 5",
    	floor: 3,
    	location: {
    		x: 103.77135093589285,
    		y: 1.2983045966610414
    	}
    };
    var LT4 = {
    	roomName: "Lecture Theatre 4",
    	floor: 6,
    	location: {
    		x: 103.7735183186846,
    		y: 1.2974781271276108
    	}
    };
    var LT7 = {
    	roomName: "Lecture Theatre 7",
    	floor: null,
    	location: {
    		x: 103.77108408506066,
    		y: 1.3000819751503252
    	}
    };
    var LT2 = {
    	roomName: "Lecture Theatre 2",
    	floor: 1,
    	location: {
    		x: 103.77140470268863,
    		y: 1.2993124975071704
    	}
    };
    var LT6 = {
    	roomName: "Lecture Theatre 6",
    	floor: 4,
    	location: {
    		x: 103.77196318826034,
    		y: 1.2987585148416605
    	}
    };
    var LT28 = {
    	roomName: "Lecture Theatre 28",
    	floor: 1,
    	location: {
    		x: 103.7811495867657,
    		y: 1.297199706737715
    	}
    };
    var LT32 = {
    	roomName: "Lecture Theatre 32",
    	floor: null,
    	location: {
    		x: 103.77830217071332,
    		y: 1.2961400836523527
    	}
    };
    var LT27 = {
    	roomName: "Lecture Theatre 27",
    	floor: 1,
    	location: {
    		x: 103.78090117515984,
    		y: 1.2969925415205374
    	}
    };
    var LT31 = {
    	roomName: "Lecture Theatre 31",
    	floor: 3,
    	location: {
    		x: 103.78039359238537,
    		y: 1.296863036752469
    	}
    };
    var LT34 = {
    	roomName: "Lecture Theatre 34",
    	floor: 3,
    	location: {
    		x: 103.78083854913713,
    		y: 1.2977295044675978
    	}
    };
    var LT26 = {
    	roomName: "Lecture Theatre 26",
    	floor: 1,
    	location: {
    		x: 103.78110405867265,
    		y: 1.2964439980596048
    	}
    };
    var LT21 = {
    	roomName: "Lecture Theatre 21",
    	floor: 1,
    	location: {
    		x: 103.77946703176282,
    		y: 1.295356780941112
    	}
    };
    var LT33 = {
    	roomName: "Lecture Theatre 33",
    	floor: 2,
    	location: {
    		x: 103.78090879191791,
    		y: 1.2977441788622253
    	}
    };
    var LT20 = {
    	roomName: "Lecture Theatre 20",
    	floor: 1,
    	location: {
    		x: 103.77882045948085,
    		y: 1.2958439182978323
    	}
    };
    var LT29 = {
    	roomName: "Lecture Theatre 29",
    	floor: 1,
    	location: {
    		x: 103.78121942281726,
    		y: 1.2970306748465374
    	}
    };
    var LT7A = {
    	roomName: "Lecture Theatre 7A",
    	floor: null,
    	location: {
    		x: 103.77094760790798,
    		y: 1.3004814583946265
    	}
    };
    var LT15 = {
    	roomName: "Lecture Theatre 15",
    	floor: 1,
    	location: {
    		x: 103.77340877469021,
    		y: 1.295522499959851
    	}
    };
    var LT18 = {
    	roomName: "Lecture Theatre 18",
    	floor: null,
    	location: {
    		x: 103.77460509538652,
    		y: 1.2933049908717555
    	}
    };
    var LT9 = {
    	roomName: "Lecture Theatre 9",
    	floor: null,
    	location: {
    		x: 103.7722506424852,
    		y: 1.294968895355766
    	}
    };
    var LT11 = {
    	roomName: "Lecture Theatre 11",
    	floor: null,
    	location: {
    		x: 103.77139878788282,
    		y: 1.295456827029062
    	}
    };
    var LT8 = {
    	roomName: "Lecture Theatre 8",
    	floor: 3,
    	location: {
    		x: 103.77199079513672,
    		y: 1.2941286739949707
    	}
    };
    var LT12 = {
    	roomName: "Lecture Theatre 12",
    	floor: 1,
    	location: {
    		x: 103.77114846994691,
    		y: 1.2949801946461976
    	}
    };
    var LT14 = {
    	roomName: "Lecture Theatre 14",
    	floor: 1,
    	location: {
    		x: 103.7733578704978,
    		y: 1.2957109058743046
    	}
    };
    var LT13 = {
    	roomName: "NUS Theatrette (Lecture Theatre 13)",
    	floor: 1,
    	location: {
    		x: 103.77090632915497,
    		y: 1.29506943418948
    	}
    };
    var SR_LT19 = {
    	roomName: "Seminar Room at LT19",
    	floor: 1,
    	location: {
    		x: 103.77432882785799,
    		y: 1.2937125827502152
    	}
    };
    var LAW_LT = {
    	roomName: "Lecture Theatre",
    	floor: 3,
    	location: {
    		x: 103.81695717573167,
    		y: 1.3192665513499864
    	}
    };
    var LT19 = {
    	roomName: "Lecture Theater 19",
    	floor: 1,
    	location: {
    		x: 103.7743029,
    		y: 1.2937303
    	}
    };
    var LAW_AUD = {
    	roomName: "Auditorium",
    	floor: 3,
    	location: {
    		x: 103.816607,
    		y: 1.318959
    	}
    };
    var LAW_SR3 = {
    	roomName: "SR 3",
    	floor: 3,
    	location: {
    		x: 103.817133,
    		y: 1.319202
    	}
    };
    var LAW_ESR = {
    	roomName: "Executive SR",
    	floor: 3,
    	location: {
    		x: 103.817032,
    		y: 1.319112
    	}
    };
    var HSSMLCR = {
    	roomName: "HSSMLCR",
    	floor: 3,
    	location: {
    		x: 103.77434492111207,
    		y: 1.293218888755013
    	}
    };
    var RVR_MPR1 = {
    	roomName: "RVR Multi-Purpose Room 1",
    	floor: 3,
    	location: {
    		x: 103.77694934606554,
    		y: 1.297287053455881
    	}
    };
    var CEREBRO = {
    	roomName: "Cerebro@SOC",
    	floor: 2,
    	location: {
    		x: 103.77368777990343,
    		y: 1.2950667526656219
    	}
    };
    var MD4_LAB9 = {
    	roomName: "MD4 LS LAB9",
    	floor: 4,
    	location: {
    		x: 103.78087073564531,
    		y: 1.2957451781135965
    	}
    };
    var MD7_LAB8 = {
    	roomName: "Lab 8",
    	floor: 1,
    	location: {
    		x: 103.78117382526399,
    		y: 1.296064279348453
    	}
    };
    var SPSWETLAB = {
    	roomName: "SPSWETLAB",
    	floor: 2,
    	location: {
    		x: 103.78030210733415,
    		y: 1.296855328454714
    	}
    };
    var CFG_CARSPA = {
    	roomName: "CFG Career Space, Yusof Ishak House",
    	floor: 3,
    	location: {
    		x: 103.7747633457184,
    		y: 1.2985055114007384
    	}
    };
    var Frontier = {
    	roomName: "Frontier",
    	floor: 1,
    	location: {
    		x: 103.78003966445547,
    		y: 1.296364945076005
    	}
    };
    var Interaction = {
    	roomName: "Interaction",
    	floor: 2,
    	location: {
    		x: 103.77761185169221,
    		y: 1.291363565499891
    	}
    };
    var VenueInfo = {
    	LT17: LT17,
    	LT16: LT16,
    	"BIZ2-0301": {
    	roomName: "Seminar Room 3-1",
    	floor: 3,
    	location: {
    		x: 103.77472214694177,
    		y: 1.293767094527918
    	}
    },
    	"BIZ2-0404": {
    	roomName: "Seminar Room 4-4",
    	floor: 4,
    	location: {
    		x: 103.77472235450287,
    		y: 1.2937671894910092
    	}
    },
    	"BIZ2-0509": {
    	roomName: "Seminar Room 5-9",
    	floor: 5,
    	location: {
    		x: 103.77534379798186,
    		y: 1.293256567172797
    	}
    },
    	"BIZ1-0301": {
    	roomName: "Seminar Room 3-1",
    	floor: 3,
    	location: {
    		x: 103.77405044962676,
    		y: 1.2924148334324945
    	}
    },
    	"BIZ2-0510": {
    	roomName: "Seminar Room 5-10",
    	floor: 5,
    	location: {
    		x: 103.77522103815542,
    		y: 1.2933003093570126
    	}
    },
    	"BIZ2-0202": {
    	roomName: "Seminar Room 2-2",
    	floor: 2,
    	location: {
    		x: 103.77482884542967,
    		y: 1.293523907999633
    	}
    },
    	"BIZ1-0205": {
    	roomName: "Seminar Room 2-5",
    	floor: 2,
    	location: {
    		x: 103.77402241673727,
    		y: 1.2926550012018911
    	}
    },
    	"BIZ1-0304": {
    	roomName: "Seminar Room 3-4",
    	floor: 3,
    	location: {
    		x: 103.7739122274241,
    		y: 1.2927029724261363
    	}
    },
    	"BIZ1-0201": {
    	roomName: "Seminar Room 2-1",
    	floor: 2,
    	location: {
    		x: 103.77405087721557,
    		y: 1.2924198834131768
    	}
    },
    	"BIZ1-0202": {
    	roomName: "Seminar Room 2-2",
    	floor: 2,
    	location: {
    		x: 103.77392488408341,
    		y: 1.292479705057965
    	}
    },
    	"BIZ2-0201": {
    	roomName: "Seminar Room 2-1",
    	floor: 2,
    	location: {
    		x: 103.77480046804925,
    		y: 1.293585699845722
    	}
    },
    	"BIZ1-0206": {
    	roomName: "Seminar Room 2-6",
    	floor: 2,
    	location: {
    		x: 103.77414714137413,
    		y: 1.292623660669996
    	}
    },
    	"BIZ2-B104": {
    	roomName: "Seminar Room B1-4",
    	floor: -1,
    	location: {
    		x: 103.77529531979695,
    		y: 1.293297779751492
    	}
    },
    	"BIZ1-0204": {
    	roomName: "Seminar Room 2-4",
    	floor: 2,
    	location: {
    		x: 103.7739122274241,
    		y: 1.2927029724261363
    	}
    },
    	"BIZ1-0303": {
    	roomName: "Seminar Room 3-3",
    	floor: 3,
    	location: {
    		x: 103.77381357167226,
    		y: 1.2926403066941994
    	}
    },
    	"BIZ2-0229": {
    	roomName: "Seminar Room 2-29",
    	floor: 2,
    	location: {
    		x: 103.77501112911452,
    		y: 1.293366004775327
    	}
    },
    	LT10: LT10,
    	"AS7-0214": {
    	roomName: "Tutorial Room",
    	floor: 2,
    	location: {
    		x: 103.77106866993512,
    		y: 1.2943718340425634
    	}
    },
    	"AS8-0402": {
    	roomName: "FASS Tutorial Room",
    	floor: 4,
    	location: {
    		x: 103.7721182951268,
    		y: 1.2962459856888273
    	}
    },
    	"AS7-0102": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.7710383009886,
    		y: 1.2946298656111013
    	}
    },
    	"S2-0414": {
    	roomName: "Teaching Assistant Room",
    	floor: 4,
    	location: {
    		x: 103.77805188103908,
    		y: 1.2954979930016757
    	}
    },
    	"S2-0415": {
    	roomName: "Staff Room",
    	floor: 4,
    	location: {
    		x: 103.7779925839155,
    		y: 1.2955198239603223
    	}
    },
    	"S1A-0217": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.778166051549,
    		y: 1.2959208247559988
    	}
    },
    	"S16-0437": {
    	roomName: "Seminar Room 8",
    	floor: 4,
    	location: {
    		x: 103.78061256634672,
    		y: 1.2968291014586761
    	}
    },
    	"BIZ1-0302": {
    	roomName: "Seminar Room 3-2",
    	floor: 3,
    	location: {
    		x: 103.77392249854232,
    		y: 1.2924759356111268
    	}
    },
    	"BIZ1-0307": {
    	roomName: "EMBA Seminar Room 3-7",
    	floor: 3,
    	location: {
    		x: 103.77436910141846,
    		y: 1.292527584386196
    	}
    },
    	"BIZ2-0420": {
    	roomName: "Seminar Room 4-20",
    	floor: 4,
    	location: {
    		x: 103.77502873478593,
    		y: 1.2933426065627958
    	}
    },
    	"BIZ2-0228": {
    	roomName: "Seminar Room 2-28",
    	floor: 2,
    	location: {
    		x: 103.77509473195855,
    		y: 1.2933361735350462
    	}
    },
    	"BIZ2-HSSAU": {
    	roomName: "Hon Sui Sen Auditorium",
    	floor: 1,
    	location: {
    		x: 103.7746254,
    		y: 1.2933012
    	}
    },
    	"BIZ1-0203": {
    	roomName: "Seminar Room 2-3",
    	floor: 2,
    	location: {
    		x: 103.77380853874396,
    		y: 1.292648678276406
    	}
    },
    	"BIZ1-0305": {
    	roomName: "Seminar Room 3-5",
    	floor: 3,
    	location: {
    		x: 103.77402241673727,
    		y: 1.2926550012018911
    	}
    },
    	LT3: LT3,
    	"EA-06-04": {
    	roomName: "Seminar Room 4",
    	floor: 6,
    	location: {
    		x: 103.77040660907785,
    		y: 1.3000611759601464
    	}
    },
    	LT1: LT1,
    	"EA-06-02": {
    	roomName: "Seminar Room 2",
    	floor: 6,
    	location: {
    		x: 103.77038150521669,
    		y: 1.2998929011780467
    	}
    },
    	"EA-02-11": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77048516695865,
    		y: 1.3002818961646707
    	}
    },
    	LT5: LT5,
    	"EA-06-07": {
    	roomName: "Seminar Room 7 (Active Learning Room",
    	floor: 6,
    	location: {
    		x: 103.7704782297597,
    		y: 1.3002631503286262
    	}
    },
    	"EA-06-03": {
    	roomName: "Seminar Room 3",
    	floor: 6,
    	location: {
    		x: 103.7703764980984,
    		y: 1.2999827695371007
    	}
    },
    	"E1-06-01": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77122930564994,
    		y: 1.2984783970979255
    	}
    },
    	"E4A-06-03": {
    	roomName: "Linear Electronics Laboratory",
    	floor: 6,
    	location: {
    		x: 103.77262273463798,
    		y: 1.2986179076481752
    	}
    },
    	"E3-06-04": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77159127843342,
    		y: 1.2995254509506342
    	}
    },
    	LT4: LT4,
    	"E3-06-03": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77162119970221,
    		y: 1.2994619969668137
    	}
    },
    	"BIZ2-0303": {
    	roomName: "Seminar Room 3-3",
    	floor: 3,
    	location: {
    		x: 103.77477811718812,
    		y: 1.2936476012594607
    	}
    },
    	"BIZ2-0302": {
    	roomName: "Seminar Room 3-2",
    	floor: 3,
    	location: {
    		x: 103.7747506420134,
    		y: 1.2937062576944849
    	}
    },
    	"COM1-0212": {
    	roomName: "Seminar Room 3",
    	floor: 2,
    	location: {
    		x: 103.77400841456318,
    		y: 1.2947910941174683
    	}
    },
    	"COM1-0204": {
    	roomName: "Seminar Room 2",
    	floor: 2,
    	location: {
    		x: 103.77363022755422,
    		y: 1.2950716958743245
    	}
    },
    	"COM1-0203": {
    	roomName: "Seminar Room 6",
    	floor: 2,
    	location: {
    		x: 103.77377825034073,
    		y: 1.295245217052662
    	}
    },
    	"COM1-0201": {
    	roomName: "Seminar Room 5 (Active Learning Room)",
    	floor: 2,
    	location: {
    		x: 103.77364859508984,
    		y: 1.295399299579972
    	}
    },
    	"COM1-0209": {
    	roomName: "Seminar Room 9",
    	floor: 2,
    	location: {
    		x: 103.77416220604057,
    		y: 1.2948080988798212
    	}
    },
    	"COM1-0216": {
    	roomName: "Tutorial Room 11",
    	floor: 2,
    	location: {
    		x: 103.77397325718385,
    		y: 1.2947181065642799
    	}
    },
    	"COM1-0207": {
    	roomName: "Seminar Room 7",
    	floor: 2,
    	location: {
    		x: 103.7740489892307,
    		y: 1.2949426312679213
    	}
    },
    	"COM1-0217": {
    	roomName: "Tutorial Room 10",
    	floor: 2,
    	location: {
    		x: 103.7739295391784,
    		y: 1.2947700558396817
    	}
    },
    	"i3-0344": {
    	nusRoomCode: "I3-03-44",
    	roomName: "STMI Executive Training Room",
    	floor: 3,
    	location: {
    		x: 103.7755675261885,
    		y: 1.2924530137961476,
    		z: 10
    	}
    },
    	"AS8-0646": {
    	roomName: "Conference Room",
    	floor: 6,
    	location: {
    		x: 103.77230168400571,
    		y: 1.2960286695897383
    	}
    },
    	"E1-06-04": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77113407123136,
    		y: 1.2986802597007854
    	}
    },
    	LT7: LT7,
    	"E1-06-06": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77107265346072,
    		y: 1.2988104468426558
    	}
    },
    	"E1-06-09": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77105321711622,
    		y: 1.2990281268413146
    	}
    },
    	"E1-06-03": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77116478236066,
    		y: 1.2986151634160727
    	}
    },
    	"E1-06-05": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77110336279617,
    		y: 1.298745351463249
    	}
    },
    	"E4-04-03": {
    	roomName: "Advance Control Technology Lab",
    	floor: 4,
    	location: {
    		x: 103.771701,
    		y: 1.2988515
    	}
    },
    	LT2: LT2,
    	LT6: LT6,
    	"E1-06-08": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77098527449711,
    		y: 1.298995662095381
    	}
    },
    	"E3-06-09": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77151272213253,
    		y: 1.2998648198508147
    	}
    },
    	"E4-04-04": {
    	roomName: "Active Learning Room",
    	floor: 4,
    	location: {
    		x: 103.77171694758965,
    		y: 1.2987982529100295
    	}
    },
    	"E1-06-07": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 6,
    	location: {
    		x: 103.77103634320771,
    		y: 1.2988874118637497
    	}
    },
    	"E2-03-02": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 3,
    	location: {
    		x: 103.77124098908604,
    		y: 1.2991178380970212
    	}
    },
    	"E2-03-32": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.7712929437992,
    		y: 1.2990077022822446
    	}
    },
    	"E2-03-03": {
    	roomName: "Tutorial Room (Active Learning Room)",
    	floor: 3,
    	location: {
    		x: 103.77120560887423,
    		y: 1.299192845194747
    	}
    },
    	"E3-06-01": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77168612825712,
    		y: 1.2993243027699033
    	}
    },
    	"E3-06-08": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77144462853268,
    		y: 1.299832231214548
    	}
    },
    	"COM1-0113": {
    	roomName: "Embedded Systems Teaching Lab 2",
    	floor: 1,
    	location: {
    		x: 103.77399879754427,
    		y: 1.2948261488620085
    	}
    },
    	"COM1-0114": {
    	roomName: "Embedded Systems Teaching Lab 1",
    	floor: 1,
    	location: {
    		x: 103.77395649927423,
    		y: 1.2948764061055216
    	}
    },
    	"AS3-0303": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77143809188564,
    		y: 1.2947555513545945
    	}
    },
    	"AS5-0309": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77183677759575,
    		y: 1.2942108118444964
    	}
    },
    	"AS7-0106": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.77115679974798,
    		y: 1.2945617708102077
    	}
    },
    	"AS1-0301": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77242463868491,
    		y: 1.295546379598693
    	}
    },
    	"AS1-0208": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 2,
    	location: {
    		x: 103.77221961367701,
    		y: 1.295245297279139
    	}
    },
    	"AS4-0206": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77197963582599,
    		y: 1.294627705573499
    	}
    },
    	"AS2-0413": {
    	roomName: "Seminar Room",
    	floor: 4,
    	location: {
    		x: 103.7715262318452,
    		y: 1.2951959445714136
    	}
    },
    	"AS5-0205": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.7717777970229,
    		y: 1.2941464911099443
    	}
    },
    	"AS3-0307": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77113279902782,
    		y: 1.2946989867008212
    	}
    },
    	"AS4-0604": {
    	roomName: "Research Lab (Temp)",
    	floor: 6,
    	location: {
    		x: 103.77213996573175,
    		y: 1.294692076698793
    	}
    },
    	"AS5-0202": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.7717125547647,
    		y: 1.2939599508094428
    	}
    },
    	"AS8-0401": {
    	roomName: "FASS Seminar Room",
    	floor: 4,
    	location: {
    		x: 103.77207885443464,
    		y: 1.2961353873044867
    	}
    },
    	"AS4-0119": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.77145341527222,
    		y: 1.2943997458713126
    	}
    },
    	"AS1-0304": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.7723465065967,
    		y: 1.2953286800325798
    	}
    },
    	"AS7-0101": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.77097285948192,
    		y: 1.2945093683012465
    	}
    },
    	"AS4-0603": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77223475074419,
    		y: 1.2947484959587636
    	}
    },
    	"AS7-0119": {
    	roomName: "Seminar Room D",
    	floor: 1,
    	location: {
    		x: 103.77118729437709,
    		y: 1.2940494473729465
    	}
    },
    	"AS3-0305": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77131443894076,
    		y: 1.2946816047747634
    	}
    },
    	"AS1-0303": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77236923911566,
    		y: 1.2953920204513354
    	}
    },
    	"AS4-0110": {
    	nusRoomCode: "AS4-01-10",
    	roomName: "Computer Lab",
    	floor: 1,
    	location: {
    		x: 103.77193139943837,
    		y: 1.2946245970026615,
    		z: 0
    	}
    },
    	LT28: LT28,
    	"S16-0307": {
    	roomName: "Department Seminar Room (Seminar Room 1)",
    	floor: 3,
    	location: {
    		x: 103.78020476545214,
    		y: 1.2968108229079032
    	}
    },
    	"S5-0224": {
    	roomName: "Chem Tutorial Room 2",
    	floor: 2,
    	location: {
    		x: 103.77963675090095,
    		y: 1.2956297353180064
    	}
    },
    	"S16-0430": {
    	roomName: "Tutorial Room 10",
    	floor: 4,
    	location: {
    		x: 103.78046491027257,
    		y: 1.2966662856295585
    	}
    },
    	LT32: LT32,
    	LT27: LT27,
    	LT31: LT31,
    	"E5-03-19": {
    	roomName: "Seminar Room(Active Learning Room)",
    	floor: 3,
    	location: {
    		x: 103.77203256266569,
    		y: 1.29817763882849
    	}
    },
    	LT34: LT34,
    	LT26: LT26,
    	"S5-0223": {
    	roomName: "Chem Tutorial Room 3",
    	floor: 2,
    	location: {
    		x: 103.77968110871842,
    		y: 1.295613570749399
    	}
    },
    	LT21: LT21,
    	LT33: LT33,
    	"S5-0410": {
    	roomName: "Experimental Cubicle 5",
    	floor: 4,
    	location: {
    		x: 103.77971470484341,
    		y: 1.2955043902597878
    	}
    },
    	"S14-0620": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77959245458497,
    		y: 1.296735091084466
    	}
    },
    	LT20: LT20,
    	LT29: LT29,
    	"S14-0619": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.7797014692963,
    		y: 1.2967861411655512
    	}
    },
    	"S8-0314": {
    	roomName: "Executive Classroom",
    	floor: 3,
    	location: {
    		x: 103.7792463148344,
    		y: 1.2961066770026624
    	}
    },
    	"S13-M-09": {
    	roomName: "Computer Lab 1",
    	floor: 105,
    	location: {
    		x: 103.7790883205841,
    		y: 1.2967727470417594
    	}
    },
    	"S16-0436": {
    	roomName: "Tutorial Room 13",
    	floor: 4,
    	location: {
    		x: 103.78057362218198,
    		y: 1.296717767048963
    	}
    },
    	"S16-0435": {
    	roomName: "Seminar Room 7",
    	floor: 4,
    	location: {
    		x: 103.7805560494127,
    		y: 1.2968023410340423
    	}
    },
    	"E3-06-07": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 6,
    	location: {
    		x: 103.77149631806587,
    		y: 1.2997268984685864
    	}
    },
    	"E5-03-22": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77229147043936,
    		y: 1.2980839837384197
    	}
    },
    	"E5-03-21": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.7722243755894,
    		y: 1.2981082552454721
    	}
    },
    	"E5-02-32": {
    	roomName: "Executive Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77287015889299,
    		y: 1.2978119839358138
    	}
    },
    	"E5-03-20": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77214569481326,
    		y: 1.2981367163883881
    	}
    },
    	"EW2-0402": {
    	nusRoomCode: "EW2-04-02",
    	roomName: "Chemical & Biomolecular Engineering UG Lab",
    	floor: 4,
    	location: {
    		x: 103.77260123626932,
    		y: 1.2990990325535583,
    		z: 20
    	}
    },
    	LT7A: LT7A,
    	"E5-03-23": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.7723572965332,
    		y: 1.2980601725201302
    	}
    },
    	"E1-06-02": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77119549169116,
    		y: 1.2985500698439354
    	}
    },
    	"E3-06-06": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77153143409402,
    		y: 1.299652360725575
    	}
    },
    	"MD1-08-01E": {
    	roomName: "Seminar Room 1",
    	floor: 8,
    	location: {
    		x: 103.78071805838483,
    		y: 1.2954196977993246
    	}
    },
    	"S13-M-08": {
    	roomName: "Computer Lab 2",
    	floor: 105,
    	location: {
    		x: 103.77922139066418,
    		y: 1.2967170184504604
    	}
    },
    	"COM1-B108": {
    	roomName: "Programming Lab 3",
    	floor: -1,
    	location: {
    		x: 103.77399490559694,
    		y: 1.2948802261411385
    	}
    },
    	"COM1-0120": {
    	roomName: "Programming Lab 6",
    	floor: 1,
    	location: {
    		x: 103.77393662964938,
    		y: 1.2946898018099136
    	}
    },
    	"COM1-B111": {
    	roomName: "Programming Lab 4",
    	floor: -1,
    	location: {
    		x: 103.77390670433856,
    		y: 1.2949318976322264
    	}
    },
    	"i3-0336": {
    	nusRoomCode: "I3-03-36",
    	roomName: "Graduate Students Lab 2",
    	floor: 3,
    	location: {
    		x: 103.77600653251584,
    		y: 1.292238306896456,
    		z: 10
    	}
    },
    	"i3-0338": {
    	nusRoomCode: "I3-03-38",
    	roomName: "FYP Lab 3",
    	floor: 3,
    	location: {
    		x: 103.7758652168729,
    		y: 1.292285989913646,
    		z: 10
    	}
    },
    	"COM1-B110": {
    	roomName: "Programming Lab 5",
    	floor: -1,
    	location: {
    		x: 103.77389908044206,
    		y: 1.2948059113590875
    	}
    },
    	"AS6-0208": {
    	roomName: "Discussion Room 5",
    	floor: 2,
    	location: {
    		x: 103.77331128855921,
    		y: 1.295353329958129
    	}
    },
    	"COM1-0208": {
    	roomName: "Seminar Room 8",
    	floor: 2,
    	location: {
    		x: 103.77410582542402,
    		y: 1.2948750937706417
    	}
    },
    	"AS6-0421": {
    	roomName: "Media Teaching Lab 1",
    	floor: 4,
    	location: {
    		x: 103.77307002841133,
    		y: 1.2957162148539985
    	}
    },
    	"COM1-B109": {
    	roomName: "Programming Lab 2",
    	floor: -1,
    	location: {
    		x: 103.77394993801991,
    		y: 1.2948418917897562
    	}
    },
    	"COM2-0108": {
    	roomName: "Tutorial Room 9",
    	floor: 1,
    	location: {
    		x: 103.7741592837536,
    		y: 1.2935772164129489
    	}
    },
    	"COM1-0218": {
    	roomName: "Tutorial Room 5",
    	floor: 2,
    	location: {
    		x: 103.77400457029671,
    		y: 1.2945721103380643
    	}
    },
    	"COM1-B112": {
    	roomName: "Programming Lab 1",
    	floor: -1,
    	location: {
    		x: 103.77384933268041,
    		y: 1.294957757481026
    	}
    },
    	LT15: LT15,
    	"COM1-0210": {
    	roomName: "Seminar Room 10 (Active Learning Room)",
    	floor: 2,
    	location: {
    		x: 103.7742308799548,
    		y: 1.294726496078519
    	}
    },
    	"COM1-B103": {
    	roomName: "Active Learning Lab",
    	floor: -1,
    	location: {
    		x: 103.7741520884566,
    		y: 1.2946915586338772
    	}
    },
    	"COM1-B113": {
    	roomName: "IT Security & OS Lab",
    	floor: -1,
    	location: {
    		x: 103.77382251299647,
    		y: 1.2950339531613342
    	}
    },
    	"COM1-B102": {
    	roomName: "Data Communications & Networking Lab 2",
    	floor: -1,
    	location: {
    		x: 103.77418317952842,
    		y: 1.2947820952796627
    	}
    },
    	"AS6-0426": {
    	roomName: "Media Teaching Lab 2A",
    	floor: 4,
    	location: {
    		x: 103.77296457700454,
    		y: 1.295876370728193
    	}
    },
    	"COM1-0206": {
    	roomName: "Seminar Room 1",
    	floor: 2,
    	location: {
    		x: 103.77393175616923,
    		y: 1.2950279706567276
    	}
    },
    	"AS3-0207": {
    	nusRoomCode: "AS3-02-07",
    	roomName: "Graduate Room/ Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77132252854963,
    		y: 1.2947173617298973,
    		z: 5
    	}
    },
    	"S16-0598": {
    	roomName: "Seminar Room (Active Learning)",
    	floor: 5,
    	location: {
    		x: 103.7805388714307,
    		y: 1.2966976152714058
    	}
    },
    	LT18: LT18,
    	"S17-0404": {
    	roomName: "Seminar Room 3",
    	floor: 4,
    	location: {
    		x: 103.78069589858914,
    		y: 1.2977219451351334
    	}
    },
    	"BIZ2-0117": {
    	roomName: "Seminar Room 1-17",
    	floor: 1,
    	location: {
    		x: 103.77509832140223,
    		y: 1.2933463685175903
    	}
    },
    	"HSS-03-17": {
    	nusRoomCode: "HSS-03-17",
    	roomName: "BIZ/ HSMLCR",
    	floor: 3,
    	location: {
    		x: 103.77435565311596,
    		y: 1.2931041443946742,
    		z: 10
    	}
    },
    	"E3-06-11": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77161263640383,
    		y: 1.2996911481945275
    	}
    },
    	"E3-06-10": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77158216249852,
    		y: 1.299755776029217
    	}
    },
    	"E3-06-05": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.7715613562645,
    		y: 1.299588905838335
    	}
    },
    	LT9: LT9,
    	"AS4-0602": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77221057309015,
    		y: 1.2948096891841967
    	}
    },
    	"AS3-0208": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77133676505322,
    		y: 1.2946806060016864
    	}
    },
    	"AS4-0109": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.77199127404332,
    		y: 1.2946528770289971
    	}
    },
    	"AS3-0209": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77128735302539,
    		y: 1.2946548041759978
    	}
    },
    	"AS3-0302": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77149639851056,
    		y: 1.2947846606561015
    	}
    },
    	"AS1-0209": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 2,
    	location: {
    		x: 103.77215585020639,
    		y: 1.2952151831122907
    	}
    },
    	LT11: LT11,
    	"AS2-0311": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77136444901903,
    		y: 1.2951670452519441
    	}
    },
    	"AS1-0204": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77237307689276,
    		y: 1.2954254151011662
    	}
    },
    	"AS2-0509": {
    	roomName: "Seminar Room",
    	floor: 5,
    	location: {
    		x: 103.77168942852542,
    		y: 1.295280920833065
    	}
    },
    	"AS4-0118": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.77151310836271,
    		y: 1.2944279381807529
    	}
    },
    	LT8: LT8,
    	"AS1-0203": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77239537095346,
    		y: 1.2954875309998122
    	}
    },
    	"AS1-0302": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77239138402778,
    		y: 1.2954537221475408
    	}
    },
    	"AS4-0117": {
    	roomName: "Computer Room",
    	floor: 1,
    	location: {
    		x: 103.7715728526709,
    		y: 1.2944561549079376
    	}
    },
    	"AS8-0405": {
    	roomName: "FASS Computer Teaching Lab",
    	floor: 4,
    	location: {
    		x: 103.77232644493502,
    		y: 1.2959253239578203
    	}
    },
    	"AS3-0214": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77106737931292,
    		y: 1.2947162674867374
    	}
    },
    	LT12: LT12,
    	"AS4-0116": {
    	roomName: "Seminar Room",
    	floor: 1,
    	location: {
    		x: 103.77163235086563,
    		y: 1.2944808210934202
    	}
    },
    	"AS2-0510": {
    	roomName: "Seminar Room",
    	floor: 5,
    	location: {
    		x: 103.77163098257019,
    		y: 1.2952535768512212
    	}
    },
    	LT14: LT14,
    	"AS2-0312": {
    	roomName: "Economics Dept Seminar Room (Lim Tay Boh Room)",
    	floor: 3,
    	location: {
    		x: 103.77122113241607,
    		y: 1.2952010096447986
    	}
    },
    	"AS6-0214": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77309907509418,
    		y: 1.2956620079511314
    	}
    },
    	"AS1-0213": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 2,
    	location: {
    		x: 103.77188940474412,
    		y: 1.2950893397576222
    	}
    },
    	"E3-06-12": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77164254599253,
    		y: 1.2996277204368702
    	}
    },
    	"E3-06-13": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77167246815999,
    		y: 1.2995642655481459
    	}
    },
    	"E3-06-15": {
    	roomName: "Tutorial Room (Active Learning Room)",
    	floor: 6,
    	location: {
    		x: 103.7717323205774,
    		y: 1.2994373440127818
    	}
    },
    	"E3-06-14": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77170239032588,
    		y: 1.2995008106589612
    	}
    },
    	"E3-06-02": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.7716511209695,
    		y: 1.2993985420781702
    	}
    },
    	"EA-06-05": {
    	roomName: "Seminar Room 5",
    	floor: 6,
    	location: {
    		x: 103.77043059674752,
    		y: 1.3001286991099226
    	}
    },
    	"E1-06-10": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77112090006638,
    		y: 1.2989132814912119
    	}
    },
    	"E2A-02-02": {
    	roomName: "DCP Electronics Workshop",
    	floor: 2,
    	location: {
    		x: 103.77144811786084,
    		y: 1.2987129222434761
    	}
    },
    	"E2A-03-01": {
    	roomName: "DCP Studio 1",
    	floor: 3,
    	location: {
    		x: 103.77147862551244,
    		y: 1.2988490497153404
    	}
    },
    	"E2A-03-02": {
    	nusRoomCode: "E2A-03-02",
    	roomName: "DCP Studio 2",
    	floor: 3,
    	location: {
    		x: 103.77148959250358,
    		y: 1.2987274319812008,
    		z: 15
    	}
    },
    	"E2A-04-02": {
    	nusRoomCode: "E2A-04-02",
    	roomName: "DCP Studio 3",
    	floor: 4,
    	location: {
    		x: 103.77148388232399,
    		y: 1.2988355295988105,
    		z: 15
    	}
    },
    	"E2A-04-03": {
    	nusRoomCode: "E2A-04-03",
    	roomName: "DCP Studio 4",
    	floor: 4,
    	location: {
    		x: 103.77148959250358,
    		y: 1.2987274319812008,
    		z: 15
    	}
    },
    	"E1-06-12": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77118231604008,
    		y: 1.2987831015831095
    	}
    },
    	"E1-06-11": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77115160760464,
    		y: 1.298848196963577
    	}
    },
    	"E1-06-15": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77127444223505,
    		y: 1.298587818151939
    	}
    },
    	"E1-06-13": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77121302537235,
    		y: 1.2987180089152839
    	}
    },
    	"AS3-0304": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.7713833435048,
    		y: 1.2947258696766968
    	}
    },
    	"AS5-0203": {
    	roomName: "Semiotic Research Lab (ELL)",
    	floor: 2,
    	location: {
    		x: 103.77173425396464,
    		y: 1.2940219934452142
    	}
    },
    	"AS3-0308": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77107159429184,
    		y: 1.2947197313061816
    	}
    },
    	"AS3-0306": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.7712004625404,
    		y: 1.29467605278722
    	}
    },
    	"AS3-0215": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77100773356037,
    		y: 1.2947364857890038
    	}
    },
    	"AS3-0212": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77119016347922,
    		y: 1.2946746507685492
    	}
    },
    	"AS3-0309": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.77099887463588,
    		y: 1.2947443788614634
    	}
    },
    	"BIZ2-0112": {
    	roomName: "Seminar Room 1-12",
    	floor: 1,
    	location: {
    		x: 103.7753262214032,
    		y: 1.2932651654652032
    	}
    },
    	"E1-06-16": {
    	roomName: "Tutorial Room (Active Learning Room)",
    	floor: 6,
    	location: {
    		x: 103.7713082606851,
    		y: 1.2985161381699963
    	}
    },
    	"E1-06-14": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77124373470306,
    		y: 1.2986529135338845
    	}
    },
    	"S16-0440": {
    	roomName: "Tutorial Room 16",
    	floor: 4,
    	location: {
    		x: 103.78068208879594,
    		y: 1.2967691308912979
    	}
    },
    	"S16-0304": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.78047659321881,
    		y: 1.2966622225656268
    	}
    },
    	"S16-0309": {
    	roomName: "Tutorial Room 3",
    	floor: 3,
    	location: {
    		x: 103.78014562999573,
    		y: 1.2968783803944364
    	}
    },
    	"BIZ2-0114": {
    	nusRoomCode: "BIZ2-01-14",
    	roomName: "Seminar Room 1-14",
    	floor: 1,
    	location: {
    		x: 103.77524234181163,
    		y: 1.2932950527776097,
    		z: 0
    	}
    },
    	"BIZ2-0115": {
    	roomName: "Seminar Room 1-15",
    	floor: 1,
    	location: {
    		x: 103.77520119363727,
    		y: 1.2933097133849338
    	}
    },
    	"EA-06-06": {
    	roomName: "Seminar Room 6",
    	floor: 6,
    	location: {
    		x: 103.77045450534278,
    		y: 1.3001963714776315
    	}
    },
    	"E4-02-01": {
    	nusRoomCode: "E4-02-01",
    	roomName: "Freshmen Lab 1-3",
    	floor: 2,
    	location: {
    		x: 103.77222768235404,
    		y: 1.298439954445622,
    		z: 10
    	}
    },
    	"WS2-0530": {
    	nusRoomCode: "WS2-05-30",
    	roomName: "Innovators Lab",
    	floor: 5,
    	location: {
    		x: 103.7725319757075,
    		y: 1.2993945870773602,
    		z: 25
    	}
    },
    	"AS3-0316": {
    	roomName: "Graduate Room",
    	floor: 3,
    	location: {
    		x: 103.7712137836573,
    		y: 1.2947407332508771
    	}
    },
    	"AS6-0338": {
    	roomName: "Play Room (CNM)",
    	floor: 3,
    	location: {
    		x: 103.7729468647723,
    		y: 1.2958827695853172
    	}
    },
    	"AS2-0203": {
    	roomName: "Earth Lab",
    	floor: 2,
    	location: {
    		x: 103.77100199113531,
    		y: 1.2952816454908467
    	}
    },
    	"AS2-0313": {
    	roomName: "GIS Lab",
    	floor: 3,
    	location: {
    		x: 103.77112866883857,
    		y: 1.295235006938608
    	}
    },
    	"AS2-0204": {
    	roomName: "Earth Lab",
    	floor: 2,
    	location: {
    		x: 103.77091071909385,
    		y: 1.295312628559656
    	}
    },
    	"E-LAB": {
    	nusRoomCode: "PHYSICS E-LAB",
    	roomName: "Physics E-Lab",
    	floor: 3,
    	location: {
    		x: 103.77876709739479,
    		y: 1.296655722573894,
    		z: 10
    	}
    },
    	"AS2-0302": {
    	roomName: "Honours Room (Geography)",
    	floor: 3,
    	location: {
    		x: 103.77182382540906,
    		y: 1.2953166944408956
    	}
    },
    	"AS2-0316": {
    	roomName: "Dept Meeting Room (Geo)",
    	floor: 3,
    	location: {
    		x: 103.77153604861988,
    		y: 1.2951508116071433
    	}
    },
    	"S11-0301": {
    	roomName: "Lab Instruction Room",
    	floor: 3,
    	location: {
    		x: 103.77886290745013,
    		y: 1.2967319752315645
    	}
    },
    	"S12-0401": {
    	roomName: "Tutorial Room",
    	floor: 4,
    	location: {
    		x: 103.77880188060384,
    		y: 1.296879928831815
    	}
    },
    	"S16-0431": {
    	roomName: "Seminar Room 5",
    	floor: 4,
    	location: {
    		x: 103.78046968495556,
    		y: 1.2967614411474688
    	}
    },
    	"S17-0611": {
    	roomName: "Seminar Room 6",
    	floor: 6,
    	location: {
    		x: 103.78086100474435,
    		y: 1.2977837338612168
    	}
    },
    	"AS4-B107": {
    	roomName: "Tutorial Room",
    	floor: -1,
    	location: {
    		x: 103.77160985238247,
    		y: 1.2945128712137348
    	}
    },
    	"AS3-0523": {
    	roomName: "Philosophy Meeting/Resource Room",
    	floor: 5,
    	location: {
    		x: 103.77120191838155,
    		y: 1.294704660579218
    	}
    },
    	"S17-0512": {
    	roomName: "Seminar Room 4",
    	floor: 5,
    	location: {
    		x: 103.78083346314283,
    		y: 1.2977127714261751
    	}
    },
    	"S12-0402": {
    	roomName: "Physics Teaching Lab",
    	floor: 4,
    	location: {
    		x: 103.77863726856482,
    		y: 1.2969946927186957
    	}
    },
    	"AS1-0210": {
    	roomName: "Seminar Room (Active Learning Room)",
    	floor: 2,
    	location: {
    		x: 103.77209664050069,
    		y: 1.2951872169198646
    	}
    },
    	LT13: LT13,
    	"AS4-0601": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.77215302817352,
    		y: 1.2947908580178276
    	}
    },
    	"AS1-0207": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77232271331253,
    		y: 1.2952856498018621
    	}
    },
    	"BIZ2-0118": {
    	roomName: "Seminar Room 1-18",
    	floor: 1,
    	location: {
    		x: 103.77501451728376,
    		y: 1.2933762295973443
    	}
    },
    	"BIZ2-0224": {
    	roomName: "Seminar Room 2-24",
    	floor: 2,
    	location: {
    		x: 103.77527990323696,
    		y: 1.2932701908567978
    	}
    },
    	"AS1-0548": {
    	nusRoomCode: "AS1-05-48",
    	roomName: "Tutorial Room",
    	floor: 5,
    	location: {
    		x: 103.77246575545446,
    		y: 1.2955319840173942,
    		z: 25
    	}
    },
    	"AS3-0101": {
    	roomName: "Theatre Studies Practice Studio",
    	floor: 1,
    	location: {
    		x: 103.77111198276855,
    		y: 1.2947244648423655
    	}
    },
    	"CELS-01-08": {
    	roomName: "NGS Multipurpose Room",
    	floor: 1,
    	location: {
    		x: 103.78076417172579,
    		y: 1.294411011344144
    	}
    },
    	"CELS-01-06": {
    	nusRoomCode: "CELS-01-06",
    	roomName: "Seminar Room 1",
    	floor: 1,
    	location: {
    		x: 103.78081978938593,
    		y: 1.2942961817306413,
    		z: 0
    	}
    },
    	"BIZ2-0227": {
    	roomName: "Seminar Room 2-27",
    	floor: 2,
    	location: {
    		x: 103.77515669862687,
    		y: 1.293314093100053
    	}
    },
    	"AS1-0524": {
    	roomName: "Meeting/ Thesis",
    	floor: 5,
    	location: {
    		x: 103.77173857907228,
    		y: 1.2950098560160874
    	}
    },
    	"E1A-05-19": {
    	roomName: "Staff Room",
    	floor: 5,
    	location: {
    		x: 103.77113643180498,
    		y: 1.2988600093939424
    	}
    },
    	"i3-0337": {
    	nusRoomCode: "I3-03-37",
    	roomName: "Graduate Students Lab 1",
    	floor: 3,
    	location: {
    		x: 103.77592660212227,
    		y: 1.2922652786525903,
    		z: 10
    	}
    },
    	"AS3-0213": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77112876915017,
    		y: 1.2946954595805344
    	}
    },
    	"AS4-0114": {
    	roomName: "Computer Lab",
    	floor: 1,
    	location: {
    		x: 103.77170919462839,
    		y: 1.2945012869295494
    	}
    },
    	"AS4-0115": {
    	roomName: "Computer Lab",
    	floor: 1,
    	location: {
    		x: 103.77168463079167,
    		y: 1.2945541835019005
    	}
    },
    	"AS4-0335": {
    	roomName: "Honours Room",
    	floor: 3,
    	location: {
    		x: 103.77177213960896,
    		y: 1.294601540870097
    	}
    },
    	"MD4-02-03E": {
    	roomName: "Meeting Room/Offices",
    	floor: 2,
    	location: {
    		x: 103.78081788585813,
    		y: 1.295626117452161
    	}
    },
    	"MD1-07-01A": {
    	roomName: "Teaching Lab 1 & Microbiology Microscope Room",
    	floor: 7,
    	location: {
    		x: 103.78063494808147,
    		y: 1.2954422382496684
    	}
    },
    	"MD7-02-03": {
    	roomName: "Seminar Room M9",
    	floor: 2,
    	location: {
    		x: 103.78101697329667,
    		y: 1.2961545119029614
    	}
    },
    	"S17-0302": {
    	roomName: "Computer Lab 2",
    	floor: 3,
    	location: {
    		x: 103.78065804310808,
    		y: 1.2977137101039427
    	}
    },
    	"S17-0304": {
    	roomName: "Computer Lab 1",
    	floor: 3,
    	location: {
    		x: 103.78046365946426,
    		y: 1.2976204877546946
    	}
    },
    	"S17-0406": {
    	roomName: "Seminar Room 1",
    	floor: 4,
    	location: {
    		x: 103.78054811745372,
    		y: 1.2976510724216344
    	}
    },
    	"S17-0405": {
    	roomName: "Seminar Room 2",
    	floor: 4,
    	location: {
    		x: 103.78062979876718,
    		y: 1.2976902448722667
    	}
    },
    	"S16-05102": {
    	roomName: "Computer Laboratory 2",
    	floor: 5,
    	location: {
    		x: 103.78070265004187,
    		y: 1.2967751724760554
    	}
    },
    	"S16-05101": {
    	roomName: "Computer Laboratory 1",
    	floor: 5,
    	location: {
    		x: 103.78062926491644,
    		y: 1.2967404225446177
    	}
    },
    	"S16-06118": {
    	roomName: "Seminar Room",
    	floor: 6,
    	location: {
    		x: 103.78049501305661,
    		y: 1.29672016829534
    	}
    },
    	"S17-0511": {
    	roomName: "Seminar Room 5",
    	floor: 5,
    	location: {
    		x: 103.78083865160664,
    		y: 1.2977867566847803
    	}
    },
    	"E3A-0504": {
    	nusRoomCode: "E3A-05-04",
    	roomName: "Heat Treatment",
    	floor: 5,
    	location: {
    		x: 103.77121465020501,
    		y: 1.3004357792527184,
    		z: 0
    	}
    },
    	"AS8-0647": {
    	roomName: "Meeting Room",
    	floor: 6,
    	location: {
    		x: 103.77232066894744,
    		y: 1.2960819045510865
    	}
    },
    	"AS6-0333": {
    	roomName: "Dept Meeting Room (CNM)",
    	floor: 3,
    	location: {
    		x: 103.77305580914974,
    		y: 1.2957465550324785
    	}
    },
    	"S11-0204": {
    	roomName: "Tutorial Room/Lab",
    	floor: 2,
    	location: {
    		x: 103.77886266466652,
    		y: 1.2967402501607153
    	}
    },
    	"S11-0302": {
    	roomName: "Physics E-Lab",
    	floor: 3,
    	location: {
    		x: 103.77876709739479,
    		y: 1.296655722573894
    	}
    },
    	"S11-0401": {
    	nusRoomCode: "S11-04-01",
    	roomName: "Physics Laboratory",
    	floor: 4,
    	location: {
    		x: 103.7787737761478,
    		y: 1.2966613388217587,
    		z: 15
    	}
    },
    	"S12-0403": {
    	roomName: "Seminar Room",
    	floor: 4,
    	location: {
    		x: 103.77883030884449,
    		y: 1.2969582663978476
    	}
    },
    	"AS6-0204": {
    	nusRoomCode: "AS6-02-04",
    	roomName: "Tutorial Room",
    	floor: 2,
    	location: {
    		x: 103.77322627980647,
    		y: 1.2955570025354486,
    		z: 5
    	}
    },
    	"AS7-0201": {
    	roomName: "Psychology Computer Lab",
    	floor: 2,
    	location: {
    		x: 103.77102097590235,
    		y: 1.2946416074488063
    	}
    },
    	"AS4-0208": {
    	roomName: "Dept Meeting Room (Psychology)",
    	floor: 2,
    	location: {
    		x: 103.77175331439355,
    		y: 1.2945208195642892
    	}
    },
    	"MD1-06-01A": {
    	roomName: "Teaching Lab 2",
    	floor: 6,
    	location: {
    		x: 103.78058541257901,
    		y: 1.295472350739919
    	}
    },
    	"MD1-05-01A": {
    	roomName: "Teaching Lab 3",
    	floor: 5,
    	location: {
    		x: 103.78058561660362,
    		y: 1.2954696747298005
    	}
    },
    	"S4A-0308": {
    	nusRoomCode: "S4A-03-08",
    	roomName: "DIGOXIN Room",
    	floor: 3,
    	location: {
    		x: 103.77926062763346,
    		y: 1.2957722478669818,
    		z: 10
    	}
    },
    	"AS1-0212": {
    	roomName: "Sociology Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77196341776914,
    		y: 1.2951242961472689
    	}
    },
    	"AS2-0201": {
    	roomName: "GAMELAN Instrument Room (Studio)",
    	floor: 2,
    	location: {
    		x: 103.77135687474083,
    		y: 1.2951490382678812
    	}
    },
    	"MD1-09-01B": {
    	nusRoomCode: "MD1-09-01B",
    	roomName: "Tutorial Room 2",
    	floor: 9,
    	location: {
    		x: 103.78067220337118,
    		y: 1.2954036127189905,
    		z: 40
    	}
    },
    	"MD1-08-03E": {
    	roomName: "Seminar Room 2",
    	floor: 8,
    	location: {
    		x: 103.78066954770269,
    		y: 1.2951654130146952
    	}
    },
    	"MD1-09-01A": {
    	roomName: "Tutorial Room 1",
    	floor: 9,
    	location: {
    		x: 103.78075706964135,
    		y: 1.2953706250858725
    	}
    },
    	"MD1-09-03F": {
    	roomName: "Tutorial Room 4",
    	floor: 9,
    	location: {
    		x: 103.78064073919502,
    		y: 1.2951810488735283
    	}
    },
    	"AS4-B110": {
    	roomName: "Family Room (Social Work)",
    	floor: -1,
    	location: {
    		x: 103.77146354144062,
    		y: 1.294379410584016
    	}
    },
    	"AS4-B109": {
    	roomName: "Observation Room (Social Work)",
    	floor: -1,
    	location: {
    		x: 103.77152940115755,
    		y: 1.2944105150975271
    	}
    },
    	"I3-AUD": {
    	roomName: "i3 Auditorium",
    	floor: 1,
    	location: {
    		x: 103.7753084,
    		y: 1.2927122
    	}
    },
    	"AS1-0211": {
    	roomName: "History Honours Room",
    	floor: 2,
    	location: {
    		x: 103.7720374289992,
    		y: 1.2951592516304216
    	}
    },
    	"AS4-0318": {
    	roomName: "Staff Room",
    	floor: 3,
    	location: {
    		x: 103.77186605245747,
    		y: 1.2945695096743521
    	}
    },
    	"AS5-0204": {
    	roomName: "Phonetics Lab (ELL)",
    	floor: 2,
    	location: {
    		x: 103.77173188620486,
    		y: 1.2941006559002508
    	}
    },
    	"BIZ2-0116": {
    	roomName: "Seminar Room 1-16",
    	floor: 1,
    	location: {
    		x: 103.77516004456388,
    		y: 1.2933243758002517
    	}
    },
    	"BIZ2-0226": {
    	roomName: "Seminar Room 2-26",
    	floor: 2,
    	location: {
    		x: 103.77519784770013,
    		y: 1.2932994306847816
    	}
    },
    	"BIZ2-0401B": {
    	roomName: "Centre For Behavioural Economics Lab",
    	floor: 4,
    	location: {
    		x: 103.77449738874093,
    		y: 1.2938240651525725
    	}
    },
    	"C4-02-01": {
    	roomName: "Staff Room",
    	floor: 2,
    	location: {
    		x: 103.77914757584118,
    		y: 1.295635625815249
    	}
    },
    	"CELS-04-01": {
    	roomName: "Computer Area",
    	floor: 4,
    	location: {
    		x: 103.77287587158882,
    		y: 1.296345680326074
    	}
    },
    	"E2-03-06": {
    	roomName: "PC Cluster 3 (Teaching)",
    	floor: 3,
    	location: {
    		x: 103.77113574164383,
    		y: 1.299340949393047
    	}
    },
    	"E2-03-08": {
    	roomName: "PC Cluster 5 (Teaching)",
    	floor: 3,
    	location: {
    		x: 103.77104410334312,
    		y: 1.2995352054704308
    	}
    },
    	"E2-03-09": {
    	roomName: "PC Cluster 6 (Teaching)",
    	floor: 3,
    	location: {
    		x: 103.77099726698215,
    		y: 1.2996344935562927
    	}
    },
    	"E2A-02-01": {
    	roomName: "Workshop",
    	floor: 2,
    	location: {
    		x: 103.77147862551244,
    		y: 1.2988490497153404
    	}
    },
    	"E3-03-01": {
    	roomName: "ESP Lab",
    	floor: 3,
    	location: {
    		x: 103.77191389845903,
    		y: 1.2991748051794956
    	}
    },
    	"E3-05-21": {
    	roomName: "Autonomous Robotics Lab",
    	floor: 5,
    	location: {
    		x: 103.77179206714204,
    		y: 1.2993771772181408
    	}
    },
    	"E3A-05-03": {
    	roomName: "Magnetic Materials Characterisation Lab",
    	floor: 5,
    	location: {
    		x: 103.77120703914684,
    		y: 1.3003045214434568
    	}
    },
    	"E3A-05-07": {
    	roomName: "Materials Physics Lab",
    	floor: 5,
    	location: {
    		x: 103.77145604655468,
    		y: 1.3003768930179749
    	}
    },
    	"E4-03-07": {
    	roomName: "DigE Lab",
    	floor: 3,
    	location: {
    		x: 103.77252534290083,
    		y: 1.2983316495731172
    	}
    },
    	"E4A-04-08": {
    	roomName: "DSA Lab",
    	floor: 4,
    	location: {
    		x: 103.77258529989966,
    		y: 1.2986036801783416
    	}
    },
    	"E4A-06-07": {
    	roomName: "Staff Room",
    	floor: 6,
    	location: {
    		x: 103.77180186395101,
    		y: 1.2988208161677515
    	}
    },
    	"E5-03-24": {
    	roomName: "Computer Teaching LAB1",
    	floor: 3,
    	location: {
    		x: 103.77244036852647,
    		y: 1.2980301225086945
    	}
    },
    	"EW2-03-14": {
    	roomName: "Lab Classroom 1/2/3 (BSL1)",
    	floor: 3,
    	location: {
    		x: 103.77243682922185,
    		y: 1.2993791689773466
    	}
    },
    	"EW2-04-02": {
    	roomName: "Chemical & Biomolecular Engineering UG Lab",
    	floor: 4,
    	location: {
    		x: 103.77260123626932,
    		y: 1.2990990325535583
    	}
    },
    	"I3-0336": {
    	roomName: "Graduate Students Lab 2",
    	floor: 3,
    	location: {
    		x: 103.77600653251584,
    		y: 1.292238306896456
    	}
    },
    	"I3-0337": {
    	roomName: "Graduate Students Lab 1",
    	floor: 3,
    	location: {
    		x: 103.77592660212227,
    		y: 1.2922652786525903
    	}
    },
    	"I3-0338": {
    	roomName: "FYP Lab 3",
    	floor: 3,
    	location: {
    		x: 103.7758652168729,
    		y: 1.292285989913646
    	}
    },
    	"I3-0339": {
    	roomName: "FYP Lab 2",
    	floor: 3,
    	location: {
    		x: 103.77580382982545,
    		y: 1.2923067038862432
    	}
    },
    	"I3-0344": {
    	roomName: "STMI Executive Training Room",
    	floor: 3,
    	location: {
    		x: 103.7755675261885,
    		y: 1.2924530137961476
    	}
    },
    	"MD1-03-01B": {
    	roomName: "Multipurpose Hall 3",
    	floor: 3,
    	location: {
    		x: 103.78043812746127,
    		y: 1.29553673659013
    	}
    },
    	"MD1-03-01C": {
    	roomName: "Multipurpose Hall 2",
    	floor: 3,
    	location: {
    		x: 103.78059290274638,
    		y: 1.2954765760875424
    	}
    },
    	"MD1-06-03M": {
    	roomName: "Seminar Room 3",
    	floor: 6,
    	location: {
    		x: 103.78048012617927,
    		y: 1.2952805409717725
    	}
    },
    	"MD1-08-01B": {
    	roomName: "Computer Lab 2",
    	floor: 8,
    	location: {
    		x: 103.78042298526238,
    		y: 1.2955343912549544
    	}
    },
    	"MD1-0801AB": {
    	roomName: "Computer Lab 2",
    	floor: 8,
    	location: {
    		x: 103.78042298526238,
    		y: 1.2955343912549544
    	}
    },
    	"MD1-0903EF": {
    	roomName: "Tutorial Room 4",
    	floor: 9,
    	location: {
    		x: 103.78064073919502,
    		y: 1.2951810488735283
    	}
    },
    	"MD10-01-01": {
    	roomName: "Reception Area",
    	floor: 1,
    	location: {
    		x: 103.78168113019073,
    		y: 1.2964883988931324
    	}
    },
    	"MD11-01-03": {
    	roomName: "Symposium Room",
    	floor: 1,
    	location: {
    		x: 103.78173856312563,
    		y: 1.2960524927839885
    	}
    },
    	"RC2-G-02": {
    	roomName: "Classroom 9",
    	floor: null,
    	location: {
    		x: 103.7719907295531,
    		y: 1.306375323655279
    	}
    },
    	"S13-0313": {
    	roomName: "Level 3 Physics Lab",
    	floor: 3,
    	location: {
    		x: 103.7792697342841,
    		y: 1.2967082923732496
    	}
    },
    	"S14-0503": {
    	roomName: "Food Science & Technology Programme",
    	floor: 5,
    	location: {
    		x: 103.77972381491037,
    		y: 1.2968413874560345
    	}
    },
    	"WS2-01-30": {
    	roomName: "IEL Teaching Studio",
    	floor: 1,
    	location: {
    		x: 103.77253885939898,
    		y: 1.2994721120645238
    	}
    },
    	"UT-AUD3": {
    	roomName: "Auditorium 3",
    	floor: 1,
    	location: {
    		x: 103.77304673194887,
    		y: 1.307261676800578
    	}
    },
    	SR_LT19: SR_LT19,
    	"ENG-AUD": {
    	roomName: "Engineering Auditorium",
    	floor: 1,
    	location: {
    		x: 103.7705817818642,
    		y: 1.300612137950934
    	}
    },
    	LAW_LT: LAW_LT,
    	"SDE-ER4": {
    	roomName: "SDE2-ER4",
    	floor: 3,
    	location: {
    		x: 103.77107530832292,
    		y: 1.2972897349773982
    	}
    },
    	LT19: LT19,
    	"COM1-VCRM": {
    	roomName: "VCR Room",
    	floor: 2,
    	location: {
    		x: 103.7740085,
    		y: 1.2947362
    	}
    },
    	LAW_AUD: LAW_AUD,
    	LAW_SR3: LAW_SR3,
    	LAW_ESR: LAW_ESR,
    	"NAK-AUD": {
    	roomName: "Ngee Ann Kongsi Auditorium",
    	floor: 2,
    	location: {
    		x: 103.77310842275621,
    		y: 1.305495177478812
    	}
    },
    	"TC-SR4": {
    	roomName: "Tembusu Seminar Room 4",
    	floor: 1,
    	location: {
    		x: 103.77345002721997,
    		y: 1.3058887418233325
    	}
    },
    	"TP-SR9": {
    	roomName: "Town Plaza Seminar Room 9",
    	floor: 2,
    	location: {
    		x: 103.7734447780531,
    		y: 1.3040060366184345
    	}
    },
    	"ERC-GLR": {
    	roomName: "Global Learning Room",
    	floor: 2,
    	location: {
    		x: 103.77296626567842,
    		y: 1.3062266437833203
    	}
    },
    	"CELC-TR7": {
    	roomName: "Training Room 7",
    	floor: 3,
    	location: {
    		x: 103.77142667770386,
    		y: 1.2969754103578175
    	}
    },
    	"UTSRC-LT51": {
    	roomName: "LT51",
    	floor: 1,
    	location: {
    		x: 103.77298235893251,
    		y: 1.3040546181167396
    	}
    },
    	"UTSRC-SR7": {
    	roomName: "UTown Seminar Room 7",
    	floor: 2,
    	location: {
    		x: 103.77302572325755,
    		y: 1.3041726550718167
    	}
    },
    	"Y-PgRm2": {
    	roomName: "East Core - Programme Room 2",
    	floor: 2,
    	location: {
    		x: 103.77238932595665,
    		y: 1.30699712587118
    	}
    },
    	"Y-CR3": {
    	roomName: "Saga College - Classroom 3",
    	floor: 1,
    	location: {
    		x: 103.77228751042186,
    		y: 1.3057888366434272
    	}
    },
    	"BIZ2-0413C": {
    	roomName: "BIZ2-0413C",
    	floor: 4,
    	location: {
    		x: 103.77533733844759,
    		y: 1.29322559256955
    	}
    },
    	"RMI-SR1": {
    	roomName: "RMI-SR1 (i3-01-05)",
    	floor: 1,
    	location: {
    		x: 103.77548217773439,
    		y: 1.2926128638467618
    	}
    },
    	HSSMLCR: HSSMLCR,
    	"RC4-SR6": {
    	roomName: "Seminar Room 6",
    	floor: 1,
    	location: {
    		x: 103.77289652824403,
    		y: 1.3082901083261955
    	}
    },
    	"SDE-SR15": {
    	roomName: "Seminar Room 15",
    	floor: 2,
    	location: {
    		x: 103.7704767581688,
    		y: 1.2979434993900776
    	}
    },
    	"UTSRC-SR2": {
    	roomName: "UTown Seminar Room 2",
    	floor: 1,
    	location: {
    		x: 103.77266854047777,
    		y: 1.3043045855179205
    	}
    },
    	"SDE_ER4-5": {
    	roomName: "SDE-ER5",
    	floor: 3,
    	location: {
    		x: 103.77096801996233,
    		y: 1.297112209867133
    	}
    },
    	"SDE-ES2": {
    	roomName: "SDE-ES2",
    	floor: 3,
    	location: {
    		x: 103.7712147831917,
    		y: 1.2975278456969463
    	}
    },
    	"SDE-ER5": {
    	roomName: "SDE2-ER5",
    	floor: 3,
    	location: {
    		x: 103.7710538506508,
    		y: 1.2971288436813906
    	}
    },
    	"S11-0401A": {
    	roomName: "Physics Level 2000 Laboratory",
    	floor: 4,
    	location: {
    		x: 103.77884298563005,
    		y: 1.2967373414850563
    	}
    },
    	"S16-0306": {
    	roomName: "Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.78020528302606,
    		y: 1.2966934651120505
    	}
    },
    	"UTSRC-LT52": {
    	roomName: "Lecture Theatre 52",
    	floor: 2,
    	location: {
    		x: 103.77300515770914,
    		y: 1.3041273122931338
    	}
    },
    	"BIZ1-CMRI": {
    	roomName: "CAMRI Lab",
    	floor: 3,
    	location: {
    		x: 103.7741692364216,
    		y: 1.2924643324975336
    	}
    },
    	"CAPT-SR6": {
    	roomName: "Seminar Room 6, College of Alice and Peter Tan",
    	floor: -1,
    	location: {
    		x: 103.77342529373324,
    		y: 1.3080039996096091
    	}
    },
    	"USP-SR1": {
    	roomName: "Seminar Room 1",
    	floor: 1,
    	location: {
    		x: 103.77313256263734,
    		y: 1.3064958843341745
    	}
    },
    	"USP-SR2": {
    	roomName: "Seminar Room 2",
    	floor: 2,
    	location: {
    		x: 103.77303868532184,
    		y: 1.306742080617189
    	}
    },
    	RVR_MPR1: RVR_MPR1,
    	"USP-MC": {
    	roomName: "USP MC",
    	floor: 3,
    	location: {
    		x: 103.77334982156756,
    		y: 1.306699131752514
    	}
    },
    	"YSTCM-SR8": {
    	roomName: "Seminar Room 8",
    	floor: 1,
    	location: {
    		x: 103.77213938131032,
    		y: 1.302343504192887
    	}
    },
    	"Y-CR18": {
    	roomName: "Cendana College - Classroom 18",
    	floor: 1,
    	location: {
    		x: 103.77209827949825,
    		y: 1.3081501754171658
    	}
    },
    	"Y-CR19": {
    	roomName: "Cendana College - Classroom 19",
    	floor: 1,
    	location: {
    		x: 103.77215597089427,
    		y: 1.3081995151835102
    	}
    },
    	"Y-CR20": {
    	roomName: "Cendana College - Classroom 20",
    	floor: 1,
    	location: {
    		x: 103.77235118806529,
    		y: 1.3080455966903655
    	}
    },
    	"Y-CR21": {
    	roomName: "Cendana College - Classroom 21",
    	floor: 2,
    	location: {
    		x: 103.77233728358148,
    		y: 1.308000010773302
    	}
    },
    	"Y-CR22": {
    	roomName: "Cendana College - Classroom 22",
    	floor: 2,
    	location: {
    		x: 103.77225734320442,
    		y: 1.307863790088413
    	}
    },
    	"Y-CR23": {
    	roomName: "Cendana College - Classroom 23",
    	floor: 2,
    	location: {
    		x: 103.77215275048388,
    		y: 1.3078777339744636
    	}
    },
    	"Y-AChemLab": {
    	roomName: "East Core - Lab 2 (Analytical Chem)",
    	floor: null
    },
    	"Y-BioLab": {
    	roomName: "East Core - Lab 1 (Bio)",
    	floor: null
    },
    	"Y-CR15": {
    	roomName: "East Core - Classroom 15 (Teal Classroom)",
    	floor: 1,
    	location: {
    		x: 103.77235445340203,
    		y: 1.3068319447806727
    	}
    },
    	"Y-CR16": {
    	roomName: "East Core - Classroom 16 (Flex Classroom)",
    	floor: 1
    },
    	"Y-CR17": {
    	roomName: "East Core - Classroom 17",
    	floor: 2,
    	location: {
    		x: 103.77250958293335,
    		y: 1.3081051258162757
    	}
    },
    	"Y-CompLab": {
    	roomName: "East Core - Computer Lab",
    	floor: 2,
    	location: {
    		x: 103.77246979126771,
    		y: 1.307215400856019
    	}
    },
    	"Y-GLRm1": {
    	roomName: "East Core - Global Learning Room 1",
    	floor: 1,
    	location: {
    		x: 103.77237745388989,
    		y: 1.3072727852552588
    	}
    },
    	"Y-GLRm2": {
    	roomName: "East Core - Global Learning Room 2",
    	floor: 1,
    	location: {
    		x: 103.77240007414356,
    		y: 1.3072642043058085
    	}
    },
    	"Y-OChemLab": {
    	roomName: "East Core - Lab 4 (Organic Chem)",
    	floor: null
    },
    	"Y-PgRm1": {
    	roomName: "East Core - Programme Room 1",
    	floor: 2,
    	location: {
    		x: 103.77237859616122,
    		y: 1.306963338813609
    	}
    },
    	"Y-PhysLab": {
    	roomName: "East Core - Lab 3 (Physics)",
    	floor: null
    },
    	"Y-CR11": {
    	roomName: "Elm College - Classroom 11",
    	floor: 2,
    	location: {
    		x: 103.77229837467895,
    		y: 1.306441772265005
    	}
    },
    	"Y-CR12": {
    	roomName: "Elm College - Classroom 12",
    	floor: 2,
    	location: {
    		x: 103.77229837467895,
    		y: 1.306441772265005
    	}
    },
    	"Y-CR13": {
    	roomName: "Elm College - Classroom 13",
    	floor: 2,
    	location: {
    		x: 103.77229837467895,
    		y: 1.306441772265005
    	}
    },
    	"Y-CR14": {
    	roomName: "Elm College - Classroom 14",
    	floor: 2,
    	location: {
    		x: 103.77215083192603,
    		y: 1.3066957241756028
    	}
    },
    	"Y-CR9": {
    	roomName: "Classroom 9",
    	floor: 0,
    	location: {
    		x: 103.77197577457565,
    		y: 1.3064871024405618
    	}
    },
    	"Y-KChanrai": {
    	roomName: "Elm College - Kewalram Chanrai Room",
    	floor: 1,
    	location: {
    		x: 103.77229837467895,
    		y: 1.306441772265005
    	}
    },
    	"Y-TCTLT": {
    	roomName: "Elm College - Tan Chin Tuan Lecture Theatre",
    	floor: 0,
    	location: {
    		x: 103.77199562435915,
    		y: 1.3066678362266242
    	}
    },
    	"Y-WriteCtr": {
    	roomName: "Writers Centre - Elm",
    	floor: 2
    },
    	"Y-CR1": {
    	roomName: "Classroom 1",
    	floor: 0,
    	location: {
    		x: 103.77175099762619,
    		y: 1.30581028874315
    	}
    },
    	"Y-CR2": {
    	roomName: "Classroom 2",
    	floor: 1,
    	location: {
    		x: 103.7721532656606,
    		y: 1.3058998512411744
    	}
    },
    	"Y-CR4": {
    	roomName: "Saga College - Classroom 4",
    	floor: 1,
    	location: {
    		x: 103.77198030467714,
    		y: 1.3055480367418686
    	}
    },
    	"Y-CR5": {
    	roomName: "Saga College - Classroom 5",
    	floor: 0,
    	location: {
    		x: 103.77175095637367,
    		y: 1.3058006353023917
    	}
    },
    	"Y-CR6": {
    	roomName: "Saga College - Classroom 6",
    	floor: 2,
    	location: {
    		x: 103.77228639676764,
    		y: 1.3057765016696252
    	}
    },
    	"Y-CR7": {
    	roomName: "Classroom 7",
    	floor: 2,
    	location: {
    		x: 103.7720808680825,
    		y: 1.3055544725401718
    	}
    },
    	"Y-CR8": {
    	roomName: "Classroom 8",
    	floor: 2,
    	location: {
    		x: 103.77190469324051,
    		y: 1.3055469641326765
    	}
    },
    	"Y-LT1": {
    	roomName: "Saga College - Lecture Theatre 1",
    	floor: 1,
    	location: {
    		x: 103.77192265324696,
    		y: 1.3058977060435655
    	}
    },
    	"Y-ArtsStud": {
    	roomName: "West Core - Studio 2 (Georgette Chen Arts Studio)",
    	floor: 0,
    	location: {
    		x: 103.77209881561728,
    		y: 1.307876661468576
    	}
    },
    	"Y-BlackBox": {
    	roomName: "Black Box Theatre",
    	floor: 0,
    	location: {
    		x: 103.77202749252321,
    		y: 1.3074888814478036
    	}
    },
    	"Y-DanceStu": {
    	roomName: "West Core - Studio 1 (Dance Studio)",
    	floor: "Ground"
    },
    	"Y-PerfHall": {
    	roomName: "West Core - Performance Hall",
    	floor: 0,
    	location: {
    		x: 103.77194627811501,
    		y: 1.3070223321416874
    	}
    },
    	"Y-PracRm6": {
    	roomName: "West Core - Practice Room 6",
    	floor: 2,
    	location: {
    		x: 103.77197626576837,
    		y: 1.3073548394422478
    	}
    },
    	"Y-Studio3": {
    	roomName: "West Core - Studio 3",
    	floor: "Ground"
    },
    	"Y-Studio4": {
    	roomName: "West Core - Studio 4",
    	floor: 2
    },
    	"Y-Studio5": {
    	roomName: "West Core - Studio 5",
    	floor: "Ground"
    },
    	"UT-AUD1": {
    	roomName: "UTown Auditorium 1",
    	floor: 1,
    	location: {
    		x: 103.77335250377655,
    		y: 1.304010121737994
    	}
    },
    	"UT-AUD2": {
    	roomName: "UTown Auditorium 2",
    	floor: 1,
    	location: {
    		x: 103.7727275490761,
    		y: 1.304382852208324
    	}
    },
    	"UTSRC-GLR": {
    	roomName: "Global Learning Room",
    	floor: 1,
    	location: {
    		x: 103.7731781601906,
    		y: 1.304262184076501
    	}
    },
    	"USP-MML": {
    	roomName: "USP Multimedia Lab",
    	floor: 1,
    	location: {
    		x: 103.77321299859408,
    		y: 1.3065007445741714
    	}
    },
    	"EH-SR1": {
    	roomName: "EH-SR1",
    	floor: 1,
    	location: {
    		x: 103.77461339347067,
    		y: 1.2917351246659363
    	}
    },
    	CEREBRO: CEREBRO,
    	"TP-GLR": {
    	roomName: "Town Plaza Global Learning Room",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR1": {
    	roomName: "Town Plaza Seminar Room 1",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR3": {
    	roomName: "Town Plaza Seminar Room 3",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR4": {
    	roomName: "Town Plaza Seminar Room 4",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR5": {
    	roomName: "Town Plaza Seminar Room 5",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR6": {
    	roomName: "Town Plaza Seminar Room 5",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR7": {
    	roomName: "Town Plaza Seminar Room 7",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"TP-SR8": {
    	roomName: "Town Plaza Seminar Room 8",
    	floor: 2,
    	location: {
    		x: 103.77340883016588,
    		y: 1.3039978035313131
    	}
    },
    	"UTSRC-SR1": {
    	roomName: "Seminar Room 1",
    	floor: 1,
    	location: {
    		x: 103.77282410860063,
    		y: 1.3042731670895074
    	}
    },
    	"UTSRC-SR3": {
    	roomName: "Seminar Room 3",
    	floor: 1,
    	location: {
    		x: 103.77282410860063,
    		y: 1.3042731670895074
    	}
    },
    	"UTSRC-SR4": {
    	roomName: "Seminar Room 4",
    	floor: 1,
    	location: {
    		x: 103.77282410860063,
    		y: 1.3042731670895074
    	}
    },
    	"UTSRC-SR5": {
    	roomName: "Seminar Room 5",
    	floor: 1,
    	location: {
    		x: 103.77282410860063,
    		y: 1.3042731670895074
    	}
    },
    	"UTSRC-SR6": {
    	roomName: "Seminar Room 6",
    	floor: 1,
    	location: {
    		x: 103.77282410860063,
    		y: 1.3042731670895074
    	}
    },
    	"UTSRC-SR9": {
    	roomName: "Seminar Room 9",
    	floor: 2,
    	location: {
    		x: 103.773151,
    		y: 1.3043189
    	}
    },
    	"UTSRC-SR8": {
    	roomName: "Seminar Room 8",
    	floor: 2,
    	location: {
    		x: 103.773151,
    		y: 1.3043189
    	}
    },
    	"ERC-ALR": {
    	roomName: "Active Learning Room",
    	floor: 2,
    	location: {
    		x: 103.7728786,
    		y: 1.3063385
    	}
    },
    	"ERC-SR4": {
    	roomName: "Seminar Room 4",
    	floor: 2,
    	location: {
    		x: 103.7728786,
    		y: 1.3063385
    	}
    },
    	"ERC-SR9CAM": {
    	roomName: "Charted Asset Management Seminar Room ",
    	floor: 2,
    	location: {
    		x: 103.7728749,
    		y: 1.3062172
    	}
    },
    	"UTSRC-LT50": {
    	roomName: "Lecture Theater 50",
    	floor: 1,
    	location: {
    		x: 103.77278119325639,
    		y: 1.3041793140944875
    	}
    },
    	"UTSRC-LT53": {
    	roomName: "Lecture Theater 53",
    	floor: 2,
    	location: {
    		x: 103.77297163009645,
    		y: 1.3041498174381898
    	}
    },
    	"ERC-SR8": {
    	roomName: "Seminar Room 8",
    	floor: 2,
    	location: {
    		x: 103.7728786,
    		y: 1.3063385
    	}
    },
    	"ERC-SR10": {
    	roomName: "Seminar Room 10",
    	floor: 2,
    	location: {
    		x: 103.7727329,
    		y: 1.3057714
    	}
    },
    	"YI-PAR-TYO": {
    	roomName: "Paris Tokyo Room",
    	floor: 3,
    	location: {
    		x: 103.77488308492505,
    		y: 1.2985444911529218
    	}
    },
    	"EA-04-07": {
    	roomName: "Control & Mechanics Teaching Lab",
    	floor: 4,
    	location: {
    		x: 103.77043694257739,
    		y: 1.300150916814686
    	}
    },
    	"EA-04-06": {
    	roomName: "Control & Mechanics Teaching Lab",
    	floor: 4,
    	location: {
    		x: 103.77039939165117,
    		y: 1.300059745184751
    	}
    },
    	"EA-04-04": {
    	roomName: "Control & Mechanics Teaching Lab 1",
    	floor: 4,
    	location: {
    		x: 103.77038061618806,
    		y: 1.2999068986213047
    	}
    },
    	"E4-04-02": {
    	roomName: "E4-04-02",
    	floor: 4,
    	location: {
    		x: 103.77181637117397,
    		y: 1.2987141586739923
    	}
    },
    	"AS3-0610": {
    	roomName: "Tutorial Room 1",
    	floor: 6,
    	location: {
    		x: 103.77154469490053,
    		y: 1.2948066448369964
    	}
    },
    	"AS3-0611": {
    	roomName: "Tutorial Room 2",
    	floor: 6,
    	location: {
    		x: 103.77155005931856,
    		y: 1.2947422882567174
    	}
    },
    	"CELC-SR1B": {
    	roomName: "SR1B",
    	floor: 2,
    	location: {
    		x: 103.77143193267294,
    		y: 1.2970703865407238
    	}
    },
    	"AS1-0201": {
    	roomName: "AS1-0201",
    	floor: 2,
    	location: {
    		x: 103.77213443414018,
    		y: 1.2951454107251619
    	}
    },
    	"EW1-01-01": {
    	roomName: "Concrete Technology Lab",
    	floor: 1,
    	location: {
    		x: 103.77059982927568,
    		y: 1.2988274380292781
    	}
    },
    	"EW1-03-02": {
    	roomName: "GEOTECHNICAL Engineering Lab",
    	floor: 3,
    	location: {
    		x: 103.7708524696206,
    		y: 1.2985588481386496
    	}
    },
    	"MD9-01-02": {
    	roomName: "Physiology Lab",
    	floor: 1,
    	location: {
    		x: 103.78134551280169,
    		y: 1.2966962086013787
    	}
    },
    	"MD10-02-01": {
    	roomName: "Anatomy Teaching Museum",
    	floor: 2,
    	location: {
    		x: 103.78172415012327,
    		y: 1.296514508777875
    	}
    },
    	"E1-02-03": {
    	roomName: "Dynamics Lab 2",
    	floor: 2,
    	location: {
    		x: 103.77103038230325,
    		y: 1.298702438473506
    	}
    },
    	"E1-03-01": {
    	roomName: "ESP Multidisciplinary Lab",
    	floor: 3,
    	location: {
    		x: 103.77108113816666,
    		y: 1.29860013623642
    	}
    },
    	"E3A-05-04": {
    	roomName: "Heat Treatment",
    	floor: 5,
    	location: {
    		x: 103.77121465020501,
    		y: 1.3004357792527184
    	}
    },
    	"E4-07-08": {
    	roomName: "Staff ROOM1",
    	floor: 7,
    	location: {
    		x: 103.77179762078876,
    		y: 1.298644862043683
    	}
    },
    	"MD1-05-03K": {
    	roomName: "Seminar Room 4",
    	floor: 5,
    	location: {
    		x: 103.78048012617927,
    		y: 1.2952805409717725
    	}
    },
    	"MD1-08-01A": {
    	roomName: "Computer Lab 1",
    	floor: 8,
    	location: {
    		x: 103.78055915336888,
    		y: 1.2954814634702438
    	}
    },
    	"MD1-10-01A": {
    	roomName: "Conference Room 2",
    	floor: 10,
    	location: {
    		x: 103.78041258914575,
    		y: 1.2955764204697735
    	}
    },
    	"BIZ2-0422": {
    	roomName: "Seminar Room 4-22",
    	floor: 4,
    	location: {
    		x: 103.77486423822306,
    		y: 1.2934012209405132
    	}
    },
    	"AS4-0519": {
    	roomName: "Dept Meeting Room",
    	floor: 5,
    	location: {
    		x: 103.77214966390184,
    		y: 1.2946837531651085
    	}
    },
    	"S16-0302": {
    	roomName: "Reading Hall",
    	floor: 3,
    	location: {
    		x: 103.78062566185325,
    		y: 1.2967792133731033
    	}
    },
    	"RVR-SRM01": {
    	roomName: "Seminar room 1",
    	floor: 1,
    	location: {
    		x: 103.77682412831622,
    		y: 1.29736535383388
    	}
    },
    	"AS6-0212": {
    	roomName: "Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77316343106568,
    		y: 1.2955665885672616
    	}
    },
    	MD4_LAB9: MD4_LAB9,
    	"CAPT-SR5": {
    	roomName: "Seminar Room 5",
    	floor: 1,
    	location: {
    		x: 103.77318935135669,
    		y: 1.30782701977229
    	}
    },
    	"CAPT-SR4": {
    	roomName: "Seminar Room 4",
    	floor: 1,
    	location: {
    		x: 103.77346605635373,
    		y: 1.307735312249234
    	}
    },
    	"CAPT-SR3": {
    	roomName: "Seminar Room 3",
    	floor: 1,
    	location: {
    		x: 103.77344694870638,
    		y: 1.3077358486658872
    	}
    },
    	"CAPT-SR1-2": {
    	roomName: "Seminar Room 1 & 2",
    	floor: 1,
    	location: {
    		x: 103.77290429366835,
    		y: 1.3073191457445208
    	}
    },
    	"TC-SR3": {
    	roomName: "Seminar Room 3",
    	floor: 1,
    	location: {
    		x: 103.7735061935529,
    		y: 1.3058646900451434
    	}
    },
    	"RVR-SRM03": {
    	roomName: "Seminar Room 3",
    	floor: 1,
    	location: {
    		x: 103.77678093383261,
    		y: 1.2974598197265705
    	}
    },
    	"YSTCM-ER3": {
    	roomName: "Ensemble Room 3",
    	floor: 3,
    	location: {
    		x: 103.7721522152424,
    		y: 1.3023290630565256
    	}
    },
    	"YSTCM-ER2": {
    	roomName: "Ensemble Room 2",
    	floor: 3,
    	location: {
    		x: 103.77247569384055,
    		y: 1.3024826427002318
    	}
    },
    	"TC-SR5": {
    	roomName: "Seminar Room 5",
    	floor: 1,
    	location: {
    		x: 103.77340611266035,
    		y: 1.3058455617651048
    	}
    },
    	"TC-SR6": {
    	roomName: "Seminar Room 6",
    	floor: 1,
    	location: {
    		x: 103.77349088189862,
    		y: 1.3058723772982943
    	}
    },
    	MD7_LAB8: MD7_LAB8,
    	"ERC-SR5": {
    	roomName: "Seminar Room 5",
    	floor: 2,
    	location: {
    		x: 103.77291262149812,
    		y: 1.3062781790917393
    	}
    },
    	"AS2-ELAB": {
    	roomName: "Earth Lab",
    	floor: 2,
    	location: {
    		x: 103.77095729112628,
    		y: 1.2952598223768155
    	}
    },
    	"CELC-SR1A": {
    	roomName: "CELC-SR1A",
    	floor: 1,
    	location: {
    		x: 103.77141508957457,
    		y: 1.2969542578046174
    	}
    },
    	"E3-0605-06": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77156078815462,
    		y: 1.2995985239475776
    	}
    },
    	"E3-0603-04": {
    	roomName: "Tutorial Room",
    	floor: 6,
    	location: {
    		x: 103.77160638570787,
    		y: 1.2994984664852203
    	}
    },
    	SPSWETLAB: SPSWETLAB,
    	"BIZ2-0413B": {
    	roomName: "Seminar Room 04-13B",
    	floor: 4,
    	location: {
    		x: 103.77504911418305,
    		y: 1.2933189348382488
    	}
    },
    	"BIZ2-0413A": {
    	roomName: "Seminar Room 04-13A",
    	floor: 4,
    	location: {
    		x: 103.77531319856645,
    		y: 1.293255759734801
    	}
    },
    	"TH-SR1": {
    	roomName: "Temasek Hall Office, Seminar Room",
    	floor: 2,
    	location: {
    		x: 103.77129374071957,
    		y: 1.2927169615398948
    	}
    },
    	"PGPH-FR4": {
    	roomName: "Function Room 4",
    	floor: -1,
    	location: {
    		x: 103.78055155277254,
    		y: 1.290896141645534
    	}
    },
    	"S12-0402A": {
    	roomName: "Level 1000 Physics Lab",
    	floor: 4,
    	location: {
    		x: 103.77876788377763,
    		y: 1.2969470029855712
    	}
    },
    	"S12-0402B": {
    	roomName: "Level 1000 Physics Lab",
    	floor: 4,
    	location: {
    		x: 103.77875983715059,
    		y: 1.2969389584199256
    	}
    },
    	"S12-0402C": {
    	roomName: "Level 1000 Physics Lab",
    	floor: 4,
    	location: {
    		x: 103.77877861261369,
    		y: 1.2969470029855712
    	}
    },
    	"S12-0402D": {
    	roomName: "Level 1000 Physics Lab",
    	floor: 4,
    	location: {
    		x: 103.77879202365877,
    		y: 1.2969362768980521
    	}
    },
    	"S1A-03LAB1": {
    	roomName: "Life Sciences Laboratory 1",
    	floor: 3,
    	location: {
    		x: 103.7782827,
    		y: 1.2959638
    	}
    },
    	"S1A-03LAB2": {
    	roomName: "S1A-03LAB2",
    	floor: 3,
    	location: {
    		x: 103.7784543,
    		y: 1.2959319
    	}
    },
    	"S1A-04LAB3": {
    	roomName: "S1A-04LAB3",
    	floor: 4,
    	location: {
    		x: 103.7783194,
    		y: 1.2959363
    	}
    },
    	"S2-03LAB7": {
    	roomName: "S2-03LAB7",
    	floor: 3,
    	location: {
    		x: 103.7781376,
    		y: 1.2956254
    	}
    },
    	"S16-03-0506": {
    	roomName: "S16-03-0506",
    	floor: 3,
    	location: {
    		x: 103.7803574,
    		y: 1.2967088
    	}
    },
    	"EA-04-21": {
    	roomName: "EA-04-21",
    	floor: 4,
    	location: {
    		x: 103.77052545547487,
    		y: 1.3001422018796116
    	}
    },
    	"AS6-0211": {
    	roomName: "as6-0211",
    	floor: 2,
    	location: {
    		x: 103.77317523145778,
    		y: 1.295558493014907
    	}
    },
    	"UTSRC-PR1": {
    	roomName: "UTown, SRC, Practice Room 1",
    	floor: 3,
    	location: {
    		x: 103.77260953187944,
    		y: 1.3042476033435082
    	}
    },
    	"USP-TR2": {
    	roomName: "USP-TR2",
    	floor: 2,
    	location: {
    		x: 103.7731593,
    		y: 1.3065424
    	}
    },
    	"RVR-SRM04": {
    	roomName: "RVRC Seminar Room 4",
    	floor: 1,
    	location: {
    		x: 103.77671974289942,
    		y: 1.2974919216751664
    	}
    },
    	"SDE2-ES1": {
    	roomName: "E-Studio 1",
    	floor: 3,
    	location: {
    		x: 103.77113163471223,
    		y: 1.2972089318821012
    	}
    },
    	"WT-Lab": {
    	roomName: "SDE2-02-10 (Wind Tunnel Unit)",
    	floor: 2,
    	location: {
    		x: 103.77111796176165,
    		y: 1.297212239020798
    	}
    },
    	"KEVII-MR2": {
    	roomName: "KEVII-MR2",
    	floor: 1,
    	location: {
    		x: 103.78084659576416,
    		y: 1.2922060118957746
    	}
    },
    	"SDE4-EXR1-2": {
    	roomName: "SDE4-EXR1-2",
    	floor: 4,
    	location: {
    		x: 103.77050131559373,
    		y: 1.2966676219094895
    	}
    },
    	"SDE2-MEZZ": {
    	roomName: "SDE2-MEZZ",
    	floor: -1,
    	location: {
    		x: 103.77113163471223,
    		y: 1.297163703463061
    	}
    },
    	"YSTCM-SR4": {
    	roomName: "YSTCM Seminar Room 4",
    	floor: 1,
    	location: {
    		x: 103.77294212579729,
    		y: 1.3022612709751085
    	}
    },
    	"S5-01GEN": {
    	roomName: "Chemistry General Teaching Lab",
    	floor: 1,
    	location: {
    		x: 103.77986222505571,
    		y: 1.29553333777584
    	}
    },
    	"E2-0306PC3": {
    	roomName: "PC3",
    	floor: 3,
    	location: {
    		x: 103.7711423635483,
    		y: 1.2993598687394592
    	}
    },
    	"AS1-0205": {
    	roomName: "AS1-0205",
    	floor: 2,
    	location: {
    		x: 103.77212060584722,
    		y: 1.2951284277138495
    	}
    },
    	"S5-01PHYS": {
    	roomName: "S5-01PHYS",
    	floor: 1,
    	location: {
    		x: 103.77974152565004,
    		y: 1.2955447342501536
    	}
    },
    	"AS3-0620": {
    	roomName: "AS3-0620",
    	floor: 6,
    	location: {
    		x: 103.77162247896197,
    		y: 1.294868319891547
    	}
    },
    	"RH-CONF-RM": {
    	roomName: "Conference Room",
    	floor: 3,
    	location: {
    		x: 103.77391813424904,
    		y: 1.2997500633015104
    	}
    },
    	"GBT-Lab": {
    	roomName: "Green Building Technologies Lab",
    	floor: 2,
    	location: {
    		x: 103.7705455,
    		y: 1.2968031
    	}
    },
    	"LAW_SR4-1": {
    	roomName: "Seminar Room 4-1",
    	floor: 4,
    	location: {
    		x: 103.81666213274005,
    		y: 1.3186904481919393
    	}
    },
    	"SDE4-EXR-2": {
    	roomName: "Executive Room 2",
    	floor: 4,
    	location: {
    		x: 103.770466,
    		y: 1.296882
    	}
    },
    	"AS6-0210": {
    	roomName: "AS6-0210",
    	floor: 2,
    	location: {
    		x: 103.773337,
    		y: 1.2953469
    	}
    },
    	"SDE2-ES2": {
    	roomName: "E-Studio 2",
    	floor: 3,
    	location: {
    		x: 103.77117455005647,
    		y: 1.2973258458294765
    	}
    },
    	"RC4-SR3": {
    	roomName: "RC4 Seminar Room 3",
    	floor: -1,
    	location: {
    		x: 103.77284167916517,
    		y: 1.3082311674829945
    	}
    },
    	"RC4-SR1-2": {
    	roomName: "RC4 Seminar Room 1 & 2",
    	floor: -1,
    	location: {
    		x: 103.7728826457169,
    		y: 1.3082432342773747
    	}
    },
    	"RC4-SR4": {
    	roomName: "RC4 Seminar Room 4",
    	floor: 1,
    	location: {
    		x: 103.77295017242433,
    		y: 1.3082311151097674
    	}
    },
    	"RC4-SR5": {
    	roomName: "RC4 Seminar Room 5",
    	floor: 1,
    	location: {
    		x: 103.77286702394487,
    		y: 1.308241841149222
    	}
    },
    	"LAW_CR3-4": {
    	roomName: "Classroom 3-4",
    	floor: 1,
    	location: {
    		x: 103.81707519292833,
    		y: 1.319114490585766
    	}
    },
    	"LAW_CR4-2": {
    	roomName: "Classroom 4-2",
    	floor: 4,
    	location: {
    		x: 103.81670504808427,
    		y: 1.3187687563308481
    	}
    },
    	"SDE4-GISL1": {
    	roomName: "GIS Lab",
    	floor: 2,
    	location: {
    		x: 103.77018758666345,
    		y: 1.2968615853665866
    	}
    },
    	"SDE-EXR-2": {
    	roomName: "SDE4 Executive Room 2",
    	floor: 4,
    	location: {
    		x: 103.77033949101288,
    		y: 1.2968782704103055
    	}
    },
    	"USP-SR3": {
    	roomName: "Seminar Room 3",
    	floor: 2,
    	location: {
    		x: 103.77306148409846,
    		y: 1.3068129730754225
    	}
    },
    	"E4-02-06": {
    	roomName: "E4-02-06",
    	floor: 2,
    	location: {
    		x: 103.77178341150285,
    		y: 1.2986859693257289
    	}
    },
    	"RVR-SRM02": {
    	roomName: "Seminar Rooms",
    	floor: 1,
    	location: {
    		x: 103.77677393571237,
    		y: 1.29739163213823
    	}
    },
    	"EW1-02-03": {
    	roomName: "Hydraulics Lab",
    	floor: 2,
    	location: {
    		x: 103.77070488748149,
    		y: 1.2986439029798538
    	}
    },
    	"AS6-0215B": {
    	roomName: "AS6-0215B",
    	floor: 2,
    	location: {
    		x: 103.77296760678293,
    		y: 1.2958468141238033
    	}
    },
    	"SH-SR1": {
    	roomName: "SH-SR1",
    	floor: 2,
    	location: {
    		x: 103.77542841044601,
    		y: 1.2913909617585373
    	}
    },
    	"S6-04-08": {
    	roomName: "Science Library",
    	floor: 4,
    	location: {
    		x: 103.78010094165803,
    		y: 1.295166639427762
    	}
    },
    	"AS3-0312": {
    	roomName: "0314",
    	floor: 3,
    	location: {
    		x: 103.77141864426275,
    		y: 1.2947474162756536
    	}
    },
    	"ERC-SR11": {
    	roomName: "ERC-SR11",
    	floor: 3,
    	location: {
    		x: 103.77291262149812,
    		y: 1.305924051894182
    	}
    },
    	"S11-0302A": {
    	roomName: "0302A",
    	floor: 3,
    	location: {
    		x: 103.77877458930018,
    		y: 1.2966448289709127
    	}
    },
    	"USP-TR1": {
    	roomName: "USP-TR1",
    	floor: 1,
    	location: {
    		x: 103.77314838535167,
    		y: 1.306576128579399
    	}
    },
    	"RVR-MPR01": {
    	roomName: "Multi Purpose Room 1",
    	floor: 1,
    	location: {
    		x: 103.77687692642213,
    		y: 1.2973480580696695
    	}
    },
    	"RVR-MPR02": {
    	roomName: "Multi Purpose Room 2",
    	floor: 1,
    	location: {
    		x: 103.77674013376237,
    		y: 1.2974311852333447
    	}
    },
    	"YSTCM-MLAB": {
    	roomName: "Music Tech and Keyboard Lab",
    	floor: 2,
    	location: {
    		x: 103.77272941774719,
    		y: 1.3023654031322103
    	}
    },
    	"E2-0309PC6": {
    	roomName: "E2-0306PC6",
    	floor: 3,
    	location: {
    		x: 103.77116650342943,
    		y: 1.299378639374635
    	}
    },
    	CFG_CARSPA: CFG_CARSPA,
    	"AS3-0314": {
    	roomName: "AS3-0314",
    	floor: 3,
    	location: {
    		x: 103.77111034010251,
    		y: 1.2947020653932226
    	}
    },
    	"YSTCM-SR3": {
    	roomName: "Seminar Room 3",
    	floor: 1,
    	location: {
    		x: 103.7725628,
    		y: 1.3025707
    	}
    },
    	"AS7-0201A": {
    	roomName: "Room 1",
    	floor: 2,
    	location: {
    		x: 103.77105252409778,
    		y: 1.29427033995146
    	}
    },
    	"AS4-0513": {
    	roomName: "AS3-0513",
    	floor: 5,
    	location: {
    		x: 103.77196827769893,
    		y: 1.2945733522257314
    	}
    },
    	"E5-04-1617": {
    	roomName: "E5-04-1617",
    	floor: 4,
    	location: {
    		x: 103.77254515886308,
    		y: 1.297952070704839
    	}
    },
    	"LAW_CR3-5": {
    	roomName: "LAW CR3-5",
    	floor: 3,
    	location: {
    		x: 103.81700009107591,
    		y: 1.3189643800229218
    	}
    },
    	"LAW_SR5-4": {
    	roomName: "SR 5 - 4",
    	floor: 5,
    	location: {
    		x: 103.81657764315605,
    		y: 1.3186839958358212
    	}
    },
    	Frontier: Frontier,
    	"S8-0402": {
    	roomName: "S8-0402",
    	floor: 4,
    	location: {
    		x: 103.77937403740883,
    		y: 1.296072323916885
    	}
    },
    	"TP-SR2": {
    	roomName: "TP-SR2",
    	floor: 2,
    	location: {
    		x: 103.77355339315676,
    		y: 1.3038567726300767
    	}
    },
    	"LAW_CR2-1": {
    	roomName: "CR 2-1",
    	floor: 2,
    	location: {
    		x: 103.81667928422443,
    		y: 1.3187050325808396
    	}
    },
    	"LAW_CR2-2": {
    	roomName: "CR2-2",
    	floor: 2,
    	location: {
    		x: 103.81671683479652,
    		y: 1.3187506180542539
    	}
    },
    	"BIZ1-0504": {
    	roomName: "Biz1",
    	floor: 1,
    	location: {
    		x: 103.77365827560426,
    		y: 1.2933264430775053
    	}
    },
    	"UT22-07-02": {
    	roomName: "CREATE SDE studio",
    	floor: 7,
    	location: {
    		x: 103.77355133186032,
    		y: 1.3037287973496303
    	}
    },
    	"Y-ELMCL": {
    	roomName: "Elm College Lounge",
    	floor: 2,
    	location: {
    		x: 103.77203718409874,
    		y: 1.3065375734614046
    	}
    },
    	"CQT/SR0315": {
    	roomName: "CQT Seminar Room",
    	floor: 3,
    	location: {
    		x: 103.78033697605133,
    		y: 1.2971461059771843
    	}
    },
    	"E-Hybrid_B": {
    	roomName: "Hy-brid_B",
    	floor: 1,
    	location: {
    		x: 103.77277314662935,
    		y: 1.2974336432673221
    	}
    },
    	"HSS-317": {
    	roomName: "HSS-317",
    	floor: 3,
    	location: {
    		x: 103.77431601454474,
    		y: 1.2932838742247788
    	}
    },
    	Interaction: Interaction,
    	"SDE2-ER1": {
    	roomName: "Executive Room 1",
    	floor: 3,
    	location: {
    		x: 103.7710244,
    		y: 1.2971383
    	}
    },
    	"SDE4-GIS1-2": {
    	roomName: "GIS Lab",
    	floor: 2,
    	location: {
    		x: 103.77035648909613,
    		y: 1.2967945473983356
    	}
    },
    	"SDE1-SR5-6": {
    	roomName: "Seminar Room 5",
    	floor: 1,
    	location: {
    		x: 103.7706401792259,
    		y: 1.2973688336414937
    	}
    },
    	"SDE4-EXR-1": {
    	roomName: "SDE4-EXR-1",
    	floor: 4,
    	location: {
    		x: 103.77057641744615,
    		y: 1.296705163219649
    	}
    },
    	"UTSRC-DS": {
    	roomName: "Dance Studio",
    	floor: 1,
    	location: {
    		x: 103.7723162662604,
    		y: 1.3045044142814384
    	}
    },
    	"YSTCM-RS": {
    	roomName: "Recording Studio",
    	floor: 1,
    	location: {
    		x: 103.77294451463969,
    		y: 1.3021768032122787
    	}
    },
    	"SDE2_ER4-5": {
    	roomName: "Executive Room 4, 5",
    	floor: 3,
    	location: {
    		x: 103.7710287,
    		y: 1.2971755
    	}
    },
    	"SDE1-CL2": {
    	roomName: "Computer Lab 2",
    	floor: 4,
    	location: {
    		x: 103.77074539661409,
    		y: 1.2974390622023457
    	}
    },
    	"SDE1-CL3": {
    	roomName: "Computer Lab 3",
    	floor: 5,
    	location: {
    		x: 103.77063805848886,
    		y: 1.2973165688964943
    	}
    },
    	"MD3-03-01A": {
    	roomName: "MD3",
    	floor: 1,
    	location: {
    		x: 103.78116577863695,
    		y: 1.2953536757033381
    	}
    },
    	"E1-06-0102": {
    	roomName: "E1-06-0102",
    	floor: 6,
    	location: {
    		x: 103.77118533964124,
    		y: 1.298485693290246
    	}
    },
    	"E1-06-0304": {
    	roomName: "E1-06-0304",
    	floor: 6,
    	location: {
    		x: 103.77114811483986,
    		y: 1.2985393236945988
    	}
    },
    	"MD6-03-01E": {
    	roomName: "03-01-E",
    	floor: 3,
    	location: {
    		x: 103.78181883104845,
    		y: 1.2953454016711934
    	}
    }
    };

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (131:2) {#if loading}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "dual_ring.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1byev8n");
    			add_location(img, file, 131, 4, 4219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(131:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (135:2) {#each venue_slot as venue}
    function create_each_block(ctx) {
    	let button;
    	let t0_value = /*venue*/ ctx[20] + "";
    	let t0;
    	let t1;
    	let button_id_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*venue*/ ctx[20]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "VenueButton svelte-1byev8n");
    			attr_dev(button, "id", button_id_value = /*venue*/ ctx[20]);
    			attr_dev(button, "contenteditable", "false");
    			add_location(button, file, 135, 4, 4301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*venue_slot*/ 16 && t0_value !== (t0_value = /*venue*/ ctx[20] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*venue_slot*/ 16 && button_id_value !== (button_id_value = /*venue*/ ctx[20])) {
    				attr_dev(button, "id", button_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(135:2) {#each venue_slot as venue}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let topbackground;
    	let t0;
    	let dynamictextfield;
    	let t1;
    	let h3;
    	let strong0;
    	let t3;
    	let form;
    	let label0;
    	let strong1;
    	let t5;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t10;
    	let label1;
    	let strong2;
    	let t12;
    	let input0;
    	let t13;
    	let label2;
    	let strong3;
    	let t15;
    	let input1;
    	let t16;
    	let label3;
    	let strong4;
    	let t18;
    	let input2;
    	let t19;
    	let label4;
    	let strong5;
    	let t21;
    	let input3;
    	let t22;
    	let section;
    	let button;
    	let t24;
    	let div;
    	let t25;
    	let current;
    	let mounted;
    	let dispose;
    	topbackground = new BackgroundTop({ $$inline: true });
    	dynamictextfield = new DynamicTextField({ $$inline: true });
    	let if_block = /*loading*/ ctx[6] && create_if_block(ctx);
    	let each_value = /*venue_slot*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(topbackground.$$.fragment);
    			t0 = space();
    			create_component(dynamictextfield.$$.fragment);
    			t1 = space();
    			h3 = element("h3");
    			strong0 = element("strong");
    			strong0.textContent = "Venue Section";
    			t3 = space();
    			form = element("form");
    			label0 = element("label");
    			strong1 = element("strong");
    			strong1.textContent = "Semester";
    			t5 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Semester 1";
    			option1 = element("option");
    			option1.textContent = "Semester 2";
    			option2 = element("option");
    			option2.textContent = "Special Term 1";
    			option3 = element("option");
    			option3.textContent = "Special Term 2";
    			t10 = space();
    			label1 = element("label");
    			strong2 = element("strong");
    			strong2.textContent = "Day";
    			t12 = space();
    			input0 = element("input");
    			t13 = space();
    			label2 = element("label");
    			strong3 = element("strong");
    			strong3.textContent = "Week";
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			label3 = element("label");
    			strong4 = element("strong");
    			strong4.textContent = "Start Time";
    			t18 = space();
    			input2 = element("input");
    			t19 = space();
    			label4 = element("label");
    			strong5 = element("strong");
    			strong5.textContent = "End Time";
    			t21 = space();
    			input3 = element("input");
    			t22 = space();
    			section = element("section");
    			button = element("button");
    			button.textContent = "Find Venue";
    			t24 = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			t25 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(main, "class", "svelte-1byev8n");
    			add_location(main, file, 93, 0, 2892);
    			add_location(strong0, file, 100, 4, 3016);
    			attr_dev(h3, "class", "svelte-1byev8n");
    			add_location(h3, file, 100, 0, 3012);
    			add_location(strong1, file, 103, 9, 3149);
    			add_location(label0, file, 103, 2, 3142);
    			option0.__value = "Semester 1";
    			option0.value = option0.__value;
    			add_location(option0, file, 105, 4, 3232);
    			option1.__value = "Semester 2";
    			option1.value = option1.__value;
    			add_location(option1, file, 106, 4, 3265);
    			option2.__value = "Special Term 1";
    			option2.value = option2.__value;
    			add_location(option2, file, 107, 4, 3298);
    			option3.__value = "Special Term 2";
    			option3.value = option3.__value;
    			add_location(option3, file, 108, 4, 3335);
    			if (/*selected_sem_venue*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[9].call(select));
    			add_location(select, file, 104, 2, 3186);
    			add_location(strong2, file, 111, 9, 3450);
    			add_location(label1, file, 111, 2, 3443);
    			attr_dev(input0, "placeholder", "Monday");
    			attr_dev(input0, "class", "svelte-1byev8n");
    			add_location(input0, file, 112, 2, 3482);
    			add_location(strong3, file, 114, 9, 3600);
    			add_location(label2, file, 114, 2, 3593);
    			attr_dev(input1, "placeholder", "Week 1");
    			attr_dev(input1, "class", "svelte-1byev8n");
    			add_location(input1, file, 115, 2, 3633);
    			add_location(strong4, file, 117, 9, 3752);
    			add_location(label3, file, 117, 2, 3745);
    			attr_dev(input2, "placeholder", "0800");
    			attr_dev(input2, "class", "svelte-1byev8n");
    			add_location(input2, file, 118, 2, 3791);
    			add_location(strong5, file, 120, 9, 3913);
    			add_location(label4, file, 120, 2, 3906);
    			attr_dev(input3, "placeholder", "2359");
    			attr_dev(input3, "class", "svelte-1byev8n");
    			add_location(input3, file, 121, 2, 3950);
    			attr_dev(form, "class", "venue_form svelte-1byev8n");
    			add_location(form, file, 101, 0, 3053);
    			attr_dev(button, "class", "svelte-1byev8n");
    			add_location(button, file, 125, 2, 4025);
    			attr_dev(section, "class", "svelte-1byev8n");
    			add_location(section, file, 124, 0, 4012);
    			attr_dev(div, "class", "VenueDiv");
    			add_location(div, file, 129, 0, 4174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(topbackground, main, null);
    			append_dev(main, t0);
    			mount_component(dynamictextfield, main, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, strong0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(label0, strong1);
    			append_dev(form, t5);
    			append_dev(form, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*selected_sem_venue*/ ctx[5]);
    			append_dev(form, t10);
    			append_dev(form, label1);
    			append_dev(label1, strong2);
    			append_dev(form, t12);
    			append_dev(form, input0);
    			set_input_value(input0, /*day*/ ctx[0]);
    			append_dev(form, t13);
    			append_dev(form, label2);
    			append_dev(label2, strong3);
    			append_dev(form, t15);
    			append_dev(form, input1);
    			set_input_value(input1, /*week*/ ctx[1]);
    			append_dev(form, t16);
    			append_dev(form, label3);
    			append_dev(label3, strong4);
    			append_dev(form, t18);
    			append_dev(form, input2);
    			set_input_value(input2, /*startTime*/ ctx[2]);
    			append_dev(form, t19);
    			append_dev(form, label4);
    			append_dev(label4, strong5);
    			append_dev(form, t21);
    			append_dev(form, input3);
    			set_input_value(input3, /*endTime*/ ctx[3]);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, button);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t25);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[9]),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[12]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[13]),
    					listen_dev(button, "click", /*getVenue*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected_sem_venue*/ 32) {
    				select_option(select, /*selected_sem_venue*/ ctx[5]);
    			}

    			if (dirty & /*day*/ 1 && input0.value !== /*day*/ ctx[0]) {
    				set_input_value(input0, /*day*/ ctx[0]);
    			}

    			if (dirty & /*week*/ 2 && input1.value !== /*week*/ ctx[1]) {
    				set_input_value(input1, /*week*/ ctx[1]);
    			}

    			if (dirty & /*startTime*/ 4 && input2.value !== /*startTime*/ ctx[2]) {
    				set_input_value(input2, /*startTime*/ ctx[2]);
    			}

    			if (dirty & /*endTime*/ 8 && input3.value !== /*endTime*/ ctx[3]) {
    				set_input_value(input3, /*endTime*/ ctx[3]);
    			}

    			if (/*loading*/ ctx[6]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t25);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*venue_slot, getMap*/ 144) {
    				each_value = /*venue_slot*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbackground.$$.fragment, local);
    			transition_in(dynamictextfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbackground.$$.fragment, local);
    			transition_out(dynamictextfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(topbackground);
    			destroy_component(dynamictextfield);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(section);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURL = "http://localhost:3000";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let day;
    	let week;
    	let startTime;
    	let endTime;
    	let venue_slot = [];
    	var buttons = "";
    	let map_center = { lat: 1.297, lng: 103.776 };
    	var selected_sem_venue;
    	var loading = false;

    	// let venuedata = require(VenueInfo);
    	let long = "1.2966";

    	let lat = "103.7764";
    	let url = "";

    	// let url = "http://maps.google.com/maps?q=1.2966,103.7764"; // Default Map location.
    	//This function does an API call for the Google Map
    	//Add
    	async function getMap({ venue }) {
    		alert("Close this pop up to view " + venue + "'s location.");

    		//reset the values before search
    		// console.log(VenueInfo.);
    		url = "";

    		long = "1.2966";
    		lat = "103.7764";
    		long = VenueInfo[venue].location.y;
    		lat = VenueInfo[venue].location.x;

    		//Find Json File and , modify and extract out venue data
    		url = "http://maps.google.com/maps?q=" + long + "," + lat;

    		window.open(url);
    	}

    	// This function does an API call for venue
    	async function getVenue() {
    		$$invalidate(6, loading = true);
    		$$invalidate(4, venue_slot = []);

    		const response = await fetch(apiURL, {
    			method: "post",
    			headers: {
    				Accept: "application/json",
    				"Content-Type": "application/json"
    			},
    			body: JSON.stringify({
    				type: "venue",
    				semester: selected_sem_venue,
    				req_week: week
    			})
    		});

    		var data = await response.json();
    		buttons = "";

    		for (let i = 0; i < data["result"].length; i += 1) {
    			for (let j = 0; j < data["result"][i]["Availability Timeslot"].length; j += 1) {
    				if (data["result"][i]["Availability Timeslot"][0][0] <= startTime && data["result"][i]["Availability Timeslot"][0][1] >= endTime && data["result"][i]["Day"] == day) {
    					if (!venue_slot.includes(data["result"][i]["Venue"])) {
    						venue_slot.push(data["result"][i]["Venue"]);
    						$$invalidate(4, venue_slot = [...venue_slot]);
    					}
    				} // console.log(data['result'][i]['Day']  + "		" + data['result'][i]['Venue'] + "	" + data['result'][i]['Availability Timeslot'][0][0] + "-" + data['result'][i]['Availability Timeslot'][0][1]);
    			}
    		}

    		for (let i = 0; i < venue_slot.length; i += 1) {
    			buttons += "<button class='VenueButton' id = '" + venue_slot[i] + "'>" + venue_slot[i] + "</button>";
    		} // buttons += "<button class='VenueButton' id = '{ venue_slot[i]} '>" + venue_slot[i] + "</button>";

    		$$invalidate(6, loading = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected_sem_venue = select_value(this);
    		$$invalidate(5, selected_sem_venue);
    	}

    	function input0_input_handler() {
    		day = this.value;
    		$$invalidate(0, day);
    	}

    	function input1_input_handler() {
    		week = this.value;
    		$$invalidate(1, week);
    	}

    	function input2_input_handler() {
    		startTime = this.value;
    		$$invalidate(2, startTime);
    	}

    	function input3_input_handler() {
    		endTime = this.value;
    		$$invalidate(3, endTime);
    	}

    	const click_handler = venue => getMap({ venue });

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		TopBackground: BackgroundTop,
    		DynamicTextField,
    		VenueInfo,
    		day,
    		week,
    		startTime,
    		endTime,
    		venue_slot,
    		buttons,
    		map_center,
    		selected_sem_venue,
    		loading,
    		apiURL,
    		long,
    		lat,
    		url,
    		getMap,
    		getVenue
    	});

    	$$self.$inject_state = $$props => {
    		if ('day' in $$props) $$invalidate(0, day = $$props.day);
    		if ('week' in $$props) $$invalidate(1, week = $$props.week);
    		if ('startTime' in $$props) $$invalidate(2, startTime = $$props.startTime);
    		if ('endTime' in $$props) $$invalidate(3, endTime = $$props.endTime);
    		if ('venue_slot' in $$props) $$invalidate(4, venue_slot = $$props.venue_slot);
    		if ('buttons' in $$props) buttons = $$props.buttons;
    		if ('map_center' in $$props) map_center = $$props.map_center;
    		if ('selected_sem_venue' in $$props) $$invalidate(5, selected_sem_venue = $$props.selected_sem_venue);
    		if ('loading' in $$props) $$invalidate(6, loading = $$props.loading);
    		if ('long' in $$props) long = $$props.long;
    		if ('lat' in $$props) lat = $$props.lat;
    		if ('url' in $$props) url = $$props.url;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		day,
    		week,
    		startTime,
    		endTime,
    		venue_slot,
    		selected_sem_venue,
    		loading,
    		getMap,
    		getVenue,
    		select_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})(Image);
//# sourceMappingURL=bundle.js.map
