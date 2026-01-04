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

  /* ================= LOAD USER & IMAGE ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const user = JSON.parse(stored);
    setUserData(user);

    // 🔹 FETCH PROFILE IMAGE FROM API
    if (user.userId) {
      fetch(
        `https://render-qs89.onrender.com/api/v1.0/get-profile-image/${user.userId}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.imageUrl) {
            setUserData((prev) => ({
              ...prev,
              avatar: data.imageUrl,
            }));
          }
        })
        .catch((err) => console.error("Image fetch error", err));
    }
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= IMAGE UPLOAD (BACKEND MATCHED) ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

      const message = await res.text();

      if (!res.ok) throw new Error(message);

      // ✅ CONSOLE MESSAGE
      console.log(message); // Profile image added successfully

      // ✅ TEMP IMAGE PREVIEW
      const previewUrl = URL.createObjectURL(file);
      setUserData((prev) => ({
        ...prev,
        avatar: previewUrl,
      }));

      toast.success("Profile image updated");
    } catch (error) {
      console.error("Image upload error:", error.message);
      toast.error("Failed to upload image");
    }
  };

  /* ================= REMOVE PHOTO (UI ONLY) ================= */
  const handleRemovePhoto = () => {
    setUserData((prev) => ({ ...prev, avatar: "" }));
  };

  /* ================= SAVE PROFILE ================= */
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

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logout successfully");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ================= NAVBAR ================= */}
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
            className="flex items-center gap-2 border px-4 py-2 rounded-md cursor-pointer"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      {/* ================= PROFILE CARD ================= */}
      <div className="flex justify-center mt-28">
        <div className="bg-gray-200 w-[1100px] rounded-3xl px-20 py-24 relative">
          {/* PROFILE IMAGE */}
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

          {/* ================= FORM ================= */}
          <div className="grid grid-cols-2 gap-12 mt-20">
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
                className="bg-slate-900 text-white px-14 py-3 rounded-xl cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 text-white px-14 py-3 rounded-xl cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="border px-14 py-3 rounded-xl cursor-pointer"
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
