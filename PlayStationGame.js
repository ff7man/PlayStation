var canvElm = document.querySelector("div");
var replacement = document.createElement("canvas");
var shadow = canvElm.attachShadow({
    mode: "open"
});
shadow.appendChild(replacement);
canvElm = replacement;
const styleNode = document.createElement("style");
const styleText = "canvas{width:100%;height:100%;position:fixed;left:0;right:0;bottom:0;top:0;z-index:-1}";
const styleTextNode = document.createTextNode(styleText);
styleNode.appendChild(styleTextNode);
shadow.appendChild(styleNode);
var WASMpsx = {}, do_iter = !0, Module = {
    preRun: [],
    postRun: [],
    print: function(e) {
        arguments.length > 1 && (e = Array.prototype.slice.call(arguments).join(" "));
        if (e.includes('.') && e.includes('loaded')) {}
    },
    printErr: function(e) {
        arguments.length > 1 && (e = Array.prototype.slice.call(arguments).join(" ")),
        console.error(e)
    },
    canvas: function() {
        var e = canvElm;
        return e.addEventListener("webglcontextlost", function(e) {
            alert("WebGL context lost. You will need to reload the page."),
            e.preventDefault()
        }, !1),
        e
    }(),
    goFullscreen: function() {
        var e = Module.canvas;
        if (Browser.isFullscreen)
            return e.exitFullscreen();
        function t() {
            Browser.isFullscreen = !1;
            var t = e.parentNode;
            (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === t ? (e.exitFullscreen = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || function() {}
            ,
            e.exitFullscreen = e.exitFullscreen.bind(document),
            Browser.lockPointer && e.requestPointerLock(),
            Browser.isFullscreen = !0,
            Browser.resizeCanvas && Browser.setFullscreenCanvasSize()) : Browser.resizeCanvas && Browser.setWindowedCanvasSize(),
            Module.onFullScreen && Module.onFullScreen(Browser.isFullscreen),
            Module.onFullscreen && Module.onFullscreen(Browser.isFullscreen),
            Browser.updateCanvasDimensions(e)
        }
        Browser.lockPointer = !1,
        Browser.resizeCanvas = !1,
        Browser.vrDevice = null,
        Browser.fullscreenHandlersInstalled || (Browser.fullscreenHandlersInstalled = !0,
        document.addEventListener("fullscreenchange", t, !1),
        document.addEventListener("mozfullscreenchange", t, !1),
        document.addEventListener("webkitfullscreenchange", t, !1),
        document.addEventListener("MSFullscreenChange", t, !1));
        var n = e.parentNode;
        n.requestFullscreen = n.requestFullscreen || n.mozRequestFullScreen || n.msRequestFullscreen || (n.webkitRequestFullscreen ? function() {
            n.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        : null) || (n.webkitRequestFullScreen ? function() {
            n.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        : null),
        n.requestFullscreen()
    },
    setStatus: function(e) {
        if (Module.setStatus.last || (Module.setStatus.last = {
            time: Date.now(),
            text: ""
        }),
        e !== Module.setStatus.text) {
            e.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/),
            Date.now();
        }
    },
    totalDependencies: 0,
    monitorRunDependencies: function(e) {
        this.totalDependencies = Math.max(this.totalDependencies, e),
        Module.setStatus(e ? "Preparing... (" + (this.totalDependencies - e) + "/" + this.totalDependencies + ")" : "All downloads complete.")
    }
}, img_data32, padStatus1, padStatus2, vram_ptr;
function my_SDL_LockSurface(e) {
    var t = SDL.surfaces[e];
    return t.locked++,
    t.locked > 1 ? 0 : (t.buffer || (t.buffer = _malloc(t.width * t.height * 4),
    cout_print("malloc " + t.buffer + "\n"),
    HEAP32[e + 20 >> 2] = t.buffer),
    HEAP32[e + 20 >> 2] = t.buffer,
    t.image || (t.image = t.ctx.getImageData(0, 0, t.width, t.height)),
    0)
}
function my_SDL_UnlockSurface(e) {
    assert(!SDL.GL);
    var t = SDL.surfaces[e];
    if (t.locked && !(--t.locked > 0)) {
        var n = t.image.data
          , r = t.buffer >> 2;
        img_data32 || (img_data32 = new Uint32Array(n.buffer)),
        img_data32.set(HEAP32.subarray(r, r + img_data32.length)),
        t.ctx.putImageData(t.image, 0, 0)
    }
}
window.onerror = function(e) {
    Module.setStatus("Exception thrown, " + String(e)),
    Module.setStatus = function(e) {
        e && Module.printErr("[post-exception status] " + e)
    }
}
;
var cout_print = Module.print, pcsx_worker, SoundFeedStreamData;
function var_setup() {
    SoundFeedStreamData = Module.cwrap("SoundFeedStreamData", "null", ["number", "number"]),
    vram_ptr = _get_ptr(0),
    padStatus1 = _get_ptr(1),
    padStatus2 = _get_ptr(2),
    SDL.defaults.copyOnLock = !1,
    SDL.defaults.opaqueFrontBuffer = !1,
    cout_print("start worker"),
    (pcsx_worker = new Worker("PlayStationGameWorker.js")).onmessage = pcsx_worker_onmessage,
    setTimeout(undefined, 2)
}
window.File && window.FileReader && window.FileList && window.Blob || (alert("The File APIs are not fully supported in this browser."),
cout_print("The File APIs are not fully supported in this browser."));
var states_arrs = [], check_controller = function() {
    _CheckJoy(),
    _CheckKeyboard();
    for (var e, t = Module.HEAPU8.subarray(padStatus1, padStatus1 + 48); states_arrs.length > 50; )
        states_arrs.pop();
    states_arrs.length > 0 ? (e = states_arrs.pop()).set(t) : e = new Uint8Array(t),
    pcsx_worker.postMessage({
        cmd: "padStatus",
        states: e
    }, [e.buffer]),
    setTimeout("check_controller()", 10)
}, file_list, pcsx_readfile = function(e) {
    cout_print("pcsx_readfile\n"),
    file_list = e.files,
    pcsx_worker.postMessage({
        cmd: "loadfile",
        file: e.files[0]
    }),
    setTimeout("check_controller()", 10)
}, Module;
function pcsx_worker_onmessage(e) {
    var t = e.data;
    switch (t.cmd) {
    case "print":
        cout_print("> " + t.txt);
        break;
    case "setStatus":
        undefined,
        Module.setStatus(t.txt);
        break;
    case "setUI":
        break;
    case "render":
        var n = t.vram;
        Module.HEAPU8.set(n, vram_ptr),
        pcsx_worker.postMessage({
            cmd: "return_vram",
            vram: n
        }, [n.buffer]),
        _render(t.x, t.y, t.sx, t.sy, t.dx, t.dy, t.rgb24);
        break;
    case "return_states":
        states_arrs.push(t.states);
        break;
    case "SoundFeedStreamData":
        var r = t.pSound
          , o = Module._malloc(r.length);
        Module.HEAPU8.set(r, o),
        SoundFeedStreamData(o, t.lBytes),
        Module._free(o);
        break;
    default:
        cout_print("unknown worker cmd " + t.cmd)
    }
}
Module || (Module = (void 0 !== Module ? Module : null) || {});
var moduleOverrides = {};
for (var key in Module)
    Module.hasOwnProperty(key) && (moduleOverrides[key] = Module[key]);
var ENVIRONMENT_IS_WEB = !1, ENVIRONMENT_IS_WORKER = !1, ENVIRONMENT_IS_NODE = !1, ENVIRONMENT_IS_SHELL = !1, nodeFS, nodePath;
if (Module.ENVIRONMENT)
    if ("WEB" === Module.ENVIRONMENT)
        ENVIRONMENT_IS_WEB = !0;
    else if ("WORKER" === Module.ENVIRONMENT)
        ENVIRONMENT_IS_WORKER = !0;
    else if ("NODE" === Module.ENVIRONMENT)
        ENVIRONMENT_IS_NODE = !0;
    else {
        if ("SHELL" !== Module.ENVIRONMENT)
            throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
        ENVIRONMENT_IS_SHELL = !0
    }
else
    ENVIRONMENT_IS_WEB = "object" == typeof window,
    ENVIRONMENT_IS_WORKER = "function" == typeof importScripts,
    ENVIRONMENT_IS_NODE = "object" == typeof process && "function" == typeof require && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER,
    ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE)
    Module.print || (Module.print = console.log),
    Module.printErr || (Module.printErr = console.warn),
    Module.read = function(e, t) {
        nodeFS || (nodeFS = require("fs")),
        nodePath || (nodePath = require("path")),
        e = nodePath.normalize(e);
        var n = nodeFS.readFileSync(e);
        return t ? n : n.toString()
    }
    ,
    Module.readBinary = function(e) {
        var t = Module.read(e, !0);
        return t.buffer || (t = new Uint8Array(t)),
        assert(t.buffer),
        t
    }
    ,
    Module.load = function(e) {
        globalEval(read(e))
    }
    ,
    Module.thisProgram || (process.argv.length > 1 ? Module.thisProgram = process.argv[1].replace(/\\/g, "/") : Module.thisProgram = "unknown-program"),
    Module.arguments = process.argv.slice(2),
    "undefined" != typeof module && (module.exports = Module),
    process.on("uncaughtException", function(e) {
        if (!(e instanceof ExitStatus))
            throw e
    }),
    Module.inspect = function() {
        return "[Emscripten Module object]"
    }
    ;
else if (ENVIRONMENT_IS_SHELL)
    Module.print || (Module.print = print),
    "undefined" != typeof printErr && (Module.printErr = printErr),
    "undefined" != typeof read ? Module.read = read : Module.read = function() {
        throw "no read() available"
    }
    ,
    Module.readBinary = function(e) {
        if ("function" == typeof readbuffer)
            return new Uint8Array(readbuffer(e));
        var t = read(e, "binary");
        return assert("object" == typeof t),
        t
    }
    ,
    "undefined" != typeof scriptArgs ? Module.arguments = scriptArgs : "undefined" != typeof arguments && (Module.arguments = arguments),
    "function" == typeof quit && (Module.quit = function(e, t) {
        quit(e)
    }
    );
else {
    if (!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER)
        throw "Unknown runtime environment. Where are we?";
    if (Module.read = function(e) {
        var t = new XMLHttpRequest;
        return t.open("GET", e, !1),
        t.send(null),
        t.responseText
    }
    ,
    ENVIRONMENT_IS_WORKER && (Module.readBinary = function(e) {
        var t = new XMLHttpRequest;
        return t.open("GET", e, !1),
        t.responseType = "arraybuffer",
        t.send(null),
        new Uint8Array(t.response)
    }
    ),
    Module.readAsync = function(e, t, n) {
        var r = new XMLHttpRequest;
        r.open("GET", e, !0),
        r.responseType = "arraybuffer",
        r.onload = function() {
            200 == r.status || 0 == r.status && r.response ? t(r.response) : n()
        }
        ,
        r.onerror = n,
        r.send(null)
    }
    ,
    "undefined" != typeof arguments && (Module.arguments = arguments),
    "undefined" != typeof console)
        Module.print || (Module.print = function(e) {
            console.log(e)
        }
        ),
        Module.printErr || (Module.printErr = function(e) {
            console.warn(e)
        }
        );
    else {
        var TRY_USE_DUMP = !1;
        Module.print || (Module.print = TRY_USE_DUMP && "undefined" != typeof dump ? function(e) {
            dump(e)
        }
        : function(e) {}
        )
    }
    ENVIRONMENT_IS_WORKER && (Module.load = importScripts),
    void 0 === Module.setWindowTitle && (Module.setWindowTitle = function(e) {
        document.title = e
    }
    )
}
function globalEval(e) {
    eval.call(null, e)
}
for (var key in !Module.load && Module.read && (Module.load = function(e) {
    globalEval(Module.read(e))
}
),
Module.print || (Module.print = function() {}
),
Module.printErr || (Module.printErr = Module.print),
Module.arguments || (Module.arguments = []),
Module.thisProgram || (Module.thisProgram = "./this.program"),
Module.quit || (Module.quit = function(e, t) {
    throw t
}
),
Module.print = Module.print,
Module.printErr = Module.printErr,
Module.preRun = [],
Module.postRun = [],
moduleOverrides)
    moduleOverrides.hasOwnProperty(key) && (Module[key] = moduleOverrides[key]);
moduleOverrides = void 0;
var Runtime = {
    setTempRet0: function(e) {
        return tempRet0 = e,
        e
    },
    getTempRet0: function() {
        return tempRet0
    },
    stackSave: function() {
        return STACKTOP
    },
    stackRestore: function(e) {
        STACKTOP = e
    },
    getNativeTypeSize: function(e) {
        switch (e) {
        case "i1":
        case "i8":
            return 1;
        case "i16":
            return 2;
        case "i32":
            return 4;
        case "i64":
            return 8;
        case "float":
            return 4;
        case "double":
            return 8;
        default:
            if ("*" === e[e.length - 1])
                return Runtime.QUANTUM_SIZE;
            if ("i" === e[0]) {
                var t = parseInt(e.substr(1));
                return assert(t % 8 == 0),
                t / 8
            }
            return 0
        }
    },
    getNativeFieldSize: function(e) {
        return Math.max(Runtime.getNativeTypeSize(e), Runtime.QUANTUM_SIZE)
    },
    STACK_ALIGN: 16,
    prepVararg: function(e, t) {
        return "double" === t || "i64" === t ? 7 & e && (assert(4 == (7 & e)),
        e += 4) : assert(0 == (3 & e)),
        e
    },
    getAlignSize: function(e, t, n) {
        return n || "i64" != e && "double" != e ? e ? Math.min(t || (e ? Runtime.getNativeFieldSize(e) : 0), Runtime.QUANTUM_SIZE) : Math.min(t, 8) : 8
    },
    dynCall: function(e, t, n) {
        return n && n.length ? Module["dynCall_" + e].apply(null, [t].concat(n)) : Module["dynCall_" + e].call(null, t)
    },
    functionPointers: [],
    addFunction: function(e) {
        for (var t = 0; t < Runtime.functionPointers.length; t++)
            if (!Runtime.functionPointers[t])
                return Runtime.functionPointers[t] = e,
                2 * (1 + t);
        throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."
    },
    removeFunction: function(e) {
        Runtime.functionPointers[(e - 2) / 2] = null
    },
    warnOnce: function(e) {
        Runtime.warnOnce.shown || (Runtime.warnOnce.shown = {}),
        Runtime.warnOnce.shown[e] || (Runtime.warnOnce.shown[e] = 1,
        Module.printErr(e))
    },
    funcWrappers: {},
    getFuncWrapper: function(e, t) {
        assert(t),
        Runtime.funcWrappers[t] || (Runtime.funcWrappers[t] = {});
        var n = Runtime.funcWrappers[t];
        return n[e] || (1 === t.length ? n[e] = function() {
            return Runtime.dynCall(t, e)
        }
        : 2 === t.length ? n[e] = function(n) {
            return Runtime.dynCall(t, e, [n])
        }
        : n[e] = function() {
            return Runtime.dynCall(t, e, Array.prototype.slice.call(arguments))
        }
        ),
        n[e]
    },
    getCompilerSetting: function(e) {
        throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"
    },
    stackAlloc: function(e) {
        var t = STACKTOP;
        return STACKTOP = (STACKTOP = STACKTOP + e | 0) + 15 & -16,
        t
    },
    staticAlloc: function(e) {
        var t = STATICTOP;
        return STATICTOP = (STATICTOP = STATICTOP + e | 0) + 15 & -16,
        t
    },
    dynamicAlloc: function(e) {
        var t = HEAP32[DYNAMICTOP_PTR >> 2]
          , n = -16 & (t + e + 15 | 0);
        if ((HEAP32[DYNAMICTOP_PTR >> 2] = n,
        n >= TOTAL_MEMORY) && !enlargeMemory())
            return HEAP32[DYNAMICTOP_PTR >> 2] = t,
            0;
        return t
    },
    alignMemory: function(e, t) {
        return e = Math.ceil(e / (t || 16)) * (t || 16)
    },
    makeBigInt: function(e, t, n) {
        return n ? +(e >>> 0) + 4294967296 * +(t >>> 0) : +(e >>> 0) + 4294967296 * +(0 | t)
    },
    GLOBAL_BASE: 1024,
    QUANTUM_SIZE: 4,
    __dummy__: 0
};
Module.Runtime = Runtime;
var ABORT = 0, EXITSTATUS = 0, cwrap, ccall;
function assert(e, t) {
    e || abort("Assertion failed: " + t)
}
function getCFunc(ident) {
    var func = Module["_" + ident];
    if (!func)
        try {
            func = eval("_" + ident)
        } catch (e) {}
    return assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)"),
    func
}
function setValue(e, t, n, r) {
    switch ("*" === (n = n || "i8").charAt(n.length - 1) && (n = "i32"),
    n) {
    case "i1":
    case "i8":
        HEAP8[e >> 0] = t;
        break;
    case "i16":
        HEAP16[e >> 1] = t;
        break;
    case "i32":
        HEAP32[e >> 2] = t;
        break;
    case "i64":
        tempI64 = [t >>> 0, (tempDouble = t,
        +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
        HEAP32[e >> 2] = tempI64[0],
        HEAP32[e + 4 >> 2] = tempI64[1];
        break;
    case "float":
        HEAPF32[e >> 2] = t;
        break;
    case "double":
        HEAPF64[e >> 3] = t;
        break;
    default:
        abort("invalid type for setValue: " + n)
    }
}
function getValue(e, t, n) {
    switch ("*" === (t = t || "i8").charAt(t.length - 1) && (t = "i32"),
    t) {
    case "i1":
    case "i8":
        return HEAP8[e >> 0];
    case "i16":
        return HEAP16[e >> 1];
    case "i32":
    case "i64":
        return HEAP32[e >> 2];
    case "float":
        return HEAPF32[e >> 2];
    case "double":
        return HEAPF64[e >> 3];
    default:
        abort("invalid type for setValue: " + t)
    }
    return null
}
!function() {
    var JSfuncs = {
        stackSave: function() {
            Runtime.stackSave()
        },
        stackRestore: function() {
            Runtime.stackRestore()
        },
        arrayToC: function(e) {
            var t = Runtime.stackAlloc(e.length);
            return writeArrayToMemory(e, t),
            t
        },
        stringToC: function(e) {
            var t = 0;
            if (null != e && 0 !== e) {
                var n = 1 + (e.length << 2);
                stringToUTF8(e, t = Runtime.stackAlloc(n), n)
            }
            return t
        }
    }
      , toC = {
        string: JSfuncs.stringToC,
        array: JSfuncs.arrayToC
    };
    ccall = function(e, t, n, r, o) {
        var i = getCFunc(e)
          , a = []
          , s = 0;
        if (r)
            for (var u = 0; u < r.length; u++) {
                var l = toC[n[u]];
                l ? (0 === s && (s = Runtime.stackSave()),
                a[u] = l(r[u])) : a[u] = r[u]
            }
        var c = i.apply(null, a);
        if ("string" === t && (c = Pointer_stringify(c)),
        0 !== s) {
            if (o && o.async)
                return void EmterpreterAsync.asyncFinalizers.push(function() {
                    Runtime.stackRestore(s)
                });
            Runtime.stackRestore(s)
        }
        return c
    }
    ;
    var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
    function parseJSFunc(e) {
        var t = e.toString().match(sourceRegex).slice(1);
        return {
            arguments: t[0],
            body: t[1],
            returnValue: t[2]
        }
    }
    var JSsource = null;
    function ensureJSsource() {
        if (!JSsource)
            for (var e in JSsource = {},
            JSfuncs)
                JSfuncs.hasOwnProperty(e) && (JSsource[e] = parseJSFunc(JSfuncs[e]))
    }
    cwrap = function cwrap(ident, returnType, argTypes) {
        argTypes = argTypes || [];
        var cfunc = getCFunc(ident)
          , numericArgs = argTypes.every(function(e) {
            return "number" === e
        })
          , numericRet = "string" !== returnType;
        if (numericRet && numericArgs)
            return cfunc;
        var argNames = argTypes.map(function(e, t) {
            return "$" + t
        })
          , funcstr = "(function(" + argNames.join(",") + ") {"
          , nargs = argTypes.length;
        if (!numericArgs) {
            ensureJSsource(),
            funcstr += "var stack = " + JSsource.stackSave.body + ";";
            for (var i = 0; i < nargs; i++) {
                var arg = argNames[i]
                  , type = argTypes[i];
                if ("number" !== type) {
                    var convertCode = JSsource[type + "ToC"];
                    funcstr += "var " + convertCode.arguments + " = " + arg + ";",
                    funcstr += convertCode.body + ";",
                    funcstr += arg + "=(" + convertCode.returnValue + ");"
                }
            }
        }
        var cfuncname = parseJSFunc(function() {
            return cfunc
        }).returnValue;
        if (funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");",
        !numericRet) {
            var strgfy = parseJSFunc(function() {
                return Pointer_stringify
            }).returnValue;
            funcstr += "ret = " + strgfy + "(ret);"
        }
        return numericArgs || (ensureJSsource(),
        funcstr += JSsource.stackRestore.body.replace("()", "(stack)") + ";"),
        funcstr += "return ret})",
        eval(funcstr)
    }
}(),
Module.ccall = ccall,
Module.cwrap = cwrap,
Module.setValue = setValue,
Module.getValue = getValue;
var ALLOC_NORMAL = 0
  , ALLOC_STACK = 1
  , ALLOC_STATIC = 2
  , ALLOC_DYNAMIC = 3
  , ALLOC_NONE = 4;
function allocate(e, t, n, r) {
    var o, i;
    "number" == typeof e ? (o = !0,
    i = e) : (o = !1,
    i = e.length);
    var a, s = "string" == typeof t ? t : null;
    if (a = n == ALLOC_NONE ? r : ["function" == typeof _malloc ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][void 0 === n ? ALLOC_STATIC : n](Math.max(i, s ? 1 : t.length)),
    o) {
        var u;
        r = a;
        for (assert(0 == (3 & a)),
        u = a + (-4 & i); r < u; r += 4)
            HEAP32[r >> 2] = 0;
        for (u = a + i; r < u; )
            HEAP8[r++ >> 0] = 0;
        return a
    }
    if ("i8" === s)
        return e.subarray || e.slice ? HEAPU8.set(e, a) : HEAPU8.set(new Uint8Array(e), a),
        a;
    for (var l, c, d, f = 0; f < i; ) {
        var S = e[f];
        "function" == typeof S && (S = Runtime.getFunctionIndex(S)),
        0 !== (l = s || t[f]) ? ("i64" == l && (l = "i32"),
        setValue(a + f, S, l),
        d !== l && (c = Runtime.getNativeTypeSize(l),
        d = l),
        f += c) : f++
    }
    return a
}
function getMemory(e) {
    return staticSealed ? runtimeInitialized ? _malloc(e) : Runtime.dynamicAlloc(e) : Runtime.staticAlloc(e)
}
function Pointer_stringify(e, t) {
    if (0 === t || !e)
        return "";
    for (var n, r = 0, o = 0; r |= n = HEAPU8[e + o >> 0],
    (0 != n || t) && (o++,
    !t || o != t); )
        ;
    t || (t = o);
    var i = "";
    if (r < 128) {
        for (var a; t > 0; )
            a = String.fromCharCode.apply(String, HEAPU8.subarray(e, e + Math.min(t, 1024))),
            i = i ? i + a : a,
            e += 1024,
            t -= 1024;
        return i
    }
    return Module.UTF8ToString(e)
}
function AsciiToString(e) {
    for (var t = ""; ; ) {
        var n = HEAP8[e++ >> 0];
        if (!n)
            return t;
        t += String.fromCharCode(n)
    }
}
function stringToAscii(e, t) {
    return writeAsciiToMemory(e, t, !1)
}
Module.ALLOC_NORMAL = ALLOC_NORMAL,
Module.ALLOC_STACK = ALLOC_STACK,
Module.ALLOC_STATIC = ALLOC_STATIC,
Module.ALLOC_DYNAMIC = ALLOC_DYNAMIC,
Module.ALLOC_NONE = ALLOC_NONE,
Module.allocate = allocate,
Module.getMemory = getMemory,
Module.Pointer_stringify = Pointer_stringify,
Module.AsciiToString = AsciiToString,
Module.stringToAscii = stringToAscii;
var UTF8Decoder = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function UTF8ArrayToString(e, t) {
    for (var n = t; e[n]; )
        ++n;
    if (n - t > 16 && e.subarray && UTF8Decoder)
        return UTF8Decoder.decode(e.subarray(t, n));
    for (var r, o, i, a, s, u = ""; ; ) {
        if (!(r = e[t++]))
            return u;
        if (128 & r)
            if (o = 63 & e[t++],
            192 != (224 & r))
                if (i = 63 & e[t++],
                224 == (240 & r) ? r = (15 & r) << 12 | o << 6 | i : (a = 63 & e[t++],
                240 == (248 & r) ? r = (7 & r) << 18 | o << 12 | i << 6 | a : (s = 63 & e[t++],
                r = 248 == (252 & r) ? (3 & r) << 24 | o << 18 | i << 12 | a << 6 | s : (1 & r) << 30 | o << 24 | i << 18 | a << 12 | s << 6 | 63 & e[t++])),
                r < 65536)
                    u += String.fromCharCode(r);
                else {
                    var l = r - 65536;
                    u += String.fromCharCode(55296 | l >> 10, 56320 | 1023 & l)
                }
            else
                u += String.fromCharCode((31 & r) << 6 | o);
        else
            u += String.fromCharCode(r)
    }
}
function UTF8ToString(e) {
    return UTF8ArrayToString(HEAPU8, e)
}
function stringToUTF8Array(e, t, n, r) {
    if (!(r > 0))
        return 0;
    for (var o = n, i = n + r - 1, a = 0; a < e.length; ++a) {
        var s = e.charCodeAt(a);
        if (s >= 55296 && s <= 57343 && (s = 65536 + ((1023 & s) << 10) | 1023 & e.charCodeAt(++a)),
        s <= 127) {
            if (n >= i)
                break;
            t[n++] = s
        } else if (s <= 2047) {
            if (n + 1 >= i)
                break;
            t[n++] = 192 | s >> 6,
            t[n++] = 128 | 63 & s
        } else if (s <= 65535) {
            if (n + 2 >= i)
                break;
            t[n++] = 224 | s >> 12,
            t[n++] = 128 | s >> 6 & 63,
            t[n++] = 128 | 63 & s
        } else if (s <= 2097151) {
            if (n + 3 >= i)
                break;
            t[n++] = 240 | s >> 18,
            t[n++] = 128 | s >> 12 & 63,
            t[n++] = 128 | s >> 6 & 63,
            t[n++] = 128 | 63 & s
        } else if (s <= 67108863) {
            if (n + 4 >= i)
                break;
            t[n++] = 248 | s >> 24,
            t[n++] = 128 | s >> 18 & 63,
            t[n++] = 128 | s >> 12 & 63,
            t[n++] = 128 | s >> 6 & 63,
            t[n++] = 128 | 63 & s
        } else {
            if (n + 5 >= i)
                break;
            t[n++] = 252 | s >> 30,
            t[n++] = 128 | s >> 24 & 63,
            t[n++] = 128 | s >> 18 & 63,
            t[n++] = 128 | s >> 12 & 63,
            t[n++] = 128 | s >> 6 & 63,
            t[n++] = 128 | 63 & s
        }
    }
    return t[n] = 0,
    n - o
}
function stringToUTF8(e, t, n) {
    return stringToUTF8Array(e, HEAPU8, t, n)
}
function lengthBytesUTF8(e) {
    for (var t = 0, n = 0; n < e.length; ++n) {
        var r = e.charCodeAt(n);
        r >= 55296 && r <= 57343 && (r = 65536 + ((1023 & r) << 10) | 1023 & e.charCodeAt(++n)),
        r <= 127 ? ++t : t += r <= 2047 ? 2 : r <= 65535 ? 3 : r <= 2097151 ? 4 : r <= 67108863 ? 5 : 6
    }
    return t
}
Module.UTF8ArrayToString = UTF8ArrayToString,
Module.UTF8ToString = UTF8ToString,
Module.stringToUTF8Array = stringToUTF8Array,
Module.stringToUTF8 = stringToUTF8,
Module.lengthBytesUTF8 = lengthBytesUTF8;
var UTF16Decoder = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;
function demangle(e) {
    var t = Module.___cxa_demangle || Module.__cxa_demangle;
    if (t) {
        try {
            var n = e.substr(1)
              , r = lengthBytesUTF8(n) + 1
              , o = _malloc(r);
            stringToUTF8(n, o, r);
            var i = _malloc(4)
              , a = t(o, 0, 0, i);
            if (0 === getValue(i, "i32") && a)
                return Pointer_stringify(a)
        } catch (e) {} finally {
            o && _free(o),
            i && _free(i),
            a && _free(a)
        }
        return e
    }
    return Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling"),
    e
}
function demangleAll(e) {
    return e.replace(/__Z[\w\d_]+/g, function(e) {
        var t = demangle(e);
        return e === t ? e : e + " [" + t + "]"
    })
}
function jsStackTrace() {
    var e = new Error;
    if (!e.stack) {
        try {
            throw new Error(0)
        } catch (t) {
            e = t
        }
        if (!e.stack)
            return "(no stack trace available)"
    }
    return e.stack.toString()
}
function stackTrace() {
    var e = jsStackTrace();
    return Module.extraStackTrace && (e += "\n" + Module.extraStackTrace()),
    demangleAll(e)
}
Module.stackTrace = stackTrace;
var WASM_PAGE_SIZE = 65536, ASMJS_PAGE_SIZE = 16777216, HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64, STATIC_BASE, STATICTOP, staticSealed, STACK_BASE, STACKTOP, STACK_MAX, DYNAMIC_BASE, DYNAMICTOP_PTR;
function alignUp(e, t) {
    return e % t > 0 && (e += t - e % t),
    e
}
function updateGlobalBuffer(e) {
    Module.buffer = buffer = e
}
function updateGlobalBufferViews() {
    Module.HEAP8 = HEAP8 = new Int8Array(buffer),
    Module.HEAP16 = HEAP16 = new Int16Array(buffer),
    Module.HEAP32 = HEAP32 = new Int32Array(buffer),
    Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer),
    Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer),
    Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer),
    Module.HEAPF32 = HEAPF32 = new Float32Array(buffer),
    Module.HEAPF64 = HEAPF64 = new Float64Array(buffer)
}
function abortOnCannotGrowMemory() {
    abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}
function enlargeMemory() {
    abortOnCannotGrowMemory()
}
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0,
staticSealed = !1;
var TOTAL_STACK = Module.TOTAL_STACK || 5242880
  , TOTAL_MEMORY = Module.TOTAL_MEMORY || 16777216;
function getTotalMemory() {
    return TOTAL_MEMORY
}
if (TOTAL_MEMORY < TOTAL_STACK && Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")"),
Module.buffer ? buffer = Module.buffer : "object" == typeof WebAssembly && "function" == typeof WebAssembly.Memory ? (Module.wasmMemory = new WebAssembly.Memory({
    initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
    maximum: TOTAL_MEMORY / WASM_PAGE_SIZE
}),
buffer = Module.wasmMemory.buffer) : buffer = new ArrayBuffer(TOTAL_MEMORY),
updateGlobalBufferViews(),
HEAP32[0] = 1668509029,
HEAP16[1] = 25459,
115 !== HEAPU8[2] || 99 !== HEAPU8[3])
    throw "Runtime error: expected the system to be little-endian!";
function callRuntimeCallbacks(e) {
    for (; e.length > 0; ) {
        var t = e.shift();
        if ("function" != typeof t) {
            var n = t.func;
            "number" == typeof n ? void 0 === t.arg ? Module.dynCall_v(n) : Module.dynCall_vi(n, t.arg) : n(void 0 === t.arg ? null : t.arg)
        } else
            t()
    }
}
Module.HEAP = HEAP,
Module.buffer = buffer,
Module.HEAP8 = HEAP8,
Module.HEAP16 = HEAP16,
Module.HEAP32 = HEAP32,
Module.HEAPU8 = HEAPU8,
Module.HEAPU16 = HEAPU16,
Module.HEAPU32 = HEAPU32,
Module.HEAPF32 = HEAPF32,
Module.HEAPF64 = HEAPF64;
var __ATPRERUN__ = []
  , __ATINIT__ = []
  , __ATMAIN__ = []
  , __ATEXIT__ = []
  , __ATPOSTRUN__ = []
  , runtimeInitialized = !1
  , runtimeExited = !1;
function preRun() {
    if (Module.preRun)
        for ("function" == typeof Module.preRun && (Module.preRun = [Module.preRun]); Module.preRun.length; )
            addOnPreRun(Module.preRun.shift());
    callRuntimeCallbacks(__ATPRERUN__)
}
function ensureInitRuntime() {
    runtimeInitialized || (runtimeInitialized = !0,
    callRuntimeCallbacks(__ATINIT__))
}
function preMain() {
    callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
    callRuntimeCallbacks(__ATEXIT__),
    runtimeExited = !0
}
function postRun() {
    if (Module.postRun)
        for ("function" == typeof Module.postRun && (Module.postRun = [Module.postRun]); Module.postRun.length; )
            addOnPostRun(Module.postRun.shift());
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(e) {
    __ATPRERUN__.unshift(e)
}
function addOnInit(e) {
    __ATINIT__.unshift(e)
}
function addOnPreMain(e) {
    __ATMAIN__.unshift(e)
}
function addOnExit(e) {
    __ATEXIT__.unshift(e)
}
function addOnPostRun(e) {
    __ATPOSTRUN__.unshift(e)
}
function intArrayFromString(e, t, n) {
    var r = n > 0 ? n : lengthBytesUTF8(e) + 1
      , o = new Array(r)
      , i = stringToUTF8Array(e, o, 0, o.length);
    return t && (o.length = i),
    o
}
function intArrayToString(e) {
    for (var t = [], n = 0; n < e.length; n++) {
        var r = e[n];
        r > 255 && (r &= 255),
        t.push(String.fromCharCode(r))
    }
    return t.join("")
}
function writeStringToMemory(e, t, n) {
    var r, o;
    Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!"),
    n && (o = t + lengthBytesUTF8(e),
    r = HEAP8[o]),
    stringToUTF8(e, t, 1 / 0),
    n && (HEAP8[o] = r)
}
function writeArrayToMemory(e, t) {
    HEAP8.set(e, t)
}
function writeAsciiToMemory(e, t, n) {
    for (var r = 0; r < e.length; ++r)
        HEAP8[t++ >> 0] = e.charCodeAt(r);
    n || (HEAP8[t >> 0] = 0)
}
if (Module.addOnPreRun = addOnPreRun,
Module.addOnInit = addOnInit,
Module.addOnPreMain = addOnPreMain,
Module.addOnExit = addOnExit,
Module.addOnPostRun = addOnPostRun,
Module.intArrayFromString = intArrayFromString,
Module.intArrayToString = intArrayToString,
Module.writeStringToMemory = writeStringToMemory,
Module.writeArrayToMemory = writeArrayToMemory,
Module.writeAsciiToMemory = writeAsciiToMemory,
Math.imul && -5 === Math.imul(4294967295, 5) || (Math.imul = function(e, t) {
    var n = 65535 & e
      , r = 65535 & t;
    return n * r + ((e >>> 16) * r + n * (t >>> 16) << 16) | 0
}
),
Math.imul = Math.imul,
!Math.fround) {
    var froundBuffer = new Float32Array(1);
    Math.fround = function(e) {
        return froundBuffer[0] = e,
        froundBuffer[0]
    }
}
Math.fround = Math.fround,
Math.clz32 || (Math.clz32 = function(e) {
    e >>>= 0;
    for (var t = 0; t < 32; t++)
        if (e & 1 << 31 - t)
            return t;
    return 32
}
),
Math.clz32 = Math.clz32,
Math.trunc || (Math.trunc = function(e) {
    return e < 0 ? Math.ceil(e) : Math.floor(e)
}
),
Math.trunc = Math.trunc;
var Math_abs = Math.abs
  , Math_cos = Math.cos
  , Math_sin = Math.sin
  , Math_tan = Math.tan
  , Math_acos = Math.acos
  , Math_asin = Math.asin
  , Math_atan = Math.atan
  , Math_atan2 = Math.atan2
  , Math_exp = Math.exp
  , Math_log = Math.log
  , Math_sqrt = Math.sqrt
  , Math_ceil = Math.ceil
  , Math_floor = Math.floor
  , Math_pow = Math.pow
  , Math_imul = Math.imul
  , Math_fround = Math.fround
  , Math_round = Math.round
  , Math_min = Math.min
  , Math_clz32 = Math.clz32
  , Math_trunc = Math.trunc
  , runDependencies = 0
  , runDependencyWatcher = null
  , dependenciesFulfilled = null;
function getUniqueRunDependency(e) {
    return e
}
function addRunDependency(e) {
    runDependencies++,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies)
}
function removeRunDependency(e) {
    if (runDependencies--,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    0 == runDependencies && (null !== runDependencyWatcher && (clearInterval(runDependencyWatcher),
    runDependencyWatcher = null),
    dependenciesFulfilled)) {
        var t = dependenciesFulfilled;
        dependenciesFulfilled = null,
        t()
    }
}
Module.addRunDependency = addRunDependency,
Module.removeRunDependency = removeRunDependency,
Module.preloadedImages = {},
Module.preloadedAudios = {};
var memoryInitializer = null;
function integrateWasmJS(Module) {
    var method = Module.wasmJSMethod || "native-wasm";
    Module.wasmJSMethod = method;
    var wasmTextFile = Module.wasmTextFile || "pcsx_ww.wast"
      , wasmBinaryFile = Module.wasmBinaryFile || "PlayStationGame.wasm"
      , asmjsCodeFile = Module.asmjsCodeFile || "pcsx_ww.temp.asm.js";
    "function" == typeof Module.locateFile && (wasmTextFile = Module.locateFile(wasmTextFile),
    wasmBinaryFile = Module.locateFile(wasmBinaryFile),
    asmjsCodeFile = Module.locateFile(asmjsCodeFile));
    var wasmPageSize = 65536
      , asm2wasmImports = {
        "f64-rem": function(e, t) {
            return e % t
        },
        "f64-to-int": function(e) {
            return 0 | e
        },
        "i32s-div": function(e, t) {
            return (0 | e) / (0 | t) | 0
        },
        "i32u-div": function(e, t) {
            return (e >>> 0) / (t >>> 0) >>> 0
        },
        "i32s-rem": function(e, t) {
            return (0 | e) % (0 | t) | 0
        },
        "i32u-rem": function(e, t) {
            return (e >>> 0) % (t >>> 0) >>> 0
        },
        debugger: function() {}
    }
      , info = {
        global: null,
        env: null,
        asm2wasm: asm2wasmImports,
        parent: Module
    }
      , exports = null;
    function lookupImport(e, t) {
        var n = info;
        if (e.indexOf(".") < 0)
            n = (n || {})[e];
        else {
            var r = e.split(".");
            n = ((n = (n || {})[r[0]]) || {})[r[1]]
        }
        return t && (n = (n || {})[t]),
        void 0 === n && abort("bad lookupImport to (" + e + ")." + t),
        n
    }
    function mergeMemory(e) {
        var t = Module.buffer;
        e.byteLength < t.byteLength && Module.printErr("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");
        var n = new Int8Array(t)
          , r = new Int8Array(e);
        memoryInitializer || n.set(r.subarray(Module.STATIC_BASE, Module.STATIC_BASE + Module.STATIC_BUMP), Module.STATIC_BASE),
        r.set(n),
        updateGlobalBuffer(e),
        updateGlobalBufferViews()
    }
    var WasmTypes = {
        none: 0,
        i32: 1,
        i64: 2,
        f32: 3,
        f64: 4
    };
    function fixImports(e) {
        return e
    }
    function getBinary() {
        try {
            var e;
            if (Module.wasmBinary)
                e = Module.wasmBinary,
                e = new Uint8Array(e);
            else {
                if (!Module.readBinary)
                    throw "on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)";
                e = Module.readBinary(wasmBinaryFile)
            }
            return e
        } catch (e) {
            abort(e)
        }
    }
    function getBinaryPromise() {
        return Module.wasmBinary || "function" != typeof fetch ? new Promise(function(e, t) {
            e(getBinary())
        }
        ) : fetch(wasmBinaryFile, {
            credentials: "same-origin"
        }).then(function(e) {
            if (!e.ok)
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
            return e.arrayBuffer()
        })
    }
    function doJustAsm(global, env, providedBuffer) {
        return "function" == typeof Module.asm && Module.asm !== methodHandler || (Module.asmPreload ? Module.asm = Module.asmPreload : eval(Module.read(asmjsCodeFile))),
        "function" != typeof Module.asm ? (Module.printErr("asm evalling did not set the module properly"),
        !1) : Module.asm(global, env, providedBuffer)
    }
    function doNativeWasm(e, t, n) {
        if ("object" != typeof WebAssembly)
            return Module.printErr("no native wasm support detected"),
            !1;
        if (!(Module.wasmMemory instanceof WebAssembly.Memory))
            return Module.printErr("no native wasm Memory in use"),
            !1;
        function r(e) {
            (exports = e.exports).memory && mergeMemory(exports.memory),
            Module.asm = exports,
            Module.usingWasm = !0,
            removeRunDependency("wasm-instantiate")
        }
        if (t.memory = Module.wasmMemory,
        info.global = {
            NaN: NaN,
            Infinity: 1 / 0
        },
        info["global.Math"] = e.Math,
        info.env = t,
        addRunDependency("wasm-instantiate"),
        Module.instantiateWasm)
            try {
                return Module.instantiateWasm(info, r)
            } catch (e) {
                return Module.printErr("Module.instantiateWasm callback failed with error: " + e),
                !1
            }
        return getBinaryPromise().then(function(e) {
            return WebAssembly.instantiate(e, info)
        }).then(function(e) {
            r(e.instance)
        }).catch(function(e) {
            Module.printErr("failed to asynchronously prepare wasm: " + e),
            abort(e)
        }),
        {}
    }
    function doWasmPolyfill(e, t, n, r) {
        if ("function" != typeof WasmJS)
            return Module.printErr("WasmJS not detected - polyfill not bundled?"),
            !1;
        var o, i, a = WasmJS({});
        if (a.outside = Module,
        a.info = info,
        a.lookupImport = lookupImport,
        assert(n === Module.buffer),
        info.global = e,
        info.env = t,
        assert(n === Module.buffer),
        t.memory = n,
        assert(t.memory instanceof ArrayBuffer),
        a.providedTotalMemory = Module.buffer.byteLength,
        o = "interpret-binary" === r ? getBinary() : Module.read("interpret-asm2wasm" == r ? asmjsCodeFile : wasmTextFile),
        "interpret-asm2wasm" == r)
            i = a._malloc(o.length + 1),
            a.writeAsciiToMemory(o, i),
            a._load_asm2wasm(i);
        else if ("interpret-s-expr" === r)
            i = a._malloc(o.length + 1),
            a.writeAsciiToMemory(o, i),
            a._load_s_expr2wasm(i);
        else {
            if ("interpret-binary" !== r)
                throw "what? " + r;
            i = a._malloc(o.length),
            a.HEAPU8.set(o, i),
            a._load_binary2wasm(i, o.length)
        }
        return a._free(i),
        a._instantiate(i),
        Module.newBuffer && (mergeMemory(Module.newBuffer),
        Module.newBuffer = null),
        exports = a.asmExports
    }
    Module.asmPreload = Module.asm;
    var asmjsReallocBuffer = Module.reallocBuffer
      , wasmReallocBuffer = function(e) {
        e = alignUp(e, Module.usingWasm ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE);
        var t = Module.buffer
          , n = t.byteLength;
        if (!Module.usingWasm)
            return exports.__growWasmMemory((e - n) / wasmPageSize),
            Module.buffer !== t ? Module.buffer : null;
        try {
            return -1 !== Module.wasmMemory.grow((e - n) / wasmPageSize) ? Module.buffer = Module.wasmMemory.buffer : null
        } catch (e) {
            return null
        }
    };
    Module.reallocBuffer = function(e) {
        return "asmjs" === finalMethod ? asmjsReallocBuffer(e) : wasmReallocBuffer(e)
    }
    ;
    var finalMethod = "";
    Module.asm = function(e, t, n) {
        if (e = fixImports(e),
        !(t = fixImports(t)).table) {
            var r = Module.wasmTableSize;
            void 0 === r && (r = 1024);
            var o = Module.wasmMaxTableSize;
            "object" == typeof WebAssembly && "function" == typeof WebAssembly.Table ? t.table = void 0 !== o ? new WebAssembly.Table({
                initial: r,
                maximum: o,
                element: "anyfunc"
            }) : new WebAssembly.Table({
                initial: r,
                element: "anyfunc"
            }) : t.table = new Array(r),
            Module.wasmTable = t.table
        }
        var i;
        t.memoryBase || (t.memoryBase = Module.STATIC_BASE),
        t.tableBase || (t.tableBase = 0);
        for (var a = method.split(","), s = 0; s < a.length; s++) {
            var u = a[s];
            if (finalMethod = u,
            "native-wasm" === u) {
                if (i = doNativeWasm(e, t, n))
                    break
            } else if ("asmjs" === u) {
                if (i = doJustAsm(e, t, n))
                    break
            } else if ("interpret-asm2wasm" === u || "interpret-s-expr" === u || "interpret-binary" === u) {
                if (i = doWasmPolyfill(e, t, n, u))
                    break
            } else
                abort("bad method: " + u)
        }
        if (!i)
            throw "no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: https://github.com/kripken/emscripten/wiki/WebAssembly#binaryen-methods";
        return i
    }
    ;
    var methodHandler = Module.asm
}
integrateWasmJS(Module);
var ASM_CONSTS = [function(e) {
    my_SDL_LockSurface(e)
}
, function(e) {
    my_SDL_UnlockSurface(e)
}
, function() {
    FS.mkdir("/cfg"),
    FS.mount(IDBFS, {}, "/cfg/"),
    FS.syncfs(!0, function(e) {
        e && cout_print("syncfs error!!"),
        assert(!e),
        _LoadPADConfig(),
        cout_print("idbfs loaded\n")
    })
}
, function() {
    var_setup()
}
, function(e) {
    pcsx_worker.postMessage({
        cmd: "soundBytes",
        lBytes: e
    })
}
];
function _emscripten_asm_const_ii(e, t) {
    return ASM_CONSTS[e](t)
}
function _emscripten_asm_const_v(e) {
    return ASM_CONSTS[e]()
}
STATIC_BASE = Runtime.GLOBAL_BASE,
STATICTOP = STATIC_BASE + 2104800,
__ATINIT__.push(),
memoryInitializer = Module.wasmJSMethod.indexOf("asmjs") >= 0 || Module.wasmJSMethod.indexOf("interpret-asm2wasm") >= 0 ? "pcsx_ww.js.mem" : null;
var STATIC_BUMP = 2104800;
Module.STATIC_BASE = STATIC_BASE,
Module.STATIC_BUMP = STATIC_BUMP;
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
var ERRNO_CODES = {
    EPERM: 1,
    ENOENT: 2,
    ESRCH: 3,
    EINTR: 4,
    EIO: 5,
    ENXIO: 6,
    E2BIG: 7,
    ENOEXEC: 8,
    EBADF: 9,
    ECHILD: 10,
    EAGAIN: 11,
    EWOULDBLOCK: 11,
    ENOMEM: 12,
    EACCES: 13,
    EFAULT: 14,
    ENOTBLK: 15,
    EBUSY: 16,
    EEXIST: 17,
    EXDEV: 18,
    ENODEV: 19,
    ENOTDIR: 20,
    EISDIR: 21,
    EINVAL: 22,
    ENFILE: 23,
    EMFILE: 24,
    ENOTTY: 25,
    ETXTBSY: 26,
    EFBIG: 27,
    ENOSPC: 28,
    ESPIPE: 29,
    EROFS: 30,
    EMLINK: 31,
    EPIPE: 32,
    EDOM: 33,
    ERANGE: 34,
    ENOMSG: 42,
    EIDRM: 43,
    ECHRNG: 44,
    EL2NSYNC: 45,
    EL3HLT: 46,
    EL3RST: 47,
    ELNRNG: 48,
    EUNATCH: 49,
    ENOCSI: 50,
    EL2HLT: 51,
    EDEADLK: 35,
    ENOLCK: 37,
    EBADE: 52,
    EBADR: 53,
    EXFULL: 54,
    ENOANO: 55,
    EBADRQC: 56,
    EBADSLT: 57,
    EDEADLOCK: 35,
    EBFONT: 59,
    ENOSTR: 60,
    ENODATA: 61,
    ETIME: 62,
    ENOSR: 63,
    ENONET: 64,
    ENOPKG: 65,
    EREMOTE: 66,
    ENOLINK: 67,
    EADV: 68,
    ESRMNT: 69,
    ECOMM: 70,
    EPROTO: 71,
    EMULTIHOP: 72,
    EDOTDOT: 73,
    EBADMSG: 74,
    ENOTUNIQ: 76,
    EBADFD: 77,
    EREMCHG: 78,
    ELIBACC: 79,
    ELIBBAD: 80,
    ELIBSCN: 81,
    ELIBMAX: 82,
    ELIBEXEC: 83,
    ENOSYS: 38,
    ENOTEMPTY: 39,
    ENAMETOOLONG: 36,
    ELOOP: 40,
    EOPNOTSUPP: 95,
    EPFNOSUPPORT: 96,
    ECONNRESET: 104,
    ENOBUFS: 105,
    EAFNOSUPPORT: 97,
    EPROTOTYPE: 91,
    ENOTSOCK: 88,
    ENOPROTOOPT: 92,
    ESHUTDOWN: 108,
    ECONNREFUSED: 111,
    EADDRINUSE: 98,
    ECONNABORTED: 103,
    ENETUNREACH: 101,
    ENETDOWN: 100,
    ETIMEDOUT: 110,
    EHOSTDOWN: 112,
    EHOSTUNREACH: 113,
    EINPROGRESS: 115,
    EALREADY: 114,
    EDESTADDRREQ: 89,
    EMSGSIZE: 90,
    EPROTONOSUPPORT: 93,
    ESOCKTNOSUPPORT: 94,
    EADDRNOTAVAIL: 99,
    ENETRESET: 102,
    EISCONN: 106,
    ENOTCONN: 107,
    ETOOMANYREFS: 109,
    EUSERS: 87,
    EDQUOT: 122,
    ESTALE: 116,
    ENOTSUP: 95,
    ENOMEDIUM: 123,
    EILSEQ: 84,
    EOVERFLOW: 75,
    ECANCELED: 125,
    ENOTRECOVERABLE: 131,
    EOWNERDEAD: 130,
    ESTRPIPE: 86
}
  , ERRNO_MESSAGES = {
    0: "Success",
    1: "Not super-user",
    2: "No such file or directory",
    3: "No such process",
    4: "Interrupted system call",
    5: "I/O error",
    6: "No such device or address",
    7: "Arg list too long",
    8: "Exec format error",
    9: "Bad file number",
    10: "No children",
    11: "No more processes",
    12: "Not enough core",
    13: "Permission denied",
    14: "Bad address",
    15: "Block device required",
    16: "Mount device busy",
    17: "File exists",
    18: "Cross-device link",
    19: "No such device",
    20: "Not a directory",
    21: "Is a directory",
    22: "Invalid argument",
    23: "Too many open files in system",
    24: "Too many open files",
    25: "Not a typewriter",
    26: "Text file busy",
    27: "File too large",
    28: "No space left on device",
    29: "Illegal seek",
    30: "Read only file system",
    31: "Too many links",
    32: "Broken pipe",
    33: "Math arg out of domain of func",
    34: "Math result not representable",
    35: "File locking deadlock error",
    36: "File or path name too long",
    37: "No record locks available",
    38: "Function not implemented",
    39: "Directory not empty",
    40: "Too many symbolic links",
    42: "No message of desired type",
    43: "Identifier removed",
    44: "Channel number out of range",
    45: "Level 2 not synchronized",
    46: "Level 3 halted",
    47: "Level 3 reset",
    48: "Link number out of range",
    49: "Protocol driver not attached",
    50: "No CSI structure available",
    51: "Level 2 halted",
    52: "Invalid exchange",
    53: "Invalid request descriptor",
    54: "Exchange full",
    55: "No anode",
    56: "Invalid request code",
    57: "Invalid slot",
    59: "Bad font file fmt",
    60: "Device not a stream",
    61: "No data (for no delay io)",
    62: "Timer expired",
    63: "Out of streams resources",
    64: "Machine is not on the network",
    65: "Package not installed",
    66: "The object is remote",
    67: "The link has been severed",
    68: "Advertise error",
    69: "Srmount error",
    70: "Communication error on send",
    71: "Protocol error",
    72: "Multihop attempted",
    73: "Cross mount point (not really error)",
    74: "Trying to read unreadable message",
    75: "Value too large for defined data type",
    76: "Given log. name not unique",
    77: "f.d. invalid for this operation",
    78: "Remote address changed",
    79: "Can   access a needed shared lib",
    80: "Accessing a corrupted shared lib",
    81: ".lib section in a.out corrupted",
    82: "Attempting to link in too many libs",
    83: "Attempting to exec a shared library",
    84: "Illegal byte sequence",
    86: "Streams pipe error",
    87: "Too many users",
    88: "Socket operation on non-socket",
    89: "Destination address required",
    90: "Message too long",
    91: "Protocol wrong type for socket",
    92: "Protocol not available",
    93: "Unknown protocol",
    94: "Socket type not supported",
    95: "Not supported",
    96: "Protocol family not supported",
    97: "Address family not supported by protocol family",
    98: "Address already in use",
    99: "Address not available",
    100: "Network interface is not configured",
    101: "Network is unreachable",
    102: "Connection reset by network",
    103: "Connection aborted",
    104: "Connection reset by peer",
    105: "No buffer space available",
    106: "Socket is already connected",
    107: "Socket is not connected",
    108: "Can't send after socket shutdown",
    109: "Too many references",
    110: "Connection timed out",
    111: "Connection refused",
    112: "Host is down",
    113: "Host is unreachable",
    114: "Socket already connected",
    115: "Connection already in progress",
    116: "Stale file handle",
    122: "Quota exceeded",
    123: "No medium (in tape drive)",
    125: "Operation canceled",
    130: "Previous owner died",
    131: "State not recoverable"
};
function ___setErrNo(e) {
    return Module.___errno_location && (HEAP32[Module.___errno_location() >> 2] = e),
    e
}
var PATH = {
    splitPath: function(e) {
        return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
    },
    normalizeArray: function(e, t) {
        for (var n = 0, r = e.length - 1; r >= 0; r--) {
            var o = e[r];
            "." === o ? e.splice(r, 1) : ".." === o ? (e.splice(r, 1),
            n++) : n && (e.splice(r, 1),
            n--)
        }
        if (t)
            for (; n--; n)
                e.unshift("..");
        return e
    },
    normalize: function(e) {
        var t = "/" === e.charAt(0)
          , n = "/" === e.substr(-1);
        return (e = PATH.normalizeArray(e.split("/").filter(function(e) {
            return !!e
        }), !t).join("/")) || t || (e = "."),
        e && n && (e += "/"),
        (t ? "/" : "") + e
    },
    dirname: function(e) {
        var t = PATH.splitPath(e)
          , n = t[0]
          , r = t[1];
        return n || r ? (r && (r = r.substr(0, r.length - 1)),
        n + r) : "."
    },
    basename: function(e) {
        if ("/" === e)
            return "/";
        var t = e.lastIndexOf("/");
        return -1 === t ? e : e.substr(t + 1)
    },
    extname: function(e) {
        return PATH.splitPath(e)[3]
    },
    join: function() {
        var e = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(e.join("/"))
    },
    join2: function(e, t) {
        return PATH.normalize(e + "/" + t)
    },
    resolve: function() {
        for (var e = "", t = !1, n = arguments.length - 1; n >= -1 && !t; n--) {
            var r = n >= 0 ? arguments[n] : FS.cwd();
            if ("string" != typeof r)
                throw new TypeError("Arguments to path.resolve must be strings");
            if (!r)
                return "";
            e = r + "/" + e,
            t = "/" === r.charAt(0)
        }
        return (t ? "/" : "") + (e = PATH.normalizeArray(e.split("/").filter(function(e) {
            return !!e
        }), !t).join("/")) || "."
    },
    relative: function(e, t) {
        function n(e) {
            for (var t = 0; t < e.length && "" === e[t]; t++)
                ;
            for (var n = e.length - 1; n >= 0 && "" === e[n]; n--)
                ;
            return t > n ? [] : e.slice(t, n - t + 1)
        }
        e = PATH.resolve(e).substr(1),
        t = PATH.resolve(t).substr(1);
        for (var r = n(e.split("/")), o = n(t.split("/")), i = Math.min(r.length, o.length), a = i, s = 0; s < i; s++)
            if (r[s] !== o[s]) {
                a = s;
                break
            }
        var u = [];
        for (s = a; s < r.length; s++)
            u.push("..");
        return (u = u.concat(o.slice(a))).join("/")
    }
}
  , TTY = {
    ttys: [],
    init: function() {},
    shutdown: function() {},
    register: function(e, t) {
        TTY.ttys[e] = {
            input: [],
            output: [],
            ops: t
        },
        FS.registerDevice(e, TTY.stream_ops)
    },
    stream_ops: {
        open: function(e) {
            var t = TTY.ttys[e.node.rdev];
            if (!t)
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            e.tty = t,
            e.seekable = !1
        },
        close: function(e) {
            e.tty.ops.flush(e.tty)
        },
        flush: function(e) {
            e.tty.ops.flush(e.tty)
        },
        read: function(e, t, n, r, o) {
            if (!e.tty || !e.tty.ops.get_char)
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            for (var i = 0, a = 0; a < r; a++) {
                var s;
                try {
                    s = e.tty.ops.get_char(e.tty)
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO)
                }
                if (void 0 === s && 0 === i)
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                if (null == s)
                    break;
                i++,
                t[n + a] = s
            }
            return i && (e.node.timestamp = Date.now()),
            i
        },
        write: function(e, t, n, r, o) {
            if (!e.tty || !e.tty.ops.put_char)
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            for (var i = 0; i < r; i++)
                try {
                    e.tty.ops.put_char(e.tty, t[n + i])
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO)
                }
            return r && (e.node.timestamp = Date.now()),
            i
        }
    },
    default_tty_ops: {
        get_char: function(e) {
            if (!e.input.length) {
                var t = null;
                if (ENVIRONMENT_IS_NODE) {
                    var n = new Buffer(256)
                      , r = 0
                      , o = "win32" != process.platform
                      , i = process.stdin.fd;
                    if (o) {
                        var a = !1;
                        try {
                            i = fs.openSync("/dev/stdin", "r"),
                            a = !0
                        } catch (e) {}
                    }
                    try {
                        r = fs.readSync(i, n, 0, 256, null)
                    } catch (e) {
                        if (-1 == e.toString().indexOf("EOF"))
                            throw e;
                        r = 0
                    }
                    a && fs.closeSync(i),
                    t = r > 0 ? n.slice(0, r).toString("utf-8") : null
                } else
                    "undefined" != typeof window && "function" == typeof window.prompt ? null !== (t = window.prompt("Input: ")) && (t += "\n") : "function" == typeof readline && null !== (t = readline()) && (t += "\n");
                if (!t)
                    return null;
                e.input = intArrayFromString(t, !0)
            }
            return e.input.shift()
        },
        put_char: function(e, t) {
            null === t || 10 === t ? (Module.print(UTF8ArrayToString(e.output, 0)),
            e.output = []) : 0 != t && e.output.push(t)
        },
        flush: function(e) {
            e.output && e.output.length > 0 && (Module.print(UTF8ArrayToString(e.output, 0)),
            e.output = [])
        }
    },
    default_tty1_ops: {
        put_char: function(e, t) {
            null === t || 10 === t ? (Module.printErr(UTF8ArrayToString(e.output, 0)),
            e.output = []) : 0 != t && e.output.push(t)
        },
        flush: function(e) {
            e.output && e.output.length > 0 && (Module.printErr(UTF8ArrayToString(e.output, 0)),
            e.output = [])
        }
    }
}
  , MEMFS = {
    ops_table: null,
    mount: function(e) {
        return MEMFS.createNode(null, "/", 16895, 0)
    },
    createNode: function(e, t, n, r) {
        if (FS.isBlkdev(n) || FS.isFIFO(n))
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        MEMFS.ops_table || (MEMFS.ops_table = {
            dir: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr,
                    lookup: MEMFS.node_ops.lookup,
                    mknod: MEMFS.node_ops.mknod,
                    rename: MEMFS.node_ops.rename,
                    unlink: MEMFS.node_ops.unlink,
                    rmdir: MEMFS.node_ops.rmdir,
                    readdir: MEMFS.node_ops.readdir,
                    symlink: MEMFS.node_ops.symlink
                },
                stream: {
                    llseek: MEMFS.stream_ops.llseek
                }
            },
            file: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr
                },
                stream: {
                    llseek: MEMFS.stream_ops.llseek,
                    read: MEMFS.stream_ops.read,
                    write: MEMFS.stream_ops.write,
                    allocate: MEMFS.stream_ops.allocate,
                    mmap: MEMFS.stream_ops.mmap,
                    msync: MEMFS.stream_ops.msync
                }
            },
            link: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr,
                    readlink: MEMFS.node_ops.readlink
                },
                stream: {}
            },
            chrdev: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr
                },
                stream: FS.chrdev_stream_ops
            }
        });
        var o = FS.createNode(e, t, n, r);
        return FS.isDir(o.mode) ? (o.node_ops = MEMFS.ops_table.dir.node,
        o.stream_ops = MEMFS.ops_table.dir.stream,
        o.contents = {}) : FS.isFile(o.mode) ? (o.node_ops = MEMFS.ops_table.file.node,
        o.stream_ops = MEMFS.ops_table.file.stream,
        o.usedBytes = 0,
        o.contents = null) : FS.isLink(o.mode) ? (o.node_ops = MEMFS.ops_table.link.node,
        o.stream_ops = MEMFS.ops_table.link.stream) : FS.isChrdev(o.mode) && (o.node_ops = MEMFS.ops_table.chrdev.node,
        o.stream_ops = MEMFS.ops_table.chrdev.stream),
        o.timestamp = Date.now(),
        e && (e.contents[t] = o),
        o
    },
    getFileDataAsRegularArray: function(e) {
        if (e.contents && e.contents.subarray) {
            for (var t = [], n = 0; n < e.usedBytes; ++n)
                t.push(e.contents[n]);
            return t
        }
        return e.contents
    },
    getFileDataAsTypedArray: function(e) {
        return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array
    },
    expandFileStorage: function(e, t) {
        if (e.contents && e.contents.subarray && t > e.contents.length && (e.contents = MEMFS.getFileDataAsRegularArray(e),
        e.usedBytes = e.contents.length),
        !e.contents || e.contents.subarray) {
            var n = e.contents ? e.contents.length : 0;
            if (n >= t)
                return;
            t = Math.max(t, n * (n < 1048576 ? 2 : 1.125) | 0),
            0 != n && (t = Math.max(t, 256));
            var r = e.contents;
            return e.contents = new Uint8Array(t),
            void (e.usedBytes > 0 && e.contents.set(r.subarray(0, e.usedBytes), 0))
        }
        for (!e.contents && t > 0 && (e.contents = []); e.contents.length < t; )
            e.contents.push(0)
    },
    resizeFileStorage: function(e, t) {
        if (e.usedBytes != t) {
            if (0 == t)
                return e.contents = null,
                void (e.usedBytes = 0);
            if (!e.contents || e.contents.subarray) {
                var n = e.contents;
                return e.contents = new Uint8Array(new ArrayBuffer(t)),
                n && e.contents.set(n.subarray(0, Math.min(t, e.usedBytes))),
                void (e.usedBytes = t)
            }
            if (e.contents || (e.contents = []),
            e.contents.length > t)
                e.contents.length = t;
            else
                for (; e.contents.length < t; )
                    e.contents.push(0);
            e.usedBytes = t
        }
    },
    node_ops: {
        getattr: function(e) {
            var t = {};
            return t.dev = FS.isChrdev(e.mode) ? e.id : 1,
            t.ino = e.id,
            t.mode = e.mode,
            t.nlink = 1,
            t.uid = 0,
            t.gid = 0,
            t.rdev = e.rdev,
            FS.isDir(e.mode) ? t.size = 4096 : FS.isFile(e.mode) ? t.size = e.usedBytes : FS.isLink(e.mode) ? t.size = e.link.length : t.size = 0,
            t.atime = new Date(e.timestamp),
            t.mtime = new Date(e.timestamp),
            t.ctime = new Date(e.timestamp),
            t.blksize = 4096,
            t.blocks = Math.ceil(t.size / t.blksize),
            t
        },
        setattr: function(e, t) {
            void 0 !== t.mode && (e.mode = t.mode),
            void 0 !== t.timestamp && (e.timestamp = t.timestamp),
            void 0 !== t.size && MEMFS.resizeFileStorage(e, t.size)
        },
        lookup: function(e, t) {
            throw FS.genericErrors[ERRNO_CODES.ENOENT]
        },
        mknod: function(e, t, n, r) {
            return MEMFS.createNode(e, t, n, r)
        },
        rename: function(e, t, n) {
            if (FS.isDir(e.mode)) {
                var r;
                try {
                    r = FS.lookupNode(t, n)
                } catch (e) {}
                if (r)
                    for (var o in r.contents)
                        throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
            }
            delete e.parent.contents[e.name],
            e.name = n,
            t.contents[n] = e,
            e.parent = t
        },
        unlink: function(e, t) {
            delete e.contents[t]
        },
        rmdir: function(e, t) {
            var n = FS.lookupNode(e, t);
            for (var r in n.contents)
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
            delete e.contents[t]
        },
        readdir: function(e) {
            var t = [".", ".."];
            for (var n in e.contents)
                e.contents.hasOwnProperty(n) && t.push(n);
            return t
        },
        symlink: function(e, t, n) {
            var r = MEMFS.createNode(e, t, 41471, 0);
            return r.link = n,
            r
        },
        readlink: function(e) {
            if (!FS.isLink(e.mode))
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return e.link
        }
    },
    stream_ops: {
        read: function(e, t, n, r, o) {
            var i = e.node.contents;
            if (o >= e.node.usedBytes)
                return 0;
            var a = Math.min(e.node.usedBytes - o, r);
            if (assert(a >= 0),
            a > 8 && i.subarray)
                t.set(i.subarray(o, o + a), n);
            else
                for (var s = 0; s < a; s++)
                    t[n + s] = i[o + s];
            return a
        },
        write: function(e, t, n, r, o, i) {
            if (!r)
                return 0;
            var a = e.node;
            if (a.timestamp = Date.now(),
            t.subarray && (!a.contents || a.contents.subarray)) {
                if (i)
                    return a.contents = t.subarray(n, n + r),
                    a.usedBytes = r,
                    r;
                if (0 === a.usedBytes && 0 === o)
                    return a.contents = new Uint8Array(t.subarray(n, n + r)),
                    a.usedBytes = r,
                    r;
                if (o + r <= a.usedBytes)
                    return a.contents.set(t.subarray(n, n + r), o),
                    r
            }
            if (MEMFS.expandFileStorage(a, o + r),
            a.contents.subarray && t.subarray)
                a.contents.set(t.subarray(n, n + r), o);
            else
                for (var s = 0; s < r; s++)
                    a.contents[o + s] = t[n + s];
            return a.usedBytes = Math.max(a.usedBytes, o + r),
            r
        },
        llseek: function(e, t, n) {
            var r = t;
            if (1 === n ? r += e.position : 2 === n && FS.isFile(e.node.mode) && (r += e.node.usedBytes),
            r < 0)
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return r
        },
        allocate: function(e, t, n) {
            MEMFS.expandFileStorage(e.node, t + n),
            e.node.usedBytes = Math.max(e.node.usedBytes, t + n)
        },
        mmap: function(e, t, n, r, o, i, a) {
            if (!FS.isFile(e.node.mode))
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            var s, u, l = e.node.contents;
            if (2 & a || l.buffer !== t && l.buffer !== t.buffer) {
                if ((o > 0 || o + r < e.node.usedBytes) && (l = l.subarray ? l.subarray(o, o + r) : Array.prototype.slice.call(l, o, o + r)),
                u = !0,
                !(s = _malloc(r)))
                    throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
                t.set(l, s)
            } else
                u = !1,
                s = l.byteOffset;
            return {
                ptr: s,
                allocated: u
            }
        },
        msync: function(e, t, n, r, o) {
            if (!FS.isFile(e.node.mode))
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            if (2 & o)
                return 0;
            MEMFS.stream_ops.write(e, t, 0, r, n, !1);
            return 0
        }
    }
}
  , IDBFS = {
    dbs: {},
    indexedDB: function() {
        if ("undefined" != typeof indexedDB)
            return indexedDB;
        var e = null;
        return "object" == typeof window && (e = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB),
        assert(e, "IDBFS used, but indexedDB not supported"),
        e
    },
    DB_VERSION: 21,
    DB_STORE_NAME: "FILE_DATA",
    mount: function(e) {
        return MEMFS.mount.apply(null, arguments)
    },
    syncfs: function(e, t, n) {
        IDBFS.getLocalSet(e, function(r, o) {
            if (r)
                return n(r);
            IDBFS.getRemoteSet(e, function(e, r) {
                if (e)
                    return n(e);
                var i = t ? r : o
                  , a = t ? o : r;
                IDBFS.reconcile(i, a, n)
            })
        })
    },
    getDB: function(e, t) {
        var n, r = IDBFS.dbs[e];
        if (r)
            return t(null, r);
        try {
            n = IDBFS.indexedDB().open(e, IDBFS.DB_VERSION)
        } catch (e) {
            return t(e)
        }
        if (!n)
            return t("Unable to connect to IndexedDB");
        n.onupgradeneeded = function(e) {
            var t, n = e.target.result, r = e.target.transaction;
            (t = n.objectStoreNames.contains(IDBFS.DB_STORE_NAME) ? r.objectStore(IDBFS.DB_STORE_NAME) : n.createObjectStore(IDBFS.DB_STORE_NAME)).indexNames.contains("timestamp") || t.createIndex("timestamp", "timestamp", {
                unique: !1
            })
        }
        ,
        n.onsuccess = function() {
            r = n.result,
            IDBFS.dbs[e] = r,
            t(null, r)
        }
        ,
        n.onerror = function(e) {
            t(this.error),
            e.preventDefault()
        }
    },
    getLocalSet: function(e, t) {
        var n = {};
        function r(e) {
            return "." !== e && ".." !== e
        }
        function o(e) {
            return function(t) {
                return PATH.join2(e, t)
            }
        }
        for (var i = FS.readdir(e.mountpoint).filter(r).map(o(e.mountpoint)); i.length; ) {
            var a, s = i.pop();
            try {
                a = FS.stat(s)
            } catch (e) {
                return t(e)
            }
            FS.isDir(a.mode) && i.push.apply(i, FS.readdir(s).filter(r).map(o(s))),
            n[s] = {
                timestamp: a.mtime
            }
        }
        return t(null, {
            type: "local",
            entries: n
        })
    },
    getRemoteSet: function(e, t) {
        var n = {};
        IDBFS.getDB(e.mountpoint, function(e, r) {
            if (e)
                return t(e);
            var o = r.transaction([IDBFS.DB_STORE_NAME], "readonly");
            o.onerror = function(e) {
                t(this.error),
                e.preventDefault()
            }
            ,
            o.objectStore(IDBFS.DB_STORE_NAME).index("timestamp").openKeyCursor().onsuccess = function(e) {
                var o = e.target.result;
                if (!o)
                    return t(null, {
                        type: "remote",
                        db: r,
                        entries: n
                    });
                n[o.primaryKey] = {
                    timestamp: o.key
                },
                o.continue()
            }
        })
    },
    loadLocalEntry: function(e, t) {
        var n, r;
        try {
            r = FS.lookupPath(e).node,
            n = FS.stat(e)
        } catch (e) {
            return t(e)
        }
        return FS.isDir(n.mode) ? t(null, {
            timestamp: n.mtime,
            mode: n.mode
        }) : FS.isFile(n.mode) ? (r.contents = MEMFS.getFileDataAsTypedArray(r),
        t(null, {
            timestamp: n.mtime,
            mode: n.mode,
            contents: r.contents
        })) : t(new Error("node type not supported"))
    },
    storeLocalEntry: function(e, t, n) {
        try {
            if (FS.isDir(t.mode))
                FS.mkdir(e, t.mode);
            else {
                if (!FS.isFile(t.mode))
                    return n(new Error("node type not supported"));
                FS.writeFile(e, t.contents, {
                    encoding: "binary",
                    canOwn: !0
                })
            }
            FS.chmod(e, t.mode),
            FS.utime(e, t.timestamp, t.timestamp)
        } catch (e) {
            return n(e)
        }
        n(null)
    },
    removeLocalEntry: function(e, t) {
        try {
            FS.lookupPath(e);
            var n = FS.stat(e);
            FS.isDir(n.mode) ? FS.rmdir(e) : FS.isFile(n.mode) && FS.unlink(e)
        } catch (e) {
            return t(e)
        }
        t(null)
    },
    loadRemoteEntry: function(e, t, n) {
        var r = e.get(t);
        r.onsuccess = function(e) {
            n(null, e.target.result)
        }
        ,
        r.onerror = function(e) {
            n(this.error),
            e.preventDefault()
        }
    },
    storeRemoteEntry: function(e, t, n, r) {
        var o = e.put(n, t);
        o.onsuccess = function() {
            r(null)
        }
        ,
        o.onerror = function(e) {
            r(this.error),
            e.preventDefault()
        }
    },
    removeRemoteEntry: function(e, t, n) {
        var r = e.delete(t);
        r.onsuccess = function() {
            n(null)
        }
        ,
        r.onerror = function(e) {
            n(this.error),
            e.preventDefault()
        }
    },
    reconcile: function(e, t, n) {
        var r = 0
          , o = [];
        Object.keys(e.entries).forEach(function(n) {
            var i = e.entries[n]
              , a = t.entries[n];
            (!a || i.timestamp > a.timestamp) && (o.push(n),
            r++)
        });
        var i = [];
        if (Object.keys(t.entries).forEach(function(n) {
            t.entries[n];
            e.entries[n] || (i.push(n),
            r++)
        }),
        !r)
            return n(null);
        var a = 0
          , s = ("remote" === e.type ? e.db : t.db).transaction([IDBFS.DB_STORE_NAME], "readwrite")
          , u = s.objectStore(IDBFS.DB_STORE_NAME);
        function l(e) {
            return e ? l.errored ? void 0 : (l.errored = !0,
            n(e)) : ++a >= r ? n(null) : void 0
        }
        s.onerror = function(e) {
            l(this.error),
            e.preventDefault()
        }
        ,
        o.sort().forEach(function(e) {
            "local" === t.type ? IDBFS.loadRemoteEntry(u, e, function(t, n) {
                if (t)
                    return l(t);
                IDBFS.storeLocalEntry(e, n, l)
            }) : IDBFS.loadLocalEntry(e, function(t, n) {
                if (t)
                    return l(t);
                IDBFS.storeRemoteEntry(u, e, n, l)
            })
        }),
        i.sort().reverse().forEach(function(e) {
            "local" === t.type ? IDBFS.removeLocalEntry(e, l) : IDBFS.removeRemoteEntry(u, e, l)
        })
    }
}
  , NODEFS = {
    isWindows: !1,
    staticInit: function() {
        NODEFS.isWindows = !!process.platform.match(/^win/)
    },
    mount: function(e) {
        return assert(ENVIRONMENT_IS_NODE),
        NODEFS.createNode(null, "/", NODEFS.getMode(e.opts.root), 0)
    },
    createNode: function(e, t, n, r) {
        if (!FS.isDir(n) && !FS.isFile(n) && !FS.isLink(n))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var o = FS.createNode(e, t, n);
        return o.node_ops = NODEFS.node_ops,
        o.stream_ops = NODEFS.stream_ops,
        o
    },
    getMode: function(e) {
        var t;
        try {
            t = fs.lstatSync(e),
            NODEFS.isWindows && (t.mode = t.mode | (146 & t.mode) >> 1)
        } catch (e) {
            if (!e.code)
                throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return t.mode
    },
    realPath: function(e) {
        for (var t = []; e.parent !== e; )
            t.push(e.name),
            e = e.parent;
        return t.push(e.mount.opts.root),
        t.reverse(),
        PATH.join.apply(null, t)
    },
    flagsToPermissionStringMap: {
        0: "r",
        1: "r+",
        2: "r+",
        64: "r",
        65: "r+",
        66: "r+",
        129: "rx+",
        193: "rx+",
        514: "w+",
        577: "w",
        578: "w+",
        705: "wx",
        706: "wx+",
        1024: "a",
        1025: "a",
        1026: "a+",
        1089: "a",
        1090: "a+",
        1153: "ax",
        1154: "ax+",
        1217: "ax",
        1218: "ax+",
        4096: "rs",
        4098: "rs+"
    },
    flagsToPermissionString: function(e) {
        if (e &= -2097153,
        e &= -2049,
        e &= -32769,
        (e &= -524289)in NODEFS.flagsToPermissionStringMap)
            return NODEFS.flagsToPermissionStringMap[e];
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
    },
    node_ops: {
        getattr: function(e) {
            var t, n = NODEFS.realPath(e);
            try {
                t = fs.lstatSync(n)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return NODEFS.isWindows && !t.blksize && (t.blksize = 4096),
            NODEFS.isWindows && !t.blocks && (t.blocks = (t.size + t.blksize - 1) / t.blksize | 0),
            {
                dev: t.dev,
                ino: t.ino,
                mode: t.mode,
                nlink: t.nlink,
                uid: t.uid,
                gid: t.gid,
                rdev: t.rdev,
                size: t.size,
                atime: t.atime,
                mtime: t.mtime,
                ctime: t.ctime,
                blksize: t.blksize,
                blocks: t.blocks
            }
        },
        setattr: function(e, t) {
            var n = NODEFS.realPath(e);
            try {
                if (void 0 !== t.mode && (fs.chmodSync(n, t.mode),
                e.mode = t.mode),
                void 0 !== t.timestamp) {
                    var r = new Date(t.timestamp);
                    fs.utimesSync(n, r, r)
                }
                void 0 !== t.size && fs.truncateSync(n, t.size)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        lookup: function(e, t) {
            var n = PATH.join2(NODEFS.realPath(e), t)
              , r = NODEFS.getMode(n);
            return NODEFS.createNode(e, t, r)
        },
        mknod: function(e, t, n, r) {
            var o = NODEFS.createNode(e, t, n, r)
              , i = NODEFS.realPath(o);
            try {
                FS.isDir(o.mode) ? fs.mkdirSync(i, o.mode) : fs.writeFileSync(i, "", {
                    mode: o.mode
                })
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return o
        },
        rename: function(e, t, n) {
            var r = NODEFS.realPath(e)
              , o = PATH.join2(NODEFS.realPath(t), n);
            try {
                fs.renameSync(r, o)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        unlink: function(e, t) {
            var n = PATH.join2(NODEFS.realPath(e), t);
            try {
                fs.unlinkSync(n)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        rmdir: function(e, t) {
            var n = PATH.join2(NODEFS.realPath(e), t);
            try {
                fs.rmdirSync(n)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        readdir: function(e) {
            var t = NODEFS.realPath(e);
            try {
                return fs.readdirSync(t)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        symlink: function(e, t, n) {
            var r = PATH.join2(NODEFS.realPath(e), t);
            try {
                fs.symlinkSync(n, r)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        readlink: function(e) {
            var t = NODEFS.realPath(e);
            try {
                return t = fs.readlinkSync(t),
                t = NODEJS_PATH.relative(NODEJS_PATH.resolve(e.mount.opts.root), t)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }
    },
    stream_ops: {
        open: function(e) {
            var t = NODEFS.realPath(e.node);
            try {
                FS.isFile(e.node.mode) && (e.nfd = fs.openSync(t, NODEFS.flagsToPermissionString(e.flags)))
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        close: function(e) {
            try {
                FS.isFile(e.node.mode) && e.nfd && fs.closeSync(e.nfd)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        read: function(e, t, n, r, o) {
            if (0 === r)
                return 0;
            var i, a = new Buffer(r);
            try {
                i = fs.readSync(e.nfd, a, 0, r, o)
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            if (i > 0)
                for (var s = 0; s < i; s++)
                    t[n + s] = a[s];
            return i
        },
        write: function(e, t, n, r, o) {
            var i, a = new Buffer(t.subarray(n, n + r));
            try {
                i = fs.writeSync(e.nfd, a, 0, r, o)
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return i
        },
        llseek: function(e, t, n) {
            var r = t;
            if (1 === n)
                r += e.position;
            else if (2 === n && FS.isFile(e.node.mode))
                try {
                    r += fs.fstatSync(e.nfd).size
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES[e.code])
                }
            if (r < 0)
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return r
        }
    }
}
  , WORKERFS = {
    DIR_MODE: 16895,
    FILE_MODE: 33279,
    reader: null,
    mount: function(e) {
        assert(ENVIRONMENT_IS_WORKER),
        WORKERFS.reader || (WORKERFS.reader = new FileReaderSync);
        var t = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0)
          , n = {};
        function r(e) {
            for (var r = e.split("/"), o = t, i = 0; i < r.length - 1; i++) {
                var a = r.slice(0, i + 1).join("/");
                n[a] || (n[a] = WORKERFS.createNode(o, r[i], WORKERFS.DIR_MODE, 0)),
                o = n[a]
            }
            return o
        }
        function o(e) {
            var t = e.split("/");
            return t[t.length - 1]
        }
        return Array.prototype.forEach.call(e.opts.files || [], function(e) {
            WORKERFS.createNode(r(e.name), o(e.name), WORKERFS.FILE_MODE, 0, e, e.lastModifiedDate)
        }),
        (e.opts.blobs || []).forEach(function(e) {
            WORKERFS.createNode(r(e.name), o(e.name), WORKERFS.FILE_MODE, 0, e.data)
        }),
        (e.opts.packages || []).forEach(function(e) {
            e.metadata.files.forEach(function(t) {
                var n = t.filename.substr(1);
                WORKERFS.createNode(r(n), o(n), WORKERFS.FILE_MODE, 0, e.blob.slice(t.start, t.end))
            })
        }),
        t
    },
    createNode: function(e, t, n, r, o, i) {
        var a = FS.createNode(e, t, n);
        return a.mode = n,
        a.node_ops = WORKERFS.node_ops,
        a.stream_ops = WORKERFS.stream_ops,
        a.timestamp = (i || new Date).getTime(),
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE),
        n === WORKERFS.FILE_MODE ? (a.size = o.size,
        a.contents = o) : (a.size = 4096,
        a.contents = {}),
        e && (e.contents[t] = a),
        a
    },
    node_ops: {
        getattr: function(e) {
            return {
                dev: 1,
                ino: void 0,
                mode: e.mode,
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: void 0,
                size: e.size,
                atime: new Date(e.timestamp),
                mtime: new Date(e.timestamp),
                ctime: new Date(e.timestamp),
                blksize: 4096,
                blocks: Math.ceil(e.size / 4096)
            }
        },
        setattr: function(e, t) {
            void 0 !== t.mode && (e.mode = t.mode),
            void 0 !== t.timestamp && (e.timestamp = t.timestamp)
        },
        lookup: function(e, t) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
        },
        mknod: function(e, t, n, r) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        rename: function(e, t, n) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        unlink: function(e, t) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        rmdir: function(e, t) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        readdir: function(e) {
            var t = [".", ".."];
            for (var n in e.contents)
                e.contents.hasOwnProperty(n) && t.push(n);
            return t
        },
        symlink: function(e, t, n) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        readlink: function(e) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }
    },
    stream_ops: {
        read: function(e, t, n, r, o) {
            if (o >= e.node.size)
                return 0;
            var i = e.node.contents.slice(o, o + r)
              , a = WORKERFS.reader.readAsArrayBuffer(i);
            return t.set(new Uint8Array(a), n),
            i.size
        },
        write: function(e, t, n, r, o) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
        },
        llseek: function(e, t, n) {
            var r = t;
            if (1 === n ? r += e.position : 2 === n && FS.isFile(e.node.mode) && (r += e.node.size),
            r < 0)
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return r
        }
    }
};
STATICTOP += 16,
STATICTOP += 16,
STATICTOP += 16;
var FS = {
    root: null,
    mounts: [],
    devices: [null],
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: !1,
    ignorePermissions: !0,
    trackingDelegate: {},
    tracking: {
        openFlags: {
            READ: 1,
            WRITE: 2
        }
    },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function(e) {
        if (!(e instanceof FS.ErrnoError))
            throw e + " : " + stackTrace();
        return ___setErrNo(e.errno)
    },
    lookupPath: function(e, t) {
        if (t = t || {},
        !(e = PATH.resolve(FS.cwd(), e)))
            return {
                path: "",
                node: null
            };
        var n = {
            follow_mount: !0,
            recurse_count: 0
        };
        for (var r in n)
            void 0 === t[r] && (t[r] = n[r]);
        if (t.recurse_count > 8)
            throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        for (var o = PATH.normalizeArray(e.split("/").filter(function(e) {
            return !!e
        }), !1), i = FS.root, a = "/", s = 0; s < o.length; s++) {
            var u = s === o.length - 1;
            if (u && t.parent)
                break;
            if (i = FS.lookupNode(i, o[s]),
            a = PATH.join2(a, o[s]),
            FS.isMountpoint(i) && (!u || u && t.follow_mount) && (i = i.mounted.root),
            !u || t.follow)
                for (var l = 0; FS.isLink(i.mode); ) {
                    var c = FS.readlink(a);
                    if (a = PATH.resolve(PATH.dirname(a), c),
                    i = FS.lookupPath(a, {
                        recurse_count: t.recurse_count
                    }).node,
                    l++ > 40)
                        throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
                }
        }
        return {
            path: a,
            node: i
        }
    },
    getPath: function(e) {
        for (var t; ; ) {
            if (FS.isRoot(e)) {
                var n = e.mount.mountpoint;
                return t ? "/" !== n[n.length - 1] ? n + "/" + t : n + t : n
            }
            t = t ? e.name + "/" + t : e.name,
            e = e.parent
        }
    },
    hashName: function(e, t) {
        for (var n = 0, r = 0; r < t.length; r++)
            n = (n << 5) - n + t.charCodeAt(r) | 0;
        return (e + n >>> 0) % FS.nameTable.length
    },
    hashAddNode: function(e) {
        var t = FS.hashName(e.parent.id, e.name);
        e.name_next = FS.nameTable[t],
        FS.nameTable[t] = e
    },
    hashRemoveNode: function(e) {
        var t = FS.hashName(e.parent.id, e.name);
        if (FS.nameTable[t] === e)
            FS.nameTable[t] = e.name_next;
        else
            for (var n = FS.nameTable[t]; n; ) {
                if (n.name_next === e) {
                    n.name_next = e.name_next;
                    break
                }
                n = n.name_next
            }
    },
    lookupNode: function(e, t) {
        var n = FS.mayLookup(e);
        if (n)
            throw new FS.ErrnoError(n,e);
        for (var r = FS.hashName(e.id, t), o = FS.nameTable[r]; o; o = o.name_next) {
            var i = o.name;
            if (o.parent.id === e.id && i === t)
                return o
        }
        return FS.lookup(e, t)
    },
    createNode: function(e, t, n, r) {
        if (!FS.FSNode) {
            FS.FSNode = function(e, t, n, r) {
                e || (e = this),
                this.parent = e,
                this.mount = e.mount,
                this.mounted = null,
                this.id = FS.nextInode++,
                this.name = t,
                this.mode = n,
                this.node_ops = {},
                this.stream_ops = {},
                this.rdev = r
            }
            ,
            FS.FSNode.prototype = {};
            Object.defineProperties(FS.FSNode.prototype, {
                read: {
                    get: function() {
                        return 365 == (365 & this.mode)
                    },
                    set: function(e) {
                        e ? this.mode |= 365 : this.mode &= -366
                    }
                },
                write: {
                    get: function() {
                        return 146 == (146 & this.mode)
                    },
                    set: function(e) {
                        e ? this.mode |= 146 : this.mode &= -147
                    }
                },
                isFolder: {
                    get: function() {
                        return FS.isDir(this.mode)
                    }
                },
                isDevice: {
                    get: function() {
                        return FS.isChrdev(this.mode)
                    }
                }
            })
        }
        var o = new FS.FSNode(e,t,n,r);
        return FS.hashAddNode(o),
        o
    },
    destroyNode: function(e) {
        FS.hashRemoveNode(e)
    },
    isRoot: function(e) {
        return e === e.parent
    },
    isMountpoint: function(e) {
        return !!e.mounted
    },
    isFile: function(e) {
        return 32768 == (61440 & e)
    },
    isDir: function(e) {
        return 16384 == (61440 & e)
    },
    isLink: function(e) {
        return 40960 == (61440 & e)
    },
    isChrdev: function(e) {
        return 8192 == (61440 & e)
    },
    isBlkdev: function(e) {
        return 24576 == (61440 & e)
    },
    isFIFO: function(e) {
        return 4096 == (61440 & e)
    },
    isSocket: function(e) {
        return 49152 == (49152 & e)
    },
    flagModes: {
        r: 0,
        rs: 1052672,
        "r+": 2,
        w: 577,
        wx: 705,
        xw: 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        a: 1089,
        ax: 1217,
        xa: 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
    },
    modeStringToFlags: function(e) {
        var t = FS.flagModes[e];
        if (void 0 === t)
            throw new Error("Unknown file open mode: " + e);
        return t
    },
    flagsToPermissionString: function(e) {
        var t = ["r", "w", "rw"][3 & e];
        return 512 & e && (t += "w"),
        t
    },
    nodePermissions: function(e, t) {
        return FS.ignorePermissions ? 0 : (-1 === t.indexOf("r") || 292 & e.mode) && (-1 === t.indexOf("w") || 146 & e.mode) && (-1 === t.indexOf("x") || 73 & e.mode) ? 0 : ERRNO_CODES.EACCES
    },
    mayLookup: function(e) {
        var t = FS.nodePermissions(e, "x");
        return t || (e.node_ops.lookup ? 0 : ERRNO_CODES.EACCES)
    },
    mayCreate: function(e, t) {
        try {
            FS.lookupNode(e, t);
            return ERRNO_CODES.EEXIST
        } catch (e) {}
        return FS.nodePermissions(e, "wx")
    },
    mayDelete: function(e, t, n) {
        var r;
        try {
            r = FS.lookupNode(e, t)
        } catch (e) {
            return e.errno
        }
        var o = FS.nodePermissions(e, "wx");
        if (o)
            return o;
        if (n) {
            if (!FS.isDir(r.mode))
                return ERRNO_CODES.ENOTDIR;
            if (FS.isRoot(r) || FS.getPath(r) === FS.cwd())
                return ERRNO_CODES.EBUSY
        } else if (FS.isDir(r.mode))
            return ERRNO_CODES.EISDIR;
        return 0
    },
    mayOpen: function(e, t) {
        return e ? FS.isLink(e.mode) ? ERRNO_CODES.ELOOP : FS.isDir(e.mode) && ("r" !== FS.flagsToPermissionString(t) || 512 & t) ? ERRNO_CODES.EISDIR : FS.nodePermissions(e, FS.flagsToPermissionString(t)) : ERRNO_CODES.ENOENT
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function(e, t) {
        e = e || 0,
        t = t || FS.MAX_OPEN_FDS;
        for (var n = e; n <= t; n++)
            if (!FS.streams[n])
                return n;
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE)
    },
    getStream: function(e) {
        return FS.streams[e]
    },
    createStream: function(e, t, n) {
        FS.FSStream || (FS.FSStream = function() {}
        ,
        FS.FSStream.prototype = {},
        Object.defineProperties(FS.FSStream.prototype, {
            object: {
                get: function() {
                    return this.node
                },
                set: function(e) {
                    this.node = e
                }
            },
            isRead: {
                get: function() {
                    return 1 != (2097155 & this.flags)
                }
            },
            isWrite: {
                get: function() {
                    return 0 != (2097155 & this.flags)
                }
            },
            isAppend: {
                get: function() {
                    return 1024 & this.flags
                }
            }
        }));
        var r = new FS.FSStream;
        for (var o in e)
            r[o] = e[o];
        e = r;
        var i = FS.nextfd(t, n);
        return e.fd = i,
        FS.streams[i] = e,
        e
    },
    closeStream: function(e) {
        FS.streams[e] = null
    },
    chrdev_stream_ops: {
        open: function(e) {
            var t = FS.getDevice(e.node.rdev);
            e.stream_ops = t.stream_ops,
            e.stream_ops.open && e.stream_ops.open(e)
        },
        llseek: function() {
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
        }
    },
    major: function(e) {
        return e >> 8
    },
    minor: function(e) {
        return 255 & e
    },
    makedev: function(e, t) {
        return e << 8 | t
    },
    registerDevice: function(e, t) {
        FS.devices[e] = {
            stream_ops: t
        }
    },
    getDevice: function(e) {
        return FS.devices[e]
    },
    getMounts: function(e) {
        for (var t = [], n = [e]; n.length; ) {
            var r = n.pop();
            t.push(r),
            n.push.apply(n, r.mounts)
        }
        return t
    },
    syncfs: function(e, t) {
        "function" == typeof e && (t = e,
        e = !1),
        FS.syncFSRequests++,
        FS.syncFSRequests > 1 && console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
        var n = FS.getMounts(FS.root.mount)
          , r = 0;
        function o(e) {
            return assert(FS.syncFSRequests > 0),
            FS.syncFSRequests--,
            t(e)
        }
        function i(e) {
            if (e)
                return i.errored ? void 0 : (i.errored = !0,
                o(e));
            ++r >= n.length && o(null)
        }
        n.forEach(function(t) {
            if (!t.type.syncfs)
                return i(null);
            t.type.syncfs(t, e, i)
        })
    },
    mount: function(e, t, n) {
        var r, o = "/" === n, i = !n;
        if (o && FS.root)
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        if (!o && !i) {
            var a = FS.lookupPath(n, {
                follow_mount: !1
            });
            if (n = a.path,
            r = a.node,
            FS.isMountpoint(r))
                throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            if (!FS.isDir(r.mode))
                throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
        }
        var s = {
            type: e,
            opts: t,
            mountpoint: n,
            mounts: []
        }
          , u = e.mount(s);
        return u.mount = s,
        s.root = u,
        o ? FS.root = u : r && (r.mounted = s,
        r.mount && r.mount.mounts.push(s)),
        u
    },
    unmount: function(e) {
        var t = FS.lookupPath(e, {
            follow_mount: !1
        });
        if (!FS.isMountpoint(t.node))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var n = t.node
          , r = n.mounted
          , o = FS.getMounts(r);
        Object.keys(FS.nameTable).forEach(function(e) {
            for (var t = FS.nameTable[e]; t; ) {
                var n = t.name_next;
                -1 !== o.indexOf(t.mount) && FS.destroyNode(t),
                t = n
            }
        }),
        n.mounted = null;
        var i = n.mount.mounts.indexOf(r);
        assert(-1 !== i),
        n.mount.mounts.splice(i, 1)
    },
    lookup: function(e, t) {
        return e.node_ops.lookup(e, t)
    },
    mknod: function(e, t, n) {
        var r = FS.lookupPath(e, {
            parent: !0
        }).node
          , o = PATH.basename(e);
        if (!o || "." === o || ".." === o)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var i = FS.mayCreate(r, o);
        if (i)
            throw new FS.ErrnoError(i);
        if (!r.node_ops.mknod)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        return r.node_ops.mknod(r, o, t, n)
    },
    create: function(e, t) {
        return t = void 0 !== t ? t : 438,
        t &= 4095,
        t |= 32768,
        FS.mknod(e, t, 0)
    },
    mkdir: function(e, t) {
        return t = void 0 !== t ? t : 511,
        t &= 1023,
        t |= 16384,
        FS.mknod(e, t, 0)
    },
    mkdirTree: function(e, t) {
        for (var n = e.split("/"), r = "", o = 0; o < n.length; ++o)
            if (n[o]) {
                r += "/" + n[o];
                try {
                    FS.mkdir(r, t)
                } catch (e) {
                    if (e.errno != ERRNO_CODES.EEXIST)
                        throw e
                }
            }
    },
    mkdev: function(e, t, n) {
        return void 0 === n && (n = t,
        t = 438),
        t |= 8192,
        FS.mknod(e, t, n)
    },
    symlink: function(e, t) {
        if (!PATH.resolve(e))
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        var n = FS.lookupPath(t, {
            parent: !0
        }).node;
        if (!n)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        var r = PATH.basename(t)
          , o = FS.mayCreate(n, r);
        if (o)
            throw new FS.ErrnoError(o);
        if (!n.node_ops.symlink)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        return n.node_ops.symlink(n, r, e)
    },
    rename: function(e, t) {
        var n, r, o = PATH.dirname(e), i = PATH.dirname(t), a = PATH.basename(e), s = PATH.basename(t);
        try {
            n = FS.lookupPath(e, {
                parent: !0
            }).node,
            r = FS.lookupPath(t, {
                parent: !0
            }).node
        } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
        }
        if (!n || !r)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (n.mount !== r.mount)
            throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        var u, l = FS.lookupNode(n, a), c = PATH.relative(e, i);
        if ("." !== c.charAt(0))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if ("." !== (c = PATH.relative(t, o)).charAt(0))
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        try {
            u = FS.lookupNode(r, s)
        } catch (e) {}
        if (l !== u) {
            var d = FS.isDir(l.mode)
              , f = FS.mayDelete(n, a, d);
            if (f)
                throw new FS.ErrnoError(f);
            if (f = u ? FS.mayDelete(r, s, d) : FS.mayCreate(r, s))
                throw new FS.ErrnoError(f);
            if (!n.node_ops.rename)
                throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            if (FS.isMountpoint(l) || u && FS.isMountpoint(u))
                throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            if (r !== n && (f = FS.nodePermissions(n, "w")))
                throw new FS.ErrnoError(f);
            try {
                FS.trackingDelegate.willMovePath && FS.trackingDelegate.willMovePath(e, t)
            } catch (n) {
                console.log("FS.trackingDelegate['willMovePath']('" + e + "', '" + t + "') threw an exception: " + n.message)
            }
            FS.hashRemoveNode(l);
            try {
                n.node_ops.rename(l, r, s)
            } catch (e) {
                throw e
            } finally {
                FS.hashAddNode(l)
            }
            try {
                FS.trackingDelegate.onMovePath && FS.trackingDelegate.onMovePath(e, t)
            } catch (n) {
                console.log("FS.trackingDelegate['onMovePath']('" + e + "', '" + t + "') threw an exception: " + n.message)
            }
        }
    },
    rmdir: function(e) {
        var t = FS.lookupPath(e, {
            parent: !0
        }).node
          , n = PATH.basename(e)
          , r = FS.lookupNode(t, n)
          , o = FS.mayDelete(t, n, !0);
        if (o)
            throw new FS.ErrnoError(o);
        if (!t.node_ops.rmdir)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        if (FS.isMountpoint(r))
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        try {
            FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(e)
        } catch (t) {
            console.log("FS.trackingDelegate['willDeletePath']('" + e + "') threw an exception: " + t.message)
        }
        t.node_ops.rmdir(t, n),
        FS.destroyNode(r);
        try {
            FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(e)
        } catch (t) {
            console.log("FS.trackingDelegate['onDeletePath']('" + e + "') threw an exception: " + t.message)
        }
    },
    readdir: function(e) {
        var t = FS.lookupPath(e, {
            follow: !0
        }).node;
        if (!t.node_ops.readdir)
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        return t.node_ops.readdir(t)
    },
    unlink: function(e) {
        var t = FS.lookupPath(e, {
            parent: !0
        }).node
          , n = PATH.basename(e)
          , r = FS.lookupNode(t, n)
          , o = FS.mayDelete(t, n, !1);
        if (o)
            throw new FS.ErrnoError(o);
        if (!t.node_ops.unlink)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        if (FS.isMountpoint(r))
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        try {
            FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(e)
        } catch (t) {
            console.log("FS.trackingDelegate['willDeletePath']('" + e + "') threw an exception: " + t.message)
        }
        t.node_ops.unlink(t, n),
        FS.destroyNode(r);
        try {
            FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(e)
        } catch (t) {
            console.log("FS.trackingDelegate['onDeletePath']('" + e + "') threw an exception: " + t.message)
        }
    },
    readlink: function(e) {
        var t = FS.lookupPath(e).node;
        if (!t)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (!t.node_ops.readlink)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        return PATH.resolve(FS.getPath(t.parent), t.node_ops.readlink(t))
    },
    stat: function(e, t) {
        var n = FS.lookupPath(e, {
            follow: !t
        }).node;
        if (!n)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (!n.node_ops.getattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        return n.node_ops.getattr(n)
    },
    lstat: function(e) {
        return FS.stat(e, !0)
    },
    chmod: function(e, t, n) {
        var r;
        "string" == typeof e ? r = FS.lookupPath(e, {
            follow: !n
        }).node : r = e;
        if (!r.node_ops.setattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        r.node_ops.setattr(r, {
            mode: 4095 & t | -4096 & r.mode,
            timestamp: Date.now()
        })
    },
    lchmod: function(e, t) {
        FS.chmod(e, t, !0)
    },
    fchmod: function(e, t) {
        var n = FS.getStream(e);
        if (!n)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        FS.chmod(n.node, t)
    },
    chown: function(e, t, n, r) {
        var o;
        "string" == typeof e ? o = FS.lookupPath(e, {
            follow: !r
        }).node : o = e;
        if (!o.node_ops.setattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        o.node_ops.setattr(o, {
            timestamp: Date.now()
        })
    },
    lchown: function(e, t, n) {
        FS.chown(e, t, n, !0)
    },
    fchown: function(e, t, n) {
        var r = FS.getStream(e);
        if (!r)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        FS.chown(r.node, t, n)
    },
    truncate: function(e, t) {
        if (t < 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var n;
        "string" == typeof e ? n = FS.lookupPath(e, {
            follow: !0
        }).node : n = e;
        if (!n.node_ops.setattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        if (FS.isDir(n.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        if (!FS.isFile(n.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var r = FS.nodePermissions(n, "w");
        if (r)
            throw new FS.ErrnoError(r);
        n.node_ops.setattr(n, {
            size: t,
            timestamp: Date.now()
        })
    },
    ftruncate: function(e, t) {
        var n = FS.getStream(e);
        if (!n)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (0 == (2097155 & n.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        FS.truncate(n.node, t)
    },
    utime: function(e, t, n) {
        var r = FS.lookupPath(e, {
            follow: !0
        }).node;
        r.node_ops.setattr(r, {
            timestamp: Math.max(t, n)
        })
    },
    open: function(e, t, n, r, o) {
        if ("" === e)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        var i;
        if (n = void 0 === n ? 438 : n,
        n = 64 & (t = "string" == typeof t ? FS.modeStringToFlags(t) : t) ? 4095 & n | 32768 : 0,
        "object" == typeof e)
            i = e;
        else {
            e = PATH.normalize(e);
            try {
                i = FS.lookupPath(e, {
                    follow: !(131072 & t)
                }).node
            } catch (e) {}
        }
        var a = !1;
        if (64 & t)
            if (i) {
                if (128 & t)
                    throw new FS.ErrnoError(ERRNO_CODES.EEXIST)
            } else
                i = FS.mknod(e, n, 0),
                a = !0;
        if (!i)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (FS.isChrdev(i.mode) && (t &= -513),
        65536 & t && !FS.isDir(i.mode))
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        if (!a) {
            var s = FS.mayOpen(i, t);
            if (s)
                throw new FS.ErrnoError(s)
        }
        512 & t && FS.truncate(i, 0),
        t &= -641;
        var u = FS.createStream({
            node: i,
            path: FS.getPath(i),
            flags: t,
            seekable: !0,
            position: 0,
            stream_ops: i.stream_ops,
            ungotten: [],
            error: !1
        }, r, o);
        u.stream_ops.open && u.stream_ops.open(u),
        !Module.logReadFiles || 1 & t || (FS.readFiles || (FS.readFiles = {}),
        e in FS.readFiles || (FS.readFiles[e] = 1,
        Module.printErr("read file: " + e)));
        try {
            if (FS.trackingDelegate.onOpenFile) {
                var l = 0;
                1 != (2097155 & t) && (l |= FS.tracking.openFlags.READ),
                0 != (2097155 & t) && (l |= FS.tracking.openFlags.WRITE),
                FS.trackingDelegate.onOpenFile(e, l)
            }
        } catch (t) {
            console.log("FS.trackingDelegate['onOpenFile']('" + e + "', flags) threw an exception: " + t.message)
        }
        return u
    },
    close: function(e) {
        e.getdents && (e.getdents = null);
        try {
            e.stream_ops.close && e.stream_ops.close(e)
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(e.fd)
        }
    },
    llseek: function(e, t, n) {
        if (!e.seekable || !e.stream_ops.llseek)
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        return e.position = e.stream_ops.llseek(e, t, n),
        e.ungotten = [],
        e.position
    },
    read: function(e, t, n, r, o) {
        if (r < 0 || o < 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if (1 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (FS.isDir(e.node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        if (!e.stream_ops.read)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var i = !0;
        if (void 0 === o)
            o = e.position,
            i = !1;
        else if (!e.seekable)
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        var a = e.stream_ops.read(e, t, n, r, o);
        return i || (e.position += a),
        a
    },
    write: function(e, t, n, r, o, i) {
        if (r < 0 || o < 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if (0 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (FS.isDir(e.node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        if (!e.stream_ops.write)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        1024 & e.flags && FS.llseek(e, 0, 2);
        var a = !0;
        if (void 0 === o)
            o = e.position,
            a = !1;
        else if (!e.seekable)
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        var s = e.stream_ops.write(e, t, n, r, o, i);
        a || (e.position += s);
        try {
            e.path && FS.trackingDelegate.onWriteToFile && FS.trackingDelegate.onWriteToFile(e.path)
        } catch (e) {
            console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message)
        }
        return s
    },
    allocate: function(e, t, n) {
        if (t < 0 || n <= 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if (0 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (!FS.isFile(e.node.mode) && !FS.isDir(node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        if (!e.stream_ops.allocate)
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        e.stream_ops.allocate(e, t, n)
    },
    mmap: function(e, t, n, r, o, i, a) {
        if (1 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        if (!e.stream_ops.mmap)
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        return e.stream_ops.mmap(e, t, n, r, o, i, a)
    },
    msync: function(e, t, n, r, o) {
        return e && e.stream_ops.msync ? e.stream_ops.msync(e, t, n, r, o) : 0
    },
    munmap: function(e) {
        return 0
    },
    ioctl: function(e, t, n) {
        if (!e.stream_ops.ioctl)
            throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        return e.stream_ops.ioctl(e, t, n)
    },
    readFile: function(e, t) {
        if ((t = t || {}).flags = t.flags || "r",
        t.encoding = t.encoding || "binary",
        "utf8" !== t.encoding && "binary" !== t.encoding)
            throw new Error('Invalid encoding type "' + t.encoding + '"');
        var n, r = FS.open(e, t.flags), o = FS.stat(e).size, i = new Uint8Array(o);
        return FS.read(r, i, 0, o, 0),
        "utf8" === t.encoding ? n = UTF8ArrayToString(i, 0) : "binary" === t.encoding && (n = i),
        FS.close(r),
        n
    },
    writeFile: function(e, t, n) {
        if ((n = n || {}).flags = n.flags || "w",
        n.encoding = n.encoding || "utf8",
        "utf8" !== n.encoding && "binary" !== n.encoding)
            throw new Error('Invalid encoding type "' + n.encoding + '"');
        var r = FS.open(e, n.flags, n.mode);
        if ("utf8" === n.encoding) {
            var o = new Uint8Array(lengthBytesUTF8(t) + 1)
              , i = stringToUTF8Array(t, o, 0, o.length);
            FS.write(r, o, 0, i, 0, n.canOwn)
        } else
            "binary" === n.encoding && FS.write(r, t, 0, t.length, 0, n.canOwn);
        FS.close(r)
    },
    cwd: function() {
        return FS.currentPath
    },
    chdir: function(e) {
        var t = FS.lookupPath(e, {
            follow: !0
        });
        if (null === t.node)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (!FS.isDir(t.node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        var n = FS.nodePermissions(t.node, "x");
        if (n)
            throw new FS.ErrnoError(n);
        FS.currentPath = t.path
    },
    createDefaultDirectories: function() {
        FS.mkdir("/tmp"),
        FS.mkdir("/home"),
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices: function() {
        var e;
        if (FS.mkdir("/dev"),
        FS.registerDevice(FS.makedev(1, 3), {
            read: function() {
                return 0
            },
            write: function(e, t, n, r, o) {
                return r
            }
        }),
        FS.mkdev("/dev/null", FS.makedev(1, 3)),
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
        FS.mkdev("/dev/tty", FS.makedev(5, 0)),
        FS.mkdev("/dev/tty1", FS.makedev(6, 0)),
        "undefined" != typeof crypto) {
            var t = new Uint8Array(1);
            e = function() {
                return crypto.getRandomValues(t),
                t[0]
            }
        } else
            e = ENVIRONMENT_IS_NODE ? function() {
                return require("crypto").randomBytes(1)[0]
            }
            : function() {
                return 256 * Math.random() | 0
            }
            ;
        FS.createDevice("/dev", "random", e),
        FS.createDevice("/dev", "urandom", e),
        FS.mkdir("/dev/shm"),
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories: function() {
        FS.mkdir("/proc"),
        FS.mkdir("/proc/self"),
        FS.mkdir("/proc/self/fd"),
        FS.mount({
            mount: function() {
                var e = FS.createNode("/proc/self", "fd", 16895, 73);
                return e.node_ops = {
                    lookup: function(e, t) {
                        var n = +t
                          , r = FS.getStream(n);
                        if (!r)
                            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                        var o = {
                            parent: null,
                            mount: {
                                mountpoint: "fake"
                            },
                            node_ops: {
                                readlink: function() {
                                    return r.path
                                }
                            }
                        };
                        return o.parent = o,
                        o
                    }
                },
                e
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams: function() {
        Module.stdin ? FS.createDevice("/dev", "stdin", Module.stdin) : FS.symlink("/dev/tty", "/dev/stdin"),
        Module.stdout ? FS.createDevice("/dev", "stdout", null, Module.stdout) : FS.symlink("/dev/tty", "/dev/stdout"),
        Module.stderr ? FS.createDevice("/dev", "stderr", null, Module.stderr) : FS.symlink("/dev/tty1", "/dev/stderr");
        var e = FS.open("/dev/stdin", "r");
        assert(0 === e.fd, "invalid handle for stdin (" + e.fd + ")");
        var t = FS.open("/dev/stdout", "w");
        assert(1 === t.fd, "invalid handle for stdout (" + t.fd + ")");
        var n = FS.open("/dev/stderr", "w");
        assert(2 === n.fd, "invalid handle for stderr (" + n.fd + ")")
    },
    ensureErrnoError: function() {
        FS.ErrnoError || (FS.ErrnoError = function(e, t) {
            this.node = t,
            this.setErrno = function(e) {
                for (var t in this.errno = e,
                ERRNO_CODES)
                    if (ERRNO_CODES[t] === e) {
                        this.code = t;
                        break
                    }
            }
            ,
            this.setErrno(e),
            this.message = ERRNO_MESSAGES[e]
        }
        ,
        FS.ErrnoError.prototype = new Error,
        FS.ErrnoError.prototype.constructor = FS.ErrnoError,
        [ERRNO_CODES.ENOENT].forEach(function(e) {
            FS.genericErrors[e] = new FS.ErrnoError(e),
            FS.genericErrors[e].stack = "<generic error, no stack>"
        }))
    },
    staticInit: function() {
        FS.ensureErrnoError(),
        FS.nameTable = new Array(4096),
        FS.mount(MEMFS, {}, "/"),
        FS.createDefaultDirectories(),
        FS.createDefaultDevices(),
        FS.createSpecialDirectories(),
        FS.filesystems = {
            MEMFS: MEMFS,
            IDBFS: IDBFS,
            NODEFS: NODEFS,
            WORKERFS: WORKERFS
        }
    },
    init: function(e, t, n) {
        assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),
        FS.init.initialized = !0,
        FS.ensureErrnoError(),
        Module.stdin = e || Module.stdin,
        Module.stdout = t || Module.stdout,
        Module.stderr = n || Module.stderr,
        FS.createStandardStreams()
    },
    quit: function() {
        FS.init.initialized = !1;
        var e = Module._fflush;
        e && e(0);
        for (var t = 0; t < FS.streams.length; t++) {
            var n = FS.streams[t];
            n && FS.close(n)
        }
    },
    getMode: function(e, t) {
        var n = 0;
        return e && (n |= 365),
        t && (n |= 146),
        n
    },
    joinPath: function(e, t) {
        var n = PATH.join.apply(null, e);
        return t && "/" == n[0] && (n = n.substr(1)),
        n
    },
    absolutePath: function(e, t) {
        return PATH.resolve(t, e)
    },
    standardizePath: function(e) {
        return PATH.normalize(e)
    },
    findObject: function(e, t) {
        var n = FS.analyzePath(e, t);
        return n.exists ? n.object : (___setErrNo(n.error),
        null)
    },
    analyzePath: function(e, t) {
        try {
            e = (r = FS.lookupPath(e, {
                follow: !t
            })).path
        } catch (e) {}
        var n = {
            isRoot: !1,
            exists: !1,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: !1,
            parentPath: null,
            parentObject: null
        };
        try {
            var r = FS.lookupPath(e, {
                parent: !0
            });
            n.parentExists = !0,
            n.parentPath = r.path,
            n.parentObject = r.node,
            n.name = PATH.basename(e),
            r = FS.lookupPath(e, {
                follow: !t
            }),
            n.exists = !0,
            n.path = r.path,
            n.object = r.node,
            n.name = r.node.name,
            n.isRoot = "/" === r.path
        } catch (e) {
            n.error = e.errno
        }
        return n
    },
    createFolder: function(e, t, n, r) {
        var o = PATH.join2("string" == typeof e ? e : FS.getPath(e), t)
          , i = FS.getMode(n, r);
        return FS.mkdir(o, i)
    },
    createPath: function(e, t, n, r) {
        e = "string" == typeof e ? e : FS.getPath(e);
        for (var o = t.split("/").reverse(); o.length; ) {
            var i = o.pop();
            if (i) {
                var a = PATH.join2(e, i);
                try {
                    FS.mkdir(a)
                } catch (e) {}
                e = a
            }
        }
        return a
    },
    createFile: function(e, t, n, r, o) {
        var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), t)
          , a = FS.getMode(r, o);
        return FS.create(i, a)
    },
    createDataFile: function(e, t, n, r, o, i) {
        var a = t ? PATH.join2("string" == typeof e ? e : FS.getPath(e), t) : e
          , s = FS.getMode(r, o)
          , u = FS.create(a, s);
        if (n) {
            if ("string" == typeof n) {
                for (var l = new Array(n.length), c = 0, d = n.length; c < d; ++c)
                    l[c] = n.charCodeAt(c);
                n = l
            }
            FS.chmod(u, 146 | s);
            var f = FS.open(u, "w");
            FS.write(f, n, 0, n.length, 0, i),
            FS.close(f),
            FS.chmod(u, s)
        }
        return u
    },
    createDevice: function(e, t, n, r) {
        var o = PATH.join2("string" == typeof e ? e : FS.getPath(e), t)
          , i = FS.getMode(!!n, !!r);
        FS.createDevice.major || (FS.createDevice.major = 64);
        var a = FS.makedev(FS.createDevice.major++, 0);
        return FS.registerDevice(a, {
            open: function(e) {
                e.seekable = !1
            },
            close: function(e) {
                r && r.buffer && r.buffer.length && r(10)
            },
            read: function(e, t, r, o, i) {
                for (var a = 0, s = 0; s < o; s++) {
                    var u;
                    try {
                        u = n()
                    } catch (e) {
                        throw new FS.ErrnoError(ERRNO_CODES.EIO)
                    }
                    if (void 0 === u && 0 === a)
                        throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                    if (null == u)
                        break;
                    a++,
                    t[r + s] = u
                }
                return a && (e.node.timestamp = Date.now()),
                a
            },
            write: function(e, t, n, o, i) {
                for (var a = 0; a < o; a++)
                    try {
                        r(t[n + a])
                    } catch (e) {
                        throw new FS.ErrnoError(ERRNO_CODES.EIO)
                    }
                return o && (e.node.timestamp = Date.now()),
                a
            }
        }),
        FS.mkdev(o, i, a)
    },
    createLink: function(e, t, n, r, o) {
        var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), t);
        return FS.symlink(n, i)
    },
    forceLoadFile: function(e) {
        if (e.isDevice || e.isFolder || e.link || e.contents)
            return !0;
        var t = !0;
        if ("undefined" != typeof XMLHttpRequest)
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        if (!Module.read)
            throw new Error("Cannot load without read() or XMLHttpRequest.");
        try {
            e.contents = intArrayFromString(Module.read(e.url), !0),
            e.usedBytes = e.contents.length
        } catch (e) {
            t = !1
        }
        return t || ___setErrNo(ERRNO_CODES.EIO),
        t
    },
    createLazyFile: function(e, t, n, r, o) {
        function i() {
            this.lengthKnown = !1,
            this.chunks = []
        }
        if (i.prototype.get = function(e) {
            if (!(e > this.length - 1 || e < 0)) {
                var t = e % this.chunkSize
                  , n = e / this.chunkSize | 0;
                return this.getter(n)[t]
            }
        }
        ,
        i.prototype.setDataGetter = function(e) {
            this.getter = e
        }
        ,
        i.prototype.cacheLength = function() {
            var e = new XMLHttpRequest;
            if (e.open("HEAD", n, !1),
            e.send(null),
            !(e.status >= 200 && e.status < 300 || 304 === e.status))
                throw new Error("Couldn't load " + n + ". Status: " + e.status);
            var t, r = Number(e.getResponseHeader("Content-length")), o = (t = e.getResponseHeader("Accept-Ranges")) && "bytes" === t, i = (t = e.getResponseHeader("Content-Encoding")) && "gzip" === t, a = 1048576;
            o || (a = r);
            var s = this;
            s.setDataGetter(function(e) {
                var t = e * a
                  , o = (e + 1) * a - 1;
                if (o = Math.min(o, r - 1),
                void 0 === s.chunks[e] && (s.chunks[e] = function(e, t) {
                    if (e > t)
                        throw new Error("invalid range (" + e + ", " + t + ") or no bytes requested!");
                    if (t > r - 1)
                        throw new Error("only " + r + " bytes available! programmer error!");
                    var o = new XMLHttpRequest;
                    if (o.open("GET", n, !1),
                    r !== a && o.setRequestHeader("Range", "bytes=" + e + "-" + t),
                    "undefined" != typeof Uint8Array && (o.responseType = "arraybuffer"),
                    o.overrideMimeType && o.overrideMimeType("text/plain; charset=x-user-defined"),
                    o.send(null),
                    !(o.status >= 200 && o.status < 300 || 304 === o.status))
                        throw new Error("Couldn't load " + n + ". Status: " + o.status);
                    return void 0 !== o.response ? new Uint8Array(o.response || []) : intArrayFromString(o.responseText || "", !0)
                }(t, o)),
                void 0 === s.chunks[e])
                    throw new Error("doXHR failed!");
                return s.chunks[e]
            }),
            !i && r || (a = r = 1,
            r = this.getter(0).length,
            a = r,
            console.log("LazyFiles on gzip forces download of the whole file when length is accessed")),
            this._length = r,
            this._chunkSize = a,
            this.lengthKnown = !0
        }
        ,
        "undefined" != typeof XMLHttpRequest) {
            if (!ENVIRONMENT_IS_WORKER)
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var a = new i;
            Object.defineProperties(a, {
                length: {
                    get: function() {
                        return this.lengthKnown || this.cacheLength(),
                        this._length
                    }
                },
                chunkSize: {
                    get: function() {
                        return this.lengthKnown || this.cacheLength(),
                        this._chunkSize
                    }
                }
            });
            var s = {
                isDevice: !1,
                contents: a
            }
        } else
            s = {
                isDevice: !1,
                url: n
            };
        var u = FS.createFile(e, t, s, r, o);
        s.contents ? u.contents = s.contents : s.url && (u.contents = null,
        u.url = s.url),
        Object.defineProperties(u, {
            usedBytes: {
                get: function() {
                    return this.contents.length
                }
            }
        });
        var l = {};
        return Object.keys(u.stream_ops).forEach(function(e) {
            var t = u.stream_ops[e];
            l[e] = function() {
                if (!FS.forceLoadFile(u))
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                return t.apply(null, arguments)
            }
        }),
        l.read = function(e, t, n, r, o) {
            if (!FS.forceLoadFile(u))
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
            var i = e.node.contents;
            if (o >= i.length)
                return 0;
            var a = Math.min(i.length - o, r);
            if (assert(a >= 0),
            i.slice)
                for (var s = 0; s < a; s++)
                    t[n + s] = i[o + s];
            else
                for (s = 0; s < a; s++)
                    t[n + s] = i.get(o + s);
            return a
        }
        ,
        u.stream_ops = l,
        u
    },
    createPreloadedFile: function(e, t, n, r, o, i, a, s, u, l) {
        Browser.init();
        var c = t ? PATH.resolve(PATH.join2(e, t)) : e
          , d = getUniqueRunDependency("cp " + c);
        function f(n) {
            function f(n) {
                l && l(),
                s || FS.createDataFile(e, t, n, r, o, u),
                i && i(),
                removeRunDependency(d)
            }
            var S = !1;
            Module.preloadPlugins.forEach(function(e) {
                S || e.canHandle(c) && (e.handle(n, c, f, function() {
                    a && a(),
                    removeRunDependency(d)
                }),
                S = !0)
            }),
            S || f(n)
        }
        addRunDependency(d),
        "string" == typeof n ? Browser.asyncLoad(n, function(e) {
            f(e)
        }, a) : f(n)
    },
    indexedDB: function() {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function() {
        return "EM_FS_" + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: function(e, t, n) {
        t = t || function() {}
        ,
        n = n || function() {}
        ;
        var r = FS.indexedDB();
        try {
            var o = r.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return n(e)
        }
        o.onupgradeneeded = function() {
            console.log("creating db"),
            o.result.createObjectStore(FS.DB_STORE_NAME)
        }
        ,
        o.onsuccess = function() {
            var r = o.result.transaction([FS.DB_STORE_NAME], "readwrite")
              , i = r.objectStore(FS.DB_STORE_NAME)
              , a = 0
              , s = 0
              , u = e.length;
            function l() {
                0 == s ? t() : n()
            }
            e.forEach(function(e) {
                var t = i.put(FS.analyzePath(e).object.contents, e);
                t.onsuccess = function() {
                    ++a + s == u && l()
                }
                ,
                t.onerror = function() {
                    a + ++s == u && l()
                }
            }),
            r.onerror = n
        }
        ,
        o.onerror = n
    },
    loadFilesFromDB: function(e, t, n) {
        t = t || function() {}
        ,
        n = n || function() {}
        ;
        var r = FS.indexedDB();
        try {
            var o = r.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return n(e)
        }
        o.onupgradeneeded = n,
        o.onsuccess = function() {
            var r = o.result;
            try {
                var i = r.transaction([FS.DB_STORE_NAME], "readonly")
            } catch (e) {
                return void n(e)
            }
            var a = i.objectStore(FS.DB_STORE_NAME)
              , s = 0
              , u = 0
              , l = e.length;
            function c() {
                0 == u ? t() : n()
            }
            e.forEach(function(e) {
                var t = a.get(e);
                t.onsuccess = function() {
                    FS.analyzePath(e).exists && FS.unlink(e),
                    FS.createDataFile(PATH.dirname(e), PATH.basename(e), t.result, !0, !0, !0),
                    ++s + u == l && c()
                }
                ,
                t.onerror = function() {
                    s + ++u == l && c()
                }
            }),
            i.onerror = n
        }
        ,
        o.onerror = n
    }
};
function _emscripten_set_main_loop_timing(e, t) {
    if (Browser.mainLoop.timingMode = e,
    Browser.mainLoop.timingValue = t,
    !Browser.mainLoop.func)
        return 1;
    if (0 == e)
        Browser.mainLoop.scheduler = function() {
            var e = 0 | Math.max(0, Browser.mainLoop.tickStartTime + t - _emscripten_get_now());
            setTimeout(Browser.mainLoop.runner, e)
        }
        ,
        Browser.mainLoop.method = "timeout";
    else if (1 == e)
        Browser.mainLoop.scheduler = function() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner)
        }
        ,
        Browser.mainLoop.method = "rAF";
    else if (2 == e) {
        if (!window.setImmediate) {
            var n = []
              , r = "setimmediate";
            window.addEventListener("message", function(e) {
                e.source === window && e.data === r && (e.stopPropagation(),
                n.shift()())
            }, !0),
            window.setImmediate = function(e) {
                n.push(e),
                ENVIRONMENT_IS_WORKER ? (void 0 === Module.setImmediates && (Module.setImmediates = []),
                Module.setImmediates.push(e),
                window.postMessage({
                    target: r
                })) : window.postMessage(r, "*")
            }
        }
        Browser.mainLoop.scheduler = function() {
            window.setImmediate(Browser.mainLoop.runner)
        }
        ,
        Browser.mainLoop.method = "immediate"
    }
    return 0
}
function _emscripten_get_now() {
    abort()
}
function _emscripten_set_main_loop(e, t, n, r, o) {
    var i;
    Module.noExitRuntime = !0,
    assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters."),
    Browser.mainLoop.func = e,
    Browser.mainLoop.arg = r,
    i = void 0 !== r ? function() {
        Module.dynCall_vi(e, r)
    }
    : function() {
        Module.dynCall_v(e)
    }
    ;
    var a = Browser.mainLoop.currentlyRunningMainloop;
    if (Browser.mainLoop.runner = function() {
        if (!ABORT)
            if (Browser.mainLoop.queue.length > 0) {
                var e = Date.now()
                  , t = Browser.mainLoop.queue.shift();
                if (t.func(t.arg),
                Browser.mainLoop.remainingBlockers) {
                    var n = Browser.mainLoop.remainingBlockers
                      , r = n % 1 == 0 ? n - 1 : Math.floor(n);
                    t.counted ? Browser.mainLoop.remainingBlockers = r : (r += .5,
                    Browser.mainLoop.remainingBlockers = (8 * n + r) / 9)
                }
                if (console.log('main loop blocker "' + t.name + '" took ' + (Date.now() - e) + " ms"),
                Browser.mainLoop.updateStatus(),
                a < Browser.mainLoop.currentlyRunningMainloop)
                    return;
                setTimeout(Browser.mainLoop.runner, 0)
            } else
                a < Browser.mainLoop.currentlyRunningMainloop || (Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0,
                1 == Browser.mainLoop.timingMode && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0 ? Browser.mainLoop.scheduler() : (0 == Browser.mainLoop.timingMode && (Browser.mainLoop.tickStartTime = _emscripten_get_now()),
                "timeout" === Browser.mainLoop.method && Module.ctx && (Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!"),
                Browser.mainLoop.method = ""),
                Browser.mainLoop.runIter(i),
                a < Browser.mainLoop.currentlyRunningMainloop || ("object" == typeof SDL && SDL.audio && SDL.audio.queueNewAudioData && SDL.audio.queueNewAudioData(),
                Browser.mainLoop.scheduler())))
    }
    ,
    o || (t && t > 0 ? _emscripten_set_main_loop_timing(0, 1e3 / t) : _emscripten_set_main_loop_timing(1, 1),
    Browser.mainLoop.scheduler()),
    n)
        throw "SimulateInfiniteLoop"
}
var Browser = {
    mainLoop: {
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function() {
            Browser.mainLoop.scheduler = null,
            Browser.mainLoop.currentlyRunningMainloop++
        },
        resume: function() {
            Browser.mainLoop.currentlyRunningMainloop++;
            var e = Browser.mainLoop.timingMode
              , t = Browser.mainLoop.timingValue
              , n = Browser.mainLoop.func;
            Browser.mainLoop.func = null,
            _emscripten_set_main_loop(n, 0, !1, Browser.mainLoop.arg, !0),
            _emscripten_set_main_loop_timing(e, t),
            Browser.mainLoop.scheduler()
        },
        updateStatus: function() {
            if (Module.setStatus) {
                var e = Module.statusMessage || "Please wait..."
                  , t = Browser.mainLoop.remainingBlockers
                  , n = Browser.mainLoop.expectedBlockers;
                t ? t < n ? Module.setStatus(e + " (" + (n - t) + "/" + n + ")") : Module.setStatus(e) : Module.setStatus("")
            }
        },
        runIter: function(e) {
            if (!ABORT) {
                if (Module.preMainLoop)
                    if (!1 === Module.preMainLoop())
                        return;
                try {
                    e()
                } catch (e) {
                    if (e instanceof ExitStatus)
                        return;
                    throw e && "object" == typeof e && e.stack && Module.printErr("exception thrown: " + [e, e.stack]),
                    e
                }
                Module.postMainLoop && Module.postMainLoop()
            }
        }
    },
    isFullscreen: !1,
    pointerLock: !1,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function() {
        if (Module.preloadPlugins || (Module.preloadPlugins = []),
        !Browser.initted) {
            Browser.initted = !0;
            try {
                new Blob,
                Browser.hasBlobConstructor = !0
            } catch (e) {
                Browser.hasBlobConstructor = !1,
                console.log("warning: no blob constructor, cannot create blobs with mimetypes")
            }
            Browser.BlobBuilder = "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : "undefined" != typeof WebKitBlobBuilder ? WebKitBlobBuilder : Browser.hasBlobConstructor ? null : console.log("warning: no BlobBuilder"),
            Browser.URLObject = "undefined" != typeof window ? window.URL ? window.URL : window.webkitURL : void 0,
            Module.noImageDecoding || void 0 !== Browser.URLObject || (console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."),
            Module.noImageDecoding = !0);
            var e = {
                canHandle: function(e) {
                    return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(e)
                },
                handle: function(e, t, n, r) {
                    var o = null;
                    if (Browser.hasBlobConstructor)
                        try {
                            (o = new Blob([e],{
                                type: Browser.getMimetype(t)
                            })).size !== e.length && (o = new Blob([new Uint8Array(e).buffer],{
                                type: Browser.getMimetype(t)
                            }))
                        } catch (e) {
                            Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder")
                        }
                    if (!o) {
                        var i = new Browser.BlobBuilder;
                        i.append(new Uint8Array(e).buffer),
                        o = i.getBlob()
                    }
                    var a = Browser.URLObject.createObjectURL(o)
                      , s = new Image;
                    s.onload = function() {
                        assert(s.complete, "Image " + t + " could not be decoded");
                        var r = document.createElement("canvas");
                        r.width = s.width,
                        r.height = s.height,
                        r.getContext("2d").drawImage(s, 0, 0),
                        Module.preloadedImages[t] = r,
                        Browser.URLObject.revokeObjectURL(a),
                        n && n(e)
                    }
                    ,
                    s.onerror = function(e) {
                        console.log("Image " + a + " could not be decoded"),
                        r && r()
                    }
                    ,
                    s.src = a
                }
            };
            Module.preloadPlugins.push(e);
            var t = {
                canHandle: function(e) {
                    return !Module.noAudioDecoding && e.substr(-4)in {
                        ".ogg": 1,
                        ".wav": 1,
                        ".mp3": 1
                    }
                },
                handle: function(e, t, n, r) {
                    var o = !1;
                    function i(r) {
                        o || (o = !0,
                        Module.preloadedAudios[t] = r,
                        n && n(e))
                    }
                    function a() {
                        o || (o = !0,
                        Module.preloadedAudios[t] = new Audio,
                        r && r())
                    }
                    if (!Browser.hasBlobConstructor)
                        return a();
                    try {
                        var s = new Blob([e],{
                            type: Browser.getMimetype(t)
                        })
                    } catch (e) {
                        return a()
                    }
                    var u = Browser.URLObject.createObjectURL(s)
                      , l = new Audio;
                    l.addEventListener("canplaythrough", function() {
                        i(l)
                    }, !1),
                    l.onerror = function(n) {
                        o || (console.log("warning: browser could not fully decode audio " + t + ", trying slower base64 approach"),
                        l.src = "data:audio/x-" + t.substr(-3) + ";base64," + function(e) {
                            for (var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", n = "", r = 0, o = 0, i = 0; i < e.length; i++)
                                for (r = r << 8 | e[i],
                                o += 8; o >= 6; ) {
                                    var a = r >> o - 6 & 63;
                                    o -= 6,
                                    n += t[a]
                                }
                            return 2 == o ? (n += t[(3 & r) << 4],
                            n += "==") : 4 == o && (n += t[(15 & r) << 2],
                            n += "="),
                            n
                        }(e),
                        i(l))
                    }
                    ,
                    l.src = u,
                    Browser.safeSetTimeout(function() {
                        i(l)
                    }, 1e4)
                }
            };
            Module.preloadPlugins.push(t);
            var n = Module.canvas;
            n && (n.requestPointerLock = n.requestPointerLock || n.mozRequestPointerLock || n.webkitRequestPointerLock || n.msRequestPointerLock || function() {}
            ,
            n.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {}
            ,
            n.exitPointerLock = n.exitPointerLock.bind(document),
            document.addEventListener("pointerlockchange", r, !1),
            document.addEventListener("mozpointerlockchange", r, !1),
            document.addEventListener("webkitpointerlockchange", r, !1),
            document.addEventListener("mspointerlockchange", r, !1),
            Module.elementPointerLock && n.addEventListener("click", function(e) {
                !Browser.pointerLock && Module.canvas.requestPointerLock && (Module.canvas.requestPointerLock(),
                e.preventDefault())
            }, !1))
        }
        function r() {
            Browser.pointerLock = document.pointerLockElement === Module.canvas || document.mozPointerLockElement === Module.canvas || document.webkitPointerLockElement === Module.canvas || document.msPointerLockElement === Module.canvas
        }
    },
    createContext: function(e, t, n, r) {
        if (t && Module.ctx && e == Module.canvas)
            return Module.ctx;
        var o, i;
        if (t) {
            var a = {
                antialias: !1,
                alpha: !1
            };
            if (r)
                for (var s in r)
                    a[s] = r[s];
            (i = GL.createContext(e, a)) && (o = GL.getContext(i).GLctx)
        } else
            o = e.getContext("2d");
        return o ? (n && (t || assert(void 0 === GLctx, "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"),
        Module.ctx = o,
        t && GL.makeContextCurrent(i),
        Module.useWebGL = t,
        Browser.moduleContextCreatedCallbacks.forEach(function(e) {
            e()
        }),
        Browser.init()),
        o) : null
    },
    destroyContext: function(e, t, n) {},
    fullscreenHandlersInstalled: !1,
    lockPointer: void 0,
    resizeCanvas: void 0,
    requestFullscreen: function(e, t, n) {
        Browser.lockPointer = e,
        Browser.resizeCanvas = t,
        Browser.vrDevice = n,
        void 0 === Browser.lockPointer && (Browser.lockPointer = !0),
        void 0 === Browser.resizeCanvas && (Browser.resizeCanvas = !1),
        void 0 === Browser.vrDevice && (Browser.vrDevice = null);
        var r = Module.canvas;
        function o() {
            Browser.isFullscreen = !1;
            var e = r.parentNode;
            (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === e ? (r.exitFullscreen = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || function() {}
            ,
            r.exitFullscreen = r.exitFullscreen.bind(document),
            Browser.lockPointer && r.requestPointerLock(),
            Browser.isFullscreen = !0,
            Browser.resizeCanvas && Browser.setFullscreenCanvasSize()) : (e.parentNode.insertBefore(r, e),
            e.parentNode.removeChild(e),
            Browser.resizeCanvas && Browser.setWindowedCanvasSize()),
            Module.onFullScreen && Module.onFullScreen(Browser.isFullscreen),
            Module.onFullscreen && Module.onFullscreen(Browser.isFullscreen),
            Browser.updateCanvasDimensions(r)
        }
        Browser.fullscreenHandlersInstalled || (Browser.fullscreenHandlersInstalled = !0,
        document.addEventListener("fullscreenchange", o, !1),
        document.addEventListener("mozfullscreenchange", o, !1),
        document.addEventListener("webkitfullscreenchange", o, !1),
        document.addEventListener("MSFullscreenChange", o, !1));
        var i = document.createElement("div");
        r.parentNode.insertBefore(i, r),
        i.appendChild(r),
        i.requestFullscreen = i.requestFullscreen || i.mozRequestFullScreen || i.msRequestFullscreen || (i.webkitRequestFullscreen ? function() {
            i.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        : null) || (i.webkitRequestFullScreen ? function() {
            i.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        : null),
        n ? i.requestFullscreen({
            vrDisplay: n
        }) : i.requestFullscreen()
    },
    requestFullScreen: function(e, t, n) {
        return Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead."),
        Browser.requestFullScreen = function(e, t, n) {
            return Browser.requestFullscreen(e, t, n)
        }
        ,
        Browser.requestFullscreen(e, t, n)
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function(e) {
        var t = Date.now();
        if (0 === Browser.nextRAF)
            Browser.nextRAF = t + 1e3 / 60;
        else
            for (; t + 2 >= Browser.nextRAF; )
                Browser.nextRAF += 1e3 / 60;
        var n = Math.max(Browser.nextRAF - t, 0);
        setTimeout(e, n)
    },
    requestAnimationFrame: function(e) {
        "undefined" == typeof window ? Browser.fakeRequestAnimationFrame(e) : (window.requestAnimationFrame || (window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || Browser.fakeRequestAnimationFrame),
        window.requestAnimationFrame(e))
    },
    safeCallback: function(e) {
        return function() {
            if (!ABORT)
                return e.apply(null, arguments)
        }
    },
    allowAsyncCallbacks: !0,
    queuedAsyncCallbacks: [],
    pauseAsyncCallbacks: function() {
        Browser.allowAsyncCallbacks = !1
    },
    resumeAsyncCallbacks: function() {
        if (Browser.allowAsyncCallbacks = !0,
        Browser.queuedAsyncCallbacks.length > 0) {
            var e = Browser.queuedAsyncCallbacks;
            Browser.queuedAsyncCallbacks = [],
            e.forEach(function(e) {
                e()
            })
        }
    },
    safeRequestAnimationFrame: function(e) {
        return Browser.requestAnimationFrame(function() {
            ABORT || (Browser.allowAsyncCallbacks ? e() : Browser.queuedAsyncCallbacks.push(e))
        })
    },
    safeSetTimeout: function(e, t) {
        return Module.noExitRuntime = !0,
        setTimeout(function() {
            ABORT || (Browser.allowAsyncCallbacks ? e() : Browser.queuedAsyncCallbacks.push(e))
        }, t)
    },
    safeSetInterval: function(e, t) {
        return Module.noExitRuntime = !0,
        setInterval(function() {
            ABORT || Browser.allowAsyncCallbacks && e()
        }, t)
    },
    getMimetype: function(e) {
        return {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            ogg: "audio/ogg",
            wav: "audio/wav",
            mp3: "audio/mpeg"
        }[e.substr(e.lastIndexOf(".") + 1)]
    },
    getUserMedia: function(e) {
        window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia),
        window.getUserMedia(e)
    },
    getMovementX: function(e) {
        return e.movementX || e.mozMovementX || e.webkitMovementX || 0
    },
    getMovementY: function(e) {
        return e.movementY || e.mozMovementY || e.webkitMovementY || 0
    },
    getMouseWheelDelta: function(e) {
        var t = 0;
        switch (e.type) {
        case "DOMMouseScroll":
            t = e.detail;
            break;
        case "mousewheel":
            t = e.wheelDelta;
            break;
        case "wheel":
            t = e.deltaY;
            break;
        default:
            throw "unrecognized mouse wheel event: " + e.type
        }
        return t
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function(e) {
        if (Browser.pointerLock)
            "mousemove" != e.type && "mozMovementX"in e ? Browser.mouseMovementX = Browser.mouseMovementY = 0 : (Browser.mouseMovementX = Browser.getMovementX(e),
            Browser.mouseMovementY = Browser.getMovementY(e)),
            void 0 !== SDL ? (Browser.mouseX = SDL.mouseX + Browser.mouseMovementX,
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY) : (Browser.mouseX += Browser.mouseMovementX,
            Browser.mouseY += Browser.mouseMovementY);
        else {
            var t = Module.canvas.getBoundingClientRect()
              , n = Module.canvas.width
              , r = Module.canvas.height
              , o = void 0 !== window.scrollX ? window.scrollX : window.pageXOffset
              , i = void 0 !== window.scrollY ? window.scrollY : window.pageYOffset;
            if ("touchstart" === e.type || "touchend" === e.type || "touchmove" === e.type) {
                var a = e.touch;
                if (void 0 === a)
                    return;
                var s = a.pageX - (o + t.left)
                  , u = a.pageY - (i + t.top)
                  , l = {
                    x: s *= n / t.width,
                    y: u *= r / t.height
                };
                if ("touchstart" === e.type)
                    Browser.lastTouches[a.identifier] = l,
                    Browser.touches[a.identifier] = l;
                else if ("touchend" === e.type || "touchmove" === e.type) {
                    var c = Browser.touches[a.identifier];
                    c || (c = l),
                    Browser.lastTouches[a.identifier] = c,
                    Browser.touches[a.identifier] = l
                }
                return
            }
            var d = e.pageX - (o + t.left)
              , f = e.pageY - (i + t.top);
            d *= n / t.width,
            f *= r / t.height,
            Browser.mouseMovementX = d - Browser.mouseX,
            Browser.mouseMovementY = f - Browser.mouseY,
            Browser.mouseX = d,
            Browser.mouseY = f
        }
    },
    asyncLoad: function(e, t, n, r) {
        var o = r ? "" : getUniqueRunDependency("al " + e);
        Module.readAsync(e, function(n) {
            assert(n, 'Loading data file "' + e + '" failed (no arrayBuffer).'),
            t(new Uint8Array(n)),
            o && removeRunDependency(o)
        }, function(t) {
            if (!n)
                throw 'Loading data file "' + e + '" failed.';
            n()
        }),
        o && addRunDependency(o)
    },
    resizeListeners: [],
    updateResizeListeners: function() {
        var e = Module.canvas;
        Browser.resizeListeners.forEach(function(t) {
            t(e.width, e.height)
        })
    },
    setCanvasSize: function(e, t, n) {
        var r = Module.canvas;
        Browser.updateCanvasDimensions(r, e, t),
        n || Browser.updateResizeListeners()
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: function() {
        if (void 0 !== SDL) {
            var e = HEAPU32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2];
            e |= 8388608,
            HEAP32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2] = e
        }
        Browser.updateResizeListeners()
    },
    setWindowedCanvasSize: function() {
        if (void 0 !== SDL) {
            var e = HEAPU32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2];
            e &= -8388609,
            HEAP32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2] = e
        }
        Browser.updateResizeListeners()
    },
    updateCanvasDimensions: function(e, t, n) {
        t && n ? (e.widthNative = t,
        e.heightNative = n) : (t = e.widthNative,
        n = e.heightNative);
        var r = t
          , o = n;
        if (Module.forcedAspectRatio && Module.forcedAspectRatio > 0 && (r / o < Module.forcedAspectRatio ? r = Math.round(o * Module.forcedAspectRatio) : o = Math.round(r / Module.forcedAspectRatio)),
        (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === e.parentNode && "undefined" != typeof screen) {
            var i = Math.min(screen.width / r, screen.height / o);
            r = Math.round(r * i),
            o = Math.round(o * i)
        }
        Browser.resizeCanvas ? (e.width != r && (e.width = r),
        e.height != o && (e.height = o),
        void 0 !== e.style && (e.style.removeProperty("width"),
        e.style.removeProperty("height"))) : (e.width != t && (e.width = t),
        e.height != n && (e.height = n),
        void 0 !== e.style && (r != t || o != n ? (e.style.setProperty("width", r + "px", "important"),
        e.style.setProperty("height", o + "px", "important")) : (e.style.removeProperty("width"),
        e.style.removeProperty("height"))))
    },
    wgetRequests: {},
    nextWgetRequestHandle: 0,
    getNextWgetRequestHandle: function() {
        var e = Browser.nextWgetRequestHandle;
        return Browser.nextWgetRequestHandle++,
        e
    }
}
  , _environ = STATICTOP;
function ___buildEnvironment(e) {
    var t, n;
    ___buildEnvironment.called ? (n = HEAP32[_environ >> 2],
    t = HEAP32[n >> 2]) : (___buildEnvironment.called = !0,
    ENV.USER = ENV.LOGNAME = "web_user",
    ENV.PATH = "/",
    ENV.PWD = "/",
    ENV.HOME = "/home/web_user",
    ENV.LANG = "C",
    ENV._ = Module.thisProgram,
    t = allocate(1024, "i8", ALLOC_STATIC),
    n = allocate(256, "i8*", ALLOC_STATIC),
    HEAP32[n >> 2] = t,
    HEAP32[_environ >> 2] = n);
    var r = []
      , o = 0;
    for (var i in e)
        if ("string" == typeof e[i]) {
            var a = i + "=" + e[i];
            r.push(a),
            o += a.length
        }
    if (o > 1024)
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
    for (var s = 0; s < r.length; s++) {
        writeAsciiToMemory(a = r[s], t),
        HEAP32[n + 4 * s >> 2] = t,
        t += a.length + 1
    }
    HEAP32[n + 4 * r.length >> 2] = 0
}
STATICTOP += 16;
var ENV = {};
function _getenv(e) {
    return 0 === e ? 0 : (e = Pointer_stringify(e),
    ENV.hasOwnProperty(e) ? (_getenv.ret && _free(_getenv.ret),
    _getenv.ret = allocate(intArrayFromString(ENV[e]), "i8", ALLOC_NORMAL),
    _getenv.ret) : 0)
}
function _putenv(e) {
    if (0 === e)
        return ___setErrNo(ERRNO_CODES.EINVAL),
        -1;
    var t = (e = Pointer_stringify(e)).indexOf("=");
    if ("" === e || -1 === e.indexOf("="))
        return ___setErrNo(ERRNO_CODES.EINVAL),
        -1;
    var n = e.slice(0, t)
      , r = e.slice(t + 1);
    return n in ENV && ENV[n] === r || (ENV[n] = r,
    ___buildEnvironment(ENV)),
    0
}
function _SDL_RWFromConstMem(e, t) {
    var n = SDL.rwops.length;
    return SDL.rwops.push({
        bytes: e,
        count: t
    }),
    n
}
function _TTF_FontHeight(e) {
    return SDL.fonts[e].size
}
function _TTF_SizeText(e, t, n, r) {
    var o = SDL.fonts[e];
    return n && (HEAP32[n >> 2] = SDL.estimateTextWidth(o, Pointer_stringify(t))),
    r && (HEAP32[r >> 2] = o.size),
    0
}
function _TTF_RenderText_Solid(e, t, n) {
    t = Pointer_stringify(t) || " ";
    var r = SDL.fonts[e]
      , o = SDL.estimateTextWidth(r, t)
      , i = r.size
      , a = (n = SDL.loadColorToCSSRGB(n),
    i + "px " + r.name + ", serif")
      , s = SDL.makeSurface(o, i, 0, !1, "text:" + t)
      , u = SDL.surfaces[s];
    return u.ctx.save(),
    u.ctx.fillStyle = n,
    u.ctx.font = a,
    u.ctx.textBaseline = "bottom",
    u.ctx.fillText(t, 0, 0 | i),
    u.ctx.restore(),
    s
}
function _Mix_HaltMusic() {
    var e = SDL.music.audio;
    return e && (e.src = e.src,
    e.currentPosition = 0,
    e.pause()),
    SDL.music.audio = null,
    SDL.hookMusicFinished && Module.dynCall_v(SDL.hookMusicFinished),
    0
}
function _Mix_PlayMusic(e, t) {
    SDL.music.audio && (SDL.music.audio.paused || Module.printErr("Music is already playing. " + SDL.music.source),
    SDL.music.audio.pause());
    var n, r = SDL.audios[e];
    return r.webAudio ? ((n = {}).resource = r,
    n.paused = !1,
    n.currentPosition = 0,
    n.play = function() {
        SDL.playWebAudio(this)
    }
    ,
    n.pause = function() {
        SDL.pauseWebAudio(this)
    }
    ) : r.audio && (n = r.audio),
    n.onended = function() {
        SDL.music.audio == this && _Mix_HaltMusic()
    }
    ,
    n.loop = 0 != t,
    n.volume = SDL.music.volume,
    SDL.music.audio = n,
    n.play(),
    0
}
function _Mix_FreeChunk(e) {
    SDL.audios[e] = null
}
function _Mix_LoadWAV_RW(e, t) {
    var n = SDL.rwops[e];
    if (void 0 === n)
        return 0;
    var r, o, i, a = "";
    if (void 0 !== n.filename) {
        a = PATH.resolve(n.filename);
        var s = Module.preloadedAudios[a];
        if (!s) {
            null === s && Module.printErr("Trying to reuse preloaded audio, but freePreloadedMediaOnUse is set!"),
            Module.noAudioDecoding || Runtime.warnOnce("Cannot find preloaded audio " + a);
            try {
                i = FS.readFile(a)
            } catch (e) {
                return Module.printErr("Couldn't find file for: " + a),
                0
            }
        }
        Module.freePreloadedMediaOnUse && (Module.preloadedAudios[a] = null),
        r = s
    } else {
        if (void 0 === n.bytes)
            return 0;
        i = SDL.webAudioAvailable() ? HEAPU8.buffer.slice(n.bytes, n.bytes + n.count) : HEAPU8.subarray(n.bytes, n.bytes + n.count)
    }
    var u = i && i.buffer || i
      , l = void 0 === Module.SDL_canPlayWithWebAudio || Module.SDL_canPlayWithWebAudio(a, u);
    if (void 0 !== i && SDL.webAudioAvailable() && l) {
        r = void 0,
        (o = {}).onDecodeComplete = [],
        SDL.audioContext.decodeAudioData(u, function(e) {
            o.decodedBuffer = e,
            o.onDecodeComplete.forEach(function(e) {
                e()
            }),
            o.onDecodeComplete = void 0
        })
    } else if (void 0 === r && i) {
        var c = new Blob([i],{
            type: n.mimetype
        })
          , d = URL.createObjectURL(c);
        (r = new Audio).src = d,
        r.mozAudioChannelType = "content"
    }
    var f = SDL.audios.length;
    return SDL.audios.push({
        source: a,
        audio: r,
        webAudio: o
    }),
    f
}
function _Mix_PlayChannel(e, t, n) {
    var r = SDL.audios[t];
    if (!r)
        return -1;
    if (!r.audio && !r.webAudio)
        return -1;
    if (-1 == e) {
        for (var o = SDL.channelMinimumNumber; o < SDL.numChannels; o++)
            if (!SDL.channels[o].audio) {
                e = o;
                break
            }
        if (-1 == e)
            return Module.printErr("All " + SDL.numChannels + " channels in use!"),
            -1
    }
    var i, a = SDL.channels[e];
    return r.webAudio ? ((i = {}).resource = r,
    i.paused = !1,
    i.currentPosition = 0,
    i.play = function() {
        SDL.playWebAudio(this)
    }
    ,
    i.pause = function() {
        SDL.pauseWebAudio(this)
    }
    ) : ((i = r.audio.cloneNode(!0)).numChannels = r.audio.numChannels,
    i.frequency = r.audio.frequency),
    i.onended = function() {
        a.audio == this && (a.audio.paused = !0,
        a.audio = null),
        SDL.channelFinished && Runtime.getFuncWrapper(SDL.channelFinished, "vi")(e)
    }
    ,
    a.audio = i,
    i.loop = 0 != n,
    i.volume = a.volume,
    i.play(),
    e
}
function _SDL_PauseAudio(e) {
    SDL.audio && (e ? void 0 !== SDL.audio.timer && (clearTimeout(SDL.audio.timer),
    SDL.audio.numAudioTimersPending = 0,
    SDL.audio.timer = void 0) : SDL.audio.timer || (SDL.audio.numAudioTimersPending = 1,
    SDL.audio.timer = Browser.safeSetTimeout(SDL.audio.caller, 1)),
    SDL.audio.paused = e)
}
function _SDL_CloseAudio() {
    SDL.audio && (_SDL_PauseAudio(1),
    _free(SDL.audio.buffer),
    SDL.audio = null,
    SDL.allocateChannels(0))
}
function _SDL_LockSurface(e) {
    var t = SDL.surfaces[e];
    if (t.locked++,
    t.locked > 1)
        return 0;
    if (t.buffer || (t.buffer = _malloc(t.width * t.height * 4),
    HEAP32[e + 20 >> 2] = t.buffer),
    HEAP32[e + 20 >> 2] = t.buffer,
    e == SDL.screen && Module.screenIsReadOnly && t.image)
        return 0;
    if (SDL.defaults.discardOnLock) {
        if (t.image || (t.image = t.ctx.createImageData(t.width, t.height)),
        !SDL.defaults.opaqueFrontBuffer)
            return
    } else
        t.image = t.ctx.getImageData(0, 0, t.width, t.height);
    if (e == SDL.screen && SDL.defaults.opaqueFrontBuffer)
        for (var n = t.image.data, r = n.length, o = 0; o < r / 4; o++)
            n[4 * o + 3] = 255;
    if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
        if (t.isFlagSet(2097152))
            throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + (new Error).stack;
        HEAPU8.set(t.image.data, t.buffer)
    }
    return 0
}
function _SDL_FreeRW(e) {
    for (SDL.rwops[e] = null; SDL.rwops.length > 0 && null === SDL.rwops[SDL.rwops.length - 1]; )
        SDL.rwops.pop()
}
function _IMG_Load_RW(e, t) {
    try {
        var n = function() {
            r && t && _SDL_FreeRW(e)
        }
          , r = SDL.rwops[e];
        if (void 0 === r)
            return 0;
        var o = r.filename;
        if (void 0 === o)
            return Runtime.warnOnce("Only file names that have been preloaded are supported for IMG_Load_RW. Consider using STB_IMAGE=1 if you want synchronous image decoding (see settings.js), or package files with --use-preload-plugins"),
            0;
        if (!i) {
            o = PATH.resolve(o);
            var i = Module.preloadedImages[o];
            if (!i)
                return null === i && Module.printErr("Trying to reuse preloaded image, but freePreloadedMediaOnUse is set!"),
                Runtime.warnOnce("Cannot find preloaded image " + o),
                Runtime.warnOnce("Cannot find preloaded image " + o + ". Consider using STB_IMAGE=1 if you want synchronous image decoding (see settings.js), or package files with --use-preload-plugins"),
                0;
            Module.freePreloadedMediaOnUse && (Module.preloadedImages[o] = null)
        }
        var a = SDL.makeSurface(i.width, i.height, 0, !1, "load:" + o)
          , s = SDL.surfaces[a];
        if (s.ctx.globalCompositeOperation = "copy",
        i.rawData) {
            var u = s.ctx.getImageData(0, 0, s.width, s.height);
            if (4 == i.bpp)
                u.data.set(HEAPU8.subarray(i.data, i.data + i.size));
            else if (3 == i.bpp)
                for (var l = i.size / 3, c = u.data, d = i.data, f = 0, S = 0; S < l; S++)
                    c[f++] = HEAPU8[d++ >> 0],
                    c[f++] = HEAPU8[d++ >> 0],
                    c[f++] = HEAPU8[d++ >> 0],
                    c[f++] = 255;
            else if (2 == i.bpp)
                for (l = i.size,
                c = u.data,
                d = i.data,
                f = 0,
                S = 0; S < l; S++) {
                    var m = HEAPU8[d++ >> 0]
                      , E = HEAPU8[d++ >> 0];
                    c[f++] = m,
                    c[f++] = m,
                    c[f++] = m,
                    c[f++] = E
                }
            else {
                if (1 != i.bpp)
                    return Module.printErr("cannot handle bpp " + i.bpp),
                    0;
                for (l = i.size,
                c = u.data,
                d = i.data,
                f = 0,
                S = 0; S < l; S++) {
                    var p = HEAPU8[d++ >> 0];
                    c[f++] = p,
                    c[f++] = p,
                    c[f++] = p,
                    c[f++] = 255
                }
            }
            s.ctx.putImageData(u, 0, 0)
        } else
            s.ctx.drawImage(i, 0, 0, i.width, i.height, 0, 0, i.width, i.height);
        return s.ctx.globalCompositeOperation = "source-over",
        _SDL_LockSurface(a),
        s.locked--,
        SDL.GL && (s.canvas = s.ctx = null),
        a
    } finally {
        n()
    }
}
function _SDL_RWFromFile(e, t) {
    var n = SDL.rwops.length
      , r = Pointer_stringify(e);
    return SDL.rwops.push({
        filename: r,
        mimetype: Browser.getMimetype(r)
    }),
    n
}
function _IMG_Load(e) {
    return _IMG_Load_RW(_SDL_RWFromFile(e), 1)
}
function _SDL_UpperBlitScaled(e, t, n, r) {
    return SDL.blitSurface(e, t, n, r, !0)
}
function _SDL_UpperBlit(e, t, n, r) {
    return SDL.blitSurface(e, t, n, r, !1)
}
function _SDL_GetTicks() {
    return Date.now() - SDL.startTime | 0
}
var SDL = {
    defaults: {
        width: 320,
        height: 200,
        copyOnLock: !0,
        discardOnLock: !1,
        opaqueFrontBuffer: !0
    },
    version: null,
    surfaces: {},
    canvasPool: [],
    events: [],
    fonts: [null],
    audios: [null],
    rwops: [null],
    music: {
        audio: null,
        volume: 1
    },
    mixerFrequency: 22050,
    mixerFormat: 32784,
    mixerNumChannels: 2,
    mixerChunkSize: 1024,
    channelMinimumNumber: 0,
    GL: !1,
    glAttributes: {
        0: 3,
        1: 3,
        2: 2,
        3: 0,
        4: 0,
        5: 1,
        6: 16,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 1,
        16: 0,
        17: 0,
        18: 0
    },
    keyboardState: null,
    keyboardMap: {},
    canRequestFullscreen: !1,
    isRequestingFullscreen: !1,
    textInput: !1,
    startTime: null,
    initFlags: 0,
    buttonState: 0,
    modState: 0,
    DOMButtons: [0, 0, 0],
    DOMEventToSDLEvent: {},
    TOUCH_DEFAULT_ID: 0,
    eventHandler: null,
    eventHandlerContext: null,
    eventHandlerTemp: 0,
    keyCodes: {
        16: 1249,
        17: 1248,
        18: 1250,
        20: 1081,
        33: 1099,
        34: 1102,
        35: 1101,
        36: 1098,
        37: 1104,
        38: 1106,
        39: 1103,
        40: 1105,
        44: 316,
        45: 1097,
        46: 127,
        91: 1251,
        93: 1125,
        96: 1122,
        97: 1113,
        98: 1114,
        99: 1115,
        100: 1116,
        101: 1117,
        102: 1118,
        103: 1119,
        104: 1120,
        105: 1121,
        106: 1109,
        107: 1111,
        109: 1110,
        110: 1123,
        111: 1108,
        112: 1082,
        113: 1083,
        114: 1084,
        115: 1085,
        116: 1086,
        117: 1087,
        118: 1088,
        119: 1089,
        120: 1090,
        121: 1091,
        122: 1092,
        123: 1093,
        124: 1128,
        125: 1129,
        126: 1130,
        127: 1131,
        128: 1132,
        129: 1133,
        130: 1134,
        131: 1135,
        132: 1136,
        133: 1137,
        134: 1138,
        135: 1139,
        144: 1107,
        160: 94,
        161: 33,
        162: 34,
        163: 35,
        164: 36,
        165: 37,
        166: 38,
        167: 95,
        168: 40,
        169: 41,
        170: 42,
        171: 43,
        172: 124,
        173: 45,
        174: 123,
        175: 125,
        176: 126,
        181: 127,
        182: 129,
        183: 128,
        188: 44,
        190: 46,
        191: 47,
        192: 96,
        219: 91,
        220: 92,
        221: 93,
        222: 39,
        224: 1251
    },
    scanCodes: {
        8: 42,
        9: 43,
        13: 40,
        27: 41,
        32: 44,
        35: 204,
        39: 53,
        44: 54,
        46: 55,
        47: 56,
        48: 39,
        49: 30,
        50: 31,
        51: 32,
        52: 33,
        53: 34,
        54: 35,
        55: 36,
        56: 37,
        57: 38,
        58: 203,
        59: 51,
        61: 46,
        91: 47,
        92: 49,
        93: 48,
        96: 52,
        97: 4,
        98: 5,
        99: 6,
        100: 7,
        101: 8,
        102: 9,
        103: 10,
        104: 11,
        105: 12,
        106: 13,
        107: 14,
        108: 15,
        109: 16,
        110: 17,
        111: 18,
        112: 19,
        113: 20,
        114: 21,
        115: 22,
        116: 23,
        117: 24,
        118: 25,
        119: 26,
        120: 27,
        121: 28,
        122: 29,
        127: 76,
        305: 224,
        308: 226,
        316: 70
    },
    loadRect: function(e) {
        return {
            x: HEAP32[e + 0 >> 2],
            y: HEAP32[e + 4 >> 2],
            w: HEAP32[e + 8 >> 2],
            h: HEAP32[e + 12 >> 2]
        }
    },
    updateRect: function(e, t) {
        HEAP32[e >> 2] = t.x,
        HEAP32[e + 4 >> 2] = t.y,
        HEAP32[e + 8 >> 2] = t.w,
        HEAP32[e + 12 >> 2] = t.h
    },
    intersectionOfRects: function(e, t) {
        var n = Math.max(e.x, t.x)
          , r = Math.max(e.y, t.y)
          , o = Math.min(e.x + e.w, t.x + t.w)
          , i = Math.min(e.y + e.h, t.y + t.h);
        return {
            x: n,
            y: r,
            w: Math.max(n, o) - n,
            h: Math.max(r, i) - r
        }
    },
    checkPixelFormat: function(e) {},
    loadColorToCSSRGB: function(e) {
        var t = HEAP32[e >> 2];
        return "rgb(" + (255 & t) + "," + (t >> 8 & 255) + "," + (t >> 16 & 255) + ")"
    },
    loadColorToCSSRGBA: function(e) {
        var t = HEAP32[e >> 2];
        return "rgba(" + (255 & t) + "," + (t >> 8 & 255) + "," + (t >> 16 & 255) + "," + (t >> 24 & 255) / 255 + ")"
    },
    translateColorToCSSRGBA: function(e) {
        return "rgba(" + (255 & e) + "," + (e >> 8 & 255) + "," + (e >> 16 & 255) + "," + (e >>> 24) / 255 + ")"
    },
    translateRGBAToCSSRGBA: function(e, t, n, r) {
        return "rgba(" + (255 & e) + "," + (255 & t) + "," + (255 & n) + "," + (255 & r) / 255 + ")"
    },
    translateRGBAToColor: function(e, t, n, r) {
        return e | t << 8 | n << 16 | r << 24
    },
    makeSurface: function(e, t, n, r, o, i, a, s, u) {
        var l, c = 1 & (n = n || 0), d = 2097152 & n, f = 67108864 & n, S = _malloc(60), m = _malloc(44), E = d ? 1 : 4, p = 0;
        c || f || (p = _malloc(e * t * 4)),
        HEAP32[S >> 2] = n,
        HEAP32[S + 4 >> 2] = m,
        HEAP32[S + 8 >> 2] = e,
        HEAP32[S + 12 >> 2] = t,
        HEAP32[S + 16 >> 2] = e * E,
        HEAP32[S + 20 >> 2] = p,
        HEAP32[S + 36 >> 2] = 0,
        HEAP32[S + 40 >> 2] = 0,
        HEAP32[S + 44 >> 2] = Module.canvas.width,
        HEAP32[S + 48 >> 2] = Module.canvas.height,
        HEAP32[S + 56 >> 2] = 1,
        HEAP32[m >> 2] = -2042224636,
        HEAP32[m + 4 >> 2] = 0,
        HEAP8[m + 8 >> 0] = 8 * E,
        HEAP8[m + 9 >> 0] = E,
        HEAP32[m + 12 >> 2] = i || 255,
        HEAP32[m + 16 >> 2] = a || 65280,
        HEAP32[m + 20 >> 2] = s || 16711680,
        HEAP32[m + 24 >> 2] = u || 4278190080,
        SDL.GL = SDL.GL || f,
        r ? l = Module.canvas : ((l = SDL.canvasPool.length > 0 ? SDL.canvasPool.pop() : document.createElement("canvas")).width = e,
        l.height = t);
        var v = {
            antialias: 0 != SDL.glAttributes[13] && SDL.glAttributes[14] > 1,
            depth: SDL.glAttributes[6] > 0,
            stencil: SDL.glAttributes[7] > 0,
            alpha: SDL.glAttributes[3] > 0
        }
          , _ = Browser.createContext(l, f, r, v);
        return SDL.surfaces[S] = {
            width: e,
            height: t,
            canvas: l,
            ctx: _,
            surf: S,
            buffer: p,
            pixelFormat: m,
            alpha: 255,
            flags: n,
            locked: 0,
            usePageCanvas: r,
            source: o,
            isFlagSet: function(e) {
                return n & e
            }
        },
        S
    },
    copyIndexedColorData: function(e, t, n, r, o) {
        if (e.colors) {
            var i = Module.canvas.width
              , a = Module.canvas.height
              , s = t || 0
              , u = n || 0
              , l = (r || i - s) + s
              , c = (o || a - u) + u
              , d = e.buffer;
            e.image.data32 || (e.image.data32 = new Uint32Array(e.image.data.buffer));
            for (var f = e.image.data32, S = e.colors32, m = u; m < c; ++m)
                for (var E = m * i, p = s; p < l; ++p)
                    f[E + p] = S[HEAPU8[d + E + p >> 0]]
        }
    },
    freeSurface: function(e) {
        var t = e + 56
          , n = HEAP32[t >> 2];
        if (n > 1)
            HEAP32[t >> 2] = n - 1;
        else {
            var r = SDL.surfaces[e];
            !r.usePageCanvas && r.canvas && SDL.canvasPool.push(r.canvas),
            r.buffer && _free(r.buffer),
            _free(r.pixelFormat),
            _free(e),
            SDL.surfaces[e] = null,
            e === SDL.screen && (SDL.screen = null)
        }
    },
    blitSurface__deps: ["SDL_LockSurface"],
    blitSurface: function(e, t, n, r, o) {
        var i, a, s, u, l = SDL.surfaces[e], c = SDL.surfaces[n];
        if (i = t ? SDL.loadRect(t) : {
            x: 0,
            y: 0,
            w: l.width,
            h: l.height
        },
        a = r ? SDL.loadRect(r) : {
            x: 0,
            y: 0,
            w: l.width,
            h: l.height
        },
        c.clipRect) {
            var d = o && 0 !== i.w ? i.w / a.w : 1
              , f = o && 0 !== i.h ? i.h / a.h : 1;
            a = SDL.intersectionOfRects(c.clipRect, a),
            i.w = a.w * d,
            i.h = a.h * f,
            r && SDL.updateRect(r, a)
        }
        if (o ? (s = a.w,
        u = a.h) : (s = i.w,
        u = i.h),
        0 === i.w || 0 === i.h || 0 === s || 0 === u)
            return 0;
        var S = c.ctx.globalAlpha;
        return c.ctx.globalAlpha = l.alpha / 255,
        c.ctx.drawImage(l.canvas, i.x, i.y, i.w, i.h, a.x, a.y, s, u),
        c.ctx.globalAlpha = S,
        n != SDL.screen && (Runtime.warnOnce("WARNING: copying canvas data to memory for compatibility"),
        _SDL_LockSurface(n),
        c.locked--),
        0
    },
    downFingers: {},
    savedKeydown: null,
    receiveEvent: function(e) {
        function t() {
            for (var e in SDL.keyboardMap)
                SDL.events.push({
                    type: "keyup",
                    keyCode: SDL.keyboardMap[e]
                })
        }
        switch (e.type) {
        case "touchstart":
        case "touchmove":
            e.preventDefault();
            var n = [];
            if ("touchstart" === e.type)
                for (var r = 0; r < e.touches.length; r++) {
                    var o = e.touches[r];
                    1 != SDL.downFingers[o.identifier] && (SDL.downFingers[o.identifier] = !0,
                    n.push(o))
                }
            else
                n = e.touches;
            var i = n[0];
            if (i) {
                var a;
                switch ("touchstart" == e.type && (SDL.DOMButtons[0] = 1),
                e.type) {
                case "touchstart":
                    a = "mousedown";
                    break;
                case "touchmove":
                    a = "mousemove"
                }
                var s = {
                    type: a,
                    button: 0,
                    pageX: i.clientX,
                    pageY: i.clientY
                };
                SDL.events.push(s)
            }
            for (r = 0; r < n.length; r++) {
                o = n[r];
                SDL.events.push({
                    type: e.type,
                    touch: o
                })
            }
            break;
        case "touchend":
            e.preventDefault();
            for (r = 0; r < e.changedTouches.length; r++) {
                o = e.changedTouches[r];
                !0 === SDL.downFingers[o.identifier] && delete SDL.downFingers[o.identifier]
            }
            s = {
                type: "mouseup",
                button: 0,
                pageX: e.changedTouches[0].clientX,
                pageY: e.changedTouches[0].clientY
            };
            SDL.DOMButtons[0] = 0,
            SDL.events.push(s);
            for (r = 0; r < e.changedTouches.length; r++) {
                o = e.changedTouches[r];
                SDL.events.push({
                    type: "touchend",
                    touch: o
                })
            }
            break;
        case "DOMMouseScroll":
        case "mousewheel":
        case "wheel":
            var u = -Browser.getMouseWheelDelta(e)
              , l = (u = 0 == u ? 0 : u > 0 ? Math.max(u, 1) : Math.min(u, -1)) > 0 ? 3 : 4;
            SDL.events.push({
                type: "mousedown",
                button: l,
                pageX: e.pageX,
                pageY: e.pageY
            }),
            SDL.events.push({
                type: "mouseup",
                button: l,
                pageX: e.pageX,
                pageY: e.pageY
            }),
            SDL.events.push({
                type: "wheel",
                deltaX: 0,
                deltaY: u
            }),
            e.preventDefault();
            break;
        case "mousemove":
            if (1 === SDL.DOMButtons[0] && SDL.events.push({
                type: "touchmove",
                touch: {
                    identifier: 0,
                    deviceID: -1,
                    pageX: e.pageX,
                    pageY: e.pageY
                }
            }),
            Browser.pointerLock && ("mozMovementX"in e && (e.movementX = e.mozMovementX,
            e.movementY = e.mozMovementY),
            0 == e.movementX && 0 == e.movementY))
                return void e.preventDefault();
        case "keydown":
        case "keyup":
        case "keypress":
        case "mousedown":
        case "mouseup":
            if ("keydown" === e.type && (SDL.unicode || SDL.textInput) && 8 !== e.keyCode && 9 !== e.keyCode || e.preventDefault(),
            "mousedown" == e.type)
                SDL.DOMButtons[e.button] = 1,
                SDL.events.push({
                    type: "touchstart",
                    touch: {
                        identifier: 0,
                        deviceID: -1,
                        pageX: e.pageX,
                        pageY: e.pageY
                    }
                });
            else if ("mouseup" == e.type) {
                if (!SDL.DOMButtons[e.button])
                    return;
                SDL.events.push({
                    type: "touchend",
                    touch: {
                        identifier: 0,
                        deviceID: -1,
                        pageX: e.pageX,
                        pageY: e.pageY
                    }
                }),
                SDL.DOMButtons[e.button] = 0
            }
            "keydown" === e.type || "mousedown" === e.type ? SDL.canRequestFullscreen = !0 : "keyup" !== e.type && "mouseup" !== e.type || (SDL.isRequestingFullscreen && (Module.requestFullscreen(!0, !0),
            SDL.isRequestingFullscreen = !1),
            SDL.canRequestFullscreen = !1),
            "keypress" === e.type && SDL.savedKeydown ? (SDL.savedKeydown.keypressCharCode = e.charCode,
            SDL.savedKeydown = null) : "keydown" === e.type && (SDL.savedKeydown = e),
            ("keypress" !== e.type || SDL.textInput) && SDL.events.push(e);
            break;
        case "mouseout":
            for (r = 0; r < 3; r++)
                SDL.DOMButtons[r] && (SDL.events.push({
                    type: "mouseup",
                    button: r,
                    pageX: e.pageX,
                    pageY: e.pageY
                }),
                SDL.DOMButtons[r] = 0);
            e.preventDefault();
            break;
        case "focus":
            SDL.events.push(e),
            e.preventDefault();
            break;
        case "blur":
            SDL.events.push(e),
            t(),
            e.preventDefault();
            break;
        case "visibilitychange":
            SDL.events.push({
                type: "visibilitychange",
                visible: !document.hidden
            }),
            t(),
            e.preventDefault();
            break;
        case "unload":
            return void (Browser.mainLoop.runner && (SDL.events.push(e),
            Browser.mainLoop.runner()));
        case "resize":
            SDL.events.push(e),
            e.preventDefault && e.preventDefault()
        }
        SDL.events.length >= 1e4 && (Module.printErr("SDL event queue full, dropping events"),
        SDL.events = SDL.events.slice(0, 1e4)),
        SDL.flushEventsToHandler()
    },
    lookupKeyCodeForEvent: function(e) {
        var t = e.keyCode;
        return t >= 65 && t <= 90 ? t += 32 : (t = SDL.keyCodes[e.keyCode] || e.keyCode,
        e.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT && t >= 1248 && t <= 1251 && (t += 4)),
        t
    },
    handleEvent: function(e) {
        if (!e.handled)
            switch (e.handled = !0,
            e.type) {
            case "touchstart":
            case "touchend":
            case "touchmove":
                Browser.calculateMouseEvent(e);
                break;
            case "keydown":
            case "keyup":
                var t = "keydown" === e.type
                  , n = SDL.lookupKeyCodeForEvent(e);
                HEAP8[SDL.keyboardState + n >> 0] = t,
                SDL.modState = (HEAP8[SDL.keyboardState + 1248 >> 0] ? 64 : 0) | (HEAP8[SDL.keyboardState + 1249 >> 0] ? 1 : 0) | (HEAP8[SDL.keyboardState + 1250 >> 0] ? 256 : 0) | (HEAP8[SDL.keyboardState + 1252 >> 0] ? 128 : 0) | (HEAP8[SDL.keyboardState + 1253 >> 0] ? 2 : 0) | (HEAP8[SDL.keyboardState + 1254 >> 0] ? 512 : 0),
                t ? SDL.keyboardMap[n] = e.keyCode : delete SDL.keyboardMap[n];
                break;
            case "mousedown":
            case "mouseup":
                "mousedown" == e.type ? SDL.buttonState |= 1 << e.button : "mouseup" == e.type && (SDL.buttonState &= ~(1 << e.button));
            case "mousemove":
                Browser.calculateMouseEvent(e)
            }
    },
    flushEventsToHandler: function() {
        if (SDL.eventHandler)
            for (; SDL.pollEvent(SDL.eventHandlerTemp); )
                Module.dynCall_iii(SDL.eventHandler, SDL.eventHandlerContext, SDL.eventHandlerTemp)
    },
    pollEvent: function(e) {
        if (512 & SDL.initFlags && SDL.joystickEventState && SDL.queryJoysticks(),
        e) {
            for (; SDL.events.length > 0; )
                if (!1 !== SDL.makeCEvent(SDL.events.shift(), e))
                    return 1;
            return 0
        }
        return SDL.events.length > 0
    },
    makeCEvent: function(e, t) {
        if ("number" == typeof e)
            return _memcpy(t, e, 28),
            void _free(e);
        switch (SDL.handleEvent(e),
        e.type) {
        case "keydown":
        case "keyup":
            var n, r = "keydown" === e.type, o = SDL.lookupKeyCodeForEvent(e);
            n = o >= 1024 ? o - 1024 : SDL.scanCodes[o] || o,
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP8[t + 8 >> 0] = r ? 1 : 0,
            HEAP8[t + 9 >> 0] = 0,
            HEAP32[t + 12 >> 2] = n,
            HEAP32[t + 16 >> 2] = o,
            HEAP16[t + 20 >> 1] = SDL.modState,
            HEAP32[t + 24 >> 2] = e.keypressCharCode || o;
            break;
        case "keypress":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type];
            for (var i = intArrayFromString(String.fromCharCode(e.charCode)), a = 0; a < i.length; ++a)
                HEAP8[t + (8 + a) >> 0] = i[a];
            break;
        case "mousedown":
        case "mouseup":
        case "mousemove":
            if ("mousemove" != e.type) {
                r = "mousedown" === e.type;
                HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
                HEAP32[t + 4 >> 2] = 0,
                HEAP32[t + 8 >> 2] = 0,
                HEAP32[t + 12 >> 2] = 0,
                HEAP8[t + 16 >> 0] = e.button + 1,
                HEAP8[t + 17 >> 0] = r ? 1 : 0,
                HEAP32[t + 20 >> 2] = Browser.mouseX,
                HEAP32[t + 24 >> 2] = Browser.mouseY
            } else
                HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
                HEAP32[t + 4 >> 2] = 0,
                HEAP32[t + 8 >> 2] = 0,
                HEAP32[t + 12 >> 2] = 0,
                HEAP32[t + 16 >> 2] = SDL.buttonState,
                HEAP32[t + 20 >> 2] = Browser.mouseX,
                HEAP32[t + 24 >> 2] = Browser.mouseY,
                HEAP32[t + 28 >> 2] = Browser.mouseMovementX,
                HEAP32[t + 32 >> 2] = Browser.mouseMovementY;
            break;
        case "wheel":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP32[t + 16 >> 2] = e.deltaX,
            HEAP32[t + 20 >> 2] = e.deltaY;
            break;
        case "touchstart":
        case "touchend":
        case "touchmove":
            var s = e.touch;
            if (!Browser.touches[s.identifier])
                break;
            var u = Module.canvas.width
              , l = Module.canvas.height
              , c = Browser.touches[s.identifier].x / u
              , d = Browser.touches[s.identifier].y / l
              , f = c - Browser.lastTouches[s.identifier].x / u
              , S = d - Browser.lastTouches[s.identifier].y / l;
            if (void 0 === s.deviceID && (s.deviceID = SDL.TOUCH_DEFAULT_ID),
            0 === f && 0 === S && "touchmove" === e.type)
                return !1;
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP32[t + 4 >> 2] = _SDL_GetTicks(),
            tempI64 = [s.deviceID >>> 0, (tempDouble = s.deviceID,
            +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
            HEAP32[t + 8 >> 2] = tempI64[0],
            HEAP32[t + 12 >> 2] = tempI64[1],
            tempI64 = [s.identifier >>> 0, (tempDouble = s.identifier,
            +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
            HEAP32[t + 16 >> 2] = tempI64[0],
            HEAP32[t + 20 >> 2] = tempI64[1],
            HEAPF32[t + 24 >> 2] = c,
            HEAPF32[t + 28 >> 2] = d,
            HEAPF32[t + 32 >> 2] = f,
            HEAPF32[t + 36 >> 2] = S,
            void 0 !== s.force ? HEAPF32[t + 40 >> 2] = s.force : HEAPF32[t + 40 >> 2] = "touchend" == e.type ? 0 : 1;
            break;
        case "unload":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type];
            break;
        case "resize":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP32[t + 4 >> 2] = e.w,
            HEAP32[t + 8 >> 2] = e.h;
            break;
        case "joystick_button_up":
        case "joystick_button_down":
            var m = "joystick_button_up" === e.type ? 0 : 1;
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP8[t + 4 >> 0] = e.index,
            HEAP8[t + 5 >> 0] = e.button,
            HEAP8[t + 6 >> 0] = m;
            break;
        case "joystick_axis_motion":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP8[t + 4 >> 0] = e.index,
            HEAP8[t + 5 >> 0] = e.axis,
            HEAP32[t + 8 >> 2] = SDL.joystickAxisValueConversion(e.value);
            break;
        case "focus":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP32[t + 4 >> 2] = 0,
            HEAP8[t + 8 >> 0] = 12;
            break;
        case "blur":
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP32[t + 4 >> 2] = 0,
            HEAP8[t + 8 >> 0] = 13;
            break;
        case "visibilitychange":
            var E = e.visible ? 1 : 2;
            HEAP32[t >> 2] = SDL.DOMEventToSDLEvent[e.type],
            HEAP32[t + 4 >> 2] = 0,
            HEAP8[t + 8 >> 0] = E;
            break;
        default:
            throw "Unhandled SDL event: " + e.type
        }
    },
    estimateTextWidth: function(e, t) {
        var n = e.size + "px " + e.name
          , r = SDL.ttfContext;
        r.save(),
        r.font = n;
        var o = 0 | r.measureText(t).width;
        return r.restore(),
        o
    },
    allocateChannels: function(e) {
        if (!(SDL.numChannels && SDL.numChannels >= e && 0 != e)) {
            SDL.numChannels = e,
            SDL.channels = [];
            for (var t = 0; t < e; t++)
                SDL.channels[t] = {
                    audio: null,
                    volume: 1
                }
        }
    },
    setGetVolume: function(e, t) {
        if (!e)
            return 0;
        var n = 128 * e.volume;
        if (-1 != t && (e.volume = Math.min(Math.max(t, 0), 128) / 128,
        e.audio))
            try {
                e.audio.volume = e.volume,
                e.audio.webAudioGainNode && (e.audio.webAudioGainNode.gain.value = e.volume)
            } catch (e) {
                Module.printErr("setGetVolume failed to set audio volume: " + e)
            }
        return n
    },
    setPannerPosition: function(e, t, n, r) {
        e && e.audio && e.audio.webAudioPannerNode && e.audio.webAudioPannerNode.setPosition(t, n, r)
    },
    playWebAudio: function(e) {
        if (e && !e.webAudioNode && SDL.webAudioAvailable())
            try {
                var t = e.resource.webAudio;
                if (e.paused = !1,
                !t.decodedBuffer)
                    return void 0 === t.onDecodeComplete && abort("Cannot play back audio object that was not loaded"),
                    void t.onDecodeComplete.push(function() {
                        e.paused || SDL.playWebAudio(e)
                    });
                e.webAudioNode = SDL.audioContext.createBufferSource(),
                e.webAudioNode.buffer = t.decodedBuffer,
                e.webAudioNode.loop = e.loop,
                e.webAudioNode.onended = function() {
                    e.onended()
                }
                ,
                e.webAudioPannerNode = SDL.audioContext.createPanner(),
                e.webAudioPannerNode.setPosition(0, 0, -.5),
                e.webAudioPannerNode.panningModel = "equalpower",
                e.webAudioGainNode = SDL.audioContext.createGain(),
                e.webAudioGainNode.gain.value = e.volume,
                e.webAudioNode.connect(e.webAudioPannerNode),
                e.webAudioPannerNode.connect(e.webAudioGainNode),
                e.webAudioGainNode.connect(SDL.audioContext.destination),
                e.webAudioNode.start(0, e.currentPosition),
                e.startTime = SDL.audioContext.currentTime - e.currentPosition
            } catch (e) {
                Module.printErr("playWebAudio failed: " + e)
            }
    },
    pauseWebAudio: function(e) {
        if (e) {
            if (e.webAudioNode)
                try {
                    e.currentPosition = (SDL.audioContext.currentTime - e.startTime) % e.resource.webAudio.decodedBuffer.duration,
                    e.webAudioNode.onended = void 0,
                    e.webAudioNode.stop(0),
                    e.webAudioNode = void 0
                } catch (e) {
                    Module.printErr("pauseWebAudio failed: " + e)
                }
            e.paused = !0
        }
    },
    openAudioContext: function() {
        SDL.audioContext || ("undefined" != typeof AudioContext ? SDL.audioContext = new AudioContext : "undefined" != typeof webkitAudioContext && (SDL.audioContext = new webkitAudioContext))
    },
    webAudioAvailable: function() {
        return !!SDL.audioContext
    },
    fillWebAudioBufferFromHeap: function(e, t, n) {
        if (parent.getSoundStatus() == false) {
            return
        }
        for (var r = SDL.audio.channels, o = 0; o < r; ++o) {
            var i = n.getChannelData(o);
            if (i.length != t)
                throw "Web Audio output buffer length mismatch! Destination size: " + i.length + " samples vs expected " + t + " samples!";
            if (32784 == SDL.audio.format)
                for (var a = 0; a < t; ++a)
                    i[a] = HEAP16[e + 2 * (a * r + o) >> 1] / 32768;
            else if (8 == SDL.audio.format)
                for (a = 0; a < t; ++a) {
                    var s = HEAP8[e + (a * r + o) >> 0];
                    i[a] = (s >= 0 ? s - 128 : s + 128) / 128
                }
        }
    },
    debugSurface: function(e) {
        console.log("dumping surface " + [e.surf, e.source, e.width, e.height]);
        for (var t = e.ctx.getImageData(0, 0, e.width, e.height).data, n = Math.min(e.width, e.height), r = 0; r < n; r++)
            console.log("   diagonal " + r + ":" + [t[r * e.width * 4 + 4 * r + 0], t[r * e.width * 4 + 4 * r + 1], t[r * e.width * 4 + 4 * r + 2], t[r * e.width * 4 + 4 * r + 3]])
    },
    joystickEventState: 1,
    lastJoystickState: {},
    joystickNamePool: {},
    recordJoystickState: function(e, t) {
        for (var n = new Array(t.buttons.length), r = 0; r < t.buttons.length; r++)
            n[r] = SDL.getJoystickButtonState(t.buttons[r]);
        SDL.lastJoystickState[e] = {
            buttons: n,
            axes: t.axes.slice(0),
            timestamp: t.timestamp,
            index: t.index,
            id: t.id
        }
    },
    getJoystickButtonState: function(e) {
        return "object" == typeof e ? e.pressed : e > 0
    },
    queryJoysticks: function() {
        for (var e in SDL.lastJoystickState) {
            var t = SDL.getGamepad(e - 1)
              , n = SDL.lastJoystickState[e];
            if (void 0 === t)
                return;
            if ("number" != typeof t.timestamp || t.timestamp !== n.timestamp) {
                var r;
                for (r = 0; r < t.buttons.length; r++) {
                    var o = SDL.getJoystickButtonState(t.buttons[r]);
                    o !== n.buttons[r] && SDL.events.push({
                        type: o ? "joystick_button_down" : "joystick_button_up",
                        joystick: e,
                        index: e - 1,
                        button: r
                    })
                }
                for (r = 0; r < t.axes.length; r++)
                    t.axes[r] !== n.axes[r] && SDL.events.push({
                        type: "joystick_axis_motion",
                        joystick: e,
                        index: e - 1,
                        axis: r,
                        value: t.axes[r]
                    });
                SDL.recordJoystickState(e, t)
            }
        }
    },
    joystickAxisValueConversion: function(e) {
        return e = Math.min(1, Math.max(e, -1)),
        Math.ceil(32767.5 * (e + 1) - 32768)
    },
    getGamepads: function() {
        var e = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
        return void 0 !== e ? e.apply(navigator) : []
    },
    getGamepad: function(e) {
        var t = SDL.getGamepads();
        return t.length > e && e >= 0 ? t[e] : null
    }
};
function _SDL_JoystickGetAxis(e, t) {
    var n = SDL.getGamepad(e - 1);
    return n && n.axes.length > t ? SDL.joystickAxisValueConversion(n.axes[t]) : 0
}
function _SDL_QuitSubSystem(e) {
    Module.print("SDL_QuitSubSystem called (and ignored)")
}
function _SDL_JoystickNumHats(e) {
    return 0
}
function _SDL_JoystickNumButtons(e) {
    var t = SDL.getGamepad(e - 1);
    return t ? t.buttons.length : 0
}
function _SDL_JoystickGetButton(e, t) {
    var n = SDL.getGamepad(e - 1);
    return n && n.buttons.length > t && SDL.getJoystickButtonState(n.buttons[t]) ? 1 : 0
}
function _abort() {
    Module.abort()
}
function _SDL_JoystickOpen(e) {
    var t = SDL.getGamepad(e);
    if (t) {
        var n = e + 1;
        return SDL.recordJoystickState(n, t),
        n
    }
    return 0
}
function _SDL_JoystickNumAxes(e) {
    var t = SDL.getGamepad(e - 1);
    return t ? t.axes.length : 0
}
Module._memset = _memset;
var GL = {
    counter: 1,
    lastError: 0,
    buffers: [],
    mappedBuffers: {},
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    uniforms: [],
    shaders: [],
    vaos: [],
    contexts: [],
    currentContext: null,
    offscreenCanvases: {},
    timerQueriesEXT: [],
    byteSizeByTypeRoot: 5120,
    byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8],
    programInfos: {},
    stringCache: {},
    tempFixedLengthArray: [],
    packAlignment: 4,
    unpackAlignment: 4,
    init: function() {
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var e = 0; e < GL.MINI_TEMP_BUFFER_SIZE; e++)
            GL.miniTempBufferViews[e] = GL.miniTempBuffer.subarray(0, e + 1);
        for (e = 0; e < 32; e++)
            GL.tempFixedLengthArray.push(new Array(e))
    },
    recordError: function(e) {
        GL.lastError || (GL.lastError = e)
    },
    getNewId: function(e) {
        for (var t = GL.counter++, n = e.length; n < t; n++)
            e[n] = null;
        return t
    },
    MINI_TEMP_BUFFER_SIZE: 256,
    miniTempBuffer: null,
    miniTempBufferViews: [0],
    getSource: function(e, t, n, r) {
        for (var o = "", i = 0; i < t; ++i) {
            var a;
            if (r) {
                var s = HEAP32[r + 4 * i >> 2];
                a = s < 0 ? Pointer_stringify(HEAP32[n + 4 * i >> 2]) : Pointer_stringify(HEAP32[n + 4 * i >> 2], s)
            } else
                a = Pointer_stringify(HEAP32[n + 4 * i >> 2]);
            o += a
        }
        return o
    },
    createContext: function(e, t) {
        var n;
        void 0 === t.majorVersion && void 0 === t.minorVersion && (t.majorVersion = 1,
        t.minorVersion = 0);
        var r = "?";
        function o(e) {
            r = e.statusMessage || r
        }
        try {
            e.addEventListener("webglcontextcreationerror", o, !1);
            try {
                if (1 == t.majorVersion && 0 == t.minorVersion)
                    n = e.getContext("webgl", t) || e.getContext("experimental-webgl", t);
                else {
                    if (2 != t.majorVersion || 0 != t.minorVersion)
                        throw "Unsupported WebGL context version " + majorVersion + "." + minorVersion + "!";
                    n = e.getContext("webgl2", t)
                }
            } finally {
                e.removeEventListener("webglcontextcreationerror", o, !1)
            }
            if (!n)
                throw ":("
        } catch (e) {
            return Module.print("Could not create canvas: " + [r, e, JSON.stringify(t)]),
            0
        }
        return n ? GL.registerContext(n, t) : 0
    },
    registerContext: function(e, t) {
        var n = GL.getNewId(GL.contexts)
          , r = {
            handle: n,
            attributes: t,
            version: t.majorVersion,
            GLctx: e
        };
        return e.canvas && (e.canvas.GLctxObject = r),
        GL.contexts[n] = r,
        (void 0 === t.enableExtensionsByDefault || t.enableExtensionsByDefault) && GL.initExtensions(r),
        n
    },
    makeContextCurrent: function(e) {
        var t = GL.contexts[e];
        return !!t && (GLctx = Module.ctx = t.GLctx,
        GL.currentContext = t,
        !0)
    },
    getContext: function(e) {
        return GL.contexts[e]
    },
    deleteContext: function(e) {
        GL.currentContext === GL.contexts[e] && (GL.currentContext = null),
        "object" == typeof JSEvents && JSEvents.removeAllHandlersOnTarget(GL.contexts[e].GLctx.canvas),
        GL.contexts[e] && GL.contexts[e].GLctx.canvas && (GL.contexts[e].GLctx.canvas.GLctxObject = void 0),
        GL.contexts[e] = null
    },
    initExtensions: function(e) {
        if (e || (e = GL.currentContext),
        !e.initExtensionsDone) {
            e.initExtensionsDone = !0;
            var t = e.GLctx;
            if (e.maxVertexAttribs = t.getParameter(t.MAX_VERTEX_ATTRIBS),
            e.version < 2) {
                var n = t.getExtension("ANGLE_instanced_arrays");
                n && (t.vertexAttribDivisor = function(e, t) {
                    n.vertexAttribDivisorANGLE(e, t)
                }
                ,
                t.drawArraysInstanced = function(e, t, r, o) {
                    n.drawArraysInstancedANGLE(e, t, r, o)
                }
                ,
                t.drawElementsInstanced = function(e, t, r, o, i) {
                    n.drawElementsInstancedANGLE(e, t, r, o, i)
                }
                );
                var r = t.getExtension("OES_vertex_array_object");
                r && (t.createVertexArray = function() {
                    return r.createVertexArrayOES()
                }
                ,
                t.deleteVertexArray = function(e) {
                    r.deleteVertexArrayOES(e)
                }
                ,
                t.bindVertexArray = function(e) {
                    r.bindVertexArrayOES(e)
                }
                ,
                t.isVertexArray = function(e) {
                    return r.isVertexArrayOES(e)
                }
                );
                var o = t.getExtension("WEBGL_draw_buffers");
                o && (t.drawBuffers = function(e, t) {
                    o.drawBuffersWEBGL(e, t)
                }
                )
            }
            t.disjointTimerQueryExt = t.getExtension("EXT_disjoint_timer_query");
            var i = ["OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources", "EXT_shader_texture_lod", "EXT_color_buffer_float"]
              , a = t.getSupportedExtensions();
            a && a.length > 0 && t.getSupportedExtensions().forEach(function(e) {
                -1 != i.indexOf(e) && t.getExtension(e)
            })
        }
    },
    populateUniformTable: function(e) {
        var t = GL.programs[e];
        GL.programInfos[e] = {
            uniforms: {},
            maxUniformLength: 0,
            maxAttributeLength: -1,
            maxUniformBlockNameLength: -1
        };
        for (var n = GL.programInfos[e], r = n.uniforms, o = GLctx.getProgramParameter(t, GLctx.ACTIVE_UNIFORMS), i = 0; i < o; ++i) {
            var a = GLctx.getActiveUniform(t, i)
              , s = a.name;
            if (n.maxUniformLength = Math.max(n.maxUniformLength, s.length + 1),
            -1 !== s.indexOf("]", s.length - 1)) {
                var u = s.lastIndexOf("[");
                s = s.slice(0, u)
            }
            var l = GLctx.getUniformLocation(t, s);
            if (null != l) {
                var c = GL.getNewId(GL.uniforms);
                r[s] = [a.size, c],
                GL.uniforms[c] = l;
                for (var d = 1; d < a.size; ++d) {
                    var f = s + "[" + d + "]";
                    l = GLctx.getUniformLocation(t, f),
                    c = GL.getNewId(GL.uniforms),
                    GL.uniforms[c] = l
                }
            }
        }
    }
};
function _SDL_SetVideoMode(e, t, n, r) {
    ["touchstart", "touchend", "touchmove", "mousedown", "mouseup", "mousemove", "DOMMouseScroll", "mousewheel", "wheel", "mouseout"].forEach(function(e) {
        Module.canvas.addEventListener(e, SDL.receiveEvent, !0)
    });
    var o = Module.canvas;
    return 0 == e && 0 == t && (e = o.width,
    t = o.height),
    SDL.addedResizeListener || (SDL.addedResizeListener = !0,
    Browser.resizeListeners.push(function(e, t) {
        SDL.settingVideoMode || SDL.receiveEvent({
            type: "resize",
            w: e,
            h: t
        })
    })),
    e === o.width && t === o.height || (SDL.settingVideoMode = !0,
    Browser.setCanvasSize(e, t),
    SDL.settingVideoMode = !1),
    SDL.screen && (SDL.freeSurface(SDL.screen),
    assert(!SDL.screen)),
    SDL.GL && (r |= 67108864),
    SDL.screen = SDL.makeSurface(e, t, r, !0, "screen"),
    SDL.screen
}
function ___lock() {}
function ___unlock() {}
function _SDL_PollEvent(e) {
    return SDL.pollEvent(e)
}
function _SDL_Flip(e) {}
function _emscripten_exit_with_live_runtime() {
    throw Module.noExitRuntime = !0,
    "SimulateInfiniteLoop"
}
function _SDL_InitSubSystem(e) {
    return 0
}
function _SDL_CreateRGBSurface(e, t, n, r, o, i, a, s) {
    return SDL.makeSurface(t, n, e, !1, "CreateRGBSurface", o, i, a, s)
}
var SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    mappings: {},
    umask: 511,
    calculateAt: function(e, t) {
        if ("/" !== t[0]) {
            var n;
            if (-100 === e)
                n = FS.cwd();
            else {
                var r = FS.getStream(e);
                if (!r)
                    throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                n = r.path
            }
            t = PATH.join2(n, t)
        }
        return t
    },
    doStat: function(e, t, n) {
        try {
            var r = e(t)
        } catch (e) {
            if (e && e.node && PATH.normalize(t) !== PATH.normalize(FS.getPath(e.node)))
                return -ERRNO_CODES.ENOTDIR;
            throw e
        }
        return HEAP32[n >> 2] = r.dev,
        HEAP32[n + 4 >> 2] = 0,
        HEAP32[n + 8 >> 2] = r.ino,
        HEAP32[n + 12 >> 2] = r.mode,
        HEAP32[n + 16 >> 2] = r.nlink,
        HEAP32[n + 20 >> 2] = r.uid,
        HEAP32[n + 24 >> 2] = r.gid,
        HEAP32[n + 28 >> 2] = r.rdev,
        HEAP32[n + 32 >> 2] = 0,
        HEAP32[n + 36 >> 2] = r.size,
        HEAP32[n + 40 >> 2] = 4096,
        HEAP32[n + 44 >> 2] = r.blocks,
        HEAP32[n + 48 >> 2] = r.atime.getTime() / 1e3 | 0,
        HEAP32[n + 52 >> 2] = 0,
        HEAP32[n + 56 >> 2] = r.mtime.getTime() / 1e3 | 0,
        HEAP32[n + 60 >> 2] = 0,
        HEAP32[n + 64 >> 2] = r.ctime.getTime() / 1e3 | 0,
        HEAP32[n + 68 >> 2] = 0,
        HEAP32[n + 72 >> 2] = r.ino,
        0
    },
    doMsync: function(e, t, n, r) {
        var o = new Uint8Array(HEAPU8.subarray(e, e + n));
        FS.msync(t, o, 0, n, r)
    },
    doMkdir: function(e, t) {
        return "/" === (e = PATH.normalize(e))[e.length - 1] && (e = e.substr(0, e.length - 1)),
        FS.mkdir(e, t, 0),
        0
    },
    doMknod: function(e, t, n) {
        switch (61440 & t) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
            break;
        default:
            return -ERRNO_CODES.EINVAL
        }
        return FS.mknod(e, t, n),
        0
    },
    doReadlink: function(e, t, n) {
        if (n <= 0)
            return -ERRNO_CODES.EINVAL;
        var r = FS.readlink(e)
          , o = Math.min(n, lengthBytesUTF8(r))
          , i = HEAP8[t + o];
        return stringToUTF8(r, t, n + 1),
        HEAP8[t + o] = i,
        o
    },
    doAccess: function(e, t) {
        if (-8 & t)
            return -ERRNO_CODES.EINVAL;
        var n;
        n = FS.lookupPath(e, {
            follow: !0
        }).node;
        var r = "";
        return 4 & t && (r += "r"),
        2 & t && (r += "w"),
        1 & t && (r += "x"),
        r && FS.nodePermissions(n, r) ? -ERRNO_CODES.EACCES : 0
    },
    doDup: function(e, t, n) {
        var r = FS.getStream(n);
        return r && FS.close(r),
        FS.open(e, t, 0, n, n).fd
    },
    doReadv: function(e, t, n, r) {
        for (var o = 0, i = 0; i < n; i++) {
            var a = HEAP32[t + 8 * i >> 2]
              , s = HEAP32[t + (8 * i + 4) >> 2]
              , u = FS.read(e, HEAP8, a, s, r);
            if (u < 0)
                return -1;
            if (o += u,
            u < s)
                break
        }
        return o
    },
    doWritev: function(e, t, n, r) {
        for (var o = 0, i = 0; i < n; i++) {
            var a = HEAP32[t + 8 * i >> 2]
              , s = HEAP32[t + (8 * i + 4) >> 2]
              , u = FS.write(e, HEAP8, a, s, r);
            if (u < 0)
                return -1;
            o += u
        }
        return o
    },
    varargs: 0,
    get: function(e) {
        return SYSCALLS.varargs += 4,
        HEAP32[SYSCALLS.varargs - 4 >> 2]
    },
    getStr: function() {
        return Pointer_stringify(SYSCALLS.get())
    },
    getStreamFromFD: function() {
        var e = FS.getStream(SYSCALLS.get());
        if (!e)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return e
    },
    getSocketFromFD: function() {
        var e = SOCKFS.getSocket(SYSCALLS.get());
        if (!e)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return e
    },
    getSocketAddress: function(e) {
        var t = SYSCALLS.get()
          , n = SYSCALLS.get();
        if (e && 0 === t)
            return null;
        var r = __read_sockaddr(t, n);
        if (r.errno)
            throw new FS.ErrnoError(r.errno);
        return r.addr = DNS.lookup_addr(r.addr) || r.addr,
        r
    },
    get64: function() {
        var e = SYSCALLS.get()
          , t = SYSCALLS.get();
        return assert(e >= 0 ? 0 === t : -1 === t),
        e
    },
    getZero: function() {
        assert(0 === SYSCALLS.get())
    }
};
function ___syscall54(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStreamFromFD()
          , r = SYSCALLS.get();
        switch (r) {
        case 21505:
        case 21506:
            return n.tty ? 0 : -ERRNO_CODES.ENOTTY;
        case 21519:
            if (!n.tty)
                return -ERRNO_CODES.ENOTTY;
            var o = SYSCALLS.get();
            return HEAP32[o >> 2] = 0,
            0;
        case 21520:
            return n.tty ? -ERRNO_CODES.EINVAL : -ERRNO_CODES.ENOTTY;
        case 21531:
            o = SYSCALLS.get();
            return FS.ioctl(n, r, o);
        case 21523:
            return n.tty ? 0 : -ERRNO_CODES.ENOTTY;
        default:
            abort("bad ioctl syscall " + r)
        }
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function _SDL_Init(e) {
    if (SDL.startTime = Date.now(),
    SDL.initFlags = e,
    !Module.doNotCaptureKeyboard) {
        var t = Module.keyboardListeningElement || document;
        t.addEventListener("keydown", SDL.receiveEvent),
        t.addEventListener("keyup", SDL.receiveEvent),
        t.addEventListener("keypress", SDL.receiveEvent),
        window.addEventListener("focus", SDL.receiveEvent),
        window.addEventListener("blur", SDL.receiveEvent),
        document.addEventListener("visibilitychange", SDL.receiveEvent)
    }
    return 512 & e && addEventListener("gamepadconnected", function() {}),
    window.addEventListener("unload", SDL.receiveEvent),
    SDL.keyboardState = _malloc(65536),
    _memset(SDL.keyboardState, 0, 65536),
    SDL.DOMEventToSDLEvent.keydown = 768,
    SDL.DOMEventToSDLEvent.keyup = 769,
    SDL.DOMEventToSDLEvent.keypress = 771,
    SDL.DOMEventToSDLEvent.mousedown = 1025,
    SDL.DOMEventToSDLEvent.mouseup = 1026,
    SDL.DOMEventToSDLEvent.mousemove = 1024,
    SDL.DOMEventToSDLEvent.wheel = 1027,
    SDL.DOMEventToSDLEvent.touchstart = 1792,
    SDL.DOMEventToSDLEvent.touchend = 1793,
    SDL.DOMEventToSDLEvent.touchmove = 1794,
    SDL.DOMEventToSDLEvent.unload = 256,
    SDL.DOMEventToSDLEvent.resize = 28673,
    SDL.DOMEventToSDLEvent.visibilitychange = 512,
    SDL.DOMEventToSDLEvent.focus = 512,
    SDL.DOMEventToSDLEvent.blur = 512,
    SDL.DOMEventToSDLEvent.joystick_axis_motion = 1536,
    SDL.DOMEventToSDLEvent.joystick_button_down = 1539,
    SDL.DOMEventToSDLEvent.joystick_button_up = 1540,
    0
}
function _SDL_WasInit() {
    return null === SDL.startTime && _SDL_Init(),
    1
}
function _SDL_NumJoysticks() {
    for (var e = 0, t = SDL.getGamepads(), n = 0; n < t.length; n++)
        void 0 !== t[n] && e++;
    return e
}
function _SDL_JoystickEventState(e) {
    return e < 0 ? SDL.joystickEventState : SDL.joystickEventState = e
}
function ___syscall5(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStr()
          , r = SYSCALLS.get()
          , o = SYSCALLS.get();
        return FS.open(n, r, o).fd
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function _emscripten_memcpy_big(e, t, n) {
    return HEAPU8.set(HEAPU8.subarray(t, t + n), e),
    e
}
function ___syscall6(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStreamFromFD();
        return FS.close(n),
        0
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function _SDL_JoystickGetHat(e, t) {
    return 0
}
Module._memcpy = _memcpy,
Module._sbrk = _sbrk;
var JSEvents = {
    keyEvent: 0,
    mouseEvent: 0,
    wheelEvent: 0,
    uiEvent: 0,
    focusEvent: 0,
    deviceOrientationEvent: 0,
    deviceMotionEvent: 0,
    fullscreenChangeEvent: 0,
    pointerlockChangeEvent: 0,
    visibilityChangeEvent: 0,
    touchEvent: 0,
    lastGamepadState: null,
    lastGamepadStateFrame: null,
    numGamepadsConnected: 0,
    previousFullscreenElement: null,
    previousScreenX: null,
    previousScreenY: null,
    removeEventListenersRegistered: !1,
    staticInit: function() {
        if ("undefined" != typeof window) {
            window.addEventListener("gamepadconnected", function() {
                ++JSEvents.numGamepadsConnected
            }),
            window.addEventListener("gamepaddisconnected", function() {
                --JSEvents.numGamepadsConnected
            });
            var e = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : null;
            e && (JSEvents.numGamepadsConnected = e.length)
        }
    },
    registerRemoveEventListeners: function() {
        JSEvents.removeEventListenersRegistered || (__ATEXIT__.push(function() {
            for (var e = JSEvents.eventHandlers.length - 1; e >= 0; --e)
                JSEvents._removeHandler(e)
        }),
        JSEvents.removeEventListenersRegistered = !0)
    },
    findEventTarget: function(e) {
        return e ? ("number" == typeof e && (e = Pointer_stringify(e)),
        "#window" == e ? window : "#document" == e ? document : "#screen" == e ? window.screen : "#canvas" == e ? Module.canvas : "string" == typeof e ? document.getElementById(e) : e) : window
    },
    deferredCalls: [],
    deferCall: function(e, t, n) {
        function r(e, t) {
            if (e.length != t.length)
                return !1;
            for (var n in e)
                if (e[n] != t[n])
                    return !1;
            return !0
        }
        for (var o in JSEvents.deferredCalls) {
            var i = JSEvents.deferredCalls[o];
            if (i.targetFunction == e && r(i.argsList, n))
                return
        }
        JSEvents.deferredCalls.push({
            targetFunction: e,
            precedence: t,
            argsList: n
        }),
        JSEvents.deferredCalls.sort(function(e, t) {
            return e.precedence < t.precedence
        })
    },
    removeDeferredCalls: function(e) {
        for (var t = 0; t < JSEvents.deferredCalls.length; ++t)
            JSEvents.deferredCalls[t].targetFunction == e && (JSEvents.deferredCalls.splice(t, 1),
            --t)
    },
    canPerformEventHandlerRequests: function() {
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
    },
    runDeferredCalls: function() {
        if (JSEvents.canPerformEventHandlerRequests())
            for (var e = 0; e < JSEvents.deferredCalls.length; ++e) {
                var t = JSEvents.deferredCalls[e];
                JSEvents.deferredCalls.splice(e, 1),
                --e,
                t.targetFunction.apply(this, t.argsList)
            }
    },
    inEventHandler: 0,
    currentEventHandler: null,
    eventHandlers: [],
    isInternetExplorer: function() {
        return -1 !== navigator.userAgent.indexOf("MSIE") || navigator.appVersion.indexOf("Trident/") > 0
    },
    removeAllHandlersOnTarget: function(e, t) {
        for (var n = 0; n < JSEvents.eventHandlers.length; ++n)
            JSEvents.eventHandlers[n].target != e || t && t != JSEvents.eventHandlers[n].eventTypeString || JSEvents._removeHandler(n--)
    },
    _removeHandler: function(e) {
        var t = JSEvents.eventHandlers[e];
        t.target.removeEventListener(t.eventTypeString, t.eventListenerFunc, t.useCapture),
        JSEvents.eventHandlers.splice(e, 1)
    },
    registerOrRemoveHandler: function(e) {
        var t = function(t) {
            ++JSEvents.inEventHandler,
            JSEvents.currentEventHandler = e,
            JSEvents.runDeferredCalls(),
            e.handlerFunc(t),
            JSEvents.runDeferredCalls(),
            --JSEvents.inEventHandler
        };
        if (e.callbackfunc)
            e.eventListenerFunc = t,
            e.target.addEventListener(e.eventTypeString, t, e.useCapture),
            JSEvents.eventHandlers.push(e),
            JSEvents.registerRemoveEventListeners();
        else
            for (var n = 0; n < JSEvents.eventHandlers.length; ++n)
                JSEvents.eventHandlers[n].target == e.target && JSEvents.eventHandlers[n].eventTypeString == e.eventTypeString && JSEvents._removeHandler(n--)
    },
    registerKeyEventCallback: function(e, t, n, r, o, i) {
        JSEvents.keyEvent || (JSEvents.keyEvent = _malloc(164));
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !JSEvents.isInternetExplorer(),
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                stringToUTF8(n.key ? n.key : "", JSEvents.keyEvent + 0, 32),
                stringToUTF8(n.code ? n.code : "", JSEvents.keyEvent + 32, 32),
                HEAP32[JSEvents.keyEvent + 64 >> 2] = n.location,
                HEAP32[JSEvents.keyEvent + 68 >> 2] = n.ctrlKey,
                HEAP32[JSEvents.keyEvent + 72 >> 2] = n.shiftKey,
                HEAP32[JSEvents.keyEvent + 76 >> 2] = n.altKey,
                HEAP32[JSEvents.keyEvent + 80 >> 2] = n.metaKey,
                HEAP32[JSEvents.keyEvent + 84 >> 2] = n.repeat,
                stringToUTF8(n.locale ? n.locale : "", JSEvents.keyEvent + 88, 32),
                stringToUTF8(n.char ? n.char : "", JSEvents.keyEvent + 120, 32),
                HEAP32[JSEvents.keyEvent + 152 >> 2] = n.charCode,
                HEAP32[JSEvents.keyEvent + 156 >> 2] = n.keyCode,
                HEAP32[JSEvents.keyEvent + 160 >> 2] = n.which,
                Module.dynCall_iiii(r, o, JSEvents.keyEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    getBoundingClientRectOrZeros: function(e) {
        return e.getBoundingClientRect ? e.getBoundingClientRect() : {
            left: 0,
            top: 0
        }
    },
    fillMouseEventData: function(e, t, n) {
        if (HEAPF64[e >> 3] = JSEvents.tick(),
        HEAP32[e + 8 >> 2] = t.screenX,
        HEAP32[e + 12 >> 2] = t.screenY,
        HEAP32[e + 16 >> 2] = t.clientX,
        HEAP32[e + 20 >> 2] = t.clientY,
        HEAP32[e + 24 >> 2] = t.ctrlKey,
        HEAP32[e + 28 >> 2] = t.shiftKey,
        HEAP32[e + 32 >> 2] = t.altKey,
        HEAP32[e + 36 >> 2] = t.metaKey,
        HEAP16[e + 40 >> 1] = t.button,
        HEAP16[e + 42 >> 1] = t.buttons,
        HEAP32[e + 44 >> 2] = t.movementX || t.mozMovementX || t.webkitMovementX || t.screenX - JSEvents.previousScreenX,
        HEAP32[e + 48 >> 2] = t.movementY || t.mozMovementY || t.webkitMovementY || t.screenY - JSEvents.previousScreenY,
        Module.canvas) {
            var r = Module.canvas.getBoundingClientRect();
            HEAP32[e + 60 >> 2] = t.clientX - r.left,
            HEAP32[e + 64 >> 2] = t.clientY - r.top
        } else
            HEAP32[e + 60 >> 2] = 0,
            HEAP32[e + 64 >> 2] = 0;
        if (n) {
            r = JSEvents.getBoundingClientRectOrZeros(n);
            HEAP32[e + 52 >> 2] = t.clientX - r.left,
            HEAP32[e + 56 >> 2] = t.clientY - r.top
        } else
            HEAP32[e + 52 >> 2] = 0,
            HEAP32[e + 56 >> 2] = 0;
        "wheel" !== t.type && "mousewheel" !== t.type && (JSEvents.previousScreenX = t.screenX,
        JSEvents.previousScreenY = t.screenY)
    },
    registerMouseEventCallback: function(e, t, n, r, o, i) {
        JSEvents.mouseEvent || (JSEvents.mouseEvent = _malloc(72));
        var a = {
            target: e = JSEvents.findEventTarget(e),
            allowsDeferredCalls: "mousemove" != i && "mouseenter" != i && "mouseleave" != i,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(n) {
                var i = n || window.event;
                JSEvents.fillMouseEventData(JSEvents.mouseEvent, i, e),
                Module.dynCall_iiii(r, o, JSEvents.mouseEvent, t) && i.preventDefault()
            },
            useCapture: n
        };
        JSEvents.isInternetExplorer() && "mousedown" == i && (a.allowsDeferredCalls = !1),
        JSEvents.registerOrRemoveHandler(a)
    },
    registerWheelEventCallback: function(e, t, n, r, o, i) {
        JSEvents.wheelEvent || (JSEvents.wheelEvent = _malloc(104));
        var a = {
            target: e = JSEvents.findEventTarget(e),
            allowsDeferredCalls: !0,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: "wheel" == i ? function(n) {
                var i = n || window.event;
                JSEvents.fillMouseEventData(JSEvents.wheelEvent, i, e),
                HEAPF64[JSEvents.wheelEvent + 72 >> 3] = i.deltaX,
                HEAPF64[JSEvents.wheelEvent + 80 >> 3] = i.deltaY,
                HEAPF64[JSEvents.wheelEvent + 88 >> 3] = i.deltaZ,
                HEAP32[JSEvents.wheelEvent + 96 >> 2] = i.deltaMode,
                Module.dynCall_iiii(r, o, JSEvents.wheelEvent, t) && i.preventDefault()
            }
            : function(n) {
                var i = n || window.event;
                JSEvents.fillMouseEventData(JSEvents.wheelEvent, i, e),
                HEAPF64[JSEvents.wheelEvent + 72 >> 3] = i.wheelDeltaX || 0,
                HEAPF64[JSEvents.wheelEvent + 80 >> 3] = -(i.wheelDeltaY ? i.wheelDeltaY : i.wheelDelta),
                HEAPF64[JSEvents.wheelEvent + 88 >> 3] = 0,
                HEAP32[JSEvents.wheelEvent + 96 >> 2] = 0,
                Module.dynCall_iiii(r, o, JSEvents.wheelEvent, t) && i.preventDefault()
            }
            ,
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    pageScrollPos: function() {
        return window.pageXOffset > 0 || window.pageYOffset > 0 ? [window.pageXOffset, window.pageYOffset] : void 0 !== document.documentElement.scrollLeft || void 0 !== document.documentElement.scrollTop ? [document.documentElement.scrollLeft, document.documentElement.scrollTop] : [0 | document.body.scrollLeft, 0 | document.body.scrollTop]
    },
    registerUiEventCallback: function(e, t, n, r, o, i) {
        JSEvents.uiEvent || (JSEvents.uiEvent = _malloc(36));
        var a = {
            target: e = "scroll" != i || e ? JSEvents.findEventTarget(e) : document,
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(n) {
                var i = n || window.event;
                if (i.target == e) {
                    var a = JSEvents.pageScrollPos();
                    HEAP32[JSEvents.uiEvent >> 2] = i.detail,
                    HEAP32[JSEvents.uiEvent + 4 >> 2] = document.body.clientWidth,
                    HEAP32[JSEvents.uiEvent + 8 >> 2] = document.body.clientHeight,
                    HEAP32[JSEvents.uiEvent + 12 >> 2] = window.innerWidth,
                    HEAP32[JSEvents.uiEvent + 16 >> 2] = window.innerHeight,
                    HEAP32[JSEvents.uiEvent + 20 >> 2] = window.outerWidth,
                    HEAP32[JSEvents.uiEvent + 24 >> 2] = window.outerHeight,
                    HEAP32[JSEvents.uiEvent + 28 >> 2] = a[0],
                    HEAP32[JSEvents.uiEvent + 32 >> 2] = a[1],
                    Module.dynCall_iiii(r, o, JSEvents.uiEvent, t) && i.preventDefault()
                }
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    getNodeNameForTarget: function(e) {
        return e ? e == window ? "#window" : e == window.screen ? "#screen" : e && e.nodeName ? e.nodeName : "" : ""
    },
    registerFocusEventCallback: function(e, t, n, r, o, i) {
        JSEvents.focusEvent || (JSEvents.focusEvent = _malloc(256));
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event
                  , i = JSEvents.getNodeNameForTarget(n.target)
                  , a = n.target.id ? n.target.id : "";
                stringToUTF8(i, JSEvents.focusEvent + 0, 128),
                stringToUTF8(a, JSEvents.focusEvent + 128, 128),
                Module.dynCall_iiii(r, o, JSEvents.focusEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    tick: function() {
        return window.performance && window.performance.now ? window.performance.now() : Date.now()
    },
    registerDeviceOrientationEventCallback: function(e, t, n, r, o, i) {
        JSEvents.deviceOrientationEvent || (JSEvents.deviceOrientationEvent = _malloc(40));
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                HEAPF64[JSEvents.deviceOrientationEvent >> 3] = JSEvents.tick(),
                HEAPF64[JSEvents.deviceOrientationEvent + 8 >> 3] = n.alpha,
                HEAPF64[JSEvents.deviceOrientationEvent + 16 >> 3] = n.beta,
                HEAPF64[JSEvents.deviceOrientationEvent + 24 >> 3] = n.gamma,
                HEAP32[JSEvents.deviceOrientationEvent + 32 >> 2] = n.absolute,
                Module.dynCall_iiii(r, o, JSEvents.deviceOrientationEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    registerDeviceMotionEventCallback: function(e, t, n, r, o, i) {
        JSEvents.deviceMotionEvent || (JSEvents.deviceMotionEvent = _malloc(80));
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                HEAPF64[JSEvents.deviceMotionEvent >> 3] = JSEvents.tick(),
                HEAPF64[JSEvents.deviceMotionEvent + 8 >> 3] = n.acceleration.x,
                HEAPF64[JSEvents.deviceMotionEvent + 16 >> 3] = n.acceleration.y,
                HEAPF64[JSEvents.deviceMotionEvent + 24 >> 3] = n.acceleration.z,
                HEAPF64[JSEvents.deviceMotionEvent + 32 >> 3] = n.accelerationIncludingGravity.x,
                HEAPF64[JSEvents.deviceMotionEvent + 40 >> 3] = n.accelerationIncludingGravity.y,
                HEAPF64[JSEvents.deviceMotionEvent + 48 >> 3] = n.accelerationIncludingGravity.z,
                HEAPF64[JSEvents.deviceMotionEvent + 56 >> 3] = n.rotationRate.alpha,
                HEAPF64[JSEvents.deviceMotionEvent + 64 >> 3] = n.rotationRate.beta,
                HEAPF64[JSEvents.deviceMotionEvent + 72 >> 3] = n.rotationRate.gamma,
                Module.dynCall_iiii(r, o, JSEvents.deviceMotionEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    screenOrientation: function() {
        if (window.screen)
            return window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation
    },
    fillOrientationChangeEventData: function(e, t) {
        var n = JSEvents.screenOrientation()
          , r = ["portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary"].indexOf(n);
        -1 == r && (r = ["portrait", "portrait", "landscape", "landscape"].indexOf(n)),
        HEAP32[e >> 2] = 1 << r,
        HEAP32[e + 4 >> 2] = window.orientation
    },
    registerOrientationChangeEventCallback: function(e, t, n, r, o, i) {
        JSEvents.orientationChangeEvent || (JSEvents.orientationChangeEvent = _malloc(8)),
        e = e ? JSEvents.findEventTarget(e) : window.screen;
        "orientationchange" == i && void 0 !== window.screen.mozOrientation && (i = "mozorientationchange");
        var a = {
            target: e,
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                JSEvents.fillOrientationChangeEventData(JSEvents.orientationChangeEvent, n),
                Module.dynCall_iiii(r, o, JSEvents.orientationChangeEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    fullscreenEnabled: function() {
        return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled
    },
    fillFullscreenChangeEventData: function(e, t) {
        var n = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement
          , r = !!n;
        HEAP32[e >> 2] = r,
        HEAP32[e + 4 >> 2] = JSEvents.fullscreenEnabled();
        var o = r ? n : JSEvents.previousFullscreenElement
          , i = JSEvents.getNodeNameForTarget(o)
          , a = o && o.id ? o.id : "";
        stringToUTF8(i, e + 8, 128),
        stringToUTF8(a, e + 136, 128),
        HEAP32[e + 264 >> 2] = o ? o.clientWidth : 0,
        HEAP32[e + 268 >> 2] = o ? o.clientHeight : 0,
        HEAP32[e + 272 >> 2] = screen.width,
        HEAP32[e + 276 >> 2] = screen.height,
        r && (JSEvents.previousFullscreenElement = n)
    },
    registerFullscreenChangeEventCallback: function(e, t, n, r, o, i) {
        JSEvents.fullscreenChangeEvent || (JSEvents.fullscreenChangeEvent = _malloc(280));
        var a = {
            target: e = e ? JSEvents.findEventTarget(e) : document,
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                JSEvents.fillFullscreenChangeEventData(JSEvents.fullscreenChangeEvent, n),
                Module.dynCall_iiii(r, o, JSEvents.fullscreenChangeEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    resizeCanvasForFullscreen: function(e, t) {
        var n = __registerRestoreOldStyle(e)
          , r = t.softFullscreen ? window.innerWidth : screen.width
          , o = t.softFullscreen ? window.innerHeight : screen.height
          , i = e.getBoundingClientRect()
          , a = i.right - i.left
          , s = i.bottom - i.top
          , u = e.width
          , l = e.height;
        if (3 == t.scaleMode)
            __setLetterbox(e, (o - s) / 2, (r - a) / 2),
            r = a,
            o = s;
        else if (2 == t.scaleMode)
            if (r * l < u * o) {
                var c = l * r / u;
                __setLetterbox(e, (o - c) / 2, 0),
                o = c
            } else {
                var d = u * o / l;
                __setLetterbox(e, 0, (r - d) / 2),
                r = d
            }
        e.style.backgroundColor || (e.style.backgroundColor = "black"),
        document.body.style.backgroundColor || (document.body.style.backgroundColor = "black"),
        e.style.width = r + "px",
        e.style.height = o + "px",
        1 == t.filteringMode && (e.style.imageRendering = "optimizeSpeed",
        e.style.imageRendering = "-moz-crisp-edges",
        e.style.imageRendering = "-o-crisp-edges",
        e.style.imageRendering = "-webkit-optimize-contrast",
        e.style.imageRendering = "optimize-contrast",
        e.style.imageRendering = "crisp-edges",
        e.style.imageRendering = "pixelated");
        var f = 2 == t.canvasResolutionScaleMode ? window.devicePixelRatio : 1;
        return 0 != t.canvasResolutionScaleMode && (e.width = r * f,
        e.height = o * f,
        e.GLctxObject && e.GLctxObject.GLctx.viewport(0, 0, e.width, e.height)),
        n
    },
    requestFullscreen: function(e, t) {
        if (0 == t.scaleMode && 0 == t.canvasResolutionScaleMode || JSEvents.resizeCanvasForFullscreen(e, t),
        e.requestFullscreen)
            e.requestFullscreen();
        else if (e.msRequestFullscreen)
            e.msRequestFullscreen();
        else if (e.mozRequestFullScreen)
            e.mozRequestFullScreen();
        else if (e.mozRequestFullscreen)
            e.mozRequestFullscreen();
        else {
            if (!e.webkitRequestFullscreen)
                return void 0 === JSEvents.fullscreenEnabled() ? -1 : -3;
            e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        return t.canvasResizedCallback && Module.dynCall_iiii(t.canvasResizedCallback, 37, 0, t.canvasResizedCallbackUserData),
        0
    },
    fillPointerlockChangeEventData: function(e, t) {
        var n = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement
          , r = !!n;
        HEAP32[e >> 2] = r;
        var o = JSEvents.getNodeNameForTarget(n)
          , i = n && n.id ? n.id : "";
        stringToUTF8(o, e + 4, 128),
        stringToUTF8(i, e + 132, 128)
    },
    registerPointerlockChangeEventCallback: function(e, t, n, r, o, i) {
        JSEvents.pointerlockChangeEvent || (JSEvents.pointerlockChangeEvent = _malloc(260));
        var a = {
            target: e = e ? JSEvents.findEventTarget(e) : document,
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                JSEvents.fillPointerlockChangeEventData(JSEvents.pointerlockChangeEvent, n),
                Module.dynCall_iiii(r, o, JSEvents.pointerlockChangeEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    registerPointerlockErrorEventCallback: function(e, t, n, r, o, i) {
        var a = {
            target: e = e ? JSEvents.findEventTarget(e) : document,
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                Module.dynCall_iiii(r, o, 0, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    requestPointerLock: function(e) {
        if (e.requestPointerLock)
            e.requestPointerLock();
        else if (e.mozRequestPointerLock)
            e.mozRequestPointerLock();
        else if (e.webkitRequestPointerLock)
            e.webkitRequestPointerLock();
        else {
            if (!e.msRequestPointerLock)
                return document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock ? -3 : -1;
            e.msRequestPointerLock()
        }
        return 0
    },
    fillVisibilityChangeEventData: function(e, t) {
        var n = ["hidden", "visible", "prerender", "unloaded"].indexOf(document.visibilityState);
        HEAP32[e >> 2] = document.hidden,
        HEAP32[e + 4 >> 2] = n
    },
    registerVisibilityChangeEventCallback: function(e, t, n, r, o, i) {
        JSEvents.visibilityChangeEvent || (JSEvents.visibilityChangeEvent = _malloc(8));
        var a = {
            target: e = e ? JSEvents.findEventTarget(e) : document,
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                JSEvents.fillVisibilityChangeEventData(JSEvents.visibilityChangeEvent, n),
                Module.dynCall_iiii(r, o, JSEvents.visibilityChangeEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    registerTouchEventCallback: function(e, t, n, r, o, i) {
        JSEvents.touchEvent || (JSEvents.touchEvent = _malloc(1684));
        var a = {
            target: e = JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(n) {
                for (var i = n || window.event, a = {}, s = 0; s < i.touches.length; ++s)
                    a[(u = i.touches[s]).identifier] = u;
                for (s = 0; s < i.changedTouches.length; ++s)
                    a[(u = i.changedTouches[s]).identifier] = u,
                    u.changed = !0;
                for (s = 0; s < i.targetTouches.length; ++s) {
                    var u;
                    a[(u = i.targetTouches[s]).identifier].onTarget = !0
                }
                var l = JSEvents.touchEvent;
                HEAP32[l + 4 >> 2] = i.ctrlKey,
                HEAP32[l + 8 >> 2] = i.shiftKey,
                HEAP32[l + 12 >> 2] = i.altKey,
                HEAP32[l + 16 >> 2] = i.metaKey,
                l += 20;
                var c = Module.canvas ? Module.canvas.getBoundingClientRect() : void 0
                  , d = JSEvents.getBoundingClientRectOrZeros(e)
                  , f = 0;
                for (var s in a) {
                    var S = a[s];
                    if (HEAP32[l >> 2] = S.identifier,
                    HEAP32[l + 4 >> 2] = S.screenX,
                    HEAP32[l + 8 >> 2] = S.screenY,
                    HEAP32[l + 12 >> 2] = S.clientX,
                    HEAP32[l + 16 >> 2] = S.clientY,
                    HEAP32[l + 20 >> 2] = S.pageX,
                    HEAP32[l + 24 >> 2] = S.pageY,
                    HEAP32[l + 28 >> 2] = S.changed,
                    HEAP32[l + 32 >> 2] = S.onTarget,
                    c ? (HEAP32[l + 44 >> 2] = S.clientX - c.left,
                    HEAP32[l + 48 >> 2] = S.clientY - c.top) : (HEAP32[l + 44 >> 2] = 0,
                    HEAP32[l + 48 >> 2] = 0),
                    HEAP32[l + 36 >> 2] = S.clientX - d.left,
                    HEAP32[l + 40 >> 2] = S.clientY - d.top,
                    l += 52,
                    ++f >= 32)
                        break
                }
                HEAP32[JSEvents.touchEvent >> 2] = f,
                Module.dynCall_iiii(r, o, JSEvents.touchEvent, t) && i.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    fillGamepadEventData: function(e, t) {
        HEAPF64[e >> 3] = t.timestamp;
        for (var n = 0; n < t.axes.length; ++n)
            HEAPF64[e + 8 * n + 16 >> 3] = t.axes[n];
        for (n = 0; n < t.buttons.length; ++n)
            "object" == typeof t.buttons[n] ? HEAPF64[e + 8 * n + 528 >> 3] = t.buttons[n].value : HEAPF64[e + 8 * n + 528 >> 3] = t.buttons[n];
        for (n = 0; n < t.buttons.length; ++n)
            "object" == typeof t.buttons[n] ? HEAP32[e + 4 * n + 1040 >> 2] = t.buttons[n].pressed : HEAP32[e + 4 * n + 1040 >> 2] = 1 == t.buttons[n];
        HEAP32[e + 1296 >> 2] = t.connected,
        HEAP32[e + 1300 >> 2] = t.index,
        HEAP32[e + 8 >> 2] = t.axes.length,
        HEAP32[e + 12 >> 2] = t.buttons.length,
        stringToUTF8(t.id, e + 1304, 64),
        stringToUTF8(t.mapping, e + 1368, 64)
    },
    registerGamepadEventCallback: function(e, t, n, r, o, i) {
        JSEvents.gamepadEvent || (JSEvents.gamepadEvent = _malloc(1432));
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !0,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                JSEvents.fillGamepadEventData(JSEvents.gamepadEvent, n.gamepad),
                Module.dynCall_iiii(r, o, JSEvents.gamepadEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    registerBeforeUnloadEventCallback: function(e, t, n, r, o, i) {
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event
                  , i = Module.dynCall_iiii(r, o, 0, t);
                if (i && (i = Pointer_stringify(i)),
                i)
                    return n.preventDefault(),
                    n.returnValue = i,
                    i
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    battery: function() {
        return navigator.battery || navigator.mozBattery || navigator.webkitBattery
    },
    fillBatteryEventData: function(e, t) {
        HEAPF64[e >> 3] = t.chargingTime,
        HEAPF64[e + 8 >> 3] = t.dischargingTime,
        HEAPF64[e + 16 >> 3] = t.level,
        HEAP32[e + 24 >> 2] = t.charging
    },
    registerBatteryEventCallback: function(e, t, n, r, o, i) {
        JSEvents.batteryEvent || (JSEvents.batteryEvent = _malloc(32));
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                JSEvents.fillBatteryEventData(JSEvents.batteryEvent, JSEvents.battery()),
                Module.dynCall_iiii(r, o, JSEvents.batteryEvent, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    },
    registerWebGlEventCallback: function(e, t, n, r, o, i) {
        e || (e = Module.canvas);
        var a = {
            target: JSEvents.findEventTarget(e),
            allowsDeferredCalls: !1,
            eventTypeString: i,
            callbackfunc: r,
            handlerFunc: function(e) {
                var n = e || window.event;
                Module.dynCall_iiii(r, o, 0, t) && n.preventDefault()
            },
            useCapture: n
        };
        JSEvents.registerOrRemoveHandler(a)
    }
}, GLctx;
function _emscripten_set_gamepaddisconnected_callback(e, t, n) {
    return navigator.getGamepads || navigator.webkitGetGamepads ? (JSEvents.registerGamepadEventCallback(window, e, t, n, 27, "gamepaddisconnected"),
    0) : -1
}
function _SDL_AudioQuit() {
    for (var e = 0; e < SDL.numChannels; ++e)
        SDL.channels[e].audio && (SDL.channels[e].audio.pause(),
        SDL.channels[e].audio = void 0);
    SDL.music.audio && SDL.music.audio.pause(),
    SDL.music.audio = void 0
}
function _SDL_Quit() {
    _SDL_AudioQuit(),
    Module.print("SDL_Quit called (and ignored)")
}
function _emscripten_set_gamepadconnected_callback(e, t, n) {
    return navigator.getGamepads || navigator.webkitGetGamepads ? (JSEvents.registerGamepadEventCallback(window, e, t, n, 26, "gamepadconnected"),
    0) : -1
}
function _SDL_OpenAudio(e, t) {
    try {
        if (SDL.audio = {
            freq: HEAPU32[e >> 2],
            format: HEAPU16[e + 4 >> 1],
            channels: HEAPU8[e + 6 >> 0],
            samples: HEAPU16[e + 8 >> 1],
            callback: HEAPU32[e + 16 >> 2],
            userdata: HEAPU32[e + 20 >> 2],
            paused: !0,
            timer: null
        },
        8 == SDL.audio.format)
            SDL.audio.silence = 128;
        else {
            if (32784 != SDL.audio.format)
                throw "Invalid SDL audio format " + SDL.audio.format + "!";
            SDL.audio.silence = 0
        }
        if (SDL.audio.freq <= 0)
            throw "Unsupported sound frequency " + SDL.audio.freq + "!";
        if (SDL.audio.freq <= 22050)
            SDL.audio.freq = 22050;
        else if (SDL.audio.freq <= 32e3)
            SDL.audio.freq = 32e3;
        else if (SDL.audio.freq <= 44100)
            SDL.audio.freq = 44100;
        else if (SDL.audio.freq <= 48e3)
            SDL.audio.freq = 48e3;
        else {
            if (!(SDL.audio.freq <= 96e3))
                throw "Unsupported sound frequency " + SDL.audio.freq + "!";
            SDL.audio.freq = 96e3
        }
        if (0 == SDL.audio.channels)
            SDL.audio.channels = 1;
        else {
            if (SDL.audio.channels < 0 || SDL.audio.channels > 32)
                throw "Unsupported number of audio channels for SDL audio: " + SDL.audio.channels + "!";
            1 != SDL.audio.channels && 2 != SDL.audio.channels && console.log("Warning: Using untested number of audio channels " + SDL.audio.channels)
        }
        if (SDL.audio.samples < 128 || SDL.audio.samples > 524288)
            throw "Unsupported audio callback buffer size " + SDL.audio.samples + "!";
        if (0 != (SDL.audio.samples & SDL.audio.samples - 1))
            throw "Audio callback buffer size " + SDL.audio.samples + " must be a power-of-two!";
        var n = SDL.audio.samples * SDL.audio.channels;
        if (SDL.audio.bytesPerSample = 8 == SDL.audio.format || 32776 == SDL.audio.format ? 1 : 2,
        SDL.audio.bufferSize = n * SDL.audio.bytesPerSample,
        SDL.audio.bufferDurationSecs = SDL.audio.bufferSize / SDL.audio.bytesPerSample / SDL.audio.channels / SDL.audio.freq,
        SDL.audio.bufferingDelay = .05,
        SDL.audio.buffer = _malloc(SDL.audio.bufferSize),
        SDL.audio.numSimultaneouslyQueuedBuffers = Module.SDL_numSimultaneouslyQueuedBuffers || 5,
        SDL.audio.queueNewAudioData = function() {
            if (SDL.audio)
                for (var e = 0; e < SDL.audio.numSimultaneouslyQueuedBuffers; ++e) {
                    if (SDL.audio.nextPlayTime - SDL.audioContext.currentTime >= SDL.audio.bufferingDelay + SDL.audio.bufferDurationSecs * SDL.audio.numSimultaneouslyQueuedBuffers)
                        return;
                    Module.dynCall_viii(SDL.audio.callback, SDL.audio.userdata, SDL.audio.buffer, SDL.audio.bufferSize),
                    SDL.audio.pushAudio(SDL.audio.buffer, SDL.audio.bufferSize)
                }
        }
        ,
        SDL.audio.caller = function() {
            if (SDL.audio) {
                --SDL.audio.numAudioTimersPending,
                SDL.audio.queueNewAudioData();
                var e = SDL.audio.nextPlayTime - SDL.audioContext.currentTime
                  , t = SDL.audio.bufferDurationSecs / 2;
                SDL.audio.numAudioTimersPending < SDL.audio.numSimultaneouslyQueuedBuffers && (++SDL.audio.numAudioTimersPending,
                SDL.audio.timer = Browser.safeSetTimeout(SDL.audio.caller, Math.max(0, 1e3 * (e - t))),
                SDL.audio.numAudioTimersPending < SDL.audio.numSimultaneouslyQueuedBuffers && (++SDL.audio.numAudioTimersPending,
                Browser.safeSetTimeout(SDL.audio.caller, 1)))
            }
        }
        ,
        SDL.audio.audioOutput = new Audio,
        SDL.openAudioContext(),
        !SDL.audioContext)
            throw "Web Audio API is not available!";
        SDL.audio.nextPlayTime = 0,
        SDL.audio.pushAudio = function(e, t) {
            try {
                if (SDL.audio.paused)
                    return;
                var n = t / SDL.audio.bytesPerSample / SDL.audio.channels;
                if (n != SDL.audio.samples)
                    throw "Received mismatching audio buffer size!";
                var r = SDL.audioContext.createBufferSource()
                  , o = SDL.audioContext.createBuffer(SDL.audio.channels, n, SDL.audio.freq);
                r.connect(SDL.audioContext.destination),
                SDL.fillWebAudioBufferFromHeap(e, n, o),
                r.buffer = o;
                var i = SDL.audioContext.currentTime
                  , a = Math.max(i + SDL.audio.bufferingDelay, SDL.audio.nextPlayTime);
                void 0 !== r.start ? r.start(a) : void 0 !== r.noteOn && r.noteOn(a),
                SDL.audio.nextPlayTime = a + SDL.audio.bufferDurationSecs
            } catch (e) {
                console.log("Web Audio API error playing back audio: " + e.toString())
            }
        }
        ,
        t && (HEAP32[t >> 2] = SDL.audio.freq,
        HEAP16[t + 4 >> 1] = SDL.audio.format,
        HEAP8[t + 6 >> 0] = SDL.audio.channels,
        HEAP8[t + 7 >> 0] = SDL.audio.silence,
        HEAP16[t + 8 >> 1] = SDL.audio.samples,
        HEAP32[t + 16 >> 2] = SDL.audio.callback,
        HEAP32[t + 20 >> 2] = SDL.audio.userdata),
        SDL.allocateChannels(32)
    } catch (e) {
        console.log('Initializing SDL audio threw an exception: "' + e.toString() + '"! Continuing without audio.'),
        SDL.audio = null,
        SDL.allocateChannels(0),
        t && (HEAP32[t >> 2] = 0,
        HEAP16[t + 4 >> 1] = 0,
        HEAP8[t + 6 >> 0] = 0,
        HEAP8[t + 7 >> 0] = 0,
        HEAP16[t + 8 >> 1] = 0,
        HEAP32[t + 16 >> 2] = 0,
        HEAP32[t + 20 >> 2] = 0)
    }
    return SDL.audio ? 0 : -1
}
function ___syscall140(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStreamFromFD()
          , r = (SYSCALLS.get(),
        SYSCALLS.get())
          , o = SYSCALLS.get()
          , i = SYSCALLS.get()
          , a = r;
        return FS.llseek(n, a, i),
        HEAP32[o >> 2] = n.position,
        n.getdents && 0 === a && 0 === i && (n.getdents = null),
        0
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function ___syscall146(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStreamFromFD()
          , r = SYSCALLS.get()
          , o = SYSCALLS.get();
        return SYSCALLS.doWritev(n, r, o)
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function _SDL_JoystickUpdate() {
    SDL.queryJoysticks()
}
function ___syscall221(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStreamFromFD();
        switch (SYSCALLS.get()) {
        case 0:
            return (r = SYSCALLS.get()) < 0 ? -ERRNO_CODES.EINVAL : FS.open(n.path, n.flags, 0, r).fd;
        case 1:
        case 2:
            return 0;
        case 3:
            return n.flags;
        case 4:
            var r = SYSCALLS.get();
            return n.flags |= r,
            0;
        case 12:
        case 12:
            r = SYSCALLS.get();
            return HEAP16[r + 0 >> 1] = 2,
            0;
        case 13:
        case 14:
        case 13:
        case 14:
            return 0;
        case 16:
        case 8:
            return -ERRNO_CODES.EINVAL;
        case 9:
            return ___setErrNo(ERRNO_CODES.EINVAL),
            -1;
        default:
            return -ERRNO_CODES.EINVAL
        }
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function ___syscall145(e, t) {
    SYSCALLS.varargs = t;
    try {
        var n = SYSCALLS.getStreamFromFD()
          , r = SYSCALLS.get()
          , o = SYSCALLS.get();
        return SYSCALLS.doReadv(n, r, o)
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
if (Module._llvm_bswap_i32 = _llvm_bswap_i32,
FS.staticInit(),
__ATINIT__.unshift(function() {
    Module.noFSInit || FS.init.initialized || FS.init()
}),
__ATMAIN__.push(function() {
    FS.ignorePermissions = !1
}),
__ATEXIT__.push(function() {
    FS.quit()
}),
Module.FS_createFolder = FS.createFolder,
Module.FS_createPath = FS.createPath,
Module.FS_createDataFile = FS.createDataFile,
Module.FS_createPreloadedFile = FS.createPreloadedFile,
Module.FS_createLazyFile = FS.createLazyFile,
Module.FS_createLink = FS.createLink,
Module.FS_createDevice = FS.createDevice,
Module.FS_unlink = FS.unlink,
__ATINIT__.unshift(function() {
    TTY.init()
}),
__ATEXIT__.push(function() {
    TTY.shutdown()
}),
ENVIRONMENT_IS_NODE) {
    var fs = require("fs")
      , NODEJS_PATH = require("path");
    NODEFS.staticInit()
}
function invoke_ii(e, t) {
    try {
        return Module.dynCall_ii(e, t)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e)
            throw e;
        Module.setThrew(1, 0)
    }
}
function invoke_iiii(e, t, n, r) {
    try {
        return Module.dynCall_iiii(e, t, n, r)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e)
            throw e;
        Module.setThrew(1, 0)
    }
}
function invoke_viii(e, t, n, r) {
    try {
        Module.dynCall_viii(e, t, n, r)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e)
            throw e;
        Module.setThrew(1, 0)
    }
}
Module.requestFullScreen = function(e, t, n) {
    Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead."),
    Module.requestFullScreen = Module.requestFullscreen,
    Browser.requestFullScreen(e, t, n)
}
,
Module.requestFullscreen = function(e, t, n) {
    Browser.requestFullscreen(e, t, n)
}
,
Module.requestAnimationFrame = function(e) {
    Browser.requestAnimationFrame(e)
}
,
Module.setCanvasSize = function(e, t, n) {
    Browser.setCanvasSize(e, t, n)
}
,
Module.pauseMainLoop = function() {
    Browser.mainLoop.pause()
}
,
Module.resumeMainLoop = function() {
    Browser.mainLoop.resume()
}
,
Module.getUserMedia = function() {
    Browser.getUserMedia()
}
,
Module.createContext = function(e, t, n, r) {
    return Browser.createContext(e, t, n, r)
}
,
_emscripten_get_now = ENVIRONMENT_IS_NODE ? function() {
    var e = process.hrtime();
    return 1e3 * e[0] + e[1] / 1e6
}
: "undefined" != typeof dateNow ? dateNow : "object" == typeof self && self.performance && "function" == typeof self.performance.now ? function() {
    return self.performance.now()
}
: "object" == typeof performance && "function" == typeof performance.now ? function() {
    return performance.now()
}
: Date.now,
___buildEnvironment(ENV),
GL.init(),
JSEvents.staticInit(),
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC),
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP),
STACK_MAX = STACK_BASE + TOTAL_STACK,
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX),
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE,
staticSealed = !0,
Module.wasmTableSize = 12,
Module.wasmMaxTableSize = 12,
Module.asmGlobalArg = {
    Math: Math,
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    NaN: NaN,
    Infinity: 1 / 0
},
Module.asmLibraryArg = {
    abort: abort,
    assert: assert,
    enlargeMemory: enlargeMemory,
    getTotalMemory: getTotalMemory,
    abortOnCannotGrowMemory: abortOnCannotGrowMemory,
    invoke_ii: invoke_ii,
    invoke_iiii: invoke_iiii,
    invoke_viii: invoke_viii,
    ___syscall221: ___syscall221,
    _SDL_JoystickNumHats: _SDL_JoystickNumHats,
    _putenv: _putenv,
    _SDL_QuitSubSystem: _SDL_QuitSubSystem,
    _IMG_Load: _IMG_Load,
    _abort: _abort,
    _SDL_JoystickGetAxis: _SDL_JoystickGetAxis,
    _TTF_FontHeight: _TTF_FontHeight,
    _SDL_CloseAudio: _SDL_CloseAudio,
    ___setErrNo: ___setErrNo,
    _SDL_GetTicks: _SDL_GetTicks,
    _SDL_RWFromConstMem: _SDL_RWFromConstMem,
    ___buildEnvironment: ___buildEnvironment,
    _emscripten_asm_const_ii: _emscripten_asm_const_ii,
    _SDL_RWFromFile: _SDL_RWFromFile,
    _SDL_LockSurface: _SDL_LockSurface,
    _SDL_JoystickNumButtons: _SDL_JoystickNumButtons,
    _Mix_HaltMusic: _Mix_HaltMusic,
    _emscripten_set_main_loop_timing: _emscripten_set_main_loop_timing,
    _emscripten_set_gamepaddisconnected_callback: _emscripten_set_gamepaddisconnected_callback,
    _SDL_PollEvent: _SDL_PollEvent,
    _SDL_Init: _SDL_Init,
    _SDL_OpenAudio: _SDL_OpenAudio,
    _Mix_PlayChannel: _Mix_PlayChannel,
    _TTF_RenderText_Solid: _TTF_RenderText_Solid,
    _Mix_LoadWAV_RW: _Mix_LoadWAV_RW,
    _SDL_PauseAudio: _SDL_PauseAudio,
    _emscripten_set_gamepadconnected_callback: _emscripten_set_gamepadconnected_callback,
    _IMG_Load_RW: _IMG_Load_RW,
    _SDL_InitSubSystem: _SDL_InitSubSystem,
    _Mix_PlayMusic: _Mix_PlayMusic,
    _emscripten_memcpy_big: _emscripten_memcpy_big,
    _SDL_JoystickUpdate: _SDL_JoystickUpdate,
    _SDL_Quit: _SDL_Quit,
    _SDL_JoystickNumAxes: _SDL_JoystickNumAxes,
    _TTF_SizeText: _TTF_SizeText,
    _SDL_JoystickGetButton: _SDL_JoystickGetButton,
    _SDL_UpperBlitScaled: _SDL_UpperBlitScaled,
    ___syscall54: ___syscall54,
    ___unlock: ___unlock,
    ___syscall140: ___syscall140,
    _SDL_AudioQuit: _SDL_AudioQuit,
    _emscripten_set_main_loop: _emscripten_set_main_loop,
    _SDL_NumJoysticks: _SDL_NumJoysticks,
    _emscripten_get_now: _emscripten_get_now,
    _SDL_CreateRGBSurface: _SDL_CreateRGBSurface,
    _SDL_JoystickGetHat: _SDL_JoystickGetHat,
    _getenv: _getenv,
    _SDL_JoystickOpen: _SDL_JoystickOpen,
    ___lock: ___lock,
    _SDL_SetVideoMode: _SDL_SetVideoMode,
    ___syscall6: ___syscall6,
    ___syscall5: ___syscall5,
    _Mix_FreeChunk: _Mix_FreeChunk,
    _emscripten_asm_const_v: _emscripten_asm_const_v,
    _SDL_Flip: _SDL_Flip,
    _SDL_FreeRW: _SDL_FreeRW,
    _SDL_UpperBlit: _SDL_UpperBlit,
    _SDL_WasInit: _SDL_WasInit,
    _SDL_JoystickEventState: _SDL_JoystickEventState,
    ___syscall145: ___syscall145,
    ___syscall146: ___syscall146,
    _emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
    DYNAMICTOP_PTR: DYNAMICTOP_PTR,
    tempDoublePtr: tempDoublePtr,
    ABORT: ABORT,
    STACKTOP: STACKTOP,
    STACK_MAX: STACK_MAX
};
var asm = Module.asm(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
Module.asm = asm;
var _llvm_bswap_i32 = Module._llvm_bswap_i32 = function() {
    return Module.asm._llvm_bswap_i32.apply(null, arguments)
}
, _main = Module._main = function() {
    return Module.asm._main.apply(null, arguments)
}
, _CheckJoy = Module._CheckJoy = function() {
    return Module.asm._CheckJoy.apply(null, arguments)
}
, setThrew = Module.setThrew = function() {
    return Module.asm.setThrew.apply(null, arguments)
}
, _SoundGetBytesBuffered = Module._SoundGetBytesBuffered = function() {
    return Module.asm._SoundGetBytesBuffered.apply(null, arguments)
}
, _malloc = Module._malloc = function() {
    return Module.asm._malloc.apply(null, arguments)
}
, _fflush = Module._fflush = function() {
    return Module.asm._fflush.apply(null, arguments)
}
, _memset = Module._memset = function() {
    return Module.asm._memset.apply(null, arguments)
}
, _sbrk = Module._sbrk = function() {
    return Module.asm._sbrk.apply(null, arguments)
}
, _memcpy = Module._memcpy = function() {
    return Module.asm._memcpy.apply(null, arguments)
}
, _CheckKeyboard = Module._CheckKeyboard = function() {
    return Module.asm._CheckKeyboard.apply(null, arguments)
}
, ___errno_location = Module.___errno_location = function() {
    return Module.asm.___errno_location.apply(null, arguments)
}
, stackAlloc = Module.stackAlloc = function() {
    return Module.asm.stackAlloc.apply(null, arguments)
}
, getTempRet0 = Module.getTempRet0 = function() {
    return Module.asm.getTempRet0.apply(null, arguments)
}
, setTempRet0 = Module.setTempRet0 = function() {
    return Module.asm.setTempRet0.apply(null, arguments)
}
, _emscripten_get_global_libc = Module._emscripten_get_global_libc = function() {
    return Module.asm._emscripten_get_global_libc.apply(null, arguments)
}
, _SoundFeedStreamData = Module._SoundFeedStreamData = function() {
    return Module.asm._SoundFeedStreamData.apply(null, arguments)
}
, stackSave = Module.stackSave = function() {
    return Module.asm.stackSave.apply(null, arguments)
}
, _free = Module._free = function() {
    return Module.asm._free.apply(null, arguments)
}
, runPostSets = Module.runPostSets = function() {
    return Module.asm.runPostSets.apply(null, arguments)
}
, establishStackSpace = Module.establishStackSpace = function() {
    return Module.asm.establishStackSpace.apply(null, arguments)
}
, stackRestore = Module.stackRestore = function() {
    return Module.asm.stackRestore.apply(null, arguments)
}
, _LoadPADConfig = Module._LoadPADConfig = function() {
    return Module.asm._LoadPADConfig.apply(null, arguments)
}
, _render = Module._render = function() {
    return Module.asm._render.apply(null, arguments)
}
, _get_ptr = Module._get_ptr = function() {
    return Module.asm._get_ptr.apply(null, arguments)
}
, dynCall_ii = Module.dynCall_ii = function() {
    return Module.asm.dynCall_ii.apply(null, arguments)
}
, dynCall_iiii = Module.dynCall_iiii = function() {
    return Module.asm.dynCall_iiii.apply(null, arguments)
}
, dynCall_viii = Module.dynCall_viii = function() {
    return Module.asm.dynCall_viii.apply(null, arguments)
}
, initialStackTop;
if (Runtime.stackAlloc = Module.stackAlloc,
Runtime.stackSave = Module.stackSave,
Runtime.stackRestore = Module.stackRestore,
Runtime.establishStackSpace = Module.establishStackSpace,
Runtime.setTempRet0 = Module.setTempRet0,
Runtime.getTempRet0 = Module.getTempRet0,
Module.asm = asm,
memoryInitializer)
    if ("function" == typeof Module.locateFile ? memoryInitializer = Module.locateFile(memoryInitializer) : Module.memoryInitializerPrefixURL && (memoryInitializer = Module.memoryInitializerPrefixURL + memoryInitializer),
    ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
        var data = Module.readBinary(memoryInitializer);
        HEAPU8.set(data, Runtime.GLOBAL_BASE)
    } else {
        addRunDependency("memory initializer");
        var applyMemoryInitializer = function(e) {
            e.byteLength && (e = new Uint8Array(e)),
            HEAPU8.set(e, Runtime.GLOBAL_BASE),
            Module.memoryInitializerRequest && delete Module.memoryInitializerRequest.response,
            removeRunDependency("memory initializer")
        };
        function doBrowserLoad() {
            Module.readAsync(memoryInitializer, applyMemoryInitializer, function() {
                throw "could not load memory initializer " + memoryInitializer
            })
        }
        if (Module.memoryInitializerRequest) {
            function useRequest() {
                var e = Module.memoryInitializerRequest;
                if (200 !== e.status && 0 !== e.status)
                    return console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: " + e.status + ", retrying " + memoryInitializer),
                    void doBrowserLoad();
                applyMemoryInitializer(e.response)
            }
            Module.memoryInitializerRequest.response ? setTimeout(useRequest, 0) : Module.memoryInitializerRequest.addEventListener("load", useRequest)
        } else
            doBrowserLoad()
    }
function ExitStatus(e) {
    this.name = "ExitStatus",
    this.message = "Program terminated with exit(" + e + ")",
    this.status = e
}
ExitStatus.prototype = new Error,
ExitStatus.prototype.constructor = ExitStatus;
var preloadStartTime = null
  , calledMain = !1;
function run(e) {
    function t() {
        Module.calledRun || (Module.calledRun = !0,
        ABORT || (ensureInitRuntime(),
        preMain(),
        Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
        Module._main && shouldRunNow && Module.callMain(e),
        postRun()))
    }
    e = e || Module.arguments,
    null === preloadStartTime && (preloadStartTime = Date.now()),
    runDependencies > 0 || (preRun(),
    runDependencies > 0 || Module.calledRun || (Module.setStatus ? (Module.setStatus("Running..."),
    setTimeout(function() {
        setTimeout(function() {
            Module.setStatus("")
        }, 1),
        t()
    }, 1)) : t()))
}
function exit(e, t) {
    t && Module.noExitRuntime || (Module.noExitRuntime || (ABORT = !0,
    EXITSTATUS = e,
    STACKTOP = initialStackTop,
    exitRuntime(),
    Module.onExit && Module.onExit(e)),
    ENVIRONMENT_IS_NODE && process.exit(e),
    Module.quit(e, new ExitStatus(e)))
}
dependenciesFulfilled = function e() {
    Module.calledRun || run(),
    Module.calledRun || (dependenciesFulfilled = e)
}
,
Module.callMain = Module.callMain = function(e) {
    e = e || [],
    ensureInitRuntime();
    var t = e.length + 1;
    function n() {
        for (var e = 0; e < 3; e++)
            r.push(0)
    }
    var r = [allocate(intArrayFromString(Module.thisProgram), "i8", ALLOC_NORMAL)];
    n();
    for (var o = 0; o < t - 1; o += 1)
        r.push(allocate(intArrayFromString(e[o]), "i8", ALLOC_NORMAL)),
        n();
    r.push(0),
    r = allocate(r, "i32", ALLOC_NORMAL);
    try {
        exit(Module._main(t, r, 0), !0)
    } catch (e) {
        if (e instanceof ExitStatus)
            return;
        if ("SimulateInfiniteLoop" == e)
            return void (Module.noExitRuntime = !0);
        var i = e;
        e && "object" == typeof e && e.stack && (i = [e, e.stack]),
        Module.printErr("exception thrown: " + i),
        Module.quit(1, e)
    } finally {
        calledMain = !0
    }
}
,
Module.run = Module.run = run,
Module.exit = Module.exit = exit;
var abortDecorators = [];
function abort(e) {
    Module.onAbort && Module.onAbort(e),
    void 0 !== e ? (Module.print(e),
    Module.printErr(e),
    e = JSON.stringify(e)) : e = "",
    ABORT = !0,
    EXITSTATUS = 1;
    var t = "abort(" + e + ") at " + stackTrace() + "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
    throw abortDecorators && abortDecorators.forEach(function(n) {
        t = n(t, e)
    }),
    t
}
if (Module.abort = Module.abort = abort,
Module.preInit)
    for ("function" == typeof Module.preInit && (Module.preInit = [Module.preInit]); Module.preInit.length > 0; )
        Module.preInit.pop()();
var shouldRunNow = !0;
Module.noInitialRun && (shouldRunNow = !1),
run();
var getFileBlob = function(e, t) {
    var n = new XMLHttpRequest;
    n.open("GET", e),
    n.responseType = "blob",
    n.addEventListener("load", function() {
        t(n.response)
    }),
    n.send()
};
function blobToFile(e, t) {
    return e.lastModifiedDate = new Date,
    e.name = t,
    e
}
blobToFile = function(e, t) {
    return e.lastModifiedDate = new Date,
    e.name = t,
    e
}
,
getFileObject = function(e, t) {
    getFileBlob(e, function(e) {
        t(blobToFile(e, "test.jpg"))
    })
}
,
loadUrl = function(e) {
	getFileObject(e, function(e) {
		console.log(e), pcsx_worker.postMessage({
			cmd: "loadfile",
			file: e
		}), setTimeout("check_controller()", 10), console.log("WASMpsx: Loading URL....")
	})
,
readFile = function(e) {
    pcsx_worker.postMessage({
        cmd: "loadfile",
        file: e
    }),
    setTimeout("check_controller()", 10)
}
;
var html = ` <div class="menu" style="background-color: white; border-width: 2px; border-style: solid; border-radius: 12px; z-index: 99999999999999999;"> <ul class="menu-options" style="list-style-type: none; font-family: 'Roboto', san-serif; "> <li class="menu-option" onclick="window.open('https://github.com/Unzor/wasmpsx')">WASMpsx build v2.3</li> <li> ‏‏‎ </li><li class="menu-option" onclick="WASMpsx.fullscreen();">Fullscreen</li> </ul> </div> `;
var css = `.center{ text-align: center; } .menu { width: 120px; position: fixed; display: none; transition: 0.2s display ease-in; .menu-options { list-style: none; padding: 10px 0; z-index: 1; .menu-option { font-weight: 500; z-index: 1; font-size: 14px; padding: 10px 40px 10px 20px;  border-bottom: 1.5px solid rgba(0, 0, 0, 0.2); cursor: pointer; &:hover { background: rgba(0, 0, 0, 0.2); } } } } .next{ color:green; } &[disabled="false"]:hover{ .next{ color: red; animation: move 0.5s; animation-iteration-count: 2; } }  @keyframes move{ from{ transform: translate(0%); } 50%{ transform: translate(-40%); } to{ transform: transform(0%); } } `;
var elm = document.createElement('div');
elm.innerHTML = html;
document.body.appendChild(elm);
var csselm = document.createElement('style');
csselm.innerHTML = css;
document.head.appendChild(csselm);
const menu = document.querySelector(".menu");
const menuOption = document.querySelector(".menu-option");
let menuVisible = false;
const toggleMenu = command=>{
    menu.style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
}
;
const setPosition = ({top, left})=>{
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    toggleMenu("show");
}
;
window.addEventListener("click", e=>{
    if (menuVisible)
        toggleMenu("hide");
}
);
menuOption.addEventListener("click", e=>{
    console.log("mouse-option", e.target.innerHTML);
}
);
canvElm.addEventListener("contextmenu", e=>{
    e.preventDefault();
    return false;
}
);
WASMpsx.fullscreen = function() {
    replacement.requestFullscreen();
}
;
WASMpsx.version = 'v2.3';
