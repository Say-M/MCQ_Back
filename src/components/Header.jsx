import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
    return <>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
            <header className="container">
                <NavLink exact className="navbar-brand" to="/">ChemGenie</NavLink>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/mcq_lists">Quiz</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/learn">Contents</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/university">University</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/students">Students</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/contest">Contest</NavLink>
                        </li>
                    </ul>
                </div>
            </header>
        </nav>
    </>
}

export default Header