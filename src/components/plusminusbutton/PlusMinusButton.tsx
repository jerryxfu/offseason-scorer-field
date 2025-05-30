import React from "react";
import "../PlusMinusButton.scss";

type PlusMinusButtonProps = {
    onPlus: () => void;
    onMinus: () => void;
};

export default function PlusMinusButton({onPlus, onMinus}: PlusMinusButtonProps) {
    return (
        <div className="plus-minus-container">
            <button
                type="button"
                className="pm-button-plus"
                onClick={onPlus}
            >
                +
            </button>
            <button
                type="button"
                className="pm-button-minus"
                onClick={onMinus}
            >
                −
            </button>
        </div>
    );
}