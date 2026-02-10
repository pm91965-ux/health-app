"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastSession = exports.saveSession = exports.getHistory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, '../data');
const FILE_PATH = path_1.default.join(DATA_DIR, 'history.json');
// Ensure data dir exists
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR);
}
const getHistory = () => {
    if (!fs_1.default.existsSync(FILE_PATH)) {
        return [];
    }
    const data = fs_1.default.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
};
exports.getHistory = getHistory;
const saveSession = (session) => {
    const history = (0, exports.getHistory)();
    history.push(session);
    fs_1.default.writeFileSync(FILE_PATH, JSON.stringify(history, null, 2));
};
exports.saveSession = saveSession;
const getLastSession = () => {
    const history = (0, exports.getHistory)();
    return history.length > 0 ? history[history.length - 1] : undefined;
};
exports.getLastSession = getLastSession;
