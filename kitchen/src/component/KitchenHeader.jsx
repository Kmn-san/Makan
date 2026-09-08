import { ChefHat, Calendar, Wifi, Volume2, VolumeX, Clock, Settings, LogOut } from "lucide-react";

export default function KitchenHeader({
    deviceName,
    restaurantName,
    currentTime,
    soundEnabled,
    onToggleSound,
    onLogout,
    onOpenSettings,
}) {
    return (
        <div className="bg-[#111111] border-b border-white/5 sticky top-0 z-10">
            <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                        <ChefHat size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">KITCHEN DISPLAY FOR {restaurantName}</h1>
                        <p className="text-xs text-white/40 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date()
                                .toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })
                                .toUpperCase()}
                            {deviceName && <span className="ml-2 text-white/30">· {deviceName}</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1.5">
                        <Wifi size={13} />
                        ONLINE
                    </span>

                    <button
                        onClick={onToggleSound}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border flex items-center gap-1.5 ${soundEnabled
                            ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                            : "text-white/40 bg-white/5 border-white/10"
                            }`}
                    >
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        {soundEnabled ? "ORDER SOUND ON" : "MUTED"}
                    </button>

                    <div className="hidden sm:flex items-center gap-2 px-3">
                        <Clock size={14} className="text-white/40" />
                        <div>
                            <p className="text-[10px] text-white/40 leading-none mb-1">TIME</p>
                            <p className="text-sm font-bold text-white leading-none">{currentTime}</p>
                        </div>
                    </div>

                    <button
                        onClick={onOpenSettings}
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>

                    <button
                        onClick={onLogout}
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-white/60"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
