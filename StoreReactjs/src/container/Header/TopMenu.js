import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.scss";
const TopMenu = (props) => {
    let handleLogout = () => {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    // fallback to persisted user information when component is rendered without props
    let localUser = null;
    try {
        localUser = JSON.parse(localStorage.getItem("userData"));
    } catch (error) {
        localUser = null;
    }
    const currentUser = props.user && props.user.id ? props.user : localUser;

    let name = "";
    if (currentUser && currentUser.id) {
        const firstName =
            currentUser && currentUser.firstName ? currentUser.firstName : "";
        const lastName =
            currentUser && currentUser.lastName ? currentUser.lastName : "";
        name = `${firstName} ${lastName}`.trim();
        if (!name && currentUser.email) {
            name = currentUser.email.split("@")[0];
        }
    }
    return (
        <div className="top_menu">
            <div className="container">
                <div className="row">
                    <div className="col-lg-7">
                        <div className="float-left">
                            <p>Điện thoại: 0919676071 </p>
                            <p>email: huy534876@gmail.com</p>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="float-right">
                            <ul className="right_side">
                                <li>
                                    {currentUser && currentUser.id ? (
                                        <NavLink
                                            exact
                                            to={`/user/detail/${
                                                currentUser && currentUser.id
                                                    ? currentUser.id
                                                    : ""
                                            }`}
                                        >
                                            {name}
                                        </NavLink>
                                    ) : (
                                        <a href="/login">Đăng nhập</a>
                                    )}
                                </li>
                                <li>
                                    {currentUser && currentUser.id ? (
                                        <a
                                            href="/logout"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handleLogout();
                                            }}
                                        >
                                            Đăng xuất
                                        </a>
                                    ) : (
                                        <a href="/login">Đăng ký</a>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopMenu;
