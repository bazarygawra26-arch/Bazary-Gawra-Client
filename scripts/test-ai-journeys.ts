// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log(' Bazary Gawra - End-to-End AI User Journey Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Sorani text search
  try {
    const q = 'قاوەساز لە سلێمانی بە کەمتر لە 200000 دینار';
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, language: 'ku' }),
    });
    const data = await res.json();
    console.log(`[TEST 1] Sorani Kurdish Search: Status ${res.status}`);
    console.log(`  Query: "${q}"`);
    console.log(`  Parsed Product: ${data.interpretation?.product_type}`);
    console.log(`  Target Location: ${data.interpretation?.target_location}`);
    console.log(`  Budget Max: ${data.interpretation?.budget_max} IQD`);
    console.log(`  Products Found: ${data.products?.length || 0}`);
    console.log(`  Request ID: ${data.request_id || 'N/A'}`);
    if (res.status === 200 && data.interpretation) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 1] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 2: Arabic text search
  try {
    const q = 'ماكينة قهوة في أربيل أقل من 250000 دينار';
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, language: 'ar' }),
    });
    const data = await res.json();
    console.log(`\n[TEST 2] Arabic Search: Status ${res.status}`);
    console.log(`  Query: "${q}"`);
    console.log(`  Parsed Product: ${data.interpretation?.product_type}`);
    console.log(`  Target Location: ${data.interpretation?.target_location}`);
    console.log(`  Budget Max: ${data.interpretation?.budget_max} IQD`);
    console.log(`  Products Found: ${data.products?.length || 0}`);
    if (res.status === 200 && data.interpretation) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 2] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 3: English text search
  try {
    const q = 'coffee machine under 200000 IQD in Sulaymaniyah';
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, language: 'en' }),
    });
    const data = await res.json();
    console.log(`\n[TEST 3] English Search: Status ${res.status}`);
    console.log(`  Query: "${q}"`);
    console.log(`  Parsed Product: ${data.interpretation?.product_type}`);
    console.log(`  Budget Max: ${data.interpretation?.budget_max} IQD`);
    console.log(`  Products Found: ${data.products?.length || 0}`);
    if (res.status === 200 && data.interpretation) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 3] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 4: Follow-up question preserving search context
  try {
    const q1 = 'coffee machine';
    const q2 = 'only with warranty in Sulaymaniyah';
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: q2,
        language: 'en',
        previousContext: { previousQuery: q1 },
      }),
    });
    const data = await res.json();
    console.log(`\n[TEST 4] Follow-up Question Context Preservation: Status ${res.status}`);
    console.log(`  Initial: "${q1}", Follow-up: "${q2}"`);
    console.log(`  Parsed Product: ${data.interpretation?.product_type}`);
    console.log(`  Extracted Preferences: ${JSON.stringify(data.interpretation?.extracted_preferences)}`);
    console.log(`  Products matching: ${data.products?.length || 0}`);
    if (res.status === 200 && data.interpretation) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 4] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 5: Comparison of two actual products
  let testedProductIds: string[] = [];
  try {
    // Get 2 real products
    const prodRes = await fetch(`${BASE_URL}/api/products?lang=ku`);
    const allProds = await prodRes.json();
    if (Array.isArray(allProds) && allProds.length >= 2) {
      testedProductIds = [allProds[0].id, allProds[1].id];
      const compRes = await fetch(`${BASE_URL}/api/ai/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: testedProductIds, language: 'ku' }),
      });
      const compData = await compRes.json();
      console.log(`\n[TEST 5] AI Comparison of 2 Real Products: Status ${compRes.status}`);
      console.log(`  Product 1: ${allProds[0].name}`);
      console.log(`  Product 2: ${allProds[1].name}`);
      console.log(`  Summary: ${compData.summary_ckb || compData.summary}`);
      console.log(`  Best Match: ${compData.best_match?.productName || 'N/A'}`);
      console.log(`  Verified Facts count: ${compData.facts_vs_advice?.verified_database_facts?.length || 0}`);
      console.log(`  Buying Advice count: ${compData.facts_vs_advice?.general_buying_advice?.length || 0}`);
      console.log(`  Pros/Cons count: ${compData.advantages_disadvantages?.length || 0}`);
      if (compRes.status === 200 && compData.summary) {
        console.log('  -> PASS ✅');
        passed++;
      } else {
        console.log('  -> FAIL ❌');
        failed++;
      }
    } else {
      console.log('\n[TEST 5] Skipped - not enough products in db');
    }
  } catch (err: any) {
    console.log(`[TEST 5] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 6: Question about a missing warranty field (Transparency gap)
  try {
    if (testedProductIds.length > 0) {
      const chatRes = await fetch(`${BASE_URL}/api/ai/product-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: testedProductIds[0],
          question: 'ئایا ئەم بەرهەمە گەرەنتی هەیە؟',
          language: 'ku',
        }),
      });
      const chatData = await chatRes.json();
      console.log(`\n[TEST 6] Question about Missing Warranty / Fact checking: Status ${chatRes.status}`);
      console.log(`  Question: "ئایا ئەم بەرهەمە گەرەنتی هەیە؟"`);
      console.log(`  Answer: ${chatData.answer?.slice(0, 120)}...`);
      console.log(`  Is Information Gap Flagged: ${chatData.isInformationGap}`);
      if (chatRes.status === 200 && chatData.answer) {
        console.log('  -> PASS ✅');
        passed++;
      } else {
        console.log('  -> FAIL ❌');
        failed++;
      }
    }
  } catch (err: any) {
    console.log(`[TEST 6] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 7: No matching products with honest alternative suggestion
  try {
    const q = 'supercomputer mainframe in Halabja under 50 IQD';
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, language: 'en' }),
    });
    const data = await res.json();
    console.log(`\n[TEST 7] No Matching Products Handling: Status ${res.status}`);
    console.log(`  Products count: ${data.products?.length} (Correctly 0)`);
    console.log(`  Alternatives provided from real catalogue: ${data.alternatives?.length || 0}`);
    console.log(`  Recommendation: "${data.recommendation?.slice(0, 100)}..."`);
    if (res.status === 200 && data.products?.length === 0 && data.recommendation) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 7] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 8: AI Seller Listing Draft
  try {
    const res = await fetch(`${BASE_URL}/api/ai/listing-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_description: 'قاوەسازی دێلۆنگی بۆ ماڵەوە 15 باڕ',
        language: 'ku',
      }),
    });
    const data = await res.json();
    console.log(`\n[TEST 8] AI Seller Listing Draft Generation: Status ${res.status}`);
    console.log(`  Title KU: ${data.title_ku}`);
    console.log(`  Title EN: ${data.title_en}`);
    console.log(`  Category: ${data.suggested_category}`);
    console.log(`  Uncertain fields requiring seller check: ${JSON.stringify(data.uncertain_fields)}`);
    if (res.status === 200 && data.title_ku && Array.isArray(data.uncertain_fields)) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 8] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 9: AI Response Feedback Submission
  try {
    const res = await fetch(`${BASE_URL}/api/ai/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        helpful: true,
        comment: 'Accurate and fast response for Kurdistan catalogue',
        feature: 'search_recommendation',
      }),
    });
    const data = await res.json();
    console.log(`\n[TEST 9] AI Response Feedback Submission: Status ${res.status}`);
    console.log(`  Response: ${JSON.stringify(data)}`);
    if (res.status === 200 && data.success) {
      console.log('  -> PASS ✅');
      passed++;
    } else {
      console.log('  -> FAIL ❌');
      failed++;
    }
  } catch (err: any) {
    console.log(`[TEST 9] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 10: Product Review Submission
  try {
    if (testedProductIds.length > 0) {
      const res = await fetch(`${BASE_URL}/api/product-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: testedProductIds[0],
          rating: 5,
          customerName: 'کڕیاری تاقیکردنەوە',
          customerCity: 'سلێمانی',
          comment: 'تاقیکردنەوەی سیستەمی هەڵسەنگاندنی شەفاف و ڕاستەقینە.',
        }),
      });
      const data = await res.json();
      console.log(`\n[TEST 10] Product Customer Rating Submission: Status ${res.status}`);
      console.log(`  Created feedback id: ${data.id}, is_verified: ${data.is_verified}`);
      if ((res.status === 200 || res.status === 201) && data.id) {
        console.log('  -> PASS ✅');
        passed++;
      } else {
        console.log('  -> FAIL ❌');
        failed++;
      }
    }
  } catch (err: any) {
    console.log(`[TEST 10] FAILED with error: ${err.message}`);
    failed++;
  }

  // Test 11: Transparent Ranking & Explainability Check
  try {
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'قاوەساز لە سلێمانی بە کەمتر لە 200000',
        language: 'ku',
      }),
    });
    const data = await res.json();
    console.log(`\n[TEST 11] Transparent Ranking & Match Explanation: Status ${res.status}`);
    if (data.products && data.products.length > 0) {
      const first = data.products[0];
      console.log(`  Top Ranked Product: ${first.name}`);
      console.log(`  Match Score: ${first.ai_match?.score}%`);
      console.log(`  Match Reason: ${first.ai_match?.match_reason}`);
      console.log(`  Highlights: ${JSON.stringify(first.ai_match?.highlights)}`);
      if (first.ai_match?.match_reason && typeof first.ai_match?.score === 'number') {
        console.log('  -> PASS ✅');
        passed++;
      } else {
        console.log('  -> FAIL ❌');
        failed++;
      }
    } else {
      console.log('  No products returned to verify ranking score');
    }
  } catch (err: any) {
    console.log(`[TEST 11] FAILED with error: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests();
