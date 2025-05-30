import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";
import StatusBar from "./components/statusbar/StatusBar.tsx";
import PlusMinusButton from "./components/plusminusbutton/PlusMinusButton.tsx";

export default function App() {
    const [connected, setConnected] = useState(false);
    const AUTO_LEAVE_OPTIONS = ["Unknown", "Yes", "No"];
    const ENDGAME_OPTIONS = ["Unknown", "DeepCage", "ShallowCage", "Parked", "None"];
    const BRANCHES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const PENALTIES = ["G206", "G410", "G418", "G419", "G428"];
    const FOULS = ["Minor", "Major", "Adjustment"] as const;
    const LEVELS = ["L4", "L3", "L2"];

    const [netCount, setNetCount] = useState(0);
    const [processorCount, setProcessorCount] = useState(0);
    const [throughCount, setThroughCount] = useState(0);

    type FoulType = typeof FOULS[number];
    type ScoringType = "Net" | "Processor" | "Through";

    const scoringHandlers: Record<ScoringType, { onPlus: () => void; onMinus: () => void; }> = {
        Net: {
            onPlus: () => {
                setNetCount((c) => c + 1);
            },
            onMinus: () => {
                setNetCount((c) => Math.max(0, c - 1));
            },
        },
        Processor: {
            onPlus: () => {
                setProcessorCount((c) => c + 1);
            },
            onMinus: () => {
                setProcessorCount((c) => Math.max(0, c - 1)
                );
            },
        },
        Through: {
            onPlus: () => {
                setThroughCount((c) => c + 1);
            },
            onMinus: () => {
                setThroughCount((c) => Math.max(0, c - 1));
            },
        }
    };

    const [minorFoulCount, setMinorFoulCount] = useState(0);
    const [majorFoulCount, setMajorFoulCount] = useState(0);
    const [adjustmentFoulCount, setAdjustmentFoulCount] = useState(0);

    const foulHandlers: Record<FoulType, { onPlus: () => void; onMinus: () => void; }> = {
        Minor: {
            onPlus: () => {
                setMinorFoulCount((c) => c + 1);
            },
            onMinus: () => {
                setMinorFoulCount((c) => Math.max(0, c - 1));
            },
        },
        Major: {
            onPlus: () => {
                setMajorFoulCount((c) => c + 1);
            },
            onMinus: () => {
                setMajorFoulCount((c) => Math.max(0, c - 1));
            },
        },
        Adjustment: {
            onPlus: () => {
                setAdjustmentFoulCount((c) => c + 1);
            },
            onMinus: () => {
                setAdjustmentFoulCount((c) => Math.max(0, c - 1));
            },
        },
    };

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected:", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected");
            setConnected(false);
        });

        socket.on("score:ack", (msg) => {
            console.log("Server ack:", msg);
        });

        return () => {
            socket.off(); // clean up listeners
        };
    }, []);

    const sendScore = () => {
        socket.emit("score:add", {alliance: "blue", points: 5});
    };

    return (<div>
        <StatusBar status={connected ? "Connected 🟢" : "Disconnected 🔴"} alliance={"RED"} matchStatus={"hold"} />

        <div className="core_container">
            {/* FIRST ROW */}
            <div className="container_row" style={{height: "10rem"}}>
                <div className="container_col">
                    <h2>🤖 AUTONOMOUS</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Robot #</th>
                            <th>Leave?</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[1, 2, 3].map((robot) => (<tr key={robot}>
                            <td>{robot}</td>
                            <td>
                                <select>
                                    {AUTO_LEAVE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h2>⌛ ENDGAME</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Robot #</th>
                            <th>Leave?</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[1, 2, 3].map((robot) => (<tr key={robot}>
                            <td>{robot}</td>
                            <td>
                                <select>
                                    {ENDGAME_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hr_horiz" />

            {/* SECOND ROW */}
            <div className="container_row">
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>Branch</th>
                            {BRANCHES.map((branch) => (
                                <th key={branch}>{branch}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {LEVELS.map((level) => (
                            <tr key={level}>
                                <td>{level}</td>
                                {BRANCHES.map((branch) => (
                                    <td key={`${level}-${branch}`}>
                                        <input className="scale" type="checkbox" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>Net</th>
                            <th>Processor</th>
                            <th>L1</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Net.onPlus()}
                                    onMinus={() => scoringHandlers.Net.onMinus()}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Processor.onPlus()}
                                    onMinus={() => scoringHandlers.Processor.onMinus()}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Through.onPlus()}
                                    onMinus={() => scoringHandlers.Through.onMinus()}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>{netCount}</p>
                            </th>
                            <th>
                                <p>{processorCount}</p>
                            </th>
                            <th>
                                <p>{throughCount}</p>
                            </th>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hr_horiz" />

            {/* THIRD ROW */}
            <div className="container_row" style={{height: "12.5rem"}}>
                <div className="container_col">
                    <h2>🏁 PENALTIES</h2>

                    <table>
                        <thead>
                        <tr>
                            <th>Penalty</th>
                            <th>Effect</th>
                        </tr>
                        </thead>
                        <tbody>
                        {PENALTIES.map((penalty) => (
                            <tr key={penalty}>
                                <td>{penalty}</td>
                                <td>
                                    <input className="scale" type="checkbox" />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h2>🚩 FOULS</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Foul</th>
                            <th>Points</th>
                        </tr>
                        </thead>
                        <tbody>{FOULS.map((foul) => (
                            <tr key={foul}>
                                <td>{foul}</td>
                                <td>
                                    <PlusMinusButton
                                        onPlus={foulHandlers[foul]!.onPlus}
                                        onMinus={foulHandlers[foul]!.onMinus}
                                    />
                                </td>
                                <td><p>
                                    {foul === "Minor"
                                        ? minorFoulCount
                                        : foul === "Major"
                                            ? majorFoulCount
                                            : adjustmentFoulCount}
                                </p></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
        <div className="copyright">
            <p>Developed by Jerry Fu 2025-{new Date().getFullYear()}</p>
        </div>
    </div>);
}
