"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestPage;
const react_1 = require("react");
function TestPage() {
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        console.log("🧪 TEST PAGE - Component mounted!");
        async function fetchTest() {
            try {
                console.log("🧪 TEST PAGE - Fetching /api/clients...");
                const response = await fetch("/api/clients?limit=1");
                const result = await response.json();
                console.log("🧪 TEST PAGE - Response:", response.status, result);
                setData(result);
            }
            catch (error) {
                console.error("🧪 TEST PAGE - Error:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchTest();
    }, []);
    return (<div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>

      {loading && <p>Loading...</p>}

      {!loading && data && (<div>
          <p className="text-green-600">✅ SUCCESS!</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>)}

      {!loading && !data && (<p className="text-red-600">❌ FAILED to fetch data</p>)}
    </div>);
}
