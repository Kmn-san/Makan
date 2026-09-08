import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function WaitingApproval() {
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { checkStatus, clearInvalidDevice } = useAuth();

    const handleRefresh = async () => {
        setError("");
        try {
            setChecking(true);
            const data = await checkStatus();

            if (data.status === "pending") {
                // still pending — nothing to do, stay on this page
                setError("Still waiting for approval. Please check back shortly.");
                return;
            }

            // approved! authStatus is now "authenticated" — navigate to the app
            navigate("/");

        } catch (err) {
            const backendMessage = err.response?.data?.message;

            if (backendMessage?.toLowerCase().includes("revoked")) {
                clearInvalidDevice();
                navigate("/auth");
                return;
            }

            setError(backendMessage || "Could not check status. Please try again.");
        } finally {
            setChecking(false);
        }
    };

    const handleLoginAgain = () => {
        clearInvalidDevice();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 text-center">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <svg
                        className="w-8 h-8 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                {/* Heading */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Device Registered
                    </h2>
                    <p className="text-gray-500 mt-2">
                        You have successfully registered this device.
                    </p>
                </div>

                {/* Status card */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                    <div className="flex items-start gap-3">
                        <div className="badge badge-warning badge-sm mt-1 shrink-0">
                            Pending
                        </div>
                        <p className="text-sm text-amber-800">
                            Please inform your restaurant owner or manager to approve
                            this device before you can continue.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-500">
                    Once approved, tap refresh to continue — or log in again if
                    you'd like to register a different device.
                </p>

                {error && (
                    <div className="alert alert-warning text-sm py-2">
                        <span>{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={handleRefresh}
                        disabled={checking}
                        className="btn btn-primary w-full"
                    >
                        {checking ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Checking...
                            </>
                        ) : (
                            "Refresh"
                        )}
                    </button>

                    <button
                        onClick={handleLoginAgain}
                        className="btn btn-ghost btn-sm w-full text-gray-500"
                    >
                        Login again
                    </button>
                </div>
            </div>
        </div>
    );
}
