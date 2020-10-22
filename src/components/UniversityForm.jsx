import React, { useState } from "react";
import db, { storage } from "./firebase_config";
import Input from "./Input"
import CustomSelect from "./CustomSelect"
import Alert from "./Alert";
import Spinner from "./Spinner"

const UniversityForm = () => {
    //Alert
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("");
    const [alertText, setAlertText] = useState("")
    document.title = "ChemGenie | Add a new university"
    //Spinner
    const [Spin, setSpin] = useState(false);

    const [formValue, setFormValue] = useState({
        name: "",
        shortName: "",
        type: "Engineering University",
        image: "",
    });
    const type = ["Engineering University", "Science and Technology University", "Public University"];
    const handleChange = (evt) => {
        let { name, value } = evt.target;
        if (name === "image") {
            value = evt.target.files[0];
        }
        setFormValue(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
    }
    const fileUploadTaskToStorage = async (file, callback) => {
        const uploadRef = storage.ref("logo").child(file?.name ?? null);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = formValue;
        if (
            data.name.length &&
            data.shortName.length &&
            data.type.length &&
            data.image
        ) {
            const document = db.collection("university").doc();
            fileUploadTaskToStorage(data.image, (link) => {
                if (link) {
                    data.image = link;
                    document
                        .set(data)
                        .then(() => {
                            // showAlert("University Addition Successful", "success");
                            setFormValue({
                                name: "",
                                shortName: "",
                                type: "",
                                image: "",
                            });
                        })
                        .catch(() => {
                            setAlertText("University Addition Failed. Try again");
                            setTimeout(() => {
                                setAlert(false);
                                setAlertClass("");
                                setAlertText("");
                            }, 3000)
                        });
                } else {
                    setAlertClass("alert alert-danger alert-dismissible fade show");
                    setAlertText("University Addition Failed. Try again");
                    setTimeout(() => {
                        setAlert(false);
                        setAlertClass("");
                        setAlertText("");
                    }, 3000)
                }
            });
        } else {
            setAlert(true);
            setAlertClass("alert alert-danger alert-dismissible fade show");
            setAlertText("Field required! Please fill up carefully.");
            setTimeout(() => {
                setAlert(false);
                setAlertClass("");
                setAlertText("");
            }, 3000)
        }
    }
    return <>
        {Spin ? <Spinner /> : null}
        {isAlert ?
            <Alert alClass={alertClass} text={alertText} /> : null}
        <form className="form" onSubmit={handleSubmit}>
            <div className="container">
                <h3 className="text-center">Add University</h3>
                <div className="form-group row justify-content-md-center">
                    <label className="col-sm-2 col-form-label">University Name</label>
                    <div className="col-sm-10 col-md-6">
                        <Input placeholder="Name" clName="form-control" type="text" name="name" func={handleChange} val={formValue.name} />
                    </div>
                </div>
                <div className="form-group row justify-content-md-center">
                    <label className="col-sm-2 col-form-label">Short Name</label>
                    <div className="col-sm-10 col-md-6">
                        <Input placeholder="Short Name" clName="form-control" type="text" name="shortName" func={handleChange} val={formValue.shortName} />
                    </div>
                </div>
                <div className="form-group row justify-content-md-center">
                    <label className="col-sm-2 col-form-label">Select Type</label>
                    <div className="col-sm-10 col-md-6">
                        <CustomSelect clName="custom-select" name="type" func={handleChange} val={formValue.type} options={type} />
                    </div>
                </div>
                <div className="form-group row justify-content-md-center">
                    <label className="col-sm-2 col-form-label">University Image</label>
                    <div className="col-sm-10 col-md-6">
                        <div className="custom-file">
                            <input className="custom-file-input" accept="image/*" id="customFile" type="file" name="image" onChange={handleChange} value="" />
                            <label className="custom-file-label" htmlFor="customFile">Choose file</label>
                        </div>
                    </div>
                </div>
                <div className="text-center form-group mt-5">
                    <button type="submit" className="px-5 btn btn-outline-primary">Submit</button>
                </div>
            </div>
        </form>
    </>
}
export default UniversityForm;