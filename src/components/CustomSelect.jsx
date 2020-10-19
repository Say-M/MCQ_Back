import React from "react";

const CustomSelect = (props) => {
  return <>
    <select className={props.clName} name={props.name} onChange={(evt) => props.func(evt)} value={props.val}>
      {props.options.map((option, i) => <option key={i} value={option}>{option}</option>)}
    </select>
  </>
}

export default CustomSelect;