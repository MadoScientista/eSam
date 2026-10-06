import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import "./admin.css";

export function AdminLayout() {
    return (
        <div className="admin-shell">
            <div className="admin-layout">
                <AdminSidebar />
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}