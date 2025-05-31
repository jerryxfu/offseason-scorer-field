import React from "react";
import "./AllianceToggle.scss";

interface AllianceToggleProps {
    alliance: "red" | "blue";
    checked: boolean;
    onChange: (checked: boolean, alliance: "red" | "blue") => void;
    label?: string;
}

export default function AllianceToggle({alliance, checked, onChange, label}: AllianceToggleProps) {
    const color = alliance === "red" ? "#e74c3c" : "#3498db";
    return (
        <label className="alliancetoggle" style={{display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem"}}>
            {label && <span>{label}</span>}
            <span style={{position: "relative", display: "inline-block", width: 32, height: 18}}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange(e.target.checked, alliance)}
                    style={{opacity: 0, width: 0, height: 0}}
                />
                <span
                    style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: checked ? color : "#3498db",
                        borderRadius: 22,
                        transition: "background 0.2s",
                    }}
                />
                <span
                    style={{
                        position: "absolute",
                        left: checked ? 16 : 2,
                        top: 2,
                        width: 14,
                        height: 14,
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                />
            </span>
            <span style={{color}}>{alliance.toUpperCase()}</span>
        </label>
    );
}