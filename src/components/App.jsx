import React from 'react';
import Header from "./Header"
import Learn from './Learn';
import { Switch, Route, Redirect } from "react-router-dom";
import PracticeForm from './PracticeForm';
import UniversityForm from './UniversityForm';
import LearnForm from './LearnForm';

function App() {
  return <>
    <Header />
    <Switch>
      <Route exact path="/add_que" component={PracticeForm} />
      <Route exact path="/quetions" component={Learn} />
      <Route exact path="/learn" component={LearnForm} />
      <Route exact path="/university" component={UniversityForm} />
      <Redirect to={"/quetions"} />
    </Switch>
  </>
}

export default App;
