import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

function MainLayout() {

    return (

        <div className="flex">

            <Sidebar />

            <div className="ml-72 min-h-screen w-full bg-gradient-to-br from-slate-100 via-white to-slate-200">
              
                <Header />

                <Outlet />

            </div>

        </div>

    );

}

export default MainLayout;