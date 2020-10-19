import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import db from "./firebase_config";

const Learn = () => {
    const [questions, setQuestions] = useState([])
    const categroys = ["HSC", "Admission", "Olympaid"]
    const [university, setUniversity] = useState([]);
    const [categoryValue, setCategoryValue] = useState({
        category: "HSC",
        university: "",
    });

    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("question")
            .where("category", "==", categoryValue.category)
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setQuestions(arr);
            });
    }, [categoryValue.category]);
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
            <Link exact className="btn btn-primary float-right" to="/quetions/add_que">Add</Link>
            <div className="form-row">
                <div className="form-group col-sm-6 col-lg-3">
                    <select className="custom-select" value={categoryValue.category} name="category" onChange={handleChange}>
                        {categroys.map((categroy, i) => <option key={i} value={categroy}>{categroy}</option>)}
                    </select>
                </div>
                {/* {categoryValue.category === "Admission" ?
                    <div className="form-group col-sm-6 col-lg-5">
                        <select className="custom-select" value={categoryValue.university} name="university" onChange={handleChange}>
                            {university.map((versity, i) => <option key={i} value={versity.name}>{versity.name}</option>)}
                        </select>
                    </div> : null} */}
            </div>
            <div className="text-nowrap table-responsive">
                <table className="table text-center table-hover table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col" style={{ width: "400px" }}>Title</th>
                            <th scope="col">Categroy</th>
                            {categoryValue.category === "Admission" ? <th scope="col">University</th> : null}
                            <th scope="col">Pass (Percent)</th>
                            <th scope="col">Question</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((question, i) => <tr key={i}><td>{question.title}</td><td>{question.category}</td>{categoryValue.category === "Admission" ? <td>{question.university}</td> : null}<td>{question.percent}</td><td>{question.total}</td><td><button className="btn-outline-primary btn btn-sm">Show</button></td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

export default Learn; 