import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import db from "./firebase_config";
import Spinner from "./Spinner";

const ViewLearn = () => {
    // get document id
    const { id } = useParams();
    const [isSpin, setSpin] = useState(true);

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
                        setSpin(false)
                    })
            })

    }, []);

    return <>
        {isSpin ? <Spinner /> :
            <div className="container mb-5">
                <h2 className="text-center mt-3">{formValue.category}</h2>
                <h4 className="text-center mb-3">{formValue.chapter}</h4>
                {formValue.category === "Admission" ? <h4 className="text-center">{formValue.university})</h4> : null}
                <div className="row">
                    <div className="col-6">
                        <p><strong>Total questions:</strong> {formValue.que}</p>
                        <p><strong>Total video:</strong> {formValue.video}</p>
                        <p><strong>Total lecture:</strong> {formValue.pdf}</p>
                    </div>
                </div>
                <div className="row border">
                    {fileInput.map((file, i) => {
                        return <div key={i} className="my-3 col-md-6">
                            <p><strong>{(i + 1) + ". " + file.title}</strong><br /></p>
                            <p className="ml-3">
                                <strong>Type: </strong>{file.type} and <strong>Size: </strong>{file.size + " " + (file.time ? file.time : null)}<br />
                                <a target="_blink" className="mt-2 d-inline-block btn btn-sm btn-outline-primary" href={file.url}>Download Now</a>
                            </p>
                        </div>
                    })}
                </div>
            </div>
        }
    </>
}

export default ViewLearn;