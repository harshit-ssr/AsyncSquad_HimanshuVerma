import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'seller') {
      return NextResponse.json({ error: 'Sellers cannot place orders' }, { status: 403 });
    }

    const orderData = await req.json();

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_id: session.user.id,
        seller_id: orderData.seller_id,
        total_amount: orderData.total,
        status: 'pending',
      }])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.qty,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    
    if (itemsError) {
      // Revert order if items fail?? Usually want a transaction but Supabase REST lacks it 
      // without an RPC. We'll simply return error here.
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Decrement stock for each item using RPC
    for (const item of orderData.items) {
      await supabase.rpc('decrement_stock', { p_id: item.product_id, qty: item.qty });
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Checkout API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
