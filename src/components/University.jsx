import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import db from "./firebase_config";

const University = () => {
    const [university, setUniversity] = useState([])

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
            <Link exact className="btn btn-primary float-right mb-3" to="/university/add_university">Add</Link>
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
                        {university.map((versity, i) => <tr key={i}><td className="align-middle" style={{ width: "150px" }}><img style={{ width: "100%", objectFit: "cover" }} src={versity.image} alt={versity.shortName} /></td> <td className="align-middle">{versity.name} ({versity.shortName})</td> <td className="align-middle">{versity.type}</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

export default University;