// polyfill self for comlinkjs
const globalObj = (function () {
    return this;
})();
if (!globalObj.self) {
    globalObj.self = globalObj;
}
