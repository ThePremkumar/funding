import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../context";  
import { logo, sun, payment } from "../assets";  // ✅ Import payment icon
import { navlinks } from "../constants";

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] ${
      isActive === name ? "bg-[#2c2f32]" : ""
    } flex justify-center items-center ${
      !disabled ? "cursor-pointer" : ""
    } ${styles}`}
    onClick={handleClick}
  >
    <img src={imgUrl} alt={name} className="w-1/2 h-1/2" />
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const { disconnectWallet, address } = useStateContext(); 
  const [isActive, setIsActive] = useState("dashboard");

  const handleNavClick = (link) => {
    if (link.name === "logout") {
      handleLogout(); 
    } else {
      setIsActive(link.name);
      navigate(link.link);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof disconnectWallet !== "function") {
        throw new Error("disconnectWallet is NOT a function! Ensure it's in context.");
      }
      await disconnectWallet(); 
      console.log("✅ Wallet disconnected successfully.");
      navigate("/"); 
    } catch (error) {
      console.error(" Error disconnecting wallet:", error);
    }
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link to="/">
        <Icon styles="w-[52px] h-[52px] bg-[#2c2f32]" imgUrl={logo} />
      </Link>

      <div className="flex-1 flex flex-col justify-between items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
        <div className="flex flex-col justify-center items-center gap-3">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => handleNavClick(link)}
            />
          ))}

          {/* Payment Icon - Navigates to Wallet Details */}
          {address && (
            <Icon
              styles="bg-[#1c1c24] shadow-secondary"
              imgUrl={payment}  // Use imported payment icon
              handleClick={() => navigate("/wallet-details")} //  Navigates to the payment page
            />
          )}
        </div>

        {address && (
          <Icon
            styles="bg-[#1c1c24] shadow-secondary"
            imgUrl={sun}
            handleClick={handleLogout} 
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
