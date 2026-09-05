import { Outlet } from "react-router-dom";
import { CustomerSidebar } from "./CustomerSidebar";

export function CustomerLayout() {
    return (
        <div className="container-fluid">
            <div className="row" style={{ minHeight: "90vh" }}>
                <CustomerSidebar />
                <section className="col-md-9 col-lg-10 p-4">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}