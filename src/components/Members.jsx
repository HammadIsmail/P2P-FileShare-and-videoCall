import PropTypes from "prop-types";
const Members = ({SetPage}) => {
    return (
        <>
        <button onClick={()=>SetPage(0)} className="btn-primary">Back</button>
      <div className="overflow-auto p-4 flex flex-wrap " >
        <div className="flex flex-col items-center">
          <img src="Hammad.JPG" className="w-72 h-96 object-cover" alt="Hammad" />
          <p className="mt-4 text-lg font-semibold">Hammad (2023-CS-807)</p>
        </div>
      </div>
      </>
    );
  };
  
  Members.protoTypes={
    SetPage:PropTypes.func.isRequired,
  }
  export default Members;
  