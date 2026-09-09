import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChefHat, ShieldCheck, HelpCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function POSLogin() {
    const [staffCode, setStaffCode] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const navigate = useNavigate();
    const { device, staffLogin } = useAuth();

    // Live clock — updates every second
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
            );
            setCurrentDate(
                now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
            );
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!staffCode || !pin) {
            setError("Enter your employee ID and PIN");
            return;
        }

        try {
            setLoading(true);
            await staffLogin({ staffCode, pin }); // context handles restaurantId/device_uuid internally
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid employee ID or PIN. Please try again.");
            setPin("")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-[#FAF8F4]">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <ChefHat size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 leading-tight">
                                {device?.device_name || "POS Terminal"}
                            </p>
                            <p className="text-xs text-gray-500 leading-tight">
                                {device?.restaurant_name || "Cashier Terminal"}
                            </p>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Login</h1>
                    <p className="text-sm text-gray-500 mb-8">
                        Enter your employee ID and PIN to access the register.
                    </p>

                    {error && (
                        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Employee ID
                            </label>
                            <input
                                type="text"
                                value={staffCode}
                                onChange={(e) => setStaffCode(e.target.value)}
                                placeholder="Insert your ID"
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">PIN</label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Insert your pin"
                                disabled={loading}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <span className="loading loading-spinner loading-sm" />}
                            Login
                        </button>
                    </form>

                    {/* Separate action — goes to its own page */}
                    <button
                        type="button"
                        onClick={() => navigate("/clock-in-out")}
                        className="w-full mt-3 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-center gap-2"
                    >
                        <Clock size={16} />
                        Clock In / Out
                    </button>

                    <div className="mt-6 space-y-2">
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                            <ShieldCheck size={14} className="text-orange-500" />
                            Shift activity is recorded against your employee ID.
                        </p>
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                            <HelpCircle size={14} className="text-orange-500" />
                            Forgot your PIN? Ask the outlet manager to reset it.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: photo panel */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05)), url('${device?.restaurant_image || "/image/pos-image.jpg"
                            }')`,
                    }}
                />
                <div className="absolute top-10 right-10 text-right text-white">
                    <p className="text-5xl font-bold leading-none tracking-tight">{currentTime}</p>
                    <p className="text-lg text-white/80 mt-2">{currentDate}</p>
                </div>
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <p className="text-sm text-white/70">{device?.restaurant_name || "Cashier Terminal"}</p>
                </div>
            </div>
        </div>
    );
}