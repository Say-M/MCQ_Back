import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import db from "./firebase_config";
import Spinner from "./Spinner";
import Alert from "./Alert";

const LearnTable = () => {
    const { docId } = useParams();
    const [isSpin, setSpin] = useState(true)
    const [learn, setLearn] = useState([])
    const categroys = ["HSC", "Admission", "Olympaid"]
    const [categoryValue, setCategoryValue] = useState({
        category: "HSC",
    });
    const [id, setId] = useState("")
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")
    document.title = "ChemGenie | All chapters"
    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("learn")
            .where("category", "==", categoryValue.category)
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setLearn(arr);
                setSpin(false)
            });
    }, [categoryValue.category]);

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
        e.preventDefault()
        setId(e.target.id);
    }
    const clDelete = () => {
        setSpin(true);

        // get all the documents with root matched with id
        const snap = db.collection("learn")
        .where("root", "==", id)
        .get()
        .then((snap) => {

            //delete every document with root matched with id
            snap.forEach((d) => {
                console.log(d.id());
                const snap = db.collection("learn")
                .doc(d.id())
                .set(null)
                .catch(err => console.log(err))
            });

            //delete the info document
            const snap = db
            .collection("learn")
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
                    .collection("learn")
                    .where("category", "==", categoryValue.category)
                    .get()
                    .then((snap) => {
                        snap.forEach((d) => {
                            arr.push(d.data());
                        });
                        setLearn(arr);
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
                console.log(err);
            });
        });

        // const snap = db
        //     .collection("learn")
        //     .doc(id)
        //     .delete()
        //     .then(() => {
        //         let ids = [];
        //         const snap = db
        //             .collection("learn")
        //             .where("root", "==", id)
        //             .get()
        //             .then((snap) => {
        //                 snap.forEach((d) => {
        //                     ids.push(d.data().id);
        //                     console.log(d.data());
        //                     console.log(d.id());
        //                 });
        //             })
        //             .then(() => {
        //                 ids.forEach(ID => {
        //                     console.log(ID);
        //                     const snap = db.collection("learn")
        //                         .doc(ID)
        //                         .set(null)
        //                         .catch(err => console.log(err))
        //                 })
        //             });
        //     })
        //     .then(() => {
        //         setSpin(false);
        //         setAlert(true);
        //         setAlertText("Your document is successfully deleted");
        //         setAlertClass("alert alert-success");
        //         setTimeout(() => {
        //             setAlert(false);
        //             setAlertText("");
        //             setAlertClass("");
        //         }, 3000)
        //         let arr = [];
        //         const snap = db
        //             .collection("learn")
        //             .where("category", "==", categoryValue.category)
        //             .get()
        //             .then((snap) => {
        //                 snap.forEach((d) => {
        //                     arr.push(d.data());
        //                 });
        //                 setLearn(arr);
        //             });
        //     })
        //     .catch((err) => {
        //         setSpin(false);
        //         setAlert(true);
        //         setAlertText("Sorry something went wrong. Please Try again");
        //         setAlertClass("alert alert-danger");
        //         setTimeout(() => {
        //             setAlert(false);
        //             setAlertText("");
        //             setAlertClass("");
        //         }, 3000)
        //         console.log(err);
        //     })
    }
    return <>
        <div className="container table-item">
            {isSpin ? <Spinner /> : null}
            {isAlert ?
                <Alert alClass={alertClass} text={alertText} /> : null}
            {isSpin ? null : <>
                <NavLink exact className="btn btn-primary float-right" to="/add_learn">Add</NavLink>
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
                                <th scope="col">Chapter</th>
                                <th scope="col">Categroy</th>
                                {categoryValue.category === "Admission" ? <th scope="col">University</th> : null}
                                <th scope="col">PDF</th>
                                <th scope="col">Video</th>
                                <th scope="col">Question</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {learn.map((lrn, i) => <tr key={i}><td>{lrn.chapter}</td>
                                <td>{lrn.category}</td>
                                {categoryValue.category === "Admission" ? <td>{lrn.university}</td> : null}
                                <td>{lrn.pdf}</td>
                                <td>{lrn.video}</td>
                                <td>{lrn.que}</td>
                                <td><NavLink className="btn-primary d-inline-block btn btn-sm" to={"mcq/" + lrn.id}><i className="fas fa-eye"></i></NavLink>
                                    <NavLink className="ml-2 d-inline-block btn-info btn btn-sm" to={"edit_learn/" + lrn.id}><i className="fas fa-edit"></i></NavLink>
                                    <NavLink className="ml-2 d-inline-block btn btn-danger btn-sm" id={lrn.id} data-toggle="modal" data-target="#delete" onClick={getId} to="#"><i id={lrn.id} className="fas fa-trash"></i></NavLink></td></tr>)}
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

export default LearnTable; 