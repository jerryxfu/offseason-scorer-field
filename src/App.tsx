import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";

export default function App() {
    const [connected, setConnected] = useState(false);
    const [troughCorals, setTroughCorals] = useState(0);
    const [processorAlgae, setProcessorAlgae] = useState(0);
    const [netAlgae, setNetAlgae] = useState(0);

    useEffect(() => {
        const moreTroughCorals = document.getElementById("moreTroughCorals");
        const lessTroughCorals = document.getElementById("lessTroughCorals");

        const incrementTroughCorals = () => setTroughCorals((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementTroughCorals = () => setTroughCorals((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (moreTroughCorals && lessTroughCorals) {
            moreTroughCorals.addEventListener("click", incrementTroughCorals);
            lessTroughCorals.addEventListener("click", decrementTroughCorals);
        }

        return () => {
            if (moreTroughCorals && lessTroughCorals) {
                moreTroughCorals.removeEventListener("click", incrementTroughCorals);
                lessTroughCorals.removeEventListener("click", decrementTroughCorals);
            }
        };
    }, []);

        useEffect(() => {
        const moreTroughCorals = document.getElementById("moreProcessorAlgae");
        const lessTroughCorals = document.getElementById("lessProcessorAlgae");

        const incrementProcessorAlgae = () => setProcessorAlgae((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementProcessorAlgae = () => setProcessorAlgae((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (moreTroughCorals && lessTroughCorals) {
            moreTroughCorals.addEventListener("click", incrementProcessorAlgae);
            lessTroughCorals.addEventListener("click", decrementProcessorAlgae);
        }

        return () => {
            if (moreTroughCorals && lessTroughCorals) {
                moreTroughCorals.removeEventListener("click", incrementProcessorAlgae);
                lessTroughCorals.removeEventListener("click", decrementProcessorAlgae);
            }
        };
    }, []);

    useEffect(() => {
        const moreTroughCorals = document.getElementById("moreNetAlgae");
        const lessTroughCorals = document.getElementById("lessNetAlgae");

        const incrementNetAlgae = () => setNetAlgae((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementNetAlgae = () => setNetAlgae((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (moreTroughCorals && lessTroughCorals) {
            moreTroughCorals.addEventListener("click", incrementNetAlgae);
            lessTroughCorals.addEventListener("click", decrementNetAlgae);
        }

        return () => {
            if (moreTroughCorals && lessTroughCorals) {
                moreTroughCorals.removeEventListener("click", incrementNetAlgae);
                lessTroughCorals.removeEventListener("click", decrementNetAlgae);
            }
        };
    }, []);

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

    return (
        <div>
            <h1>Scorer</h1>
            <p>Status: {connected ? "Connected" : "Disconnected"}</p>
            <button onClick={sendScore}>+5 Blue</button>
            <div className="scoreboard">
                <div className="topPart">
                    <div className="auto">
                        <div>
                            <p><b>Auto</b></p>
                            <ul>
                                <li>1</li>
                                <li>2</li>
                                <li>3</li>
                            </ul>
                        </div>

                        <div style={{marginLeft: "30px"}}>
                            <p style={{marginTop: "6px", marginBottom: "7px"}}>Leave</p>
                            <select id="leave_1">
                                <option value="Unknown">Unknown</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                            <br/>
                            <select id="leave_2">
                                <option value="Unknown">Unknown</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                            <br/>
                            <select id="leave_3">
                                <option value="Unknown">Unknown</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                    </div>
                    <hr className="autoToEndgame"/>
                    <div className="endgame">
                        <div>
                            <p><b>Endgame</b></p>
                            <ul>
                                <li>1</li>
                                <li>2</li>
                                <li>3</li>
                            </ul>
                        </div>

                        <div>
                            <p style={{marginTop: "6px", marginBottom: "7px"}}>Barge Position</p>
                            <select id="barge_1">
                                <option value="Unknown">Unknown</option>
                                <option value="None">None</option>
                                <option value="Parked">Parked</option>
                                <option value="ShallowCage">ShallowCage</option>
                                <option value="DeepCage">DeepCage</option>
                            </select>
                            <br/>
                            <select id="barge_2">
                                <option value="Unknown">Unknown</option>
                                <option value="None">None</option>
                                <option value="Parked">Parked</option>
                                <option value="ShallowCage">ShallowCage</option>
                                <option value="DeepCage">DeepCage</option>
                            </select>
                            <br/>
                            <select id="barge_3">
                                <option value="Unknown">Unknown</option>
                                <option value="None">None</option>
                                <option value="Parked">Parked</option>
                                <option value="ShallowCage">ShallowCage</option>
                                <option value="DeepCage">DeepCage</option>
                            </select>
                        </div>
                    </div>
                </div>
                <hr className="topToMiddle"/>
                <div className="middlePart">
                    <div style={{height: "7rem"}}>
                        <ul style={{marginTop: "0.05rem"}}>
                            <li style={{marginBottom: "0.475rem"}}>High Branch</li>
                            <li style={{marginBottom: "0.475rem"}}>Middle Branch</li>
                            <li style={{marginBottom: "0.6rem"}}>Low Branch</li>
                            <li>Trough</li>
                        </ul>
                    </div>
                    <div>
                        &nbsp;&nbsp;A &nbsp;&nbsp;&nbsp;B &nbsp;&nbsp;&nbsp;C &nbsp;&nbsp;&nbsp;D &nbsp;&nbsp;&nbsp;E &nbsp;&nbsp;&nbsp;F &nbsp;&nbsp;&nbsp;G &nbsp;&nbsp;&nbsp;H &nbsp;&nbsp;&nbsp;I &nbsp;&nbsp;&nbsp;&nbsp;J &nbsp;&nbsp;&nbsp;&nbsp;K &nbsp;&nbsp;&nbsp;L
                        <br/>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <br/>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <br/>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <input type="checkbox"></input>
                        <br/>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <p className="troughText">{troughCorals}</p>
                            <div style={{display: "flex", flexDirection: "column", height: "2rem"}}>
                                <button id="moreTroughCorals" style={{marginBottom: "0.05rem"}}></button>
                                <button id="lessTroughCorals"></button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <p className="descriptionText">Processor&nbsp;&nbsp;</p><p className="troughText">{processorAlgae}</p>
                            <div style={{display: "flex", flexDirection: "column", height: "2rem"}}>
                                <button id="moreProcessorAlgae" style={{marginBottom: "0.05rem"}}></button>
                                <button id="lessProcessorAlgae"></button>
                            </div>
                        </div>
                        <br></br>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <p className="descriptionText">Net&nbsp;&nbsp;</p><p className="troughText">{netAlgae}</p>
                            <div style={{display: "flex", flexDirection: "column", height: "2rem"}}>
                                <button id="moreNetAlgae" style={{marginBottom: "0.05rem"}}></button>
                                <button id="lessNetAlgae"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
