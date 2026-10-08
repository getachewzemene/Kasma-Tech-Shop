import crypto from 'crypto';
import { 
  initializeChapaTransaction, 
  verifyChapaTransaction, 
  verifyChapaWebhookSignature 
} from '../src/lib/chapa.ts';

async function runChapaTests() {
  console.log('--- TEST 1: Initialize Chapa Transaction ---');
  const initResult = await initializeChapaTransaction({
    amount: 3500,
    currency: 'ETB',
    email: 'test@kasma.et',
    firstName: 'Abebe',
    lastName: 'Bikila',
    phoneNumber: '0911223344',
    txRef: `KASMA-CHAPA-${Date.now()}`
  });
  console.log('Init result:', {
    success: initResult.success,
    mode: initResult.mode,
    checkoutUrl: initResult.checkoutUrl,
    txRef: initResult.txRef
  });
  if (!initResult.success || !initResult.checkoutUrl) {
    throw new Error('Test 1 failed: Initialization did not produce checkoutUrl');
  }

  console.log('\n--- TEST 2: HMAC Webhook Signature Verification ---');
  const secret = process.env.CHAPA_WEBHOOK_SECRET || 'kasma_chapa_webhook_secret_2026';
  const payload = JSON.stringify({
    event: 'charge.complete',
    tx_ref: initResult.txRef,
    status: 'success',
    amount: '3500',
    currency: 'ETB'
  });

  const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const invalidSignature = crypto.createHmac('sha256', 'wrong-secret-key').update(payload).digest('hex');

  const validCheck = verifyChapaWebhookSignature(payload, validSignature);
  const invalidCheck = verifyChapaWebhookSignature(payload, invalidSignature);
  const missingCheck = verifyChapaWebhookSignature(payload, undefined);

  console.log('Valid signature result:', validCheck);
  console.log('Invalid signature result:', invalidCheck);
  console.log('Missing signature result:', missingCheck);

  if (!validCheck || invalidCheck || missingCheck) {
    throw new Error('Test 2 failed: HMAC signature verification failed');
  }

  console.log('\n--- TEST 3: Verify Transaction Status Query ---');
  const verifyResult = await verifyChapaTransaction(initResult.txRef);
  console.log('Verify result:', {
    success: verifyResult.success,
    status: verifyResult.status,
    txRef: verifyResult.txRef
  });
  if (!verifyResult.success || verifyResult.status !== 'success') {
    throw new Error('Test 3 failed: Transaction verification query failed');
  }

  const badVerify = await verifyChapaTransaction('');
  if (badVerify.success) {
    throw new Error('Test 3 failed: Empty txRef was unexpectedly accepted');
  }

  console.log('\n>>> ALL CHAPA & HMAC WEBHOOK TESTS PASSED! <<<');
}

runChapaTests().catch(err => {
  console.error('Chapa test failed:', err);
  process.exit(1);
});
