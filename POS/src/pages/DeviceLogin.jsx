import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ChefHat, MapPin, AlertCircle } from "lucide-react";

export default function DeviceLogin() {
    const [restaurantCode, setRestaurantCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { authenticate, clearInvalidDevice } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!restaurantCode) {
            setError("Please enter a restaurant ID");
            return;
        }

        try {
            setLoading(true);
            const data = await authenticate(restaurantCode);

            if (data.status === "pending") {
                navigate("/waiting-approval");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.log(err);

            const backendMessage = err.response?.data?.message;
            if (backendMessage?.toLowerCase().includes("revoked")) {
                clearInvalidDevice();
                setError("This device was revoked. Please register again.");
            } else {
                setError(backendMessage || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <ChefHat size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 leading-tight">Device Setup</p>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Register this device</h1>
                <p className="text-sm text-gray-500 mb-8">
                    Enter your restaurant code to connect this terminal.
                </p>

                {error && (
                    <div role="alert" className="alert alert-error alert-soft mb-5">
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="restaurantCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Restaurant Code
                        </label>
                        <label className="input input-bordered flex items-center gap-2 w-full">
                            <MapPin size={16} className="text-gray-400" />
                            <input
                                id="restaurantCode"
                                type="text"
                                value={restaurantCode}
                                onChange={(e) => setRestaurantCode(e.target.value)}
                                placeholder="Enter Restaurant Code"
                                disabled={loading}
                                className="grow"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading && <span className="loading loading-spinner loading-sm" />}
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
