import React from 'react';
import Header from "./Header"
import McqTable from './McqTable';
import LearnTable from './LearnTable';
import { Switch, Route, Redirect } from "react-router-dom";
import PracticeForm from './PracticeForm';
import UniversityForm from './UniversityForm';
import LearnFormTry from './LearnFormTry';
import University from './University';
import Mcq from './Mcq';
import EditMcq from './EditMcq';
import editLearn from './editLearn';

function App() {
  return <>
    <Header />
    <Switch>
      <Route exact path="/quetions/add_que" component={PracticeForm} />
      <Route exact path="/mcq_lists" component={McqTable} />
      <Route exact path="/learn" component={LearnTable} />
      <Route exact path="/add_learn" component={LearnFormTry} />
      <Route exact path="/university" component={University} />
      <Route exact path="/university/add_university" component={UniversityForm} />
      <Route exact path="/mcq/:id" component={Mcq} />
      <Route exact path="/edit_mcq/:id" component={EditMcq} />
      <Route exact path="/edit_learn/:id" component={editLearn} />
      <Redirect to={"/mcq_lists"} />
    </Switch>
  </>
}

export default App;
