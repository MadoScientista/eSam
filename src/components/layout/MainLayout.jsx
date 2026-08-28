import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

export function MainLayout(){
    return(
        <>
        <NavBar/>
        <main>
            <div className="container mt-4">
                <Outlet/>
            </div>
        </main>
        <Footer/>
        </>
    )
}