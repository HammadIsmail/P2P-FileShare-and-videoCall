import PropTypes from "prop-types";

const Members = ({SetPage}) => {
    return (
        <div  className="overflow-auto h-screen custom-Scrollbar">
        <button onClick={()=>SetPage(0)} className="btn-primary mb-2">Back</button>
      <div className="flex flex-wrap items-center justify-between p-4 pb-10 " >
        <div className="flex flex-col items-center">
          <img src="Hammad.jpg" className="w-72 h-96 object-cover" alt="Hammad" />
          <p className="mt-4 text-lg font-semibold">Hammad (2023-CS-807)</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="Massam.jpg" className="w-72 h-96 object-cover" alt="Massam" />
          <p className="mt-4 text-lg font-semibold">Massam (2022/R-CS-828)</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="Haseeb.jpg" className="w-72 h-96 object-cover" alt="Haseeb" />
          <p className="mt-4 text-lg font-semibold">Haseeb (2022-CS-804)</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="Anas.jpg" className="w-72 h-96 object-cover" alt="Anas" />
          <p className="mt-4 text-lg font-semibold">Anas (2022-CS-827)</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="Abdullah.jpg" className="w-72 h-96 object-cover" alt="Abdullah" />
          <p className="mt-4 text-lg font-semibold">Abdullah (2023-CS-824)</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="Murtaza.jpg" className="w-72 h-96 object-cover" alt="Murtaza" />
          <p className="mt-4 text-lg font-semibold">Murtaza (2022-CS-814)</p>
        </div>
        <div className="flex flex-col items-center">
          <img src="Moeez.jpg" className="w-72 h-96 object-cover" alt="Moeez" />
          <p className="mt-4 text-lg font-semibold">Moeez (2022-CS-819)</p>
        </div>
      </div>
      </div>
    );
  };

  Members.protoTypes={
    SetPage:PropTypes.func.isRequired,
  }
  export default Members;
  