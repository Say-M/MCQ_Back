import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import db from "./firebase_config";
import Spinner from "./Spinner";
import Alert from "./Alert";

const Learn = () => {
    const [isSpin, setSpin] = useState(true)
    const [questions, setQuestions] = useState([])
    const categroys = ["HSC", "Admission", "Olympaid"]
    const [categoryValue, setCategoryValue] = useState({
        category: "HSC",
        university: "",
    });
    const [id, setId] = useState("")
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")

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
    }, []);
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
    const getId = (e) => {
        setId(e.target.id);
    }
    const clDelete = () => {
        setSpin(true);
        const snap = db
            .collection("question")
            .doc(id)
            .delete()
            .then(() => {
                setSpin(false);
                setAlert(true);
                setAlertText("Your document is successfully deleted");
                setAlertClass("alert alert-success");
                setTimeout(() => {
                    setAlert(false);
                    setAlertText("");
                    setAlertClass("");
                }, 3000)
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
            })
            .catch((err) => {
                setSpin(false);
                setAlert(true);
                setAlertText("Sorry something went wrong. Please Try again");
                setAlertClass("alert alert-danger");
                setTimeout(() => {
                    setAlert(false);
                    setAlertText("");
                    setAlertClass("");
                }, 3000)
            })
    }
    return <>
        <div className="container table-item">
            {isSpin ? <Spinner /> : null}
            {isAlert ?
                <Alert alClass={alertClass} text={alertText} /> : null}
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
                                <th scope="col">Total Question</th>
                                <th scope="col">Total Marks</th>
                                {categoryValue.category === "Admission" ? <th scope="col">University</th> : null}
                                <th scope="col">Pass (%)</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((question, i) => <tr key={i}><td>{question.title}</td>
                                <td>{question.category}</td><td>{question.total}</td>
                                <td>{question.totalMark}</td>{categoryValue.category === "Admission" ? <td>{question.university}</td> : null}
                                <td>{question.pass}</td>
                                <td><NavLink className="btn-primary d-inline-block btn btn-sm" to={"mcq/" + question.id}><i className="fas fa-eye"></i></NavLink>
                                    <NavLink className="ml-2 d-inline-block btn-info btn btn-sm" to={"edit_mcq/" + question.id}><i className="fas fa-edit"></i></NavLink>
                                    <NavLink className="ml-2 d-inline-block btn btn-danger btn-sm" id={question.id} data-toggle="modal" data-target="#delete" onClick={getId} to="javascript:void(0)"><i id={question.id} className="fas fa-trash"></i></NavLink></td></tr>)}
                        </tbody>
                    </table>
                </div></>}
            <div className="modal fade" id="delete" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Are you sure?</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            Once you click on <strong className="text-danger">Delete Permanently</strong> you will never recovery this document
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={clDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default Learn; 