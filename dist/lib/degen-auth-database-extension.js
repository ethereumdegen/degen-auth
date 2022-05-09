"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationTokenSchema = exports.ChallengeTokenSchema = exports.AuthUserSchema = void 0;
const extensible_mongoose_1 = require("extensible-mongoose");
const mongoose_1 = require("mongoose");
exports.AuthUserSchema = new mongoose_1.Schema({
    publicAddress: { type: String, index: true, unique: true },
});
exports.ChallengeTokenSchema = new mongoose_1.Schema({
    challenge: { type: String },
    publicAddress: { type: String, index: true, unique: true },
    createdAt: Number,
});
exports.AuthenticationTokenSchema = new mongoose_1.Schema({
    token: { type: String },
    publicAddress: { type: String, index: true, unique: true },
    createdAt: Number,
});
class DegenAuthExtension extends extensible_mongoose_1.DatabaseExtension {
    constructor(mongoDatabase) {
        super(mongoDatabase);
    }
    getBindableModels() {
        return [
            { tableName: 'authusers', schema: exports.AuthUserSchema },
            { tableName: 'challengetokens', schema: exports.ChallengeTokenSchema },
            { tableName: 'authenticationtokens', schema: exports.AuthenticationTokenSchema }
        ];
    }
}
exports.default = DegenAuthExtension;
//# sourceMappingURL=degen-auth-database-extension.js.map