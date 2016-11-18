if (!readCookie("IMAGEToken") && typeof as != "undefined" && as.IsAppInsightsDown != true) {
        var appInsights = window.appInsights || function (config) {
        function s(config) { t[config] = function () { var i = arguments; t.queue.push(function () { t[config].apply(t, i) }) } } var t = { config: config }, r = document, f = window, e = "script", o = r.createElement(e), i, u; for (o.src = config.url || "//az416426.vo.msecnd.net/scripts/a/ai.0.js", r.getElementsByTagName(e)[0].parentNode.appendChild(o), t.cookie = r.cookie, t.queue = [], i = ["Event", "Exception", "Metric", "PageView", "Trace"]; i.length;) s("track" + i.pop()); return config.disableExceptionTracking || (i = "onerror", s("_" + i), u = f[i], f[i] = function (config, r, f, e, o) { var s = u && u(config, r, f, e, o); return s !== !0 && t["_" + i](config, r, f, e, o), s }), t
    }({
        instrumentationKey: as.AppInsightsKey
    });

    window.appInsights = appInsights;
    appInsights.trackPageView();
}

// Limit scope pollution from any deprecated API
(function () {

    var matched, browser;

    // Use of jQuery.browser is frowned upon.
    // More details: http://api.jquery.com/jQuery.browser
    // jQuery.uaMatch maintained for back-compat
    jQuery.uaMatch = function (ua) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    };

    matched = jQuery.uaMatch(navigator.userAgent);
    browser = {};

    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
        browser.webkit = true;
    } else if (browser.webkit) {
        browser.safari = true;
    }

    jQuery.browser = browser;
})();

/** vim: et:ts=4:sw=4:sts=4
* @license RequireJS 2.1.15 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
* Available via the MIT or new BSD license.
* see: http://github.com/jrburke/requirejs for details
*/
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.1.15',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        ap = Array.prototype,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
    //PS3 indicates loaded and complete, but need to wait for complete
    //specifically. Sequence is 'loading', 'loaded', execution,
    // then 'complete'. The UA check is unfortunate, but not sure how
    //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
    //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
    * Helper function for iterating over an array. If the func returns
    * a true value, it will break out of the loop.
    */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
    * Helper function for iterating over an array backwards. If the func
    * returns a true value, it will break out of the loop.
    */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
    * Cycles over properties in an object and calls a function for each
    * property value. If the function returns a truthy value, then the
    * iteration is stopped.
    */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
    * Simple function to mix in properties from source into target,
    * but only if target does not already have a property of the same name.
    */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
    * Constructs an error with a pointer to an URL with more information.
    * @param {String} id the error ID that maps to an ID on a web page.
    * @param {String} message human readable error.
    * @param {Error} [err] the original error, if there is one.
    *
    * @returns {Error}
    */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
        //registry of just enabled modules, to speed
        //cycle breaking code when lots of modules
        //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            bundlesMap = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
        * Trims the . and .. from an array of path segments.
        * It will keep a leading path segment if a .. will become
        * the first path segment, to help with module name lookups,
        * which act like paths, but can be remapped. But the end result,
        * all paths that use this function should look normalized.
        * NOTE: this method MODIFIES the input array.
        * @param {Array} ary the array of path segments.
        */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i == 1 && ary[2] === '..') || ary[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
        * Given a relative module name, like ./something, normalize it to
        * a real name that can be mapped to a path.
        * @param {String} name the relative name
        * @param {String} baseName a real name that the name arg is relative
        * to.
        * @param {Boolean} applyMap apply the map config to the value. Should
        * only be done if this normalization is for a dependency ID.
        * @returns {String} normalized name
        */
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex,
                foundMap, foundI, foundStarMap, starI, normalizedBaseParts,
                baseParts = (baseName && baseName.split('/')),
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }

                trimDots(name);
                name = name.join('/');
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(config.pkgs, name);

            return pkgMain ? pkgMain : name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);

                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);

                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
        * Creates a module mapping that includes plugin prefix, module
        * name, and path. If parentModuleMap is provided it will
        * also normalize the name via require.normalize()
        *
        * @param {String} name the module name
        * @param {String} [parentModuleMap] parent module map
        * for the module name, used to resolve relative names.
        * @param {Boolean} isNormalized: is the ID already normalized.
        * This is true if this call is done for a define() module ID.
        * @param {Boolean} applyMap: apply the map config to the ID.
        * Should only be true if this map is for a dependency.
        *
        * @returns {Object}
        */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ?
                                         normalize(name, parentName, applyMap) :
                                         name;
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
        * Internal method to transfer globalQueue items to this context's
        * defQueue.
        */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                //Array splice in the values since the context code has a
                //local var ref to defQueue, so cannot just reassign the one
                //on context.
                apsp.apply(defQueue,
                           [defQueue.length, 0].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return (defined[mod.map.id] = mod.exports);
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
            //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
            this.depMaps = [],
            this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
            * Checks if the module is ready to define itself, and if so,
            * define it.
            */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if ((this.events.error && this.map.isDefine) ||
                                req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        bundleId = getOwn(bundlesMap, this.map.id),
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
        * Given an event from a script node, get the requirejs info from it,
        * and then removes the event listeners on the node.
        * @param {Event} evt
        * @returns {Object}
        */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
            * Set a configuration for the context.
            * @param {Object} cfg config object to integrate.
            */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                //Save off the paths since they require special processing,
                //they are additive.
                var shim = config.shim,
                    objs = {
                        paths: true,
                        bundles: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    } else {
                        config[prop] = value;
                    }
                });

                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;

                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj} : pkgObj;

                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }

                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
                                     .replace(currDirRegExp, '')
                                     .replace(jsSuffixRegExp, '');
                    });
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                    * Converts a module name + .extension into an URL path.
                    * *Requires* the use of a module name. It does not support using
                    * plain URLs like nameToUrl.
                    */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext, true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        removeScript(id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function (args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
            * Called to enable a module if it is still in the registry
            * awaiting enablement. A second arg, parent, the parent module,
            * is passed in for context, when this method is overridden by
            * the optimizer. Not shown here to keep code compact.
            */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
            * Internal method used by environment adapters to complete a load event.
            * A load event could be a script load or just a load pass from a synchronous
            * load call.
            * @param {String} moduleName the name of the module to potentially complete.
            */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
            * Converts a module name to a file path. Supports cases where
            * moduleName may actually be just an URL.
            * Note that it **does not** call normalize on the moduleName,
            * it is assumed to have already been normalized. This is an
            * internal API, not a public one. Use toUrl for the public API.
            */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url,
                    parentPath, bundleId,
                    pkgMain = getOwn(config.pkgs, moduleName);

                if (pkgMain) {
                    moduleName = pkgMain;
                }

                bundleId = getOwn(bundlesMap, moduleName);

                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');

                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/^data\:|\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
            * Executes a module callback function. Broken out as a separate function
            * solely to allow the build system to sequence the files in the built
            * layer in the right sequence.
            *
            * @private
            */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
            * callback for script loads, used to check status of loading.
            *
            * @param {Event} evt the event from the browser for the script
            * that was loaded.
            */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
            * Callback for script errors.
            */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error for: ' + data.id, evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
    * Main entry point.
    *
    * If the only argument to require is a string, then the module that
    * is represented by that string is fetched for the appropriate context.
    *
    * If the first argument is an array, then it will be treated as an array
    * of dependency string names to fetch. An optional function callback can
    * be specified to execute when all of those dependencies are available.
    *
    * Make a local req variable to help Caja compliance (it assumes things
    * on a require that are not standardized), and to give a short
    * name for minification/local scope use.
    */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
    * Support require.config() to make it easier to cooperate with other
    * AMD loaders on globally agreed names.
    */
    req.config = function (config) {
        return req(config);
    };

    /**
    * Execute something after the current tick
    * of the event loop. Override for other envs
    * that have a better solution than setTimeout.
    * @param  {Function} fn function to execute later.
    */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
    * Export require as a global, but only if it does not already exist.
    */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
    * Any errors that require explicitly generates will be passed to this
    * function. Intercept/override it if you want custom error handling.
    * @param {Error} err the error object.
    */
    req.onError = defaultOnError;

    /**
    * Creates the node for the load command. Only used in browser envs.
    */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
                document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
    * Does the request to load a module for the browser case.
    * Make this a separate function to allow other environments
    * to override it.
    *
    * @param {Object} context the require context to find state.
    * @param {String} moduleName the name of the module.
    * @param {Object} url the URL to the module.
    */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
            //Check if node.attachEvent is artificially added by custom script or
            //natively supported by browser
            //read https://github.com/jrburke/requirejs/issues/187
            //if we can NOT find [native code] then it must NOT natively supported.
            //in IE8, node.attachEvent does not have toString()
            //Note the test for "[native code" with no closing brace, see:
            //https://github.com/jrburke/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation that a build has been done so that
                //only one script needs to be loaded anyway. This may need to be
                //reevaluated if other use cases become common.
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one.
                if (!cfg.baseUrl) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/') + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
    * The function that handles definitions of modules. Differs from
    * require() in that a string for the module should be the first argument,
    * and the function to execute after dependencies are loaded should
    * return a value to define the module corresponding to the first argument's
    * name.
    */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };

    define.amd = {
        jQuery: true
    };


    /**
    * Executes the text. Normally just uses eval, but can be modified
    * to use a better, environment-specific call. Only used for transpiling
    * loader plugins, not for plain JS modules.
    * @param {String} text the text to execute/evaluate.
    */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
} (this));

asFrameworkUtils = {};

(
function (utils) {
    utils.SyncPromise = function(data) {
        var self = this;
        self.then = function(action) {
             if (action) {
                action(data);
            }
        };
        self.each = function() {
            return new utils.SyncAllPromise(data);
        };
    };

    utils.SyncAllPromise = function (data) {
        var self = this;
        self.then = function (action) {
            if (action) {
                for (var i in data) {
                    action(data[i]);
                }
            }
        };

        self.each = function () {
            var tempArray = new Array();
            for (var i in data) {
                for (var j in data[i]) {
                    tempArray.push(data[i][j]);
                }
            }
            return new utils.SyncAllPromise(tempArray);
        };
    };
})
(asFrameworkUtils);

function TagUtil(location) {
    var _me = this;
    _me.location = location ? location : window.location;

    this.isPage_BookingConfirm = function() {
        return this.pathStartsWith("//www.alaskaair.com/booking/payment")
            || this.pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment");
    };

    // no spanish version
    this.isPage_EasybizSignupConfirm = function() {
        return this.pathStartsWith("//easybiz.alaskaair.com/Enrollment/WelcomeConfirm");
    };

    this.isPage_MileagePlanSignupConfirm = function() {
        return this.pathStartsWith("//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true")
            || this.pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true");
    };

    this.pathStartsWith = function(url) {
        return _me.isTesting || _me.startsWith(_me.location.href.replace(_me.location.protocol, "").toLowerCase(), url.toLowerCase());
    };

    _me.isPage_Home = function() {
        return _me.isPath('//www.alaskaair.com/') || _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com');
    };

    _me.isPage_Loyalty = function() {
        return ((_me.isPath('//www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx?CurrentForm=UCSignInStart', true)
                || _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/myalaskaair.aspx?CurrentForm=UCSignInStart', true))
        //needed because the landing page has the same URL as the sign in page, this is the only way to differentiate.
                    && as.Page && as.Page.pageid != 'UCSignInStart'  
                    || _me.isPath('//www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx', true)
                    || _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/myalaskaair.aspx', true)
                    );
    };

    _me.isPage_Loyalty_Booking = function () {
        return (_me.isPath('//www.alaskaair.com/Booking/SignIn') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Booking/SignIn'));
    };

    _me.isPage_ShoppingPath_Flight = function () {
        return (_me.isPath('//www.alaskaair.com/Shopping/Flights/Shop') ||
                _me.isPath('//www.alaskaair.com/Shopping/Flights/Price') ||
                _me.isPath('//www.alaskaair.com/Shopping/Flights/Calendar') ||                
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Flights/Shop') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Flights/Price') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Flights/Calendar'));
    };

    _me.isPage_ShoppingPath_Cart_Flight = function () {
        return (_me.isPath('//www.alaskaair.com/Shopping/Cart/AddFlight') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/Shopping/Cart/AddFlight'));
    };

    _me.isPage_ShoppingPath_Confirmation = function() {
        return (_me.isPath('//www.alaskaair.com/booking/payment') ||
            _me.isPath('//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment'));
    };

    _me.isPath = function (url, isComparePath) {
        if (!isComparePath) {
            return _me.isTesting || (("//" + _me.location.hostname + _me.location.pathname).toLowerCase() == url.toLowerCase());
        }
        return _me.isTesting || (("//" + _me.location.hostname + _me.location.pathname + _me.location.search).toLowerCase() == url.toLowerCase());
    };


    this.startsWith = function(thisStr, str) {
        return str.length > 0 && thisStr.substring(0, str.length) === str;
    };

    this.insertImgBasedOnHttps = function(sslUrl, url) {
        if (_me.location.protocol == "https:")
            _me.insertImg(sslUrl);
        else
            _me.insertImg(url);
    };



    this.insertImg = function(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    };
}

if (typeof (as) != "undefined") {
    as.tagUtil = new TagUtil();
}


function AdaraPagePixelClass() {

    var tagUtil = new TagUtil(window.location);

    var pixelAndConditions = [
                {
                    condition: tagUtil.isPage_Home,
                    pixelUrl: [
                        '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=hm&u=' + as.ResponsysCustContactId,
                        '//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=1',
                        '//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=2',
                        '//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=3'
                    ]
                }, {
                    condition: function () {
                        return tagUtil.isPage_Loyalty()
                            && this.isVisitorObjectAvailable();
                    },
                    pixelUrl: function () {
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=lyl&mlplv='
                            + (visitor.tier != null ? visitor.tier : '')
                            + '&sub='
                            + (visitor.hasInsiderSubscription != null ? visitor.hasInsiderSubscription : '')
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '')
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                },
                {
                    condition: function () {
                        return tagUtil.isPage_Loyalty_Booking()
                            && this.isVisitorObjectAvailable();
                    },
                    pixelUrl: function () {
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=lyl_bk&mlplv='
                            + (visitor.tier != null ? visitor.tier : '')
                            + '&sub='
                            + (visitor.hasInsiderSubscription != null ? visitor.hasInsiderSubscription : '')
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '')
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }, {
                    condition: function () {
                        return tagUtil.isPage_ShoppingPath_Flight()
                            && this.isVisitorObjectAvailable()
                            && this.isFlightInfoAvailable();
                    }, //TO
                    pixelUrl: function () {
                        var flightInfo = this.getFlightInfo();
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=spth'
                            + '&soac='
                            + flightInfo.DepartureAirportCode //Origin Airport
                            + '&sdac='
                            + flightInfo.ArrivalAirportCode //Destination Airport
                            + '&sdpdt='
                            + flightInfo.DepartureDate //Searched departure date
                            + '&srdt='
                            + flightInfo.ReturnDate //Searched return date (If it exists)
                            + '&snopas='
                            + flightInfo.TravelersCount //Searched number of passengers
                            + '&mlplv='
                            + (visitor.tier != null ? visitor.tier : '') //Searched mileage plan tier
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '') //Hashed user id.
                            + '&mlpbal='
                            + visitor.mileagePlanBalance
                            //TODO: Do we need mileage plan balance?
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }, {
                    condition: function () {
                        return tagUtil.isPage_ShoppingPath_Cart_Flight()
                            && this.isVisitorObjectAvailable()
                            && this.isFlightInfoAvailable();
                    }, //TO
                    pixelUrl: function () {
                        var flightInfo = this.getFlightInfo();
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=spth_crt'
                            + '&soac='
                            + flightInfo.DepartureAirportCode //Origin Airport
                            + '&sdac='
                            + flightInfo.ArrivalAirportCode //Destination Airport
                            + '&sdpdt='
                            + flightInfo.DepartureDate //Searched departure date
                            + '&srdt='
                            + flightInfo.ReturnDate //Searched return date (If it exists)
                            + '&snopas='
                            + flightInfo.TravelersCount //Searched number of passengers
                            + '&mlplv='
                            + (visitor.tier != null ? visitor.tier : '') //Searched mileage plan tier
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '') //Hashed user id.
                            + '&mlpbal='
                            + visitor.mileagePlanBalance
                            //TODO: Do we need mileage plan balance?
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }, {
                    condition: function () {
                        return tagUtil.isPage_ShoppingPath_Confirmation()
                            && this.isVisitorObjectAvailable()
                            && this.isFlightInfoAvailable();
                    }, //TO
                    pixelUrl: function () {

                        var flightInfo = this.getFlightInfo();
                        var pixelUrls =
                        [
                            '//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&pg=cfm'
                            + '&boac='
                            + flightInfo.DepartureAirportCode //Origin Airport
                            + '&bdac='
                            + flightInfo.ArrivalAirportCode //Destination Airport
                            + '&bdpdt='
                            + flightInfo.DepartureDate //Searched departure date
                            + '&brdt='
                            + flightInfo.ReturnDate //Searched return date (If it exists)
                            + '&bnopas='
                            + flightInfo.TravelersCount //Searched number of passengers
                            + '&bsv='
                            + as.Page.CP.inCart //TODO: Add the booked services here.
                            + '&fopmt='
                            + as.Page.PP.fop //TODO: Add the form of payment here.
                            + '&bamt='
                            + as.Page.Cart.Itinerary.Revenue //TODO: Add the Revenue HERE
                            + '&mlplv='
                            + (visitor.tier != null ? visitor.tier : '') //Searched mileage plan tier
                            + '&u='
                            + (as.ResponsysCustContactId != null ? as.ResponsysCustContactId : '')
                            + '&mlpbal='
                            + visitor.mileagePlanBalance //Hashed user id.
                        ];
                        this.generateSyncPixels(3).then(function (url) { pixelUrls.push(url); });
                        return pixelUrls;
                    }
                }
    ];

    var defaultPreconditions = function () {
        var x = new VisitorRepository();
        x.PopulateVisitor();
        return as && as.tagUtil;
    }

    var self = this;

    self.generateSyncPixels = function (n) {
        var asUtils = asFrameworkUtils;
        var tempArray = new Array();
        for (var i = 1; i <= n; i++) {
            tempArray.push('//tag.yieldoptimizer.com/ps/sync?t=i&p=1194&w=false&r=' + i);
        }
        return new asUtils.SyncPromise(tempArray).each();
    };

    self.isVisitorObjectAvailable = function () {
        return typeof (visitor) !== "undefined"
            && visitor != null;
    };

    self.reformatStringDate4Adara = function (sDate) {
        var date = new Date(sDate);
        return sDate ? date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() : '';
    };

    self.isFlightInfoAvailable = function () {
        return as.Page
            && (
                as.Page.Cart
                    && as.Page.Cart.Itinerary
                    && as.Page.Cart.Itinerary.HasFlight
                    && as.Page.Cart.Itinerary.ItinerarySlices
                    && as.Page.Cart.Itinerary.ItinerarySlices.length > 0
                    && as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments
                    && as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments.length > 0
                    || as.Page.ShoppingSearch
                    && as.Page.ShoppingSearch.CityPairSlices
                    && as.Page.ShoppingSearch.CityPairSlices.length > 0);
    };

    self.isBookedServicesAvailable = function () {
        return as.Page
            && as.Page.CP
            && as.Page.CP.inCart;
    };

    self.isFormOfPaymentAvailable = function () {
        return as.Page
            && as.Page.PP
            && as.Page.PP.fop;
    };

    self.isRevenueAvailable = function () {
        return as.Page
            && as.Page.Cart
            && as.Page.Cart.Itinerary
            && as.Page.Cart.Itinerary.Revenue;
    };

    self.getFlightInfo = function () {
        var departureDate = null;
        var returnDate = null;
        var flightInfo = null;
        if (self.isFlightInfoAvailable() && as.Page.Cart) {
            var departureStartingSegment = as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments[0];
            var departureEndingSegment = as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments[as.Page.Cart.Itinerary.ItinerarySlices[0].SliceSegments.length - 1];
            var returningFlightSegment = as.Page.Cart.Itinerary.ItinerarySlices.length > 1 ?
                as.Page.Cart.Itinerary.ItinerarySlices[as.Page.Cart.Itinerary.ItinerarySlices.length - 1]
                .SliceSegments[as.Page.Cart.Itinerary.ItinerarySlices[as.Page.Cart.Itinerary.ItinerarySlices.length - 1].SliceSegments.length - 1] : null;
            departureDate = departureStartingSegment ? self.reformatStringDate4Adara(departureStartingSegment.DepartureStationDate) : '';
            returnDate = returningFlightSegment ? self.reformatStringDate4Adara(returningFlightSegment.DepartureStationDate) : '';
            flightInfo = {
                DepartureAirportCode: departureStartingSegment.DepartureStationCode,
                ArrivalAirportCode: departureEndingSegment.ArrivalStationCode,
                DepartureDate: departureDate,
                ReturnDate: returnDate,
                TravelersCount: as.Page.Cart.Itinerary.PassengersCount
            };
        } else if (self.isFlightInfoAvailable() && as.Page.ShoppingSearch) {
            var outgoingFlightInfo = as.Page.ShoppingSearch.CityPairSlices[0];
            var lastSliceIdx = as.Page.ShoppingSearch.CityPairSlices.length - 1;
            var returningFlightInfo = as.Page.ShoppingSearch.CityPairSlices.length > 1 ? as.Page.ShoppingSearch.CityPairSlices[lastSliceIdx] : {};

            departureDate = outgoingFlightInfo ? self.reformatStringDate4Adara(outgoingFlightInfo.Date) : '';
            returnDate = returningFlightInfo ? self.reformatStringDate4Adara(returningFlightInfo.Date) : '';
            flightInfo = {
                DepartureAirportCode: outgoingFlightInfo.DepartureShort,
                ArrivalAirportCode: outgoingFlightInfo.ArrivalShort,
                DepartureDate: departureDate,
                ReturnDate: returnDate,
                TravelersCount: as.Page.ShoppingSearch.TravelersCount
            };
        }
        if (flightInfo) {
            flightInfo.bookedService = self.isBookedServicesAvailable() ? escape(as.Page.CP.inCart) : '';
            flightInfo.formOfPayment = self.isFormOfPaymentAvailable() ? escape(as.Page.PP.fop) : '';
            flightInfo.revenue = self.isRevenueAvailable() ? as.Page.Cart.Itinerary.Revenue : '';
        }
        return flightInfo;
    };

    self.BasePagePixel = function (pixelAndConditions, vendorName, defaultPreconditions) {
        var that = this;
        that.pixelAndConditions = pixelAndConditions;
        that.vendorName = vendorName;
        that.defaultPreconditions = defaultPreconditions;

        var insertPixel = function (url) {
            var img = document.createElement('img');
            img.setAttribute('alt', '');
            img.setAttribute('height', '1');
            img.setAttribute('width', '1');
            img.setAttribute('style', 'display: none;');
            img.setAttribute('src', url);
            document.body.appendChild(img);
        };

        that.isPath =
            // url -> no querystring
            function (url, isStrict) {
                if (!isStrict) {
                    return that.isTesting || (("//" + location.hostname + location.pathname).toLowerCase() == url.toLowerCase());
                }
                return that.isTesting || (("//" + location.hostname + location.pathname + location.search).toLowerCase() == url.toLowerCase());
            };


        that.conditionalInsertPixel = function () {
            var pixelLogic = pixelAndConditions;

            //Check to make sure that the vendor site is up.
            if (as != "undefined" && !as['Is' + vendorName + 'Down'] && (!defaultPreconditions || defaultPreconditions())) {
                for (var i in pixelLogic) {
                    if (pixelLogic[i].condition instanceof Function) {
                        if (pixelLogic[i].condition.call(that, that)) {
                            that.unpackUrl(pixelLogic[i].pixelUrl).then(insertPixel);
                        }
                    } else if (typeof pixelLogic[i].condition === 'string') {
                        if (that.isPath(pixelLogic[i].condition)) {
                            that.unpackUrl(pixelLogic[i].pixelUrl).then(insertPixel);
                        }
                    }
                }
            }
        };

        that.unpackUrl = function (pixelUrl) {
            var asUtils = asFrameworkUtils;
            if (pixelUrl instanceof Function) {
                var result = pixelUrl.call(that);
                if (result instanceof Array)
                    return new asUtils.SyncPromise(result).each();
                return new asUtils.SyncPromise();
            } else if (pixelUrl instanceof Array) {
                return new asUtils.SyncPromise(pixelUrl).each();
            } else {
                return new asUtils.SyncPromise(pixelUrl);
            }
        };
    };

    self.BasePagePixel(pixelAndConditions, 'Adara', defaultPreconditions);
};

if (document.referrer.indexOf('intentmedia.net') == -1
    && document.referrer.indexOf('www.kayak.com') == -1
    && document.referrer.indexOf('www.alaskaair.com') == -1
    && document.referrer.indexOf('alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/') == -1
    && top != self) { top.location = self.location; } //Prevents XSF

var KeyCodeEnter = 13;
var KeyCodeSpace = 32;

(function ($) {

    var show = $.fn.show;
    $.fn.show = function () {
        var ret = show.apply(this, arguments);
        var id = $(this).attr('id');
        if (id !== 'divFormFiller' && id !== 'iFiller' && id !== 'interstitial')
        {
            $(this).attr("aria-hidden", "false");
        }
        return ret;
    };

    var hide = $.fn.hide;
    $.fn.hide = function () {
        var ret = hide.apply(this, arguments);
        var id = $(this).attr('id');
        if (id !== 'interstitial') {
            $(this).attr("aria-hidden", "true");
        }
        return ret;
    };


})(jQuery);

function IsEnterKey(e) {
    var isEnter = false;
    if (GetKeyCode(e) == KeyCodeEnter) {
        isEnter = true;
    }
    return isEnter;
}

function GetKeyCode(e) {
    var keyID = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    return keyID;
}

var asglobal = window.asglobal || {};

asglobal.getUrl = function (relativeUrl) {
    if (this.homePageUrl.indexOf('/', this.homePageUrl.length - 1) !== -1)
        return "//" + this.homePageUrl + relativeUrl;
    else
        return "//" + this.homePageUrl + "/" + relativeUrl;
};

SetDomainVariables();

function SetDomainVariables() {
    SetDomainUrl();
    //asglobal.domainIsSet is assigned value in an inline javascript code in Header.xslt
    if(asglobal.domainIsSet != null && asglobal.domainIsSet == false){
        SetDomain();
    }

    function SetDomain() {
        var domain = window.location.hostname.replace('www.', '');
        try {
            document.domain = domain; // This is for cross domain communication for Jenn and iSeatz's iFrames
            asglobal.domain = domain; //remember valid domain
        }
        catch (e) {
        //some iframe communication with parent window might fail but should not prevent other javascript code from working
        }
    }

    function SetDomainUrl() {

        asglobal.domainUrl = GetDomainUrl(GetHomePageUrl());

        function GetDomainUrl(homePageUrl) {
            var domainUrl = 'www.alaskaair.com'; //default, could different if spanish or another language
            var http = 'http://';
            var https = 'https://';
            //get domain url, it is home page url without the protocol
            if (homePageUrl != null && homePageUrl != '') {
                if (homePageUrl.indexOf(http) == 0) {
                    domainUrl = homePageUrl.replace(http, '');
                }
                else if (homePageUrl.indexOf(https) == 0) {
                    domainUrl = homePageUrl.replace(https, '');
                }
                else {
                    if (document.domain != homePageUrl.replace('www.', '')) {
                        if (document.location.hostname == homePageUrl) {
                            domainUrl = homePageUrl;
                        }
                    }
                }
            }
            return domainUrl;
        }

        function GetHomePageUrl() {
            var ENGLISH_MAINSITE_URL = 'www.alaskaair.com';
            var EASYBIZ_URL = 'easybiz.alaskaair.com';
            var SPANISH_SITE_URL = 'alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com';
            var homePageUrl = '';

            //get from logo
            var $homeLink = $('#aslogo a');
            if ($homeLink.length > 0) {
                var logoUrl = $homeLink.eq(0).attr('href').toLowerCase();
                if (logoUrl.indexOf(ENGLISH_MAINSITE_URL) > -1) {
                    homePageUrl = ENGLISH_MAINSITE_URL;
                }
                else if (logoUrl.indexOf(EASYBIZ_URL) > -1) {
                    homePageUrl = EASYBIZ_URL;
                }
                else if (logoUrl.indexOf(SPANISH_SITE_URL) > -1) {
                    homePageUrl = SPANISH_SITE_URL;
                }
                else {
                    homePageUrl = logoUrl.split("?")[0];
                }
                asglobal.logoUrl = logoUrl;
            }
            else {
                if (window.location.toString().indexOf(SPANISH_SITE_URL) > -1) {
                    homePageUrl = SPANISH_SITE_URL + '/';
                }
            }
            if(homePageUrl == null || homePageUrl == ''){
                homePageUrl = ENGLISH_MAINSITE_URL;
            }
            asglobal.homePageUrl = homePageUrl; //remember home page url, could be handy in some other places
            return homePageUrl;
        }
    }
}


$(document).ready(function () {

    // Setting focus on error message - fix for global Accessibility issue.
    var validationSummary = $('.errorTextSummary:first').eq(0);
    if (validationSummary) {
        if(validationSummary.css('display') != 'none')
            validationSummary.focus();
                }

    // Change href for "skip to main content" link for pages having left navigation
    var infoContentMain = $('.infoContentMain:first').get(0);
    if (infoContentMain) {
        var skipLink = $('#skip a');
        skipLink.attr('href', '#infoContentMain');
    }

    var contentMain = $('.contentMain:first').get(0);
    if (contentMain) {
        $('.contentMain:first').attr('id', 'content');
    }

});

$(document).ready(function () {

    var COOKIENAME = "ASUpgradeBrowserNotification";
    var COOKIEMESSAGE = "EXPIRES IN ONE DAY";

    var cookieExists = readCookie(COOKIENAME);

    //if cookie exists (meaning user has seen the notification today at least once already and closed it), then don't display the message again
    if (!cookieExists) {

        var div = document.createElement("div");
        div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
        var isIe9OrLower = (div.getElementsByTagName("i").length === 1);

        if (isIe9OrLower) {
            $.ajax({
                url: '//' + asglobal.domainUrl + '/content/partial/upgrade-browser',
                cache: false,
                success: function (data) {

                    if (data.toLowerCase().indexOf("this page has taken off") === -1) {
                        $('body').append(data);

                        // Bind events
                        $('#upgradeContinue').bind('click', function () {

                            $.closeEzPopoups(false);
                            createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                        });

                        $('#upgradeNow').bind('click', function () {

                            $.closeEzPopoups(true);
                            createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                            var url = 'https://' + asglobal.domainUrl + '/content/about-us/site-info/browser-info.aspx';
                            window.location.replace(url);
                        });
                    }

                    $('#upgradeBrowser').showLightBox({
                        width: 600,
                        height: 230,
                        onClose: function () {
                            createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                        }
                    }).show();

                    $('#upgradeBrowser').attr('tabindex', '0').focus();
                },
                error: function () {
                    createCookie(COOKIENAME, COOKIEMESSAGE, 1); //1 = 1 day = 1440 mins
                }
            });
        }
    }
});

function getVersion(browserName) {
    var ua = window.navigator.userAgent;
    var nameIndex = ua.search(browserName);

    if (browserName === "MSIE") {
        var slashAfterNameIndex = ua.indexOf(" ", nameIndex); //find the index of the space directly after the browser name for IE
    } else {
        var slashAfterNameIndex = ua.indexOf("/", nameIndex); //find the index of the slash directly after the browser name
    }

    return ua.substring(slashAfterNameIndex + 1, ua.indexOf(".", nameIndex)); //take the substring between that slash and the next dot
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

$("[data-persist-by-date]").each(function () {
	var self = $(this),
		persistByDate = $(this).data("persist-by-date");

	if (persistByDate === '') {
		return;
	}

	var dateNow = new Date();
		dateCheck = new Date(persistByDate);
});

function TopNav() {
    var _me = this;

    this.init = function () {
        _showLanguageLink();  // show english or spanish link
    }

    this.jumpToSpanishUrl = function () {
        location.href = _me.toSpanishUrl(location.href);
    }

    this.jumpToEnglishUrl = function () {
        location.href = _me.toEnglishUrl(location.href);
    }

    this.toEnglishUrl = function (spanishUrl) {
        if (!spanishUrl)
            return "http://www.alaskaair.com";
        return spanishUrl.replace("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com", "//www.alaskaair.com");
    }

    this.toSpanishUrl = function (englishUrl) {
        if (!englishUrl)
            return "http://alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com";
        return englishUrl.replace("//www.alaskaair.com", "//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com");
    }

    function _showLanguageLink() {
        if (location.hostname.toString() == 'alaskaair.convertlanguage.com') {
            if ($('#enEspanol'))
                $('#enEspanol').css('display', 'none');
            if ($('#english'))
                $('#english').css('display', 'block');
        }
    }
}

var as = window.as || {};

as.topNav = new TopNav();

$(document).ready(function () {
    as.topNav.init();

    // Set tabindex on target of Skip To Content link so IE knows it are focusable, and so Webkit browsers will focus() them (see below)
    $('#content').attr('tabindex', -1);

    // If there is a '#' in the URL (someone linking directly to a page with an anchor), set focus to that section (needed by Webkit browsers)
    if (document.location.hash && document.location.hash !== '#' && document.location.hash[1] !== '?') {
        var myAnchor = document.location.hash;
        setTimeout(function () {
            $(myAnchor).focus();
        }, 100);
    }
    // Set focus to targets of in-page links when clicked (needed by Webkit browsers)
    $("a[href^='#']").click(function (event) {
        var clickAnchor = this.href.split('#')[1];
        if (clickAnchor !== undefined && clickAnchor !== '') {
            setTimeout(function () {
                $("#" + clickAnchor).focus();
            }, 100);
        }
    });
});

function BoxDropDown(containerId, labelId, dropDownId, arrowId) {
    var _me = this;
    var _containerId = containerId;
    var _dropDownId = dropDownId;
    var _labelId = labelId;
    var _arrowId = arrowId;
    var _boxClass = "myAccountLabelWhiteBoxVisible";

    this.initForClick = function () {
        if ($('#' + _labelId).length) {
            $('#' + _labelId).click(function (e) {
                _me.toggle();
            });
        }
        if ($('#' + _containerId).length) {
            $('#' + _containerId).click(function (e) {
                e.stopPropagation();
            });
        }

        $(document).click(function (e) {
            _me.close();
        });

        // set up for sign in interstitial
        if ($('#myAccoutnSignInButton').length) {
            $('#myAccoutnSignInButton').click(function (e) {
                if ($('#greyInterstitialCover').length) {
                    $("#greyInterstitialCover").css("display", "block")
                }
            });
        }
    }

    this.initForHover = function () {
        if ($('#' + _containerId).length) {
            $('#' + _containerId).hover(function (e) {
                _me.toggle();
            });
        }
    }

    this.toggle = function () {
        var display = $('#' + _dropDownId).css('display');

        if (display == 'block') {
            display = 'none';
            if ($('#' + _arrowId).length) {
                $('#' + _arrowId).html('&#x25ba;&nbsp;');
            }
        }
        else {
            display = 'block';
            if ($('#' + _arrowId).length) {
                $('#' + _arrowId).html('&#x25bc;&nbsp;');
            }
            if ($('#greyInterstitialCover').length) {
                $("#greyInterstitialCover").css("display", "none");
            }
        }

        $('#' + _dropDownId).css('display', display);

        if ($('#' + _labelId).hasClass(_boxClass)) {
            $('#' + _labelId).removeClass(_boxClass);
        }
        else {
            $('#' + _labelId).addClass(_boxClass);
            $('#UserId').focus();
        }
    }

    this.close = function () {        
        $('#' + _dropDownId).css('display', 'none');
        if ($('#' + _arrowId).length) {
            $('#' + _arrowId).html('&#x25ba;&nbsp;');
        }
        $('#' + _labelId).removeClass(_boxClass);
    }
}

function Authentication() {
    this.init = function () {
        if ($('#myAccount').length) {
            new BoxDropDown("myAccount", "myAccountLabel", "myAccountDropDownDiv", "myAccountArrow").initForClick();
        }
        else if ($('#myAccountMenu').length) {
            new BoxDropDown("myAccountMenu", "myAccountLabel", "myAccountDropDownDiv", null).initForHover();
        }

        // need to set this so that the sign in webform won't throw up for dynamic browser check
        _setCookie("ASDBD", "J1C1", 1);        
    }

    this.forgotUserId = function (url) {
        _openWindowCenter(url, 'forgotuserid', '475', '425');
    }

    this.forgotPassword = function (url) {
        _openWindowCenter(url, 'forgotpassword', '475', '425');
    }

    function _setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; path=/; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    function _openWindowCenter(url, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        var features = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, '
        + 'copyhistory=no, ' + 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;

        var targetWin = open(url, title, features);
    }
}

as.authentication = new Authentication();

$(document).ready(function () {
    as.authentication.init();
});


$(function () {
    $('#myAccount input').keydown(function (e) {
        if (e.keyCode == 13) {           
            if ($('#greyInterstitialCover').length) {
                $("#greyInterstitialCover").css("display", "block")
            }
            $(this).parents('form').submit();
            return false;
        }
    });
});

var Tier = { UNKNOWN: 0, STANDARD: 1, MVP: 2, GOLD: 3, GOLD75: 4 };
var Country = { UNKNOWN: "unknown", US: "united states", CA: "canada" };
var CreditCardType = { UNKNOWN: "unknown", VISA: "BAAS" };

var visitor = {
    country: Country.UNKNOWN,
    tier: Tier.UNKNOWN,
    creditCard: CreditCardType.UNKNOWN, // unknown, BAAS 
    destination: "unknown", // unknown, SEA, LAS,  PDX

    referrerUrl: "",  // http://www.google.com/search?q=alaska+airline+cheap&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-a&safe=active    
    isMileagePlanMember: false,
    hasInsiderSubscription: false,
    isBoardroomMember: false,
    familySize: 0
};

function VisitorRepository() {
    var _v = visitor;

    this.PopulateVisitor = function() {
        _v.referrerUrl = (typeof document.referrer != "undefined") ? document.referrer : "";

        // parse cookies
        var cookie = unescape(document.cookie);
        _v.destination = _parseDestination(cookie);
        _v.tier = _parseTier(cookie);
        _v.isMileagePlanMember = _v.tier > 0;
        _v.familySize = _parseFamilySize(cookie);
        _v.creditCard = _parseCreditCard(cookie);
        _v.hasInsiderSubscription = _parseHasInsiderSubscription(cookie);
        _v.isBoardroomMember = _parseIsBoardroomMember(cookie);
        _v.mileagePlanBalance = _parseForMileagePlanBalance(cookie);

        if (typeof testAndTargetUser == "object") {
            _overwriteObject(_v, testAndTargetUser); // set country using test and target geo location service
        }

        return _v;
    };

    function _parseForMileagePlanBalance(cookieString) {
        return _extract(cookieString, 'MemberMpBalance=', ';','');
    }

    function _overwriteObject(oldJson, newJson) {
        for (prop in newJson) {
            if (newJson.hasOwnProperty(prop) && oldJson.hasOwnProperty(prop)) {
                oldJson[prop] = newJson[prop];
            }
        }
    };

    function _parseDestination(cookie) {
        return _parseCookie(cookie, "AS_dest=");
    }

    function _parseTier(cookie) {
        var tier = _parseCookie(cookie, "AS_mbr=");
        if (tier.indexOf("GOLD75K") >= 0)
            return Tier.GOLD75;
        if (tier.indexOf("GOLD") >= 0)
            return Tier.GOLD;
        if (tier.indexOf("MVP") >= 0)
            return Tier.MVP;
        if (tier.indexOf("STANDARD") >= 0)
            return Tier.STANDARD;
        return Tier.UNKNOWN;
    }

    function _parseFamilySize(cookie) {
        var size = _parseCookie(cookie, "AS_fam=");

        if (size == "ZERO" || size == "unknown")
            size = "0";
        return parseInt(size);
    }

    function _parseCreditCard(cookie) {
        return _parseCookie(cookie, "AS_card=");
    }

    function _parseHasInsiderSubscription(cookie) {
        var subscriptions = _parseCookie(cookie, "AS_Subscrx=");
        return subscriptions.indexOf("InsiderNewsletter") >= 0;
    }

    function _parseIsBoardroomMember(cookie) {
        var subscriptions = _parseCookie(cookie, "AS_BR=");
        return subscriptions.indexOf("ACTIVE") == 0;
    }

    function _parseCookie(cookie, indexString) {
        return _extract(cookie, indexString, "|", "unknown");
    }

    function _extract(cookie, indexString, endString, defaultValue) {
        var x = cookie.indexOf(indexString);
        if (x < 0)
            return defaultValue;

        var result = cookie.substring(x + indexString.length);

        var y = result.indexOf(endString);
        if (y <= 0)
            return defaultValue;

        result = result.substring(0, y);
        if (!result || result == "")
            return defaultValue;

        return result;
    }
}

function TestUtil() {
    var _me = this;
    this.debugging = false;

    // for testing: overwrite visitor properties based on URL query string
    this.overwriteVisitor = function (visitor) {
        if (window.location.search.indexOf("visitor=") > 0) {
            var params = this.getQuerystringParams(window.location.search);
            var newVisitor = jQuery.parseJSON(params["visitor"]);

            for (prop in newVisitor) {
                if (newVisitor.hasOwnProperty(prop) && visitor.hasOwnProperty(prop)) {
                    visitor[prop] = newVisitor[prop];
                }
            }
        }
    };

    this.debugJson = function (jsonObj) {
        if (_me.debugging || window.location.search.indexOf("debug=1") > 0) {
            this.debug(this.jsonToString(jsonObj) + "\r\n\r\n");
        }
    };

    this.debug = function (message) {
        if (_me.debugging || window.location.search.indexOf("debug=1") > 0) {
            if ($("#debugText").length == 0) {
                $("body").append("<textarea id='debugText' rows='20' cols='175' readonly='yes'></textarea>");
            }
                        
            $("#debugText").text($("#debugText").text() + message);
        }
    };

    this.jsonToString = function (jsonObj) {
        var s = "{"
        for (var p in jsonObj) {
            if (!jsonObj.hasOwnProperty(p)) {
                continue;
            }
            if (s.length > 1) {
                s += ',';
            }
            s += '' + p + ':' + jsonObj[p] + '';
        }

        return s + "}";
    }

    this.getQuerystringParams = function(querystring) {
        var qs = unescape(querystring);

        // document.location.search is empty if no query string
        if (!qs) {
            return {};
        }

        // Remove the '?' via substring(1)
        if (qs.substring(0, 1) == "?") {
            qs = qs.substring(1);
        }

        // Load the key/values of the return collection
        var qsDictionary = {};

        // '&' seperates key/value pairs
        var pairs = qs.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var keyValuePair = pairs[i].split("=");
            qsDictionary[keyValuePair[0]] = keyValuePair[1];
        }

        // Return the key/value dictionary
        return qsDictionary;
    }
}

function MaxymiserRepository() {
    this.SetPersCriterions = function () {
        var testUtil = new TestUtil();
        var visitorRepository = new VisitorRepository();
        var v = visitorRepository.PopulateVisitor();
        testUtil.overwriteVisitor(v);
        testUtil.debugJson(v);
        
        mmcore.SetPersCriterion("tier", v.tier.toString());
        mmcore.SetPersCriterion("hasInsider", v.hasInsiderSubscription.toString().toUpperCase());
        mmcore.SetPersCriterion("hasBoardroom", v.isBoardroomMember.toString().toUpperCase());
        mmcore.SetPersCriterion("creditCard", v.creditCard);
    };
}

var navigationMenu = new NavigationMenu();
function NavigationMenu() {
    var me = this;
    var currentFlexMenuId = "";
    this.SetupMenuDone = false;
    this.SelectTab = function (navTab) {
        $(navTab).removeClass('navTab');
        $(navTab).addClass('navWhiteBox');
        me.ShowMenu(navTab, $("a.nav", navTab).attr("data-flexmenu"));
    }
    this.SelectTabNoSubNav = function (navTab) {
        $(navTab).removeClass('navTab');
        $(navTab).addClass('navWhiteBox');
        me.ShowMenuNoSubNav(navTab, $("a.nav", navTab).attr("data-flexmenu"));

        $(".tabContainer").css("position", "relative");
        $(".tabContainer").css("z-index", "10000");
    }
    this.DeSelectTab = function (navTab) {
        if (!$(navTab).hasClass("selectedTab")) {
            if ($(navTab).hasClass("navWhiteBox")) $(navTab).removeClass('navWhiteBox');
            $(navTab).addClass('navTab');
        }

        me.ToggleTab($(".navBarTab.toggled"));

        $(".flexdropdownmenu").css({ display: "none" });

        $(".tabContainer").css("position", "");
       }

    this.DeSelectAllTabs = function () {
       	$(".navBarTab").each(function () {
       		me.DeSelectTab(this);
       	});
    }

    this.ToggleTab = function (navTab) {
        
        if ($(navTab).hasClass("selectedTab")) {
            $(navTab).removeClass('selectedTab');
            if ($(navTab).hasClass("navWhiteBox")) $(navTab).removeClass('navWhiteBox');
            $(navTab).addClass('navTab');
            $(navTab).addClass('toggled');
        }
        else {
            $(navTab).removeClass('navTab');
            $(navTab).addClass('navWhiteBox');
            $(navTab).addClass('selectedTab');
            $(navTab).removeClass('toggled');
        }

    }

    this.ShowMenu = function (navTab, flexMenuId) {
        var flexMenu = $("#" + flexMenuId);
        if ($(navTab).length > 0) {
            $(flexMenu).css({ position: "absolute" });
            $(flexMenu).css({ "z-index": 10000 });
            var addToTop = 1;
            $(flexMenu).css({ top: $(navTab).offset().top + $(navTab).height() + addToTop });
            $(flexMenu).css({ left: $(navTab).offset().left - $(navTab).offsetParent().offset().left - 1 });
        }
        var duration = 0;

        if (currentFlexMenuId == flexMenuId) {
            duration = 0;
        }
        if ($(flexMenu).css("display") == "none") {
            //$("#divLog").append("<div>" + flexMenuId + "</div>");
            $(flexMenu).slideDown(duration);
        }
        currentFlexMenuId = flexMenuId;
    }


    this.ShowMenuNoSubNav = function (navTab, flexMenuId) {
    	var flexMenu = $("#" + flexMenuId);
    	var navBar = $(".navBar");
    	var advBanner = $("#Advisories");
    	if ($(navTab).length > 0) {
    		$(flexMenu).css({ position: "absolute" });
    		$(flexMenu).css({ "z-index": 9999999 });
    		$(flexMenu).css({ top: $(navBar).outerHeight() - 5, left: $(navBar).offset().left - $(navTab).offset().left + 8 });
    		$(flexMenu).css("width", $(".contentMain").width() - 60);
    	}
    	var duration = 0;

    	if (currentFlexMenuId == flexMenuId) {
    		duration = 0;
    	}

    	var flexMenuLinks = $("[id^=" + flexMenuId + "]");

    	if ($(flexMenu).css("display") == "none") {
    		//$("#divLog").append("<div>" + flexMenuId + "</div>");
    		$(flexMenuLinks).show();
    		$(flexMenu).slideDown(duration);
    	}
    	currentFlexMenuId = flexMenuId;

    	if ($(".navBarTab.selectedTab").attr("id") != $(navTab).attr("id")) {
    		me.ToggleTab($(".navBarTab.selectedTab"));
    	}

    }


    this.CancelBubble = function (e) {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }

    $(document).ready(function () {

    	// Fix for hoverstate causing users to double tap on nav links using IOS devices. 
    	// See http://stackoverflow.com/questions/3038898/ipad-iphone-hover-problem-causes-the-user-to-double-click-a-link
    	$(".navBar .listitem a").bind("touchend", function (e) {
    		window.location = $(this).attr("href");
    	});

    	// Show menus with touch events.
    	$(".navBar .tabContainer").bind("touchstart", function (e) {
    		var menuId = $("a.nav", this).attr("data-flexmenu");
    		if (menuId != currentFlexMenuId && $("#" + menuId).length > 0) {
    			e.preventDefault();
    			me.DeSelectAllTabs();
    			me.SelectTabNoSubNav($(".navBarTab", this));
    		}
    	});
    });

}


//start widget containers
var WidgetContainers = { Selectors: { V: "#vshopping-container", H: "#hshopping-container", P: "#pshopping-container" } };
//end widget containers

//Start Lightbox Code
var POPUP_OUTER_DIV_CLASS = "EzPopopOuter";
var POPUP_INNER_DIV_CLASS = "EzPopopInner";
var POPUP_CLOSE_BTN_CLASS = "EzPopopClsBtn";
var CLOSE_ANCHOR_ID = "closeAnchorId";
var FORM_FILLER_ID = "divFormFiller";
var lastFormFiller = null;
var lastFocus;

if (typeof $.browser === 'undefined') {
    $.browser = {};
    (function () {
        $.browser.msie = false;
        $.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            $.browser.msie = true;
            $.browser.version = RegExp.$1;
        }
    })();
}

window.onresize = function () {
    if ($.browser.msie) {
        if ($("#" + FORM_FILLER_ID).length !== 0 && $("#" + FORM_FILLER_ID).css("display").toLowerCase() !== "none") {
            $.showFormFiller();
        }
        if ($("#" + PROCESSING_DIV_ID).length !== 0 && $("#" + PROCESSING_DIV_ID).css("display").toLowerCase() !== "none") {
            $.showProcessingBar();
        }
    }
};

jQuery.fn.positionElement = function (param) {
    var top = (param != null && param.top != null && !isNaN(param.top)) ? param.top : 0;
    var left = (param != null && param.left != null && !isNaN(param.left)) ? param.left : 0;
    var duration = param != null && param.duration != null ? param.duration : "slow";
    this.css({ left: left }).css({ top: top });
    this.show(duration);
};

jQuery.showFormFiller = function (closeOnClick, onClose) {
    if (lastFormFiller) {
        lastFormFiller.unbind("click");
    }

    if ($("#" + FORM_FILLER_ID).length === 0) {
        var parentElement = $("body");
        if (parentElement.length === 0) {
            parentElement = $("div").first();
        }
        parentElement.append("<div id='" + FORM_FILLER_ID + "' aria-hidden='true'></div>");

        $("#" + FORM_FILLER_ID).css({
            backgroundColor: '#000',
            display: 'none',
            zIndex: '500',
            opacity: '0.4',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        });
    }
    $("#" + FORM_FILLER_ID).show();

    // This timeout is a fix for the iPad. Due to a bug in Safari around the timing of events,
    // the 'click' that caused the popup to open gets routed to the gray background. Without this
    // timeout the popup will get dismissed by the same touch\click event that opened it preventing
    // the user from performing the action in the popup.
    setTimeout(function () {
        lastFormFiller = $("#" + FORM_FILLER_ID);
        lastFormFiller.bind("click", function () {
            if (closeOnClick === null || closeOnClick === true) {
                $.closeEzPopoups();
                if (onClose != null && typeof onClose === "function") {
                    try {
                        onClose();
                    }
                    catch (e) {
                    }
                }
            }
        });
    }, 2000);
};

var lightboxHelper = new LightboxHelper();
function LightboxHelper() {
    this.KeyPressedEventBound = false;
    this.GetVisibleHeight = function () {
        return $(document).height() > $(window).height() ? $(window).height() : $(document).height();
    };

    this.GetTotalHeight = function () {
        return $(document).height() < $(window).height() ? $(window).height() : $(document).height();
    };

    this.GetVisibleWidth = function () {
        return $(document).width() > $(window).width() ? $(window).width() : $(document).width();
    };

    this.GetTotalWidth = function () {
        return $(document).width() < $(window).width() ? $(window).width() : $(document).width();
    };
    this.GetIdUniqueSuffix = function () {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();

        return curr_hour + "_" + curr_min + "_" + curr_sec + Math.floor(Math.random() * 1111);
    };
}

jQuery.hideFormFiller = function () {
    $("#" + FORM_FILLER_ID).hide();
};

jQuery.fn.makeRoundCorner = function (param) {
    var cornerRadius = param != null && param.cornerRadius != null ? param.cornerRadius : 5;
    this.css({ "border-radius": cornerRadius });
    return this;
};

jQuery.fn.formatEzTable = function (param) {
    var tables = this;
    tables.each(function (i) {
        $(this).attr({ cellpadding: 6 }).attr({ cellspacing: 0 });
        $(this).css("border-left", "solid 1px #656565");
        $(this).css("border-top", "solid 1px #656565");
        $("td", $(this)).css("border-right", "solid 1px #656565");
        $("td", $(this)).css("border-bottom", "solid 1px #656565");
        $("th", $(this)).css("border-right", "solid 1px #656565");
        $("th", $(this)).css("border-bottom", "solid 1px #656565");
        var visibleRowNumber = 0;
        $("tbody > tr", this).each(function (j) {
            if ($(this).css("display").toLowerCase() != "none") {
                visibleRowNumber++;
                if (visibleRowNumber == 1) {
                    $(this).css("background-color", "#E6EDF6");
                }
                else {
                    if ((visibleRowNumber % 2) == 1) {
                        $(this).css("background-color", "#E6EDF6");
                    }
                    else {
                        $(this).css("background-color", "white");
                    }
                }
            }
        });

    });
};


jQuery.closeEzPopoups = function (noDelay) {
    console.log('closing popups', noDelay);
    noDelay = noDelay == null ? false : noDelay;
    if (noDelay === true) {
        $(".EzPopopOuter").hide();
        $.hideFormFiller();
    }
    else {
        $(".EzPopopOuter").hide("slow", function () {
            $.hideFormFiller();
        });
    }
};

jQuery.fn.centerEz = function (param) {
    var baseWidth = (param != null && param.baseWidth != null && !isNaN(param.baseWidth)) ? param.baseWidth : $(document).width();
    var duration = param.duration;
    if (isNaN(baseWidth) || baseWidth == null || baseWidth == 0) {
        baseWidth = $(document).width();
    }
    var baseHeight = lightboxHelper.GetVisibleHeight();
    var top = (baseHeight - this.height()) / 2 + $(document).scrollTop();
    var left = (baseWidth - this.width()) / 2 + $(document).scrollLeft();
    var minTop = 7;
    if (top < minTop) top = minTop;
    var minLeft = 0;
    if (left < minLeft) left = minLeft;
    this.css({ position: "absolute" });
    this.positionElement({ top: top, left: left, duration: duration });
    return this;
};

jQuery.fn.showEzPopup = function (param) {

    var top = (param != null && param.top != null && !isNaN(param.top)) ? param.top : 0;
    var left = (param != null && param.left != null && !isNaN(param.left)) ? param.left : 0;
    var centerOnPage = (param != null && param.centerOnPage != null) ? param.centerOnPage : false;
    var duration = 0; //ignore for now, param != null && param.duration != null ? param.duration : "slow";
    var baseWidth = param.baseWidth;
    if (centerOnPage == true) {
        if (baseWidth != null && baseWidth > 0) {
            this.centerEz({ baseWidth: baseWidth, duration: duration });
        }
        else {
            this.centerEz({ duration: duration });
        }
    }
    else {
        if (top != 0 && left != 0) {
            $(this).positionElement({ left: left, top: top, duration: duration });
        }
        else {
            $(this).css({ position: "absolute" }).show(duration);
        }
    }
};

jQuery.fn.hideEzPopup = function () {
    this.hide();
    $.hideFormFiller();
};

// postify.js
// Converts an object to an ASP.NET MVC  model-binding-friendly format
// Author: Nick Riggs
// http://www.nickriggs.com

$.postify = function (value) {
    var result = {};

    var buildResult = function (object, prefix) {
        for (var key in object) {

            var postKey = isFinite(key)
                ? (prefix != "" ? prefix : "") + "[" + key + "]"
                : (prefix != "" ? prefix + "." : "") + key;

            switch (typeof (object[key])) {
                case "number": case "string": case "boolean":
                    result[postKey] = object[key];
                    break;

                case "object":
                    if (object[key].toUTCString)
                        result[postKey] = object[key].toUTCString().replace("UTC", "GMT");
                    else {
                        buildResult(object[key], postKey != "" ? postKey : key);
                    }
            }
        }
    };

    buildResult(value, "");

    return result;
};

jQuery.fn.disableEnableInputControls = function (willDisable) {
    if (this == null) {
        $("input").attr({ disabled: willDisable });
        $("select").attr({ disabled: willDisable });
        $("textarea").attr({ disabled: willDisable });
    }
    else {
        $("input", this).attr({ disabled: willDisable });
        $("select", this).attr({ disabled: willDisable });
        $("textarea", this).attr({ disabled: willDisable });
    }
};

jQuery.showValidationMessages = function () {
    $(".redtext").show();
};

jQuery.hideValidationMessages = function () {
    $(".redtext").hide();
};

jQuery.showActionMessage = function (message, isError, param) {

    if (message == '') {
        $.hideActionMessage();
    }
    else {
        var top = param != null && param.top != null ? param.top : 150;
        var left = param != null && param.left != null ? param.left : 170;
        var hideActionMessage = param != null && param.hideActionMessage != null ? param.hideActionMessage : true;
        if (isError == null) {
            isError = true;
        }
        if (isError) {
            $("#" + MESSAGE_TEXT_DIV_ID).css({ "color": 'red' }).html(message);
        }
        else {
            $("#" + MESSAGE_TEXT_DIV_ID).css({ "color": '#54112b' }).html(message).addClass('successTextSummary');
        }
        $("#" + MESSAGE_CONTAINER_DIV_ID).positionElement({ top: top, left: left, duration: "fast" });
    }
};

jQuery.hideActionMessage = function () {
    $("#" + MESSAGE_CONTAINER_DIV_ID).hide();
};

jQuery.showProcessingBar = function () {
    var baseWidth = lightboxHelper.GetVisibleWidth();
    var baseHeight = lightboxHelper.GetVisibleHeight();
    var top = (baseHeight - $("#" + PROCESSING_DIV_ID).height()) / 2 + $(document).scrollTop();
    var left = (baseWidth - $("#" + PROCESSING_DIV_ID).width()) / 2 + $(document).scrollLeft();

    var divProcessing = $("#" + PROCESSING_DIV_ID);
    var parentElement = $("body");
    if ($(divProcessing).length == 0) {
        var html = "<div aria-describedby='divProcessingSpinner-message' role='alert' class='divProcessingSpinner' style='height:100px; width:100px; display:none; z-index:10000; background-color:#01426A; padding:20px; border-radius: 3px' id='" + PROCESSING_DIV_ID + "'>";
        html += "<div class='spinner'><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span></div>";
        html += "<p id='divProcessingSpinner-message'><span tabindex='-1'>Processing. Please Wait.</span></p>";
        html += "</div>"

        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);

        divProcessing = $("#" + PROCESSING_DIV_ID);
        $(divProcessing).css({ "position": "absolute" }).css({ top: 0 }).css({ left: 0 });
    }

    $.showFormFiller(false);
    $("#" + PROCESSING_DIV_ID).css({ left: left }).css({ top: top }).show();


    $(document).scrollTop($(document).scrollTop() + 1);
};

jQuery.scroll1pxDown = function () {
    $(document).scrollTop($(document).scrollTop() + 1);
};

jQuery.hideProcessingBar = function () {
    $.hideFormFiller();
    $("#" + PROCESSING_DIV_ID).hide();
};

var PROCESSING_DIV_ID = "divProcessing";
var MESSAGE_CONTAINER_DIV_ID = "divMessageContainer";
var MESSAGE_TEXT_DIV_ID = "divMessageText";
var CLOSE_MESSAGE_BAR_DIV_ID = "divCloseMessageBar";
var SESSION_TIMEDOUT_DIV_ID = "divSessionTimedOut";
var MY_ACCOUNT_TIMEDOUT_DIV_ID = "divMyAccountSessionTimedOut";
jQuery.createMessageElements = function () {
    //alert('>Lightbox.otheres.js jQuery.createMessageElements');
    var parentElement = $("body");

    var divProcessing = $("#" + PROCESSING_DIV_ID);
    if ($(divProcessing).length == 0) {
        var html = "<div aria-describedby='divProcessingSpinner-message' role='alert' class='divProcessingSpinner' style='height:100px; width:100px; display:none; z-index:10000; background-color:#01426A; padding:20px; border-radius: 3px' id='" + PROCESSING_DIV_ID + "'>";
        html += "<div class='spinner'><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span></div>";
        html += "<p id='divProcessingSpinner-message'><span tabindex='-1'>Processing. Please Wait.</span></p>";
        html += "</div>"
        
        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);

        divProcessing = $("#" + PROCESSING_DIV_ID);
        $(divProcessing).css({ "position": "absolute" }).css({ top: 0 }).css({ left: 0 });
    }

    var divMessageContainer = $("#" + MESSAGE_CONTAINER_DIV_ID);
    if ($(divMessageContainer).length == 0) {
        var html = "";
        html += "<div id='" + MESSAGE_CONTAINER_DIV_ID + "' style='display:none;position:absolute;'>";
        html += "<div id='" + MESSAGE_TEXT_DIV_ID + "' style='float: left; text-align: center;padding-top:5px; font-weight:bold;'></div>";
        html += "<div id='" + CLOSE_MESSAGE_BAR_DIV_ID + "' style='float: left;z-index:20000; cursor:pointer; padding-left: 10px;'>";
        html += "	<img src='https://www.alaskaair.com/images/Popup_Close_X.png' alt='Close' tabindex='0' role='button' />";
        html += "</div>";

        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);

        var divCloseMessageBar = $("#" + CLOSE_MESSAGE_BAR_DIV_ID);
        $(divCloseMessageBar).click(function () {
            $.hideActionMessage();
        });
        $(divCloseMessageBar).css({ "padding-left": "10px" }).hide(); //don't show for now
    }

    var divSessionTimedOut = $("#" + SESSION_TIMEDOUT_DIV_ID);
    if ($(divSessionTimedOut).length == 0) {
        var html = "";
        html += "<div id='divSessionTimedOut' style='display:none;'>";
        html += "	Your session has timed out. You will be redirected to the signin page.<br />";
        html += "	<br />";
        html += "	Please wait...<img alt='' src='https://www.alaskaair.com/images/interstitial-animated-dots.gif' />";
        html += "</div>";
        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }
        parentElement.append(html);
    }

    if ($.browser.msie) {
        var screenTop = $(document).scrollTop();
        divProcessing.css({ top: screenTop }).css({ left: 0 });
    }


};

var SIGNIN_REQUIRED = "SigninRequired";
var ERROR_ENCOUNTERED = "Error was encountered, please try again.";
var REQUEST_SUCCESSFUL = "Your request was successfully processed.";
var REQUEST_TIMED_OUT = "Your request timed out, please try again.";

function afterPost(msg) {
    if (msg == SIGNIN_REQUIRED || msg.indexOf(SESSION_TIMEDOUT_DIV_ID) > 0 || msg.indexOf(MY_ACCOUNT_TIMEDOUT_DIV_ID) > 0) {
        redirectToSignInPage();
        return false;
    }
    else {
        return true;
    }
}

function redirectToSignInPage() {
    $.hideLightBoxes();
    $("#divSessionTimedOut").showLightBox({ width: 300, hideCloseBtn: true });

    window.setTimeout("window.location.href = 'https://easybiz.alaskaair.com/signin?action=timedout';", 1000);
}
function redirectToMyAccountSignInPage(url) {
    $.hideLightBoxes();
    $("#divMyAccountSessionTimedOut").showLightBox({ width: 300, hideCloseBtn: true });

    var urlString = "https://www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart";
    if (url != null) {
        urlString = urlString + "&url=" + url;
    }

    window.setTimeout("window.location.href = '" + urlString + "';", 1000);
}
var ESCAPE_KEY_CODE = 27;
var ENTER_KEY_CODE = 13;
function clickBtnOnTargetKey(targetKey, btnId) {
    if (event.keyCode == targetKey) {
        $("#" + btnId).click();
    }
}

function focusOnFirstInput(container) {
    $("input:eq(0)", container).focus();
}

jQuery.toggleAjaxProcessingImage = function (show) {
    if (show) {
        $.showProcessingBar();
    } else {
        $.hideProcessingBar();
    }
};


jQuery.fn.showLightBox = function (param) {
    //show only one lightbox at a time. Close other lightboxes.
    $.closeEzPopoups(true);

    param = param || {};
    var baseWidth = param != null && param.baseWidth != null ? param.baseWidth : $(document).width();
    var width = param != null && param.width != null ? param.width : 200;
    var maxWidth = param != null && param.maxWidth != null ? param.maxWidth : 585;
    var maxWidthOverride = param != null && param.maxWidthOverride != null ? param.maxWidthOverride : false;
    var isDraggable = param != null && param.isDraggable != null ? param.isDraggable : false;
    var src = param != null && param.src != null ? param.src : null;
    var setParentZIndex = param != null && param.setParentZIndex != null ? param.setParentZIndex : true;
    var centerOnPage = param != null && param.centerOnPage != null ? param.centerOnPage : true;
    var btnCloseElement = param != null && param.btnCloseElement != null ? $(param.btnCloseElement) : null;
    var btnSubmitElement = param != null && param.btnSubmitElement != null ? param.btnSubmitElement : null;
    var submitOnEnter = param != null && param.submitOnEnter != null ? param.submitOnEnter : true;
    var hideProcessingBar = param != null && param.hideProcessingBar != null ? param.hideProcessingBar : true;
    var hideValidationMessages = param != null && param.hideValidationMessages != null ? param.hideValidationMessages : true;
    var hideActionMessage = param != null && param.hideActionMessage != null ? param.hideActionMessage : true;
    var parentElement = param.parentElement;
    var height = param.height;
    var maxHeightOverride = param != null && param.maxHeightOverride != null ? param.maxHeightOverride : false;
    var duration = param.duration;
    var hideCloseBtn = param != null && param.hideCloseBtn != null ? param.hideCloseBtn : false;
    var hideCloseSecondaryBtn = param != null && param.hideCloseSecondaryBtn != null ? param.hideCloseSecondaryBtn : true;
    var createNew = param != null && param.createNew != null ? param.createNew : false;
    var skipFocus = param != null && param.skipFocus != null ? param.skipFocus : false;
    var onClose = param.onClose;
    var focusid = param.focusid;
    var padding = param != null && param.padding != null ? param.padding : 15;

    if (width == null || isNaN(width) || width <= 0) {
        width = 200;
    }

    var mainContainer = $(this).parents("." + POPUP_OUTER_DIV_CLASS);
    var innerContainer;

    var maxHeight = 520;

    if (mainContainer.length == 0 || createNew == true) {
        var parentId = "divEzPopup" + lightboxHelper.GetIdUniqueSuffix() + Math.floor(Math.random() * 11),
            imgId = "img" + lightboxHelper.GetIdUniqueSuffix(),
            closeAnchorId = CLOSE_ANCHOR_ID  + lightboxHelper.GetIdUniqueSuffix();

        mainContainer = $("<div/>", { id: parentId, "class": POPUP_OUTER_DIV_CLASS + ' popup', width: width, title: "", tabindex: -1, role: "dialog" });

        if (!hideCloseBtn)
        {
            var divImgContainer = $("<div/>").css({ position: "absolute", right: "-15px", top: "-13px", "z-index": "9999999" });
            var imgCloseBtn;
            var aCloseBtn = $("<a />", { id: closeAnchorId, href: "#", role: "button" });
            imgCloseBtn = $("<img />", { id: imgId, src: "https://www.alaskaair.com/images/Popup_Close_X.png", "alt": "Close" });
            aCloseBtn.append(imgCloseBtn);
            imgCloseBtn.attr("class", POPUP_CLOSE_BTN_CLASS);
            divImgContainer.append(aCloseBtn);
        }

        innerContainer = $("<div/>", { "class": POPUP_INNER_DIV_CLASS + ' containerx' });
        mainContainer.append(innerContainer);
        mainContainer.append(divImgContainer);

        if (parentElement == null || parentElement.length == 0) {
            parentElement = $(this).parent();
        }
        if (parentElement.length == 0) {
            parentElement = $("body");
        }
        if (parentElement.length == 0) {
            parentElement = $("div").first();
        }


        parentElement.append(mainContainer);

        mainContainer.css({ background: "white", "z-index": "9999998", float: "left" });
        if (setParentZIndex) {
            mainContainer.offsetParent().css({ "z-index": "9999997" });
        }
        //, "max-height": "520px", "max-width":"585px", "overflow":"auto"
        // var maxWidth = 585;
        $("." + POPUP_INNER_DIV_CLASS, mainContainer).css({ "background-color": "white" });
        if (height != null) {
            if (height > maxHeight && !maxHeightOverride) {
                mainContainer.css({ "max-height": maxHeight, overflow: "auto" });
                mainContainer.css({ "height": maxHeight });
            }
            else {
                mainContainer.css({ "height": height });
            }
        }
        if (width > maxWidth && !maxWidthOverride) {
            mainContainer.css({ width: maxWidth, "max-width": maxWidth, overflow: "auto" });
        }
        else {
            mainContainer.css({ width: width });
        }
        $("." + POPUP_INNER_DIV_CLASS, mainContainer).css({ "padding": padding + "px" });


        $('body').delegate("#" + closeAnchorId, 'click', function (e) {
            e.preventDefault();
            $(this).parents("." + POPUP_OUTER_DIV_CLASS).hide();
            var withVisiblePopups = false;
            $("." + POPUP_OUTER_DIV_CLASS).each(function (i) {
                if ($(this).css("display").toLowerCase() !== "none") {
                    withVisiblePopups = true;
                }
            });
            if (!withVisiblePopups) {
                $.hideFormFiller();
            }
            if (hideProcessingBar) {
                $.hideProcessingBar();
            }
            if (hideValidationMessages) {
                $.hideValidationMessages();
            }
            if (hideActionMessage) {
                $.hideActionMessage();
            }

            if (onClose !== null && typeof onClose === "function") {
                try {
                    onClose();
                }
                catch (e) {
                }
            }
            lastFocus.focus();

        });


    }
    else {
        //mainContainer = $(this).parents("." + POPUP_OUTER_DIV_CLASS);
        innerContainer = $("." + POPUP_INNER_DIV_CLASS, mainContainer);
        innerContainer.find("#closeLink").remove();
        if (height != null) {
            if (height > maxHeight) {
                mainContainer.css({ "max-height": maxHeight, overflow: "auto" });
                mainContainer.css({ "height": maxHeight });
            }
            else {
                mainContainer.css({ "height": height });
            }
        }
        if (width > maxWidth && !maxWidthOverride) {
            mainContainer.css({ width: maxWidth, "max-width": maxWidth, overflow: "auto" });
        }
        else {
            mainContainer.css({ width: width });
        }
    }

    innerContainer.append(this);

    if (isDraggable || isDraggable == null) {
        try {
            //lightboxes should not be movable for now
            //mainContainer.draggable();
        }
        catch (e) {
            //JQuery UI must be referenced in order for this to work
        }
    }

    if ($(btnCloseElement).length > 0) {
        //hide close button, according to spec from Amanda, users can still close lightbox by clicking area outside
        if (hideCloseSecondaryBtn) {
            $(btnCloseElement).hide();
        }
        $(btnCloseElement).bind("click", function () {
            $("." + POPUP_CLOSE_BTN_CLASS, mainContainer).click();
            return false;
        });
    }

    lastFocus = document.activeElement;
    this.show();
    innerContainer.makeRoundCorner({ cornerRadius: 3 });

    if (src != null) {
        $(src).after(mainContainer);
    }
    mainContainer.hide().showEzPopup({ centerOnPage: true, duration: duration, centerOnPage: centerOnPage, baseWidth: baseWidth });
    mainContainer.css({ overflow: "" });
    mainContainer.show(0, function () {
        $.showFormFiller(hideCloseBtn == false, onClose);
    });

    var keyboardEvent = "keyup";
    $(this).unbind(keyboardEvent);
    $(this).bind(keyboardEvent, function (e) {
        if (submitOnEnter && e.keyCode == ENTER_KEY_CODE && $(e.target).attr("id") != $(btnSubmitElement).attr("id")) {
            $(btnSubmitElement).click();
        }
    });

    if (lightboxHelper.KeyPressedEventBound == false) {
        lightboxHelper.KeyPressedEventBound = true;
        $(document).bind(keyboardEvent, function (e) {
            if (e.keyCode == ESCAPE_KEY_CODE && hideCloseBtn == false) {
                $("." + POPUP_CLOSE_BTN_CLASS).each(function (i) {
                    if ($(this).parents("." + POPUP_OUTER_DIV_CLASS).css("display").toLowerCase() == "block") {
                        $(this).click();
                    }
                });
            }
        });
    }

    var label = $(mainContainer).find('h1, h2, h3, h4, h5, h6, [role="heading"]').first().text();
    mainContainer.attr('aria-label', label);
    //for accessibility, focus on first element that can receive focus
    //this has been modified to focus on first error if exists, otherwise focus on outermost div -SK
    if (skipFocus === false) {
        //A11Y - add aria-invalid to all errored fields
        var focusElements = "[aria-invalid=true]";

        if ($(focusElements, this).length > 0) {
            $(focusElements, this).eq(0).focus();
            try {
                $(this).scrollTop(0);
            }
            catch (e) {
            }
        }
        else {
            $('.EzPopopOuter').focus();
        }
    }
    else if (focusid) {
        $("#" + focusid).focus();
    }

    //Trap tabbing within lightbox
    var handleKeyDown = function (event) {

        var lbKeycodes = {
            TAB: 9,
            SHIFT: 16
        }

        if (event.keyCode !== lbKeycodes.TAB) {
            return;
        }

        var tabbables = $(mainContainer).find(':tabbable');

        // Safari will not do searches into an iFrame. So, we have to get the document object and
        // do the search on it.
        var iFrame = $(mainContainer).find('iframe');
        if (tabbables.length > 0 && iFrame.length > 0) {
            tabbables = $(iFrame[0].contentDocument).find(':tabbable, [data-modalfocus=true]');
        }

        var index = $.inArray(event.target, tabbables);
        if (index < 0) {
            return;
        }

        if (!event.shiftKey) {
            tabbables[(index + 1) % tabbables.length].focus(1);
        }
        else {
            tabbables[(index - 1 + tabbables.length) % tabbables.length].focus(1);
        }

        return false;
    };

    try {
        $(mainContainer).find('iframe')[0].contentDocument;

        $(mainContainer).find('iframe').load(function () {
            var $modalClose = $($(mainContainer).find('iframe')[0].contentDocument).find('[data-modalclose]');
            var closeModal = function () {
                $("#" + closeAnchorId).click();
                return false;
            }
            $modalClose.click(closeModal);
            $modalClose.bind('keypress', function (event) {
                if (event.keyCode === 96 || event.keyCode === 13) {
                    closeModal();
                }
            });

            $($(mainContainer).find('iframe')[0].contentDocument)
                      .find('body')
                      .bind('keydown', handleKeyDown);
        });
    }
    catch (e) { }

    $(mainContainer).bind('keydown', handleKeyDown);

    $('body').delegate('.EzPopopOuter', 'keydown', function (e) {
        if (e.which == 9 && e.shiftKey) {
            e.preventDefault();
        }
    });


    return mainContainer;
};

//end showLightBox function

jQuery.hideLightBoxes = function () {
    $("." + POPUP_OUTER_DIV_CLASS).hide();
};

jQuery.getHtml = function getHtml(param) {
    param = param || {};
    var width = param.width;
    var url = param.url;
    var container = param.container;
    var btnCloseElement = param.btnCloseElement;
    var btnCloseElementId = param.btnCloseElementId;
    var btnSubmitElement = param.btnSubmitElement;
    var submitOnEnter = param.submitOnEnter;
    var tables_forformatting = param.tables_forformatting;
    var popup = param.popup;
    var completeCallback = param.completeCallback;
    var afterCompleteCallback = param.afterCompleteCallback;
    var attachTo = param.attachTo;
    var height = param.height;
    var duration = param.duration;
    var centerOnPage = param.centerOnPage;
    var isDraggable = param != null && param.isDraggable != null ? param.isDraggable : true;
    var hideCloseBtn = param != null && param.hideCloseBtn != null ? param.hideCloseBtn : false;
    var hideCloseSecondaryBtn = param != null && param.hideCloseSecondaryBtn != null ? param.hideCloseSecondaryBtn : true;
    $.ajax({
        type: "POST",
        url: url,
        complete: function (response, textStatus) {
            switch (textStatus) {
                case "timeout":
                    $.showActionMessage(REQUEST_TIMED_OUT, true);
                    break;
                case "error":
                    $.showActionMessage(ERROR_ENCOUNTERED, true);
                    break;
                default:
                    if (completeCallback == null || completeCallback(response, textStatus)) {
                        if ($(container).length > 0) {
                            $(container).replaceWith(response.responseText);
                        }
                        else {
                            if (attachTo == null || attachTo.length == 0) {
                                attachTo = $("div").first();
                            }
                            if (attachTo == null || attachTo.length == 0) {
                                attachTo = $("body");
                            }
                            attachTo.after(response.responseText);
                            container = $(container);
                        }
                        if (btnCloseElement == null || $(btnCloseElement).length == 0) {
                            if (btnCloseElementId != null && btnCloseElementId != "") {
                                btnCloseElement = $("#" + btnCloseElementId);
                            }
                        }
                        if (popup == true) {
                            $(container).showLightBox({ width: width, btnCloseElement: btnCloseElement, btnSubmitElement: btnSubmitElement, height: height, duration: duration, src: attachTo, centerOnPage: centerOnPage, isDraggable: isDraggable, hideCloseBtn: hideCloseBtn, submitOnEnter: submitOnEnter, hideCloseSecondaryBtn: hideCloseSecondaryBtn });
                        }
                        $(tables_forformatting).formatEzTable({ isHeaderTextBold: true });

                        if (afterCompleteCallback != null) {
                            afterCompleteCallback();
                        }
                    }
            }
        }
    });
};

jQuery.showAboutDiscountCode = function (discountCode) {
    if (typeof (this.parent) !== "undefined") {
        this.parent.document.domain = 'alaskaair.com';
    }
    else if (typeof (this.document) !== "undefined") {
        this.document.domain = 'alaskaair.com';
    }
    else if (typeof (window.document) !== "undefined") {
            window.document.domain = 'alaskaair.com';
    }

    var divId = "divAboutDC_IF";
    var divIdJQ = "#" + divId;
    var ifrmId = "ifrmAboutDC";
    var ifrmIdJQ = "#" + ifrmId;

    var drawer = new SideDrawer('About discount codes', 'About discount codes');
    drawer.Show();

    if ($(divIdJQ).length === 0) {
        var html = "<div id='" + divId + "'><iframe id='" + ifrmId + "' title='About discount codes' height='700' tabindex='-1' frameborder='0' width='760' scrolling='auto' src='javascript:false;'></iframe></div>";
        // $("body").append(html);
        var drawerContent = document.createElement('div');
        drawerContent.innerHTML = html;
        drawer.TransferContent(drawerContent);
    }
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/shared/tips/AboutDiscountCodes.aspx?popup=true&referrer=lightbox&code=" + discountCode;
    $(ifrmIdJQ).attr({ src: url});
};

jQuery.showCodeOrNumberLB = function (src) {
    $.showLB(src, "www.alaskaair.com/help/CodeOrNumber", 380);
};

jQuery.showLB = function (src, url, width, height) {
    // width is required, but height is not
    // url has to point to the same domain as the page
    // Use this if close buttons (elements with id "Close") need to be hidden
    // Do not include protocol in url, but include domain (e.g. "www.alaskaair.com/content/...")
    var divId = "divLB";
    var divIdJQ = "#" + divId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;overflow:auto;'></div>";
        $("body").append(html);
    }
    if (!isNaN(height)) { $(divIdJQ).css({ height: height }); } else { $(divIdJQ).css({ height: "auto" }); }
    url = top.location.protocol + '//' + url;
    $.ajax({
        url: url,
        success: function (data) {
            $(divIdJQ).html(data);
            $(divIdJQ + ' #Close').hide();
            $(divIdJQ).showLightBox({
                src: src,
                width: width,
                maxWidthOverride: true,
                centerOnPage: true
            });
        }
    });
    
};

jQuery.showLB_IF = function (src, url, width, height) {
    // both width and height are required
    // Use this if the url points to another domain
    // Close buttons cannot be hidden because of the cross-domain issue
    // url may include protocol, but not required.  Always include domain.
    var divId = "divLB_IF";
    var divIdJQ = "#" + divId;
    var ifrmId = "ifrmLB_IF";
    var ifrmIdJQ = "#" + ifrmId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;'><iframe id='" + ifrmId + "' frameborder='0' tabindex='-1' scrolling='auto' src='javascript:false;'></iframe></div>";
        $("body").append(html);
    }
    $(divIdJQ).css({ width: width - 40, height: height });
    $(ifrmIdJQ).css({ width: width - 40, height: height });

    if (url.substring(4, 0).toLowerCase() != "http") {
        url = top.location.protocol + '//' + url;
    }
    $(ifrmIdJQ).attr({ src: url });
    $(divIdJQ).showLightBox({ src: src, width: width, maxWidthOverride: true, centerOnPage: true });
};
//end Lightbox Code

jQuery.fn.loadWidget = function (param) {
    var url = param.url;
    var containerSelector = param.containerSelector;
    var callback = param.callback;
    var localCallback = param.localCallback;
    var doPost = param.doPost != null ? param.doPost : false;
    var getOnce = param.getOnce != null ? param.getOnce : true;
    if (!getOnce || $(containerSelector).length === 0) {
        var me = $(this);
        if (doPost) {
            $.ajax({
                type: "POST",
                url: url,
                dataType: 'json',
                complete: function (response, textStatus) {
                    $(me).html(response.responseText);
                    if (callback != null) {
                        callback();
                    }
                    if (localCallback != null) {
                        localCallback();
                    }
                }
            });
        } else {
            $.get(url, function (data) {
                $(me).html(data);
                if (callback != null) {
                    callback();
                }
            });
        }
    } else {
        $(this).append($(containerSelector));
        callback();
    }
    return this;
};

jQuery.fn.loadVShoppingI = function (city) {
    var qs = BuildVShoppingQueryString(city, "?");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/deals/flightformlet" + qs;
    this.html("<iframe scrolling='no' frameborder='0' src='" + url + "'" + " title='Shopping' id='flightsFormletIframe' style='width:212px;'></iframe>");
    return this;
};

jQuery.fn.loadAuctionPartialI = function (auctionParams) {
    var qs = BuildAuctionQueryString(auctionParams, "?");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/auctions/auctionformlet" + qs;
    this.html("<iframe scrolling='no' frameborder='0' src='" + url + "'" + " title='Auctions' id='auctionFormletIframe' style='width:930px;height:450px'></iframe>");

    return this;
};


jQuery.fn.loadVAwardShoppingI = function (city) {
    var qs = BuildVShoppingQueryString(city, "&");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/deals/flightformlet?shoppingmethod=onlineaward" + qs;
    this.html("<iframe scrolling='no' frameborder='0' src='" + url + "' title='Award Shopping' id='awardsFormletIframe' style='width:212px;'></iframe>");
    return this;
};

jQuery.fn.loadVShopping = function (onload, city) {
    var qs = BuildVShoppingQueryString(city, "&");
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    var url = protocol + asglobal.domainUrl + "/deals/flightformlet?njqry=yes" + qs;
    return $(this).loadWidget({ url: url, containerSelector: WidgetContainers.Selectors.V, callback: onload, doPost: true, localCallback: function () {
        try {
            vShopping.InitializeControls(); //vShopping is in VShopping.js
        }
        catch (e) {
            alert("reference to VShopping.js could be missing");
        }
    }
    });
};

function BuildVShoppingQueryString(city, prefix) {
    var qs = (city != null && city != "" ? "D=" + city : "");
    if (qs == "") {
        qs = window.location.search.substring(1);
        if (qs == null) { qs = ""; }
    }
    if (qs != "") { qs = prefix + qs; }
    return qs;
}


function BuildAuctionQueryString(params, prefix) {

    var qs = "";
    if (params != null && params != "") {

        qs = "ID=" + params.AuctionId;
        qs += "&SD=" + params.StartDate;
        qs += "&ED=" + params.EndDate;
        qs += "&MB=" + params.MinimumBid;
        qs += "&T=" + params.Title;
    }

    if (qs == "") {
        qs = window.location.search.substring(1);
        if (qs == null) { qs = ""; }
    }
    if (qs != "") { qs = prefix + qs; }
    return qs;
}

jQuery.fn.loadPBShopping = function (onload) {
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    return $(this).loadWidget({ url: protocol + asglobal.domainUrl + "/planbook/ShoppingWidget?njqry=yes", containerSelector: WidgetContainers.Selectors.P, callback: onload, doPost: true });
};

jQuery.fn.loadPBHotel = function (onload) {
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    return $(this).loadWidget({ url: protocol + asglobal.domainUrl + "/deals/hoteloffers/HotelFormlet?njqry=yes", doPost: false, getOnce: true, containerSelector: WidgetContainers.Selectors.H, callback: onload });
};

jQuery.fn.loadPBCar = function (onload) {
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    return $(this).loadWidget({ url: protocol + asglobal.domainUrl + "/planbook/CarWidget?njqry=yes", doPost: true, getOnce: false, containerSelector: WidgetContainers.Selectors.H, callback: onload });
};

function vacWidgetCallback(height) {
    $("#vacationFormletIframe").css({ height: height + 20 });
    $(document).scrollTop($(document).scrollTop());
}

function showTips(url, width) {
    var divId = "divLB";
    var divIdJQ = "#" + divId;
    if ($(divIdJQ).length == 0) {
        var html = "<div id='" + divId + "' style='display:none;overflow:auto;'></div>";
        $("body").append(html);
    }
    var protocol = (top.location.protocol ? top.location.protocol : "http:") + "//";
    $.get(protocol + url, function (data) {
        $(divIdJQ).html(data);
        $(divIdJQ + " img").hide();
        $(divIdJQ).showLightBox({ width: width }).show();
    });
}

var flightWidgetAF = new FlightWidgetAF();
function FlightWidgetAF() {
    this.ShowAboutCT = function () {
        var fareOptions = ',MILEAGEUPG,GOLDUPG,MVPUPG,GUESTUPG';
        if ($('#fareOptions').length > 0) {
            fareOptions = $('#fareOptions').val();
        }

        var drawer = new SideDrawer('Upgrade types', 'Upgrade types');
        drawer.Show();
        var drawerContent = document.createElement('div');
        $.get('//' + asglobal.domainUrl + '/shopping/flights/AboutFareOptions?options=' + fareOptions, function (data) {
            drawerContent.innerHTML = data;
            drawer.TransferContent(drawerContent);
        });
    };

    this.ShowAwardOptions = function () {
        var drawer = new SideDrawer('Award Options', 'Award Options');
        drawer.Show();
        var drawerContent = document.createElement('div');
        $.get('//' + asglobal.domainUrl + '/AwardAdvisory/AboutAwardOptions', function (data) {
            drawerContent.innerHTML = data;
            drawer.TransferContent(drawerContent);
        });

    };

    this.ShowAboutInfantCT = function () {
        var drawer = new SideDrawer('', '');
        drawer.Show();
        var drawerContent = document.createElement('div');
        var hiddenStyle = '<style type="text/css">.slideout-hidden {display:none}</style> ';  //workaround for adding css style to iframe so it takes effect.
        var infantData = '';
        $.get('//' + asglobal.domainUrl + '/content/travel-info/policies/traveling-with-lap-infants/_lap-infants', function (data) {
            infantData = data;
            $.get('//' + asglobal.domainUrl + '/content/travel-info/policies/children-infants-and-children/_common/_free-baggage', function (data) {
                drawerContent.innerHTML = hiddenStyle + infantData + data;
                drawer.TransferContent(drawerContent);
            });
        });

    };

    this.ShowAboutContractFares = function () {
        var contractFares_LB_Id = "contractFares_LB";
        var contractFares_LB_CSS = "#" + contractFares_LB_Id;
        if ($(contractFares_LB_CSS).length == 0) {
            $("body").append("<div id=" + contractFares_LB_Id + "></div>");
            var protocol = "http:";
            protocol = (top.location.protocol ? top.location.protocol : protocol) + "//";
            $.get(protocol + asglobal.domainUrl + "/shared/tips/aboutcompanyfares.aspx", function (data) {
                $(contractFares_LB_CSS).html(data);
                showLightBox();
            });
        }
        else {
            showLightBox();
        }
        function showLightBox() {
            $(contractFares_LB_CSS).showLightBox({ width: 300 }).show();
        }
    };

    this.ShowUMNROptions = function () {
        var umnrOptions_LB_Id = "umnrOptions_LB",
            umnrOptions_LB_CSS = "#" + umnrOptions_LB_Id;

        $(umnrOptions_LB_CSS).remove();

        $("body").append("<div id=" + umnrOptions_LB_Id + "></div>");
        $(umnrOptions_LB_CSS).html($("#flightsFormletIframe").contents().find("#divUMNR-container").clone().html());
        $("#divUMNR").show();
        $("#submitUMNRRequest").attr('onclick', '').undelegate();
        $("#divUMNR").delegate("#submitUMNRRequest", "click", wireUp);

        showLightBox();

        function showLightBox() {
            $(umnrOptions_LB_CSS).showLightBox({ width: 460 }).show();
        }

        function wireUp() {
            if (!$("#umnrYes").get(0).checked && !$("#umnrNo").get(0).checked) {
                $("#divNoRequiresUmnrService").show();
                return;
            }
            $("#flightsFormletIframe").contents().find("#umnrYes").get(0).checked = $("#umnrYes").get(0).checked;
            $("#flightsFormletIframe").contents().find("#umnrNo").get(0).checked = $("#umnrNo").get(0).checked;

            $("#flightsFormletIframe").contents().find("#submitUMNRRequest").click();
        }
    };
}


//start bubble code

var closeOnClickBound = false;

jQuery.fn.hideBubble = function () {
    $(this).parents('.bubble-new').hide();
    return this;
}

jQuery.fn.showBubble = function (param, e) {
    param = param || {};
    param.orientation = param.orientation || 1; //1 - pointup, 2 - pointdown, 3 - pointleft, 4 pointright

    if (param.orientation == 1 || param.orientation == 2) {
        param.pointDown = param.orientation == 2;
        $(this).showBubbleV(param, e);
    }
    else if (param.orientation == 3 || param.orientation == 4) {
        param.pointLeft = param.orientation == 3;
        $(this).showBubbleH(param, e);
    }
    else {
        param.pointDown = false;
        $(this).showBubbleV(param, e);
    }
    return this;
}

jQuery.fn.showBubbleV = function (param, e) {
    var me = this;

    param = param || {};
    param.width = param.width != null ? param.width : 200;
    param.offsetLeft = param.offsetLeft != null ? param.offsetLeft : 0;
    param.pointDown = param.pointDown != null ? param.pointDown : false;
    if (param.src == null) param.src = event;

    $('.bubble-new').hide(); //hide all bubbles first
    //calculate widths
    var padding = 10;
    var borderWidth = 3;
    var pointerWidth = 28;
    var leftWidth = Math.round((param.width - pointerWidth) / 2 + (padding + borderWidth));
    var rightWidth = leftWidth;
    var bubbleWidth = leftWidth + rightWidth + pointerWidth;
    var pointerHeight = 18;
    var bottomPointerHeight = 28;
    var contentWidth = bubbleWidth - (padding * 2) - borderWidth;

    //end calculate widths
    var borderStyle = borderWidth + 'px solid #82A3D1';
    var borderRadius = 8;
    var fillerMarginTop = -18;

    function protocol() {
        var protocol = "http:";
        protocol = (window.location.protocol ? window.location.protocol : protocol) + "//";
        return protocol;
    }
    var alaskaUrl = protocol() + 'www.alaskaair.com';

    if ($(this).parents('.bubble-new').length == 0) {
        var suffix = GetRandomId();
        var html = '<style type="text/css">.containerx .bubble-new, .containerx .bubble-new *{margin:0;padding:0;z-index:999999999}</style>';
        html = '<div class="bubble-new" id="bubble' + suffix + '" style="position:absolute;">';
        html += '   <div id="close' + suffix + '" class="bubble-close" style="cursor:pointer; display:none; margin-left:' + (bubbleWidth - 10) + 'px;position:absolute; width:30px; height:30px; background:url(/images/Popup_Close_X.png) no-repeat; overflow:hidden;" tabindex="0" role="button"><span class="hidden">Close</span></div>';
        html += '	<div style="clear:both;width:' + bubbleWidth + 'px;" class="bubble-top" id="bubbletop' + suffix + '">';
        html += '		<div style="float:left; width:' + leftWidth + 'px;" class="bubble-top-left">';
        html += '           <div style="clear:both;height:15px;"></div><div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-left:' + borderStyle + ';border-top:' + borderStyle + ';border-top-left-radius: ' + borderRadius + 'px;-moz-border-radius-topleft:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '		<div style="float:left; width:' + pointerWidth + 'px;">';
        html += '		    <div class="bubble-pointer" style="float:left;background:no-repeat bottom; background-image:url(' + alaskaUrl + '/content/~/media/Images/onSite/backgrounds/clippy_pointer_up);width:' + pointerWidth + 'px; height:' + pointerHeight + 'px;"></div><div style="clear:both;height:10px;background-color:white;"></div>';
        html += '		</div>';
        html += '		<div style="float:left; width:' + leftWidth + 'px;" class="bubble-top-right">';
        html += '           <div style="clear:both;height:15px;"></div><div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-right:' + borderStyle + ';border-top:' + borderStyle + ';border-top-right-radius: ' + borderRadius + 'px;-moz-border-radius-topright:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '	</div>';
        html += '	<div class="bubble-content" style="-webkit-box-shadow: #999 3px 3px 3px;-moz-box-shadow:3px 3px 3px #999999;background-color:white;width:' + contentWidth + 'px;border-left:' + borderStyle + '; border-right:' + borderStyle + '; border-bottom:' + borderStyle + '; clear:both;border-bottom-left-radius: ' + borderRadius + 'px;border-bottom-right-radius: ' + borderRadius + 'px; padding:' + padding + 'px;" id="bubblecontent' + suffix + '">';
        html += '	</div>';
        html += '	<div style="display:none;clear:both;width:' + bubbleWidth + 'px;" class="bubble-bottom" id="bubblebottom' + suffix + '">';
        html += '		<div style="float:left; width:' + leftWidth + 'px; height:15px;" class="bubble-bottom-left">';
        html += '           <div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-left:' + borderStyle + ';border-bottom:' + borderStyle + ';border-bottom-left-radius: ' + borderRadius + 'px;-moz-border-radius-bottomleft:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '		<div class="bubble-pointer" style="float:left;background-color:white;background:no-repeat bottom; background-image:url(' + alaskaUrl + '/content/~/media/Images/onSite/backgrounds/clippy_pointer_down);width:' + pointerWidth + 'px; height:' + (bottomPointerHeight - 1) + 'px;">&nbsp;<div style="position:absolute; margin-top:' + fillerMarginTop + 'px; background:white;width:42px;height:10px;"></div></div>';
        html += '		<div style="float:left; width:' + leftWidth + 'px; height:15px;" class="bubble-bottom-right">';
        html += '           <div style="background-color:white;width:' + leftWidth + 'px; height:10px; border-right:' + borderStyle + ';border-bottom:' + borderStyle + ';border-bottom-right-radius: ' + borderRadius + 'px;-moz-border-radius-bottomright:' + borderRadius + 'px;"></div>';
        html += '		</div>';
        html += '	</div>';
        html += '</div>';
        $(this).before(html);
        $(this).css({ position: 'static' });
        $('#bubblecontent' + suffix).attr({ totalWidth: (leftWidth * 2) });
        $('#bubblecontent' + suffix).append('<div class="clear"></div>').append(this).append('<div class="clear"></div>');
        $(this).show().css({ 'z-index': 999 });
    }
    $(this).parents('.bubble-new').show();
    $('.bubble-new').css('z-index', '99999999');

    //calculate position
    var offsetTop = 5;
    var srcTop = $(param.src).offset().top;
    var top = srcTop + $(param.src).height() + offsetTop;
    if (top < 0) top = 0;
    //check to see if bubble is partially hidden, if yes adjust top

    var bubbleDiv = $(this).parents('.bubble-new');
    var bubbleClose = $(".bubble-close", bubbleDiv);
    var bubbleTop = $(".bubble-top", bubbleDiv);
    var bubbleBottom = $(".bubble-bottom", bubbleDiv);
    var bubbleContent = $(".bubble-content", bubbleDiv);
    var bubbleTopLeft = $(".bubble-top-left", bubbleDiv);
    var bubbleTopRight = $(".bubble-top-right", bubbleDiv);
    var bubbleBottomLeft = $(".bubble-bottom-left", bubbleDiv);
    var bubbleBottomRight = $(".bubble-bottom-right", bubbleDiv);
    var bubbleHeight = bubbleDiv.height();
    var bubbleBottomPos = top + bubbleHeight;
    var bubbleTopPos = srcTop - bubbleHeight;
    var bottomPagePos = $(document).scrollTop() + getVisibleHeight();
    var leftPagePos = $(document).scrollLeft() + getVisibleWidth();
    var pointDown = (param.pointDown && bubbleTopPos > $(document).scrollTop()) || bubbleBottomPos > bottomPagePos;
    if (pointDown) {
        top = srcTop - bubbleHeight - offsetTop;
        $(bubbleContent).css({ 'border-bottom': 'none', 'border-top': borderStyle });
        $(bubbleContent).css({ 'border-top-left-radius': borderRadius, 'border-top-right-radius': borderRadius });
        $(bubbleContent).css({ 'border-bottom-left-radius': 0, 'border-bottom-right-radius': 0 });
        $(bubbleContent).css({ '-moz-border-radius-topleft': borderRadius, '-moz-border-radius-topright': borderRadius });
        $(bubbleContent).css({ '-moz-border-radius-bottomleft': 0, '-moz-border-radius-bottomright': 0 });
        $(bubbleBottom).show();
        $(bubbleTop).hide();
        $(bubbleClose).css({ 'margin-top': -10 });
    }
    else {
        $(bubbleContent).css({ 'border-top': 'none', 'border-bottom': borderStyle });
        $(bubbleContent).css({ 'border-bottom-left-radius': borderRadius, 'border-bottom-right-radius': borderRadius });
        $(bubbleContent).css({ 'border-top-left-radius': 0, 'border-top-right-radius': 0 });
        $(bubbleContent).css({ '-moz-border-radius-bottomleft': borderRadius, '-moz-border-radius-bottomright': borderRadius });
        $(bubbleContent).css({ '-moz-border-radius-topleft': 0, '-moz-border-radius-topright': 0 });
        $(bubbleBottom).hide();
        $(bubbleTop).show();
        $(bubbleClose).css({ 'margin-top': 5 });
    }
    var left = Math.round($(param.src).offset().left + $(param.src).width() / 2 - (bubbleWidth) / 2 + borderWidth) + param.offsetLeft;
    if (left < 0) left = 0;
    if (left < $(document).scrollLeft()) {
        left = $(document).scrollLeft();
    }
    if (left + bubbleDiv.width() > leftPagePos) {
        left = Math.round(leftPagePos - bubbleDiv.width());
    }
    //end calculate position
    adjustPointerPosition();

    function adjustPointerPosition() {
        var totalWidth = parseInt($(bubbleContent).attr('totalWidth'));
        var newLeftWidth = Math.round($(param.src).offset().left - left + $(param.src).width() / 2 - pointerWidth / 2);
        var newRightWidth = totalWidth - newLeftWidth;

        $(bubbleTopLeft).css({ width: newLeftWidth });
        $(bubbleBottomLeft).css({ width: newLeftWidth });
        $('div', bubbleTopLeft).css({ width: newLeftWidth });
        $('div', bubbleBottomLeft).css({ width: newLeftWidth });

        $(bubbleTopRight).css({ width: newRightWidth });
        $(bubbleBottomRight).css({ width: newRightWidth });
        $('div', bubbleTopRight).css({ width: newRightWidth });
        $('div', bubbleBottomRight).css({ width: newRightWidth });
    }

    $(bubbleDiv).css({ top: top, left: left }).show();
    generateBubbleEvents(e, param, this, bubbleDiv, bubbleClose);


    function GetRandomId() {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();

        return curr_hour + "_" + curr_min + "_" + curr_sec + Math.floor(Math.random() * 1111);
    }
    function getVisibleHeight() {
        return $(document).height() > $(window).height() ? $(window).height() : $(document).height();
    }
    function getVisibleWidth() {
        return $(document).width() > $(window).width() ? $(window).width() : $(document).width();
    }

    return this;
}

jQuery.fn.showBubbleH = function (param, e) {
    param = param || {};
    param.width = param.width != null ? param.width : 200;
    param.height = param.height != null ? param.height : 200;
    param.offsetLeft = param.offsetLeft != null ? param.offsetLeft : 0;
    param.pointLeft = param.pointLeft != null ? param.pointLeft : false;
    if (param.src == null) param.src = event;

    var pointerWidth = 18;
    var width15 = 15;
    var width10 = 15;

    $('.bubble-new').hide(); //hide all bubbles first
    if ($(this).parents('.bubble-ltr').length === 0) {
        var suffix = GetRandomId();
        var html = '';
        html += '<style type="text/css">';
        html += '    .containerx .left{float:left;}';
        html += '    .containerx .bgwhite{background:white;}';
        html += '    .containerx .bubble-new{position:absolute; z-index: 9999999;}';
        html += '    .containerx .bubble-width15{width:15px;}';
        html += '    .containerx .bubble-width10{width:10px;}';
        html += '    .containerx .bubble-r_topleft{border-left:solid 3px #82A3D1;border-top:solid 3px #82A3D1;border-top-left-radius: 6px;-moz-border-radius-topleft:6px;}';
        html += '    .containerx .bubble-r_bottomleft{border-left:solid 3px #82A3D1;border-bottom:solid 3px #82A3D1;border-bottom-left-radius: 6px;-moz-border-radius-bottomleft:6px;}';
        html += '    .containerx .bubble-r_topright{border-right:solid 3px #82A3D1;border-top:solid 3px #82A3D1;border-top-right-radius: 6px;-moz-border-radius-topright:6px;}';
        html += '    .containerx .bubble-r_bottomright{border-right:solid 3px #82A3D1;border-bottom:solid 3px #82A3D1;border-bottom-right-radius: 6px;-moz-border-radius-bottomright:6px;}';
        html += '    .containerx .bubble-content{border-top:solid 3px #82A3D1;border-bottom:solid 3px #82A3D1; padding:0px;}';
        html += '    .containerx .bubble-shadow{-webkit-box-shadow: #999 3px 3px 3px;-moz-box-shadow:3px 3px 3px #999999}';
        html += '</style>';
        html += '<div class="bubble-new bubble-ltr">';
        html += '    <div id="close' + suffix + '" class="bubble-close" style="text-align:left; clear:both; cursor:pointer; display:none; margin-top:-10px; width:' + (parseInt(param.width) + 54) + 'px;position:absolute; left:0;height:30px; background:url(/images/Popup_Close_X.png) no-repeat center right; overflow:hidden;" tabindex="0" role="button"><span class="hidden">Close</span></div>';
        html += '    <div class="left buble-left">';
        html += '        <div style="clear:both;" class="bubble_lt" id="bubble_lt' + suffix + '">';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width10 bubble-r_topleft left bgwhite" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_lc" id="bubble_lc' + suffix + '">';
        html += '	        <div class="left" style="background:url(/content/~/media/Images/onSite/backgrounds/clippy_pointer_left) no-repeat center right; width:18px; height:30px;"></div>';
        html += '	        <div class="bubble-width10 left bgwhite"></div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_lb" id="bubble_lb' + suffix + '">';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width10 bubble-r_bottomleft left bgwhite" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '    </div>';
        html += '    <div class="left bubble-content bgwhite bubble-shadow" style="height:130px; width:100px;" id="bubble_content' + suffix + '">';
        html += '    </div>';
        html += '    <div class="left buble-right">';
        html += '        <div style="clear:both;" class="bubble_rt" id="bubble_rt' + suffix + '">';
        html += '	        <div class="bubble-width10 bubble-r_topright left bgwhite bubble-shadow" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_rc" id="bubble_rc' + suffix + '">';
        html += '	        <div class="bubble-width10 left bgwhite">&nbsp;</div>';
        html += '	        <div class="left bgwhite" style="background:url(/content/~/media/Images/onSite/backgrounds/clippy_pointer_left) no-repeat center right; width:18px; height:30px;-moz-transform: scaleX(-1);-o-transform: scaleX(-1);-webkit-transform: scaleX(-1);transform: scaleX(-1);filter: FlipH;-ms-filter: \'FlipH\';"></div>';
        html += '        </div>';
        html += '        <div style="clear:both;" class="bubble_rb" id="bubble_rb' + suffix + '">';
        html += '	        <div class="bubble-width10 bubble-r_bottomright left bgwhite bubble-shadow" style="height:50px;">&nbsp;</div>';
        html += '	        <div class="bubble-width15 left" style="height:50px;">&nbsp;</div>';
        html += '        </div>';
        html += '    </div>';
        html += '</div>';
        $(this).before(html);
        $(this).css({ position: 'static' });
        $('#bubble_content' + suffix).append('<div class="clear">&nbsp;</div>').append(this).append('<div class="clear">&nbsp;</div>');
        $(this).show().css({ 'z-index': 999 });
        var $bubble_ltr = $(this).parents('.bubble-ltr');
        $bubble_ltr.css({ width: param.width + (width10 + width15) * 2 });
        $bubble_ltr.show().attr({ height: $bubble_ltr.height() });
    }

    var pointLeft = param.pointLeft;

    var $bubble_new = $(this).parents('.bubble-ltr');
    var $bubble_close = $('.bubble-close', $bubble_new);
    var $bubble_lt = $('.bubble_lt', $bubble_new);
    var $bubble_lc = $('.bubble_lc', $bubble_new);
    var $bubble_lb = $('.bubble_lb', $bubble_new);
    var $bubble_left = $('.bubble-left', $bubble_new);
    var $bubble_content = $('.bubble-content', $bubble_new);
    var $bubble_right = $('.bubble-left', $bubble_new);
    var $bubble_rt = $('.bubble_rt', $bubble_new);
    var $bubble_rc = $('.bubble_rc', $bubble_new);
    var $bubble_rb = $('.bubble_rb', $bubble_new);

    var lt_height = 0;
    var lc_height = 0;
    var lb_height = 0;
    var rt_height = 0;
    var rc_height = 0;
    var rb_height = 0;
    var offsetLeft = 10;
    var pointerHeight = 28;
    var borderWidth = 3;
    var bubbleComputedHeight = param.height + 2 * borderWidth;
    var srcTop = $(param.src).offset().top + Math.round($(param.src).height() / 2);
    var srcLeft = $(param.src).offset().left;
    var left = 0;
    //start calculate top
    var top = srcTop - Math.round(param.height / 2) - 2 * borderWidth;
    if (top < 0) top = 0;
    if (top < $(document).scrollTop()) top = $(document).scrollTop();
    if (top + bubbleComputedHeight > $(document).scrollTop() + getVisibleHeight()) {
        top = $(document).scrollTop() + getVisibleHeight() - bubbleComputedHeight;
    }
    if (top < 0) top = 0;
    if (top + Math.round(pointerHeight / 2) > srcTop) {
        top -= Math.round(pointerHeight / 2);
    }
    if (srcTop + Math.round(pointerHeight / 2) > $(document).scrollTop() + getVisibleHeight()) {
        top += pointerHeight;
    }
    //end calculate top

    if (pointLeft == true) {
        if (srcLeft + $(param.src).width() + $bubble_new.width() > $(document).scrollLeft() + getVisibleWidth()) {
            pointLeft = false;
        }
    }

    if ((srcLeft - param.width - $(param.src).width()) < $(document).scrollLeft()) {
        pointLeft = true;
    }

    if (pointLeft == true) {
        left = srcLeft + $(param.src).width();
        lc_height = pointerHeight;
        rc_height = 0;
    } else {
        lc_height = 0;
        rc_height = pointerHeight;
        left = srcLeft - $bubble_new.width();
    }

    var paramHeight = param.height;

    lt_height = srcTop - top - lc_height / 2;
    lb_height = paramHeight - lt_height - lc_height;

    rt_height = srcTop - top - rc_height / 2;
    rb_height = paramHeight - rt_height - rc_height;

    $bubble_content.css({ height: paramHeight, width: param.width });
    $('div', $bubble_lt).css({ height: lt_height });
    $('div', $bubble_lb).css({ height: lb_height });
    $('div', $bubble_lc).css({ height: lc_height });
    $('div', $bubble_rt).css({ height: rt_height });
    $('div', $bubble_rb).css({ height: rb_height });
    $('div', $bubble_rc).css({ height: rc_height });

    $bubble_new.css({ top: top, left: left });
    $(this).parents('.bubble-new').show();

    generateBubbleEvents(e, param, this, $bubble_new, $bubble_close, 2);
    function GetRandomId() {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();

        return curr_hour + "_" + curr_min + "_" + curr_sec + Math.floor(Math.random() * 1111);
    }
    function getVisibleHeight() {
        return $(document).height() > $(window).height() ? $(window).height() : $(document).height();
    }
    function getVisibleWidth() {
        return $(document).width() > $(window).width() ? $(window).width() : $(document).width();
    }
};

function generateBubbleEvents(e, param, content, bubbleDiv, bubbleClose, view) {
    if (e != null && e.type != null && e.type == 'click') {
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        param.mouseOutHide = false;
    }
    else {
    	//enable click for touch users
    	if ($(param.src).attr("bubble_click") == "true") {
    		$(param.src).unbind("click");
    	}
        $(param.src).bind("click", function (e) {
            $(param.src).unbind("mouseout");
            if (view == null || view == 1) {
                $(content).showBubble({ width: param.width, src: $(this), offsetLeft: param.offsetLeft, mouseOutHide: false }, e)
            }
            else {
                $(content).showBubbleH({ width: param.width, height: param.height, src: $(this), pointLeft: param.pointLeft, mouseOutHide: false }, e)
            }
        });
        $(param.src).attr({ "bubble_click": "true" });
    }

    if (param.mouseOutHide == null || param.mouseOutHide != false) {
        $(bubbleClose).hide();
        $(param.src).bind("mouseout", function () {
            $(bubbleDiv).hide();
        });
    } else {
        $(bubbleClose).show().bind('click', function () {
            $(bubbleDiv).hide();
        });
    }

    if (closeOnClickBound == false) {
        $(document).bind('click', function (e) {
            $('.bubble-new').hide();
        });
        $(window).bind('resize', function (e) {
            $('.bubble-new').hide();
        });
        closeOnClickBound = true;
    }
    $(bubbleDiv).bind('click', function (e) {
        if (!e) {
            e = window.event;
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    });
    $(param.src).bind('click', function (e) {
        if (!e) {
            e = window.event;
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    });
}

//end bubble code

// this is for Cake, starting Aug, 2013
function Cake() {
    this.init = function () {
        var params = _getQuerystringParams(window.location.search);
        // cake param found, then store it in cookie to create pixel and/or to perform postback
        if (params.hasOwnProperty('cake')) {
            _setCookie("cake", params.cake, 7);
        }
    }

    // only called when transaction is completed successfully
    // https://alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment
    // https://www.alaskaair.com/booking/payment
    this.insertCakeConversionPixels = function () {
        var cake = JSON.parse(unescape(as.CakeTag.SourceCookie)),
            cakePixelUrl = "//astrks.com/p.ashx?f=img&r=" + cake.ri + "&o=" + cake.oi + "&t=" + as.CakeTag.RecordLocator + "&p=" + as.CakeTag.TotalBaseFare;

        _insertPixel(cakePixelUrl);
    }

    function _insertPixel(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    }

    function _setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : ";domain=" + document.domain + ";path=/; expires=" + exdate.toGMTString());
        document.cookie = c_name + "=" + c_value;
    }

    function _getQuerystringParams(querystring) {
        var qs = unescape(querystring);

        // document.location.search is empty if no query string
        if (!qs) {
            return {};
        }

        // Remove the '?' via substring(1)
        if (qs.substring(0, 1) == "?") {
            qs = qs.substring(1);
        }

        // Load the key/values of the return collection
        var qsDictionary = {};

        // '&' seperates key/value pairs
        var pairs = qs.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var keyValuePair = pairs[i].split("=");
            qsDictionary[keyValuePair[0]] = keyValuePair[1];
        }

        // Return the key/value dictionary
        return qsDictionary;
    }
}

if (typeof (as) != "undefined") {
    as.cake = new Cake();
    as.cake.init();
}

'use strict'

function SuperPixelController(opts) {
    var repo = (typeof (opts) != "undefined" && opts.hasOwnProperty("repo")) ? opts.repo : undefined,
        log = (typeof (window.as) != "undefined" && window.as.hasOwnProperty("Environment") && window.as.Environment != "prod") ? true : false,
        superPixelPageMapping = {
            pageNameOriginal: ["Home:Home",
                                "Shopping:MatrixAvailability",
                                "Shopping:CalendarAvailability",
                                "Shopping:BundledAvailability",
                                "Shopping:cart",
                                "booking:reservation",
                                "206:about-easybiz-test",
                                "EasyBiz:/Enrollment/WelcomeConfirm^EasyBiz",
                                "MainMileagePlan:UCMyAccountCreate",
                                "MyASSignedIn:Profile:Overview & Tier Status"],
            pageNameToBeSubstituted: ["Home",
                                        "Search",
                                        "Search",
                                        "Search",
                                        "Cart",
                                        "Purchase",
                                        "EBInfo",
                                        "EBEnroll",
                                        "MPInfo",
                                        "MPEnroll"],
            conditionMet: function (key) {
                var result = false;

                if ($.inArray(key, superPixelPageMapping.pageNameOriginal) != -1) {
                    result = true;

                    if (key == "Shopping:BundledAvailability") {
                        result = (repo.hasOwnProperty("formstate") && repo.formstate != "/Shopping/ReissueFlights") ? true : false;
                    }
                    if (key == "MyASSignedIn:Profile:Overview & Tier Status") {
                        result = (repo.hasOwnProperty("MAAP") && repo.MAAP.isNewMember == "True") ? true : false;
                    }
                    if (key == "booking:reservation") {
                        result = (repo.hasOwnProperty("formstate") && repo.formstate == "reservation^NewPurchase") ? true : false;
                    }
                }

                return result;
            }
        };

    var console = window.console || { log: function () { }, dir: function () { } };

    this.createSuperPixel = function () {
        var url = "//googleads.g.doubleclick.net/pagead/viewthroughconversion/1054000976/?value=0&label=Pf7ICLiz5wMQ0I7L9gM&guid=ON&script=0&data=";

        if (typeof (repo) == "undefined") {
            repo = {};
            if (typeof (window.as) != "undefined" && window.as.hasOwnProperty("Page")) {
                repo = window.as.Page;
            }
        }

        if (typeof (repo) != "undefined" && repo.hasOwnProperty("pagename") && superPixelPageMapping.conditionMet(repo.pagename)) {
            _insertPixel(url);
        }
    };

    function _insertPixel(url) {
        var superPixelParams = _populateSuperPixelParams(),
            img = document.createElement('img');

        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url + superPixelParams);
        document.body.appendChild(img);

        if (log) { _log("Generated pixel url was : " + url + superPixelParams); }

        function _populateSuperPixelParams() {
            var params = '',
                v = new VisitorRepository().PopulateVisitor();

            params += "flight_pagetype=" + superPixelPageMapping.pageNameToBeSubstituted[$.inArray(repo.pagename, superPixelPageMapping.pageNameOriginal)];

            if (repo.hasOwnProperty("SP")) {
                var adtCount = ((repo.SP.paxADTCount == "ZERO") ? "0" : repo.SP.paxADTCount).toString(),
                    chdCount = ((repo.SP.paxCHDCount == "ZERO") ? "0" : repo.SP.paxCHDCount).toString();

                params += ";flight_originid=" + repo.SP.origin;
                params += ";flight_destid=" + repo.SP.destination;
                params += ";flight_startdate=" + _getFormattedData(repo.SP.outDate);
                if (repo.SP.inDate != '' && repo.SP.journeyType != "OW")
                    params += ";flight_enddate=" + _getFormattedData(repo.SP.inDate);
                params += ";flight_faretype=ADT-" + adtCount + ",CHD-" + chdCount;
                params += ";flight_itinerarytype=" + repo.SP.journeyType;
            }
            if (repo.hasOwnProperty("BP")) {
                params += ";flight_originid=" + repo.BP.origin;
                params += ";flight_destid=" + repo.BP.destination;
                params += ";flight_startdate=" + _getFormattedData(repo.BP.outDate);
                if (repo.BP.inDate != '' && repo.BP.journeyType != "OW")
                    params += ";flight_enddate=" + _getFormattedData(repo.BP.inDate);
                params += ";flight_itinerarytype=" + repo.BP.journeyType;
            }
            if (repo.hasOwnProperty("CP") && repo.CP.inCart != '')
                params += ";cart_contents=" + repo.CP.inCart.split('').join(',');

            if (v.hasOwnProperty("tier") && v.hasOwnProperty("hasInsiderSubscription")) {
                params += ";tier=" + v.tier;
                params += ";subscription=" + v.hasInsiderSubscription;
            }
            if (repo.hasOwnProperty("PP") && repo.PP.fop != '') {
                params += ";fop=" + repo.PP.fop;
            }

            function _getFormattedData(mdyDateString) {
                var result = '', mdy = mdyDateString.split('/');
                if (mdy.length == 3) {
                    var year = mdy[2], month = (mdy[0] > 9) ? mdy[0] : "0" + mdy[0].toString(), day = (mdy[1] > 9) ? mdy[1] : "0" + mdy[1].toString(),
                result = year + "-" + month + "-" + day;
                }
                return result;
            }

            return escape(params);
        }

        function _log(message) {
            var replaceSemiColon = new RegExp(";", "gi"),
                replaceEqualTo = new RegExp("=", "gi"),
                params = unescape(superPixelParams),
                paramStr = (params != "") ? '{\"' + params.replace(replaceSemiColon, '\",\"').replace(replaceEqualTo, '\":\"') + '\"}' : '',
                paramJSON = (paramStr != "") ? JSON.parse(paramStr) : {};

            console.log(message);
            console.log(paramJSON);
        }
    }
}

if (typeof (as) != "undefined" && as.IsSuperPixelDown == false) {
    as.superPixel = {};
    as.superPixel.ctrl = new SuperPixelController();
}

// this is for WDCW Campaign, starting Apr, 2013
function Wdcw() {
    var _me = this;
        
    // included in the following pages: visit home page, then book a flight
    //https://www.alaskaair.com/booking/payment
    //https://www.alaskaair.com/booking/reservation/saved
    this.insertPurchaseConfirmationPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=232070&amp;ns=1");
    }

    // included page: the landing / confirmation page after mileage plan account Sign Up
    this.insertMileagePlanConversionPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=232071&amp;ns=1");
    }

    // included page: the landing / confirmation page after News Letter Subscription Sign Up
    this.insertEmailSignupConversionPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=234857&amp;ns=1");
    }

    //<script type='text/javascript'>function callDeferredWdcwPixels() { as.wdcw.insertWdcwEmslPixels();}</script>
    // pixels for: http://www.alaskaair.com/content/deals/special-offers/explore-more-spend-less-ca.aspx
    this.insertWdcwEmslPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=288135&amp;ns=1");
    }

    //<script type='text/javascript'>function callDeferredWdcwPixels() { as.wdcw.insertWdcwEmslSandiegoPixels();}</script>
    // pixels for: http://www.alaskaair.com/content/flights-from-san-diego?q=SAN&o=SAN
    this.insertWdcwEmslSandiegoPixels = function () {
        _insertPixel("//bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&amp;ActivityID=301872&amp;ns=1");
    }

    function _insertPixel(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    }
}

if (typeof (as) != "undefined" && as.IsWdcwDown == false) {
    as.wdcw = new Wdcw();
}

// Floodlight pixels for Spanish Campaign, starting Apr, 2013
function Spanish() {
    var _me = this;
    var _random = (Math.random() + "") * 10000000000000;

    this.insertPixelsByCurrentUrl = function () {
        // Home Page Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=total247;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=Traff0;ord=" + _random + "?");
        }

        // Mileage Plan Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/mileage-plan.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/mileage-plan.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=mptra046;cat=MPTra0;ord=" + _random + "?");
        }

        // Mileage Plan Enrollment Form
        if (_pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCMyAccountCreate")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }
        if (_pathStartsWith("//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCMyAccountCreate")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }

        if (_pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/myaccount/join")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }
        if (_pathStartsWith("//www.alaskaair.com/myaccount/join")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mptra697;ord=" + _random + "?");
        }

        // Mileage Plan Confirmation
        if (_pathStartsWith("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=mplea477;ord=" + _random + "?");
        }
        if (_pathStartsWith("//www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?isNewMember=true")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=MPLea0;ord=" + _random + "?");
        }

        // Booking Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/planbook")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=booki301;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/planbook")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=Booki0;ord=" + _random + "?");
        }

        // Booking Confirmation
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/booking/payment")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=booki057;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/booking/payment")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=leads853;cat=Booki0;ord=" + _random + "?");
        }

        // Flight Deals Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/deals/flights.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=deals381;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/deals/flights.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=Deals0;ord=" + _random + "?");
        }

        // LA Offers Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/cities/flights-from/los-angeles.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=laori482;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/cities/flights-from/los-angeles.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=LAOff0;ord=" + _random + "?");
        }

        // CA Offers Traffic
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/content/deals/special-offers/explore-more-spend-less-ca.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=MPAcq0;ord=" + _random + "?");
        }
        if (_isPath("//www.alaskaair.com/content/deals/special-offers/explore-more-spend-less-ca.aspx")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=MPAcq00;ord=" + _random + "?");
        }

        // Mexico Traffic 
        if (_isPath("//alaskaair.convertlanguage.com/alaskaair/enes/24/_www_alaskaair_com/planbook/vacations/mazatlan-mexico")) {
            _insertPixel("//ad.doubleclick.net/activity;src=3777717;type=traff923;cat=mazat155;ord=" + _random + "?");
        }
    }

    // url -> with querystring
    function _pathStartsWith(url) {
        return _me.isTesting || _startsWith(location.href.replace(location.protocol, "").toLowerCase(), url.toLowerCase());
    }

    // url -> no querystring
    function _isPath(url) {
        return _me.isTesting || (("//" + location.hostname + location.pathname).toLowerCase() == url.toLowerCase());
    }

    function _insertPixel(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    }

    function _startsWith(thisStr, str) {
        return str.length > 0 && thisStr.substring(0, str.length) === str;
    }
}

if (typeof (as) != "undefined" && as.IsSpanishTagDown == false) {
    as.spanish = new Spanish();
}

function Adready() {
    var _me = this;

    this.includeGlobalPixels = true;

    //included in every page, including homepage: http://www.alaskaair.com/
    //pixels copied from: http://www.adreadytractions.com/rt/63?p=801&async=true
    this.insertGlobalPixels = function () {
        if (_me.includeGlobalPixels == false) return;

        _insertPixel("//googleads.g.doubleclick.net/pagead/viewthroughconversion/1054000976/?value=0&label=Pf7ICLiz5wMQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Universal");
        _insertPixel("//a.adready.com/beacon.php?r=801");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99497", "//ib.adnxs.com/seg?add=99497");
        _insertPixelBasedOnHttps("//secure.media6degrees.com/orbserv/hbpix?pixId=13449&pcv=46", "//action.media6degrees.com/orbserv/hbpix?pixId=13449&pcv=46");
        _insertPixel("//cc.chango.com/c/o?pid=1824");
    }

    // included in the following pages: visit home page, then search a flight
    //https://www.alaskaair.com/shopping/Flights/Shop
    //https://www.alaskaair.com/shopping/Flights/Schedule
    //https://www.alaskaair.com/shopping/Flights/Calendar
    //https://www.alaskaair.com/shopping/Flights/Price
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=25441&async=true
    this.insertShoppingPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=sZ8PCNi5nwIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Flight+Shopping+Page");
        //_insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=flight");
        _insertPixel("//a.adready.com/beacon.php?r=25441");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=161788", "//ib.adnxs.com/seg?add=161788");
    }

    // included in the following pages: visit home page, then book a flight
    //https://www.alaskaair.com/booking/payment
    //https://www.alaskaair.com/booking/reservation/saved
    this.insertConfirmationPixels = function () {
        _insertConfirmationPixels();
    }

    // included in the following pages: visit home page, then book a flight
    //https://www.alaskaair.com/booking/payment
    //https://www.alaskaair.com/booking/reservation/saved
    this.insertPurchaseConfirmationPixels = function () {
        _insertConvertionPixels();
        _insertConfirmationPixels();
    }

    // included in the following pages: visit home page, then sign in
    //https://www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=16121&async=true
    this.insertMyAccountPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=2zloCPDghwIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Mileage+Plan+Login");
        //_insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=mpl"); //<-- Obsolete, replaced by the new Adara super pixel pls see SMMP#53903 and AdaraPixel.js
        _insertPixel("//a.adready.com/beacon.php?r=16121");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99527", "//ib.adnxs.com/seg?add=99527");
    }

    // included in the following pages:
    //https://www.alaskaair.com/shopping/hotel
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=19561&async=true
    this.insertHotelPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=EBFPCMiOkAIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Hotel+Page");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=hotel");
        _insertPixel("//a.adready.com/beacon.php?r=19561");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=124691", "//ib.adnxs.com/seg?add=124691");
    }

    // included in the following pages:
    //https://www.alaskaair.com/shopping/car
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=19571&async=true
    this.insertCarPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=smO3CMCPkAIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Car+Page");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=car");
        _insertPixel("//a.adready.com/beacon.php?r=19571");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=124692", "//ib.adnxs.com/seg?add=124692");
    }

    // included in the following pages:
    //http://www.alaskaair.com/content/mileage-plan/benefits/about-mileage-plan.aspx?lid=nav:mileagePlan-benefits
    //pixels copied from: https://www.adreadytractions.com/rt/63?p=16131&async=true
    this.insertMileagePlanPixels = function () {
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Mileage+Plan+Awards");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=mpa");
        _insertPixel("//a.adready.com/beacon.php?r=16131");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99529", "//ib.adnxs.com/seg?add=99529");
    }

    // included in the following pages:
    //http://www.alaskaair.com/shopping/vacations?lid=nav:planbook-vacations
    //http://www.alaskaair.com/content/deals/vacations.aspx
    //pixels copied from: http://www.adreadytractions.com/rt/245541?p=25461&async=true
    this.insertVacationPixels = function () {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1016634413/?label=K_HBCJufiQMQrbji5AM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Vacation+Shopping+Page");
        _insertPixel("//tag.yieldoptimizer.com/ps/ps?t=i&p=1194&rtg=0&pg=vacation");
        _insertPixel("//a.adready.com/beacon.php?r=25461");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=161792", "//ib.adnxs.com/seg?add=161792");
    }

    //pixels copied from: http://www.adreadytractions.com/pt/398121/?h=4a05ac3aa30b6abbde2b&async=true   
    // included page: the landing / confirmation page after mileage plan account Sign Up
    this.insertMileagePlanConversionPixels = function () {
        _insertPixel("//a.adready.com/ce/60232/901651/?h=4a05ac3aa30b6abbde2b");
        _insertPixel("//fls.doubleclick.net/activityi;src=3770605;type=ar-ac016;cat=ar-ac042;ord=1?");
        _insertPixel("//www.googleadservices.com/pagead/conversion/996519509/?value=0&label=28iPCPOrrAMQ1dyW2wM&guid=ON&script=0");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Mileage+Rewards+Signup+Confirmation+Page");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=43855&t=2", "//ib.adnxs.com/px?id=43855&t=2");
        _insertPixel("//cs.yieldoptimizer.com/cs/c?a=1269&cpid=410&");
    }

    //pixels copied from: http://www.adreadytractions.com/pt/398131/?h=9c830cc3d57068e9bed2&async=true
    // included page: the landing / confirmation page after News Letter Subscription Sign Up
    this.insertEmailSignupConversionPixels = function () {
        _insertPixel("//a.adready.com/ce/60233/901661/?h=9c830cc3d57068e9bed2");
        _insertPixel("//fls.doubleclick.net/activityi;src=3770603;type=ar-ac347;cat=ar-ac618;ord=1?");
        _insertPixel("//www.googleadservices.com/pagead/conversion/999986501/?value=0&label=JHCFCMP8_AIQxarq3AM&guid=ON&script=0");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=43854&t=2", "//ib.adnxs.com/px?id=43854&t=2");
    }

    // pixels copied from: http://www.adreadytractions.com/pt/410611/?h=9e04b5282d41e0bf2072&async=true
    this.insertEasyBizConfirmationPixels = function () {
        _insertPixel("//3966881.fls.doubleclick.net/activityi;src=3966881;type=ar-ac819;cat=ar-ac273;ord=1?");
        _insertPixel("//www.googleadservices.com/pagead/conversion/1000862384/?value=0&label=ik8zCNCd4wQQsOWf3QM&guid=ON&script=0");
        _insertPixel("//a.adready.com/ce/61482/933671/?h=9e04b5282d41e0bf2072");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=58581&t=2", "//ib.adnxs.com/px?id=58581&t=2");
    }

    //pixels copied from: https://adreadytractions.com/pt/63/?h=fb206b070c03eba62c02    
    // included page: the landing / confirmation page successfully booked a flight ticket
    function _insertConvertionPixels() {
        _insertPixel("//a.adready.com/ce/80/71/?h=fb206b070c03eba62c02");
        _insertPixel("//ad.doubleclick.net/activity;src=2772323;type=ar-ac939;cat=ar-ac508;ord=1?");
        _insertPixel("//secure.quantserve.com/pixel/p-7dWYtK34XFp1Y.gif?labels=_fp.event.Flight+Booking+Conversion");
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?value=0.0&label=cMkhCPLKdxDQjsv2Aw&script=0");
        _insertPixel("//www.googleadservices.com/pagead/conversion/1023643442/?label=XB2pCMDVsAEQsp6O6AM&guid=ON&script=0");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=9478&t=2", "//ib.adnxs.com/px?id=9478&t=2");
        _insertPixel("//cs.yieldoptimizer.com/cs/c?a=1269&cpid=243&");
        _insertPixel("//as.chango.com/conv/i;%25n?conversion_id=10837");
        _insertPixelBasedOnHttps("//secure.media6degrees.com/orbserv/hbpix?pixId=13452&pcv=41", "//secure.media6degrees.com/orbserv/hbpix?pixId=13452&pcv=41");
        _insertPixelBasedOnHttps("//secure.adnxs.com/px?id=473273&t=2", "//id.travelspike.com/px?id=473273&t=2");
    }

    //pixels copied from: https://www.adreadytractions.com/rt/63?p=7091&async=true
    // included page: the landing / confirmation page successfully booked a flight ticket
    function _insertConfirmationPixels() {
        _insertPixel("//www.googleadservices.com/pagead/conversion/1054000976/?label=en4LCOjShwIQ0I7L9gM&guid=ON&script=0");
        _insertPixel("//a.adready.com/beacon.php?r=7091");
        _insertPixelBasedOnHttps("//secure.adnxs.com/seg?add=99516", "//ib.adnxs.com/seg?add=99516");
    }

    function _insertPixel(url) {
        var img = document.createElement('img');
        img.setAttribute('alt', '');
        img.setAttribute('height', '1');
        img.setAttribute('aria-hidden', 'true');
        img.setAttribute('width', '1');
        img.setAttribute('style', 'display: none;');
        img.setAttribute('src', url);
        document.body.appendChild(img);
    }

    function _insertPixelBasedOnHttps(sslUrl, url) {
        if (window.location.protocol == "https:")
            _insertPixel(sslUrl);
        else
            _insertPixel(url);
    }
}

if (typeof (as) != "undefined" && as.IsAdreadyDown == false) {
    as.adready = new Adready();
}

// after 2/25/2014, pixels can be verified here:  http: //www.alaskaair.com/tests/intentmedia.htm?debug=1
function IntentMediaPixel() {
    //<a id="intentMediaUrl" href="http://a.intentmedia.net/adServer/advertiser_conversions?entity_id=66539&site_type=ALASKA_AIRLINES&product_category=FLIGHTS&travelers=1&conversion_currency=USD&conversion_value=300.00&order_id=ABCDEF&cache_buster=123456789">
    this.insertIntentMediaConversionPixel = function () {
        if ($('#intentMediaUrl').length) {
            $('body').append($("<img width='1' height='1' border='0' alt='intent media url'></img>").attr({ src: $('#intentMediaUrl').attr("href") }));
        }
    }

    //https://gist.github.com/IMAdsTeam/1c2bdff0a7aaca5fdf84
    // all pixels are deferred loaded.  This method will be called after web page finished loading: as.intentMediaPixel.insertIntentMediaGlobalPixel()
    this.insertIntentMediaGlobalPixel = function () {
        window.IntentMediaProperties = {
            page_id: "UNKNOWN",  // possible values - Home:Home; PlanBook_Flights:Home; FlightDeals:deals-flight; 104:travel-info; 105:gifts-products; 106:mileage-plan; ...
            product_category: 'FLIGHTS',  // value hard coded
            page_view_type: 'UNKNOWN', // value hard coded
            user_member_id: '',  // possible values - Y; N
            entity_id: '66539'  // value hard coded
        };

        if ('undefined' !== typeof s && 'undefined' !== typeof s.pageName) // omniture value
            window.IntentMediaProperties.page_id = s.pageName;

        if ('undefined' !== typeof VisitorRepository) {
            var _v = new VisitorRepository().PopulateVisitor();
            window.IntentMediaProperties.user_member_id = (_v.isMileagePlanMember) ? 'Y' : 'N';
        }

        var script = document.createElement("script");
        var prefix = document.location.protocol === 'https:' ? 'https://a' : 'http://a.cdn';
        script.src = prefix + '.intentmedia.net/javascripts/intent_media_data.js';
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}

if (typeof (as) != "undefined" && as.IsIntentMediaDown == false) {
    as.intentMediaPixel = new IntentMediaPixel();
}


function Bing(tagUtil) {
    var _me = this;
    var _tagUtil = tagUtil;

    this.insertPixelsByCurrentUrl = function () {
        // booking confirmation
        if (_tagUtil.isPage_BookingConfirm()) {
            _insertPixelsForBooking();
        }
    }

    function _insertPixelsForBooking() {
        if (window.as && window.as.Page && window.as.Page.Cart && window.as.Page.Cart.Itinerary) {
            var revenue = window.as.Page.Cart.Itinerary.Revenue.toFixed(2);
            window.uetq = window.uetq || []; window.uetq.push({ 'gv': revenue });
        }
    }
}

if (typeof (as) != "undefined" && !as.IsBingDown) {
    as.bing = new Bing(as.tagUtil);
}

// mantis 55038 - added initial basic tracking pixel, 8/6/2014
// mantis 55256 - added reveune and type parameters, 8/20/2014
// mantis 55219 - added tracking pixel to 4 more pages 9/3/2014
function Kenshoo(tagUtil) {
    var _me = this;
    var _tagUtil = tagUtil;

    this.insertPixelsByCurrentUrl = function () {
        if (_tagUtil.isPage_BookingConfirm()) {
            _insertPixelsForBooking();
        }

        if (_tagUtil.isPage_EasybizSignupConfirm()) {
            _tagUtil.insertImg(_toUrl("&type=EasyBiz_Acct_KS"));
        }

        // mileage plan registration
        if (_tagUtil.isPage_MileagePlanSignupConfirm()) {
            _tagUtil.insertImg(_toUrl("&type=Mileage_Program_KS"));
        }
    }

    // this is made public method because it is called from a sitecore page through onclick event
    // http://www.alaskaair.com/content/credit-card/visa-signature.aspx?
    this.insertPixelsForBankcard = function () {
        _tagUtil.insertImg(_toUrl("&type=BankCard_Referrals_KS"));
    }

    // this is made public method because the confirm page is not unique - shared by other My Account pages
    // https://www.alaskaair.com/www2/ssl/myalaskaair/myalaskaair.aspx
    this.insertEmailSignupConversionPixels = function () {
        _tagUtil.insertImg(_toUrl("&type=Email_Sign_Ups_KS"));
    }

    // this is made public method because submit page is not unique - shared by both success or failure result
    // https://www.alaskaair.com/RegistrationPromo/Club49Registration/submit
    this.insertClub49ConfirmPixels = function () {
        _tagUtil.insertImg(_toUrl("&type=Club_49_Reg_KS"));
    }

    function _insertPixelsForBooking() {
        if (window.as && window.as.Page && window.as.Page.Cart && window.as.Page.Cart.Itinerary)
        {
            var valParam = "&valueCurrency=USD&val=" + window.as.Page.Cart.Itinerary.Revenue.toFixed(2) + "&orderId=" + window.as.Page.Cart.Itinerary.Recloc;
            _tagUtil.insertImg(_toUrl("&type=Bookings_KS", valParam));
        }
    }

    function _toUrl(typeParam, valParam) {
        //other params: &orderId=&promoCode=&GCID=&kw=&product=&type=&val=
        var url = "//143.xg4ken.com/media/redir.php?track=1&token=bde70147-ad76-4556-964a-62e9a3363458";
        if (typeParam)
            url = url + typeParam;
        if (valParam)
            url = url + valParam;
        return url;
    }
}

if (typeof (as) != "undefined" && !as.IsKenshooDown) {
    as.kenshoo = new Kenshoo(as.tagUtil);
}

function SojernPixel() {
    this.insertSojernPixel = function () {
        if ($('#sojernPixelUrl').length) {
            $('body').append($("<img width='1' height='1' border='0' alt='sojern pixel url'></img>").attr({ src: $('#sojernPixelUrl').attr("href") }));
        }
    }
}

as.sojernPixel = new SojernPixel();

function JennLoader() {
    var _me = this;

    var launchTime = '';

    this.loadAndLaunch = function () {
        _me.load();
        _launch();
        try {
            launchTime = new Date().getTime();
            sessionStorage.setItem('jennlaunchtime', launchTime);
            sessionStorage.setItem('jennlaunched', 'true');
        } catch (e) { }
    }

    this.loadIfWasLaunched = function () {
        try {
            if (sessionStorage.getItem('jennlaunched') === 'true') {
                launchTime = sessionStorage.getItem('jennlaunchtime')
                _me.load();
            }
        } catch (e) { }
    }


    this.load = function () {
        // Use prod defaults if no overrides set
        var nitScriptPath = (typeof window.nitScriptPath !== 'undefined') ? window.nitScriptPath :
            '/NIT.Alaska.Cdn.min.js';
        var nitStylePath = (typeof window.nitStylePath !== 'undefined') ? window.nitStylePath :
            '/NIT.WebJenn.min.css';
        var nitProdDomain = (typeof window.nitProdDomain !== 'undefined') ? window.nitProdDomain :
            '276a5257eb3da1dd4554-091acd6e9d984fde7523e1bfe3609124.ssl.cf1.rackcdn.com';

        var PROD_LAUNCH_SCRIPT = 'https://' + nitProdDomain + nitScriptPath
        var TEST_DOMAIN = '28329d082540cabbc469-daa0bf0bea975e9cac1df2ab504bdfde.ssl.cf1.rackcdn.com';
        var TEST_LAUNCH_SCRIPT_PATH = '/NIT.Alaska.Cdn.min.js';
        var TEST_STYLE_PATH = '/NIT.WebJenn.min.css';
        var TEST_LAUNCH_SCRIPT = 'https://' + TEST_DOMAIN + TEST_LAUNCH_SCRIPT_PATH;

        if (typeof ActiveAgent_LaunchJenn === 'function') {
            return;
        }

        var parent = document.getElementsByTagName('head')[0];

        var scriptUrl = '';
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.setAttribute('language', 'javascript');

        var linkUrl = '';
        var linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'stylesheet');
        linkTag.setAttribute('type', 'text/css');

        if (window.location.search.toLowerCase().indexOf("debug") > -1) {
            window.nitWebJennDomain = 'jenn-test.insideaag.com';
            launchTime = '';
            scriptUrl = TEST_LAUNCH_SCRIPT;
            linkUrl = 'https://' + TEST_DOMAIN + TEST_STYLE_PATH;
        } else {
            scriptUrl = PROD_LAUNCH_SCRIPT;
            linkUrl = 'https://' + nitProdDomain + nitStylePath;
        }

        scriptTag.setAttribute('src', scriptUrl + '?' + launchTime);
        linkTag.setAttribute('href', linkUrl);
        if (linkUrl != '') parent.appendChild(linkTag);
        if (parent) parent.appendChild(scriptTag);
    }

    function _launch() {
        if (typeof ActiveAgent_LaunchJenn === 'function') {
            ActiveAgent_LaunchJenn();
        } else {
            setTimeout(_launch, 100);
        }
    }
}

// Add to as.com scripts which will load Jenn
if (typeof (as) !== "undefined" && as.IsJennDown === false) {
    as.jennLoader = new JennLoader();
}

var AS = window.AS || {};

AS.AlertDialog = function (title, message, callback) {
    this.title = title;
    this.message = message;
    this.isConfirmDialog;
    this.divElement = document.createElement('div');
    this.divElement.setAttribute('role', 'dialog');
    this.divElement.setAttribute('aria-label', title);
    this.divElement.tabIndex = 0;
    this.divElement.classList.add('confirm-dialog-container');
    this.hasRadioGroup = false;
    this.previousElement = null;
    this.focusHandler = null;
    this.elementsHiddenOnOpen = null;
    this.callback = callback;
};

AS.AlertDialog.prototype.Close = function (isConfirmed) {
    document.body.style.overflow = 'auto';

    var radioGroupValue;
    if (this.hasRadioGroup) {
        var radioButtons = this.divElement.querySelectorAll('input[name=alertDialogRadio]');
        for (var x = 0; x < radioButtons.length; x += 1) {
            if (radioButtons[x].checked) {
                radioGroupValue = radioButtons[x].value;
            }
        }
    }

    document.body.removeChild(this.divElement);
    if (this.previousElement) {
        this.previousElement.focus();
    }
    if (this.focusHandler) {
        document.removeEventListener('focus', this.focusHandler);
        this.focusHandler = null;
    }

    for (var x = 0; x < this.elementsHiddenOnOpen; x += 1) {
        this.elementsHiddenOnOpen[x].removeAttribute('aria-hidden');
    }
    this.elementsHiddenOnOpen = null;

    if (this.callback) {
        this.callback(isConfirmed);
    }

    this.onclose(isConfirmed, radioGroupValue);
};

AS.AlertDialog.prototype.Confirm = function () {
    var continueButton = this.divElement.querySelector('.btn-primary');
    if (continueButton.getAttribute('disabled') === 'true') {
        return;
    }

    this.Close(true);
};

AS.AlertDialog.prototype.Cancel = function () {
    this.Close(false);
};

AS.AlertDialog.prototype.AttachEvents = function () {
    this.focusHandler = this.HandleFocusChange.bind(this);
    document.addEventListener('focus', this.focusHandler, true);

    var acceptButton = this.divElement.querySelector('.btn-primary');
    var cancelButton = this.divElement.querySelector('.btn-secondary');
    var background = this.divElement.querySelector('.confirm-dialog-background');
    background.onclick = this.Cancel.bind(this);
    acceptButton.onclick = this.Confirm.bind(this);
    if (cancelButton) {
        cancelButton.onclick = this.Cancel.bind(this);
    }
    this.divElement.onkeydown = function (e) {
        var evt = e || window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode === 27) { // esc
            this.Cancel();
        }
        else if (keyCode === 9) { // tab
            var focusables = $(this.divElement).find(':focusable');
            var handled = false;

            if (evt.shiftKey) { // shift+tab
                if (document.activeElement === this.divElement) {
                    focusables[focusables.length - 1].focus();
                    handled = true;
                }
            }
            else {
                if (focusables[focusables.length - 1] === document.activeElement) {
                    this.divElement.focus();
                    handled = true;
                }
            }

            if (handled) {
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
                return false;
            }
        }

        return true;
    }.bind(this);

    if (this.hasRadioGroup) {
        var continueButton = this.divElement.querySelector('.btn-primary');
        continueButton.classList.add('disabled');
        continueButton.setAttribute('disabled', 'true');

        var radioButtons = this.divElement.querySelectorAll('input[name=alertDialogRadio]');
        for (var x = 0; x < radioButtons.length; x += 1) {
            radioButtons[x].onclick = this.HandleRadioGroupSelection.bind(this);
        }
    }
};

AS.AlertDialog.prototype.HandleRadioGroupSelection = function (e) {
    var continueButton = this.divElement.querySelector('.btn-primary');
    continueButton.classList.remove('disabled');
    continueButton.removeAttribute('disabled');
};

AS.AlertDialog.prototype.HandleFocusChange = function (e) {
    var evt = e || window.event;
    // For accessibility, we must trap the focus in the dialog.
    if (!this.divElement.contains(evt.target)) {
        evt.stopPropagation();
        this.divElement.focus();
        return false;
    }
};

AS.AlertDialog.prototype.onclose = function () { };

AS.AlertDialog.prototype.SetConfirmDialog = function (isConfirmDialog) {
    this.isConfirmDialog = isConfirmDialog;
};

AS.AlertDialog.prototype.Show = function (isConfirmationDialog, options) {
    options = options || {};
    this.SetConfirmDialog(isConfirmationDialog);
    this.previousElement = document.activeElement;

    var acceptText = options.acceptText || (this.isConfirmDialog ? 'Okay' : 'Close');
    var cancelText = options.cancelText || 'Cancel';
    var isAutoSize = options.autoSize || false;

    var html = '<div class="confirm-dialog-background"></div>';
    html += '<div class="confirm-dialog' + (isAutoSize ? ' autosize' : '') + '">';
    if (this.title) {
        html += '<h2>' + this.title + '</h2>';
    }
    html += '<div class="confirm-dialog-content">';
    if (this.message) {
        html += '<p>' + this.message + '</p>';
    }
    if (options.radioGroup) {
        this.hasRadioGroup = true;
        for (var option in options.radioGroup) {
            html += '<label><input type="radio" name="alertDialogRadio" value="' + option + '" /> ' + options.radioGroup[option] + '</label>';
        }
    }
    html += '</div>';
    html += '<div class="confirm-dialog-actions">';
    if (this.isConfirmDialog) {
        html += '<button class="btn btn-secondary">' + cancelText + '</button>';
    }
    html += '<button class="btn btn-primary">' + acceptText + '</button>';
    html += '</div>';
    html += '</div>';
    this.divElement.innerHTML = html;
    document.body.appendChild(this.divElement);
    this.AttachEvents();

    this.elementsHiddenOnOpen = [];
    var sibling = this.divElement.nextElementSibling;
    while (sibling) {
        if (!sibling.getAttribute('aria-hidden')) {
            sibling.setAttribute('aria-hidden', 'true');
            this.elementsHiddenOnOpen.push(sibling);
        }
        sibling = sibling.nextElementSibling;
    }
    sibling = this.divElement.previousElementSibling;
    while (sibling) {
        if (!sibling.getAttribute('aria-hidden')) {
            sibling.setAttribute('aria-hidden', 'true');
            this.elementsHiddenOnOpen.push(sibling);
        }
        sibling = sibling.previousElementSibling;
    }

    this.PositionDialogBox();

    this.divElement.focus();
};

AS.AlertDialog.prototype.PositionDialogBox = function () {
    var $dialogBackground = $('.confirm-dialog-background'),
        $confirmDialogContainer = $('.confirm-dialog-container'),
        $dialog = $('.confirm-dialog');

    $confirmDialogContainer.removeClass('container-for-tall-dialog');

    if ($dialogBackground.length > 0 && $dialogBackground.css('display').toLowerCase() !== 'none') {

        if ($dialog.hasClass('autosize')) {

            $confirmDialogContainer.addClass('container-for-tall-dialog');

            var
                dialogHeight = $dialog.outerHeight(),
                windowHeight = $(window).height();

            document.body.style.overflow = windowHeight > dialogHeight ? 'hidden' : 'auto';

            var top = 0;
            if (windowHeight > dialogHeight) {
                top = (windowHeight - dialogHeight) / 2.0;
            }
            $dialog.css('top', top);

            document.documentElement.scrollTop = document.body.scrollTop = 0;
        } else {
            document.body.style.overflow = 'hidden';
        }
    } else {
        document.body.style.overflow = 'auto';
    }
};

$(document).ready(function () {
    $(window).resize(function () {
        AS.AlertDialog.prototype.PositionDialogBox();
    });
});

/**
 * Created by aHardtke on 3/23/2015.
 */
function DateFilter() {
    var refDate;
    var shortMonths = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec'
    ];
    var constantHolidays = {
        newYears:        [0, 1],
        newYearsDay:     [0, 1],
        groundhogDay:    [1, 2],
        valentinesDay:   [1, 14],
        patricksDay:     [2, 17], // "st." is stripped out
        flagDay:         [5, 14],
        independenceDay: [6, 4],
        alaskaDay:       [9, 18],
        halloween:       [9, 31],
        veteransDay:     [10, 11],
        christmasEve:    [11, 24],
        christmas:       [11, 25],
        newYearsEve:     [11, 31]
    };
    var holidaysOnNthDay = {
        mlk:           [3, 1, 0],
        mklJr:         [3, 1, 0],
        mlkDay:        [3, 1, 0],
        mlkJrDay:      [3, 1, 0],
        presidentsDay: [3, 1, 1],
        mothersDay:    [2, 0, 4],
        fathersDay:    [3, 0, 5],
        laborDay:      [1, 1, 8],
        columbusDay:   [2, 1, 9],
        thanksgiving:  [4, 4, 10]
    };
    var emptyWords = ['', 'st', 'nd', 'th', 'of'];
    var wordsToCamelCase = ['day', 'eve', 'gras', 'years', 'jr'];
    var splitParts = function (val) {
        var parts = val.split('-');
        var partsOut = [];
        for (var i = 0, len = parts.length; i < len; i++) {
            if ($.inArray(parts[i], emptyWords) === -1) {
                var camelIndex = $.inArray(parts[i], wordsToCamelCase);
                if (i > 0 && camelIndex > -1) {
                    var word = wordsToCamelCase[camelIndex];
                    partsOut[partsOut.length - 1] += word[0].toUpperCase() + word.slice(1);
                } else {
                    partsOut.push(parts[i]);
                }
            }
        }
        // console.log(val, partsOut);
        return partsOut;
    };
    var convertMonthText = function (parts) {
        var i, len, partsOut = [];
        for (i = 0, len = parts.length; i < len; i++) {
            var val = parts[i];
            for (var j = 0, len2 = shortMonths.length; j < len2; j++) {
                if (val.indexOf(shortMonths[j]) > -1) {
                    val = j + 1;
                    if (i > 0) {
                        var oldVal = partsOut[i - 1];
                        partsOut[i - 1] = val;
                        val = oldVal;
                    }
                    break;
                }
            }
            partsOut.push(val);
        }
        return partsOut;
    };
    var normalizeSpaces = function (val) {
        if (typeof val !== 'string') {
            return '';
        }
        val = val.toLowerCase();
        val = val.replace(/\./g, '-');
        val = val.replace(/ /g,  '-');
        val = val.replace(/\//g, '-');
        val = val.replace(/'/g, '');
        val = val.replace('black-friday', 'blackFriday');
        val = val.replace('cyber-monday', 'cyberMonday');
        val = val.replace('good-friday', 'goodFriday');
        var ddmm = val.match(/[0-9][a-z]/);
        if (ddmm) {
            ddmm = ddmm[0];
            val = val.replace(ddmm, ddmm[0] + '-' + ddmm[1]);
        }
        var mmdd = val.match(/[a-z][0-9]/);
        if (mmdd) {
            mmdd = mmdd[0];
            val = val.replace(mmdd, mmdd[0] + '-' + mmdd[1]);
        }
        return val;
    };
    var getNthDayOfMonth = function (nth, day, month, year) {
        var first = new Date(year, month, 1).getDay();
        var firstDay = (day + 8 - first) % 7;
        if (firstDay === 0) {
            firstDay += 7;
        }
        return new Date(year, month, firstDay + (7 * (nth - 1)));
    };
    var holidaysForYear = {
        mardiGras: function (year) {
            var easter = holidaysForYear.easter(year);
            return new Date(year, easter.getMonth(), easter.getDate() - 47);
        },
        goodFriday: function (year) {
            var easter = holidaysForYear.easter(year);
            return new Date(year, easter.getMonth(), easter.getDate() - 2);
        },
        easter: function (year) {
            var daysBeforeApr19 = (((year % 19) * 11) + 5) % 30;
            if (daysBeforeApr19 === 0) {
                daysBeforeApr19 = 1;
            } else if (daysBeforeApr19 === 1) {
                daysBeforeApr19 = 2;
            }
            var fullMoon = new Date(year, 3, 19 - daysBeforeApr19);
            var sundayOffset = (7 - fullMoon.getDay());
            return new Date(year, 3, 19 - daysBeforeApr19 + sundayOffset);
        },
        taxDay: function (year) {
            var taxDay = new Date(year, 3, 15);
            var day = taxDay.getDay();
            if (day === 5 || day === 6) {
                taxDay = new Date(year, 3, 18);
            } else if (day === 0) {
                taxDay = new Date(year, 3, 17);
            }
            return taxDay;
        },
        memorialDay: function (year) {
            var memorialDay = getNthDayOfMonth(5, 1, 4, year);
            if (memorialDay.getMonth() === 5) {
                memorialDay = getNthDayOfMonth(4, 1, 4, year);
            }
            return memorialDay;
        },
        electionDay: function (year) {
            var d = getNthDayOfMonth(1, 1, 10, year);
            return new Date(year, d.getMonth(), d.getDate() + 1);
        },
        blackFriday: function (year) {
            var t = holidaysOnNthDay.thanksgiving;
            var thanksgiving = getNthDayOfMonth(t[0], t[1], t[2], year);
            return new Date(year, thanksgiving.getMonth(), thanksgiving.getDate() + 1);
        },
        cyberMonday: function (year) {
            var t = holidaysOnNthDay.thanksgiving;
            var thanksgiving = getNthDayOfMonth(t[0], t[1], t[2], year);
            return new Date(year, thanksgiving.getMonth(), thanksgiving.getDate() + 4);
        }
    };
    var checkSpecialStrings = function (parts) {
        var year = refDate.getFullYear();
        for (var i = 0, len = parts.length; i < len; i++) {
            var val = parts[i];
            var d = null;
            var date;
            if (constantHolidays[val]) {
                date = new Date(year, constantHolidays[val][0], constantHolidays[val][1]);
                if (date < refDate) {
                    date = new Date(year + 1, constantHolidays[val][0], constantHolidays[val][1]);
                }
                return date;
            } else if (holidaysOnNthDay[val]) {
                var h = holidaysOnNthDay[val];
                date = getNthDayOfMonth(h[0], h[1], h[2], year);
                if (date < refDate) {
                    date = getNthDayOfMonth(h[0], h[1], h[2], year + 1);
                }
                return date;
            } else if (holidaysForYear[val]) {
                date = holidaysForYear[val](year);
                if (date < refDate) {
                    date = holidaysForYear[val](year + 1);
                }
                return date;
            }
            switch (val) {
                case'today':
                    d = 0;
                    break;
                case 'tomorrow':
                    d = 1;
                    break;
            }
            if (d !== null) {
                return new Date(year, refDate.getMonth(), refDate.getDate() + d);
            }
            var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            var ds   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            var idx = $.inArray(val, days);
            if (idx === -1) {
                idx = $.inArray(val, ds);
            }
            if (idx > -1) {
                var currentDay = refDate.getDay();
                var diff = (7 + idx - currentDay) % 7;
                if (diff === 0 && i > 0 && parts[i - 1] === 'next') {
                    diff = 7;
                }
                return new Date(year, refDate.getMonth(), refDate.getDate() + diff);
            }
        }
        return parts;
    };
    var checkDayAndMonth = function (dateParts) {
        if (isNaN(dateParts.day) && !isNaN(dateParts.month)) {
            // when just entering one number
            dateParts.day = dateParts.month + 1;
            dateParts.month = refDate.getMonth();
            dateParts.inputMonth = NaN;
            if (dateParts.day < refDate.getDate()) {
                dateParts.month++;
            }
        }
        return dateParts;
    };
    var checkYear = function (dateParts) {
        if (dateParts.year < 100) {
            dateParts.year += 2000;
        }
        if (dateParts.month < refDate.getMonth() && !dateParts.inputYear) {
            dateParts.year++;
        }
    };
    var setRefDate = function (referenceDate) {
        if (typeof referenceDate === 'object') {
            refDate = referenceDate;
        } else {
            var d = new Date();
            refDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
    };
    return function (val, referenceDate) {
        var dateParts, parts, date;

        if (!val) {
            return null;
        }

        setRefDate(referenceDate);
        val     = normalizeSpaces(val);
        parts   = splitParts(val);
        date    = checkSpecialStrings(parts);
        if (date !== parts) {
            return date;
        }
        parts   = convertMonthText(parts);

        var month = parseInt(parts[0], 10) - 1;
        dateParts = {
            month: month,
            day:   parseInt(parts[1], 10),
            year:  parts.length < 3 ? refDate.getFullYear() : parseInt(parts[2], 10),
            inputMonth: month,
            inputYear:  parts.length < 3 ? null : parseInt(parts[2], 10)
        };
        checkDayAndMonth(dateParts);
        checkYear(dateParts);

        if (isNaN(dateParts.day)) {
            return null;
        }

        date = new Date(dateParts.year, dateParts.month, dateParts.day);
        if (!isNaN(dateParts.inputMonth) && date.getMonth() !== dateParts.inputMonth) {
            return null;
        }
        return date;
    };
}

function datepicker(id, modal) {
    this.$id = $('#' +id); // calendar container div id (<div id="as-datepicker")
	this.$monthObj = this.$id.find('#month');
	this.$monthLabel = this.$id.find('#month-label');
	this.$prev = this.$id.find('#btn-prev');
	this.$next = this.$id.find('#btn-next');
	this.$grid = this.$id.find('#cal1');
	this.$target = null; // div or text box that will receive the selected date string and focus (if modal)
                         // $target should be set when click or enter key hit, should not be set in constructor
	this.bModal = modal; // true if datepicker should appear in a modal dialog box.
	this.isVisible = false;

	this.monthNames = ['January', 'February', 'March', 'April','May','June',
			'July', 'August', 'September', 'October', 'November', 'December'];

	this.shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	this.keys = {
		tab:       9,
		enter:    13,
		esc:      27,
		space:    32,
		pageup:   33,
		pagedown: 34,
		end:      35,
		home:     36,
		left:     37,
		up:       38,
		right:    39,
		down:     40
	};

	var today = new Date();
	this.minDate = today;
	this.maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 330);

	this.curYear = today.getFullYear();
	this.curMonth = today.getMonth();
	this.setActiveDate(today);

	this.bindHandlers();

	// hide dialog if in modal mode
	if (this.bModal === true) {
		this.$id.attr('aria-hidden', 'true');
	}
}

datepicker.prototype.setActiveDate = function (dateObj) {
	if (dateObj > this.maxDate) {
		dateObj = this.maxDate;
	} else if (dateObj < this.minDate) {
		dateObj = this.minDate;
	}
	this.dateObj = dateObj;
	this.year    = this.dateObj.getFullYear();
	this.month   = this.dateObj.getMonth();
	this.date    = this.dateObj.getDate();
	this.currentDate = this.year === this.curYear && this.month === this.curMonth;

	this.setMonthDropdown();

	// update the table's activedescdendant to point to the current day
	this.$grid.attr('aria-activedescendant', 'day' + this.date);

	// populate the calendar grid
	this.popGrid();
};

datepicker.prototype.setMonthDropdown = function () {
	// display the current month
	var date = this.minDate;
	var select = '<select id="month-dropdown" tabindex="0" aria-label="Jump to month">';
	while (date <= this.maxDate) {
		var month = date.getMonth();
		var year = date.getFullYear();
		var selected = '';
		if (month === this.month && year === this.year) {
			selected = ' selected="selected"';
		}
		select += '<option value="' + date.toString() + '"' + selected + '>' + this.shortMonthNames[month] + ' ' + year + '</option>';
		date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
	}
	select += '</select>';
	this.$monthObj.html(select);
	this.$monthLabel.html(this.monthNames[this.month] + ' ' + this.year);
};

datepicker.prototype.getTarget = function (target) {
    return $('#' + target);
};

datepicker.prototype.setTarget = function (target) {
    this.$target = $('#' + target);
};

datepicker.prototype.setMinDate = function (dateObj) {
	this.minDate = dateObj;
	this.popGrid();
};

datepicker.prototype.setMaxDate = function (dateObj) {
	this.maxDate = dateObj;
	this.popGrid();
}

datepicker.prototype.setCloseCb = function (closeCb) {
	this.closeCb = closeCb;
};

//
// popGrid() is a member function to populate the datepicker grid with calendar days
// representing the current month
//
// @return N/A
//
datepicker.prototype.popGrid = function() {

	var numDays = this.calcNumDays(this.year, this.month);
	var startWeekday = this.calcStartWeekday(this.year, this.month);
	var weekday      = 0;
	var curDay       = 1;
	var rowCount     = 1;
	var $tbody = this.$grid.find('tbody');

	var gridCells = '\t<tr role="row">\n';

	// clear the grid
	$tbody.empty();
	$('#msg').empty();

	// Insert the leading empty cells
	for (weekday = 0; weekday < startWeekday; weekday++) {

		gridCells += '\t\t<td class="empty">&nbsp;</td>\n';
	}

	// insert the days of the month.
	var isMinMonth = this.isMinMonth();
	var isMaxMonth = this.isMaxMonth();
	var maxDay = this.maxDate.getDate();
	var minDay = this.minDate.getDate();

	var active = this.$grid.attr('aria-activedescendant');
	if (active) {
		var ariaDate = parseInt(active.replace(/day/, ''), 10);
		if (isMinMonth && ariaDate < minDay) {
			this.date = minDay;
			this.$grid.attr('aria-activedescendant', 'day' + minDay);
		} else if (isMaxMonth && ariaDate > maxDay) {
			this.date = maxDay;
			this.$grid.attr('aria-activedescendant', 'day' + maxDay);
		}
	}

	for (curDay = 1; curDay <= numDays; curDay++) {

		var isDisabled = (isMinMonth && curDay < minDay) || (isMaxMonth && curDay > maxDay);

		if (isDisabled) {
			gridCells += '\t\t<td id="day' + curDay + '" class="disabled"';
		} else if (curDay === this.date && this.currentDate === true) {
			gridCells += '\t\t<td id="day' + curDay + '" class="today"';
		} else {
			gridCells += '\t\t<td id="day' + curDay + '"';
		}
		gridCells += ' headers="' + this.dayNames[weekday] + '" role="gridcell" aria-selected="false">' + curDay + '</td>';


		if (weekday === 6 && curDay < numDays) {
			// This was the last day of the week, close it out
			// and begin a new one
			gridCells += '\t</tr>\n\t<tr id="row' + rowCount + '" role="row">\n';
			rowCount++;
			weekday = 0;
		} else {
			weekday++;
		}
	}

	// Insert any trailing empty cells
	for (weekday; weekday < 7; weekday++) {

		gridCells += '\t\t<td class="empty">&nbsp;</td>\n';
	}

	gridCells += '\t</tr>';

	$tbody.append(gridCells);
};

//
// calcNumDays() is a member function to calculate the number of days in a given month
//
// @return (integer) number of days
//
datepicker.prototype.calcNumDays = function(year, month) {

	return 32 - new Date(year, month, 32).getDate();
};

//
// calcstartWeekday() is a member function to calculate the day of the week the first day of a
// month lands on
//
// @return (integer) number representing the day of the week (0=Sunday....6=Saturday)
//
datepicker.prototype.calcStartWeekday = function(year, month) {

	return  new Date(year, month, 1).getDay();

}; // end calcStartWeekday()

datepicker.prototype.isMinMonth = function () {
	var minYr = this.minDate.getFullYear();
	if (this.year < minYr || (this.year === minYr && this.month <= this.minDate.getMonth())) {
		return true;
	}
	return false;
};

datepicker.prototype.isMaxMonth = function () {
	var maxYr = this.maxDate.getFullYear();
	if (this.year > maxYr || (this.year === maxYr && this.month >= this.maxDate.getMonth())) {
		return true;
	}
	return false;
};

datepicker.prototype.disablePrevBtn = function (isDisabled) {
	this.$prev[isDisabled ? 'addClass' : 'removeClass']('disabled');
};

datepicker.prototype.disableNextBtn = function (isDisabled) {
	this.$next[isDisabled ? 'addClass' : 'removeClass']('disabled');
};

datepicker.prototype.updateButtons = function () {
	this.disablePrevBtn(this.isMinMonth());
	this.disableNextBtn(this.isMaxMonth());
};


//
// showPrevMonth() is a member function to show the previous month
//
// @param (offset int) offset may be used to specify an offset for setting
//                      focus on a day the specified number of days from
//                      the end of the month.
// @return N/A
//
datepicker.prototype.showPrevMonth = function(offset) {
	// show the previous month if it's within bounds
	if (this.isMinMonth()) {
		return false;
	}

	if (this.month === 0) {
		this.month = 11;
		this.year--;
	} else {
		this.month--;
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	// if offset was specified, set focus on the last day - specified offset
	if (offset != null) {
		var numDays = this.calcNumDays(this.year, this.month);
		var day = 'day' + (numDays - offset);

		this.$grid.attr('aria-activedescendant', day);
		$('#' + day).addClass('focus').attr('aria-selected', 'true');
	}

	this.updateButtons();

}; // end showPrevMonth()

//
// showNextMonth() is a member function to show the next month
//
// @param (offset int) offset may be used to specify an offset for setting
//                      focus on a day the specified number of days from
//                      the beginning of the month.
// @return N/A
//
datepicker.prototype.showNextMonth = function(offset) {

	// show the next month if it's within bounds
	if (this.isMaxMonth()) {
		return false;
	}

	if (this.month === 11) {
		this.month = 0;
		this.year++;
	} else {
		this.month++;
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	// if offset was specified, set focus on the first day + specified offset
	if (offset != null) {
		var day = 'day' + offset;

		this.$grid.attr('aria-activedescendant', day);
		$('#' + day).addClass('focus').attr('aria-selected', 'true');
	}

	this.updateButtons();

}; // end showNextMonth()

//
// showPrevYear() is a member function to show the previous year
//
// @return N/A
//
datepicker.prototype.showPrevYear = function() {

	// decrement the year
	this.year--;

	if (this.isMinMonth()) {
		this.month = this.minDate.getMonth();
		this.year  = this.minDate.getFullYear();
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	this.updateButtons();

}; // end showPrevYear()

//
// showNextYear() is a member function to show the next year
//
// @return N/A
//
datepicker.prototype.showNextYear = function() {

	// increment the year
	this.year++;

	if (this.isMaxMonth()) {
		this.month = this.maxDate.getMonth();
		this.year  = this.maxDate.getFullYear();
	}

	if (this.month !== this.curMonth || this.year !== this.curYear) {
		this.currentDate = false;
	} else {
		this.currentDate = true;
	}

	// populate the calendar grid
	this.popGrid();

	this.setMonthDropdown();

	this.updateButtons();
}; // end showNextYear()

//
// bindHandlers() is a member function to bind event handlers for the widget
//
// @return N/A
//
datepicker.prototype.bindHandlers = function() {

	var thisObj = this;

	////////////////////// bind button handlers //////////////////////////////////
	this.$prev.click(function(e) {
		return thisObj.handlePrevClick(e);
	});

	this.$next.click(function(e) {
		return thisObj.handleNextClick(e);
	});

	this.$prev.keydown(function(e) {
		return thisObj.handlePrevKeyDown(e);
	});

	this.$next.keydown(function(e) {
		return thisObj.handleNextKeyDown(e);
	});

	this.$id.delegate('#month-dropdown', 'change', function (e) {
		if (e.which === thisObj.keys.down) {
			return true;
		}
		var theDate = new Date($(this).val());
		thisObj.setActiveDate(theDate);
		$('#month-dropdown').focus();
	});

	///////////// bind grid handlers //////////////

	this.$grid.keydown(function(e) {
		return thisObj.handleGridKeyDown(e);
	});

	this.$grid.keypress(function(e) {
		return thisObj.handleGridKeyPress(e);
	});

	this.$grid.focus(function(e) {
		return thisObj.handleGridFocus(e);
	});

	this.$grid.blur(function(e) {
		return thisObj.handleGridBlur(e);
	});

	this.$grid.delegate('td', 'click', function(e) {
		return thisObj.handleGridClick(this, e);
	});

}; // end bindHandlers();

//
// handlePrevClick() is a member function to process click events for the prev month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handlePrevClick = function(e) {

	if (e.ctrlKey) {
		this.showPrevYear();
	} else {
		this.showPrevMonth();
	}

	var active = this.$grid.attr('aria-activedescendant');
	if (this.currentDate === false) {
		this.$grid.attr('aria-activedescendant', 'day1');
	} else {
		this.$grid.attr('aria-activedescendant', active);
	}

	e.stopPropagation();
	return false;

}; // end handlePrevClick()

//
// handleNextClick() is a member function to process click events for the next month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleNextClick = function(e) {

	if (e.ctrlKey) {
		this.showNextYear();
	} else {
		this.showNextMonth();
	}

	var active = this.$grid.attr('aria-activedescendant');
	if (this.currentDate === false) {
		this.$grid.attr('aria-activedescendant', 'day1');
	} else {
		this.$grid.attr('aria-activedescendant', active);
	}

	e.stopPropagation();
	return false;

}; // end handleNextClick()

//
// handlePrevKeyDown() is a member function to process keydown events for the prev month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handlePrevKeyDown = function(e) {

	if (e.altKey) {
		return true;
	}

	switch (e.keyCode) {
		case this.keys.tab: {
			if (this.bModal === false || !e.shiftKey || e.ctrlKey) {
				return true;
			}

			this.$grid.focus();
			e.stopPropagation();
			return false;
		}
		case this.keys.enter:
		case this.keys.space: {
			if (e.shiftKey) {
				return true;
			}

			if (e.ctrlKey) {
				this.showPrevYear();
			}
			else {
				this.showPrevMonth();
			}

			e.stopPropagation();
			return false;
		}
	}

	return true;

}; // end handlePrevKeyDown()

//
// handleNextKeyDown() is a member function to process keydown events for the next month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleNextKeyDown = function(e) {

	if (e.altKey) {
		return true;
	}

	switch (e.keyCode) {
		case this.keys.enter:
		case this.keys.space: {

			if (e.ctrlKey) {
				this.showNextYear();
			}
			else {
				this.showNextMonth();
			}

			e.stopPropagation();
			return false;
		}
	}

	return true;

}; // end handleNextKeyDown()

//
// handleGridKeyDown() is a member function to process keydown events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridKeyDown = function(e) {

		var $rows = this.$grid.find('tbody tr');
		var $curDay = $('#' + this.$grid.attr('aria-activedescendant'));
		var $days = this.$grid.find('td').not('.empty');
		var $curRow = $curDay.parent();

		if (e.altKey) {
			return true;
		}

		switch(e.keyCode) {
			case this.keys.tab: {

				if (this.bModal === true) {
					if (e.shiftKey) {
						this.$next.focus();
					}
					else {
						this.$prev.focus();
					}
					e.stopPropagation();
					return false;
				}
				break;
			}
			case this.keys.enter:
			case this.keys.space: {

				if (e.ctrlKey) {
					return true;
				}
				this.setDate($curDay);

				// fall through
			}
			case this.keys.esc: {
				// dismiss the dialog box
				this.hideDlg(e.keyCode === this.keys.esc);

				e.stopPropagation();
				return false;
			}
			case this.keys.left: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) - 1;
				var $prevDay = null;

				if (dayIndex >= 0) {
					$prevDay = $days.eq(dayIndex);
					if ($prevDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$prevDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
				} else {
					this.showPrevMonth(0);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.right: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) + 1;
				var $nextDay = null;

				if (dayIndex < $days.length) {
					$nextDay = $days.eq(dayIndex);
					if ($nextDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$nextDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $nextDay.attr('id'));
				} else {
					// move to the next month
					this.showNextMonth(1);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.up: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) - 7;
				var $prevDay = null;

				if (dayIndex >= 0) {
					$prevDay = $days.eq(dayIndex);
					if ($prevDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$prevDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
				} else {
					// move to appropriate day in previous month
					dayIndex = 6 - $days.index($curDay);

					this.showPrevMonth(dayIndex);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.down: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				var dayIndex = $days.index($curDay) + 7;
				var $prevDay = null;

				if (dayIndex < $days.length) {
					$prevDay = $days.eq(dayIndex);
					if ($prevDay.hasClass('disabled')) {
						return false;
					}

					$curDay.removeClass('focus').attr('aria-selected', 'false');
					$prevDay.addClass('focus').attr('aria-selected', 'true');

					this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
				} else {
					// move to appropriate day in next month
					dayIndex = 8 - ($days.length - $days.index($curDay));

					this.showNextMonth(dayIndex);
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.pageup: {
				var active = this.$grid.attr('aria-activedescendant');


				if (e.shiftKey) {
					return true;
				}


				if (e.ctrlKey) {
					this.showPrevYear();
				} else {
					this.showPrevMonth();
				}

				if (this.isMinMonth()) {
					active = 'day' + this.minDate.getDate();
					this.$grid.attr('aria-activedescendant', active);
				}
				if ($('#' + active).attr('id') === undefined) {
					var lastDay = 'day' + this.calcNumDays(this.year, this.month);
					$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
				} else {
					$('#' + active).addClass('focus').attr('aria-selected', 'true');
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.pagedown: {
				var active = this.$grid.attr('aria-activedescendant');


				if (e.shiftKey) {
					return true;
				}

				if (e.ctrlKey) {
					this.showNextYear();
				} else {
					this.showNextMonth();
				}

				if (this.isMaxMonth()) {
					active = 'day' + this.maxDate.getDate();
					this.$grid.attr('aria-activedescendant', active);
				}
				if ($('#' + active).attr('id') === undefined) {
					var lastDay = 'day' + this.calcNumDays(this.year, this.month);
					$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
				} else {
					$('#' + active).addClass('focus').attr('aria-selected', 'true');
				}

				e.stopPropagation();
				return false;
			}
			case this.keys.home: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				$curDay.removeClass('focus').attr('aria-selected', 'false');

				var firstDay = 'day1';
				if (this.isMinMonth()) {
					firstDay = 'day' + this.minDate.getDate();
				}
				$('#' + firstDay).addClass('focus').attr('aria-selected', 'true');
				this.$grid.attr('aria-activedescendant', firstDay);

				e.stopPropagation();
				return false;
			}
			case this.keys.end: {

				if (e.ctrlKey || e.shiftKey) {
					return true;
				}

				$curDay.removeClass('focus').attr('aria-selected', 'false');

				var lastDay = 'day' + this.calcNumDays(this.year, this.month);
				if (this.isMaxMonth()) {
					lastDay = 'day' + this.maxDate.getDate();
				}
				$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');

				this.$grid.attr('aria-activedescendant', lastDay);

				e.stopPropagation();
				return false;
			}
		}

		return true;

}; // end handleGridKeyDown()

//
// handleGridKeyPress() is a member function to consume keypress events for browsers that
// use keypress to scroll the screen and manipulate tabs
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridKeyPress = function(e) {

		if (e.altKey) {
			return true;
		}

		switch(e.keyCode) {
			case this.keys.tab:
			case this.keys.enter:
			case this.keys.space:
			case this.keys.esc:
			case this.keys.left:
			case this.keys.right:
			case this.keys.up:
			case this.keys.down:
			case this.keys.pageup:
			case this.keys.pagedown:
			case this.keys.home:
			case this.keys.end: {
				e.stopPropagation();
				return false;
			}
		}

		return true;

}; // end handleGridKeyPress()

datepicker.prototype.handleGridClick = function(id, e) {
	var $cell = $(id);

	if ($cell.is('.empty') || $cell.is('.disabled')) {
		return true;
	}

	var cellId = $cell.attr('id');
	this.$grid.find('.active').removeClass('active').attr('aria-selected', 'false');
	$cell.addClass('active').attr('aria-selected', 'true');
	this.$grid.attr('aria-activedescendant', cellId);

	var $curDay = $('#' + cellId);

	this.setDate($curDay);

	this.hideDlg();
	e.stopPropagation();

	var next = this.$target.attr('next-id');
	$('#' + next).focus().click();

	return false;
};

datepicker.prototype.setDate = function ($curDay) {
    this.$target.val((this.month + 1) + '/' + $curDay.html() + '/' + (this.year - 2000));
    this.$target.trigger('change');
    this.handleDateSelection($curDay.html());
}

//
// handleGridFocus() is a member function to process focus events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) true
//
datepicker.prototype.handleGridFocus = function (e) {
	var active = this.$grid.attr('aria-activedescendant');

	if ($('#' + active).attr('id') === undefined) {
		var lastDay = 'day' + this.calcNumDays(this.year, this.month);
		$('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
	} else {
		$('#' + active).addClass('focus').attr('aria-selected', 'true');
	}

	return true;

}; // end handleGridFocus()

//
// handleGridBlur() is a member function to process blur events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) true
//
datepicker.prototype.handleGridBlur = function (e) {
	$('#' + this.$grid.attr('aria-activedescendant')).removeClass('focus').attr('aria-selected', 'false');

	return true;

}; // end handleGridBlur()


datepicker.prototype.handleDateSelection = function (dayOfMonth) {
	this.date = dayOfMonth;
	this.$grid.find('.selected').removeClass('selected');
	this.$grid.find('.focus').removeClass('focus');
	$('#day' + dayOfMonth).addClass('selected');
	return true;
};

//
// showDlg() is a member function to show the datepicker and give it focus. This function is only called if
// the datepicker is used in modal dialog mode.
//
// @return N/A
//
datepicker.prototype.showDlg = function() {

	var thisObj = this;

	this.isVisible = true;
	this.isGridClick = false;

	this.$id.bind('click', function () {
		thisObj.isGridClick = true;
	});

	// Bind an event listener to the document to capture all mouse events to make dialog modal
	$(document).bind('click', {asDatepicker: this}, this.documentClick);

	this.$grid.bind('mouseover', function () {
		thisObj.$grid.find('focus').removeClass('focus');
	});

	this.popGrid();

	// show the dialog
	this.$id.attr('aria-hidden', 'false');

	this.$grid.focus();

	var currentValue = new Date(this.$target.val());
	if (!isNaN(currentValue.getTime())) {
	    $('#day' + currentValue.getDate()).addClass('focus');
	    this.handleDateSelection(currentValue.getDate());
    }
}; // end showDlg()

datepicker.prototype.documentClick = function (e) {
	var thisObj = e.data.asDatepicker;
	if (thisObj.isGridClick) {
		thisObj.isGridClick = false;
	} else {
		thisObj.hideDlg(false, true);
		return false;
	}
};

//
// hideDlg() is a member function to hide the datepicker and remove focus. This function is only called if
// the datepicker is used in modal dialog mode.
//
// @return N/A
//
datepicker.prototype.hideDlg = function (isEsc, isDocumentClick) {

	this.isVisible = false;

	// unbind the modal event sinks
	$(document).unbind('click', this.documentClick);
	this.$grid.unbind('mouseover');
	this.$id.unbind('click');

	// hide the dialog
	this.$id.attr('aria-hidden', 'true');

	if (!isEsc && this.closeCb && !isDocumentClick) {
		this.closeCb();
	}
	if (!isDocumentClick) {
		// set focus on the focus target
		this.$target.focus();
	}

}; // end showDlg()


function DatePickerInit() {
    var _me = this;
    var _asDatepicker = null;
    var _dateOffsetRegex = /((\-?[\d]+)m)?((\-?[\d]+)d)?/;

    function setValidity(name, isValid) {
        if (!isValid) {
            console.log('!!! something related to the datepicker is not valid !!!');
        }
    };

    function isTooEarly(date, $target) {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var dateFilter = DateFilter();
        var minDateAttr = $target.attr('minDate');
        var minDate = dateFilter(minDateAttr) || today;
        var isTooEarly = minDate <= date;
        if (minDateAttr && !isTooEarly) {
            $target.val(minDate);
            isTooEarly = true;
        }
        setValidity('tooEarly', isTooEarly);
    };

    function isTooLate(date, $target) {
        var maxDateOffset = 330;
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + maxDateOffset);
        setValidity('tooLate', maxDate >= date);
    };

    function highlightInput(shouldHighlight, $target) {
        if (shouldHighlight && $target) {
            $target.select();
        }
    };

    var prevVal = '';
    function validateAndSetDate(callType, $target) {
        var dateFilter = DateFilter();
        var date = dateFilter($target.val());
        var newVal = '';
        if (date) {
            newVal = Date.parse(date);
        }
        if (newVal !== prevVal) {
            if (newVal && newVal.getMonth) {
                $target.val((newVal.getMonth() + 1) + '/' + newVal.getDate() + '/' + (newVal.getFullYear()));
            }
            $target.triggerHandler('input');
            prevVal = newVal;
        }

        if (date) {
            isTooEarly(date, $target);
            isTooLate(date, $target);
        }

        /*var nextElementId = $target.attr('next-id');

        if (nextElementId) {
            if (callType !== 'blur') {
                var element = document.getElementById(nextElementId);
                if (element) {
                    element = $(element);
                    if (!element.hasClass('ng-hide')) {
                        element.triggerHandler('click');
                    }
                }
            }
        }*/
    };

    function getDatePickerHtml() {
        return '<div id="as-datepicker" class="datepicker" aria-hidden="true">' +
                            '<div class="month-wrap">' +
                                '<div id="btn-prev" class="btn-prev" role="button" aria-labelledby="btn-prev-label" tabindex="0">&lsaquo;</div>' +
                                '<div id="month" class="month"></div>' +
                                '<div id="btn-next" class="btn-next" role="button" aria-labelledby="btn-next-label" tabindex="0">&rsaquo;</div>' +
                            '</div>' +
                            '<div>' +
                                '<table id="cal1" class="calendar" role="grid" aria-activedescendant="errMsg" aria-labelledby="month-label" tabindex="0">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<th scope="col">' +
                                                '<abbr id="Sunday" title="Sunday">Su</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Monday" title="Monday">Mo</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Tuesday" title="Tuesday">Tu</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Wednesday" title="Wednesday">We</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Thursday" title="Thursday">Th</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Friday" title="Friday">Fr</abbr>' +
                                            '</th>' +
                                            '<th scope="col">' +
                                                '<abbr id="Saturday" title="Saturday">Sa</abbr>' +
                                            '</th>' +
                                        '</tr>' +
                                    '</thead>' +
                                    '<tbody>' +
                                        '<tr>' +
                                            '<td id="errMsg" colspan="7">Javascript must be enabled</td>' +
                                        '</tr>' +
                                    '</tbody>' +
                                '</table>' +
                            '</div>' +
                            '<div id="btn-prev-label" class="sr-only">Go to previous month</div>' +
                            '<div id="btn-next-label" class="sr-only">Go to next month</div>' +
                            '<div id="month-label" class="sr-only" role="heading" aria-live="assertive" aria-atomic="true"></div>' +
                        '</div>';
    }

    function drawDatePickerIcons(scope) {
        $(scope + ' .as-datepicker').each(function () {
            var $self = $(this),
                datePickerHasNotWrapped = ($self.data('wrapped') === undefined) ? true : false;

            if (datePickerHasNotWrapped) {
                $self.attr('data-wrapped', true).wrap('<span class="as-datepicker-wrapper" />');
                $self.parent().append(
                    '<div class="icon-calendar" tabindex="0" aria-label="Open datepicker" role="button" alt="Open datepicker">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
                            '<path d="m 439 123 c -6 -5 -12 -8 -19 -8 l -26 0 l 0 -19 c 0 -9 -3 -17 -10 -24 c -6 -6 -14 -9 -23 -9 l -13 0 c -9 0 -16 3 -23 9 c -6 7 -9 15 -9 24 l 0 19 l -79 0 l 0 -19 c 0 -9 -3 -17 -9 -24 c -7 -6 -14 -9 -23 -9 l -13 0 c -9 0 -17 3 -23 9 c -7 7 -10 15 -10 24 l 0 19 l -26 0 c -7 0 -13 3 -18 8 c -6 5 -8 11 -8 18 l 0 261 c 0 8 2 14 8 19 c 5 5 11 8 18 8 l 287 0 c 7 0 13 -3 19 -8 c 5 -5 7 -11 7 -19 l 0 -261 c 0 -7 -2 -13 -7 -18 Z m -247 279 l -59 0 l 0 -58 l 59 0 Z m 0 -71 l -59 0 l 0 -66 l 59 0 Z m 0 -79 l -59 0 l 0 -58 l 59 0 Z m -5 -93 c -1 -1 -2 -3 -2 -5 l 0 -58 c 0 -2 1 -4 2 -5 c 1 -1 3 -2 5 -2 l 13 0 c 1 0 3 1 4 2 c 2 1 2 3 2 5 l 0 58 c 0 2 0 4 -2 5 c -1 1 -3 2 -4 2 l -13 0 c -2 0 -4 -1 -5 -2 Z m 83 243 l -65 0 l 0 -58 l 65 0 Z m 0 -71 l -65 0 l 0 -66 l 65 0 Z m 0 -79 l -65 0 l 0 -58 l 65 0 Z m 78 150 l -65 0 l 0 -58 l 65 0 Z m 0 -71 l -65 0 l 0 -66 l 65 0 Z m 0 -79 l -65 0 l 0 -58 l 65 0 Z m -4 -93 c -2 -1 -2 -3 -2 -5 l 0 -58 c 0 -2 0 -4 2 -5 c 1 -1 3 -2 4 -2 l 13 0 c 2 0 4 1 5 2 c 1 1 2 3 2 5 l 0 58 c 0 2 -1 4 -2 5 c -1 1 -3 2 -5 2 l -13 0 c -1 0 -3 -1 -4 -2 Z m 76 243 l -59 0 l 0 -58 l 59 0 Z m 0 -71 l -59 0 l 0 -66 l 59 0 Z m 0 -79 l -59 0 l 0 -58 l 59 0 Z" />' +
                        '</svg>' +
                    '</div>');
            }
        });
    }

    function bindEscapeKeyToHide(calendarid, asDatePicker) {
        $('#' + calendarid).bind('keydown', function (e) {
            if (e.keyCode === 27) { // escape
                asDatePicker.hideDlg(true, false);
            }
        });
    }

    function bindClickToShow(scope, asDatePicker) {
        $(scope + ' .as-datepicker, ' + scope + ' .as-datepicker + .icon-calendar').bind('click', function (e) {
            var $target = $(e.srcElement || e.target);
            while (($target.attr('tagName') || $target.prop('tagName')).toLowerCase() !== 'input') {
                $target = $target.parent();
                var $input = $target.find('input');
                if ($input.length > 0) {
                    $target = $($input[0]);
                }

                if (($target.attr('tagName') || $target.prop('tagName')).toLowerCase() === 'body') {
                    break;
                }
            }

            return showDatePicker(e, asDatePicker, $target, false);
        });
    }

    function bindEnterKeyToShow(scope, asDatePicker) {
        $(scope + ' .as-datepicker + .icon-calendar').bind('keydown', function (e) {
            if (e.keyCode !== 13) { // enter
                return;
            }

            var $srcElement = $(e.srcElement || e.target);
            var $input = $srcElement.parent().find('input');

            return showDatePicker(e, asDatePicker, $input, false);
        });
    }

    function getMinDate($target, dateFilter) {
        var minDate = new Date();
        if ($target.attr('minDate')) {
            minDate = dateFilter($target.attr('minDate'));
        } else if ($target.attr('minDateOffset')) {
            var matches = $target.attr('minDateOffset').match(_dateOffsetRegex);
            var monthOffset = 0;
            var dayOffset = 0;
            if (matches[2]) {
                monthOffset = parseInt(matches[2], 10);
            }
            if (matches[4]) {
                dayOffset = parseInt(matches[4], 10);
            }

            minDate = new Date(minDate.getFullYear(), minDate.getMonth() + monthOffset, minDate.getDate() + dayOffset);
        }
        return minDate;
    };

    function getMaxDate($target, dateFilter) {
        var maxDate = null;
        if ($target.attr('maxDateOffset')) {
            maxDate = new Date();
            var matches = $target.attr('maxDateOffset').match(_dateOffsetRegex);
            var monthOffset = 0;
            var dayOffset = 0;
            if (matches[2]) {
                monthOffset = parseInt(matches[2], 10);
            }
            if (matches[4]) {
                dayOffset = parseInt(matches[4], 10);
            }

            maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + monthOffset, maxDate.getDate() + dayOffset);
        }
        return maxDate;
    };

    function positionDatepicker($datepicker, $target) {
        $datepicker.$id.insertAfter($target);
        var $element = $target;
        var css = {
            top: ($element.parent().outerHeight()) + 'px',
            left: 'auto',
            right: 'auto'
        };
        var targetParentClass = $target.parent().parent().attr('class');
        if ((targetParentClass && targetParentClass.match('left-')) || $target.hasClass('left-calendar')) {
            css.left = '0';
        } else {
            css.right = '0';
        }
        $datepicker.$id.css(css);
    };

    function showDatePicker(e, asDatepicker, $target, shouldHighlight) {
        if (typeof makeDropdown === 'function') {
            makeDropdown.hide();
        }
        if (asDatepicker.isVisible
            && asDatepicker.$target[0].id === $target.attr('id')) {
            highlightInput(shouldHighlight);
            return false;
        }

        var dateFilter = DateFilter();
        var minDate = getMinDate($target, dateFilter);
        var maxDate = getMaxDate($target, dateFilter);
        var currentVal;
        var thisDate;
        var today = new Date();

        currentVal = $target.val();
        if (maxDate) {
            asDatepicker.setMaxDate(maxDate);
        }
        asDatepicker.setMinDate(minDate);
        
        if (currentVal) {
            thisDate = dateFilter(currentVal);
            if (thisDate) {
                asDatepicker.setActiveDate(thisDate);
            }
        } else if (minDate) {
            if (minDate < today) {
                asDatepicker.setActiveDate(today);
            } else {
                asDatepicker.setActiveDate(minDate);
            }
        }
        positionDatepicker(asDatepicker, $target);
        asDatepicker.$target = asDatepicker.getTarget($target.attr('id'));

        asDatepicker.setCloseCb(function () {
            validateAndSetDate('cb', $target);
        });
        asDatepicker.showDlg();
        highlightInput(shouldHighlight, $target);
        return false;
    };

    this.init = function (scope, targetid, dateChangeCallback, firstErrorId) {
        if (_asDatepicker == null) {
            $('body').append(getDatePickerHtml());
            _asDatepicker = new datepicker('as-datepicker', true);
        }
        drawDatePickerIcons(scope);
        bindEscapeKeyToHide('as-datepicker', _asDatepicker);
        bindClickToShow(scope, _asDatepicker);
        bindEnterKeyToShow(scope, _asDatepicker);

        if (firstErrorId != "") {
            $('#' +firstErrorId).focus().val($('#' +firstErrorId).val());
        }

        if (typeof dateChangeCallback === 'function') {
            $(scope + ' .as-datepicker').bind('change', dateChangeCallback);
        }
    }
}

    var flightDateChangeCallback = function (e) {

    var $target = $(e.srcElement || e.target);
    var datefilter = new DateFilter();
    var filteredDate = datefilter($target.val());
    if (filteredDate === null) {
        return;
    }

    var newVal = (filteredDate.getMonth() + 1) + '/' + filteredDate.getDate() + '/' + (filteredDate.getFullYear() - 2000);
    $target.val(newVal);

    var targetId = $target.attr('id');

    if (targetId === 'departureDate' || targetId === 'departureDate1') {
        var $returnDate = $('#returnDate');
        var returnDate = datefilter($returnDate.val());
        if (!returnDate || filteredDate >= returnDate) {
            $returnDate.val(newVal);
        }
    }

    var targetIndex = targetId === 'depatureDate' ? 1 : parseInt(targetId.substr(targetId.length - 1, 1), 10);
    for (targetIndex; targetIndex < 5; targetIndex += 1) {
        var $nextDepatureDate = $('#departureDate' + targetIndex);
        var nextDepartureDate = datefilter($nextDepatureDate.val());
        if (!nextDepartureDate || filteredDate >= nextDepartureDate) {
            $nextDepatureDate.val(newVal);
        }
    }
}

var datePickerInit = new DatePickerInit();

$(document).ready(function () {
    var _firstErrorId = $('.input-validation-error').first().attr('id');
    if (_firstErrorId != '' && $('#' + _firstErrorId).hasClass('as-datepicker')) {
        datePickerInit.init('body', 'DepartureDate1', flightDateChangeCallback, _firstErrorId);
    } else {
        datePickerInit.init('body', 'DepartureDate1', flightDateChangeCallback);
    }
});

/*global as */
// --------------------
// stnw library / start
// --------------------

// (s)ession (t)imeout (n)otification (w)idget object
// this block of code is responsible for initilizing the object
// implementing the countdown and setting the internal status.
// *** the UI code that implements this library is responsible
// for managing the UI that needs to respond to this object ***

//  How to trigger the timer lightbox in a page
//  1. Expiration time in millisecond
//  2. Warning time in millisecond
//  3. RedirectURL: set RedirectURL an empty string, if you don't want to redirect.
//  4. Custom Message: set a custom function to as.stnw.Done_Message, if you want to set a specific message. Ex: as.stnw.Done_Message: function () { return 'your message'; }
//  Full example:
//  function stnw_init_page() {
//     as.stnw.timings.session_timeout_in_msec = 30 * 1000; // expires in 30 secs (Default: 20 mins)
//     as.stnw.timings.session_timeout_warning_happens_in_msec = 5 * 1000; // warning appears in 5 secs (Default: 19 mins 40 secs)
//     as.stnw.RedirectURL = 'https://www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart&advise=eSessionTimeout';
//  };

// as.IsSessionTimeoutDown = false; // Set it 'false' in your local testing

if (typeof (as) !== "undefined" && as.IsSessionTimeoutDown === false) {
    as.stnw = (function () {
        var stnw = {
            lastCoords: {},
            pageSourceType: {
                Standalone: 'Standalone',
                ConsideredAsPurchaseFunnel: 'ConsideredAsPurchaseFunnel',
                ConsideredAsViewReservation: 'ConsideredAsViewReservation',
                ConsideredAsAvailability: 'ConsideredAsAvailability',
                ConsideredAsReissueAvailability: 'ConsideredAsReissueAvailability'
            },
            pageSource: 'Standalone',
            nlastContinueClick: 0,
            nlastContinueClickCookie: 0,
            done_callback: function () { },
            timeoutStart: function () { },
            RedirectURL: '',
            UserType: 'Anonymous',
            ajaxTimeout: 3000,
            bForceStartTimer: false,
            UserTypeAndRedirectUrlEnum: {
                AnonymousUser: { UserType: 'Anonymous', RedirectURL: '' },
                MAAUser: { UserType: 'MAAUser', RedirectURL: 'https://www.alaskaair.com/www2/ssl/myalaskaair/MyAlaskaAir.aspx?CurrentForm=UCSignInStart&advise=eSessionTimeout' },
                EZBUser: { UserType: 'EZBUser', RedirectURL: 'https://easybiz.alaskaair.com/signin?advise=eSessionTimeout' },
                EZBSuperUser: { UserType: 'EZBSuperUser', RedirectURL: '' },
                TravelAgent: { UserType: 'TravelAgent', RedirectURL: '' }
            },
            isLightboxOpen: false,
            configType: {
                Default: 'DEFAULT',
                Overridden: 'OVERRIDDEN'
            },
            isConfigSet: 'DEFAULT',
            isValidTimeout: true,

            Done_Message: function () {
                return 'Your session expired at <b>' + (new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")) + '</b>';
            },

            extendSession: function () {
                if (stnw.pageSource === stnw.pageSourceType.ConsideredAsPurchaseFunnel) {
                    var checkOutExtendedTimestamp = $('#CheckOutExtendedTimestamp');
                    if (checkOutExtendedTimestamp.length > 0 &&
                        (checkOutExtendedTimestamp.data('stale') === undefined || checkOutExtendedTimestamp.data('stale') === false)) {
                        $('#CheckOutExpirationTimestamp').val(checkOutExtendedTimestamp.val())
                        checkOutExtendedTimestamp.attr('data-stale', true);

                        $.ajax({
                            url: '//www.alaskaair.com/booking/signin/ExtendExpirationTimeout?t=' + (new Date()).getTime(),
                            success: function (data) {
                                if (data) {
                                    checkOutExtendedTimestamp.attr('data-stale', false).val(data);
                                }
                            }
                        });
                    }
                }
                if (stnw.pageSource === stnw.pageSourceType.ConsideredAsAvailability || stnw.pageSource === stnw.pageSourceType.ConsideredAsReissueAvailability) {
                   window.location.reload(true);
                }

				if (stnw.isValidTimeout === true) {
					$.ajax({
						url: '//www.alaskaair.com/services/v1/myaccount/getloginstatus?t=' + (new Date()).getTime(),
						success: function (data) {
							if (data.IsLoggedIn === false && stnw.bForceStartTimer === false) {
								stnw.done_callback();
							}
						},
						error: function (jqXHR, textStatus, errorThrown) {
							stnw.done_callback();
						},
						timeout: stnw.ajaxTimeout
					});
				}
            },

            showSessionTimeOutBox: function () {
                //show UI if warning time is reached.
                if (stnw.isValidTimeout === true && stnw.timings.warning_threshold_reached) {
                    // Prevent lightbox from blinking.
                    if ($('#sessionSection').css('display') === 'none') {
                        $('#sessionSection').showLightBox({
                            width: 460,
                            height: 215,
                            onClose: function () {
                                as.stnw.isLightboxOpen = false;
                                // Setting omniture tags
                                if (s_gi) {
                                    var s = s_gi('alaskacom');
                                    s.linkTrackVars = 'prop16';
                                    s.linkTrackEvents = 'None';
                                    s.prop16 = 'sessionExpiring::Close';
                                    s.tl(this, 'o', 'sessionExpiring::Close');
                                    s.prop16 = '';
                                }
                                as.stnw.setCookieByKey("nlastContinueClick", (parseInt(as.stnw.getCookieByKey("nlastContinueClick")) + 1).toString());
                                // We may refresh the page ... instead of stnw.continueSession();
                                if (typeof (stnw_reload_callback) === "function") {
                                    stnw_reload_callback();
                                }
                                else {
                                    as.stnw.extendSession(); // Extend Session
                                }
                            }
                        }).show();
                        $('#sessionSection').attr('tabindex', '0').focus();
                        as.stnw.isLightboxOpen = true;
                    }
                    // AS.COM/EASYBIZ Signout Signal
                    if (as.stnw.getCookieByKey('bSessionExpired') === true) {
                        stnw.isUserLoggedIn(null, as.stnw.done_callback);
                    }
                }
                else {
                    $('#sessionSection').hide();
                }
                $('#sessionTimeLeft').text(as.stnw.timeleft() + ' seconds');
            },

            init: function () {
                stnw.startTimer = function () {
                    var timer = {};

                    timer.is_settings_valid = function () {

                        if (typeof stnw.timings.session_timeout_in_msec !== 'number') {
                            console.log('Session timeout must be a positive number.');
                            return false;
                        }
                        if (stnw.timings.session_timeout_in_msec <= 0) {
                            console.log('Session timeout can\'t be zero or negative.');
                            return false;
                        }
                        if (typeof stnw.timings.session_timeout_warning_happens_in_msec !== 'number') {
                            console.log('Session timeout warning must be a positive number.');
                            return false;
                        }
                        if (stnw.timings.session_timeout_warning_happens_in_msec <= 0) {
                            console.log('Session timeout warning can\'t be zero or negative.');
                            return false;
                        }
                        if (stnw.timings.session_timeout_warning_happens_in_msec >= stnw.timings.session_timeout_in_msec) {
                            console.log('Session timeout warning must be smaller than Session timeout.');
                            return false;
                        }

                        return true;
                    };

                    timer.events = {
                        start: function () {
                            stnw.timings.countdown_started = new Date();   // start the countdown timer
                            // fire delayed event

                            var start = function () {
                                if (timer.is_settings_valid() == false) {
                                    return;
                                }
                                timer.events.check();
                                if (stnw.isValidTimeout === true && stnw.timings.session_has_timeedout == false) {
                                    setTimeout(start, stnw.timings.poll_time_in_msec);
                                }
                            };

                            start();
                        },
                        check: function () {
                            var elapsed_msec = stnw.timings.elapsed_in_msec();

                            // determine total percent complete, ie., ratio of 'elapsed time' to 'time session is active'
                            // UI will want to respond to this countdown
                            stnw.timings.total_countdown_percent_complete = Math.floor(100 * (elapsed_msec / stnw.timings.session_timeout_in_msec));

                            // determine warning percent complete, ie., ratio of 'elapsed time' to 'time to wait before warning'
                            // UI may want to respond to this countdown
                            stnw.timings.warning_countdown_percent_complete = Math.floor(100 * ((elapsed_msec - stnw.timings.session_timeout_warning_happens_in_msec) / (stnw.timings.session_timeout_in_msec - stnw.timings.session_timeout_warning_happens_in_msec)));

                            stnw.timings.count++;

                            var done = (elapsed_msec > stnw.timings.session_timeout_in_msec);
                            if (done) {
                                // finish and cleanup
                                stnw.timings.session_has_timeedout = true;

                                if (typeof stnw.done_callback !== 'undefined') {
									if (stnw.isValidTimeout === true) {
										stnw.done_callback();
									}
                                }
                            }

                            //raise callback so client can update its UI
                            if (typeof stnw.ui_update_callback !== 'undefined') {

                                stnw.timings.warning_threshold_reached = elapsed_msec >= stnw.timings.session_timeout_warning_happens_in_msec;
                                stnw.ui_update_callback(stnw.timings, done, stnw.timings.warning_threshold_reached);
                            }
                        }
                    };
                    timer.events.start();
                };

                stnw.setCookieByKey('bSessionExpired', true);

                var data = '<div id="sessionSection" style="display:none;" tabindex="-1"><h1 id="sessionExpiring">Session Expiring</h1><p id="sessionWillExpire" style="visibility:visible">Your session will expire in <span id="sessionTimeLeft"></span></p><p id="sessionKeepActive">To keep your session active, select Continue.</p><button id="sessionContinue" class="btn btn-green pull-right">CONTINUE</button></div>';
                $('body').append(data);

                // Bind events
                $('#sessionContinue').bind('click', function () {
                    $.hideLightBoxes();
                    $.hideFormFiller();

                    as.stnw.setCookieByKey('nlastContinueClick', (parseInt(as.stnw.getCookieByKey('nlastContinueClick')) + 1).toString());
                    // We may refresh the page ... instead of stnw.continueSession();
                    if (typeof (stnw_reload_callback) === "function") {
                        stnw_reload_callback();
                    }
                    else {
                        as.stnw.extendSession(); // Extend Session
                    }
                });

                //define callback to timer events
                stnw.ui_update_callback = function (timings, done, warning_time_met) {
                    // reset the Session, if 'Continue' button is hit in another tab.
                    if (as.stnw.nlastContinueClick < parseInt(as.stnw.getCookieByKey('nlastContinueClick'), 10)) {
                        if (as.stnw.isLightboxOpen) {
                            if ($.hideLightBoxes) {
                                $.hideLightBoxes();
                            }
                            if ($.hideFormFiller) {
                                $.hideFormFiller();
                            }
                        }
                        as.stnw.nlastContinueClick++;
                        as.stnw.continueSession();
                    }
                    else {
                        //show UI if warning time is reached.
                        if (stnw.timings.warning_threshold_reached) {
                            stnw.overrideSessionTimeAndRedirectURL(stnw.showSessionTimeOutBox);
                        } else {
                            $('#sessionSection').hide();
                        }
                    }
                };

                as.stnw.done_callback = function () {
                    $('#sessionExpiring').text('Session Expired').css({ color: 'red' });
                    $('#sessionKeepActive').css({ visibility: 'hidden' });
                    $('#sessionContinue').css({ visibility: 'hidden' });

                    $.ajax({
                        // This url will force the user to sign out.
                        url: '//www.alaskaair.com/services/v1/myaccount/logout',
                        type: 'POST',
                        data: { t: (new Date()).getDate() },
                        success: function () {
                            $('#sessionWillExpire').html(stnw.Done_Message());

                            if (stnw.pageSource === stnw.pageSourceType.ConsideredAsPurchaseFunnel &&
                                (stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType ||
                                stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType)) {
                                $('#CheckOutExpirationTimestamp').val($('#CheckOutExpiredTimestamp').val());
                                var refreshElement = document.getElementById('Refresh');
                                if (refreshElement) { refreshElement.click(); }
                            }
                            else if (stnw.pageSource === stnw.pageSourceType.ConsideredAsAvailability &&
                            (stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType ||
                            stnw.UserType === stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType)) {
                                $('#ShoppingExpirationTimestamp').val($('#ShoppingExpiredTimestamp').val());
                                var refreshElement = document.getElementById('Refresh');
                                if (refreshElement) { refreshElement.click(); }
                            }
                                // Move to SignIn Page.
                            else if (stnw.RedirectURL !== '') {
                                window.location.href = stnw.RedirectURL;
                            }
                                // We may refresh the page not to show outdated login status
                            else {
                                window.location.reload();
                            }
                        },
                        complete: function (jqXHR, textStatus, errorThrown) {
                            stnw.setCookieByKey('bSessionExpired', true);
                            $.closeEzPopoups(false);
                        }
                    });
                };

                stnw.overrideSessionTimeAndRedirectURL = function (showSessionTimeOutBoxCallback) {
                    if (stnw.isConfigSet === stnw.configType.Default) {
                        $.ajax({
                            url: '//www.alaskaair.com/services/v1/myaccount/getloginstatus?t=' + (new Date()).getTime(),
                            success: function (data) {
                                if (stnw.pageSource === stnw.pageSourceType.Standalone && data.IsSuperUser) {
                                    //as.stnw.timings.session_timeout_in_msec = 1300 * 1000; // expires in 30 secs (Default: 60 mins)
                                    //as.stnw.timings.session_timeout_warning_happens_in_msec = (1300 - 23) * 1000; // warning appears in 5 secs (Default: 59 mins 40 secs)
                                    as.stnw.timings.session_timeout_in_msec = (3600 - 3) * 1000; // expires in 90 mins (Default: 60 mins)
                                    as.stnw.timings.session_timeout_warning_happens_in_msec = (3600 - 23) * 1000; // warning appears in 59 mins 40 secs (Default: 19 mins 40 secs)
                                }
                                // Start timer callback, depending on user type
                                if (data.IsLoggedIn === true) {
                                    stnw.isValidTimeout = true;
                                    // Set User Type
                                    if (data.IsEasyBiz === true) {
                                        // Set Default Redirect URL for EasyBiz
                                        stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType;
                                        stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.EZBUser.RedirectURL;
                                    }
                                    else {
                                        stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType;
                                        // Overwrite RedirectURL in AS.COM, if each page doesn't specifiy Redirect URL
                                        if (stnw.RedirectURL === '') {
                                            // if not SiteCore page
                                            if (window.location &&
                                                (window.location.pathname.toLowerCase().indexOf('/content/') === -1
                                                    && window.location.pathname.toLowerCase() !== '/')) {
                                                stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.MAAUser.RedirectURL;
                                            }
                                        }
                                    }
                                }
                                else {
                                    stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType;
                                    if (as.stnw.bForceStartTimer === true) {
                                        stnw.isValidTimeout = true;
                                    } else {
                                        stnw.isValidTimeout = false;
                                        stnw.resetCookie();
                                    }
                                }
                                stnw.isConfigSet = stnw.configType.Overridden;
                                showSessionTimeOutBoxCallback();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                            }
                        });
                    } else if (stnw.isConfigSet === stnw.configType.Overridden) {
                        showSessionTimeOutBoxCallback();
                    }
                };
				
                stnw.isUserLoggedIn = function (successCallback, failureCallback) {
                    $.ajax({
                        url: '//www.alaskaair.com/services/v1/myaccount/getloginstatus?t=' + (new Date()).getTime(),
                        success: function (data) {
                            if (stnw.pageSource === stnw.pageSourceType.Standalone && data.IsSuperUser) {
                                //as.stnw.timings.session_timeout_in_msec = 1300 * 1000; // expires in 30 secs (Default: 60 mins)
                                //as.stnw.timings.session_timeout_warning_happens_in_msec = (1300 - 23) * 1000; // warning appears in 5 secs (Default: 59 mins 40 secs)
                                as.stnw.timings.session_timeout_in_msec = (3600 - 3) * 1000; // expires in 90 mins (Default: 60 mins)
                                as.stnw.timings.session_timeout_warning_happens_in_msec = (3600 - 23) * 1000; // warning appears in 59 mins 40 secs (Default: 19 mins 40 secs)
                            }
                            // Start timer callback, depending on user type
                            if (data.IsLoggedIn === true) {
                                stnw.setCookieByKey('bSessionExpired', false);
                                // Set User Type
                                if (data.IsEasyBiz === true) {
                                    // Set Default Redirect URL for EasyBiz
                                    stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.EZBUser.UserType;
                                    stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.EZBUser.RedirectURL;
                                }
                                else {
                                    stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.MAAUser.UserType;

                                    // Overwrite RedirectURL in AS.COM, if each page doesn't specifiy Redirect URL
                                    if (stnw.RedirectURL === '') {
                                        // if not SiteCore page
                                        if (window.location &&
                                            (window.location.pathname.toLowerCase().indexOf('/content/') === -1
                                                && window.location.pathname.toLowerCase() !== '/')) {
                                            stnw.RedirectURL = stnw.UserTypeAndRedirectUrlEnum.MAAUser.RedirectURL;
                                        }
                                    }
                                }

                                (successCallback || Function)();
                            }
                            else {
                                stnw.UserType = stnw.UserTypeAndRedirectUrlEnum.AnonymousUser.UserType;
                                if (as.stnw.bForceStartTimer === true) {
                                    stnw.setCookieByKey('bSessionExpired', false);
                                    (successCallback || Function)();
                                } else {
                                    (failureCallback || Function)();
                                }
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            stnw.setCookieByKey('bSessionExpired', true);
                        }
                    });
                };

                // Initialize multi-tab configuration
                stnw.nlastContinueClickCookie = stnw.getCookieByKey("nlastContinueClick");
                if (stnw.nlastContinueClickCookie === '' || stnw.nlastContinueClickCookie === '0') {
                    stnw.setCookieByKey('nlastContinueClick', '0');
                }
                // When any tab is refreshed, initialize.
                stnw.setCookieByKey('nlastContinueClick', (parseInt(stnw.getCookieByKey('nlastContinueClick')) + 1).toString());
                stnw.nlastContinueClick = parseInt(stnw.getCookieByKey('nlastContinueClick')) - 1;

                if (typeof (stnw_init_page) == "function") {
                    stnw_init_page();
                }

                as.stnw.startTimer();
            },

            timings: {
                count: 1,
                poll_time_in_msec: 1 * 1000,  // 1 sec
                session_timeout_in_msec: (1200 - 3) * 1000,  // 20 mins - 3 secs
                session_timeout_warning_happens_in_msec: (1200 - 23) * 1000,  // 20 mins - 23 secs
                countdown_started: null,
                total_countdown_percent_complete: 0,
                warning_countdown_percent_complete: 0,
                elapsed_in_msec: function () {
                    // Convert both dates to milliseconds
                    try {
                        var t_start = stnw.timings.countdown_started.getTime();
                        var t_now = (new Date()).getTime();

                        // Calculate the difference in milliseconds
                        var delta_msec = t_now - t_start;
                        return delta_msec;
                    }
                    catch (e) {
                        console.log(e);
                        return 0;
                    }
                },
                warning_threshold_reached: false,
                session_has_timeedout: false,
                is_resetting_session: false
            },

            timeleft : function () {
                return Math.floor(Math.max(0, (stnw.timings.session_timeout_in_msec - stnw.timings.elapsed_in_msec())) / 1000);
            },

            deleteCookie: function (strName, strDomain, strPath) {
                /*You are sking why god why? Why the heck you didn't use $cookieStore or $cookies to remove the cookie? Tried man, tied it all, but they won't do it, who knows why. So plain old JS to rescue.*/
                var dtmExpiry = new Date("January 1, 1970");
                document.cookie = strName + "=" + ((strPath) ? "; path=" + strPath : "") + ((strDomain) ? "; domain=" + strDomain : "") + "; expires=" + dtmExpiry.toGMTString();
            },

            resetCookie: function () {
                stnw.nlastContinueClick = 0;
                stnw.setCookieByKey('nlastContinueClick', '0');
                stnw.setCookieByKey('bSessionExpired', true);
            },

            getCookie: function (name) {
                var nameEQ = name + "=";
                var cookies = window.document.cookie.split(';');
                for (var i = 0, len = cookies.length; i < len; i++) {
                    var c = cookies[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
                    }
                }
                return {};
            },

            getCookieByKey: function (key) {
                var cookieCollection = stnw.getCookie('stnw');
                if (cookieCollection.hasOwnProperty(key)) {
                    return cookieCollection[key];
                }
                return '';
            },

            setCookieByKey: function (key, value) {
                var cookieCollection = stnw.getCookie('stnw'),
                    t = new Date();

                cookieCollection[key] = value;
                document.cookie = "stnw=" + JSON.stringify(cookieCollection) + "; expires=" + (new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours() + 2, t.getMinutes(), 0)).toGMTString() + "; path=/" + "; domain=www.alaskaair.com";
            },

            resetSession: function () {

                if (stnw.timings.is_resetting_session) return;

                stnw.timings.is_resetting_session = true;

                stnw.timings.countdown_started = new Date();   // start the countdown timer
                stnw.timings.session_has_timeedout = false;
                stnw.timings.warning_threshold_reached = false;

                stnw.timings.is_resetting_session = false;
            },

            continueSession: function () {
                stnw.resetSession();
                if (typeof stnw.continue_callback !== 'undefined') {
                    stnw.continue_callback();
                }
            }
        };

        return stnw;
    })();
}

var LiteEvent = (function () {
    function LiteEvent() {
        this.handlers = [];
    }
    LiteEvent.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    LiteEvent.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    LiteEvent.prototype.trigger = function (data) {
        if (this.handlers) {
            for (var x = 0; x < this.handlers.length; x += 1) {
                this.handlers[x](data);
            }
        }
    };
    return LiteEvent;
}());
/// <reference path="../seatmaps/LiteEvent.ts" />
var SideDrawer = (function () {
    function SideDrawer(title, description) {
        this.scroll = new LiteEvent();
        this.title = title;
        this.description = description;
    }
    SideDrawer.prototype.IsClosed = function () { return this.isClosed; };
    SideDrawer.prototype.ContentDiv = function () { return this.contentDiv; };
    SideDrawer.prototype.Scroll = function () {
        return this.scroll;
    };
    SideDrawer.prototype.TitleHeight = function () {
        if (!this.titleHeight) {
            this.titleHeight = this.titleDiv.clientHeight;
        }
        return this.titleHeight;
    };
    SideDrawer.prototype.Show = function () {
        this.focusOnClose = document.activeElement;
        if (!this.rootDiv) {
            this.rootDiv = this.Render();
            this.contentDiv = this.rootDiv.querySelector('.drawerContent-dynamic');
            document.querySelector('body').appendChild(this.rootDiv);
        }
        else {
            this.rootDiv.style.display = 'block';
            this.rootDiv.classList.add('rightSideDrawer');
        }
        var html = document.querySelector('html');
        html.style['-ms-overflow-style'] = 'none';
        html.style['overflow'] = 'hidden';
        this.focusHandler = this.HandleFocusChange.bind(this);
        this.escHandler = this.HandleEscKey.bind(this);
        document.addEventListener('focus', this.focusHandler, true);
        document.addEventListener('keydown', this.escHandler, true);
        if (this.contentDiv.innerHTML === '') {
            var spinnerElement = document.createElement('div');
            spinnerElement.classList.add('loading-spinner');
            this.contentDiv.appendChild(spinnerElement);
        }
        this.elementsHiddenOnOpen = [];
        var sibling = this.rootDiv.nextElementSibling;
        while (sibling) {
            if (!sibling.getAttribute('aria-hidden')) {
                sibling.setAttribute('aria-hidden', 'true');
                this.elementsHiddenOnOpen.push(sibling);
            }
            sibling = sibling.nextElementSibling;
        }
        sibling = this.rootDiv.previousElementSibling;
        while (sibling) {
            if (!sibling.getAttribute('aria-hidden')) {
                sibling.setAttribute('aria-hidden', 'true');
                this.elementsHiddenOnOpen.push(sibling);
            }
            sibling = sibling.previousElementSibling;
        }
        this.rootDiv.focus();
        this.isShown = true;
        return this.contentDiv;
    };
    SideDrawer.prototype.HandleEscKey = function (event) {
        if (event.keyCode == 27) {
            this.Close(event);
        }
    };
    SideDrawer.prototype.HandleClickToClose = function (event) {
        this.Close(event);
    };
    SideDrawer.prototype.HandleFocusChange = function (event) {
        // For accessibility, we must trap the focus in the drawer.
        if (!this.rootDiv.contains(event.target)) {
            event.stopPropagation();
            this.rootDiv.focus();
            return false;
        }
    };
    SideDrawer.prototype.Close = function (e) {
        if (this.isClosed) {
            return;
        }
        this.closeAnchor.parentElement.removeChild(this.closeAnchor);
        while (this.contentDiv.childElementCount > 0) {
            this.contentDiv.removeChild(this.contentDiv.firstChild);
        }
        var html = document.querySelector('html');
        html.style['-ms-overflow-style'] = 'auto';
        html.style['overflow'] = 'auto';
        this.rootDiv.classList.add('closeRightSideDrawer');
        var rd = this.rootDiv;
        var that = this;
        setTimeout(function () {
            rd.innerHTML = '';
            rd.style.display = 'none';
            rd.parentElement.removeChild(rd);
            that.focusOnClose.focus();
        }, 300);
        document.removeEventListener('focus', this.focusHandler);
        document.removeEventListener('keydown', this.escHandler);
        for (var x = 0; x < this.elementsHiddenOnOpen.length; x += 1) {
            this.elementsHiddenOnOpen[x].removeAttribute('aria-hidden');
        }
        this.elementsHiddenOnOpen = [];
        var evt = e || window.event;
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        else {
            evt.cancelBubble = true;
        }
        this.isClosed = true;
        return false;
    };
    SideDrawer.prototype.TransferContent = function (contentContainer) {
        if (!this.isShown) {
            this.Show();
        }
        this.contentDiv.innerHTML = '';
        while (contentContainer.childNodes.length > 0) {
            var element = contentContainer.firstChild;
            contentContainer.removeChild(element);
            this.contentDiv.appendChild(element);
        }
        if (contentContainer.parentElement) {
            contentContainer.parentElement.removeChild(contentContainer);
        }
    };
    SideDrawer.prototype.AddClassToContent = function (className) {
        this.contentDiv.classList.add(className);
    };
    SideDrawer.prototype.RemoveClassFromContent = function (className) {
        this.contentDiv.classList.remove(className);
    };
    SideDrawer.prototype.HandleScrollEvent = function (e) {
        var evt = e || window.event;
        this.scroll.trigger((evt.srcElement || evt.target).scrollTop);
    };
    SideDrawer.prototype.ForwardArrowKeys = function (e) {
        // TODO: Forward the arrow keys to the drawerContent div.
    };
    SideDrawer.prototype.HandleSiftTabOnRootDiv = function (e) {
        if (document.activeElement === this.rootDiv) {
            var evt = (e || window.event);
            if (evt.keyCode == 9 && evt.shiftKey) {
                this.closeAnchor.focus();
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
                return false;
            }
        }
        return true;
    };
    SideDrawer.prototype.HandleTabKeyOnCloseAnchor = function (e) {
        var evt = (e || window.event);
        if (evt.keyCode == 9 && !evt.shiftKey) {
            this.rootDiv.focus();
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            return false;
        }
        return true;
    };
    SideDrawer.prototype.Render = function () {
        var rootDiv = document.createElement('div');
        rootDiv.setAttribute('aria-label', this.description);
        rootDiv.tabIndex = -1;
        rootDiv.classList.add('rightSideDrawer');
        rootDiv.setAttribute('role', 'dialog');
        rootDiv.style['-ms-overflow-style'] = 'auto';
        rootDiv.onkeydown = this.HandleSiftTabOnRootDiv.bind(this);
        var drawerBackground = document.createElement('div');
        drawerBackground.classList.add('drawerBackground');
        rootDiv.appendChild(drawerBackground);
        drawerBackground.onclick = this.HandleClickToClose.bind(this);
        var drawerContent = document.createElement('div');
        drawerContent.classList.add('drawerContent');
        if (this.width) {
            drawerContent.style.width = this.width + 'px';
        }
        rootDiv.appendChild(drawerContent);
        drawerContent.onscroll = this.HandleScrollEvent.bind(this);
        this.titleDiv = document.createElement('h2');
        this.titleDiv.classList.add('slider-title');
        this.titleDiv.innerHTML = this.title;
        drawerContent.appendChild(this.titleDiv);
        var drawerContentDynamic = document.createElement('div');
        drawerContentDynamic.classList.add('drawerContent-dynamic');
        drawerContent.appendChild(drawerContentDynamic);
        this.closeAnchor = document.createElement('a');
        this.closeAnchor.classList.add('drawerClose');
        this.closeAnchor.title = 'Close dialog';
        this.closeAnchor.href = '#close';
        this.closeAnchor.onclick = this.Close.bind(this);
        this.closeAnchor.onkeydown = this.HandleTabKeyOnCloseAnchor.bind(this);
        drawerContent.appendChild(this.closeAnchor);
        var closeImg = document.createElement('img');
        closeImg.alt = 'close';
        closeImg.src = 'https://www.alaskaair.com/img/seatmaps/close_drawer.png';
        this.closeAnchor.appendChild(closeImg);
        return rootDiv;
    };
    SideDrawer.prototype.SetWidth = function (width) {
        this.width = width;
    };
    return SideDrawer;
}());

//# sourceMappingURL=sidedrawer.js.map

$(document).ready(function () {
    $('body').delegate('.side-drawer-init, .side-drawer-link', 'click', function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        if (url) {
            var title = $(this).data('title');
            var description = $(this).data('description') || title;
            var drawer = new SideDrawer(title, description);
            var selectorData = $(this).data('contentSelector');
            if ($(this).data('side-drawer-width')) {
                drawer.SetWidth($(this).data('side-drawer-width'));
            }
            drawer.Show();
            $.ajax({
                url: url,
                success: function (data) {
                    var drawerContent = document.createElement('div');
                    if (selectorData == undefined) {
                        drawerContent.innerHTML = data;
                    } else {
                        var drawerContentOject = $(data).find(selectorData);
                        drawerContent.innerHTML = drawerContentOject.html();
                    }
                    drawer.TransferContent(drawerContent);
                }
            });
        }
    });
});

$(function() {
	$( '.toggle').each(function() {
		$(this).attr("tabindex","0");
		if($(this).parent().hasClass("toggle-collapsed")) {
			$(this).attr("aria-expanded","false");
		} else {
			$(this).attr("aria-expanded","true");
		}
	});
});


$('body').delegate('.toggle', 'keydown', function(e) {
	if (e.keyCode == 13) {
		$(this).click();
	}
});

$('body').delegate('.toggle', 'click', function(e) {
    
    var $parent = $(this).parent();
    var toggleid = $(this).attr("toggle-id");
    var collclass = 'toggle-collapsed';
    
    if(!$parent.hasClass(collclass)) {
        $parent.find(toggleid).css("display","block");
		$(this).attr("aria-expanded","false");
    } else {
		$(this).attr("aria-expanded","true");
	}
    $parent.find(toggleid).slideToggle(350);
    $parent.toggleClass(collclass);
	e.preventDefault();
	return false;
});


/* Jump and toggle for set 1 pages */
$('body').delegate('.jumpscroll', 'click', function(e) {
    var scrollto = $(this).data('jumpto');
    
	if (typeof $(this).data('scroll-offset') === "undefined") {
		var offset = 0;
	} else {
		var offset = $(this).data('scroll-offset');
	}

	
    $('html, body').animate({
        'scrollTop': $(scrollto).offset().top - offset
    }, 1000, function(){
    	if($(scrollto).hasClass('toggle-collapsed')) {
    		$(scrollto).find('.toggle').trigger('click');
    	};
    });

	e.preventDefault();
});

function foresee() {
    var that = this;
    this.foreseeUrl;
    this.foreseeLauncher = function () {
        // Instructions: please embed this snippet directly into every page in your website template.
        // For optimal performance, this must be embedded directly into the template, not referenced
        // as an external file.

        // Answers Cloud Services Embed Script v1.02
        // DO NOT MODIFY BELOW THIS LINE *****************************************
        ; (function (g) {
            var d = document, i, am = d.createElement('script'), h = d.head || d.getElementsByTagName("head")[0],
                    aex = {
                        "src": that.foreseeUrl,
                        "type": "text/javascript",
                        "async": "true",
                        "data-vendor": "acs",
                        "data-role": "gateway"
                    };
            for (var attr in aex) { am.setAttribute(attr, aex[attr]); }
            h.appendChild(am);
            g['acsReady'] = function () { var aT = '__acsReady__', args = Array.prototype.slice.call(arguments, 0), k = setInterval(function () { if (typeof g[aT] === 'function') { clearInterval(k); for (i = 0; i < args.length; i++) { g[aT].call(g, function (fn) { return function () { setTimeout(fn, 1) }; }(args[i])); } } }, 50); };
        })(window);
        // DO NOT MODIFY ABOVE THIS LINE *****************************************
    }
}

if ("undefined" != typeof (as) && as.IsForeseeDown === false) {
    as.foresee = new foresee();
    as.foresee.foreseeUrl = as.ForeseeUrl;
}

// usage: defined a function downloadDeferredContent() in your page, it will be called during onload event
function DeferredLoader() {
    var _contentDownloaded = false;

    this.init = function () {
        _registerToDownloadDeferredContentOnLoad();
    };

    function _registerToDownloadDeferredContentOnLoad() {
        // Check for browser support of event handling capability
        if (window.addEventListener) {
            window.addEventListener("load", as.deferredLoader.startDownload, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", as.deferredLoader.startDownload);
        } else window.onload = as.deferredLoader.startDownload;
    }

    this.startDownload = function () {
        if (_contentDownloaded) { return; }

        _contentDownloaded = true;
        var re = new RegExp("IMAGEToken" + "=[^;]+", "i");
        var imageAgent = document.cookie.match(re);

        // defer omniture calls: s.t() and s2.t()
        if (typeof (callDeferredOmniture) == "function") {
            callDeferredOmniture();
        }

        // defer responsys TWRS async script tag
        if (as.rTWRS && !imageAgent) {
            as.rTWRS.insertAsyncScript();
        }

        // defer google analytics async script tag
        if (as.ga) {
            as.ga.insertAsyncScript();
            as.ga.insertECommerceConversionPixel();
        }

        // defer adReady global pixels
        if (as.adready) {
            // defer adReady specific pixels
            if (typeof (callDeferredAdreadyPixels) == "function") {
                callDeferredAdreadyPixels();
            }

            if (as.adready.includeGlobalPixels == true) {
                as.adready.insertGlobalPixels();
            }
        }

        //  defer Intent Media Pixel
        if (as.intentMediaPixel) {
            as.intentMediaPixel.insertIntentMediaGlobalPixel();
            as.intentMediaPixel.insertIntentMediaConversionPixel();
        }

        //  defer Sojern Pixel
        if (as.sojernPixel) {
            as.sojernPixel.insertSojernPixel();
        }

        // Defer loading of the foresee hosted code
        if (as && as.IsForeseeDown === false && !imageAgent && (localStorage && localStorage.getItem('isAutomatedTest')) !== true) {
            as.foresee.foreseeLauncher();
        }

        // defer interstitial images
        if (as.interstitial) {
            as.interstitial.insertInterstitialImages();
            }

        // defer wdcw pixels
        if (as.wdcw) {
            if (typeof (callDeferredWdcwPixels) == "function") {
                callDeferredWdcwPixels();
            }
            }

        // defer spanish pixels
        if (as.spanish) {
            as.spanish.insertPixelsByCurrentUrl();
            }

        // defer cake conversion pixels
        if (as.cake && as.CakeTag && as.CakeTag.SourceCookie &&
        (location.hostname.toString() == 'alaskaair.convertlanguage.com' || location.hostname.toString() == 'www.alaskaair.com') &&
        (location.pathname == "/alaskaair/enes/24/_www_alaskaair_com/booking/payment" || location.pathname == "/booking/payment")) {
            as.cake.insertCakeConversionPixels();
            }

        if (as.bing) {
            as.bing.insertPixelsByCurrentUrl();
            }

        if (as.jennLoader) {
            as.jennLoader.loadIfWasLaunched();
            }

        if (as.kenshoo) {
            as.kenshoo.insertPixelsByCurrentUrl();
            if (typeof (callDeferredKenshooPixels) == "function") {
                callDeferredKenshooPixels();
            }
            }

        if (typeof jQueryMigrateWarnings == 'function') {
            new jQueryMigrateWarnings().init(as.Environment);
            }

        // defer adready super pixel create call
        if (typeof (as.superPixel) != "undefined") {
            as.superPixel.ctrl.createSuperPixel();
            }

        // defer load session timeout template
        if (typeof (as.stnw) != "undefined" && !document.cookie.match(re)) {
            as.stnw.init();
            }

        new AdaraPagePixelClass().conditionalInsertPixel();

        // create the following function for deferring execution in your specific page
        if (typeof (downloadDeferredContent) == "function") {
            downloadDeferredContent();
            }
        }
        }

as.deferredLoader = new DeferredLoader();

$(document).ready(function() {
    as.deferredLoader.init();
    });

if (typeof (as) != "undefined" && as.IsResponsysTWRSDown == false && as.ResponsysTWRSAccount != "") {
    as.rTWRS = {
        trackingPageMapping: {
            shoppingPageIds: ["MatrixAvailability",
                                "CalendarAvailability",
                                "BundledAvailability"],
            cartPageIds: ["cart"],
            confirmPageIds: ["reservation"],
            signOutPageIds: ["UCSignOut"],
            isInShoppingPage: function (key) {
                return ($.inArray(key, as.rTWRS.trackingPageMapping.shoppingPageIds) != -1);
            },
            isInCartPage: function (key) {
                return ($.inArray(key, as.rTWRS.trackingPageMapping.cartPageIds) != -1);
            },
            isInConfirmPage: function (key) {
                var result = false;
                if ($.inArray(key, as.rTWRS.trackingPageMapping.confirmPageIds) != -1) {
                    result = true;
                    if (key == "booking:reservation") {
                        result = (repo.hasOwnProperty("formstate") && repo.formstate == "reservation^NewPurchase");
                    }
                }
                return result;
            },
            isInSignOutPage: function (key) {
                return ($.inArray(key, as.rTWRS.trackingPageMapping.signOutPageIds) != -1);
            }
        },
        analytics: {
            trackVisitor: function () {
                var customerId = _riTrack.getCookieValue(_custIDCookieName);

                if (as.rTWRS.analytics.hasLocalStorageSupport() && as.rTWRS.analytics.getDateStamp() != (new Date().toDateString())) {
                    as.rTWRS.analytics.trackEvent("TrackDailyUniqueVisitor", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No");
                    as.rTWRS.analytics.setDateStamp();
                }
                if (customerId === null && as.rTWRS.getCustomerId() !== "") {
                    as.rTWRS.analytics.trackEvent("TrackUniqueTrueCustomerVisit", "Yes");
                }
                else if (customerId !== null && as.rTWRS.getCustomerId() != undefined && customerId != as.rTWRS.getCustomerId())
                {
                    as.rTWRS.analytics.trackEvent("TrackUserSwitching", "Yes");
                }
            },
            trackEvent: function (eventName, hasCustomerContactId) {
                if (as.IsGoogleAnalyticsDown == false && typeof (ga) == "function") {
                    ga('send', 'event', 'ResponsysTWRS', 'ResponsysEvent_' + eventName, 'CustomerContactId', (hasCustomerContactId == 'Yes') ? 1 : 0);
                }
            },
            getDateStamp: function () {
                if (window.localStorage) { return window.localStorage.ResponsysDateStamp; }
                return '';
            },
            setDateStamp: function () {
                if (window.localStorage) { try { localStorage.setItem('ResponsysDateStamp', (new Date().toDateString())); } catch (e) { } }
            },
            hasLocalStorageSupport: function () {
                var testKey = 'test', storage = window.localStorage;
                try {
                    storage.setItem(testKey, '1');
                    storage.removeItem(testKey);
                    return true;
                }
                catch (error) {
                    return false;
                }
            }
        },
        getCustomerId: function () {
            return (as.ResponsysCustContactId !== "") ? as.ResponsysCustContactId : undefined;
        },
        insertAsyncScript: function (repo) {
            var repo = repo || window.as.Page,
                hasASPageRepo = (typeof (repo) != "undefined" && repo.hasOwnProperty("pageid"));

            if (hasASPageRepo &&
                    (as.rTWRS.trackingPageMapping.isInShoppingPage(repo.pageid) ||
                    as.rTWRS.trackingPageMapping.isInCartPage(repo.pageid) ||
                    as.rTWRS.trackingPageMapping.isInConfirmPage(repo.pageid) ||
                    as.rTWRS.trackingPageMapping.isInSignOutPage(repo.pageid))) {
                (function (i, s, o, g, r, a, m) {
                    i['ResponsysTWRSObject'] = r;
                    i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date();
                    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//wrs.adrsp.net/ts-twrs/js/twrs.min.js', '_riTrack');
            }
        },
        trackEvents: function (repo) {
            var repo = repo || window.as.Page,
                hasASPageRepo = (typeof (repo) != "undefined" && repo.hasOwnProperty("pageid"));

            // For now we are only tracking standard shopping, not re-issues
            if (hasASPageRepo && as.rTWRS.trackingPageMapping.isInShoppingPage(repo.pageid) && (repo.hasOwnProperty("ShoppingSearch") || repo.hasOwnProperty("LowFareItinerary"))) {
                var ss = repo.ShoppingSearch,
                    srchEvent = _riTrack.createSearch(undefined, as.rTWRS.getCustomerId(), ss.ItineraryType);

                for (var i = 0; i < ss.CityPairSlices.length; i++) {
                    var cps = ss.CityPairSlices[i];
                    if (!cps.IsInbound) {
                        srchEvent.addSlice(cps.DepartureShort, cps.ArrivalShort, cps.Date, null, ss.TravelersCount, ss.AdultCount, ss.ChildrenCount, (ss.IsRevenue) ? "Revenue" : "Award", 0, 0, ss.CabinType);
                    }
                    else {
                        srchEvent.addSlice(cps.DepartureShort, cps.ArrivalShort, cps.Date, null, ss.TravelersCount, ss.AdultCount, ss.ChildrenCount, (ss.IsRevenue) ? "Revenue" : "Award", 0, 0, ss.CabinType);
                    }
                }
                srchEvent.addOptionalData("DiscountType", ss.DiscountType);
                srchEvent.addOptionalData("Fare", ss.FareType);
                if (!ss.IsRevenue) {
                    srchEvent.addOptionalData("AwardOption", ss.AwardOption);
                    srchEvent.addOptionalData("ShopAwardCalendar", ss.ShopAwardCalendar);
                }
                else {
                    srchEvent.addOptionalData("ShopLowFareCalendar", ss.ShopLowFareCalendar);
                }
                srchEvent.addOptionalData("IncludeNearbyArrivalAirports", ss.IncludeNearbyArrivalAirports);
                srchEvent.addOptionalData("IncludeNearbyDepartureAirports", ss.IncludeNearbyDepartureAirports);
                srchEvent.addOptionalData("RequiresUmnrService", ss.RequiresUmnrService);

                srchEvent.trackSearchEvent(as.rTWRS.analytics.trackEvent("Id201_TrackSearch", (as.rTWRS.getCustomerId() !== undefined)? "Yes" : "No"));
                as.rTWRS.log('Responsys TWRS search event data : ', srchEvent.getJSON()[0].search);

                if (repo.hasOwnProperty("LowFareItinerary")) {
                    var itin = repo.LowFareItinerary,
                        itinEvent;

                    itinEvent = _riTrack.createSearchResults(as.rTWRS.getCustomerId(), undefined)
                    itinEvent.addItinerary(as.rTWRS.getItinerary(itin));
                    itinEvent.addOptionalData("SeatsRemaining", itin.SeatsRemaining);
                    itinEvent.trackSearchResults(as.rTWRS.analytics.trackEvent("Id202_TrackLowFareItinerary", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No"));
                    as.rTWRS.log('Responsys TWRS lowfare itinerary search results found');
                    as.rTWRS.log('Responsys TWRS lowfare itinerary search results event data : ', itinEvent.getJSON());
                }
            }
            if (hasASPageRepo
                && (as.rTWRS.trackingPageMapping.isInCartPage(repo.pageid) || as.rTWRS.trackingPageMapping.isInConfirmPage(repo.pageid))
                && repo.hasOwnProperty("Cart")
                && repo.Cart.hasOwnProperty("Itinerary")
                && repo.Cart.Itinerary.HasFlight) {
                var itin = repo.Cart.Itinerary,
                    isCartPage = (as.rTWRS.trackingPageMapping.isInCartPage(repo.pageid)),
                    itinEvent = (isCartPage) ? _riTrack.createItinerarySelect(as.rTWRS.getCustomerId(), undefined) : _riTrack.createItineraryPurchase(as.rTWRS.getCustomerId(), undefined);

                itinEvent.setItinerary(as.rTWRS.getItinerary(itin));
                itinEvent.addOptionalData("SeatsRemaining", itin.SeatsRemaining);
                if (isCartPage) {
                    itinEvent.trackItinerarySelect(as.rTWRS.analytics.trackEvent("Id204_TrackItinerarySelect", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No"));
                }
                else {
                    itinEvent.trackItineraryPurchase(as.rTWRS.analytics.trackEvent("Id205_TrackItineraryPurchase", (as.rTWRS.getCustomerId() !== undefined) ? "Yes" : "No"));
                }
                as.rTWRS.log('Responsys TWRS itinerary ' + ((isCartPage) ? 'select' : 'purchase') + ' event data : ', itinEvent.getJSON());
            }
            if (hasASPageRepo
                && as.rTWRS.trackingPageMapping.isInSignOutPage(repo.pageid)) {
                _riTrack.invalidateSession();
                as.rTWRS.analytics.trackEvent("TrackSignOut", "Yes");
                as.rTWRS.log('Responsys TWRS user session invalidated due sign-out activity');
            }
        },
        log: function (message, jObj) {
            if (typeof (window.as) !== "undefined" && window.as.hasOwnProperty("Environment") && window.as.Environment !== "prod") {
                var console = window.console || { log: function () { }, dir: function () { } };

                if (message) {
                    console.log(message);
                }

                if (jObj) {
                    console.log(jObj);
                }
            }
        },
        getItinerary: function (itinModel) {
            var itinerary = _riTrack.createItinerary(itinModel.Type, itinModel.Recloc, itinModel.FareType, itinModel.TotalFare, itinModel.Miles, itinModel.Distance, itinModel.Duration);
            for (var i = 0; i < itinModel.ItinerarySlices.length; i++) {
                var tSlice = _riTrack.createSlice(),
                        segments = itinModel.ItinerarySlices[i].SliceSegments;

                for (var j = 0; j < segments.length; j++) {
                    var tLeg = _riTrack.createLeg(),
                            seg = segments[j];

                    tLeg.setSegmentNumber(seg.SegmentNumber);
                    tLeg.setSegmentTimeLength(seg.Duration);
                    tLeg.setOriginAirport(seg.DepartureStationCode);
                    tLeg.setOriginAirportName(seg.DepartureStationName);
                    tLeg.setDestAirport(seg.ArrivalStationCode);
                    tLeg.setDestAirportName(seg.ArrivalStationName);
                    tLeg.setMktgCarrier(seg.MarketingCarrierCode);
                    tLeg.setIATAAirlineDesig(null);
                    tLeg.setMktgCarrierNumber(seg.FlightNumber);
                    tLeg.setOptCarrier(seg.OperatingCarrierCode);
                    tLeg.setIATAOptDesig(null);

                    tLeg.setOrigLocalDate(seg.DepartureStationDate);
                    tLeg.setOriginLocalTime(seg.DepartureStationTime);
                    tLeg.setOriginTimezone(seg.DepartureStationUTCTimeOffset);

                    tLeg.setDestLocalDate(seg.ArrivalStationDate);
                    tLeg.setDestLocalTime(seg.ArrivalStationTime);
                    tLeg.setDestTimezone(seg.ArrivalStationUTCTimeOffset);

                    tLeg.setOrigDate(seg.DepartureStationLocalDate);
                    tLeg.setOrigTime(seg.DepartureStationLocalTime);

                    tLeg.setDestDate(seg.ArrivalStationLocalDate);
                    tLeg.setDestTime(seg.ArrivalStationLocalTime);

                    tLeg.setEquipment(seg.Equipment);

                    tSlice.addLeg(tLeg);
                }
                itinerary.addSlice(tSlice);
            }
            return itinerary;
        }
    };
}

var _custIDCookieName = "riTrack_CustomerID",
    _riAccountCode = as.ResponsysTWRSAccount;

function _riInit() {
    _riTrack = riTrack.init(_riAccountCode);
    _riTrack.setCustIDCookieName(_custIDCookieName);

    as.rTWRS.analytics.trackVisitor();

    if (as.ResponsysCustContactId !== "") {
        _riTrack.setCustomer(as.ResponsysCustContactId);
    }

    as.rTWRS.log('Responsys TWRS code initialized for account id : ' + as.ResponsysTWRSAccount);
    as.rTWRS.log('Responsys TWRS - Customer ContactId  : ' + as.rTWRS.getCustomerId());

    as.rTWRS.trackEvents();
}

//http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
//http://support.google.com/googleanalytics/bin/answer.py?hl=en&answer=174090
if (typeof (as) != "undefined" && as.IsGoogleAnalyticsDown == false) {
    as.ga = {
        insertAsyncScript: function () {
            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

            ga('create', as.GoogleAnalyticsAccount, 'alaskaair.com');
            ga('require', 'displayfeatures');
            ga('send', 'pageview');
            as.ga.log('GA code initialized for account id : ' + as.GoogleAnalyticsAccount);
        },
        insertECommerceConversionPixel: function () { return; },
        log: function (message, jObj) {
            if (typeof (window.as) !== "undefined" && window.as.hasOwnProperty("Environment") && window.as.Environment !== "prod") {
                var console = window.console || { log: function () { }, dir: function () { } };

                if (message) {
                    console.log(message);
                }

                if (jObj) {
                    console.log(jObj);
                }
            }
        }
    };
}

var omniUtils = {
    console: window.console || { log: function () { return; }, dir: function () { return; } },
    debug: ((typeof (window.as) != "undefined" && as.hasOwnProperty("Environment")) ? as.Environment : '') != 'prod'
};

$(document).ready(function () {
    if (typeof (jQuery) != "undefined") {
        $("a[data-track-link], input[data-track-link], div[data-track-link]").each(function () {
            var $self = $(this),
                linkData = ($self.attr("data-track-link") != "") ? unescape($self.attr("data-track-link")) : "";

            if (linkData != "") {
                $self.click(function () {
                    var $self = $(this),
                        linkData = (window.JSON) ? JSON.parse(unescape($self.attr("data-track-link"))) : "",
                        pageId = (typeof (window.as) != "undefined" && as.hasOwnProperty("Page")) ? as.Page.pageid : '',
                        s = window.s,
                        href = $self.attr("href"),
                        isUnobtrusiveSameDomain = (linkData.hasOwnProperty("isUnobtrusiveSameDomain") && linkData.isUnobtrusiveSameDomain != "") ? linkData.isUnobtrusiveSameDomain : "";

                    if (linkData != "" && s != "undefined" && (pageId == "reservation" || pageId == "viewpnr")) {
                        var data = [];

                        data.push(pageId);

                        if (linkData.hasOwnProperty("section"))
                            data.push(linkData.section);

                        if (linkData.hasOwnProperty("linkName"))
                            data.push(linkData.linkName);

                        // currently unobtrusive-ness is identified by the dev by looking at the domain name
                        if (href != "" && isUnobtrusiveSameDomain == "true") {
                            var verifyDomain = document.createElement("a");
                            verifyDomain.href = $self.attr("href");

                            var isASDomain = (verifyDomain.hostname.indexOf('alaskaair.com') > 1) ? true : false;

                            if (isASDomain && href.indexOf('?') > -1) {
                                $self.attr("href", href + "&lid=" + escape(data.join(':')));
                                return true;
                            }
                            else if (isASDomain && href.indexOf('?') < 0) {
                                $self.attr("href", href + "?lid=" + escape(data.join(':')));
                                return true;
                            }
                        }
                        // just trigger tracking image code for js handled and external anchor links (if not tracked, then set target="_blank" and make it to open in new tab)
                        s.linkTrackVars = 'prop16'; s.linkTrackEvents = 'None'; s.prop16 = data.join(':'); s.tl(this, 'o', data.join(':')); s.prop16 = '';
                    }
                });
            }

            if (omniUtils.debug && window.JSON && typeof console !== 'undefined') {
                omniUtils.console.log(JSON.parse(linkData));
            } else if (omniUtils.debug) {
                omniUtils.console.log(linkData);
            }
        });
    }
});

function trackeVar59(referrerLink) {
    if (s_gi) { var s = s_gi('alaskacom'); s.linkTrackVars = 'eVar59'; s.linkTrackEvents = 'None'; s.eVar59 = referrerLink; s.tl(this, 'o', referrerLink); s.eVar59 = ''; }
    if (omniUtils.debug) { omniUtils.console.log("eVar59 tracked for : " + referrerLink); }
}

function trackeVar60(referrerLink) {
    if (s_gi) { var s = s_gi('alaskacom'); s.linkTrackVars = 'eVar60'; s.linkTrackEvents = 'None'; s.eVar60 = referrerLink; s.tl(this, 'o', referrerLink); s.eVar60 = ''; }
    if (omniUtils.debug) { omniUtils.console.log("eVar60 tracked for : " + referrerLink); }
}

$(document).delegate('a[data-omniture-tag]', 'click', function () {
    trackLink(this, 'omniture-tag');
});

$(document).delegate('form[data-omniture-tag-onsubmit]', 'submit', function () {
    trackLink(this, 'omniture-tag-onsubmit');
});

function trackLink(element, dataAttr) {
    if (window.s_gi) {
        var self = $(element),
            tag = self.data(dataAttr);

        if (tag) {
            var includePageName = self.data('omniture-include-pagename') === 'true';
            var s = window.s_gi('alaskacom');
            s.linkTrackVars = 'prop16';
            s.linkTrackEvents = 'None';
            s.prop16 = includePageName ? s.pageName + ' | ' + tag : tag;
            s.tl(element, 'o', tag);
            s.prop16 = '';
        }
    } else {
        if (console) {
            console.warn('s_gi is not defined!');
        }
    }
}

function do_nothing() { return false; } // prevent a second click for 10 seconds.
$(document).delegate('.nodblclick', 'click', function (e) {
    $(e.target).click(do_nothing);
    setTimeout(function () {
        $(e.target).unbind('click', do_nothing);
    }, 10000);
}); 

$(document).ready(function () {
    // Homepage doesn't pull in advisories this way
    if ($('#sitewide-advisory').length === 0) {
        $.ajax({
            url: '//' + asglobal.domainUrl + '/content/advisories/as-dot-com?type=all',
            cache: false,
            success: function (data) {
                if (data.toLowerCase().indexOf("this page has taken off") === -1) {
                    var $sitewideAdvisory = $('<div id="sitewide-advisory">' + data + '</div>');
                    $('body').prepend($sitewideAdvisory);
                    $sitewideAdvisory.click(function () {
                        $(this).slideUp();
                    });
                }
            }
        });
    }
});

$(document).delegate('.increment-count', 'click', function () {
    var $button = $(this);
    var wrapper = $button.parent();
    var control = wrapper.parent();
    var inputVal = control.find("input").val();
    inputVal++;
    control.find("input").val(inputVal);
    updateChildrenCount();
});

$(document).delegate('.decrement-count', 'click', function () {
    var $button = $(this);
    var wrapper = $button.parent();
    var control = wrapper.parent();
    var inputVal = control.find("input").val();
    if (inputVal > 0) {
        inputVal--;
        control.find("input").val(inputVal);
        updateChildrenCount();
    }
});

var updateChildrenCount = function () {
    var count = 0;

    //for each input validate it's a valid entry and if it's not default to 0
    $('input[class~="children-input"]').each(function () {
        var val = $(this).val();
        if (isNaN(val) || val === "") {
            val = 0;
            $(this).val(0);
        }
        count = count + parseInt(val);
    });

    var childrenTxt = " children";
    if (count === 1) { childrenTxt = " child"; }

    $("#numChildren").text(count + childrenTxt);
};

$(document).ready(function () {
    updateChildrenCount();
});

$(document).delegate('.children-input', 'focusout', function () {
    var num = parseInt($(this).val());
    updateChildrenCount();
})

$(document).delegate('#infantCount', 'focusout', function () {
    $('.dropdown').removeClass('open');
});

$(document).delegate('.dropdown-toggle', 'focus', function (e) {
    $(this).parent().toggleClass("open");
});

$(window).click(function (e) {
    //if the target isn't a child of the dropdown
    if ($('.dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0) {
        $('.dropdown').removeClass('open');
    }
});

function ShowAboutInfantCT() {
	var drawer = new SideDrawer('', '');
	drawer.Show();
	var drawerContent = document.createElement('div');
	var infantData = '';
	$.get('//' + asglobal.domainUrl + '/content/travel-info/policies/traveling-with-lap-infants/_lap-infants', function (data) {
		infantData = data;
		$.get('//' + asglobal.domainUrl + '/content/travel-info/policies/children-infants-and-children/_common/_free-baggage', function (data) {
			drawerContent.innerHTML = infantData + data;
			drawer.TransferContent(drawerContent);
		});
	});
	
};

/*! aXe v1.1.1
 * Copyright (c) 2015 Deque Systems, Inc.
 *
 * Your use of this Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This entire copyright notice must appear in every copy of this file you
 * distribute or in any file that contains substantial portions of this source
 * code.
 */
(function(window, document) {
  var getCookie =  function (cookieName) {
    var
      i, c, len,
      nameEQ = cookieName + "=",
      cookies = document.cookie.split(';');
    for (i = 0, len = cookies.length; i < len; i = i + 1) {
      c = cookies[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }

    return '';
  };

  if (getCookie("!AXECORE").toUpperCase() !== 'DISABLE') {
    function clone(obj) {
      "use strict";
      var index, length, out = obj;
      if (obj !== null && typeof obj === "object") {
        if (Array.isArray(obj)) {
          out = [];
          for (index = 0, length = obj.length; index < length; index++) {
            out[index] = clone(obj[index]);
          }
        } else {
          out = {};
          for (index in obj) {
            out[index] = clone(obj[index]);
          }
        }
      }
      return out;
    }
    var matchesSelector = function() {
      "use strict";
      var method;
      function getMethod(win) {
        var index, candidate, elProto = win.Element.prototype, candidates = [ "matches", "matchesSelector", "mozMatchesSelector", "webkitMatchesSelector", "msMatchesSelector" ], length = candidates.length;
        for (index = 0; index < length; index++) {
          candidate = candidates[index];
          if (elProto[candidate]) {
            return candidate;
          }
        }
      }
      return function(node, selector) {
        if (!method || !node[method]) {
          method = getMethod(node.ownerDocument.defaultView);
        }
        return node[method](selector);
      };
    }();
    var escapeSelector = function(value) {
      "use strict";
      var string = String(value);
      var length = string.length;
      var index = -1;
      var codeUnit;
      var result = "";
      var firstCodeUnit = string.charCodeAt(0);
      while (++index < length) {
        codeUnit = string.charCodeAt(index);
        if (codeUnit == 0) {
          throw new Error("INVALID_CHARACTER_ERR");
        }
        if (codeUnit >= 1 && codeUnit <= 31 || codeUnit >= 127 && codeUnit <= 159 || index == 0 && codeUnit >= 48 && codeUnit <= 57 || index == 1 && codeUnit >= 48 && codeUnit <= 57 && firstCodeUnit == 45) {
          result += "\\" + codeUnit.toString(16) + " ";
          continue;
        }
        if (index == 1 && codeUnit == 45 && firstCodeUnit == 45) {
          result += "\\" + string.charAt(index);
          continue;
        }
        if (codeUnit >= 128 || codeUnit == 45 || codeUnit == 95 || codeUnit >= 48 && codeUnit <= 57 || codeUnit >= 65 && codeUnit <= 90 || codeUnit >= 97 && codeUnit <= 122) {
          result += string.charAt(index);
          continue;
        }
        result += "\\" + string.charAt(index);
      }
      return result;
    };
    var uuid;
    (function(_global) {
      var _rng;
      var _crypto = _global.crypto || _global.msCrypto;
      if (!_rng && _crypto && _crypto.getRandomValues) {
        var _rnds8 = new Uint8Array(16);
        _rng = function whatwgRNG() {
          _crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
      }
      if (!_rng) {
        var _rnds = new Array(16);
        _rng = function() {
          for (var i = 0, r; i < 16; i++) {
            if ((i & 3) === 0) {
              r = Math.random() * 4294967296;
            }
            _rnds[i] = r >>> ((i & 3) << 3) & 255;
          }
          return _rnds;
        };
      }
      var BufferClass = typeof _global.Buffer == "function" ? _global.Buffer : Array;
      var _byteToHex = [];
      var _hexToByte = {};
      for (var i = 0; i < 256; i++) {
        _byteToHex[i] = (i + 256).toString(16).substr(1);
        _hexToByte[_byteToHex[i]] = i;
      }
      function parse(s, buf, offset) {
        var i = buf && offset || 0, ii = 0;
        buf = buf || [];
        s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
          if (ii < 16) {
            buf[i + ii++] = _hexToByte[oct];
          }
        });
        while (ii < 16) {
          buf[i + ii++] = 0;
        }
        return buf;
      }
      function unparse(buf, offset) {
        var i = offset || 0, bth = _byteToHex;
        return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
      }
      var _seedBytes = _rng();
      var _nodeId = [ _seedBytes[0] | 1, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5] ];
      var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 16383;
      var _lastMSecs = 0, _lastNSecs = 0;
      function v1(options, buf, offset) {
        var i = buf && offset || 0;
        var b = buf || [];
        options = options || {};
        var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
        var msecs = options.msecs != null ? options.msecs : new Date().getTime();
        var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
        var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
        if (dt < 0 && options.clockseq == null) {
          clockseq = clockseq + 1 & 16383;
        }
        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
          nsecs = 0;
        }
        if (nsecs >= 1e4) {
          throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
        }
        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;
        msecs += 122192928e5;
        var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
        b[i++] = tl >>> 24 & 255;
        b[i++] = tl >>> 16 & 255;
        b[i++] = tl >>> 8 & 255;
        b[i++] = tl & 255;
        var tmh = msecs / 4294967296 * 1e4 & 268435455;
        b[i++] = tmh >>> 8 & 255;
        b[i++] = tmh & 255;
        b[i++] = tmh >>> 24 & 15 | 16;
        b[i++] = tmh >>> 16 & 255;
        b[i++] = clockseq >>> 8 | 128;
        b[i++] = clockseq & 255;
        var node = options.node || _nodeId;
        for (var n = 0; n < 6; n++) {
          b[i + n] = node[n];
        }
        return buf ? buf : unparse(b);
      }
      function v4(options, buf, offset) {
        var i = buf && offset || 0;
        if (typeof options == "string") {
          buf = options == "binary" ? new BufferClass(16) : null;
          options = null;
        }
        options = options || {};
        var rnds = options.random || (options.rng || _rng)();
        rnds[6] = rnds[6] & 15 | 64;
        rnds[8] = rnds[8] & 63 | 128;
        if (buf) {
          for (var ii = 0; ii < 16; ii++) {
            buf[i + ii] = rnds[ii];
          }
        }
        return buf || unparse(rnds);
      }
      uuid = v4;
      uuid.v1 = v1;
      uuid.v4 = v4;
      uuid.parse = parse;
      uuid.unparse = unparse;
      uuid.BufferClass = BufferClass;
    })(window);
    var axecore = {};
    var commons;
    var require, define;
    var utils = axecore.utils = {};
    utils.matchesSelector = matchesSelector;
    utils.escapeSelector = escapeSelector;
    utils.clone = clone;
    var helpers = {};
    function setDefaultConfiguration(audit) {
      "use strict";
      var config = audit || {};
      config.rules = config.rules || [];
      config.tools = config.tools || [];
      config.checks = config.checks || [];
      config.data = config.data || {
        checks: {},
        rules: {}
      };
      return config;
    }
    function unpackToObject(collection, audit, method) {
      "use strict";
      var i, l;
      for (i = 0, l = collection.length; i < l; i++) {
        audit[method](collection[i]);
      }
    }
    function Audit(audit) {
      "use strict";
      audit = setDefaultConfiguration(audit);
      axecore.commons = commons = audit.commons;
      this.reporter = audit.reporter;
      this.rules = [];
      this.tools = {};
      this.checks = {};
      unpackToObject(audit.rules, this, "addRule");
      unpackToObject(audit.tools, this, "addTool");
      unpackToObject(audit.checks, this, "addCheck");
      this.data = audit.data || {
        checks: {},
        rules: {}
      };
      injectStyle(audit.style);
    }
    Audit.prototype.addRule = function(spec) {
      "use strict";
      if (spec.metadata) {
        this.data.rules[spec.id] = spec.metadata;
      }
      var candidate;
      for (var i = 0, l = this.rules.length; i < l; i++) {
        candidate = this.rules[i];
        if (candidate.id === spec.id) {
          this.rules[i] = new Rule(spec, this);
          return;
        }
      }
      this.rules.push(new Rule(spec, this));
    };
    Audit.prototype.addTool = function(spec) {
      "use strict";
      this.tools[spec.id] = new Tool(spec);
    };
    Audit.prototype.addCheck = function(spec) {
      "use strict";
      if (spec.metadata) {
        this.data.checks[spec.id] = spec.metadata;
      }
      this.checks[spec.id] = new Check(spec);
    };
    Audit.prototype.run = function(context, options, fn) {
      "use strict";
      var q = utils.queue();
      this.rules.forEach(function(rule) {
        if (utils.ruleShouldRun(rule, context, options)) {
          q.defer(function(cb) {
            rule.run(context, options, cb);
          });
        }
      });
      q.then(fn);
    };
    Audit.prototype.after = function(results, options) {
      "use strict";
      var rules = this.rules;
      return results.map(function(ruleResult) {
        var rule = utils.findBy(rules, "id", ruleResult.id);
        return rule.after(ruleResult, options);
      });
    };
    function CheckResult(check) {
      "use strict";
      this.id = check.id;
      this.data = null;
      this.relatedNodes = [];
      this.result = null;
    }
    function Check(spec) {
      "use strict";
      this.id = spec.id;
      this.options = spec.options;
      this.selector = spec.selector;
      this.evaluate = spec.evaluate;
      if (spec.after) {
        this.after = spec.after;
      }
      if (spec.matches) {
        this.matches = spec.matches;
      }
      this.enabled = spec.hasOwnProperty("enabled") ? spec.enabled : true;
    }
    Check.prototype.matches = function(node) {
      "use strict";
      if (!this.selector || utils.matchesSelector(node, this.selector)) {
        return true;
      }
      return false;
    };
    Check.prototype.run = function(node, options, callback) {
      "use strict";
      options = options || {};
      var enabled = options.hasOwnProperty("enabled") ? options.enabled : this.enabled, checkOptions = options.options || this.options;
      if (enabled && this.matches(node)) {
        var checkResult = new CheckResult(this);
        var checkHelper = utils.checkHelper(checkResult, callback);
        var result;
        try {
          result = this.evaluate.call(checkHelper, node, checkOptions);
        } catch (e) {
          axecore.log(e.message, e.stack);
          callback(null);
          return;
        }
        if (!checkHelper.isAsync) {
          checkResult.result = result;
          setTimeout(function() {
            callback(checkResult);
          }, 0);
        }
      } else {
        callback(null);
      }
    };
    function pushUniqueFrame(collection, frame) {
      "use strict";
      if (utils.isHidden(frame)) {
        return;
      }
      var fr = utils.findBy(collection, "node", frame);
      if (!fr) {
        collection.push({
          node: frame,
          include: [],
          exclude: []
        });
      }
    }
    function pushUniqueFrameSelector(context, type, selectorArray) {
      "use strict";
      context.frames = context.frames || [];
      var result, frame;
      var frames = document.querySelectorAll(selectorArray.shift());
      frameloop: for (var i = 0, l = frames.length; i < l; i++) {
        frame = frames[i];
        for (var j = 0, l2 = context.frames.length; j < l2; j++) {
          if (context.frames[j].node === frame) {
            context.frames[j][type].push(selectorArray);
            break frameloop;
          }
        }
        result = {
          node: frame,
          include: [],
          exclude: []
        };
        if (selectorArray) {
          result[type].push(selectorArray);
        }
        context.frames.push(result);
      }
    }
    function normalizeContext(context) {
      "use strict";
      if (context && typeof context === "object" || context instanceof NodeList) {
        if (context instanceof Node) {
          return {
            include: [ context ],
            exclude: []
          };
        }
        if (context.hasOwnProperty("include") || context.hasOwnProperty("exclude")) {
          return {
            include: context.include || [ document ],
            exclude: context.exclude || []
          };
        }
        if (context.length === +context.length) {
          return {
            include: context,
            exclude: []
          };
        }
      }
      if (typeof context === "string") {
        return {
          include: [ context ],
          exclude: []
        };
      }
      return {
        include: [ document ],
        exclude: []
      };
    }
    function parseSelectorArray(context, type) {
      "use strict";
      var item, result = [];
      for (var i = 0, l = context[type].length; i < l; i++) {
        item = context[type][i];
        if (typeof item === "string") {
          result = result.concat(utils.toArray(document.querySelectorAll(item)));
          break;
        } else {
          if (item && item.length) {
            if (item.length > 1) {
              pushUniqueFrameSelector(context, type, item);
            } else {
              result = result.concat(utils.toArray(document.querySelectorAll(item[0])));
            }
          } else {
            result.push(item);
          }
        }
      }
      return result.filter(function(r) {
        return r;
      });
    }
    function Context(spec) {
      "use strict";
      var self = this;
      this.frames = [];
      this.initiator = spec && typeof spec.initiator === "boolean" ? spec.initiator : true;
      this.page = false;
      spec = normalizeContext(spec);
      this.exclude = spec.exclude;
      this.include = spec.include;
      this.include = parseSelectorArray(this, "include");
      this.exclude = parseSelectorArray(this, "exclude");
      utils.select("frame, iframe", this).forEach(function(frame) {
        if (isNodeInContext(frame, self)) {
          pushUniqueFrame(self.frames, frame);
        }
      });
      if (this.include.length === 1 && this.include[0] === document) {
        this.page = true;
      }
    }
    function RuleResult(rule) {
      "use strict";
      this.id = rule.id;
      this.result = axecore.constants.result.NA;
      this.pageLevel = rule.pageLevel;
      this.impact = null;
      this.nodes = [];
    }
    function Rule(spec, parentAudit) {
      "use strict";
      this._audit = parentAudit;
      this.id = spec.id;
      this.selector = spec.selector || "*";
      this.excludeHidden = typeof spec.excludeHidden === "boolean" ? spec.excludeHidden : true;
      this.enabled = typeof spec.enabled === "boolean" ? spec.enabled : true;
      this.pageLevel = typeof spec.pageLevel === "boolean" ? spec.pageLevel : false;
      this.any = spec.any || [];
      this.all = spec.all || [];
      this.none = spec.none || [];
      this.tags = spec.tags || [];
      if (spec.matches) {
        this.matches = spec.matches;
      }
    }
    Rule.prototype.matches = function() {
      "use strict";
      return true;
    };
    Rule.prototype.gather = function(context) {
      "use strict";
      var elements = utils.select(this.selector, context);
      if (this.excludeHidden) {
        return elements.filter(function(element) {
          return !utils.isHidden(element);
        });
      }
      return elements;
    };
    Rule.prototype.runChecks = function(type, node, options, callback) {
      "use strict";
      var self = this;
      var checkQueue = utils.queue();
      this[type].forEach(function(c) {
        var check = self._audit.checks[c.id || c];
        var option = utils.getCheckOption(check, self.id, options);
        checkQueue.defer(function(done) {
          check.run(node, option, done);
        });
      });
      checkQueue.then(function(results) {
        results = results.filter(function(check) {
          return check;
        });
        callback({
          type: type,
          results: results
        });
      });
    };
    Rule.prototype.run = function(context, options, callback) {
      "use strict";
      var nodes = this.gather(context);
      var q = utils.queue();
      var self = this;
      var ruleResult;
      ruleResult = new RuleResult(this);
      nodes.forEach(function(node) {
        if (self.matches(node)) {
          q.defer(function(nodeQueue) {
            var checkQueue = utils.queue();
            checkQueue.defer(function(done) {
              self.runChecks("any", node, options, done);
            });
            checkQueue.defer(function(done) {
              self.runChecks("all", node, options, done);
            });
            checkQueue.defer(function(done) {
              self.runChecks("none", node, options, done);
            });
            checkQueue.then(function(results) {
              if (results.length) {
                var hasResults = false, result = {
                  node: new utils.DqElement(node)
                };
                results.forEach(function(r) {
                  var res = r.results.filter(function(result) {
                    return result;
                  });
                  result[r.type] = res;
                  if (res.length) {
                    hasResults = true;
                  }
                });
                if (hasResults) {
                  ruleResult.nodes.push(result);
                }
              }
              nodeQueue();
            });
          });
        }
      });
      q.then(function() {
        callback(ruleResult);
      });
    };
    function findAfterChecks(rule) {
      "use strict";
      return utils.getAllChecks(rule).map(function(c) {
        var check = rule._audit.checks[c.id || c];
        return typeof check.after === "function" ? check : null;
      }).filter(Boolean);
    }
    function findCheckResults(nodes, checkID) {
      "use strict";
      var checkResults = [];
      nodes.forEach(function(nodeResult) {
        var checks = utils.getAllChecks(nodeResult);
        checks.forEach(function(checkResult) {
          if (checkResult.id === checkID) {
            checkResults.push(checkResult);
          }
        });
      });
      return checkResults;
    }
    function filterChecks(checks) {
      "use strict";
      return checks.filter(function(check) {
        return check.filtered !== true;
      });
    }
    function sanitizeNodes(result) {
      "use strict";
      var checkTypes = [ "any", "all", "none" ];
      var nodes = result.nodes.filter(function(detail) {
        var length = 0;
        checkTypes.forEach(function(type) {
          detail[type] = filterChecks(detail[type]);
          length += detail[type].length;
        });
        return length > 0;
      });
      if (result.pageLevel && nodes.length) {
        nodes = [ nodes.reduce(function(a, b) {
          if (a) {
            checkTypes.forEach(function(type) {
              a[type].push.apply(a[type], b[type]);
            });
            return a;
          }
        }) ];
      }
      return nodes;
    }
    Rule.prototype.after = function(result, options) {
      "use strict";
      var afterChecks = findAfterChecks(this);
      var ruleID = this.id;
      afterChecks.forEach(function(check) {
        var beforeResults = findCheckResults(result.nodes, check.id);
        var option = utils.getCheckOption(check, ruleID, options);
        var afterResults = check.after(beforeResults, option);
        beforeResults.forEach(function(item) {
          if (afterResults.indexOf(item) === -1) {
            item.filtered = true;
          }
        });
      });
      result.nodes = sanitizeNodes(result);
      return result;
    };
    function Tool(spec) {
      "use strict";
      spec.source = spec.source || {};
      this.id = spec.id;
      this.options = spec.options;
      this._run = spec.source.run;
      this._cleanup = spec.source.cleanup;
      this.active = false;
    }
    Tool.prototype.run = function(element, options, callback) {
      "use strict";
      options = typeof options === "undefined" ? this.options : options;
      this.active = true;
      this._run(element, options, callback);
    };
    Tool.prototype.cleanup = function(callback) {
      "use strict";
      this.active = false;
      this._cleanup(callback);
    };
    axecore.constants = {};
    axecore.constants.result = {
      PASS: "PASS",
      FAIL: "FAIL",
      NA: "NA"
    };
    axecore.constants.raisedMetadata = {
      impact: [ "minor", "moderate", "serious", "critical" ]
    };
    axecore.version = "dev";
    window.axecore = axecore;
    axecore.log = function() {
      "use strict";
      if (typeof console === "object" && console.log) {
        Function.prototype.apply.call(console.log, console, arguments);
      }
    };
    function cleanupTools(callback) {
      "use strict";
      if (!axecore._audit) {
        throw new Error("No audit configured");
      }
      var q = utils.queue();
      Object.keys(axecore._audit.tools).forEach(function(key) {
        var tool = axecore._audit.tools[key];
        if (tool.active) {
          q.defer(function(done) {
            tool.cleanup(done);
          });
        }
      });
      utils.toArray(document.querySelectorAll("frame, iframe")).forEach(function(frame) {
        q.defer(function(done) {
          return utils.sendCommandToFrame(frame, {
            command: "cleanup-tool"
          }, done);
        });
      });
      q.then(callback);
    }
    axecore.cleanup = cleanupTools;
    axecore.configure = function(spec) {
      "use strict";
      var audit = axecore._audit;
      if (!audit) {
        throw new Error("No audit configured");
      }
      if (spec.reporter && (typeof spec.reporter === "function" || reporters[spec.reporter])) {
        audit.reporter = spec.reporter;
      }
      if (spec.checks) {
        spec.checks.forEach(function(check) {
          audit.addCheck(check);
        });
      }
      if (spec.rules) {
        spec.rules.forEach(function(rule) {
          audit.addRule(rule);
        });
      }
      if (spec.tools) {
        spec.tools.forEach(function(tool) {
          audit.addTool(tool);
        });
      }
    };
    axecore.getRules = function(tags) {
      "use strict";
      tags = tags || [];
      var matchingRules = !tags.length ? axecore._audit.rules : axecore._audit.rules.filter(function(item) {
        return !!tags.filter(function(tag) {
          return item.tags.indexOf(tag) !== -1;
        }).length;
      });
      var ruleData = axecore._audit.data.rules || {};
      return matchingRules.map(function(matchingRule) {
        var rd = ruleData[matchingRule.id] || {};
        return {
          ruleId: matchingRule.id,
          description: rd.description,
          help: rd.help,
          helpUrl: rd.helpUrl,
          tags: matchingRule.tags
        };
      });
    };
    function runCommand(data, callback) {
      "use strict";
      var context = data && data.context || {};
      if (context.include && !context.include.length) {
        context.include = [ document ];
      }
      var options = data && data.options || {};
      switch (data.command) {
       case "rules":
        return runRules(context, options, callback);

       case "run-tool":
        return runTool(data.parameter, data.selectorArray, options, callback);

       case "cleanup-tool":
        return cleanupTools(callback);
      }
    }
    axecore._load = function(audit) {
      "use strict";
      utils.respondable.subscribe("axecore.ping", function(data, respond) {
        respond({
          axe: true
        });
      });
      utils.respondable.subscribe("axecore.start", runCommand);
      axecore._audit = new Audit(audit);
    };
    var reporters = {};
    var defaultReporter;
    function getReporter(reporter) {
      "use strict";
      if (typeof reporter === "string" && reporters[reporter]) {
        return reporters[reporter];
      }
      if (typeof reporter === "function") {
        return reporter;
      }
      return defaultReporter;
    }
    axecore.reporter = function registerReporter(name, cb, isDefault) {
      "use strict";
      reporters[name] = cb;
      if (isDefault) {
        defaultReporter = cb;
      }
    };
    function runRules(context, options, callback) {
      "use strict";
      context = new Context(context);
      var q = utils.queue();
      var audit = axecore._audit;
      if (context.frames.length) {
        q.defer(function(done) {
          utils.collectResultsFromFrames(context, options, "rules", null, done);
        });
      }
      q.defer(function(cb) {
        audit.run(context, options, cb);
      });
      q.then(function(data) {
        var results = utils.mergeResults(data.map(function(d) {
          return {
            results: d
          };
        }));
        if (context.initiator) {
          results = audit.after(results, options);
          results = results.map(utils.finalizeRuleResult);
        }
        callback(results);
      });
    }
    axecore.a11yCheck = function(context, options, callback) {
      "use strict";
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (!options || typeof options !== "object") {
        options = {};
      }
      var audit = axecore._audit;
      if (!audit) {
        throw new Error("No audit configured");
      }
      var reporter = getReporter(options.reporter || audit.reporter);
      runRules(context, options, function(results) {
        reporter(results, callback);
      });
    };
    function runTool(toolId, selectorArray, options, callback) {
      "use strict";
      if (!axecore._audit) {
        throw new Error("No audit configured");
      }
      if (selectorArray.length > 1) {
        var frame = document.querySelector(selectorArray.shift());
        return utils.sendCommandToFrame(frame, {
          options: options,
          command: "run-tool",
          parameter: toolId,
          selectorArray: selectorArray
        }, callback);
      }
      var node = document.querySelector(selectorArray.shift());
      axecore._audit.tools[toolId].run(node, options, callback);
    }
    axecore.tool = runTool;
    helpers.failureSummary = function failureSummary(nodeData) {
      "use strict";
      var failingChecks = {};
      failingChecks.none = nodeData.none.concat(nodeData.all);
      failingChecks.any = nodeData.any;
      return Object.keys(failingChecks).map(function(key) {
        if (!failingChecks[key].length) {
          return;
        }
        return axecore._audit.data.failureSummaries[key].failureMessage(failingChecks[key].map(function(check) {
          return check.message || "";
        }));
      }).filter(function(i) {
        return i !== undefined;
      }).join("\n\n");
    };
    helpers.formatCheck = function(check) {
      "use strict";
      return {
        id: check.id,
        impact: check.impact,
        message: check.message,
        data: check.data,
        relatedNodes: check.relatedNodes.map(helpers.formatNode)
      };
    };
    helpers.formatChecks = function(nodeResult, data) {
      "use strict";
      nodeResult.any = data.any.map(helpers.formatCheck);
      nodeResult.all = data.all.map(helpers.formatCheck);
      nodeResult.none = data.none.map(helpers.formatCheck);
      return nodeResult;
    };
    helpers.formatNode = function(node) {
      "use strict";
      return {
        target: node ? node.selector : null,
        html: node ? node.source : null
      };
    };
    helpers.formatRuleResult = function(ruleResult) {
      "use strict";
      return {
        id: ruleResult.id,
        description: ruleResult.description,
        help: ruleResult.help,
        helpUrl: ruleResult.helpUrl || null,
        impact: null,
        tags: ruleResult.tags,
        nodes: []
      };
    };
    helpers.splitResultsWithChecks = function(results) {
      "use strict";
      return helpers.splitResults(results, helpers.formatChecks);
    };
    helpers.splitResults = function(results, nodeDataMapper) {
      "use strict";
      var violations = [], passes = [];
      results.forEach(function(rr) {
        function mapNode(nodeData) {
          var result = nodeData.result || rr.result;
          var node = helpers.formatNode(nodeData.node);
          node.impact = nodeData.impact || null;
          return nodeDataMapper(node, nodeData, result);
        }
        var failResult, passResult = helpers.formatRuleResult(rr);
        failResult = utils.clone(passResult);
        failResult.impact = rr.impact || null;
        failResult.nodes = rr.violations.map(mapNode);
        passResult.nodes = rr.passes.map(mapNode);
        if (failResult.nodes.length) {
          violations.push(failResult);
        }
        if (passResult.nodes.length) {
          passes.push(passResult);
        }
      });
      return {
        violations: violations,
        passes: passes,
        url: window.location.href,
        timestamp: new Date()
      };
    };
    axecore.reporter("na", function(results, callback) {
      "use strict";
      var na = results.filter(function(rr) {
        return rr.violations.length === 0 && rr.passes.length === 0;
      }).map(helpers.formatRuleResult);
      var formattedResults = helpers.splitResultsWithChecks(results);
      callback({
        violations: formattedResults.violations,
        passes: formattedResults.passes,
        notApplicable: na,
        timestamp: formattedResults.timestamp,
        url: formattedResults.url
      });
    });
    axecore.reporter("no-passes", function(results, callback) {
      "use strict";
      var formattedResults = helpers.splitResultsWithChecks(results);
      callback({
        violations: formattedResults.violations,
        timestamp: formattedResults.timestamp,
        url: formattedResults.url
      });
    });
    axecore.reporter("raw", function(results, callback) {
      "use strict";
      callback(results);
    });
    axecore.reporter("v1", function(results, callback) {
      "use strict";
      var formattedResults = helpers.splitResults(results, function(nodeResult, data, result) {
        if (result === axecore.constants.result.FAIL) {
          nodeResult.failureSummary = helpers.failureSummary(data);
        }
        return nodeResult;
      });
      callback({
        violations: formattedResults.violations,
        passes: formattedResults.passes,
        timestamp: formattedResults.timestamp,
        url: formattedResults.url
      });
    });
    axecore.reporter("v2", function(results, callback) {
      "use strict";
      var formattedResults = helpers.splitResultsWithChecks(results);
      callback({
        violations: formattedResults.violations,
        passes: formattedResults.passes,
        timestamp: formattedResults.timestamp,
        url: formattedResults.url
      });
    }, true);
    utils.checkHelper = function checkHelper(checkResult, callback) {
      "use strict";
      return {
        isAsync: false,
        async: function() {
          this.isAsync = true;
          return function(result) {
            checkResult.value = result;
            callback(checkResult);
          };
        },
        data: function(data) {
          checkResult.data = data;
        },
        relatedNodes: function(nodes) {
          nodes = nodes instanceof Node ? [ nodes ] : utils.toArray(nodes);
          checkResult.relatedNodes = nodes.map(function(element) {
            return new utils.DqElement(element);
          });
        }
      };
    };
    utils.sendCommandToFrame = function(node, parameters, callback) {
      "use strict";
      var win = node.contentWindow;
      if (!win) {
        axecore.log("Frame does not have a content window", node);
        return callback({});
      }
      var timeout = setTimeout(function() {
        timeout = setTimeout(function() {
          axecore.log("No response from frame: ", node);
          callback(null);
        }, 50);
      }, 500);
      utils.respondable(win, "axecore.ping", null, function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          axecore.log("Error returning results from frame: ", node);
          callback({});
          callback = null;
        }, 3e4);
        utils.respondable(win, "axecore.start", parameters, function(data) {
          if (callback) {
            clearTimeout(timeout);
            callback(data);
          }
        });
      });
    };
    utils.collectResultsFromFrames = function collectResultsFromFrames(context, options, command, parameter, callback) {
      "use strict";
      var q = utils.queue();
      var frames = context.frames;
      function defer(frame) {
        var params = {
          options: options,
          command: command,
          parameter: parameter,
          context: {
            initiator: false,
            page: context.page,
            include: frame.include || [],
            exclude: frame.exclude || []
          }
        };
        q.defer(function(done) {
          var node = frame.node;
          utils.sendCommandToFrame(node, params, function(data) {
            if (data) {
              return done({
                results: data,
                frameElement: node,
                frame: utils.getSelector(node)
              });
            }
            done(null);
          });
        });
      }
      for (var i = 0, l = frames.length; i < l; i++) {
        defer(frames[i]);
      }
      q.then(function(data) {
        callback(utils.mergeResults(data));
      });
    };
    utils.contains = function(node, otherNode) {
      "use strict";
      if (typeof node.contains === "function") {
        return node.contains(otherNode);
      }
      return !!(node.compareDocumentPosition(otherNode) & 16);
    };
    function truncate(str, maxLength) {
      "use strict";
      maxLength = maxLength || 300;
      if (str.length > maxLength) {
        var index = str.indexOf(">");
        str = str.substring(0, index + 1);
      }
      return str;
    }
    function getSource(element) {
      "use strict";
      var source = element.outerHTML;
      if (!source && typeof XMLSerializer === "function") {
        source = new XMLSerializer().serializeToString(element);
      }
      return truncate(source || "");
    }
    function DqElement(element, spec) {
      "use strict";
      spec = spec || {};
      this.selector = spec.selector || [ utils.getSelector(element) ];
      this.source = spec.source !== undefined ? spec.source : getSource(element);
      this.element = element;
    }
    DqElement.prototype.toJSON = function() {
      "use strict";
      return {
        selector: this.selector,
        source: this.source
      };
    };
    utils.DqElement = DqElement;
    utils.extendBlacklist = function(to, from, blacklist) {
      "use strict";
      blacklist = blacklist || [];
      for (var i in from) {
        if (from.hasOwnProperty(i) && blacklist.indexOf(i) === -1) {
          to[i] = from[i];
        }
      }
      return to;
    };
    utils.extendMetaData = function(to, from) {
      "use strict";
      for (var i in from) {
        if (from.hasOwnProperty(i)) {
          if (typeof from[i] === "function") {
            try {
              to[i] = from[i](to);
            } catch (e) {
              to[i] = null;
            }
          } else {
            to[i] = from[i];
          }
        }
      }
    };
    function raiseMetadata(obj, checks) {
      "use strict";
      Object.keys(axecore.constants.raisedMetadata).forEach(function(key) {
        var collection = axecore.constants.raisedMetadata[key];
        var highestIndex = checks.reduce(function(prevIndex, current) {
          var currentIndex = collection.indexOf(current[key]);
          return currentIndex > prevIndex ? currentIndex : prevIndex;
        }, -1);
        if (collection[highestIndex]) {
          obj[key] = collection[highestIndex];
        }
      });
    }
    function calculateCheckResult(failingChecks) {
      "use strict";
      var isFailing = failingChecks.any.length || failingChecks.all.length || failingChecks.none.length;
      return isFailing ? axecore.constants.result.FAIL : axecore.constants.result.PASS;
    }
    function calculateRuleResult(ruleResult) {
      "use strict";
      function checkMap(check) {
        return utils.extendBlacklist({}, check, [ "result" ]);
      }
      var newRuleResult = utils.extendBlacklist({
        violations: [],
        passes: []
      }, ruleResult, [ "nodes" ]);
      ruleResult.nodes.forEach(function(detail) {
        var failingChecks = utils.getFailingChecks(detail);
        var result = calculateCheckResult(failingChecks);
        if (result === axecore.constants.result.FAIL) {
          raiseMetadata(detail, utils.getAllChecks(failingChecks));
          detail.any = failingChecks.any.map(checkMap);
          detail.all = failingChecks.all.map(checkMap);
          detail.none = failingChecks.none.map(checkMap);
          newRuleResult.violations.push(detail);
          return;
        }
        detail.any = detail.any.filter(function(check) {
          return check.result;
        }).map(checkMap);
        detail.all = detail.all.map(checkMap);
        detail.none = detail.none.map(checkMap);
        newRuleResult.passes.push(detail);
      });
      raiseMetadata(newRuleResult, newRuleResult.violations);
      newRuleResult.result = newRuleResult.violations.length ? axecore.constants.result.FAIL : newRuleResult.passes.length ? axecore.constants.result.PASS : newRuleResult.result;
      return newRuleResult;
    }
    utils.getFailingChecks = function(detail) {
      "use strict";
      var any = detail.any.filter(function(check) {
        return !check.result;
      });
      return {
        all: detail.all.filter(function(check) {
          return !check.result;
        }),
        any: any.length === detail.any.length ? any : [],
        none: detail.none.filter(function(check) {
          return !!check.result;
        })
      };
    };
    utils.finalizeRuleResult = function(ruleResult) {
      "use strict";
      utils.publishMetaData(ruleResult);
      return calculateRuleResult(ruleResult);
    };
    utils.findBy = function(array, key, value) {
      "use strict";
      array = array || [];
      var index, length;
      for (index = 0, length = array.length; index < length; index++) {
        if (array[index][key] === value) {
          return array[index];
        }
      }
    };
    utils.getAllChecks = function getAllChecks(object) {
      "use strict";
      var result = [];
      return result.concat(object.any || []).concat(object.all || []).concat(object.none || []);
    };
    utils.getCheckOption = function(check, ruleID, options) {
      "use strict";
      var ruleCheckOption = ((options.rules && options.rules[ruleID] || {}).checks || {})[check.id];
      var checkOption = (options.checks || {})[check.id];
      var enabled = check.enabled;
      var opts = check.options;
      if (checkOption) {
        if (checkOption.hasOwnProperty("enabled")) {
          enabled = checkOption.enabled;
        }
        if (checkOption.hasOwnProperty("options")) {
          opts = checkOption.options;
        }
      }
      if (ruleCheckOption) {
        if (ruleCheckOption.hasOwnProperty("enabled")) {
          enabled = ruleCheckOption.enabled;
        }
        if (ruleCheckOption.hasOwnProperty("options")) {
          opts = ruleCheckOption.options;
        }
      }
      return {
        enabled: enabled,
        options: opts
      };
    };
    function nthOfType(element) {
      "use strict";
      var index = 1, type = element.nodeName;
      while (element = element.previousElementSibling) {
        if (element.nodeName === type) {
          index++;
        }
      }
      return index;
    }
    function siblingsHaveSameSelector(node, selector) {
      "use strict";
      var index, sibling, siblings = node.parentNode.children;
      if (!siblings) {
        return false;
      }
      var length = siblings.length;
      for (index = 0; index < length; index++) {
        sibling = siblings[index];
        if (sibling !== node && utils.matchesSelector(sibling, selector)) {
          return true;
        }
      }
      return false;
    }
    utils.getSelector = function getSelector(node) {
      "use strict";
      function escape(p) {
        return utils.escapeSelector(p);
      }
      var parts = [], part;
      while (node.parentNode) {
        part = "";
        if (node.id && document.querySelectorAll("#" + utils.escapeSelector(node.id)).length === 1) {
          parts.unshift("#" + utils.escapeSelector(node.id));
          break;
        }
        if (node.className && typeof node.className === "string") {
          part = "." + node.className.trim().split(/\s+/).map(escape).join(".");
          if (part === "." || siblingsHaveSameSelector(node, part)) {
            part = "";
          }
        }
        if (!part) {
          part = utils.escapeSelector(node.nodeName).toLowerCase();
          if (part === "html" || part === "body") {
            parts.unshift(part);
            break;
          }
          if (siblingsHaveSameSelector(node, part)) {
            part += ":nth-of-type(" + nthOfType(node) + ")";
          }
        }
        parts.unshift(part);
        node = node.parentNode;
      }
      return parts.join(" > ");
    };
    var styleSheet;
    function injectStyle(style) {
      "use strict";
      if (styleSheet && styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
        styleSheet = null;
      }
      if (!style) {
        return;
      }
      var head = document.head || document.getElementsByTagName("head")[0];
      styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      if (styleSheet.styleSheet === undefined) {
        styleSheet.appendChild(document.createTextNode(style));
      } else {
        styleSheet.styleSheet.cssText = style;
      }
      head.appendChild(styleSheet);
      return styleSheet;
    }
    utils.isHidden = function isHidden(el, recursed) {
      "use strict";
      if (el.nodeType === 9) {
        return false;
      }
      var style = window.getComputedStyle(el, null);
      if (!style || (!el.parentNode || (style.getPropertyValue("display") === "none" || !recursed && style.getPropertyValue("visibility") === "hidden" || el.getAttribute("aria-hidden") === "true"))) {
        return true;
      }
      return utils.isHidden(el.parentNode, true);
    };
    function pushFrame(resultSet, frameElement, frameSelector) {
      "use strict";
      resultSet.forEach(function(res) {
        res.node.selector.unshift(frameSelector);
        res.node = new utils.DqElement(frameElement, res.node);
        var checks = utils.getAllChecks(res);
        if (checks.length) {
          checks.forEach(function(check) {
            check.relatedNodes.forEach(function(node) {
              node.selector.unshift(frameSelector);
              node = new utils.DqElement(frameElement, node);
            });
          });
        }
      });
    }
    function spliceNodes(target, to) {
      "use strict";
      var firstFromFrame = to[0].node, sorterResult, t;
      for (var i = 0, l = target.length; i < l; i++) {
        t = target[i].node;
        sorterResult = utils.nodeSorter(t.element, firstFromFrame.element);
        if (sorterResult > 0 || sorterResult === 0 && firstFromFrame.selector.length < t.selector.length) {
          target.splice.apply(target, [ i, 0 ].concat(to));
          return;
        }
      }
      target.push.apply(target, to);
    }
    function normalizeResult(result) {
      "use strict";
      if (!result || !result.results) {
        return null;
      }
      if (!Array.isArray(result.results)) {
        return [ result.results ];
      }
      if (!result.results.length) {
        return null;
      }
      return result.results;
    }
    utils.mergeResults = function mergeResults(frameResults) {
      "use strict";
      var result = [];
      frameResults.forEach(function(frameResult) {
        var results = normalizeResult(frameResult);
        if (!results || !results.length) {
          return;
        }
        results.forEach(function(ruleResult) {
          if (ruleResult.nodes && frameResult.frame) {
            pushFrame(ruleResult.nodes, frameResult.frameElement, frameResult.frame);
          }
          var res = utils.findBy(result, "id", ruleResult.id);
          if (!res) {
            result.push(ruleResult);
          } else {
            if (ruleResult.nodes.length) {
              spliceNodes(res.nodes, ruleResult.nodes);
            }
          }
        });
      });
      return result;
    };
    utils.nodeSorter = function nodeSorter(a, b) {
      "use strict";
      if (a === b) {
        return 0;
      }
      if (a.compareDocumentPosition(b) & 4) {
        return -1;
      }
      return 1;
    };
    utils.publishMetaData = function(ruleResult) {
      "use strict";
      function extender(shouldBeTrue) {
        return function(check) {
          var sourceData = checksData[check.id] || {};
          var messages = sourceData.messages || {};
          var data = utils.extendBlacklist({}, sourceData, [ "messages" ]);
          data.message = check.result === shouldBeTrue ? messages.pass : messages.fail;
          utils.extendMetaData(check, data);
        };
      }
      var checksData = axecore._audit.data.checks || {};
      var rulesData = axecore._audit.data.rules || {};
      var rule = utils.findBy(axecore._audit.rules, "id", ruleResult.id) || {};
      ruleResult.tags = utils.clone(rule.tags || []);
      var shouldBeTrue = extender(true);
      var shouldBeFalse = extender(false);
      ruleResult.nodes.forEach(function(detail) {
        detail.any.forEach(shouldBeTrue);
        detail.all.forEach(shouldBeTrue);
        detail.none.forEach(shouldBeFalse);
      });
      utils.extendMetaData(ruleResult, utils.clone(rulesData[ruleResult.id] || {}));
    };
    (function() {
      "use strict";
      function noop() {}
      function queue() {
        var tasks = [], started = 0, remaining = 0, await = noop;
        function pop() {
          var length = tasks.length;
          for (;started < length; started++) {
            var task = tasks[started], fn = task.shift();
            task.push(callback(started));
            fn.apply(null, task);
          }
        }
        function callback(i) {
          return function(r) {
            tasks[i] = r;
            if (!--remaining) {
              notify();
            }
          };
        }
        function notify() {
          await(tasks);
        }
        return {
          defer: function(fn) {
            tasks.push([ fn ]);
            ++remaining;
            pop();
          },
          then: function(f) {
            await = f;
            if (!remaining) {
              notify();
            }
          },
          abort: function(fn) {
            await = noop;
            fn(tasks);
          }
        };
      }
      utils.queue = queue;
    })();
    (function(exports) {
      "use strict";
      var messages = {}, subscribers = {};
      var bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
      function verify(postedMessage) {
        return typeof postedMessage === "object" && typeof postedMessage.uuid === "string" && postedMessage._respondable === true;
      }
      function post(win, topic, message, uuid, callback) {
        var data = {
          uuid: uuid,
          topic: topic,
          message: message,
          _respondable: true
        };
        messages[uuid] = callback;
        win.postMessage(JSON.stringify(data), "*");
      }
      function respondable(win, topic, message, callback) {
        var id = uuid.v1();
        post(win, topic, message, id, callback);
      }
      respondable.subscribe = function(topic, callback) {
        subscribers[topic] = callback;
      };
      function publish(event, data) {
        var topic = data.topic, message = data.message, subscriber = subscribers[topic];
        if (subscriber) {
          subscriber(message, createResponder(event.source, null, data.uuid));
        }
      }
      function createResponder(source, topic, uuid) {
        return function(message, callback) {
          post(source, topic, message, uuid, callback);
        };
      }
      window[bind]("message", function(e) {
        if (typeof e.data !== "string") {
          return;
        }
        var data;
        try {
          data = JSON.parse(e.data);
        } catch (ex) {}
        if (!verify(data)) {
          return;
        }
        var uuid = data.uuid;
        if (messages[uuid]) {
          messages[uuid](data.message, createResponder(e.source, data.topic, uuid));
          messages[uuid] = null;
        }
        publish(e, data);
      }, false);
      exports.respondable = respondable;
    })(utils);
    utils.ruleShouldRun = function(rule, context, options) {
      "use strict";
      if (rule.pageLevel && !context.page) {
        return false;
      }
      var runOnly = options.runOnly, ruleOptions = (options.rules || {})[rule.id];
      if (runOnly) {
        if (runOnly.type === "rule") {
          return runOnly.values.indexOf(rule.id) !== -1;
        }
        return !!(runOnly.values || []).filter(function(item) {
          return rule.tags.indexOf(item) !== -1;
        }).length;
      }
      if (ruleOptions && ruleOptions.hasOwnProperty("enabled") ? !ruleOptions.enabled : !rule.enabled) {
        return false;
      }
      return true;
    };
    function getDeepest(collection) {
      "use strict";
      return collection.sort(function(a, b) {
        if (utils.contains(a, b)) {
          return 1;
        }
        return -1;
      })[0];
    }
    function isNodeInContext(node, context) {
      "use strict";
      var include = context.include && getDeepest(context.include.filter(function(candidate) {
        return utils.contains(candidate, node);
      }));
      var exclude = context.exclude && getDeepest(context.exclude.filter(function(candidate) {
        return utils.contains(candidate, node);
      }));
      if (!exclude && include || exclude && utils.contains(exclude, include)) {
        return true;
      }
      return false;
    }
    function pushNode(result, nodes, context) {
      "use strict";
      for (var i = 0, l = nodes.length; i < l; i++) {
        if (result.indexOf(nodes[i]) === -1 && isNodeInContext(nodes[i], context)) {
          result.push(nodes[i]);
        }
      }
    }
    utils.select = function select(selector, context) {
      "use strict";
      var result = [], candidate;
      for (var i = 0, l = context.include.length; i < l; i++) {
        candidate = context.include[i];
        if (candidate.nodeType === candidate.ELEMENT_NODE && utils.matchesSelector(candidate, selector)) {
          pushNode(result, [ candidate ], context);
        }
        pushNode(result, candidate.querySelectorAll(selector), context);
      }
      return result.sort(utils.nodeSorter);
    };
    utils.toArray = function(thing) {
      "use strict";
      return Array.prototype.slice.call(thing);
    };
    axecore._load({
      data: {
        rules: {
          accesskeys: {
            description: "Ensures every accesskey attribute value is unique",
            help: "accesskey attribute value must be unique",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/accesskeys"
          },
          "area-alt": {
            description: "Ensures <area> elements of image maps have alternate text",
            help: "Active <area> elements must have alternate text",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/area-alt"
          },
          "aria-allowed-attr": {
            description: "Ensures ARIA attributes are allowed for an element's role",
            help: "Elements must only use allowed ARIA attributes",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-allowed-attr"
          },
          "aria-required-attr": {
            description: "Ensures elements with ARIA roles have all required ARIA attributes",
            help: "Required ARIA attributes must be provided",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-required-attr"
          },
          "aria-required-children": {
            description: "Ensures elements with an ARIA role that require child roles contain them",
            help: "Certain ARIA roles must contain particular children",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-required-children"
          },
          "aria-required-parent": {
            description: "Ensures elements with an ARIA role that require parent roles are contained by them",
            help: "Certain ARIA roles must be contained by particular parents",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-required-parent"
          },
          "aria-roles": {
            description: "Ensures all elements with a role attribute use a valid value",
            help: "ARIA roles used must conform to valid values",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-roles"
          },
          "aria-valid-attr-value": {
            description: "Ensures all ARIA attributes have valid values",
            help: "ARIA attributes must conform to valid values",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-valid-attr-value"
          },
          "aria-valid-attr": {
            description: "Ensures attributes that begin with aria- are valid ARIA attributes",
            help: "ARIA attributes must conform to valid names",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-valid-attr"
          },
          "audio-caption": {
            description: "Ensures <audio> elements have captions",
            help: "<audio> elements must have a captions track",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/audio-caption"
          },
          blink: {
            description: "Ensures <blink> elements are not used",
            help: "<blink> elements are deprecated and must not be used",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/blink"
          },
          "button-name": {
            description: "Ensures buttons have discernible text",
            help: "Buttons must have discernible text",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/button-name"
          },
          bypass: {
            description: "Ensures each page has at least one mechanism for a user to bypass navigation and jump straight to the content",
            help: "Page must have means to bypass repeated blocks",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/bypass"
          },
          checkboxgroup: {
            description: 'Ensures related <input type="checkbox"> elements have a group and that that group designation is consistent',
            help: "Checkbox inputs with the same name attribute value must be part of a group",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/checkboxgroup"
          },
          "color-contrast": {
            description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
            help: "Elements must have sufficient color contrast",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/color-contrast"
          },
          "data-table": {
            description: "Ensures data tables are marked up semantically and have the correct header structure",
            help: "Data tables should be marked up properly",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/data-table"
          },
          "definition-list": {
            description: "Ensures <dl> elements are structured correctly",
            help: "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script> or <template> elements",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/definition-list"
          },
          dlitem: {
            description: "Ensures <dt> and <dd> elements are contained by a <dl>",
            help: "<dt> and <dd> elements must be contained by a <dl>",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/dlitem"
          },
          "document-title": {
            description: "Ensures each HTML document contains a non-empty <title> element",
            help: "Documents must have <title> element to aid in navigation",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/document-title"
          },
          "duplicate-id": {
            description: "Ensures every id attribute value is unique",
            help: "id attribute value must be unique",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/duplicate-id"
          },
          "empty-heading": {
            description: "Ensures headings have discernible text",
            help: "Headings must not be empty",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/empty-heading"
          },
          "frame-title": {
            description: "Ensures <iframe> and <frame> elements contain a unique and non-empty title attribute",
            help: "Frames must have unique title attribute",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/frame-title"
          },
          "heading-order": {
            description: "Ensures the order of headings is semantically correct",
            help: "Heading levels should only increase by one",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/heading-order"
          },
          "html-lang": {
            description: "Ensures every HTML document has a lang attribute and its value is valid",
            help: "<html> element must have a valid lang attribute",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/html-lang"
          },
          "image-alt": {
            description: "Ensures <img> elements have alternate text or a role of none or presentation",
            help: "Images must have alternate text",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/image-alt"
          },
          "input-image-alt": {
            description: 'Ensures <input type="image"> elements have alternate text',
            help: "Image buttons must have alternate text",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/input-image-alt"
          },
          "label-title-only": {
            description: "Ensures that every form element is not solely labeled using the title or aria-describedby attributes",
            help: "Form elements should have a visible label",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/label-title-only"
          },
          label: {
            description: "Ensures every form element has a label",
            help: "Form elements must have labels",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/label"
          },
          "layout-table": {
            description: "Ensures presentational <table> elements do not use <th>, <caption> elements or the summary attribute",
            help: "Layout tables must not use data table elements",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/layout-table"
          },
          "link-name": {
            description: "Ensures links have discernible text",
            help: "Links must have discernible text",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/link-name"
          },
          list: {
            description: "Ensures that lists are structured correctly",
            help: "<ul> and <ol> must only directly contain <li>, <script> or <template> elements",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/list"
          },
          listitem: {
            description: "Ensures <li> elements are used semantically",
            help: "<li> elements must be contained in a <ul> or <ol>",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/listitem"
          },
          marquee: {
            description: "Ensures <marquee> elements are not used",
            help: "<marquee> elements are deprecated and must not be used",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/marquee"
          },
          "meta-refresh": {
            description: 'Ensures <meta http-equiv="refresh"> is not used',
            help: "Timed refresh must not exist",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/meta-refresh"
          },
          "meta-viewport": {
            description: 'Ensures <meta name="viewport"> does not disable text scaling and zooming',
            help: "Zooming and scaling must not be disabled",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/meta-viewport"
          },
          "object-alt": {
            description: "Ensures <object> elements have alternate text",
            help: "<object> elements must have alternate text",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/object-alt"
          },
          radiogroup: {
            description: 'Ensures related <input type="radio"> elements have a group and that the group designation is consistent',
            help: "Radio inputs with the same name attribute value must be part of a group",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/radiogroup"
          },
          region: {
            description: "Ensures all content is contained within a landmark region",
            help: "Content should be contained in a landmark region",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/region"
          },
          scope: {
            description: "Ensures the scope attribute is used correctly on tables",
            help: "scope attribute should be used correctly",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/scope"
          },
          "server-side-image-map": {
            description: "Ensures that server-side image maps are not used",
            help: "Server-side image maps must not be used",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/server-side-image-map"
          },
          "skip-link": {
            description: "Ensures the first link on the page is a skip link",
            help: "The page should have a skip link as its first link",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/skip-link"
          },
          tabindex: {
            description: "Ensures tabindex attribute values are not greater than 0",
            help: "Elements should not have tabindex greater than zero",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/tabindex"
          },
          "valid-lang": {
            description: "Ensures lang attributes have valid values",
            help: "lang attribute must have a valid value",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/valid-lang"
          },
          "video-caption": {
            description: "Ensures <video> elements have captions",
            help: "<video> elements must have captions",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/video-caption"
          },
          "video-description": {
            description: "Ensures <video> elements have audio descriptions",
            help: "<video> elements must have an audio description track",
            helpUrl: "https://dequeuniversity.com/rules/axe/1.1/video-description"
          }
        },
        checks: {
          accesskeys: {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Accesskey attribute value is unique";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Document has multiple elements with the same accesskey";
                return out;
              }
            }
          },
          "non-empty-alt": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element has a non-empty alt attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has no alt attribute or the alt attribute is empty";
                return out;
              }
            }
          },
          "aria-label": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "aria-label attribute exists and is not empty";
                return out;
              },
              fail: function anonymous(it) {
                var out = "aria-label attribute does not exist or is empty";
                return out;
              }
            }
          },
          "aria-labelledby": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "aria-labelledby attribute exists and references elements that are visible to screen readers";
                return out;
              },
              fail: function anonymous(it) {
                var out = "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty or not visible";
                return out;
              }
            }
          },
          "aria-allowed-attr": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "ARIA attributes are used correctly for the defined role";
                return out;
              },
              fail: function anonymous(it) {
                var out = "ARIA attribute" + (it.data && it.data.length > 1 ? "s are" : " is") + " not allowed:";
                var arr1 = it.data;
                if (arr1) {
                  var value, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    value = arr1[i1 += 1];
                    out += " " + value;
                  }
                }
                return out;
              }
            }
          },
          "aria-required-attr": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "All required ARIA attributes are present";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Required ARIA attribute" + (it.data && it.data.length > 1 ? "s" : "") + " not present:";
                var arr1 = it.data;
                if (arr1) {
                  var value, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    value = arr1[i1 += 1];
                    out += " " + value;
                  }
                }
                return out;
              }
            }
          },
          "aria-required-children": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Required ARIA children are present";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Required ARIA " + (it.data && it.data.length > 1 ? "children" : "child") + " role not present:";
                var arr1 = it.data;
                if (arr1) {
                  var value, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    value = arr1[i1 += 1];
                    out += " " + value;
                  }
                }
                return out;
              }
            }
          },
          "aria-required-parent": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Required ARIA parent role present";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Required ARIA parent" + (it.data && it.data.length > 1 ? "s" : "") + " role not present:";
                var arr1 = it.data;
                if (arr1) {
                  var value, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    value = arr1[i1 += 1];
                    out += " " + value;
                  }
                }
                return out;
              }
            }
          },
          invalidrole: {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "ARIA role is valid";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Role must be one of the valid ARIA roles";
                return out;
              }
            }
          },
          abstractrole: {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Abstract roles are not used";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Abstract roles cannot be directly used";
                return out;
              }
            }
          },
          "aria-valid-attr-value": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "ARIA attribute values are valid";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Invalid ARIA attribute value" + (it.data && it.data.length > 1 ? "s" : "") + ":";
                var arr1 = it.data;
                if (arr1) {
                  var value, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    value = arr1[i1 += 1];
                    out += " " + value;
                  }
                }
                return out;
              }
            }
          },
          "aria-valid-attr": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "ARIA attribute name" + (it.data && it.data.length > 1 ? "s" : "") + " are valid";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Invalid ARIA attribute name" + (it.data && it.data.length > 1 ? "s" : "") + ":";
                var arr1 = it.data;
                if (arr1) {
                  var value, i1 = -1, l1 = arr1.length - 1;
                  while (i1 < l1) {
                    value = arr1[i1 += 1];
                    out += " " + value;
                  }
                }
                return out;
              }
            }
          },
          caption: {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "The multimedia element has a captions track";
                return out;
              },
              fail: function anonymous(it) {
                var out = "The multimedia element does not have a captions track";
                return out;
              }
            }
          },
          exists: {
            impact: "minor",
            messages: {
              pass: function anonymous(it) {
                var out = "Element does not exist";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element exists";
                return out;
              }
            }
          },
          "non-empty-if-present": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element ";
                if (it.data) {
                  out += "has a non-empty value attribute";
                } else {
                  out += "does not have a value attribute";
                }
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has a value attribute and the value attribute is empty";
                return out;
              }
            }
          },
          "non-empty-value": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element has a non-empty value attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has no value attribute or the value attribute is empty";
                return out;
              }
            }
          },
          "button-has-visible-text": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element has inner text that is visible to screen readers";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element does not have inner text that is visible to screen readers";
                return out;
              }
            }
          },
          "role-presentation": {
            impact: "moderate",
            messages: {
              pass: function anonymous(it) {
                var out = 'Element\'s default semantics were overriden with role="presentation"';
                return out;
              },
              fail: function anonymous(it) {
                var out = 'Element\'s default semantics were not overridden with role="presentation"';
                return out;
              }
            }
          },
          "role-none": {
            impact: "moderate",
            messages: {
              pass: function anonymous(it) {
                var out = 'Element\'s default semantics were overriden with role="none"';
                return out;
              },
              fail: function anonymous(it) {
                var out = 'Element\'s default semantics were not overridden with role="none"';
                return out;
              }
            }
          },
          "duplicate-img-label": {
            impact: "minor",
            messages: {
              pass: function anonymous(it) {
                var out = "Element does not duplicate existing text in <img> alt text";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element contains <img> element with alt text that duplicates existing text";
                return out;
              }
            }
          },
          "focusable-no-name": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Element is not in tab order or has accessible text";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element is in tab order and does not have accessible text";
                return out;
              }
            }
          },
          "internal-link-present": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Valid skip link found";
                return out;
              },
              fail: function anonymous(it) {
                var out = "No valid skip link found";
                return out;
              }
            }
          },
          "header-present": {
            impact: "moderate",
            messages: {
              pass: function anonymous(it) {
                var out = "Page has a header";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Page does not have a header";
                return out;
              }
            }
          },
          landmark: {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Page has a landmark region";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Page does not have a landmark region";
                return out;
              }
            }
          },
          "group-labelledby": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = 'All elements with the name "' + it.data.name + '" reference the same element with aria-labelledby';
                return out;
              },
              fail: function anonymous(it) {
                var out = 'All elements with the name "' + it.data.name + '" do not reference the same element with aria-labelledby';
                return out;
              }
            }
          },
          fieldset: {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element is contained in a fieldset";
                return out;
              },
              fail: function anonymous(it) {
                var out = "";
                var code = it.data && it.data.failureCode;
                if (code === "no-legend") {
                  out += "Fieldset does not have a legend as its first child";
                } else {
                  if (code === "empty-legend") {
                    out += "Legend does not have text that is visible to screen readers";
                  } else {
                    if (code === "mixed-inputs") {
                      out += "Fieldset contains unrelated inputs";
                    } else {
                      if (code === "no-group-label") {
                        out += "ARIA group does not have aria-label or aria-labelledby";
                      } else {
                        if (code === "group-mixed-inputs") {
                          out += "ARIA group contains unrelated inputs";
                        } else {
                          out += "Element does not have a containing fieldset or ARIA group";
                        }
                      }
                    }
                  }
                }
                return out;
              }
            }
          },
          "color-contrast": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "";
                if (it.data && it.data.contrastRatio) {
                  out += "Element has sufficient color contrast of " + it.data.contrastRatio;
                } else {
                  out += "Unable to determine contrast ratio";
                }
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has insufficient color contrast of " + it.data.contrastRatio + " (foreground color: " + it.data.fgColor + ", background color: " + it.data.bgColor + ", font size: " + it.data.fontSize + ", font weight: " + it.data.fontWeight + ")";
                return out;
              }
            }
          },
          "consistent-columns": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Table has consistent column widths";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Table does not have the same number of columns in every row";
                return out;
              }
            }
          },
          "cell-no-header": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "All data cells have table headers";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Some data cells do not have table headers";
                return out;
              }
            }
          },
          "headers-visible-text": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Header cell has visible text";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Header cell does not have visible text";
                return out;
              }
            }
          },
          "headers-attr-reference": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "headers attribute references elements that are visible to screen readers";
                return out;
              },
              fail: function anonymous(it) {
                var out = "headers attribute references element that is not visible to screen readers";
                return out;
              }
            }
          },
          "th-scope": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "<th> elements use scope attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "<th> elements must use scope attribute";
                return out;
              }
            }
          },
          "no-caption": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Table has a <caption>";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Table does not have a <caption>";
                return out;
              }
            }
          },
          "th-headers-attr": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "<th> elements do not use headers attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "<th> elements should not use headers attribute";
                return out;
              }
            }
          },
          "th-single-row-column": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "<th> elements are used when there is only a single row and single column of headers";
                return out;
              },
              fail: function anonymous(it) {
                var out = "<th> elements should only be used when there is a single row and single column of headers";
                return out;
              }
            }
          },
          "same-caption-summary": {
            impact: "moderate",
            messages: {
              pass: function anonymous(it) {
                var out = "Content of summary attribute and <caption> are not duplicated";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Content of summary attribute and <caption> element are indentical";
                return out;
              }
            }
          },
          rowspan: {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Table does not have cells with rowspan attribute greater than 1";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Table has cells whose rowspan attribute is not equal to 1";
                return out;
              }
            }
          },
          "structured-dlitems": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "When not empty, element has both <dt> and <dd> elements";
                return out;
              },
              fail: function anonymous(it) {
                var out = "When not empty, element does not have at least one <dt> element followed by at least one <dd> element";
                return out;
              }
            }
          },
          "only-dlitems": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Element only has children that are <dt> or <dd> elements";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has children that are not <dt> or <dd> elements";
                return out;
              }
            }
          },
          dlitem: {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Description list item has a <dl> parent element";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Description list item does not have a <dl> parent element";
                return out;
              }
            }
          },
          "doc-has-title": {
            impact: "moderate",
            messages: {
              pass: function anonymous(it) {
                var out = "Document has a non-empty <title> element";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Document does not have a non-empty <title> element";
                return out;
              }
            }
          },
          "duplicate-id": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Document has no elements that share the same id attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Document has multiple elements with the same id attribute: " + it.data;
                return out;
              }
            }
          },
          "has-visible-text": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element has text that is visible to screen readers";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element does not have text that is visible to screen readers";
                return out;
              }
            }
          },
          "non-empty-title": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element has a title attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has no title attribute or the title attribute is empty";
                return out;
              }
            }
          },
          "unique-frame-title": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Element's title attribute is unique";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element's title attribute is not unique";
                return out;
              }
            }
          },
          "heading-order": {
            impact: "minor",
            messages: {
              pass: function anonymous(it) {
                var out = "Heading order valid";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Heading order invalid";
                return out;
              }
            }
          },
          "has-lang": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "The <html> element has a lang attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "The <html> element does not have a lang attribute";
                return out;
              }
            }
          },
          "valid-lang": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Value of lang attribute is included in the list of valid languages";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Value of lang attribute not included in the list of valid languages";
                return out;
              }
            }
          },
          "has-alt": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Element has an alt attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element does not have an alt attribute";
                return out;
              }
            }
          },
          "title-only": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Form element does not solely use title attribute for its label";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Only title used to generate label for form element";
                return out;
              }
            }
          },
          "implicit-label": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Form element has an implicit (wrapped) <label>";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Form element does not have an implicit (wrapped) <label>";
                return out;
              }
            }
          },
          "explicit-label": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Form element has an explicit <label>";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Form element does not have an explicit <label>";
                return out;
              }
            }
          },
          "help-same-as-label": {
            impact: "minor",
            messages: {
              pass: function anonymous(it) {
                var out = "Help text (title or aria-describedby) does not duplicate label text";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Help text (title or aria-describedby) text is the same as the label text";
                return out;
              }
            }
          },
          "multiple-label": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Form element does not have multiple <label> elements";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Form element has multiple <label> elements";
                return out;
              }
            }
          },
          "has-th": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Layout table does not use <th> elements";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Layout table uses <th> elements";
                return out;
              }
            }
          },
          "has-caption": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Layout table does not use <caption> element";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Layout table uses <caption> element";
                return out;
              }
            }
          },
          "has-summary": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Layout table does not use summary attribute";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Layout table uses summary attribute";
                return out;
              }
            }
          },
          "only-listitems": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "List element only has children that are <li>, <script> or <template> elements";
                return out;
              },
              fail: function anonymous(it) {
                var out = "List element has children that are not <li>, <script> or <template> elements";
                return out;
              }
            }
          },
          listitem: {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "List item has a <ul> or <ol> parent element";
                return out;
              },
              fail: function anonymous(it) {
                var out = "List item does not have a <ul> or <ol> parent element";
                return out;
              }
            }
          },
          "meta-refresh": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "<meta> tag does not immediately refresh the page";
                return out;
              },
              fail: function anonymous(it) {
                var out = "<meta> tag forces timed refresh of page";
                return out;
              }
            }
          },
          "meta-viewport": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "<meta> tag does not disable zooming";
                return out;
              },
              fail: function anonymous(it) {
                var out = "<meta> tag disables zooming";
                return out;
              }
            }
          },
          region: {
            impact: "moderate",
            messages: {
              pass: function anonymous(it) {
                var out = "Content contained by ARIA landmark";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Content not contained by an ARIA landmark";
                return out;
              }
            }
          },
          "html5-scope": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Scope attribute is only used on table header elements (<th>)";
                return out;
              },
              fail: function anonymous(it) {
                var out = "In HTML 5, scope attributes may only be used on table header elements (<th>)";
                return out;
              }
            }
          },
          "html4-scope": {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Scope attribute is only used on table cell elements (<th> and <td>)";
                return out;
              },
              fail: function anonymous(it) {
                var out = "In HTML 4, the scope attribute may only be used on table cell elements (<th> and <td>)";
                return out;
              }
            }
          },
          "scope-value": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Scope attribute is used correctly";
                return out;
              },
              fail: function anonymous(it) {
                var out = "The value of the scope attribute may only be 'row' or 'col'";
                return out;
              }
            }
          },
          "skip-link": {
            impact: "critical",
            messages: {
              pass: function anonymous(it) {
                var out = "Valid skip link found";
                return out;
              },
              fail: function anonymous(it) {
                var out = "No valid skip link found";
                return out;
              }
            }
          },
          tabindex: {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "Element does not have a tabindex greater than 0";
                return out;
              },
              fail: function anonymous(it) {
                var out = "Element has a tabindex greater than 0";
                return out;
              }
            }
          },
          description: {
            impact: "serious",
            messages: {
              pass: function anonymous(it) {
                var out = "The multimedia element has an audio description track";
                return out;
              },
              fail: function anonymous(it) {
                var out = "The multimedia element does not have an audio description track";
                return out;
              }
            }
          }
        },
        failureSummaries: {
          any: {
            failureMessage: function anonymous(it) {
              var out = "Fix any of the following:";
              var arr1 = it;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += "\n  " + value.split("\n").join("\n  ");
                }
              }
              return out;
            }
          },
          none: {
            failureMessage: function anonymous(it) {
              var out = "Fix all of the following:";
              var arr1 = it;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += "\n  " + value.split("\n").join("\n  ");
                }
              }
              return out;
            }
          }
        }
      },
      rules: [ {
        id: "accesskeys",
        selector: "[accesskey]",
        tags: [ "wcag2a", "wcag211" ],
        all: [],
        any: [],
        none: [ "accesskeys" ]
      }, {
        id: "area-alt",
        selector: "map area[href]",
        excludeHidden: false,
        tags: [ "wcag2a", "wcag111", "section508", "section508a" ],
        all: [],
        any: [ "non-empty-alt", "aria-label", "aria-labelledby" ],
        none: []
      }, {
        id: "aria-allowed-attr",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ "aria-allowed-attr" ],
        none: []
      }, {
        id: "aria-required-attr",
        selector: "[role]",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ "aria-required-attr" ],
        none: []
      }, {
        id: "aria-required-children",
        selector: "[role]",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ "aria-required-children" ],
        none: []
      }, {
        id: "aria-required-parent",
        selector: "[role]",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ "aria-required-parent" ],
        none: []
      }, {
        id: "aria-roles",
        selector: "[role]",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [],
        none: [ "invalidrole", "abstractrole" ]
      }, {
        id: "aria-valid-attr-value",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ {
          options: [],
          id: "aria-valid-attr-value"
        } ],
        none: []
      }, {
        id: "aria-valid-attr",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ {
          options: [],
          id: "aria-valid-attr"
        } ],
        none: []
      }, {
        id: "audio-caption",
        selector: "audio",
        excludeHidden: false,
        tags: [ "wcag2a", "wcag122", "section508", "section508a" ],
        all: [],
        any: [],
        none: [ "caption" ]
      }, {
        id: "blink",
        selector: "blink",
        tags: [ "wcag2a", "wcag222" ],
        all: [],
        any: [],
        none: [ "exists" ]
      }, {
        id: "button-name",
        selector: 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',
        tags: [ "wcag2a", "wcag412", "section508", "section508a" ],
        all: [],
        any: [ "non-empty-if-present", "non-empty-value", "button-has-visible-text", "aria-label", "aria-labelledby", "role-presentation", "role-none" ],
        none: [ "duplicate-img-label", "focusable-no-name" ]
      }, {
        id: "bypass",
        selector: "html",
        pageLevel: true,
        matches: function(node) {
          return !!node.querySelector("a[href]");
        },
        tags: [ "wcag2a", "wcag241", "section508", "section508o" ],
        all: [],
        any: [ "internal-link-present", "header-present", "landmark" ],
        none: []
      }, {
        id: "checkboxgroup",
        selector: "input[type=checkbox][name]",
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [ "group-labelledby", "fieldset" ],
        none: []
      }, {
        id: "color-contrast",
        selector: "*",
        tags: [ "wcag2aa", "wcag143" ],
        all: [],
        any: [ "color-contrast" ],
        none: []
      }, {
        id: "data-table",
        selector: "table",
        matches: function(node) {
          return commons.table.isDataTable(node);
        },
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [ "consistent-columns" ],
        none: [ "cell-no-header", "headers-visible-text", "headers-attr-reference", "th-scope", "no-caption", "th-headers-attr", "th-single-row-column", "same-caption-summary", "rowspan" ]
      }, {
        id: "definition-list",
        selector: "dl",
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [],
        none: [ "structured-dlitems", "only-dlitems" ]
      }, {
        id: "dlitem",
        selector: "dd, dt",
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [ "dlitem" ],
        none: []
      }, {
        id: "document-title",
        selector: "html",
        tags: [ "wcag2a", "wcag242" ],
        all: [],
        any: [ "doc-has-title" ],
        none: []
      }, {
        id: "duplicate-id",
        selector: "[id]",
        tags: [ "wcag2a", "wcag411" ],
        all: [],
        any: [ "duplicate-id" ],
        none: []
      }, {
        id: "empty-heading",
        selector: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [ "has-visible-text", "role-presentation", "role-none" ],
        none: []
      }, {
        id: "frame-title",
        selector: "frame, iframe",
        tags: [ "wcag2a", "wcag241" ],
        all: [],
        any: [ "non-empty-title" ],
        none: [ "unique-frame-title" ]
      }, {
        id: "heading-order",
        selector: "h1,h2,h3,h4,h5,h6,[role=heading]",
        enabled: false,
        tags: [ "best-practice" ],
        all: [],
        any: [ "heading-order" ],
        none: []
      }, {
        id: "html-lang",
        selector: "html",
        tags: [ "wcag2a", "wcag311" ],
        all: [],
        any: [ "has-lang" ],
        none: [ {
          options: [ "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "in", "io", "is", "it", "iu", "iw", "ja", "ji", "jv", "jw", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu" ],
          id: "valid-lang"
        } ]
      }, {
        id: "image-alt",
        selector: "img",
        tags: [ "wcag2a", "wcag111", "section508", "section508a" ],
        all: [],
        any: [ "has-alt", "aria-label", "aria-labelledby", "non-empty-title", "role-presentation", "role-none" ],
        none: []
      }, {
        id: "input-image-alt",
        selector: 'input[type="image"]',
        tags: [ "wcag2a", "wcag111", "section508", "section508a" ],
        all: [],
        any: [ "non-empty-alt", "aria-label", "aria-labelledby" ],
        none: []
      }, {
        id: "label-title-only",
        selector: "input:not([type='hidden']):not([type='image']):not([type='button']):not([type='submit']):not([type='reset']), select, textarea",
        enabled: false,
        tags: [ "best-practice" ],
        all: [],
        any: [],
        none: [ "title-only" ]
      }, {
        id: "label",
        selector: "input:not([type='hidden']):not([type='image']):not([type='button']):not([type='submit']):not([type='reset']), select, textarea",
        tags: [ "wcag2a", "wcag332", "wcag131", "section508", "section508n" ],
        all: [],
        any: [ "aria-label", "aria-labelledby", "implicit-label", "explicit-label", "non-empty-title" ],
        none: [ "help-same-as-label", "multiple-label" ]
      }, {
        id: "layout-table",
        selector: "table",
        matches: function(node) {
          return !commons.table.isDataTable(node);
        },
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [],
        none: [ "has-th", "has-caption", "has-summary" ]
      }, {
        id: "link-name",
        selector: 'a[href]:not([role="button"]), [role=link][href]',
        tags: [ "wcag2a", "wcag111", "wcag412", "section508", "section508a" ],
        all: [],
        any: [ "has-visible-text", "aria-label", "aria-labelledby", "role-presentation", "role-none" ],
        none: [ "duplicate-img-label", "focusable-no-name" ]
      }, {
        id: "list",
        selector: "ul, ol",
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [],
        none: [ "only-listitems" ]
      }, {
        id: "listitem",
        selector: "li",
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [ "listitem" ],
        none: []
      }, {
        id: "marquee",
        selector: "marquee",
        tags: [ "wcag2a", "wcag222", "section508", "section508j" ],
        all: [],
        any: [],
        none: [ "exists" ]
      }, {
        id: "meta-refresh",
        selector: 'meta[http-equiv="refresh"]',
        excludeHidden: false,
        tags: [ "wcag2a", "wcag2aaa", "wcag221", "wcag224", "wcag325" ],
        all: [],
        any: [ "meta-refresh" ],
        none: []
      }, {
        id: "meta-viewport",
        selector: 'meta[name="viewport"]',
        excludeHidden: false,
        tags: [ "wcag2aa", "wcag144" ],
        all: [],
        any: [ "meta-viewport" ],
        none: []
      }, {
        id: "object-alt",
        selector: "object",
        tags: [ "wcag2a", "wcag111" ],
        all: [],
        any: [ "has-visible-text" ],
        none: []
      }, {
        id: "radiogroup",
        selector: "input[type=radio][name]",
        tags: [ "wcag2a", "wcag131" ],
        all: [],
        any: [ "group-labelledby", "fieldset" ],
        none: []
      }, {
        id: "region",
        selector: "html",
        pageLevel: true,
        enabled: false,
        tags: [ "best-practice" ],
        all: [],
        any: [ "region" ],
        none: []
      }, {
        id: "scope",
        selector: "[scope]",
        enabled: false,
        tags: [ "best-practice" ],
        all: [],
        any: [ "html5-scope", "html4-scope" ],
        none: [ "scope-value" ]
      }, {
        id: "server-side-image-map",
        selector: "img[ismap]",
        tags: [ "wcag2a", "wcag211", "section508", "section508f" ],
        all: [],
        any: [],
        none: [ "exists" ]
      }, {
        id: "skip-link",
        selector: "a[href]",
        pageLevel: true,
        enabled: false,
        tags: [ "best-practice" ],
        all: [],
        any: [ "skip-link" ],
        none: []
      }, {
        id: "tabindex",
        selector: "[tabindex]",
        tags: [ "best-practice" ],
        all: [],
        any: [ "tabindex" ],
        none: []
      }, {
        id: "valid-lang",
        selector: "[lang]:not(html), [xml\\:lang]:not(html)",
        tags: [ "wcag2aa", "wcag312" ],
        all: [],
        any: [],
        none: [ {
          options: [ "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "in", "io", "is", "it", "iu", "iw", "ja", "ji", "jv", "jw", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu" ],
          id: "valid-lang"
        } ]
      }, {
        id: "video-caption",
        selector: "video",
        tags: [ "wcag2a", "wcag122", "wcag123", "section508", "section508a" ],
        all: [],
        any: [],
        none: [ "caption" ]
      }, {
        id: "video-description",
        selector: "video",
        tags: [ "wcag2aa", "wcag125", "section508", "section508a" ],
        all: [],
        any: [],
        none: [ "description" ]
      } ],
      checks: [ {
        id: "abstractrole",
        evaluate: function(node, options) {
          return commons.aria.getRoleType(node.getAttribute("role")) === "abstract";
        }
      }, {
        id: "aria-allowed-attr",
        matches: function(node) {
          var role = node.getAttribute("role");
          if (!role) {
            role = commons.aria.implicitRole(node);
          }
          var allowed = commons.aria.allowedAttr(role);
          if (role && allowed) {
            var aria = /^aria-/;
            if (node.hasAttributes()) {
              var attrs = node.attributes;
              for (var i = 0, l = attrs.length; i < l; i++) {
                if (aria.test(attrs[i].nodeName)) {
                  return true;
                }
              }
            }
          }
          return false;
        },
        evaluate: function(node, options) {
          var invalid = [];
          var attr, attrName, allowed, role = node.getAttribute("role"), attrs = node.attributes;
          if (!role) {
            role = commons.aria.implicitRole(node);
          }
          allowed = commons.aria.allowedAttr(role);
          if (role && allowed) {
            for (var i = 0, l = attrs.length; i < l; i++) {
              attr = attrs[i];
              attrName = attr.nodeName;
              if (commons.aria.validateAttr(attrName) && allowed.indexOf(attrName) === -1) {
                invalid.push(attrName + '="' + attr.nodeValue + '"');
              }
            }
          }
          if (invalid.length) {
            this.data(invalid);
            return false;
          }
          return true;
        }
      }, {
        id: "invalidrole",
        evaluate: function(node, options) {
          return !commons.aria.isValidRole(node.getAttribute("role"));
        }
      }, {
        id: "aria-required-attr",
        evaluate: function(node, options) {
          var missing = [];
          if (node.hasAttributes()) {
            var attr, role = node.getAttribute("role"), required = commons.aria.requiredAttr(role);
            if (role && required) {
              for (var i = 0, l = required.length; i < l; i++) {
                attr = required[i];
                if (!node.getAttribute(attr)) {
                  missing.push(attr);
                }
              }
            }
          }
          if (missing.length) {
            this.data(missing);
            return false;
          }
          return true;
        }
      }, {
        id: "aria-required-children",
        evaluate: function(node, options) {
          var requiredOwned = commons.aria.requiredOwned, implicitNodes = commons.aria.implicitNodes, matchesSelector = commons.utils.matchesSelector, idrefs = commons.dom.idrefs;
          function owns(node, role, ariaOwned) {
            if (node === null) {
              return false;
            }
            var implicit = implicitNodes(role), selector = [ '[role="' + role + '"]' ];
            if (implicit) {
              selector = selector.concat(implicit);
            }
            selector = selector.join(",");
            return ariaOwned ? matchesSelector(node, selector) || !!node.querySelector(selector) : !!node.querySelector(selector);
          }
          function ariaOwns(nodes, role) {
            var index, length;
            for (index = 0, length = nodes.length; index < length; index++) {
              if (nodes[index] === null) {
                continue;
              }
              if (owns(nodes[index], role, true)) {
                return true;
              }
            }
            return false;
          }
          function missingRequiredChildren(node, childRoles, all) {
            var i, l = childRoles.length, missing = [], ownedElements = idrefs(node, "aria-owns");
            for (i = 0; i < l; i++) {
              var r = childRoles[i];
              if (owns(node, r) || ariaOwns(ownedElements, r)) {
                if (!all) {
                  return null;
                }
              } else {
                if (all) {
                  missing.push(r);
                }
              }
            }
            if (missing.length) {
              return missing;
            }
            if (!all && childRoles.length) {
              return childRoles;
            }
            return null;
          }
          var role = node.getAttribute("role");
          var required = requiredOwned(role);
          if (!required) {
            return true;
          }
          var all = false;
          var childRoles = required.one;
          if (!childRoles) {
            var all = true;
            childRoles = required.all;
          }
          var missing = missingRequiredChildren(node, childRoles, all);
          if (!missing) {
            return true;
          }
          this.data(missing);
          return false;
        }
      }, {
        id: "aria-required-parent",
        evaluate: function(node, options) {
          function getSelector(role) {
            var impliedNative = commons.aria.implicitNodes(role) || [];
            return impliedNative.concat('[role="' + role + '"]').join(",");
          }
          function getMissingContext(element, requiredContext, includeElement) {
            var index, length, role = element.getAttribute("role"), missing = [];
            if (!requiredContext) {
              requiredContext = commons.aria.requiredContext(role);
            }
            if (!requiredContext) {
              return null;
            }
            for (index = 0, length = requiredContext.length; index < length; index++) {
              if (includeElement && commons.utils.matchesSelector(element, getSelector(requiredContext[index]))) {
                return null;
              }
              if (commons.dom.findUp(element, getSelector(requiredContext[index]))) {
                return null;
              } else {
                missing.push(requiredContext[index]);
              }
            }
            return missing;
          }
          function getAriaOwners(element) {
            var owners = [], o = null;
            while (element) {
              if (element.id) {
                o = document.querySelector("[aria-owns~=" + commons.utils.escapeSelector(element.id) + "]");
                if (o) {
                  owners.push(o);
                }
              }
              element = element.parentNode;
            }
            return owners.length ? owners : null;
          }
          var missingParents = getMissingContext(node);
          if (!missingParents) {
            return true;
          }
          var owners = getAriaOwners(node);
          if (owners) {
            for (var i = 0, l = owners.length; i < l; i++) {
              missingParents = getMissingContext(owners[i], missingParents, true);
              if (!missingParents) {
                return true;
              }
            }
          }
          this.data(missingParents);
          return false;
        }
      }, {
        id: "aria-valid-attr-value",
        matches: function(node) {
          var aria = /^aria-/;
          if (node.hasAttributes()) {
            var attrs = node.attributes;
            for (var i = 0, l = attrs.length; i < l; i++) {
              if (aria.test(attrs[i].nodeName)) {
                return true;
              }
            }
          }
          return false;
        },
        evaluate: function(node, options) {
          options = Array.isArray(options) ? options : [];
          var invalid = [], aria = /^aria-/;
          var attr, attrName, attrs = node.attributes;
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            attrName = attr.nodeName;
            if (options.indexOf(attrName) === -1 && aria.test(attrName) && !commons.aria.validateAttrValue(node, attrName)) {
              invalid.push(attrName + '="' + attr.nodeValue + '"');
            }
          }
          if (invalid.length) {
            this.data(invalid);
            return false;
          }
          return true;
        },
        options: []
      }, {
        id: "aria-valid-attr",
        matches: function(node) {
          var aria = /^aria-/;
          if (node.hasAttributes()) {
            var attrs = node.attributes;
            for (var i = 0, l = attrs.length; i < l; i++) {
              if (aria.test(attrs[i].nodeName)) {
                return true;
              }
            }
          }
          return false;
        },
        evaluate: function(node, options) {
          options = Array.isArray(options) ? options : [];
          var invalid = [], aria = /^aria-/;
          var attr, attrs = node.attributes;
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i].nodeName;
            if (options.indexOf(attr) === -1 && aria.test(attr) && !commons.aria.validateAttr(attr)) {
              invalid.push(attr);
            }
          }
          if (invalid.length) {
            this.data(invalid);
            return false;
          }
          return true;
        },
        options: []
      }, {
        id: "color-contrast",
        matches: function(node) {
          var nodeName = node.nodeName, nodeType = node.type, doc = document;
          if (nodeName === "INPUT") {
            return [ "hidden", "range", "color", "checkbox", "radio", "image" ].indexOf(nodeType) === -1 && !node.disabled;
          }
          if (nodeName === "SELECT") {
            return !!node.options.length && !node.disabled;
          }
          if (nodeName === "TEXTAREA") {
            return !node.disabled;
          }
          if (nodeName === "OPTION") {
            return false;
          }
          if (nodeName === "BUTTON" && node.disabled) {
            return false;
          }
          if (nodeName === "LABEL") {
            var candidate = node.htmlFor && doc.getElementById(node.htmlFor);
            if (candidate && candidate.disabled) {
              return false;
            }
            var candidate = node.querySelector('input:not([type="hidden"]):not([type="image"])' + ':not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea');
            if (candidate && candidate.disabled) {
              return false;
            }
          }
          if (node.id) {
            var candidate = doc.querySelector("[aria-labelledby~=" + commons.utils.escapeSelector(node.id) + "]");
            if (candidate && candidate.disabled) {
              return false;
            }
          }
          if (commons.text.visible(node, false, true) === "") {
            return false;
          }
          var range = document.createRange(), childNodes = node.childNodes, length = childNodes.length, child, index;
          for (index = 0; index < length; index++) {
            child = childNodes[index];
            if (child.nodeType === 3 && commons.text.sanitize(child.nodeValue) !== "") {
              range.selectNodeContents(child);
            }
          }
          var rects = range.getClientRects();
          length = rects.length;
          for (index = 0; index < length; index++) {
            if (commons.dom.visuallyOverlaps(rects[index], node)) {
              return true;
            }
          }
          return false;
        },
        evaluate: function(node, options) {
          var bgNodes = [], bgColor = commons.color.getBackgroundColor(node, bgNodes), fgColor = commons.color.getForegroundColor(node);
          if (fgColor === null || bgColor === null) {
            return true;
          }
          var nodeStyle = window.getComputedStyle(node);
          var fontSize = parseFloat(nodeStyle.getPropertyValue("font-size"));
          var fontWeight = nodeStyle.getPropertyValue("font-weight");
          var bold = [ "bold", "bolder", "600", "700", "800", "900" ].indexOf(fontWeight) !== -1;
          var cr = commons.color.hasValidContrastRatio(bgColor, fgColor, fontSize, bold);
          this.data({
            fgColor: fgColor.toHexString(),
            bgColor: bgColor.toHexString(),
            contrastRatio: cr.contrastRatio.toFixed(2),
            fontSize: (fontSize * 72 / 96).toFixed(1) + "pt",
            fontWeight: bold ? "bold" : "normal"
          });
          if (!cr.isValid) {
            this.relatedNodes(bgNodes);
          }
          return cr.isValid;
        }
      }, {
        id: "fieldset",
        evaluate: function(node, options) {
          var failureCode, self = this;
          function getUnrelatedElements(parent, name) {
            return commons.utils.toArray(parent.querySelectorAll('select,textarea,button,input:not([name="' + name + '"]):not([type="hidden"])'));
          }
          function checkFieldset(group, name) {
            var firstNode = group.firstElementChild;
            if (!firstNode || firstNode.nodeName !== "LEGEND") {
              self.relatedNodes([ group ]);
              failureCode = "no-legend";
              return false;
            }
            if (!commons.text.accessibleText(firstNode)) {
              self.relatedNodes([ firstNode ]);
              failureCode = "empty-legend";
              return false;
            }
            var otherElements = getUnrelatedElements(group, name);
            if (otherElements.length) {
              self.relatedNodes(otherElements);
              failureCode = "mixed-inputs";
              return false;
            }
            return true;
          }
          function checkARIAGroup(group, name) {
            var hasLabelledByText = commons.dom.idrefs(group, "aria-labelledby").some(function(element) {
              return element && commons.text.accessibleText(element);
            });
            var ariaLabel = group.getAttribute("aria-label");
            if (!hasLabelledByText && !(ariaLabel && commons.text.sanitize(ariaLabel))) {
              self.relatedNodes(group);
              failureCode = "no-group-label";
              return false;
            }
            var otherElements = getUnrelatedElements(group, name);
            if (otherElements.length) {
              self.relatedNodes(otherElements);
              failureCode = "group-mixed-inputs";
              return false;
            }
            return true;
          }
          function spliceCurrentNode(nodes, current) {
            return commons.utils.toArray(nodes).filter(function(candidate) {
              return candidate !== current;
            });
          }
          function runCheck(element) {
            var name = commons.utils.escapeSelector(node.name);
            var matchingNodes = document.querySelectorAll('input[type="' + commons.utils.escapeSelector(node.type) + '"][name="' + name + '"]');
            if (matchingNodes.length < 2) {
              return true;
            }
            var fieldset = commons.dom.findUp(element, "fieldset");
            var group = commons.dom.findUp(element, '[role="group"]' + (node.type === "radio" ? ',[role="radiogroup"]' : ""));
            if (!group && !fieldset) {
              failureCode = "no-group";
              self.relatedNodes(spliceCurrentNode(matchingNodes, element));
              return false;
            }
            return fieldset ? checkFieldset(fieldset, name) : checkARIAGroup(group, name);
          }
          var data = {
            name: node.getAttribute("name"),
            type: node.getAttribute("type")
          };
          var result = runCheck(node);
          if (!result) {
            data.failureCode = failureCode;
          }
          this.data(data);
          return result;
        },
        after: function(results, options) {
          var seen = {};
          return results.filter(function(result) {
            if (result.result) {
              return true;
            }
            var data = result.data;
            if (data) {
              seen[data.type] = seen[data.type] || {};
              if (!seen[data.type][data.name]) {
                seen[data.type][data.name] = [ data ];
                return true;
              }
              var hasBeenSeen = seen[data.type][data.name].some(function(candidate) {
                return candidate.failureCode === data.failureCode;
              });
              if (!hasBeenSeen) {
                seen[data.type][data.name].push(data);
              }
              return !hasBeenSeen;
            }
            return false;
          });
        }
      }, {
        id: "group-labelledby",
        evaluate: function(node, options) {
          this.data({
            name: node.getAttribute("name"),
            type: node.getAttribute("type")
          });
          var matchingNodes = document.querySelectorAll('input[type="' + commons.utils.escapeSelector(node.type) + '"][name="' + commons.utils.escapeSelector(node.name) + '"]');
          if (matchingNodes.length <= 1) {
            return true;
          }
          return [].map.call(matchingNodes, function(m) {
            var l = m.getAttribute("aria-labelledby");
            return l ? l.split(/\s+/) : [];
          }).reduce(function(prev, curr) {
            return prev.filter(function(n) {
              return curr.indexOf(n) !== -1;
            });
          }).filter(function(n) {
            var labelNode = document.getElementById(n);
            return labelNode && commons.text.accessibleText(labelNode);
          }).length !== 0;
        },
        after: function(results, options) {
          var seen = {};
          return results.filter(function(result) {
            var data = result.data;
            if (data) {
              seen[data.type] = seen[data.type] || {};
              if (!seen[data.type][data.name]) {
                seen[data.type][data.name] = true;
                return true;
              }
            }
            return false;
          });
        }
      }, {
        id: "accesskeys",
        evaluate: function(node, options) {
          this.data(node.getAttribute("accesskey"));
          this.relatedNodes([ node ]);
          return true;
        },
        after: function(results, options) {
          var seen = {};
          return results.filter(function(r) {
            if (!seen[r.data]) {
              seen[r.data] = r;
              r.relatedNodes = [];
              return true;
            }
            seen[r.data].relatedNodes.push(r.relatedNodes[0]);
            return false;
          }).map(function(r) {
            r.result = !!r.relatedNodes.length;
            return r;
          });
        }
      }, {
        id: "focusable-no-name",
        evaluate: function(node, options) {
          var tabIndex = node.getAttribute("tabindex"), isFocusable = commons.dom.isFocusable(node) && tabIndex > -1;
          if (!isFocusable) {
            return false;
          }
          return !commons.text.accessibleText(node);
        }
      }, {
        id: "tabindex",
        evaluate: function(node, options) {
          return node.tabIndex <= 0;
        }
      }, {
        id: "duplicate-img-label",
        evaluate: function(node, options) {
          var imgs = node.querySelectorAll("img");
          var text = commons.text.visible(node, true);
          for (var i = 0, len = imgs.length; i < len; i++) {
            var imgAlt = commons.text.accessibleText(imgs[i]);
            if (imgAlt === text && text !== "") {
              return true;
            }
          }
          return false;
        },
        enabled: false
      }, {
        id: "explicit-label",
        evaluate: function(node, options) {
          var label = document.querySelector('label[for="' + commons.utils.escapeSelector(node.id) + '"]');
          if (label) {
            return !!commons.text.accessibleText(label);
          }
          return false;
        },
        selector: "[id]"
      }, {
        id: "help-same-as-label",
        evaluate: function(node, options) {
          var labelText = commons.text.label(node), check = node.getAttribute("title");
          if (!labelText) {
            return false;
          }
          if (!check) {
            check = "";
            if (node.getAttribute("aria-describedby")) {
              var ref = commons.dom.idrefs(node, "aria-describedby");
              check = ref.map(function(thing) {
                return thing ? commons.text.accessibleText(thing) : "";
              }).join("");
            }
          }
          return commons.text.sanitize(check) === commons.text.sanitize(labelText);
        },
        enabled: false
      }, {
        id: "implicit-label",
        evaluate: function(node, options) {
          var label = commons.dom.findUp(node, "label");
          if (label) {
            return !!commons.text.accessibleText(label);
          }
          return false;
        }
      }, {
        id: "multiple-label",
        evaluate: function(node, options) {
          var labels = [].slice.call(document.querySelectorAll('label[for="' + commons.utils.escapeSelector(node.id) + '"]')), parent = node.parentNode;
          while (parent) {
            if (parent.tagName === "LABEL" && labels.indexOf(parent) === -1) {
              labels.push(parent);
            }
            parent = parent.parentNode;
          }
          this.relatedNodes(labels);
          return labels.length > 1;
        }
      }, {
        id: "title-only",
        evaluate: function(node, options) {
          var labelText = commons.text.label(node);
          return !labelText && !!(node.getAttribute("title") || node.getAttribute("aria-describedby"));
        }
      }, {
        id: "has-lang",
        evaluate: function(node, options) {
          return node.hasAttribute("lang") || node.hasAttribute("xml:lang");
        }
      }, {
        id: "valid-lang",
        options: [ "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "in", "io", "is", "it", "iu", "iw", "ja", "ji", "jv", "jw", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu" ],
        evaluate: function(node, options) {
          var lang = (node.getAttribute("lang") || "").trim().toLowerCase();
          var xmlLang = (node.getAttribute("xml:lang") || "").trim().toLowerCase();
          var invalid = [];
          (options || []).forEach(function(cc) {
            cc = cc.toLowerCase();
            if (lang && (lang === cc || lang.indexOf(cc.toLowerCase() + "-") === 0)) {
              lang = null;
            }
            if (xmlLang && (xmlLang === cc || xmlLang.indexOf(cc.toLowerCase() + "-") === 0)) {
              xmlLang = null;
            }
          });
          if (xmlLang) {
            invalid.push('xml:lang="' + xmlLang + '"');
          }
          if (lang) {
            invalid.push('lang="' + lang + '"');
          }
          if (invalid.length) {
            this.data(invalid);
            return true;
          }
          return false;
        }
      }, {
        id: "dlitem",
        evaluate: function(node, options) {
          return node.parentNode.tagName === "DL";
        }
      }, {
        id: "has-listitem",
        evaluate: function(node, options) {
          var children = node.children;
          if (children.length === 0) {
            return true;
          }
          for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName === "LI") {
              return false;
            }
          }
          return true;
        }
      }, {
        id: "listitem",
        evaluate: function(node, options) {
          return [ "UL", "OL" ].indexOf(node.parentNode.tagName) !== -1;
        }
      }, {
        id: "only-dlitems",
        evaluate: function(node, options) {
          var child, bad = [], children = node.childNodes, hasNonEmptyTextNode = false;
          for (var i = 0; i < children.length; i++) {
            child = children[i];
            if (child.nodeType === 1 && (child.nodeName !== "DT" && child.nodeName !== "DD" && child.nodeName !== "SCRIPT" && child.nodeName !== "TEMPLATE")) {
              bad.push(child);
            } else {
              if (child.nodeType === 3 && child.nodeValue.trim() !== "") {
                hasNonEmptyTextNode = true;
              }
            }
          }
          if (bad.length) {
            this.relatedNodes(bad);
          }
          var retVal = !!bad.length || hasNonEmptyTextNode;
          return retVal;
        }
      }, {
        id: "only-listitems",
        evaluate: function(node, options) {
          var child, bad = [], children = node.childNodes, hasNonEmptyTextNode = false;
          for (var i = 0; i < children.length; i++) {
            child = children[i];
            if (child.nodeType === 1 && child.nodeName !== "LI" && child.nodeName !== "SCRIPT" && child.nodeName !== "TEMPLATE") {
              bad.push(child);
            } else {
              if (child.nodeType === 3 && child.nodeValue.trim() !== "") {
                hasNonEmptyTextNode = true;
              }
            }
          }
          if (bad.length) {
            this.relatedNodes(bad);
          }
          return !!bad.length || hasNonEmptyTextNode;
        }
      }, {
        id: "structured-dlitems",
        evaluate: function(node, options) {
          var children = node.children;
          if (!children || !children.length) {
            return false;
          }
          var hasDt = false, hasDd = false;
          for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName === "DT") {
              hasDt = true;
            }
            if (hasDt && children[i].nodeName === "DD") {
              return false;
            }
            if (children[i].nodeName === "DD") {
              hasDd = true;
            }
          }
          return hasDt || hasDd;
        }
      }, {
        id: "caption",
        evaluate: function(node, options) {
          return !node.querySelector("track[kind=captions]");
        }
      }, {
        id: "description",
        evaluate: function(node, options) {
          return !node.querySelector("track[kind=descriptions]");
        }
      }, {
        id: "meta-viewport",
        evaluate: function(node, options) {
          var params, content = node.getAttribute("content") || "", parsedParams = content.split(/[;,]/), result = {};
          for (var i = 0, l = parsedParams.length; i < l; i++) {
            params = parsedParams[i].split("=");
            var key = params.shift();
            if (key && params.length) {
              result[key.trim()] = params.join("=").trim();
            }
          }
          if (result["maximum-scale"] && parseFloat(result["maximum-scale"]) < 5) {
            return false;
          }
          if (result["user-scalable"] === "no") {
            return false;
          }
          return true;
        }
      }, {
        id: "header-present",
        selector: "html",
        evaluate: function(node, options) {
          return !!node.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
        }
      }, {
        id: "heading-order",
        evaluate: function(node, options) {
          var ariaHeadingLevel = node.getAttribute("aria-level");
          if (ariaHeadingLevel !== null) {
            this.data(parseInt(ariaHeadingLevel, 10));
            return true;
          }
          var headingLevel = node.tagName.match(/H(\d)/);
          if (headingLevel) {
            this.data(parseInt(headingLevel[1], 10));
            return true;
          }
          return true;
        },
        after: function(results, options) {
          if (results.length < 2) {
            return results;
          }
          var prevLevel = results[0].data;
          for (var i = 1; i < results.length; i++) {
            if (results[i].result && results[i].data > prevLevel + 1) {
              results[i].result = false;
            }
            prevLevel = results[i].data;
          }
          return results;
        }
      }, {
        id: "internal-link-present",
        selector: "html",
        evaluate: function(node, options) {
          return !!node.querySelector('a[href^="#"]');
        }
      }, {
        id: "landmark",
        selector: "html",
        evaluate: function(node, options) {
          return !!node.querySelector('[role="main"]');
        }
      }, {
        id: "meta-refresh",
        evaluate: function(node, options) {
          var content = node.getAttribute("content") || "", parsedParams = content.split(/[;,]/);
          return content === "" || parsedParams[0] === "0";
        }
      }, {
        id: "region",
        evaluate: function(node, options) {
          var landmarkRoles = commons.aria.getRolesByType("landmark"), firstLink = node.querySelector("a[href]");
          function isSkipLink(n) {
            return firstLink && commons.dom.isFocusable(commons.dom.getElementByReference(firstLink, "href")) && firstLink === n;
          }
          function isLandmark(n) {
            var role = n.getAttribute("role");
            return role && landmarkRoles.indexOf(role) !== -1;
          }
          function checkRegion(n) {
            if (isLandmark(n)) {
              return null;
            }
            if (isSkipLink(n)) {
              return getViolatingChildren(n);
            }
            if (commons.dom.isVisible(n, true) && (commons.text.visible(n, true, true) || commons.dom.isVisualContent(n))) {
              return n;
            }
            return getViolatingChildren(n);
          }
          function getViolatingChildren(n) {
            var children = commons.utils.toArray(n.children);
            if (children.length === 0) {
              return [];
            }
            return children.map(checkRegion).filter(function(c) {
              return c !== null;
            }).reduce(function(a, b) {
              return a.concat(b);
            }, []);
          }
          var v = getViolatingChildren(node);
          this.relatedNodes(v);
          return !v.length;
        },
        after: function(results, options) {
          return [ results[0] ];
        }
      }, {
        id: "skip-link",
        selector: "a[href]",
        evaluate: function(node, options) {
          return commons.dom.isFocusable(commons.dom.getElementByReference(node, "href"));
        },
        after: function(results, options) {
          return [ results[0] ];
        }
      }, {
        id: "unique-frame-title",
        evaluate: function(node, options) {
          this.data(node.title);
          return true;
        },
        after: function(results, options) {
          var titles = {};
          results.forEach(function(r) {
            titles[r.data] = titles[r.data] !== undefined ? ++titles[r.data] : 0;
          });
          return results.filter(function(r) {
            return !!titles[r.data];
          });
        }
      }, {
        id: "aria-label",
        evaluate: function(node, options) {
          var label = node.getAttribute("aria-label");
          return !!(label ? commons.text.sanitize(label).trim() : "");
        }
      }, {
        id: "aria-labelledby",
        evaluate: function(node, options) {
          var results = commons.dom.idrefs(node, "aria-labelledby");
          var element, i, l = results.length;
          for (i = 0; i < l; i++) {
            element = results[i];
            if (element && commons.text.accessibleText(element).trim()) {
              return true;
            }
          }
          return false;
        }
      }, {
        id: "button-has-visible-text",
        evaluate: function(node, options) {
          return commons.text.accessibleText(node).length > 0;
        },
        selector: 'button, [role="button"]:not(input)'
      }, {
        id: "doc-has-title",
        evaluate: function(node, options) {
          var title = document.title;
          return !!(title ? commons.text.sanitize(title).trim() : "");
        }
      }, {
        id: "duplicate-id",
        evaluate: function(node, options) {
          var matchingNodes = document.querySelectorAll('[id="' + commons.utils.escapeSelector(node.id) + '"]');
          var related = [];
          for (var i = 0; i < matchingNodes.length; i++) {
            if (matchingNodes[i] !== node) {
              related.push(matchingNodes[i]);
            }
          }
          if (related.length) {
            this.relatedNodes(related);
          }
          this.data(node.getAttribute("id"));
          return matchingNodes.length <= 1;
        },
        after: function(results, options) {
          var uniqueIds = [];
          return results.filter(function(r) {
            if (uniqueIds.indexOf(r.data) === -1) {
              uniqueIds.push(r.data);
              return true;
            }
            return false;
          });
        }
      }, {
        id: "exists",
        evaluate: function(node, options) {
          return true;
        }
      }, {
        id: "has-alt",
        evaluate: function(node, options) {
          return node.hasAttribute("alt");
        }
      }, {
        id: "has-visible-text",
        evaluate: function(node, options) {
          return commons.text.accessibleText(node).length > 0;
        }
      }, {
        id: "non-empty-alt",
        evaluate: function(node, options) {
          var label = node.getAttribute("alt");
          return !!(label ? commons.text.sanitize(label).trim() : "");
        }
      }, {
        id: "non-empty-if-present",
        evaluate: function(node, options) {
          var label = node.getAttribute("value");
          this.data(label);
          return label === null || commons.text.sanitize(label).trim() !== "";
        },
        selector: '[type="submit"], [type="reset"]'
      }, {
        id: "non-empty-title",
        evaluate: function(node, options) {
          var title = node.getAttribute("title");
          return !!(title ? commons.text.sanitize(title).trim() : "");
        }
      }, {
        id: "non-empty-value",
        evaluate: function(node, options) {
          var label = node.getAttribute("value");
          return !!(label ? commons.text.sanitize(label).trim() : "");
        },
        selector: '[type="button"]'
      }, {
        id: "role-none",
        evaluate: function(node, options) {
          return node.getAttribute("role") === "none";
        }
      }, {
        id: "role-presentation",
        evaluate: function(node, options) {
          return node.getAttribute("role") === "presentation";
        }
      }, {
        id: "cell-no-header",
        evaluate: function(node, options) {
          var row, cell, badCells = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (commons.table.isDataCell(cell) && (!commons.aria.label(cell) && !commons.table.getHeaders(cell).length)) {
                badCells.push(cell);
              }
            }
          }
          if (badCells.length) {
            this.relatedNodes(badCells);
            return true;
          }
          return false;
        }
      }, {
        id: "consistent-columns",
        evaluate: function(node, options) {
          var table = commons.table.toArray(node);
          var relatedNodes = [];
          var expectedWidth;
          for (var i = 0, length = table.length; i < length; i++) {
            if (i === 0) {
              expectedWidth = table[i].length;
            } else {
              if (expectedWidth !== table[i].length) {
                relatedNodes.push(node.rows[i]);
              }
            }
          }
          return !relatedNodes.length;
        }
      }, {
        id: "has-caption",
        evaluate: function(node, options) {
          return !!node.caption;
        }
      }, {
        id: "has-summary",
        evaluate: function(node, options) {
          return !!node.summary;
        }
      }, {
        id: "has-th",
        evaluate: function(node, options) {
          var row, cell, badCells = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (cell.nodeName === "TH") {
                badCells.push(cell);
              }
            }
          }
          if (badCells.length) {
            this.relatedNodes(badCells);
            return true;
          }
          return false;
        }
      }, {
        id: "headers-attr-reference",
        evaluate: function(node, options) {
          var row, cell, headerCells, badHeaders = [];
          function checkHeader(header) {
            if (!header || !commons.text.accessibleText(header)) {
              badHeaders.push(cell);
            }
          }
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              headerCells = commons.dom.idrefs(cell, "headers");
              if (headerCells.length) {
                headerCells.forEach(checkHeader);
              }
            }
          }
          if (badHeaders.length) {
            this.relatedNodes(badHeaders);
            return true;
          }
          return false;
        }
      }, {
        id: "headers-visible-text",
        evaluate: function(node, options) {
          var row, cell, badHeaders = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (commons.table.isHeader(cell) && !commons.text.accessibleText(cell)) {
                badHeaders.push(cell);
              }
            }
          }
          if (badHeaders.length) {
            this.relatedNodes(badHeaders);
            return true;
          }
          return false;
        }
      }, {
        id: "html4-scope",
        evaluate: function(node, options) {
          if (commons.dom.isHTML5(document)) {
            return false;
          }
          return node.nodeName === "TH" || node.nodeName === "TD";
        }
      }, {
        id: "html5-scope",
        evaluate: function(node, options) {
          if (!commons.dom.isHTML5(document)) {
            return false;
          }
          return node.nodeName === "TH";
        }
      }, {
        id: "no-caption",
        evaluate: function(node, options) {
          return !(node.caption || {}).textContent;
        },
        enabled: false
      }, {
        id: "rowspan",
        evaluate: function(node, options) {
          var row, cell, badCells = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (cell.rowSpan !== 1) {
                badCells.push(cell);
              }
            }
          }
          if (badCells.length) {
            this.relatedNodes(badCells);
            return true;
          }
          return false;
        }
      }, {
        id: "same-caption-summary",
        selector: "table",
        evaluate: function(node, options) {
          return !!(node.summary && node.caption) && node.summary === commons.text.accessibleText(node.caption);
        }
      }, {
        id: "scope-value",
        evaluate: function(node, options) {
          var value = node.getAttribute("scope");
          return value !== "row" && value !== "col";
        }
      }, {
        id: "th-headers-attr",
        evaluate: function(node, options) {
          var row, cell, headersTH = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (cell.nodeName === "TH" && cell.getAttribute("headers")) {
                headersTH.push(cell);
              }
            }
          }
          if (headersTH.length) {
            this.relatedNodes(headersTH);
            return true;
          }
          return false;
        }
      }, {
        id: "th-scope",
        evaluate: function(node, options) {
          var row, cell, noScopeTH = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (cell.nodeName === "TH" && !cell.getAttribute("scope")) {
                noScopeTH.push(cell);
              }
            }
          }
          if (noScopeTH.length) {
            this.relatedNodes(noScopeTH);
            return true;
          }
          return false;
        }
      }, {
        id: "th-single-row-column",
        evaluate: function(node, options) {
          var row, cell, position, rowHeaders = [], columnHeaders = [];
          for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (cell.nodeName) {
                if (commons.table.isColumnHeader(cell) && columnHeaders.indexOf(rowIndex) === -1) {
                  columnHeaders.push(rowIndex);
                } else {
                  if (commons.table.isRowHeader(cell)) {
                    position = commons.table.getCellPosition(cell);
                    if (rowHeaders.indexOf(position.x) === -1) {
                      rowHeaders.push(position.x);
                    }
                  }
                }
              }
            }
          }
          if (columnHeaders.length > 1 || rowHeaders.length > 1) {
            return true;
          }
          return false;
        }
      } ],
      commons: function() {
        var commons = {};
        var aria = commons.aria = {}, lookupTables = aria._lut = {};
        lookupTables.attributes = {
          "aria-activedescendant": {
            type: "idref"
          },
          "aria-atomic": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-autocomplete": {
            type: "nmtoken",
            values: [ "inline", "list", "both", "none" ]
          },
          "aria-busy": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-checked": {
            type: "nmtoken",
            values: [ "true", "false", "mixed", "undefined" ]
          },
          "aria-colcount": {
            type: "int"
          },
          "aria-colindex": {
            type: "int"
          },
          "aria-colspan": {
            type: "int"
          },
          "aria-controls": {
            type: "idrefs"
          },
          "aria-describedby": {
            type: "idrefs"
          },
          "aria-disabled": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-dropeffect": {
            type: "nmtokens",
            values: [ "copy", "move", "reference", "execute", "popup", "none" ]
          },
          "aria-expanded": {
            type: "nmtoken",
            values: [ "true", "false", "undefined" ]
          },
          "aria-flowto": {
            type: "idrefs"
          },
          "aria-grabbed": {
            type: "nmtoken",
            values: [ "true", "false", "undefined" ]
          },
          "aria-haspopup": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-hidden": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-invalid": {
            type: "nmtoken",
            values: [ "true", "false", "spelling", "grammar" ]
          },
          "aria-label": {
            type: "string"
          },
          "aria-labelledby": {
            type: "idrefs"
          },
          "aria-level": {
            type: "int"
          },
          "aria-live": {
            type: "nmtoken",
            values: [ "off", "polite", "assertive" ]
          },
          "aria-multiline": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-multiselectable": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-orientation": {
            type: "nmtoken",
            values: [ "horizontal", "vertical" ]
          },
          "aria-owns": {
            type: "idrefs"
          },
          "aria-posinset": {
            type: "int"
          },
          "aria-pressed": {
            type: "nmtoken",
            values: [ "true", "false", "mixed", "undefined" ]
          },
          "aria-readonly": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-relevant": {
            type: "nmtokens",
            values: [ "additions", "removals", "text", "all" ]
          },
          "aria-required": {
            type: "boolean",
            values: [ "true", "false" ]
          },
          "aria-rowcount": {
            type: "int"
          },
          "aria-rowindex": {
            type: "int"
          },
          "aria-rowspan": {
            type: "int"
          },
          "aria-selected": {
            type: "nmtoken",
            values: [ "true", "false", "undefined" ]
          },
          "aria-setsize": {
            type: "int"
          },
          "aria-sort": {
            type: "nmtoken",
            values: [ "ascending", "descending", "other", "none" ]
          },
          "aria-valuemax": {
            type: "decimal"
          },
          "aria-valuemin": {
            type: "decimal"
          },
          "aria-valuenow": {
            type: "decimal"
          },
          "aria-valuetext": {
            type: "string"
          }
        };
        lookupTables.globalAttributes = [ "aria-atomic", "aria-busy", "aria-controls", "aria-describedby", "aria-disabled", "aria-dropeffect", "aria-flowto", "aria-grabbed", "aria-haspopup", "aria-hidden", "aria-invalid", "aria-label", "aria-labelledby", "aria-live", "aria-owns", "aria-relevant" ];
        lookupTables.role = {
          alert: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          alertdialog: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          application: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          article: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "article" ]
          },
          banner: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          button: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded", "aria-pressed" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null,
            implicit: [ "button", 'input[type="button"]', 'input[type="image"]' ]
          },
          cell: {
            type: "structure",
            attributes: {
              allowed: [ "aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "row" ]
          },
          checkbox: {
            type: "widget",
            attributes: {
              required: [ "aria-checked" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null,
            implicit: [ 'input[type="checkbox"]' ]
          },
          columnheader: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded", "aria-sort", "aria-readonly", "aria-selected", "aria-required" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "row" ]
          },
          combobox: {
            type: "composite",
            attributes: {
              required: [ "aria-expanded" ],
              allowed: [ "aria-autocomplete", "aria-required", "aria-activedescendant" ]
            },
            owned: {
              all: [ "listbox", "textbox" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          command: {
            nameFrom: [ "author" ],
            type: "abstract"
          },
          complementary: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "aside" ]
          },
          composite: {
            nameFrom: [ "author" ],
            type: "abstract"
          },
          contentinfo: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          definition: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          dialog: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "dialog" ]
          },
          directory: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null
          },
          document: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "body" ]
          },
          form: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          grid: {
            type: "composite",
            attributes: {
              allowed: [ "aria-level", "aria-multiselectable", "aria-readonly", "aria-activedescendant", "aria-expanded" ]
            },
            owned: {
              one: [ "rowgroup", "row" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          gridcell: {
            type: "widget",
            attributes: {
              allowed: [ "aria-selected", "aria-readonly", "aria-expanded", "aria-required" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "row" ]
          },
          group: {
            type: "structure",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "details" ]
          },
          heading: {
            type: "structure",
            attributes: {
              allowed: [ "aria-level", "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null,
            implicit: [ "h1", "h2", "h3", "h4", "h5", "h6" ]
          },
          img: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "img" ]
          },
          input: {
            nameFrom: [ "author" ],
            type: "abstract"
          },
          landmark: {
            nameFrom: [ "author" ],
            type: "abstract"
          },
          link: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null,
            implicit: [ "a[href]" ]
          },
          list: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: {
              all: [ "listitem" ]
            },
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "ol", "ul" ]
          },
          listbox: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-multiselectable", "aria-required", "aria-expanded" ]
            },
            owned: {
              all: [ "option" ]
            },
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "select" ]
          },
          listitem: {
            type: "structure",
            attributes: {
              allowed: [ "aria-level", "aria-posinset", "aria-setsize", "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "list" ],
            implicit: [ "li" ]
          },
          log: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          main: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          marquee: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          math: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          menu: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded" ]
            },
            owned: {
              one: [ "menuitem", "menuitemradio", "menuitemcheckbox" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          menubar: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          menuitem: {
            type: "widget",
            attributes: null,
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "menu", "menubar" ]
          },
          menuitemcheckbox: {
            type: "widget",
            attributes: {
              required: [ "aria-checked" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "menu", "menubar" ]
          },
          menuitemradio: {
            type: "widget",
            attributes: {
              allowed: [ "aria-selected", "aria-posinset", "aria-setsize" ],
              required: [ "aria-checked" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "menu", "menubar" ]
          },
          navigation: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          none: {
            type: "structure",
            attributes: null,
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          note: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          option: {
            type: "widget",
            attributes: {
              allowed: [ "aria-selected", "aria-posinset", "aria-setsize", "aria-checked" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "listbox" ]
          },
          presentation: {
            type: "structure",
            attributes: null,
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          progressbar: {
            type: "widget",
            attributes: {
              allowed: [ "aria-valuetext", "aria-valuenow", "aria-valuemax", "aria-valuemin" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          radio: {
            type: "widget",
            attributes: {
              allowed: [ "aria-selected", "aria-posinset", "aria-setsize" ],
              required: [ "aria-checked" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null,
            implicit: [ 'input[type="radio"]' ]
          },
          radiogroup: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-required", "aria-expanded" ]
            },
            owned: {
              all: [ "radio" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          range: {
            nameFrom: [ "author" ],
            type: "abstract"
          },
          region: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "section" ]
          },
          roletype: {
            type: "abstract"
          },
          row: {
            type: "structure",
            attributes: {
              allowed: [ "aria-level", "aria-selected", "aria-activedescendant", "aria-expanded" ]
            },
            owned: {
              one: [ "cell", "columnheader", "rowheader", "gridcell" ]
            },
            nameFrom: [ "author", "contents" ],
            context: [ "rowgroup", "grid", "treegrid", "table" ]
          },
          rowgroup: {
            type: "structure",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded" ]
            },
            owned: {
              all: [ "row" ]
            },
            nameFrom: [ "author", "contents" ],
            context: [ "grid", "table" ]
          },
          rowheader: {
            type: "structure",
            attributes: {
              allowed: [ "aria-sort", "aria-required", "aria-readonly", "aria-expanded", "aria-selected" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "row" ]
          },
          scrollbar: {
            type: "widget",
            attributes: {
              required: [ "aria-controls", "aria-orientation", "aria-valuenow", "aria-valuemax", "aria-valuemin" ],
              allowed: [ "aria-valuetext" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          search: {
            type: "landmark",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          searchbox: {
            type: "widget",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-readonly", "aria-required" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ 'input[type="search"]' ]
          },
          section: {
            nameFrom: [ "author", "contents" ],
            type: "abstract"
          },
          sectionhead: {
            nameFrom: [ "author", "contents" ],
            type: "abstract"
          },
          select: {
            nameFrom: [ "author" ],
            type: "abstract"
          },
          separator: {
            type: "structure",
            attributes: {
              allowed: [ "aria-expanded", "aria-orientation" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          slider: {
            type: "widget",
            attributes: {
              allowed: [ "aria-valuetext", "aria-orientation" ],
              required: [ "aria-valuenow", "aria-valuemax", "aria-valuemin" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          spinbutton: {
            type: "widget",
            attributes: {
              allowed: [ "aria-valuetext", "aria-required" ],
              required: [ "aria-valuenow", "aria-valuemax", "aria-valuemin" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          status: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "output" ]
          },
          structure: {
            type: "abstract"
          },
          "switch": {
            type: "widget",
            attributes: {
              required: [ "aria-checked" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null
          },
          tab: {
            type: "widget",
            attributes: {
              allowed: [ "aria-selected", "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "tablist" ]
          },
          table: {
            type: "structure",
            attributes: {
              allowed: [ "aria-colcount", "aria-rowcount" ]
            },
            owned: {
              one: [ "rowgroup", "row" ]
            },
            nameFrom: [ "author" ],
            context: null,
            implicit: [ "table" ]
          },
          tablist: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded", "aria-level", "aria-multiselectable" ]
            },
            owned: {
              all: [ "tab" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          tabpanel: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          text: {
            type: "structure",
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null
          },
          textbox: {
            type: "widget",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-readonly", "aria-required" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ 'input[type="text"]', "input:not([type])" ]
          },
          timer: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null
          },
          toolbar: {
            type: "structure",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author" ],
            context: null,
            implicit: [ 'menu[type="toolbar"]' ]
          },
          tooltip: {
            type: "widget",
            attributes: {
              allowed: [ "aria-expanded" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: null
          },
          tree: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-multiselectable", "aria-required", "aria-expanded" ]
            },
            owned: {
              all: [ "treeitem" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          treegrid: {
            type: "composite",
            attributes: {
              allowed: [ "aria-activedescendant", "aria-expanded", "aria-level", "aria-multiselectable", "aria-readonly", "aria-required" ]
            },
            owned: {
              all: [ "treeitem" ]
            },
            nameFrom: [ "author" ],
            context: null
          },
          treeitem: {
            type: "widget",
            attributes: {
              allowed: [ "aria-checked", "aria-selected", "aria-expanded", "aria-level", "aria-posinset", "aria-setsize" ]
            },
            owned: null,
            nameFrom: [ "author", "contents" ],
            context: [ "treegrid", "tree" ]
          },
          widget: {
            type: "abstract"
          },
          window: {
            nameFrom: [ "author" ],
            type: "abstract"
          }
        };
        var color = {};
        commons.color = color;
        var dom = commons.dom = {};
        var table = commons.table = {};
        var text = commons.text = {};
        var utils = commons.utils = {};
        utils.escapeSelector = axecore.utils.escapeSelector;
        utils.matchesSelector = axecore.utils.matchesSelector;
        utils.clone = axecore.utils.clone;
        aria.requiredAttr = function(role) {
          "use strict";
          var roles = lookupTables.role[role], attr = roles && roles.attributes && roles.attributes.required;
          return attr || [];
        };
        aria.allowedAttr = function(role) {
          "use strict";
          var roles = lookupTables.role[role], attr = roles && roles.attributes && roles.attributes.allowed || [], requiredAttr = roles && roles.attributes && roles.attributes.required || [];
          return attr.concat(lookupTables.globalAttributes).concat(requiredAttr);
        };
        aria.validateAttr = function(att) {
          "use strict";
          return !!lookupTables.attributes[att];
        };
        aria.validateAttrValue = function(node, attr) {
          "use strict";
          var ids, index, length, matches, doc = document, value = node.getAttribute(attr), attrInfo = lookupTables.attributes[attr];
          if (!attrInfo) {
            return true;
          } else {
            if (attrInfo.values) {
              if (typeof value === "string" && attrInfo.values.indexOf(value.toLowerCase()) !== -1) {
                return true;
              }
              return false;
            }
          }
          switch (attrInfo.type) {
           case "idref":
            return !!(value && doc.getElementById(value));

           case "idrefs":
            ids = utils.tokenList(value);
            for (index = 0, length = ids.length; index < length; index++) {
              if (ids[index] && !doc.getElementById(ids[index])) {
                return false;
              }
            }
            return !!ids.length;

           case "string":
            return true;

           case "decimal":
            matches = value.match(/^[-+]?([0-9]*)\.?([0-9]*)$/);
            return !!(matches && (matches[1] || matches[2]));

           case "int":
            return /^[-+]?[0-9]+$/.test(value);
          }
        };
        aria.label = function(node) {
          var ref, candidate;
          if (node.getAttribute("aria-labelledby")) {
            ref = dom.idrefs(node, "aria-labelledby");
            candidate = ref.map(function(thing) {
              return thing ? text.visible(thing, true) : "";
            }).join(" ").trim();
            if (candidate) {
              return candidate;
            }
          }
          candidate = node.getAttribute("aria-label");
          if (candidate) {
            candidate = text.sanitize(candidate).trim();
            if (candidate) {
              return candidate;
            }
          }
          return null;
        };
        aria.isValidRole = function(role) {
          "use strict";
          if (lookupTables.role[role]) {
            return true;
          }
          return false;
        };
        aria.getRolesWithNameFromContents = function() {
          return Object.keys(lookupTables.role).filter(function(r) {
            return lookupTables.role[r].nameFrom && lookupTables.role[r].nameFrom.indexOf("contents") !== -1;
          });
        };
        aria.getRolesByType = function(roleType) {
          return Object.keys(lookupTables.role).filter(function(r) {
            return lookupTables.role[r].type === roleType;
          });
        };
        aria.getRoleType = function(role) {
          var r = lookupTables.role[role];
          return r && r.type || null;
        };
        aria.requiredOwned = function(role) {
          "use strict";
          var owned = null, roles = lookupTables.role[role];
          if (roles) {
            owned = utils.clone(roles.owned);
          }
          return owned;
        };
        aria.requiredContext = function(role) {
          "use strict";
          var context = null, roles = lookupTables.role[role];
          if (roles) {
            context = utils.clone(roles.context);
          }
          return context;
        };
        aria.implicitNodes = function(role) {
          "use strict";
          var implicit = null, roles = lookupTables.role[role];
          if (roles && roles.implicit) {
            implicit = utils.clone(roles.implicit);
          }
          return implicit;
        };
        aria.implicitRole = function(node) {
          "use strict";
          var role, r, candidate, roles = lookupTables.role;
          for (role in roles) {
            if (roles.hasOwnProperty(role)) {
              r = roles[role];
              if (r.implicit) {
                for (var index = 0, length = r.implicit.length; index < length; index++) {
                  candidate = r.implicit[index];
                  if (utils.matchesSelector(node, candidate)) {
                    return role;
                  }
                }
              }
            }
          }
          return null;
        };
        color.Color = function(red, green, blue, alpha) {
          this.red = red;
          this.green = green;
          this.blue = blue;
          this.alpha = alpha;
          this.toHexString = function() {
            var redString = Math.round(this.red).toString(16);
            var greenString = Math.round(this.green).toString(16);
            var blueString = Math.round(this.blue).toString(16);
            return "#" + (this.red > 15.5 ? redString : "0" + redString) + (this.green > 15.5 ? greenString : "0" + greenString) + (this.blue > 15.5 ? blueString : "0" + blueString);
          };
          var rgbRegex = /^rgb\((\d+), (\d+), (\d+)\)$/;
          var rgbaRegex = /^rgba\((\d+), (\d+), (\d+), (\d*(\.\d+)?)\)/;
          this.parseRgbString = function(colorString) {
            var match = colorString.match(rgbRegex);
            if (match) {
              this.red = parseInt(match[1], 10);
              this.green = parseInt(match[2], 10);
              this.blue = parseInt(match[3], 10);
              this.alpha = 1;
              return;
            }
            match = colorString.match(rgbaRegex);
            if (match) {
              this.red = parseInt(match[1], 10);
              this.green = parseInt(match[2], 10);
              this.blue = parseInt(match[3], 10);
              this.alpha = parseFloat(match[4]);
              return;
            }
          };
          this.getRelativeLuminance = function() {
            var rSRGB = this.red / 255;
            var gSRGB = this.green / 255;
            var bSRGB = this.blue / 255;
            var r = rSRGB <= .03928 ? rSRGB / 12.92 : Math.pow((rSRGB + .055) / 1.055, 2.4);
            var g = gSRGB <= .03928 ? gSRGB / 12.92 : Math.pow((gSRGB + .055) / 1.055, 2.4);
            var b = bSRGB <= .03928 ? bSRGB / 12.92 : Math.pow((bSRGB + .055) / 1.055, 2.4);
            return .2126 * r + .7152 * g + .0722 * b;
          };
        };
        color.flattenColors = function(fgColor, bgColor) {
          var alpha = fgColor.alpha;
          var r = (1 - alpha) * bgColor.red + alpha * fgColor.red;
          var g = (1 - alpha) * bgColor.green + alpha * fgColor.green;
          var b = (1 - alpha) * bgColor.blue + alpha * fgColor.blue;
          var a = fgColor.alpha + bgColor.alpha * (1 - fgColor.alpha);
          return new color.Color(r, g, b, a);
        };
        color.getContrast = function(bgColor, fgColor) {
          if (!fgColor || !bgColor) {
            return null;
          }
          if (fgColor.alpha < 1) {
            fgColor = color.flattenColors(fgColor, bgColor);
          }
          var bL = bgColor.getRelativeLuminance();
          var fL = fgColor.getRelativeLuminance();
          return (Math.max(fL, bL) + .05) / (Math.min(fL, bL) + .05);
        };
        color.hasValidContrastRatio = function(bg, fg, fontSize, isBold) {
          var contrast = color.getContrast(bg, fg);
          var isSmallFont = isBold && Math.ceil(fontSize * 72) / 96 < 14 || !isBold && Math.ceil(fontSize * 72) / 96 < 18;
          return {
            isValid: isSmallFont && contrast >= 4.5 || !isSmallFont && contrast >= 3,
            contrastRatio: contrast
          };
        };
        function getBackgroundForSingleNode(node) {
          var bgColor, nodeStyle = window.getComputedStyle(node);
          if (nodeStyle.getPropertyValue("background-image") !== "none") {
            return null;
          }
          var bgColorString = nodeStyle.getPropertyValue("background-color");
          if (bgColorString === "transparent") {
            bgColor = new color.Color(0, 0, 0, 0);
          } else {
            bgColor = new color.Color();
            bgColor.parseRgbString(bgColorString);
          }
          var opacity = nodeStyle.getPropertyValue("opacity");
          bgColor.alpha = bgColor.alpha * opacity;
          return bgColor;
        }
        dom.isOpaque = function(node) {
          var bgColor = getBackgroundForSingleNode(node);
          if (bgColor === null || bgColor.alpha === 1) {
            return true;
          }
          return false;
        };
        var getVisualParents = function(node, rect) {
          var visualParents, thisIndex, parents = [], fallbackToVisual = false, currentNode = node, nodeStyle = window.getComputedStyle(currentNode), posVal, topVal, bottomVal, leftVal, rightVal;
          while (currentNode !== null && (!dom.isOpaque(currentNode) || parseInt(nodeStyle.getPropertyValue("height"), 10) === 0)) {
            posVal = nodeStyle.getPropertyValue("position");
            topVal = nodeStyle.getPropertyValue("top");
            bottomVal = nodeStyle.getPropertyValue("bottom");
            leftVal = nodeStyle.getPropertyValue("left");
            rightVal = nodeStyle.getPropertyValue("right");
            if (posVal !== "static" && posVal !== "relative" || posVal === "relative" && (leftVal !== "auto" || rightVal !== "auto" || topVal !== "auto" || bottomVal !== "auto")) {
              fallbackToVisual = true;
            }
            currentNode = currentNode.parentElement;
            if (currentNode !== null) {
              nodeStyle = window.getComputedStyle(currentNode);
              if (parseInt(nodeStyle.getPropertyValue("height"), 10) !== 0) {
                parents.push(currentNode);
              }
            }
          }
          if (fallbackToVisual && dom.supportsElementsFromPoint(document)) {
            visualParents = dom.elementsFromPoint(document, Math.ceil(rect.left + 1), Math.ceil(rect.top + 1));
            thisIndex = visualParents.indexOf(node);
            if (thisIndex === -1) {
              return null;
            }
            if (visualParents && thisIndex < visualParents.length - 1) {
              parents = visualParents.slice(thisIndex + 1);
            }
          }
          return parents;
        };
        color.getBackgroundColor = function(node, bgNodes) {
          var parent, parentColor;
          var bgColor = getBackgroundForSingleNode(node);
          if (bgNodes && (bgColor === null || bgColor.alpha !== 0)) {
            bgNodes.push(node);
          }
          if (bgColor === null || bgColor.alpha === 1) {
            return bgColor;
          }
          // node.scrollIntoView();
          var rect = node.getBoundingClientRect(), currentNode = node, colorStack = [ {
            color: bgColor,
            node: node
          } ], parents = getVisualParents(currentNode, rect);
          if (!parents) {
            return null;
          }
          while (bgColor.alpha !== 1) {
            parent = parents.shift();
            if (!parent && currentNode.tagName !== "HTML") {
              return null;
            }
            if (!parent && currentNode.tagName === "HTML") {
              parentColor = new color.Color(255, 255, 255, 1);
            } else {
              if (!dom.visuallyContains(node, parent)) {
                return null;
              }
              parentColor = getBackgroundForSingleNode(parent);
              if (bgNodes && (parentColor === null || parentColor.alpha !== 0)) {
                bgNodes.push(parent);
              }
              if (parentColor === null) {
                return null;
              }
            }
            currentNode = parent;
            bgColor = parentColor;
            colorStack.push({
              color: bgColor,
              node: currentNode
            });
          }
          var currColorNode = colorStack.pop();
          var flattenedColor = currColorNode.color;
          while ((currColorNode = colorStack.pop()) !== undefined) {
            flattenedColor = color.flattenColors(currColorNode.color, flattenedColor);
          }
          return flattenedColor;
        };
        color.getForegroundColor = function(node) {
          var nodeStyle = window.getComputedStyle(node);
          var fgColor = new color.Color();
          fgColor.parseRgbString(nodeStyle.getPropertyValue("color"));
          var opacity = nodeStyle.getPropertyValue("opacity");
          fgColor.alpha = fgColor.alpha * opacity;
          if (fgColor.alpha === 1) {
            return fgColor;
          }
          var bgColor = color.getBackgroundColor(node);
          if (bgColor === null) {
            return null;
          }
          return color.flattenColors(fgColor, bgColor);
        };
        dom.supportsElementsFromPoint = function(doc) {
          var element = doc.createElement("x");
          element.style.cssText = "pointer-events:auto";
          return element.style.pointerEvents === "auto" || !!doc.msElementsFromPoint;
        };
        dom.elementsFromPoint = function(doc, x, y) {
          var elements = [], previousPointerEvents = [], current, i, d;
          if (doc.msElementsFromPoint) {
            var nl = doc.msElementsFromPoint(x, y);
            return nl ? Array.prototype.slice.call(nl) : null;
          }
          while ((current = doc.elementFromPoint(x, y)) && elements.indexOf(current) === -1 && current !== null) {
            elements.push(current);
            previousPointerEvents.push({
              value: current.style.getPropertyValue("pointer-events"),
              priority: current.style.getPropertyPriority("pointer-events")
            });
            current.style.setProperty("pointer-events", "none", "important");
            if (dom.isOpaque(current)) {
              break;
            }
          }
          for (i = previousPointerEvents.length; !!(d = previousPointerEvents[--i]); ) {
            elements[i].style.setProperty("pointer-events", d.value ? d.value : "", d.priority);
          }
          return elements;
        };
        dom.findUp = function(element, target) {
          "use strict";
          var parent, matches = document.querySelectorAll(target), length = matches.length;
          if (!length) {
            return null;
          }
          matches = utils.toArray(matches);
          parent = element.parentNode;
          while (parent && matches.indexOf(parent) === -1) {
            parent = parent.parentNode;
          }
          return parent;
        };
        dom.getElementByReference = function(node, attr) {
          "use strict";
          var candidate, fragment = node.getAttribute(attr), doc = document;
          if (fragment && fragment.charAt(0) === "#") {
            fragment = fragment.substring(1);
            candidate = doc.getElementById(fragment);
            if (candidate) {
              return candidate;
            }
            candidate = doc.getElementsByName(fragment);
            if (candidate.length) {
              return candidate[0];
            }
          }
          return null;
        };
        dom.getElementCoordinates = function(element) {
          "use strict";
          var scrollOffset = dom.getScrollOffset(document), xOffset = scrollOffset.left, yOffset = scrollOffset.top, coords = element.getBoundingClientRect();
          return {
            top: coords.top + yOffset,
            right: coords.right + xOffset,
            bottom: coords.bottom + yOffset,
            left: coords.left + xOffset,
            width: coords.right - coords.left,
            height: coords.bottom - coords.top
          };
        };
        dom.getScrollOffset = function(element) {
          "use strict";
          if (!element.nodeType && element.document) {
            element = element.document;
          }
          if (element.nodeType === 9) {
            var docElement = element.documentElement, body = element.body;
            return {
              left: docElement && docElement.scrollLeft || body && body.scrollLeft || 0,
              top: docElement && docElement.scrollTop || body && body.scrollTop || 0
            };
          }
          return {
            left: element.scrollLeft,
            top: element.scrollTop
          };
        };
        dom.getViewportSize = function(win) {
          "use strict";
          var body, doc = win.document, docElement = doc.documentElement;
          if (win.innerWidth) {
            return {
              width: win.innerWidth,
              height: win.innerHeight
            };
          }
          if (docElement) {
            return {
              width: docElement.clientWidth,
              height: docElement.clientHeight
            };
          }
          body = doc.body;
          return {
            width: body.clientWidth,
            height: body.clientHeight
          };
        };
        dom.idrefs = function(node, attr) {
          "use strict";
          var index, length, doc = document, result = [], idrefs = node.getAttribute(attr);
          if (idrefs) {
            idrefs = utils.tokenList(idrefs);
            for (index = 0, length = idrefs.length; index < length; index++) {
              result.push(doc.getElementById(idrefs[index]));
            }
          }
          return result;
        };
        dom.isFocusable = function(el) {
          "use strict";
          if (!el || el.disabled || !dom.isVisible(el) && el.nodeName !== "AREA") {
            return false;
          }
          switch (el.nodeName) {
           case "A":
           case "AREA":
            if (el.href) {
              return true;
            }
            break;

           case "INPUT":
            return el.type !== "hidden";

           case "TEXTAREA":
           case "SELECT":
           case "DETAILS":
           case "BUTTON":
            return true;
          }
          var tabindex = el.getAttribute("tabindex");
          if (tabindex && !isNaN(parseInt(tabindex, 10))) {
            return true;
          }
          return false;
        };
        dom.isHTML5 = function(doc) {
          var node = doc.doctype;
          if (node === null) {
            return false;
          }
          return node.name === "html" && !node.publicId && !node.systemId;
        };
        dom.isNode = function(candidate) {
          "use strict";
          return candidate instanceof Node;
        };
        dom.isOffscreen = function(element) {
          "use strict";
          var leftBoundary, docElement = document.documentElement, dir = window.getComputedStyle(document.body || docElement).getPropertyValue("direction"), coords = dom.getElementCoordinates(element);
          if (coords.bottom < 0) {
            return true;
          }
          if (dir === "ltr") {
            if (coords.right < 0) {
              return true;
            }
          } else {
            leftBoundary = Math.max(docElement.scrollWidth, dom.getViewportSize(window).width);
            if (coords.left > leftBoundary) {
              return true;
            }
          }
          return false;
        };
        function isClipped(clip) {
          "use strict";
          var matches = clip.match(/rect\s*\(([0-9]+)px,?\s*([0-9]+)px,?\s*([0-9]+)px,?\s*([0-9]+)px\s*\)/);
          if (matches && matches.length === 5) {
            return matches[3] - matches[1] <= 0 && matches[2] - matches[4] <= 0;
          }
          return false;
        }
        dom.isVisible = function(el, screenReader, recursed) {
          "use strict";
          var style, nodeName = el.nodeName, parent = el.parentNode;
          if (el.nodeType === 9) {
            return true;
          }
          style = window.getComputedStyle(el, null);
          if (style === null) {
            return false;
          }
          if (style.getPropertyValue("display") === "none" || nodeName === "STYLE" || nodeName === "SCRIPT" || !screenReader && isClipped(style.getPropertyValue("clip")) || !recursed && (style.getPropertyValue("visibility") === "hidden" || !screenReader && dom.isOffscreen(el)) || screenReader && el.getAttribute("aria-hidden") === "true") {
            return false;
          }
          if (parent) {
            return dom.isVisible(parent, screenReader, true);
          }
          return false;
        };
        dom.isVisualContent = function(candidate) {
          "use strict";
          switch (candidate.tagName.toUpperCase()) {
           case "IMG":
           case "IFRAME":
           case "OBJECT":
           case "VIDEO":
           case "AUDIO":
           case "CANVAS":
           case "SVG":
           case "MATH":
           case "BUTTON":
           case "SELECT":
           case "TEXTAREA":
           case "KEYGEN":
           case "PROGRESS":
           case "METER":
            return true;

           case "INPUT":
            return candidate.type !== "hidden";

           default:
            return false;
          }
        };
        dom.visuallyContains = function(node, parent) {
          var rect = node.getBoundingClientRect();
          var parentRect = parent.getBoundingClientRect();
          var parentTop = parentRect.top;
          var parentLeft = parentRect.left;
          var parentScrollArea = {
            top: parentTop - parent.scrollTop,
            bottom: parentTop - parent.scrollTop + parent.scrollHeight,
            left: parentLeft - parent.scrollLeft,
            right: parentLeft - parent.scrollLeft + parent.scrollWidth
          };
          if (rect.left < parentScrollArea.left && rect.left < parentRect.left || rect.top < parentScrollArea.top && rect.top < parentRect.top || rect.right > parentScrollArea.right && rect.right > parentRect.right || rect.bottom > parentScrollArea.bottom && rect.bottom > parentRect.bottom) {
            return false;
          }
          var style = window.getComputedStyle(parent);
          if (rect.right > parentRect.right || rect.bottom > parentRect.bottom) {
            return style.overflow === "scroll" || style.overflow === "auto" || style.overflow === "hidden" || parent instanceof HTMLBodyElement || parent instanceof HTMLHtmlElement;
          }
          return true;
        };
        dom.visuallyOverlaps = function(rect, parent) {
          var parentRect = parent.getBoundingClientRect();
          var parentTop = parentRect.top;
          var parentLeft = parentRect.left;
          var parentScrollArea = {
            top: parentTop - parent.scrollTop,
            bottom: parentTop - parent.scrollTop + parent.scrollHeight,
            left: parentLeft - parent.scrollLeft,
            right: parentLeft - parent.scrollLeft + parent.scrollWidth
          };
          if (rect.left > parentScrollArea.right && rect.left > parentRect.right || rect.top > parentScrollArea.bottom && rect.top > parentRect.bottom || rect.right < parentScrollArea.left && rect.right < parentRect.left || rect.bottom < parentScrollArea.top && rect.bottom < parentRect.top) {
            return false;
          }
          var style = window.getComputedStyle(parent);
          if (rect.left > parentRect.right || rect.top > parentRect.bottom) {
            return style.overflow === "scroll" || style.overflow === "auto" || parent instanceof HTMLBodyElement || parent instanceof HTMLHtmlElement;
          }
          return true;
        };
        table.getCellPosition = function(cell) {
          var tbl = table.toArray(dom.findUp(cell, "table")), index;
          for (var rowIndex = 0; rowIndex < tbl.length; rowIndex++) {
            if (tbl[rowIndex]) {
              index = tbl[rowIndex].indexOf(cell);
              if (index !== -1) {
                return {
                  x: index,
                  y: rowIndex
                };
              }
            }
          }
        };
        table.getHeaders = function(cell) {
          if (cell.getAttribute("headers")) {
            return commons.dom.idrefs(cell, "headers");
          }
          var headers = [], currentCell, tbl = commons.table.toArray(commons.dom.findUp(cell, "table")), position = commons.table.getCellPosition(cell);
          for (var x = position.x - 1; x >= 0; x--) {
            currentCell = tbl[position.y][x];
            if (commons.table.isRowHeader(currentCell)) {
              headers.unshift(currentCell);
            }
          }
          for (var y = position.y - 1; y >= 0; y--) {
            currentCell = tbl[y][position.x];
            if (currentCell && commons.table.isColumnHeader(currentCell)) {
              headers.unshift(currentCell);
            }
          }
          return headers;
        };
        table.isColumnHeader = function(node) {
          var scope = node.getAttribute("scope");
          if (scope === "col") {
            return true;
          } else {
            if (scope || node.nodeName !== "TH") {
              return false;
            }
          }
          var currentCell, position = table.getCellPosition(node), tbl = table.toArray(dom.findUp(node, "table")), cells = tbl[position.y];
          for (var cellIndex = 0, cellLength = cells.length; cellIndex < cellLength; cellIndex++) {
            currentCell = cells[cellIndex];
            if (currentCell !== node) {
              if (table.isDataCell(currentCell)) {
                return false;
              }
            }
          }
          return true;
        };
        table.isDataCell = function(cell) {
          if (!cell.children.length && !cell.textContent.trim()) {
            return false;
          }
          return cell.nodeName === "TD";
        };
        table.isDataTable = function(node) {
          var role = node.getAttribute("role");
          if ((role === "presentation" || role === "none") && !dom.isFocusable(node)) {
            return false;
          }
          if (node.getAttribute("contenteditable") === "true" || dom.findUp(node, '[contenteditable="true"]')) {
            return true;
          }
          if (role === "grid" || role === "treegrid" || role === "table") {
            return true;
          }
          if (commons.aria.getRoleType(role) === "landmark") {
            return true;
          }
          if (node.getAttribute("datatable") === "0") {
            return false;
          }
          if (node.getAttribute("summary")) {
            return true;
          }
          if (node.tHead || node.tFoot || node.caption) {
            return true;
          }
          for (var childIndex = 0, childLength = node.children.length; childIndex < childLength; childIndex++) {
            if (node.children[childIndex].nodeName === "COLGROUP") {
              return true;
            }
          }
          var cells = 0;
          var rowLength = node.rows.length;
          var row, cell;
          var hasBorder = false;
          for (var rowIndex = 0; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
              cell = row.cells[cellIndex];
              if (!hasBorder && (cell.offsetWidth !== cell.clientWidth || cell.offsetHeight !== cell.clientHeight)) {
                hasBorder = true;
              }
              if (cell.getAttribute("scope") || cell.getAttribute("headers") || cell.getAttribute("abbr")) {
                return true;
              }
              if (cell.nodeName === "TH") {
                return true;
              }
              if (cell.children.length === 1 && cell.children[0].nodeName === "ABBR") {
                return true;
              }
              cells++;
            }
          }
          if (node.getElementsByTagName("table").length) {
            return false;
          }
          if (rowLength < 2) {
            return false;
          }
          var sampleRow = node.rows[Math.ceil(rowLength / 2)];
          if (sampleRow.cells.length === 1 && sampleRow.cells[0].colSpan === 1) {
            return false;
          }
          if (sampleRow.cells.length >= 5) {
            return true;
          }
          if (hasBorder) {
            return true;
          }
          var bgColor, bgImage;
          for (rowIndex = 0; rowIndex < rowLength; rowIndex++) {
            row = node.rows[rowIndex];
            if (bgColor && bgColor !== window.getComputedStyle(row).getPropertyValue("background-color")) {
              return true;
            } else {
              bgColor = window.getComputedStyle(row).getPropertyValue("background-color");
            }
            if (bgImage && bgImage !== window.getComputedStyle(row).getPropertyValue("background-image")) {
              return true;
            } else {
              bgImage = window.getComputedStyle(row).getPropertyValue("background-image");
            }
          }
          if (rowLength >= 20) {
            return true;
          }
          if (dom.getElementCoordinates(node).width > dom.getViewportSize(window).width * .95) {
            return false;
          }
          if (cells < 10) {
            return false;
          }
          if (node.querySelector("object, embed, iframe, applet")) {
            return false;
          }
          return true;
        };
        table.isHeader = function(cell) {
          if (table.isColumnHeader(cell) || table.isRowHeader(cell)) {
            return true;
          }
          if (cell.id) {
            return !!document.querySelector('[headers~="' + utils.escapeSelector(cell.id) + '"]');
          }
          return false;
        };
        table.isRowHeader = function(node) {
          var scope = node.getAttribute("scope");
          if (scope === "row") {
            return true;
          } else {
            if (scope || node.nodeName !== "TH") {
              return false;
            }
          }
          if (table.isColumnHeader(node)) {
            return false;
          }
          var currentCell, position = table.getCellPosition(node), tbl = table.toArray(dom.findUp(node, "table"));
          for (var rowIndex = 0, rowLength = tbl.length; rowIndex < rowLength; rowIndex++) {
            currentCell = tbl[rowIndex][position.x];
            if (currentCell !== node) {
              if (table.isDataCell(currentCell)) {
                return false;
              }
            }
          }
          return true;
        };
        table.toArray = function(node) {
          var table = [];
          var rows = node.rows;
          for (var i = 0, rowLength = rows.length; i < rowLength; i++) {
            var cells = rows[i].cells;
            table[i] = table[i] || [];
            var columnIndex = 0;
            for (var j = 0, cellLength = cells.length; j < cellLength; j++) {
              for (var colSpan = 0; colSpan < cells[j].colSpan; colSpan++) {
                for (var rowSpan = 0; rowSpan < cells[j].rowSpan; rowSpan++) {
                  table[i + rowSpan] = table[i + rowSpan] || [];
                  while (table[i + rowSpan][columnIndex]) {
                    columnIndex++;
                  }
                  table[i + rowSpan][columnIndex] = cells[j];
                }
                columnIndex++;
              }
            }
          }
          return table;
        };
        var defaultButtonValues = {
          submit: "Submit",
          reset: "Reset"
        };
        var inputTypes = [ "text", "search", "tel", "url", "email", "date", "time", "number", "range", "color" ];
        var phrasingElements = [ "a", "em", "strong", "small", "mark", "abbr", "dfn", "i", "b", "s", "u", "code", "var", "samp", "kbd", "sup", "sub", "q", "cite", "span", "bdo", "bdi", "br", "wbr", "ins", "del", "img", "embed", "object", "iframe", "map", "area", "script", "noscript", "ruby", "video", "audio", "input", "textarea", "select", "button", "label", "output", "datalist", "keygen", "progress", "command", "canvas", "time", "meter" ];
        function findLabel(element) {
          var ref = null;
          if (element.id) {
            ref = document.querySelector('label[for="' + utils.escapeSelector(element.id) + '"]');
            if (ref) {
              return ref;
            }
          }
          ref = dom.findUp(element, "label");
          return ref;
        }
        function isButton(element) {
          return [ "button", "reset", "submit" ].indexOf(element.type) !== -1;
        }
        function isInput(element) {
          return element.nodeName === "TEXTAREA" || element.nodeName === "SELECT" || element.nodeName === "INPUT" && element.type !== "hidden";
        }
        function shouldCheckSubtree(element) {
          return [ "BUTTON", "SUMMARY", "A" ].indexOf(element.nodeName) !== -1;
        }
        function shouldNeverCheckSubtree(element) {
          return [ "TABLE", "FIGURE" ].indexOf(element.nodeName) !== -1;
        }
        function formValueText(element) {
          if (element.nodeName === "INPUT") {
            if (!element.hasAttribute("type") || inputTypes.indexOf(element.getAttribute("type")) !== -1 && element.value) {
              return element.value;
            }
            return "";
          }
          if (element.nodeName === "SELECT") {
            var opts = element.options;
            if (opts && opts.length) {
              var returnText = "";
              for (var i = 0; i < opts.length; i++) {
                if (opts[i].selected) {
                  returnText += " " + opts[i].text;
                }
              }
              return text.sanitize(returnText);
            }
            return "";
          }
          if (element.nodeName === "TEXTAREA" && element.value) {
            return element.value;
          }
          return "";
        }
        function checkDescendant(element, nodeName) {
          var candidate = element.querySelector(nodeName);
          if (candidate) {
            return text.accessibleText(candidate);
          }
          return "";
        }
        function isEmbeddedControl(e) {
          if (!e) {
            return false;
          }
          switch (e.nodeName) {
           case "SELECT":
           case "TEXTAREA":
            return true;

           case "INPUT":
            return !e.hasAttribute("type") || inputTypes.indexOf(e.getAttribute("type")) !== -1;

           default:
            return false;
          }
        }
        function shouldCheckAlt(element) {
          return element.nodeName === "INPUT" && element.type === "image" || [ "IMG", "APPLET", "AREA" ].indexOf(element.nodeName) !== -1;
        }
        function nonEmptyText(t) {
          return !!text.sanitize(t);
        }
        text.accessibleText = function(element) {
          function checkNative(element, inLabelledByContext, inControlContext) {
            var returnText = "";
            if (shouldCheckSubtree(element)) {
              returnText = getInnerText(element, false, false) || "";
              if (nonEmptyText(returnText)) {
                return returnText;
              }
            }
            if (element.nodeName === "FIGURE") {
              returnText = checkDescendant(element, "figcaption");
              if (nonEmptyText(returnText)) {
                return returnText;
              }
            }
            if (element.nodeName === "TABLE") {
              returnText = checkDescendant(element, "caption");
              if (nonEmptyText(returnText)) {
                return returnText;
              }
              returnText = element.getAttribute("title") || element.getAttribute("summary") || "";
              if (nonEmptyText(returnText)) {
                return returnText;
              }
            }
            if (shouldCheckAlt(element)) {
              return element.getAttribute("alt") || "";
            }
            if (isInput(element) && !inControlContext) {
              if (isButton(element)) {
                return element.value || element.title || defaultButtonValues[element.type] || "";
              }
              var labelElement = findLabel(element);
              if (labelElement) {
                return accessibleNameComputation(labelElement, inLabelledByContext, true);
              }
            }
            return "";
          }
          function checkARIA(element, inLabelledByContext, inControlContext) {
            if (!inLabelledByContext && element.hasAttribute("aria-labelledby")) {
              return text.sanitize(dom.idrefs(element, "aria-labelledby").map(function(l) {
                if (element === l) {
                  encounteredNodes.pop();
                }
                return accessibleNameComputation(l, true, element !== l);
              }).join(" "));
            }
            if (!(inControlContext && isEmbeddedControl(element)) && element.hasAttribute("aria-label")) {
              return text.sanitize(element.getAttribute("aria-label"));
            }
            return "";
          }
          function getInnerText(element, inLabelledByContext, inControlContext) {
            var nodes = element.childNodes;
            var returnText = "";
            var node;
            for (var i = 0; i < nodes.length; i++) {
              node = nodes[i];
              if (node.nodeType === 3) {
                returnText += node.textContent;
              } else {
                if (node.nodeType === 1) {
                  if (phrasingElements.indexOf(node.nodeName.toLowerCase()) === -1) {
                    returnText += " ";
                  }
                  returnText += accessibleNameComputation(nodes[i], inLabelledByContext, inControlContext);
                }
              }
            }
            return returnText;
          }
          var encounteredNodes = [];
          function accessibleNameComputation(element, inLabelledByContext, inControlContext) {
            "use strict";
            var returnText = "";
            if (element === null || !dom.isVisible(element, true) || encounteredNodes.indexOf(element) !== -1) {
              return "";
            }
            encounteredNodes.push(element);
            var role = element.getAttribute("role");
            returnText += checkARIA(element, inLabelledByContext, inControlContext);
            if (nonEmptyText(returnText)) {
              return returnText;
            }
            returnText = checkNative(element, inLabelledByContext, inControlContext);
            if (nonEmptyText(returnText)) {
              return returnText;
            }
            if (inControlContext) {
              returnText += formValueText(element);
              if (nonEmptyText(returnText)) {
                return returnText;
              }
            }
            if (!shouldNeverCheckSubtree(element) && (!role || aria.getRolesWithNameFromContents().indexOf(role) !== -1)) {
              returnText = getInnerText(element, inLabelledByContext, inControlContext);
              if (nonEmptyText(returnText)) {
                return returnText;
              }
            }
            if (element.hasAttribute("title")) {
              return element.getAttribute("title");
            }
            return "";
          }
          return text.sanitize(accessibleNameComputation(element));
        };
        text.label = function(node) {
          var ref, candidate;
          candidate = aria.label(node);
          if (candidate) {
            return candidate;
          }
          if (node.id) {
            ref = document.querySelector('label[for="' + utils.escapeSelector(node.id) + '"]');
            candidate = ref && text.visible(ref, true);
            if (candidate) {
              return candidate;
            }
          }
          ref = dom.findUp(node, "label");
          candidate = ref && text.visible(ref, true);
          if (candidate) {
            return candidate;
          }
          return null;
        };
        text.sanitize = function(str) {
          "use strict";
          return str.replace(/\r\n/g, "\n").replace(/\u00A0/g, " ").replace(/[\s]{2,}/g, " ").trim();
        };
        text.visible = function(element, screenReader, noRecursing) {
          "use strict";
          var index, child, nodeValue, childNodes = element.childNodes, length = childNodes.length, result = "";
          for (index = 0; index < length; index++) {
            child = childNodes[index];
            if (child.nodeType === 3) {
              nodeValue = child.nodeValue;
              if (nodeValue && dom.isVisible(element, screenReader)) {
                result += child.nodeValue;
              }
            } else {
              if (!noRecursing) {
                result += text.visible(child, screenReader);
              }
            }
          }
          return text.sanitize(result);
        };
        utils.toArray = function(thing) {
          "use strict";
          return Array.prototype.slice.call(thing);
        };
        utils.tokenList = function(str) {
          "use strict";
          return str.trim().replace(/\s{2,}/g, " ").split(" ");
        };
        return commons;
      }()
    });
    axecore.version = "1.1.1";
  }
})(window, window.document);

/*global console, $, axecore, hf*/
$(document).ready(function () {
  'use strict';
  var getCookie =  function (cookieName) {
    var
      i, c, len,
      nameEQ = cookieName + "=",
      cookies = document.cookie.split(';');
    for (i = 0, len = cookies.length; i < len; i = i + 1) {
      c = cookies[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }

    return '';
  };

  if (window.location
        .href.indexOf("www.alaskaair.com/Shopping/Flights") === -1
      && getCookie("!AXECORE").toUpperCase() !== 'DISABLE') {
	axecore.bDebug = true;
    (function (window, document, $) {
      var
        deprecatedA11yDivs
        = $("#duplicateIdaccessibilityViolation, #missing-alt-tags"),
        bSuspend = true,
        MutationObserver,
        myObserver,
        obsConfig,
        nAxeCoreDomUpdated = 0,
        AxeCoreOptions = {},
        targetNodes = $('body > '
                        + ':not(#sessionSection)'
                        + ':not(#homepage-advisory)'
                        + ':not(#sitewide-advisory)'
                        + ':not(#duplicateIdaccessibilityViolation)'
                        + ':not(#missing-alt-tags)'
                        + ':not(.axeclass)'
                        + ':not(#divFormFiller)'
                        + ':not(#iFiller)');


      if (deprecatedA11yDivs.length > 0) {
        deprecatedA11yDivs.remove();
      }

      function removingMenuAcceptableErrors(results) {
        var i = 0, j = 0;
        for (i = 0; i < results.violations.length; i = i + 1) {
          if (results.violations[i].id === 'aria-allowed-attr') {
            for (j = 0; j < results.violations[i].nodes.length; j = j + 1) {
              if (typeof (results.violations[i].nodes[j].html) !== 'undefined'
                  && results.violations[i]
                      .nodes[j].html.indexOf('role="menuitem"')
                  !== -1) {
                results.violations[i].nodes.splice(j, 1);
                j = j - 1;
              }
            }

            if (results.violations[i].nodes.length === 0) {
              results.violations.splice(i, 1);
              i = i - 1;
            }
          } else if (results.violations[i].id === 'color-contrast') {
            for (j = 0; j < results.violations[i].nodes.length; j = j + 1) {
              if (typeof (results.violations[i].nodes[j].html) !== 'undefined'
                  && results.violations[i]
                      .nodes[j].html.indexOf('id="day')
                  !== -1) {
                results.violations[i].nodes.splice(j, 1);
                j = j - 1;
              }
            }

            if (results.violations[i].nodes.length === 0) {
              results.violations.splice(i, 1);
              i = i - 1;
            }
          }
        }
        return results;
      }

      function announceResults(results) {
        var
          i = 0, j = 0,
          axeDiv, axeh, ul, li, ul2, li2, hf;

        hf = document.querySelector('#homepage-advisory')
            || document.querySelector('#sitewide-advisory');
        if (hf) {
          hf.setAttribute("style",
                        "margin-top: "
                        + (80 + (results.violations.length * 15))  + "px;");
        }
        axeDiv = document.createElement("div");
        axeDiv.setAttribute("class", "axeclass");
        axeDiv.setAttribute("style",
                            "position:fixed;"
                            + "top:0;"
                            + "width:100%;"
                            + "z-index:1000;"
                            + "background-color: rgb(255, 100, 255);"
                            + "color: rgb(0, 0, 0);"
                            + "padding-left: 20px;");
        axeh = document.createElement("div");
        axeh.setAttribute("style",
                            "font-weight:bold;"
                            + "margin-top:10px;"
                            + "font-size:16px;");
        axeh.appendChild(
          document
            .createTextNode("A11y violations are found" +
                          " - run Axe extension for detail:")
        );
        axeDiv.appendChild(axeh);
        ul = document.createElement('ul');
        ul.setAttribute("class", "axeclass");
        li = null;
        for (i = 0; i < results.violations.length; i = i + 1) {
          li = document.createElement('li');
          li.setAttribute("class", "axeclass");
          li.setAttribute("style", "font-weight:bold");
          li.appendChild(
            document
               .createTextNode(results.violations[i].description
                  + " in "
                  + results.violations[i].nodes.length
                  + " element"
                  + (results.violations[i].nodes.length > 1 ? 's.' : '.'))
          );

          ul.appendChild(li);
        }
        axeDiv.appendChild(ul);
        document.querySelector('body')
          .insertBefore(axeDiv, document.querySelector('div'));
      }

      function axeCallback(results) {
        var hf;
        if (document.querySelector('div.axeclass')) {
          document.querySelector('body')
            .removeChild(document.querySelector('div.axeclass'));
          hf = document.querySelector('#homepage-advisory')
              || document.querySelector('#sitewide-advisory');
          if (hf) {
            hf.setAttribute("style", "");
          }
        }
        results = removingMenuAcceptableErrors(results);
        if (results.violations.length > 0) {
          announceResults(results);
        }
        bSuspend = true;
      }

      function accessibilityCheck() {
        if(bSuspend) {
          bSuspend = false;
          axecore.a11yCheck(document, AxeCoreOptions, axeCallback);
        }
      }

      function injectAxeIntoIFrames() {
        var
          iframes = document.querySelectorAll('iframe'),
          i = 0,
          script = null;
        for (i = 0; i < iframes.length; i = i + 1) {
          try {
            if (iframes[i].contentWindow.document
                && !iframes[i]
                  .contentWindow
                  .document
                  .querySelector(
                  '[src="https://www.alaskaair.com/javascripts/axe.js"]'
                )
                ) {
              script = iframes[i].contentWindow.document.createElement("script");
              script.type = "text/javascript";
              script.src = "https://www.alaskaair.com/javascripts/axe.js";
              iframes[i].contentWindow.document.body.appendChild(script);

              // Add the iframe to Mutation Observer
              myObserver.observe(iframes[i].contentWindow.document, obsConfig);
            }
          } catch (e) {
          }
        }
      }

      function runAxe(mutationRecords, lastnUpdated) {
        return function () {
          if (lastnUpdated === nAxeCoreDomUpdated) {
            accessibilityCheck();
          }
        };
      }

      function mutationHandler(mutationRecords) {
        var bNeedCheck = false;
        if (mutationRecords.length > 0) {
          if ((typeof (mutationRecords[0].target.getAttribute) === 'function'
                && mutationRecords[0]
                    .target.getAttribute('class') !== 'easybizco')
              &&
              (typeof (mutationRecords[0].target.getAttribute) === 'function'
                && mutationRecords[0]
                    .target.getAttribute('class') !== 'axeclass')
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('class') !==
                  'navbar-greeting-name focus-underline populate-display-name')
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('id')
                  !== 'ShoulderLeftArrow1')
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('class')
                  !== 'module-fd--priceline')
              &&
              (mutationRecords[0].target
			    && (mutationRecords[0].target.getAttribute('id') === null
					|| mutationRecords[0].target.getAttribute('id').match(/legend/gi) === null)
			  )
              &&
              (mutationRecords[0].target
                && mutationRecords[0].target.getAttribute('class')
                  !== 'exit left-exit')
              ) {
            if (mutationRecords.length > 1) {
              if (mutationRecords[1].target
                  &&
                  (typeof (mutationRecords[1].target.getAttribute) === 'function'
                  && mutationRecords[1]
                      .target.getAttribute('class') !== 'cart-count')) {
                bNeedCheck = true;
              } else {
                bNeedCheck = false;
              }
            } else {
              bNeedCheck = true;
            }
          } else {
            bNeedCheck = false;
          }
        }
        if (bNeedCheck) {
          nAxeCoreDomUpdated = nAxeCoreDomUpdated + 1;
          injectAxeIntoIFrames();
          setTimeout(runAxe(mutationRecords, nAxeCoreDomUpdated), 100);
        }
      }

      MutationObserver = window.MutationObserver
        || window.WebKitMutationObserver;

      if(MutationObserver) {
        myObserver = new MutationObserver(mutationHandler);
        obsConfig = {
          childList: true,
          characterData: true,
          attributes: true,
          subtree: true
        };

        injectAxeIntoIFrames();
        setTimeout(accessibilityCheck, 3000);

        targetNodes.each(function () {
          myObserver.observe(this, obsConfig);
        });
      }
    }(window, window.document, $));
  }
});

function jQueryMigrateWarnings(setting) {
    var _setting = {
        defaultEnv : 'dev',
        cookieKey : '!JQueryMigrate',
        turnOffUrl: '//www.alaskaair.com/home/jqmoff',
        wikiUrl: 'http://openwiki.insideaag.com/as.comdeveloperswiki/ow.asp?JqueryMigration',
    };

    _setting = $.extend(_setting, setting);

    this.init = function (environment) {
        //if (_getCookie(_setting.cookieKey) == '' && _setting.defaultEnv == environment) {
        //    _setCookie(_setting.cookieKey, 'true', 1);
        //}

        if (_getCookie(_setting.cookieKey).toLowerCase() !== 'true')
            return;

        if (jQuery && jQuery.migrateWarnings && jQuery.migrateWarnings.length > 0) {
            _announceResults(_skipIgnoredIssues(jQuery.migrateWarnings));
        }
    }

    this.insertScripts = function () {
        if (typeof jQuery.migrateWarnings == 'undefined') {
            var headTag = document.getElementsByTagName("head")[0];
            var jqTag = document.createElement('script');
            jqTag.type = 'text/javascript';
            jqTag.src = '//code.jquery.com/jquery-migrate-1.3.0.js';
            headTag.appendChild(jqTag);
        } 
    }

    function _skipIgnoredIssues(warnings) {
        var a = warnings.slice();
        a.splice($.inArray('jQuery.browser is deprecated', a), 1);
        return a;
    }

    function _announceResults(warnings) {
        if (warnings.length == 0)
            return;

        var ul = document.createElement('ul');
        var li;
        for (var i = 0; i < warnings.length; i = i + 1) {
            var a = document.createElement('a');
            a.setAttribute('href', 'https://github.com/jquery/jquery-migrate/blob/master/warnings.md');
            a.appendChild(document.createTextNode(warnings[i]));

            li = document.createElement('li');
            li.appendChild(a);

            ul.appendChild(li);
        }

        var a1 = document.createElement('a');
        a1.setAttribute('href', _setting.turnOffUrl);
        a1.appendChild(document.createTextNode('(click here to turn off)'));

        var a2 = document.createElement('a');
        a2.setAttribute('href', _setting.wikiUrl);
        a2.appendChild(document.createTextNode(' Example Wiki'));

        var advisoryHeader = document.createElement('div');
        advisoryHeader.setAttribute('style', 'font-weight:bold;margin-top:10px;font-size:16px;');
        advisoryHeader.appendChild(document.createTextNode('jQuery 1.11.3 migrate violations:'));
        advisoryHeader.appendChild(a1);
        advisoryHeader.appendChild(a2);

        var advisoryDiv = document.createElement('div');
        advisoryDiv.setAttribute('style', 'top:0;width:100%;z-index:1000;background-color: #ffffff;padding-left: 20px;');
        advisoryDiv.appendChild(advisoryHeader);
        advisoryDiv.appendChild(ul);
        document.querySelector('body').insertBefore(advisoryDiv, document.querySelector('div'));
    }

    function _getCookie(cookieName) {
        var i, c, len,
          nameEQ = cookieName + '=',
          cookies = document.cookie.split(';');
        for (i = 0, len = cookies.length; i < len; i = i + 1) {
            c = cookies[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }

        return '';
    };

    function _setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? '' : ';domain=' + document.domain + ';path=/; expires=' + exdate.toGMTString());
        document.cookie = c_name + '=' + c_value;
    }
}
