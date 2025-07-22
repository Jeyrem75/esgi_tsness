"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
exports.getUserRoleLevel = getUserRoleLevel;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["GYM_OWNER"] = "GYM_OWNER";
    UserRole["CLIENT"] = "CLIENT";
})(UserRole || (exports.UserRole = UserRole = {}));
function getUserRoleLevel(role) {
    switch (role) {
        case UserRole.SUPER_ADMIN:
            return 999;
        case UserRole.GYM_OWNER:
            return 100;
        case UserRole.CLIENT:
            return 1;
        default:
            return 0;
    }
}
