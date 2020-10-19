import React from "react";

const Alert = (props) => {
    return <div className="custom-alert">
        <div className={props.alClass} role="alert">
            {props.text}
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    </div>
}

export default Alert;