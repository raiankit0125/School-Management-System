import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Button from "./Button";
import ProfileImagePicker from "./ProfileImagePicker";

export default function ProfilePhotoManager({ profile, onUpdated }) {
  const [file, setFile] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const user = profile?.user || {};

  const uploadPhoto = async () => {
    if (!file) return;
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("profileImage", file);
      const res = await axiosInstance.put("/user/profile-image", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated?.(res.data.data);
      setFile(null);
      setRemoved(false);
      alert("Profile picture updated");
    } catch (err) {
      alert(err?.response?.data?.message || "Profile picture update failed");
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async () => {
    if (!user.profileImage && !file) {
      setFile(null);
      setRemoved(true);
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.delete("/user/profile-image");
      onUpdated?.({ ...user, profileImage: "" });
      setFile(null);
      setRemoved(true);
      alert("Profile picture removed");
    } catch (err) {
      alert(err?.response?.data?.message || "Profile picture remove failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="metric-card md:col-span-2">
      <ProfileImagePicker
        label="Your Profile Photo"
        name={user.name}
        imageUrl={user.profileImage || ""}
        file={file}
        removed={removed}
        onChange={(nextFile) => {
          setFile(nextFile);
          setRemoved(false);
        }}
        onRemove={removePhoto}
        size="compact"
        framed={false}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={uploadPhoto} disabled={!file || saving}>
          {saving ? "Saving..." : "Save Photo"}
        </Button>
        <Button variant="outline" onClick={removePhoto} disabled={saving || (!user.profileImage && !file)}>
          Delete Photo
        </Button>
      </div>
    </div>
  );
}
