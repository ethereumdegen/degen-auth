"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose = new mongoose_1.Mongoose();
const UserSchema = new mongoose_1.Schema({
    userId: { type: String, index: true, unique: true },
    publicAddress: { type: String, index: true },
});
//# sourceMappingURL=mongo-interface.js.map