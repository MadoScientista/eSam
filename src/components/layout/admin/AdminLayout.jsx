import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
    return (
        <div className="container-fluid">
            <div className="row" style={{ minHeight: "90vh" }}>
                <AdminSidebar />
                <section className="col-md-9 col-lg-10 p-4">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}