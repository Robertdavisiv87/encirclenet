import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🗑️ Clearing fake payouts for ${user.email}`);

    // Fetch all fake payout transactions created by service role
    const fakePayouts = await base44.asServiceRole.entities.Transaction.filter({
      to_email: user.email,
      type: 'payout',
      created_by: 'service+521fac30-210a-44fe-b4c9-b99b6589fa22@no-reply.base44.com'
    });

    console.log(`Found ${fakePayouts.length} fake payout transactions`);

    // Delete each one using service role
    for (const payout of fakePayouts) {
      await base44.asServiceRole.entities.Transaction.delete(payout.id);
      console.log(`Deleted fake payout: $${payout.amount}`);
    }

    const totalCleared = fakePayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

    return Response.json({
      success: true,
      message: 'Fake payouts cleared',
      payouts_deleted: fakePayouts.length,
      amount_cleared: totalCleared
    });

  } catch (error) {
    console.error('Clear payouts error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to clear fake payouts'
    }, { status: 500 });
  }
});