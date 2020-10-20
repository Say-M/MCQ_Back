import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import db from "./firebase_config";

const Mcq = () => {
    const { id } = useParams()
    const [question, setQuestion] = useState([[]])
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
                setQuestion(arr);
            });
    }, [id]);

    return <>
        <div className="container">
            <div className="row">
                {console.log(question[0].mcq)}
                {/* {question[0].mcq.map((que, i) => {
                    return <div key={i} className="form-group col-md-6">
                        <h3>{que.question}</h3>
                        <div className="row">
                            {que.options.map((opt, i) => {
                                return <div key={i} className="col-sm-6 mb-2"><strong>{i + 1}:</strong> {opt}</div>
                            })}
                            <div className="col-12"><strong>Answer:</strong> {que.rightAnswer}</div>
                        </div>
                    </div>
                })} */}
                {/* <div className="form-group col-md-6">
                    <h3>Title</h3>
                    <div className="row">
                        <div className="col-sm-6 mb-2">1</div>
                        <div className="col-sm-6 mb-2">2</div>
                        <div className="col-sm-6 mb-2">3</div>
                        <div className="col-sm-6 mb-2">4</div>
                    </div>
                </div> */}
            </div>
        </div>
    </>
}
export default Mcq;