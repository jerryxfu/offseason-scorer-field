import {io, Socket} from "socket.io-client";


export interface ServerToClientEvents {
    "score:ack": (msg: string) => void;
    "match:start": () => void;
    "match:end": () => void;
    "match:reset": () => void;
}

export interface ClientToServerEvents {
    "score:add": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:penalty": (data: { alliance: "red" | "blue"; points: number }) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000");
