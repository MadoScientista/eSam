import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
    return (
        <div className="container-fluid">
            <div className="row" style={{ minHeight: "90vh" }}>
                <AdminSidebar />
                <main className="col-md-9 col-lg-10 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}