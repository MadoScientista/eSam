import { NavBar } from "./NavBar";

export function PageLayout(){
    return(
        <>
        <NavBar/>
        <main>
            <div className="main-content">
                <Outlet/>
            </div>
        </main>
        <Footer/>
        </>
    )
}