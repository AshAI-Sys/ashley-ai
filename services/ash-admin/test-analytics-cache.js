/**
 * Analytics Caching Performance Test
 * Tests cache hit/miss scenarios and measures response time improvements
 */

const BASE_URL = "http://localhost:3001";

async function testAnalyticsCache() {
  console.log("🧪 Testing Analytics Caching Performance\n");

  const analyticsTypes = ["sales", "production", "inventory", "financial", "hr"];
  const ranges = ["today", "week", "month"];

  const results = {
    uncachedRequests: [],
    cachedRequests: [],
    improvements: [],
  };

  for (const type of analyticsTypes) {
    for (const range of ranges) {
      const url = `${BASE_URL}/api/analytics?type=${type}&range=${range}`;

      try {
        // First request (should be uncached)
        const uncachedStart = Date.now();
        const uncachedRes = await fetch(url, {
          headers: {
            Cookie: process.env.AUTH_COOKIE || "",
          },
        });
        const uncachedTime = Date.now() - uncachedStart;

        if (!uncachedRes.ok) {
          console.log(`❌ Failed: ${type}/${range} - ${uncachedRes.status}`);
          continue;
        }

        // Wait 100ms
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Second request (should be cached)
        const cachedStart = Date.now();
        const cachedRes = await fetch(url, {
          headers: {
            Cookie: process.env.AUTH_COOKIE || "",
          },
        });
        const cachedTime = Date.now() - cachedStart;

        if (!cachedRes.ok) {
          console.log(`❌ Failed: ${type}/${range} - ${cachedRes.status}`);
          continue;
        }

        const improvement = ((uncachedTime - cachedTime) / uncachedTime) * 100;

        results.uncachedRequests.push(uncachedTime);
        results.cachedRequests.push(cachedTime);
        results.improvements.push(improvement);

        console.log(
          `✅ ${type.padEnd(12)} | ${range.padEnd(8)} | Uncached: ${uncachedTime}ms | Cached: ${cachedTime}ms | Improvement: ${improvement.toFixed(1)}%`
        );
      } catch (error) {
        console.error(`❌ Error testing ${type}/${range}:`, error.message);
      }
    }
  }

  // Calculate averages
  const avgUncached =
    results.uncachedRequests.reduce((a, b) => a + b, 0) /
    results.uncachedRequests.length;
  const avgCached =
    results.cachedRequests.reduce((a, b) => a + b, 0) /
    results.cachedRequests.length;
  const avgImprovement =
    results.improvements.reduce((a, b) => a + b, 0) /
    results.improvements.length;

  console.log("\n📊 Performance Summary:");
  console.log(`   Average uncached response time: ${avgUncached.toFixed(0)}ms`);
  console.log(`   Average cached response time: ${avgCached.toFixed(0)}ms`);
  console.log(
    `   Average improvement: ${avgImprovement.toFixed(1)}% (${(avgUncached / avgCached).toFixed(1)}x faster)`
  );

  if (avgImprovement > 50) {
    console.log("\n✅ PASS: Caching provides >50% performance improvement");
  } else {
    console.log(
      `\n⚠️  WARNING: Caching only provides ${avgImprovement.toFixed(1)}% improvement (target: >50%)`
    );
  }
}

testAnalyticsCache().catch(console.error);
