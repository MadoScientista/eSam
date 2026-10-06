import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

export function MainLayout(){
    const { pathname } = useLocation()
    const esAdministracion = pathname.startsWith("/admin")

    if (esAdministracion) {
        return <Outlet />
    }

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