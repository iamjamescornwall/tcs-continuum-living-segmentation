import aiService from '../src/services/aiService';

async function runAiTests() {
  console.log('--- RUNNING AI LAYER & PROVIDER UNIT TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test AI-1: Vendor column and value mapping
    console.log('\n[Task AI-1: Vendor File Mapping]');
    const ai1 = await aiService.mapVendorColumns('vendor_mkt_c_v1');
    assert(ai1.fromCache === true, 'AI-1 served from offline cache');
    assert(ai1.data.column_mappings.length > 0, `AI-1 extracted ${ai1.data.column_mappings.length} column mappings`);
    assert(ai1.data.confidence.match_rate > 0.8, `AI-1 match rate is high (${ai1.data.confidence.match_rate})`);

    // 2. Test AI-2: Cluster naming & description
    console.log('\n[Task AI-2: Cluster Naming & Description]');
    const ai2 = await aiService.nameClusters('VER-0001', []);
    assert(Array.isArray(ai2.data) && ai2.data.length > 0, `AI-2 returned ${ai2.data.length} cluster definitions`);
    assert(ai2.data[0].global_value !== undefined, `AI-2 maps to global standard values (e.g. ${ai2.data[0].global_value})`);

    // 3. Test AI-3: Explanation card
    console.log('\n[Task AI-3: Explanation Card]');
    const ai3 = await aiService.explainProposal('PRP-000001');
    assert(ai3.data.headline.includes('Proposed SEGMENT'), 'AI-3 generated objective headline for hero proposal PRP-000001');
    assert(ai3.data.drivers.length >= 3, `AI-3 extracted ${ai3.data.drivers.length} grounded drivers`);
    assert(ai3.data.confidence === 'High', 'AI-3 confidence is High');

    // 4. Test AI-4: Ask Continuum Q&A
    console.log('\n[Task AI-4: Ask Continuum]');
    const ai4 = await aiService.askContinuum('Which market has the oldest segments?');
    assert(ai4.data.answer.includes('Market C'), 'AI-4 answers oldest segment query correctly mentioning Market C');
    assert(ai4.data.link === '/health', 'AI-4 provides deep link to /health');

    // 5. Test AI-5: Rep-note signal extraction
    console.log('\n[Task AI-5: Rep-Note Signal Extraction]');
    const heroNoteText = 'Dr. Vogel has started 4 new moderate-to-severe psoriasis patients on Aurelix since August and asked for the patient support programme materials. Prefers to receive updates through the portal rather than in-person visits.';
    const ai5 = await aiService.extractRepNote(heroNoteText, 'NOTE-000001');
    assert(ai5.data.signals.length > 0, `AI-5 extracted ${ai5.data.signals.length} structured signals from rep note`);
    const adoptionSignal = ai5.data.signals.find(s => s.dimension_code === 'ADOPTION');
    assert(adoptionSignal?.proposed_value === 'Expansion', 'AI-5 correctly extracted ADOPTION -> Expansion from hero note');

    // 6. Test Fallback safety: malformed input triggers fallback without crashing
    console.log('\n[Fallback & Resilience Test]');
    const fallbackTest = await aiService.explainProposal('NON-EXISTENT-ID-XYZ');
    assert(fallbackTest.data !== null && fallbackTest.data.headline !== undefined, 'Unknown input gracefully returns valid cached explanation without throwing');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err: any) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runAiTests();
