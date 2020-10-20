import React, { useEffect, useState } from "react";
import db from "./firebase_config";
import { useParams } from "react-router-dom";
import CustomSelect from "./CustomSelect";
import Spinner from "./Spinner"
import Alert from "./Alert";

const EditMcq = () => {
    const { id } = useParams()
    const [addQuestion, setAddQuestion] = useState(true);
    //Spinner
    const [isSpin, setSpin] = useState(false)
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")
    const [questions, setQuestions] = useState([{ mcq: [] }])
    const [formValue, setFormValue] = useState({
        title: "",
        category: "",
        university: "",
        percent: "",
        duration: "",
        durationCondition: "",
        total: ""
    });
    //Option
    const [optInput, setOptInput] = useState([{
        question: "",
        options: ["", ""],
        rightAnswer: 1,
    }])
    //Category
    const categorys = ["HSC", "Admission", "Olympiad"];
    //University
    const [universitys, setUniversitys] = useState([{ name: "" }]);
    //Question Index
    const [queIndex, setQueIndex] = useState(0)
    //sup and sub script
    const [scripts, setScript] = useState({
        isSup: false,
        isSub: false,
    })
    const supScript = () => {
        if (scripts.isSup) {
            setScript({ isSup: false, isSub: false })
        } else {
            setScript({ isSup: true, isSub: false })
        }
    }
    const subScript = () => {
        if (scripts.isSub) {
            setScript({ isSup: false, isSub: false })
        } else {
            setScript({ isSup: false, isSub: true })
        }
    }
    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("university")
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setUniversitys(arr);
            });
    }, []);

    //Time
    const durationCondition = ["Minutes", "Seconds"];
    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("question")
            .where("id", "==", id)
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setQuestions(arr);
                setFormValue({
                    title: arr[0].title,
                    category: arr[0].category,
                    university: arr[0].university,
                    percent: arr[0].percent,
                    duration: arr[0].duration,
                    durationCondition: arr[0].durationCondition,
                    total: arr[0].total,
                })
            });
    }, [id]);

    //input component onchange
    const handleChange = (evt) => {
        let { name, value } = evt.target;
        if (name === "percent" || name === "duration") {
            value = parseInt(value);
        }
        setFormValue(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const { title, category, percent, duration } = formValue;
        if (title !== "" && category !== "" && percent > 0 && duration > 1) {
            setAddQuestion(false)
        } else {
            setAlert(true);
            setAlertClass("alert alert-danger");
            setAlertText("Field required! Please fill up carefully.")
            setTimeout(() => {
                setAlert(false)
                setAlertClass("")
                setAlertText("")
            }, 3000)
        }
    }
    return <>
        {addQuestion ? <form className="form" onSubmit={handleSubmit}>
            <h3 className="text-center">Edit Question Set</h3>
            <div className="form-group">
                <input placeholder="Title" className="form-control" type="text" name="title" onChange={handleChange} value={formValue.title} />
            </div>
            <div className="form-group">
                <CustomSelect clName="custom-select" func={handleChange} name="category" val={formValue.category} options={categorys} />
            </div>
            {formValue.category === "Admission" ? <div className="form-group">
                <select className="custom-select" onChange={handleChange} name="category" value={formValue.university}>
                    {universitys.map((versity, i) => <option key={i} value={versity.name} >{versity.name}</option>)}
                </select>
            </div> : null}
            <div className="form-group">
                <input placeholder="Percent" className="form-control" type="number" name="percent" onChange={handleChange} value={formValue.percent} />
            </div>
            <div className="form-group form-row">
                <div className="col-sm-8">
                    <input placeholder="Duration" className="form-control" type="number" name="duration" onChange={handleChange} value={durationCondition === "Minutes" ? ((formValue.duration / 60) / 1000).toString() : (formValue.duration / 1000).toString()} />
                </div>
                <div className="col-sm-4">
                    <CustomSelect clName="custom-select" name="durationCondition" func={handleChange} val={formValue.durationCondition} options={durationCondition} />
                </div>
            </div>
            <div className="text-right form-group">
                <button type="submit" className="btn btn-outline-primary">Next</button>
            </div>
        </form> : optInput.map((opt, i) => {
            return <form key={i} className="from">
                <h3 className="text-center">Question no : {queIndex + 1} and total : {optInput.length}</h3>
                <div className="scripts">
                    <div className={scripts.isSup ? 'active' : null} onClick={supScript}><i className="fas fa-superscript"></i></div>
                    <div className={scripts.isSub ? 'active' : null} onClick={subScript}><i className="fas fa-subscript"></i></div>
                </div>
            </form>
        })}
    </>
}

export default EditMcq;