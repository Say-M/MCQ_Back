import React, { useEffect, useState } from "react"
import { v4 as uuid4 } from 'uuid'
import db, { storage } from "./firebase_config"
import Input from "./Input"
import CustomSelect from "./CustomSelect"
import Spinner from "./Spinner"
import Alert from "./Alert"
import { useParams } from "react-router-dom"
import SunEditor from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css'

const PracticeFrom = () => {
    const { id } = useParams()
    const [questions, setQuestions] = useState([{ mcq: [] }])
    const [formValue, setFormValue] = useState({
        title: "",
        category: "",
        university: "",
        pass: "",
        markPerQuestion: "",
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

    //Question Image
    const [queImg, setQueImg] = useState([]);
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
                    markPerQuestion: arr[0].markPerQuestion,
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
        if (name === "pass" || name === "markPerQuestion" || name === "hour" || name === "min" || name === "sec") {
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
        const { title, category, pass, hour, min, sec, markPerQuestion } = formValue;
        if (title !== "" && category !== "" && pass > 0 && markPerQuestion > 0 && hour >= 0 && min >= 0 && sec >= 0) {
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

    const sunEditorChange = (content, key) => {
        optInput[key].question = content;
        setOptInput(prevOpt => {
            return [
                ...prevOpt
            ]
        })
    }
    const handleOptChange = (content, id, key) => {
        optInput[key].options[id] = content;
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

    const uploadDataToFirestore = async () => {
        setSpin(true)
        const data = formValue;
        data.mcq = optInput;
        data.total = optInput.length;
        console.log(data);
        let mcqCount = 0;
        const document = db.collection("question").doc(id);
        data.mcq.forEach((mcq, index) => {
            fileUploadTaskToStorage(mcq.image, (link) => {
                if (link !== 1) {
                    mcq.image = link;
                }
                else {
                    mcq.image = ""
                }
                mcqCount += 1
                if (mcqCount >= data.total) {
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
                            // setOptInput([{
                            //     question: "",
                            //     image: "",
                            //     options: ["", ""],
                            //     rightAnswer: "1"
                            // }]);
                            // setFormValue({
                            //     title: "",
                            //     category: "HSC",
                            //     university: "",
                            //     markPerQuestion: "",
                            //     pass: "",
                            //     duration: "",
                            //     hour: "",
                            //     min: "",
                            //     sec: "",
                            //     total: 0,
                            // });
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
                }
            })
        })

    };
    const fileUploadTaskToStorage = async (file, callback) => {

        if ((typeof file) == 'string') {
            callback(1)
        }
        else {
            const file_extension = file.name.split('.').pop();
            const new_file_name = uuid4() + "." + file_extension;
            const uploadRef = storage.ref("logo").child(new_file_name);
            const uploadTask = uploadRef.put(file);
            uploadTask.on(
                "state_changed",
                function (snapshot) {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                    if (progress < 100) {
                        setSpin(true)
                    } else {
                        setSpin(false)
                        setAlert(true);
                        setAlertClass("alert alert-success alert-dismissible fade show");
                        setAlertText("University added successfully completed");
                        setTimeout(() => {
                            setAlert(false);
                            setAlertClass("");
                            setAlertText("");
                        }, 3000)
                    }
                },
                function (error) {
                    callback(false);
                },
                function () {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                        console.log("File available at", downloadURL);
                        callback(downloadURL);
                    });
                }
            );
        }
    }

    //show Image
    function readURL(e) {
        const inputImg = e.target.files[0];

        var reader = new FileReader();
        var url = reader.readAsDataURL(inputImg);
        if (inputImg) {
            optInput[queIndex].image = inputImg;
            setOptInput(prevOpt => {
                return [...prevOpt]
            })
            reader.onload = function (evt) {
                queImg[queIndex] = reader.result;
                setQueImg(prevImg => {
                    return [...prevImg]
                })
            };
        }
    }

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
                            <Input placeholder="Total Marks" clName="form-control" type="number" name="markPerQuestion" func={handleChange} val={formValue.markPerQuestion} />
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
                                <div className="col-sm-10 col-md-6 col-md-6">
                                    <SunEditor height="10rem" setOptions={{
                                        buttonList: [
                                            ['undo', 'redo'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],]
                                    }} placeholder="Question Title" name="quesTitle" onChange={content => sunEditorChange(content, ind)} setContents={opts.question}></SunEditor>
                                </div>
                            </div>
                            <div className="form-group row justify-content-center">
                                <div className="text-center">
                                    <img className="rounded-lg" style={{ width: "200px" }} src={queImg[ind] ? queImg[ind] : opts.image} alt="" />
                                </div>
                            </div>
                            <div className="form-group row justify-content-md-center">
                                <label className="col-sm-2 col-form-label">Question Image</label>
                                <div className="col-sm-10 col-md-6 col-md-6">
                                    <div className="custom-file">
                                        <input className="custom-file-input" accept="image/*" id="customFile" type="file" name="image" onChange={readURL} />
                                        <label className="custom-file-label" htmlFor="customFile">Choose file</label>
                                    </div>
                                </div>
                            </div>
                            {opts.options.map((input, i) => {
                                return <div key={i} className="form-group row justify-content-md-center">
                                    <label className="col-sm-2 col-form-label">Option {i + 1}</label>
                                    <div className="col-sm-10  col-md-6">
                                        <SunEditor setOptions={{
                                            buttonList: [
                                                ['undo', 'redo'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],]
                                        }} placeholder={"Option " + (i + 1)} name="quesTitle" onChange={content => handleOptChange(content, i, ind)} setContents={opts.options[i]}></SunEditor>
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
                                    <div className="float-left"><button className="btn btn-outline-dark mr-3" type="button" onClick={prevQues}>Previous</button></div>
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