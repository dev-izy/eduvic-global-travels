import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface OrderRow {
  id: string;
  reference: string;
  package_title: string;
  amount: number;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  Pending: "bg-accent-100 text-accent-700",
  Paid: "bg-primary-100 text-primary-700",
  Confirmed: "bg-secondary-100 text-secondary-700",
  Cancelled: "bg-background-200 text-foreground-500",
  Refunded: "bg-background-100 text-foreground-600",
};

function formatCurrency(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function ClientOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: supaError } = await supabase
        .from("orders")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (supaError) throw supaError;
      setOrders((data || []) as OrderRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const totals = useMemo(() => {
    const paid = orders
      .filter((o) => o.status === "Paid" || o.status === "Confirmed")
      .reduce((sum, o) => sum + Number(o.amount), 0);
    const pending = orders
      .filter((o) => o.status === "Pending")
      .reduce((sum, o) => sum + Number(o.amount), 0);
    return { paid, pending };
  }, [orders]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-500" />
          <p className="text-sm text-foreground-500 mt-3">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl" />
          </div>
          <p className="text-sm text-foreground-700 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-primary-500 text-background-50 rounded-lg hover:bg-primary-600 text-sm font-medium transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground-950">Orders &amp; Expenses</h1>
        <p className="text-sm text-foreground-500 mt-1">Track your bookings, payments, and expenses.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-background-50 border border-background-200/70 rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <i className="ri-check-double-line text-xl" />
            </div>
            <div>
              <p className="text-sm text-foreground-500">Total Paid</p>
              <p className="text-2xl font-heading font-bold text-foreground-950">{formatCurrency(totals.paid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-50 border border-background-200/70 rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center">
              <i className="ri-time-line text-xl" />
            </div>
            <div>
              <p className="text-sm text-foreground-500">Pending</p>
              <p className="text-2xl font-heading font-bold text-foreground-950">{formatCurrency(totals.pending)}</p>
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="px-4 py-16 text-center bg-background-50 border border-background-200/70 rounded-lg">
          <div className="w-16 h-16 rounded-2xl bg-background-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-receipt-line text-foreground-400 text-3xl" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground-950 mb-1">No orders yet</h3>
          <p className="text-sm text-foreground-500">Your bookings and payments will appear here.</p>
        </div>
      ) : (
        <div className="bg-background-50 border border-background-200/70 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-background-200/70 bg-background-100/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-200/50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-100/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-foreground-900">{order.reference}</td>
                    <td className="px-4 py-3.5 text-sm text-foreground-600">{order.package_title}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-foreground-900">{formatCurrency(Number(order.amount))}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] || "bg-background-100 text-foreground-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-foreground-500 hidden sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}