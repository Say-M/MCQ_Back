import React, { useEffect, useState } from "react";
import db, { storage } from "./firebase_config";
import CustomSelect from "./CustomSelect"
import Spinner from "./Spinner";
import Alert from "./Alert";
import { useParams } from "react-router-dom";

const LearnForm = () => {
    // get document id
    const { id } = useParams();
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")
    document.title = "ChemGenie | Edit files or videos"
    //Spinner
    const [Spin, setSpin] = useState(false);
    //Chapter
    const [chapter, setChapter] = useState([]);
    //University
    const [university, setUniversity] = useState([]);

    const [formValue, setFormValue] = useState({
        chapter: "",
        category: "",
        university: "",
    });

    const [fileInput, setFileInput] = useState([])
    useEffect(() => {
        let arr = [];
        const snap = db
            .collection("learn")
            .where("id", "==", id)
            .get()
            .then((snap) => {
                snap.forEach((d) => {
                    arr.push(d.data());
                });
                setFormValue(...arr)
                db
                    .collection("learn")
                    .where("root", "==", arr[0].id)
                    .get()
                    .then((snap) => {
                        snap.forEach(d => setFileInput(prevFile => [...prevFile, d.data()]))
                    })
            })

    }, []);
    let isAdmission = false;
    const [learn, setLearn] = useState(true);

    //category
    const category = ["HSC", "Admission", "Olympiad"];
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
            });
    }, []);

    useEffect(() => {
        let arr = [];
        const snapshot = db
            .collection("chapter")
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    arr.push(doc.data()?.title);
                });
                setChapter(arr);
            });
    }, []);

    const fileType = ["Lecture", "Question", "Video"];
    const [fileIndex, setFileIndex] = useState(0)
    const defaultProgressBar = {
        show: false,
        percent: 0,
    };
    const [progressBar, setProgressBar] = useState(defaultProgressBar);
    const handleChange = (evt) => {
        let { name, value } = evt.target;
        setFormValue(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
    }
    if (formValue.category === "Admission") {
        isAdmission = true
    } else {
        isAdmission = false
    }
    const fileUpload = () => {
        setLearn(false);
    }
    const prevFile = () => {
        if (fileIndex > 0) {
            setFileIndex(fileIndex - 1);
        }
    }
    const addFile = () => {
        if (fileIndex === (fileInput.length - 1)) {
            setFileInput(prevOpt => {
                return [...prevOpt, {
                    title: "",
                    type: "",
                    file: "",
                    url: "",
                    size: "",
                    timeCondition: "",
                    isVideo: null,
                }]
            })
        }
        setFileIndex(fileIndex + 1);
    }
    const updateProgressBar = (data) => {
        setProgressBar(Object.assign({}, progressBar, data));
    };

    const collection_name = "learn";
    const videoDataUploadTask = async (data) => {
        const res = await db.collection(collection_name).doc().set(data);
        return res;
    };
    const fileDataUploadTask = async (data) => {
        const res = await db.collection(collection_name).doc().set(data);
        return res;
    };

    const fileUploadTaskToStorage = async (file, callback) => {
        const uploadRef = storage.ref("files").child(file?.name ?? null);
        const uploadTask = uploadRef.put(file);
        uploadTask.on(
            "state_changed",
            function (snapshot) {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");

                if (progress >= 100) {
                    setFormValue({
                        chapter: "",
                        category: "",
                        university: "",
                    });
                    setFileInput([{
                        title: "",
                        type: "",
                        file: "",
                        url: "",
                        size: "",
                        timeCondition: "",
                        isVideo: null,
                    }]);
                    updateProgressBar({ show: false, percent: 0 });
                    setLearn(true);
                    setFileIndex(0);
                    setSpin(false);
                    setAlert(true);
                    setAlertClass("alert alert-success")
                    setAlertText("File successfully edited")
                    setTimeout(() => {
                        setAlert(false);
                        setAlertClass("")
                        setAlertText("")
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
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        let total = fileInput.length;
        let progress = 0;
        let data = { ...formValue };
        let allArray = fileInput;
        let videoArray = allArray.filter((a) => a.type === "Video");
        let futureUploadTask = allArray.filter((a) => a.type !== "Video");
        const document = db.collection("learn").doc(id);
        let videoDoc = data.video;
        let pdfDoc = data.pdf;
        let queDoc = data.que;

        const processUpdate = () => {
            progress += 1;
            updateProgressBar({ percent: (progress * 100) / total, show: true });
            document
                .update({
                    video: videoDoc,
                    pdf: pdfDoc,
                    que: queDoc,
                })
                .then(() => {
                    updateProgressBar({ show: false, percent: 0 });
                    setLearn(true);
                    setFileIndex(0)
                    setSpin(false)
                }).catch(err => console.log(err))
        };

        document
            .update(data)
            .then(() => {
                videoArray.forEach((v) => {
                    console.log(v);
                    setSpin(true)
                    fileInput.forEach(file => {
                        if (v.root !== file.root) {
                            videoDataUploadTask({
                                root: file.root,
                                type: v.type,
                                size: v.size,
                                url: v.url,
                                title: v.title,
                                time: v.timeCondition
                            }).then((res) => {
                                videoDoc += 1;
                                processUpdate();
                            });
                        } else {
                            db.collection("learn")
                                .where("root", "==", file.root)
                                .get()
                                .then(snap => {
                                    snap.forEach(d => {
                                        console.log(d.id);
                                        db.collection("learn")
                                            .doc(d.id)
                                            .update({
                                                root: v.root,
                                                size: v.size,
                                                time: v.time,
                                                title: v.title,
                                                type: v.type,
                                                url: v.url
                                            })
                                    })
                                })
                        }
                    })
                });
                futureUploadTask.forEach((f) => {

                    setSpin(true)
                    fileUploadTaskToStorage(f.file, (result) => {
                        if (result) {
                            fileDataUploadTask({
                                type: f.type,
                                size: f?.file?.size,
                                url: result,
                                title: f.title,
                            }).then((res) => {
                                if (f.type === "Lecture") {
                                    pdfDoc += 1;
                                } else {
                                    queDoc += 1;
                                }

                                processUpdate();
                            });
                        } else {
                            processUpdate();
                        }
                    });
                });
            })
            .catch((err) => {
                console.log(err);
                updateProgressBar({ show: false, percent: 0 });
            });
        // })
    }
    const fileChange = (e, key) => {
        let { name, value } = e.target;
        if (name === "file") {
            value = e.target.files[0];
        } else if (name === "size") {
            value = parseInt(value)
        }
        fileInput[key] = { ...fileInput[key], [name]: value }
        setFileInput(prevInput => {
            return [
                ...prevInput
            ]
        })
        if (fileInput[key].type === "Video") {
            fileInput[key].isVideo = true;
            setFileInput(prevInput => {
                return [
                    ...prevInput
                ]
            })
        } else {
            fileInput[key].isVideo = false;
            setFileInput(prevInput => {
                return [
                    ...prevInput
                ]
            })
        }
    }
    const handleNext = (e) => {
        e.preventDefault();
        fileUpload();
    }
    return <>
        {Spin ? <Spinner /> : null}
        {isAlert ?
            <Alert alClass={alertClass} text={alertText} /> : null}
        {learn ? <form className="form" onSubmit={handleNext}>
            <div className="container">
                <h3 className="text-center">File / Video Upload</h3>
                <div className="form-group row justify-content-md-center">
                    <label className="col-sm-2 col-form-label">Chapter</label>
                    <div className="col-sm-10 col-md-6 col-md-6">
                        <CustomSelect clName="custom-select" name="chapter" func={handleChange} val={formValue.chapter} options={chapter} />
                    </div>
                </div>
                <div className="form-group row justify-content-md-center">
                    <label className="col-sm-2 col-form-label">Category</label>
                    <div className="col-sm-10 col-md-6 col-md-6">
                        <CustomSelect clName="custom-select" func={handleChange} name="category" val={formValue.category} options={category} />
                    </div>
                </div>
                {isAdmission ?
                    <div className="form-group row justify-content-md-center">
                        <label className="col-sm-2 col-form-label">University</label>
                        <div className="col-sm-10 col-md-6 col-md-6">
                            <select className="custom-select" onChange={handleChange} name="university" >
                                {university.map((versity, i) => <option key={i} value={versity.name}>{versity.name}</option>)}
                            </select>
                        </div>
                    </div>
                    : null}
                <div className="text-center form-group mt-5">
                    <button className="btn px-5 btn-outline-primary" type="submit">Next</button>
                </div>
            </div>
        </form>
            :
            fileInput.map((file, ind) => {
                return <form key={ind} className="form" onSubmit={handleSubmit} style={fileIndex !== ind ? { display: "none" } : { display: "inherit" }}>
                    <div className="container">
                        <h3 className="text-center">File / Video Upload {(fileIndex + 1) + " of " + fileInput.length}</h3>

                        <div className="form-group row justify-content-md-center">
                            <label className="col-sm-2 col-form-label">Title</label>
                            <div className="col-sm-10 col-md-6 col-md-6">
                                <input type="text" placeholder="Title" name="title" value={file.title} className="form-control" onChange={evt => fileChange(evt, ind)} />
                            </div>
                        </div>
                        <div className="form-group row justify-content-md-center">
                            <label className="col-sm-2 col-form-label">Type</label>
                            <div className="col-sm-10 col-md-6 col-md-6">
                                <select className="custom-select" name="type" value={file.type} onChange={evt => fileChange(evt, ind)}>
                                    {fileType.map((type, i) => {
                                        return <option key={i}>{type}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        {file.type === "Video" ?
                            <>
                                <div className="form-group row justify-content-md-center">
                                    <label className="col-sm-2 col-form-label">Video Url</label>
                                    <div className="col-sm-10 col-md-6 col-md-6">
                                        <input type="text" placeholder="Video URL" name="url" value={file.url} className="form-control" onChange={evt => fileChange(evt, ind)} />
                                    </div>
                                </div>
                                <div className="form-group row justify-content-md-center">
                                    <label className="col-sm-2 col-form-label">Size</label>
                                    <div className="col-md-4 mb-3">
                                        <input type="number" placeholder="Size" name="size" value={file.size} className="form-control" onChange={evt => fileChange(evt, ind)} />
                                    </div>
                                    <div className="col-md-2 mb-3">
                                        <select className="custom-select" name="timeCondition" value={file.timeCondition} onChange={evt => fileChange(evt, ind)}>
                                            <option value="Minuites">Minuites</option>
                                            <option value="Seconds">Seconds</option>
                                        </select>
                                    </div>
                                </div>
                            </> :
                            <div className="form-group row justify-content-md-center">
                                <label className="col-sm-2 col-form-label">Choose File</label>
                                <div className="col-sm-10 col-md-6 col-md-6">
                                    <div className="custom-file">
                                        <input type="file" className="custom-file-input" name="file" id="customFile" onChange={evt => fileChange(evt, ind)} />
                                        <label style={{ overflow: "hidden" }} className="custom-file-label" htmlFor="customFile">{file.file ? file.file.name : "Choose file"}</label>
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="form-group row justify-content-md-center">
                            <div className="col-md-8">
                                <div className="float-left"><button type="button" className="btn btn-outline-dark mr-3" onClick={prevFile}>Previous</button></div>
                                <div className="float-right"><button type="button" className="btn btn-outline-dark" onClick={addFile}>Next</button></div>
                            </div>
                        </div>
                        <div className="form-group mt-5 text-center">
                            <button className="btn px-5 btn-outline-primary" type="submit">Submit</button>
                        </div>
                    </div>
                </form>
            })
        }
    </>
}

export default LearnForm;