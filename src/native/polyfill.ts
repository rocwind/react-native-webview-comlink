// POLYFILL_BEGIN

// polyfill self for comlinkjs
const global = (function(){ return this; })();
if (!global.self) {
    global.self = global;
}

// POLYFILL_END
