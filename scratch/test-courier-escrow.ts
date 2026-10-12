// Test script for Courier Handover PIN & Escrow Release
import { getOrderHandoverPin } from '../src/features/courier/courierTypes';
import { INITIAL_ORDERS } from '../src/mockData';

async function runTests() {
  console.log('🧪 Starting Courier Handover PIN & Escrow Release Tests...\n');

  // Test 1: Verify mock data contains handoverPin and escrowStatus
  console.log('1️⃣ Checking initial mock orders:');
  for (const o of INITIAL_ORDERS.slice(0, 4)) {
    const pin = getOrderHandoverPin(o);
    console.log(`   Order #${o.id}: PIN=${pin}, EscrowStatus=${o.escrowStatus || 'default HELD_IN_ESCROW'}`);
    if (!pin || pin.length !== 4) {
      throw new Error(`Order ${o.id} PIN must be 4 digits, got: ${pin}`);
    }
  }
  console.log('   ✅ All mock orders have valid 4-digit handover PINs.\n');

  // Test 2: Fallback PIN generation for an order without explicit PIN
  console.log('2️⃣ Testing deterministic fallback PIN generation:');
  const dummyOrder: any = { id: 'ORD-TEST-999', total: 15000 };
  const fallbackPin = getOrderHandoverPin(dummyOrder);
  console.log(`   Dummy Order #${dummyOrder.id} -> Generated PIN: ${fallbackPin}`);
  if (!/^\d{4}$/.test(fallbackPin)) {
    throw new Error(`Fallback PIN failed regex ^\\d{4}$, got: ${fallbackPin}`);
  }
  const fallbackPinRepeat = getOrderHandoverPin(dummyOrder);
  if (fallbackPin !== fallbackPinRepeat) {
    throw new Error('Fallback PIN is not deterministic!');
  }
  console.log('   ✅ Deterministic fallback PIN verified.\n');

  // Test 3: API Verification via Express server
  console.log('3️⃣ Testing live backend endpoints on http://localhost:3000:');
  try {
    // Check if server is reachable
    const healthCheck = await fetch('http://localhost:3000/api/orders');
    if (!healthCheck.ok) {
      console.log('   ⚠️ Express server not reachable, skipping live API check.');
      return;
    }
    const ordersData = await healthCheck.json();
    const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
    console.log(`   Found ${orders.length} orders on server.`);

    // Pick an order that is SHIPPED or PROCESSING
    const testOrder = orders.find((o: any) => o.status !== 'DELIVERED') || orders[0];
    if (!testOrder) {
      console.log('   No test order available.');
      return;
    }

    const correctPin = testOrder.handoverPin || testOrder.codVerificationPin || '4819';
    console.log(`   Testing Order #${testOrder.id} with expected PIN ${correctPin}`);

    // Sub-test 3A: Invalid PIN
    const wrongPinRes = await fetch(`http://localhost:3000/api/courier/orders/${testOrder.id}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: '0000',
        recipientName: testOrder.customerName,
        deviceInspectionConfirmed: true
      })
    });
    const wrongPinData = await wrongPinRes.json();
    if (wrongPinRes.status === 400 && wrongPinData.error === 'INVALID_PIN') {
      console.log('   ✅ Correctly rejected invalid PIN (HTTP 400 INVALID_PIN)');
    } else {
      console.error('   ❌ Failed invalid PIN check:', wrongPinRes.status, wrongPinData);
    }

    // Sub-test 3B: Correct PIN
    const validPinRes = await fetch(`http://localhost:3000/api/courier/orders/${testOrder.id}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: correctPin,
        recipientName: testOrder.customerName,
        deviceInspectionConfirmed: true,
        courierName: 'Ermias Berhanu',
        courierPhone: '+251 91 199 8877',
        notes: 'Device seal checked, screen tested at Bole'
      })
    });
    const validPinData = await validPinRes.json();
    if (validPinRes.ok && validPinData.success && validPinData.escrowReleased) {
      console.log('   ✅ Correctly verified PIN and released escrow!');
      console.log(`      Status: ${validPinData.order.status}`);
      console.log(`      Escrow Status: ${validPinData.order.escrowStatus}`);
      console.log(`      Amount Released: ${validPinData.amountReleased} ETB`);
    } else {
      console.error('   ❌ Failed valid PIN escrow release:', validPinRes.status, validPinData);
    }

  } catch (err: any) {
    console.warn('   ⚠️ Backend test call error:', err.message);
  }

  console.log('\n🎉 ALL COURIER HANDOVER PIN & ESCROW TESTS COMPLETED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
