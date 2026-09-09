import { useState } from "react";
import { useNavigate } from "react-router";
import { ChefHat, ShieldCheck, HelpCircle, Clock } from "lucide-react";
import { staffLogin } from "../lib/staffApi";

export default function POSLogin() {
    const [employeeId, setEmployeeId] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!employeeId || !pin) {
            setError("Enter your employee ID and PIN");
            return;
        }

        try {
            setLoading(true);
            await staffLogin({ employeeId, pin });
            navigate("/"); // or wherever the POS main screen lives
        } catch (err) {
            setError(err.response?.data?.message || "Invalid employee ID or PIN. Please try again.");
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
                            <p className="font-bold text-gray-900 leading-tight">Rempah POS</p>
                            <p className="text-xs text-gray-500 leading-tight">Cashier Terminal · Counter 02</p>
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
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="EMP-1043"
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
                                placeholder="••••"
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
                        backgroundImage:
                            "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05)), url('/images/kitchen-counter.jpg')",
                    }}
                />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <p className="text-2xl font-bold leading-snug mb-2">
                        Lunch rush ready. 7 open orders waiting at the counter.
                    </p>
                    <p className="text-sm text-white/70">Rempah Kitchen · Bangsar Outlet</p>
                </div>
            </div>
        </div>
    );
}
