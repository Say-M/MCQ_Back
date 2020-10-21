import React, { useEffect, useState } from "react";
import db from "./firebase_config";
import Input from "./Input"
import CustomSelect from "./CustomSelect"
import Spinner from "./Spinner"
import Alert from "./Alert";
import { useParams } from "react-router-dom";

const PracticeFrom = () => {
    const { id } = useParams()
    const [questions, setQuestions] = useState([{ mcq: [] }])
    const [formValue, setFormValue] = useState({
        title: "",
        category: "",
        university: "",
        pass: "",
        totalMark: "",
        duration: "",
        hour: "",
        min: "",
        sec: "",
        total: ""
    });
    //Option
    const [optInput, setOptInput] = useState([{
        question: "",
        options: ["", ""],
        rightAnswer: "",
    }])
    document.title = "ChemGenie | " + formValue.title
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
                    pass: arr[0].pass,
                    totalMark: arr[0].totalMark,
                    duration: arr[0].duration,
                    hour: arr[0].hour,
                    min: arr[0].min,
                    sec: arr[0].sec,
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

    //sup and sub script
    const [scripts, setScript] = useState({
        isSup: false,
        isSub: false,
    })
    const supSubControl = (val) => {
        let new_val = "";
        const start = scripts.isSub ? "<sub><small> " : "<sup><small>";
        const end = scripts.isSub ? "</small></sub>" : "</small></sup>";
        const re = new RegExp(`.*${end}.$`);
        if (val.match(re)) {
            new_val =
                val.slice(0, val.length - 15) +
                val.charAt(val.length - 1) +
                end;
        } else {
            new_val =
                val.slice(0, val.length - 1) +
                start +
                val.charAt(val.length - 1) +
                end;
        }
        return new_val;
    }
    //input component onchange
    const handleChange = (evt) => {
        let { name, value } = evt.target;
        if (name === "pass" || name === "totalMark" || name === "hour" || name === "min" || name === "sec") {
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
        const { title, category, pass, hour, min, sec, totalMark } = formValue;
        if (title !== "" && category !== "" && pass > 0 && totalMark > 0 && hour >= 0 && min >= 0 && sec >= 0) {
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
        if (scripts.isSub || scripts.isSup) {
            optInput[key].question = supSubControl(e.target.value)
        }
        setOptInput(prevOpt => {
            return [
                ...prevOpt
            ]
        })
    }
    const handleOptChange = (e, id, key) => {
        optInput[key].options[id] = e.target.value;
        if (scripts.isSub || scripts.isSup) {
            optInput[key].options[id] = supSubControl(e.target.value)
        }
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
        data.duration = (data.hour * 60 * 60 * 1000) + (data.min * 60 * 1000) + (data.sec * 1000)

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
                <div className="container">
                    <h3 className="text-center">Update Question Set</h3>
                    <div className="form-group row justify-content-md-center">
                        <label className="col-sm-2 col-form-label">Title</label>
                        <div className="col-sm-10 col-md-6">
                            <Input placeholder="Title" clName="form-control" type="text" name="title" func={handleChange} val={formValue.title} />
                        </div>
                    </div>
                    <div className="form-group row justify-content-md-center">
                        <label className="col-sm-2 col-form-label">Category</label>
                        <div className="col-sm-10 col-md-6">
                            <CustomSelect clName="custom-select" func={handleChange} name="category" val={formValue.category} options={categorys} />
                        </div>
                    </div>
                    {isAdmission ?
                        <div className="form-group row justify-content-md-center">
                            <label className="col-sm-2 col-form-label">University</label>
                            <div className="col-sm-10 col-md-6">
                                <select className="custom-select" onChange={handleChange} name="university" val={formValue.university}  >
                                    {universitys.map((versity, i) => <option key={i} value={versity.name}>{versity.name}</option>)}
                                </select>
                            </div>
                        </div>
                        : null}
                    <div className="form-group row justify-content-md-center">
                        <label className="col-sm-2 col-form-label">Mark Per Question</label>
                        <div className="col-sm-10 col-md-6">
                            <Input placeholder="Total Marks" clName="form-control" type="number" name="totalMark" func={handleChange} val={formValue.totalMark} />
                        </div>
                    </div>
                    <div className="form-group row justify-content-md-center">
                        <label className="col-sm-2 col-form-label">Pass (%)</label>
                        <div className="col-sm-10 col-md-6">
                            <Input placeholder="Pass" clName="form-control" type="number" name="pass" func={handleChange} val={formValue.pass} />
                        </div>
                    </div>
                    <div className="form-group row justify-content-md-center">
                        <label className="col-sm-2 col-form-label">Duration</label>
                        <div className="col-sm-2 col-md-1">
                            <Input placeholder="Hours" clName="form-control" type="number" name="hour" func={handleChange} val={formValue.hour} />
                        </div>
                        <label className="col-sm-1 pl-sm-0 col-form-label">Hours</label>
                        <div className="col-sm-2 col-md-1">
                            <Input placeholder="Min" clName="form-control" type="number" name="min" func={handleChange} val={formValue.min} />
                        </div>
                        <label className="col-sm-1 pl-sm-0 col-form-label">Min</label>
                        <div className="col-sm-2 col-md-1">
                            <Input placeholder="Sec" clName="form-control" type="number" name="sec" func={handleChange} val={formValue.sec} />
                        </div>
                        <label className="col-sm-2 col-md-1 pl-sm-0 col-form-label">Sec</label>
                    </div>
                    <div className="text-center form-group mt-5">
                        <button type="submit" className="btn px-5 btn-outline-primary">Next</button>
                    </div>
                </div>
            </form> :
            <>
                {optInput.map((opts, ind) => {
                    return <form key={ind} className="form" onSubmit={handleOptSubmit} style={queIndex !== ind ? { display: "none" } : { display: "inherit" }}>
                        <div className="container">
                            <h3 className="text-center">Question no : {queIndex + 1} and total : {optInput.length}</h3>
                            <div className="scripts row pr-0 col-md-10">
                                <div className={scripts.isSup ? 'active' : null} onClick={supScript}><i className="fas fa-superscript"></i></div>
                                <div className={scripts.isSub ? 'active' : null} onClick={subScript}><i className="fas fa-subscript"></i></div>
                            </div>
                            <div className="form-group row justify-content-md-center">
                                <label className="col-sm-2 col-form-label">Title</label>
                                <div className="col-sm-10  col-md-6 col-md-6">
                                    <textarea placeholder="Question Title" name="quesTitle" className="form-control" onChange={evt => questionChange(evt, ind)} value={opts.question}></textarea>
                                </div>
                            </div>
                            {opts.options.map((input, i) => {
                                return <div key={i} className="form-group row justify-content-md-center">
                                    <label className="col-sm-2 col-form-label">Option {i + 1}</label>
                                    <div className="col-sm-10  col-md-6">
                                        <input placeholder={"Option " + (i + 1)} className="form-control" type="text" value={opts.options[i]} onChange={evt => handleOptChange(evt, i, ind)} />
                                    </div>
                                </div>
                            })}
                            <div className="form-group text-center">
                                <button className="btn btn-outline-primary" type="button" onClick={evt => addOpt(evt, ind)}>Add New Option</button>
                            </div>
                            <div className="form-group row justify-content-md-center">
                                <label className="col-sm-2 col-form-label">Answer</label>
                                <div className="col-sm-10 col-md-6">
                                    <select className="custom-select" value={opts.rightAnswer} onChange={evt => handleSelChange(evt, ind)}>
                                        {opts.options.map((input, i) => {
                                            return <option key={i} value={i + 1}>{i + 1}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row justify-content-md-center">
                                <div className="col-md-8">
                                    <div className="float-left"><button className="btn btn-outline-dark mr-3" type="button" onClick={prevQues}>Prev</button></div>
                                    <div className="float-right"><button className="btn btn-outline-dark" type="button" onClick={addQues}>Next</button></div>
                                </div>
                            </div>
                            <div className="form-group mt-5 text-center">
                                <button className="btn btn-outline-primary" type="submit">Submit</button>
                            </div>
                        </div>
                    </form>
                })}
            </>
        }

    </>
}

export default PracticeFrom;