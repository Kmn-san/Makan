import { useState } from "react";
import { useNavigate } from "react-router";
import { ChefHat, Clock, ArrowLeft } from "lucide-react";

// Swap for real API calls once the backend endpoints exist
async function clockIn({ employeeId, pin }) {
    // return await axiosInstance.post("/staff/clock-in", { employeeId, pin });
    return { success: true };
}
async function clockOut({ employeeId, pin }) {
    // return await axiosInstance.post("/staff/clock-out", { employeeId, pin });
    return { success: true };
}

const CLOCK_IN_MESSAGES = [
    "You're in — let's make today a good one.",
    "Shift started. Kitchen's counting on you.",
    "Clocked in. Go get 'em.",
];

const CLOCK_OUT_MESSAGES = [
    "Good job! Have a nice day.",
    "Shift complete — well earned. See you next time.",
    "Nice work today. Go rest up.",
];

export default function ClockInOut() {
    const [mode, setMode] = useState("in"); // "in" | "out"
    const [employeeId, setEmployeeId] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);

    const navigate = useNavigate();
    const isClockIn = mode === "in";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!employeeId || !pin) {
            setError("Enter your employee ID and PIN");
            return;
        }

        try {
            setLoading(true);

            if (isClockIn) {
                await clockIn({ employeeId, pin });
                setSuccessMessage(CLOCK_IN_MESSAGES[Math.floor(Math.random() * CLOCK_IN_MESSAGES.length)]);
            } else {
                await clockOut({ employeeId, pin });
                setSuccessMessage(CLOCK_OUT_MESSAGES[Math.floor(Math.random() * CLOCK_OUT_MESSAGES.length)]);
            }

            // Show the message briefly, then return to the POS login page
            setTimeout(() => {
                navigate("/auth"); // adjust to wherever your POS login route lives
            }, 2200);

        } catch (err) {
            setError(err.response?.data?.message || "Invalid employee ID or PIN. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm">
                <button
                    onClick={() => navigate("/auth")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
                >
                    <ArrowLeft size={15} /> Back to login
                </button>

                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <ChefHat size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 leading-tight">Rempah POS</p>
                        <p className="text-xs text-gray-500 leading-tight">Shift Clock</p>
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="inline-flex bg-gray-100 rounded-full p-1 mb-8">
                    <button
                        type="button"
                        onClick={() => setMode("in")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${isClockIn ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                            }`}
                    >
                        Clock In
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("out")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${!isClockIn ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                            }`}
                    >
                        Clock Out
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isClockIn ? "Start your shift" : "End your shift"}
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    {isClockIn
                        ? "Enter your employee ID and PIN to clock in."
                        : "Enter your employee ID and PIN to clock out."}
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
                        {loading ? <span className="loading loading-spinner loading-sm" /> : <Clock size={16} />}
                        {isClockIn ? "Clock In" : "Clock Out"}
                    </button>
                </form>
            </div>

            {/* Success overlay */}
            {successMessage && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
                    <div className="bg-white rounded-2xl px-8 py-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
                            <Clock size={26} className="text-orange-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
