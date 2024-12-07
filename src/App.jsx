import './App.css';
import {  useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import Call from "./components/Call";
import SendFile from "./components/SendFile";
import { ToastContainer } from 'react-toastify';
function App() {
  const [page,SetPage]=useState(0)
  return (
    <>
    
     
      {/* Give User the Options to do Stuff */}
    { page==0 ?  <div className="flex justify-center min-h-screen  items-center gap-3">
        <button onClick={()=>SetPage(1)} className="btn-primary"> Make a Call</button>
        <button onClick={()=>SetPage(2)} className="btn-primary">File Transfer</button>
      </div>
      :null}

      {
        page==1?<Call SetPage={SetPage}/>:null
      }
       {
        page==2?<SendFile SetPage={SetPage} />:null
      }
      <ToastContainer/>
    </>
  );
}

export default App;
