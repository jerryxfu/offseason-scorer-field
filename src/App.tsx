import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";

export default function App() {
    const [connected, setConnected] = useState(false);

    const [troughCorals, setTroughCorals] = useState(0);
    const [processorAlgae, setProcessorAlgae] = useState(0);
    const [netAlgae, setNetAlgae] = useState(0);
    const [minorFouls, setMinorFouls] = useState(0);
    const [majorFouls, setMajorFouls] = useState(0);
    const [adjust, setAdjust] = useState(0);

    useEffect(() => {
        const more = document.getElementById("moreTroughCorals");
        const less = document.getElementById("lessTroughCorals");

        const incrementTroughCorals = () => setTroughCorals((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementTroughCorals = () => setTroughCorals((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (more && less) {
            more.addEventListener("click", incrementTroughCorals);
            less.addEventListener("click", decrementTroughCorals);
        }

        return () => {
            if (more && less) {
                more.removeEventListener("click", incrementTroughCorals);
                less.removeEventListener("click", decrementTroughCorals);
            }
        };
    }, []);

    useEffect(() => {
        const more = document.getElementById("moreProcessorAlgae");
        const less = document.getElementById("lessProcessorAlgae");

        const incrementProcessorAlgae = () => setProcessorAlgae((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementProcessorAlgae = () => setProcessorAlgae((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (more && less) {
            more.addEventListener("click", incrementProcessorAlgae);
            less.addEventListener("click", decrementProcessorAlgae);
        }

        return () => {
            if (more && less) {
                more.removeEventListener("click", incrementProcessorAlgae);
                less.removeEventListener("click", decrementProcessorAlgae);
            }
        };
    }, []);

    useEffect(() => {
        const more = document.getElementById("moreNetAlgae");
        const less = document.getElementById("lessNetAlgae");

        const incrementNetAlgae = () => setNetAlgae((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementNetAlgae = () => setNetAlgae((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (more && less) {
            more.addEventListener("click", incrementNetAlgae);
            less.addEventListener("click", decrementNetAlgae);
        }

        return () => {
            if (more && less) {
                more.removeEventListener("click", incrementNetAlgae);
                less.removeEventListener("click", decrementNetAlgae);
            }
        };
    }, []);

    // Fouls

    useEffect(() => {
        const more = document.getElementById("moreMinorFouls");
        const less = document.getElementById("lessMinorFouls");

        const incrementMinorFouls = () => setMinorFouls((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementMinorFouls = () => setMinorFouls((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (more && less) {
            more.addEventListener("click", incrementMinorFouls);
            less.addEventListener("click", decrementMinorFouls);
        }

        return () => {
            if (more && less) {
                more.removeEventListener("click", incrementMinorFouls);
                less.removeEventListener("click", decrementMinorFouls);
            }
        };
    }, []);

    useEffect(() => {
        const more = document.getElementById("moreMajorFouls");
        const less = document.getElementById("lessMajorFouls");

        const incrementMajorFouls = () => setMajorFouls((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementMajorFouls = () => setMajorFouls((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (more && less) {
            more.addEventListener("click", incrementMajorFouls);
            less.addEventListener("click", decrementMajorFouls);
        }

        return () => {
            if (more && less) {
                more.removeEventListener("click", incrementMajorFouls);
                less.removeEventListener("click", decrementMajorFouls);
            }
        };
    }, []);

    useEffect(() => {
        const more = document.getElementById("moreAdjust");
        const less = document.getElementById("lessAdjust");

        const incrementAdjust = () => setAdjust((prev) => prev + 1 < 99 ? prev + 1 : 99); // max 99
        const decrementAdjust = () => setAdjust((prev) => prev - 1 > 0 ? prev - 1 : 0); // min 0

        if (more && less) {
            more.addEventListener("click", incrementAdjust);
            less.addEventListener("click", decrementAdjust);
        }

        return () => {
            if (more && less) {
                more.removeEventListener("click", incrementAdjust);
                less.removeEventListener("click", decrementAdjust);
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
                            <li style={{marginBottom: "0.475rem", marginTop: "0.9rem"}}>High Branch</li>
                            <li style={{marginBottom: "0.475rem"}}>Middle Branch</li>
                            <li style={{marginBottom: "0.7rem"}}>Low Branch</li>
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
                        <div style={{display: "flex", flexDirection: "row",}}>
                            <p className="troughText" style={{marginBottom:"0"}}>{troughCorals}</p>
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
                <hr className="middleToBottom"/>
                <div className="bottomPart">
                    <div className="penalties">
                        <div>
                            <p><b>Penalties against Blue</b></p>
                            <ul>
                                <li>G206</li>
                                <li>G410 to Red</li>
                                <li>G418 to Red</li>
                                <li>G419 to Red</li>
                                <li>G428 to Red</li>
                            </ul>
                        </div>
                        <div>
                            <br/>
                            <br/>
                            <input type="checkbox" style={{marginTop: "0.2rem"}}></input> <br/>
                            <input type="checkbox"></input> <br/>
                            <input type="checkbox"></input> <br/>
                            <input type="checkbox"></input> <br/>
                            <input type="checkbox"></input> <br/>
                        </div>
                    </div>
                    <hr className="penaltiesToFouls"/>
                    <div className="fouls">
                        <div>
                            <p style={{marginTop: "0.35rem"}}><b>Foul Points</b></p>
                            <ul>
                                <li><p style={{marginTop: "0.2rem", marginBottom: "0", width: "5rem"}}>Minor Foul</p>
                                    <div style={{display: "flex", flexDirection: "row"}}>
                                        <p className="foulsText" style={{marginTop: "0.1rem"}}>{minorFouls}</p>
                                        <div style={{display: "flex", flexDirection: "column", height: "2rem"}}>
                                            <button id="moreMinorFouls" style={{marginBottom: "0.05rem"}}></button>
                                            <button id="lessMinorFouls"></button>
                                    </div></div>
                                </li>
                                <li><p style={{marginTop: "0.2rem", marginBottom: "0", width: "5rem"}}>Major Foul</p>
                                    <div style={{display: "flex", flexDirection: "row"}}>
                                        <p className="foulsText" style={{marginTop: "0.1rem"}}>{majorFouls}</p>
                                        <div style={{display: "flex", flexDirection: "column", height: "2rem"}}>
                                            <button id="moreMajorFouls" style={{marginBottom: "0.05rem"}}></button>
                                            <button id="lessMajorFouls"></button>
                                    </div></div>
                                </li>
                                <li><p style={{marginTop: "0.2rem", marginBottom: "0", width: "5rem"}}>Adjust</p>
                                    <div style={{display: "flex", flexDirection: "row", marginBottom: "0"}}>
                                        <p className="foulsText" style={{marginTop: "0.1rem", marginBottom: "0"}}>{adjust}</p>
                                        <div style={{display: "flex", flexDirection: "column", height: "2rem"}}>
                                            <button id="moreAdjust" style={{marginBottom: "0.05rem"}}></button>
                                            <button id="lessAdjust"></button>
                                    </div></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
