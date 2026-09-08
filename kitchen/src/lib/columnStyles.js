export const COLUMN_STYLES = {
    new: {
        dot: "bg-orange-500",
        bar: "bg-orange-500",
        count: "bg-orange-500 text-white",
    },
    preparing: {
        dot: "bg-amber-400",
        bar: "bg-amber-400",
        count: "bg-amber-400 text-black",
    },
    ready: {
        dot: "bg-emerald-500",
        bar: "bg-emerald-500",
        count: "bg-emerald-500 text-black",
    },
};

export const COLUMNS = [
    {
        key: "new",
        label: "NEW ORDERS",
        actionLabel: "ACCEPT",
        actionStatus: "preparing",
        empty: "No new orders",
    },
    {
        key: "preparing",
        label: "PREPARING",
        actionLabel: "COMPLETE",
        actionStatus: "ready",
        empty: "Nothing cooking",
    },
    {
        key: "ready",
        label: "READY",
        actionLabel: "PICKED UP",
        actionStatus: "completed",
        empty: "No orders ready",
    },
];
