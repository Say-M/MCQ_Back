import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import db from "./firebase_config";
import Spinner from "./Spinner";

const Learn = () => {
    const [isSpin, setSpin] = useState(true)
    const [questions, setQuestions] = useState([])
    const categroys = ["HSC", "Admission", "Olympaid"]
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
    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("university")
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setSpin(false)
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
            {isSpin ? <Spinner /> : null}
            {isSpin ? null : <>
                <NavLink exact className="btn btn-primary float-right" to="/quetions/add_que">Add</NavLink>
                <div className="form-row">
                    <div className="form-group col-sm-6 col-lg-3">
                        <select className="custom-select" value={categoryValue.category} name="category" onChange={handleChange}>
                            {categroys.map((categroy, i) => <option key={i} value={categroy}>{categroy}</option>)}
                        </select>
                    </div>
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
                            {questions.map((question, i) => <tr key={i}><td>{question.title}</td><td>{question.category}</td>{categoryValue.category === "Admission" ? <td>{question.university}</td> : null}<td>{question.pass}</td><td>{question.total}</td><td><NavLink className="btn-outline-primary btn btn-sm" to={"mcq/" + question.id}>Show</NavLink><NavLink className="ml-2 btn-outline-primary btn btn-sm" to={"edit_mcq/" + question.id}>Edit</NavLink></td></tr>)}
                        </tbody>
                    </table>
                </div></>}

        </div>
    </>
}

export default Learn; 