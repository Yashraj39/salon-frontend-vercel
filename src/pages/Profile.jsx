import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCamera,
} from "react-icons/fa";
import { FiBell, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [backup, setBackup] = useState(null);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  /* ================= REMOVE PHOTO ================= */
  const handleRemovePhoto = () => {
    setUserData((prev) => ({ ...prev, avatar: "" }));
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(userData));
    toast.success("Profile updated successfully");
    setEditMode(false);
  };

  /* ================= CANCEL ================= */
  const handleCancel = () => {
    setUserData(backup);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ================= NAVBAR ================= */}
      <div className="flex items-center justify-between px-10 py-4 bg-white border-b">
        {/* LEFT */}
        <div
          className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="h-7 w-7 rounded-md bg-slate-900"></div>
          Glow & Shine
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-10 text-sm font-medium">
          <span
            onClick={() => navigate("/success")}
            className="cursor-pointer text-gray-500 hover:text-black"
          >
            Home
          </span>
          <span
            onClick={() => navigate("/bookings")}
            className="cursor-pointer text-gray-500 hover:text-black"
          >
            My Bookings
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
          <FiBell className="text-xl cursor-pointer" />
          <div
            className="cursor-pointer border-b-2 border-black pb-1"
            onClick={() => navigate("/profile")}
          >
            <FiUser className="text-xl" />
          </div>
        </div>
      </div>

      {/* ================= PROFILE CARD ================= */}
      <div className="flex justify-center mt-28">
        <div className="bg-gray-200 w-[1100px] rounded-3xl px-20 py-24 relative">

          {/* PROFILE IMAGE */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">

            {/* IMAGE CIRCLE */}
            <div className="w-40 h-40 rounded-full border bg-white flex items-center justify-center overflow-hidden shadow">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  alt="default-user"
                  className="w-24 opacity-70"
                />
              )}
            </div>

            {/* IMAGE ACTIONS */}
            {editMode && (
              <div className="mt-3 flex gap-3">
                {/* CHANGE PHOTO */}
                <label className="flex items-center gap-2 text-sm cursor-pointer bg-white px-4 py-2 rounded-full shadow">
                  <FaCamera />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>

                {/* REMOVE PHOTO */}
                {userData.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-sm bg-white px-4 cursor-pointer py-2 rounded-full shadow hover:bg-gray-100"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ================= FORM ================= */}
          <div className="grid grid-cols-2 gap-12 mt-20">

            {/* USERNAME */}
            <div>
              <label className="text-sm font-medium">Username</label>
              <div className="mt-2 bg-white rounded-full flex items-center px-5">
                <input
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="flex-1 py-3 outline-none bg-transparent"
                />
                <FaUser />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Your Email</label>
              <div className="mt-2 bg-white rounded-full flex items-center px-5">
                <input
                  value={userData.email}
                  disabled
                  className="flex-1 py-3 outline-none bg-transparent"
                />
                <FaEnvelope />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium">Phone</label>
              <div className="mt-2 bg-white rounded-full flex items-center px-5">
                <input
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="flex-1 py-3 outline-none bg-transparent"
                />
                <FaPhone />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="mt-2 bg-white rounded-full flex items-center px-5">
                <input
                  type="password"
                  value="********"
                  disabled
                  className="flex-1 py-3 outline-none bg-transparent"
                />
                <FaLock />
              </div>
            </div>
          </div>

          {/* ================= BUTTONS ================= */}
          <div className="flex justify-center mt-16 gap-6">
            {!editMode ? (
              <button
                onClick={() => {
                  setBackup(userData);
                  setEditMode(true);
                }}
                className="bg-slate-900 text-white cursor-pointer px-14 py-3 rounded-xl"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-14 cursor-pointer py-3 rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="border px-14 py-3 cursor-pointer rounded-xl"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
