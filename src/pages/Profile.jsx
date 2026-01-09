import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCamera,
} from "react-icons/fa";
import { FiBell, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [backup, setBackup] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [userData, setUserData] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  /* ================= LOAD USER + IMAGE ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const user = JSON.parse(stored);

    setUserData({
      userId: user.userId,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: "",
    });

    fetch(
      `https://render-qs89.onrender.com/api/v1.0/get-profile-image/${user.userId}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.imageUrl) {
          setUserData((prev) => ({
            ...prev,
            avatar: data.imageUrl,
          }));
        }
      })
      .catch(() => {});
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userData.userId) return;

    try {
      const formData = new FormData();
      formData.append("userId", userData.userId);
      formData.append("image", file);

      const res = await fetch(
        "https://render-qs89.onrender.com/api/v1.0/add-profile-image",
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        toast.error("Image upload not allowed");
        return;
      }

      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (data?.imageUrl) {
        setUserData((prev) => ({ ...prev, avatar: data.imageUrl }));
      }

      toast.success("Profile image updated");
    } catch {
      toast.error("Image upload failed");
    }
  };

  /* ================= REMOVE PHOTO ================= */
  const handleRemovePhoto = () => {
    setUserData((prev) => ({ ...prev, avatar: "" }));
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      })
    );
    toast.success("Profile updated");
    setEditMode(false);
  };

  /* ================= CANCEL ================= */
  const handleCancel = () => {
    setUserData(backup);
    setEditMode(false);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logout successfully");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 border-b">
        <div
          className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="h-7 w-7 rounded-md bg-black"></div>
          Glow & Shine
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-sm">
          <span onClick={() => navigate("/success")} className="cursor-pointer">
            Home
          </span>
          <span onClick={() => navigate("/bookings")} className="cursor-pointer">
            My Bookings
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-5">
          <FiBell className="text-xl sm:text-2xl cursor-pointer" />
          <FiUser className="text-xl sm:text-2xl cursor-pointer border-b-2 border-black pb-1" />

          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 border cursor-pointer px-4 py-2 rounded-md"
          >
            <FiLogOut />
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden cursor-pointer text-xl"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenu && (
        <div className="md:hidden border-b px-4 py-4 space-y-3">
          <div onClick={() => navigate("/success")} className="cursor-pointer">
            Home
          </div>
          <div onClick={() => navigate("/bookings")} className="cursor-pointer">
            My Bookings
          </div>
          {/* Logout Button (Desktop + Mobile Same UI) */}
<button
  onClick={handleLogout}
  className="flex items-center gap-2 border px-3 sm:px-4 py-2 cursor-pointer rounded-md text-sm sm:text-base"
>
  <FiLogOut />
  Logout
</button>

        </div>
      )}

      {/* PROFILE CARD */}
      <div className="flex justify-center mt-16 sm:mt-24 px-4">
        <div className="bg-gray-200 w-full max-w-[1100px] rounded-3xl px-6 sm:px-10 md:px-20 py-20 sm:py-24 relative">
          {/* IMAGE */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border bg-white flex items-center justify-center overflow-hidden shadow">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  alt="default"
                  className="w-20 sm:w-24 opacity-70"
                />
              )}
            </div>

            {editMode && (
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <label className="flex items-center gap-2  text-xs sm:text-sm cursor-pointer bg-white px-4 py-2 rounded-full shadow">
                  <FaCamera />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>

                {userData.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-xs sm:text-sm bg-white px-4 cursor-pointer py-2 rounded-full shadow"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-24 sm:mt-20">
            <Input label="Username" icon={<FaUser />} name="name" value={userData.name} onChange={handleChange} disabled={!editMode} />
            <Input label="Your Email" icon={<FaEnvelope />} value={userData.email} disabled />
            <Input label="Phone" icon={<FaPhone />} name="phone" value={userData.phone} onChange={handleChange} disabled={!editMode} />
            <Input label="Password" icon={<FaLock />} type="password" value="********" disabled />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center mt-12 sm:mt-16 gap-4 sm:gap-6">
            {!editMode ? (
              <button
                onClick={() => {
                  setBackup(userData);
                  setEditMode(true);
                }}
                className="bg-slate-900 text-white cursor-pointer px-10 sm:px-14 py-3 rounded-xl"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-10 cursor-pointer sm:px-14 py-3 rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="border px-10 sm:px-14 cursor-pointer py-3 rounded-xl"
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

/* ================= INPUT ================= */
function Input({ label, icon, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 bg-white rounded-full flex items-center px-5">
        <input
          {...props}
          className="flex-1 py-3 outline-none bg-transparent text-sm sm:text-base"
        />
        <span className="text-gray-500">{icon}</span>
      </div>
    </div>
  );
}
