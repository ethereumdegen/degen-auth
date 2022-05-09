"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DegenAuthExtension = exports.AuthenticationTokenDefinition = exports.ChallengeTokenDefinition = exports.AuthenticationTokenSchema = exports.ChallengeTokenSchema = void 0;
const extensible_mongoose_1 = require("extensible-mongoose");
const mongoose_1 = require("mongoose");
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
exports.ChallengeTokenDefinition = {
    tableName: 'challengetokens', schema: exports.ChallengeTokenSchema
};
exports.AuthenticationTokenDefinition = {
    tableName: 'authenticationtokens', schema: exports.ChallengeTokenSchema
};
class DegenAuthExtension extends extensible_mongoose_1.DatabaseExtension {
    constructor(mongoDatabase) {
        super(mongoDatabase);
    }
    getBindableModels() {
        return [
            exports.ChallengeTokenDefinition,
            exports.AuthenticationTokenDefinition
        ];
    }
}
exports.DegenAuthExtension = DegenAuthExtension;
//# sourceMappingURL=degen-auth-database-extension.js.map