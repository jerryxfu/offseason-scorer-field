import React from "react";
import "./StatusBar.scss";

export default function StatusBar({status, alliance, matchStatus}: { status: string, alliance: string, matchStatus: string }) {
    let backgroundColor;

    if (matchStatus.toLowerCase().includes("awaiting")) {
        backgroundColor = "#f0ad4e";
    } else if (status.toLowerCase().startsWith("connected")) {
        backgroundColor = "#5cb85c";
    } else {
        backgroundColor = "#d9534f";
    }

    return (
        <nav
            className="statusbar"
            style={{backgroundColor: backgroundColor}}
        >
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
