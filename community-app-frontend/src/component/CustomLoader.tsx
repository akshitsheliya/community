// import { Spin } from "antd";

// const CustomLoader = () => {
//   return (
//     <div className="flex justify-center items-center">
//       <Spin size="default" className="custom-spin" />
//     </div>
//   );
// };

// export default CustomLoader;

import CustomCircularLoader from "./CustomCircularLoader";

const App = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <CustomCircularLoader />
    </div>
  );
};

export default App;
