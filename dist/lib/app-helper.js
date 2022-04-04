"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NODE_ENV = process.env.NODE_ENV;
class AppHelper {
    static getEnvironmentName() {
        let envName = NODE_ENV ? NODE_ENV : 'development';
        return envName;
    }
}
exports.default = AppHelper;
//# sourceMappingURL=app-helper.js.map