import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import db from "./firebase_config";

const Mcq = () => {
    const { id } = useParams()
    const [questions, setQuestions] = useState([{ mcq: [] }])
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
            });
    }, [id]);

    return <>
        <div className="container">
            <h2 className="text-center my-3">{questions[0].title}</h2>
            {questions[0].category === "Admission" ? <h3 className="text-center">{questions[0].university})</h3> : null}
            <div className="row">
                <div className="col-6">
                    <p><strong>Total questions:</strong> {questions[0].total}</p>
                    <p><strong>Duration:</strong> {questions[0].duration} {questions[0].durationCondition}</p>
                </div>
                <div className="col-6 text-right">
                    <p><strong>Duration:</strong> {questions[0].category}</p>
                    <p><strong>Marks:</strong> {questions[0].percent}</p>
                </div>
            </div>
            <div className="row border">
                {console.log(questions[0])}
                {questions[0].mcq.map((que, i) => {
                    return <div key={i} className="my-3 col-md-6">
                        <strong><p>{i + 1}: {que.question}</p></strong>
                        <div className="row">
                            {que.options.map((opt, i) => {
                                return <div key={i} className="col-sm-6 mb-2"><strong>{i + 1}:</strong> {opt}</div>
                            })}
                            <div className="col-12"><strong>Answer:</strong> {que.rightAnswer}</div>
                        </div>
                    </div>
                })}
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