import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import db, { storage } from "./firebase_config";

const Learn = () => {
    const categroys = ["HSC", "Admission", "Olympain"]
    const [university, setUniversity] = useState([]);
    const [categoryValue, setCategoryValue] = useState({
        category: "HSC",
        university: "",
    });
    const updateInfoForm = (data) => {
        setCategoryValue(Object.assign({}, categoryValue, data));
    };
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
                updateInfoForm({ university: arr[0]?.shortName });
            });
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoryValue(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
    }

    return <>
        <div className="container table-item">
            <Link exact className="btn btn-primary float-right" to="/add_que">Add</Link>
            <div className="form-row">
                <div className="form-group col-sm-6 col-lg-3">
                    <select className="custom-select" value={categoryValue.category} name="category" onChange={handleChange}>
                        {categroys.map((categroy, i) => <option key={i} value={categroy}>{categroy}</option>)}
                    </select>
                </div>
                {categoryValue.category === "Admission" ?
                    <div className="form-group col-sm-6 col-lg-5">
                        <select className="custom-select" value={categoryValue.university} name="university" onChange={handleChange}>
                            {university.map((versity, i) => <option key={i} value={versity.name}>{versity.name}</option>)}
                        </select>
                    </div> : null}
            </div>
            <div className="text-nowrap table-responsive">
                <table className="table table-hover table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">Categroy</th>
                            <th scope="col">Title</th>
                            <th scope="col">Pass (Percent)</th>
                            <th scope="col">Question</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                            <td>@mdo</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                            <td>@mdo</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

export default Learn; 