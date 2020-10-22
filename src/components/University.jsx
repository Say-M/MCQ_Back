import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import db from "./firebase_config";

const University = () => {
    const [university, setUniversity] = useState([])
    document.title = "ChemGenie | All universitys"

    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("university")
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setUniversity(arr);
            });
    }, []);


    return <>
        <div className="container table-item">
            <NavLink exact className="btn btn-primary float-right mb-3" to="/university/add_university">Add</NavLink>
            <div className="text-nowrap table-responsive">
                <table className="table table-hover table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">Image</th>
                            <th scope="col">Name</th>
                            <th scope="col">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {university.map((versity, i) => <tr key={i}><td className="align-middle text-center" style={{ width: "100px" }}><img style={{ width: "80px", height: "80px", objectFit: "cover" }} src={versity.image} alt={versity.shortName} /></td><td className="align-middle">{versity.name} ({versity.shortName})</td><td className="align-middle">{versity.type}</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

export default University;