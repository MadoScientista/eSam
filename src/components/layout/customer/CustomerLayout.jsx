import { Outlet } from "react-router-dom";
import { CustomerSidebar } from "./CustomerSidebar";
import "../sidebar.css";
import "./customer.css";

export function CustomerLayout() {
    return (
        <div className="customer-shell">
            <div className="customer-layout">
                <CustomerSidebar />
                <main className="customer-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
