import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../lib/api";
import KitchenHeader from "../component/KitchenHeader";
import OrderCard from "../component/OrderCard";
import { COLUMN_STYLES, COLUMNS } from "../lib/columnStyles";

export default function KitchenDisplay() {
    const [currentTime, setCurrentTime] = useState("");
    const [orders, setOrders] = useState({
        newOrders: [],
        preparing: [],
        ready: [],
    });
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);

    const { device, logout } = useAuth();
    const navigate = useNavigate();

    // Live clock
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(
                new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch orders every 5 seconds
    const fetchOrders = useCallback(async () => {
        try {
            const res = await getOrders("/kitchen/orders");
            const allOrders = res.data || [];

            setOrders({
                newOrders: allOrders.filter((o) => o.status === "paid"),
                preparing: allOrders.filter((o) => o.status === "preparing"),
                ready: allOrders.filter((o) => o.status === "ready"),
            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            if (err.response?.status === 401) {
                await logout();
                navigate("/auth");
            }
        }
    }, [logout, navigate]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await getOrders(`/kitchen/orders/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
            fetchOrders();
        } catch (err) {
            console.error("Failed to update status:", err);
            if (err.response?.status === 401) {
                await logout();
                navigate("/auth");
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    const dataByColumn = {
        new: orders.newOrders,
        preparing: orders.preparing,
        ready: orders.ready,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-orange-500"></div>
                    <p className="mt-4 text-lg font-bold text-white">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0B] text-white">
            <KitchenHeader
                deviceName={device?.device_name}
                currentTime={currentTime}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                onLogout={handleLogout}
                onOpenSettings={() => navigate("/settings")}
            />

            <div className="max-w-[1400px] mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {COLUMNS.map((col) => {
                        const style = COLUMN_STYLES[col.key];
                        const data = dataByColumn[col.key];

                        return (
                            <div key={col.key}>
                                <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                        <h2 className="font-bold tracking-wide text-sm text-white/90">
                                            {col.label}
                                        </h2>
                                    </div>
                                    <span
                                        className={`text-sm font-bold w-6 h-6 rounded-md flex items-center justify-center ${style.count}`}
                                    >
                                        {data.length}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {data.length === 0 ? (
                                        <p className="text-center text-white/30 text-sm py-8">{col.empty}</p>
                                    ) : (
                                        data.map((order) => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                actionLabel={col.actionLabel}
                                                actionStatus={col.actionStatus}
                                                columnKey={col.key}
                                                onUpdateStatus={updateStatus}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
