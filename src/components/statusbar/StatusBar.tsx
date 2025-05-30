import React from "react";
import "./StatusBar.scss";

export default function StatusBar({status, alliance, matchStatus}: { status: string, alliance: string, matchStatus: string }) {
    return (
        <nav className="statusbar">
            <img src="/rfq_logo_vertical.png" alt="website icon" style={{height: "100%", marginRight: "1rem"}} />
            <h1>SCORER INTERFACE</h1>
            <ul className="statusbar_elements">
                <li className="statusbar_element">Client status: {status}</li>
                |
                <li className="statusbar_element">Alliance: {alliance}</li>
                |
                <li className="statusbar_elements">Match status: {matchStatus}</li>
            </ul>
        </nav>
    );
};
