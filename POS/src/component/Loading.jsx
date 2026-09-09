import { CookingPot } from "lucide-react";

export default function AppLoading() {
    return (
        <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
            <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <CookingPot size={26} className="text-orange-500 animate-pulse" />
                </div>
                <span className="loading loading-spinner loading-md text-orange-500" />
            </div>
        </div>
    );
}
