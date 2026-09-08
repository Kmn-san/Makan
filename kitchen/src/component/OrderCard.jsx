import { Clock, Utensils, Package, AlertTriangle } from "lucide-react";
import { COLUMN_STYLES } from "../lib/columnStyles";

export default function OrderCard({ order, actionLabel, actionStatus, columnKey, onUpdateStatus }) {
    const orderNumber =
        order.order_type === "dine_in" ? `T-${order.table_code}` : order.pickup_number;

    const timeLabel = new Date(order.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const isDineIn = order.order_type === "dine_in";
    const style = COLUMN_STYLES[columnKey];

    return (
        <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
            <div className={`h-1 ${style.bar}`} />
            <div className="p-4">
                {/* Order type + time */}
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <p className="text-[11px] tracking-wide text-white/40 font-medium">
                            {isDineIn ? "TABLE" : "PICKUP NUMBER"}
                        </p>
                        <p className={`text-2xl font-bold ${isDineIn ? "text-amber-400" : "text-orange-500"}`}>
                            {orderNumber}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                isDineIn ? "bg-amber-400/15 text-amber-300" : "bg-orange-500/15 text-orange-400"
                            }`}
                        >
                            {isDineIn ? <Utensils size={11} /> : <Package size={11} />}
                            {isDineIn ? "DINE-IN" : "PICKUP"}
                        </span>
                        <span className="text-xs text-white/40 flex items-center gap-1">
                            <Clock size={12} /> {timeLabel}
                        </span>
                    </div>
                </div>

                {columnKey === "ready" && (
                    <p className="text-emerald-400 text-sm font-semibold mt-2 mb-1">
                        {actionStatus === "completed" ? "WAITING FOR PICKUP" : "READY TO SERVE"}
                    </p>
                )}

                {/* Items */}
                <div className="mt-3 space-y-3">
                    {order.items.map((item, idx) => (
                        <div key={idx}>
                            <p className="font-semibold text-white">
                                {item.quantity}× {item.item_name}
                            </p>
                            {item.options && item.options.length > 0 && (
                                <p className="text-sm text-white/40">
                                    {item.options.map((opt) => opt.option_value_name).join(" · ")}
                                </p>
                            )}
                            {item.note && (
                                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-md px-2 py-1">
                                    <AlertTriangle size={12} /> {item.note.toUpperCase()}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-[11px] tracking-wide text-white/30 font-medium mt-4">
                    CUSTOMER APP · PAID
                </p>

                {actionLabel && (
                    <button
                        onClick={() => onUpdateStatus(order.id, actionStatus)}
                        className={`w-full mt-3 py-3 rounded-lg font-bold text-sm tracking-wide ${
                            columnKey === "new"
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : columnKey === "preparing"
                                ? "bg-amber-400 hover:bg-amber-500 text-black"
                                : "bg-emerald-500 hover:bg-emerald-600 text-black"
                        }`}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
