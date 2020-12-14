import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import db, { storage } from "./firebase_config";
import Spinner from "./Spinner";
import Alert from "./Alert";

const McqTable = () => {
    const [isSpin, setSpin] = useState(true)
    const [questions, setQuestions] = useState([])
    const categories = ["HSC", "Admission", "Olympaid"]
    const [categoryValue, setCategoryValue] = useState({
        category: "HSC",
        university: "",
    });
    const [id, setId] = useState("")
    const [deleteQuestion, setdeleteQuestion] = useState({})
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")
    document.title = "ChemGenie | All questions"
    useEffect(() => {
        setSpin(true)
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
                setSpin(false)
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
    const getId = (que) => (e) => {
        e.preventDefault()
        setId(e.target.id);
        setdeleteQuestion(que)
    }

    const deleteDocument = () => {
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

    const fileDeleteTask = async (url) => {
        const imageRef = storage.refFromURL(url);
        imageRef.delete().then(() => {
            return true
        }).catch((e) => {
            return false
        })
    }

    const clDelete = () => {
        setSpin(true);
        const mcq = deleteQuestion.mcq;
        const imageFilesList = mcq.filter(q => q.image && q.image !== "");
        if (imageFilesList.length) {
            imageFilesList.forEach((f, index) => {
                fileDeleteTask(f.image).then(success => {
                    if (index >= imageFilesList.length - 1) {
                        deleteDocument()
                    }
                })
            })
        }
        else {
            deleteDocument()
        }

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
                            {categories.map((category, i) => <option key={i} value={category}>{category}</option>)}
                        </select>
                    </div>
                </div>
                <div className="text-nowrap table-responsive">
                    <table className="table text-center table-hover table-bordered">
                        <thead className="thead-light">
                            <tr>
                                <th scope="col" style={{ width: "400px" }}>Title</th>
                                <th scope="col">Category</th>
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
                                    <NavLink className="ml-2 d-inline-block btn btn-danger btn-sm" id={question.id} data-toggle="modal" data-target="#delete" onClick={getId(question)} to="#"><i id={question.id} className="fas fa-trash"></i></NavLink></td></tr>)}
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

export default McqTable; 