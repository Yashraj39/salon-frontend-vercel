import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCamera,
} from "react-icons/fa";
import { FiBell, FiUser, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [backup, setBackup] = useState(null);

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

    // 🔹 GET IMAGE
    fetch(
      `https://render-qs89.onrender.com/api/v1.0/get-profile-image/${user.userId}`
    )
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.imageUrl) {
          setUserData((prev) => ({
            ...prev,
            avatar: data.imageUrl,
          }));
        }
      })
      .catch(() => {
        // silent fail
      });
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= IMAGE UPLOAD (SAFE) ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userData.userId) return;

    try {
      const formData = new FormData();
      formData.append("userId", userData.userId);
      formData.append("image", file);

      const res = await fetch(
        "https://render-qs89.onrender.com/api/v1.0/add-profile-image",
        {
          method: "POST",
          body: formData,
        }
      );

      // ❌ backend 403 / empty response handle
      if (!res.ok) {
        toast.error("Image upload not allowed");
        return;
      }

      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (data?.imageUrl) {
        setUserData((prev) => ({
          ...prev,
          avatar: data.imageUrl,
        }));
      }

      toast.success("Profile image updated");
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  /* ================= REMOVE PHOTO (UI ONLY) ================= */
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
      <div className="flex items-center justify-between px-10 py-4 border-b">
        <div
          className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="h-7 w-7 rounded-md bg-black"></div>
          Glow & Shine
        </div>

        <div className="flex items-center gap-10 text-sm">
          <span onClick={() => navigate("/success")} className="cursor-pointer">
            Home
          </span>
          <span onClick={() => navigate("/bookings")} className="cursor-pointer">
            My Bookings
          </span>
        </div>

        <div className="flex items-center gap-5">
          <FiBell className="text-2xl cursor-pointer" />
          <FiUser className="text-2xl cursor-pointer border-b-2 border-black pb-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border px-4 py-2 rounded-md"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="flex justify-center mt-28">
        <div className="bg-gray-200 w-[1100px] rounded-3xl px-20 py-24 relative">
          {/* IMAGE */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
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
                  alt="default"
                  className="w-24 opacity-70"
                />
              )}
            </div>

            {editMode && (
              <div className="mt-3 flex gap-3">
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

                {userData.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-sm bg-white px-4 py-2 rounded-full shadow"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FORM */}
          <div className="grid grid-cols-2 gap-12 mt-20">
            <Input label="Username" icon={<FaUser />} name="name" value={userData.name} onChange={handleChange} disabled={!editMode} />
            <Input label="Your Email" icon={<FaEnvelope />} value={userData.email} disabled />
            <Input label="Phone" icon={<FaPhone />} name="phone" value={userData.phone} onChange={handleChange} disabled={!editMode} />
            <Input label="Password" icon={<FaLock />} type="password" value="********" disabled />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-center mt-16 gap-6">
            {!editMode ? (
              <button
                onClick={() => {
                  setBackup(userData);
                  setEditMode(true);
                }}
                className="bg-slate-900 text-white px-14 py-3 rounded-xl"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-14 py-3 rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="border px-14 py-3 rounded-xl"
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

/* ================= REUSABLE INPUT ================= */
function Input({ label, icon, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 bg-white rounded-full flex items-center px-5">
        <input
          {...props}
          className="flex-1 py-3 outline-none bg-transparent"
        />
        {icon}
      </div>
    </div>
  );
}
