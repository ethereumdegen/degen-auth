"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
class MongoInterface {
    constructor() {
        this.mongoose = new mongoose_1.Mongoose();
        this.UserSchema = new mongoose_1.Schema({
            publicAddress: { type: String, index: true, unique: true },
        });
        this.ChallengeTokenSchema = new mongoose_1.Schema({
            challenge: { type: String },
            publicAddress: { type: String, index: true, unique: true },
            createdAt: Number,
        });
        this.AuthenticationTokenSchema = new mongoose_1.Schema({
            token: { type: String },
            publicAddress: { type: String, index: true, unique: true },
            createdAt: Number,
        });
        this.UserModel = this.mongoose.model('users', this.UserSchema);
        this.ChallengeTokenModel = this.mongoose.model('challengetokens', this.ChallengeTokenSchema);
        this.AuthenticationTokenModel = this.mongoose.model('authenticationtokens', this.AuthenticationTokenSchema);
    }
    init(dbName, config) {
        return __awaiter(this, void 0, void 0, function* () {
            let host = 'localhost';
            let port = 27017;
            if (config && config.url) {
                host = config.url;
            }
            if (config && config.port) {
                port = config.port;
            }
            if (dbName == null) {
                console.log('WARNING: No dbName Specified');
                process.exit();
            }
            const url = 'mongodb://' + host + ':' + port + '/' + dbName;
            yield this.mongoose.connect(url, {});
            console.log('connected to ', url, dbName);
        });
    }
    dropDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mongoose.connection.db.dropDatabase();
        });
    }
}
exports.default = MongoInterface;
//# sourceMappingURL=mongo-interface.js.map