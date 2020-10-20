import React, { useEffect, useState } from "react";
import db from "./firebase_config";
import Input from "./Input"
import CustomSelect from "./CustomSelect"
import Spinner from "./Spinner"
import Alert from "./Alert";
import { Redirect, useParams } from "react-router-dom";

const PracticeFrom = () => {
    const { id } = useParams()
    const [questions, setQuestions] = useState([{ mcq: [] }])
    const [formValue, setFormValue] = useState({
        title: "",
        category: "",
        university: "",
        Pass: "",
        duration: "",
        durationCondition: "",
        total: ""
    });
    //Option
    const [optInput, setOptInput] = useState([{
        question: "",
        options: ["", ""],
        rightAnswer: "",
    }])
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
                setOptInput(arr[0].mcq)
                setFormValue({
                    title: arr[0].title,
                    category: arr[0].category,
                    university: arr[0].university,
                    Pass: arr[0].Pass,
                    duration: (arr[0].durationCondition === "Minutes" ? ((arr[0].duration / 60) / 1000) : (arr[0].duration / 1000)),
                    durationCondition: arr[0].durationCondition,
                    total: arr[0].total,
                })
            });
    }, [id]);
    //Spinner
    const [isSpin, setSpin] = useState(false)
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")

    const [addQuestion, setAddQuestion] = useState(true);

    //Question Index
    const [queIndex, setQueIndex] = useState(0)
    //Render conditional components
    let isAdmission = false;
    //Category
    const categorys = ["HSC", "Admission", "Olympiad"];
    //University
    const [universitys, setUniversitys] = useState([]);
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
    //sup and sub script
    const [scripts, setScript] = useState({
        isSup: false,
        isSub: false,
    })
    //input component onchange
    const handleChange = (evt) => {
        let { name, value } = evt.target;
        if (name === "Pass" || name === "duration") {
            value = parseInt(value);
        }
        setFormValue(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
    }
    //University input
    if (formValue.category === "Admission") {
        isAdmission = true;
    } else {
        isAdmission = false;
    }
    //Practice submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const { title, category, Pass, duration } = formValue;
        if (title !== "" && category !== "" && Pass > 0 && duration > 1) {
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
    //Pactice options submit
    const handleOptSubmit = (e) => {
        e.preventDefault();
        uploadDataToFirestore();
    }

    const questionChange = (e, key) => {
        optInput[key].question = e.target.value;
        setOptInput(prevOpt => {
            return [
                ...prevOpt
            ]
        })
    }
    const handleOptChange = (e, id, key) => {
        optInput[key].options[id] = e.target.value;
        setOptInput(prevOpt => {
            return [...prevOpt]

        })
    }
    const handleSelChange = (e, key) => {
        optInput[key].rightAnswer = parseInt(e.target.value);
        setOptInput(prevOpt => {
            return [...prevOpt]
        })
    }
    const addOpt = (e, key) => {
        optInput[key].options = [...optInput[key].options, ""]
        setOptInput(prevOpt => {
            return [
                ...prevOpt
            ]
        })
    }

    const addQues = () => {
        if (queIndex === (optInput.length - 1)) {
            setOptInput(prevOpt => {
                return [...prevOpt, {
                    question: "",
                    options: ["", ""],
                    rightAnswer: "1"
                }]
            })
        }
        setQueIndex(queIndex + 1);
    }
    const prevQues = () => {
        if (queIndex > 0) {
            setQueIndex(queIndex - 1);
        }
    }
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

    //Upload Data
    const uploadDataToFirestore = async () => {
        setSpin(true)
        const data = formValue;
        data.mcq = optInput;
        data.total = optInput.length;

        const document = db.collection("question").doc(id);
        data.id = document.id;
        if (data.durationCondition === "Minutes") {
            data.duration = data.duration * 60 * 1000;
        } else {
            data.duration = data.duration * 1000;
        }
        document
            .update(data)
            .then(() => {
                setQueIndex(0);
                setAddQuestion(true);
                setAlert(true);
                setAlertClass("alert alert-success");
                setAlertText("Questions successfully Edited");
                setTimeout(() => {
                    setAlert(false);
                    setAlertClass("");
                    setAlertText("");
                }, 3000)
                setSpin(false);
            })
            .catch(() => {
                setAlertClass("alert alert-danger");
                setAlertText("Que addition failed. Please try again.");
                setTimeout(() => {
                    setAlert(false);
                    setAlertClass("");
                    setAlertText("");
                }, 3000)
                setSpin(false)
            });
    };


    return <>
        {isAlert ?
            <Alert alClass={alertClass} text={alertText} /> : null}
        {isSpin ? <Spinner /> : null}
        {addQuestion ?
            <form className="form" onSubmit={handleSubmit}>
                <h3 className="text-center">Add New Question Set</h3>
                <div className="form-group row">
                    <label class="col-sm-2 col-form-label">Title</label>
                    <div className="col-sm-10">
                        <Input placeholder="Title" clName="form-control" type="text" name="title" func={handleChange} val={formValue.title} />
                    </div>
                </div>
                <div className="form-group row">
                    <label class="col-sm-2 col-form-label">Category</label>
                    <div className="col-sm-10">
                        <CustomSelect clName="custom-select" func={handleChange} name="category" val={formValue.category} options={categorys} />
                    </div>
                </div>
                {isAdmission ?
                    <div className="form-group row">
                        <label class="col-sm-2 col-form-label">University</label>
                        <div className="col-sm-10">
                            <select className="custom-select" onChange={handleChange} name="university" val={formValue.university}  >
                                {universitys.map((versity, i) => <option key={i} value={versity.name}>{versity.name}</option>)}
                            </select>
                        </div>
                    </div>
                    : null}
                <div className="form-group row">
                    <label class="col-sm-2 col-form-label">Pass</label>
                    <div className="col-sm-10">
                        <Input placeholder="Pass (Percent)" clName="form-control" type="number" name="Pass" func={handleChange} val={formValue.Pass} />
                    </div>
                </div>
                <div className="form-group row">
                    <label class="col-sm-2 col-form-label">Duration</label>
                    <div className="col-2">
                        <Input placeholder="Duration" clName="form-control" type="number" name="duration" func={handleChange} val={formValue.duration.toString()} />
                    </div>
                    <label class="col-1 pl-0 col-form-label">Hours</label>
                    <div className="col-2">
                        <Input placeholder="Minutes" clName="form-control" type="number" name="min" func={handleChange} val={formValue.duration.toString()} />
                    </div>
                    <label class="col-1 pl-0 col-form-label">Minutes</label>
                    <div className="col-2">
                        <Input placeholder="Seconds" clName="form-control" type="number" name="sec" func={handleChange} val={formValue.duration.toString()} />
                    </div>
                    <label class="col-2 pl-0 col-form-label">Seconds</label>
                </div>
                <div className="text-right form-group">
                    <button type="submit" className="btn btn-outline-primary">Next</button>
                </div>
            </form> :
            <>
                {optInput.map((opts, ind) => {
                    return <form key={ind} className="form" onSubmit={handleOptSubmit} style={queIndex !== ind ? { display: "none" } : { display: "inherit" }}>
                        <h3 className="text-center">Question no : {queIndex + 1} and total : {optInput.length}</h3>
                        <div className="scripts">
                            <div className={scripts.isSup ? 'active' : null} onClick={supScript}><i className="fas fa-superscript"></i></div>
                            <div className={scripts.isSub ? 'active' : null} onClick={subScript}><i className="fas fa-subscript"></i></div>
                        </div>
                        <div className="form-group">
                            <textarea placeholder="Question Title" name="quesTitle" className="form-control" onChange={evt => questionChange(evt, ind)} value={opts.question}></textarea>
                        </div>
                        {opts.options.map((input, i) => {
                            return <div key={i} className="form-group">
                                <input placeholder={"Option " + (i + 1)} className="form-control" type="text" value={opts.options[i]} onChange={evt => handleOptChange(evt, i, ind)} />
                            </div>
                        })}
                        <div className="form-group text-center">
                            <button className="btn btn-outline-primary" type="button" onClick={evt => addOpt(evt, ind)}>Add New Option</button>
                        </div>
                        <div className="form-group">
                            <select className="custom-select" value={opts.rightAnswer} onChange={evt => handleSelChange(evt, ind)}>
                                {opts.options.map((input, i) => {
                                    return <option key={i} value={i + 1}>{i + 1}</option>
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <div className="float-left"><button className="btn btn-outline-dark mr-3" type="button" onClick={prevQues}>Prev</button><button className="btn btn-outline-dark" type="button" onClick={addQues}>Next</button></div>
                            <div className="float-right"><button className="btn btn-outline-primary" type="submit">Update</button></div>
                        </div>
                    </form>
                })}
            </>
        }

    </>
}

export default PracticeFrom;