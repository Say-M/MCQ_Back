import React from 'react';
import Header from "./Header"
import Learn from './Learn';
import { Switch, Route, Redirect } from "react-router-dom";
import PracticeForm from './PracticeForm';
import UniversityForm from './UniversityForm';
import LearnForm from './LearnForm';
import University from './University';

function App() {
  return <>
    <Header />
    <Switch>
      <Route exact path="/quetions/add_que" component={PracticeForm} />
      <Route exact path="/quetions" component={Learn} />
      <Route exact path="/learn" component={LearnForm} />
      <Route exact path="/university" component={University} />
      <Route exact path="/university/add_university" component={UniversityForm} />
      <Redirect to={"/quetions"} />
    </Switch>
  </>
}

export default App;
