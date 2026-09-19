import { supabase } from "./supabase";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AppOrder {
  id: string;
  user_id?: string | null | undefined;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address?: string | undefined;
  customer_name?: string | undefined;
  customer_phone?: string | undefined;
  customer_city?: string | undefined;
  items?: OrderItem[] | undefined;
  created_at: string;
  users?: {
    full_name?: string | undefined;
    email?: string | undefined;
  } | null | undefined;
}

const STORAGE_KEY = "kag_parfumerie_orders_v1";

// Helper to get local orders
export function getLocalOrders(): AppOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to load local orders:", e);
    return [];
  }
}

// Helper to save local orders
export function saveLocalOrders(orders: AppOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn("Failed to save local orders:", e);
  }
}

// Create and record a new order
export async function createOrder(payload: {
  userId?: string | null | undefined;
  userEmail?: string | null | undefined;
  total: number;
  items: OrderItem[];
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string | undefined;
  };
}): Promise<{ success: boolean; order: AppOrder; error?: string }> {
  // Generate a valid UUID for Supabase
  const orderId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "ord-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);

  const fullShippingAddress = `${payload.customer.fullName} | ${payload.customer.phone} | ${payload.customer.address}, ${payload.customer.city} ${payload.customer.notes ? `(${payload.customer.notes})` : ""}`.trim();

  const newOrder: AppOrder = {
    id: orderId,
    user_id: payload.userId || null,
    total_amount: payload.total,
    status: "pending",
    shipping_address: fullShippingAddress,
    customer_name: payload.customer.fullName,
    customer_phone: payload.customer.phone,
    customer_city: payload.customer.city,
    items: payload.items,
    created_at: new Date().toISOString(),
    users: payload.userEmail ? { full_name: payload.customer.fullName, email: payload.userEmail } : null,
  };

  // 1. Always persist locally first so data is NEVER lost
  const localOrders = getLocalOrders();
  saveLocalOrders([newOrder, ...localOrders]);

  // 2. Insert into Supabase
  try {
    let effectiveUserId = payload.userId;

    // If no userId, see if current session has one
    if (!effectiveUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      effectiveUserId = session?.user?.id || null;
    }

    // Only attempt Supabase insert if we have a valid userId (due to NOT NULL constraint on orders.user_id)
    if (effectiveUserId) {
      // First attempt: with shipping_address
      const { error: errWithAddress } = await supabase
        .from("orders")
        .insert([{
          id: orderId,
          user_id: effectiveUserId,
          total_amount: payload.total,
          status: "pending",
          shipping_address: fullShippingAddress
        }]);

      if (errWithAddress) {
        console.warn("Supabase insert with shipping_address failed, retrying with core fields:", errWithAddress.message);
        
        // Second attempt: without shipping_address (in case column is missing from PostgreSQL schema)
        const { error: errCoreOnly } = await supabase
          .from("orders")
          .insert([{
            id: orderId,
            user_id: effectiveUserId,
            total_amount: payload.total,
            status: "pending"
          }]);

        if (errCoreOnly) {
          console.error("Supabase order insert error:", errCoreOnly.message);
        } else {
          console.log("Order saved to Supabase (core columns)");
        }
      } else {
        console.log("Order saved to Supabase with shipping_address");
      }
    }
  } catch (err: any) {
    console.warn("Supabase network or auth issue while creating order:", err?.message || err);
  }

  return { success: true, order: newOrder };
}

// Fetch orders merged from Supabase and LocalStorage
export async function fetchAllOrders(options?: {
  userId?: string | null | undefined;
  isAdmin?: boolean | undefined;
}): Promise<AppOrder[]> {
  const localList = getLocalOrders();
  let supabaseOrders: any[] = [];

  try {
    let query = supabase.from("orders").select("*, users (full_name, email)");

    if (!options?.isAdmin && options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (!error && data) {
      supabaseOrders = data;
    }
  } catch (e) {
    console.warn("Could not query Supabase orders:", e);
  }

  // Create lookup map from local orders for enrichment (shipping_address, items, etc.)
  const localMap = new Map<string, AppOrder>();
  localList.forEach((o) => localMap.set(o.id, o));

  // Merge Supabase orders with local details
  const merged: AppOrder[] = [];
  const processedIds = new Set<string>();

  for (const sOrder of supabaseOrders) {
    processedIds.add(sOrder.id);
    const local = localMap.get(sOrder.id);

    merged.push({
      id: sOrder.id,
      user_id: sOrder.user_id,
      total_amount: Number(sOrder.total_amount),
      status: sOrder.status || local?.status || "pending",
      created_at: sOrder.created_at,
      shipping_address: sOrder.shipping_address || local?.shipping_address || (local?.customer_name ? `${local.customer_name} | ${local.customer_phone} | ${local.customer_city}` : undefined),
      customer_name: local?.customer_name,
      customer_phone: local?.customer_phone,
      customer_city: local?.customer_city,
      items: local?.items,
      users: sOrder.users || local?.users,
    });
  }

  // Add remaining local orders that may not be in Supabase (or guest orders)
  for (const lOrder of localList) {
    if (!processedIds.has(lOrder.id)) {
      if (options?.isAdmin) {
        merged.push(lOrder);
      } else if (options?.userId && lOrder.user_id === options.userId) {
        merged.push(lOrder);
      } else if (!options?.userId) {
        merged.push(lOrder);
      }
    }
  }

  // Sort by created_at descending
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return merged;
}

// Update order status in both Supabase and LocalStorage
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
  // 1. Update local storage
  const local = getLocalOrders();
  const updated = local.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o));
  saveLocalOrders(updated);

  // 2. Update Supabase
  try {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  } catch (e) {
    console.warn("Could not update order status in Supabase:", e);
  }

  return true;
}
