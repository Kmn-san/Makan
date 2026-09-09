import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChefHat, ArrowLeft, LogIn, LogOut, Coffee, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Swap for a real API call once the backend endpoint exists
async function recordStaffAction({ staffCode, action }) {
    // return await axiosInstance.post("/staff/clock-action", { staffCode, action });
    return { success: true };
}

// Swap for a real API call — should return today's recorded time for each action, e.g.
// { clock_in: "09:03 AM", clock_out: null, rest: null, finish_rest: null }
async function getTodaySessions({ staffCode }) {
    // const res = await axiosInstance.get(`/staff/sessions/today?staffCode=${staffCode}`);
    // return res.data;
    return { clock_in: null, clock_out: null, rest: null, finish_rest: null };
}

const ACTIONS = [
    {
        key: "clock_in",
        number: 1,
        label: "Clock In",
        icon: LogIn,
        color: "text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100",
        messages: [
            "You're in — let's make today a good one.",
            "Shift started. We are counting on you.",
            "Clocked in. Go get 'em.",
        ],
    },
    {
        key: "clock_out",
        number: 2,
        label: "Clock Out",
        icon: LogOut,
        color: "text-red-700 bg-red-50 border-red-300 hover:bg-red-100",
        messages: [
            "Good job! Have a nice day.",
            "Shift complete — well earned. See you next time.",
            "Nice work today. Go rest up.",
        ],
    },
    {
        key: "rest",
        number: 3,
        label: "Rest",
        icon: Coffee,
        color: "text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100",
        messages: ["Enjoy your break.", "Break started. Recharge a little.", "Take five — you've earned it."],
    },
    {
        key: "finish_rest",
        number: 4,
        label: "Finish Rest",
        icon: CheckCircle2,
        color: "text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100",
        messages: ["Welcome back! Let's go.", "Break's over — back at it.", "Good to have you back on the floor."],
    },
];

export default function ClockInOut() {
    const [staffCode, setStaffCode] = useState("");
    const [step, setStep] = useState("code"); // "code" | "action" | "confirm"
    const [selectedAction, setSelectedAction] = useState(null);
    const [todaySessions, setTodaySessions] = useState({
        clock_in: null,
        clock_out: null,
        rest: null,
        finish_rest: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const { device } = useAuth();

    const navigate = useNavigate();

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

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!staffCode) {
            setError("Enter your staff code");
            return;
        }
        try {
            setLoading(true);
            const sessions = await getTodaySessions({ staffCode });
            setTodaySessions(sessions);
            setStep("action");
        } catch (err) {
            setError(err.response?.data?.message || "Staff code not recognized. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAction = (action) => {
        setSelectedAction(action);
        setStep("confirm");
    };

    const handleConfirm = async () => {
        setError("");
        try {
            setLoading(true);
            await recordStaffAction({ staffCode, action: selectedAction.key });

            const msg = selectedAction.messages[Math.floor(Math.random() * selectedAction.messages.length)];
            setSuccessMessage(msg);

            setTimeout(() => {
                setSuccessMessage(null);
                setStaffCode("");
                setSelectedAction(null);
                setTodaySessions({ clock_in: null, clock_out: null, rest: null, finish_rest: null });
                setStep("code");
                navigate("/auth");
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
            setStep("action");
        } finally {
            setLoading(false);
        }
    };

    // Let staff press 1–4 on the keyboard/numpad instead of tapping, for speed
    useEffect(() => {
        if (step !== "action" || loading || successMessage) return;

        const onKeyDown = (e) => {
            const action = ACTIONS.find((a) => String(a.number) === e.key);
            if (action) handleSelectAction(action);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, loading, successMessage]);

    return (
        <div className="h-screen bg-[#FAF8F4] flex flex-col overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-8 py-4 shrink-0">
                <button
                    onClick={() =>
                        step === "confirm" ? setStep("action") : step === "action" ? setStep("code") : navigate("/auth")
                    }
                    className="flex items-center gap-2 text-base text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft size={18} /> {step === "code" ? "Back to login" : "Back"}
                </button>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 leading-tight">{currentTime}</p>
                        <p className="text-sm text-gray-500 leading-tight">{currentDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-bold text-gray-900 text-right leading-tight text-lg">
                                {device?.restaurant_name || "Restaurant"}
                            </p>
                            <p className="text-sm text-gray-500 text-right leading-tight">Shift Clock</p>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-orange-500 flex items-center justify-center">
                            <ChefHat size={22} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content — centered, sized to always fit within the viewport */}
            <div className="flex-1 flex items-center justify-center px-8 min-h-0">
                <div className="w-full max-w-2xl">
                    {error && (
                        <div className="mb-4 text-base text-red-700 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-center">
                            {error}
                        </div>
                    )}

                    {step === "code" ? (
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Code</h1>
                            <p className="text-base text-gray-500 mb-6">Enter your staff code to continue.</p>

                            <form onSubmit={handleCodeSubmit} className="max-w-sm mx-auto space-y-4">
                                <input
                                    type="text"
                                    value={staffCode}
                                    onChange={(e) => setStaffCode(e.target.value)}
                                    placeholder="EMP-1043"
                                    autoFocus
                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-center text-xl font-semibold tracking-wide focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-400"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold"
                                >
                                    Continue
                                </button>
                            </form>
                        </div>
                    ) : step === "action" ? (
                        <div>
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose an action</h1>
                                <p className="text-base text-gray-500">
                                    Staff code{" "}
                                    <span className="font-bold text-gray-800">{staffCode}</span> — tap an option
                                    or press its number.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={action.key}
                                            onClick={() => handleSelectAction(action)}
                                            className={`relative flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-4 font-bold transition ${action.color}`}
                                        >
                                            <span className="absolute top-3 left-4 text-lg font-black opacity-50">
                                                {action.number}
                                            </span>
                                            <Icon size={36} />
                                            <span className="text-xl">{action.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm</h1>
                            <p className="text-base text-gray-500 mb-6">
                                Today's summary for <span className="font-bold text-gray-800">{staffCode}</span>
                            </p>

                            <div className="max-w-sm mx-auto bg-white border-2 border-gray-200 rounded-2xl divide-y divide-gray-100 mb-8 text-left overflow-hidden">
                                {ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    const isSelected = action.key === selectedAction.key;
                                    const recordedTime = todaySessions[action.key];

                                    return (
                                        <div
                                            key={action.key}
                                            className={`flex items-center justify-between px-5 py-3.5 ${isSelected ? action.color : "bg-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} className={isSelected ? "" : "text-gray-400"} />
                                                <span className={`font-semibold ${isSelected ? "" : "text-gray-600"}`}>
                                                    {action.label}
                                                </span>
                                            </div>
                                            <span className={`text-sm font-bold ${isSelected ? "" : "text-gray-400"}`}>
                                                {isSelected ? currentTime : recordedTime || "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="max-w-sm mx-auto flex gap-3">
                                <button
                                    onClick={() => setStep("action")}
                                    disabled={loading}
                                    className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 text-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex-1 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading && <span className="loading loading-spinner loading-sm" />}
                                    Confirm {selectedAction.label}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success overlay */}
            {successMessage && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-8">
                    <div className="bg-white rounded-3xl px-10 py-10 max-w-md w-full text-center shadow-2xl">
                        <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-5">
                            <CheckCircle2 size={32} className="text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 leading-snug">{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}