import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

export function MainLayout(){
    return(
        <>
        <NavBar/>
        <main style={{minHeight:"90vh"}}>
            <Outlet/>
        </main>
        <Footer/>
        </>
    )
}