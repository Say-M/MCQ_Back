import React, { useEffect, useState } from "react";
import db from "./firebase_config";
import Input from "./Input"
import CustomSelect from "./CustomSelect"
import Spinner from "./Spinner"
import Alert from "./Alert";

const PracticeFrom = () => {
    const [formValue, setFormValue] = useState({
        title: "",
        category: "HSC",
        university: "",
        year: "",
        precent: "",
        time: "",
        timeCondition: "Minutes",
        total: 0,
        input_time: 0,
    });
    //Spinner
    const [isSpin, setSpin] = useState(false)
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")

    const [addQuestion, setAddQuestion] = useState(true);
    const [viewState, setViewState] = useState("que_info"); // que_info each_que
    //Question Index
    const [queIndex, setQueIndex] = useState(0)
    //Render conditional components
    let isAdmission = false;
    //Category
    const categorys = ["HSC", "Admission", "Olympiad"];
    //University
    const [universitys, setUniversitys] = useState([]);
    const updateQueSetInfo = (data) => {
        setFormValue(Object.assign({}, formValue, data));
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
                setUniversitys(arr);
                updateQueSetInfo({ university: arr[0]?.shortName });
            });
    }, []);

    //Time
    const timeCondition = ["Minutes", "Seconds"];
    //Option
    const [optInput, setOptInput] = useState([{
        question: "",
        options: ["", ""],
        rightAns: "1",
    }])
    //sup and sub script
    const [scripts, setScript] = useState({
        isSup: false,
        isSub: false,
    })
    //input component onchange
    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setFormValue(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
    }
    //University input
    if (formValue.category === "Admission") {
        isAdmission = true
    } else {
        isAdmission = false
    }
    //Practice submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const { title, category, year, precent, time } = formValue;
        if (title !== "" && category !== "" && year !== "" && precent > 0 && time > 1) {
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
        optInput[key].rightAns = e.target.value;
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
                    rightAns: "1"
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
        data.question = optInput;
        data.total = optInput.length;

        const document = db.collection("Questions").doc();
        data.id = document.id;
        data.time = data.time * 1000;
        document
            .set(data)
            .then(() => {
                // showAlert("Que Added Successfully", "success");
                setQueIndex(0);
                setAddQuestion(true);
                setAlert(true);
                setAlertClass("alert alert-success");
                setAlertText("Questions successfully added");
                setTimeout(() => {
                    setAlert(false);
                    setAlertClass("");
                    setAlertText("");
                }, 3000)
                setOptInput([{
                    question: "",
                    options: ["", ""],
                    rightAns: "1"
                }]);
                setFormValue({
                    title: "",
                    category: "HSC",
                    university: "",
                    year: "",
                    precent: "",
                    time: "",
                    timeCondition: "Minutes",
                    total: 0,
                    input_time: 0,
                });

                setViewState("que_info");
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
                <div className="form-group">
                    <Input placeholder="Title" clName="form-control" type="text" name="title" func={handleChange} val={formValue.title} />
                </div>
                <div className="form-group">
                    <CustomSelect clName="custom-select" func={handleChange} name="category" val={formValue.category} options={categorys} />
                </div>
                {isAdmission ?
                    <div className="form-group">
                        <select className="custom-select" onChange={handleChange} name="university" val={formValue.university}  >
                            {universitys.map((versity, i) => <option key={i} value={versity.name}>{versity.name}</option>)}
                        </select>
                    </div>
                    : null}
                <div className="form-group">
                    <Input placeholder="Year" clName="form-control" type="number" name="year" func={handleChange} val={formValue.year} />
                </div>
                <div className="form-group">
                    <Input placeholder="Precent" clName="form-control" type="number" name="precent" func={handleChange} val={formValue.precent} />
                </div>
                <div className="form-group form-row">
                    <div className="col-sm-8">
                        <Input placeholder="Time" clName="form-control" type="number" name="time" func={handleChange} val={formValue.time} />
                    </div>
                    <div className="col-sm-4">
                        <CustomSelect clName="custom-select" name="timeCondition" func={handleChange} val={formValue.timeCondition} options={timeCondition} />
                    </div>
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
                            <select className="custom-select" onChange={evt => handleSelChange(evt, ind)}>
                                {opts.options.map((input, i) => {
                                    return <option key={i} value={i + 1}>{i + 1}</option>
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <div className="float-left"><button className="btn btn-outline-dark mr-3" type="button" onClick={prevQues}>Prev</button><button className="btn btn-outline-dark" type="button" onClick={addQues}>Next</button></div>
                            <div className="float-right"><button className="btn btn-outline-primary" type="submit">Submit</button></div>
                        </div>
                    </form>
                })}
            </>
        }

    </>
}

export default PracticeFrom;