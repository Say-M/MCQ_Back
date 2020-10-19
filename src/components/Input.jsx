import React from "react";

const Input = (props) => {
    return <>
        <input
            placeholder={props.placeholder}
            className={props.clName}
            id={props.id}
            type={props.type}
            name={props.name}
            onChange={(evt) => props.func(evt)}
            value={props.val} />
    </>
}

export default Input;