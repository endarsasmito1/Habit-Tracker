import { useSession } from "../lib/auth-client";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
}
