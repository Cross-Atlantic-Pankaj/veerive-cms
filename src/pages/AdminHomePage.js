import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

const AdminHomePage = () => {
    const { state } = useContext(AuthContext);

    return (
        <div>
            {state.user ? (
                <h2>
                    Welcome Admin! {state.user.name || state.user.email}
                </h2>
            ) : (
                <h2>Loading...</h2>
            )}
        </div>
    );
};

export default AdminHomePage;
