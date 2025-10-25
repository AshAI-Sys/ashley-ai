"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientOnly = ClientOnly;
const react_1 = require("react");
function ClientOnly({ children }) {
    const [hasMounted, setHasMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setHasMounted(true);
    }, []);
    if (!hasMounted) {
        return null;
    }
    return <>{children}</>;
}
exports.default = ClientOnly;
