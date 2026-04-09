import { supabase } from '../supabase';
import { Order, OrderItem } from '@/types';

export const createOrder = async (orderData: Partial<Order>, items: Partial<OrderItem>[]) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItemsFormatted = items.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsFormatted);

  if (itemsError) throw itemsError;

  for (const item of items) {
    await supabase.rpc('decrement_stock', { p_id: item.product_id, qty: item.quantity });
  }

  return order;
};

export const getBuyerOrders = async (buyerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*))')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Order[];
};

export const getSellerOrders = async (sellerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*))')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Order[];
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
};
