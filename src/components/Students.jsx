import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import Alert from './Alert';
import db from './firebase_config';
import Spinner from './Spinner';

const Students = () => {
    //hooks
    const [isSpin, setSpin] = useState(false)
    const [isAlert, setAlert] = useState(false);
    const [alertClass, setAlertClass] = useState("")
    const [alertText, setAlertText] = useState("")
    const [students, setStudents] = useState([])

    //fetch data
    useEffect(() => {
        db.collection("users").get()
            .then(snap =>
                snap.forEach(doc => setStudents(prevData => [...prevData, doc.data()]))
            )
            .catch(err => console.log(err))
    }, [])
    return (
        <>
            <div className="container table-item">
                {isSpin && <Spinner />}
                {isAlert &&
                    <Alert alClass={alertClass} text={alertText} />}
                {!isSpin &&
                    <>
                        <h3>Students List</h3>
                        <div className="text-nowrap table-responsive">
                            <table className="table text-center table-hover table-bordered">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Guardian Name</th>
                                        <th>Guardian Phone</th>
                                        <th>School/College</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, i) => (<tr key={i}>
                                        <td>{student.name}</td>
                                        <td>{student.phone}</td>
                                        <td>{student.guardianName}</td>
                                        <td>{student.guardianPhone}</td>
                                        <td>{student.school}</td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </>
                }
            </div>
        </>
    )
}

export default Students
