import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import db from "./firebase_config";
import Spinner from "./Spinner";

const Mcq = () => {
    const { id } = useParams();
    const [isSpin, setSpin] = useState(true);
    const [questions, setQuestions] = useState([{ mcq: [] }])
    function createMarkup(htmlTag) {
        return { __html: htmlTag };
    }
    const banChar = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"];
    document.title = "ChemGenie | " + questions[0].title
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
                setSpin(false)
            });
    }, []);
    return <>
        <div className="container mb-5">
            {isSpin ? <Spinner /> : <><h2 className="text-center mt-3">{questions[0].category}</h2>
                <h3 className="text-center mb-3">{questions[0].title}</h3>
                {questions[0].category === "Admission" ? <h4 className="text-center">{questions[0].university})</h4> : null}
                <div className="row">
                    <div className="col-6">
                        <p><strong>Total questions:</strong> {questions[0].total}</p>
                        <p><strong>Total marks:</strong> {questions[0].totalMark}</p>
                    </div>
                    <div className="col-6 text-right">
                        <p><strong>Duration:</strong> {`${questions[0].hour}:${questions[0].min}:${questions[0].sec}`}</p>
                        <p><strong>Marks:</strong> {questions[0].pass}</p>
                    </div>
                </div>
                <div className="row border">
                    {questions[0].mcq.map((que, i) => {
                        return <div key={i} className="my-3 col-12">
                            <strong><span className="float-left mr-2">{i + 1}.</span> <span dangerouslySetInnerHTML={createMarkup(que.question)}></span></strong>
                            {que.image ? <div className="text-center mb-3">
                                <img className="img-thumbnail" style={{ width: "200px" }} src={que.image} alt="" />
                            </div> : null}
                            <div className="row">
                                {que.options.map((opt, i) => {
                                    return <div key={i} className="col-12 mb-2 pl-4"><strong className="float-left mr-2">{banChar[i]}) </strong><span dangerouslySetInnerHTML={createMarkup(opt)}></span></div>
                                })}
                                <div className="col-12 pl-4"><strong>Answer:</strong> {banChar[que.rightAnswer - 1]}</div>
                            </div>
                        </div>
                    })}
                </div> </>}

        </div>
    </>
}
export default Mcq;