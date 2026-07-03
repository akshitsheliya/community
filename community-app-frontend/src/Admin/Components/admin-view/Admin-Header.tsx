import { Link } from "react-router-dom";
import Button from "../Common/Button";
import { changeLanguage } from "../../../../src/component/Language";

const AdminHeader = () => {
  return (
    <header className="bg-theme h-12 shadow-xl">
      <div className="flex justify-end mx-5 gap-3">
        s <Button text="ગુજરાતી" onClick={() => changeLanguage("gu_IN")} />
        <Link to="/admin/login">
          <Button text="Logout" />
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
